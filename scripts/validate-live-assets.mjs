import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const base = process.env.QA_BASE_URL || 'https://yousefe1bana.github.io/al-tayyibat/';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const manifest = JSON.parse(await fs.readFile('docs/image-generation-manifest.json', 'utf8'));
const files = (await fs.readdir('dist', { recursive: true })).filter(file => !file.startsWith(`images${path.sep}foods${path.sep}`));
const targets = manifest.foods.map(food => ({ path: food.path.replace(/^public\//, ''), sha256: food.sha256 }));
for (const file of files) {
  const bytes = await fs.readFile(path.join('dist', file)).catch(() => null);
  if (bytes) targets.push({ path: file.replaceAll('\\', '/'), sha256: hash(bytes) });
}
const report = { base, checkedAt: new Date().toISOString(), sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), foodImages: manifest.foods.length, checked: 0, failures: [] };
let next = 0;
async function worker() {
  while (next < targets.length) {
    const target = targets[next++];
    try {
      const response = await fetch(new URL(target.path, base), { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (hash(Buffer.from(await response.arrayBuffer())) !== target.sha256) throw new Error('Published bytes differ from validated build');
      report.checked++;
    } catch (error) { report.failures.push({ path: target.path, error: error.message }); }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
await fs.writeFile('docs/live-assets-qa.json', JSON.stringify(report, null, 2) + '\n');
console.log(`Public assets: ${report.checked}/${targets.length} match validated build, including ${report.foodImages} food photographs; ${report.failures.length} failures.`);
if (report.failures.length) { console.error(report.failures); process.exitCode = 1; }
