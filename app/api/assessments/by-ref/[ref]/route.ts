import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { requireStaff } from "@/lib/auth";

export async function GET(_req: Request, ctx: { params: Promise<{ ref: string }> }) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { ref } = await ctx.params;
  if (!/^[A-Z0-9-]{4,32}$/.test(ref)) return NextResponse.json({ error: "invalid ref" }, { status: 400 });
  const db = await getDb();
  const doc = await db.collection("assessments").findOne({ ref });
  if (!doc) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ...doc, _id: String(doc._id) });
}
