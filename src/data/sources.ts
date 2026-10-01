import type { Source } from "@/types";

/**
 * Every factual claim in the guide points to one of these sources via `sourceIds`.
 * Reliability differs widely — see `reliabilityNote` and `type`.
 */
export const sources: Source[] = [
  {
    id: "altayebaat-guide",
    title: "الدليل الشامل لنظام الطيبات: قواعد + ملخص + المسموح والممنوع (2026)",
    publication: "altayebaat.com — موقع مجتمعي مخصص للنظام",
    date: "2026-05-01",
    type: "secondary",
    url: "https://altayebaat.com/articles/الدليل-الشامل-لنظام-الطيبات",
    reliabilityNote:
      "موقع مجتمعي مؤيد للنظام؛ يلخص محاضرات الدكتور. ليس مصدرًا أوليًا ولا علميًا، لكنه أكثر المصادر تفصيلًا لقوائم المسموح والممنوع.",
  },
  {
    id: "altayebaat-allowed",
    title: "قائمة المسموحات الكاملة في نظام الطيبات (محدّثة)",
    publication: "altayebaat.com",
    date: "2026-05-01",
    type: "secondary",
    url: "https://altayebaat.com/articles/قائمة-المسموحات-الكاملة-في-نظام-الطيبات",
    reliabilityNote: "قائمة مجتمعية تُحدَّث دوريًا؛ تتضمن تفاصيل التكرار والكمية لكل صنف.",
  },
  {
    id: "wikipedia-ar",
    title: "ضياء العوضي — ويكيبيديا العربية",
    publication: "ويكيبيديا",
    date: "2026-08 (آخر اطلاع)",
    type: "encyclopedia",
    url: "https://ar.wikipedia.org/wiki/ضياء_العوضي",
    reliabilityNote:
      "مقالة موسوعية مستندة إلى تغطية صحفية (اليوم السابع، CNN عربي، الجزيرة نت، RT عربي، المصري اليوم). مفيدة للسيرة والإجراءات الرسمية.",
  },
  {
    id: "elconsolto-statements",
    title: "نظام الطيبات للدكتور ضياء العوضي — إليك تصريحاته المثيرة للجدل",
    publication: "الكونسلتو",
    date: "2026-04-20",
    type: "press",
    url: "https://www.elconsolto.com/cases-reports/cases-reports-news/details/2026/4/20/2975091/",
    reliabilityNote: "تقرير صحفي يجمع تصريحات الدكتور المنشورة؛ مفيد لتوثيق «ما قاله» لا لصحة ما قاله.",
  },
  {
    id: "ammanvoice-analysis",
    title: "ما هو نظام الطيبات؟ قراءة تحليلية لنصائح الدكتور ضياء العوضي",
    publication: "صوت عمان",
    date: "2026-05-18",
    type: "press",
    url: "https://ammanvoice.net/article/101837",
    reliabilityNote: "قراءة صحفية تحليلية؛ تشير إلى اختلاف بعض التطبيقات حول البيض والدجاج والخضار.",
  },
  {
    id: "upei-summary",
    title: "ما هو الأكل المسموح في نظام الطيبات؟",
    publication: "إعادة نشر — مدونة جامعية",
    date: "2026-04-29",
    type: "secondary",
    url: "https://calendar.upei.ca/wp/archives/421",
    reliabilityNote: "إعادة نشر منخفضة الموثوقية؛ استُخدم فقط لتوثيق ذكر «خل القصب» و«توست القمح الكامل».",
  },
  {
    id: "tayyibat-research-pdf",
    title: "بحث تحليلي شامل عن «نظام الطيبات» والدكتور ضياء العوضي ومواصفات موقع محلي متكامل",
    publication: "دراسة مرجعية محلية شاملة ومواصفات النظام",
    date: "2026",
    type: "secondary",
    reliabilityNote: "دراسة مرجعية موسعة تضم جدول الـ100 طعام الموثق والمستخلص من محاضرات وتسجيلات وقوائم النظام.",
  },
];

export const sourcesById: Record<string, Source> = Object.fromEntries(
  sources.map((s) => [s.id, s]),
);
