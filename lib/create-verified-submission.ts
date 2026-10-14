import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { employeeSession } from "./employee-session";
import { employeeFormSchema } from "./validations/employee-form.schema";
import { mapEmployeeToPrisma } from "./submission-mapper";
import { appraisalTransactionOptions } from "./appraisal-transaction";

export async function createVerifiedSubmission(request: NextRequest, body: Record<string, unknown>) {
  const session = employeeSession(request);
  if (!session || session.code !== body.employeeCode) return NextResponse.json({ error: "Please verify your face before submitting." }, { status: 401 });
  if (body.stage !== 0 || !["GROUP_A", "GROUP_B", "GROUP_C", "QC"].includes(String(body.category))) return NextResponse.json({ error: "Invalid initial stage or category" }, { status: 400 });
  const parsed = employeeFormSchema.safeParse(Object.fromEntries(Object.entries(body).filter(([, value]) => value !== null)));
  if (!parsed.success || !parsed.data.managerId) return NextResponse.json({ error: "Please complete all required employee fields and select a team." }, { status: 400 });
  return prisma.$transaction(async (tx) => {
    // Serialize initial submissions even before a submission row exists.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${session.code + ":" + session.year}, 0))::text`;
    const eligible = await tx.eligibleEmployee.findUnique({ where: { employeeCode_financialYear: { employeeCode: session.code, financialYear: session.year } } });
    if (!eligible) return NextResponse.json({ error: "You are not currently eligible. Contact HR." }, { status: 403 });
    if (await tx.appraisalSubmission.findFirst({ where: { employeeCode: session.code, financialYear: session.year } })) {
      return NextResponse.json({ error: "Your appraisal already exists. Reopen it through employee login if HR has requested corrections." }, { status: 409 });
    }
    const submission = await tx.appraisalSubmission.create({ data: mapEmployeeToPrisma({ ...parsed.data, category: String(body.category), stage: 0, verificationPhotoUrl: typeof body.verificationPhotoUrl === "string" ? body.verificationPhotoUrl : null }) });
    await tx.appraisalCorrection.create({ data: { submissionId: submission.id } });
    await tx.appraisalCorrectionEvent.create({ data: { submissionId: submission.id, revision: 0, action: "EMPLOYEE_SUBMITTED", actor: session.code } });
    return NextResponse.json({ id: submission.id }, { status: 201 });
  }, appraisalTransactionOptions);
}
