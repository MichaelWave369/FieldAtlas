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


test('v2 makes the desktop book grander while leaving its single portal intact', () => {
  assert.match(css, /max-width: 1810px/);
  assert.match(css, /height: clamp\(675px, 84vh, 945px\)/);
  assert.match(css, /grid-template-columns|\.reading-stage \.atlas-book/);
  assert.match(css, /z-index: 21;[^\n]*Book paper/);
});

test('v2 tabs are portrait dividers with rotated-side reading and archival brass details', () => {
  assert.match(css, /\.book-edge-index\s*\{[\s\S]*?flex-direction: column/);
  assert.match(css, /\.book-edge-tab\s*\{[\s\S]*?flex-direction: column/);
  assert.match(css, /writing-mode: vertical-rl/);
  assert.match(css, /text-orientation: mixed/);
  assert.match(css, /margin-left: var\(--step\)/);
  assert.match(css, /--step: calc\(var\(--tab-step\) \* 4px\)/);
  assert.match(css, /border-right: 3px double/);
  assert.match(css, /repeating-linear-gradient/);
  assert.match(css, /\.book-edge-tab-open/);
  assert.match(index, /'--tab-step': step/);
});

test('tablet and mobile return index labels to horizontal tap-friendly orientation', () => {
  const mobile = css.slice(css.indexOf('@media (max-width:900px)'));
  assert.match(mobile, /flex-direction:row/);
  assert.match(mobile, /writing-mode:horizontal-tb/);
  assert.match(mobile, /min-height:49px/);
  assert.match(mobile, /order:2/);
  assert.match(mobile, /order:3/);
  assert.match(mobile, /overflow-x:auto/);
  assert.match(mobile, /@media \(prefers-reduced-motion:reduce\)/);
});
