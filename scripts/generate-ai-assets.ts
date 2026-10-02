import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createAiAssets } from "./ai-assets";

for (const [path, content] of createAiAssets()) {
  await mkdir(dirname(`public/${path}`), { recursive: true });
  await writeFile(`public/${path}`, content);
}
console.log("Generated deterministic AI catalog, guide, index and llms.txt (385 foods).");
