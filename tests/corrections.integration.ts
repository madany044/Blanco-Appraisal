import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";

async function main() {
  const url = new URL(process.env.DATABASE_URL ?? "http://invalid");
  assert.equal(url.hostname, "127.0.0.1", "Tests must use the isolated loopback database");
  assert.equal(url.port, "55439");
  assert.equal(url.pathname, "/appraisal_correction_test");
  assert.equal(process.env.NEXT_PUBLIC_APPRAISAL_CORRECTIONS_ENABLED, "true");
  const { prisma } = await import("../lib/prisma");
  const { saveReview, returnForCorrection, requestEmployeeCorrection, correctionDetails, withAppraisalLock } = await import("../lib/corrections");
  const { createEmployeeSession, verifyEmployeeSession, EMPLOYEE_COOKIE } = await import("../lib/employee-session");
  const { POST: create } = await import("../app/api/submissions/route");
  const { GET: employeeGet, PATCH: employeePatch } = await import("../app/api/employee-appraisal/route");
  const { POST: verify } = await import("../app/api/employee-session/route");
  const { GET: profileGet } = await import("../app/api/employee-profiles/route");
  const { employeeAnswers } = await import("../lib/employee-fields");
  let checks = 0;
  function pass(label: string) { checks++; console.log(`PASS ${label}`); }
  const run = randomUUID().slice(0, 8);
  const manager = await prisma.manager.create({ data: { name: "Correction Test Manager", email: `${run}@example.invalid` } });
  const code = `TEST-${run}`;
  const session = createEmployeeSession(code, "2026-27");
  function req(path: string, body?: unknown, token = session, method = body ? "POST" : "GET") {
    return new NextRequest(`http://localhost:3000${path}`, { method, headers: { "Content-Type": "application/json", cookie: `${EMPLOYEE_COOKIE}=${token}` }, ...(body ? { body: JSON.stringify(body) } : {}) });
  }
  const base = {
    employeeName: "Test Employee", employeeCode: code, managerId: manager.id, team: "Team 1", category: "GROUP_A", stage: 0,
    basisOfAppraisal: "Original answer", supportToCompany: "Test support", expectationsYesNo: "YES", expectationsReason: "Test reason", strengthsWeaknesses: "Test strengths",
    upcomingGoal: "Test goal", initiativeFrequency: "Consistently", learningCommitment: "A", currentYearPerformance: "Test performance", productivityImprovement: "Test improvement", overallRating: "Test rating", employeeSignatureName: "TEST EMPLOYEE",
    rateTeamwork: 5, rateCompanyRelationship: 5, ratePmRelationship: 5, rateCoworkerComms: 5, rateEngineering: 5, rateTeamCommunication: 5, rateVerbalWritten: 5, rateEnglish: 5, rateSelfLearning: 5, rateQualityOfWork: 5,
  };
  try {
    await prisma.eligibleEmployee.create({ data: { employeeCode: code, employeeName: base.employeeName } });
    assert.equal(verifyEmployeeSession(session)?.code, code);
    assert.equal(verifyEmployeeSession(session + "x"), null);
    assert.equal(verifyEmployeeSession(createEmployeeSession(code, "2026-27", Date.now() - 3 * 3600000)), null);
    pass("employee sessions reject tampering and expiry");
    assert.equal((await create(req("/api/submissions", base, ""))).status, 401);
    assert.equal((await create(req("/api/submissions", { ...base, stage: 3 }))).status, 400);
    pass("initial submission requires identity and cannot skip stages");
    const original = await create(req("/api/submissions", base));
    assert.equal(original.status, 201, JSON.stringify(await original.clone().json()));
    const { id } = await original.json();
    const first = await prisma.appraisalSubmission.findUniqueOrThrow({ where: { id } });
    await withAppraisalLock(id, async (tx) => {
      await tx.$queryRaw`SELECT 1 AS delayed FROM pg_sleep(6)`;
      const state = await tx.appraisalCorrection.findUniqueOrThrow({ where: { submissionId: id } });
      assert.equal(state.status, "NONE");
      assert.equal(state.revision, 0);
    });
    pass("normal appraisals stay outside correction and transactions tolerate over five seconds");
    const originalDate = first.submittedAt?.getTime();
    assert.equal((await create(req("/api/submissions", base))).status, 409);
    pass("duplicate creation is blocked");
    assert.equal((await (await employeeGet(req("/api/employee-appraisal"))).json()).mode, "submitted");
    const hr = { currentSalary: 40000, hrCodeOfConduct: 8, hrAdminSignatureName: "HR TEST", hrAdminSignatureDate: new Date() };
    await saveReview({ id, requiredStage: 0, toStage: 1, expectedVersion: 0, actor: "hr@test", action: "HR_SUBMITTED", data: hr });
    await assert.rejects(() => returnForCorrection(id, randomUUID(), "other@test", "Fix answers", 1));
    await returnForCorrection(id, manager.id, "manager@test", "Please clarify achievements", 1);
    let s = await prisma.appraisalSubmission.findUniqueOrThrow({ where: { id } });
    assert.equal(s.stage, 0); assert.equal(s.hrFilledAt, null); assert.equal(s.currentSalary, 40000);
    await assert.rejects(() => saveReview({ id, requiredStage: 0, toStage: 1, expectedVersion: 2, actor: "hr@test", action: "HR_SUBMITTED", data: hr }));
    assert.equal((await employeePatch(req("/api/employee-appraisal", { ...base, id, version: 2 }, session, "PATCH"))).status, 409);
    pass("return preserves data, invalidates prior completion, and blocks HR/employee until HR opens correction");
    await requestEmployeeCorrection(id, "hr@test", "Expand the achievements answer", 2);
    const view = await (await employeeGet(req("/api/employee-appraisal"))).json();
    assert.equal(view.mode, "correction"); assert.equal(view.id, id); assert.equal(view.answers.basisOfAppraisal, "Original answer");
    assert.equal(view.answers.currentSalary, undefined); assert.equal(view.reason, undefined); assert.equal(view.answers.hrCodeOfConduct, undefined);
    assert.equal(view.instructions, "Expand the achievements answer");
    pass("employee sees prefilled answers and HR instructions, without confidential reviewer data");
    const otherSession = createEmployeeSession("OTHER", "2026-27");
    assert.equal((await employeePatch(req("/api/employee-appraisal", { ...base, id, version: 3 }, otherSession, "PATCH"))).status, 404);
    const patch = { ...base, id, version: 3, basisOfAppraisal: "Revised answer", hrCodeOfConduct: 1, currentSalary: 999999, employeeName: "Changed identity", managerId: randomUUID(), category: "QC" };
    const response = await employeePatch(req("/api/employee-appraisal", patch, session, "PATCH"));
    assert.equal(response.status, 200, JSON.stringify(await response.clone().json()));
    s = await prisma.appraisalSubmission.findUniqueOrThrow({ where: { id } });
    assert.equal(s.basisOfAppraisal, "Revised answer"); assert.equal(s.currentSalary, 40000); assert.equal(s.hrCodeOfConduct, 8);
    assert.equal(s.managerId, manager.id); assert.equal(s.employeeName, base.employeeName); assert.equal(s.category, "GROUP_A"); assert.equal(s.submittedAt?.getTime(), originalDate);
    assert.equal((await employeePatch(req("/api/employee-appraisal", patch, session, "PATCH"))).status, 409);
    pass("resubmission updates the same record only, protects identity/reviewer fields, and rejects stale replay");
    await assert.rejects(() => saveReview({ id, requiredStage: 1, toStage: 2, expectedVersion: 4, actor: "manager@test", action: "MANAGER_SUBMITTED", data: {} }));
    await saveReview({ id, requiredStage: 0, toStage: 1, expectedVersion: 4, actor: "hr@test", action: "HR_SUBMITTED", data: hr });
    const race = await Promise.allSettled([
      returnForCorrection(id, manager.id, "manager@test", "Second correction", 5),
      returnForCorrection(id, manager.id, "manager@test", "Duplicate click", 5),
    ]);
    assert.equal(race.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal((await prisma.appraisalCorrection.findUniqueOrThrow({ where: { submissionId: id } })).revision, 2);
    pass("repeated cycles work and simultaneous returns create only one correction");
    await requestEmployeeCorrection(id, "hr@test", "Second instructions", 6);
    await prisma.eligibleEmployee.delete({ where: { employeeCode_financialYear: { employeeCode: code, financialYear: "2026-27" } } });
    assert.equal((await employeePatch(req("/api/employee-appraisal", { ...base, id, version: 7 }, session, "PATCH"))).status, 409);
    await prisma.eligibleEmployee.create({ data: { employeeCode: code, employeeName: base.employeeName } });
    assert.equal((await employeePatch(req("/api/employee-appraisal", { ...base, id, version: 7 }, session, "PATCH"))).status, 200);
    pass("eligibility is rechecked on resubmission");
    await saveReview({ id, requiredStage: 0, toStage: 1, expectedVersion: 8, actor: "hr@test", action: "HR_SUBMITTED", data: hr });
    await saveReview({ id, requiredStage: 1, toStage: 2, expectedVersion: 9, actor: "manager@test", action: "MANAGER_SUBMITTED", data: { mgrRemarks: "Approved revised answers" } });
    await saveReview({ id, requiredStage: 2, toStage: 3, expectedVersion: 10, actor: "management@test", action: "MANAGEMENT_APPROVED", data: { mgmtIncrementPercentage: 5 } });
    await assert.rejects(() => saveReview({ id, requiredStage: 3, expectedVersion: 11, actor: "manager@test", action: "MANAGER_EDITED", data: { mgrRemarks: "Late change" } }));
    await saveReview({ id, requiredStage: 3, toStage: 4, expectedVersion: 11, actor: "hr@test", action: "COMPLETED", data: {} });
    assert.equal((await prisma.appraisalSubmission.findUniqueOrThrow({ where: { id } })).stage, 4);
    const history = await correctionDetails(id);
    assert.equal(history.events.filter((e) => e.action === "RETURNED_TO_HR").length, 2);
    assert.equal(history.events.find((e) => e.action === "RETURNED_TO_HR")?.previousAnswers?.basisOfAppraisal, "Original answer");
    pass("revised appraisal completes all required stages, locks late edits, and retains history");
    // All category forms use the same endpoint, including QC's hidden null fields.
    for (const category of ["GROUP_A", "GROUP_B", "GROUP_C", "QC"]) {
      const c = `${code}-${category}`;
      await prisma.eligibleEmployee.create({ data: { employeeCode: c, employeeName: base.employeeName } });
      const token = createEmployeeSession(c, "2026-27");
      const payload = { ...base, employeeCode: c, category, ...(category === "QC" ? { prodSimpleBeam: null, prodStair: null, modelerSectionNa: true } : {}) };
      const results = await Promise.all([create(req("/api/submissions", payload, token)), create(req("/api/submissions", payload, token))]);
      assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
      const row = await prisma.appraisalSubmission.findFirstOrThrow({ where: { employeeCode: c } });
      await saveReview({ id: row.id, requiredStage: 0, toStage: 1, expectedVersion: 0, actor: "hr", action: "HR_SUBMITTED", data: hr });
      await returnForCorrection(row.id, manager.id, "manager", "Category test", 1);
      await requestEmployeeCorrection(row.id, "hr", "Category instructions", 2);
      const loaded = await (await employeeGet(req("/api/employee-appraisal", undefined, token))).json();
      assert.equal(loaded.category, category);
      assert.equal((await employeePatch(req("/api/employee-appraisal", { ...payload, id: row.id, version: 3 }, token, "PATCH"))).status, 200);
    }
    pass("all four categories support correction and concurrent create protection");
    await prisma.employeeProfile.create({ data: { employeeCode: code, employeeName: base.employeeName, referencePhotoUrl: "test-only", faceDescriptor: Array(128).fill(0.1) } });
    assert.equal((await verify(req("/api/employee-session", { employeeCode: code, descriptor: Array(128).fill(0.9) }))).status, 403);
    const verified = await verify(req("/api/employee-session", { employeeCode: code, descriptor: Array(128).fill(0.1) }));
    assert.equal(verified.status, 200); assert.ok(verified.headers.get("set-cookie")?.includes("HttpOnly"));
    const publicProfile = await (await profileGet(req(`/api/employee-profiles?employeeCode=${code}`))).json();
    assert.equal(publicProfile.faceDescriptor, undefined); assert.equal(publicProfile.referencePhotoUrl, undefined);
    assert.deepEqual(employeeAnswers({ basisOfAppraisal: "Answer", mgmtInternalNotes: "private", currentSalary: 100 }), { basisOfAppraisal: "Answer" });
    pass("server verification uses the existing threshold, issues a private cookie, and hides enrolled descriptors");
    console.log(`\n${checks} integration groups passed against the isolated test database.`);
  } finally { await prisma.$disconnect(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
