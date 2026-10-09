import test from 'node:test';
import assert from 'node:assert/strict';
import { curateProject, inferProjectCategory, applyLocalEdits, projectOverrides, categoryPalette } from '../src/curation.js';
import { wings, wingForCategory, seedPages, makeDiscoveredPage } from '../src/catalog.js';

test('public metadata maps research, creative and tool projects into appropriate wings', () => {
  const cases = [
    ['particleforge369', 'Research', 'research'],
    ['datacenter-ledger-explorer', 'Research', 'research'],
    ['schumann-live-react', 'Research', 'research'],
    ['infinitylens369', 'Creative', 'creative'],
    ['mictek-house', 'Creative', 'creative'],
    ['ravedial-archive-explorer', 'Creative', 'creative'],
    ['phioffice369', 'Tools', 'engineering'],
    ['FamilyVault', 'Tools', 'engineering'],
    ['PorchQuest369', 'Games', 'games'],
    ['Vibe', 'Systems', 'engineering'],
  ];
  for (const [repo, category, room] of cases) {
    const got = curateProject({ id: 'gh-1', repo, title: repo, category: 'Other', url: 'https://example.org/', desc: 'Public app' });
    assert.equal(got.category, category, repo);
    assert.equal(wingForCategory(got.category), room, repo);
  }
  assert.equal(wings.length, 6);
});

test('curation preserves original story text for highlighted starter projects', () => {
  const original = seedPages[0];
  assert.equal(curateProject(original), original);
  assert.equal(curateProject({id:'custom-12',repo:'',category:'Creative',title:'My page'}).title, 'My page');
});

test('new discovered projects use the public curator without changing URLs', () => {
  const raw = { id: 876, name: 'PorchQuest369', description: 'A public fantasy role-playing game', homepage: '', has_pages: true };
  const chapter = makeDiscoveredPage(raw);
  assert.equal(chapter.title, 'PorchQuest369');
  assert.equal(chapter.category, 'Games');
  assert.equal(chapter.url, 'https://michaelwave369.github.io/PorchQuest369/');
  assert.equal(chapter.repo, raw.name);
  assert.ok(chapter.coverTone);
});

test('conservative category fallback leaves unknown abbreviations unclassified', () => {
  assert.equal(inferProjectCategory('XYZ_undocumented_000'), 'Other');
  assert.equal(inferProjectCategory('GenerousTool', 'An expense tracker'), 'Tools');
  assert.ok(Object.keys(projectOverrides).length > 30);
});

test('local editor only changes display metadata, keeps URL, ID and repo untouched', () => {
  const input = { id:'gh-2', repo:'particleforge369', url:'https://example.org/', title:'ParticleForge', category:'Research', desc:'Public research' };
  const output = applyLocalEdits(input, {particleforge369:{title:'Personal Study',category:'Creative',desc:'My preferred title'}});
  assert.deepEqual([output.title,output.category,output.desc], ['Personal Study','Creative','My preferred title']);
  assert.deepEqual([output.url,output.id,output.repo],[input.url,input.id,input.repo]);
  assert.equal(output.coverGlyph, categoryPalette.Creative.glyph);
});

test('bad or unexpectedly typed local edits do not break the published project', () => {
  const input = { id:'gh-2', repo:'foo', url:'https://example.org/', title:'Foo',category:'Research', desc:'Note' };
  const output = applyLocalEdits(input, {foo:{title:'  ',category:'Invalid',desc:123}});
  assert.equal(output.title,'Foo');
  assert.equal(output.category,'Research');
  assert.equal(output.desc,'Note');
});
