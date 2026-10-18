import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const markup = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');

test('shelf overflow remains a working, count-aware directory button', () => {
  assert.match(markup, /filtered\.length > 24 && <button className="room-more-books" type="button"/);
  assert.match(markup, /onClick=\{\(\) => \{setDirectoryWing\(wing\);setDirectoryOpen\(true\);\}\}/);
  assert.match(markup, /\+\{filtered\.length - 24\} more/);
  assert.match(markup, /Browse all/);
  assert.match(markup, /aria-label=\{\`Browse all/);
});

test('overflow bookend is a brass Phi ornament without native white-button styling', () => {
  assert.match(markup, /className="room-more-books-phi" aria-hidden="true">Φ<\/span>/);
  assert.match(styles, /\.room-more-books\s*\{[\s\S]*?appearance:none/);
  assert.match(styles, /\.room-more-books\s*\{[\s\S]*?background:linear-gradient/);
  assert.match(styles, /\.room-more-books:focus-visible\s*\{outline:/);
  assert.match(styles, /@media\(prefers-reduced-motion:reduce\)\s*\{\s*\.room-more-books/);
});
