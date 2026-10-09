import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compassFilters, availableSurprises, pickSurpriseChapter, remainingSurpriseCount } from '../src/discovery-compass.js';
import { availableJourneyStops, visitorJourneys } from '../src/journeys.js';
import { wingForCategory } from '../src/catalog.js';

const page=(id,category,url='https://example.org/'+id)=>({id,title:'Book '+id,repo:'Repo'+id,category,url});
const sample=[page('r1','Research'),page('r2','Research'),page('c1','Creative'),page('g1','Games'),page('e1','Systems'),page('a1','Other')];

test('Grand Opening compass offers exactly the six established library filters',()=>{
  assert.deepEqual(compassFilters.map(x=>x.id),['all','research','creative','engineering','games','annex']);
  assert.ok(compassFilters.every(x=>x.title));
});

test('surprise filters use canonical wing categories and ignore invalid/local URLs',()=>{
  const input=[...sample,page('local','Research','http://localhost:3000'),page('unsafe','Research','javascript:alert(1)'),page('r1','Research')];
  assert.deepEqual(availableSurprises(input,'research').map(x=>x.id),['r1','r2']);
  assert.deepEqual(availableSurprises(input,'engineering').map(x=>x.id),['e1']);
  assert.deepEqual(availableSurprises(input,'games').map(x=>x.id),['g1']);
  assert.deepEqual(availableSurprises(input,'creative').map(x=>x.id),['c1']);
  assert.deepEqual(availableSurprises(input,'annex').map(x=>x.id),['a1']);
  assert.deepEqual(availableSurprises(input,'wrong'),[]);
  assert.equal(wingForCategory('Systems'),'engineering');
});

test('surprise picks unseen chapters before visited, and avoids active book',()=>{
  const got=pickSurpriseChapter(sample,{wing:'research',visitedIds:['r1'],currentId:'c1',random:()=>0.999999});
  assert.equal(got.id,'r2');
  const withoutCurrent=pickSurpriseChapter(sample,{wing:'research',visitedIds:[],currentId:'r1',random:()=>0});
  assert.equal(withoutCurrent.id,'r2');
  assert.equal(remainingSurpriseCount(sample,'research',['r1']),1);
});

test('when all entries are visited it still returns a safe available chapter',()=>{
  const found=pickSurpriseChapter(sample,{wing:'research',visitedIds:['r1','r2'],currentId:'r1',random:()=>0});
  assert.equal(found.id,'r2');
  const only=[page('one','Games')];
  assert.equal(pickSurpriseChapter(only,{wing:'games',currentId:'one'}).id,'one');
});

test('empty catalogs and unexpected random sources cannot crash the reader',()=>{
  assert.equal(pickSurpriseChapter([]),null);
  assert.equal(pickSurpriseChapter(sample,{wing:'nonexistent'}),null);
  assert.equal(pickSurpriseChapter(sample,{wing:'research',random:()=>NaN}).id,'r1');
  assert.equal(pickSurpriseChapter(sample,{wing:'research',random:()=>1}).id,'r2');
  assert.equal(pickSurpriseChapter(sample,{wing:'research',random:()=>-5}).id,'r1');
});

test('all journey routes resolve from existing public catalog only',()=>{
  const catalog=[
    {id:'v1',repo:'SuperPhiVessel',title:'Vessel',url:'https://example.org/v',category:'Intelligence'},
    {id:'f1',repo:'FieldAtlas',title:'Atlas',url:'https://example.org/f',category:'Tools'},
    {id:'p1',repo:'PhiOS',title:'OS',url:'https://example.org/p',category:'Systems'},
  ];
  const stops=availableJourneyStops(visitorJourneys[0],catalog);
  assert.deepEqual(stops.map(x=>x.id),['v1','f1','p1']);
  assert.equal(availableJourneyStops(visitorJourneys[3],catalog).length,0);
});

test('Discovery Compass only changes the existing reader and keeps the UI accessible',()=>{
  const app=readFileSync('src/main.jsx','utf8');
  assert.match(app,/pickSurpriseChapter\(catalog,/);
  assert.match(app,/setPendingChapterId\(discovered.id\)/);
  assert.match(app,/role="status">\{compassNotice\}/);
  assert.match(app,/disabled=\{!compassChoices.length\}/);
  assert.match(app,/aria-label="Discover another library chapter"/);
  assert.match(app,/aria-label="Interactive book of GitHub Pages websites"/);
  assert.match(app,/reader-focus-mode/);
  assert.match(app,/wrapChapterIndex\(index, delta, filtered.length\)/);
});

test('map explorer trails offer ordered clickable stops and live passport stamps',()=>{
  const map=readFileSync('src/LibraryMap.jsx','utf8');
  assert.match(map,/availableJourneyStops\(route, catalog\)/);
  assert.match(map,/visited\.has\(page.id\)/);
  assert.match(map,/getMapChapterWing\(page\)/);
  assert.match(map,/onStartTour\(route.id, page.repo\)/);
  assert.match(map,/onStartTour\(route.id, next.repo\)/);
  assert.match(map,/aria-label="Explorer's guided journeys"/);
  assert.match(map,/role="dialog" aria-modal="true"/);
  assert.doesNotMatch(map,/<iframe/);
});

test('styles keep the focus room, mobile compass, and map trail usable',()=>{
  const css=readFileSync('src/style.css','utf8');
  assert.match(css,/\.discovery-compass\{/);
  assert.match(css,/\.atlas-trails-grid\{/);
  assert.match(css,/\.reader-focus-mode \.discovery-compass\{/);
  assert.match(css,/@media\(max-width:460px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
