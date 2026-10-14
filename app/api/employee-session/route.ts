import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { correctionsEnabled, APPRAISAL_YEAR } from "@/lib/correction-config";
import { createEmployeeSession, EMPLOYEE_COOKIE, employeeCookieOptions } from "@/lib/employee-session";

const verificationSchema = z.object({ employeeCode: z.string().trim().min(1).max(100), descriptor: z.array(z.number().finite().min(-2).max(2)).length(128) });
export async function POST(request: NextRequest) {
  if (!correctionsEnabled) return NextResponse.json({ error: "Feature not enabled" }, { status: 404 });
  try {
    const parsed = verificationSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid verification request" }, { status: 400 });
    const { employeeCode, descriptor } = parsed.data;
    const [eligible, profile] = await Promise.all([
      prisma.eligibleEmployee.findUnique({ where: { employeeCode_financialYear: { employeeCode, financialYear: APPRAISAL_YEAR } } }),
      prisma.employeeProfile.findUnique({ where: { employeeCode } }),
    ]);
    const reference = profile?.faceDescriptor;
    if (!eligible || !Array.isArray(reference) || reference.length !== 128 || !reference.every((n) => typeof n === "number" && Number.isFinite(n))) {
      return NextResponse.json({ error: "Verification unavailable. Please contact HR." }, { status: 403 });
    }
    const distance = Math.sqrt(descriptor.reduce((sum, n, i) => sum + (n - (reference[i] as number)) ** 2, 0));
    if (distance >= 0.5) return NextResponse.json({ error: "Face did not match your enrolled profile. Please try again." }, { status: 403 });
    const response = NextResponse.json({ verified: true }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(EMPLOYEE_COOKIE, createEmployeeSession(employeeCode, APPRAISAL_YEAR), employeeCookieOptions);
    return response;
  } catch (error) {
    console.error("Employee verification failed", error);
    return NextResponse.json({ error: "Verification unavailable. Please contact HR." }, { status: 503 });
  }
}
