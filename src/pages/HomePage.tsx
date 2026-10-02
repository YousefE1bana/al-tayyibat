import { motion } from "framer-motion";
import { ArrowUpLeft, ListChecks, ShieldAlert, ShoppingBasket } from "lucide-react";
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
import { motionPresets, viewportOnce } from "@/lib/motion";
import { STATUS_ORDER } from "@/lib/status";
import { toArabicDigits } from "@/lib/arabic";
import { LinkButton } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/SmartImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DoctorPortrait } from "@/features/doctor/DoctorPortrait";
import { CategoryCard } from "@/features/foods/CategoryCard";
import { FoodStatusBadge } from "@/features/foods/FoodStatusBadge";
import { QuickChecker } from "@/features/foods/QuickChecker";
import { PrincipleCard } from "@/features/principles/PrincipleCard";
import { RecipeCard } from "@/features/recipes/RecipeCard";

const HERO_FOODS = ["basmati-rice", "potatoes", "eggs"];

function Hero() {
  const examples = HERO_FOODS.map((id) => foods.find((food) => food.id === id)).filter((food) => food !== undefined);
  return (
    <section className="relative border-b-2 border-line">
      <div className="grid-dots pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="container-x relative grid items-center gap-10 py-10 md:grid-cols-[1.15fr_0.85fr] md:gap-8 md:py-14 xl:gap-16 xl:py-20">
        <motion.div variants={motionPresets.staggerContainer} initial="hidden" animate="show" className="min-w-0">
          <motion.p variants={motionPresets.fadeUp} className="mb-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-muted">
            <span className="border-2 border-line bg-surface px-3 py-1 text-ink">{toArabicDigits(foods.length)} طعامًا في دليل واحد</span>
            <span>بدون حساب · بدون تتبع</span>
          </motion.p>
          <motion.h1 variants={motionPresets.fadeUp} className="text-5xl font-bold leading-[1.2] lg:text-6xl xl:text-7xl 2xl:text-8xl">
            نظام <span className="text-accent">الطيبات</span>
          </motion.h1>
          <motion.p variants={motionPresets.fadeUp} className="mt-4 max-w-xl text-base leading-relaxed text-ink-2 lg:text-lg">
            ابحث عن طعام، وافهم حالته وشروطه وبدائله وفقًا لنظام الدكتور ضياء العوضي.
            دليل معلوماتي، وليس بديلًا عن نصيحة طبيبك.
          </motion.p>
          <motion.div variants={motionPresets.fadeUp} className="mt-6 max-w-2xl">
            <QuickChecker id="quick-check" />
          </motion.div>
          <motion.div variants={motionPresets.fadeUp} className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold">
            <Link to="/foods" className="inline-flex min-h-11 items-center gap-2 text-accent hover:underline">تصفح دليل الأطعمة <ArrowUpLeft className="size-4" aria-hidden /></Link>
            <Link to="/how-it-works" className="inline-flex min-h-11 items-center gap-2 text-ink-2 hover:text-ink">جديد على النظام؟ ابدأ من هنا <ArrowUpLeft className="size-4" aria-hidden /></Link>
          </motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="min-w-0">
          <div className="mb-4 flex items-center justify-between border-b-2 border-line pb-3">
            <p className="text-sm font-semibold">من دليل الأطعمة</p>
            <span className="mono text-xs text-muted">صور وتفاصيل لكل صنف</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {examples.map((food, i) => (
              <Link key={food.id} to={`/foods/${food.slug}`} className={`brut brut-hover group overflow-hidden bg-surface ${i === 0 ? "col-span-2" : "hidden sm:block"}`}>
                <SmartImage src={food.image} alt={food.name} loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "auto"}
                  className={i === 0 ? "aspect-[4/3]" : "aspect-[16/10]"} imgClassName="food-image" />
                <div className={i === 0 ? "flex flex-wrap items-center justify-between gap-2 p-3" : "flex min-h-24 flex-col items-start gap-2 p-3"}>
                  <span className="text-sm font-bold lg:text-base">{food.name}</span>
                  <FoodStatusBadge status={food.status} size="sm" className={i > 0 ? "mt-auto" : undefined} />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function HomePage() {
  usePageMeta(undefined, "دليل تفاعلي عربي لنظام الطيبات للدكتور ضياء العوضي: ابحث عن أي طعام واعرف موقعه في النظام.");
  const essentials = foods.filter((f) => f.essential);

  return (
    <>
      <Hero />

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
        <SectionHeading index="09" kicker="أسئلة وإجابات" title="أسئلة شائعة" />
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
