import { test, expect } from '@playwright/test';

test('R8 shareable Chronicle opens a real GMED timeline with public PR evidence', async ({ page }) => {
  await page.goto('/?chronicle=GMED&chronicleKind=merged#field-chronicle');
  await expect(page.locator('.atlas-book')).toBeAttached();
  const chronicle = page.locator('details.field-chronicle');
  await expect(chronicle).toHaveAttribute('open','');
  await expect(chronicle.locator('.field-chronicle-titles')).toContainText('The Field Chronicle');
  await expect(chronicle.getByRole('combobox',{name:'Chronicle project'})).toHaveValue('GMED');
  await expect(chronicle.getByRole('button',{name:'Merged PRs'})).toHaveAttribute('aria-pressed','true');
  const pr = chronicle.locator('.field-chronicle-event').filter({hasText:'Merged PR #2'}).first();
  await expect(pr).toBeVisible();
  await expect(pr.getByRole('link',{name:'Inspect merged PR'}))
    .toHaveAttribute('href','https://github.com/MichaelWave369/GMED/pull/2');
  await expect(chronicle.getByRole('link',{name:'Share this view'}))
    .toHaveAttribute('href',/chronicle=GMED&chronicleKind=merged#field-chronicle$/);
  await expect(chronicle.getByRole('link',{name:'Open R7 dossier'}))
    .toHaveAttribute('href',/dossier=GMED#living-encyclopedia$/);
});

test('R8 filters source events, then restores the full timeline without losing the original book',async ({page})=>{
  await page.goto('/');
  const chronicle=page.locator('details.field-chronicle');
  await chronicle.locator('summary').click();
  await expect(chronicle.getByRole('button',{name:'Repo origins'})).toBeVisible();
  await chronicle.getByRole('combobox',{name:'Chronicle project'}).selectOption('GMED');
  await chronicle.getByRole('button',{name:'Repo origins'}).click();
  await expect(chronicle.locator('.field-chronicle-event')).toHaveCount(1);
  await expect(chronicle.locator('.field-chronicle-event').first()).toContainText('Repository created');
  await chronicle.getByRole('button',{name:'Merged PRs'}).click();
  await expect(chronicle.locator('.field-chronicle-event').first()).toContainText('Merged PR #2');
  await chronicle.getByRole('button',{name:'All recorded events'}).click();
  expect(await chronicle.locator('.field-chronicle-event').count()).toBeGreaterThan(1);
  await expect(page.locator('.atlas-book')).toBeAttached();
});

test('R7 source dossier links into the same repository history without inventing a live website',async ({page})=>{
  await page.goto('/?dossier=GMED#living-encyclopedia');
  const encyclopedia=page.locator('details.atlas-encyclopedia');
  await expect(encyclopedia).toHaveAttribute('open','');
  const link=encyclopedia.getByRole('link',{name:'View in Chronicle'});
  await expect(link).toHaveAttribute('href',/chronicle=GMED#field-chronicle$/);
  await link.click();
  await expect(page).toHaveURL(/chronicle=GMED#field-chronicle$/);
  await expect(page.locator('details.field-chronicle')).toHaveAttribute('open','');
  await expect(page.locator('.field-chronicle-timeline-head')).toContainText('GMED');
});
