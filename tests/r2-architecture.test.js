import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { seedPages } from '../src/catalog.js';
import { composeAtlasCatalog, filterAtlasCatalog, searchAtlasDirectory } from '../src/atlas-catalog.js';
import { PASSPORT_KEY, MAX_PASSPORT_CHAPTERS, normalizePassportIds, markChapterVisited } from '../src/passport-storage.js';
import { parseAtlasManifest } from '../src/atlas-manifest.js';

const page = (id, title, category) => ({id,repo:id,title,category,url:'https://example.org/'+id+'/',desc:'Example '+id});

test('canonical catalog keeps seeded order, honors local edits and never adds hidden verified chapters', () => {
  const pages = [page('first','First','Research'),page('custom','Custom','Other')];
  const verified = [page('new','New','Games'),page('hidden','Hidden','Tools')];
  const catalog = composeAtlasCatalog({
    pages, publishedPages:verified, hiddenIds:['hidden'],
    localEdits:{custom:{title:'My Custom Title',category:'Creative'}},
  });
  assert.deepEqual(catalog.slice(0,3).map(p => p.id), ['first','custom','new']);
  assert.equal(catalog.find(p => p.id==='custom').title, 'My Custom Title');
  assert.equal(catalog.find(p => p.id==='custom').category, 'Creative');
  assert.equal(catalog.some(p => p.id === 'hidden'), false);
  assert.equal(pages[1].title, 'Custom');
});

test('reader filters by room, category, favorites and text without mutating chapter order', () => {
  const original=[page('a','Alpha','Research'),page('b','Bravo','Games'),page('c','Charlie','Research')];
  assert.deepEqual(filterAtlasCatalog(original,{wing:'research'}).map(p=>p.id), ['a','c']);
  assert.deepEqual(filterAtlasCatalog(original,{category:'Favorites',favoriteIds:['b','c']}).map(p=>p.id),['b','c']);
  assert.deepEqual(filterAtlasCatalog(original,{search:'  charLIE '}).map(p=>p.id),['c']);
  assert.deepEqual(filterAtlasCatalog(original,{wing:'games',category:'Research'}),[]);
  assert.deepEqual(original.map(p=>p.id),['a','b','c']);
});

test('directory sorts independently and does not alter reader chapter order', () => {
  const input=[page('z','Zeta','Games'),page('a','Alpha','Games'),page('c','Charlie','Research')];
  assert.deepEqual(searchAtlasDirectory(input,{wing:'games'}).map(p=>p.id),['a','z']);
  assert.deepEqual(input.map(p=>p.id),['z','a','c']);
});

test('passport keeps the existing storage key and bounded visited-chapter semantics', () => {
  assert.equal(PASSPORT_KEY,'field-atlas-visitor-passport-v6');
  assert.deepEqual(normalizePassportIds([null,'a',1,'b']), ['a','b']);
  assert.deepEqual(normalizePassportIds('invalid'),[]);
  assert.deepEqual(markChapterVisited(['a'],'a'),['a']);
  assert.deepEqual(markChapterVisited(['a'],'b'),['a','b']);
  const full=Array.from({length:MAX_PASSPORT_CHAPTERS},(_,i)=>'chapter-'+i);
  assert.equal(markChapterVisited(full,'last')[0],'chapter-1');
  assert.equal(markChapterVisited(full,'last').at(-1),'last');
});

test('verified manifest parser rejects invalid schema and preserves strict verified-only admissions',()=>{
  assert.throws(()=>parseAtlasManifest({owner:'Other',schema_version:1,pages:[]}));
  assert.throws(()=>parseAtlasManifest({owner:'MichaelWave369',schema_version:2,pages:[]}));
  const valid={...seedPages[0],id:'gh-123',verified:true,title:'Verified book'};
  const accepted=parseAtlasManifest({schema_version:1,owner:'MichaelWave369',pages:[
    valid,
    {...valid,id:'gh-456',verified:false},
    {...valid,id:'fake',verified:true},
  ]});
  assert.equal(accepted.length,1);
  assert.equal(accepted[0].title,'Verified book');
  assert.equal(accepted[0].kicker,'LIVE FROM THE FIELD');
});

test('the real reader composes catalog, passport and manifest through separate hooks',()=>{
  const src=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
  assert.ok(src.includes('useAtlasCatalog({'));
  assert.ok(src.includes('useAtlasPassport(active?.id)'));
  assert.ok(src.includes('useAtlasManifest({'));
  assert.ok(src.includes('data-atlas-modal="directory"'));
  assert.ok(src.includes('<iframe key={active.id + active.url}'));
});
