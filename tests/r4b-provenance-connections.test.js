import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DOCUMENTED_CONNECTIONS, CONNECTION_STATUS, CONNECTION_REVIEW_DATE } from '../src/documented-connections.js';
import { CONNECTION_KINDS, resolveDocumentedConnections, validateDocumentedConnection } from '../src/provenance-connections.js';

const page=(repo,id=repo)=>({id,title:repo,repo,category:'Creative',url:'https://michaelwave369.github.io/'+repo+'/'});

test('reviewed registry uses citation-pinned GitHub evidence and explicit documentary status',()=>{
  assert.equal(CONNECTION_STATUS,'DOCUMENTED_NOT_RUNTIME_VERIFIED');
  assert.equal(CONNECTION_REVIEW_DATE,'2026-10-21');
  assert.ok(DOCUMENTED_CONNECTIONS.length>=4);
  assert.equal(new Set(DOCUMENTED_CONNECTIONS.map(x=>x.id)).size,DOCUMENTED_CONNECTIONS.length);
  assert.ok(DOCUMENTED_CONNECTIONS.every(validateDocumentedConnection));
  assert.equal(Object.keys(CONNECTION_KINDS).length,3);
});

test('reject evidence with mutable references, arbitrary domains or unknown types',()=>{
  const source=DOCUMENTED_CONNECTIONS[0];
  assert.equal(validateDocumentedConnection({...source,evidenceUrl:'https://evil.example/proof'}),false);
  assert.equal(validateDocumentedConnection({...source,evidenceUrl:'https://github.com/MichaelWave369/FieldAtlas/blob/main/README.md#L3'}),false);
  assert.equal(validateDocumentedConnection({...source,kind:'certified-live'}),false);
  assert.equal(validateDocumentedConnection({...source,toRepo:source.fromRepo}),false);
  assert.equal(validateDocumentedConnection(null),false);
});

test('only source-backed edges with both accessible endpoints are visible',()=>{
  const field=page('FieldAtlas'),future=page('FutureArchive');
  assert.deepEqual(resolveDocumentedConnections(field,[field]).map(x=>x.id),[]);
  const result=resolveDocumentedConnections(field,[field,future]);
  assert.deepEqual(result.map(x=>x.id),['atlas-future-archive','future-archive-atlas']);
  assert.deepEqual(result.map(x=>x.direction),['outbound','inbound']);
  assert.ok(result.every(x=>x.status===CONNECTION_STATUS));
  assert.equal(result[0].page.id,future.id);
  assert.deepEqual(resolveDocumentedConnections(future,[field,future]).map(x=>x.direction),['inbound','outbound']);
});

test('handoff direction is not reversed and unlisted projects get no asserted evidence',()=>{
  const dom=page('Domistika'),aur=page('Auralith369'),louvre=page('SiliconLouvre');
  const derived=resolveDocumentedConnections(dom,[dom,aur,louvre]);
  assert.deepEqual(derived.map(x=>[x.page.repo,x.direction]),[
    ['Auralith369','outbound'],['SiliconLouvre','inbound'],
  ]);
  const custom=page('UnknownProject');
  assert.deepEqual(resolveDocumentedConnections(custom,[dom,aur,louvre,custom]),[]);
});

test('deduplicates reviewed records and never exposes unsafe or inaccessible chapters',()=>{
  const dom=page('Domistika'),aur=page('Auralith369');
  const record=DOCUMENTED_CONNECTIONS.find(x=>x.id==='domistika-auralith');
  assert.equal(resolveDocumentedConnections(dom,[dom,aur],[record,record]).length,1);
  assert.equal(resolveDocumentedConnections(dom,[dom,{...aur,url:'javascript:alert(1)'}],[record]).length,0);
  assert.equal(resolveDocumentedConnections(dom,[dom,aur].filter(p=>p.repo!=='Domistika'),[record]).length,0);
});

test('documented links render separately from the heuristic constellation',()=>{
  const main=readFileSync('src/main.jsx','utf8');
  const component=readFileSync('src/FieldThreads.jsx','utf8');
  assert.ok(main.includes('resolveDocumentedConnections(active, catalog)'));
  assert.ok(main.includes('documentedConnections={documentedConnections}'));
  assert.ok(component.includes('DOCUMENTED CONNECTIONS'));
  assert.ok(component.includes('Evidence:'));
  assert.ok(component.includes('Documented, not live-tested'));
  assert.ok(component.includes('not verified technical integrations'));
  assert.ok(component.includes('onClick={() => onFollow(connection.page)}'));
});
