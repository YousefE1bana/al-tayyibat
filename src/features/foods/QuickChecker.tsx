import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpLeft, Search, Terminal } from "lucide-react";
import { forwardRef, useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { categoriesById } from "@/data/categories";
import { STATUS_META } from "@/lib/status";
import { bestFoodMatch, searchFoods } from "@/lib/search";
import { foodsById } from "@/data/foods";
import { FoodStatusBadge } from "./FoodStatusBadge";

const SUGGESTIONS = ["بطاطس", "بيض", "فراخ", "لبن", "أرز", "عدس", "جبنة رومي", "سكر"];

interface Props {
  autoFocus?: boolean;
  id?: string;
}

/** «هل أقدر آكل ده؟» — instant single-answer food check. */
export const QuickChecker = forwardRef<HTMLInputElement, Props>(function QuickChecker({ autoFocus, id }, ref) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  const best = useMemo(() => bestFoodMatch(deferred), [deferred]);
  const others = useMemo(
    () => searchFoods(deferred, 6).filter((m) => m.food.id !== best?.food.id).slice(0, 4),
    [deferred, best],
  );
  const hasQuery = deferred.trim().length > 0;

  return (
    <div className="brut bg-surface" id={id}>
      <div className="flex items-center gap-2 border-b-2 border-line bg-bg-2 px-4 py-2">
        <Terminal className="size-4 text-accent" aria-hidden />
        <span className="mono text-xs text-muted">tayyibat://check</span>
        <span className="mono ms-auto text-[11px] text-muted">{hasQuery ? "جاري المطابقة…" : "جاهز"}</span>
      </div>

      <div className="p-4 md:p-6">
        <label htmlFor={`${id ?? "quick"}-input`} className="mb-3 block text-2xl font-bold md:text-3xl">
          هل أقدر آكل ده؟
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
          <input
            ref={ref}
            id={`${id ?? "quick"}-input`}
            type="search"
            autoFocus={autoFocus}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="اكتب اسم الطعام… مثل: بطاطس، بيض، لبن"
            autoComplete="off"
            className="h-14 w-full border-2 border-line bg-bg pe-12 ps-4 text-lg font-semibold placeholder:text-muted focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50"
          />
        </div>

        {!hasQuery && (
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className="mono border border-line-soft bg-bg px-2.5 py-1 text-xs text-ink-2 transition hover:border-line hover:text-ink"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {hasQuery && best && (
            <motion.div
              key={best.food.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="mt-5 border-2 border-line bg-bg p-4"
            >
              <div className="mono mb-2 text-[11px] text-muted">
                &gt; {categoriesById[best.food.categoryId]?.name} / {best.food.slug}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-bold md:text-2xl">{best.food.name}</h3>
                <FoodStatusBadge status={best.food.status} size="lg" variant="solid" />
              </div>
              <p className="mt-3 text-ink-2">{best.food.shortDescription}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  to={`/foods/${best.food.slug}`}
                  className="brut brut-hover inline-flex h-10 items-center gap-1.5 bg-accent px-4 text-sm font-bold text-accent-ink"
                >
                  التفاصيل الكاملة <ArrowUpLeft className="size-4" aria-hidden />
                </Link>
                {best.food.alternatives?.length ? (
                  <span className="flex flex-wrap items-center gap-1.5 text-sm">
                    <span className="mono text-[11px] text-muted">بدائل:</span>
                    {best.food.alternatives.slice(0, 3).map((id) => {
                      const alt = foodsById[id];
                      return alt ? (
                        <Link key={id} to={`/foods/${alt.slug}`} className="border border-line-soft px-2 py-0.5 hover:border-line">
                          <span className={STATUS_META[alt.status].twText}>{STATUS_META[alt.status].symbol}</span> {alt.name}
                        </Link>
                      ) : null;
                    })}
                  </span>
                ) : null}
              </div>
            </motion.div>
          )}

          {hasQuery && !best && (
            <motion.div
              key="notfound"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 border-2 border-dashed border-line bg-bg p-4"
            >
              <div className="mono mb-1 text-[11px] text-status-unknown">? not_found</div>
              <h3 className="text-lg font-bold">لم نجد هذا الطعام في قاعدة بيانات الدليل حتى الآن.</h3>
              <p className="mt-1 text-sm text-ink-2">
                <strong>غير موجود ≠ ممنوع.</strong> جرّب تهجئة أخرى أو تصفح الفئات.
              </p>
              <Link to={`/foods?q=${encodeURIComponent(deferred)}`} className="mono mt-3 inline-block text-xs text-accent hover:underline">
                افتح البحث الكامل في دليل الأطعمة ←
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {hasQuery && others.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="mono text-[11px] text-muted">هل تقصد:</span>
            {others.map((m) => (
              <button
                key={m.food.id}
                type="button"
                onClick={() => setQuery(m.food.name)}
                className="border border-line-soft px-2 py-0.5 text-sm hover:border-line"
              >
                {m.food.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
