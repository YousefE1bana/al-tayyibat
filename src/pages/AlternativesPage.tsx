import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Repeat, Search, Terminal } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { categoriesById } from "@/data/categories";
import { foodsById } from "@/data/foods";
import { FoodStatusBadge } from "@/features/foods/FoodStatusBadge";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motionPresets } from "@/lib/motion";
import { searchFoods } from "@/lib/search";
import { SmartImage } from "@/components/ui/SmartImage";
import { cn } from "@/utils/cn";

const POPULAR_REPLACEMENTS = [
  { label: "بديل الخبز الأبيض", foodId: "white-bread" },
  { label: "بديل فراخ المزارع", foodId: "chicken" },
  { label: "بديل الحليب السائل", foodId: "milk" },
  { label: "بديل البيض", foodId: "eggs" },
  { label: "بديل الزيوت النباتية", foodId: "hydrogenated-oils" },
  { label: "بديل المكرونة", foodId: "pasta" },
  { label: "بديل الشاي الأحمر", foodId: "black-tea" },
  { label: "بديل السكر والحلويات", foodId: "biscuits" },
  { label: "بديل المانجو", foodId: "mango" },
  { label: "بديل البقوليات", foodId: "legumes" },
];

export default function AlternativesPage() {
  usePageMeta("بدائل الأطعمة", "بدل ما آكل ده، آكل إيه؟ — دليل البدائل الموثقة داخل نظام الطيبات.");
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFoodId = searchParams.get("food") || "white-bread";

  const [selectedFoodId, setSelectedFoodId] = useState<string>(initialFoodId);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);

  const selectedFood = useMemo(() => foodsById[selectedFoodId] || null, [selectedFoodId]);

  // Search results for food selector
  const searchResults = useMemo(() => {
    if (!deferredQuery.trim()) return [];
    return searchFoods(deferredQuery, 6);
  }, [deferredQuery]);

  // Selected food's alternatives
  const alternativesList = useMemo(() => {
    if (!selectedFood || !selectedFood.alternatives) return [];
    return selectedFood.alternatives
      .map((altId) => foodsById[altId])
      .filter(Boolean);
  }, [selectedFood]);

  const selectFood = (id: string) => {
    setSelectedFoodId(id);
    setSearchQuery("");
    setSearchParams({ food: id }, { replace: true });
  };

  return (
    <div className="container-x py-10 md:py-16">
      <header className="max-w-3xl">
        <div className="mono mb-3 text-xs text-accent">// بدائل الطيبات</div>
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">
          بدل ما آكل ده، <span className="underline decoration-accent decoration-4">آكل إيه؟</span>
        </h1>
        <p className="mt-4 text-lg text-ink-2">
          لا تحرم نفسك بلا بديل. نظام الطيبات يوفّر بدائل حقيقية وموثقة لكل طعام غير مستحسن أو ممنوع، بدون أي
          تخمين أو بدائل عشوائية.
        </p>
      </header>

      {/* Main Interactive Tool */}
      <section className="mt-10 max-w-4xl" aria-label="أداة البحث عن البدائل">
        <div className="brut bg-surface">
          <div className="flex flex-wrap items-center gap-2 border-b-2 border-line bg-bg-2 px-4 py-2">
            <Terminal className="size-4 text-accent" aria-hidden />
            <span className="mono text-xs text-muted">tayyibat://alternatives-engine</span>
            <span className="mono ms-auto text-[11px] text-muted">
              {alternativesList.length} بدائل موثقة
            </span>
          </div>

          <div className="p-4 md:p-6">
            <label htmlFor="alt-search" className="mb-2 block text-sm font-bold text-ink">
              اختر أو ابحث عن الطعام الذي تريد استبداله:
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <input
                id="alt-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن طعام مثل: خبز، فراخ، لبن، بيض، شاي…"
                autoComplete="off"
                className="h-13 w-full border-2 border-line bg-bg pe-12 ps-4 text-base font-semibold placeholder:text-muted focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50"
              />

              {/* Autocomplete dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute inset-x-0 top-full z-20 mt-1 border-2 border-line bg-surface shadow-hard">
                  {searchResults.map((match) => (
                    <button
                      key={match.food.id}
                      type="button"
                      onClick={() => selectFood(match.food.id)}
                      className="flex w-full items-center justify-between border-b border-line-soft px-4 py-3 text-start transition last:border-b-0 hover:bg-bg-2"
                    >
                      <div>
                        <span className="font-bold text-ink">{match.food.name}</span>
                        <span className="mono ms-2 text-xs text-muted">
                          ({categoriesById[match.food.categoryId]?.name})
                        </span>
                      </div>
                      <FoodStatusBadge status={match.food.status} size="sm" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Popular quick-jump chips */}
            <div className="mt-4">
              <span className="mono text-xs text-muted">أشهر البدائل طلبًا:</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {POPULAR_REPLACEMENTS.map((item) => {
                  const isSelected = selectedFoodId === item.foodId;
                  return (
                    <button
                      key={item.foodId}
                      type="button"
                      onClick={() => selectFood(item.foodId)}
                      className={cn(
                        "mono text-xs font-semibold px-2.5 py-1.5 border transition cursor-pointer",
                        isSelected
                          ? "border-accent bg-accent text-accent-ink shadow-hard"
                          : "border-line-soft bg-bg hover:border-line hover:bg-surface-2 text-ink-2 hover:text-ink"
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results View */}
      {selectedFood && (
        <section className="mt-8 max-w-4xl space-y-6" aria-label="نتيجة البدائل">
          {/* Target Food Status Card */}
          <div className="brut bg-surface p-5 md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <div className="size-20 shrink-0 overflow-hidden border-2 border-line sm:size-24">
                  <SmartImage
                    src={selectedFood.image}
                    alt={selectedFood.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold text-ink">{selectedFood.name}</h2>
                    <FoodStatusBadge status={selectedFood.status} />
                  </div>
                  <p className="mt-2 text-sm text-ink-2">{selectedFood.shortDescription}</p>
                  {selectedFood.restrictions && selectedFood.restrictions.length > 0 && (
                    <p className="mt-1 text-xs text-danger">
                      <span className="font-bold">المحذور / التنبيه: </span>
                      {selectedFood.restrictions.join(" — ")}
                    </p>
                  )}
                </div>
              </div>

              <Link
                to={`/foods/${selectedFood.slug}`}
                className="inline-flex items-center gap-1 self-start border border-line-soft px-3 py-1.5 text-xs font-bold text-accent transition hover:border-accent hover:bg-accent/10"
              >
                <span>تفاصيل الصنف</span>
                <ArrowLeft className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* Alternatives Flow Header */}
          <div className="flex items-center gap-3">
            <Repeat className="size-5 text-accent" />
            <h3 className="text-xl font-bold text-ink">
              البدائل المعتمدة في النظام ({alternativesList.length})
            </h3>
          </div>

          {/* Alternatives Grid or Empty Notice */}
          {alternativesList.length > 0 ? (
            <motion.div
              variants={motionPresets.staggerContainer}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2 md:grid-cols-3"
            >
              {alternativesList.map((alt) => (
                <motion.div
                  key={alt.id}
                  variants={motionPresets.fadeUp}
                  className="brut flex flex-col justify-between bg-surface p-4 transition hover:-translate-y-1 hover:shadow-hard"
                >
                  <div>
                    <div className="relative mb-3 aspect-4/3 w-full overflow-hidden border-2 border-line">
                      <SmartImage
                        src={alt.image}
                        alt={alt.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-2 start-2">
                        <FoodStatusBadge status={alt.status} size="sm" />
                      </div>
                    </div>

                    <div className="mono mb-1 text-[11px] text-accent font-semibold">
                      // {categoriesById[alt.categoryId]?.name}
                    </div>

                    <h4 className="text-lg font-bold text-ink">{alt.name}</h4>
                    <p className="mt-2 text-xs leading-relaxed text-ink-2 line-clamp-3">
                      {alt.shortDescription}
                    </p>

                    {alt.usage && (
                      <div className="mt-3 border-t border-line-soft pt-2 text-[11px] text-muted">
                        <span className="font-bold text-ink-2">الاستخدام النموذجي: </span>
                        {alt.usage}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-line-soft flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs text-accent font-semibold">
                      <CheckCircle2 className="size-3.5" />
                      بديل موثق
                    </span>
                    <Link
                      to={`/foods/${alt.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-ink transition hover:text-accent"
                    >
                      <span>عرض</span>
                      <ArrowLeft className="size-3" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="brut bg-surface p-8 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center border-2 border-line bg-bg text-muted">
                <Repeat className="size-6" />
              </div>
              <h4 className="text-lg font-bold text-ink">
                لا توجد بدائل موثقة لهذا الطعام في الدليل حتى الآن.
              </h4>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-2">
                نظام الطيبات يلتزم بعدم اختراع بدائل افتراضية، بل يعتمد فقط على ما وثّقه الدكتور ضياء العوضي صراحة في
                محاضراته وقوائمه المعتمدة.
              </p>
            </div>
          )}
        </section>
      )}

      {/* System Substitution Principles */}
      <section className="mt-16 max-w-4xl border-t-2 border-line pt-10" aria-label="قواعد الإحلال في الطيبات">
        <div className="mono mb-2 text-xs text-accent">// قواعد الإحلال الكبرى</div>
        <h3 className="text-2xl font-bold text-ink">كيف تستبدل الممنوعات بذكاء؟</h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="brut bg-surface p-4">
            <span className="mono text-xs text-accent font-bold">01. الخبز والدقيق</span>
            <h4 className="mt-1 font-bold text-ink">بدل الخبز الأبيض والبلدي</h4>
            <p className="mt-2 text-xs text-ink-2 leading-relaxed">
              اعتمد على الأرز البسمتي أو البطاطس (المسلوقة/المشوية/المقلية) كقاعدة نشوية، أو توست القمح الكامل المحمص
              جيدًا.
            </p>
          </div>

          <div className="brut bg-surface p-4">
            <span className="mono text-xs text-accent font-bold">02. اللحوم والدواجن</span>
            <h4 className="mt-1 font-bold text-ink">بدل دجاج المزارع والبط</h4>
            <p className="mt-2 text-xs text-ink-2 leading-relaxed">
              الحمام والسمان واللحم البقري والضأن وأسماك البحر والسردين، مع الالتزام الصارم بقاعدة «يوم بروتين ويوم راحة».
            </p>
          </div>

          <div className="brut bg-surface p-4">
            <span className="mono text-xs text-accent font-bold">03. الألبان ومشتقاتها</span>
            <h4 className="mt-1 font-bold text-ink">بدل الحليب السائل والقريش</h4>
            <p className="mt-2 text-xs text-ink-2 leading-relaxed">
              الجبن المعتق الصلب (مثل الجبن الرومي المعتق) والزبدة الفلاحي الطبيعية والقشطة البلدية والسمن البلدي فقط.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
