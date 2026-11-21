import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  demoGraph, sourceGraph, diffusionStep, exciteNode, graphNeighbors, safeRepo
} from '../public/experiment-lab/model.js';
import { experimentLabUrl } from '../src/experiment-lab-link.js';

const snapshot = {
  schema_version:1,owner:'MichaelWave369',complete:false,
  repositories:[{
    id:1234,repo:'Agentora',isPublic:true,
    description:'Example public-source dossier.',
    createdAt:'2026-10-01T00:00:00Z',
    pushedAt:'2026-11-01T00:00:00Z',
    milestones:[{kind:'merged-pr',number:5,title:'Merge example',date:'2026-10-20T00:00:00Z'}]
  }]
};

test('R9 sample graph is deterministic and labeled synthetic',()=>{
  const a=demoGraph(),b=demoGraph();
  assert.deepEqual(a,b);
  assert.equal(a.nodes.length,12);
  assert.equal(a.edges.length,18);
  assert.equal(a.kind,'simulation');
  assert.ok(a.notice.includes('Synthetic'));
  assert.deepEqual(graphNeighbors(a,'n0').sort(),['n1','n11','n6'].sort());
});

test('diffusion is deterministic and conservative without decay',()=>{
  const graph=demoGraph(), start=Array(12).fill(0);
  start[0]=1;
  const a=diffusionStep(graph,start,{k:.6,dt:.06,decay:0});
  const b=diffusionStep(graph,start,{k:.6,dt:.06,decay:0});
  assert.deepEqual(a,b);
  assert.ok(a[0]<1 && a[1]>0 && a[6]>0);
  assert.ok(Math.abs(a.reduce((x,y)=>x+y,0)-1)<1e-10);
  assert.ok(a.every(x=>x>=0 && x<=1));
  assert.deepEqual(exciteNode(graph,start,'n5')[5],.85);
  assert.deepEqual(exciteNode(graph,start,'missing'),start);
  assert.throws(()=>diffusionStep({kind:'source',nodes:[],edges:[]},[],{}));
});

test('source view only renders validated public observations, not guessed links',()=>{
  const graph=sourceGraph(snapshot,'Agentora');
  assert.ok(graph);
  assert.equal(graph.kind,'source');
  assert.equal(graph.nodes.length,4);
  assert.equal(graph.edges.length,3);
  assert.ok(graph.edges.every(e=>e.kind==='documents'));
  assert.equal(graph.nodes.find(n=>n.id==='pr:5').evidenceUrl,
    'https://github.com/MichaelWave369/Agentora/pull/5');
  assert.ok(graph.notice.includes('not code dependency'));
  assert.equal(sourceGraph({...snapshot,owner:'Impostor'},'Agentora'),null);
  assert.equal(sourceGraph({...snapshot,repositories:[{...snapshot.repositories[0],isPublic:false}]},'Agentora'),null);
  assert.equal(sourceGraph({...snapshot,repositories:[snapshot.repositories[0],snapshot.repositories[0]]},'Agentora'),null);
  assert.equal(sourceGraph(snapshot,'../../secrets'),null);
  assert.equal(safeRepo('safe?redirect=evil'),false);
});

test('source view excludes unsafe or invented events',()=>{
  const modified=structuredClone(snapshot);
  modified.repositories[0].milestones.push({kind:'merged-pr',number:0,date:'2026-10-01',title:'Bogus'});
  modified.repositories[0].milestones.push({kind:'merged-pr',number:5,date:'2026-10-01',title:'Duplicate'});
  modified.repositories[0].milestones.push({kind:'merged-pr',number:7,date:'nope',title:'Invalid'});
  const graph=sourceGraph(modified,'Agentora');
  assert.equal(graph.nodes.length,4);
  assert.equal(sourceGraph(snapshot,'Unknown'),null);
});

test('dossier link stays same-origin and avoids arbitrary redirects',()=>{
  assert.equal(experimentLabUrl('https://michaelwave369.github.io/FieldAtlas/?dossier=BTM','Agentora'),
    'https://michaelwave369.github.io/FieldAtlas/experiment-lab/?repo=Agentora');
  assert.equal(experimentLabUrl('http://localhost:5173/','FieldAtlas'),
    'http://localhost:5173/experiment-lab/?repo=FieldAtlas');
  assert.equal(experimentLabUrl('https://example.org/FieldAtlas/index.html','Agentora'),
    'https://example.org/FieldAtlas/experiment-lab/?repo=Agentora');
  assert.equal(experimentLabUrl('javascript:alert(1)','Agentora'),null);
  assert.equal(experimentLabUrl('https://example.org/','bad/name'),null);
});

test('existing reader remains unchanged and only adds an opt-in full-tab lab entry',()=>{
  const ui=readFileSync('src/LivingEncyclopedia.jsx','utf8');
  const html=readFileSync('public/experiment-lab/index.html','utf8');
  const js=readFileSync('public/experiment-lab/lab.js','utf8');
  assert.ok(ui.includes('Explore in Lab (experimental)'));
  assert.ok(ui.includes('Read live chapter'));
  assert.ok(ui.includes('Locate in Constellation'));
  assert.ok(html.includes('Return to the Living Book'));
  assert.ok(html.includes('Synthetic network'));
  assert.ok(html.includes('Public source evidence'));
  assert.ok(js.includes("fetch('../encyclopedia.json'"));
  assert.ok(!html.includes('<iframe'));
  assert.ok(!js.includes('localStorage'));
});
