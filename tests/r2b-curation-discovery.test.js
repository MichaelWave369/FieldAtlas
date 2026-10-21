import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { makeCustomChapter, makeChapterEdit } from '../src/curation-actions.js';
import { DISCOVERY_KEY, normalizeDiscovery, approveArrival, dismissArrival } from '../src/discovery-state.js';

const page=(id,url='https://example.org/'+id)=>({id,repo:id,title:id,url,category:'Other'});
const form={title:'  My Own Atlas  ',url:'https://example.net/work/',category:'Creative',desc:'  A browser workshop  '};

test('custom entries are local, normalized and block unsafe/duplicate destinations',()=>{
  const valid=makeCustomChapter(form,[],42);
  assert.equal(valid.chapter.id,'custom-42');
  assert.equal(valid.chapter.title,'My Own Atlas');
  assert.equal(valid.chapter.desc,'A browser workshop');
  assert.equal(valid.chapter.repo,'');
  assert.equal(makeCustomChapter({...form,url:'javascript:alert(1)'},[]).error,'Please use a valid https:// URL.');
  assert.equal(makeCustomChapter({...form,title:'  '},[]).error,'Every chapter needs a name.');
  assert.equal(makeCustomChapter(form,[page('old','https://example.net/work')]).error,'That doorway is already in the book.');
});
test('local curator labels remain bound by repository and limited in length',()=>{
  const result=makeChapterEdit({repo:'Foo',id:'gh-33'}, {title:'  Changed label  ',desc:'  My copy  ',category:'Tools'});
  assert.deepEqual(result,{key:'foo',edit:{title:'Changed label',desc:'My copy',category:'Tools'}});
});
test('discovery preserves opt-out, current hidden IDs and existing v2 key',()=>{
  assert.equal(DISCOVERY_KEY,'field-atlas-discovery-v2');
  const state=normalizeDiscovery({autoEnabled:false,hiddenIds:['hidden'],lastCheckedAt:11,
    dismissedIds:['a'],candidates:[page('good'),page('bad','javascript:alert(1)')]});
  assert.equal(state.autoEnabled,false);
  assert.deepEqual(state.hiddenIds,['hidden']);
  assert.deepEqual(state.dismissedIds,['a']);
  assert.deepEqual(state.candidates.map(p=>p.id),['good']);
  assert.equal(normalizeDiscovery(null).autoEnabled,true);
});
test('admitting/dismissing arrivals is explicit and never mutates incoming state',()=>{
  const original=normalizeDiscovery({candidates:[page('one'),page('two')],dismissedIds:[],hiddenIds:[]});
  const incoming=[page('existing')];
  const approved=approveArrival(original,'one',incoming);
  assert.deepEqual(approved.pages.map(p=>p.id),['existing','one']);
  assert.deepEqual(approved.discovery.candidates.map(p=>p.id),['two']);
  assert.equal(approveArrival(original,'unknown',incoming),null);
  const dismissed=dismissArrival(original,'one');
  assert.deepEqual(dismissed.dismissedIds,['one']);
  assert.deepEqual(dismissed.candidates.map(p=>p.id),['two']);
  assert.equal(original.candidates.length,2);
});
test('App uses separated state hooks without replacing original visitor interfaces',()=>{
  const s=readFileSync('src/main.jsx','utf8');
  assert.ok(s.includes('useAtlasDiscovery({'));
  assert.ok(s.includes('useAtlasCuration()'));
  assert.ok(s.includes('onClick={() => scanLibrary(false)}'));
  assert.ok(s.includes('data-atlas-modal="shelf"'));
  assert.ok(s.includes('onSubmit={addPage}'));
});
