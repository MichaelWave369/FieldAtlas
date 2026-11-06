import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  publicDossierCandidate, mergedMilestones, buildEncyclopediaSnapshot,
} from '../scripts/sync-encyclopedia.mjs';
import {
  parseEncyclopediaSnapshot, readDossierQuery, findDossier, dossierTimeline,
  dossierConnections, dossierConstellationUrl, dossierShareUrl,
} from '../src/encyclopedia-data.js';

const owner = {login:'MichaelWave369'};
const raw=(repo,id,extra={})=>({
  owner,name:repo,id,private:false,visibility:'public',archived:false,fork:false,
  description:'Public owner repository',language:'JavaScript',
  created_at:'2026-10-01T00:00:00Z',pushed_at:'2026-11-01T00:00:00Z',...extra,
});
const pr=(number,merged_at='2026-11-04T12:00:00Z',extra={})=>({
  number, title:'Real merged update #'+number,merged_at,
  merge_commit_sha:'a'.repeat(40),...extra,
});

test('source candidates exclude private, foreign, invalid names and invalid identities',()=>{
  assert.equal(publicDossierCandidate(raw('GMED',99))?.repo,'GMED');
  assert.equal(publicDossierCandidate(raw('Private',88,{private:true})),null);
  assert.equal(publicDossierCandidate(raw('Foreign',77,{owner:{login:'OtherUser'}})),null);
  assert.equal(publicDossierCandidate(raw('..',77)),null);
  assert.equal(publicDossierCandidate(raw('bad/name',77)),null);
  assert.equal(publicDossierCandidate(raw('NoID',0)),null);
  assert.equal(publicDossierCandidate(raw('Archived',101,{archived:true}))?.archived,true);
});

test('merged PR history is factual, bounded, sorted, and excludes unmerged items',()=>{
  const values=mergedMilestones([pr(1),pr(2,'2026-11-05T00:00:00Z'),
    pr(3,null),pr(2),pr(4,'2026-11-02T00:00:00Z')]);
  assert.deepEqual(values.map(v=>v.number),[2,1,4]);
  assert.equal(values[0].commit,'a'.repeat(40));
  assert.equal(values[0].kind,'merged-pr');
});

test('deploy snapshot enumerates public repos and preserves unknown PR status',async ()=>{
  const calls=[];
  const fetcher=async url=>{
    calls.push(url);
    if(url.includes('/users/'))return {ok:true,json:async()=>[
      raw('GMED',5),raw('FieldAtlas',6),
      raw('Hidden',7,{private:true}),raw('Foreign',8,{owner:{login:'Another'}}),
    ]};
    if(url.includes('/GMED/pulls'))return {ok:true,json:async()=>[pr(2),pr(1,null)]};
    if(url.includes('/FieldAtlas/pulls'))throw new Error('Temporary upstream error');
    throw new Error('Unexpected request '+url);
  };
  const snap=await buildEncyclopediaSnapshot({fetcher,now:'2026-11-05T18:00:00Z'});
  assert.equal(snap.owner,'MichaelWave369');
  assert.equal(snap.complete,true);
  assert.equal(snap.repository_count,2);
  assert.deepEqual(snap.repositories.map(x=>x.repo),['FieldAtlas','GMED']);
  assert.equal(snap.repositories[0].historyStatus,'unavailable');
  assert.equal(snap.repositories[1].historyStatus,'checked');
  assert.equal(snap.repositories[1].milestones[0].number,2);
  assert.ok(calls.every(url=>!url.includes('/Hidden/')));
});

const source = (name,id)=>({
  id,repo:name,description:'Project description',language:'JavaScript',createdAt:'2026-10-01T00:00:00Z',
  pushedAt:'2026-11-01T00:00:00Z',isPublic:true,
  historyStatus:'checked',milestones:[{
    kind:'merged-pr',number:2,title:'Documented PR merge',
    date:'2026-10-27T00:00:00Z',commit:'b'.repeat(40),
  }],
});
function fixture(records=[source('FieldAtlas',11),source('FutureArchive',12)]) {
  return {schema_version:1,owner:'MichaelWave369',complete:true,
    generated_at:'2026-11-05T18:00:00Z',repositories:records};
}

