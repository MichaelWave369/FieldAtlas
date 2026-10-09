import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft, ArrowRight, BookOpen, Bookmark, Check, ChevronLeft, ChevronRight,
  ExternalLink, Heart, LampDesk, LibraryBig, Maximize2, Moon, Plus,
  Search, Settings2, Sparkles, Sun, WandSparkles, X, RefreshCw,
  Globe2, Link2, Info, RotateCcw, Menu, Star, Keyboard,
} from 'lucide-react';
import { seedPages, categories, wings, wingForCategory, safeUrl, uniqueMerge, newArrivals, shouldAutoDiscover, discoverGithubPages } from './catalog';
import { curateProject, applyLocalEdits, categoryPalette } from './curation';
import './style.css';

const STORE_KEY = 'field-atlas-pages-v1';
const PREF_KEY = 'field-atlas-preferences-v1';
const DISCOVERY_KEY = 'field-atlas-discovery-v2';
const EDITS_KEY = 'field-atlas-curation-edits-v4';
const specialRoman = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

function readLocal(key, fallback) {
  try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return value ?? fallback; }
  catch { return fallback; }
}

function Artwork({ accent = '#c8ab79', category = 'Other' }) {
  return <div className="sigil-art" style={{ '--accent': accent }} aria-hidden="true">
    <div className="sigil-halo" />
    <div className="sigil-outer" />
    <div className="sigil-inner" />
    <div className="sigil-diamond" />
    <span className="sigil-mark">{({Creative:'✦', Systems:'✧', Games:'♠', Intelligence:'Φ', Research:'◇', Tools:'⌘'})[category] || '✦'}</span>
    <div className="sigil-stars">✦ &nbsp; ✧ &nbsp; ✦</div>
  </div>;
}

