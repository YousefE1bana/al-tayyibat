import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { foods } from '../src/data/foods';

// Read-only guard: editorial baseline updates require an intentional content review.
const baseline = JSON.parse(await fs.readFile('docs/catalog-baseline.json', 'utf8'));
const content = JSON.stringify(foods.map(({image: _image, ...food}) => food));
const sha256 = crypto.createHash('sha256').update(content).digest('hex');
if (foods.length !== baseline.foodCount || sha256 !== baseline.imageExcludedContentSha256) {
  throw new Error('Food content differs from the reviewed catalog baseline. Investigate before release.');
}
console.log('Catalog baseline passed: ' + foods.length + ' records unchanged except image properties; SHA-256 ' + sha256 + '.');
