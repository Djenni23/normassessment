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

  const to = process.env.NOTIFY_EMAIL || "export@normenerji.com.tr";
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const baseUrl = (process.env.APP_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
  const link = `${baseUrl}/staff/${a.ref}`;

  // Trilingual (TR / EN / FR) — the team inbox is shared across Turkish-,
  // English- and French-speaking staff, so every label is shown in all three.
  const subject = `Yeni değerlendirme / New assessment / Nouvelle évaluation — ${a.name} (${a.ref})`;

  // Each row: [Turkish label, English label, French label, value]
  const rows: Array<[string, string, string, string]> = [
    ["Referans", "Reference", "Référence", a.ref],
    ["Müşteri", "Customer", "Client", a.name],
    ["Telefon", "Phone", "Téléphone", a.phone],
    ...(a.whatsapp ? ([["WhatsApp", "WhatsApp", "WhatsApp", a.whatsapp]] as Array<[string, string, string, string]>) : []),
    ...(a.email ? ([["E-posta", "Email", "Email", a.email]] as Array<[string, string, string, string]>) : []),
    ["Proje türü", "Project type", "Type de projet", a.typeLabel],
    ["Konum", "Location", "Localisation", [a.city, a.country].filter(Boolean).join(", ")],
    ["Önerilen kapasite", "Recommended capacity", "Capacité recommandée", `${a.pv.toFixed(1)} kWp`],
    ["Günlük tüketim", "Daily consumption", "Consommation quotidienne", `${a.daily.toFixed(1)} kWh`],
    ["Tahmini panel", "Estimated panels", "Panneaux estimés", String(a.panels)],
  ];

  const labelCell = (tr: string, en: string, fr: string) =>
    `<td style="padding:8px 10px;border:1px solid #E2E8F2;width:46%;vertical-align:top">
       <span style="color:#1B2A50;font-weight:700">${esc(tr)}</span>
       <span style="display:block;color:#9aa6bf;font-size:11px;margin-top:1px">${esc(en)} · ${esc(fr)}</span>
     </td>`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1B2A50">
      <h2 style="color:#2A3F73;margin:0 0 2px">☀️ Yeni değerlendirme alındı</h2>
      <p style="color:#5a6a8a;margin:0 0 16px;font-size:14px">
        New assessment received · Nouvelle évaluation reçue<br>
        <span style="color:#9aa6bf;font-size:12px">Bir müşteri formu tamamladı · A customer completed the checklist · Un client a complété la checklist</span>
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${rows
          .map(
            ([tr, en, fr, v]) =>
              `<tr>${labelCell(tr, en, fr)}<td style="padding:8px 10px;border:1px solid #E2E8F2;vertical-align:top">${esc(v)}</td></tr>`
          )
          .join("")}
      </table>
      <p style="margin:20px 0">
        <a href="${esc(link)}" style="display:inline-block;background:#35508E;color:#fff;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:600">
          Tam formu görüntüle / View full checklist / Voir la checklist →
        </a>
      </p>
      <p style="color:#9aa6bf;font-size:12px;margin-top:24px">Norm Enerji Solar Assessment</p>
    </div>`;

  const text =
    `Yeni değerlendirme / New assessment / Nouvelle évaluation (${a.ref})\n\n` +
    rows.map(([tr, en, fr, v]) => `${tr} / ${en} / ${fr}: ${v}`).join("\n") +
    `\n\nForm / Checklist: ${link}`;

  await tx.sendMail({ from, to, subject, html, text });
}
