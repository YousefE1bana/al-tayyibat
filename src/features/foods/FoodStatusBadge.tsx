import { AlertTriangle, Check, HelpCircle, Scale, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FoodStatus } from "@/types";
import { STATUS_META } from "@/lib/status";
import { cn } from "@/utils/cn";

const ICONS: Record<FoodStatus, LucideIcon> = {
  compatible: Check,
  conditional: AlertTriangle,
  notRecommended: X,
  disputed: Scale,
  unknown: HelpCircle,
};

interface Props {
  status: FoodStatus;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "outline";
  className?: string;
}

/** Status is always communicated with icon + text + color (never color alone). */
export function FoodStatusBadge({ status, size = "md", variant = "outline", className }: Props) {
  const meta = STATUS_META[status];
  const Icon = ICONS[status];
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap border-2 font-bold",
        size === "sm" && "h-7 px-2 text-xs",
        size === "md" && "h-8 px-2.5 text-sm",
        size === "lg" && "h-11 px-4 text-base",
        variant === "outline" ? cn("bg-surface", meta.twBorder, meta.twText) : cn("border-line text-bg", meta.twBg),
        className,
      )}
    >
      <Icon className={cn(size === "lg" ? "size-5" : "size-4")} strokeWidth={3} aria-hidden />
      <span>{size === "sm" ? meta.short : meta.label}</span>
    </span>
  );
}

export function statusIcon(status: FoodStatus): LucideIcon {
  return ICONS[status];
}
