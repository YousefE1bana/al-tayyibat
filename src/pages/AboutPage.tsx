import { motion } from "framer-motion";
import { AlertOctagon, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { foods } from "@/data/foods";
import { philosophy, principles, theories } from "@/data/principles";
import { usePageMeta } from "@/hooks/usePageMeta";
import { iconByName } from "@/lib/icons";
import { motionPresets, viewportOnce } from "@/lib/motion";
import { STATUS_META, STATUS_ORDER } from "@/lib/status";
import { toArabicDigits } from "@/lib/arabic";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TableOfContents } from "@/components/ui/TableOfContents";
import { FoodStatusBadge } from "@/features/foods/FoodStatusBadge";
import { PrincipleCard } from "@/features/principles/PrincipleCard";
import { EvidenceLabel, SourceRefs } from "@/features/sources/SourceReference";

const TOC = [
  { id: "idea", label: "الفكرة الأساسية" },
  { id: "philosophy", label: "الفلسفة" },
  { id: "principles", label: "القواعد الست" },
  { id: "classification", label: "تصنيف الأطعمة" },
  { id: "theories", label: "النظريات الثلاث" },
  { id: "science", label: "الموقف العلمي" },
];

export default function AboutPage() {
  usePageMeta("عن النظام", "ما هو نظام الطيبات؟ الفكرة، الفلسفة، القواعد الست، تصنيف الأطعمة، والموقف العلمي.");
  const counts = STATUS_ORDER.map((s) => ({ s, n: foods.filter((f) => f.status === s).length }));

  return (
    <div className="container-x py-10 md:py-16">
      <header className="max-w-3xl">
        <div className="mono mb-3 text-xs text-accent">// عن النظام</div>
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">ما هو نظام الطيبات؟</h1>
        <p className="mt-4 text-lg text-ink-2">
          شرح مقسّم إلى وحدات صغيرة: الفكرة، الفلسفة، القواعد، التصنيف، النظريات — ثم ما تقوله المؤسسات الطبية. نميّز في كل
          موضع بين قاعدة النظام، وتصريح الدكتور، والموقف العلمي.
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[240px_1fr]">
        <TableOfContents items={TOC} className="hidden lg:sticky lg:top-28 lg:block lg:self-start" />

        <div className="min-w-0 space-y-24">
          <section id="idea" className="scroll-mt-28">
            <SectionHeading index="01" title="الفكرة الأساسية" description={philosophy.coreIdea} />
            <div className="grid gap-4 md:grid-cols-2">
              {philosophy.pillars.map((p) => {
                const Icon = iconByName(p.icon);
                return (
                  <motion.div key={p.title} variants={motionPresets.fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce} className="brut flex gap-4 bg-surface p-5">
                    <span className="flex size-12 shrink-0 items-center justify-center border-2 border-line bg-bg text-accent"><Icon className="size-5" /></span>
                    <div>
                      <h3 className="text-lg font-bold">{p.title}</h3>
                      <p className="text-sm text-ink-2">{p.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <SourceRefs ids={philosophy.sourceIds} className="mt-4" />
          </section>

          <section id="philosophy" className="scroll-mt-28">
            <SectionHeading index="02" title="الفلسفة" description="«الأكل للعيش بصحة، وليس العكس» — إعطاء الجسم فرصة لإعادة التوازن عبر عدم إرهاق الجهاز الهضمي بالهضم المستمر." />
            <blockquote className="brut relative bg-surface-2 p-6 md:p-8">
              <Quote className="absolute end-4 top-4 size-8 text-accent/40" aria-hidden />
              <p className="text-xl font-semibold leading-relaxed md:text-2xl">«{philosophy.quote}»</p>
              <footer className="mono mt-4 text-xs text-muted">— {philosophy.quoteAttribution}</footer>
            </blockquote>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {philosophy.mottoes.map((m) => (
                <div key={m} className="border-2 border-line-soft bg-surface p-4 text-center font-bold">«{m}»</div>
              ))}
            </div>
          </section>

          <section id="principles" className="scroll-mt-28">
            <SectionHeading index="03" title="القواعد الست الذهبية" description="القواعد السلوكية هي قلب النظام. كل قاعدة موسومة بمستوى الدليل." />
            <motion.div variants={motionPresets.staggerContainer} initial="hidden" whileInView="show" viewport={viewportOnce} className="grid gap-5 md:grid-cols-2">
              {principles.map((p) => <PrincipleCard key={p.id} principle={p} />)}
            </motion.div>
          </section>

          <section id="classification" className="scroll-mt-28">
            <SectionHeading index="04" title="كيف يصنّف النظام الأطعمة؟" description="المصادر تقسم الأطعمة إلى «طيبات» مسموحة، و«مسموحات بشروط»، و«خبائث» ممنوعة. أضفنا نحن خانتين: «المصادر مختلفة» عندما تتعارض المصادر، و«غير موثق» لما لم نجده." />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {counts.map(({ s, n }) => (
                <Link key={s} to={`/foods?status=${s}`} className="brut brut-hover flex flex-col gap-3 bg-surface p-5">
                  <div className="flex items-center justify-between">
                    <FoodStatusBadge status={s} />
                    <span className="mono text-2xl font-semibold">{toArabicDigits(n)}</span>
                  </div>
                  <p className="text-sm text-ink-2">{STATUS_META[s].description}</p>
                </Link>
              ))}
            </div>
          </section>

          <section id="theories" className="scroll-mt-28">
            <SectionHeading index="05" title="النظريات الثلاث وراء النظام" description="يستند الدكتور إلى ثلاث نظريات يشرح بها قوائمه. نعرضها بوصفها ادعاءاته، مع الموقف العلمي المقابل." />
            <div className="space-y-4">
              {theories.map((t, i) => (
                <motion.article key={t.id} variants={motionPresets.fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce} className="brut grid gap-0 overflow-hidden bg-surface md:grid-cols-2">
                  <div className="p-5 md:border-e-2 md:border-line">
                    <div className="mono mb-2 flex items-center gap-2 text-xs"><span className="text-muted">// {String(i + 1).padStart(2, "0")}</span><EvidenceLabel level={t.evidence} /></div>
                    <h3 className="text-xl font-bold">{t.title}</h3>
                    <p className="mt-2 text-ink-2">{t.claim}</p>
                  </div>
                  <div className="hatch p-5">
                    <div className="mono mb-2 text-xs text-accent-3">// الموقف العلمي المقابل</div>
                    <p className="text-sm text-ink-2">{t.counter}</p>
                    <SourceRefs ids={t.sourceIds} className="mt-3" />
                  </div>
                </motion.article>
              ))}
            </div>
          </section>

          <section id="science" className="scroll-mt-28">
            <SectionHeading index="06" title="الموقف العلمي والمؤسسي" description="ما ورد في المصادر الموسوعية والصحفية عن موقف المؤسسات الطبية من النظام وصاحبه." />
            <div className="brut border-status-no bg-surface p-6 md:p-8">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <AlertOctagon className="size-6 text-status-no" aria-hidden />
                <EvidenceLabel level="institutional" />
              </div>
              <ul className="space-y-3 text-ink-2">
                <li>▸ يرى المنتقدون أن النظام <strong>يفتقر إلى الأساس التجريبي</strong>؛ لم تُقدَّم دراسات سريرية محكّمة تُثبت فاعليته.</li>
                <li>▸ تصريحات الدكتور بأن السمن والزبدة «منظّفان للشرايين» <strong>تتعارض مع إرشادات منظمة الصحة العالمية</strong> وجمعيات القلب حول الدهون المشبعة.</li>
                <li>▸ في <strong>10 مارس 2026</strong> قررت هيئة التأديب بنقابة الأطباء المصرية شطبه لأنه «تعمّد تقديم آراء طبية تخالف القواعد المحلية والدولية متجاوزًا تخصصه». أُغلقت عيادته وأُلغي ترخيصه.</li>
                <li>▸ مصدر القلق الرئيس: دعوته بعض المرضى المزمنين (سكري، كلى، أورام) إلى <strong>تقليل أدويتهم أو إيقافها</strong>.</li>
                <li>▸ ردّه المعتاد: <em>«الطب يُقاس بالنتائج لا بالأوراق البحثية»</em> — وهو موقف يتعارض مع مبادئ الطب المبني على الأدلة.</li>
              </ul>
              <SourceRefs ids={["wikipedia-ar", "elconsolto-statements"]} className="mt-5" />
            </div>
            <p className="mono mt-4 text-xs text-muted">
              ⚠ هذا الموقع دليل معلوماتي وليس نصيحة طبية. لا توقف أي دواء ولا تغيّر نظامك الغذائي في الحالات المزمنة دون استشارة طبيب.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
