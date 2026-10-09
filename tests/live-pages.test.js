import test from 'node:test';
import assert from 'node:assert/strict';
import { pagesCandidate, publicRepositories, probePages, buildManifest } from '../scripts/sync-public-pages.mjs';

const owner = { login: 'MichaelWave369' };
const fake = (id,name,attrs={}) => ({id,name,owner,private:false,archived:false,visibility:'public',has_pages:true,...attrs});
const htmlHeaders = { get: name => name === 'content-type' ? 'text/html; charset=utf-8' : null };
const noHeaders = { get: () => 'application/json' };

test('rejects non-public, off-owner and non-Pages GitHub repositories',()=>{
  assert.ok(pagesCandidate(fake(1,'Page')));
  assert.equal(pagesCandidate(fake(2,'Secret',{private:true})),null);
  assert.equal(pagesCandidate(fake(3,'Hidden',{visibility:'private'})),null);
  assert.equal(pagesCandidate(fake(4,'Other',{owner:{login:'SomeoneElse'}})),null);
  assert.equal(pagesCandidate(fake(5,'Archived',{archived:true})),null);
  assert.equal(pagesCandidate(fake(6,'NotPages',{has_pages:false})),null);
  assert.equal(pagesCandidate(fake(7,'bad/name')),null);
});
test('detects root-user Pages repository URL correctly',()=>{
  assert.equal(pagesCandidate(fake(1,'michaelwave369.github.io')).url,'https://michaelwave369.github.io/');
  assert.equal(pagesCandidate(fake(1,'SuperPhiVessel')).url,'https://michaelwave369.github.io/SuperPhiVessel/');
});
test('only counts available HTTPS HTML sites',async()=>{
  assert.deepEqual(await probePages('https://example.test/',async()=>({ok:true,status:200,url:'https://example.test/',headers:htmlHeaders})),{reachable:true,url:'https://example.test/'});
  assert.equal((await probePages('https://example.test/',async()=>({ok:true,status:200,url:'https://example.test/',headers:noHeaders}))).reachable,false);
  assert.equal((await probePages('https://example.test/',async()=>({ok:false,status:404,url:'https://example.test/',headers:htmlHeaders}))).reachable,false);
});
test('GET fallback on HEAD 405 can detect verified HTML',async()=>{
  const calls=[];
  const verified=await probePages('https://example.test/',async (_,{method})=>{
    calls.push(method);
    return method==='HEAD' ? {ok:false,status:405,headers:noHeaders} : {ok:true,status:200,url:'https://example.test/',headers:htmlHeaders};
  });
  assert.equal(verified.reachable,true);
  assert.deepEqual(calls,['HEAD','GET']);
});
test('build emits verified websites but never publishes stale/broken or private repos',async()=>{
  const repos=[fake(1,'Alpha'),fake(2,'Broken'),fake(3,'Secret',{private:true})];
  const mock=async (url,options)=>{
    if(url.startsWith('https://api.github.com/users/')) return {ok:true,json:async()=>repos};
    if(url.endsWith('/Broken/')) return {ok:false,status:404,url,headers:htmlHeaders};
    return {ok:true,status:200,url,headers:htmlHeaders};
  };
  const manifest=await buildManifest({fetcher:mock});
  assert.equal(manifest.publicly_listed_repos,3);
  assert.equal(manifest.pages_enabled,2);
  assert.equal(manifest.verified_count,1);
  assert.deepEqual(manifest.pages.map(x=>x.repo),['Alpha']);
  assert.ok(manifest.pages.every(x=>x.verified && !x.private));
});
