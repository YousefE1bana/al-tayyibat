import { foods } from "../src/data/foods";

const statusCounts: Record<string, number> = {
  compatible: 0,
  conditional: 0,
  notRecommended: 0,
  disputed: 0,
  unknown: 0,
};

for (const f of foods) {
  statusCounts[f.status] = (statusCounts[f.status] || 0) + 1;
}

console.log("=== FULL DATABASE STATUS BREAKDOWN ===");
for (const [st, cnt] of Object.entries(statusCounts)) {
  console.log(`${st.padEnd(16)}: ${cnt}`);
}
console.log(`TOTAL           : ${foods.length}`);

// Category breakdown
const catCounts: Record<string, number> = {};
for (const f of foods) {
  catCounts[f.categoryId] = (catCounts[f.categoryId] || 0) + 1;
}

console.log("\n=== FULL DATABASE CATEGORY BREAKDOWN ===");
for (const [cat, cnt] of Object.entries(catCounts)) {
  console.log(`${cat.padEnd(16)}: ${cnt}`);
}
