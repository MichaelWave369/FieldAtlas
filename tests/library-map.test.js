import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { wings, seedPages, wingForCategory } from '../src/catalog.js';
import { getAtlasMapRooms, getMapChapterWing, canEnterMapRoom, mapRoomPositions } from '../src/library-map.js';

test('map uses exactly six existing library wing definitions, including the central atrium', () => {
  assert.equal(wings.length,6);
  const rooms=getAtlasMapRooms(wings,seedPages);
  assert.deepEqual(rooms.map(x=>x.id),wings.map(x=>x.id));
  assert.equal(rooms.find(x=>x.id==='all').position,'atrium');
  assert.equal(rooms.find(x=>x.id==='all').count,seedPages.length);
  assert.deepEqual(Object.keys(mapRoomPositions).sort(),wings.map(w=>w.id).sort());
});

test('real catalog categories drive room counts without double-counting between wings', () => {
  const catalog=[
    {id:'a',title:'Research Lab',category:'Research'},
    {id:'b',title:'Painting',category:'Creative'},
    {id:'c',title:'AI Agent',category:'Intelligence'},
    {id:'d',title:'Game',category:'Games'},
    {id:'e',title:'Unknown',category:'Other'},
    {id:'f',title:'A Bridge',category:'Systems'},
  ];
  const rooms=getAtlasMapRooms(wings,catalog);
  assert.equal(rooms.find(x=>x.id==='all').count,6);
  assert.equal(rooms.find(x=>x.id==='research').count,1);
  assert.equal(rooms.find(x=>x.id==='creative').count,1);
  assert.equal(rooms.find(x=>x.id==='engineering').count,2);
  assert.equal(rooms.find(x=>x.id==='games').count,1);
  assert.equal(rooms.find(x=>x.id==='annex').count,1);
  assert.equal(rooms.filter(x=>x.id!=='all').reduce((sum,x)=>sum+x.count,0),6);
});

test('preview books are a bounded selection of existing pages only', () => {
  const catalog=Array.from({length:21},(_,i)=>({id:'r'+i,title:'Research '+i,category:'Research'}));
  const rooms=getAtlasMapRooms(wings,catalog,['r0','r2','r20']);
  assert.deepEqual(rooms.find(x=>x.id==='research').previews.map(x=>x.id),['r0','r1','r2']);
  assert.equal(rooms.find(x=>x.id==='research').visitedCount,3);
  assert.equal(rooms.find(x=>x.id==='all').visitedCount,3);
  assert.ok(rooms.every(x=>x.previews.length<=3));
});

test('unavailable wings are not marked enterable and unknown categories map to Annex', () => {
  const rooms=getAtlasMapRooms(wings,[]);
  assert.ok(rooms.every(r=>!canEnterMapRoom(r)));
  assert.equal(canEnterMapRoom({count:1}),true);
  assert.equal(canEnterMapRoom({count:0}),false);
  assert.equal(canEnterMapRoom(null),false);
  assert.equal(getMapChapterWing({category:'Other'}),'annex');
  assert.equal(getMapChapterWing({category:'Tools'}),'engineering');
  assert.equal(getMapChapterWing({category:'Research'}),wingForCategory('Research'));
  assert.equal(getMapChapterWing(null),'all');
});

test('map is a dialog with native buttons and Escape/Tab handling', () => {
  const map=readFileSync('src/LibraryMap.jsx','utf8');
  assert.match(map,/role="dialog" aria-modal="true"/);
  assert.match(map,/event.key === 'Escape'/);
  assert.match(map,/event.key !== 'Tab'/);
  assert.match(map,/onClose\(\)/);
  assert.match(map,/onEnterWing\(room.id\)/);
  assert.match(map,/onOpenChapter\(page\)/);
  assert.match(map,/closeRef\.current\?\.focus\(\)/);
  assert.match(map,/querySelectorAll/);
  assert.match(map,/aria-hidden="true" focusable="false"/);
});

test('UI provides an easy map launcher while preserving the reader and focus mode', () => {
  const jsx=readFileSync('src/main.jsx','utf8');
  assert.match(jsx,/onClick=\{\(\) => setMapOpen\(true\)\}/);
  assert.match(jsx,/<LibraryMap wings=\{wings\} catalog=\{catalog\}/);
  assert.match(jsx,/setPendingChapterId\(page.id\)/);
  assert.match(jsx,/setWing\(getMapChapterWing\(page\)\)/);
  assert.match(jsx,/scrollToReader\(\)/);
  assert.match(jsx,/if \(portalOpen \|\| shelfOpen \|\| showHelp \|\| directoryOpen \|\| editorPage \|\| mapOpen\)/);
  assert.match(jsx,/reader-focus-mode/);
  assert.match(jsx,/id="living-book"/);
});

test('responsive floorplan remains usable with reduced motion and no external map dependencies', () => {
  const css=readFileSync('src/style.css','utf8');
  assert.match(css,/\.atlas-map-floorplan/);
  assert.match(css,/\.map-room-atrium/);
  assert.match(css,/@media\(max-width:620px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(readFileSync('src/LibraryMap.jsx','utf8'),/https?:\/\//);
});
