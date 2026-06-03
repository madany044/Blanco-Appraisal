import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transitionStage, getMaxIncrementPct } from "@/lib/workflow";
import { mapManagementToPrisma } from "@/lib/submission-mapper";
import { managementFormSchema } from "@/lib/validations/management-form.schema";
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  if (!user || user.role !== "management") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { draft } = body;
    const parsed = managementFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.appraisalSubmission.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.stage !== 2) {
      return NextResponse.json({ error: "Invalid stage for management submit" }, { status: 400 });
    }

    const slabs = await prisma.incrementSlab.findMany();
    const grossPresent =
      parsed.data.salaryBasicPresent +
      parsed.data.salaryDaPresent +
      parsed.data.salaryHraPresent +
      parsed.data.salaryCityAllowancePresent +
      parsed.data.salaryConveyancePresent +
      parsed.data.salaryMedicalPresent +
      parsed.data.salaryEducationPresent +
      parsed.data.salaryLtaPresent +
      parsed.data.salarySpecialPresent;
    const ctcExtras =
      parsed.data.salaryEmployerPfPresent +
      parsed.data.salaryBonusPresent +
      parsed.data.salaryEmployerEsicPresent +
      parsed.data.salaryMedicalInsurancePresent;
    const ctcPresentAnnual = grossPresent * 12 + ctcExtras * 12;
    const maxPct = getMaxIncrementPct(ctcPresentAnnual, slabs);

    if (!draft && parsed.data.mgmtIncrementPercentage > maxPct) {
      return NextResponse.json(
        { error: `Increment exceeds maximum allowed ${maxPct}%` },
        { status: 400 }
      );
    }

    const mgmtData = mapManagementToPrisma(parsed.data);

    if (draft) {
      const updated = await prisma.appraisalSubmission.update({
        where: { id: params.id },
        data: mgmtData,
      });
      return NextResponse.json(updated);
    }

    const updated = await transitionStage(params.id, 2, 3, mgmtData);
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
