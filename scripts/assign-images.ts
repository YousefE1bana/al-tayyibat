import fs from 'node:fs/promises';
import ts from 'typescript';
import sharp from 'sharp';

const migration = JSON.parse(await fs.readFile('docs/image-migration.json', 'utf8'));
const accepted = new Set<string>(migration.records.filter((r: {accepted: boolean}) => r.accepted).map((r: {id: string}) => r.id));
const generated = (await fs.readdir('output/imagegen')).filter(f => f.endsWith('.png'));
const review = JSON.parse(await fs.readFile('docs/generated-image-review.json', 'utf8'));
if (process.argv.includes('--accept-generated')) {
  for (const file of generated) {
    const id = file.slice(0,-4);
    if (!review.accepted.includes(id)) continue;
    const destination = `public/images/foods/${id}.jpg`;
    const exists = await fs.access(destination).then(()=>true,()=>false);
    if (!exists || process.argv.includes(`--replace=${id}`)) {
      await sharp(await fs.readFile(`output/imagegen/${file}`)).resize(1200,900,{fit:'cover',kernel:sharp.kernel.lanczos3}).jpeg({quality:88,mozjpeg:true}).toFile(destination);
    }
    accepted.add(id);
  }
}
// AST offsets change only image properties; preserve every other character in the content source.
let source = await fs.readFile('src/data/foods.ts','utf8');
const ast = ts.createSourceFile('foods.ts',source,ts.ScriptTarget.Latest,true);
const edits: {start: number; end: number; text: string}[] = [];
function visit(node: ts.Node) {
  if (ts.isObjectLiteralExpression(node)) {
    const props=node.properties.filter(ts.isPropertyAssignment);
    const idProp=props.find(p=>p.name.getText(ast)==='id');
    const slug=props.find(p=>p.name.getText(ast)==='slug');
    if (idProp && slug && ts.isStringLiteral(idProp.initializer)) {
      const id=idProp.initializer.text;
      const imageProps = props.filter(p=>p.name.getText(ast)==='image');
      for (const p of imageProps) {
        const desired = `image: "/images/foods/${id}.jpg"`;
        if (accepted.has(id)) {
          if (p.getText(ast) !== desired) edits.push({start:p.getStart(ast),end:p.end,text:desired});
        } else edits.push({start:p.getStart(ast),end:p.end + (source[p.end]===',' ? 1:0),text:''});
      }
      if (accepted.has(id) && imageProps.length === 0) edits.push({start:slug.end+1,end:slug.end+1,text:`\n    image: "/images/foods/${id}.jpg",`});
    }
  }
  ts.forEachChild(node,visit);
}
visit(ast);
for(const edit of edits.sort((a,b)=>b.start-a.start)) source=source.slice(0,edit.start)+edit.text+source.slice(edit.end);
await fs.writeFile('src/data/foods.ts',source);
console.log(`Assigned ${accepted.size} canonical food images; food content untouched.`);
