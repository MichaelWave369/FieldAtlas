import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { auditStaticLaunch, CURRENT_PUBLISHED_ORIGIN } from '../scripts/launch-preflight.mjs';

function fixture() {
  const root=mkdtempSync(join(tmpdir(),'field-atlas-gate-'));
  const html='<html lang="en"><head><title>The Field Atlas</title>'+
    '<link rel="canonical" href="'+CURRENT_PUBLISHED_ORIGIN+'"/>'+
    '<meta property="og:title" content="The Field Atlas"/>'+
    '<meta property="og:description" content="Open worlds"/>'+
    '<meta property="og:url" content="'+CURRENT_PUBLISHED_ORIGIN+'"/>'+
    '<meta property="og:image" content="'+CURRENT_PUBLISHED_ORIGIN+'study-room.webp"/>'+
    '<meta name="twitter:card" content="summary_large_image"/>'+
    '</head><body><script src="./assets/index.js"></script></body></html>';
  writeFileSync(join(root,'index.html'),html);
  writeFileSync(join(root,'robots.txt'),'Sitemap: '+CURRENT_PUBLISHED_ORIGIN+'sitemap.xml');
  writeFileSync(join(root,'sitemap.xml'),'<loc>'+CURRENT_PUBLISHED_ORIGIN+'</loc>');
  return root;
}

test('static release checks pass on correct local build artifacts',()=>{
  const root=fixture();
  try {
    const report=auditStaticLaunch(root);
    assert.equal(report.passed,true);
    assert.equal(report.scope,'STATIC_BUILD_ONLY_NOT_BROWSER_OR_DNS_ACCEPTANCE');
    assert.ok(report.checks.length>=9);
  } finally {rmSync(root,{recursive:true,force:true});}
});

test('preflight fails closed on missing metadata or unexpected early CNAME',()=>{
  const root=fixture();
  try {
    writeFileSync(join(root,'CNAME'),'enterthefield.org\n');
    const report=auditStaticLaunch(root);
    assert.equal(report.passed,false);
    assert.equal(report.checks.find(x=>x.name==='no-custom-domain-cutover').pass,false);
  } finally {rmSync(root,{recursive:true,force:true});}
});

test('preflight does not mistake a nonexistent dist directory for acceptance',()=>{
  const report=auditStaticLaunch('/tmp/fieldatlas-preflight-this-path-should-not-exist');
  assert.equal(report.passed,false);
});
