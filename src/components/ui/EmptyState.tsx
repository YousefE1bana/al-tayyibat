import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  code?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className, code = "EMPTY" }: EmptyStateProps) {
  return (
    <div className={cn("brut-soft grid-dots relative overflow-hidden bg-surface p-8 text-center md:p-12", className)}>
      <span className="mono absolute start-4 top-3 text-[11px] text-muted">[{code}]</span>
      <div className="mx-auto mb-4 flex size-14 items-center justify-center border-2 border-line bg-bg">
        <Icon className="size-6 text-accent" aria-hidden />
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-ink-2">{description}</p>}
      {action && <div className="mt-6 flex justify-center gap-3">{action}</div>}
    </div>
  );
}
