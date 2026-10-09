import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_MIRROR_DEPTH, MIN_MIRROR_DEPTH, isInfiniteAtlas, mirrorLayers, clampMirrorDepth, nextMirrorDepth } from '../src/fieldception.js';
import { isVerifiedPublishedPage, makeDiscoveredPage } from '../src/catalog.js';
import { curateProject, applyLocalEdits } from '../src/curation.js';
import { readFileSync } from 'node:fs';

const atlas = {repo:'FieldAtlas',id:'gh-44',url:'https://michaelwave369.github.io/FieldAtlas/',title:'FieldAtlas',category:'Other'};

test('FieldCeption triggers only for the exact public FieldAtlas chapter', () => {
  assert.equal(isInfiniteAtlas(atlas),true);
  assert.equal(isInfiniteAtlas({...atlas,title:'My local nickname'}),true);
  assert.equal(isInfiniteAtlas({...atlas,url:'https://michaelwave369.github.io/FieldAtlas'}),true);
  assert.equal(isInfiniteAtlas({...atlas,repo:'OtherRepo'}),false);
  assert.equal(isInfiniteAtlas({...atlas,url:'https://evil.test/FieldAtlas/'}),false);
  assert.equal(isInfiniteAtlas({...atlas,url:'https://michaelwave369.github.io/FieldAtlas/evil'}),false);
  assert.equal(isInfiniteAtlas({...atlas,url:'javascript:alert(1)'}),false);
  assert.equal(isInfiniteAtlas(null),false);
});

test('mirror recursion is clamped to five visual frames, never infinite', () => {
  assert.equal(MAX_MIRROR_DEPTH,5);
  assert.equal(MIN_MIRROR_DEPTH,1);
  assert.deepEqual(mirrorLayers(0),[1]);
  assert.deepEqual(mirrorLayers(2),[1,2]);
  assert.deepEqual(mirrorLayers(500),[1,2,3,4,5]);
  assert.deepEqual(mirrorLayers(NaN),[1]);
  assert.equal(nextMirrorDepth(5,100),5);
  assert.equal(nextMirrorDepth(1,-100),1);
  assert.equal(clampMirrorDepth(Infinity),1);
});

test('FieldAtlas gets special infinite book identity while preserving URL', () => {
  const p=curateProject(atlas);
  assert.match(p.title,/Infinite Atlas/);
  assert.equal(p.coverGlyph,'∞');
  assert.equal(p.coverTone,'mirrors');
  assert.equal(p.url,atlas.url);
  assert.equal(p.category,'Other');
  const edited=applyLocalEdits(p,{fieldatlas:{title:'Secret silly name',category:'Research'}});
  assert.equal(edited.coverGlyph,'∞');
  assert.equal(edited.title,'Secret silly name');
  assert.equal(isInfiniteAtlas(edited),true);
});

test('public manifest parser accepts properly verified gh-NNN records', () => {
  const row={id:'gh-1411237134',repo:'FieldAtlas',url:atlas.url,verified:true};
  assert.equal(isVerifiedPublishedPage(row),true);
  assert.equal(isVerifiedPublishedPage({...row,verified:false}),false);
  assert.equal(isVerifiedPublishedPage({...row,id:'gh-abc'}),false);
  assert.equal(isVerifiedPublishedPage({...row,repo:'bad/repo'}),false);
  assert.equal(isVerifiedPublishedPage({...row,url:'http://example.org'}),false);
  assert.equal(isVerifiedPublishedPage(null),false);
  const discovered=makeDiscoveredPage({id:1411237134,name:'FieldAtlas',homepage:atlas.url,description:'Public reader'});
  assert.equal(isVerifiedPublishedPage({...discovered,verified:true}),true);
});

test('FieldCeption never embeds a second FieldAtlas iframe and retains a real external link', () => {
  const source=readFileSync('src/main.jsx','utf8');
  assert.match(source,/fieldception\s*\?\s*<MirrorChamber/);
  assert.match(source,/onDeeper=\{\(\) => setMirrorDepth/);
  assert.match(source,/href=\{active\.url\} target="_blank"/);
  assert.match(source,/mirrorLayers\(depth\)\.reverse\(\)/);
});
