import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

export interface TocItem {
  id: string;
  label: string;
}

/** «في هذه الصفحة» — sticky in-page navigation with active heading detection. */
export function TableOfContents({ items, className }: { items: TocItem[]; className?: string }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 1] },
    );
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="في هذه الصفحة" className={cn("brut-soft bg-surface p-4", className)}>
      <div className="mono mb-3 text-xs text-accent">// في هذه الصفحة</div>
      <ol className="space-y-1">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={cn(
                "flex items-center gap-2 border-s-[3px] py-1.5 ps-3 text-sm transition-colors",
                active === item.id ? "border-accent font-bold text-ink" : "border-transparent text-ink-2 hover:text-ink",
              )}
              aria-current={active === item.id ? "location" : undefined}
            >
              <span className="mono text-[10px] text-muted">{String(i + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
