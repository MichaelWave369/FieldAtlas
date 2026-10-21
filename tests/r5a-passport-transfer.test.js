import test from 'node:test';
import assert from 'node:assert/strict';
import { makePassportBackup, readPassportBackup, mergePassportBackup, PASSPORT_TRANSFER_MAX_BYTES } from '../src/passport-transfer.js';
import { PASSPORT_KEY } from '../src/passport-storage.js';
import { readFileSync } from 'node:fs';

const current=[{id:'a'},{id:'b'},{id:'c'}];

test('portable passport preserves existing browser-local storage protocol',()=>{
  assert.equal(PASSPORT_KEY,'field-atlas-visitor-passport-v6');
  const backup=makePassportBackup(['a','c','a','unsafe<script>'], '2026-10-21T00:00:00.000Z');
  assert.equal(backup.kind,'field-atlas-visitor-passport');
  assert.equal(backup.version,1);
  assert.deepEqual(backup.visitedIds,['a','c']);
  assert.deepEqual(readPassportBackup(JSON.stringify(backup)),['a','c']);
});

test('import rejects malformed, oversized and mixed-type backups',()=>{
  assert.throws(()=>readPassportBackup('oops'),/JSON/);
  assert.throws(()=>readPassportBackup(JSON.stringify({kind:'unknown',version:1,visitedIds:[]})),/Unsupported/);
  assert.throws(()=>readPassportBackup(JSON.stringify({kind:'field-atlas-visitor-passport',version:2,visitedIds:[]})),/Unsupported/);
  assert.throws(()=>readPassportBackup(JSON.stringify({kind:'field-atlas-visitor-passport',version:1,visitedIds:['a',3]})),/Unsupported/);
  assert.throws(()=>readPassportBackup(' '.repeat(PASSPORT_TRANSFER_MAX_BYTES+1)),/too large/);
});

test('merge retains local first-visit order and never admits unavailable chapters',()=>{
  const imported=readPassportBackup(JSON.stringify(makePassportBackup(['c','b','hidden','a'])));
  assert.deepEqual(mergePassportBackup(['a'],imported,current),{
    visitedIds:['a','c','b'],added:2,skipped:1,
  });
  assert.deepEqual(mergePassportBackup(['a'],[],current),{
    visitedIds:['a'],added:0,skipped:0,
  });
  assert.deepEqual(mergePassportBackup([],['a','b'],[]).visitedIds,[]);
});

test('the original reader owns imported visits and keeps chapter choice unchanged',()=>{
  const main=readFileSync('src/main.jsx','utf8');
  const hook=readFileSync('src/hooks/useAtlasPassport.js','utf8');
  assert.ok(main.includes('useAtlasPassport(active?.id)'));
  assert.ok(main.includes('readPassportBackup(await file.text())'));
  assert.ok(main.includes('importVisitedChapters(imported, catalog)'));
  assert.ok(main.includes('makePassportBackup(visitedChapters)'));
  assert.ok(hook.includes('mergePassportBackup('));
});
