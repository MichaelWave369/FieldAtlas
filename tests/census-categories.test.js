import test from 'node:test';
import assert from 'node:assert/strict';
import { categories, wings, wingForCategory, seedPages } from '../src/catalog.js';
import { censusCategoryOverrides, censusCategoryForRepo } from '../src/census-categories.js';
import { curateProject, applyLocalEdits } from '../src/curation.js';

test('105-chapter census candidates are explicit and stable', () => {
  assert.equal(Object.keys(censusCategoryOverrides).length, 50);
  assert.equal(censusCategoryForRepo('  CHIPpydip  '), 'Music');
  assert.equal(censusCategoryForRepo('unknown-repo'), null);
  assert.equal(censusCategoryForRepo(null), null);
  assert.ok(Object.values(censusCategoryOverrides).every(category => categories.includes(category)));
});
test('new shelves still route to existing library rooms', () => {
  const expectations = {
    Publications: 'research', Learning: 'research',
    Music: 'creative', Galleries: 'creative',
    'People & Practice': 'annex',
    Intelligence: 'engineering', Systems: 'engineering', Tools: 'engineering',
    Creative: 'creative', Research: 'research', Games: 'games', Other: 'annex',
  };
  for (const [cat, wing] of Object.entries(expectations)) {
    assert.equal(wingForCategory(cat), wing, cat);
  }
  assert.deepEqual(wings.map(x => x.id), ['all', 'research', 'creative', 'engineering', 'games', 'annex']);
});
test('audited repo categories replace guesswork but not identifiers or URLs', () => {
  const known = [
    ['ChippyDip','Music'], ['InfiniteInterconnects','Systems'],
    ['FutureArchive','Galleries'], ['enter-the-field-research','Publications'],
    ['MoreBounceMethod','People & Practice'], ['The-MDF-Files','Creative'],
    ['PhiPie','Systems'], ['PhiScribe','Tools'],
    ['PhiFieldLab','Intelligence'], ['MythSplicer','Games'],
    ['FrontPorchAI','Learning'],
  ];
  for (const [repo, cat] of known) {
    const page = {id:'gh-99',repo,title:repo,url:'https://michaelwave369.github.io/'+repo+'/',desc:'Public site',category:'Other'};
    const curated = curateProject(page);
    assert.equal(curated.category, cat, repo);
    assert.equal(curated.id, page.id);
    assert.equal(curated.url, page.url);
  }
});
test('browser-local overrides and personal chapter entries retain authority', () => {
  const page = curateProject({id:'gh-99',repo:'ChippyDip',title:'ChippyDip',category:'Other',url:'https://example.com',desc:'Original'});
  assert.equal(page.category,'Music');
  const edited=applyLocalEdits(page,{chippydip:{category:'Creative',title:'My ChippyDip'}});
  assert.equal(edited.category,'Creative');
  assert.equal(edited.title,'My ChippyDip');
  assert.equal(edited.id,'gh-99');
  assert.equal(edited.url,'https://example.com');
  const custom={id:'custom-123',repo:'',category:'Other',title:'Private chapter',url:'https://example.com'};
  assert.equal(curateProject(custom),custom);
});
test('underdescribed chapters are left for manual investigation', () => {
  for(const repo of ['goldenjoy369','governance-drift-rsdc','Phiform','MuseVault']) {
    assert.equal(censusCategoryForRepo(repo),null);
  }
  assert.equal(censusCategoryForRepo('FieldAtlas'),null);
  assert.equal(curateProject(seedPages.find(x=>x.repo==='SuperPhiVessel')).category,'Intelligence');
});
