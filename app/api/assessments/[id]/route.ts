import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongo";
import { requireStaff } from "@/lib/auth";
import { TYPES, type ProjectTypeId } from "@/lib/catalog";

const STATUSES = new Set(["New", "In Review", "Quoted"]);
const TYPE_IDS = new Set(TYPES.map((x) => x.id));

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);

/**
 * PATCH /api/assessments/:id
 * Updates editable staff-facing fields. Every field is optional — the caller
 * sends only what changed. Sending `status` alone keeps the existing
 * status-change behaviour from the StatusEditor.
 */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const update: Record<string, unknown> = {};

  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !STATUSES.has(body.status)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }
    update.status = body.status;
  }

  if (body.projectName !== undefined) update.projectName = str(body.projectName, 200) ?? "";

  if (body.projectType !== undefined) {
    if (typeof body.projectType !== "string" || !TYPE_IDS.has(body.projectType as ProjectTypeId)) {
      return NextResponse.json({ error: "invalid projectType" }, { status: 400 });
    }
    const t = TYPES.find((x) => x.id === body.projectType)!;
    update.projectType = t.id;
    update.typeIcon = t.icon;
    update.cat = t.cat;
    // Keep typeLabel coherent (only override when not a custom "other" entry).
    if (t.id !== "other") update.typeLabel = t.label;
  }

  if (body.customTypeLabel !== undefined) {
    const v = str(body.customTypeLabel, 80) ?? "";
    update.customTypeLabel = v;
    // If the assessment is "other", reflect the custom label as the displayed type.
    if (body.projectType === "other" || (await currentProjectType(id)) === "other") {
      update.typeLabel = v || "Other";
    }
  }

  const contact = body.contact as Record<string, unknown> | undefined;
  if (contact && typeof contact === "object") {
    const c: Record<string, string> = {};
    if (contact.name !== undefined) c["contact.name"] = str(contact.name, 120) ?? "";
    if (contact.dialCode !== undefined) c["contact.dialCode"] = str(contact.dialCode, 8) ?? "";
    if (contact.phone !== undefined) c["contact.phone"] = str(contact.phone, 40) ?? "";
    if (contact.whatsappDial !== undefined) c["contact.whatsappDial"] = str(contact.whatsappDial, 8) ?? "";
    if (contact.whatsapp !== undefined) c["contact.whatsapp"] = str(contact.whatsapp, 40) ?? "";
    if (contact.email !== undefined) c["contact.email"] = str(contact.email, 120) ?? "";
    Object.assign(update, c);
  }

  const location = body.location as Record<string, unknown> | undefined;
  if (location && typeof location === "object") {
    if (location.country !== undefined) update["location.country"] = str(location.country, 80) ?? "";
    if (location.city !== undefined) update["location.city"] = str(location.city, 80) ?? "";
    if (location.address !== undefined) update["location.address"] = str(location.address, 200) ?? "";
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "no editable fields provided" }, { status: 400 });
  }

  update.updatedAt = new Date();

  const db = await getDb();
  const result = await db
    .collection("assessments")
    .updateOne({ _id: new ObjectId(id) }, { $set: update });
  if (result.matchedCount === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

async function currentProjectType(id: string): Promise<string | null> {
  const db = await getDb();
  const doc = await db.collection("assessments").findOne({ _id: new ObjectId(id) }, { projection: { projectType: 1 } });
  return (doc?.projectType as string) ?? null;
}

/**
 * DELETE /api/assessments/:id
 * Permanently removes the assessment. Staff-only.
 */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const db = await getDb();
  const result = await db.collection("assessments").deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
