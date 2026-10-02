import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/utils/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      aria-label={isDark ? "تفعيل المظهر الفاتح" : "تفعيل المظهر الداكن"}
      title={isDark ? "المظهر الفاتح" : "المظهر الداكن"}
      className={cn(
        "relative flex size-11 items-center justify-center overflow-hidden border-2 border-line bg-surface transition hover:bg-accent hover:text-accent-ink",
        className,
      )}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        className="flex"
      >
        {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </motion.span>
    </button>
  );
}
