import fs from 'node:fs/promises';
import sharp from 'sharp';
import { foods } from '../src/data/foods';

const staged = (await fs.readdir('newasset')).filter(f => /\.(png|jpe?g|webp)$/i.test(f)).sort();
const existing = (await fs.readdir('public/images/foods')).filter(f => /\.(png|jpe?g|webp)$/i.test(f)).sort();
const generated = (await fs.readdir('output/imagegen')).filter(f => f.endsWith('.png')).sort();
await fs.mkdir('output/image-audit', { recursive: true });
const groups = process.argv.includes('--generated') ? [['generated', generated, 'output/imagegen']] : [['staged', staged, 'newasset'], ['existing', existing, 'public/images/foods']];
for (const [group, files, dir] of groups) {
  for (let start = 0; start < files.length; start += 20) {
    const batch = files.slice(start, start + 20);
    const layers: sharp.OverlayOptions[] = [];
    for (const [i, file] of batch.entries()) {
      const left = (i % 4) * 300, top = Math.floor(i / 4) * 245;
      layers.push({ input: await sharp(`${dir}/${file}`).resize(294, 210, { fit: 'contain', background: '#eeeeee' }).toBuffer(), left, top });
      const label = file.replace(/&/g, '&amp;');
      layers.push({ input: Buffer.from(`<svg width="300" height="35"><rect width="300" height="35" fill="white"/><text x="5" y="20" font-family="sans-serif" font-size="13">${label}</text></svg>`), left, top: top + 210 });
    }
    await sharp({ create: { width: 1200, height: Math.ceil(batch.length / 4) * 245, channels: 3, background: 'white' } }).composite(layers).jpeg({ quality: 90 }).toFile(`output/image-audit/${group}-${start}.jpg`);
  }
}
console.log(JSON.stringify({ staged: staged.length, existing: existing.length, missing: foods.filter(f => !f.image).map(f => ({ id: f.id, name: f.name })).slice(0, 10) }, null, 2));
