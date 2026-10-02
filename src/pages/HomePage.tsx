import { motion } from "framer-motion";
import { ArrowDown, ArrowUpLeft, ShieldAlert } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { categories } from "@/data/categories";
import { doctor } from "@/data/doctor";
import { faq } from "@/data/faq";
import { foods } from "@/data/foods";
import { articles, startSteps } from "@/data/guide";
import { philosophy, principles } from "@/data/principles";
import { recipes } from "@/data/recipes";
import { usePageMeta } from "@/hooks/usePageMeta";
import { iconByName } from "@/lib/icons";
import { motionPresets, viewportOnce, usePrefersReducedMotion } from "@/lib/motion";
import { STATUS_META, STATUS_ORDER } from "@/lib/status";
import { toArabicDigits } from "@/lib/arabic";
import { Button, LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DoctorPortrait } from "@/features/doctor/DoctorPortrait";
import { CategoryCard } from "@/features/foods/CategoryCard";
import { FoodStatusBadge } from "@/features/foods/FoodStatusBadge";
import { QuickChecker } from "@/features/foods/QuickChecker";
import { PrincipleCard } from "@/features/principles/PrincipleCard";
import { RecipeCard } from "@/features/recipes/RecipeCard";

const HERO_CARDS = [
  { id: "basmati-rice", x: "-6%", y: "8%", delay: 0 },
  { id: "chicken", x: "58%", y: "65%", delay: 1.2 },
  { id: "beef", x: "-10%", y: "62%", delay: 0.6 },
] as const;

