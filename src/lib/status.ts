import type { EvidenceLevel, FoodStatus, SourceType } from "@/types";

export interface StatusMeta {
  label: string;
  short: string;
  symbol: string;
  colorVar: string; // CSS variable name
  twText: string;
  twBg: string;
  twBorder: string;
  description: string;
}

export const STATUS_META: Record<FoodStatus, StatusMeta> = {
  compatible: {
    label: "مسموح — من الطيبات",
    short: "مسموح",
    symbol: "✓",
    colorVar: "--status-ok",
    twText: "text-status-ok",
    twBg: "bg-status-ok",
    twBorder: "border-status-ok",
    description: "مدرج ضمن قائمة المسموحات في المصادر المعتمدة للدليل.",
  },
  conditional: {
    label: "مسموح بشروط",
    short: "بشروط",
    symbol: "◐",
    colorVar: "--status-cond",
    twText: "text-status-cond",
    twBg: "bg-status-cond",
    twBorder: "border-status-cond",
    description: "مسموح لكن مع قيود في الكمية أو التكرار أو طريقة التحضير.",
  },
  notRecommended: {
    label: "ممنوع في النظام",
    short: "ممنوع",
    symbol: "✕",
    colorVar: "--status-no",
    twText: "text-status-no",
    twBg: "bg-status-no",
    twBorder: "border-status-no",
    description: "مدرج ضمن قائمة الممنوعات («الخبائث») في المصادر المعتمدة للدليل.",
  },
  disputed: {
    label: "المصادر مختلفة",
    short: "مختلَف عليه",
    symbol: "≈",
    colorVar: "--status-disputed",
    twText: "text-status-disputed",
    twBg: "bg-status-disputed",
    twBorder: "border-status-disputed",
    description: "المصادر المتاحة تتعارض حول موقعه في النظام. راجع الملاحظات.",
  },
  unknown: {
    label: "غير موثق",
    short: "غير موثق",
    symbol: "?",
    colorVar: "--status-unknown",
    twText: "text-status-unknown",
    twBg: "bg-status-unknown",
    twBorder: "border-status-unknown",
    description: "لم نجد له ذكرًا صريحًا في المصادر. غير موجود ≠ ممنوع.",
  },
};

export const STATUS_ORDER: FoodStatus[] = [
  "compatible",
  "conditional",
  "disputed",
  "notRecommended",
  "unknown",
];

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  official: "مادة رسمية من صاحب النظام",
  scientific: "ورقة علمية محكّمة",
  government: "إرشاد حكومي / هيئة رسمية",
  interview: "مقابلة",
  lecture: "محاضرة",
  encyclopedia: "موسوعة",
  press: "صحافة",
  secondary: "مصدر ثانوي / مجتمعي",
};

export const EVIDENCE_LABEL: Record<EvidenceLevel, { label: string; hint: string }> = {
  strong: { label: "مدعوم بأدلة قوية", hint: "إجماع علمي واسع" },
  moderate: { label: "أدلة متوسطة", hint: "دراسات متعددة لكن غير حاسمة" },
  limited: { label: "أدلة محدودة", hint: "دراسات قليلة أو أولية" },
  claim: { label: "ادعاء صاحب النظام", hint: "رأي الدكتور ضياء العوضي، غير مثبت بدراسات محكّمة" },
  institutional: { label: "موقف مؤسسي", hint: "إرشاد صادر عن جهة طبية أو رسمية" },
  unverified: { label: "غير متحقق منه", hint: "لم نتمكن من التحقق منه من مصدر مستقل" },
};
