import { Check, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { shoppingGroups } from "@/data/guide";
import { foodsById } from "@/data/foods";
import { useShoppingChecks } from "@/hooks/useCollections";
import { usePageMeta } from "@/hooks/usePageMeta";
import { toArabicDigits } from "@/lib/arabic";
import { STATUS_META } from "@/lib/status";
import { Button } from "@/components/ui/Button";
import { SourceRefs } from "@/features/sources/SourceReference";
import { cn } from "@/utils/cn";

export default function ShoppingPage() {
  usePageMeta("دليل المشتريات", "قائمة تسوق عملية مبنية على فئات المسموحات في نظام الطيبات — تُحفظ محليًا.");
  const { checked, toggle, reset } = useShoppingChecks();
  const total = shoppingGroups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="container-x py-10 md:py-16">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-3xl">
          <div className="mono mb-3 text-xs text-accent">// دليل المشتريات</div>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">دليل المشتريات</h1>
          <p className="mt-4 text-lg text-ink-2">قائمة تنظيم من الأصناف الموجودة في الدليل؛ راجع تصنيف كل صنف وحدود توثيقه. ليست خطة غذائية. علّم ما اشتريته وسيُحفظ على جهازك.</p>
        </div>
        <div className="brut bg-surface px-5 py-3 text-center">
          <div className="mono text-[11px] text-muted">التقدم</div>
          <div className="text-2xl font-bold">{toArabicDigits(checked.length)} / {toArabicDigits(total)}</div>
        </div>
      </header>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {shoppingGroups.map((g) => (
          <section key={g.id} className="brut bg-surface">
            <h2 className="border-b-2 border-line px-4 py-3 text-lg font-bold">{g.title}</h2>
            <ul className="divide-y-2 divide-line-soft">
              {g.items.map((it) => {
                const on = checked.includes(it.id);
                const f = it.foodId ? foodsById[it.foodId] : undefined;
                return (
                  <li key={it.id} className="flex items-center gap-3 px-4 py-2.5">
                    <button type="button" role="checkbox" aria-checked={on} onClick={() => toggle(it.id)} aria-label={it.label} className={cn("flex size-11 shrink-0 items-center justify-center border-2 border-line transition", on ? "bg-accent text-accent-ink" : "bg-bg")}>
                      {on && <Check className="size-4" strokeWidth={3} />}
                    </button>
                    <span className={cn("flex-1 text-sm font-semibold", on && "text-muted line-through")}>{it.label}</span>
                    {f && (
                      <Link to={`/foods/${f.slug}`} className={cn("mono flex min-h-11 min-w-11 items-center justify-center text-sm", STATUS_META[f.status].twText)} aria-label={`${it.label} — ${STATUS_META[f.status].label} — التفاصيل`} title={STATUS_META[f.status].label}>
                        {STATUS_META[f.status].symbol}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="px-4 py-3"><SourceRefs ids={g.sourceIds} /></div>
          </section>
        ))}
      </div>

      <Button variant="secondary" onClick={reset} className="mt-8"><RotateCcw className="size-4" /> إعادة تعيين القائمة</Button>
    </div>
  );
}
