import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inspectLiveHome, inspectLiveTextResources, fetchResource } from '../scripts/live-site-audit.mjs';
import { CURRENT_PUBLISHED_ORIGIN } from '../scripts/launch-preflight.mjs';

const html = `<!doctype html><html lang="en"><head><title>The Field Atlas | A Living Library</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="canonical" href="${CURRENT_PUBLISHED_ORIGIN}" />
<meta property="og:url" content="${CURRENT_PUBLISHED_ORIGIN}" />
<link href="./assets/index-abc.css" rel="stylesheet" />
<script type="module" src="./assets/index-def.js"></script>
</head><body></body></html>`;

test('production inspection recognizes the current canonical site and its build assets', () => {
  const result=inspectLiveHome(html);
  assert.equal(result.checks.every(x=>x.pass),true);
  assert.deepEqual(result.assets,['./assets/index-abc.css','./assets/index-def.js']);
});

test('early custom-domain redirects and missing live metadata fail closed', () => {
  const result=inspectLiveHome(html.replaceAll(CURRENT_PUBLISHED_ORIGIN,'https://enterthefield.org/'));
  assert.equal(result.checks.every(x=>x.pass),false);
  assert.equal(result.checks.find(x=>x.id==='canonical').pass,false);
  assert.equal(inspectLiveHome('<html></html>').checks.every(x=>x.pass),false);
});

test('crawler text must reference the current live homepage', () => {
  const results=inspectLiveTextResources({
    robots:'User-agent: *\nSitemap: '+CURRENT_PUBLISHED_ORIGIN+'sitemap.xml',
    sitemap:'<loc>'+CURRENT_PUBLISHED_ORIGIN+'</loc>',
  });
  assert.equal(results.every(x=>x.pass),true);
  assert.equal(inspectLiveTextResources({robots:'',sitemap:''}).every(x=>x.pass),false);
});

test('rejects external-domain redirects even if HTTP 200 and never silently follows offsite', async () => {
  const fake=async () => ({ok:true, status:200, url:'https://attacker.example/foo',headers:new Headers()});
  await assert.rejects(fetchResource(CURRENT_PUBLISHED_ORIGIN,fake),/outside the approved/);
});

test('deployment checks run AFTER successful Pages deployment and upload receipts',()=>{
  const workflow=readFileSync('.github/workflows/deploy.yml','utf8');
  const config=readFileSync('playwright.live.config.js','utf8');
  assert.ok(workflow.includes('needs: deploy'));
  assert.ok(workflow.includes('npm run live:verify'));
  assert.ok(workflow.includes('npm run test:live'));
  assert.ok(workflow.includes('live-http-evidence.json'));
  assert.ok(workflow.includes('Verify actual public GitHub Pages deployment'));
  assert.ok(workflow.includes('Retain read-only post-deploy evidence and traces'));
  assert.ok(config.includes('public-desktop'));
  assert.ok(config.includes('public-mobile'));
});
