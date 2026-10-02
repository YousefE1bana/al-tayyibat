import { useEffect } from "react";

const SITE = "نظام الطيبات — الدليل التفاعلي";
const DESCRIPTION = "دليل معلوماتي عربي مستقل يعرض الأطعمة والوصفات وقواعد نظام الطيبات. ليس بديلًا عن المشورة الطبية الشخصية.";

/** Sets document title + description (+ OG tags) per route so the app is hosting-ready. */
export function usePageMeta(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE}` : SITE;
    const setMeta = (selector: string, content: string) => {
      const el = document.querySelector<HTMLMetaElement>(selector);
      if (el) el.setAttribute("content", content);
    };
    setMeta('meta[name="description"]', description || DESCRIPTION);
    setMeta('meta[property="og:description"]', description || DESCRIPTION);
    setMeta('meta[name="twitter:description"]', description || DESCRIPTION);
    setMeta('meta[name="twitter:title"]', document.title);
    setMeta('meta[property="og:title"]', title ? `${title} | ${SITE}` : SITE);
  }, [title, description]);
}
