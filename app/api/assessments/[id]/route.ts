import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongo";
import { requireStaff } from "@/lib/auth";

const STATUSES = new Set(["New", "In Review", "Quoted"]);

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  const status = body.status as string;
  if (!STATUSES.has(status)) return NextResponse.json({ error: "invalid status" }, { status: 400 });
  const db = await getDb();
  await db.collection("assessments").updateOne({ _id: new ObjectId(id) }, { $set: { status } });
  return NextResponse.json({ ok: true });
}
