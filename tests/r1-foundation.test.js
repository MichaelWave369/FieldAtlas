import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PREVIEW_SANDBOX } from '../src/preview-policy.js';

const source = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

test('embedded applications use an opaque-origin sandbox without extra privileges', () => {
  const tokens = new Set(PREVIEW_SANDBOX.split(' '));
  assert.ok(tokens.has('allow-scripts'));
  for (const forbidden of ['allow-same-origin', 'allow-top-navigation', 'allow-top-navigation-by-user-activation', 'allow-modals', 'allow-downloads']) {
    assert.equal(tokens.has(forbidden), false, forbidden);
  }
  assert.equal(source.split('sandbox={PREVIEW_SANDBOX}').length - 1, 2);
  assert.equal(source.includes('clipboard-read'), false);
  assert.equal(source.includes('clipboard-write'), false);
});

test('application dialogs use a shared keyboard/focus manager', () => {
  assert.equal(source.split('data-atlas-modal="').length - 1, 5);
  assert.ok(source.includes('activateModalFocus(dialog'));
  assert.ok(source.includes('setPendingChapterId(null)'));
});

test('reader supports reduced motion and starter catalog copy is consistent', () => {
  assert.ok(source.includes("if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)"));
  assert.ok(source.includes('Reset to curated ten'));
  assert.ok(readme.includes('Ten examples are seeded'));
});
