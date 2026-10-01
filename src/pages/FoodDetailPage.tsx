import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { categoriesById } from "@/data/categories";
import { foods, foodsBySlug } from "@/data/foods";
import { useRecentFoods } from "@/hooks/useCollections";
import { usePageMeta } from "@/hooks/usePageMeta";
import { FoodCard } from "@/features/foods/FoodCard";
import { FoodDetails } from "@/features/foods/FoodDetails";

export default function FoodDetailPage() {
  const { slug = "" } = useParams();
  const food = foodsBySlug[slug];
  const { push } = useRecentFoods();
  usePageMeta(food?.name, food?.shortDescription);

  useEffect(() => {
    if (food) push(food.id);
  }, [food, push]);

  if (!food) return <Navigate to="/404" replace />;

  const category = categoriesById[food.categoryId];
  const siblings = foods.filter((f) => f.categoryId === food.categoryId && f.id !== food.id).slice(0, 4);

  return (
    <article className="container-x py-10 md:py-16">
      <nav className="mono mb-6 flex flex-wrap items-center gap-2 text-xs text-muted" aria-label="مسار التنقل">
        <Link to="/foods" className="inline-flex items-center gap-1 hover:text-ink"><ArrowRight className="size-3" /> دليل الأطعمة</Link>
        <span>/</span>
        <Link to={`/foods?category=${food.categoryId}`} className="hover:text-ink">{category?.name}</Link>
        <span>/</span>
        <span className="text-ink">{food.name}</span>
      </nav>

      <FoodDetails food={food} full />

      {siblings.length > 0 && (
        <section className="mt-16 border-t-2 border-line pt-10">
          <h2 className="mb-6 text-2xl font-bold">
            <span className="mono me-2 text-xs text-accent">// نفس الفئة</span> {category?.name}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {siblings.map((f) => <FoodCard key={f.id} food={f} compact />)}
          </div>
        </section>
      )}
    </article>
  );
}
