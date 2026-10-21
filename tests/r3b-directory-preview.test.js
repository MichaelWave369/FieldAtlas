import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { directoryPreviewKind, directoryPreviewHost } from '../src/directory-preview.js';
import { publicationChapters } from '../src/publications.js';
import { PREVIEW_SANDBOX } from '../src/preview-policy.js';

const chapter = {id:'gh-7',repo:'Example',title:'Example',category:'Creative',url:'https://michaelwave369.github.io/Example/'};

test('public websites are eligible for opt-in sandboxed previews',()=>{
  assert.equal(directoryPreviewKind(chapter),'website');
  assert.equal(directoryPreviewHost(chapter),'michaelwave369.github.io');
  assert.equal(directoryPreviewKind({...chapter,url:'javascript:alert(1)'}),'unavailable');
  assert.equal(directoryPreviewKind(null),'unavailable');
  assert.equal(directoryPreviewHost({url:'wrong'}),'Unknown host');
});

test('research and recursive Atlas illustrations never embed remote document or recursive frame',()=>{
  assert.ok(publicationChapters.length);
  assert.equal(directoryPreviewKind(publicationChapters[0]),'research');
  const mirror={...chapter,repo:'FieldAtlas',url:'https://michaelwave369.github.io/FieldAtlas/'};
  assert.equal(directoryPreviewKind(mirror),'mirror');
});

test('previews are isolated and only mount after a deliberate launch',()=>{
  const component=readFileSync(new URL('../src/DirectoryPeek.jsx',import.meta.url),'utf8');
  const main=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
  const tokens=PREVIEW_SANDBOX.split(' ');
  assert.ok(tokens.includes('allow-scripts'));
  assert.equal(tokens.includes('allow-same-origin'),false);
  assert.ok(component.includes("kind === 'website' && live"));
  assert.ok(component.includes('sandbox={PREVIEW_SANDBOX}'));
  assert.ok(component.includes('referrerPolicy="strict-origin-when-cross-origin"'));
  assert.ok(component.includes('This illustration is not a screenshot'));
  assert.ok(main.includes('!directoryOpen && <iframe'));
  assert.ok(main.includes('<DirectoryPeek page={p}'));
  assert.ok(main.includes('onClick={() => setDirectoryPreview'));
  assert.ok(main.includes('onRead={() => openChapterFromDirectory(p)}'));
});

test('peeking does not alter active chapter, favorites, or passport stamps',()=>{
  const main=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
  assert.ok(main.includes('const [directoryPreview, setDirectoryPreview] = useState(null);'));
  assert.ok(main.includes('directoryPreview?.id === p.id'));
  assert.ok(main.includes('onToggleLive={() => setDirectoryPreview(previous =>'));
  assert.ok(main.includes('useAtlasPassport(active?.id)'));
});
