import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { foods } from '../src/data/foods';
import { categories } from '../src/data/categories';
import { recipes } from '../src/data/recipes';
import { images } from '../src/data/images';

const errors: string[] = [];
const assignments = new Map<string,string>();
const hashes = new Map<string,string>();
let withImages=0,totalBytes=0;
for(const food of foods){
  if(!food.image) continue;
  withImages++;
  if(food.image !== `/images/foods/${food.id}.jpg`) errors.push(`${food.id}: noncanonical image filename`);
  if(assignments.has(food.image)) errors.push(`${food.id}: shared image with ${assignments.get(food.image)}`);
  assignments.set(food.image,food.id);
  try{
    const buffer=await fs.readFile(`public${food.image}`);
    totalBytes+=buffer.length;
    const hash=crypto.createHash('sha256').update(buffer).digest('hex');
    if(hashes.has(hash)) errors.push(`${food.id}: identical image bytes to ${hashes.get(hash)}`);
    hashes.set(hash,food.id);
    const meta=await sharp(buffer).metadata();
    if(meta.format!=='jpeg' || meta.width!==1200 || meta.height!==900) errors.push(`${food.id}: expected 1200x900 JPEG`);
    if(buffer.length>600000) errors.push(`${food.id}: food image exceeds 600 KB review threshold`);
  }catch{ errors.push(`${food.id}: missing or undecodable image`); }
}
const refs=[...Object.values(images),...recipes.map(r=>r.image),...categories.map(c=>c.image)].filter((x):x is string=>Boolean(x));
for(const ref of new Set(refs)){
  if(!ref.startsWith('/images/')) {errors.push(`nonlocal image: ${ref}`);continue;}
  try{await fs.access(`public${ref}`);}catch{errors.push(`missing registry/recipe/category image: ${ref}`);}
}
const portrait=crypto.createHash('sha256').update(await fs.readFile('public/images/doctor/portrait.jpg')).digest('hex').toUpperCase();
if(portrait!=='1F7B96BDFFF3CF726CFC14EBC565333F62399DFFB75BF2ED576D15A0F87D05AC') errors.push('Protected doctor portrait changed');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log(`Image integrity passed: ${withImages}/${foods.length} foods, ${foods.length-withImages} awaiting images; 0 broken references; 0 duplicate assignments/bytes; 1200x900 JPEG. Food images ${(totalBytes/1048576).toFixed(2)} MB. Protected portrait unchanged.`);
