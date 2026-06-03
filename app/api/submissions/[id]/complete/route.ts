import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transitionStage } from "@/lib/workflow";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  if (!user || user.role !== "hr") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const existing = await prisma.appraisalSubmission.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.stage !== 3) {
      return NextResponse.json({ error: "Invalid stage for completion" }, { status: 400 });
    }

    const updated = await transitionStage(params.id, 3, 4);
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
