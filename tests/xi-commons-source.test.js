import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { reviewedXiCommonsSourceEntry, XI_COMMONS_SOURCE_ENTRY } from '../src/xi-commons-source.js';
test('Atlas Xi entry is source-only, never a fake published chapter',()=>{
  const d=reviewedXiCommonsSourceEntry();
  assert.equal(d.sourceUrl,'https://github.com/MichaelWave369/xi-vessel-bridge');
  assert.equal(d.websiteVerified,false);
  assert.equal(d.liveXiConnected,false);
  assert.equal(d.authorized,false);
  assert.equal(d.externalPilot,'BLOCKED');
  assert.equal(d.twoHostTest,'NOT_RUN');
  assert.equal(d.status,'PUBLIC_SOURCE_ONLY');
  assert.ok(Object.isFrozen(XI_COMMONS_SOURCE_ENTRY));
});
test('Atlas UI provides explicitly clicked source without changing curated book inventory',()=>{
  const jsx=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
  assert.match(jsx,/className="xi-atlas-source-door"/);
  assert.match(jsx,/href=\{reviewedXiCommonsSourceEntry\(\)\.sourceUrl\}/);
  assert.match(jsx,/target="_blank" rel="noopener noreferrer"/);
  assert.match(jsx,/not a confirmed live website or iframe chapter/);
  const catalog=readFileSync(new URL('../src/catalog.js',import.meta.url),'utf8');
  assert.doesNotMatch(catalog,/id:\s*'atlas\.public\.xi-phi-commons'/);
});
