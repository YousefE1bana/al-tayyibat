import { HelpCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { faq, faqCategories } from "@/data/faq";
import { usePageMeta } from "@/hooks/usePageMeta";
import { normalizeArabic } from "@/lib/arabic";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";
import { EmptyState } from "@/components/ui/EmptyState";
import { EvidenceLabel, SourceRefs } from "@/features/sources/SourceReference";
import { cn } from "@/utils/cn";

export default function FAQPage() {
  usePageMeta("الأسئلة الشائعة", "إجابات موثقة عن أكثر الأسئلة تكرارًا حول نظام الطيبات.");
  const { hash } = useLocation();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("الكل");

  const list = useMemo(() => {
    const nq = normalizeArabic(q);
    return faq.filter(
      (item) =>
        (cat === "الكل" || item.category === cat) &&
        (!nq || normalizeArabic(item.question + " " + item.answer).includes(nq)),
    );
  }, [q, cat]);

  let defaultOpen: string[] = [];
  try { defaultOpen = hash ? [decodeURIComponent(hash.slice(1))] : []; } catch { /* malformed fragment */ }

  return (
    <div className="container-x py-10 md:py-16">
      <header className="max-w-3xl">
        <div className="mono mb-3 text-xs text-accent">// الأسئلة الشائعة</div>
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">الأسئلة الشائعة</h1>
        <p className="mt-4 text-lg text-ink-2">كل إجابة تشير إلى مصدرها، وتُوسم عند الحاجة بمستوى الدليل.</p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="relative">
            <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث في الأسئلة…" aria-label="بحث في الأسئلة" className="brut-soft h-12 w-full bg-surface pe-10 ps-3 font-semibold placeholder:text-muted focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50" />
          </div>
          <div className="flex flex-wrap gap-2 lg:flex-col">
            {["الكل", ...faqCategories].map((c) => (
              <button key={c} type="button" onClick={() => setCat(c)} aria-pressed={cat === c} className={cn("border-2 px-3 py-1.5 text-start text-sm font-semibold transition", cat === c ? "border-line bg-accent text-accent-ink" : "border-line-soft hover:border-line")}>
                {c}
              </button>
            ))}
          </div>
        </aside>

        <div>
          {list.length === 0 ? (
            <EmptyState icon={HelpCircle} title="مش لاقيين السؤال ده." description="جرّب كلمات أخرى، أو ابحث عن الطعام مباشرة في دليل الأطعمة." action={<Link to="/foods" className="brut brut-hover bg-accent px-4 py-2 text-sm font-bold text-accent-ink">دليل الأطعمة</Link>} />
          ) : (
            <Accordion type="multiple" defaultValue={defaultOpen} className="brut-soft bg-surface">
              {list.map((item) => (
                <AccordionItem key={item.id} value={item.id} id={item.id} title={item.question} meta={item.category}>
                  <p className="leading-relaxed">{item.answer}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {item.evidence && <EvidenceLabel level={item.evidence} />}
                    <SourceRefs ids={item.sourceIds} />
                    {item.relatedHref && (
                      <Link to={item.relatedHref} className="mono text-xs text-accent hover:underline">اقرأ المزيد ←</Link>
                    )}
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
}
