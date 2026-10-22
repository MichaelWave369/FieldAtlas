import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import { seedPages } from '../src/catalog.js';
import {
  CONSTELLATION_URL, constellationProjectId, constellationChapterUrl,
  readConstellationProject, locateConstellationChapter,
} from '../src/constellation-bridge.js';

const row=(repo,id,url='https://michaelwave369.github.io/'+repo+'/')=>({
  id:'gh-'+id,repo,url,verified:true,title:repo
});
const verified=[row('SuperPhiVessel',123),row('Domistika',456)];
const chapter=seedPages.find(p=>p.repo==='SuperPhiVessel');
const catalog=[...seedPages];

test('verified manifest maps seed chapters to canonical numeric Constellation deep links',()=>{
  assert.equal(constellationProjectId(chapter,verified),'github:123');
  const link=constellationChapterUrl(chapter,verified);
  assert.equal(new URL(link).origin,new URL(CONSTELLATION_URL).origin);
  assert.equal(new URL(link).pathname,'/FieldConstellation/');
  assert.equal(new URL(link).searchParams.get('repo'),'github:123');
  assert.equal(locateConstellationChapter(catalog,verified,'github:123')?.id,chapter.id);
});

test('existing chapter name alone cannot create a false identity for a visitor-local edit',()=>{
  const impostor={...chapter,id:'custom',url:'https://unrelated.example/world'};
  assert.equal(constellationProjectId(impostor,verified),null);
  assert.equal(constellationChapterUrl(impostor,verified),null);
  assert.equal(locateConstellationChapter([impostor],verified,'github:123'),null);
  const editedName={...chapter,repo:'OtherProject'};
  assert.equal(constellationChapterUrl(editedName,verified),null);
});

test('only explicit verified public manifest rows can map to existing chapters',()=>{
  for(const bad of [
    {...verified[0],verified:false},
    {...verified[0],id:'gh-private'},
    {...verified[0],id:'gh-0'},
    {...verified[0],url:'javascript:alert(1)'},
    {...verified[0],url:'http://michaelwave369.github.io/SuperPhiVessel/'}
  ]) {
    assert.equal(constellationChapterUrl(chapter,[bad]),null);
    assert.equal(locateConstellationChapter(catalog,[bad],'github:123'),null);
  }
  assert.equal(locateConstellationChapter(catalog,[], 'github:123'),null);
  assert.equal(locateConstellationChapter([],verified, 'github:123'),null);
});

test('duplicate identities or duplicate matching chapters fail closed',()=>{
  assert.equal(constellationChapterUrl(chapter,[verified[0],verified[0]]),null);
  assert.equal(locateConstellationChapter(catalog,[verified[0],verified[0]],'github:123'),null);
  assert.equal(locateConstellationChapter([chapter,chapter],verified,'github:123'),null);
});

test('safe Atlas project alias rejects forged URLs, duplicate and malformed IDs',()=>{
  assert.equal(readConstellationProject('?project=github%3A123'),'github:123');
  for(const search of [
    '', '?project=github:0', '?project=github:00123', '?project=github:123&project=github:123',
    '?project=https://evil.example', '?project=github:123%0A', '?project=github:99999999999999999999999'
  ])assert.equal(readConstellationProject(search),null,search);
  assert.equal(locateConstellationChapter(catalog,verified,'https://evil.example'),null);
  assert.equal(locateConstellationChapter(catalog,verified,'github:999999999'),null);
});

test('Atlas reader can keep an existing chapter while protecting its public identity',()=>{
  const matching=verified[0];
  const renamed={...chapter,title:'Personalized title'};
  assert.equal(constellationChapterUrl(renamed,verified),constellationChapterUrl(chapter,verified));
  const removed=verified.filter(r=>r.id!==matching.id);
  assert.equal(locateConstellationChapter(catalog,removed,'github:123'),null);
});


test('original Atlas reader and visitor passport keep their own navigation and state',()=>{
  const jsx=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
  assert.match(jsx,/readAtlasLink\(window\.location\.search\)/);
  assert.match(jsx,/readConstellationProject\(window\.location\.search\)/);
  assert.match(jsx,/locateConstellationChapter\(catalog,publishedPages,identity\)/);
  assert.match(jsx,/constellationChapterUrl\(active,publishedPages\)/);
  assert.match(jsx,/View in Constellation/);
  assert.match(jsx,/useAtlasPassport\(active\?\.id\)/);
  assert.match(jsx,/Share chapter/);
  assert.match(jsx,/if \(!link\.tour && !link\.chapter\)/);
});
