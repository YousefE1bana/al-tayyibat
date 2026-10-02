import { motion } from "framer-motion";
import { ArrowUpLeft, Search, X } from "lucide-react";
import { forwardRef, useDeferredValue, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { categoriesById } from "@/data/categories";
import { bestFoodMatch, searchFoods } from "@/lib/search";
import { STATUS_META } from "@/lib/status";
import { FoodStatusBadge } from "./FoodStatusBadge";

const SUGGESTIONS = ["أرز", "بطاطس", "بيض", "لبن"];
interface Props { autoFocus?: boolean; id?: string }

export const QuickChecker = forwardRef<HTMLInputElement, Props>(function QuickChecker({ autoFocus, id = "quick" }, ref) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current!);
  const navigate = useNavigate();
  const deferred = useDeferredValue(query);
  const best = useMemo(() => bestFoodMatch(deferred), [deferred]);
  const others = useMemo(() => searchFoods(deferred, 6).filter((m) => m.food.id !== best?.food.id).slice(0, 3), [deferred, best]);
  const hasQuery = deferred.trim().length > 0;
  const href = `/foods?q=${encodeURIComponent(query.trim())}`;

  return (
    <div className="brut bg-surface" id={id}>
      <div className="flex items-center gap-2 border-b-2 border-line bg-bg-2 px-4 py-2 text-xs text-muted">
        <Search className="size-4 text-accent" aria-hidden />
        <span>اسم الطعام يكفي</span><span className="ms-auto">وفقًا لقواعد النظام</span>
      </div>
      <div className="p-4 lg:p-5">
        <form role="search" onSubmit={(event) => { event.preventDefault(); if (query.trim()) navigate(href); }}>
          <h2 className="mb-3 text-xl font-bold"><label htmlFor={`${id}-input`}>ابحث عن طعام</label></h2>
          <div className="search-field relative">
            <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
            <input ref={inputRef} id={`${id}-input`} type="search" autoFocus={autoFocus} value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="مثل: أرز، بطاطس، بيض…" autoComplete="off" enterKeyHint="search"
              className="h-14 w-full border-2 border-line bg-bg pe-14 ps-12 text-base font-semibold placeholder:text-muted focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50 [&::-webkit-search-cancel-button]:hidden" />
            {query && <button type="button" onClick={() => { setQuery(""); inputRef.current?.focus(); }} aria-label="مسح البحث" className="absolute end-1 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center text-muted hover:text-ink"><X className="size-4" aria-hidden /></button>}
          </div>
        </form>
        {!hasQuery && <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">جرّب:</span>
          {SUGGESTIONS.map((name) => <button key={name} type="button" onClick={() => setQuery(name)} className="min-h-11 border border-line-soft bg-bg px-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent">{name}</button>)}
        </div>}
        <p className="sr-only" role="status" aria-atomic="true">{hasQuery ? best ? `${best.food.name}: ${STATUS_META[best.food.status].label}. راجع التفاصيل والشروط.` : "لم نجد هذا الطعام. جرّب اسمًا آخر." : ""}</p>
        {hasQuery && <motion.div key={best?.food.id ?? "notfound"} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="mt-4 border-t-2 border-line-soft pt-4">
          {best ? <>
            <p className="mb-2 text-xs text-muted">أقرب نتيجة · {categoriesById[best.food.categoryId]?.name}</p>
            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-xl font-bold">{best.food.name}</h3><FoodStatusBadge status={best.food.status} variant="solid" /></div>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{best.food.shortDescription}</p>
            <Link to={`/foods/${best.food.slug}`} className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-accent hover:underline">التفاصيل والشروط <ArrowUpLeft className="size-4" aria-hidden /></Link>
          </> : <>
            <h3 className="text-base font-bold">لم نجد هذا الطعام في الدليل.</h3>
            <p className="mt-1 text-sm text-ink-2">عدم العثور عليه لا يعني أنه ممنوع. جرّب اسمًا آخر، أو تصفح الأطعمة.</p>
            <Link to="/foods" className="inline-flex min-h-11 items-center text-sm font-semibold text-accent hover:underline">تصفح دليل الأطعمة ←</Link>
          </>}
          {others.length > 0 && <div className="mt-2 flex flex-wrap items-center gap-2"><span className="text-xs text-muted">قد تقصد:</span>{others.map(({ food }) => <button key={food.id} type="button" onClick={() => setQuery(food.name)} className="min-h-11 border border-line-soft px-3 text-xs hover:border-accent">{food.name}</button>)}</div>}
          <Link to={href} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-ink-2 hover:text-accent">عرض كل نتائج البحث <ArrowUpLeft className="ms-2 size-4" aria-hidden /></Link>
        </motion.div>}
      </div>
    </div>
  );
});
