import { motion } from "framer-motion";
import { ArrowUpLeft, ListChecks, ShieldAlert, ShoppingBasket } from "lucide-react";
import { Link } from "react-router-dom";
import { categories } from "@/data/categories";
import { doctor } from "@/data/doctor";
import { faq } from "@/data/faq";
import { foods } from "@/data/foods";
import { articles } from "@/data/guide";
import { philosophy, principles } from "@/data/principles";
import { recipes } from "@/data/recipes";
import { usePageMeta } from "@/hooks/usePageMeta";
import { iconByName } from "@/lib/icons";
import { motionPresets, usePrefersReducedMotion, viewportOnce } from "@/lib/motion";
import { STATUS_ORDER } from "@/lib/status";
import { toArabicDigits } from "@/lib/arabic";
import { LinkButton } from "@/components/ui/Button";
import { BotanicalSprig } from "@/components/brand/BotanicalSprig";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SystemEditorial } from "@/features/doctor/SystemEditorial";
import { DoctorPortrait } from "@/features/doctor/DoctorPortrait";
import { CategoryCard } from "@/features/foods/CategoryCard";
import { FoodStatusBadge } from "@/features/foods/FoodStatusBadge";
import { QuickChecker } from "@/features/foods/QuickChecker";
import { PrincipleCard } from "@/features/principles/PrincipleCard";
import { RecipeCard } from "@/features/recipes/RecipeCard";
import { InstallNudge } from "@/pwa/PwaControls";

function Hero() {
  const reduced = usePrefersReducedMotion();
  return (
    <section className="home-hero relative border-b-2 border-line" aria-labelledby="hero-heading">
      <div className="grid-dots pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <motion.div variants={motionPresets.staggerContainer} initial={reduced ? false : "hidden"} animate="show" className="hero-layout container-x relative">
        <motion.div variants={motionPresets.fadeUp} className="hero-copy min-w-0">
          <p className="mb-4 hidden flex-wrap items-center gap-3 text-sm font-semibold text-muted md:flex">
            <span className="border-2 border-line bg-surface px-3 py-1 text-ink">{toArabicDigits(foods.length)} طعامًا في دليل واحد</span>
            <span>بدون حساب · بدون تتبع</span>
          </p>
          <h1 id="hero-heading" className="text-4xl font-bold leading-[1.2] md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl">
            نظام <span className="text-accent">الطيبات</span>
          </h1>
          <p className="mt-2 text-sm font-semibold text-accent md:mt-3 md:text-base">دليل تفاعلي لنظام الدكتور ضياء العوضي</p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-2 md:mt-3 md:text-base lg:text-lg">
            ابحث عن طعام، وافهم حالته وشروطه وبدائله.
            دليل معلوماتي، وليس بديلًا عن نصيحة طبيبك.
          </p>
        </motion.div>
        <motion.div variants={motionPresets.fadeUp} className="hero-actions min-w-0">
          <QuickChecker id="quick-check" />
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold">
            <LinkButton to="/foods">تصفح دليل الأطعمة</LinkButton>
            <Link to="/doctor" className="inline-flex min-h-11 items-center gap-2 text-ink-2 hover:text-accent">اعرف أكثر عن الدكتور <ArrowUpLeft className="size-4" aria-hidden /></Link>
          </div>
        </motion.div>
        <motion.figure variants={motionPresets.fadeUp} className="hero-doctor editorial-shell relative min-w-0">
          <BotanicalSprig />
          <div className="editorial-portrait-frame relative">
            <DoctorPortrait loading="eager" className="hero-doctor-image" />
            <figcaption className="editorial-ink px-4 py-3 text-sm md:text-base">
              <span className="doctor-caption-name block font-semibold leading-relaxed">{doctor.displayName}</span>
              <span className="editorial-muted mt-1 block text-xs font-normal leading-relaxed">صاحب نظام الطيبات</span>
            </figcaption>
          </div>
        </motion.figure>
      </motion.div>
    </section>
  );
}

