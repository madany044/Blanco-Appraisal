import { correctionsEnabled } from "@/lib/correction-config";
import { returnForCorrection, WorkflowConflict } from "@/lib/corrections";
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
    if (correctionsEnabled) {
      if (user.role !== "manager") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      const reason = typeof body.reason === "string" ? body.reason.trim() : "";
      if (!reason || reason.length > 2000) return NextResponse.json({ error: "Enter a return reason (up to 2000 characters)." }, { status: 400 });
      const manager = await prisma.manager.findFirst({ where: { userId: user.id } });
      if (!manager) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return NextResponse.json(await returnForCorrection(params.id, manager.id, user.email, reason, body.version));
    }
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
    if (error instanceof WorkflowConflict) return NextResponse.json({ error: error.message }, { status: 409 });
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
