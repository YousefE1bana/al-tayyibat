import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { foods } from '../src/data/foods';

// Read the actual canonical files, rather than continuing a historical queue.
const entries = await Promise.all(foods.map(async food => {
  const path = `public/images/foods/${food.id}.jpg`;
  let state: 'accepted' | 'missing' | 'invalid' = 'missing';
  let bytes: number | undefined;
  let sha256: string | undefined;
  try {
    const buffer = await fs.readFile(path);
    const meta = await sharp(buffer).metadata();
    bytes = buffer.length;
    sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    state = food.image === `/images/foods/${food.id}.jpg` && meta.width === 1200 && meta.height === 900 && meta.format === 'jpeg' ? 'accepted' : 'invalid';
  } catch { /* Missing/undecodable image is queued for review. */ }
  return { id: food.id, name: food.name, categoryId: food.categoryId, state, path, bytes, sha256 };
}));
const remaining = entries.filter(e => e.state !== 'accepted');
const manifest = {
  catalogFoodCount: foods.length,
  generatedAt: new Date().toISOString().slice(0,10),
  basis: 'Actual food assignments and canonical local image files; visual acceptance is recorded separately in image-migration and generated review records.',
  summary: { hasValidImage: entries.length - remaining.length, needsImage: remaining.length, totalImagesToGenerate: remaining.length },
  remainingIds: remaining.map(e => e.id),
  foods: entries,
};
await fs.writeFile('docs/image-generation-manifest.json', JSON.stringify(manifest,null,2)+'\n');
const table = remaining.length ? '| ID | الطعام | الحالة |\n| --- | --- | --- |\n'+remaining.map(e=>`| ${e.id} | ${e.name} | ${e.state} |`).join('\n') : 'لا توجد صور طعام متبقية للتوليد.';
await fs.writeFile('docs/image-generation-queue.md', `# Remaining food image generation\n\nRebuilt ${manifest.generatedAt} from local reality. Catalog: **${foods.length}**; accepted canonical photos: **${entries.length-remaining.length}**; remaining: **${remaining.length}**.\n\n${table}\n\nThe historical 277-item queue is superseded. Staged originals remain in newasset; generated originals remain in ignored output/imagegen. Each replacement requires visual review before acceptance. Never generate or modify the doctor portrait.\n`);
await fs.writeFile('docs/image-generation-manifest.md', `# Image catalog status\n\nSee [the JSON manifest](image-generation-manifest.json) for file sizes, SHA-256 hashes and canonical paths, [the remaining queue](image-generation-queue.md), [migration records](image-migration.json), and [generated acceptance](generated-image-review.json).\n\n${entries.length-remaining.length}/${foods.length} canonical 1200×900 JPEG photos; ${remaining.length} pending. Hashes and dimensions check integrity, not food identity: visual review remains required.\n`);
console.log(`Manifest rebuilt: ${entries.length-remaining.length}/${foods.length}; remaining ${remaining.length}.`);
