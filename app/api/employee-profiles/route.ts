import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeCode, employeeName, referencePhotoUrl, faceDescriptor, enrolledBy } = body;

    const profile = await prisma.employeeProfile.upsert({
      where: { employeeCode },
      update: { employeeName, referencePhotoUrl, faceDescriptor, enrolledBy },
      create: { employeeCode, employeeName, referencePhotoUrl, faceDescriptor, enrolledBy },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employeeCode = searchParams.get("employeeCode");
  if (!employeeCode) return NextResponse.json({ error: "employeeCode required" }, { status: 400 });

  const profile = await prisma.employeeProfile.findUnique({ where: { employeeCode } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(profile);
}