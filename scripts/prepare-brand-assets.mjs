import fs from 'node:fs/promises';
import sharp from 'sharp';

// Production processing only: never redraw, recolor or retouch approved artwork.
async function transparentBounds(source) {
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] === 0) continue;
    left = Math.min(left, x); right = Math.max(right, x);
    top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
  if (right < left) throw new Error(`Approved source has no visible artwork: ${source}`);
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

await fs.mkdir('public/brand', { recursive: true });
const markSource = 'assets/brand/mark-approved.png';
const markBounds = await transparentBounds(markSource);
await sharp(markSource).extract(markBounds).resize({ width: 256, height: 256, fit: 'inside', withoutEnlargement: true })
  .png({ compressionLevel: 9, effort: 10 }).toFile('public/brand/mark.png');
// Same artwork, centered with clear space in the canonical compact square.
await sharp(markSource).extract(markBounds).resize({ width: 472, height: 472, fit: 'contain', background: '#00000000', withoutEnlargement: true })
  .extend({ top: 20, bottom: 20, left: 20, right: 20, background: '#00000000' })
  .png({ compressionLevel: 9, effort: 10 }).toFile('public/brand/icon.png');

const portraitSource = 'assets/doctor/secondary-approved.png';
const portraitBounds = await transparentBounds(portraitSource);
// Alpha-weighted centering preserves even the supplied faint edge pixels.
// A barely visible trail on the right should not displace the visible subject.
const { data, info } = await sharp(portraitSource).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let alphaWeight = 0, weightedX = 0;
for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
  const alpha = data[(y * info.width + x) * 4 + 3];
  alphaWeight += alpha; weightedX += x * alpha;
}
const center = weightedX / alphaWeight - portraitBounds.left;
const padding = Math.round(portraitBounds.width - 1 - 2 * center);
await sharp(portraitSource).extract(portraitBounds)
  .extend({ left: Math.max(0, padding), right: Math.max(0, -padding), top: 0, bottom: 0, background: '#00000000' })
  .webp({ lossless: true, effort: 6 })
  .toFile('public/images/doctor/secondary.webp');
for (const file of ['public/brand/mark.png', 'public/brand/icon.png', 'public/images/doctor/secondary.webp']) {
  const meta = await sharp(file).metadata();
  console.log(`${file}: ${meta.width}x${meta.height}, ${(await fs.stat(file)).size} bytes, alpha=${meta.hasAlpha}`);
}
