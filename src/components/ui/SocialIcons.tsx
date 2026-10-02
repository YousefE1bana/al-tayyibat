import { createLucideIcon } from "lucide-react";

// Brand glyphs use Lucide's renderer because this version omits brand exports.
export const Github = createLucideIcon("Github", [
  ["path", { key: "github", d: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" }],
]);

export const Linkedin = createLucideIcon("Linkedin", [
  ["path", { key: "network", d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V8h4v2a6 6 0 0 1 2-2z" }],
  ["rect", { key: "stem", x: "2", y: "9", width: "4", height: "12" }],
  ["circle", { key: "dot", cx: "4", cy: "4", r: "2" }],
]);
