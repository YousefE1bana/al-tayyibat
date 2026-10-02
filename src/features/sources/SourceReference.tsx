import { sourcesById } from "@/data/sources";
import type { EvidenceLevel } from "@/types";
import { EVIDENCE_LABEL } from "@/lib/status";
import { cn } from "@/utils/cn";

/** Attribution stays beside claims; links open original references directly. */
export function SourceRefs({ ids, className }: { ids?: string[]; className?: string }) {
  if (!ids?.length) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <span className="mono text-[11px] text-muted">المصادر:</span>
      {ids.map((id) => {
        const s = sourcesById[id];
        if (!s) return null;
        const label = s.publication?.split(" — ")[0] ?? s.title;
        const title = [s.title, s.reliabilityNote].filter(Boolean).join(" — ");
        const chipClass = "mono border border-line-soft bg-surface px-1.5 py-0.5 text-[11px] text-ink-2";
        return s.url ? (
          <a key={id} href={s.url} target="_blank" rel="noopener noreferrer"
            title={title} className={cn(chipClass, "transition hover:border-line hover:text-ink hover:underline")}>
            {label}
          </a>
        ) : (
          <span key={id} title={title} className={chipClass}>{label}</span>
        );
      })}
    </div>
  );
}

const EVIDENCE_CLASS: Record<EvidenceLevel, string> = {
  strong: "border-status-ok text-status-ok",
  moderate: "border-accent-2 text-accent-2",
  limited: "border-status-cond text-status-cond",
  claim: "border-accent-3 text-accent-3",
  institutional: "border-ink text-ink",
  unverified: "border-status-unknown text-status-unknown",
};

export function EvidenceLabel({ level, className }: { level: EvidenceLevel; className?: string }) {
  const meta = EVIDENCE_LABEL[level];
  return (
    <span
      title={meta.hint}
      className={cn("mono inline-flex items-center gap-1 border-2 bg-surface px-2 py-0.5 text-[11px] font-semibold", EVIDENCE_CLASS[level], className)}
    >
      ◆ {meta.label}
    </span>
  );
}
