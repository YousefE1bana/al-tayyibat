import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Sheet } from "@/components/ui/Dialog";
import { usePwa } from "./PwaProvider";

const buttonClass = "inline-flex min-h-11 items-center justify-center gap-2 border-2 border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-accent hover:text-accent-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:opacity-60";

export function InstallControl() {
  const pwa = usePwa();
  const [helpOpen, setHelpOpen] = useState(false);
  return <>
    {(pwa.canInstall || pwa.iosHelp) && <div className="mt-4">
      <button type="button" className={buttonClass} onClick={() => pwa.canInstall ? void pwa.install() : setHelpOpen(true)}>
        <Download className="size-4" aria-hidden /> ثبّت الدليل
      </button>
      <p className="mt-2 text-xs leading-relaxed text-muted">بحث ومحفوظات على جهازك، حتى دون اتصال. الصور حسب ما فتحته سابقًا.</p>
    </div>}
    {pwa.offline && <p role="status" className="mt-4 border-2 border-line-soft bg-surface p-3 text-sm leading-relaxed text-ink-2">
      {pwa.offlineReady ? "أنت دون اتصال. الدليل والبحث متاحان؛ الصور التي لم تفتحها تحتاج اتصالًا." : "أنت دون اتصال. يحتاج تجهيز الدليل للاستخدام دون اتصال إلى زيارة متصلة أولًا."}
    </p>}
    {pwa.error && <p role="status" className="mt-2 text-sm text-ink-2">{pwa.error}</p>}
    <Sheet open={helpOpen && pwa.iosHelp} onOpenChange={setHelpOpen} title="تثبيت الدليل على iPhone أو iPad" description="خطوات التثبيت من قائمة المتصفح" mode="center">
      <ol className="list-inside list-decimal space-y-3 p-5 text-sm leading-relaxed">
        <li>افتح الدليل في Safari.</li>
        <li>اضغط على «مشاركة» (Share).</li>
        <li>اختر «إضافة إلى الشاشة الرئيسية» (Add to Home Screen)، ثم «إضافة».</li>
      </ol>
    </Sheet>
  </>;
}

export function UpdateControl() {
  const { waiting, updating, update } = usePwa();
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => setDismissed(false), [waiting]);
  if (!waiting || dismissed) return null;
  return <aside aria-label="تحديث الدليل" className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] start-[max(1rem,env(safe-area-inset-right))] end-[max(1rem,env(safe-area-inset-left))] z-50 max-w-sm border-2 border-line bg-bg p-4 text-ink shadow-[-4px_4px_0_var(--shadow)] sm:end-auto">
    <p role="status" className="text-sm font-semibold">يتوفر تحديث جديد</p>
    <p className="mt-1 text-xs leading-relaxed text-muted">حدّث عندما تنتهي؛ ستُعاد الصفحة وتبقى محفوظاتك على الجهاز.</p>
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="button" disabled={updating} className={buttonClass} onClick={update}><RefreshCw className="size-4" aria-hidden />{updating ? "جارٍ التحديث..." : "تحديث الآن"}</button>
      <button type="button" disabled={updating} className="min-h-11 px-3 text-sm underline decoration-line-soft underline-offset-4 hover:text-accent" onClick={() => setDismissed(true)}>لاحقًا</button>
    </div>
  </aside>;
}
