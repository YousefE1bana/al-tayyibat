import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Bookmark, ChevronDown, Menu, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useFavorites } from "@/hooks/useCollections";
import { useSearch } from "@/features/search/SearchProvider";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { toArabicDigits } from "@/lib/arabic";
import { cn } from "@/utils/cn";
import { BrandMark } from "@/components/brand/BrandMark";

export const PRIMARY_NAV_ITEMS = [
  { to: "/", label: "الرئيسية" },
  { to: "/foods", label: "دليل الأطعمة" },
  { to: "/alternatives", label: "البدائل" },
  { to: "/ingredients", label: "فاحص المكونات" },
  { to: "/recipes", label: "الوصفات" },
  { to: "/how-it-works", label: "ابدأ من هنا" },
];

export const MORE_NAV_ITEMS = [
  { to: "/about", label: "عن النظام", desc: "فلسفة وركائز الطيبات" },
  { to: "/doctor", label: "عن الدكتور", desc: "د. ضياء العوضي ومسيرته" },
  { to: "/print", label: "دليل المطبخ (A4)", desc: "نسخة ملخصة قابلة للطباعة" },
  { to: "/shopping", label: "دليل المشتريات", desc: "قائمة التسوق الأسبوعية" },
  { to: "/faq", label: "الأسئلة الشائعة", desc: "إجابات الأسئلة المتكررة" },
];

export const ALL_MOBILE_ITEMS = [
  ...PRIMARY_NAV_ITEMS,
  ...MORE_NAV_ITEMS.map((m) => ({ to: m.to, label: m.label })),
];

