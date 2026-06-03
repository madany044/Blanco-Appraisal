import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const managers = await prisma.manager.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    });
    return NextResponse.json(managers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch managers" }, { status: 500 });
  }
}
