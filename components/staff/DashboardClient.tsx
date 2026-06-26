"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Icon } from "../Icon";
import { Header } from "../Header";
import { SettingsPanel } from "./SettingsPanel";
import { useT } from "../LangProvider";
import { type SystemTypeId, type GoalId, type ProjectTypeId } from "@/lib/catalog";
import type { DictKey } from "@/lib/i18n/types";
import type { Settings } from "@/lib/calc";
import { EditAssessmentModal, type EditableAssessment } from "./EditAssessmentModal";

type Status = "New" | "In Review" | "Quoted";

type Assessment = {
  _id: string;
  ref: string;
  name: string;
  projectName?: string;
  country: string;
  city?: string;
  address?: string;
  phone?: string;
  dialCode?: string;
  whatsapp?: string;
  whatsappDial?: string;
  email?: string;
  customTypeLabel?: string;
  type: string;
  projectType?: ProjectTypeId;
  typeIcon: string;
  size: string;
  daily: string;
  panels: number;
  systemType: SystemTypeId | null;
  installZone: "roof" | "ground" | null;
  goal: GoalId | null;
  status: Status;
  createdAt: string;
};

const STATUS_KEY: Record<Status, DictKey> = {
  New: "staff.status.new",
  "In Review": "staff.status.in_review",
  Quoted: "staff.status.quoted",
};

const FILTERS: Array<{ key: "all" | "New" | "In Review" | "Quoted"; labelKey: DictKey }> = [
  { key: "all", labelKey: "staff.filter.all" },
  { key: "New", labelKey: "staff.status.new" },
  { key: "In Review", labelKey: "staff.status.in_review" },
  { key: "Quoted", labelKey: "staff.status.quoted" },
];

const AVATAR_COLORS = ["#35508E", "#5B79C2", "#2A3F73", "#6B7FB8"];

