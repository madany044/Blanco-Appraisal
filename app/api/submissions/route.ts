import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { mapEmployeeToPrisma } from "@/lib/submission-mapper";
import type { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, stage, managerId } = body;

    if (!category || !managerId) {
      return NextResponse.json({ error: "Category and manager are required" }, { status: 400 });
    }

    const data = mapEmployeeToPrisma(body);
    const submission = await prisma.appraisalSubmission.create({ data });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const managerId = searchParams.get("managerId");
  const category = searchParams.get("category");
  const stage = searchParams.get("stage");
  const financialYear = searchParams.get("financialYear");
  const search = searchParams.get("search");

  const where: Prisma.AppraisalSubmissionWhereInput = {};

  if (user.role === "manager") {
    const manager = await prisma.manager.findFirst({ where: { userId: user.id } });
    if (!manager) {
      return NextResponse.json({ error: "Manager profile not found" }, { status: 403 });
    }
    where.managerId = manager.id;
  } else if (user.role === "management") {
    where.stage = { gte: 2 };
  }

  if (managerId && managerId !== "all" && user.role === "hr") where.managerId = managerId;
  if (category && category !== "all") where.category = category as Prisma.AppraisalSubmissionWhereInput["category"];
  if (stage && stage !== "all") where.stage = parseInt(stage, 10);
  if (financialYear && financialYear !== "all") where.financialYear = financialYear;
  if (search) {
    where.OR = [
      { employeeName: { contains: search, mode: "insensitive" } },
      { employeeCode: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const submissions = await prisma.appraisalSubmission.findMany({
      where,
      include: { manager: true },
      orderBy: { submittedAt: "desc" },
    });
    return NextResponse.json(submissions);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}
