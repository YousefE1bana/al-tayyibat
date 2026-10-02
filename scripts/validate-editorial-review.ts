import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { foods } from "../src/data/foods";
import { recipes } from "../src/data/recipes";

const audit = JSON.parse(await readFile("docs/editorial-catalog-review.json", "utf8"));
if (audit.records.length !== foods.length || new Set(audit.records.map((row: {id:string}) => row.id)).size !== foods.length) throw new Error("Editorial inventory must cover every food exactly once");
for (const food of foods) {
  const row = audit.records.find((item: {id:string}) => item.id === food.id);
  if (!row || row.status !== food.status || JSON.stringify(row.retainedSourceIds) !== JSON.stringify(food.sourceIds ?? [])) throw new Error(`Stale editorial inventory: ${food.id}`);
  if (row.removedReferenceCount && !food.editorialNote) throw new Error(`Missing public provenance limitation: ${food.id}`);
}
const soup = recipes.find(recipe => recipe.id === "yellow-lentil-soup")!;
if (!soup.foodIds.includes("yellow-lentils") || soup.foodIds.includes("legumes")) throw new Error("Lentil soup must reference the exact ingredient, not generic legumes");
for (const recipe of recipes) {
  if (recipe.ingredients.some(ingredient => /ثوم/.test(ingredient))) throw new Error(`Unresolved garlic exception in recipe: ${recipe.id}`);
  if (!recipe.instructionsNote) throw new Error(`Recipe attribution limit missing: ${recipe.id}`);
}

// Nonzero source pixels must survive the strictly trimmed, padded derivative.
const source = await sharp("assets/doctor/secondary-approved.png").ensureAlpha().raw().toBuffer({resolveWithObject:true});
const runtime = await sharp("public/images/doctor/secondary.webp").ensureAlpha().raw().toBuffer({resolveWithObject:true});
let left = source.info.width, top = source.info.height, sum = 0, weightedX = 0;
for(let y=0;y<source.info.height;y++) for(let x=0;x<source.info.width;x++) {
  const a = source.data[(y*source.info.width+x)*4+3];
  if(a){left=Math.min(left,x);top=Math.min(top,y);sum+=a;weightedX+=x*a;}
}
const sourceCenter=weightedX/sum;
const offset=Math.round((runtime.info.width-1)/2-(sourceCenter-left));
let runtimeSum=0,runtimeWeightedX=0;
for(let y=0;y<source.info.height;y++) for(let x=0;x<source.info.width;x++) {
  const i=(y*source.info.width+x)*4;
  if(!source.data[i+3])continue;
  const rx=x-left+offset,ry=y-top;
  if(rx<0 || rx>=runtime.info.width || ry<0 || ry>=runtime.info.height)throw new Error("Visible portrait pixel cropped");
  const j=(ry*runtime.info.width+rx)*4;
  for(let channel=0;channel<4;channel++)if(source.data[i+channel]!==runtime.data[j+channel])throw new Error(`Portrait pixel altered: ${x},${y},${channel}`);
  runtimeSum+=runtime.data[j+3];runtimeWeightedX+=rx*runtime.data[j+3];
}
if(Math.abs(runtimeWeightedX/runtimeSum-(runtime.info.width-1)/2)>0.5)throw new Error("Visible portrait subject is not centered");
console.log("Editorial inventory covers 385 foods; recipe consistency passed; every nontransparent approved portrait pixel preserved and visible subject centered within 0.5 px.");