test('reader rejects untrusted source metadata rather than promoting to a live book',()=>{
  const incoming=fixture([
    source('FieldAtlas',11),
    source('FieldAtlas',11),
    {...source('WrongOwner',19),isPublic:false},
    source('bad/name',20),
    {...source('Another',11),isPublic:true},
    {...source('GMED',99),description:'Z'.repeat(600)},
  ]);
  const parsed=parseEncyclopediaSnapshot(incoming);
  assert.deepEqual(parsed.repositories.map(x=>x.repo),['FieldAtlas','GMED']);
  assert.equal(parsed.repositories[1].description.length,300);
  assert.equal(parsed.repositories[0].sourceUrl,'https://github.com/MichaelWave369/FieldAtlas');
  assert.throws(()=>parseEncyclopediaSnapshot({...incoming,owner:'Another'}));
  assert.equal(findDossier(parsed.repositories,'fieldatlas')?.id,11);
  assert.equal(findDossier(parsed.repositories,'HiddenProject'),null);
});

test('source timeline and Constellation IDs link only public identities and actual PR numbers',()=>{
  const d=parseEncyclopediaSnapshot(fixture()).repositories[0];
  assert.equal(dossierTimeline(d).length,3);
  assert.deepEqual(dossierTimeline(d).map(x=>x.id),['pushed','pr-2','created']);
  assert.ok(dossierTimeline(d).find(e=>e.id==='pr-2').url.endsWith('/FieldAtlas/pull/2'));
  assert.equal(new URL(dossierConstellationUrl(d)).searchParams.get('repo'),'github:11');
  assert.equal(dossierConstellationUrl({...d,isPublic:false}),null);
  assert.equal(dossierShareUrl('https://michaelwave369.github.io/FieldAtlas/?chapter=BTM&tour=after-hours',d.repo),
    'https://michaelwave369.github.io/FieldAtlas/?dossier=FieldAtlas#living-encyclopedia');
  assert.equal(readDossierQuery('?dossier=PhiTriBrain369'),'PhiTriBrain369');
  assert.equal(readDossierQuery('?dossier=GMED&dossier=GMED'),null);
  assert.equal(readDossierQuery('?dossier=javascript%3Aalert(1)'),null);
});

test('relationships only come from commit-pinned documented evidence with two public endpoints',()=>{
  const records=parseEncyclopediaSnapshot(fixture()).repositories;
  const edges=dossierConnections(records[0],records);
  assert.deepEqual(edges.map(x=>x.id),['atlas-future-archive','future-archive-atlas']);
  assert.deepEqual(edges.map(x=>x.direction),['outbound','inbound']);
  assert.ok(edges.every(e=>e.evidenceUrl.includes('/blob/')));
  assert.equal(dossierConnections(records[0],[records[0]]).length,0);
  assert.equal(dossierConnections({...records[0],isPublic:false},records).length,0);
});

test('R7 is an added source wing, not a replacement for verified Pages or manual launch gates',()=>{
  const main=readFileSync('src/main.jsx','utf8');
  const ui=readFileSync('src/LivingEncyclopedia.jsx','utf8');
  const deploy=readFileSync('.github/workflows/deploy.yml','utf8');
  const ci=readFileSync('.github/workflows/ci.yml','utf8');
  assert.ok(main.includes('<LivingEncyclopedia active={active}'));
  assert.ok(main.includes('findDossier(encyclopedia.repositories,project.repo)'));
  assert.ok(ui.includes('No verified, accessible live chapter is implied'));
  assert.ok(ui.includes('sourceUrl'));
  assert.ok(ui.includes('constellationProjectId(p,publishedPages)'));
  assert.ok(deploy.includes('npm run encyclopedia:sync'));
  assert.ok(ci.includes('npm run encyclopedia:sync'));
  assert.ok(main.includes('constellationChapterUrl(active,publishedPages)'));
  assert.ok(main.includes('useAtlasPassport(active?.id)'));
  const fallback=JSON.parse(readFileSync('public/encyclopedia.json','utf8'));
  assert.equal(parseEncyclopediaSnapshot(fallback).repositories.length>=8,true);
  assert.equal(fallback.complete,false);
});
