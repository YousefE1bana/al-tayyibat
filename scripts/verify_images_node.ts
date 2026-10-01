import fs from "fs";
import path from "path";
import { foods } from "../src/data/foods";

let withImages = 0;
let awaitingImages = 0;
let brokenImages = 0;

for (const f of foods) {
  if (f.image !== undefined && f.image !== null) {
    withImages++;
    const diskPath = path.join(process.cwd(), "public", f.image.replace(/^\//, ""));
    if (!fs.existsSync(diskPath)) {
      console.error(`Broken image for food ${f.id}: ${f.image} -> ${diskPath}`);
      brokenImages++;
    }
  } else {
    awaitingImages++;
  }
}

console.log(`Total foods: ${foods.length}`);
console.log(`Foods with images: ${withImages}`);
console.log(`Foods awaiting images: ${awaitingImages}`);
console.log(`Broken declared images: ${brokenImages}`);
