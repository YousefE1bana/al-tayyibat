import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { foodsById } from '../src/data/foods';

// Use only AFTER visually inspecting the individual generated image.
const [id, source, ...args] = process.argv.slice(2);
if (!id || !source || !foodsById[id]) throw new Error('Usage: tsx scripts/accept-generated-image.ts <food-id> <reviewed-source.png> [--prompt=...]');
const review = JSON.parse(await fs.readFile('docs/generated-image-review.json','utf8'));
if (review.accepted.includes(id)) throw new Error(`${id} already accepted; do not overwrite a correct image.`);
const buffer = await fs.readFile(source);
const canonicalSource = `output/imagegen/${id}.png`;
if (path.resolve(source) !== path.resolve(canonicalSource)) {
  const existing = await fs.access(canonicalSource).then(()=>true,()=>false);
  if (existing) {
    await fs.mkdir('output/imagegen/rejected',{recursive:true});
    const archive = `output/imagegen/rejected/${id}-${Date.now()}.png`;
    await fs.copyFile(canonicalSource,archive);
    for (const rejected of review.rejected) if (rejected.id===id && rejected.file===canonicalSource) rejected.file=archive;
  }
  await fs.copyFile(source,canonicalSource);
}
const destination = `public/images/foods/${id}.jpg`;
await sharp(buffer).resize(1200,900,{fit:'cover',kernel:sharp.kernel.lanczos3}).jpeg({quality:88,mozjpeg:true}).toFile(destination);
review.accepted = [...review.accepted,id].sort();
review.individualRecords ??= [];
review.individualRecords.push({id,source:canonicalSource,sourceSha256:crypto.createHash('sha256').update(buffer).digest('hex'),reviewedAt:new Date().toISOString(),prompt:args.find(a=>a.startsWith('--prompt='))?.slice(9),accepted:true});
await fs.writeFile('docs/generated-image-review.json',JSON.stringify(review,null,2)+'\n');
console.log(`Accepted ${id}: optimized distinct 1200×900 JPEG; source retained.`);
