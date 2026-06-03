import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transitionStage } from "@/lib/workflow";
import { mapManagerToPrisma } from "@/lib/submission-mapper";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { targetStage } = body;

    const existing = await prisma.appraisalSubmission.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (user.role === "manager" && existing.stage === 1) {
      const manager = await prisma.manager.findFirst({ where: { userId: user.id } });
      if (!manager || existing.managerId !== manager.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const mgrData = body.mgrSignatureName ? mapManagerToPrisma(body) : {};
      const updated = await transitionStage(params.id, 1, 0, mgrData);
      return NextResponse.json(updated);
    }

    if (user.role === "hr" && targetStage === 0 && existing.stage === 0) {
      const updated = await prisma.appraisalSubmission.update({
        where: { id: params.id },
        data: { stage: 0 },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid return operation" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
