import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export const Accordion = AccordionPrimitive.Root;

interface ItemProps {
  value: string;
  title: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  id?: string;
}

export function AccordionItem({ value, title, meta, children, id }: ItemProps) {
  return (
    <AccordionPrimitive.Item
      value={value}
      id={id}
      className="group scroll-mt-28 border-b-2 border-line-soft last:border-b-0 data-[state=open]:bg-surface"
    >
      <AccordionPrimitive.Header asChild>
        <h3 className="m-0">
          <AccordionPrimitive.Trigger
            className={cn(
              "flex w-full items-start justify-between gap-4 px-4 py-5 text-start text-base font-semibold transition md:px-6 md:text-lg",
              "hover:bg-surface-2 focus-visible:outline-offset-[-3px]",
            )}
          >
            <span className="flex-1">
              {title}
              {meta && <span className="mt-1 block text-xs font-normal text-muted">{meta}</span>}
            </span>
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center border-2 border-line bg-bg transition-transform duration-300 group-data-[state=open]:rotate-45 group-data-[state=open]:bg-accent group-data-[state=open]:text-accent-ink">
              <Plus className="size-4" aria-hidden />
            </span>
          </AccordionPrimitive.Trigger>
        </h3>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-[acc-up_0.25s_ease-out] data-[state=open]:animate-[acc-down_0.3s_ease-out]">
        <div className="px-4 pb-6 text-ink-2 md:px-6">{children}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}
