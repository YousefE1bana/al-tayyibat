import { sources } from "@/data/sources";
import { usePageMeta } from "@/hooks/usePageMeta";
import { EVIDENCE_LABEL, SOURCE_TYPE_LABEL } from "@/lib/status";
import type { EvidenceLevel } from "@/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EvidenceLabel, SourceCard } from "@/features/sources/SourceReference";

const LEVELS: EvidenceLevel[] = ["strong", "moderate", "limited", "institutional", "claim", "unverified"];

export default function SourcesPage() {
  usePageMeta("المصادر", "قائمة المصادر المعتمدة في الدليل مع تقييم صريح لنوع كل مصدر وموثوقيته.");
  const types = Array.from(new Set(sources.map((s) => s.type)));

  return (
    <div className="container-x py-10 md:py-16">
      <header className="max-w-3xl">
        <div className="mono mb-3 text-xs text-accent">// المصادر</div>
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">المصادر والموثوقية</h1>
        <p className="mt-4 text-lg text-ink-2">
          لا تتساوى المصادر في القوة. لا يوجد — حتى الآن — مصدر أولي رسمي من الدكتور نفسه ولا ورقة علمية محكّمة تصف النظام؛ لذلك
          كل قوائم الأطعمة مستمدة من مصادر ثانوية مجتمعية أو صحفية، ونذكر ذلك في كل موضع.
        </p>
      </header>

      <section className="mt-12">
        <SectionHeading index="01" title="مفتاح مستويات الدليل" description="تظهر هذه الوسوم بجوار القواعد والادعاءات في الموقع." />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {LEVELS.map((l) => (
            <div key={l} className="brut-soft flex items-start gap-3 bg-surface p-4">
              <EvidenceLabel level={l} />
              <p className="text-sm text-ink-2">{EVIDENCE_LABEL[l].hint}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading index="02" title="المصادر المعتمدة" description="مرتبة حسب النوع. اضغط «فتح المصدر» للأصل." />
        <div className="space-y-10">
          {types.map((t) => (
            <div key={t}>
              <h3 className="mono mb-4 text-xs text-accent">// {SOURCE_TYPE_LABEL[t]}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {sources.filter((s) => s.type === t).map((s) => <SourceCard key={s.id} source={s} />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 brut bg-surface-2 p-6 md:p-8">
        <h2 className="text-2xl font-bold">مصادر مطلوبة</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-2">
          <li>▸ مادة رسمية أولية من الدكتور (كتاب، منشور، محاضرة موثقة بالرابط).</li>
          <li>▸ القائمة الكاملة للمسموحات/الممنوعات من مصدر أولي بدل الملخصات المجتمعية.</li>
          <li>▸ تقارير الجزيرة نت وCNN عربي والمصري اليوم المشار إليها في ويكيبيديا (لم تُقرأ مباشرة).</li>
        </ul>
      </section>
    </div>
  );
}
