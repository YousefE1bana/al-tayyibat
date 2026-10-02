import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173/al-tayyibat/';
const output = process.env.QA_OUTPUT || 'output/playwright/responsive';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { base, pages: [], assertions: [], errors: [], accessibility: [] };
async function settle(page) {
  await page.waitForFunction(() => {
    const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0; };
    const styled = [...document.querySelectorAll('main [style*="opacity"], [role="dialog"][style*="opacity"], #mobile-menu[style*="opacity"]')].filter(visible);
    const moving = document.getAnimations().filter(animation => animation.effect?.target instanceof Element && visible(animation.effect.target) && animation.effect.getTiming().iterations !== Infinity);
    return styled.every(el => Number(getComputedStyle(el).opacity) > .99) && moving.every(animation => animation.playState === 'finished');
  });
}
const assert = (value, message) => { if (!value) throw new Error(message); report.assertions.push(message); };
try {
  for (const width of [390, 430, 768, 820, 1024, 1280, 1440, 1920]) for (const theme of ['dark', 'light']) {
    const context = await browser.newContext({ viewport: { width, height: width < 768 ? 844 : 1000 }, colorScheme: theme });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400) report.errors.push(`${response.status()} ${response.url()}`); });
    page.on('requestfailed', request => { if (request.failure()?.errorText !== 'net::ERR_ABORTED') report.errors.push(`${request.failure()?.errorText} ${request.url()}`); });
    const routes = [820, 1920].includes(width)
      ? ['/', '/foods', '/foods/pasta', '/ingredients', '/alternatives', '/recipes', '/favorites', '/shopping', '/faq', '/doctor', '/about', '/how-it-works', '/print', '/404']
      : ['/', '/foods', '/foods/pasta'];
    for (const route of routes) {
      await page.goto(`${base}#${route}`, { waitUntil: 'networkidle' });
      await page.locator('main h1').waitFor();
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].filter(image => { const r = image.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0; }).map(image => image.decode().catch(() => {})));
      });
      await page.waitForFunction(() => [...document.images].filter(image => { const r = image.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0; }).every(image => image.complete && image.naturalWidth > 0 && Number(getComputedStyle(image).opacity) > .99));
      await settle(page);
      const state = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth,
        outside: [...document.querySelectorAll('header a, header button, main input, main textarea')].filter(el => { const r = el.getBoundingClientRect(); return r.width && (r.left < -1 || r.right > innerWidth + 1); }).map(el => el.textContent || el.getAttribute('aria-label')) }));
      assert(!state.overflow && !state.outside.length, `Layout ${width}/${theme}/${route}: ${JSON.stringify(state)}`);
      report.pages.push({ route, width, theme });
      await page.screenshot({ path: `${output}/${route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')}-${width}-${theme}.png` });
      if ([820, 1920].includes(width)) {
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        report.accessibility.push(...axe.violations.map(v => ({ route, width, theme, id: v.id, nodes: v.nodes.map(n => n.failureSummary) })));
      }
    }
    await page.goto(`${base}#/`, { waitUntil: 'networkidle' });
    const search = page.getByRole('searchbox', { name: 'ابحث عن طعام', exact: true });
    const bounds = await search.boundingBox();
    assert(bounds && bounds.y + bounds.height < (width < 768 ? 844 : 1000), `Hero search in first viewport ${width}/${theme}`);
    await page.getByRole('button', { name: 'بيض', exact: true }).click();
    await page.locator('#quick-check').getByRole('heading', { name: 'البيض', exact: true }).waitFor();
    await page.getByRole('button', { name: 'مسح البحث', exact: true }).click();
    assert(await search.inputValue() === '' && await search.evaluate(el => el === document.activeElement), `Search clears and retains focus ${width}/${theme}`);
    await search.fill('مكرونة'); await search.press('Enter');
    await page.waitForURL('**#/foods?q=*');
    assert((await page.getByRole('searchbox', { name: 'ابحث عن طعام' }).inputValue()) === 'مكرونة', `Enter opens full food search ${width}/${theme}`);
    if (width < 1280) {
      await page.getByRole('button', { name: 'القائمة', exact: true }).click();
      await page.getByRole('navigation', { name: 'قائمة الجوال' }).waitFor();
      await settle(page);
      await page.screenshot({ path: `${output}/menu-${width}-${theme}.png` });
      await page.keyboard.press('Escape');
      assert(await page.getByRole('button', { name: 'القائمة', exact: true }).getAttribute('aria-expanded') === 'false', `Menu Escape ${width}/${theme}`);
    }
    await page.getByRole('button', { name: 'فتح البحث (Ctrl+K)', exact: true }).click();
    const command = page.getByRole('combobox', { name: 'بحث', exact: true });
    await command.fill('zzzxqv-no-food');
    await page.getByText('لم نجد نتيجة لهذا البحث.', { exact: true }).waitFor();
    await settle(page);
    if ([390, 820, 1920].includes(width)) {
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      report.accessibility.push(...axe.violations.map(v => ({ route: 'empty search dialog', width, theme, id: v.id, nodes: v.nodes.map(n => n.failureSummary) })));
    }
    assert(await command.getAttribute('aria-expanded') === 'false', `Unmatched global query ${width}/${theme}`);
    await command.fill('مكرونة');
    await page.getByRole('option', { name: /المكرونة/ }).first().waitFor();
    await settle(page);
    if ([390, 820, 1920].includes(width)) {
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      report.accessibility.push(...axe.violations.map(v => ({ route: 'search dialog', width, theme, id: v.id, nodes: v.nodes.map(n => n.failureSummary) })));
    }
    await page.screenshot({ path: `${output}/search-${width}-${theme}.png` });
    await command.press('ArrowDown'); await command.press('ArrowUp'); await command.press('Enter');
    await page.waitForURL('**#/foods/pasta');
    await page.getByRole('heading', { name: 'المكرونة', level: 1, exact: true }).waitFor();
    assert(await page.getByRole('heading', { name: 'المكرونة', level: 1, exact: true }).isVisible(), `Global search ranking and keyboard ${width}/${theme}`);
    await page.goto(`${base}#/ingredients`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'جرّب مثال الغداء', exact: true }).click();
    await page.getByRole('heading', { name: 'نتيجة فحص المكونات', exact: true }).waitFor();
    await page.getByRole('textbox', { name: /اكتب أو الصق المكونات/ }).fill('zzzxq-not-food');
    await page.getByText('غير موجود في قاعدة بيانات الدليل حتى الآن.', { exact: true }).waitFor();
    assert(await page.getByText('غير مصنّف', { exact: true }).isVisible(), `Unmatched ingredient remains unclassified ${width}/${theme}`);
    await page.goto(`${base}#/`, { waitUntil: 'networkidle' });
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${output}/footer-${width}-${theme}.png` });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${base}#/foods`, { waitUntil: 'networkidle' });
    assert(await page.locator('main header').evaluate(el => getComputedStyle(el).animationDuration === '1e-06s' || parseFloat(getComputedStyle(el).animationDuration) <= .001), `Reduced motion ${width}/${theme}`);
    await context.close();
    console.log(`Responsive QA ${width}/${theme} passed`);
  }
  assert(report.errors.length === 0, 'No runtime, console or failed-request errors');
  assert(report.accessibility.length === 0, 'No automated WCAG A/AA violations');
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
console.log(`Responsive QA passed: ${report.pages.length} views, ${report.assertions.length} assertions.`);
