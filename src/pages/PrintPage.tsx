import { Printer, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { foods } from "@/data/foods";
import { principles } from "@/data/principles";
import { usePageMeta } from "@/hooks/usePageMeta";
import { toArabicDigits } from "@/lib/arabic";
import { STATUS_META } from "@/lib/status";
import type { Food, FoodStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { BrandMark } from "@/components/brand/BrandMark";

const groups: { status: FoodStatus; title: string; printLimit?: number }[] = [
  { status: "compatible", title: "المسموح", printLimit: 32 },
  { status: "conditional", title: "المسموح بشروط", printLimit: 10 },
  { status: "notRecommended", title: "الممنوع في النظام", printLimit: 27 },
  { status: "disputed", title: "المختلف عليه" },
  { status: "unknown", title: "غير الموثق" },
];
const byStatus = (status: FoodStatus) => foods.filter(food => food.status === status);
const essentials = foods.filter(food => food.essential);
const disclaimer = "التصنيفات تصف الدليل ولا تقرر ملاءمة الطعام لحالتك. تفاصيل محفوظة من النسخة السابقة تحتاج توثيقًا مباشرًا؛ لا توقف دواءً أو تغيّر علاجًا بناءً عليها.";

function FoodNames({ rows, conditions = false }: { rows: Food[]; conditions?: boolean }) {
  return <ul className={conditions ? "kitchen-conditions" : "kitchen-names"}>
    {rows.map(food => <li key={food.id}>
      <Link to={`/foods/${food.slug}`} className="font-semibold hover:underline">{food.name}</Link>
      {conditions && <p className="mt-1 text-sm text-muted">{food.restrictions?.[0] || "تفاصيل الشرط تحتاج توثيقًا مباشرًا."}</p>}
    </li>)}
  </ul>;
}

function PrintedFoods({ status }: { status: FoodStatus }) {
  const group = groups.find(item => item.status === status)!;
  const all = byStatus(status);
  const selected = all.slice(0, group.printLimit ?? all.length);
  return <section className="print-food-group" data-status={status}>
    <h3>{STATUS_META[status].symbol} {group.title}</h3>
    <p className="print-selection">{selected.length === all.length ? "كل إدخالات هذه الفئة" : `مختارات: ${toArabicDigits(selected.length)} من ${toArabicDigits(all.length)} — القائمة الكاملة في الدليل التفاعلي`}</p>
    {status === "conditional" && <p className="print-selection">أول شرط محفوظ لكل صنف؛ الشروط الكاملة وحدود توثيقها في صفحته.</p>}
    <FoodNames rows={selected} conditions={status === "conditional"} />
  </section>;
}

function SheetHeader({ number, title }: { number: number; title: string }) {
  return <header className="kitchen-sheet-header">
    <div className="flex items-center gap-3"><BrandMark size="display" /><div><p>نظام الطيبات • مرجع مختصر</p><h2>{title}</h2></div></div>
    <span>صفحة {toArabicDigits(number)} / ٣</span>
  </header>;
}
function SheetFooter() {
  return <footer className="kitchen-sheet-footer"><p>{disclaimer}</p><p dir="ltr">yousefe1bana.github.io/al-tayyibat/#/foods</p></footer>;
}

export default function PrintPage() {
  usePageMeta("دليل المطبخ والثلاجة", "مرجع مختصر من ثلاث صفحات A4، مع قوائم الدليل التفاعلي وحدود توثيقها.");
  return <div className="container-x kitchen-guide py-10 md:py-16">
    <div className="kitchen-screen space-y-10">
      <header className="grid gap-6 border-b-2 border-line pb-8 md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-2xl"><p className="mono mb-3 text-xs text-accent">// مرجع قريب من يدك</p><h1 className="text-3xl font-bold leading-tight md:text-5xl">دليل المطبخ والثلاجة</h1><p className="mt-4 text-lg text-ink-2">راجع الأصناف على الشاشة، واطبع مختارات واضحة في ثلاث صفحات A4. النسخة الورقية مرجع مختصر، وليست قائمة كاملة أو خطة غذائية.</p></div>
        <Button onClick={() => window.print()} className="gap-2"><Printer className="size-4" aria-hidden />اطبع الدليل — ٣ صفحات</Button>
      </header>
      <aside className="border-s-4 border-accent bg-surface p-5 text-sm leading-relaxed text-ink-2">{disclaimer}<p className="mt-2">المختلف عليه يظل مختلفًا عليه، وغير الموثق لا يعني ممنوعًا. الطهي أو النقع لا يثبتان استثناء تلقائيًا.</p></aside>
      <section aria-labelledby="kitchen-essentials"><h2 id="kitchen-essentials" className="mb-2 text-2xl font-bold">١. الأساسيات</h2><p className="mb-5 text-muted">خمسة أصناف موسومة في النسخة السابقة؛ لم تتأكد نسبتها كقائمة يومية أو كميات محددة.</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{essentials.map(food => <Link key={food.id} to={`/foods/${food.slug}`} className="brut brut-hover bg-surface p-5"><h3 className="font-bold">{food.name}</h3><span className="mt-3 inline-flex items-center gap-2 text-sm text-muted">تفاصيل الصنف<ArrowUpRight className="size-4" aria-hidden /></span></Link>)}</div></section>
      <section aria-labelledby="kitchen-rules"><h2 id="kitchen-rules" className="mb-2 text-2xl font-bold">٢. القواعد الأساسية وحدود توثيقها</h2><p className="mb-5 text-muted">عناوين متداولة محفوظة للمراجعة؛ لا تُعرض كنسب أو جدول غذائي مؤكد.</p><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{principles.map(principle => <article key={principle.id} className="border-2 border-line-soft bg-surface p-5"><span className="mono text-sm text-accent">{toArabicDigits(principle.number)}</span><h3 className="mt-2 font-bold">{principle.title}</h3><p className="mt-2 text-sm leading-relaxed text-ink-2">{principle.summary}</p></article>)}</div></section>
      <section aria-labelledby="kitchen-lists"><h2 id="kitchen-lists" className="mb-5 text-2xl font-bold">٣. قوائم الأصناف</h2><div className="space-y-5">{groups.map(group => {
        const rows = byStatus(group.status);
        return <article key={group.status} className="border-2 border-line bg-surface p-5 md:p-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-bold"><span className={STATUS_META[group.status].twText}>{STATUS_META[group.status].symbol}</span> {group.title}</h3><span className="mono text-sm text-muted">{toArabicDigits(rows.length)} صنفًا</span></div>
          <p className="mb-5 text-sm text-muted">{STATUS_META[group.status].description}</p><FoodNames rows={rows.slice(0, 12)} />
          {rows.length > 12 && <details className="mt-5 border-t border-line-soft pt-3"><summary className="min-h-11 cursor-pointer py-2 font-semibold text-accent">عرض باقي الأصناف ({toArabicDigits(rows.length - 12)})</summary><div className="pt-4"><FoodNames rows={rows.slice(12)} /></div></details>}
          {group.printLimit && <p className="mt-5 text-xs text-muted">النسخة الورقية تضم {toArabicDigits(group.printLimit)} مختارًا من هذه الفئة؛ التفاصيل والشروط الكاملة في صفحة كل صنف.</p>}
        </article>;
      })}</div></section>
      <section className="border-2 border-line-soft bg-bg-2 p-6"><h2 className="text-lg font-bold">ما الذي سيُطبع؟</h2><ol className="mt-3 grid gap-4 text-sm text-ink-2 md:grid-cols-3"><li>١. الأساسيات، عناوين المبادئ، معاني الحالات والتذكيرات.</li><li>٢. مختارات المسموح والمشروط مع أول شرط محفوظ.</li><li>٣. مختارات الممنوع وكل المختلف عليه وغير الموثق، ورابط الدليل الكامل.</li></ol><p className="mt-4 text-sm text-muted">اختر A4 عموديًا، ومقياس ١٠٠٪، وأوقف ترويسة وتذييل المتصفح. الألوان اختيارية؛ العناوين والرموز تظل واضحة بالأبيض والأسود.</p></section>
    </div>
    <div className="kitchen-print">
      <article className="kitchen-sheet"><SheetHeader number={1} title="الأساسيات وطريقة قراءة الدليل" />
        <section><h3>الأساسيات الخمسة</h3><p>تسمية محفوظة من النسخة السابقة؛ لم تثبت توصية بتناولها يوميًا أو بكميات محددة.</p><div className="print-essentials">{essentials.map(food => <strong key={food.id}>{food.name}</strong>)}</div></section>
        <section><h3>عناوين المبادئ المنسوبة للنظام</h3><p>تفاصيلها تحتاج مصدرًا مباشرًا؛ ليست تعليمات طبية أو جدولًا موثقًا.</p><div className="print-principles">{principles.map(principle => <div key={principle.id}><h4>{toArabicDigits(principle.number)}. {principle.title}</h4><p>{principle.summary}</p></div>)}</div></section>
        <section><h3>اقرأ الحالة مع حدود توثيقها</h3><ul className="print-legend">{groups.map(group => <li key={group.status}><strong>{STATUS_META[group.status].symbol} {group.title}</strong><p>{STATUS_META[group.status].description}</p></li>)}</ul></section>
        <section><h3>تذكيرات للمراجعة</h3><p>ابحث عن الصنف المحدد. لا تعمم حكم البقوليات أو الخضار على كل أفرادها. الطهي أو النقع ليسا استثناء تلقائيًا. الوصفات اقتراحات تحريرية وليست وجبات موثقة عن الدكتور.</p></section><SheetFooter />
      </article>
      <article className="kitchen-sheet"><SheetHeader number={2} title="مختارات المسموح والمشروط" /><p className="print-intro">مرجع مختصر من تصنيفات الدليل؛ الشروط والتصنيفات غير المتحققة تبقى محفوظة للمراجعة. ليست موافقة طبية على الطعام أو الكمية.</p><div className="print-two-columns"><PrintedFoods status="compatible" /><PrintedFoods status="conditional" /></div><SheetFooter /></article>
      <article className="kitchen-sheet"><SheetHeader number={3} title="مختارات الممنوع والحالات غير المحسومة" /><p className="print-intro">هذه حالات داخل الدليل. غياب صنف من الورقة لا يعني أنه مسموح أو ممنوع؛ ارجع للقائمة الكاملة.</p><PrintedFoods status="notRecommended" /><div className="print-two-columns"><PrintedFoods status="disputed" /><PrintedFoods status="unknown" /></div><section><h3>للتفاصيل والبحث</h3><p>الدليل التفاعلي يضم {toArabicDigits(foods.length)} صنفًا، ويعرض شروط كل إدخال وملاحظة توثيقه. راجع الصفحة الكاملة قبل استخدام معلومة مختصرة.</p></section><SheetFooter /></article>
    </div>
  </div>;
}
