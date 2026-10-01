import fs from 'node:fs/promises';
import path from 'node:path';
import { foods } from '../src/data/foods';

const files = await fs.readdir('src',{recursive:true});
const used = new Set<string>();
const sources: string[] = [];
for (const file of files.filter(f=>/\.tsx?$/.test(f)&&f.replaceAll('\\','/')!=='data/images.ts')) {
  const source = await fs.readFile(path.join('src',file),'utf8');
  sources.push(source);
  for (const match of source.matchAll(/\bimages\.(\w+)/g)) used.add(match[1]);
}
const source = await fs.readFile('src/data/images.ts','utf8');
const kept: string[] = [], removed: string[] = [];
const registry = source.replace(/^  (\w+): "([^"\n]+)",\r?\n/gm,(line,key,url)=>{
  if(used.has(key)){kept.push(url);return line;}
  removed.push(key);return '';
}).replace(/^  \/\/[^\n]*\r?\n/gm,'');
const refs = new Set([...kept,...foods.map(f=>f.image).filter(Boolean)]);
for(const text of sources) for(const match of text.matchAll(/['"](\/images\/foods\/[^'"\n]+)['"]/g)) refs.add(match[1]);
const orphans = (await fs.readdir('public/images/foods')).filter(file=>!refs.has(`/images/foods/${file}`));
if(!process.argv.includes('--apply')) {
  console.log(JSON.stringify({unusedRegistryKeys:removed,orphanFiles:orphans},null,2));
} else {
  await fs.writeFile('src/data/images.ts',registry);
  await fs.mkdir('output/image-audit/retained-originals',{recursive:true});
  const root=path.resolve('public/images/foods');
  const archive=path.resolve('output/image-audit/retained-originals');
  for(const file of orphans){
    const from=path.resolve(root,file),to=path.resolve(archive,file);
    if(!from.startsWith(root+path.sep)||!to.startsWith(archive+path.sep)) throw new Error('Archive path escaped workspace');
    await fs.copyFile(from,to); // Preserve originals before removing them from the public build.
    if(!(await fs.readFile(from)).equals(await fs.readFile(to))) throw new Error(`Archive mismatch ${file}`);
    await fs.unlink(from);
  }
  await fs.writeFile('docs/asset-archive.json',JSON.stringify({archivedAt:'2026-10-01',purpose:'Unreferenced legacy/replacement originals retained locally outside the public build. No staging source or doctor image removed.',location:'output/image-audit/retained-originals',files:orphans,removedUnusedRegistryKeys:removed},null,2)+'\n');
  console.log(`Removed ${removed.length} unused registry keys; retained ${orphans.length} unreferenced original food files outside public build.`);
}
