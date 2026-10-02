import type { Source } from "@/types";

/** References checked during editorial review; limits remain explicit. */
export const sources: Source[] = [
  {
    "id": "wikipedia-ar",
    "title": "ضياء العوضي — ويكيبيديا العربية",
    "publication": "ويكيبيديا",
    "date": "2026-10-02 (آخر مراجعة)",
    "type": "encyclopedia",
    "url": "https://ar.wikipedia.org/wiki/ضياء_العوضي",
    "reliabilityNote": "ملخص موسوعي للسيرة والتصنيف العام؛ لا يثبت تفاصيل كل صنف أو استثناءات التحضير."
  },
  {
    "id": "elconsolto-statements",
    "title": "نظام الطيبات للدكتور ضياء العوضي — إليك تصريحاته المثيرة للجدل",
    "publication": "الكونسلتو",
    "date": "2026-04-20",
    "type": "press",
    "url": "https://www.elconsolto.com/cases-reports/cases-reports-news/details/2026/4/20/2975091/نظام-الطيبات-للدكتور-ضياء-العوضي-إليك-تصريحاته-المثيرة-للجدل/",
    "reliabilityNote": "تقرير صحفي يجمع تصريحات الدكتور المنشورة؛ مفيد لتوثيق «ما قاله» لا لصحة ما قاله."
  },
  {
    "id": "youm7-biography",
    "title": "بعد وفاته في دبي.. معلومات عن الطبيب ضياء العوضي",
    "publication": "اليوم السابع",
    "date": "2026-04-19",
    "type": "press",
    "url": "https://www.youm7.com/story/2026/4/19/بعد-وفاته-في-دبي-أهم-المعلومات-عن-الطبيب-ضياء-العوضى/7383443",
    "reliabilityNote": "تقرير سيرة؛ لا يمثل سجلًا جامعيًا أصليًا ولا مصدرًا لقواعد الأطعمة."
  }
];

export const sourcesById: Record<string, Source> = Object.fromEntries(sources.map(s => [s.id, s]));
