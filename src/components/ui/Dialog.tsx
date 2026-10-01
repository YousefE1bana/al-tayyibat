import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** `side` = drawer from the start edge on desktop, bottom sheet on mobile. `center` = modal. */
  mode?: "side" | "center";
  className?: string;
}

/** Accessible dialog (Radix) with brutalist styling and Motion transitions. */
export function Sheet({ open, onOpenChange, title, description, children, mode = "side", className }: SheetProps) {
  const returnFocusRef = useRef<HTMLElement | null>(null);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px]"
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content
              asChild
              forceMount
              aria-describedby={description ? undefined : ""}
              onOpenAutoFocus={() => {
                returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
              }}
              onCloseAutoFocus={(event) => {
                if (returnFocusRef.current?.isConnected) {
                  event.preventDefault();
                  returnFocusRef.current.focus({ preventScroll: true });
                }
              }}
            >
              <motion.div
                initial={mode === "side" ? { opacity: 0, y: 40 } : { opacity: 0, scale: 0.96 }}
                animate={mode === "side" ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1 }}
                exit={mode === "side" ? { opacity: 0, y: 30 } : { opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
                className={cn(
                  "fixed z-[70] flex flex-col bg-bg text-ink focus:outline-none",
                  mode === "side"
                    ? "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-xl border-t-2 border-line md:inset-y-4 md:start-4 md:bottom-4 md:end-auto md:w-[min(560px,92vw)] md:max-h-none md:rounded-md md:border-2 md:shadow-[-6px_6px_0_0_var(--shadow)]"
                    : "left-1/2 top-1/2 w-[min(720px,94vw)] max-h-[88dvh] -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-line shadow-[-8px_8px_0_0_var(--shadow)]",
                  className,
                )}
              >
                <div className="flex items-start justify-between gap-4 border-b-2 border-line px-5 py-4">
                  <div className="min-w-0 break-words">
                    <DialogPrimitive.Title className="text-lg font-bold leading-snug">{title}</DialogPrimitive.Title>
                    {description && (
                      <DialogPrimitive.Description className="mt-1 text-sm text-muted">{description}</DialogPrimitive.Description>
                    )}
                  </div>
                  <DialogPrimitive.Close
                    className="flex size-10 shrink-0 items-center justify-center border-2 border-line bg-surface transition hover:bg-accent hover:text-accent-ink"
                    aria-label="إغلاق"
                  >
                    <X className="size-5" />
                  </DialogPrimitive.Close>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
