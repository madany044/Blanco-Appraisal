import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { employeeSession } from "@/lib/employee-session";
import { correctionsEnabled } from "@/lib/correction-config";
import { employeeAnswers } from "@/lib/employee-fields";
import { employeeFormSchema } from "@/lib/validations/employee-form.schema";
import { mapEmployeeToPrisma } from "@/lib/submission-mapper";
import { resubmitEmployee, WorkflowConflict } from "@/lib/corrections";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  if (!correctionsEnabled) return NextResponse.json({ error: "Feature not enabled" }, { status: 404 });
  const session = employeeSession(request);
  if (!session) return NextResponse.json({ error: "Please verify your face again." }, { status: 401 });
  const eligible = await prisma.eligibleEmployee.findUnique({ where: { employeeCode_financialYear: { employeeCode: session.code, financialYear: session.year } } });
  if (!eligible) return NextResponse.json({ error: "Please contact HR about your eligibility." }, { status: 403 });
  const rows = await prisma.appraisalSubmission.findMany({ where: { employeeCode: session.code, financialYear: session.year }, take: 2, include: { correction: true } });
  if (rows.length > 1) return NextResponse.json({ error: "More than one appraisal exists for this year. Please contact HR before continuing." }, { status: 409 });
  const s = rows[0];
  if (!s) return NextResponse.json({ mode: "new" }, { headers: { "Cache-Control": "no-store" } });
  const canEdit = s.stage === 0 && s.correction?.status === "AWAITING_EMPLOYEE";
  return NextResponse.json({
    mode: canEdit ? "correction" : "submitted", id: s.id, category: s.category,
    version: s.correction?.version ?? 0, revision: s.correction?.revision ?? 0,
    instructions: canEdit ? s.correction?.instructions : null,
    // Never send HR/manager/management data or internal return reasons to employees.
    answers: canEdit ? employeeAnswers(s as unknown as Record<string, unknown>) : undefined,
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: NextRequest) {
  if (!correctionsEnabled) return NextResponse.json({ error: "Feature not enabled" }, { status: 404 });
  const session = employeeSession(request);
  if (!session) return NextResponse.json({ error: "Your session expired. Please verify your face again before submitting." }, { status: 401 });
  try {
    const body = await request.json();
    const s = typeof body.id === "string" ? await prisma.appraisalSubmission.findFirst({ where: { id: body.id, employeeCode: session.code, financialYear: session.year } }) : null;
    if (!s) return NextResponse.json({ error: "Appraisal not found" }, { status: 404 });
    const parsed = employeeFormSchema.safeParse({ ...Object.fromEntries(Object.entries(body).filter(([, value]) => value !== null)), employeeCode: s.employeeCode, employeeName: s.employeeName, managerId: s.managerId, team: s.team ?? undefined });
    if (!parsed.success) return NextResponse.json({ error: "Please complete all required employee fields." }, { status: 400 });
    const mapped = mapEmployeeToPrisma({ ...parsed.data, category: s.category, stage: 0 });
    // Only employee answer fields can change. Preserve record identity, year,
    // original submission date, category, manager, and all reviewer data.
    const answers = employeeAnswers(mapped as unknown as Record<string, unknown>);
    const result = await resubmitEmployee(s.id, session.code, body.version, {
      ...answers,
      employeeSignatureDate: new Date(),
      ...(typeof body.verificationPhotoUrl === "string" ? { verificationPhotoUrl: body.verificationPhotoUrl } : {}),
    } as Prisma.AppraisalSubmissionUpdateInput);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof WorkflowConflict) return NextResponse.json({ error: error.message }, { status: 409 });
    console.error(error);
    return NextResponse.json({ error: "Unable to resubmit. Check your answers and try again." }, { status: 400 });
  }
}
