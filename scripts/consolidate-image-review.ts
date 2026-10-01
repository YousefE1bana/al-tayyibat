import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const file='docs/generated-image-review.json';
const review=JSON.parse(await fs.readFile(file,'utf8'));
const records=new Map((review.individualRecords ?? []).map((r: {id:string})=>[r.id,r]));
for(const legacy of ['docs/generated-review-a.json','docs/generated-review-b.json']) {
  const entries=await fs.readFile(legacy,'utf8').then(JSON.parse,()=>[]);
  for(const e of entries){
    const id=e.id ?? e.j?.id;
    if(review.accepted.includes(id)&&!records.has(id))records.set(id,{id,prompt:e.prompt,review:e.review,accepted:true});
  }
  if(entries.length){
    await fs.mkdir('output/image-audit/review-records',{recursive:true});
    await fs.copyFile(legacy,`output/image-audit/review-records/${legacy.split('/').pop()}`);
    await fs.unlink(legacy);
  }
}
review.individualRecords=[];
for(const id of review.accepted){
  const source=`output/imagegen/${id}.png`;
  const buffer=await fs.readFile(source);
  review.individualRecords.push({...records.get(id) as object,id,source,sourceSha256:crypto.createHash('sha256').update(buffer).digest('hex'),accepted:true});
}
await fs.writeFile(file,JSON.stringify(review,null,2)+'\n');
console.log(`Consolidated ${review.accepted.length} accepted images; original review records retained locally.`);
