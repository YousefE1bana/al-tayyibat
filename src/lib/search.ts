import Fuse, { type IFuseOptions } from "fuse.js";
import { categories } from "@/data/categories";
import { faq } from "@/data/faq";
import { foods } from "@/data/foods";
import { principles } from "@/data/principles";
import { recipes } from "@/data/recipes";
import { articles } from "@/data/guide";
import type { Food } from "@/types";
import { normalizeArabic, stripArticle } from "./arabic";

export type SearchDocType = "food" | "category" | "principle" | "recipe" | "faq" | "article";

export interface SearchDoc {
  type: SearchDocType;
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  /** Normalized title (article stripped). */
  nTitle: string;
  /** Normalized aliases — each variant indexed separately for accurate fuzzy scores. */
  nAliases: string[];
  nBody: string;
}

export const SEARCH_GROUP_LABEL: Record<SearchDocType, string> = {
  food: "الأطعمة",
  category: "الفئات",
  principle: "المبادئ",
  recipe: "الوصفات",
  faq: "الأسئلة الشائعة",
  article: "أقسام الدليل",
};

/** Query normalization: diacritics/hamza/teh-marbuta folding + definite-article stripping. */
export function normalizeQuery(q: string): string {
  return stripArticle(normalizeArabic(q));
}

/** Expands a term into indexable variants: full normalized form + article-stripped form + tokens. */
function variants(term: string): string[] {
  const base = normalizeArabic(term);
  const stripped = stripArticle(base);
  const out = new Set<string>([base, stripped]);
  // Titles like "الخيار والجزر والبروكلي" should match each item on its own.
  base
    .split(/\s+و?/)
    .map((t) => stripArticle(t.replace(/^و/, "")))
    .filter((t) => t.length >= 3)
    .forEach((t) => out.add(t));
  return [...out];
}

function doc(
  type: SearchDocType,
  id: string,
  title: string,
  href: string,
  keywords: string[],
  body: string,
  subtitle?: string,
): SearchDoc {
  const cleanTitle = title.replace(/\(.*?\)/g, " ").replace(/\s*\/\s*/g, " ");
  return {
    type,
    id,
    title,
    subtitle,
    href,
    nTitle: normalizeQuery(cleanTitle),
    nAliases: [...new Set([...variants(cleanTitle), ...keywords.flatMap(variants)])],
    nBody: normalizeArabic(body),
  };
}

export const searchDocs: SearchDoc[] = [
  ...foods.map((f) => doc("food", f.id, f.name, `/foods/${f.slug}`, f.aliases, f.shortDescription, f.shortDescription)),
  ...categories.map((c) => doc("category", c.id, c.name, `/foods?category=${c.id}`, [], c.description, c.description)),
  ...principles.map((p) => doc("principle", p.id, p.title, `/about#principles`, [], p.summary, p.summary)),
  ...recipes.map((r) => doc("recipe", r.id, r.name, `/recipes#${r.slug}`, [], r.description, r.description)),
  ...faq.map((q) => doc("faq", q.id, q.question, `/faq#${q.id}`, [], q.answer, q.category)),
  ...articles.map((a) => doc("article", a.id, a.title, a.href, [], a.summary, a.summary)),
];

const fuseOptions: IFuseOptions<SearchDoc> = {
  includeScore: true,
  ignoreLocation: true,
  threshold: 0.36,
  minMatchCharLength: 2,
  keys: [
    { name: "nAliases", weight: 0.6 },
    { name: "nTitle", weight: 0.3 },
    { name: "nBody", weight: 0.1 },
  ],
};

const globalFuse = new Fuse(searchDocs, fuseOptions);

const foodDocs = searchDocs.filter((d) => d.type === "food");
const foodFuse = new Fuse(foodDocs, {
  ...fuseOptions,
  keys: [
    { name: "nAliases", weight: 0.7 },
    { name: "nTitle", weight: 0.3 },
  ],
});

const foodById = new Map(foods.map((f) => [f.id, f]));

