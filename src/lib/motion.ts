import type { Transition, Variants } from "framer-motion";
import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(listener: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

/** Respond to preference changes as well as the initial browser setting. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

const ease: Transition["ease"] = [0.2, 0.8, 0.2, 1];

export const motionPresets = {
  fadeUp: {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.32, ease } },
  } satisfies Variants,

  fadeIn: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.25, ease } },
  } satisfies Variants,

  scaleIn: {
    hidden: { opacity: 0, scale: 0.96 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.24, ease } },
    exit: { opacity: 0, scale: 0.97, transition: { duration: 0.2, ease } },
  } satisfies Variants,

  staggerContainer: {
    hidden: {},
    show: { transition: { staggerChildren: 0.035, delayChildren: 0 } },
  } satisfies Variants,

  pageTransition: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.24, ease } },
    exit: { opacity: 0, y: -6, transition: { duration: 0.2, ease } },
  },

  slideFromBottom: {
    hidden: { y: "100%" },
    show: { y: 0, transition: { duration: 0.28, ease } },
    exit: { y: "100%", transition: { duration: 0.25, ease } },
  } satisfies Variants,
};

export const viewportOnce = { once: true, amount: 0.2 } as const;
