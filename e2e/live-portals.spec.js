import { test, expect } from '@playwright/test';
import { CURRENT_PUBLISHED_ORIGIN } from '../scripts/launch-preflight.mjs';
import { resolveRepresentativePortals } from '../release/representative-portals.js';
import { PREVIEW_SANDBOX } from '../src/preview-policy.js';

const portals = resolveRepresentativePortals();

/**
 * Intercept only *embedded* subdocuments. That keeps the parent Atlas fully
 * live but avoids mistaking external network/CSP/storage quirks for evidence
 * that an integration works. The FULL TAB link is the guaranteed escape path.
 */
async function isolateThirdPartyFrameContents(page) {
  await page.route('**/*', route => {
    const request = route.request();
    if (request.resourceType() === 'document' &&
      request.isNavigationRequest() && request.frame() !== page.mainFrame()) {
      return route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<!doctype html><title>Isolated iframe test fixture</title>',
      });
    }
    return route.continue();
  });
}

for (const portal of portals) {
  test('public doorway preserves the original destination: ' + portal.title, async ({ page }) => {
    await isolateThirdPartyFrameContents(page);
    const url = new URL(CURRENT_PUBLISHED_ORIGIN);
    url.searchParams.set('chapter', portal.repo);
    const response = await page.goto(url.href, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);

    await expect(page.locator('article.story-page h2')).toHaveText(portal.title);
    const action = page.locator('article.portal-page .portal-actions > a.gold-btn');
    await expect(action).toHaveAttribute('href', portal.url);
    await expect(action).toHaveAttribute('target', '_blank');
    await expect(action).toHaveAttribute('rel', /noopener/);
    await expect(action).toHaveAttribute('rel', /noreferrer/);

    const frame = page.locator('article.portal-page .iframe-shell iframe');
    if (portal.kind === 'research') {
      await expect(frame).toHaveCount(0);
      await expect(action).toContainText('Open Zenodo record');
    } else {
      await expect(frame).toHaveCount(1);
      await expect(frame).toHaveAttribute('src', portal.url);
      await expect(frame).toHaveAttribute('sandbox', PREVIEW_SANDBOX);
      await expect(action).toContainText('Open this world');
    }
  });
}

test('directory preview can be stopped, and its direct-link fallback survives', async ({ page }) => {
  await isolateThirdPartyFrameContents(page);
  await page.goto(CURRENT_PUBLISHED_ORIGIN, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Find a chapter/i }).click();
  const dialog = page.getByRole('dialog', { name: /The Atlas Directory/i });
  await dialog.getByRole('textbox', { name: 'Search the Atlas directory' }).fill('Domistika');
  const entry = dialog.locator('.directory-entry').filter({ hasText: 'Domistika' }).first();
  await expect(entry).toBeVisible();
  await entry.getByRole('button', { name: 'Peek inside' }).click();
  const preview = entry.locator('.directory-peek');
  await expect(preview.locator('iframe')).toHaveCount(0);
  await preview.getByRole('button', { name: 'Launch live preview' }).click();
  await expect(preview.locator('iframe')).toHaveAttribute('sandbox', PREVIEW_SANDBOX);
  const fallback = preview.getByRole('link', { name: 'Open original site' });
  await expect(fallback).toHaveAttribute('href', 'https://michaelwave369.github.io/Domistika/');
  await expect(fallback).toHaveAttribute('target', '_blank');
  await preview.getByRole('button', { name: 'Stop live preview' }).click();
  await expect(preview.locator('iframe')).toHaveCount(0);
  await expect(fallback).toBeVisible();
});

test('Zenodo record is an archival reference, not an untrusted live iframe', async ({ page }) => {
  await page.goto(CURRENT_PUBLISHED_ORIGIN, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Find a chapter/i }).click();
  const dialog = page.getByRole('dialog', { name: /The Atlas Directory/i });
  await dialog.getByRole('textbox', { name: 'Search the Atlas directory' })
    .fill('Predictive Closure of Spectral Boundary Observers');
  const entry = dialog.locator('.directory-entry')
    .filter({ hasText: 'Predictive Closure of Spectral Boundary Observers' }).first();
  await expect(entry).toBeVisible();
  await entry.getByRole('button', { name: 'Peek inside' }).click();
  const preview = entry.locator('.directory-peek');
  await expect(preview.getByRole('button', { name: 'Launch live preview' })).toHaveCount(0);
  await expect(preview.locator('iframe')).toHaveCount(0);
  await expect(preview.getByRole('link', { name: 'Open research record' }))
    .toHaveAttribute('href', 'https://zenodo.org/records/22838612');
});
