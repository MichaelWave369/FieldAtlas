import test from 'node:test';
import assert from 'node:assert/strict';
import { isZenodoEntry, suggestedChapterCategory, createCatalogAudit } from '../src/catalog-audit.js';
import { categories, wingForCategory } from '../src/catalog.js';

test('Publications is a Research Wing shelf, not an extra map room', () => {
  assert.ok(categories.includes('Publications'));
  assert.equal(wingForCategory('Publications'), 'research');
  assert.equal(wingForCategory('Research'), 'research');
});
test('Only actual Zenodo and matching DOI hosts produce publication suggestions', () => {
  for (const url of [
    'https://zenodo.org/records/22882751',
    'https://www.zenodo.org/communities/enter-the-field-phi369/records',
    'https://doi.org/10.5281/zenodo.22882751',
    'https://dx.doi.org/10.5281/zenodo.22882751',
  ]) assert.equal(isZenodoEntry(url), true, url);
  for (const url of [
    'https://notzenodo.org/records/12',
    'https://zenodo.org.evil.example/records/12',
    'http://zenodo.org/records/12',
    'https://doi.org/10.1000/example',
    'https://example.com/?url=zenodo.org',
    'not a url',
  ]) assert.equal(isZenodoEntry(url), false, url);
});
test('An existing Zenodo chapter is flagged for review without being changed', () => {
  const original = [
    { id: 'custom-1', repo: '', title: 'NBG research release', url: 'https://zenodo.org/records/22882751', desc: 'Research paper', category: 'Research' },
    { id: 'gh-22', repo: 'PhiMirrorHex', title: 'Mirror', url: 'https://example.com/mirror', category: 'Research' },
    { id: 'custom-3', repo: '', title: 'A Zenodo collection', url: 'https://zenodo.org/communities/a', category: 'Publications' },
  ];
  const before = JSON.stringify(original);
  const audit = createCatalogAudit(original, '2026-10-17T12:00:00Z');
  assert.equal(audit.chapter_count, 3);
  assert.equal(audit.review_count, 1);
  assert.equal(audit.category_counts.Research, 2);
  assert.equal(audit.category_counts.Publications, 1);
  assert.equal(audit.chapters[1].suggested_category, 'Publications');
  assert.equal(audit.chapters[1].needs_category_review, true);
  assert.equal(audit.chapters[1].category, 'Research');
  assert.equal(suggestedChapterCategory(original[1]), null);
  assert.equal(JSON.stringify(original), before);
  assert.ok(!JSON.stringify(audit).includes('passport'));
});
test('Empty catalogs and malformed entries do not fail audits', () => {
  assert.equal(createCatalogAudit([]).chapter_count, 0);
  assert.equal(createCatalogAudit(null).review_count, 0);
  assert.equal(createCatalogAudit([null, { id: 'x' }]).chapter_count, 0);
});
