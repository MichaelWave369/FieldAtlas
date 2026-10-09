import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync('src/main.jsx','utf8');
const styles = readFileSync('src/style.css','utf8');

test('focus toolbar can enter and return from the reading sanctuary', () => {
  assert.match(app,/const \[focusMode, setFocusMode\] = useState\(false\)/);
  assert.match(app,/aria-pressed=\{focusMode\}/);
  assert.match(app,/Focus Mode/);
  assert.match(app,/Return to Library/);
  assert.match(app,/function exitFocusMode\(\)/);
  assert.match(app,/setFocusMode\(false\)/);
  assert.match(app,/reader-focus-mode/);
});

test('Escape leaves reader focus only when other dialogs are not active', () => {
  assert.match(app,/else if \(focusMode\) exitFocusMode\(\)/);
  assert.match(app,/if \(portalOpen \|\| shelfOpen \|\| showHelp \|\| directoryOpen \|\| editorPage \|\| mapOpen\)/);
});

test('shelf selection and deferred directory/tour choices return to the actual book', () => {
  assert.match(app,/const readerRef = useRef\(null\)/);
  assert.match(app,/ref=\{readerRef\} className="reading-stage"/);
  assert.match(app,/readerRef\.current\?\.scrollIntoView/);
  assert.match(app,/onClick=\{\(\) => \{ goTo\(i\); scrollToReader\(\); \}\}/);
  assert.match(app,/setCurrent\(target\);\s*setPendingChapterId\(null\);\s*scrollToReader\(\)/);
});

test('reader focus preserves the same embedded preview, bounded mirror, and page controls', () => {
  assert.equal((app.match(/<iframe key=\{active\.id \+ active\.url\}/g) || []).length, 1);
  assert.match(app,/<MirrorChamber depth=\{mirrorDepth\}/);
  assert.match(app,/wrapChapterIndex\(index, delta, filtered.length\)/);
  assert.match(app,/id="living-book"/);
});

test('CSS keeps the room below the focus surface and works on mobile', () => {
  assert.match(styles,/\.reader-focus-mode \.room-art\{filter:blur\(8px\)/);
  assert.match(styles,/\.reader-focus-mode \.reading-stage\{max-width:1560px/);
  assert.match(styles,/\.reader-focus-mode \.study-wings/);
  assert.match(styles,/\.reader-focus-mode \.reader-toolbar/);
  assert.match(styles,/@media\(max-width:680px\)/);
  assert.match(styles,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(app,/prefers-reduced-motion: reduce/);
});
