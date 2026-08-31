import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employeeCode = searchParams.get("employeeCode");
  const financialYear = searchParams.get("financialYear") ?? "2026-27";

  if (employeeCode) {
    // Used by the employee-facing gate to check a single code
    const match = await prisma.eligibleEmployee.findFirst({
      where: { employeeCode, financialYear },
    });
    return NextResponse.json({ eligible: !!match });
  }

  const user = await getAuthUser();
  if (!user || user.role !== "hr") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const list = await prisma.eligibleEmployee.findMany({
    where: { financialYear },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user || user.role !== "hr") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { employeeCode, employeeName, financialYear = "2026-27" } = body;
    if (!employeeCode || !employeeName) {
      return NextResponse.json({ error: "Employee code and name required" }, { status: 400 });
    }

    const entry = await prisma.eligibleEmployee.upsert({
      where: { employeeCode_financialYear: { employeeCode, financialYear } },
      update: { employeeName, addedBy: user.email },
      create: { employeeCode, employeeName, financialYear, addedBy: user.email },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add employee" }, { status: 500 });
  }
}