import { Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { useFavorites, type FavoriteKind } from "@/hooks/useCollections";
import { cn } from "@/utils/cn";

interface Props {
  kind: FavoriteKind;
  id: string;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

export function FavoriteButton({ kind, id, label, className, size = "md" }: Props) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(kind, id);
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(kind, id);
      }}
      aria-pressed={active}
      aria-label={active ? `إزالة ${label ?? ""} من المحفوظات` : `حفظ ${label ?? ""}`}
      className={cn(
        "inline-flex items-center justify-center gap-2 border-2 border-line transition-colors",
        size === "sm" ? "size-9" : "h-11 px-4",
        active ? "bg-accent text-accent-ink" : "bg-surface text-ink hover:bg-surface-2",
        className,
      )}
    >
      <motion.span animate={active ? { scale: [1, 1.35, 1], rotate: [0, -8, 0] } : { scale: 1 }} transition={{ duration: 0.35 }}>
        <Bookmark className="size-4" fill={active ? "currentColor" : "none"} strokeWidth={2.5} aria-hidden />
      </motion.span>
      {size === "md" && <span className="text-sm font-semibold">{active ? "محفوظ" : "حفظ"}</span>}
    </motion.button>
  );
}
