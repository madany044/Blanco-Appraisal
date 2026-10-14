import { correctionsEnabled } from "@/lib/correction-config";
import { saveReview, WorkflowConflict } from "@/lib/corrections";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transitionStage } from "@/lib/workflow";
import { mapManagementToPrisma } from "@/lib/submission-mapper";
import { managementDraftSchema, managementFormSchema } from "@/lib/validations/management-form.schema";
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
    const parsed = (draft ? managementDraftSchema : managementFormSchema).safeParse(body);
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

    if (correctionsEnabled) {
      const updated = await saveReview({ id: params.id, requiredStage: 2, toStage: draft ? undefined : 3,
        expectedVersion: body.version, actor: user.email, action: draft ? "MANAGEMENT_DRAFT_SAVED" : "MANAGEMENT_APPROVED",
        data: { ...mgmtData, mgmtDraftSavedAt: draft ? new Date() : null },
      });
      return NextResponse.json(updated);
    }

    if (draft) {
      const updated = await prisma.appraisalSubmission.update({
        where: { id: params.id },
        data: { ...mgmtData, mgmtDraftSavedAt: new Date() },
      });
      return NextResponse.json(updated);
    }

    const updated = await transitionStage(params.id, 2, 3, { ...mgmtData, mgmtDraftSavedAt: null });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof WorkflowConflict) return NextResponse.json({ error: error.message }, { status: 409 });
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
