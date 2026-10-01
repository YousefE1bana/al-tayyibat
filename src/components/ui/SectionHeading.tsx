import { motion } from "framer-motion";
import { motionPresets, viewportOnce } from "@/lib/motion";
import { cn } from "@/utils/cn";

interface SectionHeadingProps {
  index?: string;
  kicker?: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
  id?: string;
}

/** Terminal-editorial heading: `// 03` index, mono kicker, large title. */
export function SectionHeading({
  index,
  kicker,
  title,
  description,
  align = "start",
  as: Tag = "h2",
  className,
  id,
}: SectionHeadingProps) {
  return (
    <motion.div
      variants={motionPresets.fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className={cn("mb-10 max-w-3xl", align === "center" && "mx-auto text-center", className)}
    >
      {(index || kicker) && (
        <div className={cn("mono mb-3 flex items-center gap-3 text-xs text-accent", align === "center" && "justify-center")}>
          {index && <span className="text-muted">// {index}</span>}
          {kicker && <span className="uppercase tracking-wider">{kicker}</span>}
        </div>
      )}
      <Tag id={id} className="scroll-mt-28 text-3xl font-bold leading-[1.25] md:text-4xl lg:text-5xl">
        {title}
      </Tag>
      {description && <p className="mt-4 text-base text-ink-2 md:text-lg">{description}</p>}
    </motion.div>
  );
}
