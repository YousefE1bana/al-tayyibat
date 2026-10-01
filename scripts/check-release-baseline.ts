import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { foods } from '../src/data/foods';

// Local audit snapshot; deliberately excluded from the repository.
const before = await fs.readFile('output/image-audit/catalog-before.json','utf8');
const after = JSON.stringify(foods.map(({image: _image, ...food})=>food));
if (before !== after) throw new Error('Food content changed outside the image properties. Investigate before release.');
const sha256 = crypto.createHash('sha256').update(after).digest('hex');
await fs.writeFile('docs/catalog-baseline.json',JSON.stringify({checkedAt:'2026-10-01',foodCount:foods.length,imageExcludedContentSha256:sha256,meaning:'Current runtime food objects, excluding image only, match the pre-pass local audit snapshot exactly.'},null,2)+'\n');
console.log(`All ${foods.length} food records unchanged except image properties; SHA-256 ${sha256}.`);
