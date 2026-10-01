import { motion } from "framer-motion";
import { Clock, Gauge, Info } from "lucide-react";
import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { foodsById } from "@/data/foods";
import type { Recipe } from "@/types";
import { motionPresets } from "@/lib/motion";
import { STATUS_META } from "@/lib/status";
import { SmartImage } from "@/components/ui/SmartImage";
import { FavoriteButton } from "@/features/favorites/FavoriteButton";
import { SourceRefs } from "@/features/sources/SourceReference";
import { cn } from "@/utils/cn";

export function RecipeCard({ recipe, expandable = true }: { recipe: Recipe; expandable?: boolean }) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  return (
    <motion.article variants={motionPresets.fadeUp} id={recipe.slug} className="brut flex h-full scroll-mt-28 flex-col overflow-hidden bg-surface">
      <div className="relative aspect-[16/10]">
        <SmartImage src={recipe.image} alt={recipe.name} fallbackLabel={recipe.meal} className="h-full w-full" />
        <span className="mono absolute start-2 top-2 border-2 border-line bg-bg px-2 py-0.5 text-[11px]">{recipe.meal}</span>
        <div className="absolute end-2 top-2">
          <FavoriteButton kind="recipe" id={recipe.id} label={recipe.name} size="sm" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold leading-snug">{recipe.name}</h3>
        <p className="mt-1 text-sm text-ink-2">{recipe.description}</p>
        <div className="mono mt-3 flex flex-wrap gap-3 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {recipe.prepTime}</span>
          <span className="inline-flex items-center gap-1"><Gauge className="size-3" /> {recipe.difficulty}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {recipe.foodIds.map((id) => {
            const f = foodsById[id];
            return f ? (
              <Link key={id} to={`/foods/${f.slug}`} className="border border-line-soft px-2 py-0.5 text-xs hover:border-line">
                <span className={STATUS_META[f.status].twText}>{STATUS_META[f.status].symbol}</span> {f.name}
              </Link>
            ) : null;
          })}
        </div>

        {expandable && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={detailsId}
            className="mt-4 min-h-11 self-start border-2 border-line bg-bg px-3 py-1.5 text-sm font-semibold hover:bg-accent hover:text-accent-ink"
          >
            {open ? "إخفاء المكونات والخطوات" : "المكونات والخطوات"}
          </button>
        )}

        <div id={detailsId} inert={!open} className={cn("grid gap-4 overflow-hidden transition-all", open ? "mt-4 max-h-[1200px]" : "max-h-0")}>
          <div>
            <h4 className="mono mb-1 text-xs text-accent">// المكونات</h4>
            <ul className="list-inside list-disc text-sm text-ink-2">
              {recipe.ingredients.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="mono mb-1 text-xs text-accent">// الخطوات</h4>
            <ol className="list-inside list-decimal space-y-1 text-sm text-ink-2">
              {recipe.instructions.map((s) => <li key={s}>{s}</li>)}
            </ol>
          </div>
          {recipe.instructionsNote && (
            <p className="flex gap-2 border border-line-soft p-2 text-xs text-muted">
              <Info className="mt-0.5 size-3.5 shrink-0" /> {recipe.instructionsNote}
            </p>
          )}
          <SourceRefs ids={recipe.sourceIds} />
        </div>
      </div>
    </motion.article>
  );
}