export function DashboardClient({ initialSettings }: { initialSettings: Settings & { updatedAt?: string | null } }) {
  const t = useT();
  const [records, setRecords] = useState<Assessment[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Assessment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const tid = setTimeout(async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      if (query.trim()) params.set("q", query.trim());
      try {
        const res = await fetch(`/api/assessments?${params}`);
        if (!res.ok) throw new Error("load");
        const data = await res.json();
        if (active) setRecords(data);
      } catch {
        if (active) setRecords([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(tid);
    };
  }, [filter, query, reloadKey]);

  const handleDelete = async (r: Assessment) => {
    if (!window.confirm(t("staff.actions.delete_confirm"))) return;
    setDeletingId(r._id);
    try {
      const res = await fetch(`/api/assessments/${r._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setRecords((rs) => rs.filter((x) => x._id !== r._id));
    } catch {
      alert(t("staff.actions.delete_failed"));
    } finally {
      setDeletingId(null);
    }
  };

  const counts = useMemo(() => {
    const c = { all: records.length, New: 0, "In Review": 0, Quoted: 0 } as Record<string, number>;
    records.forEach((r) => (c[r.status] = (c[r.status] ?? 0) + 1));
    return c;
  }, [records]);

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  return (
    <>
      <Header screen="dash" staffHref="/" staffLabelKey="header.customer_view" staffIcon="person" />
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-[22px] pt-[30px] pb-16 anim-fadeUp">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-[22px]">
          <div>
            <div className="font-mono font-medium text-[12px] tracking-[2px] text-[color:var(--brand-amber)] uppercase">
              {t("staff.dash.internal")}
            </div>
            <h1 className="font-display font-bold text-[31px] tracking-[-.7px] mt-2 text-[color:var(--ink)]">
              {t("staff.dash.title")}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center gap-2 bg-white border-[1.5px] border-[color:var(--border-strong)] text-[color:var(--ink-soft)] rounded-[12px] px-[14px] py-[9px] font-semibold text-[13.5px] cursor-pointer hover:bg-[#EEF2FB]"
            >
              <Icon name="logout" size={18} />
              {t("staff.dash.signout")}
            </button>
          </div>
        </div>

        <SettingsPanel initial={initialSettings} />

        <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))] mb-5">
          <StatCard label={t("staff.dash.total")} value={counts.all} color="#35508E" />
          <StatCard label={t("staff.status.new")} value={counts.New} color="#35508E" />
          <StatCard label={t("staff.dash.in_review_stat")} value={counts["In Review"]} color="#F4B12A" />
          <StatCard label={t("staff.status.quoted")} value={counts.Quoted} color="#1FA855" />
        </div>

        <div className="flex items-center gap-3 flex-wrap mb-4">
          <div className="flex gap-[6px] bg-white border border-[color:var(--border)] rounded-[13px] p-[5px] shadow-[0_4px_14px_rgba(40,60,110,.05)]">
            {FILTERS.map((f) => {
              const on = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`border-0 rounded-[9px] px-[14px] py-2 font-semibold text-[13px] cursor-pointer transition-colors ${on ? "bg-[color:var(--brand-navy)] text-white" : "bg-transparent text-[color:var(--ink-faint)]"}`}
                >
                  {t(f.labelKey)}
                </button>
              );
            })}
          </div>
          <div className="flex-1" />
          <div className="relative min-w-[220px] basis-[280px]">
            <span className="material-symbols absolute left-[13px] top-1/2 -translate-y-1/2 text-[color:var(--ink-ghost)]" style={{ fontSize: 20 }}>
              search
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("staff.dash.search_ph")}
              className="w-full pl-[42px] pr-[14px] py-[11px] border border-[color:var(--border-strong)] rounded-[13px] text-[14px] bg-white focus:border-[color:var(--brand-navy)] focus:shadow-[0_0_0_4px_rgba(53,80,142,.10)] outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-[11px]">
          {records.map((r, i) => (
            <RecordRow
              key={r._id}
              r={r}
              index={i}
              fmtDate={fmtDate}
              t={t}
              onEdit={() => setEditing(r)}
              onDelete={() => handleDelete(r)}
              deleting={deletingId === r._id}
            />
          ))}
          {!loading && records.length === 0 && (
            <div className="text-center p-12 text-[color:var(--ink-ghost)] font-semibold">{t("staff.dash.empty")}</div>
          )}
        </div>
      </main>

      {editing && (
        <EditAssessmentModal
          record={toEditable(editing)}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setReloadKey((k) => k + 1);
          }}
        />
      )}
    </>
  );
}

function toEditable(r: Assessment): EditableAssessment {
  return {
    _id: r._id,
    projectType: r.projectType,
    customTypeLabel: r.customTypeLabel,
    projectName: r.projectName,
    name: r.name,
    dialCode: r.dialCode,
    phone: r.phone,
    whatsappDial: r.whatsappDial,
    whatsapp: r.whatsapp,
    email: r.email,
    country: r.country,
    city: r.city,
    address: r.address,
    status: r.status,
  };
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-[color:var(--border)] rounded-[18px] p-[18px_20px] shadow-[0_6px_20px_rgba(40,60,110,.06)]">
      <div className="flex items-center gap-[9px]">
        <div className="w-[10px] h-[10px] rounded-full" style={{ background: color }} />
        <span className="text-[13px] text-[color:var(--ink-faint)] font-semibold">{label}</span>
      </div>
      <div className="font-display font-extrabold text-[30px] text-[color:var(--ink)] mt-2 tracking-[-.5px]">{value}</div>
    </div>
  );
}

function RecordRow({
  r,
  index,
  fmtDate,
  t,
  onEdit,
  onDelete,
  deleting,
}: {
  r: Assessment;
  index: number;
  fmtDate: (s: string) => string;
  t: (k: DictKey, vars?: Record<string, string | number>) => string;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const initials = r.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const typeLabel = r.projectType && r.projectType !== "other" ? t(`type.${r.projectType}.label` as DictKey) : r.type;
  const statusCls =
    r.status === "New"
      ? "bg-[#EEF2FB] text-[color:var(--brand-navy)]"
      : r.status === "In Review"
      ? "bg-[#FEF4DD] text-[color:var(--warning)]"
      : "bg-[#EAF6EF] text-[color:var(--success)]";
  return (
    <Link
      href={`/staff/${r.ref}`}
      className="flex items-center gap-4 bg-white border border-[color:var(--border)] rounded-[16px] px-[18px] py-[15px] shadow-[0_5px_16px_rgba(40,60,110,.05)] flex-wrap transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(40,60,110,.12)] no-underline"
    >
      <div
        className="w-[44px] h-[44px] rounded-[13px] shrink-0 flex items-center justify-center font-display font-bold text-[15px] text-white"
        style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
      >
        {initials}
      </div>
      <div className="flex-1 basis-[180px] min-w-[140px]">
        <div className="font-display font-bold text-[15.5px] text-[color:var(--ink)]">
          {r.name}
          {r.projectName && <span className="text-[color:var(--ink-faint)] font-normal text-[13px]"> · {r.projectName}</span>}
        </div>
        <div className="text-[13px] text-[color:var(--ink-faint)] flex items-center gap-[5px] mt-[2px]">
          <Icon name="public" size={15} className="text-[color:var(--ink-ghost)]" />
          {r.country}
          <span className="font-mono text-[11.5px] text-[color:var(--ink-ghost)] ml-2">{r.ref}</span>
        </div>
      </div>
      <div className="inline-flex items-center gap-[6px] bg-[#EEF2FB] text-[color:var(--brand-navy)] px-3 py-[6px] rounded-[9px] font-display font-semibold text-[12.5px]">
        <Icon name={r.typeIcon} size={16} />
        {typeLabel}
      </div>
      {r.systemType && (
        <div className="inline-flex items-center gap-[6px] bg-[#FFF7E6] text-[#B47B12] px-3 py-[6px] rounded-[9px] font-display font-semibold text-[12px]">
          <Icon name="bolt" size={14} />
          {t(`site.systype.${r.systemType}.label` as DictKey)}
        </div>
      )}
      {r.goal && (
        <div className="inline-flex items-center gap-[6px] bg-[#F2FAF5] text-[color:var(--success)] px-3 py-[6px] rounded-[9px] font-display font-semibold text-[12px]">
          <Icon name="flag" size={14} />
          {t(`site.goal.${r.goal}.label` as DictKey)}
        </div>
      )}
      <div className="text-right min-w-[84px]">
        <div className="font-display font-bold text-[15px] text-[color:var(--ink)]">{r.size}</div>
        <div className="text-[11.5px] text-[color:var(--ink-ghost)]">{r.daily} {t("results.unit.kwh_day")}</div>
      </div>
      <div className="text-right min-w-[78px] text-[12.5px] text-[color:var(--ink-faint)] font-semibold">{fmtDate(r.createdAt)}</div>
      <div className={`min-w-[80px] text-center px-3 py-[7px] rounded-[9px] font-display font-bold text-[12px] ${statusCls}`}>{t(STATUS_KEY[r.status])}</div>
      <div className="flex items-center gap-1 ml-1">
        <button
          onClick={(e) => { stop(e); onEdit(); }}
          aria-label={t("staff.actions.edit")}
          title={t("staff.actions.edit")}
          className="material-symbols w-[32px] h-[32px] rounded-[9px] flex items-center justify-center bg-[#EEF2FB] text-[color:var(--brand-navy)] border-0 cursor-pointer hover:bg-[#DDE5F4]"
          style={{ fontSize: 18 }}
        >
          edit
        </button>
        <button
          onClick={(e) => { stop(e); onDelete(); }}
          disabled={deleting}
          aria-label={t("staff.actions.delete")}
          title={t("staff.actions.delete")}
          className="material-symbols w-[32px] h-[32px] rounded-[9px] flex items-center justify-center bg-[#FDECEC] text-[color:var(--danger)] border-0 cursor-pointer hover:bg-[#F8D7D7] disabled:opacity-50"
          style={{ fontSize: 18 }}
        >
          {deleting ? "hourglass_top" : "delete"}
        </button>
      </div>
    </Link>
  );
}
