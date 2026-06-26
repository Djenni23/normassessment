import nodemailer, { type Transporter } from "nodemailer";

let cached: Transporter | null = null;

function getTransport(): Transporter | null {
  if (cached) return cached;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT ?? 587);
  if (!host || !user || !pass) return null;
  cached = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // implicit TLS on 465, STARTTLS otherwise
    auth: { user, pass },
  });
  return cached;
}

function esc(s: string): string {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] ?? c));
}

export type NewAssessmentEmail = {
  ref: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  typeLabel: string;
  country: string;
  city?: string;
  pv: number;
  daily: number;
  panels: number;
};

/**
 * Notifies the Norm Enerji team that a customer completed the checklist.
 * Silently no-ops (with a warning) when SMTP isn't configured, so a missing
 * mail server never blocks a customer submission.
 */
export async function sendNewAssessmentEmail(a: NewAssessmentEmail): Promise<void> {
  const tx = getTransport();
  if (!tx) {
    console.warn("[mailer] SMTP not configured (SMTP_HOST/USER/PASS) — skipping staff notification");
    return;
  }

  const to = process.env.NOTIFY_EMAIL || "proje@normenerji.com.tr";
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const baseUrl = (process.env.APP_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
  const link = `${baseUrl}/staff/${a.ref}`;

  const subject = `Nouvelle évaluation — ${a.name} (${a.ref})`;

  const rows: Array<[string, string]> = [
    ["Référence", a.ref],
    ["Client", a.name],
    ["Téléphone", a.phone],
    ...(a.whatsapp ? ([["WhatsApp", a.whatsapp]] as Array<[string, string]>) : []),
    ...(a.email ? ([["Email", a.email]] as Array<[string, string]>) : []),
    ["Type de projet", a.typeLabel],
    ["Localisation", [a.city, a.country].filter(Boolean).join(", ")],
    ["Capacité recommandée", `${a.pv.toFixed(1)} kWp`],
    ["Consommation quotidienne", `${a.daily.toFixed(1)} kWh`],
    ["Panneaux estimés", String(a.panels)],
  ];

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1B2A50">
      <h2 style="color:#2A3F73;margin:0 0 4px">☀️ Nouvelle évaluation reçue</h2>
      <p style="color:#5a6a8a;margin:0 0 16px">Un client a complété la checklist sur le site Norm Enerji.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:7px 10px;border:1px solid #E2E8F2;color:#5a6a8a;font-weight:600">${esc(k)}</td><td style="padding:7px 10px;border:1px solid #E2E8F2">${esc(v)}</td></tr>`
          )
          .join("")}
      </table>
      <p style="margin:20px 0">
        <a href="${esc(link)}" style="display:inline-block;background:#35508E;color:#fff;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:600">
          Voir la checklist complète →
        </a>
      </p>
      <p style="color:#9aa6bf;font-size:12px;margin-top:24px">Norm Enerji Solar Assessment</p>
    </div>`;

  const text = `Nouvelle évaluation reçue (${a.ref})\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nChecklist: ${link}`;

  await tx.sendMail({ from, to, subject, html, text });
}
