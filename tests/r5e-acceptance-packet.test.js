import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { summarizePlaywrightEvidence, makeAcceptancePacket } from '../scripts/acceptance-packet.mjs';

const ledger=JSON.parse(readFileSync('release/acceptance.json','utf8'));
const sha='1234567890abcdef1234567890abcdef12345678';

test('machine evidence is accurately labeled; missing report is never success',()=>{
  assert.equal(summarizePlaywrightEvidence(null).status,'NOT_RUN');
  const report={stats:{expected:24,unexpected:0,flaky:0,skipped:0},
    config:{projects:[{name:'desktop-chromium'},{name:'mobile-chromium'}]}};
  assert.deepEqual(summarizePlaywrightEvidence(report),{
    status:'PASS',passed:24,failed:0,flaky:0,skipped:0,
    projects:['desktop-chromium','mobile-chromium'],
  });
  assert.equal(summarizePlaywrightEvidence({...report,stats:{...report.stats,unexpected:2}}).status,'FAIL');
  assert.equal(summarizePlaywrightEvidence({...report,stats:{...report.stats,flaky:1}}).status,'RETRY_WARNING');
  assert.equal(summarizePlaywrightEvidence({stats:{expected:24}}).status,'NOT_RUN');
});

test('green browser runs cannot sign a manual ledger or authorize DNS',()=>{
  const packet=makeAcceptancePacket({
    ledger,sha,runId:'123456',repository:'MichaelWave369/FieldAtlas',
    playwrightReport:{stats:{expected:24,unexpected:0,skipped:0,flaky:0}},
    generatedAt:'2026-10-21T00:00:00Z',
  });
  assert.equal(packet.browserAutomated.status,'PASS');
  assert.equal(packet.humanReview.approved,false);
  assert.equal(packet.humanReview.completed,0);
  assert.equal(packet.humanReview.outstanding.length,12);
  assert.equal(packet.domainMigrationPermitted,false);
  assert.equal(packet.workflowEvidence,'https://github.com/MichaelWave369/FieldAtlas/actions/runs/123456');
  assert.equal(packet.sourceCommit,sha);
});

test('deployed status must be explicitly described and cannot imply authorization',()=>{
  const packet=makeAcceptancePacket({
    ledger,sha,channel:'deployed',playwrightReport:null,
  });
  assert.equal(packet.channel,'deployed');
  assert.equal(packet.browserAutomated.status,'NOT_RUN');
  assert.equal(packet.domainMigrationPermitted,false);
});

test('both browser suites and CI integrate machine acceptance evidence',()=>{
  const playwright=readFileSync('playwright.config.js','utf8');
  const live=readFileSync('playwright.live.config.js','utf8');
  const ci=readFileSync('.github/workflows/ci.yml','utf8');
  const deploy=readFileSync('.github/workflows/deploy.yml','utf8');
  assert.ok(playwright.includes('atlas-playwright.json'));
  assert.ok(live.includes('atlas-live-playwright.json'));
  assert.ok(ci.includes('npm run acceptance:packet'));
  assert.ok(deploy.includes('npm run acceptance:packet -- --deployed'));
});
