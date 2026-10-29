import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { composeAtlasCatalog, reconcileVerifiedChapterUrls } from '../src/atlas-catalog.js';

const local = (repo, url, id = 'legacy-1') => ({
  id, repo, title:'My chosen title', desc:'A saved chapter', category:'Tools', url,
});
const verified = (repo, url, id = 'gh-12345') => ({
  id, repo, title:repo, desc:'Published page', verified:true, published:true, url,
});

test('verified manifest corrects a stored wrong-case URL without losing local identity',()=>{
  const old = local('ReelCommons','https://michaelwave369.github.io/REELCommons/');
  const fresh = verified('ReelCommons','https://michaelwave369.github.io/ReelCommons/');
  const result = reconcileVerifiedChapterUrls([old],[fresh]);
  assert.equal(result[0].url,fresh.url);
  assert.equal(result[0].id,old.id);
  assert.equal(result[0].title,old.title);
  assert.equal(result[0].desc,old.desc);
  assert.equal(result[0].category,old.category);
  assert.equal(old.url,'https://michaelwave369.github.io/REELCommons/');
  const combined=composeAtlasCatalog({pages:[old],publishedPages:[fresh]});
  const matched=combined.filter(page=>page.repo==='ReelCommons');
  assert.equal(matched.length,1);
  assert.equal(matched[0].url,fresh.url);
  assert.equal(matched[0].id,old.id);
});

test('never overwrites user-owned custom chapters, even if repo text matches',()=>{
  const old=local('ReelCommons','https://my.example.org/custom/','custom-28');
  const fresh=verified('ReelCommons','https://michaelwave369.github.io/ReelCommons/');
  assert.deepEqual(reconcileVerifiedChapterUrls([old],[fresh]),[old]);
});

test('unverified and invalid manifest rows can never replace saved URLs',()=>{
  const old=local('ReelCommons','https://michaelwave369.github.io/REELCommons/');
  const bad=[
    {...verified('ReelCommons','https://evil.example.org/'),verified:false},
    {...verified('ReelCommons','javascript:alert(1)')},
    {...verified('ReelCommons','https://evil.example.org/','spoofed-id')},
  ];
  assert.deepEqual(reconcileVerifiedChapterUrls([old],bad),[old]);
});

test('case-insensitive exact repo matching does not modify unrelated or source-only chapters',()=>{
  const old=local('ReelCommons','https://example.org/older/');
  const other=local('EchoesOfTheNine','https://example.org/echoes/','local-2');
  const fresh=verified('reelcommons','https://michaelwave369.github.io/ReelCommons/');
  const results=reconcileVerifiedChapterUrls([old,other],[fresh]);
  assert.equal(results[0].url,fresh.url);
  assert.equal(results[1],other);
});

test('no live app is silently loaded in the central reader; iframe sandbox remains secure',()=>{
  const jsx=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
  const policy=readFileSync(new URL('../src/preview-policy.js',import.meta.url),'utf8');
  assert.match(jsx,/showInBookPreview\s*\?/);
  assert.match(jsx,/<PreviewGateway page=\{active\}/);
  assert.match(jsx,/setPreviewKey\(activePreviewKey\)/);
  assert.match(jsx,/Try safe in-book preview/);
  assert.match(jsx,/Open full website/);
  assert.doesNotMatch(policy,/allow-same-origin(?=[^\n]*\ballow-scripts\b)/);
  assert.match(policy,/export const PREVIEW_SANDBOX/);
});
