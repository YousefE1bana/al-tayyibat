import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { foods } from '../src/data/foods';
import { images } from '../src/data/images';

// Historical first migration only. Never overwrite the baseline or an accepted asset.
if (await fs.access('docs/image-migration.json').then(() => true, () => false)) {
  throw new Error('Initial migration already completed. Use refresh-image-manifest and accept-generated-image for subsequent work.');
}

// Reviewed visually on 2026-10-01; source originals are always retained.
const rejectedStaged = new Set(['instant-noodles']);
const rejectedExisting = new Set(['potatoes', 'cream-soup', 'moussaka', 'cola', 'nutella', 'processed-cheese', 'black-eyed-peas', 'tahini', 'traditional-pastries']);
const staged = (await fs.readdir('newasset')).filter(f => /\.(png|jpe?g)$/i.test(f));
let source = await fs.readFile('src/data/foods.ts', 'utf8');
let registry = await fs.readFile('src/data/images.ts', 'utf8');
const records: object[] = [];
const originalPaths = new Map<string, string>();
await fs.mkdir('output/image-audit', { recursive: true });
await fs.writeFile('output/image-audit/catalog-before.json', JSON.stringify(foods.map(({image, ...f}) => f)));
for (const food of foods) {
  const file = staged.find(f => f.replace(/\.[^.]+$/, '') === food.id);
  const accepted = file && !rejectedStaged.has(food.id);
  const input = accepted ? `newasset/${file}` : food.image && !rejectedExisting.has(food.id) ? `public${food.image}` : undefined;
  let finalImage: string | undefined;
  if (input) {
    finalImage = `/images/foods/${food.id}.jpg`;
    const destination = `public${finalImage}`;
    const buffer = await sharp(await fs.readFile(input)).rotate().resize(1200, 900, { fit: 'cover', kernel: sharp.kernel.lanczos3 }).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
    if (input === destination) await fs.copyFile(input, `output/image-audit/original-${food.id}.jpg`);
    await fs.writeFile(destination, buffer);
    if (food.image) originalPaths.set(food.image, finalImage);
    records.push({ id: food.id, source: input, sha256: crypto.createHash('sha256').update(await fs.readFile(input)).digest('hex'), accepted: true, bytes: buffer.length, replaced: Boolean(accepted && food.image) });
  } else if (food.image) {
    records.push({ id: food.id, source: `public${food.image}`, accepted: false, reason: 'Wrong subject or embedded branding/text found in visual review' });
  }
  const start = source.indexOf(`    id: "${food.id}",`);
  const end = source.indexOf('\n  },', start);
  const block = source.slice(start, end);
  let patched = block.replace(/^    image: .*\r?\n/m, '');
  if (finalImage) patched = patched.replace(/(    slug: "[^"]+",)/, `$1\n    image: "${finalImage}",`);
  source = source.slice(0, start) + patched + source.slice(end);
}
for (const [key, original] of Object.entries(images)) {
  if (key === 'doctorPortrait') continue;
  const replacement = originalPaths.get(original);
  if (replacement) registry = registry.replace(`"${original}"`, `"${replacement}"`);
}
// Recipes referencing these materially wrong photographs receive matching existing staged dishes.
registry = registry.replace('"/images/foods/local-potatoes.jpg"', '"/images/foods/baked-potatoes.jpg"')
  .replace('"/images/foods/local-moussaka.jpg"', '"/images/foods/traditional-moussaka.jpg"')
  .replace('"/images/foods/local-rozMeammar.jpg"', '"/images/foods/roz-meammar.jpg"');
registry = registry.replace(/\/\*\*[\s\S]*?\*\//, '/** Local photography registry. Canonical food photos are assigned in foods.ts. */');
await fs.writeFile('src/data/foods.ts', source);
await fs.writeFile('src/data/images.ts', registry);
await fs.writeFile('docs/image-migration.json', JSON.stringify({ reviewedAt: '2026-10-01', stagedCount: staged.length, stagedAccepted: staged.length - rejectedStaged.size, stagedRejected: [...rejectedStaged], rejectedExisting: [...rejectedExisting], portraitSha256: '1F7B96BDFFF3CF726CFC14EBC565333F62399DFFB75BF2ED576D15A0F87D05AC', records }, null, 2) + '\n');
console.log({ staged: staged.length, stagedAccepted: staged.length - rejectedStaged.size, migrated: records.filter((r: any) => r.accepted).length });
