"use client";
import { Icon } from "../Icon";
import { useT } from "../LangProvider";

export function ChecklistActions() {
  const t = useT();
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 bg-[color:var(--brand-navy)] text-white border-0 rounded-[12px] px-[16px] py-[10px] font-semibold text-[14px] cursor-pointer shadow-[0_6px_16px_rgba(53,80,142,.22)] hover:brightness-110"
    >
      <Icon name="picture_as_pdf" size={18} />
      {t("staff.checklist.print")}
    </button>
  );
}
