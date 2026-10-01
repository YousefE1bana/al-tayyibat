/**
 * Content data models for the Al-Tayyibat guide.
 * All content lives in `src/data/*` and is validated in `src/lib/validate.ts`.
 */

/** Status of a food inside the system, as documented by the supplied sources. */
export type FoodStatus =
  | "compatible" // مسموح — من الطيبات
  | "conditional" // مسموح بشروط / بقيود
  | "notRecommended" // ممنوع في النظام
  | "disputed" // المصادر تختلف حوله
  | "unknown"; // غير موثق

export type SourceType =
  | "official" // مادة رسمية من صاحب النظام
  | "scientific" // ورقة علمية محكمة
  | "government" // إرشاد حكومي / هيئة رسمية
  | "interview" // مقابلة
  | "lecture" // محاضرة
  | "encyclopedia" // موسوعة
  | "press" // صحافة
  | "secondary"; // مصدر ثانوي / مجتمعي

export type EvidenceLevel =
  | "strong" // مدعوم بأدلة قوية
  | "moderate" // أدلة متوسطة
  | "limited" // أدلة محدودة
  | "claim" // ادعاء صاحب النظام
  | "institutional" // موقف مؤسسي / إرشاد خارجي
  | "unverified"; // غير متحقق منه

export type ProvenanceLevel =
  | "direct" // مدعوم بنص صريح مباشر من المصدر
  | "indirect" // مستنتج من قاعدة عامة مذكورة في المصدر
  | "secondary" // مستند إلى جداول وتلخيصات مجتمعية
  | "incomplete" // توثيق أولي يحتاج استكمال المرجع الدقيق
  | "source_required"; // لم يُعثر على توثيق كافٍ حتى الآن

export interface SourceLocator {
  sourceId: string;
  page?: number;
  timestamp?: string;
  section?: string;
  note?: string;
  level?: ProvenanceLevel;
}

export interface Source {
  id: string;
  title: string;
  author?: string;
  publication?: string;
  date?: string;
  type: SourceType;
  url?: string;
  reliabilityNote?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string; // lucide icon name (resolved in UI)
  image?: string;
}

export interface Food {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  categoryId: string;
  status: FoodStatus;
  shortDescription: string;
  explanation?: string;
  usage?: string;
  restrictions?: string[];
  alternatives?: string[];
  relatedFoods?: string[];
  sourceIds?: string[];
  provenance?: SourceLocator[];
  image?: string;
  notes?: string;
  /** Marks one of "الأساسيات الخمسة" in the supplied guide. */
  essential?: boolean;
}

export interface Principle {
  id: string;
  number: number;
  title: string;
  summary: string;
  details: string;
  icon: string;
  sourceIds: string[];
  evidence?: EvidenceLevel;
}

export interface Step {
  id: string;
  title: string;
  summary: string;
  details: string[];
  sourceIds: string[];
}

export interface Recipe {
  id: string;
  slug: string;
  name: string;
  description: string;
  prepTime: string;
  difficulty: "سهل" | "متوسط" | "متقدم";
  meal: "فطور" | "غداء" | "عشاء" | "خفيف";
  foodIds: string[];
  ingredients: string[];
  instructions: string[];
  image?: string;
  sourceIds: string[];
  instructionsNote?: string;
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  sourceIds: string[];
  evidence?: EvidenceLevel;
  relatedHref?: string;
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  sourceIds: string[];
  verified: boolean;
}

export interface DoctorProfile {
  fullName: string;
  displayName: string;
  born: string;
  died: string;
  nationality: string;
  specialty: string;
  almaMater: string;
  portrait: string;
  bio: string[];
  quotes: { text: string; attribution: string; sourceId: string }[];
  timeline: TimelineEvent[];
  unverified: string[];
}

export interface ShoppingGroup {
  id: string;
  title: string;
  items: { id: string; label: string; foodId?: string }[];
  sourceIds: string[];
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  href: string;
}
