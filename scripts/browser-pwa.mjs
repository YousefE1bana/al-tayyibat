import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';

const output = process.env.QA_PWA_OUTPUT || 'output/playwright/pwa';
await fs.mkdir(output, { recursive: true });
const requestedBase = process.env.QA_BASE_URL;
const live = requestedBase && !['localhost', '127.0.0.1'].includes(new URL(requestedBase).hostname);
const basePath = process.env.VITE_BASE_PATH || '/al-tayyibat/';
let workerRevision = 0;
let server;
let base = requestedBase;
if (!live) {
  // Test-only static server: change the worker response for a real waiting lifecycle.
  // Never mutate build output or ship this server as an application backend.
  const root = path.resolve('dist');
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain' };
  server = http.createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url, 'http://localhost').pathname;
      if (!pathname.startsWith(basePath)) { response.writeHead(404).end(); return; }
      const file = path.resolve(root, decodeURIComponent(pathname.slice(basePath.length)) || 'index.html');
      if (!file.startsWith(`${root}${path.sep}`)) { response.writeHead(403).end(); return; }
      const data = await fs.readFile(file);
      response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      response.end(path.basename(file) === 'sw.js' ? Buffer.concat([data, Buffer.from(`\n// QA worker revision ${workerRevision}\n`)]) : data);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}${basePath}`;
}
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { base, live: Boolean(live), assertions: [], errors: [], scenarios: [], installTests: 'Synthetic deferred event / iOS and standalone emulation; real Chrome manifest installability checked separately.' };
const persistentContexts = [];
const assert = (ok, label) => { if (!ok) throw new Error(label); report.assertions.push(label); };
const goto = async (page, route) => {
  await page.goto(`${base}#${route}`, { waitUntil: 'domcontentloaded' });
  await page.locator('main h1').waitFor();
};
const noOverflow = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
async function a11y(page, label) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  if (result.violations.length) report.errors.push({ label, violations: result.violations });
  assert(result.violations.length === 0, `${label}: no WCAG A/AA violations`);
}
try {
  for (const width of [1440, 390]) {
    // Persistent profiles avoid Playwright's incognito contexts, where Chrome
    // correctly refuses native installation regardless of manifest validity.
    const profile = await fs.mkdtemp(path.join(path.resolve(output), 'chrome-'));
    const context = await chromium.launchPersistentContext(profile, { channel: 'chrome', headless: true, viewport: { width, height: width === 390 ? 844 : 1000 }, reducedMotion: 'reduce', colorScheme: 'dark' });
    persistentContexts.push({ context, profile });
    const page = await context.newPage();
    let offline = false;
    page.on('pageerror', error => report.errors.push(`${width}: ${error.message}`));
    page.on('response', response => { if (!offline && response.status() >= 400) report.errors.push(`${response.status()} ${response.url()}`); });
    page.on('requestfailed', request => { if (!offline && request.failure()?.errorText !== 'net::ERR_ABORTED') report.errors.push(`${request.failure()?.errorText} ${request.url()}`); });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await page.addInitScript(() => sessionStorage.setItem('pwa-qa-loads', String(Number(sessionStorage.getItem('pwa-qa-loads') || 0) + 1)));
    await goto(page, '/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    await page.reload({ waitUntil: 'networkidle' });
    assert(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)), `${width}: worker controls page after reload`);
    const scope = await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).scope);
    assert(scope === base, `${width}: worker scope stays inside GitHub Pages base`);
    const discovered = await cdp.send('Page.getAppManifest');
    assert(discovered.url === `${base}manifest.webmanifest` && !discovered.errors.length, `${width}: browser discovers manifest`);
    const installability = await cdp.send('Page.getInstallabilityErrors');
    assert(installability.installabilityErrors.length === 0, `${width}: Chrome reports no manifest installability errors (${JSON.stringify(installability.installabilityErrors)})`);
    const manifest = JSON.parse(discovered.data);
    assert(manifest.start_url === `${basePath}#/` && manifest.scope === basePath && manifest.dir === 'rtl', `${width}: production manifest routing and RTL`);
    for (const icon of manifest.icons) assert((await context.request.get(new URL(icon.src, base).href)).ok(), `${width}: icon loads ${icon.sizes}/${icon.purpose}`);
    const dataResponse = await context.request.get(`${base}data/foods.json`);
    const catalog = await dataResponse.json();
    assert(catalog.foods.length === 385 && JSON.stringify(catalog.counts) === JSON.stringify({ compatible: 116, conditional: 103, notRecommended: 157, disputed: 4, unknown: 5 }), `${width}: live AI catalog and all five counts`);
    for (const resource of ['llms.txt', 'ai/catalog-index.json', 'data/system-guide.json']) assert((await context.request.get(`${base}${resource}`)).ok(), `${width}: AI resource ${resource}`);
    assert(await page.locator('.hero-doctor img').evaluate(image => image.complete && image.naturalWidth > 0), `${width}: primary doctor remains in hero`);
    assert(await noOverflow(page), `${width}: homepage has no horizontal overflow`);
    await page.screenshot({ path: `${output}/home-${width}-dark.png` });
    await goto(page, '/foods/pasta');
    const pasta = page.locator('main img[src$="/pasta.jpg"]').first();
    await pasta.evaluate(image => image.decode());
    await page.waitForFunction(async () => Boolean(await (await caches.open('al-tayyibat-food-images')).match(`${location.origin}/al-tayyibat/images/foods/pasta.jpg`)));
    const cacheInfo = await page.evaluate(async () => {
      const names = await caches.keys();
      const cache = await caches.open('al-tayyibat-food-images');
      return { names, images: (await cache.keys()).map(request => new URL(request.url).pathname) };
    });
    assert(cacheInfo.images.length <= 60, `${width}: runtime cache within 60-image limit`);
    const precached = await page.evaluate(async () => {
      const name = (await caches.keys()).find(key => key.includes('precache'));
      return (await (await caches.open(name)).keys()).map(request => new URL(request.url).pathname);
    });
    assert(!precached.some(url => url.includes('/images/foods/')), `${width}: no food photograph precached`);
    const uncached = catalog.foods.findLast(food => food.image && !cacheInfo.images.includes(food.image));
    assert(Boolean(uncached), `${width}: known uncached photo selected`);
    offline = true;
    await context.setOffline(true);
    await goto(page, '/');
    await page.evaluate(() => document.fonts.ready);
    assert(await page.locator('.hero-doctor img').evaluate(image => image.decode().then(() => true)), `${width}: offline doctor/brand shell`);
    assert(await page.evaluate(() => document.fonts.check('400 16px "IBM Plex Sans Arabic"')), `${width}: Arabic font available offline`);
    await goto(page, '/foods');
    const search = page.getByRole('searchbox', { name: 'ابحث عن طعام' });
    await search.fill('مكرونة');
    await page.waitForFunction(() => document.querySelector('main')?.textContent.includes('المكرونة'));
    assert((await page.locator('main').innerText()).includes('المكرونة'), `${width}: offline Arabic catalog search`);
    await goto(page, `/foods?category=${catalog.foods.find(food => food.slug === 'pasta').category}`);
    await page.locator('[aria-label="الأطعمة المطابقة"] h3').first().waitFor();
    assert(await page.locator('[aria-label="الأطعمة المطابقة"] h3').count() > 0, `${width}: offline category results`);
    await goto(page, '/foods/pasta');
    await page.locator('main img[src$="/pasta.jpg"]').first().evaluate(image => image.decode());
    assert((await page.locator('main').innerText()).includes('المكرونة'), `${width}: offline food details and cached photo`);
    await page.getByRole('button', { name: 'حفظ المكرونة', exact: true }).click();
    await goto(page, '/favorites');
    assert((await page.locator('main').innerText()).includes('المكرونة'), `${width}: offline favorites`);
    await goto(page, '/shopping');
    await page.getByRole('checkbox').first().click();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('checkbox').first().waitFor();
    assert(await page.getByRole('checkbox').first().getAttribute('aria-checked') === 'true', `${width}: offline shopping survives reload`);
    await goto(page, `/foods/${uncached.slug}`);
    await page.locator('main [role="img"]').first().waitFor();
    assert(await page.locator('main img').evaluateAll(images => images.every(image => !image.complete || image.naturalWidth > 0)), `${width}: uncached offline image gets branded fallback, no broken image element`);
    await page.screenshot({ path: `${output}/offline-fallback-${width}.png`, fullPage: true });
    await goto(page, '/doctor');
    await page.locator('img[src*="secondary"]').scrollIntoViewIfNeeded();
    await page.locator('img[src*="secondary"]').evaluate(image => image.decode());
    assert(await noOverflow(page), `${width}: offline doctor page without overflow`);
    await page.evaluate(() => localStorage.setItem('tayyibat:theme', 'light'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('main h1').waitFor();
    assert(await page.locator('html').getAttribute('data-theme') === 'light', `${width}: offline light theme`);
    await page.screenshot({ path: `${output}/doctor-offline-${width}-light.png` });
    offline = false;
    await context.setOffline(false);
    await goto(page, '/foods');
    if (!live) {
      // Exercise actual bounded eviction without downloading the entire library.
      const freshImages = catalog.foods.filter(food => food.image && !cacheInfo.images.includes(food.image)).slice(0, 65).map(food => new URL(food.image, base).href);
      await page.evaluate(async urls => {
        for (let offset = 0; offset < urls.length; offset += 5) {
          await Promise.all(urls.slice(offset, offset + 5).map(url => new Promise((resolve, reject) => {
            const image = new Image(); image.onload = resolve; image.onerror = reject; image.src = url;
          })));
        }
      }, freshImages);
      // CacheFirst returns the network image before its background cache put and
      // expiration work finish. Wait for the newest write AND completed eviction.
      await page.waitForFunction(async newest => {
        const urls = (await (await caches.open('al-tayyibat-food-images')).keys()).map(request => request.url);
        return urls.length <= 60 && urls.includes(newest) && !urls.some(url => url.endsWith('/pasta.jpg'));
      }, freshImages.at(-1));
      const capped = await page.evaluate(async () => (await (await caches.open('al-tayyibat-food-images')).keys()).map(request => request.url));
      const eviction = { count: capped.length, newestCached: capped.includes(freshImages.at(-1)), oldPastaCached: capped.some(url => url.endsWith('/pasta.jpg')) };
      assert(eviction.count <= 60 && eviction.newestCached && !eviction.oldPastaCached, `${width}: actual runtime cache evicts oldest photos within 60 entries ${JSON.stringify(eviction)}`);
      const search = page.getByRole('searchbox', { name: 'ابحث عن طعام' });
      await search.fill('مكرونة');
      const before = await page.evaluate(() => sessionStorage.getItem('pwa-qa-loads'));
      workerRevision++;
      await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
      await page.getByRole('button', { name: 'تحديث الآن', exact: true }).waitFor();
      if (width === 390) {
        await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 44, bottom: 34, left: 0, right: 0 } });
        const safe = await page.evaluate(() => ({
          brandTop: document.querySelector('header a').getBoundingClientRect().top,
          footerPadding: parseFloat(getComputedStyle(document.querySelector('footer')).paddingBottom),
          noticeBottom: document.querySelector('aside[aria-label="تحديث الدليل"]').getBoundingClientRect().bottom,
          height: innerHeight,
        }));
        assert(safe.brandTop >= 44 && safe.footerPadding >= 34 && safe.noticeBottom <= safe.height - 34, 'Notch and home indicator cannot cover header/footer/update controls');
        await page.screenshot({ path: `${output}/safe-area-390.png` });
        await page.setViewportSize({ width: 844, height: 390 });
        await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 0, bottom: 0, left: 44, right: 44 } });
        assert(await page.locator('header .container-x').evaluate(element => parseFloat(getComputedStyle(element).paddingLeft) >= 44 && parseFloat(getComputedStyle(element).paddingRight) >= 44), 'Landscape safe-area gutters preserve header controls');
        assert(await noOverflow(page), 'Landscape safe areas cause no horizontal overflow');
        await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 0, bottom: 0, left: 0, right: 0 } });
        await page.setViewportSize({ width: 390, height: 844 });
      }
      assert(await page.evaluate(() => sessionStorage.getItem('pwa-qa-loads')) === before && await search.inputValue() === 'مكرونة', `${width}: real waiting worker never interrupts or auto-reloads`);
      await a11y(page, `${width}: update notice`);
      await page.screenshot({ path: `${output}/update-${width}.png` });
      await page.getByRole('button', { name: 'لاحقًا', exact: true }).click();
      assert(await page.getByRole('button', { name: 'تحديث الآن', exact: true }).count() === 0, `${width}: update notice dismissible`);
      await page.reload({ waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'تحديث الآن', exact: true }).waitFor();
      const loads = Number(await page.evaluate(() => sessionStorage.getItem('pwa-qa-loads')));
      await page.getByRole('button', { name: 'تحديث الآن', exact: true }).click();
      await page.waitForFunction(count => Number(sessionStorage.getItem('pwa-qa-loads')) > count, loads);
      await page.locator('main h1').waitFor();
      assert(await page.getByRole('button', { name: 'تحديث الآن', exact: true }).count() === 0, `${width}: explicit update activates and reloads once`);
    }
    // Browser prompt is stubbed only for UI branch coverage, not an OS install claim.
    await page.evaluate(() => {
      window.testInstallCalls = 0;
      const event = new Event('beforeinstallprompt', { cancelable: true });
      event.prompt = async () => { window.testInstallCalls++; };
      event.userChoice = Promise.resolve({ outcome: 'dismissed' });
      window.dispatchEvent(event);
    });
    const install = page.getByRole('button', { name: 'ثبّت الدليل', exact: true });
    await install.waitFor();
    assert(await page.evaluate(() => window.testInstallCalls) === 0, `${width}: installation requires explicit action`);
    await install.scrollIntoViewIfNeeded();
    await a11y(page, `${width}: install entry`);
    await page.screenshot({ path: `${output}/install-${width}.png` });
    await install.click();
    assert(await page.evaluate(() => window.testInstallCalls) === 1, `${width}: deferred install prompt invoked once on click`);
    await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
    assert(await install.count() === 0, `${width}: installation CTA hidden after appinstalled`);
    report.scenarios.push({ width, scope, precachedFiles: precached.length, runtimeImages: cacheInfo.images.length, uncachedFood: uncached.slug, installability });
    await context.close();
    console.log(`PWA ${live ? 'live' : 'local'} ${width}: offline, cache, manifest and install checks passed.`);
  }
  for (const standalone of [false, true]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1' });
    const page = await context.newPage();
    await page.addInitScript(installed => {
      Object.defineProperty(navigator, 'standalone', { value: installed });
      // iOS has no native beforeinstallprompt; suppress Chromium's emulation artifact.
      window.addEventListener('beforeinstallprompt', event => event.stopImmediatePropagation());
    }, standalone);
    await goto(page, '/');
    const install = page.getByRole('button', { name: 'ثبّت الدليل', exact: true });
    if (standalone) assert(await install.count() === 0, 'iOS standalone suppresses install controls');
    else {
      assert(await page.getByRole('dialog').count() === 0, 'iOS instructions never open automatically');
      await install.click();
      await page.getByRole('dialog').waitFor();
      assert((await page.getByRole('dialog').innerText()).includes('Add to Home Screen'), 'iOS explicit install help uses Share → Add to Home Screen');
      await a11y(page, 'iOS install instructions');
      await page.screenshot({ path: `${output}/ios-install-help.png` });
    }
    await context.close();
  }
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.addInitScript(() => {
    const original = window.matchMedia.bind(window);
    window.matchMedia = query => { const result = original(query); if (query === '(display-mode: standalone)') Object.defineProperty(result, 'matches', { value: true }); return result; };
  });
  await goto(page, '/');
  await page.evaluate(() => window.dispatchEvent(new Event('beforeinstallprompt', { cancelable: true })));
  assert(await page.getByRole('button', { name: 'ثبّت الدليل', exact: true }).count() === 0, 'Chromium standalone display suppresses install CTA');
  await context.close();
  assert(report.errors.length === 0, 'No unexpected online failures or runtime errors');
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  await browser.close();
  for (const { context, profile } of persistentContexts) {
    await context.close();
    // Only remove the exact temporary profile created here, beneath the QA output.
    if (!profile.startsWith(`${path.resolve(output)}${path.sep}chrome-`)) throw new Error('Unsafe temporary profile path');
    await fs.rm(profile, { recursive: true, force: true });
  }
  if (server) await new Promise(resolve => server.close(resolve));
}
console.log(`PWA QA passed: ${report.assertions.length} assertions. Native OS installation is not automated.`);
