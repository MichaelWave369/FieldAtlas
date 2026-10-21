import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { directoryCollections, directoryCollectionCounts, selectDirectoryCollection, isAtlasFindShortcut } from '../src/directory-explorer.js';

const page=(id,category='Creative')=>({id,title:id,category});
const catalog=[page('a','Research'),page('b','Creative'),page('c','Research'),page('d','Games')];

test('Grand Catalog offers four explicit book collections',()=>{
  assert.deepEqual(directoryCollections.map(entry=>entry.id),['all','visited','favorites','unexplored']);
});

test('collection counts obey wing and visitor-local state',()=>{
  const state={visitedIds:['a','c'],favoriteIds:['a','d']};
  assert.deepEqual(directoryCollectionCounts(catalog,state),
    {all:4,visited:2,favorites:2,unexplored:2});
  assert.deepEqual(directoryCollectionCounts(catalog,{...state,wing:'research'}),
    {all:2,visited:2,favorites:1,unexplored:0});
  assert.deepEqual(directoryCollectionCounts([],state),
    {all:0,visited:0,favorites:0,unexplored:0});
});

test('recently explored follows passport order while other collections retain search order',()=>{
  const pages=[...catalog];
  const state={visitedIds:['c','a','unknown'],favoriteIds:['d','b']};
  assert.deepEqual(selectDirectoryCollection(pages,{...state,collection:'visited'}).map(x=>x.id),['a','c']);
  assert.deepEqual(selectDirectoryCollection(pages,{...state,collection:'favorites'}).map(x=>x.id),['b','d']);
  assert.deepEqual(selectDirectoryCollection(pages,{...state,collection:'unexplored'}).map(x=>x.id),['b','d']);
  assert.deepEqual(selectDirectoryCollection(pages,{...state,collection:'all'}).map(x=>x.id),['a','b','c','d']);
  assert.deepEqual(pages.map(x=>x.id),['a','b','c','d']);
});

test('global find shortcut works on Windows/Mac without hijacking ordinary text entry',()=>{
  assert.equal(isAtlasFindShortcut({key:'k',ctrlKey:true}),true);
  assert.equal(isAtlasFindShortcut({key:'K',metaKey:true}),true);
  assert.equal(isAtlasFindShortcut({key:'k',ctrlKey:true,shiftKey:true}),false);
  assert.equal(isAtlasFindShortcut({key:'k',metaKey:true,altKey:true}),false);
  assert.equal(isAtlasFindShortcut({key:'k'}),false);
  assert.equal(isAtlasFindShortcut({key:'k',ctrlKey:true,isComposing:true}),false);
  assert.equal(isAtlasFindShortcut({key:'k',metaKey:true,repeat:true}),false);
});

test('the existing directory remains one live accessible catalog, not a new iframe farm',()=>{
  const src=readFileSync('src/main.jsx','utf8');
  assert.ok(src.includes("isAtlasFindShortcut(e)"));
  assert.ok(src.includes("selectDirectoryCollection(directoryResults"));
  assert.ok(src.includes('aria-label="Directory collections"'));
  assert.ok(src.includes('aria-pressed={directoryCollection === collection.id}'));
  assert.ok(src.includes('onClick={() => openChapterFromDirectory(p)}'));
  assert.ok(src.includes('data-atlas-modal="directory"'));
  assert.ok(src.includes('useAtlasPassport(active?.id)'));
  assert.equal((src.match(/<iframe key=/g) || []).length,2);
});
