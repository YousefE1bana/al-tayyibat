import type { Principle } from "@/types";

export const principles: Principle[] = [
  {
    "id": "eat-when-hungry",
    "number": 1,
    "title": "الأكل عند الجوع",
    "summary": "تنسب المواد المتداولة للنظام ربط الأكل بالجوع.",
    "details": "تفاصيل تعريف الجوع الحقيقي والنفسي تحتاج مادة مباشرة قابلة للتحقق.",
    "icon": "Timer",
    "sourceIds": [],
    "evidence": "unverified"
  },
  {
    "id": "stop-before-full",
    "number": 2,
    "title": "التوقف قبل الشبع التام",
    "summary": "تتداول المواد قاعدة للتوقف قبل الشبع التام.",
    "details": "حُذفت نسبة 80% والتعليلات العلاجية لعدم توفر سند مباشر متحقق.",
    "icon": "Gauge",
    "sourceIds": [],
    "evidence": "unverified"
  },
  {
    "id": "simple-meals",
    "number": 3,
    "title": "بساطة الوجبة",
    "summary": "تقليل تنوع مكونات الوجبة طرح منسوب للنظام.",
    "details": "العدد المحدد للمكونات والتعليلات الإنزيمية يحتاجان تصريحًا مباشرًا؛ لا نقدمهما كحقيقة علمية.",
    "icon": "Layers",
    "sourceIds": [],
    "evidence": "unverified"
  },
  {
    "id": "drink-when-thirsty",
    "number": 4,
    "title": "الشرب عند العطش",
    "summary": "توصية الشرب عند العطش منسوبة للنظام.",
    "details": "توقيت الشرب بعد ساعتين وحظر الماء مع الطعام غير متحققين هنا. احتياجات السوائل مسألة طبية شخصية.",
    "icon": "Droplet",
    "sourceIds": [],
    "evidence": "unverified"
  },
  {
    "id": "fasting",
    "number": 5,
    "title": "الصيام في مواد النظام",
    "summary": "الصيام من الممارسات المنسوبة للنظام.",
    "details": "لم يتوفر توثيق مباشر لجدول موحد في هذه المراجعة. ملاءمة الصيام للحالات الصحية تُراجع مع الطبيب.",
    "icon": "MoonStar",
    "sourceIds": [],
    "evidence": "unverified"
  },
  {
    "id": "protein-alternation",
    "number": 6,
    "title": "تكرار البروتين الحيواني",
    "summary": "تتداول المواد قيودًا على تكرار البروتين الحيواني.",
    "details": "لا يتوفر هنا سند مباشر كافٍ لجدول يوم بعد يوم أو لتعميم تكرار واحد على جميع الأنواع.",
    "icon": "Repeat",
    "sourceIds": [],
    "evidence": "unverified"
  }
];

export const philosophy = {
  "pillars": [
    {
      "title": "تصنيف الطعام",
      "text": "يفرق النظام بين أطعمة يسميها طيبات وأخرى يمنعها.",
      "icon": "Sprout"
    },
    {
      "title": "حدود التوثيق",
      "text": "التصنيف المتداول لا يثبت كل تفصيل أو استثناء.",
      "icon": "ShieldCheck"
    }
  ],
  "coreIdea": "نظام ارتبط بالدكتور ضياء العوضي ويصنف الأطعمة بحسب رؤيته. يعرض الموقع هذا الطرح منسوبًا إليه، ولا يثبت آثاره الصحية كحقائق علمية.",
  "mottoes": [],
  "sourceIds": [
    "elconsolto-statements"
  ]
};

export const theories = [
  {
    "id": "fat-theory",
    "title": "الدهون الطبيعية في طرح الدكتور",
    "claim": "ينقل تقرير الكونسلتو تفضيله السمن والزبدة ونسبته فوائد صحية إليهما.",
    "counter": "نقل التصريح لا يثبت فائدته الطبية؛ التقييم العلمي مستقل عن التصنيف داخل النظام.",
    "evidence": "claim" as const,
    "sourceIds": [
      "elconsolto-statements"
    ]
  }
];
