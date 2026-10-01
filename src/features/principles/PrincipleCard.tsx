import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Principle } from "@/types";
import { iconByName } from "@/lib/icons";
import { motionPresets } from "@/lib/motion";
import { pad2 } from "@/lib/arabic";
import { EvidenceLabel, SourceRefs } from "@/features/sources/SourceReference";
import { cn } from "@/utils/cn";

export function PrincipleCard({ principle, defaultOpen = false }: { principle: Principle; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = iconByName(principle.icon);
  const panelId = `principle-${principle.id}`;

  return (
    <motion.article variants={motionPresets.fadeUp} className={cn("brut flex h-full flex-col bg-surface", open && "bg-surface-2")}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex flex-1 flex-col p-5 text-start"
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="mono text-3xl font-semibold text-accent">{pad2(principle.number)}</span>
          <span className="flex size-11 items-center justify-center border-2 border-line bg-bg">
            <Icon className="size-5" aria-hidden />
          </span>
        </div>
        <h3 className="text-lg font-bold leading-snug md:text-xl">{principle.title}</h3>
        <p className="mt-2 text-sm text-ink-2">{principle.summary}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
          {open ? "إخفاء الشرح" : "الشرح الكامل"}
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t-2 border-line px-5 py-4 text-sm leading-relaxed text-ink-2">
              <p>{principle.details}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {principle.evidence && <EvidenceLabel level={principle.evidence} />}
                <SourceRefs ids={principle.sourceIds} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
