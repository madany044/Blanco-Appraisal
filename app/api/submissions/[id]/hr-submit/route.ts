import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transitionStage } from "@/lib/workflow";
import { mapHRToPrisma } from "@/lib/submission-mapper";
import { hrFormSchema } from "@/lib/validations/hr-form.schema";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  if (!user || user.role !== "hr") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { draft } = body;
    const parsed = hrFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.appraisalSubmission.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.stage !== 0) {
      return NextResponse.json({ error: "Invalid stage for HR submit" }, { status: 400 });
    }

    const hrData = mapHRToPrisma(parsed.data);

    if (draft) {
      const updated = await prisma.appraisalSubmission.update({
        where: { id: params.id },
        data: hrData,
      });
      return NextResponse.json(updated);
    }

    const updated = await transitionStage(params.id, 0, 1, hrData);
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
