import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ATLAS_CRITICAL_IMPACTS = new Set(['critical', 'serious']);

async function scanAndRequireNoCriticalIssues(page, scope) {
  const builder = new AxeBuilder({ page }).include(scope)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);
  const result = await builder.analyze();
  const important = result.violations.filter(v => ATLAS_CRITICAL_IMPACTS.has(v.impact));
  const detail = important.map(v => ({
    id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target).slice(0, 8),
  }));
  expect(detail, 'Automated serious/critical accessibility issues in ' + scope).toEqual([]);
}

test('book supports skip-to-reader navigation and accessible page landmarks', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to living book' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#living-book')).toBeFocused();
  await expect(page.locator('main.study-app')).toHaveCount(1);
  await expect(page.locator('article.story-page h2')).toBeVisible();
});

test('directory isolates focus and restores the original opener after Escape', async ({ page }) => {
  await page.goto('/');
  const find = page.getByRole('button', { name: /Find a chapter/i });
  await find.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: /The Atlas Directory/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Search the Atlas directory' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect.poll(async () => page.evaluate(() => {
    const active = document.activeElement;
    const modal = document.querySelector('[data-atlas-modal="directory"]');
    return Boolean(active && modal?.contains(active));
  })).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(find).toBeFocused();
});

test('reduced-motion visitor can navigate directly without delayed chapter flipping', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const initial = await page.locator('article.story-page h2').textContent();
  await page.getByRole('button', { name: /next chapter/i }).first().click();
  await expect(page.locator('article.story-page h2')).not.toHaveText(initial);
  await expect(page.locator('.atlas-book')).not.toHaveClass(/is-flipping/);
});

test('invalid passport import leaves current browser visit state intact', async ({ page }) => {
  await page.goto('/');
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('field-atlas-visitor-passport-v6') || '[]'));
  const desk = page.locator('details.visitor-desk');
  await desk.locator('summary').click();
  await desk.locator('input[type=file]').setInputFiles({
    name: 'invalid.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"kind":"not-a-passport","visitedIds":["fake"]}', 'utf8'),
  });
  await expect(desk.getByRole('status')).toContainText('Unsupported or invalid');
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('field-atlas-visitor-passport-v6') || '[]'));
  expect(after).toEqual(before);
});

test('automated page-level a11y audit catches serious and critical WCAG problems', async ({ page }) => {
  await page.goto('/');
  await scanAndRequireNoCriticalIssues(page, 'header.topbar');
  await page.getByRole('button', { name: /Find a chapter/i }).click();
  await scanAndRequireNoCriticalIssues(page, '.directory-panel');
});