export const NAV_ITEMS = ALL_MOBILE_ITEMS;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const moreId = useId();
  const { scrollY } = useScroll();
  const { openSearch } = useSearch();
  const { count } = useFavorites();
  const location = useLocation();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));
  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!moreOpen && !menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (moreOpen) {
        setMoreOpen(false);
        moreButtonRef.current?.focus();
      }
      if (menuOpen) {
        setMenuOpen(false);
        mobileButtonRef.current?.focus();
      }
    };
    const onOutsideClick = (event: MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onOutsideClick);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onOutsideClick);
    };
  }, [moreOpen, menuOpen]);

  // Handle outside click for "المزيد" dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [moreOpen]);

  const isMoreActive = MORE_NAV_ITEMS.some((item) => location.pathname === item.to);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div
        className={cn(
          "transition-all duration-300",
          scrolled ? "border-b-2 border-line bg-bg/85 backdrop-blur-md" : "border-b-2 border-transparent bg-transparent",
        )}
      >
        <div className="navbar-inner container-x flex h-16 items-center gap-2 md:h-[72px] md:gap-3">
          <Link to="/" className="navbar-brand flex min-h-11 min-w-0 shrink-0 items-center gap-2" aria-label="نظام الطيبات — الرئيسية">
            <BrandMark />
            <span className="flex min-w-0 flex-col">
              <span className="navbar-title whitespace-nowrap text-base font-bold leading-relaxed">نظام الطيبات</span>
              <span className="navbar-subtitle hidden whitespace-nowrap text-[10px] leading-relaxed text-muted sm:block">دليل الأطعمة والوصفات</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="ms-3 hidden items-center gap-0.5 xl:gap-1 xl:flex" aria-label="التنقل الرئيسي">
            {PRIMARY_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "relative px-2.5 xl:px-3 py-2 text-sm font-semibold text-ink-2 transition hover:text-ink",
                    isActive && "text-ink",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-2 -bottom-0.5 h-[3px] bg-accent"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            {/* "المزيد" Dropdown Menu */}
            <div className="relative" ref={dropdownRef} onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setMoreOpen(false);
            }}>
              <button
                ref={moreButtonRef}
                type="button"
                onClick={() => { setMoreOpen((prev) => !prev); setMenuOpen(false); }}
                aria-expanded={moreOpen}
                aria-controls={moreId}
                className={cn(
                  "relative flex items-center gap-1 px-2.5 xl:px-3 py-2 text-sm font-semibold transition cursor-pointer",
                  isMoreActive || moreOpen ? "text-ink" : "text-ink-2 hover:text-ink",
                )}
              >
                <span>المزيد</span>
                <ChevronDown
                  className={cn("size-3.5 transition-transform duration-200", moreOpen && "rotate-180")}
                />
                {isMoreActive && (
                  <span className="absolute inset-x-2 -bottom-0.5 h-[3px] bg-accent" />
                )}
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    id={moreId}
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute end-0 top-full mt-2 w-64 border-2 border-line bg-surface p-1.5 shadow-hard"
                  >
                    {MORE_NAV_ITEMS.map((item) => {
                      const isActive = location.pathname === item.to;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setMoreOpen(false)}
                          className={cn(
                            "flex flex-col gap-0.5 px-3 py-2 text-start transition",
                            isActive ? "bg-accent text-accent-ink font-bold" : "hover:bg-bg-2 text-ink",
                          )}
                        >
                          <span className="text-sm font-bold">{item.label}</span>
                          <span className={cn("text-[11px]", isActive ? "text-accent-ink/85" : "text-muted")}>
                            {item.desc}
                          </span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Action buttons (Search, Favorites, Theme, Mobile toggle) */}
          <div className="navbar-actions ms-auto flex shrink-0 items-center gap-1 md:gap-2 [&>a]:shrink-0 [&>button]:shrink-0">
            <button
              type="button"
              onClick={openSearch}
              className="group flex h-11 items-center gap-2 border-2 border-line bg-surface px-3 transition hover:bg-accent hover:text-accent-ink"
              aria-label="فتح البحث (Ctrl+K)"
            >
              <Search className="size-4 transition-transform group-hover:rotate-12" />
              <span className="hidden text-sm font-semibold md:inline">ابحث</span>
              <kbd className="mono hidden border border-current/40 px-1 text-[10px] opacity-70 md:inline">⌘K</kbd>
            </button>
            <Link
              to="/favorites"
              className="relative flex size-11 items-center justify-center border-2 border-line bg-surface transition hover:bg-accent hover:text-accent-ink"
              aria-label={`المحفوظات (${count})`}
            >
              <Bookmark className="size-5" />
              {count > 0 && (
                <span className="mono absolute -end-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center border-2 border-line bg-accent px-1 text-[10px] font-bold text-accent-ink">
                  {toArabicDigits(count)}
                </span>
              )}
            </Link>
            <ThemeToggle />
            <button
              ref={mobileButtonRef}
              type="button"
              onClick={() => { setMenuOpen((v) => !v); setMoreOpen(false); }}
              className="flex size-11 items-center justify-center border-2 border-line bg-surface xl:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label="القائمة"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-72px)] overflow-y-auto border-b-2 border-line bg-bg xl:hidden shadow-hard"
            aria-label="قائمة الجوال"
            onBlur={(event) => {
              if (!headerRef.current?.contains(event.relatedTarget as Node | null)) setMenuOpen(false);
            }}
          >
            <ul className="container-x grid gap-1 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:grid-cols-2">
              {ALL_MOBILE_ITEMS.map((item, i) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 border-2 border-transparent px-3 py-2.5 text-sm font-semibold",
                        isActive ? "border-line bg-surface font-bold text-ink" : "hover:bg-surface-2 text-ink-2",
                      )
                    }
                  >
                    <span className="mono text-[11px] text-accent font-bold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <NavLink
                  to="/favorites"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold hover:bg-surface-2 text-ink-2"
                >
                  <span className="mono text-[11px] text-accent font-bold">
                    {String(ALL_MOBILE_ITEMS.length + 1).padStart(2, "0")}
                  </span>
                  المحفوظات
                </NavLink>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
