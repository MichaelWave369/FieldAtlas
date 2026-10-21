import { test, expect } from '@playwright/test';

/**
 * Repeatable viewport checks complement, but never replace, physical touch
 * and screen-reader acceptance. No third-party iframe is deliberately loaded.
 */
test('small phone through desktop retains a usable book and no document overflow', async ({ page }) => {
  await page.goto('/');
  for (const width of [320, 375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 400 ? 650 : 900 });
    await expect(page.locator('.atlas-book')).toBeVisible();
    const dimensions = await page.evaluate(() => {
      const app = document.querySelector('.study-app');
      const reader = document.querySelector('.atlas-book');
      const header = document.querySelector('header.topbar');
      return {
        viewport: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bookWidth: reader?.getBoundingClientRect().width || 0,
        headerWidth: header?.getBoundingClientRect().width || 0,
        appWidth: app?.getBoundingClientRect().width || 0,
      };
    });
    expect(dimensions.scrollWidth, 'Document overflow at width ' + width)
      .toBeLessThanOrEqual(dimensions.viewport + 2);
    expect(dimensions.bookWidth).toBeGreaterThan(150);
    expect(dimensions.headerWidth).toBeLessThanOrEqual(dimensions.viewport + 2);
    expect(dimensions.appWidth).toBeLessThanOrEqual(dimensions.viewport + 2);
  }
});

test('bookmarks and lamplight survive reload with the same public chapter', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('article.story-page h2')).toBeVisible();
  const original = await page.locator('article.story-page h2').textContent();
  const getPrefs = () => page.evaluate(() =>
    JSON.parse(localStorage.getItem('field-atlas-preferences-v1') || '{}'));
  await page.getByRole('button', { name: 'Toggle lamplight' }).click();
  await expect(page.locator('main.study-app')).toHaveClass(/night-mode/);
  await page.locator('button.favorite-btn').click();
  await expect.poll(async () => (await getPrefs()).favoriteIds?.length || 0).toBe(1);
  await page.reload();
  await expect(page.locator('main.study-app')).toHaveClass(/night-mode/);
  await expect.poll(async () => (await getPrefs()).favoriteIds?.length || 0).toBe(1);
  await expect(page.locator('article.story-page h2')).toHaveText(original);
});

test('passport navigation persists while directory preview does not add visits', async ({ page }) => {
  await page.goto('/');
  const readVisits = () => page.evaluate(() =>
    JSON.parse(localStorage.getItem('field-atlas-visitor-passport-v6') || '[]'));
  await expect.poll(async () => (await readVisits()).length).toBeGreaterThan(0);
  const original = await readVisits();
  await page.getByRole('button', { name: /Find a chapter/i }).click();
  const dialog = page.getByRole('dialog', { name: /The Atlas Directory/i });
  await dialog.getByRole('textbox', { name: 'Search the Atlas directory' }).fill('Domistika');
  const chapter = dialog.locator('.directory-entry').filter({ hasText: 'Domistika' }).first();
  await expect(chapter).toBeVisible();
  await chapter.getByRole('button', { name: 'Peek inside' }).click();
  await expect(chapter.locator('.directory-peek')).toBeVisible();
  expect(await readVisits()).toEqual(original);
  await chapter.getByRole('button', { name: 'Read chapter' }).click();
  await expect(page.locator('article.story-page h2')).toHaveText('Domistika');
  await expect.poll(async () => (await readVisits()).length).toBeGreaterThan(original.length);
  const after = await readVisits();
  await page.reload();
  await expect.poll(async () => (await readVisits()).length).toBe(after.length);
});
