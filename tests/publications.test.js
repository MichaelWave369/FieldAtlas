import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { publicationChapters, researchRecordReferences, isPublicationChapter, createPublicationChapter } from '../src/publications.js';
import { uniqueMerge, seedPages, wingForCategory } from '../src/catalog.js';
import { curateProject, applyLocalEdits } from '../src/curation.js';
import { createCatalogAudit } from '../src/catalog-audit.js';

test('15 curated public research references form unique stable chapter URLs', () => {
  assert.equal(researchRecordReferences.length, 15);
  assert.equal(publicationChapters.length, 15);
  assert.equal(new Set(publicationChapters.map(p => p.id)).size, 15);
  assert.equal(new Set(publicationChapters.map(p => p.url)).size, 15);
  for (const p of publicationChapters) {
    assert.equal(p.category, 'Publications');
    assert.equal(p.doi, '10.5281/zenodo.' + p.repo.slice(7));
    assert.ok(/^https:\/\/zenodo\.org\/records\/\d+$/.test(p.url));
    assert.ok(p.title.trim().length > 5);
    assert.equal(wingForCategory(p.category), 'research');
    assert.equal(isPublicationChapter(p), true);
    assert.equal(curateProject(p), p);
    assert.equal(p.sourceKind, 'curated-research-record');
  }
  assert.equal(createPublicationChapter({id:'invalid'}),null);
});
test('published publication references appear even when browser cached older starter chapters', () => {
  const oldBook = [seedPages[0],seedPages[1]];
  const all=uniqueMerge(oldBook,publicationChapters);
  assert.equal(all.length,17);
  assert.deepEqual(all.slice(0,2),oldBook);
  assert.equal(uniqueMerge(all,publicationChapters).length,17);
  const report=createCatalogAudit(all, '2026-10-17T23:30:00Z');
  assert.equal(report.chapter_count,17);
  assert.equal(report.category_counts.Publications,15);
  assert.equal(report.review_count,0);
});
test('browser category choices still override public publication defaults', () => {
  const p=publicationChapters[0];
  const edited=applyLocalEdits(curateProject(p),{[p.repo]:{category:'Research',title:'My reading shelf'}});
  assert.equal(edited.category,'Research');
  assert.equal(edited.title,'My reading shelf');
  assert.equal(edited.url,p.url);
  assert.equal(edited.id,p.id);
  assert.equal(isPublicationChapter(edited),true);
});
test('bad or forged record objects do not activate publication display', () => {
  assert.equal(isPublicationChapter(null),false);
  assert.equal(isPublicationChapter({sourceKind:'curated-research-record',repo:'zenodo-123',url:'https://evil.example'}),false);
  assert.equal(isPublicationChapter({sourceKind:'curated-research-record',repo:'zenodo-123456',url:'https://evil.example'}),false);
  assert.equal(isPublicationChapter({sourceKind:'other',repo:'zenodo-22838612',url:'https://zenodo.org/records/22838612'}),false);
});
test('rendering and library wiring avoid recursive publication iframes', () => {
  const main=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
  const catalogSource=readFileSync(new URL('../src/atlas-catalog.js',import.meta.url),'utf8');
  assert.ok(catalogSource.includes('publicationChapters.filter(page => !hidden.has(page.id))'));
  assert.match(main,/publishedPages\.some\(p => p\.id === id\) \|\| publicationChapters\.some\(p => p\.id === id\)/);
  assert.match(main,/<PublicationLeaf page=\{active\}\/>/);
  assert.match(main,/<PublicationLeaf page=\{active\} fullscreen\/>/);
  assert.match(main,/publication \? 'Open Zenodo record'/);
});
