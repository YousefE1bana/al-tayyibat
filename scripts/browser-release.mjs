import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173/al-tayyibat/';
const output = process.env.QA_RELEASE_OUTPUT || 'output/playwright/release-mobile';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { base, assertions: [], errors: [], views: [], installation: 'Deferred browser event simulated in test context; no production hooks or OS installation claims.' };
const assert = (ok, label) => { if (!ok) throw Error(label); report.assertions.push(label); };
const nudge = page => page.getByRole('complementary', { name: 'تثبيت الدليل', exact: true });
const footerInstall = page => page.getByRole('button', { name: 'ثبّت الدليل', exact: true });
const android = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const ios = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1';
const heights = { 320: 740, 360: 800, 375: 812, 390: 844, 430: 932 };

async function open(page, route = '/') {
  await page.goto(`${base}#${route}`, { waitUntil: 'networkidle' });
  await page.locator('main h1').waitFor();
  await page.evaluate(() => document.fonts.ready);
}
async function eligible(page, outcome = 'dismissed') {
  await page.evaluate(outcome => {
    window.installCalls = 0;
    const event = new Event('beforeinstallprompt', { cancelable: true });
    event.prompt = async () => { window.installCalls++; };
    event.userChoice = Promise.resolve({ outcome });
    window.dispatchEvent(event);
  }, outcome);
}
async function accessibility(page, label) {
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  if (axe.violations.length) report.errors.push({ label, violations: axe.violations });
  assert(!axe.violations.length, `${label}: WCAG A/AA`);
}
async function settle(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.waitForFunction(() => document.getAnimations().every(animation => {
    const el = animation.effect?.target;
    if (!(el instanceof Element)) return true;
    const r = el.getBoundingClientRect();
    return r.bottom <= 0 || r.top >= innerHeight || animation.playState === 'finished' || animation.effect.getTiming().iterations === Infinity;
  }));
}
async function captions(page, label) {
  const names = await page.locator('.doctor-caption-name').evaluateAll(elements => elements.map(el => {
    const range = document.createRange(); range.selectNodeContents(el);
    const text = range.getBoundingClientRect(), box = el.getBoundingClientRect(), caption = el.closest('figcaption').getBoundingClientRect();
    const contained = (a, b) => a.left >= b.left - .5 && a.right <= b.right + .5 && a.top >= b.top - .5 && a.bottom <= b.bottom + .5;
    const style = getComputedStyle(el);
    let clipped = false;
    for (let parent = el; parent && parent !== document.querySelector('main'); parent = parent.parentElement) {
      const css = getComputedStyle(parent), rect = parent.getBoundingClientRect();
      if (['hidden', 'clip', 'scroll', 'auto'].includes(css.overflowX) && (text.left < rect.left || text.right > rect.right)) clipped = true;
      if (['hidden', 'clip', 'scroll', 'auto'].includes(css.overflowY) && (text.top < rect.top || text.bottom > rect.bottom)) clipped = true;
    }
    return { text: el.textContent, contained: contained(text, box) && contained(box, caption), clipped, ellipsis: style.textOverflow === 'ellipsis', lineClamp: style.webkitLineClamp, font: parseFloat(style.fontSize) };
  }));
  assert(names.length === 2 && names.every(name => name.text === 'الدكتور ضياء العوضي' && name.contained && !name.clipped && !name.ellipsis && ['none', ''].includes(name.lineClamp) && name.font >= 14), `${label}: both complete doctor captions contained without clipping ${JSON.stringify(names)}`);
}
try {
  for (const width of [320, 360, 375, 390, 430, 1024, 1440, 1920]) for (const theme of ['dark', 'light']) {
    const mobile = width < 768;
    const context = await browser.newContext({ viewport: { width, height: heights[width] || 1000 }, colorScheme: theme, reducedMotion: 'reduce', serviceWorkers: 'block', ...(mobile ? { userAgent: android, isMobile: true, hasTouch: true } : {}) });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) report.errors.push(`${response.status()} ${response.url()}`); });
    page.on('requestfailed', request => { if (request.failure()?.errorText !== 'net::ERR_ABORTED') report.errors.push(`${request.failure()?.errorText} ${request.url()}`); });
    await page.addInitScript(() => {
      window.notificationRequests = 0;
      if ('Notification' in window) Notification.requestPermission = async () => { window.notificationRequests++; return 'denied'; };
      // Native eligibility is covered by a separately dispatched compatible event.
      window.addEventListener('beforeinstallprompt', event => { if (event.isTrusted) event.stopImmediatePropagation(); }, true);
    });
    await open(page);
    assert(await nudge(page).count() === 0, `${width}/${theme}: no invitation before eligibility`);
    const header = await page.evaluate(() => {
      const title = document.querySelector('.navbar-title'), subtitle = document.querySelector('.navbar-subtitle');
      const range = document.createRange(); range.selectNodeContents(title);
      const text = range.getBoundingClientRect(), box = title.getBoundingClientRect();
      const controls = [...document.querySelectorAll('.navbar-actions > a, .navbar-actions > button')].filter(el => el.getBoundingClientRect().width > 0).map(el => el.getBoundingClientRect().toJSON());
      const brand = document.querySelector('.navbar-brand').getBoundingClientRect(), mark = document.querySelector('.navbar-brand .brand-mark').getBoundingClientRect();
      const overlap = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > .5 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > .5;
      const all = [brand, ...controls];
      return { title: title.textContent, lines: new Set([...range.getClientRects()].map(r => r.top)).size, contained: text.left >= box.left - .5 && text.right <= box.right + .5 && text.top >= box.top - .5 && text.bottom <= box.bottom + .5,
        font: parseFloat(getComputedStyle(title).fontSize), subtitle: getComputedStyle(subtitle).display, controls, mark: mark.width, overlap: all.some((a, i) => all.slice(i + 1).some(b => overlap(a, b))), height: document.querySelector('body #root > div > header').getBoundingClientRect().height };
    });
    assert(header.title === 'نظام الطيبات' && header.lines === 1 && header.contained && header.font >= 16, `${width}/${theme}: readable one-line brand fully contained`);
    assert(header.mark >= 24 && header.controls.every(r => r.width >= 44 && r.height >= 44 && r.left >= 0 && r.right <= width) && header.controls.length === (width < 1280 ? 4 : 3) && !header.overlap, `${width}/${theme}: mark and all 44px controls visible without collision`);
    assert(await page.locator('.navbar-brand img').evaluate(image => image.complete && image.naturalWidth === 256 && image.getBoundingClientRect().width > 0), `${width}/${theme}: approved brand image renders`);
    assert(width < 640 ? header.subtitle === 'none' : header.subtitle !== 'none', `${width}/${theme}: deliberate subtitle visibility`);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}/${theme}: no homepage overflow`);
    await captions(page, `${width}/${theme}`);
    await page.screenshot({ path: `${output}/home-${width}-${theme}.png` });
    await page.locator('.hero-doctor figcaption').screenshot({ path: `${output}/caption-${width}-${theme}.png` });
    await page.evaluate(() => scrollTo(0, 500));
    await settle(page);
    const sticky = await page.locator('body #root > div > header').boundingBox();
    assert(sticky.y === 0 && sticky.height === header.height, `${width}/${theme}: sticky header stable`);
    if (width < 1280) {
      await page.getByRole('button', { name: 'القائمة', exact: true }).click();
      await page.locator('#mobile-menu').waitFor();
      await settle(page);
      assert(await page.locator('#mobile-menu').evaluate(el => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }), `${width}/${theme}: mobile menu fits viewport`);
      await page.screenshot({ path: `${output}/drawer-${width}-${theme}.png` });
      await page.keyboard.press('Escape');
      await page.locator('#mobile-menu').waitFor({ state: 'hidden' });
      assert(await page.getByRole('button', { name: 'القائمة', exact: true }).getAttribute('aria-expanded') === 'false', `${width}/${theme}: drawer closes and restores trigger`);
    }
    await page.evaluate(() => scrollTo(0, 0));
    await eligible(page);
    await nudge(page).waitFor();
    assert(await page.evaluate(() => window.installCalls === 0), `${width}/${theme}: no automatic install prompt`);
    assert(await nudge(page).evaluate(el => getComputedStyle(el).position === 'static' && el.getBoundingClientRect().top >= document.querySelector('.home-hero').getBoundingClientRect().bottom), `${width}/${theme}: install invitation in flow after hero, never an overlay`);
    await nudge(page).scrollIntoViewIfNeeded();
    await settle(page);
    await page.screenshot({ path: `${output}/install-${width}-${theme}.png` });
    await accessibility(page, `${width}/${theme}: install card`);
    await nudge(page).getByRole('button', { name: 'لاحقًا', exact: true }).click();
    assert(await nudge(page).count() === 0 && await footerInstall(page).count() === 1, `${width}/${theme}: later dismisses invitation, footer access retained`);
    const until = await page.evaluate(() => JSON.parse(localStorage.getItem('tayyibat:install-nudge-until')));
    assert(until > Date.now() + 13 * 86400000 && until <= Date.now() + 14 * 86400000, `${width}/${theme}: fourteen-day dismissal`);
    await open(page, '/doctor');
    assert(await nudge(page).count() === 0, `${width}/${theme}: dismissal survives navigation`);
    assert(await page.locator('main h1').textContent() === 'الدكتور ضياء العوضي', `${width}/${theme}: doctor heading complete`);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}/${theme}: doctor page no overflow`);
    await page.screenshot({ path: `${output}/doctor-${width}-${theme}.png` });
    await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
    await settle(page);
    await page.getByRole('contentinfo').screenshot({ path: `${output}/footer-${width}-${theme}.png` });
    await accessibility(page, `${width}/${theme}: doctor/footer`);
    await page.reload({ waitUntil: 'networkidle' });
    await eligible(page);
    assert(await nudge(page).count() === 0 && await footerInstall(page).count() === 1, `${width}/${theme}: dismissal survives reload`);
    await footerInstall(page).click();
    assert(await page.evaluate(() => window.installCalls === 1), `${width}/${theme}: footer still invokes existing native flow`);
    await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
    assert(await footerInstall(page).count() === 0 && await nudge(page).count() === 0, `${width}/${theme}: installed event hides both controls`);
    assert(await page.evaluate(() => window.notificationRequests === 0), `${width}/${theme}: no notification permission request`);
    report.views.push({ width, theme, header });
    await context.close();
    console.log(`Release ${width}/${theme}: passed.`);
  }
  // Native nudge path, expiry, invalid storage and storage-denied fallback.
  for (const storage of ['expired', 'invalid', 'blocked']) {
    const context = await browser.newContext({ viewport: { width: 360, height: 800 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.addInitScript(storage => {
      window.addEventListener('beforeinstallprompt', event => { if (event.isTrusted) event.stopImmediatePropagation(); }, true);
      if (storage === 'blocked') Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Denied', 'SecurityError'); } });
      else localStorage.setItem('tayyibat:install-nudge-until', storage === 'invalid' ? '"invalid"' : String(Date.now() - 1));
    }, storage);
    await open(page); await eligible(page, 'accepted'); await nudge(page).waitFor();
    if (storage === 'blocked') {
      await nudge(page).getByRole('button', { name: 'لاحقًا', exact: true }).click();
      await open(page, '/doctor');
      assert(await nudge(page).count() === 0 && await footerInstall(page).count() === 1, 'Denied storage retains shared in-memory dismissal without losing footer access');
    } else {
      await nudge(page).getByRole('button', { name: 'تثبيت', exact: true }).click();
      assert(await page.evaluate(() => window.installCalls === 1) && await nudge(page).count() === 0 && await footerInstall(page).count() === 0, `${storage}: nudge invokes native flow once; accepted install hides both controls`);
    }
    await context.close();
  }
  for (const device of ['ios', 'ipados', 'standalone']) {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, userAgent: device === 'ipados' ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15' : ios, reducedMotion: 'reduce', serviceWorkers: 'block' });
    const page = await context.newPage();
    await page.addInitScript(device => {
      Object.defineProperty(navigator, 'standalone', { value: device === 'standalone' });
      if (device === 'ipados') { Object.defineProperty(navigator, 'platform', { value: 'MacIntel' }); Object.defineProperty(navigator, 'maxTouchPoints', { value: 5 }); }
      window.addEventListener('beforeinstallprompt', event => event.stopImmediatePropagation(), true);
    }, device);
    await open(page);
    if (device === 'standalone') assert(await nudge(page).count() === 0 && await footerInstall(page).count() === 0, 'Standalone suppresses nudge and footer install');
    else {
      await nudge(page).waitFor();
      assert(await page.getByRole('dialog').count() === 0, `${device}: help never opens automatically`);
      await nudge(page).getByRole('button', { name: 'تثبيت', exact: true }).click();
      await page.getByRole('dialog').waitFor();
      assert((await page.getByRole('dialog').innerText()).includes('Add to Home Screen'), `${device}: explicit action opens existing Share/Add to Home Screen help`);
      await accessibility(page, `${device}: install instructions`);
      await page.screenshot({ path: `${output}/${device}-help.png` });
    }
    await context.close();
  }
  const printContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
  const printPage = await printContext.newPage();
  await open(printPage, '/print'); await eligible(printPage); await nudge(printPage).waitFor();
  await printPage.emulateMedia({ media: 'print' });
  assert(!await nudge(printPage).isVisible() && await printPage.locator('.kitchen-sheet').count() === 3, 'Eligible install invitation excluded from the three-page kitchen print guide');
  await printContext.close();
  assert(!report.errors.length, 'No runtime errors, unexpected failed requests or WCAG violations');
} catch (error) { report.errors.push(error.stack); process.exitCode = 1; }
finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  await browser.close();
  console.log(`Release QA: ${report.views.length} views, ${report.assertions.length} assertions, ${report.errors.length} errors.`);
  if (report.errors.length) console.error(JSON.stringify(report.errors, null, 2));
}
