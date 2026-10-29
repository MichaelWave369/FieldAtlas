import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { RECENT_FIELD_PROJECTS, selectRecentFieldProjects } from '../src/new-horizons.js';
import { inferProjectCategory, curateProject } from '../src/curation.js';
import { availableJourneyStops } from '../src/journeys.js';

test('only reviewed public source projects get spotlight cards', () => {
  assert.equal(RECENT_FIELD_PROJECTS.length, 9);
  assert.equal(new Set(RECENT_FIELD_PROJECTS.map(p=>p.repo.toLowerCase())).size, RECENT_FIELD_PROJECTS.length);
  for (const item of RECENT_FIELD_PROJECTS) {
    assert.equal(item.sourceUrl, 'https://github.com/MichaelWave369/'+item.repo);
    assert.ok(item.title && item.label && item.summary);
  }
});

test('a source-only card never guesses a live chapter or external site', () => {
  const choices=selectRecentFieldProjects([{id:'gh-4',repo:'BTM',title:'Break the Matrix',url:'https://michaelwave369.github.io/BTM/'}]);
  assert.equal(choices.length, 9);
  assert.equal(choices.find(v=>v.project.repo==='BTM').chapter.id,'gh-4');
  assert.equal(choices.find(v=>v.project.repo==='LENZ').chapter,null);
  assert.equal(selectRecentFieldProjects([{repo:'LENZ',url:'javascript:alert(1)'}]).find(v=>v.project.repo==='LENZ').chapter,null);
  assert.equal(selectRecentFieldProjects(null).length,9);
});

test('new games and creative tools have reviewed shelves, not vague-name fallbacks', () => {
  for (const repo of ['BTM','SparkTheSubstrate','EchoesOfTheNine','TweedleVerse','LENZ']) {
    assert.equal(inferProjectCategory(repo),'Games',repo);
    assert.equal(curateProject({id:'gh-42',repo,title:repo,category:'Other',url:'https://example.org'}).category,'Games');
  }
  assert.equal(inferProjectCategory('FieldStoryForge'),'Creative');
  assert.equal(inferProjectCategory('GenEWrist'),'Systems');
  assert.equal(inferProjectCategory('BackyardProductionCompany'),'Creative');
  assert.equal(inferProjectCategory('ReelCommons'),'Tools');
});

test('After Hours incorporates new games without breaking old destinations', () => {
  const names=['BTM','SparkTheSubstrate','EchoesOfTheNine','TweedleVerse','LENZ','GiltHouse','PhiCade'];
  const catalog=names.map(repo=>({repo,id:repo,url:'https://example.org/'+repo}));
  assert.deepEqual(availableJourneyStops('after-hours',catalog).map(p=>p.repo),names);
});

test('Xi bridge is the final page feature immediately before the footer', () => {
  const jsx=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
  const cards=jsx.indexOf('className="new-horizons"');
  const xi=jsx.indexOf('className="xi-atlas-source-door"');
  const footer=jsx.indexOf('className="bottom-bar"');
  assert.ok(cards>0 && cards<xi && xi<footer);
  assert.equal((jsx.match(/className="xi-atlas-source-door"/g)||[]).length,1);
});
