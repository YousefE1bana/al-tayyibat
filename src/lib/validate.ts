import { categories, categoriesById } from "@/data/categories";
import { faq, faqCategories } from "@/data/faq";
import { foods } from "@/data/foods";
import { doctor } from "@/data/doctor";
import { philosophy, principles, theories } from "@/data/principles";
import { recipes } from "@/data/recipes";
import { articles, shoppingGroups, startSteps } from "@/data/guide";
import { sources, sourcesById } from "@/data/sources";

/**
 * Pure consistency checks shared by the application and command-line validator.
 * These checks validate references, never infer or change dietary classifications.
 */
export function collectContentErrors(): string[] {
  const errors: string[] = [];
  const foodIds = new Set<string>();
  const foodSlugs = new Set<string>();

  const checkUnique = (label: string, rows: { id: string; slug?: string }[]) => {
    const ids = new Set<string>();
    const slugs = new Set<string>();
    rows.forEach((row) => {
      if (!row.id.trim()) errors.push(`${label}: empty id`);
      if (ids.has(row.id)) errors.push(`duplicate ${label} id "${row.id}"`);
      ids.add(row.id);
      if (row.slug !== undefined) {
        if (!row.slug.trim()) errors.push(`${label} "${row.id}": empty slug`);
        if (slugs.has(row.slug)) errors.push(`duplicate ${label} slug "${row.slug}"`);
        slugs.add(row.slug);
      }
    });
  };

  checkUnique("food", foods);
  checkUnique("category", categories);
  checkUnique("source", sources);
  checkUnique("recipe", recipes);
  checkUnique("principle", principles);
  checkUnique("theory", theories);
  checkUnique("faq", faq);
  checkUnique("step", startSteps);
  checkUnique("article", articles);
  checkUnique("timeline", doctor.timeline);
  checkUnique("shopping group", shoppingGroups);
  checkUnique("shopping item", shoppingGroups.flatMap((group) => group.items));

  const checkSources = (owner: string, ids?: string[]) => {
    ids?.forEach((id) => {
      if (!sourcesById[id]) errors.push(`${owner}: unknown sourceId "${id}"`);
    });
  };

  for (const f of foods) {
    foodIds.add(f.id);
    foodSlugs.add(f.slug);
    if (!["compatible", "conditional", "notRecommended", "disputed", "unknown"].includes(f.status)) {
      errors.push(`food "${f.id}": unknown status "${f.status}"`);
    }
    if (!categoriesById[f.categoryId]) errors.push(`food "${f.id}": unknown categoryId "${f.categoryId}"`);
    if (f.image !== undefined && f.image.trim() === "") {
      errors.push(`food "${f.id}": empty declared image path`);
    }
    checkSources(`food "${f.id}"`, f.sourceIds);
    f.provenance?.forEach((p) => {
      if (!sourcesById[p.sourceId]) errors.push(`food "${f.id}": unknown provenance sourceId "${p.sourceId}"`);
    });
  }
  for (const f of foods) {
    f.alternatives?.forEach((id) => {
      if (!foodIds.has(id)) errors.push(`food "${f.id}": unknown alternative "${id}"`);
    });
    f.relatedFoods?.forEach((id) => {
      if (!foodIds.has(id)) errors.push(`food "${f.id}": unknown relatedFood "${id}"`);
    });
  }

  for (const r of recipes) {
    r.foodIds.forEach((id) => {
      if (!foodIds.has(id)) errors.push(`recipe "${r.id}": unknown foodId "${id}"`);
    });
    checkSources(`recipe "${r.id}"`, r.sourceIds);
  }

  principles.forEach((p) => checkSources(`principle "${p.id}"`, p.sourceIds));
  checkSources("philosophy", philosophy.sourceIds);
  theories.forEach((t) => checkSources(`theory "${t.id}"`, t.sourceIds));
  faq.forEach((q) => {
    checkSources(`faq "${q.id}"`, q.sourceIds);
    if (!(faqCategories as readonly string[]).includes(q.category)) {
      errors.push(`faq "${q.id}": unknown category "${q.category}"`);
    }
  });
  startSteps.forEach((s) => checkSources(`step "${s.id}"`, s.sourceIds));
  doctor.timeline.forEach((t) => checkSources(`timeline "${t.id}"`, t.sourceIds));
  doctor.quotes.forEach((q, i) => checkSources(`quote #${i}`, [q.sourceId]));
  shoppingGroups.forEach((g) => {
    checkSources(`shopping "${g.id}"`, g.sourceIds);
    g.items.forEach((it) => {
      if (it.foodId && !foodIds.has(it.foodId)) errors.push(`shopping "${g.id}": unknown foodId "${it.foodId}"`);
    });
  });

  // Content-owned links use the same routes/section IDs rendered by the pages.
  const routeAnchors: Record<string, Set<string>> = {
    "/": new Set(),
    "/about": new Set(["principles", "science", "theories"]),
    "/how-it-works": new Set(["mistakes"]),
    "/foods": new Set(),
    "/recipes": new Set(recipes.map((r) => r.slug)),
    "/faq": new Set(faq.map((q) => q.id)),
    "/doctor": new Set(),
    "/favorites": new Set(),
    "/shopping": new Set(),
    "/alternatives": new Set(),
    "/ingredients": new Set(),
    "/print": new Set(),
  };
  const checkHref = (owner: string, href: string) => {
    if (!href.startsWith("/") || href.startsWith("//")) {
      errors.push(`${owner}: expected internal href "${href}"`);
      return;
    }
    const url = new URL(href, "https://content.invalid");
    if (url.pathname.startsWith("/foods/")) {
      if (!foodSlugs.has(decodeURIComponent(url.pathname.slice("/foods/".length)))) {
        errors.push(`${owner}: unknown food href "${href}"`);
      }
    } else if (!routeAnchors[url.pathname]) {
      errors.push(`${owner}: unknown route "${href}"`);
    } else if (url.hash && !routeAnchors[url.pathname].has(decodeURIComponent(url.hash.slice(1)))) {
      errors.push(`${owner}: unknown section "${href}"`);
    }
    const category = url.searchParams.get("category");
    if (category && !categoriesById[category]) errors.push(`${owner}: unknown category in href "${href}"`);
  };
  articles.forEach((a) => checkHref(`article "${a.id}"`, a.href));
  faq.forEach((q) => {
    if (q.relatedHref) checkHref(`faq "${q.id}"`, q.relatedHref);
  });
  sources.forEach((s) => {
    if (!s.url) return;
    try {
      const url = new URL(s.url);
      if (!["https:", "http:"].includes(url.protocol)) errors.push(`source "${s.id}": invalid URL protocol`);
    } catch {
      errors.push(`source "${s.id}": invalid URL "${s.url}"`);
    }
  });

  return errors;
}

/** Throws in development so broken references are visible; warns in production. */
export function validateContent(): string[] {
  const errors = collectContentErrors();

  if (errors.length) {
    const message = `Content validation failed:\n - ${errors.join("\n - ")}`;
    if (import.meta.env?.DEV) throw new Error(message);
    console.warn(message);
  }
  return errors;
}
