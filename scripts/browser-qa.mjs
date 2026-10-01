import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base=process.env.QA_BASE_URL || 'http://127.0.0.1:4173/al-tayyibat/';
const output='output/playwright/release';
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={base,checkedAt:new Date().toISOString(),routes:[],consoleErrors:[],pageErrors:[],brokenRequests:[],interactions:[],accessibility:[]};
const routes=['/','/foods','/foods/pasta','/foods/apple-cider-gummies','/ingredients','/alternatives','/recipes','/favorites','/shopping','/sources','/print','/404','/about','/how-it-works','/doctor','/faq'];
const check=(ok,message)=>{if(!ok) throw new Error(message);report.interactions.push(message);};
try{
for(const width of [1440,390]) for(const theme of ['dark','light']){
  const context=await browser.newContext({viewport:{width,height:1000},colorScheme:theme,reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',e=>report.pageErrors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400)report.brokenRequests.push({url:r.url(),status:r.status()});});
  page.on('requestfailed',r=>report.brokenRequests.push({url:r.url(),error:r.failure()?.errorText}));
  for(const route of routes){
    await page.goto(`${base}#${route}`,{waitUntil:'networkidle'});
    await page.locator('main h1').waitFor({state:'visible'});
    await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(async()=>{await Promise.all([...document.images].filter(i=>i.getBoundingClientRect().top<innerHeight).map(i=>i.decode().catch(()=>{})));});
    const state=await page.evaluate(()=>({theme:document.documentElement.dataset.theme,heading:document.querySelector('main h1')?.textContent,title:document.title,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src)}));
    const overflow=state.scrollWidth>width+1;
    report.routes.push({route,width,theme,...state,overflow});
    if(overflow) throw new Error(`Overflow ${width}/${theme}/${route}: ${state.scrollWidth}`);
    if(state.broken.length) throw new Error(`Broken image ${route}: ${state.broken.join(',')}`);
    await page.screenshot({path:`${output}/${route==='/'?'home':route.slice(1).replaceAll('/','-')}-${width}-${theme}.png`});
    const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    for(const v of a11y.violations) report.accessibility.push({route,width,theme,id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))});
  }
  await page.goto(`${base}#/foods`,{waitUntil:'networkidle'});
  const search=page.getByRole('searchbox',{name:'ابحث عن طعام'});
  await search.fill('مكرونة');
  await page.waitForFunction(()=>document.querySelector('main')?.textContent.includes('المكرونة'));
  check((await page.locator('main').innerText()).includes('المكرونة'),`Arabic food search ${width}/${theme}`);
  await search.fill('zzzxqv-no-such-food');
  await page.getByText('لم نجد هذا الطعام',{exact:false}).waitFor();
  check((await page.locator('main').innerText()).includes('لم نجد هذا الطعام'),`Empty search ${width}/${theme}`);
  await page.goto(`${base}#/foods/pasta`,{waitUntil:'networkidle'});
  const favorite=page.getByRole('button',{name:'حفظ المكرونة'});
  await favorite.click();
  await page.goto(`${base}#/favorites`,{waitUntil:'networkidle'});
  await page.getByRole('heading',{name:'المحفوظات',exact:true,level:1}).waitFor();
  check((await page.locator('main').innerText()).includes('المكرونة'),`Favorites persistence ${width}/${theme}`);
  await page.reload({waitUntil:'networkidle'});
  check((await page.locator('main').innerText()).includes('المكرونة'),`Favorites refresh ${width}/${theme}`);
  await page.goto(`${base}#/shopping`,{waitUntil:'networkidle'});
  const checkbox=page.getByRole('checkbox').first();
  await checkbox.click();
  check(await checkbox.getAttribute('aria-checked')==='true',`Shopping selection ${width}/${theme}`);
  await page.reload({waitUntil:'networkidle'});
  check(await page.getByRole('checkbox').first().getAttribute('aria-checked')==='true',`Shopping refresh ${width}/${theme}`);
  await page.goto(`${base}#/foods/nonexistent-slug`,{waitUntil:'networkidle'});
  await page.waitForURL('**#/404');
  check(page.url().endsWith('#/404'),`Invalid food slug ${width}/${theme}`);
  await page.goto(`${base}#/nonexistent-route`,{waitUntil:'networkidle'});
  await page.waitForURL('**#/404');
  check(page.url().endsWith('#/404'),`Unknown route ${width}/${theme}`);
  await page.goto(`${base}#/faq#%ZZ`,{waitUntil:'networkidle'});
  await page.getByRole('heading',{name:'الأسئلة الشائعة',exact:true,level:1}).waitFor();
  check((await page.locator('main').innerText()).includes('الأسئلة الشائعة'),`Malformed fragment ${width}/${theme}`);
  if(width===390){
    const menu=page.getByRole('button',{name:'القائمة',exact:true});
    await menu.click();
    check(await page.getByRole('navigation',{name:'قائمة الجوال'}).isVisible(),`Mobile menu opens ${theme}`);
    await page.keyboard.press('Escape');
    check(await menu.getAttribute('aria-expanded')==='false',`Mobile menu Escape ${theme}`);
  }
  await context.close();
}
// Corrupted and unavailable storage must retain a usable application.
for(const mode of ['malformed','denied']){
  const context=await browser.newContext({viewport:{width:390,height:900},reducedMotion:'reduce'});
  await context.addInitScript(mode=>{
    if(mode==='denied'){Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});return;}
    localStorage.setItem('tayyibat:favorites','null');localStorage.setItem('tayyibat:recent-foods','42');localStorage.setItem('tayyibat:shopping','{"bad":true}');localStorage.setItem('tayyibat:theme','broken');
  },mode);
  const page=await context.newPage();
  page.on('pageerror',e=>report.pageErrors.push(`${mode}: ${e.message}`));
  for(const route of ['/','/foods','/favorites','/shopping']){
    await page.goto(`${base}#${route}`,{waitUntil:'networkidle'});
    await page.locator('main h1').waitFor({state:'visible'});
    check(await page.locator('main h1').isVisible(),`${mode} storage ${route}`);
  }
  await page.getByRole('button',{name:/تفعيل المظهر/}).click();
  await context.close();
}
} finally{
  await fs.writeFile(`${output}/report.json`,JSON.stringify(report,null,2));
  await browser.close();
}
console.log(JSON.stringify({routes:report.routes.length,interactions:report.interactions.length,pageErrors:report.pageErrors.length,consoleErrors:report.consoleErrors.length,brokenRequests:report.brokenRequests.length,accessibility:report.accessibility.length}));
if(report.pageErrors.length||report.consoleErrors.length||report.brokenRequests.length||report.accessibility.length)process.exitCode=1;
