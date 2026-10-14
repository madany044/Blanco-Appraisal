import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { correctionsEnabled } from "@/lib/correction-config";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  if (correctionsEnabled) {
    const user = await getAuthUser();
    if (!user || !["hr", "manager", "dc"].includes(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
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
  if (employeeCode) {
    const profile = await prisma.employeeProfile.findUnique({ where: { employeeCode } });
    if (!profile) {
      return NextResponse.json({ error: "Not found" }, { status: 404, headers: CORS_HEADERS });
    }
    return NextResponse.json(correctionsEnabled ? { employeeCode: profile.employeeCode, enrolled: true } : profile, { headers: { ...CORS_HEADERS, "Cache-Control": "no-store" } });
  }

  const profiles = await prisma.employeeProfile.findMany({
    select: {
      id: true,
      employeeCode: true,
      employeeName: true,
    },
    orderBy: { employeeCode: "asc" },
  });

  return NextResponse.json(profiles, { headers: CORS_HEADERS });
}