import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseEncyclopediaSnapshot } from '../src/encyclopedia-data.js';
import {
  createChronicleEvents, getChronicleStats, filterChronicleEvents,
  groupChronicleEvents, monthActivity, chronicleCrossroads, readChronicleQuery,
  chronicleShareUrl,
} from '../src/chronicle-data.js';

const raw=(repo,id,extra={})=>({
  repo,id,description:'Source record',isPublic:true,archived:false,
  createdAt:'2026-10-02T10:00:00Z',pushedAt:'2026-11-03T09:00:00Z',
  historyStatus:'checked',milestones:[{
    kind:'merged-pr',number:2,title:'Refactor navigation with evidence',
    date:'2026-11-01T11:00:00Z',commit:'a'.repeat(40),
  }],...extra,
});
const fixture=(items)=>parseEncyclopediaSnapshot({
  schema_version:1,owner:'MichaelWave369',complete:true,
  generated_at:'2026-11-05T16:00:00Z',repositories:items,
}).repositories;

test('cross-project chronology orders dated observations and merged PRs without claiming deployments',()=>{
  const records=fixture([
    raw('GMED',7),raw('PhiTriBrain369',8,{
      createdAt:'2026-11-05T10:00:00Z',pushedAt:'2026-11-05T13:00:00Z',
      milestones:[{kind:'merged-pr',number:14,title:'Reviewable evidence',
        date:'2026-11-05T11:00:00Z'}],
    }),
  ]);
  const events=createChronicleEvents(records);
  assert.equal(events.length,6);
  assert.equal(events[0].id,'8:pushed');
  assert.equal(events[1].id,'8:pr:14');
  assert.equal(events[2].id,'8:created');
  assert.equal(events.find(e=>e.id==='7:pr:2').evidenceUrl,'https://github.com/MichaelWave369/GMED/pull/2');
  assert.ok(events.filter(e=>e.kind==='created').every(e=>e.detail.includes('not necessarily')));
  assert.ok(events.filter(e=>e.kind==='pushed').every(e=>e.detail.includes('not a verified release')));
  assert.deepEqual(getChronicleStats(records,events),{
    repositories:2,created:2,merged:2,pushed:2,historyUnavailable:0,
  });
});

test('source URLs are reconstructed from public identity, never arbitrary supplied links',()=>{
  const records=fixture([raw('GMED',8)]);
  const unsafe={...records[0],sourceUrl:'javascript:alert(1)',milestones:[
    ...records[0].milestones,{kind:'merged-pr',number:44,title:'Malicious',date:'not a date'},
  ]};
  const events=createChronicleEvents([unsafe,unsafe,{...unsafe,isPublic:false},raw('bad/name',9)]);
  assert.equal(events.length,3);
  assert.ok(events.every(e=>e.evidenceUrl.startsWith('https://github.com/MichaelWave369/GMED')));
  assert.equal(events.filter(e=>e.kind==='merged').length,1);
});

test('filters, dates and sort preserve real chronological order',()=>{
  const records=fixture([
    raw('GMED',7),
    raw('BTM',9,{createdAt:'2025-12-09T08:00:00Z',pushedAt:'2026-11-02T09:00:00Z',
      milestones:[{kind:'merged-pr',number:10,title:'Controls fix',date:'2026-10-12T06:00:00Z'}]}),
  ]);
  const events=createChronicleEvents(records);
  assert.deepEqual(filterChronicleEvents(events,{repo:'gmed',kind:'merged'}).map(e=>e.id),['7:pr:2']);
  assert.deepEqual(filterChronicleEvents(events,{kind:'created',year:'2025'}).map(e=>e.id),['9:created']);
  assert.deepEqual(filterChronicleEvents(events,{search:'controls fix'}).map(e=>e.id),['9:pr:10']);
  assert.deepEqual(filterChronicleEvents(events,{month:'2026-10',kind:'merged'}).map(e=>e.id),['9:pr:10']);
  assert.deepEqual(filterChronicleEvents(events,{month:'2026-11',year:'2025'}),[]);
  assert.deepEqual(filterChronicleEvents(events,{month:'2026-99'}),[]);
  assert.equal(filterChronicleEvents(events,{order:'oldest'})[0].id,'9:created');
  const groups=groupChronicleEvents(filterChronicleEvents(events,{order:'newest'}));
  assert.deepEqual(groups.map(g=>g.month),['2026-11','2026-10','2025-12']);
  assert.deepEqual(monthActivity(events).map(g=>g.month),['2026-11','2026-10','2025-12']);
  assert.equal(groupChronicleEvents(events,2).reduce((sum,g)=>sum+g.items.length,0),2);
});