export function searchAll(query: string, limit = 24): SearchDoc[] {
  const q = normalizeQuery(query);
  if (q.length < 2) return [];
  return globalFuse.search(q, { limit }).map((r) => r.item);
}

export interface FoodMatch {
  food: Food;
  score: number;
}

/**
 * Enhanced food search: prioritizes exact term and whole-word token matches,
 * preventing subsegment collisions (e.g. 'الرز' matching 'الكرز') while preserving full fuzzy tolerance.
 */
const BUNDLED_FOOD_IDS = new Set([
  "raw-vegetables",
  "leafy-greens",
  "legumes",
  "farm-fish",
  "traditional-pastries",
  "white-bread",
  "citrus",
  "watermelon",
  "pears",
  "black-eyed-peas",
  "vegetable-oils",
  "duck",
  "shrimp",
  "nuts",
  "kunafa",
  "salt-spices",
  "aged-cheese",
  "white-cheese",
  "beef-burger-hotdog",
  "soda",
  "biscuits",
  "berries",
]);

export function searchFoods(query: string, limit = 30): FoodMatch[] {
  const q = normalizeQuery(query);
  if (q.length < 1) return [];

  const exactMatches: FoodMatch[] = [];
  const tokenMatches: FoodMatch[] = [];
  const seenIds = new Set<string>();

  for (const f of foods) {
    const normName = normalizeQuery(f.name);
    const normAliases = (f.aliases || []).map(normalizeQuery);
    const allTokens = [normName, ...normAliases];

    // 1. Exact full-term alias or name match (dedicated foods rank before bundled cards)
    if (allTokens.some((t) => t === q)) {
      const penalty = BUNDLED_FOOD_IDS.has(f.id) ? 0.02 : 0.0;
      exactMatches.push({ food: f, score: 0.0 + penalty });
      seenIds.add(f.id);
      continue;
    }

    // 2. Exact whole-word token boundary match (e.g. "أرز" in "أرز بسمتي" or "سمك" in "سمك بحري")
    const hasWholeWord = allTokens.some((t) => {
      const words = t.split(/\s+/);
      return words.includes(q);
    });

    if (hasWholeWord) {
      const penalty = BUNDLED_FOOD_IDS.has(f.id) ? 0.03 : 0.0;
      tokenMatches.push({ food: f, score: 0.04 + penalty });
      seenIds.add(f.id);
    }
  }

  exactMatches.sort((a, b) => a.score - b.score);
  tokenMatches.sort((a, b) => a.score - b.score);

  // Fuse fuzzy search for the remainder
  const fuseResults = foodFuse
    .search(q, { limit: limit * 2 })
    .map((r) => ({ food: foodById.get(r.item.id) as Food, score: r.score ?? 1 }))
    .filter((m) => Boolean(m.food) && !seenIds.has(m.food.id))
    // Penalize when query is a subsegment inside another word (e.g., 'رز' inside 'كرز') or bundled
    .map((m) => {
      const normName = normalizeQuery(m.food.name);
      const normAliases = (m.food.aliases || []).map(normalizeQuery);
      const allTokens = [normName, ...normAliases];
      const hasPrefixOrWord = allTokens.some(
        (t) => t.includes(q) && (t.startsWith(q) || t.includes(` ${q}`)),
      );
      const bundledPenalty = BUNDLED_FOOD_IDS.has(m.food.id) ? 0.2 : 0.0;
      return {
        food: m.food,
        score: (hasPrefixOrWord ? m.score : m.score + 0.35) + bundledPenalty,
      };
    })
    .sort((a, b) => a.score - b.score);

  return [...exactMatches, ...tokenMatches, ...fuseResults].slice(0, limit);
}

/** Confident single answer for the quick checker; undefined when nothing is close enough. */
export function bestFoodMatch(query: string): FoodMatch | undefined {
  const [top] = searchFoods(query, 1);
  if (!top) return undefined;
  return top.score <= 0.28 ? top : undefined;
}
