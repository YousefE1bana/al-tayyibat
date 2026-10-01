import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";
import { useMemo, useState } from "react";
import { recipes } from "@/data/recipes";
import { useFavorites } from "@/hooks/useCollections";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motionPresets } from "@/lib/motion";
import { EmptyState } from "@/components/ui/EmptyState";
import { RecipeCard } from "@/features/recipes/RecipeCard";
import { cn } from "@/utils/cn";

const MEALS = ["الكل", "فطور", "غداء", "عشاء", "خفيف"] as const;

export default function RecipesPage() {
  usePageMeta("وصفات الطيبات", "وجبات نموذج اليوم الكامل في نظام الطيبات — مكونات وخطوات ومصادر.");
  const [meal, setMeal] = useState<(typeof MEALS)[number]>("الكل");
  const [favOnly, setFavOnly] = useState(false);
  const { favorites } = useFavorites();

  const list = useMemo(
    () => recipes.filter((r) => (meal === "الكل" || r.meal === meal) && (!favOnly || favorites.recipe.includes(r.id))),
    [meal, favOnly, favorites.recipe],
  );

  return (
    <div className="container-x py-10 md:py-16">
      <header className="max-w-3xl">
        <div className="mono mb-3 text-xs text-accent">// الوصفات</div>
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">وصفات الطيبات</h1>
        <p className="mt-4 text-lg text-ink-2">
          الوجبات الواردة في «نموذج يوم كامل» بالدليل فقط. المصدر يذكر المكونات؛ خطوات التحضير اقتراح تحريري بسيط موسوم بذلك.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        {MEALS.map((m) => (
          <button key={m} type="button" onClick={() => setMeal(m)} aria-pressed={meal === m} className={cn("border-2 px-3 py-1.5 text-sm font-semibold transition", meal === m ? "border-line bg-accent text-accent-ink" : "border-line-soft hover:border-line")}>
            {m}
          </button>
        ))}
        <button type="button" onClick={() => setFavOnly((v) => !v)} aria-pressed={favOnly} className={cn("ms-auto border-2 px-3 py-1.5 text-sm font-semibold transition", favOnly ? "border-line bg-accent text-accent-ink" : "border-line-soft hover:border-line")}>
          المحفوظات فقط
        </button>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={ChefHat} className="mt-8" title="لسه مفيش وصفات هنا." description="غيّر الفلتر أو احفظ وصفة أولًا." />
      ) : (
        <motion.div variants={motionPresets.staggerContainer} initial="hidden" animate="show" className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </motion.div>
      )}
    </div>
  );
}
