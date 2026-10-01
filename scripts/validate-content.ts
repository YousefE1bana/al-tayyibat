import { foods } from "../src/data/foods";
import { collectContentErrors } from "../src/lib/validate";
import type { FoodStatus } from "../src/types";

// Catalog baseline: changing a classification requires an explicit content review.
const expectedCounts: Record<FoodStatus, number> = {
  compatible: 116,
  conditional: 103,
  notRecommended: 157,
  disputed: 4,
  unknown: 5,
};
const counts: Record<FoodStatus, number> = {
  compatible: 0,
  conditional: 0,
  notRecommended: 0,
  disputed: 0,
  unknown: 0,
};
const errors = collectContentErrors();
for (const food of foods) counts[food.status]++;
if (foods.length !== 385) errors.push(`catalog: expected 385 foods, received ${foods.length}`);
for (const [status, expected] of Object.entries(expectedCounts)) {
  const actual = counts[status as FoodStatus];
  if (actual !== expected) errors.push(`catalog: expected ${expected} ${status} foods, received ${actual}`);
}

if (errors.length) {
  console.error(`Content validation failed (${errors.length} errors):\n${errors.map((error) => ` - ${error}`).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log("Content validation passed: 385 foods; all IDs, slugs, sources, categories and internal links resolve.");
  console.log(`Status counts: ${Object.entries(counts).map(([status, count]) => `${status}=${count}`).join(", ")}`);
}