export default function HomePage() {
  usePageMeta(undefined, "دليل تفاعلي عربي لنظام الطيبات للدكتور ضياء العوضي: ابحث عن أي طعام واعرف موقعه في النظام.");
  const essentials = foods.filter((f) => f.essential);

  return (
    <>
      <Hero />
      <InstallNudge />

      <section className="container-x py-12 md:py-16" aria-labelledby="start-heading">
        <h2 id="start-heading" className="mb-6 text-2xl font-bold">خطوتك التالية</h2>
        <div className="grid gap-5 md:grid-cols-3">
          <Link to="/ingredients" className="brut brut-hover flex items-start gap-4 bg-surface p-5">
            <ListChecks className="mt-1 size-6 shrink-0 text-accent" aria-hidden />
            <div><h3 className="text-lg font-bold">محتار في مكوّن؟</h3><p className="mt-1 text-sm text-ink-2">افحص مقادير وصفتك معًا، وراجع كل مكوّن.</p></div>
          </Link>
          <Link to="/shopping" className="brut brut-hover flex items-start gap-4 bg-surface p-5">
            <ShoppingBasket className="mt-1 size-6 shrink-0 text-accent" aria-hidden />
            <div><h3 className="text-lg font-bold">جهّز قائمة مشترياتك</h3><p className="mt-1 text-sm text-ink-2">قائمة مرجعية تحفظ تقدمك على جهازك.</p></div>
          </Link>
          <div className="brut bg-surface p-5">
            <h3 className="mb-2 text-lg font-bold">الأساسيات الخمسة وفقًا للنظام</h3>
            <div className="flex flex-wrap gap-x-4">
              {essentials.map((food) => <Link key={food.id} to={`/foods/${food.slug}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-accent hover:underline">{food.name.split(" /")[0]}</Link>)}
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1" aria-label="مفتاح الحالات">
          <span className="me-2 text-sm text-muted">حالات الأطعمة وفقًا للنظام:</span>
          {STATUS_ORDER.map((status) => <Link key={status} to={`/foods?status=${status}`} className="inline-flex min-h-11 items-center"><FoodStatusBadge status={status} size="sm" /></Link>)}
        </div>
      </section>

      {/* Categories */}
      <section className="border-y-2 border-line bg-bg-2 py-16 md:py-24">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading index="02" kicker="الفئات" title="تصفح حسب الفئة" description="الشريط السفلي في كل بطاقة يوضح توزيع الحالات داخل الفئة." className="mb-0" />
            <LinkButton to="/foods" variant="secondary">دليل الأطعمة الكامل</LinkButton>
          </div>
          <motion.div variants={motionPresets.staggerContainer} initial="hidden" whileInView="show" viewport={viewportOnce} className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {categories.slice(0, 10).map((c) => <CategoryCard key={c.id} category={c} />)}
          </motion.div>
        </div>
      </section>

      <SystemEditorial />

      {/* Intro */}
      <section className="border-y-2 border-line bg-bg-2 py-16 md:py-24">
        <div className="container-x">
          <SectionHeading index="04" kicker="تعرّف على النظام" title="ما هو نظام الطيبات؟" description={philosophy.coreIdea} />
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
        <SectionHeading index="05" kicker="مبادئ النظام" title="مبادئ منسوبة للنظام" description="عناوين محفوظة للمراجعة؛ افتح كل مبدأ لحدود توثيقه، ولا تعتبره جدولًا غذائيًا مؤكدًا." />
        <motion.div variants={motionPresets.staggerContainer} initial="hidden" whileInView="show" viewport={viewportOnce} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {principles.map((p) => <PrincipleCard key={p.id} principle={p} />)}
        </motion.div>
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

      {/* FAQ teaser */}
      <section className="container-x py-16 md:py-24">
        <SectionHeading index="08" kicker="أسئلة وإجابات" title="أسئلة شائعة" />
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
