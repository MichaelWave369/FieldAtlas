import { test, expect } from '@playwright/test';

test('R9 lab opens as a standalone, keyboard-accessible synthetic experiment', async ({page}) => {
  await page.goto('/experiment-lab/');
  await expect(page.getByRole('heading',{name:'The Experimental Wing'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Synthetic network'})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#node-list button')).toHaveCount(12);
  await page.locator('#node-list button').first().click();
  await expect(page.locator('#selected-detail')).toContainText('Activation 0.850');
  await page.getByRole('button',{name:'Run',exact:true}).click();
  await expect(page.getByRole('button',{name:'Pause',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Pause',exact:true}).click();
  await page.getByRole('button',{name:'Reset'}).click();
  await expect(page.locator('#selected-detail')).toContainText('Activation 0.000');
  await expect(page.getByRole('link',{name:'Return to the Field Atlas living book'}))
    .toHaveAttribute('href','../');
});

test('source history view clearly distinguishes observations from integrations', async ({page}) => {
  await page.goto('/experiment-lab/?repo=FieldAtlas');
  await expect(page.getByRole('button',{name:'Public source evidence'})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#trust-note')).toContainText('not code dependency');
  await expect(page.locator('#selected-label')).toHaveText('FieldAtlas');
  await expect(page.locator('#source-link')).toHaveAttribute('href','https://github.com/MichaelWave369/FieldAtlas');
  await expect(page.getByRole('button',{name:'Run',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Synthetic network'}).click();
  await expect(page.locator('#node-list button')).toHaveCount(12);
});

test('an unknown repository does not invent source relationships', async ({page}) => {
  await page.goto('/experiment-lab/?repo=../../untrusted');
  await expect(page.locator('#mode-source')).toBeDisabled();
  await expect(page.locator('#trust-note')).toContainText('Synthetic 12-node');
  await expect(page.locator('#node-list button')).toHaveCount(12);
});

test('R7 dossier opens lab as opt-in, same-origin, new tab link', async ({page}) => {
  await page.goto('/?dossier=FieldAtlas#living-encyclopedia');
  const encyclopedia=page.locator('details.atlas-encyclopedia');
  const link=encyclopedia.getByRole('link',{name:'Explore in Lab (experimental)'});
  await expect(link).toHaveAttribute('href',/\/experiment-lab\/\?repo=FieldAtlas$/);
  await expect(link).toHaveAttribute('target','_blank');
  await expect(link).toHaveAttribute('rel',/noopener/);
  await expect(page.locator('.atlas-book')).toBeAttached();
});
