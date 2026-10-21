import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('skip to content is keyboard accessible and reaches the original book', () => {
  const app = readFileSync('src/main.jsx', 'utf8');
  const css = readFileSync('src/style.css', 'utf8');
  assert.ok(app.includes('href="#living-book" className="skip-to-reader"'));
  assert.ok(app.includes('id="living-book" ref={readerRef} tabIndex={-1}'));
  assert.ok(css.includes('.skip-to-reader:focus'));
});

test('reusable accessibility test matrix tests desktop and mobile', () => {
  const spec = readFileSync('e2e/visitor-accessibility.spec.js', 'utf8');
  const cfg = readFileSync('playwright.config.js', 'utf8');
  assert.ok(spec.includes('new AxeBuilder({ page })'));
  assert.ok(spec.includes('Skip to living book'));
  assert.ok(spec.includes('directory isolates focus'));
  assert.ok(spec.includes('reduced-motion visitor'));
  assert.ok(spec.includes('invalid passport import'));
  assert.ok(cfg.includes('desktop-chromium'));
  assert.ok(cfg.includes('mobile-chromium'));
});

test('human acceptance ledger remains explicitly pending', () => {
  const ledger=JSON.parse(readFileSync('release/acceptance.json','utf8'));
  assert.equal(ledger.disposition, 'NOT_APPROVED');
  assert.ok(ledger.checks.every(entry => entry.status === 'PENDING'));
});
