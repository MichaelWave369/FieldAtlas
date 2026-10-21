import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { findFieldThreads } from '../src/field-threads.js';

const chapter=(id,title,category,desc='',url='https://example.org/'+id+'/')=>({
  id,title,repo:id,category,desc,url,
});

test('same-category peers are recommended with an accurate categorical reason',()=>{
  const current=chapter('a','Dream Machine','Research','A study of adaptive memory');
  const others=[current,chapter('b','Knowledge Ledger','Research','Experiment report'),
    chapter('c','Purple Workshop','Creative','Painting for artists')];
  const results=findFieldThreads(current,others);
  assert.deepEqual(results.map(result=>result.page.id),['b']);
  assert.equal(results[0].reason,'Same category: Research');
  assert.equal(results[0].reasonKind,'category');
});

test('cross-room projects with matching meaningful title words can connect',()=>{
  const current=chapter('a','Dream Canvas','Creative','Brush strokes and patterns');
  const others=[current,chapter('b','Dream Protocol','Systems','Protocol design'),
    chapter('c','Unrelated Library','Games','A game with levels')];
  const results=findFieldThreads(current,others);
  assert.equal(results.length,1);
  assert.equal(results[0].page.id,'b');
  assert.equal(results[0].reason,'Shared title theme: dream');
});

test('does not invent integrations for category Other or generic words',()=>{
  const current=chapter('a','Field Atlas','Other','An open digital project');
  const others=[current,chapter('b','Field Protocol','Other','Another digital project')];
  assert.deepEqual(findFieldThreads(current,others),[]);
});

test('never returns self, duplicate URLs, unsafe URLs, or fabricated entries',()=>{
  const current=chapter('a','Pixel Garden','Creative');
  const sameUrl=chapter('dup','Different View','Creative','','https://example.org/a/');
  const pages=[current,sameUrl,chapter('b','Pixel Sculpture','Creative'),
    chapter('same','Mirror Copy','Creative','','https://example.org/b/'),
    chapter('unsafe','Pixel Registry','Creative','','javascript:alert(1)'),
    null,chapter('nourl','Pixel Art','Creative','','')];
  const results=findFieldThreads(current,pages);
  assert.deepEqual(results.map(x=>x.page.id),['b']);
  assert.equal(findFieldThreads(null,pages).length,0);
});

test('caps suggestions and has deterministic title tie-breaking and no source mutation',()=>{
  const active=chapter('a','Shared Exhibit','Creative');
  const peers=['Zeta','Alpha','Gamma','Beta','Delta','Kappa','Omega','Theta','Iota'].map(n=>chapter(n,n,'Creative'));
  const catalog=[active,...peers];
  const selected=findFieldThreads(active,catalog,5);
  assert.equal(selected.length,5);
  assert.deepEqual(selected.map(x=>x.page.title),['Alpha','Beta','Delta','Gamma','Iota']);
  assert.equal(findFieldThreads(active,catalog,99).length,8);
  assert.deepEqual(catalog.map(p=>p.title),['Shared Exhibit',...['Zeta','Alpha','Gamma','Beta','Delta','Kappa','Omega','Theta','Iota']]);
});

test('main reader connects the threads without altering passport until chapter opens',()=>{
  const app=readFileSync('src/main.jsx','utf8');
  const component=readFileSync('src/FieldThreads.jsx','utf8');
  assert.ok(app.includes('findFieldThreads(active, catalog, 5)'));
  assert.ok(app.includes('<FieldThreads active={active}'));
  assert.ok(app.includes('setPendingChapterId(page.id)'));
  assert.ok(app.includes('useAtlasPassport(active?.id)'));
  assert.ok(component.includes('onClick={() => onFollow(page)}'));
  assert.ok(component.includes('not verified technical integrations'));
});
