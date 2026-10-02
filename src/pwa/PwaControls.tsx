import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Sheet } from "@/components/ui/Dialog";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePwa } from "./PwaProvider";

const buttonClass = "inline-flex min-h-11 items-center justify-center gap-2 border-2 border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-accent hover:text-accent-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:opacity-60";
const dismissalDuration = 14 * 24 * 60 * 60 * 1000;
const normalizeDismissal = (value: unknown) => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= Date.now() + dismissalDuration ? value : 0;

function InstallHelp({ open, onOpenChange }: { open: boolean; onOpenChange(open: boolean): void }) {
  return <Sheet open={open} onOpenChange={onOpenChange} title="تثبيت الدليل على iPhone أو iPad" description="خطوات التثبيت من قائمة المتصفح" mode="center">
    <ol className="list-inside list-decimal space-y-3 p-5 text-sm leading-relaxed">
      <li>افتح الدليل في Safari.</li>
      <li>اضغط على «مشاركة» (Share).</li>
      <li>اختر «إضافة إلى الشاشة الرئيسية» (Add to Home Screen)، ثم «إضافة».</li>
    </ol>
  </Sheet>;
}

/** An early, in-flow invitation: never covers the guide or opens a native prompt automatically. */
export function InstallNudge() {
  const pwa = usePwa();
  const [dismissedUntil, setDismissedUntil] = useLocalStorage("install-nudge-until", 0, normalizeDismissal);
  const [helpOpen, setHelpOpen] = useState(false);
  if ((!pwa.canInstall && !pwa.iosHelp) || pwa.waiting || dismissedUntil > Date.now()) return null;
  return <div className="container-x py-6 print:hidden">
    <aside aria-label="تثبيت الدليل" className="border-2 border-line bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-5">
      <div className="min-w-0">
        <h2 className="text-base font-bold leading-relaxed">ثبّت دليل الطيبات على جهازك</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-2">افتحه كتطبيق واستخدم البحث والدليل حتى بدون اتصال.</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">الصور متاحة دون اتصال بعد فتحها سابقًا.</p>
      </div>
      <div className="mt-3 flex shrink-0 flex-wrap gap-2 sm:mt-0">
        <button type="button" className={buttonClass} onClick={() => pwa.canInstall ? void pwa.install() : setHelpOpen(true)}><Download className="size-4" aria-hidden />تثبيت</button>
        <button type="button" className="min-h-11 px-3 text-sm underline decoration-line-soft underline-offset-4 hover:text-accent" onClick={() => setDismissedUntil(Date.now() + dismissalDuration)}>لاحقًا</button>
      </div>
    </aside>
    <InstallHelp open={helpOpen && pwa.iosHelp} onOpenChange={setHelpOpen} />
  </div>;
}

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
    <InstallHelp open={helpOpen && pwa.iosHelp} onOpenChange={setHelpOpen} />
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
