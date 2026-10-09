import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { wrapChapterIndex, canTurnChapters, wrapDestinationLabel } from '../src/navigation.js';

test('the first chapter turns left to the last chapter', () => {
  assert.equal(wrapChapterIndex(0,-1,67),66);
  assert.equal(wrapChapterIndex(0,-1,3),2);
});

test('the last chapter turns right to the first chapter', () => {
  assert.equal(wrapChapterIndex(66,1,67),0);
  assert.equal(wrapChapterIndex(2,1,3),0);
});

test('middle chapters move normally and large offsets stay bounded', () => {
  assert.equal(wrapChapterIndex(8,-1,34),7);
  assert.equal(wrapChapterIndex(8,1,34),9);
  assert.equal(wrapChapterIndex(4,-101,9),2);
  assert.equal(wrapChapterIndex(4,100,9),5);
});

test('a one-chapter or empty result never wraps to an invalid index', () => {
  assert.equal(canTurnChapters(0),false);
  assert.equal(canTurnChapters(1),false);
  assert.equal(canTurnChapters(2),true);
  assert.equal(wrapChapterIndex(0,-1,0),null);
  assert.equal(wrapChapterIndex(0,1,1),0);
  assert.equal(wrapChapterIndex(0,1,-1),null);
  assert.equal(wrapChapterIndex(0,0.5,7),null);
});

test('endpoints announce wrapping accessibly', () => {
  assert.match(wrapDestinationLabel('prev',0,7),/last chapter/);
  assert.match(wrapDestinationLabel('next',6,7),/first chapter/);
  assert.equal(wrapDestinationLabel('prev',2,7),'Previous chapter');
  assert.equal(wrapDestinationLabel('next',2,7),'Next chapter');
});

test('buttons and keyboard use the shared circular turn, and the book precedes detailed rooms', () => {
  const app=readFileSync('src/main.jsx','utf8');
  assert.match(app,/wrapChapterIndex\(index, delta, filtered.length\)/);
  assert.match(app,/if \(e.key === 'ArrowLeft'\) \{ e.preventDefault\(\); turn\(-1\); \}/);
  assert.match(app,/if \(e.key === 'ArrowRight'\) \{ e.preventDefault\(\); turn\(1\); \}/);
  assert.match(app,/disabled=\{!canTurnChapters\(filtered.length\) \|\| !!flipping \|\| !active\}/);
  const book=app.indexOf('id="living-book"');
  const rail=app.indexOf('className="quick-room-rail"');
  const fullWings=app.indexOf('id="study-rooms"');
  const desk=app.indexOf('className="visitor-desk"');
  assert.ok(rail > 0 && rail < book, 'compact room rail must be above living book');
  assert.ok(book > 0 && book < fullWings, 'the central book must come before full rooms');
  assert.ok(fullWings < desk, 'the visitor desk remains in the expanded area below the book');
});

test('responsive styling allows a larger book while keeping mobile vertical pages', () => {
  const css=readFileSync('src/style.css','utf8');
  assert.match(css,/\.reading-stage\{max-width:1410px/);
  assert.match(css,/@media\(max-width:680px\)/);
  assert.match(css,/\.quick-room-rail/);
});
