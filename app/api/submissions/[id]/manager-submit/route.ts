import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transitionStage } from "@/lib/workflow";
import { mapManagerToPrisma } from "@/lib/submission-mapper";
import { managerFormSchema } from "@/lib/validations/manager-form.schema";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  if (!user || user.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { draft } = body;
    const parsed = managerFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const manager = await prisma.manager.findFirst({ where: { userId: user.id } });
    if (!manager) {
      return NextResponse.json({ error: "Manager not found" }, { status: 403 });
    }

    const existing = await prisma.appraisalSubmission.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.managerId !== manager.id || existing.stage !== 1) {
      return NextResponse.json({ error: "Invalid stage for manager submit" }, { status: 400 });
    }

    const mgrData = mapManagerToPrisma(parsed.data);

    if (draft) {
      const updated = await prisma.appraisalSubmission.update({
        where: { id: params.id },
        data: mgrData,
      });
      return NextResponse.json(updated);
    }

    const updated = await transitionStage(params.id, 1, 2, mgrData);
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
