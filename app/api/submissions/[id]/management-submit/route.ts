import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transitionStage } from "@/lib/workflow";
import { mapManagementToPrisma } from "@/lib/submission-mapper";
import { managementFormSchema } from "@/lib/validations/management-form.schema";
import { serializeIncrementSlabs } from "@/lib/utils";

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

    if (!existing.currentSalary) {
      return NextResponse.json({ error: "Employee current salary is missing" }, { status: 400 });
    }

    const slabs = serializeIncrementSlabs(
      await prisma.incrementSlab.findMany({ orderBy: { ctcMin: "asc" } })
    );

    // Keep slab guidance visible, but do not block management-approved increments.
    void slabs;

    const mgmtData = mapManagementToPrisma(parsed.data, existing.currentSalary);

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
