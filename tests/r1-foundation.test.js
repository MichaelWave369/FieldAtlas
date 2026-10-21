import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PREVIEW_SANDBOX } from '../src/preview-policy.js';

const source = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

test('embedded applications run in an opaque-origin sandbox without clipboard or top navigation', () => {
  const tokens = new Set(PREVIEW_SANDBOX.split(/\\s+/));
  assert.ok(tokens.has('allow-scripts'));
  for (const forbidden of ['allow-same-origin', 'allow-top-navigation', 'allow-top-navigation-by-user-activation', 'allow-modals', 'allow-downloads']) {
    assert.equal(tokens.has(forbidden), false, forbidden);
  }
  assert.equal((source.match(/sandbox=\\{PREVIEW_SANDBOX\\}/g) || []).length, 2);
  assert.doesNotMatch(source, /clipboard-(read|write)/);
});

test('application dialogs use the shared keyboard/focus manager', () => {
  assert.equal((source.match(/data-atlas-modal="/g) || []).length, 5);
  assert.match(source, /activateModalFocus\\(dialog/);
  assert.match(source, /setPendingChapterId\\(null\\)/);
});

test('reader honors reduced-motion and starter catalog documentation is consistent', () => {
  assert.match(source, /if \\(window\\.matchMedia\\?\\.\\('\(prefers-reduced-motion: reduce\)'\\)\\.matches\\)/);
  assert.match(source, /Reset to curated ten/);
  assert.match(readme, /Ten examples are seeded/);
});
