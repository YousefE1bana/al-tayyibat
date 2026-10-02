import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BotanicalSprig } from "@/components/brand/BotanicalSprig";
import { doctorAssets } from "@/config/doctor-assets";
import { doctor } from "@/data/doctor";
import { startSteps } from "@/data/guide";
import { toArabicDigits } from "@/lib/arabic";
import { motionPresets, usePrefersReducedMotion, viewportOnce } from "@/lib/motion";
import { cn } from "@/utils/cn";
import { SourceRefs } from "@/features/sources/SourceReference";
import { DoctorEditorialPortrait } from "./DoctorEditorialPortrait";

export function SystemEditorial() {
  const reduced = usePrefersReducedMotion();
  const weeks = startSteps.slice(0, 4);
  const followUp = startSteps[4];
  const milestones = doctor.timeline.filter((event) => event.verified && ["t-1979", "t-postgrad"].includes(event.id));
  return (
    <section className="editorial-shell border-y-2 border-line py-12 md:py-16" aria-labelledby="system-editorial-heading">
      <div className="container-x">
        <header className="max-w-3xl">
          <p className="mono editorial-muted mb-3 text-xs">// من الدليل إلى التطبيق</p>
          <h2 id="system-editorial-heading" className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">كيف تتبع النظام؟</h2>
          <p className="editorial-muted mt-4 text-base md:text-lg">خطة الأربعة أسابيع كما وردت في الدليل — التدرّج مقصود، و«الانتقال المفاجئ» يُعد خطأً شائعًا.</p>
          <p className="editorial-muted mt-2 text-sm">دليل معلوماتي، وليس بديلًا عن نصيحة طبيبك.</p>
        </header>
        <div className="editorial-progression relative mt-8">
          <motion.div className="editorial-progress-line" aria-hidden="true"
            initial={reduced ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }}
            animate={reduced ? { scaleX: 1 } : undefined}
            viewport={viewportOnce} transition={{ duration: reduced ? 0 : 0.5 }} />
          <motion.ol variants={motionPresets.staggerContainer} initial={reduced ? false : "hidden"}
            animate={reduced ? "show" : undefined}
            whileInView="show" viewport={viewportOnce} className="editorial-weeks relative grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {weeks.map((step, i) => (
              <motion.li key={step.id} variants={motionPresets.fadeUp} className="min-w-0">
                <Link to={`/how-it-works#${step.id}`} className="editorial-step block h-full p-5">
                  <span className="mono editorial-step-number mb-5 flex size-10 items-center justify-center text-lg font-bold">{toArabicDigits(i + 1)}</span>
                  <h3 className="text-lg font-bold leading-relaxed">{step.title}</h3>
                  <p className="editorial-card-muted mt-3 text-sm leading-relaxed">{step.summary}</p>
                  <span className="editorial-card-accent mt-5 inline-block text-sm font-semibold">تفاصيل الأسبوع</span>
                </Link>
              </motion.li>
            ))}
          </motion.ol>
        </div>
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <p className="editorial-muted max-w-xl text-sm"><strong className="editorial-ink">{followUp.title}: </strong>{followUp.summary}</p>
          <Link to="/how-it-works" className="editorial-text-link inline-flex min-h-11 items-center text-sm font-semibold">الخطة كاملة مع نموذج اليوم</Link>
        </div>
        <div className="editorial-sources mt-2"><SourceRefs ids={[...new Set(weeks.flatMap((step) => step.sourceIds))]} /></div>

        <div className={cn("editorial-doctor relative mt-12 grid items-center gap-6 border-t-2 pt-10 md:mt-16 md:gap-8", doctorAssets.editorial && "lg:grid-cols-[0.8fr_1.2fr] lg:gap-12")}>
          <BotanicalSprig />
          {doctorAssets.editorial && <motion.figure initial={reduced ? false : { opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            animate={reduced ? { opacity: 1, y: 0 } : undefined}
            viewport={viewportOnce} transition={{ duration: reduced ? 0 : 0.32 }} className="editorial-portrait-frame relative mx-auto w-full max-w-sm">
            <DoctorEditorialPortrait className="w-full" />
            <figcaption className="editorial-muted px-4 py-3 text-sm">{doctor.displayName} · {doctor.almaMater}</figcaption>
          </motion.figure>}
          <article className={cn("editorial-card relative min-w-0 p-6 md:p-8", doctorAssets.editorial && "lg:-ms-6")}>
            <p className="mono editorial-card-accent mb-3 text-xs">// صاحب النظام</p>
            <h2 className="text-2xl font-bold leading-tight md:text-3xl">{doctor.displayName}</h2>
            <p className="editorial-card-muted mt-4 leading-relaxed">{doctor.bio[0]}</p>
            <dl className="mt-6 grid gap-3 border-y-2 py-5 sm:grid-cols-2">
              {milestones.map((event) => (
                <div key={event.id}>
                  <dt className="mono editorial-card-accent text-xs">{event.year}</dt>
                  <dd className="mt-1 text-sm font-semibold">{event.title}</dd>
                </div>
              ))}
            </dl>
            <div className="editorial-card-sources mt-4"><SourceRefs ids={["wikipedia-ar"]} /></div>
            <p className="editorial-card-muted mt-4 text-sm">اقرأ السيرة والخط الزمني، مع المصادر والموقف العلمي والمؤسسي من النظام.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/doctor" className="editorial-button inline-flex min-h-11 items-center justify-center px-4 py-2 text-sm font-semibold">السيرة الكاملة والخط الزمني</Link>
              <Link to="/foods" className="editorial-card-link inline-flex min-h-11 items-center text-sm font-semibold">تصفح دليل الأطعمة</Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
