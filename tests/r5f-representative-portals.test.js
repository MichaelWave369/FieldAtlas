import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PORTAL_REVIEW_CASES, resolveRepresentativePortals } from '../release/representative-portals.js';
import { PREVIEW_SANDBOX } from '../src/preview-policy.js';

test('representative checklist samples engineering, creation, games and archival research', () => {
  const targets = resolveRepresentativePortals();
  assert.equal(targets.length,5);
  assert.equal(new Set(targets.map(p => p.repo)).size,5);
  assert.deepEqual(targets.map(p => p.repo), PORTAL_REVIEW_CASES.map(p => p.repo));
  assert.deepEqual(targets.map(p => p.kind),['website','website','website','website','research']);
  assert.ok(targets.every(p => p.url.startsWith('https://') && p.manualCheck));
  assert.equal(targets.at(-1).url,'https://zenodo.org/records/22838612');
});

test('missing or unsafe chapters cannot be forced into the production test matrix', () => {
  assert.deepEqual(resolveRepresentativePortals(null),[]);
  const supplied=[{id:'ph',repo:'SuperPhiVessel',title:'SPV',url:'javascript:alert(1)'}];
  assert.deepEqual(resolveRepresentativePortals(supplied),[]);
});

test('restricted previews remain distinct from independent full-tab destinations', () => {
  assert.ok(PREVIEW_SANDBOX.includes('allow-scripts'));
  assert.ok(!PREVIEW_SANDBOX.includes('allow-same-origin'));
  assert.ok(!PREVIEW_SANDBOX.includes('allow-top-navigation'));
  const app=readFileSync('src/main.jsx','utf8');
  assert.ok(app.includes('href={active.url} target="_blank" rel="noopener noreferrer"'));
});

test('live test config includes representative public portals but excludes them from local tests', () => {
  const live=readFileSync('playwright.live.config.js','utf8');
  const local=readFileSync('playwright.config.js','utf8');
  const e2e=readFileSync('e2e/live-portals.spec.js','utf8');
  assert.ok(live.includes('**/live-portals.spec.js'));
  assert.ok(local.includes('**/live-portals.spec.js'));
  assert.ok(e2e.includes('isolateThirdPartyFrameContents'));
  assert.ok(e2e.includes('Open research record'));
});
