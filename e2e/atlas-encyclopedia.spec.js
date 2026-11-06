import { test, expect } from '@playwright/test';

test('living encyclopedia opens a shareable source dossier without replacing the living book',async ({page})=>{
  await page.goto('/?dossier=GMED#living-encyclopedia');
  const book=page.locator('.atlas-book');
  await expect(book).toBeAttached();
  const encyclopedia=page.locator('details.atlas-encyclopedia');
  await expect(encyclopedia).toHaveAttribute('open','');
  await expect(encyclopedia.getByRole('heading',{name:'GMED',exact:true})).toBeVisible();
  await expect(encyclopedia.getByRole('heading',{name:'Public development history'})).toBeVisible();
  await expect(encyclopedia.getByText('Merged PR #2')).toBeVisible();
  await expect(encyclopedia.getByRole('link',{name:'Open source'}))
    .toHaveAttribute('href','https://github.com/MichaelWave369/GMED');
  await expect(encyclopedia.getByRole('link',{name:'Locate in Constellation'}))
    .toHaveAttribute('href',/repo=github%3A1447570777/);
  await expect(encyclopedia.getByRole('link',{name:'Share dossier link'}))
    .toHaveAttribute('href',/dossier=GMED#living-encyclopedia$/);
});

test('public source search navigates between dossiers without inventing live chapters',async ({page})=>{
  await page.goto('/');
  const encyclopedia=page.locator('details.atlas-encyclopedia');
  await encyclopedia.locator('summary').click();
  await expect(encyclopedia.getByText(/public source dossiers/).first()).toBeVisible();
  await encyclopedia.getByRole('searchbox',{name:'Find a project'}).fill('PhiTriBrain369');
  await encyclopedia.getByRole('button',{name:/PhiTriBrain369/}).click();
  await expect(encyclopedia.getByRole('heading',{name:'PhiTriBrain369'})).toBeVisible();
  await expect(encyclopedia.getByText('Merged PR #14')).toBeVisible();
  const sources=encyclopedia.getByRole('link',{name:'Open source'});
  await expect(sources).toHaveAttribute('target','_blank');
  await expect(sources).toHaveAttribute('rel',/noopener/);
});

test('new horizons gives source-only projects a verified dossier doorway',async ({page})=>{
  await page.goto('/');
  const section=page.locator('.new-horizons');
  const project=section.locator('.new-horizons-card').filter({hasText:'GMED'}).first();
  const link=project.getByRole('link',{name:/Open GMED source dossier/});
  await expect(link).toHaveAttribute('href','?dossier=GMED#living-encyclopedia');
  await link.click();
  await expect(page).toHaveURL(/dossier=GMED#living-encyclopedia/);
  const encyclopedia=page.locator('.atlas-encyclopedia');
  await expect(encyclopedia.getByRole('heading',{name:'GMED',exact:true})).toBeVisible();
});
