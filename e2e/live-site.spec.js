import { test, expect } from '@playwright/test';
import { CURRENT_PUBLISHED_ORIGIN } from '../scripts/launch-preflight.mjs';

test('public URL serves the real interactive book, not a build artifact or 404', async ({ page }) => {
  const response = await page.goto(CURRENT_PUBLISHED_ORIGIN, { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  expect(new URL(page.url()).origin).toBe('https://michaelwave369.github.io');
  await expect(page.getByRole('heading', { name: /A thousand worlds/i })).toBeVisible();
  await expect(page.locator('.atlas-book')).toBeVisible();
  await expect(page.locator('article.story-page h2')).not.toBeEmpty();
  await expect(page.getByRole('link', { name: 'Skip to living book' })).toHaveCount(1);
});

test('production directory opens a project without launching extra previews', async ({ page }) => {
  await page.goto(CURRENT_PUBLISHED_ORIGIN, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Find a chapter/i }).click();
  const dialog = page.getByRole('dialog', { name: /The Atlas Directory/i });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('textbox', { name: 'Search the Atlas directory' }).fill('Domistika');
  const entry = dialog.locator('.directory-entry').filter({ hasText: 'Domistika' }).first();
  await expect(entry).toBeVisible();
  await expect(dialog.locator('.directory-peek-live iframe')).toHaveCount(0);
  await entry.getByRole('button', { name: 'Read chapter' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('article.story-page h2')).toHaveText('Domistika');
});

test('deep links stay on the same public Pages origin and open the intended chapter', async ({ page }) => {
  const response = await page.goto(CURRENT_PUBLISHED_ORIGIN + '?chapter=Domistika', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  await expect(page.locator('article.story-page h2')).toHaveText('Domistika');
  expect(new URL(page.url()).origin).toBe(new URL(CURRENT_PUBLISHED_ORIGIN).origin);
});
