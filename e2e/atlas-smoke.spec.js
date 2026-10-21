import { test, expect } from '@playwright/test';

test('book opens, directory searches, preview opts in only on demand', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /A thousand worlds/i })).toBeVisible();
  await expect(page.locator('.atlas-book')).toBeVisible();

  await page.getByRole('button', { name: /Find a chapter/i }).click();
  const dialog = page.getByRole('dialog', { name: /The Atlas Directory/i });
  await expect(dialog).toBeVisible();
  const search = dialog.getByRole('textbox', { name: 'Search the Atlas directory' });
  await search.fill('Domistika');
  const entry = dialog.locator('.directory-entry').filter({ hasText: 'Domistika' }).first();
  await expect(entry).toBeVisible();
  await entry.getByRole('button', { name: 'Peek inside' }).click();
  const peek = entry.locator('.directory-peek');
  await expect(peek).toBeVisible();
  await expect(peek.locator('iframe')).toHaveCount(0);
  await peek.getByRole('button', { name: 'Launch live preview' }).click();
  await expect(peek.locator('iframe')).toHaveCount(1);
  await expect(peek.locator('iframe')).toHaveAttribute('sandbox', /allow-scripts/);
  await expect(peek.locator('iframe')).not.toHaveAttribute('sandbox', /allow-same-origin/);
  await peek.getByRole('button', { name: 'Stop live preview' }).click();
  await expect(peek.locator('iframe')).toHaveCount(0);

  await entry.getByRole('button', { name: 'Read chapter' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('article.story-page h2')).toHaveText('Domistika');
});

test('quick-find keyboard and collection toggles preserve catalog access', async ({ page, isMobile }) => {
  await page.goto('/');
  if (isMobile) {
    await page.getByRole('button', { name: /Find a chapter/i }).click();
  } else {
    await page.keyboard.press('Control+k');
  }
  const dialog = page.getByRole('dialog', { name: /The Atlas Directory/i });
  await expect(dialog).toBeVisible();
  const collections = dialog.getByRole('group', { name: 'Directory collections' });
  await collections.getByRole('button', { name: /Unexplored/ }).click();
  await expect(collections.getByRole('button', { name: /Unexplored/ })).toHaveAttribute('aria-pressed', 'true');
  await collections.getByRole('button', { name: /All chapters/ }).click();
  await expect(collections.getByRole('button', { name: /All chapters/ })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('passport export and import never upload personal chapter data', async ({ page }) => {
  await page.goto('/');
  const desk = page.locator('details.visitor-desk');
  await desk.locator('summary').click();
  await expect(desk.getByRole('button', { name: 'Export passport' })).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    desk.getByRole('button', { name: 'Export passport' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('field-atlas-visitor-passport.json');
  const file = await download.path();
  const { readFile } = await import('node:fs/promises');
  const payload = JSON.parse(await readFile(file, 'utf8'));
  expect(payload.kind).toBe('field-atlas-visitor-passport');
  expect(Array.isArray(payload.visitedIds)).toBe(true);
  expect(payload).not.toHaveProperty('favoriteIds');
  expect(payload).not.toHaveProperty('pages');

  await desk.locator('input[type=file]').setInputFiles({
    name: 'saved-passport.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(payload), 'utf8'),
  });
  await expect(desk.getByRole('status')).toContainText('Merged');
});

test('constellation navigates using the original reader', async ({ page }) => {
  await page.goto('/');
  const constellation = page.locator('details.field-threads');
  await expect(constellation).toBeAttached();
  await constellation.locator('summary').click();
  const suggestion = constellation.locator('button.field-thread-link').first();
  await expect(suggestion).toBeVisible();
  const initialTitle = await page.locator('article.story-page h2').textContent();
  await suggestion.click();
  await expect(page.locator('article.story-page h2')).not.toHaveText(initialTitle);
});