test('crossroads only show citation-pinned relations with both public endpoints, never fabricated dates',()=>{
  const records=fixture([
    raw('FieldAtlas',11),raw('FutureArchive',12),
    raw('Domistika',13),
  ]);
  const links=chronicleCrossroads(records);
  assert.deepEqual(links.map(l=>l.id),['atlas-future-archive','future-archive-atlas']);
  assert.ok(links.every(l=>l.dated===false && l.status==='DOCUMENTED_NOT_RUNTIME_VERIFIED'));
  assert.ok(links.every(l=>/^https:\/\/github\.com\/MichaelWave369\/\w+\/blob\/[a-f0-9]{40}\/README\.md#L\d+/.test(l.evidenceUrl)));
  assert.deepEqual(chronicleCrossroads(records.slice(0,1)),[]);
  assert.deepEqual(chronicleCrossroads(records,[{
    id:'fiction',fromRepo:'FieldAtlas',toRepo:'FutureArchive',
    kind:'navigation-link',summary:'Claimed',scope:'Unknown',evidenceUrl:'https://evil.example',
  }]),[]);
});

test('chronicle deep links reject duplicates and unsafe project names and strip unrelated chapter routes',()=>{
  assert.deepEqual(readChronicleQuery('?chronicle=GMED&chronicleKind=merged&chronicleMonth=2026-11'),
    {repo:'GMED',kind:'merged',month:'2026-11'});
  assert.deepEqual(readChronicleQuery('?chronicle=all'),{repo:'all',kind:'all',month:'all'});
  assert.equal(readChronicleQuery('?chronicle=GMED&chronicle=BTM'),null);
  assert.equal(readChronicleQuery('?chronicle=../../secret'),null);
  assert.deepEqual(readChronicleQuery('?chronicle=GMED&chronicleKind=unaudited&chronicleMonth=2026-99'),
    {repo:'GMED',kind:'all',month:'all'});
  assert.equal(chronicleShareUrl('javascript:alert(1)'),null);
  assert.equal(chronicleShareUrl('https://michaelwave369.github.io/FieldAtlas/',{repo:'bad/name'}),null);
  const link=chronicleShareUrl('https://michaelwave369.github.io/FieldAtlas/?chapter=BTM&tour=after-hours&project=github:8&dossier=GMED',
    {repo:'GMED',kind:'merged',month:'2026-11'});
  assert.equal(link,'https://michaelwave369.github.io/FieldAtlas/?chronicle=GMED&chronicleKind=merged&chronicleMonth=2026-11#field-chronicle');
});

test('R8 is a read-only lens over R7 snapshot, original book and passport remain available',()=>{
  const main=readFileSync('src/main.jsx','utf8');
  const ui=readFileSync('src/FieldChronicle.jsx','utf8');
  const r7=readFileSync('src/LivingEncyclopedia.jsx','utf8');
  assert.ok(main.includes('<FieldChronicle dossiers={encyclopedia.repositories}'));
  assert.ok(main.includes('<LivingEncyclopedia active={active}'));
  assert.ok(main.includes('useAtlasPassport(active?.id)'));
  assert.ok(main.includes('constellationChapterUrl(active,publishedPages)'));
  assert.ok(r7.includes('View in Chronicle'));
  assert.ok(ui.includes('documented, not independently live-tested'));
  assert.ok(ui.includes('filterChronicleEvents(events'));
  assert.ok(ui.includes('chronicleShareUrl(window.location.href'));
  assert.equal(fixture([raw('GMED',7)]).length,1);
});
