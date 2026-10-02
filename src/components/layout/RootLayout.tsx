import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Suspense, useEffect } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { motionPresets, usePrefersReducedMotion } from "@/lib/motion";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { SearchCommand } from "@/features/search/SearchCommand";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  const reducedMotion = usePrefersReducedMotion();
  useEffect(() => {
    if (hash) {
      let id = hash.slice(1);
      try { id = decodeURIComponent(id); } catch { /* Treat invalid escapes as a literal ID. */ }
      const scrollToTarget = () => {
        const target = document.getElementById(id);
        if (!target) return false;
        target.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" });
        return true;
      };
      if (scrollToTarget()) return;
      // Lazy pages can arrive after an arbitrary delay; observe their actual render.
      const observer = new MutationObserver(() => {
        if (scrollToTarget()) observer.disconnect();
      });
      observer.observe(document.getElementById("main") ?? document.body, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
    window.scrollTo({ top: 0 });
    return undefined;
  }, [pathname, hash, reducedMotion]);
  return null;
}

function ScrollProgress() {
  const reducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX: reducedMotion ? scrollYProgress : scaleX, transformOrigin: "100% 50%" }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-accent"
    />
  );
}

function PageFallback() {
  return (
    <div className="container-x py-24">
      <div className="mono text-xs text-muted">جارٍ تحميل الصفحة…</div>
      <div className="mt-4 h-10 w-2/3 animate-pulse bg-surface-2" />
      <div className="mt-3 h-4 w-1/2 animate-pulse bg-surface-2" />
    </div>
  );
}

export function RootLayout() {
  const location = useLocation();
  // Capture the outlet element so the exiting page keeps rendering its own content during the transition.
  const outlet = useOutlet();
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href={`#${location.pathname}${location.search}#main`}
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById("main");
          main?.focus({ preventScroll: true });
          main?.scrollIntoView({ behavior: "instant", block: "start" });
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:border-2 focus:border-line focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
      >
        تخطَّ إلى المحتوى
      </a>
      <ScrollProgress />
      <ScrollManager />
      <Navbar />
      <main id="main" tabIndex={-1} className="flex-1 scroll-mt-20">
        <ErrorBoundary key={location.pathname}>
        <Suspense fallback={<PageFallback />}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={motionPresets.pageTransition.initial}
              animate={motionPresets.pageTransition.animate}
              exit={motionPresets.pageTransition.exit}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <SearchCommand />
    </div>
  );
}
