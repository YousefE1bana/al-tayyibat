import { motion } from "framer-motion";
import { BadgeCheck, CircleHelp, Quote } from "lucide-react";
import { doctor } from "@/data/doctor";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motionPresets, viewportOnce } from "@/lib/motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TableOfContents } from "@/components/ui/TableOfContents";
import { DoctorPortrait } from "@/features/doctor/DoctorPortrait";
import { EvidenceLabel, SourceRefs } from "@/features/sources/SourceReference";
import { cn } from "@/utils/cn";

const TOC = [
  { id: "bio", label: "السيرة" },
  { id: "timeline", label: "الخط الزمني" },
  { id: "quotes", label: "تصريحات موثقة" },
  { id: "unverified", label: "ما لم نتحقق منه" },
];

export default function DoctorPage() {
  usePageMeta(doctor.displayName, "سيرة الدكتور ضياء العوضي: التعليم، المسيرة، نظام الطيبات، والخط الزمني — من مصادر موثقة.");

  return (
    <div className="container-x py-10 md:py-16">
      <header className="grid gap-8 md:grid-cols-[240px_minmax(0,1fr)] md:items-center xl:grid-cols-[360px_minmax(0,1fr)] xl:gap-14">
        <div className="brut mx-auto aspect-[4/5] w-full max-w-[240px] overflow-hidden md:mx-0 xl:max-w-sm">
          <DoctorPortrait className="h-full w-full" />
        </div>
        <div>
          <div className="mono mb-3 text-xs text-accent">// عن الدكتور</div>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">{doctor.displayName}</h1>
          <p className="mono mt-2 text-sm text-muted">{doctor.fullName}</p>
          <dl className="mono mt-6 grid gap-2 text-xs sm:grid-cols-2">
            {[
              ["الميلاد", doctor.born],
              ["الوفاة", doctor.died],
              ["الجنسية", doctor.nationality],
              ["التخصص", doctor.specialty],
              ["الجامعة", doctor.almaMater],
            ].map(([k, v]) => (
              <div key={k} className="border-2 border-line-soft bg-surface p-3">
                <dt className="text-muted">{k}</dt>
                <dd className="mt-0.5 font-sans text-sm font-semibold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="mt-16 grid gap-12 lg:grid-cols-[240px_1fr]">
        <TableOfContents items={TOC} className="hidden lg:sticky lg:top-28 lg:block lg:self-start" />
        <div className="min-w-0 space-y-16 md:space-y-20">
          <section id="bio" className="scroll-mt-28">
            <SectionHeading index="01" title="السيرة" />
            <div className="prose-ar space-y-5 text-ink-2">
              {doctor.bio.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
            </div>
            <SourceRefs ids={["wikipedia-ar"]} className="mt-5" />
          </section>

          <section id="timeline" className="scroll-mt-28">
            <SectionHeading index="02" title="الخط الزمني" description="الأحداث الموسومة ✓ موثقة من مصدر موسوعي/صحفي مستقل؛ الموسومة ? وردت في مصادر ثانوية فقط." />
            <ol className="relative border-s-2 border-line ps-8">
              {doctor.timeline.map((t) => (
                <motion.li key={t.id} variants={motionPresets.fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce} className="relative pb-10 last:pb-0">
                  <span className={cn("absolute -start-[calc(2rem+13px)] top-1 flex size-6 items-center justify-center border-2 border-line", t.verified ? "bg-status-ok text-bg" : "bg-surface text-status-unknown")} title={t.verified ? "موثق" : "غير متحقق منه"}>
                    {t.verified ? <BadgeCheck className="size-3.5" /> : <CircleHelp className="size-3.5" />}
                  </span>
                  <div className="mono text-xs text-accent">{t.year}</div>
                  <h3 className="mt-1 text-xl font-bold">{t.title}</h3>
                  <p className="mt-1 text-ink-2">{t.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {!t.verified && <EvidenceLabel level="unverified" />}
                    <SourceRefs ids={t.sourceIds} />
                  </div>
                </motion.li>
              ))}
            </ol>
          </section>

          <section id="quotes" className="scroll-mt-28">
            <SectionHeading index="03" title="تصريحات موثقة" description="نُثبت فقط ما نقلته مصادر محددة، مع نسبته إليها. هذه تصريحات صاحب النظام لا حقائق علمية." />
            <div className="grid gap-4 md:grid-cols-2">
              {doctor.quotes.map((q) => (
                <blockquote key={q.text} className="brut relative bg-surface-2 p-6">
                  <Quote className="absolute end-4 top-4 size-6 text-accent/40" aria-hidden />
                  <p className="text-lg font-semibold leading-relaxed">«{q.text}»</p>
                  <footer className="mono mt-4 text-xs text-muted">— {q.attribution}</footer>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <EvidenceLabel level="claim" />
                    <SourceRefs ids={[q.sourceId]} />
                  </div>
                </blockquote>
              ))}
            </div>
          </section>

          <section id="unverified" className="scroll-mt-28">
            <SectionHeading index="04" title="ما لم نتحقق منه" description="شفافية كاملة: هذه نقاط لم نجد لها توثيقًا مستقلًا، أو تحتاج محتوى إضافيًا." />
            <ul className="space-y-2">
              {doctor.unverified.map((u) => (
                <li key={u} className="flex gap-3 border-2 border-dashed border-line-soft bg-surface p-4 text-sm text-ink-2">
                  <CircleHelp className="mt-0.5 size-4 shrink-0 text-status-unknown" /> {u.replace(/\[CONTENT REQUIRED\]\s*/g, u.includes("—") ? "" : "لم نجد توثيقًا مستقلًا")}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
