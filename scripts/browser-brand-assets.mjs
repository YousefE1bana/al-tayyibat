import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173/al-tayyibat/';
const output = process.env.QA_BRAND_OUTPUT || 'output/playwright/brand-assets';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { assertions: [], layoutShifts: [], errors: [] };
const assert = (ok, message) => { if (!ok) throw new Error(message); report.assertions.push(message); };
const watchLayout = page => page.evaluate(() => {
  window.brandShifts = [];
  window.brandObserver?.disconnect();
  window.brandObserver = new PerformanceObserver(list => {
    window.brandShifts.push(...list.getEntries().filter(entry => !entry.hadRecentInput).map(entry => ({ value: entry.value, sources: entry.sources.map(source => ({ node: source.node?.outerHTML?.slice(0, 200), previous: source.previousRect.toJSON(), current: source.currentRect.toJSON() })) })));
  });
  window.brandObserver.observe({ type: 'layout-shift' });
});
async function verifyStableImage(page, image, release, label) {
  // Start observation after pending font/scroll paints, while the image request is still blocked.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const before = await image.boundingBox();
  await watchLayout(page);
  release();
  await image.evaluate(img => img.decode());
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const after = await image.boundingBox();
  const shifts = await page.evaluate(() => window.brandShifts);
  report.layoutShifts.push({ label, before, after, shifts });
  assert(JSON.stringify(before) === JSON.stringify(after) && shifts.reduce((sum, entry) => sum + entry.value, 0) === 0, `No image-induced layout shift: ${label}`);
}
try {
  for (const width of [390, 1440]) for (const theme of ['dark', 'light']) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, colorScheme: theme, reducedMotion: 'reduce', serviceWorkers: 'block' });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) report.errors.push(`${response.status()} ${response.url()}`); });
    let releaseMark, releasePortrait;
    const markGate = new Promise(resolve => { releaseMark = resolve; });
    const portraitGate = new Promise(resolve => { releasePortrait = resolve; });
    await page.route('**/brand/mark.png', async route => { await markGate; await route.continue(); });
    await page.route('**/images/doctor/secondary.webp', async route => { await portraitGate; await route.continue(); });
    await page.goto(`${base}#/`, { waitUntil: 'domcontentloaded' });
    await page.locator('main h1').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.hero-doctor img').evaluate(img => img.decode());
    const mark = page.locator('header .brand-mark-image');
    await verifyStableImage(page, mark, releaseMark, `mark ${width}/${theme}`);
    assert(await page.locator('header a[aria-label="نظام الطيبات — الرئيسية"]').evaluate(el => el.getBoundingClientRect().height >= 44), `Home link touch target ${width}/${theme}`);
    const portrait = page.locator('.editorial-doctor img');
    await portrait.scrollIntoViewIfNeeded();
    await verifyStableImage(page, portrait, releasePortrait, `cutout ${width}/${theme}`);
    assert(await page.locator('img[src*="secondary"]').count() === 1 && await page.locator('img[src*="original"]').count() === 0, `Only approved derivative published ${width}/${theme}`);
    await context.close();
  }
  const page = await browser.newPage({ viewport: { width: 1200, height: 1280 } });
  const icon = new URL('brand/icon.png', base).href;
  const sizes = [16, 32, 48, 192, 512];
  await page.setContent(`<!doctype html><html><style>body{margin:0;font:16px system-ui}section{padding:24px;display:flex;align-items:center;gap:28px}section:first-child{background:#131a15;color:#f2ede3}section:last-child{background:#f3eee2;color:#14201a}figure{margin:0}img{display:block;object-fit:contain}figcaption{margin-top:12px}</style><body>${['dark', 'light'].map(theme => `<section aria-label="${theme}">${sizes.map(size => `<figure><img src="${icon}" width="${size}" height="${size}" alt="Approved mark at ${size} pixels"><figcaption>${size}px<br>${theme}</figcaption></figure>`).join('')}</section>`).join('')}</body></html>`);
  await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
  assert(await page.locator('img').evaluateAll(images => images.every(img => img.naturalWidth === 512 && img.naturalHeight === 512)), 'Canonical icon decodes at all five display sizes in both themes');
  await page.screenshot({ path: `${output}/icon-size-review.png`, fullPage: true });
  assert(report.errors.length === 0, 'No brand-image runtime or response errors');
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
console.log(`Brand asset QA passed: ${report.assertions.length} assertions, 8 delayed-image layout-shift checks.`);
