import type { Category } from "@/types";
import { images } from "./images";

/** Categories adapted to the groupings used by the supplied sources. */
export const categories: Category[] = [
  { id: "starches", slug: "starches", name: "النشويات والحبوب", description: "الأرز والبطاطا والتوست الكامل مقابل الدقيق الأبيض ومخبوزاته.", icon: "Wheat", image: images.rice },
  { id: "meat", slug: "meat", name: "اللحوم", description: "اللحوم الحمراء والأحشاء — راجع تصنيف كل صنف وحدود توثيقه.", icon: "Beef", image: images.beef },
  { id: "poultry", slug: "poultry", name: "الدواجن والطيور", description: "الطيور المسموحة (حمام، سمان) مقابل دواجن المزارع الممنوعة.", icon: "Bird", image: images.pigeon },
  { id: "fish", slug: "fish", name: "الأسماك", description: "السردين وأسماك البحر الطبيعية.", icon: "Fish", image: images.sardines },
  { id: "eggs", slug: "eggs", name: "البيض", description: "البيض بجميع أنواعه.", icon: "Egg", image: images.eggs },
  { id: "dairy", slug: "dairy", name: "الألبان والأجبان", description: "الأجبان المعتّقة مقابل الحليب السائل والزبادي والجبن الأبيض.", icon: "Milk", image: images.agedCheese },
  { id: "fats", slug: "fats", name: "الدهون والزيوت", description: "الزبدة والسمن وزيت الزيتون.", icon: "Droplets", image: images.oliveOil },
  { id: "vegetables", slug: "vegetables", name: "الخضروات", description: "الورقيات والخضروات النيئة في قائمة الممنوعات، مع استثناءات مطبوخة.", icon: "Leaf", image: images.spinach },
  { id: "legumes", slug: "legumes", name: "البقوليات", description: "الفول والعدس والحمص والفاصوليا.", icon: "Bean", image: images.lentils },
  { id: "fruits", slug: "fruits", name: "الفواكه", description: "العنب والتفاح والرمان والتين، مقابل البطيخ والبرتقال والكيوي.", icon: "Apple", image: images.grapes },
  { id: "nuts", slug: "nuts", name: "المكسرات والبذور", description: "اللوز وعين الجمل والفستق والكاجو — أسبوعيًا.", icon: "Nut", image: images.nuts },
  { id: "sweets", slug: "sweets", name: "الحلويات والسكر", description: "السكر والتمر والعسل والحلاوة الطحينية.", icon: "Candy", image: images.halawa },
  { id: "drinks", slug: "drinks", name: "المشروبات", description: "الشاي الأخضر والقهوة التركية مقابل المشروبات الغازية والشاي الأحمر.", icon: "Coffee", image: images.turkishCoffee },
  { id: "condiments", slug: "condiments", name: "الأساسيات والبهارات", description: "الملح والخل والليمون والزعتر.", icon: "FlaskConical", image: images.olives },
  { id: "processed", slug: "processed", name: "الأطعمة المصنّعة", description: "الزيوت المهدرجة والمخبوزات الصناعية والمشروبات المصنعة.", icon: "PackageX", image: images.biscuits },
];

export const categoriesById: Record<string, Category> = Object.fromEntries(
  categories.map((c) => [c.id, c]),
);
