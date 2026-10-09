import test from 'node:test';
import assert from 'node:assert/strict';
import { seedPages, safeUrl, uniqueMerge, githubPagesUrl, makeDiscoveredPage, wingForCategory, wings, inferCategory, newArrivals, shouldAutoDiscover, DISCOVERY_INTERVAL_MS, discoverGithubPages } from '../src/catalog.js';

test('starter entries have valid secure URLs and unique IDs', () => {
  assert.equal(new Set(seedPages.map(p => p.id)).size, seedPages.length);
  assert.ok(seedPages.every(p => safeUrl(p.url)?.startsWith('https://')));
});
test('rejects dangerous or malformed URLs', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,a', 'file:///secret', 'http://example.org', 'not a url']) assert.equal(safeUrl(value), null);
  assert.ok(safeUrl('https://github.io/example'));
  assert.ok(safeUrl('http://localhost:5173'));
});
test('dedupes discovered entries by URL and ID', () => {
  const entry = { ...seedPages[0], id: 'duplicate', url: seedPages[0].url.replace(/\/$/, '') };
  assert.equal(uniqueMerge(seedPages, [entry]).length, seedPages.length);
});
test('discovers owner GitHub Pages URLs safely', () => {
  const r = makeDiscoveredPage({ id: 44, name: 'CoolRepo', description: 'A site', homepage: '', has_pages: true });
  assert.equal(r.url, 'https://michaelwave369.github.io/CoolRepo/');
  assert.equal(githubPagesUrl({ name: 'CoolRepo', homepage: 'https://michaelwave369.github.io/CoolRepo/' }), r.url);
});

test('places seeded projects into explicit library wings', () => {
  assert.deepEqual(wings.map(w => w.id), ['all', 'research', 'creative', 'engineering', 'games', 'annex']);
  assert.equal(wingForCategory('Research'), 'research');
  assert.equal(wingForCategory('Creative'), 'creative');
  assert.equal(wingForCategory('Intelligence'), 'engineering');
  assert.equal(wingForCategory('Systems'), 'engineering');
  assert.equal(wingForCategory('Tools'), 'engineering');
  assert.equal(wingForCategory('Games'), 'games');
  assert.equal(wingForCategory('Other'), 'annex');
  assert.equal(inferCategory('NestedBubbleGear'), 'Research');
  assert.equal(inferCategory('Domistika'), 'Creative');
});

test('new arrivals exclude curated chapters, declined repos and repeated suggestions', () => {
  const a = makeDiscoveredPage({ id: 1234, name: 'FreshStudio', description: 'Something colorful' });
  const b = makeDiscoveredPage({ id: 4567, name: 'HiddenApp', description: '' });
  assert.deepEqual(newArrivals([a, a, b], seedPages, [b.id]).map(p => p.id), [a.id]);
  assert.deepEqual(newArrivals([a], [{...a,id:'different-id'}]).length, 0);
  assert.equal(uniqueMerge(seedPages, [makeDiscoveredPage({id:123, name:'Domistika',homepage:''})]).length, seedPages.length);
});

test('daily read-only scan honors the 24-hour cooldown', () => {
  const now = 1_800_000_000_000;
  assert.equal(shouldAutoDiscover(0, now), true);
  assert.equal(shouldAutoDiscover(now - DISCOVERY_INTERVAL_MS + 1, now), false);
  assert.equal(shouldAutoDiscover(now - DISCOVERY_INTERVAL_MS, now), true);
});

test('GitHub discovery returns ONLY public, owner-matching, Pages-enabled repos', async () => {
  const calls = [];
  const get = async url => {
    calls.push(url);
    return {
      ok: true,
      json: async () => [
        {id: 1, name:'OpenArt', owner:{login:'MichaelWave369'}, has_pages:true, private:false, visibility:'public', archived:false},
        {id: 2, name:'PrivateThing', owner:{login:'MichaelWave369'}, has_pages:true, private:true, visibility:'private', archived:false},
        {id: 3, name:'OtherPerson', owner:{login:'other'}, has_pages:true, private:false, archived:false},
        {id: 4, name:'Archived', owner:{login:'MichaelWave369'}, has_pages:true, private:false, archived:true},
        {id: 5, name:'NoPages', owner:{login:'MichaelWave369'}, has_pages:false, private:false, archived:false},
      ],
    };
  };
  const found = await discoverGithubPages('MichaelWave369', get);
  assert.deepEqual(found.map(x=>x.repo), ['OpenArt']);
  assert.equal(calls.length, 1);
  assert.ok(calls[0].startsWith('https://api.github.com/users/MichaelWave369/repos?'));
});

test('stops discovery safely on GitHub errors without suggesting any site', async () => {
  await assert.rejects(discoverGithubPages('MichaelWave369', async () => ({ok:false,status:403})), /403/);
  await assert.rejects(discoverGithubPages('invalid/owner', async () => ({ok:true,json:async()=>[]})), /Invalid GitHub owner/);
});
