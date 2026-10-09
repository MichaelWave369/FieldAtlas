import test from 'node:test';
import assert from 'node:assert/strict';
import { seedPages, safeUrl, uniqueMerge, githubPagesUrl, makeDiscoveredPage } from '../src/catalog.js';

test('starter entries have valid secure URLs and unique IDs', () => {
  assert.equal(new Set(seedPages.map(p => p.id)).size, seedPages.length);
  assert.ok(seedPages.every(p => safeUrl(p.url)?.startsWith('https://')));
});
test('rejects dangerous or malformed URLs', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,a', 'file:///secret', 'http://example.org', 'not a url']) assert.equal(safeUrl(value), null);
  assert.ok(safeUrl('https://github.io/example'));
  assert.ok(safeUrl('http://localhost:5173'));
});
test('dedupes discovered entries by URL and ID', () => {
  const entry = { ...seedPages[0], id: 'duplicate', url: seedPages[0].url.replace(/\/$/, '') };
  assert.equal(uniqueMerge(seedPages, [entry]).length, seedPages.length);
});
test('discovers owner GitHub Pages URLs safely', () => {
  const r = makeDiscoveredPage({ id: 44, name: 'CoolRepo', description: 'A site', homepage: '', has_pages: true });
  assert.equal(r.url, 'https://michaelwave369.github.io/CoolRepo/');
  assert.equal(githubPagesUrl({ name: 'CoolRepo', homepage: 'https://michaelwave369.github.io/CoolRepo/' }), r.url);
});
