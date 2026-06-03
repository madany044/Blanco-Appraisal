import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const submission = await prisma.appraisalSubmission.findUnique({
      where: { id: params.id },
      include: { manager: true },
    });

    if (!submission) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (user.role === "manager") {
      const manager = await prisma.manager.findFirst({ where: { userId: user.id } });
      if (!manager || submission.managerId !== manager.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (user.role === "management" && submission.stage < 2) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 });
  }
}
