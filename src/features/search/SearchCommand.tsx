import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChefHat,
  CornerDownLeft,
  FolderTree,
  HelpCircle,
  Home,
  ListChecks,
  Moon,
  Search,
  Sun,
  User,
  Utensils,
  X,
  type LucideIcon,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { STATUS_META } from "@/lib/status";
import { foodsById } from "@/data/foods";
import { SEARCH_GROUP_LABEL, searchAll, type SearchDoc, type SearchDocType } from "@/lib/search";
import { useTheme } from "@/features/theme/ThemeProvider";
import { useSearch } from "./SearchProvider";
import { cn } from "@/utils/cn";

interface Command {
  id: string;
  label: string;
  icon: LucideIcon;
  run: () => void;
  hint?: string;
}

const TYPE_ICON: Record<SearchDocType, LucideIcon> = {
  food: Utensils,
  category: FolderTree,
  principle: ListChecks,
  recipe: ChefHat,
  faq: HelpCircle,
  article: BookOpen,
};

type Row = { kind: "cmd"; cmd: Command } | { kind: "doc"; doc: SearchDoc };

export function SearchCommand() {
  const { open, setOpen } = useSearch();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  const commands: Command[] = useMemo(
    () => [
      { id: "c-foods", label: "ابحث عن طعام / دليل الأطعمة", icon: Search, run: () => go("/foods"), hint: "تصفح الأطعمة" },
      { id: "c-home", label: "الرئيسية", icon: Home, run: () => go("/") },
      { id: "c-principles", label: "مبادئ النظام", icon: ListChecks, run: () => go("/about#principles") },
      { id: "c-how", label: "كيف يعمل؟ ابدأ من هنا", icon: BookOpen, run: () => go("/how-it-works") },
      { id: "c-recipes", label: "الوصفات", icon: ChefHat, run: () => go("/recipes") },
      { id: "c-doctor", label: "الدكتور ضياء العوضي", icon: User, run: () => go("/doctor") },
      { id: "c-faq", label: "الأسئلة الشائعة", icon: HelpCircle, run: () => go("/faq") },
      {
        id: "c-theme",
        label: theme === "dark" ? "تبديل المظهر إلى الفاتح" : "تبديل المظهر إلى الداكن",
        icon: theme === "dark" ? Sun : Moon,
        run: () => {
          setOpen(false);
          toggle();
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  const rows: Row[] = useMemo(() => {
    const q = deferred.trim();
    if (q.length < 2) return commands.map((cmd) => ({ kind: "cmd", cmd }));
    const docs = searchAll(q, 30);
    const matchingCmds = commands.filter((c) => c.label.includes(q)).map((cmd) => ({ kind: "cmd" as const, cmd }));
    return [...docs.map((doc) => ({ kind: "doc" as const, doc })), ...matchingCmds];
  }, [deferred, commands]);

  useEffect(() => setActive(0), [rows.length, deferred]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const runRow = (row: Row) => {
    if (row.kind === "cmd") row.cmd.run();
    else go(row.doc.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.max(0, Math.min(a + 1, rows.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && rows[active]) {
      e.preventDefault();
      runRow(rows[active]);
    }
  };

  // Group docs by type while preserving global order for keyboard indexing.
  let lastGroup: string | null = null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-[2px]"
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content
              asChild
              forceMount
              aria-describedby=""
              onOpenAutoFocus={(event) => {
                returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
                event.preventDefault();
                inputRef.current?.focus();
              }}
              onCloseAutoFocus={(event) => {
                if (returnFocusRef.current?.isConnected) {
                  event.preventDefault();
                  returnFocusRef.current.focus({ preventScroll: true });
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -6 }}
                transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                className="fixed inset-x-3 top-[8vh] z-[90] mx-auto flex max-h-[80dvh] w-auto max-w-2xl flex-col overflow-hidden border-2 border-line bg-bg shadow-[-8px_8px_0_0_var(--shadow)] focus:outline-none md:inset-x-auto md:left-1/2 md:w-full md:-translate-x-1/2"
              >
                <DialogPrimitive.Title className="sr-only">البحث والأوامر</DialogPrimitive.Title>
                <div className="flex items-center gap-3 border-b-2 border-line px-4">
                  <span className="mono text-accent" aria-hidden>
                    &gt;_
                  </span>
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث عن طعام، مبدأ، وصفة، سؤال… أو اكتب أمرًا"
                    className="h-14 min-w-0 flex-1 bg-transparent text-base font-semibold placeholder:text-muted focus:outline-none"
                    onKeyDown={onKeyDown}
                    aria-label="بحث"
                    role="combobox"
                    aria-expanded
                    aria-controls="cmd-list"
                    aria-activedescendant={rows[active] ? `cmd-row-${active}` : undefined}
                  />
                  <DialogPrimitive.Close className="flex size-10 shrink-0 items-center justify-center border border-line-soft text-muted transition-colors hover:border-line hover:text-ink" aria-label="إغلاق البحث">
                    <X className="size-4" aria-hidden />
                  </DialogPrimitive.Close>
                </div>

                <div ref={listRef} id="cmd-list" role="listbox" aria-label="نتائج البحث والأوامر" className="min-h-0 flex-1 overflow-y-auto p-2">
                  {rows.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="font-bold">مش لاقيين النتيجة دي في الدليل.</p>
                      <p className="mt-1 text-sm text-muted">غير موجود ≠ ممنوع. جرّب تهجئة أخرى.</p>
                    </div>
                  )}
                  {rows.map((row, i) => {
                    const group = row.kind === "cmd" ? "الأوامر" : SEARCH_GROUP_LABEL[row.doc.type];
                    const showHeader = group !== lastGroup;
                    lastGroup = group;
                    const Icon = row.kind === "cmd" ? row.cmd.icon : TYPE_ICON[row.doc.type];
                    const food = row.kind === "doc" && row.doc.type === "food" ? foodsById[row.doc.id] : undefined;
                    return (
                      <div key={row.kind === "cmd" ? row.cmd.id : `${row.doc.type}-${row.doc.id}`}>
                        {showHeader && <div className="mono px-3 pb-1 pt-3 text-[11px] text-muted">// {group}</div>}
                        <button
                          type="button"
                          id={`cmd-row-${i}`}
                          role="option"
                          aria-selected={i === active}
                          data-index={i}
                          onMouseEnter={() => setActive(i)}
                          onClick={() => runRow(row)}
                          className={cn(
                            "flex w-full items-center gap-3 px-3 py-2.5 text-start transition-colors",
                            i === active ? "bg-accent text-accent-ink" : "hover:bg-surface-2",
                          )}
                        >
                          <Icon className="size-4 shrink-0" aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold">
                              {row.kind === "cmd" ? row.cmd.label : row.doc.title}
                            </span>
                            {row.kind === "doc" && row.doc.subtitle && (
                              <span className={cn("block truncate text-xs", i === active ? "opacity-80" : "text-muted")}>
                                {row.doc.subtitle}
                              </span>
                            )}
                          </span>
                          {food && (
                            <span className={cn("mono shrink-0 text-[11px] font-bold", i !== active && STATUS_META[food.status].twText)}>
                              {STATUS_META[food.status].symbol} {STATUS_META[food.status].short}
                            </span>
                          )}
                          {i === active && <CornerDownLeft className="size-4 shrink-0 opacity-70" aria-hidden />}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="mono flex items-center gap-4 border-t-2 border-line px-4 py-2 text-[11px] text-muted">
                  <span>↑↓ تنقّل</span>
                  <span>↵ فتح</span>
                  <span className="ms-auto">Ctrl/⌘ + K</span>
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
