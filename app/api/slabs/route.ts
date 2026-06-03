import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { serializeIncrementSlabs } from "@/lib/utils";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const slabs = await prisma.incrementSlab.findMany({ orderBy: { ctcMin: "asc" } });
    return NextResponse.json(serializeIncrementSlabs(slabs));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch slabs" }, { status: 500 });
  }
}