function App() {
  const [pages, setPages] = useState(() => {
    const loaded = readLocal(STORE_KEY, seedPages);
    return Array.isArray(loaded) && loaded.length ? loaded.filter(p => p && p.id && safeUrl(p.url)) : seedPages;
  });
  const [prefs, setPrefs] = useState(() => readLocal(PREF_KEY, { night: false, favoriteIds: [], hintDismissed: false }));
  const [category, setCategory] = useState('All');
  const [wing, setWing] = useState('all');
  const [enteredWing, setEnteredWing] = useState(true);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryWing, setDirectoryWing] = useState('all');
  const [localEdits, setLocalEdits] = useState(() => readLocal(EDITS_KEY, {}));
  const [editorPage, setEditorPage] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', desc: '', category: 'Other' });
  const [pendingChapterId, setPendingChapterId] = useState(null);
  const [discovery, setDiscovery] = useState(() => {
    const value = readLocal(DISCOVERY_KEY, {});
    return {
      candidates: Array.isArray(value.candidates) ? value.candidates.filter(p => p && p.id && safeUrl(p.url)) : [],
      dismissedIds: Array.isArray(value.dismissedIds) ? value.dismissedIds : [],
      lastCheckedAt: Number(value.lastCheckedAt) || 0,
      autoEnabled: value.autoEnabled !== false,
      hiddenIds: Array.isArray(value.hiddenIds) ? value.hiddenIds : [],
    };
  });
  const [publishedPages, setPublishedPages] = useState([]);
  const [manifestStatus, setManifestStatus] = useState('');
  const [search, setSearch] = useState('');
  const [current, setCurrent] = useState(0);
  const [flipping, setFlipping] = useState('');
  const [shelfOpen, setShelfOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [form, setForm] = useState({ title: '', url: '', category: 'Other', desc: '' });
  const [formError, setFormError] = useState('');
  const [syncStatus, setSyncStatus] = useState('');
  const [syncing, setSyncing] = useState(false);
  const pendingTimers = useRef([]);

  const favoriteIds = prefs.favoriteIds || [];
  // Canonical base + verified public sites from the daily deployment manifest.
  // Hiding a site only affects the current browser, not its public repository.
  const catalog = useMemo(() => uniqueMerge(
    pages, publishedPages.filter(p => !discovery.hiddenIds.includes(p.id))
  ).map(p => {
    const curated = curateProject(p);
    return applyLocalEdits(curated, localEdits);
  }), [pages, publishedPages, discovery.hiddenIds, localEdits]);
  const filtered = useMemo(() => catalog.filter(p => {
    const matchesWing = wing === 'all' || wingForCategory(p.category) === wing;
    const matchesCategory = category === 'All' || (category === 'Favorites' ? favoriteIds.includes(p.id) : p.category === category);
    const needle = search.trim().toLowerCase();
    return matchesWing && matchesCategory && (!needle || [p.title, p.repo, p.desc, p.category].join(' ').toLowerCase().includes(needle));
  }), [catalog, category, search, favoriteIds, wing]);
  const index = Math.min(Math.max(current, 0), Math.max(0, filtered.length - 1));
  const active = filtered[index];
  const directoryResults = useMemo(() => catalog.filter(p => {
    const q = directorySearch.trim().toLowerCase();
    return (directoryWing === 'all' || wingForCategory(p.category) === directoryWing) &&
      (!q || [p.title, p.repo, p.desc, p.category].join(' ').toLowerCase().includes(q));
  }).sort((a,b)=>a.title.localeCompare(b.title)), [catalog, directorySearch, directoryWing]);

  useEffect(() => { localStorage.setItem(STORE_KEY, JSON.stringify(pages)); }, [pages]);
  useEffect(() => { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); }, [prefs]);
  useEffect(() => { localStorage.setItem(EDITS_KEY, JSON.stringify(localEdits)); }, [localEdits]);
  useEffect(() => { localStorage.setItem(DISCOVERY_KEY, JSON.stringify(discovery)); }, [discovery]);
  useEffect(() => {
    let cancelled = false;
    fetch(import.meta.env.BASE_URL + 'pages-discovered.json', { cache: 'no-store' }).then(async response => {
      if (!response.ok) throw new Error('No refreshed public catalog yet');
      const manifest = await response.json();
      if (manifest.schema_version !== 1 || manifest.owner !== 'MichaelWave369' || !Array.isArray(manifest.pages)) {
        throw new Error('Unexpected public catalog format');
      }
      const valid = manifest.pages.filter(item => item && item.verified === true
        && /^gh-\\d+$/.test(item.id) && /^[\\w.-]+$/.test(item.repo || '')
        && safeUrl(item.url)?.startsWith('https://')).map(item => ({
          ...item, title: String(item.title || item.repo).slice(0, 80),
          desc: String(item.desc || '').slice(0, 300),
          kicker: 'LIVE FROM THE FIELD',
          pullquote: 'Every world deserves its own doorway.',
          accent: '#e5bf87',
        }));
      if (cancelled) return;
      setPublishedPages(valid);
      setManifestStatus(valid.length + ' verified public websites in the latest atlas inventory.');
      setDiscovery(prev => ({ ...prev, candidates: newArrivals(prev.candidates, uniqueMerge(pages, valid), prev.dismissedIds) }));
    }).catch(() => { if (!cancelled) setManifestStatus('Showing the curated collection. Live inventory will refresh when the next deployment completes.'); });
    return () => { cancelled = true; };
    // The deployed manifest is fetched on first page load; local curation remains separate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => () => pendingTimers.current.forEach(clearTimeout), []);
  useEffect(() => { setCurrent(0); }, [category, search, wing]);
  useEffect(() => {
    if (!pendingChapterId) return;
    const target = filtered.findIndex(p => p.id === pendingChapterId);
    if (target >= 0) {
      setCurrent(target);
      setPendingChapterId(null);
    }
  }, [pendingChapterId, filtered]);

  const goTo = useCallback((target, direction = '') => {
    if (flipping || target < 0 || target >= filtered.length || target === index) return;
    setFlipping(direction || (target > index ? 'next' : 'prev'));
    pendingTimers.current.push(setTimeout(() => setCurrent(target), 260));
    pendingTimers.current.push(setTimeout(() => setFlipping(''), 640));
  }, [flipping, filtered.length, index]);

  const turn = useCallback((delta) => goTo(index + delta, delta > 0 ? 'next' : 'prev'), [goTo, index]);
  useEffect(() => {
    const onKeyDown = e => {
      if (e.key === 'Escape') { setPortalOpen(false); setShelfOpen(false); setShowHelp(false); setDirectoryOpen(false); setEditorPage(null); return; }
      if (portalOpen || shelfOpen || showHelp || directoryOpen || editorPage || /input|textarea|select/i.test(e.target?.tagName || '')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); turn(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-1); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [portalOpen, shelfOpen, showHelp, directoryOpen, editorPage, turn]);

  function openChapterFromDirectory(page) {
    // Selection is resolved after the new wing/filter has rendered.
    setPendingChapterId(page.id);
    setWing('all'); setEnteredWing(true); setCategory('All'); setSearch('');
    setDirectoryOpen(false);
    setShelfOpen(false);
  }
  function beginEdit(page) {
    setEditorPage(page);
    setEditForm({ title: page.title || '', desc: page.desc || '', category: page.category || 'Other' });
  }
  function saveEditedChapter(event) {
    event.preventDefault();
    if (!editorPage || !editForm.title.trim()) return;
    const key = String(editorPage.repo || editorPage.id).toLowerCase();
    setLocalEdits(prev => ({ ...prev, [key]: {
      title: editForm.title.trim().slice(0, 80),
      desc: editForm.desc.trim().slice(0, 300),
      category: editForm.category,
    } }));
    setEditorPage(null);
  }
  function toggleFavorite(id) {
    setPrefs(p => ({ ...p, favoriteIds: (p.favoriteIds || []).includes(id) ? p.favoriteIds.filter(x => x !== id) : [...(p.favoriteIds || []), id] }));
  }
  function addPage(e) {
    e.preventDefault();
    const url = safeUrl(form.url);
    if (!url) { setFormError('Please use a valid https:// URL.'); return; }
    if (!form.title.trim()) { setFormError('Every chapter needs a name.'); return; }
    if (catalog.some(p => p.url.replace(/\/$/, '').toLowerCase() === url.replace(/\/$/, '').toLowerCase())) {
      setFormError('That doorway is already in the book.'); return;
    }
    const item = {
      id: `custom-${Date.now()}`, repo: '', title: form.title.trim().slice(0, 80),
      kicker: 'A NEW CHAPTER', category: form.category,
      url, desc: form.desc.trim().slice(0, 300) || 'Another little universe in the Field.',
      pullquote: 'Every great story has another page.', accent: '#e6c893', index: '✦',
    };
    setPages(old => [...old, item]);
    setCategory('All'); setWing('all'); setSearch(''); setCurrent(catalog.length);
    setForm({ title: '', url: '', category: 'Other', desc: '' });
    setFormError(''); setShelfOpen(false);
  }
  async function scanLibrary(background = false) {
    setSyncing(true);
    if (!background) setSyncStatus('Checking public GitHub Pages for new arrivals…');
    try {
      const discovered = await discoverGithubPages();
      const candidates = newArrivals(discovered, catalog, discovery.dismissedIds);
      setDiscovery(prev => ({
        ...prev,
        candidates: newArrivals(discovered, catalog, prev.dismissedIds),
        lastCheckedAt: Date.now(),
      }));
      setSyncStatus('Found ' + discovered.length + ' Pages-enabled public repositories; ' + candidates.length + ' await approval. GitHub Pages status does not guarantee a working live site.');
    } catch (e) {
      setSyncStatus(e?.message || 'Could not reach GitHub right now.');
    } finally {
      setSyncing(false);
    }
  }
  function approveCandidate(id) {
    const selected = discovery.candidates.find(p => p.id === id);
    if (!selected) return;
    setPages(old => uniqueMerge(old, [selected]));
    setDiscovery(prev => ({ ...prev, candidates: prev.candidates.filter(p => p.id !== id) }));
    setCategory('All'); setWing('all'); setSearch('');
  }
  function dismissCandidate(id) {
    setDiscovery(prev => ({
      ...prev,
      dismissedIds: [...new Set([...prev.dismissedIds, id])],
      candidates: prev.candidates.filter(p => p.id !== id),
    }));
  }
  useEffect(() => {
    if (discovery.autoEnabled && shouldAutoDiscover(discovery.lastCheckedAt)) void scanLibrary(true);
    // One read-only scan at most daily, when this browser opens the site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function removePage(id) {
    setPages(old => old.filter(x => x.id !== id));
    if (publishedPages.some(p => p.id === id)) {
      setDiscovery(prev => ({ ...prev, hiddenIds: [...new Set([...prev.hiddenIds, id])] }));
    }
    setCurrent(0);
  }
  function resetCatalog() {
    if (!window.confirm('Restore the original nine curated chapters? Custom chapters and edits will be removed from this browser.')) return;
    setPages(seedPages); setDiscovery(prev => ({...prev, hiddenIds: []})); setLocalEdits({}); setCategory('All'); setWing('all'); setSearch(''); setCurrent(0);
  }

  const fav = active && favoriteIds.includes(active.id);
  const chapter = specialRoman[index] || String(index + 1);

  const activeWing = wings.find(w => w.id === wing) || wings[0];
  return <main className={`study-app ${prefs.night ? 'night-mode' : ''} wing-scene-${wing}`}>
    <div className="room-art" role="presentation" />
    <div className="room-tint" role="presentation" />
    <div className="ambient-lights" role="presentation"><i /><i /><i /><i /><i /><i /></div>

    <header className="topbar">
      <a href="#top" className="wordmark" aria-label="The Field Atlas, home" onClick={e => { e.preventDefault(); setCategory('All'); setSearch(''); setCurrent(0); }}>
        <span className="wordmark-emblem"><BookOpen size={22} strokeWidth={1.35}/></span>
        <span><strong>THE FIELD ATLAS</strong><small>A LIVING LIBRARY OF CREATION</small></span>
      </a>
      <div className="topbar-actions">
        <span className="room-status"><span className="status-glow" /> THE STUDY IS OPEN</span>
        <button className="icon-btn" type="button" title="Change lamplight" aria-label="Toggle lamplight" onClick={() => setPrefs(p => ({...p, night: !p.night}))}>{prefs.night ? <Moon size={19}/> : <Sun size={19}/>}</button>
        {discovery.candidates.length > 0 && <button className="arrival-alert" type="button" onClick={() => setShelfOpen(true)} aria-label={discovery.candidates.length + ' new arrivals awaiting review'}><Sparkles size={15}/> {discovery.candidates.length} arrivals</button>}
        <button className="soft-btn" type="button" onClick={() => setShelfOpen(true)}><LibraryBig size={17}/> <span>Curate the book</span></button>
      </div>
    </header>

    <div className="intro" id="top">
      <div className="eyebrow"><Sparkles size={14}/> ENTER THE FIELD · VOLUME ONE <Sparkles size={14}/></div>
      <h1>A thousand worlds. <em>One book.</em></h1>
      <p>Come in, stay awhile. Every chapter opens a living creation.</p>
    </div>

    <section className="study-wings" aria-label="Explore the library wings">
      <div className="wings-heading"><span>CHOOSE A ROOM</span><small>{catalog.length} available chapters · {discovery.candidates.length} awaiting review</small></div>
      <div className="wings-rail">
        {wings.map(w => {
          const count = catalog.filter(p => w.id === 'all' || wingForCategory(p.category) === w.id).length;
          return <button type="button" key={w.id} className={`wing-card ${wing===w.id?'wing-active':''}`} onClick={() => {setWing(w.id);setEnteredWing(w.id === 'all');setCategory('All');setSearch('');}} aria-pressed={wing === w.id}>
            <span className="wing-glyph" aria-hidden="true">{w.glyph}</span><span className="wing-title">{w.name}</span>
            <small>{w.description}</small><span className="wing-count">{count} {count===1?'chapter':'chapters'}</span>
          </button>;
        })}
      </div>
    </section>

    <section className="room-portal" key={wing} aria-label={'Now visiting ' + activeWing.name}>
      <div className="room-portal-arch" aria-hidden="true"><span>✧</span></div>
      <div className="room-portal-text"><span className="room-portal-kicker">WELCOME TO THIS WING</span>
        <h2>{activeWing.name}</h2><p>{activeWing.description}</p>
        <small>{manifestStatus || 'The shelves are always growing.'}</small></div>
      <div className="room-bookshelf" aria-label="Choose a book from this room">
        {filtered.slice(0, 24).map((p,i) => <button type="button" key={p.id}
          className={`room-book ${index === i ? 'room-book-selected' : ''}`}
          style={{'--spine-color': p.accent || '#a37c51'}}
          onClick={() => goTo(i)} aria-label={'Open ' + p.title} title={p.title}>
          <span className="room-book-mark">✧</span><span className="room-book-name">{p.title}</span>
        </button>)}
        {filtered.length > 24 && <span className="room-more-books">+{filtered.length - 24} more inside the Atlas</span>}
      </div>
    </section>

    <section className="reading-stage" aria-label="Interactive book of GitHub Pages websites">
      <div className="side-ornament left-ornament" aria-hidden="true"><span className="fancy-star">✧</span><span>EXPLORE</span><i /></div>
      <div className="side-ornament right-ornament" aria-hidden="true"><span className="fancy-star">✧</span><span>IMAGINE</span><i /></div>
      <div className="book-floor" aria-hidden="true" />
      <div className={`atlas-book ${flipping ? `is-flipping flip-${flipping}` : ''}`}>
        <div className="leather-spine" />
        <div className="book-edges edge-left" /><div className="book-edges edge-right" />
        {!active ? <div className="empty-book"><BookOpen size={38}/><h2>No chapters found</h2><p>Try another search or add a page to your book.</p><button className="gold-btn" onClick={() => {setSearch(''); setCategory('All');}}>Show all chapters</button></div> : <>
          <article className="book-page story-page" aria-live="polite">
            <div className="folio-top"><span>FIELD NOTES · {active.category?.toUpperCase()}</span><span>{chapter}</span></div>
            <div className="story-main">
              <span className="chapter-label">CHAPTER {chapter}</span>
              <div className="small-rule" />
              <h2>{active.title}</h2>
              <p className="story-kicker">{active.kicker}</p>
              <Artwork accent={active.accent} category={active.category}/>
              <p className="story-desc">{active.desc}</p>
              <p className="story-quote">“{active.pullquote || 'A different page, a different world.'}”</p>
            </div>
            <div className="folio-bottom"><span>MICHAELWAVE369 · THE FIELD</span><span>✧ &nbsp; {String(index + 1).padStart(2, '0')}</span></div>
          </article>

          <article className="book-page portal-page" aria-label={`Live preview of ${active.title}`}>
            <div className="folio-top dark-folio"><span>THE LIVING PAGE</span><button className="favorite-btn" title={fav ? 'Remove bookmark' : 'Bookmark chapter'} onClick={() => toggleFavorite(active.id)} aria-label={fav ? 'Remove bookmark' : 'Bookmark this chapter'}><Bookmark size={17} fill={fav ? 'currentColor' : 'none'} /></button></div>
            <div className="portal-frame" style={{ '--portal-accent': active.accent }}>
              <div className="site-chrome">
                <div className="chrome-dots"><i/><i/><i/></div>
                <div className="address-pill"><Globe2 size={13}/><span title={active.url}>{new URL(active.url).host}{new URL(active.url).pathname}</span></div>
                <ExternalLink size={14}/>
              </div>
              <div className="iframe-shell">
                <iframe key={active.id + active.url} title={`Live website: ${active.title}`} loading="lazy" src={active.url} referrerPolicy="strict-origin-when-cross-origin" allow="fullscreen; clipboard-read; clipboard-write" />
              </div>
              <div className="preview-footnote"><span className="live-dot" /> LIVE WEBSITE PREVIEW <span className="preview-hint">Some sites block embedding. Open the portal instead.</span></div>
            </div>
            <div className="portal-actions">
              <a className="gold-btn" href={active.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={15}/> Open this world</a>
              <button type="button" className="outline-btn" onClick={() => setPortalOpen(true)}><Maximize2 size={15}/> Fullscreen reader</button>
            </div>
            <div className="folio-bottom dark-folio"><span>AN OPEN WINDOW TO THE FIELD</span><span>{String(index + 1).padStart(2,'0')} / {String(filtered.length).padStart(2,'0')}</span></div>
          </article>
          {flipping && <div className="turning-leaf" aria-hidden="true"><div className="turning-leaf-face"/><div className="turning-leaf-back"/></div>}
        </>}
      </div>
      <button type="button" className="page-turn turn-left" aria-label="Previous chapter" disabled={index <= 0 || !!flipping || !active} onClick={() => turn(-1)}><ChevronLeft size={25}/></button>
      <button type="button" className="page-turn turn-right" aria-label="Next chapter" disabled={index >= filtered.length - 1 || !!flipping || !active} onClick={() => turn(1)}><ChevronRight size={25}/></button>
    </section>

    <section className="reading-controls" aria-label="Browse chapters">
      <div className="chapter-progress"><span className="small-label">YOUR PLACE IN THE BOOK</span><strong>{String(active ? index+1 : 0).padStart(2,'0')} <span>/</span> {String(filtered.length).padStart(2,'0')}</strong><div className="progress-track"><div style={{width:`${filtered.length ? (index+1)/filtered.length*100 : 0}%`}} /></div></div>
      <div className="chapter-filters">
        <div className="search-wrap"><Search size={16}/><input aria-label="Search chapters" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a chapter..."/></div>
        <select aria-label="Filter by category" value={category} onChange={e=>setCategory(e.target.value)}>{[...categories, 'Favorites'].map(c=><option key={c}>{c}</option>)}</select>
      </div>
      <div className="keyboard-hint"><Keyboard size={15}/> Use ← → to turn pages</div>
    </section>

    <nav className="chapter-shelf" aria-label="Book chapter index">
      {filtered.map((p, i) => <button type="button" key={p.id} className={`shelf-chapter ${index===i ? 'selected' : ''}`} onClick={() => goTo(i)} title={p.title}>
        <span className="shelf-number">{String(i+1).padStart(2,'0')}</span><span className="shelf-icon" style={{'--accent':p.accent}}>✦</span><span className="shelf-name">{p.title}</span>{favoriteIds.includes(p.id) && <Bookmark size={11} fill="currentColor"/>}
      </button>)}
      <button type="button" className="shelf-add" onClick={()=>setShelfOpen(true)}><Plus size={17}/> Add chapter</button>
    </nav>

    <footer className="bottom-bar"><span>MADE WITH CURIOSITY · BUILT TO BE SHARED</span><button onClick={()=>setShowHelp(true)}><Info size={15}/> About the atlas</button><span>ENTER THE FIELD <span className="bottom-flower">✻</span> 2026</span></footer>

    {portalOpen && active && <div className="portal-modal" role="dialog" aria-modal="true" aria-label={`${active.title} fullscreen reader`}>
      <div className="portal-modal-header"><span><BookOpen size={19}/> {active.title} <small>LIVE SITE</small></span><div><a href={active.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/> Open outside atlas</a><button aria-label="Close fullscreen reader" onClick={()=>setPortalOpen(false)}><X size={20}/></button></div></div>
      <iframe key={'full-'+active.id} title={`Fullscreen website ${active.title}`} src={active.url} allow="fullscreen; clipboard-read; clipboard-write" />
      <p className="modal-embed-hint">If a page is blank, its host may prevent iframe embedding. Use “Open outside atlas.”</p>
    </div>}

    {showHelp && <div className="modal-cover" onMouseDown={()=>setShowHelp(false)}><section className="small-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onMouseDown={e=>e.stopPropagation()}><button className="modal-x" aria-label="Close" onClick={()=>setShowHelp(false)}><X/></button><span className="eyebrow">A NOTE FROM THE LIBRARY</span><h2 id="help-title">A book made of doorways.</h2><p>The Field Atlas is a real React app, wrapped in a warm study. Each chapter previews a GitHub Pages website in an iframe and offers a direct link. Some browsers and projects refuse embedded frames, so the direct link is always available.</p><p>Turn chapters with the arrows or keyboard, choose a library wing, bookmark favorites, or add sites by URL. A daily public-site manifest automatically adds verified live GitHub Pages to the shared book. Unverified suggestions remain in the private-to-this-browser approval inbox. Personal bookmarks and changes stay in this browser.</p><div className="modal-notice"><Star size={18}/> The book is a guide, never a permission grant. Embedded sites keep their own functionality and safety rules.</div></section></div>}

    {shelfOpen && <div className="modal-cover" onMouseDown={()=>setShelfOpen(false)}><section className="curate-modal" role="dialog" aria-modal="true" aria-labelledby="curate-title" onMouseDown={e=>e.stopPropagation()}>
      <button type="button" className="modal-x" aria-label="Close shelf editor" onClick={()=>setShelfOpen(false)}><X size={23}/></button>
      <span className="eyebrow"><WandSparkles size={15}/> YOUR LIBRARY, YOUR CHAPTERS</span>
      <h2 id="curate-title">Curate the Atlas</h2>
      <p className="modal-lede">Verified public GitHub Pages are added to the shared book during daily deployment. Other Pages-enabled repositories remain in the review inbox until you approve them locally. No private repository is scanned.</p>
      <p className="public-catalog-status" role="status">{manifestStatus || 'Loading the public Pages inventory…'}</p>
      <div className="discovery-controls"><label className="scan-toggle"><input type="checkbox" checked={discovery.autoEnabled} onChange={e => setDiscovery(d => ({...d, autoEnabled:e.target.checked}))}/> Check for new sites once daily when this browser opens the Atlas</label><button type="button" className="discover-btn scan-inline" onClick={() => scanLibrary(false)} disabled={syncing}><RefreshCw size={16} className={syncing ? 'spinning':''}/>{syncing ? 'Scanning public sites…' : 'Scan GitHub Pages now'}</button></div>
      {syncStatus && <p className="sync-status" role="status">{syncStatus}</p>}
      <section className="arrivals-board" aria-label="New project arrivals"><div className="arrivals-header"><h3><Sparkles size={18}/> New arrivals <span>{discovery.candidates.length}</span></h3><small>Suggested rooms need approval. A Pages flag does not verify a live or embeddable website.</small></div>
      {discovery.candidates.length ? <div className="arrivals-list">{discovery.candidates.map(p => <div className="arrival-entry" key={p.id}><div><strong>{p.title}</strong><small>{wings.find(w => w.id===wingForCategory(p.category))?.shortName || 'Other'} · {p.url}</small><p>{p.desc}</p></div><div className="arrival-actions"><a href={p.url} target="_blank" rel="noopener noreferrer" title={'Visit '+p.title}>Preview ↗</a><button className="arrival-approve" onClick={() => approveCandidate(p.id)}><Check size={14}/> Add chapter</button><button className="arrival-dismiss" aria-label={'Dismiss '+p.title} onClick={() => dismissCandidate(p.id)}><X size={16}/></button></div></div>)}</div> : <p className="arrivals-empty">No waiting arrivals. New public GitHub Pages projects will appear here after the next scan.</p>}</section>
      <div className="curate-grid">
        <div className="curate-left">
          <h3>Add a doorway</h3>
          <form onSubmit={addPage} className="page-form">
            <label>Chapter name<input required maxLength={80} placeholder="The next wonderful thing" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></label>
            <label>Published site URL<input type="url" required placeholder="https://michaelwave369.github.io/..." value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))}/></label>
            <label>Category<select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{categories.filter(c=>c!=='All').map(c=><option key={c}>{c}</option>)}</select></label>
            <label>Description<textarea rows={3} maxLength={300} placeholder="What is this world for?" value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))}/></label>
            {formError && <p className="form-error">{formError}</p>}
            <button className="gold-btn" type="submit"><Plus size={16}/> Add to book</button>
          </form>
          <p className="tiny-note">Public discoveries await review in the arrivals inbox above. Only this browser sees approved custom chapters until the repository catalog is updated.</p>
        </div>
        <div className="curate-right"><div className="shelf-heading"><h3>Current chapters <small>{catalog.length}</small></h3><button title="Reset to curated nine" onClick={resetCatalog}><RotateCcw size={15}/> Reset</button></div>
          <div className="curate-list">{catalog.map((p,i)=><div key={p.id} className="curate-entry"><span className="curate-index">{String(i+1).padStart(2,'0')}</span><span className="curate-entry-main"><strong>{p.title}</strong><small>{p.url}</small></span><button className="curate-remove" title={`Remove ${p.title} from this browser's book`} aria-label={`Remove ${p.title}`} onClick={()=>removePage(p.id)}><X size={17}/></button></div>)}</div>
        </div>
      </div>
    </section></div>}
  </main>;
}

createRoot(document.getElementById('root')).render(<App/>);
