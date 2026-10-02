import { motion } from "framer-motion";
import { ArrowUpLeft, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { categoriesById } from "@/data/categories";
import type { Food } from "@/types";
import { motionPresets } from "@/lib/motion";
import { SmartImage } from "@/components/ui/SmartImage";
import { FavoriteButton } from "@/features/favorites/FavoriteButton";
import { FoodStatusBadge } from "./FoodStatusBadge";
import { cn } from "@/utils/cn";

interface Props {
  food: Food;
  onSelect?: (food: Food) => void;
  compact?: boolean;
}

export function FoodCard({ food, onSelect, compact = false }: Props) {
  const category = categoriesById[food.categoryId];

  const body = (
    <>
      <div className={cn("relative", compact ? "aspect-[16/9]" : "aspect-[4/3]")}>
        <SmartImage src={food.image} alt={food.name} fallbackLabel={category?.name} className="h-full w-full" imgClassName="food-image" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <FoodStatusBadge status={food.status} size="sm" />
          {food.essential && <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted"><Star className="size-3 text-accent" aria-hidden /> أساسي</span>}
        </div>
        <div className="mono flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] text-muted">
          <span className="shrink-0">{category?.name ?? "—"}</span>
        </div>
        <h3 className="text-lg font-bold leading-snug">{food.name}</h3>
        {!compact && <p className="line-clamp-2 text-sm text-ink-2">{food.shortDescription}</p>}
        {food.editorialNote && <p className="text-xs text-muted">توثيق التفاصيل قيد المراجعة</p>}
        {food.aliases.length > 0 && !compact && (
          <p className="mono line-clamp-1 text-[11px] text-muted">{food.aliases.slice(0, 4).join(" · ")}</p>
        )}
        <span className="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-semibold text-accent">
          التفاصيل <ArrowUpLeft className="size-4" aria-hidden />
        </span>
      </div>
    </>
  );

  const clickable = "flex h-full w-full flex-col overflow-hidden text-start focus-visible:outline-offset-[-4px]";

  return (
    <motion.div variants={motionPresets.fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.08 }} className="brut brut-hover group relative h-full bg-surface">
      {onSelect ? (
        <button type="button" onClick={() => onSelect(food)} className={clickable} aria-label={`${food.name} — التفاصيل`}>
          {body}
        </button>
      ) : (
        <Link to={`/foods/${food.slug}`} className={clickable}>
          {body}
        </Link>
      )}
      {/* Sibling, not nested: keeps DOM valid and the favorite button independently focusable. */}
      <div className="absolute end-2 top-2">
        <FavoriteButton kind="food" id={food.id} label={food.name} size="sm" />
      </div>
    </motion.div>
  );
}
