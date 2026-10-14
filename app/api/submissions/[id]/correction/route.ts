import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { correctionsEnabled } from "@/lib/correction-config";
import { requestEmployeeCorrection, WorkflowConflict } from "@/lib/corrections";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!correctionsEnabled) return NextResponse.json({ error: "Feature not enabled" }, { status: 404 });
  const user = await getAuthUser();
  if (!user || user.role !== "hr") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await request.json();
    const instructions = typeof body.instructions === "string" ? body.instructions.trim() : "";
    if (!instructions || instructions.length > 2000) return NextResponse.json({ error: "Enter employee instructions (up to 2000 characters)." }, { status: 400 });
    return NextResponse.json(await requestEmployeeCorrection(params.id, user.email, instructions, body.version));
  } catch (error) {
    if (error instanceof WorkflowConflict) return NextResponse.json({ error: error.message }, { status: 409 });
    console.error(error);
    return NextResponse.json({ error: "Unable to open corrections." }, { status: 400 });
  }
}
