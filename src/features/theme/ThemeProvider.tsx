import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggle: (origin?: { x: number; y: number }) => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const KEY = "tayyibat:theme";

function readStored(): Theme | null {
  try {
    const stored = window.localStorage.getItem(KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

function readInitial(): Theme {
  const stored = readStored();
  if (stored) return stored;
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function supportsViewTransitions(): boolean {
  return typeof document.startViewTransition === "function";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitial);
  const explicitlyChosen = useRef(readStored() !== null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", theme === "dark" ? "#0e1310" : "#f3eee2");
  }, [theme]);

  // Follow system changes only while the user hasn't chosen explicitly.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = (e: MediaQueryListEvent) => {
      if (!explicitlyChosen.current) setThemeState(e.matches ? "light" : "dark");
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY && e.key !== null) return;
      const stored = e.newValue === "light" || e.newValue === "dark" ? e.newValue : null;
      explicitlyChosen.current = stored !== null;
      setThemeState(stored ?? (mq.matches ? "light" : "dark"));
    };
    mq.addEventListener("change", handler);
    window.addEventListener("storage", onStorage);
    return () => {
      mq.removeEventListener("change", handler);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setTheme = useCallback((t: Theme) => {
    explicitlyChosen.current = true;
    try {
      window.localStorage.setItem(KEY, t);
    } catch {
      // The selected theme remains available for this session.
    }
    setThemeState(t);
  }, []);

  const toggle = useCallback(
    (origin?: { x: number; y: number }) => {
      const next: Theme = theme === "dark" ? "light" : "dark";
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (supportsViewTransitions() && !reduced) {
        const x = origin?.x ?? window.innerWidth / 2;
        const y = origin?.y ?? 40;
        document.documentElement.style.setProperty("--vt-x", `${x}px`);
        document.documentElement.style.setProperty("--vt-y", `${y}px`);
        document.startViewTransition(() => setTheme(next));
      } else {
        setTheme(next);
      }
    },
    [theme, setTheme],
  );

  const value = useMemo(() => ({ theme, toggle, setTheme }), [theme, toggle, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