function Hero({ onCheck }: { onCheck: () => void }) {
  const reduce = usePrefersReducedMotion();

  return (
    <section className="relative overflow-hidden border-b-2 border-line">
      <div className="grid-dots absolute inset-0 opacity-60" aria-hidden />
      <div className="hatch absolute inset-y-0 end-0 hidden w-24 border-s-2 border-line lg:block" aria-hidden />

      <div className="container-x relative grid min-h-[calc(100dvh-72px)] items-center gap-10 py-14 lg:grid-cols-[1.15fr_1fr] lg:py-20">
        <motion.div variants={motionPresets.staggerContainer} initial="hidden" animate="show">
          <motion.div variants={motionPresets.fadeUp} className="mono mb-5 flex flex-wrap items-center gap-3 text-xs">
            <span className="border-2 border-line bg-surface px-2 py-1">دليلك إلى نظام الطيبات</span>
            <span className="text-muted">{toArabicDigits(foods.length)} طعامًا · تصنيفات وبدائل ووصفات</span>
          </motion.div>

          <motion.h1 variants={motionPresets.fadeUp} className="text-5xl font-bold leading-[1.1] sm:text-6xl lg:text-7xl xl:text-8xl">
            نظام <span className="relative inline-block text-accent">الطيبات<span className="absolute inset-x-0 -bottom-1 h-2 bg-accent/30" aria-hidden /></span>
            <br />
            <span className="text-3xl font-semibold text-ink-2 sm:text-4xl lg:text-5xl">الدليل التفاعلي الكامل</span>
          </motion.h1>

          <motion.p variants={motionPresets.fadeUp} className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2 md:text-xl">
            اكتب اسم أي طعام، واعرف خلال ثوانٍ: هل هو من «الطيبات» أم من الممنوعات في نظام الدكتور ضياء العوضي، ولماذا، وما
            بدائله — مع توضيح قواعد النظام وتمييزها عن الرأي العلمي.
          </motion.p>

          <motion.div variants={motionPresets.fadeUp} className="mt-8 flex flex-wrap gap-3">
            <LinkButton to="/about" size="lg">
              استكشف نظام الطيبات <ArrowUpLeft className="size-5" />
            </LinkButton>
            <Button variant="secondary" size="lg" onClick={onCheck}>
              هل هذا الطعام ضمن النظام؟
            </Button>
          </motion.div>

          <motion.div variants={motionPresets.fadeUp} className="mt-10 flex flex-wrap gap-2" aria-label="مفتاح الحالات">
            {STATUS_ORDER.map((s) => (
              <Link key={s} to={`/foods?status=${s}`} className="transition hover:-translate-y-0.5">
                <FoodStatusBadge status={s} size="sm" />
              </Link>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="absolute -inset-3 hatch border-2 border-line" aria-hidden />
          <div className="brut relative aspect-[4/5] overflow-hidden bg-surface-2 sm:aspect-[5/6]">
            <DoctorPortrait className="h-full w-full" />
            <div className="absolute inset-x-0 bottom-0 border-t-2 border-line bg-bg/90 px-4 py-3 backdrop-blur">
              <div className="mono text-[11px] text-accent">// صاحب النظام</div>
              <div className="text-lg font-bold">{doctor.displayName}</div>
              <div className="text-xs text-muted">{doctor.specialty} · {doctor.almaMater}</div>
            </div>
          </div>

          {HERO_CARDS.map((c) => {
            const f = foods.find((x) => x.id === c.id);
            if (!f) return null;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0 : 0.25, delay: reduce ? 0 : c.delay / 6 }}
                style={{ left: c.x, top: c.y }}
                className="absolute hidden md:block"
              >
                <Link to={`/foods/${f.slug}`} className="brut flex items-center gap-2 bg-bg px-3 py-2 text-sm font-bold transition hover:bg-surface">
                  <span className={STATUS_META[f.status].twText}>{STATUS_META[f.status].symbol}</span>
                  {f.name.split(" (")[0]}
                  <span className="mono text-[10px] text-muted">{STATUS_META[f.status].short}</span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <div className="container-x mono flex items-center gap-2 pb-6 text-[11px] text-muted">
        <ArrowDown className="size-3" aria-hidden /> ابدأ بالفحص السريع
      </div>
    </section>
  );
}

export default function HomePage() {
  usePageMeta(undefined, "دليل تفاعلي عربي لنظام الطيبات للدكتور ضياء العوضي: ابحث عن أي طعام واعرف موقعه في النظام.");
  const checkerRef = useRef<HTMLInputElement>(null);

  const focusChecker = () => {
    document.getElementById("quick-check")?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => checkerRef.current?.focus(), 450);
  };

  const essentials = foods.filter((f) => f.essential);

  return (
    <>
      <Hero onCheck={focusChecker} />

      {/* Quick checker */}
      <section className="container-x -mt-1 py-16 md:py-24" aria-labelledby="quick-check-heading">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <h2 id="quick-check-heading" className="sr-only">الفحص السريع</h2>
            <SectionHeading index="01" kicker="بحث سريع" title="فحص سريع لأي طعام" description="ابحث بالاسم الذي تعرفه، مثل بطاطس أو بطاطا، فراخ أو دجاج، واعرف حالة الطعام في الدليل." className="mb-6" />
            <div className="brut-soft grid grid-cols-2 gap-px bg-line-soft sm:grid-cols-3">
              {essentials.map((f) => (
                <Link key={f.id} to={`/foods/${f.slug}`} className="bg-surface p-3 transition hover:bg-surface-2">
                  <div className="mono text-[10px] text-accent">أساسي</div>
                  <div className="text-sm font-bold">{f.name.split(" /")[0]}</div>
                </Link>
              ))}
              <Link to="/foods?q=الأساسيات" className="flex items-center justify-center bg-accent p-3 text-sm font-bold text-accent-ink">
                الأساسيات الخمسة ←
              </Link>
            </div>
          </div>
          <QuickChecker ref={checkerRef} id="quick-check" />
        </div>
      </section>

      {/* Intro */}
      <section className="border-y-2 border-line bg-bg-2 py-16 md:py-24">
        <div className="container-x">
          <SectionHeading index="02" kicker="تعرّف على النظام" title="ما هو نظام الطيبات؟" description={philosophy.coreIdea} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {philosophy.pillars.map((p, i) => {
              const Icon = iconByName(p.icon);
              return (
                <motion.div key={p.title} variants={motionPresets.fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce} transition={{ delay: i * 0.05 }} className="brut bg-surface p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <Icon className="size-6 text-accent" aria-hidden />
                    <span className="mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="text-lg font-bold">{p.title}</h3>
                  <p className="mt-1 text-sm text-ink-2">{p.text}</p>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <LinkButton to="/about" variant="secondary">القراءة الكاملة عن النظام</LinkButton>
            <Link to="/about#science" className="inline-flex items-center gap-2 text-sm font-semibold text-accent-3 hover:underline">
              <ShieldAlert className="size-4" /> ماذا تقول المؤسسات الطبية؟
            </Link>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="container-x py-16 md:py-24" id="principles">
        <SectionHeading index="03" kicker="مبادئ النظام" title="القواعد الست الذهبية" description="القواعد السلوكية أهم من القوائم في هذا النظام. اضغط أي قاعدة للشرح الكامل ومستوى الدليل." />
        <motion.div variants={motionPresets.staggerContainer} initial="hidden" whileInView="show" viewport={viewportOnce} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {principles.map((p) => <PrincipleCard key={p.id} principle={p} />)}
        </motion.div>
      </section>

      {/* Categories */}
      <section className="border-y-2 border-line bg-bg-2 py-16 md:py-24">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading index="04" kicker="الفئات" title="تصفح حسب الفئة" description="الشريط السفلي في كل بطاقة يوضح توزيع الحالات داخل الفئة." className="mb-0" />
            <LinkButton to="/foods" variant="secondary">دليل الأطعمة الكامل</LinkButton>
          </div>
          <motion.div variants={motionPresets.staggerContainer} initial="hidden" whileInView="show" viewport={viewportOnce} className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {categories.slice(0, 10).map((c) => <CategoryCard key={c.id} category={c} />)}
          </motion.div>
        </div>
      </section>

      {/* How to start */}
      <section className="container-x py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading index="05" kicker="الخطوات الأولى" title="ابدأ من هنا" description="خطة الأربعة أسابيع كما وردت في الدليل — التدرّج مقصود، و«الانتقال المفاجئ» يُعد خطأً شائعًا." />
            <LinkButton to="/how-it-works">الخطة كاملة مع نموذج اليوم</LinkButton>
          </div>
          <ol className="relative border-s-2 border-line ps-8">
            {startSteps.map((s, i) => (
              <motion.li key={s.id} variants={motionPresets.fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce} className="relative pb-10 last:pb-0">
                <span className="mono absolute -start-[calc(2rem+13px)] top-0 flex size-6 items-center justify-center border-2 border-line bg-accent text-[11px] font-bold text-accent-ink">
                  {i + 1}
                </span>
                <h3 className="text-xl font-bold">{s.title}</h3>
                <p className="mt-1 text-ink-2">{s.summary}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Featured guide content */}
      <section className="border-y-2 border-line bg-bg-2 py-16 md:py-24">
        <div className="container-x">
          <SectionHeading index="06" kicker="روابط مفيدة" title="الدليل السريع" description="لمن لا يريد قراءة كل شيء: أهم الأقسام في نقرة." />
          <div className="grid gap-px border-2 border-line bg-line md:grid-cols-2 xl:grid-cols-3">
            {articles.map((a, i) => (
              <Link key={a.id} to={a.href} className="group bg-surface p-6 transition hover:bg-accent hover:text-accent-ink">
                <div className="mono mb-3 flex items-center justify-between text-[11px] text-muted group-hover:text-accent-ink/70">
                  <span>// {String(i + 1).padStart(2, "0")}</span>
                  <ArrowUpLeft className="size-4" />
                </div>
                <h3 className="text-lg font-bold">{a.title}</h3>
                <p className="mt-1 text-sm opacity-80">{a.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recipes */}
      <section className="container-x py-16 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading index="07" kicker="المطبخ" title="وصفات من نموذج اليوم" description="وصفات من نموذج اليوم في دليل النظام، مع المكونات وطريقة التحضير." className="mb-0" />
          <LinkButton to="/recipes" variant="secondary">كل الوصفات</LinkButton>
        </div>
        <motion.div variants={motionPresets.staggerContainer} initial="hidden" whileInView="show" viewport={viewportOnce} className="mt-10 grid gap-5 md:grid-cols-3">
          {recipes.slice(0, 3).map((r) => <RecipeCard key={r.id} recipe={r} expandable={false} />)}
        </motion.div>
      </section>

      {/* Doctor teaser */}
      <section className="border-y-2 border-line bg-bg-2 py-16 md:py-24">
        <div className="container-x grid items-center gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="brut mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden">
            <DoctorPortrait className="h-full w-full" />
          </div>
          <div>
            <SectionHeading index="08" kicker="صاحب النظام" title={doctor.displayName} description={doctor.bio[0]} />
            <div className="mono grid gap-2 text-xs sm:grid-cols-2">
              <div className="border-2 border-line-soft bg-surface p-3"><span className="text-muted">الميلاد:</span> {doctor.born}</div>
              <div className="border-2 border-line-soft bg-surface p-3"><span className="text-muted">التخصص:</span> {doctor.specialty}</div>
              <div className="border-2 border-line-soft bg-surface p-3"><span className="text-muted">الجامعة:</span> {doctor.almaMater}</div>
              <div className="border-2 border-line-soft bg-surface p-3"><span className="text-muted">الوفاة:</span> {doctor.died}</div>
            </div>
            <LinkButton to="/doctor" className="mt-6">السيرة الكاملة والخط الزمني</LinkButton>
          </div>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="container-x py-16 md:py-24">
        <SectionHeading index="09" kicker="أسئلة وإجابات" title="أكثر الأسئلة تكرارًا" />
        <div className="grid gap-4 md:grid-cols-2">
          {faq.slice(0, 4).map((q) => (
            <Link key={q.id} to={`/faq#${q.id}`} className="brut brut-hover block bg-surface p-5">
              <div className="mono mb-2 text-[11px] text-accent">{q.category}</div>
              <h3 className="text-lg font-bold">{q.question}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-ink-2">{q.answer}</p>
            </Link>
          ))}
        </div>
        <LinkButton to="/faq" variant="secondary" className="mt-6">كل الأسئلة</LinkButton>
      </section>

    </>
  );
}
