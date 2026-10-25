import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { reviewedXiCommonsSourceEntry, XI_COMMONS_SOURCE_ENTRY } from '../src/xi-commons-source.js';
test('verified static website is grounded in R17.5 and never a Xi peer',()=>{
  const d=reviewedXiCommonsSourceEntry();
  assert.equal(d.websiteUrl,'https://michaelwave369.github.io/xi-vessel-bridge/');
  assert.equal(d.sourceUrl,'https://github.com/MichaelWave369/xi-vessel-bridge');
  assert.equal(d.websiteVerified,true);
  assert.equal(d.verificationRunUrl,'https://github.com/MichaelWave369/xi-vessel-bridge/actions/runs/40243474173');
  assert.match(d.manifestSha256,/^[a-f0-9]{64}$/);
  assert.equal(d.liveXiConnected,false);
  assert.equal(d.authorized,false);
  assert.equal(d.externalPilot,'BLOCKED');
  assert.equal(d.twoHostTest,'NOT_RUN');
  assert.equal(d.status,'PUBLIC_STATIC_WEBSITE_VERIFIED');
  assert.ok(Object.isFrozen(XI_COMMONS_SOURCE_ENTRY));
});
test('Atlas offers a user-clicked web doorway and source fallback without changing book inventory',()=>{
  const jsx=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
  assert.match(jsx,/className="xi-atlas-source-door"/);
  assert.match(jsx,/href=\{reviewedXiCommonsSourceEntry\(\)\.websiteUrl\}/);
  assert.match(jsx,/href=\{reviewedXiCommonsSourceEntry\(\)\.sourceUrl\}/);
  assert.match(jsx,/target="_blank" rel="noopener noreferrer"/);
  assert.match(jsx,/not an authorized Xi protocol or installed application/);
  const catalog=readFileSync(new URL('../src/catalog.js',import.meta.url),'utf8');
  assert.doesNotMatch(catalog,/id:\s*'atlas\.public\.xi-phi-commons'/);
});
