import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { sampleDay, startSteps } from "@/data/guide";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motionPresets, viewportOnce } from "@/lib/motion";
import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TableOfContents } from "@/components/ui/TableOfContents";
import { SourceRefs } from "@/features/sources/SourceReference";

const MISTAKES = [
  { wrong: "اعتبار المسموح توصية بكمية غير محدودة", right: "التصنيف لا يحدد جرعة أو ملاءمة لحالتك" },
  { wrong: "تعميم حكم البقوليات على كل صنف", right: "افتح صفحة الصنف وراجع حدود التوثيق" },
  { wrong: "اعتبار النقع أو الطهي استثناء تلقائيًا", right: "الاستثناء يحتاج مصدرًا مباشرًا يحدده" },
  { wrong: "اعتبار الوصفات وجبات موثقة عن الدكتور", right: "الوصفات اقتراحات تحريرية؛ راجع كل مكوّن" },
  { wrong: "اختزال غير الموثق إلى ممنوع", right: "أبقِ المسائل غير المحسومة غير محسومة" },
];

const CAUTION = ["الحامل والمرضع", "الأطفال", "مرضى السكري", "مرضى الضغط", "كبار السن", "أي مرض مزمن"];

const TOC = [
  { id: "roadmap", label: "خطوات استخدام الدليل" },
  { id: "sample-day", label: "قبل اختيار وجبة" },
  { id: "mistakes", label: "تذكيرات مهمة" },
  { id: "caution", label: "من يحتاج استشارة؟" },
];

export default function HowItWorksPage() {
  usePageMeta("كيف يعمل؟ ابدأ من هنا", "خطوات استخدام الدليل، قبل اختيار وجبة، وتذكيرات مهمة في نظام الطيبات.");
  return (
    <div className="container-x py-10 md:py-16">
      <header className="max-w-3xl">
        <div className="mono mb-3 text-xs text-accent">// كيف يعمل؟</div>
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">ابدأ من هنا</h1>
        <p className="mt-4 text-lg text-ink-2">افهم التصنيفات، وابحث عن الصنف المحدد، واقرأ شروطه وحدود توثيقه. هذه خطوات استخدام، وليست خطة غذائية موثقة عن الدكتور.</p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[240px_1fr]">
        <TableOfContents items={TOC} className="hidden lg:sticky lg:top-28 lg:block lg:self-start" />
        <div className="min-w-0 space-y-24">
          <section id="roadmap" className="scroll-mt-28">
            <SectionHeading index="01" title="خطوات استخدام الدليل" description="خطوات عملية للتصفح والرجوع إلى المعلومات." />
            <ol className="relative border-s-2 border-line ps-8 md:ps-12">
              {startSteps.map((s, i) => (
                <motion.li key={s.id} id={s.id} variants={motionPresets.fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce} className="relative scroll-mt-28 pb-12 last:pb-0">
                  <span className="mono absolute -start-[calc(2rem+15px)] top-1 flex size-7 items-center justify-center border-2 border-line bg-accent text-xs font-bold text-accent-ink md:-start-[calc(3rem+15px)]">{i + 1}</span>
                  <div className="brut bg-surface p-5 md:p-6">
                    <h3 className="text-xl font-bold md:text-2xl">{s.title}</h3>
                    <p className="mt-1 text-ink-2">{s.summary}</p>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                      {s.details.map((d) => (
                        <li key={d} className="border-2 border-line-soft bg-bg p-3 text-sm">{d}</li>
                      ))}
                    </ul>
                    <SourceRefs ids={s.sourceIds} className="mt-4" />
                  </div>
                </motion.li>
              ))}
            </ol>
          </section>

          <section id="sample-day" className="scroll-mt-28">
            <SectionHeading index="02" title="قبل اختيار وجبة" description="راجع المكونات وحدود توثيقها؛ الوصفات اقتراحات تحريرية." />
            <div className="grid gap-px border-2 border-line bg-line md:grid-cols-2 xl:grid-cols-1">
              {sampleDay.map((slot, i) => (
                <div key={slot.time} className="bg-surface p-5">
                  <div className="mono mb-2 text-xs text-accent">// {String(i + 1).padStart(2, "0")}</div>
                  <h3 className="text-lg font-bold">{slot.time}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-ink-2">
                    {slot.items.map((it) => <li key={it} className="flex gap-2"><span className="text-accent">▸</span>{it}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton to="/recipes" variant="secondary">افتح الوصفات</LinkButton>
              <LinkButton to="/shopping" variant="secondary">دليل المشتريات</LinkButton>
            </div>
          </section>

          <section id="mistakes" className="scroll-mt-28">
            <SectionHeading index="03" title="تذكيرات مهمة" description="تجنب استنتاج قواعد لا يدعمها التوثيق المتاح." />
            <div className="space-y-3">
              {MISTAKES.map((m, i) => (
                <motion.div key={m.wrong} variants={motionPresets.fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce} className="brut-soft grid overflow-hidden bg-surface md:grid-cols-[auto_1fr_1fr]">
                  <div className="mono flex items-center justify-center border-b-2 border-line-soft bg-bg-2 px-4 py-3 text-sm md:border-b-0 md:border-e-2">{String(i + 1).padStart(2, "0")}</div>
                  <div className="flex items-start gap-2 border-b-2 border-line-soft p-4 md:border-b-0 md:border-e-2"><AlertTriangle className="mt-1 size-4 shrink-0 text-status-no" /><span><span className="mono text-[11px] text-status-no">الخطأ: </span>{m.wrong}</span></div>
                  <div className="flex items-start gap-2 p-4"><CheckCircle2 className="mt-1 size-4 shrink-0 text-status-ok" /><span><span className="mono text-[11px] text-status-ok">الصحيح: </span>{m.right}</span></div>
                </motion.div>
              ))}
            </div>
          </section>

          <section id="caution" className="scroll-mt-28">
            <SectionHeading index="04" title="من يحتاج استشارة طبية أولًا؟" description="الدليل معلوماتي وليس نصيحة طبية شخصية. لا توقف دواءً موصوفًا دون مراجعة طبيبك." />
            <div className="flex flex-wrap gap-2">
              {CAUTION.map((c) => <span key={c} className="border-2 border-status-cond bg-surface px-3 py-1.5 text-sm font-semibold">{c}</span>)}
            </div>
            <p className="mt-6 text-sm text-ink-2">
              للاطلاع على الموقف الطبي المؤسسي من النظام: <Link to="/about#science" className="font-semibold text-accent hover:underline">الموقف العلمي</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
