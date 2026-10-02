import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const base = process.env.QA_BASE_URL || 'https://yousefe1bana.github.io/al-tayyibat/';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const files = await fs.readdir('dist', { recursive: true });
const targets = [];
for (const file of files) {
  const absolutePath = path.join('dist', file);
  if (!(await fs.stat(absolutePath)).isFile()) continue;
  const bytes = await fs.readFile(absolutePath);
  targets.push({ path: file.replaceAll('\\', '/'), sha256: hash(bytes) });
}
const foodImageAssets = targets.filter(target => /^images\/foods\//.test(target.path)).length;
const report = { base, checkedAt: new Date().toISOString(), sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), foodImageAssets, checked: 0, failures: [] };
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
await fs.mkdir('output/qa', { recursive: true });
await fs.writeFile('output/qa/live-assets.json', JSON.stringify(report, null, 2) + '\n');
console.log(`Public assets: ${report.checked}/${targets.length} match validated build, including ${report.foodImageAssets} local food/recipe photographs; ${report.failures.length} failures.`);
if (report.failures.length) { console.error(report.failures); process.exitCode = 1; }
