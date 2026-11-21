import { expect } from '@playwright/test';

/**
 * Read the exact public snapshot served to the browser by the current
 * candidate build. CI refreshes it before Vite bundles the site, so older
 * PR numbers are intentionally not hardcoded into the Playwright suite.
 *
 * This reads only public historical evidence; it never upgrades any record
 * into a deployment or live integration claim.
 */
export async function sourceMergedPrEvidence(page, repo) {
  const response = await page.request.get('/encyclopedia.json');
  expect(response.ok(), 'Public source snapshot must be served').toBe(true);
  const snapshot = await response.json();
  expect(snapshot.schema_version).toBe(1);
  expect(snapshot.owner).toBe('MichaelWave369');
  expect(Array.isArray(snapshot.repositories)).toBe(true);
  const matches = snapshot.repositories.filter(record =>
    record?.isPublic === true && record.repo === repo);
  expect(matches, 'Exactly one matching public source dossier').toHaveLength(1);
  const record = matches[0];
  const prs = (Array.isArray(record.milestones) ? record.milestones : [])
    .filter(m => m?.kind === 'merged-pr' && Number.isSafeInteger(m.number) &&
      m.number > 0 && Number.isFinite(Date.parse(m.date)));
  const seen = new Set();
  const unique = prs.filter(m => !seen.has(m.number) && seen.add(m.number)).slice(0, 4);
  const evidenceUrls = unique.map(m =>
    'https://github.com/MichaelWave369/' + encodeURIComponent(repo) + '/pull/' + m.number).sort();
  return { numbers: unique.map(m => m.number), evidenceUrls, historyStatus: record.historyStatus };
}

/**
 * Compare links displayed by a rendered page to the build's actual recorded
 * source evidence, not to a historical PR number from a stale fixture.
 */
export async function expectSameEvidenceLinks(locator, expectedUrls) {
  await expect(locator).toHaveCount(expectedUrls.length);
  const actual = await locator.evaluateAll(elements =>
    elements.map(element => element.getAttribute('href')).sort());
  expect(actual).toEqual(expectedUrls);
}
