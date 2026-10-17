import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { archivePrintByRepo, futureArchivePrintUrl, FUTURE_ARCHIVE_URL } from '../src/future-archive.js';
import { seedPages } from '../src/catalog.js';
import { findJourney, availableJourneyStops } from '../src/journeys.js';

test('Future Archive has a curated accessible chapter in new Atlas books', () => {
  const chapter = seedPages.find(page => page.repo === 'FutureArchive');
  assert.ok(chapter);
  assert.equal(chapter.category, 'Creative');
  assert.equal(chapter.url, FUTURE_ARCHIVE_URL);
  assert.ok(availableJourneyStops('artists-lantern', seedPages).some(page => page.repo === 'FutureArchive'));
  assert.ok(findJourney('artists-lantern'));
});

test('18 original art prints map to stable project identities', () => {
  assert.equal(Object.keys(archivePrintByRepo).length,18);
  assert.equal(futureArchivePrintUrl('Domistika'), FUTURE_ARCHIVE_URL + '#print-05');
  assert.equal(futureArchivePrintUrl('FieldAtlas'), FUTURE_ARCHIVE_URL + '#print-16');
  assert.equal(futureArchivePrintUrl('GLO'), FUTURE_ARCHIVE_URL + '#print-18');
  assert.equal(futureArchivePrintUrl('unknown'),null);
  assert.equal(futureArchivePrintUrl('https://evil.example'),null);
  assert.equal(futureArchivePrintUrl('../evil'),null);
});

test('living reader makes the art gallery available independent of local saved chapters', () => {
  const jsx = readFileSync('src/main.jsx','utf8');
  assert.match(jsx,/href=\{FUTURE_ARCHIVE_URL\}/);
  assert.match(jsx,/futureArchivePrintUrl\(active\.repo\)/);
  assert.match(jsx,/View the art print/);
});
