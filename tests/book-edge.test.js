import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
const index = readFileSync(new URL('../src/BookForeEdge.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/book-edge.css', import.meta.url), 'utf8');

test('the original above-book toolbar stack is replaced by one edge index', () => {
  assert.match(app, /<BookForeEdge\b/);
  assert.doesNotMatch(app, /className="quick-room-rail"/);
  assert.doesNotMatch(app, /className="reader-toolbar"/);
  assert.doesNotMatch(app, /className="discovery-compass"/);
  assert.match(app, /<div className="atlas-book|className={`atlas-book/);
});

test('book tabs expose the room, reader, discovery, chapter, map and curate actions', () => {
  for (const id of ['rooms', 'reader', 'discover', 'chapters', 'map', 'curate']) {
    assert.match(index, new RegExp(`id: '${id}'`));
  }
  assert.match(index, /aria-expanded/);
  assert.match(index, /aria-label="Close book index panel"/);
  assert.match(index, /onChooseWing/);
  assert.match(index, /onOpenDirectory/);
  assert.match(index, /onSurprise/);
});

test('new index does not duplicate an embedded website', () => {
  assert.doesNotMatch(index, /<iframe\b/);
  assert.match(app, /<iframe key={active\.id \+ active\.url}/);
});

test('index remains accessible at smaller sizes and with reduced motion', () => {
  assert.match(css, /@media \(max-width:900px\)/);
  assert.match(css, /@media \(max-width:680px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(app, /else if \(bookPanel\) setBookPanel\(null\)/);
});
