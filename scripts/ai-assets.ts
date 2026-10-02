import { foods } from "../src/data/foods";
import { categories } from "../src/data/categories";
import { principles, philosophy } from "../src/data/principles";
import { startSteps } from "../src/data/guide";
import { sources } from "../src/data/sources";
import { STATUS_META } from "../src/lib/status";

export const expectedCounts = { compatible: 116, conditional: 103, notRecommended: 157, disputed: 4, unknown: 5 };
const base = process.env.VITE_BASE_PATH || "/al-tayyibat/";
const site = `https://yousefe1bana.github.io${base}`;
const publicImage = (image?: string) => image ? `${base}${image.replace(/^\//, "")}` : null;
const usagePolicy = {
  purpose: "دليل معلوماتي مستقل يصف نظام الطيبات المرتبط بالدكتور ضياء العوضي؛ لا يثبت ادعاءاته الصحية كحقائق علمية أو طبية.",
  attribution: ["وفقًا لنظام الطيبات...", "بحسب قواعد النظام...", "يرى الدكتور..."],
  uncertainty: "أبقِ المختلف عليه مختلفًا عليه، وغير الموثق غير موثق. لا تختزل هذه الحالات إلى مسموح أو ممنوع، ولا تحذف الشروط أو حدود التوثيق.",
  legacyClassifications: "تصنيفات وشروط محفوظة من النسخة السابقة تحتاج توثيقًا مباشرًا لكل صنف. المراجع العامة لا تثبت كل تفصيل؛ لا تعتبر الطهي أو النقع استثناء تلقائيًا، ولا تقدم الكميات السابقة كجرعات طبية.",
  medicalDisclaimer: "ليس نصيحة طبية شخصية. لا توقف أي دواء ولا تغيّر نظامك الغذائي في الحالات المزمنة أو الحمل أو الطفولة دون استشارة طبيب.",
};
export function createAiAssets() {
  const counts = Object.fromEntries(Object.keys(expectedCounts).map(status => [status, foods.filter(food => food.status === status).length]));
  if (foods.length !== 385 || JSON.stringify(counts) !== JSON.stringify(expectedCounts)) throw new Error("Canonical catalog invariant changed");
  const statuses = Object.fromEntries(Object.entries(STATUS_META).map(([id, value]) => [id, { label: value.label, description: value.description }]));
  const publicSources = sources.map(({ id, title, author, publication, date, type, url, reliabilityNote }) => ({ id, title, author, publication, date, type, url, reliabilityNote }));
  const catalog = {
    schemaVersion: 1, language: "ar", usagePolicy, counts, statuses, sources: publicSources,
    foods: foods.map(food => ({
      id: food.id, slug: food.slug, name: food.name, aliases: food.aliases,
      category: food.categoryId, status: food.status, description: food.shortDescription,
      explanation: food.explanation, preparationGuidance: food.usage, conditions: food.restrictions ?? [],
      // This field is explicitly rendered in FoodDetails, including medical caveats.
      publicNotes: food.notes,
      editorialNote: food.editorialNote,
      alternatives: food.alternatives ?? [], relatedFoods: food.relatedFoods ?? [],
      sourceIds: food.sourceIds ?? [],
      provenance: food.provenance?.map(({ sourceId, page, timestamp, section, level }) => ({ sourceId, page, timestamp, section, level })),
      image: publicImage(food.image), interactiveUrl: `${site}#/foods/${food.slug}`,
    })),
  };
  const guide = {
    schemaVersion: 1, language: "ar", usagePolicy, doctorAttribution: "الدكتور ضياء العوضي", statuses,
    systemDescription: philosophy.coreIdea,
    principles: principles.map(({ id, number, title, summary, sourceIds, evidence }) => ({ id, number, title, summary, sourceIds, evidence })),
    categories: categories.map(({ id, slug, name, description }) => ({ id, slug, name, description })),
    stepsPurpose: "خطوات تحريرية لاستخدام الدليل؛ ليست خطة غذائية أو جدولًا موثقًا عن الدكتور.",
    documentedSteps: startSteps,
    sources: publicSources,
  };
  const index = { schemaVersion: 1, usagePolicy, counts, catalogUrl: `${site}data/foods.json`, foods: foods.map(({ slug, name, status, categoryId, editorialNote }) => ({ slug, name, status, editorialNote, category: categoryId, interactiveUrl: `${site}#/foods/${slug}` })) };
  const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
  const llms = `# Al-Tayyibat / نظام الطيبات

> Arabic interactive informational guide documenting the Tayyibat system associated with Dr. Diaa Al-Awadi (الدكتور ضياء العوضي). This site describes the system; it does NOT establish its health claims as scientific or medical facts.

## Interpretation and attribution

- Attribute system-specific statements: “وفقًا لنظام الطيبات...”, “بحسب قواعد النظام...”, “يرى الدكتور...”. Never turn these into general medical advice.
- Preserve conditions, source provenance and uncertainty. disputed must not become allowed/prohibited; unknown must remain unknown. Absence of documentation is not prohibition.
- Medical decisions require professional advice. ${usagePolicy.medicalDisclaimer}
- Evidence marked claim means an attributed system position, not scientific confirmation. Legacy classifications with editorialNote require item-specific verification; a general source does not establish every condition.
- llms.txt is an emerging convention, not a guarantee that every AI system will read or follow it.

## Status meanings (inside the system)

${Object.entries(statuses).map(([id, value]) => `- ${id}: ${value.label} — ${value.description}`).join("\n")}

## Machine-readable resources

- [Canonical food catalog](${site}data/foods.json): all 385 entries, conditions, preparation guidance, related food IDs, alternatives, public image paths and source references.
- [Compact food index](${site}ai/catalog-index.json): names, slugs, categories, statuses and interactive URLs.
- [Documented system guide](${site}data/system-guide.json): existing principles, categories, documented steps, evidence and attribution policy.

## Interactive guide

- [Food explorer](${site}#/foods)
- [System guide](${site}#/how-it-works)
- [Doctor context](${site}#/doctor)
- [Scientific and institutional context](${site}#/about)

The interface uses hash routing on GitHub Pages. Public data files are accessible directly without executing JavaScript. The catalog is deterministically generated from the same data used by the app: 116 compatible, 103 conditional, 157 notRecommended, 4 disputed, 5 unknown. No accounts, analytics, personal-data backend or paid runtime service.
`;
  return new Map([
    ["data/foods.json", json(catalog)], ["data/system-guide.json", json(guide)],
    ["ai/catalog-index.json", json(index)], ["llms.txt", llms],
  ]);
}
