import { Printer, ShieldAlert } from "lucide-react";
import { foods } from "@/data/foods";
import { principles } from "@/data/principles";
import { usePageMeta } from "@/hooks/usePageMeta";
import { toArabicDigits } from "@/lib/arabic";
import { Button } from "@/components/ui/Button";

export default function PrintPage() {
  usePageMeta("دليل الطباعة للثلاجة والمطبخ", "نسخة قابلة للطباعة A4 تلخص أساسيات وقواعد وقوائم نظام الطيبات.");

  const essentials = foods.filter((f) => f.essential);
  const compatible = foods.filter((f) => f.status === "compatible");
  const conditional = foods.filter((f) => f.status === "conditional");
  const notRecommended = foods.filter((f) => f.status === "notRecommended");
  const disputed = foods.filter((f) => f.status === "disputed");
  const unknown = foods.filter((f) => f.status === "unknown");

  return (
    <div className="container-x py-8 md:py-12 print:p-0 print:m-0 print:max-w-none">
      {/* On-screen control bar (hidden in print) */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-2 border-line bg-surface p-4 print:hidden">
        <div>
          <div className="mono text-xs text-accent">// وثيقة قابلة للطباعة (A4)</div>
          <h1 className="text-xl font-bold">دليل المطبخ والثلاجة — نظام الطيبات</h1>
          <p className="text-xs text-ink-2">
            تم تنسيق هذه الصفحة لتُطبع بشكل احترافي على ورق A4 (أبيض وأسود أو ملون). تُخفي تلقائيًا أشرطة التنقل والأزرار.
          </p>
        </div>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="size-4" /> اطبع الآن (Ctrl+P)
        </Button>
      </div>

      {/* Printable Sheet Container */}
      <article className="border-2 border-line bg-surface p-6 text-ink print:border-none print:p-0 print:bg-white print:text-black">
        {/* Header */}
        <header className="border-b-2 border-line pb-4 print:border-black">
          <div className="flex items-start justify-between">
            <div>
              <span className="mono text-xs uppercase tracking-wider text-muted print:text-gray-600">
                Al-Tayyibat Reference Guide • نظام الطيبات
              </span>
              <h2 className="text-2xl font-bold md:text-3xl print:text-2xl print:font-black">
                الدليل المرجعي السريع للمطبخ
              </h2>
              <p className="text-xs text-muted print:text-gray-700">
                مبني على محاضرات وإرشادات د. ضياء العوضي • دليل توعوي غير مخصص للاستشارات الطبية الشخصية
              </p>
            </div>
            <div className="mono text-end text-xs border border-line p-2 print:border-black">
              <div>التاريخ: 2026</div>
              <div>الأصناف: {toArabicDigits(foods.length)}</div>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 text-[11px] text-muted print:text-gray-800">
            <ShieldAlert className="size-3.5 shrink-0" />
            <span>
              <strong>تنبيه طبي:</strong> لا توقف أي دواء مزمن (سكري، ضغط، كلى) دون استشارة طبيبك المعالج.
            </span>
          </div>
        </header>

        {/* Section 1: The 5 Essentials */}
        <section className="mt-4 border-b-2 border-line pb-4 print:border-black">
          <h3 className="mono mb-2 text-xs font-bold text-accent print:text-black">// 01 الأساسيات الخمسة (تؤكل يوميًا)</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 print:grid-cols-5 text-xs">
            {essentials.map((f) => (
              <div key={f.id} className="border border-line p-2 print:border-black">
                <div className="font-bold text-sm">{f.name.split(" /")[0]}</div>
                <div className="text-[11px] text-muted print:text-gray-600">{f.shortDescription}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: The 6 Golden Rules */}
        <section className="mt-4 border-b-2 border-line pb-4 print:border-black">
          <h3 className="mono mb-2 text-xs font-bold text-accent print:text-black">// 02 القواعد الست الذهبية (السلوك أهم من القائمة)</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 print:grid-cols-3 text-xs">
            {principles.map((p) => (
              <div key={p.id} className="border border-line p-2 print:border-black">
                <span className="mono font-bold text-accent print:text-black me-1">{toArabicDigits(p.number)}.</span>
                <strong className="text-xs">{p.title}:</strong>
                <p className="mt-0.5 text-[11px] text-ink-2 print:text-gray-700 leading-tight">{p.summary}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Allowed vs Conditional vs Forbidden */}
        <section className="mt-4 grid gap-4 md:grid-cols-3 print:grid-cols-3 text-xs">
          {/* Compatible */}
          <div className="border border-line p-3 print:border-black">
            <div className="mb-2 flex items-center justify-between border-b pb-1 border-line print:border-black">
              <span className="font-bold text-sm text-status-ok print:text-black">✓ من الطيبات (مسموح)</span>
              <span className="mono text-[10px]">{toArabicDigits(compatible.length)} صنفًا</span>
            </div>
            <p className="text-[10px] text-muted print:text-gray-600 mb-2">أطعمة معتمدة ضمن القائمة:</p>
            <ul className="space-y-1 text-[11px] leading-snug">
              {compatible.slice(0, 26).map((f) => (
                <li key={f.id} className="flex items-start gap-1">
                  <span className="text-status-ok print:text-black">•</span>
                  <span>{f.name}</span>
                </li>
              ))}
              {compatible.length > 26 && (
                <li className="mono text-[10px] text-muted print:text-gray-600">
                  + {toArabicDigits(compatible.length - 26)} أصناف إضافية بالدليل الإلكتروني
                </li>
              )}
            </ul>
          </div>

          {/* Conditional */}
          <div className="border border-line p-3 print:border-black">
            <div className="mb-2 flex items-center justify-between border-b pb-1 border-line print:border-black">
              <span className="font-bold text-sm text-status-cond print:text-black">⚠ مسموح بشروط / قيود</span>
              <span className="mono text-[10px]">{toArabicDigits(conditional.length)} صنفًا</span>
            </div>
            <p className="text-[10px] text-muted print:text-gray-600 mb-2">مسموح مع الالتزام بالشرط:</p>
            <ul className="space-y-1 text-[11px] leading-snug">
              {conditional.map((f) => (
                <li key={f.id} className="flex items-start gap-1">
                  <span className="text-status-cond print:text-black">•</span>
                  <div>
                    <span className="font-semibold">{f.name.split(" (")[0]}:</span>{" "}
                    <span className="text-muted print:text-gray-700 text-[10px]">
                      {f.restrictions?.[0]?.includes("[CONTENT REQUIRED]") ? f.shortDescription : (f.restrictions?.[0] || f.shortDescription)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Not Recommended */}
          <div className="border border-line p-3 print:border-black">
            <div className="mb-2 flex items-center justify-between border-b pb-1 border-line print:border-black">
              <span className="font-bold text-sm text-status-no print:text-black">✕ ممنوعات النظام (تجنب)</span>
              <span className="mono text-[10px]">{toArabicDigits(notRecommended.length)} صنفًا</span>
            </div>
            <p className="text-[10px] text-muted print:text-gray-600 mb-2">محظورات صريحة في مواد النظام:</p>
            <ul className="space-y-1 text-[11px] leading-snug">
              {notRecommended.slice(0, 24).map((f) => (
                <li key={f.id} className="flex items-start gap-1">
                  <span className="text-status-no print:text-black">•</span>
                  <span>{f.name}</span>
                </li>
              ))}
              {notRecommended.length > 24 && (
                <li className="mono text-[10px] text-muted print:text-gray-600">
                  + {toArabicDigits(notRecommended.length - 24)} أصناف إضافية بالدليل الإلكتروني
                </li>
              )}
            </ul>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-4 border-t-2 border-line pt-2 flex flex-wrap items-center justify-between text-[10px] text-muted print:border-black print:text-gray-600">
          <div>
            قاعدة ذهبية: <strong>غير موجود في الدليل ≠ ممنوع</strong> • الإحصاء الموثق: {toArabicDigits(compatible.length)} مسموح • {toArabicDigits(conditional.length)} مشروط • {toArabicDigits(notRecommended.length)} ممنوع • {toArabicDigits(disputed.length)} مختلف عليه{unknown.length > 0 ? ` • ${toArabicDigits(unknown.length)} غير محسوم` : ""} = {toArabicDigits(foods.length)} صنفاً.
          </div>
          <div className="mono">
            نظام الطيبات — الدليل التفاعلي • yousefe1bana.github.io/al-tayyibat/
          </div>
        </footer>
      </article>
    </div>
  );
}
