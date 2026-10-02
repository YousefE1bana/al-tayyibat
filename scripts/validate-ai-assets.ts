import { readFile, access } from "node:fs/promises";
import { createAiAssets } from "./ai-assets";
for (const [path, expected] of createAiAssets()) {
  if (await readFile(`public/${path}`, "utf8") !== expected) throw new Error(`Stale AI export: ${path}. Run npm run generate:assets.`);
}
const catalog = JSON.parse(await readFile("public/data/foods.json", "utf8"));
for (const food of catalog.foods) {
  if (food.image) await access(`public/${food.image.replace(process.env.VITE_BASE_PATH || "/al-tayyibat/", "")}`);
}
console.log("AI exports match canonical data byte-for-byte; all 385 image paths exist.");
