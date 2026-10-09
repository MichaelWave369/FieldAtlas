import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { visitorJourneys, findJourney, availableJourneyStops, readAtlasLink, buildAtlasLink, locateSharedChapter } from '../src/journeys.js';
import { seedPages } from '../src/catalog.js';

const page=(repo,id=repo)=>({id,repo,title:repo,url:'https://michaelwave369.github.io/'+repo+'/'});

test('four coherent public visitor routes are provided, with unique IDs',()=>{
  assert.equal(visitorJourneys.length,4);
  assert.equal(new Set(visitorJourneys.map(j=>j.id)).size,4);
  assert.ok(visitorJourneys.every(j=>j.repos.length>=4 && j.name && j.description));
  assert.equal(findJourney('unknown'),null);
});

test('tour stops only use available chapters, preserve order and ignore missing sites',()=>{
  const catalog=[page('FieldDeck'),page('FieldAtlas'),page('PhiOS'),page('SuperPhiVessel')];
  const stops=availableJourneyStops('first-light',catalog);
  assert.deepEqual(stops.map(p=>p.repo),['SuperPhiVessel','FieldAtlas','PhiOS','FieldDeck']);
  assert.deepEqual(availableJourneyStops('after-hours',catalog),[]);
  assert.deepEqual(availableJourneyStops('not-a-tour',catalog),[]);
  assert.deepEqual(availableJourneyStops('first-light',[]),[]);
});

test('matches tour chapters without duplicating case-varying repository entries',()=>{
  const catalog=[page('domistika'),page('Domistika','duplicate'),page('SiliconLouvre'),page('Auralith369')];
  const stops=availableJourneyStops('artists-lantern',catalog);
  assert.deepEqual(stops.map(p=>p.id),['domistika','SiliconLouvre','Auralith369']);
});

test('shareable links round trip and preserve GitHub Pages project path',()=>{
  const href='https://michaelwave369.github.io/FieldAtlas/?old=1&chapter=Old#note';
  const url=buildAtlasLink(href,'NestedBubbleGear','research-constellation');
  const parsed=new URL(url);
  assert.equal(parsed.pathname,'/FieldAtlas/');
  assert.equal(parsed.searchParams.get('old'),'1');
  assert.equal(parsed.searchParams.get('chapter'),'NestedBubbleGear');
  assert.equal(parsed.searchParams.get('tour'),'research-constellation');
  assert.equal(parsed.hash,'');
  assert.deepEqual(readAtlasLink(parsed.search),{chapter:'NestedBubbleGear',tour:'research-constellation'});
});

test('untrusted query strings cannot select arbitrary URLs or unknown tours',()=>{
  assert.deepEqual(readAtlasLink('?chapter=https%3A%2F%2Fevil.example&tour=foo'),{chapter:null,tour:null});
  assert.deepEqual(readAtlasLink('?chapter=PhiOS&tour=unknown'),{chapter:'PhiOS',tour:null});
  assert.deepEqual(readAtlasLink(''),{chapter:null,tour:null});
  assert.equal(new URL(buildAtlasLink('https://michaelwave369.github.io/FieldAtlas/?chapter=Old','javascript:alert(1)')).searchParams.has('chapter'),false);
});

test('shared chapter can only resolve to a page already in the accessible catalog',()=>{
  const matches=locateSharedChapter(seedPages,'PHIOS');
  assert.equal(matches?.repo,'PhiOS');
  assert.equal(locateSharedChapter(seedPages,'PrivateProject'),null);
});

test('visitor UI has deep-link hydration, readable passport and explicit share fallback',()=>{
  const jsx=readFileSync('src/main.jsx','utf8');
  assert.match(jsx,/readAtlasLink\(window\.location\.search\)/);
  assert.match(jsx,/availableJourneyStops\(link\.tour, catalog\)/);
  assert.match(jsx,/PASSPORT_KEY/);
  assert.match(jsx,/VISITOR'S DESK/);
  assert.match(jsx,/Share chapter/);
  assert.match(jsx,/Clipboard unavailable/);
});
