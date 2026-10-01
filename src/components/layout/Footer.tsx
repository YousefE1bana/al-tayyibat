import { Link } from "react-router-dom";
import { NAV_ITEMS } from "./Navbar";

export function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-line bg-bg-2">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center border-2 border-line bg-accent text-lg font-bold text-accent-ink">ط</span>
            <span className="text-lg font-bold">نظام الطيبات — الدليل التفاعلي</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-2">
            دليل معلوماتي مستقل يشرح نظام الطيبات كما وثّقته المصادر المتاحة، ويميّز بوضوح بين قواعد النظام وتصريحات الدكتور ضياء
            العوضي والموقف العلمي والمؤسسي.
          </p>
          <p className="mono mt-4 border-2 border-line-soft bg-surface p-3 text-[12px] leading-relaxed text-muted">
            ⚠ هذا الموقع دليل معلوماتي وليس نصيحة طبية شخصية. لا توقف أي دواء ولا تغيّر نظامك الغذائي في الحالات المزمنة أو الحمل
            أو الطفولة دون استشارة طبيب.
          </p>
        </div>
        <nav aria-label="روابط الموقع">
          <h3 className="mono mb-3 text-xs text-accent">// الأقسام</h3>
          <ul className="grid gap-1.5 text-sm">
            {NAV_ITEMS.map((item: { to: string; label: string }) => (
              <li key={item.to}>
                <Link to={item.to} className="text-ink-2 hover:text-ink hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="أدوات">
          <h3 className="mono mb-3 text-xs text-accent">// أدوات ومرافق</h3>
          <ul className="grid gap-1.5 text-sm">
            <li><Link to="/alternatives" className="text-ink-2 hover:text-ink hover:underline font-bold text-accent">بدائل الأطعمة (جديد)</Link></li>
            <li><Link to="/ingredients" className="text-ink-2 hover:text-ink hover:underline font-bold text-accent">فاحص المكونات (جديد)</Link></li>
            <li><Link to="/print" className="text-ink-2 hover:text-ink hover:underline">دليل المطبخ للطباعة (A4)</Link></li>
            <li><Link to="/favorites" className="text-ink-2 hover:text-ink hover:underline">المحفوظات المفضلة</Link></li>
            <li><Link to="/shopping" className="text-ink-2 hover:text-ink hover:underline">دليل المشتريات</Link></li>
            <li><Link to="/foods?status=notRecommended" className="text-ink-2 hover:text-ink hover:underline">قائمة الممنوعات</Link></li>
          </ul>
          <p className="mono mt-6 text-[11px] text-muted">
            الصور: محلية بالكامل. البيانات: موثقة — لا حسابات، لا تتبع.
          </p>
        </nav>
      </div>
      <div className="border-t-2 border-line-soft">
        <div className="container-x mono flex flex-wrap items-center justify-between gap-2 py-4 text-[11px] text-muted">
          <span>local-first · offline-friendly · RTL</span>
          <span>Ctrl/⌘ + K للبحث السريع</span>
        </div>
      </div>
    </footer>
  );
}
