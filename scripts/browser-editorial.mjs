import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base=process.env.QA_BASE_URL || 'http://127.0.0.1:4173/al-tayyibat/';
const output=process.env.QA_EDITORIAL_OUTPUT || 'output/playwright/editorial';
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={base,assertions:[],errors:[],pages:[],print:[]};
const assert=(ok,label)=>{if(!ok)throw Error(label);report.assertions.push(label);};
const escapeHtml=text=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
try {
  for(const width of [390,430,768,820,1024,1440,1920])for(const theme of ['dark','light']){
    const context=await browser.newContext({viewport:{width,height:width<768?844:1000},colorScheme:theme,reducedMotion:'reduce',serviceWorkers:'block'});
    const page=await context.newPage();
    page.on('pageerror',error=>report.errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400)report.errors.push(`${response.status()} ${response.url()}`);});
    page.on('requestfailed',request=>{if(request.failure()?.errorText!=='net::ERR_ABORTED')report.errors.push(`${request.failure()?.errorText} ${request.url()}`);});
    for(const route of ['/','/doctor','/print']){
      await page.goto(`${base}#${route}`,{waitUntil:'networkidle'});
      await page.locator('main h1').waitFor();await page.evaluate(()=>document.fonts.ready);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No overflow ${route}/${width}/${theme}`);
      const socials=page.locator('footer a[aria-label="Yousef Elbana على GitHub"], footer a[aria-label="Yousef Elbana على LinkedIn"]');
      assert(await socials.count()===2,`Both maintainer social buttons ${route}/${width}/${theme}`);
      assert(await socials.evaluateAll(links=>links.every(link=>{const r=link.getBoundingClientRect();return r.width===44&&r.height===44;})),`Equal social touch targets ${route}/${width}/${theme}`);
      if(route==='/'){
        await page.locator('.hero-doctor figcaption').screenshot({path:`${output}/hero-caption-${width}-${theme}.png`});
        assert(await page.locator('.hero-doctor figcaption').evaluate(el=>getComputedStyle(el).color===getComputedStyle(document.querySelector('.editorial-shell')).color),`Doctor name uses editorial ink ${width}/${theme}`);
        await page.locator('footer').first().screenshot({path:`${output}/footer-${width}-${theme}.png`});
      }
      if(route==='/print'){
        await page.screenshot({path:`${output}/kitchen-${width}-${theme}.png`});
        await page.locator('#kitchen-lists').scrollIntoViewIfNeeded();
        await page.screenshot({path:`${output}/kitchen-lists-${width}-${theme}.png`});
        assert(await page.locator('.kitchen-screen details').count()===3,`Full lists progressively disclosed ${width}/${theme}`);
        await page.locator('.kitchen-screen details').first().locator('summary').click();
        assert(await page.locator('.kitchen-screen details').first().getAttribute('open')!==null,`Catalog expansion ${width}/${theme}`);
      }
      if([390,820,1920].includes(width)){
        const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
        if(axe.violations.length)report.errors.push({route,width,theme,violations:axe.violations});
        assert(!axe.violations.length,`No WCAG A/AA regressions ${route}/${width}/${theme}`);
      }
      report.pages.push({route,width,theme});
    }
    await context.close();
    console.log(`Editorial ${width}/${theme}: passed.`);
  }
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',colorScheme:'light',serviceWorkers:'block'});
  const page=await context.newPage();await page.goto(`${base}#/print`,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  await page.emulateMedia({media:'print'});
  assert(!(await page.locator('#root > div > header').isVisible())&&!(await page.locator('#root > div > footer').isVisible()),'Site chrome hidden on paper');
  const sheets=await page.locator('.kitchen-sheet').evaluateAll(elements=>elements.map(element=>({height:element.getBoundingClientRect().height,width:element.getBoundingClientRect().width,text:element.textContent,font:getComputedStyle(element).fontSize})));
  report.print=sheets;
  assert(sheets.length===3&&sheets.every(sheet=>sheet.height<=273*96/25.4+1),'Three sheet layouts fit the A4 printable height');
  await page.pdf({path:`${output}/kitchen-a4.pdf`,format:'A4',preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
  await page.pdf({path:`${output}/kitchen-no-background-a4.pdf`,format:'A4',preferCSSPageSize:true,printBackground:false,displayHeaderFooter:false});
  for(let i=0;i<3;i++)await page.locator('.kitchen-sheet').nth(i).screenshot({path:`${output}/sheet-${i+1}.png`});
  await context.close();
}catch(error){report.errors.push(error.stack);process.exitCode=1;}
finally{
  await fs.writeFile(`${output}/report.json`,JSON.stringify(report,null,2));
  const previews=['390','820','1440','1920'].flatMap(width=>['dark','light'].flatMap(theme=>[`footer-${width}-${theme}.png`,`kitchen-${width}-${theme}.png`,`kitchen-lists-${width}-${theme}.png`]));
  await fs.writeFile(`${output}/review.html`,`<!doctype html><html lang="en"><meta charset="utf-8"><title>Editorial visual QA</title><style>body{background:#eee;font:16px system-ui;margin:24px}section{margin-bottom:24px}img{max-width:100%;display:block;border:1px solid #999}h2{font-size:16px}</style>${previews.map(file=>`<section><h2>${escapeHtml(file)}</h2><img src="${escapeHtml(file)}" loading="lazy"></section>`).join('')}</html>`);
  await browser.close();
  console.log(`Editorial QA: ${report.pages.length} views, ${report.assertions.length} checks, ${report.errors.length} errors.`);
  if(report.errors.length){console.error(JSON.stringify(report.errors,null,2));process.exitCode=1;}
}
