import { chromium } from 'playwright';
import { mkdir, readFile } from 'node:fs/promises';
import sharp from 'sharp';

// Use the real UI, approved raster mark and local fonts. No invented meal imagery.
const base = new URL(process.env.QA_BASE_URL || 'http://127.0.0.1:4173/al-tayyibat/');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1,
    colorScheme: 'dark', reducedMotion: 'reduce', serviceWorkers: 'block',
  });
  await context.addInitScript(() => localStorage.setItem('tayyibat:theme', 'dark'));
  const page = await context.newPage();
  await page.goto(new URL('#/', base).href, { waitUntil: 'networkidle' });
  await page.locator('.home-hero').waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].filter(i => i.getBoundingClientRect().top < innerHeight).map(i => i.decode()));
  });
  const colors = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return Object.fromEntries(['bg', 'ink', 'ink-2', 'accent', 'line-soft', 'surface'].map(key => [key, styles.getPropertyValue('--' + key).trim()]));
  });
  const hero = await page.locator('.home-hero').boundingBox();
  if (!hero) throw new Error('Homepage hero is missing.');
  const ui = await page.screenshot({ clip: { x: 0, y: 0, width: 1440, height: Math.min(980, Math.ceil(hero.y + hero.height)) } });
  const mark = await readFile('public/brand/mark.png');
  const font = weight => new URL(`fonts/ibm-plex-sans-arabic/ibm-plex-sans-arabic-arabic-${weight}.woff2`, base).href;
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>
    @font-face{font-family:Plex;src:url('${font(700)}');font-weight:700}
    @font-face{font-family:Plex;src:url('${font(400)}');font-weight:400}
    *{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px}
    body{background:${colors.bg};color:${colors.ink};font-family:Plex,sans-serif;border:8px solid ${colors.accent};padding:36px 38px}
    .layout{display:grid;grid-template-columns:430px 1fr;gap:28px;align-items:center;height:490px}
    .identity{display:flex;gap:18px;align-items:center;margin-bottom:22px}
    .mark{width:90px;height:74px;object-fit:contain}.eyebrow{font-size:19px;color:${colors['ink-2']};line-height:1.7}
    h1{font-size:62px;line-height:1.5;white-space:nowrap;margin:0 0 8px}h1 span{color:${colors.accent}}
    .subtitle{font-size:29px;margin:0 0 24px;font-weight:700}
    .count{border-top:2px solid ${colors['line-soft']};padding-top:18px;font-size:36px;color:${colors.accent};font-weight:700}
    .features{font-size:21px;line-height:1.8;color:${colors['ink-2']};margin:10px 0 0}
    .product{direction:ltr;border:2px solid ${colors.ink};background:${colors.surface};box-shadow:-9px 9px ${colors.accent};overflow:hidden}
    .bar{height:32px;border-bottom:2px solid ${colors.ink};display:flex;align-items:center;gap:7px;padding:0 12px}
    .dot{width:7px;height:7px;background:${colors.accent};border-radius:50%}.address{font:12px monospace;color:${colors['ink-2']};margin-left:auto}
    .ui{display:block;width:100%;height:auto}
    footer{border-top:2px solid ${colors['line-soft']};padding-top:16px;font-size:16px;color:${colors['ink-2']};display:flex;justify-content:space-between;align-items:center}
  </style></head><body>
    <main class="layout"><section>
      <div class="identity"><img class="mark" src="data:image/png;base64,${mark.toString('base64')}" alt="شعار الطيبات"><div class="eyebrow">دليل عربي تفاعلي<br>متاح على الويب وكتطبيق</div></div>
      <h1>نظام <span>الطيبات</span></h1><p class="subtitle">دليل الأطعمة والوصفات</p>
      <div class="count">385 طعامًا</div><p class="features">بحث · شروط · بدائل · فاحص مكونات<br>واجهة عربية · يعمل بدون اتصال بعد الزيارة</p>
    </section><div class="product"><div class="bar"><i class="dot"></i><i class="dot"></i><i class="dot"></i><span class="address">yousefe1bana.github.io/al-tayyibat</span></div><img class="ui" src="data:image/png;base64,${ui.toString('base64')}" alt="واجهة نظام الطيبات الفعلية"></div></main>
    <footer><span>دليل معلوماتي لقواعد النظام — لا يغني عن المشورة الطبية</span><span dir="ltr">AL-TAYYIBAT</span></footer>
  </body></html>`);
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode())); });
  await page.screenshot({ path: 'public/social-preview.jpg', type: 'jpeg', quality: 90 });
  console.log('Created 1200×630 social preview with approved branding and actual product UI.');
  if (process.argv.includes('--readme-hero')) {
    await mkdir('docs/readme', { recursive: true });
    await page.setViewportSize({ width: 1600, height: 840 });
    await page.evaluate(() => {
      Object.assign(document.documentElement.style, { width: '1600px', height: '840px' });
      Object.assign(document.body.style, { position: 'absolute', left: '0', top: '0', transform: 'scale(1.3333333333)', transformOrigin: 'top left' });
    });
    await sharp(await page.screenshot()).webp({ quality: 90, effort: 6 }).toFile('docs/readme/hero.webp');
    console.log('Created 1600×840 README hero.');
  }
} finally { await browser.close(); }
