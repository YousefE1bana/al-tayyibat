import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173/al-tayyibat/';
const output = process.env.QA_OUTPUT || 'output/playwright/responsive';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { base, pages: [], heroes: [], assertions: [], errors: [], accessibility: [] };
async function settle(page, opacitySelector = 'main [style*="opacity"], [role="dialog"][style*="opacity"], #mobile-menu[style*="opacity"]') {
  await page.waitForFunction(opacitySelector => {
    const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0; };
    // A card with less than its 8% reveal threshold in view is intentionally
    // still hidden. Do not wait for that below-the-fold sliver to animate.
    const styled = [...document.querySelectorAll(opacitySelector)].filter(el => {
      if (!visible(el)) return false;
      const r = el.getBoundingClientRect();
      const visibleHeight = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
      return Number(getComputedStyle(el).opacity) > 0 || visibleHeight / r.height >= .08;
    });
    const moving = document.getAnimations().filter(animation => animation.effect?.target instanceof Element && visible(animation.effect.target) && animation.effect.getTiming().iterations !== Infinity);
    return styled.every(el => Number(getComputedStyle(el).opacity) > .99) && moving.every(animation => animation.playState === 'finished');
  }, opacitySelector);
}
async function settleReveals(page) {
  // Section screenshots can trigger the next heading's reveal, including one
  // outside the final viewport. Measure its final colors rather than a fade frame.
  await page.waitForFunction(() => [...document.querySelectorAll('main [style*="opacity"]')].every(el => {
    const opacity = Number(getComputedStyle(el).opacity);
    return opacity === 0 || opacity === 1;
  }));
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
      : ['/', '/foods', '/foods/pasta', '/doctor'];
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
      if (route === '/') {
        const hero = page.getByRole('region', { name: 'نظام الطيبات', exact: true });
        const portrait = hero.locator('img');
        const portraitBounds = await portrait.boundingBox();
        const searchBounds = await hero.getByRole('searchbox', { name: 'ابحث عن طعام', exact: true }).boundingBox();
        const ctaBounds = await hero.getByRole('link', { name: 'تصفح دليل الأطعمة', exact: true }).boundingBox();
        const viewportHeight = width < 768 ? 844 : 1000;
        const inside = r => r && r.y >= 0 && r.y + r.height <= viewportHeight;
        assert(inside(portraitBounds) && portraitBounds.width >= 200 && portraitBounds.height >= 200, `Prominent doctor in first viewport ${width}/${theme}`);
        assert(inside(searchBounds) && inside(ctaBounds), `Hero search and primary CTA in first viewport ${width}/${theme}`);
        assert(width < 768 ? portraitBounds.y < searchBounds.y : portraitBounds.x + portraitBounds.width < searchBounds.x, `Doctor before mobile search, left of desktop content ${width}/${theme}`);
        assert(await portrait.getAttribute('src') === '/al-tayyibat/images/doctor/portrait.jpg' && await portrait.getAttribute('loading') === 'eager', `Protected primary is the eager hero visual ${width}/${theme}`);
        assert(await hero.getByText('دليل تفاعلي لنظام الدكتور ضياء العوضي', { exact: true }).count() === 1, `Doctor context beside hero copy ${width}/${theme}`);
        report.heroes.push({ width, theme, portrait: portraitBounds, search: searchBounds, primaryCTA: ctaBounds });
        const heroAxe = await new AxeBuilder({ page }).include('.home-hero').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        report.accessibility.push(...heroAxe.violations.map(v => ({ route: 'hero', width, theme, id: v.id, nodes: v.nodes.map(n => n.failureSummary) })));
        await hero.getByRole('link', { name: 'اعرف أكثر عن الدكتور', exact: true }).click();
        await page.waitForURL('**#/doctor');
        await page.locator('main h1').waitFor();
        assert(await page.locator('main h1').textContent() === 'الدكتور ضياء العوضي', `Hero doctor CTA resolves ${width}/${theme}`);
        await page.goto(`${base}#/`, { waitUntil: 'networkidle' });
        await settle(page);
        const editorial = page.getByRole('region', { name: 'كيف تتبع النظام؟', exact: true });
        const steps = editorial.locator('.editorial-step');
        assert(await steps.count() === 4, `Four guide weeks ${width}/${theme}`);
        assert(await page.locator('.brand-mark-image').count() === 2 && await page.locator('.brand-mark-legacy').count() === 0, `Approved mark replaces both placeholders ${width}/${theme}`);
        assert(await page.locator('.brand-mark').evaluateAll(elements => elements.every(el => {
          const r = el.getBoundingClientRect();
          return r.width === 36 && r.height === 36 && el.querySelector('img')?.getAttribute('alt') === '';
        })), `Stable compact brand slots and decorative alt ${width}/${theme}`);
        assert(await page.locator('link[rel="icon"]').getAttribute('href') === new URL('brand/icon.png', base).pathname, `Approved icon replaces inline placeholder favicon ${width}/${theme}`);
        assert(await editorial.locator('a[href="#/how-it-works#week-3"]').count() === 1, `Guide week anchor ${width}/${theme}`);
        assert(await page.evaluate(() => {
          const section = document.querySelector('[aria-labelledby="system-editorial-heading"]');
          const categories = [...document.querySelectorAll('h2')].find(el => el.textContent === 'تصفح حسب الفئة');
          return !!categories && !!section && !!(categories.compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING);
        }), `Categories before editorial ${width}/${theme}`);
        // Wait for the progression being tested rather than unrelated future reveals.
        for (const step of await steps.all()) { await step.scrollIntoViewIfNeeded(); await settle(page, '.editorial-weeks [style*="opacity"]'); }
        const columns = await editorial.locator('.editorial-weeks').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
        assert(columns === (width < 768 ? 1 : width < 1024 ? 2 : 4), `Weekly progression adapts ${width}/${theme}`);
        await editorial.locator('figure').scrollIntoViewIfNeeded(); await settle(page, '.editorial-doctor [style*="opacity"]');
        const secondary = editorial.locator('.doctor-editorial-portrait img');
        const reserved = await secondary.boundingBox();
        await secondary.evaluate(image => image.decode());
        assert(await editorial.locator('figure').count() === 1 && await page.locator('img[src$="doctor/portrait.jpg"]').count() === 1, `Distinct primary hero and secondary editorial composition ${width}/${theme}`);
        assert(await secondary.getAttribute('src') === new URL('images/doctor/secondary.webp', base).pathname && await secondary.getAttribute('loading') === 'lazy', `Approved secondary portrait decoded and lazy loaded ${width}/${theme}`);
        assert(await secondary.evaluate(image => image.naturalWidth === 1275 && image.naturalHeight === 1094 && getComputedStyle(image).objectFit === 'contain' && !!image.alt.trim()), `Full cutout preserved with meaningful alt ${width}/${theme}`);
        const decoded = await secondary.boundingBox();
        assert(reserved.width === decoded.width && reserved.height === decoded.height, `Editorial image size stays reserved across decoding ${width}/${theme}`);
        assert(await editorial.evaluate(el => {
          const r = el.getBoundingClientRect();
          return [...el.querySelectorAll('a, h2, h3, p, figure')].every(child => { const c = child.getBoundingClientRect(); return c.left >= r.left - 1 && c.right <= r.right + 1; });
        }), `Editorial content contained ${width}/${theme}`);
        await editorial.screenshot({ path: `${output}/editorial-${width}-${theme}.png`, style: 'header.sticky { opacity: 0 !important; } #root > div > [aria-hidden="true"] { opacity: 0 !important; }' });
        await settleReveals(page);
        if ([390, 1024].includes(width)) {
          const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
          report.accessibility.push(...axe.violations.map(v => ({ route: 'editorial home', width, theme, id: v.id, nodes: v.nodes.map(n => n.failureSummary) })));
        }
      }
      if (route === '/doctor') {
        assert(await page.locator('main img').count() === 2, `Doctor page uses two portraits for distinct sections ${width}/${theme}`);
        await page.locator('.doctor-timeline-intro').scrollIntoViewIfNeeded(); await settle(page, '.doctor-timeline-intro [style*="opacity"]');
        const timelinePortrait = page.locator('.doctor-timeline-intro img');
        await timelinePortrait.scrollIntoViewIfNeeded(); await timelinePortrait.evaluate(image => image.decode());
        assert(await timelinePortrait.getAttribute('src') === new URL('images/doctor/secondary.webp', base).pathname, `Approved cutout anchors doctor timeline ${width}/${theme}`);
        assert(await page.locator('#timeline h2').textContent() === 'الخط الزمني', `Doctor editorial timeline ${width}/${theme}`);
        await page.locator('.doctor-timeline-intro').screenshot({ path: `${output}/doctor-editorial-${width}-${theme}.png` });
        await settleReveals(page);
      }
      if ([820, 1920].includes(width)) {
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        report.accessibility.push(...axe.violations.map(v => ({ route, width, theme, id: v.id, nodes: v.nodes.map(n => n.failureSummary) })));
      }
      if (route === '/') {
        await page.locator('.editorial-step').nth(2).click();
        await page.waitForURL('**#/how-it-works#week-3');
        await page.locator('#week-3').waitFor();
        assert(await page.locator('#week-3 h3').textContent() === 'اقرأ الشروط وحدود التوثيق', `Weekly CTA resolves ${width}/${theme}`);
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
    for (const route of ['/', '/doctor']) {
      await page.goto(`${base}#${route}`, { waitUntil: 'networkidle' });
      await page.locator('main h1').waitFor();
      if (route === '/') {
        await settle(page, '.home-hero [style*="opacity"]');
        assert(await page.locator('.hero-copy, .hero-actions, .hero-doctor').evaluateAll(elements => elements.every(el => {
          const style = getComputedStyle(el);
          return style.opacity === '1' && style.transform === 'none';
        })), `Hero reduced motion immediately visible ${width}/${theme}`);
        await page.locator('.hero-doctor img').evaluate(image => image.decode());
        await page.screenshot({ path: `${output}/hero-reduced-${width}-${theme}.png` });
      }
      const selector = route === '/' ? '.editorial-weeks > li, .editorial-doctor figure, .editorial-progress-line' : '.doctor-timeline-intro';
      await page.locator(route === '/' ? '.editorial-weeks' : '.doctor-timeline-intro').scrollIntoViewIfNeeded();
      // Allow the browser preference event and React's render to commit, without a timed sleep.
      await page.waitForFunction(selector => [...document.querySelectorAll(selector)].every(el => {
        const style = getComputedStyle(el);
        return style.opacity === '1' && style.transform === 'none';
      }), selector, { timeout: 2000 });
      assert(await page.locator(selector).evaluateAll(elements => elements.every(el => {
        const style = getComputedStyle(el);
        return style.opacity === '1' && style.transform === 'none';
      })), `Editorial reduced motion immediately visible ${width}/${theme}/${route}`);
    }
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
