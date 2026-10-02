import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { foods } from '../src/data/foods';
import { categories } from '../src/data/categories';
import { recipes } from '../src/data/recipes';
import { images } from '../src/data/images';
import { brand } from '../src/config/brand';
import { doctorAssets } from '../src/config/doctor-assets';

const errors: string[] = [];
const assignments = new Map<string,string>();
const hashes = new Map<string,string>();
let withImages=0,totalBytes=0;
for(const food of foods){
  if(!food.image) { errors.push(`${food.id}: missing image assignment`); continue; }
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
const used = new Set([...assignments.keys(), ...refs]);
for (const filename of await fs.readdir('public/images/foods')) {
  if (!used.has(`/images/foods/${filename}`)) errors.push(`orphan food image: ${filename}`);
}
const portrait=crypto.createHash('sha256').update(await fs.readFile('public/images/doctor/portrait.jpg')).digest('hex').toUpperCase();
if(portrait!=='1F7B96BDFFF3CF726CFC14EBC565333F62399DFFB75BF2ED576D15A0F87D05AC') errors.push('Protected doctor portrait changed');
const secondaryOriginal=crypto.createHash('sha256').update(await fs.readFile('assets/doctor/secondary-original.jpg')).digest('hex').toUpperCase();
if(secondaryOriginal!=='512D0D05B7B34569F50C0BC041D3E5FD2F727D3F24269C41ECCC519F075F57FA') errors.push('Preserved secondary doctor original changed');
if(!brand.mark || !doctorAssets.editorial) errors.push('Approved brand mark and editorial portrait must remain configured');
const optionalAssets=[...(brand.mark ? [brand.mark.default, brand.mark.dark, brand.mark.light] : []), brand.icon, doctorAssets.editorial].filter(x=>x!=null);
for(const asset of optionalAssets){
  if(!/^\/(?:brand|images\/doctor)\/[^/]+\.(?:svg|png|webp|jpg)$/.test(asset.src)) { errors.push(`Noncanonical brand/editorial asset: ${asset.src}`); continue; }
  if(asset.width<=0 || asset.height<=0) errors.push(`Invalid brand/editorial dimensions: ${asset.src}`);
  if(asset===doctorAssets.editorial && (asset.src===images.doctorPortrait || asset.src.includes('original') || !doctorAssets.editorial.alt.trim())) errors.push('Editorial portrait must use a separate approved asset and meaningful alt text');
  try{
    const meta=await sharp(`public${asset.src}`).metadata();
    const expectedFormat=asset.src.split('.').at(-1)==='jpg' ? 'jpeg' : asset.src.split('.').at(-1);
    if(meta.format!==expectedFormat) errors.push(`Brand/editorial format does not match extension: ${asset.src}`);
    if(meta.width!==asset.width || meta.height!==asset.height) errors.push(`Brand/editorial dimensions do not match asset: ${asset.src}`);
    if(asset===doctorAssets.editorial && doctorAssets.editorial.treatment==='cutout' && !meta.hasAlpha) errors.push('Cutout editorial portrait requires a transparent asset');
    if((asset===brand.icon || asset===brand.mark?.default) && !meta.hasAlpha) errors.push(`Approved brand raster must preserve alpha: ${asset.src}`);
    const bytes=(await fs.stat(`public${asset.src}`)).size;
    const limit=asset===doctorAssets.editorial ? 1048576 : asset===brand.icon ? 262144 : 65536;
    if(bytes>limit) errors.push(`Brand/editorial asset exceeds performance review budget: ${asset.src}`);
    if(asset===brand.icon && asset.width!==asset.height) errors.push('Compact icon master must be square');
  }catch{errors.push(`Missing or undecodable brand/editorial asset: ${asset.src}`);}
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log(`Image integrity passed: ${withImages}/${foods.length} foods, ${foods.length-withImages} awaiting images; 0 broken references; 0 duplicate assignments/bytes; 1200x900 JPEG. Food images ${(totalBytes/1048576).toFixed(2)} MB. Protected portrait and secondary original unchanged. ${optionalAssets.length} approved brand/editorial assets configured.`);
