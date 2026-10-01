import { ArrowDownAZ, Bookmark, History, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { categories, categoriesById } from "@/data/categories";
import { foods, foodsById } from "@/data/foods";
import type { Food, FoodStatus } from "@/types";
import { useFavorites, useRecentFoods } from "@/hooks/useCollections";
import { usePageMeta } from "@/hooks/usePageMeta";
import { normalizeArabic, toArabicDigits } from "@/lib/arabic";
import { searchFoods } from "@/lib/search";
import { STATUS_META, STATUS_ORDER } from "@/lib/status";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { FoodCard } from "@/features/foods/FoodCard";
import { FoodDetails } from "@/features/foods/FoodDetails";
import { FoodStatusBadge } from "@/features/foods/FoodStatusBadge";
import { cn } from "@/utils/cn";

const STATUS_SET = new Set<string>(STATUS_ORDER);
const ESSENTIALS_QUERY = "الأساسيات";

function FilterChips({
  status,
  category,
  favoritesOnly,
  sort,
  onChange,
}: {
  status: string;
  category: string;
  favoritesOnly: boolean;
  sort: string;
  onChange: (patch: Record<string, string | null>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="mono mb-2 text-xs text-accent">// الحالة</div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onChange({ status: null })} className={cn("border-2 px-3 py-1.5 text-sm font-semibold transition", !status ? "border-line bg-ink text-bg" : "border-line-soft hover:border-line")}>الكل</button>
          {STATUS_ORDER.map((s) => (
            <button key={s} type="button" onClick={() => onChange({ status: s === status ? null : s })} aria-pressed={status === s} className={cn("transition", status === s ? "ring-4 ring-accent/40" : "hover:ring-2 hover:ring-line-soft")}>
              <FoodStatusBadge status={s} size="sm" variant={status === s ? "solid" : "outline"} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="mono mb-2 text-xs text-accent">// التصنيف</div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onChange({ category: null })} className={cn("border-2 px-3 py-1.5 text-sm font-semibold transition", !category ? "border-line bg-ink text-bg" : "border-line-soft hover:border-line")}>الكل</button>
          {categories.map((c) => (
            <button key={c.id} type="button" onClick={() => onChange({ category: c.id === category ? null : c.id })} aria-pressed={category === c.id} className={cn("border-2 px-3 py-1.5 text-sm font-semibold transition", category === c.id ? "border-line bg-accent text-accent-ink" : "border-line-soft hover:border-line")}>
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onChange({ sort: sort === "alpha" ? null : "alpha" })} aria-pressed={sort === "alpha"} className={cn("inline-flex items-center gap-1.5 border-2 px-3 py-1.5 text-sm font-semibold transition", sort === "alpha" ? "border-line bg-accent text-accent-ink" : "border-line-soft hover:border-line")}>
          <ArrowDownAZ className="size-4" /> أبجديًا
        </button>
        <button type="button" onClick={() => onChange({ fav: favoritesOnly ? null : "1" })} aria-pressed={favoritesOnly} className={cn("inline-flex items-center gap-1.5 border-2 px-3 py-1.5 text-sm font-semibold transition", favoritesOnly ? "border-line bg-accent text-accent-ink" : "border-line-soft hover:border-line")}>
          <Bookmark className="size-4" /> المحفوظات فقط
        </button>
      </div>
    </div>
  );
}

export default function FoodsPage() {
  usePageMeta("دليل الأطعمة", "ابحث في كل الأطعمة الموثقة في نظام الطيبات وصفِّها حسب الحالة والتصنيف.");
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const status = params.get("status") ?? "";
  const category = params.get("category") ?? "";
  const sort = params.get("sort") ?? "";
  const favoritesOnly = params.get("fav") === "1";

  const [input, setInput] = useState(q);
  const deferred = useDeferredValue(input);
  const [selected, setSelected] = useState<Food | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { favorites } = useFavorites();
  const { recent, push, clear } = useRecentFoods();

  useEffect(() => setInput(q), [q]);

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params);
      Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (deferred !== q) update({ q: deferred || null });
    }, 200);
    return () => window.clearTimeout(t);
  }, [deferred, q, update]);

  const results = useMemo(() => {
    let list: Food[];
    const nq = normalizeArabic(deferred);
    if (nq && normalizeArabic(ESSENTIALS_QUERY).includes(nq)) list = foods.filter((f) => f.essential);
    else if (nq) list = searchFoods(deferred, 60).map((m) => m.food);
    else list = [...foods];

    if (status && STATUS_SET.has(status)) list = list.filter((f) => f.status === status);
    if (category) list = list.filter((f) => f.categoryId === category);
    if (favoritesOnly) list = list.filter((f) => favorites.food.includes(f.id));
    if (sort === "alpha") list.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    else if (!nq) list.sort((a, b) => Number(Boolean(b.essential)) - Number(Boolean(a.essential)));
    return list;
  }, [deferred, status, category, favoritesOnly, sort, favorites.food]);

  const activeCount = [status, category, favoritesOnly ? "1" : "", sort].filter(Boolean).length;

  const open = (f: Food) => {
    setSelected(f);
    push(f.id);
  };

  return (
    <div className="container-x py-10 md:py-16">
      <header className="max-w-3xl">
        <div className="mono mb-3 text-xs text-accent">// دليل الأطعمة</div>
        <h1 className="text-4xl font-bold md:text-6xl">بتدور على إيه؟</h1>
        <p className="mt-3 text-ink-2">
          {toArabicDigits(foods.length)} صنفًا موثقًا من المصادر. البحث يفهم التهجئات المختلفة والهمزات والتاء المربوطة.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="جرب: الأرز، البطاطس، البيض، اللبن..."
            aria-label="ابحث عن طعام"
            className="brut h-14 w-full bg-surface pe-12 ps-12 text-lg font-semibold placeholder:text-muted focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50 [&::-webkit-search-cancel-button]:hidden"
          />
          {input && (
            <button
              type="button"
              onClick={() => setInput("")}
              aria-label="مسح"
              className="absolute end-3 top-1/2 -translate-y-1/2 border border-line-soft p-1.5 text-muted hover:border-line hover:text-ink transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <Button variant="secondary" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
          <SlidersHorizontal className="size-4" /> الفلاتر {activeCount > 0 && <span className="mono">({toArabicDigits(activeCount)})</span>}
        </Button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-6">
            <div className="brut-soft bg-surface p-4">
              <FilterChips status={status} category={category} favoritesOnly={favoritesOnly} sort={sort} onChange={update} />
              {activeCount > 0 && (
                <button type="button" onClick={() => update({ status: null, category: null, fav: null, sort: null })} className="mono mt-4 text-xs text-accent hover:underline">
                  مسح الفلاتر ✕
                </button>
              )}
            </div>

            {recent.length > 0 && (
              <div className="brut-soft bg-surface p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="mono flex items-center gap-1 text-xs text-accent"><History className="size-3" /> شوفت مؤخرًا</div>
                  <button type="button" onClick={clear} className="mono inline-flex items-center gap-1 text-[11px] text-muted hover:text-ink" aria-label="مسح السجل">
                    <Trash2 className="size-3" /> مسح
                  </button>
                </div>
                <ul className="space-y-1">
                  {recent.map((id) => {
                    const f = foodsById[id];
                    return f ? (
                      <li key={id}>
                        <button type="button" onClick={() => open(f)} className="flex w-full items-center gap-2 py-1 text-start text-sm hover:text-accent">
                          <span className={STATUS_META[f.status].twText}>{STATUS_META[f.status].symbol}</span> {f.name}
                        </button>
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mono mb-4 flex flex-wrap items-center gap-3 text-xs text-muted">
            <span>{toArabicDigits(results.length)} نتيجة</span>
            {category && <span className="border border-line-soft px-2 py-0.5">{categoriesById[category]?.name}</span>}
            {status && <span className="border border-line-soft px-2 py-0.5">{STATUS_META[status as FoodStatus]?.label}</span>}
            {deferred && <span className="border border-line-soft px-2 py-0.5">«{deferred}»</span>}
          </div>

          {results.length === 0 ? (
            deferred ? (
              <EmptyState
                icon={Search}
                code="NOT_FOUND"
                title="لم نجد هذا الطعام في قاعدة بيانات الدليل حتى الآن."
                description="غير موجود ≠ ممنوع. لا نستنتج المنع أو السماح من عندنا. جرّب تهجئة أخرى، أو تصفح الفئة الأقرب."
                action={
                  <>
                    {categories.slice(0, 4).map((c) => (
                      <Link key={c.id} to={`/foods?category=${c.id}`} className="border-2 border-line bg-surface px-3 py-1.5 text-sm font-semibold hover:bg-accent hover:text-accent-ink">
                        {c.name}
                      </Link>
                    ))}
                  </>
                }
              />
            ) : (
              <EmptyState icon={Bookmark} title="لسه مفيش حاجة هنا." description="غيّر الفلاتر أو احفظ بعض الأطعمة أولًا." />
            )
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {results.map((f) => (
                <FoodCard key={f.id} food={f} onSelect={open} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen} title="الفلاتر" description="صفِّ النتائج حسب الحالة والتصنيف">
        <div className="p-5">
          <FilterChips status={status} category={category} favoritesOnly={favoritesOnly} sort={sort} onChange={update} />
          <div className="mt-6 flex gap-3">
            <Button onClick={() => setFiltersOpen(false)} className="flex-1">عرض {toArabicDigits(results.length)} نتيجة</Button>
            <Button variant="secondary" onClick={() => update({ status: null, category: null, fav: null, sort: null })}>مسح</Button>
          </div>
        </div>
      </Sheet>

      <Sheet open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)} title={selected?.name ?? ""} description={selected ? categoriesById[selected.categoryId]?.name : undefined}>
        {selected && <FoodDetails food={selected} onNavigate={open} />}
      </Sheet>
    </div>
  );
}
