import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { foods } from "@/data/foods";
import type { Category } from "@/types";
import { iconByName } from "@/lib/icons";
import { motionPresets } from "@/lib/motion";
import { toArabicDigits } from "@/lib/arabic";
import { SmartImage } from "@/components/ui/SmartImage";
import { STATUS_META } from "@/lib/status";

export function CategoryCard({ category }: { category: Category }) {
  const Icon = iconByName(category.icon);
  const items = foods.filter((f) => f.categoryId === category.id);
  const counts = items.reduce<Record<string, number>>((acc, f) => {
    acc[f.status] = (acc[f.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <motion.div variants={motionPresets.fadeUp} className="h-full">
      <Link
        to={`/foods?category=${category.id}`}
        className="brut brut-hover group relative flex h-full min-h-[200px] flex-col justify-end overflow-hidden bg-surface"
      >
        <SmartImage
          src={category.image}
          alt=""
          className="absolute inset-0 h-full w-full opacity-40 transition duration-500 group-hover:scale-105 group-hover:opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-transparent" aria-hidden />
        <div className="relative p-4">
          <div className="mb-3 flex size-10 items-center justify-center border-2 border-line bg-bg text-accent">
            <Icon className="size-5" aria-hidden />
          </div>
          <h3 className="text-lg font-bold leading-tight">{category.name}</h3>
          <p className="mono mt-1 text-[11px] text-muted">{toArabicDigits(items.length)} صنفًا</p>
          <div className="mt-2 flex gap-1" aria-label="توزيع الحالات">
            {Object.entries(counts).map(([status, n]) => (
              <span
                key={status}
                title={`${STATUS_META[status as keyof typeof STATUS_META].short}: ${n}`}
                className={`h-1.5 ${STATUS_META[status as keyof typeof STATUS_META].twBg}`}
                style={{ width: `${(n / items.length) * 100}%` }}
              />
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
