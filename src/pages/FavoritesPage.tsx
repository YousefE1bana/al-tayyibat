import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import { foodsById } from "@/data/foods";
import { recipes } from "@/data/recipes";
import { useFavorites } from "@/hooks/useCollections";
import { usePageMeta } from "@/hooks/usePageMeta";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FoodCard } from "@/features/foods/FoodCard";
import { RecipeCard } from "@/features/recipes/RecipeCard";

export default function FavoritesPage() {
  usePageMeta("المحفوظات", "الأطعمة والوصفات التي حفظتها — محليًا على جهازك.");
  const { favorites, count } = useFavorites();
  const foods = favorites.food.map((id) => foodsById[id]).filter(Boolean);
  const savedRecipes = recipes.filter((r) => favorites.recipe.includes(r.id));

  return (
    <div className="container-x py-10 md:py-16">
      <header className="max-w-3xl">
        <div className="mono mb-3 text-xs text-accent">// المحفوظات</div>
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">المحفوظات</h1>
        <p className="mt-4 text-lg text-ink-2">أطعمتك ووصفاتك في مكان واحد. تبقى محفوظة على هذا الجهاز، بدون حساب.</p>
      </header>

      {count === 0 ? (
        <EmptyState
          icon={Bookmark}
          className="mt-10"
          title="لسه مفيش حاجة محفوظة هنا."
          description="اضغط أيقونة الحفظ على أي طعام أو وصفة لتجدها هنا."
          action={<><LinkButton to="/foods" variant="secondary">دليل الأطعمة</LinkButton><LinkButton to="/recipes" variant="secondary">الوصفات</LinkButton></>}
        />
      ) : (
        <div className="mt-10 space-y-16">
          {foods.length > 0 && (
            <section>
              <h2 className="mb-6 text-2xl font-bold"><span className="mono me-2 text-xs text-accent">// الأطعمة</span></h2>
              <motion.div  className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {foods.map((f) => <FoodCard key={f.id} food={f} />)}
              </motion.div>
            </section>
          )}
          {savedRecipes.length > 0 && (
            <section>
              <h2 className="mb-6 text-2xl font-bold"><span className="mono me-2 text-xs text-accent">// الوصفات</span></h2>
              <motion.div  className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {savedRecipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
              </motion.div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
