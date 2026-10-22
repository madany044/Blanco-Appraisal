import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { correctionsEnabled } from "./correction-config";
import { assertReviewAllowed, assertVersion, WorkflowConflict } from "./correction-policy";
import { employeeAnswers } from "./employee-fields";
import { appraisalTransactionOptions } from "./appraisal-transaction";
import { restrictManagerRatings } from "./manager-rating-policy";

export { WorkflowConflict } from "./correction-policy";

export async function withAppraisalLock<T>(id: string, work: (tx: Prisma.TransactionClient) => Promise<T>) {
  return prisma.$transaction(async (tx) => {
    // All feature-enabled mutations take this lock before reading stage/version.
    await tx.$queryRaw`SELECT id FROM appraisal_submissions WHERE id = ${id}::uuid FOR UPDATE`;
    return work(tx);
  }, appraisalTransactionOptions);
}

export async function attachCorrections<T extends { id: string }>(rows: T[]) {
  if (!correctionsEnabled || !rows.length) return rows;
  const states = await prisma.appraisalCorrection.findMany({ where: { submissionId: { in: rows.map((r) => r.id) } } });
  return rows.map((row) => ({ ...row, correction: states.find((s) => s.submissionId === row.id) ?? null }));
}

export async function correctionDetails(id: string) {
  if (!correctionsEnabled) return { correction: null, events: [] };
  const [correction, events] = await Promise.all([
    prisma.appraisalCorrection.findUnique({ where: { submissionId: id } }),
    prisma.appraisalCorrectionEvent.findMany({ where: { submissionId: id }, orderBy: { createdAt: "asc" } }),
  ]);
  return { correction, events: events.map((event) => ({
    id: event.id, revision: event.revision, action: event.action, actor: event.actor, note: event.note, createdAt: event.createdAt.toISOString(),
    // Format once on the server; reuse the exact string during browser hydration.
    createdAtLabel: event.createdAt.toLocaleString("en-GB", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) + " IST",
    previousAnswers: event.snapshot && typeof event.snapshot === "object" && !Array.isArray(event.snapshot) ? employeeAnswers(event.snapshot as Record<string, unknown>) : null,
  })) };
}

export async function returnForCorrection(id: string, managerId: string, actor: string, reason: string, version: unknown) {
  return withAppraisalLock(id, async (tx) => {
    const submission = await tx.appraisalSubmission.findUniqueOrThrow({ where: { id } });
    const old = await tx.appraisalCorrection.findUnique({ where: { submissionId: id } });
    assertVersion(old, version);
    assertReviewAllowed(submission.stage, old, 1);
    if (submission.managerId !== managerId) throw new WorkflowConflict("This appraisal belongs to another manager.");
    const revision = (old?.revision ?? 0) + 1;
    const correction = await tx.appraisalCorrection.upsert({
      where: { submissionId: id },
      create: { submissionId: id, status: "RETURNED_TO_HR", revision, version: 1, reason },
      update: { status: "RETURNED_TO_HR", revision, version: { increment: 1 }, reason, instructions: null },
    });
    await tx.appraisalCorrectionEvent.create({ data: {
      submissionId: id, revision, action: "RETURNED_TO_HR", actor, note: reason,
      // Full prior record retained privately for audit; employee APIs never expose it.
      snapshot: JSON.parse(JSON.stringify(submission)) as Prisma.InputJsonValue,
    } });
    await tx.appraisalSubmission.update({ where: { id }, data: {
      stage: 0, hrFilledAt: null, managerFilledAt: null,
      hrAdminSignatureDate: null, mgrSignatureDate: null,
      hrDraftSavedAt: null, managerDraftSavedAt: null,
    } });
    return correction;
  });
}

