import { Link } from "react-router-dom";
import { Github, Linkedin } from "@/components/ui/SocialIcons";
import { maintainer } from "@/config/maintainer";
import { NAV_ITEMS } from "./Navbar";

const toolRoutes = new Set(["/alternatives", "/ingredients", "/print", "/shopping"]);
const sectionLinks = NAV_ITEMS.filter((item) => !toolRoutes.has(item.to));

export function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-line bg-bg-2">
      <div className="container-x grid grid-cols-2 gap-x-6 gap-y-8 py-10 md:gap-10 md:py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
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
          <ul className="grid text-sm">
            {sectionLinks.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="inline-flex min-h-11 items-center text-ink-2 hover:text-ink hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="أدوات">
          <h3 className="mono mb-3 text-xs text-accent">// أدوات ومرافق</h3>
          <ul className="grid text-sm">
            <li><Link to="/alternatives" className="inline-flex min-h-11 items-center text-ink-2 hover:text-ink hover:underline">بدائل الأطعمة</Link></li>
            <li><Link to="/ingredients" className="inline-flex min-h-11 items-center text-ink-2 hover:text-ink hover:underline">فاحص المكونات</Link></li>
            <li><Link to="/print" className="inline-flex min-h-11 items-center text-ink-2 hover:text-ink hover:underline">دليل المطبخ للطباعة (A4)</Link></li>
            <li><Link to="/favorites" className="inline-flex min-h-11 items-center text-ink-2 hover:text-ink hover:underline">المحفوظات المفضلة</Link></li>
            <li><Link to="/shopping" className="inline-flex min-h-11 items-center text-ink-2 hover:text-ink hover:underline">دليل المشتريات</Link></li>
            <li><Link to="/foods?status=notRecommended" className="inline-flex min-h-11 items-center text-ink-2 hover:text-ink hover:underline">قائمة الممنوعات</Link></li>
          </ul>
          <p className="mono mt-6 text-[11px] text-muted">
            محفوظاتك تبقى على جهازك. لا حسابات، لا تتبع.
          </p>
        </nav>
      </div>
      <div className="border-t-2 border-line-soft">
        <div className="container-x flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3 text-xs text-muted">
          <div className="flex flex-wrap items-center gap-2">
            <span>تطوير وصيانة</span>
            <a href={maintainer.githubUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 hover:text-ink hover:underline"
              aria-label={`${maintainer.name} على GitHub`}>
              <Github className="size-4" aria-hidden />
              <span dir="ltr">{maintainer.name}</span>
            </a>
            {maintainer.linkedinUrl && (
              <a href={maintainer.linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex size-11 items-center justify-center hover:text-ink"
                aria-label={`${maintainer.name} على LinkedIn`}>
                <Linkedin className="size-4" aria-hidden />
              </a>
            )}
          </div>
          <span className="mono text-[11px]">Ctrl/⌘ + K للبحث السريع</span>
        </div>
      </div>
    </footer>
  );
}
