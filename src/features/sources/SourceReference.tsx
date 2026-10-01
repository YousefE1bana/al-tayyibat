import { ExternalLink, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { sourcesById } from "@/data/sources";
import type { EvidenceLevel, Source } from "@/types";
import { EVIDENCE_LABEL, SOURCE_TYPE_LABEL } from "@/lib/status";
import { cn } from "@/utils/cn";

export function SourceCard({ source, compact = false }: { source: Source; compact?: boolean }) {
  return (
    <article className={cn("brut-soft bg-surface", compact ? "p-3" : "p-5")} id={`source-${source.id}`}>
      <div className="mono mb-2 flex flex-wrap items-center gap-2 text-[11px]">
        <span className="border border-line px-1.5 py-0.5 text-muted">{SOURCE_TYPE_LABEL[source.type]}</span>
        {source.date && <span className="text-muted">{source.date}</span>}
      </div>
      <h4 className={cn("font-bold leading-snug", compact ? "text-sm" : "text-base")}>{source.title}</h4>
      {(source.author || source.publication) && (
        <p className="mt-1 text-sm text-ink-2">{[source.author, source.publication].filter(Boolean).join(" — ")}</p>
      )}
      {!compact && source.reliabilityNote && (
        <p className="mt-3 flex gap-2 border-t-2 border-line-soft pt-3 text-sm text-muted">
          <Info className="mt-1 size-4 shrink-0" aria-hidden />
          <span>{source.reliabilityNote}</span>
        </p>
      )}
      {source.url && (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mono mt-3 inline-flex items-center gap-1.5 text-xs text-accent underline-offset-4 hover:underline"
        >
          فتح المصدر <ExternalLink className="size-3" aria-hidden />
        </a>
      )}
    </article>
  );
}

/** Inline list of source chips that link to the Sources page. */
export function SourceRefs({ ids, className }: { ids?: string[]; className?: string }) {
  if (!ids?.length) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <span className="mono text-[11px] text-muted">المصادر:</span>
      {ids.map((id) => {
        const s = sourcesById[id];
        if (!s) return null;
        return (
          <Link
            key={id}
            to={`/sources#source-${id}`}
            title={s.title}
            className="mono border border-line-soft bg-surface px-1.5 py-0.5 text-[11px] text-ink-2 transition hover:border-line hover:text-ink"
          >
            {s.publication?.split(" — ")[0] ?? s.title}
          </Link>
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