export async function requestEmployeeCorrection(id: string, actor: string, instructions: string, version: unknown) {
  return withAppraisalLock(id, async (tx) => {
    const s = await tx.appraisalSubmission.findUniqueOrThrow({ where: { id } });
    const c = await tx.appraisalCorrection.findUnique({ where: { submissionId: id } });
    assertVersion(c, version);
    if (s.stage !== 0 || c?.status !== "RETURNED_TO_HR") throw new WorkflowConflict("This appraisal is not awaiting HR correction instructions.");
    const updated = await tx.appraisalCorrection.update({ where: { submissionId: id }, data: {
      status: "AWAITING_EMPLOYEE", instructions, version: { increment: 1 },
    } });
    await tx.appraisalCorrectionEvent.create({ data: {
      submissionId: id, revision: c.revision, action: "EMPLOYEE_CORRECTION_REQUESTED", actor, note: instructions,
    } });
    return updated;
  });
}

export async function saveReview(input: {
  id: string; requiredStage: number; toStage?: number; expectedVersion: unknown;
  data: Prisma.AppraisalSubmissionUpdateInput; actor: string; action: string;
}) {
  if (input.toStage != null && (input.requiredStage < 0 || input.requiredStage > 3 || input.toStage !== input.requiredStage + 1)) {
    throw new WorkflowConflict("Review stages cannot be skipped.");
  }
  return withAppraisalLock(input.id, async (tx) => {
    const s = await tx.appraisalSubmission.findUniqueOrThrow({ where: { id: input.id } });
    const c = await tx.appraisalCorrection.findUnique({ where: { submissionId: input.id } });
    assertVersion(c, input.expectedVersion);
    assertReviewAllowed(s.stage, c, input.requiredStage);
    if (c && c.revision > 0 && ((input.action === "MANAGER_EDITED" && s.stage !== 1) || (input.action === "MANAGEMENT_EDITED" && s.stage !== 2))) {
      throw new WorkflowConflict("A revised appraisal is locked after this review is submitted.");
    }
    const timestamp = input.toStage === 1 ? { hrFilledAt: new Date() }
      : input.toStage === 2 ? { managerFilledAt: new Date() }
      : input.toStage === 3 ? { managementFilledAt: new Date() }
      : input.toStage === 4 ? { completedAt: new Date() } : {};
    const result = await tx.appraisalSubmission.update({ where: { id: input.id }, data: {
      ...(input.action.startsWith("MANAGER_") ? restrictManagerRatings(input.data, s) : input.data),
      ...timestamp, ...(input.toStage != null ? { stage: input.toStage } : {}),
    } });
    // Track a version even before the first return, protecting old tabs across cycles.
    const updated = await tx.appraisalCorrection.upsert({ where: { submissionId: input.id },
      create: { submissionId: input.id, version: 1 }, update: { version: { increment: 1 } },
    });
    await tx.appraisalCorrectionEvent.create({ data: {
      submissionId: input.id, revision: updated.revision, action: input.action, actor: input.actor,
    } });
    return result;
  });
}

export async function resubmitEmployee(id: string, code: string, version: unknown, data: Prisma.AppraisalSubmissionUpdateInput) {
  return withAppraisalLock(id, async (tx) => {
    const s = await tx.appraisalSubmission.findUniqueOrThrow({ where: { id } });
    const c = await tx.appraisalCorrection.findUnique({ where: { submissionId: id } });
    assertVersion(c, version);
    if (s.employeeCode !== code || s.stage !== 0 || c?.status !== "AWAITING_EMPLOYEE") {
      throw new WorkflowConflict("This appraisal is not open for your corrections.");
    }
    // Eligibility is rechecked at write time, not just at login.
    const eligible = await tx.eligibleEmployee.findUnique({ where: {
      employeeCode_financialYear: { employeeCode: code, financialYear: s.financialYear },
    } });
    if (!eligible) throw new WorkflowConflict("Your eligibility has changed. Please contact HR.");
    const updated = await tx.appraisalSubmission.update({ where: { id }, data });
    await tx.appraisalCorrection.update({ where: { submissionId: id }, data: { status: "NONE", version: { increment: 1 } } });
    await tx.appraisalCorrectionEvent.create({ data: {
      submissionId: id, revision: c.revision, action: "EMPLOYEE_RESUBMITTED", actor: code,
      snapshot: employeeAnswers(s as unknown as Record<string, unknown>) as Prisma.InputJsonValue,
    } });
    return { id: updated.id };
  });
}
