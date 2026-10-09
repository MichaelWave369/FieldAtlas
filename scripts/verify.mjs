import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const art = statSync('assets/study-room.webp');
assert.ok(html.startsWith('<!doctype html>'), 'HTML document is missing');
assert.ok(html.includes('./assets/study-room.webp'), 'Artwork link is missing');
assert.ok(art.size > 10000, 'Room artwork is missing or unexpectedly small');
for (const chapter of ['SuperPhiVessel', 'PhiOS', 'parallax-pixelforge', 'SiliconLouvre', 'FieldDeck', 'Domistika', 'Auralith369', 'PhiMirrorHex', 'GiltHouse']) {
  assert.ok(html.includes(chapter), 'Missing chapter: ' + chapter);
}
assert.ok(html.includes('<iframe'), 'Live page preview is missing');
assert.ok(html.includes('Open this world'), 'Direct-launch fallback is missing');
assert.ok(!html.includes('data:image/webp;base64,'), 'Artwork should load as a separate asset');
console.log('PASS: nine chapters, embedded reader, direct-link fallback, and study artwork');
