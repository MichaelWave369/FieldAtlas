import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inspectReleaseAcceptance, REQUIRED_MANUAL_CHECKS } from '../scripts/release-readiness.mjs';

const actual = JSON.parse(readFileSync('release/acceptance.json','utf8'));

test('release stays NOT APPROVED despite green builds and shipped code',()=>{
  const report = inspectReleaseAcceptance(actual,'abc');
  assert.equal(report.approved,false);
  assert.equal(report.errors.length,0);
  assert.equal(report.manualChecksTotal,12);
  assert.deepEqual(report.pending,REQUIRED_MANUAL_CHECKS);
});

test('missing manual checks or unsupported PASS evidence fails schema validation',()=>{
  const missing={...actual,checks:actual.checks.slice(1)};
  assert.ok(inspectReleaseAcceptance(missing,'abc').errors.some(x=>x.includes('Missing required')));
  const claims={...actual,checks:actual.checks.map(x=>({...x,status:'PASS',evidence:''}))};
  assert.ok(inspectReleaseAcceptance(claims,'abc').errors.some(x=>x.includes('requires referenced evidence')));
});

test('approval must be signed to the exact audited candidate commit',()=>{
  const allPass={...actual,disposition:'APPROVED',reviewer:'Release reviewer',
    signedAt:'2026-10-21',reviewedCommit:'candidate-123',
    checks:actual.checks.map(x=>({...x,status:'PASS',evidence:'https://github.com/example/evidence'}))};
  assert.equal(inspectReleaseAcceptance(allPass,'candidate-123').approved,true);
  assert.equal(inspectReleaseAcceptance(allPass,'different-commit').approved,false);
  assert.ok(inspectReleaseAcceptance({...allPass,reviewer:''},'candidate-123').errors.length);
});

test('release CI and browser fixtures exist without altering canonical origin',()=>{
  const workflows=readFileSync('.github/workflows/ci.yml','utf8');
  const cfg=readFileSync('playwright.config.js','utf8');
  assert.ok(workflows.includes('npm run test:e2e'));
  assert.ok(workflows.includes('npm run release:status'));
  assert.ok(cfg.includes('desktop-chromium') && cfg.includes('mobile-chromium'));
  assert.equal(actual.canonicalOrigin,'https://michaelwave369.github.io/FieldAtlas/');
});
