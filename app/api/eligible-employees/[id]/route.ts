import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const user = await getAuthUser();
    if (!user || user.role !== "hr") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.eligibleEmployee.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
}