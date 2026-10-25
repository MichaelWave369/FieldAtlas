import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft, ArrowRight, BookOpen, Bookmark, Check, ChevronLeft, ChevronRight,
  ExternalLink, Heart, LampDesk, LibraryBig, Maximize2, Moon, Plus,
  Search, Settings2, Sparkles, Sun, WandSparkles, X, RefreshCw, Eye,
  Globe2, Link2, Info, RotateCcw, Menu, Star, Keyboard, Map as MapIcon,
} from 'lucide-react';
import { categories, wings, wingForCategory } from './catalog';
import { categoryPalette } from './curation';
import { createCatalogAudit, isZenodoEntry } from './catalog-audit.js';
import { publicationChapters, isPublicationChapter } from './publications.js';
import LibraryMap from './LibraryMap';
import { getMapChapterWing } from './library-map';
import { compassFilters, pickSurpriseChapter, remainingSurpriseCount, availableSurprises } from './discovery-compass';
import { isInfiniteAtlas, MAX_MIRROR_DEPTH, MIN_MIRROR_DEPTH, mirrorLayers, nextMirrorDepth } from './fieldception';
import { visitorJourneys, findJourney, availableJourneyStops, readAtlasLink, buildAtlasLink, locateSharedChapter } from './journeys';
import { constellationChapterUrl, readConstellationProject, locateConstellationChapter } from './constellation-bridge.js';
import { wrapChapterIndex, canTurnChapters, wrapDestinationLabel } from './navigation';
import { futureArchivePrintUrl, FUTURE_ARCHIVE_URL } from './future-archive';
import { reviewedXiCommonsSourceEntry } from './xi-commons-source.js';
import BookForeEdge from './BookForeEdge';
import DirectoryPeek from './DirectoryPeek';
import FieldThreads from './FieldThreads';
import { findFieldThreads } from './field-threads.js';
import { resolveDocumentedConnections } from './provenance-connections.js';
import { PREVIEW_SANDBOX } from './preview-policy.js';
import { activateModalFocus } from './modal-focus.js';
import useAtlasCatalog from './hooks/useAtlasCatalog.js';
import useAtlasPassport from './hooks/useAtlasPassport.js';
import { makePassportBackup, readPassportBackup, PASSPORT_TRANSFER_MAX_BYTES } from './passport-transfer.js';
import useAtlasManifest from './hooks/useAtlasManifest.js';
import useAtlasCuration from './hooks/useAtlasCuration.js';
import useAtlasDiscovery from './hooks/useAtlasDiscovery.js';
import { directoryCollections, directoryCollectionCounts, selectDirectoryCollection, isAtlasFindShortcut } from './directory-explorer.js';
import './style.css';
import './book-edge.css';

const PREF_KEY = 'field-atlas-preferences-v1';
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
    <span className="sigil-mark">{({Creative:'✦', Systems:'✧', Games:'♠', Intelligence:'Φ', Research:'◇', Publications:'▤', Learning:'✎', Music:'♫', Galleries:'▧', 'People & Practice':'♡', Tools:'⌘'})[category] || '✦'}</span>
    <div className="sigil-stars">✦ &nbsp; ✧ &nbsp; ✦</div>
  </div>;
}

function BookCover({ page, onOpen, compact = false }) {
  const palette = categoryPalette[page.category] || categoryPalette.Other;
  return <button type="button" className={`atlas-cover ${compact ? 'atlas-cover-compact' : ''}`}
    style={{ '--cover-accent': page.accent || palette.color }}
    onClick={onOpen} title={'Open ' + page.title}>
    <span className="cover-inner-frame" aria-hidden="true" />
    <span className="cover-crest" aria-hidden="true">{page.coverGlyph || palette.glyph}</span>
    <span className="cover-title">{page.title}</span>
    <span className="cover-divider" aria-hidden="true">✧</span>
    <span className="cover-imprint">{page.category.toUpperCase()} · FIELD ATLAS</span>
  </button>;
}

/**
 * Recursive in appearance, NOT recursive in execution.
 * Five illustration frames at most. Never embeds a second copy of the app.
 */
function MirrorVista({ depth }) {
  let inside = <div className="mirror-final" aria-hidden="true"><span>∞</span><small>THE FIELD CONTINUES</small></div>;
  for (const layer of mirrorLayers(depth).reverse()) {
    inside = <div className="mirror-mini-room" key={layer}>
      <div className="mirror-mini-lamp" aria-hidden="true">✧</div>
      <div className="mirror-mini-heading">THE FIELD ATLAS <span>Φ∞ · {layer}</span></div>
      <div className="mirror-mini-wings" aria-hidden="true"><i/><i/><i/><i/></div>
      <div className="mirror-mini-book">
        <div className="mirror-mini-paper"><b>FIELD</b><strong>Φ</strong><small>PAGE {layer}</small></div>
        <div className="mirror-mini-screen">{inside}</div>
      </div>
      <div className="mirror-mini-floor" />
    </div>;
  }
  return <div className="mirror-vista" aria-hidden="true">{inside}</div>;
}

function MirrorChamber({depth, onDeeper, onSurface}) {
  return <div className="mirror-chamber">
    <header className="mirror-chamber-header"><span>THE MIRROR ROOM · Φ∞</span><span>DEPTH {depth} / {MAX_MIRROR_DEPTH}</span></header>
    <MirrorVista depth={depth}/>
    <div className="mirror-console">
      <p>{depth >= MAX_MIRROR_DEPTH ? 'The fifth reflection is the end of this safe little rabbit hole.' : 'Every book contains a smaller book. Follow the reflection.'}</p>
      <div className="mirror-controls">
        <button type="button" onClick={onSurface} disabled={depth <= MIN_MIRROR_DEPTH} aria-label="Return toward the first reflection"><ChevronLeft size={14}/> Surface</button>
        <button type="button" onClick={onDeeper} disabled={depth >= MAX_MIRROR_DEPTH} aria-label="Go one reflection deeper">Go Deeper <ChevronRight size={14}/></button>
      </div>
    </div>
  </div>;
}

function PublicationLeaf({ page, fullscreen = false }) {
  return <section className={`publication-leaf ${fullscreen ? 'publication-leaf-fullscreen' : ''}`} aria-label="Curated research record">
    <div className="publication-leaf-mark" aria-hidden="true">▤</div>
    <span className="publication-leaf-label">ENTER THE FIELD · RESEARCH RECORD</span>
    <strong className="publication-leaf-kind">{page.recordType || 'Research object'}</strong>
    <h3>{page.title}</h3>
    <p>{page.desc}</p>
    <div className="publication-leaf-ledger">
      <span>DOI: <strong>{page.doi}</strong></span>
      <span>Archive index date: <strong>{page.recordDate}</strong></span>
    </div>
    <p className="publication-leaf-note">Curated from the public research index. Zenodo controls authoritative metadata, availability, versions, and files.</p>
    <a href={page.url} target="_blank" rel="noopener noreferrer">Open the Zenodo record ↗</a>
  </section>;
}

function App() {
  const {
    pages, setPages, localEdits,
    editorPage, setEditorPage, editForm, setEditForm,
    form, setForm, formError,
    beginEdit: beginCurationEdit, saveEditedChapter,
    addPage: addLocalPage, removePage: removeLocalPage, resetCatalog: resetLocalCatalog,
  } = useAtlasCuration();
  const [prefs, setPrefs] = useState(() => readLocal(PREF_KEY, { night: false, favoriteIds: [], hintDismissed: false }));
  const [category, setCategory] = useState('All');
  const [wing, setWing] = useState('all');
  const [enteredWing, setEnteredWing] = useState(true);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryWing, setDirectoryWing] = useState('all');
  const [directoryCollection, setDirectoryCollection] = useState('all');
  const [directoryPreview, setDirectoryPreview] = useState(null);
  const [pendingChapterId, setPendingChapterId] = useState(null);
  const catalogRef = useRef([]);
  const {
    discovery, setDiscovery, syncStatus, syncing, scanLibrary,
    approveCandidate: admitCandidate, dismissCandidate,
  } = useAtlasDiscovery({ catalogRef, setPages });
  const { publishedPages, manifestStatus } = useAtlasManifest({
    pages, setDiscovery, baseUrl: import.meta.env.BASE_URL,
  });
  const [search, setSearch] = useState('');
  const [current, setCurrent] = useState(0);
  const [flipping, setFlipping] = useState('');
  const [shelfOpen, setShelfOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [bookPanel, setBookPanel] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [compassWing, setCompassWing] = useState('all');
  const [compassNotice, setCompassNotice] = useState('');
  const [mirrorDepth, setMirrorDepth] = useState(MIN_MIRROR_DEPTH);
  const [activeTour, setActiveTour] = useState(null);
  const [shareNotice, setShareNotice] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [auditNotice, setAuditNotice] = useState('');
  const [passportNotice, setPassportNotice] = useState('');
  const passportFileInput = useRef(null);
  const pendingTimers = useRef([]);
  const readerRef = useRef(null);
  const handledDeepLink = useRef(false);

  const favoriteIds = prefs.favoriteIds || [];
  // One shared catalog, filtered reader and directory; same source data and order.
  const { catalog, filtered, directoryResults } = useAtlasCatalog({
    pages, publishedPages, discovery, localEdits, category, search, favoriteIds,
    wing, directorySearch, directoryWing,
  });
  catalogRef.current = catalog;
  const index = Math.min(Math.max(current, 0), Math.max(0, filtered.length - 1));
  const active = filtered[index];
  const constellationUrl = constellationChapterUrl(active,publishedPages);
  const relatedThreads = useMemo(() => findFieldThreads(active, catalog, 5), [active, catalog]);
  const documentedConnections = useMemo(() => resolveDocumentedConnections(active, catalog), [active, catalog]);
  const { visitedChapters, importVisitedChapters } = useAtlasPassport(active?.id);
  const directoryCounts = useMemo(() => directoryCollectionCounts(catalog, {
    wing: directoryWing, visitedIds: visitedChapters, favoriteIds,
  }), [catalog, directoryWing, visitedChapters, favoriteIds]);
  const visibleDirectoryResults = useMemo(() => selectDirectoryCollection(directoryResults, {
    collection: directoryCollection, visitedIds: visitedChapters, favoriteIds,
  }), [directoryResults, directoryCollection, visitedChapters, favoriteIds]);
  useEffect(() => { setDirectoryPreview(null); }, [directorySearch, directoryWing, directoryCollection]);
  const journey = activeTour ? findJourney(activeTour.id) : null;
  const journeyStops = useMemo(() => availableJourneyStops(journey, catalog), [journey, catalog]);
  const tourStep = Math.min(activeTour?.step ?? 0, Math.max(0, journeyStops.length - 1));
  const fieldception = isInfiniteAtlas(active);
  const publication = isPublicationChapter(active);
  const compassChoices = useMemo(() => availableSurprises(catalog, compassWing), [catalog, compassWing]);
  const undiscoveredCount = useMemo(() => remainingSurpriseCount(catalog, compassWing, visitedChapters), [catalog, compassWing, visitedChapters]);
  useEffect(() => { setMirrorDepth(MIN_MIRROR_DEPTH); }, [active?.id]);

  // Keep the original book intact while making every application modal keyboard-safe.
  const activeModal = portalOpen && active ? 'portal' : editorPage ? 'editor' : directoryOpen ? 'directory' : shelfOpen ? 'shelf' : showHelp ? 'help' : null;
  useEffect(() => {
    if (!activeModal) return undefined;
    const dialog = document.querySelector('[data-atlas-modal="' + activeModal + '"]');
    return activateModalFocus(dialog, {
      initialSelector: activeModal === 'directory' ? 'input[aria-label="Search the Atlas directory"]' : '[data-atlas-initial-focus]',
    });
  }, [activeModal]);

  // Opening the directory starts in the full collection. Filter changes never
  // alter the chapter displayed by the book until a chapter is explicitly opened.
  useEffect(() => {
    if (directoryOpen) setDirectoryCollection('all');
    setDirectoryPreview(null);
  }, [directoryOpen]);
  useEffect(() => { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); }, [prefs]);
  useEffect(() => { setShareNotice(''); }, [active?.id]);
  useEffect(() => () => pendingTimers.current.forEach(clearTimeout), []);
  useEffect(() => { setCurrent(0); }, [category, search, wing]);
  const scrollToReader = useCallback(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    window.requestAnimationFrame(() => readerRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    }));
  }, []);
  useEffect(() => {
    if (focusMode) scrollToReader();
  }, [focusMode, scrollToReader]);
  function exitFocusMode() {
    setFocusMode(false);
    window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }
  useEffect(() => {
    if (!manifestStatus || handledDeepLink.current) return;
    handledDeepLink.current = true;
    const link = readAtlasLink(window.location.search);
    // Existing chapter and tour deep links retain precedence over the new alias.
    // Resolve a numeric identity only against the fetched verified public manifest
    // and a chapter already in the visitor's accessible Atlas catalog.
    if (!link.tour && !link.chapter) {
      const params = new URLSearchParams(window.location.search);
      if (params.has('project')) {
        const identity = readConstellationProject(window.location.search);
        const matching = identity ? locateConstellationChapter(catalog,publishedPages,identity) : null;
        if (matching) {
          setWing('all'); setEnteredWing(true); setCategory('All'); setSearch('');
          setPendingChapterId(matching.id);
        } else {
          setShareNotice('This Constellation project is not a verified public chapter in your current Atlas. Explore the directory instead.');
        }
        return;
      }
    }
    if (link.tour) {
      const stops = availableJourneyStops(link.tour, catalog);
      if (stops.length) {
        const matchingIndex = link.chapter ? stops.findIndex(p => p.repo?.toLowerCase() === link.chapter.toLowerCase()) : -1;
        const step = matchingIndex >= 0 ? matchingIndex : 0;
        setActiveTour({ id: link.tour, step });
        setWing('all'); setEnteredWing(true); setCategory('All'); setSearch('');
        setPendingChapterId(stops[step].id);
        return;
      }
    }
    if (link.chapter) {
      const match = locateSharedChapter(catalog, link.chapter);
      if (match) {
        setWing('all'); setEnteredWing(true); setCategory('All'); setSearch('');
        setPendingChapterId(match.id);
      } else {
        setShareNotice('This shared chapter is unavailable in your current Atlas. Try the complete directory.');
      }
    }
  }, [manifestStatus, catalog, publishedPages]);
  useEffect(() => {
    if (!pendingChapterId) return;
    const target = filtered.findIndex(p => p.id === pendingChapterId);
    if (target >= 0) {
      setCurrent(target);
      setPendingChapterId(null);
      scrollToReader();
    } else if (!catalog.some(p => p.id === pendingChapterId)) {
      // Never leave an inaccessible or removed shared chapter pending forever.
      setPendingChapterId(null);
      setShareNotice('That chapter is no longer in this browser\'s accessible catalog.');
    } else if (wing !== 'all' || category !== 'All' || search) {
      // Resolve the chapter by ID after clearing incompatible local filters.
      setWing('all');
      setCategory('All');
      setSearch('');
    }
  }, [pendingChapterId, filtered, catalog, wing, category, search, scrollToReader]);

  const goTo = useCallback((target, direction = '') => {
    if (flipping || target < 0 || target >= filtered.length || target === index) return;
    if (activeTour && filtered[target]?.id !== journeyStops[tourStep]?.id) setActiveTour(null);
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setCurrent(target);
      return;
    }
    setFlipping(direction || (target > index ? 'next' : 'prev'));
    pendingTimers.current.push(setTimeout(() => setCurrent(target), 260));
    pendingTimers.current.push(setTimeout(() => setFlipping(''), 640));
  }, [flipping, filtered, index, activeTour, journeyStops, tourStep]);

  const turn = useCallback((delta) => {
    if (!canTurnChapters(filtered.length)) return;
    const target = wrapChapterIndex(index, delta, filtered.length);
    if (target !== null) goTo(target, delta > 0 ? 'next' : 'prev');
  }, [goTo, index, filtered.length]);
  useEffect(() => {
    const onKeyDown = e => {
      if (isAtlasFindShortcut(e)) {
        if (!(portalOpen || shelfOpen || showHelp || editorPage || mapOpen)) {
          e.preventDefault();
          if (directoryOpen) {
            document.querySelector('input[aria-label="Search the Atlas directory"]')?.focus();
          } else {
            setDirectoryWing('all'); setDirectorySearch(''); setDirectoryCollection('all');
            setBookPanel(null);
            setDirectoryOpen(true);
          }
        }
        return;
      }
      if (e.key === 'Escape') {
        if (portalOpen || shelfOpen || showHelp || directoryOpen || editorPage || mapOpen) {
          setPortalOpen(false); setShelfOpen(false); setShowHelp(false); setDirectoryOpen(false); setEditorPage(null); setMapOpen(false);
        } else if (bookPanel) setBookPanel(null);
        else if (focusMode) exitFocusMode();
        return;
      }
      if (portalOpen || shelfOpen || showHelp || directoryOpen || editorPage || mapOpen || bookPanel || /input|textarea|select/i.test(e.target?.tagName || '')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); turn(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-1); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [portalOpen, shelfOpen, showHelp, directoryOpen, editorPage, mapOpen, bookPanel, focusMode, turn]);

  function selectJourney(id, targetRepo = null) {
    const stops = availableJourneyStops(id, catalog);
    if (!stops.length) return;
    const matched = targetRepo ? stops.findIndex(p => p.repo?.toLowerCase() === targetRepo.toLowerCase()) : -1;
    const step = matched >= 0 ? matched : 0;
    setActiveTour({ id, step });
    setPendingChapterId(stops[step].id);
    setWing('all'); setEnteredWing(true); setCategory('All'); setSearch('');
    setShareNotice('');
  }
  function visitTourStep(step) {
    if (!journey || step < 0 || step >= journeyStops.length) return;
    setActiveTour({id: journey.id, step});
    setPendingChapterId(journeyStops[step].id);
    setWing('all'); setEnteredWing(true); setCategory('All'); setSearch('');
    setShareNotice('');
  }
  async function shareChapter() {
    if (!active?.repo) return;
    const link = buildAtlasLink(window.location.href, active.repo, journey?.id || null);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(link);
      setShareNotice('Link copied! Share this doorway with someone.');
    } catch {
      setShareNotice(link);
    }
  }
  function surpriseMe() {
    const discovered = pickSurpriseChapter(catalog, {
      wing: compassWing,
      visitedIds: visitedChapters,
      currentId: active?.id,
    });
    if (!discovered) {
      setCompassNotice('No available chapters in this wing yet. Choose another room.');
      return;
    }
    setActiveTour(null);
    setWing(compassWing);
    setEnteredWing(true);
    setCategory('All');
    setSearch('');
    setPendingChapterId(discovered.id);
    setCompassNotice('The compass found ' + discovered.title + '. Open its living page!');
  }
  function enterRoomFromMap(id) {
    setMapOpen(false);
    setActiveTour(null);
    setWing(id);
    setEnteredWing(true);
    setCategory('All');
    setSearch('');
    setCurrent(0);
    scrollToReader();
  }
  function openChapterFromMap(page) {
    if (!page) return;
    setMapOpen(false);
    setActiveTour(null);
    setPendingChapterId(page.id);
    setWing(getMapChapterWing(page));
    setEnteredWing(true);
    setCategory('All');
    setSearch('');
  }
  function openChapterFromDirectory(page) {
    setActiveTour(null);
    // Selection is resolved after the new wing/filter has rendered.
    setPendingChapterId(page.id);
    setWing('all'); setEnteredWing(true); setCategory('All'); setSearch('');
    setDirectoryOpen(false);
    setShelfOpen(false);
  }
  function followFieldThread(page) {
    // Relations are suggestions; only the original reader navigates/stamps.
    if (!page || !catalog.some(item => item.id === page.id)) return;
    setActiveTour(null);
    setPendingChapterId(page.id);
    setWing('all'); setEnteredWing(true); setCategory('All'); setSearch('');
    setBookPanel(null);
  }
  function downloadPassport() {
    try {
      const content = JSON.stringify(makePassportBackup(visitedChapters), null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'field-atlas-visitor-passport.json';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setPassportNotice('Visitor passport backup prepared locally. Keep the file private if your reading history matters to you.');
    } catch {
      setPassportNotice('The visitor passport could not be downloaded in this browser.');
    }
  }

  async function importPassportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      if (file.size > PASSPORT_TRANSFER_MAX_BYTES) {
        throw new Error('Passport file is too large. The limit is 64 KiB.');
      }
      const imported = readPassportBackup(await file.text());
      const result = importVisitedChapters(imported, catalog);
      setPassportNotice('Merged ' + result.added + ' new passport stamps. ' +
        (result.skipped ? result.skipped + ' unavailable chapter IDs were skipped. ' : '') +
        'Your existing visits, bookmarks, and custom chapters remain unchanged.');
    } catch (error) {
      setPassportNotice(error?.message || 'Could not import that visitor passport.');
    }
  }

  function downloadCatalogAudit() {
    try {
      const audit = createCatalogAudit(catalog);
      const blob = new Blob([JSON.stringify(audit, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fieldatlas-catalog-category-audit.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setAuditNotice('Prepared a local category-audit download for ' + audit.chapter_count + ' chapters, with ' + audit.review_count + ' suggested reviews.');
    } catch {
      setAuditNotice('Unable to prepare the category audit in this browser.');
    }
  }
  function beginEdit(page) {
    setDirectoryOpen(false);
    beginCurationEdit(page);
  }
  function toggleFavorite(id) {
    setPrefs(p => ({ ...p, favoriteIds: (p.favoriteIds || []).includes(id) ? p.favoriteIds.filter(x => x !== id) : [...(p.favoriteIds || []), id] }));
  }
  function addPage(event) {
    if (!addLocalPage(event, catalog)) return;
    setCategory('All'); setWing('all'); setSearch(''); setCurrent(catalog.length);
    setShelfOpen(false);
  }
  function approveCandidate(id) {
    if (!admitCandidate(id)) return;
    setCategory('All'); setWing('all'); setSearch('');
  }
  function removePage(id) {
    removeLocalPage(id);
    if (publishedPages.some(p => p.id === id) || publicationChapters.some(p => p.id === id)) {
      setDiscovery(prev => ({ ...prev, hiddenIds: [...new Set([...prev.hiddenIds, id])] }));
    }
    setCurrent(0);
  }
  function resetCatalog() {
    if (!window.confirm('Restore the original ten curated chapters? Custom chapters and edits will be removed from this browser.')) return;
    resetLocalCatalog();
    setDiscovery(prev => ({ ...prev, hiddenIds: [] }));
    setActiveTour(null); setCategory('All'); setWing('all'); setSearch(''); setCurrent(0);
  }

  const fav = active && favoriteIds.includes(active.id);
  const chapter = specialRoman[index] || String(index + 1);

  const activeWing = wings.find(w => w.id === wing) || wings[0];
  return <main className={`study-app ${prefs.night ? 'night-mode' : ''} wing-scene-${wing} ${focusMode ? 'reader-focus-mode' : ''}`}>
    <a href="#living-book" className="skip-to-reader">Skip to living book</a>
    <div className="room-art" role="presentation" />
    <div className="room-tint" role="presentation" />
    <div className="ambient-lights" role="presentation"><i /><i /><i /><i /><i /><i /></div>

    <header className="topbar">
      <a href="#top" className="wordmark" onClick={e => { e.preventDefault(); setCategory('All'); setSearch(''); setCurrent(0); }}>
        <span className="wordmark-emblem"><BookOpen size={22} strokeWidth={1.35}/></span>
        <span><strong>THE FIELD ATLAS</strong><small>A LIVING LIBRARY OF CREATION</small></span>
      </a>
      <div className="topbar-actions">
        <span className="room-status"><span className="status-glow" /> THE STUDY IS OPEN</span>
        <button className="icon-btn" type="button" title="Change lamplight" aria-label="Toggle lamplight" onClick={() => setPrefs(p => ({...p, night: !p.night}))}>{prefs.night ? <Moon size={19}/> : <Sun size={19}/>}</button>
        <button className="soft-btn atlas-find-button" type="button" title="Find a chapter (Ctrl or Command + K)"
          onClick={() => {setDirectoryWing('all');setDirectorySearch('');setDirectoryCollection('all');setBookPanel(null);setDirectoryOpen(true);}}>
          <Search size={17}/><span>Find a chapter</span><kbd>⌘ / Ctrl K</kbd>
        </button>
        {discovery.candidates.length > 0 && <button className="arrival-alert" type="button" onClick={() => setShelfOpen(true)} aria-label={discovery.candidates.length + ' arrivals awaiting review'}><Sparkles size={15}/> {discovery.candidates.length} arrivals</button>}
        <a className="soft-btn" href={FUTURE_ARCHIVE_URL} target="_blank" rel="noopener noreferrer" aria-label="Visit the Future Archive poster gallery"><Sparkles size={17}/> <span>Future Archive</span></a>
        <button className="soft-btn" type="button" aria-label="Curate the book" onClick={() => setShelfOpen(true)}><LibraryBig size={17}/> <span>Curate the book</span></button>
      </div>
    </header>

    <div className="intro" id="top">
      <div className="eyebrow"><Sparkles size={14}/> ENTER THE FIELD · VOLUME ONE <Sparkles size={14}/></div>
      <h1>A thousand worlds. <em>One book.</em></h1>
      <p>Come in, stay awhile. Every chapter opens a living creation.</p>
    </div>

    <aside className="xi-atlas-source-door" aria-label="Xi Phi Commons verified public website">
      <div>
        <small>DOCUMENTED CONNECTION · VERIFIED PUBLIC STATIC WEBSITE</small>
        <strong>{reviewedXiCommonsSourceEntry().title}</strong>
        <p>Independent Xi ⇄ Φ369 research collaboration. Public Gateway deployment was
          verified against source-linked hashes. R15/R16 remain local fixtures,
          R17 external crossing is blocked, and the real R18 two-host test has not run.
          This is a website doorway, not an authorized Xi protocol or installed application.</p>
      </div>
      <div className="xi-atlas-links">
        <a href={reviewedXiCommonsSourceEntry().websiteUrl}
          target="_blank" rel="noopener noreferrer"
          aria-label="Open verified live Xi Phi Commons website">Visit Commons Gateway ↗</a>
        <a href={reviewedXiCommonsSourceEntry().sourceUrl}
          target="_blank" rel="noopener noreferrer"
          aria-label="Open Xi Phi Commons source repository">GitHub source ↗</a>
      </div>
    </aside>

    {journey && journeyStops.length > 0 && <section className="tour-compass" aria-label="Guided visit controls">
      <div className="tour-compass-label"><span>✦ GUIDED WALK</span><strong>{journey.name}</strong>
        <small>Stop {tourStep+1} / {journeyStops.length} · {journeyStops.filter(p=>visitedChapters.includes(p.id)).length} passport stamps</small></div>
      <div className="tour-compass-stops">{journeyStops.map((p,i) =>
        <button key={p.id} className={`tour-stop ${i===tourStep?'tour-stop-active':''}`}
          type="button" onClick={() => visitTourStep(i)} aria-current={i===tourStep?'step':undefined}
          title={p.title} aria-label={`Visit stop ${i+1}: ${p.title}`}>
          <span>{visitedChapters.includes(p.id) ? '✦' : String(i+1)}</span><small>{p.title}</small>
        </button>)}</div>
      <div className="tour-compass-controls">
        <button type="button" onClick={() => visitTourStep(tourStep-1)} disabled={tourStep===0} aria-label="Previous tour stop"><ChevronLeft size={18}/></button>
        <button className="tour-next-button" type="button" onClick={() => visitTourStep(tourStep+1)} disabled={tourStep>=journeyStops.length-1}>{tourStep===journeyStops.length-1?'Tour complete':'Next stop'}<ChevronRight size={15}/></button>
        <button type="button" onClick={()=>setActiveTour(null)} aria-label="Leave guided tour"><X size={17}/></button>
      </div>
    </section>}

    <section id="living-book" ref={readerRef} tabIndex={-1} className="reading-stage" aria-label="Interactive book of GitHub Pages websites">
      <div className="side-ornament left-ornament" aria-hidden="true"><span className="fancy-star">✧</span><span>EXPLORE</span><i /></div>
      <div className="side-ornament right-ornament" aria-hidden="true"><span className="fancy-star">✧</span><span>IMAGINE</span><i /></div>
      <div className="book-floor" aria-hidden="true" />
      <BookForeEdge
        activePanel={bookPanel} onPanelChange={setBookPanel}
        wings={wings} wing={wing}
        onChooseWing={id => {setActiveTour(null);setWing(id);setEnteredWing(id === 'all');setCategory('All');setSearch('');}}
        onOpenMap={() => setMapOpen(true)}
        onOpenCurate={() => setShelfOpen(true)}
        focusMode={focusMode} onToggleFocus={() => focusMode ? exitFocusMode() : setFocusMode(true)}
        onLocate={scrollToReader}
        compassFilters={compassFilters} compassWing={compassWing}
        onCompassWing={id => {setCompassWing(id);setCompassNotice('');}}
        undiscoveredCount={undiscoveredCount} compassChoicesCount={compassChoices.length}
        onSurprise={surpriseMe} compassNotice={compassNotice}
        search={search} onSearch={setSearch} category={category} onCategory={setCategory}
        categories={categories} filtered={filtered} activeIndex={index}
        onGoToChapter={i => {goTo(i);scrollToReader();}}
        onOpenDirectory={() => {setDirectoryWing('all');setDirectorySearch('');setDirectoryOpen(true);}}
      />
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

          <article className="book-page portal-page" aria-label={publication ? `Research record for ${active.title}` : `Live preview of ${active.title}`}>
            <div className="folio-top dark-folio"><span>{publication ? 'THE RESEARCH RECORD' : 'THE LIVING PAGE'}</span><button className="favorite-btn" title={fav ? 'Remove bookmark' : 'Bookmark chapter'} onClick={() => toggleFavorite(active.id)} aria-label={fav ? 'Remove bookmark' : 'Bookmark this chapter'}><Bookmark size={17} fill={fav ? 'currentColor' : 'none'} /></button></div>
            <div className="portal-frame" style={{ '--portal-accent': active.accent }}>
              <div className="site-chrome">
                <div className="chrome-dots"><i/><i/><i/></div>
                <div className="address-pill"><Globe2 size={13}/><span title={active.url}>{new URL(active.url).host}{new URL(active.url).pathname}</span></div>
                <ExternalLink size={14}/>
              </div>
              <div className="iframe-shell">
                {fieldception
                  ? <MirrorChamber depth={mirrorDepth}
                      onDeeper={() => setMirrorDepth(d => nextMirrorDepth(d, 1))}
                      onSurface={() => setMirrorDepth(d => nextMirrorDepth(d, -1))} />
                  : publication
                    ? <PublicationLeaf page={active}/>
                    : !directoryOpen && <iframe key={active.id + active.url} title={`Live website: ${active.title}`} loading="lazy" src={active.url} referrerPolicy="strict-origin-when-cross-origin" sandbox={PREVIEW_SANDBOX} allow="fullscreen" allowFullScreen />}
              </div>
              <div className="preview-footnote"><span className="live-dot" /> {fieldception ? 'SAFE MIRROR CHAMBER' : publication ? 'CURATED ARCHIVE REFERENCE' : 'LIVE WEBSITE PREVIEW'} <span className="preview-hint">{fieldception ? 'Five illustrated reflections, zero recursive iframes.' : publication ? 'Zenodo is authoritative. No remote PDF is embedded.' : 'Some sites block embedding. Open the portal instead.'}</span></div>
            </div>
            <div className="portal-actions">
              <a className="gold-btn" href={active.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={15}/> {publication ? 'Open Zenodo record' : 'Open this world'}</a>
              {futureArchivePrintUrl(active.repo) && <a className="outline-btn" href={futureArchivePrintUrl(active.repo)} target="_blank" rel="noopener noreferrer"><ExternalLink size={15}/> View the art print</a>}
              {active.repo && <button type="button" className="outline-btn share-chapter" onClick={shareChapter}><Link2 size={15}/> Share chapter</button>}
              {constellationUrl && <a className="outline-btn constellation-chapter-link" href={constellationUrl} target="_blank" rel="noopener noreferrer" aria-label={'Locate '+active.title+' in Field Constellation'}><MapIcon size={15}/> View in Constellation</a>}
              <button type="button" className="outline-btn" onClick={() => setPortalOpen(true)}><Maximize2 size={15}/> Fullscreen reader</button>
            </div>
            {shareNotice && <div className="share-status" role="status">{shareNotice.startsWith('https://') ? <><span>Copy this chapter link:</span><input aria-label="Chapter link to copy" readOnly value={shareNotice} onFocus={e=>e.target.select()}/></> : shareNotice}</div>}
            <div className="folio-bottom dark-folio"><span>AN OPEN WINDOW TO THE FIELD</span><span>{String(index + 1).padStart(2,'0')} / {String(filtered.length).padStart(2,'0')}</span></div>
          </article>
          {flipping && <div className="turning-leaf" aria-hidden="true"><div className="turning-leaf-face"/><div className="turning-leaf-back"/></div>}
        </>}
      </div>
      <button type="button" className="page-turn turn-left" aria-label={wrapDestinationLabel('prev', index, filtered.length)} title={wrapDestinationLabel('prev', index, filtered.length)} disabled={!canTurnChapters(filtered.length) || !!flipping || !active} onClick={() => turn(-1)}><ChevronLeft size={25}/></button>
      <button type="button" className="page-turn turn-right" aria-label={wrapDestinationLabel('next', index, filtered.length)} title={wrapDestinationLabel('next', index, filtered.length)} disabled={!canTurnChapters(filtered.length) || !!flipping || !active} onClick={() => turn(1)}><ChevronRight size={25}/></button>
    </section>

    <section className="reading-controls" aria-label="Browse chapters">
      <div className="chapter-progress"><span className="small-label">YOUR PLACE IN THE BOOK</span><strong>{String(active ? index+1 : 0).padStart(2,'0')} <span>/</span> {String(filtered.length).padStart(2,'0')}</strong><div className="progress-track"><div style={{width:`${filtered.length ? (index+1)/filtered.length*100 : 0}%`}} /></div></div>
      <div className="chapter-filters">
        <div className="search-wrap"><Search size={16}/><input aria-label="Search chapters" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a chapter..."/></div>
        <select aria-label="Filter by category" value={category} onChange={e=>setCategory(e.target.value)}>{[...categories, 'Favorites'].map(c=><option key={c}>{c}</option>)}</select>
      </div>
      <div className="keyboard-hint"><Keyboard size={15}/> ← → turn pages · loops endlessly</div>
    </section>

    <FieldThreads active={active} threads={relatedThreads}
      documentedConnections={documentedConnections}
      visitedIds={visitedChapters} onFollow={followFieldThread} />

    <nav className="chapter-shelf" aria-label="Book chapter index">
      {filtered.map((p, i) => <button type="button" key={p.id} className={`shelf-chapter ${index===i ? 'selected' : ''}`} onClick={() => { goTo(i); scrollToReader(); }} title={p.title}>
        <span className="shelf-number">{String(i+1).padStart(2,'0')}</span><span className="shelf-icon" style={{'--accent':p.accent}}>✦</span><span className="shelf-name">{p.title}</span>{favoriteIds.includes(p.id) && <Bookmark size={11} fill="currentColor"/>}
      </button>)}
      <button type="button" className="shelf-add" onClick={()=>setShelfOpen(true)}><Plus size={17}/> Add chapter</button>
    </nav>

    <section id="study-rooms" className="study-wings" aria-label="Explore the library wings">
      <div className="wings-heading"><span>CHOOSE A ROOM</span><small>{catalog.length} available chapters · {discovery.candidates.length} awaiting review</small></div>
      <div className="wings-rail">
        {wings.map(w => {
          const count = catalog.filter(p => w.id === 'all' || wingForCategory(p.category) === w.id).length;
          return <button type="button" key={w.id} className={`wing-card ${wing===w.id?'wing-active':''}`} onClick={() => {setActiveTour(null);setWing(w.id);setEnteredWing(w.id === 'all');setCategory('All');setSearch('');}} aria-pressed={wing === w.id}>
            <span className="wing-glyph" aria-hidden="true">{w.glyph}</span><span className="wing-title">{w.name}</span>
            <small>{w.description}</small><span className="wing-count">{count} {count===1?'chapter':'chapters'}</span>
          </button>;
        })}
      </div>
      <div className="directory-shortcut"><span>{catalog.length} living chapters across the Field</span><button type="button" onClick={() => {setDirectoryWing('all');setDirectorySearch('');setDirectoryOpen(true);}}><Search size={16}/> Browse the complete directory <ArrowRight size={15}/></button></div>
    </section>

    <details className="visitor-desk">
      <summary><span className="visitor-desk-emblem">✧</span><strong>VISITOR'S DESK</strong><span>Choose a guided walk through the Field</span>
        <span className="passport-summary"><Bookmark size={14}/>{catalog.filter(p=>visitedChapters.includes(p.id)).length} of {catalog.length} explored</span>
        <ChevronRight className="visitor-desk-chevron" size={17}/></summary>
      <div className="journey-options" aria-label="Guided walks">
        {visitorJourneys.map(route => {
          const stops = availableJourneyStops(route, catalog);
          const visited = stops.filter(p => visitedChapters.includes(p.id)).length;
          return <button type="button" className="journey-card" key={route.id} disabled={!stops.length}
            style={{'--journey-accent':route.accent}} onClick={() => selectJourney(route.id)}>
            <span className="journey-glyph" aria-hidden="true">{route.glyph}</span>
            <span className="journey-kicker">{route.kicker}</span><strong>{route.name}</strong>
            <small>{route.description}</small>
            <span className="journey-foot">{stops.length} stops · {visited} stamped <ArrowRight size={14}/></span>
          </button>;
        })}
      </div>
      <div className="visitor-passport-transfer" aria-label="Back up and restore visitor passport">
        <div className="visitor-passport-transfer-copy">
          <strong>Keep your explorer's passport</strong>
          <span>Save a portable copy of your visited chapter IDs, or merge a backup into this browser. No uploads or account required.</span>
        </div>
        <div className="visitor-passport-transfer-actions">
          <button type="button" onClick={downloadPassport}><Bookmark size={14}/> Export passport</button>
          <button type="button" onClick={() => passportFileInput.current?.click()}><Plus size={14}/> Import passport</button>
          <input type="file" ref={passportFileInput} accept=".json,application/json"
            aria-label="Select visitor passport JSON backup" className="visitor-passport-import-file"
            onChange={event => { void importPassportFile(event); }} />
        </div>
        {passportNotice && <p className="visitor-passport-transfer-status" role="status">{passportNotice}</p>}
      </div>
      <p className="visitor-desk-footnote">Your passport stays in this browser unless you choose to download a backup. Imports accept only accessible chapter IDs and never overwrite bookmarks or custom chapter labels.</p>
    </details>

    <section className={`room-portal ${enteredWing ? 'room-entered' : 'room-at-door'}`} key={wing} aria-label={'Now visiting ' + activeWing.name}>
      <button type="button" className={`room-portal-arch ${enteredWing ? 'door-open' : ''}`}
        onClick={() => setEnteredWing(true)} aria-label={'Enter ' + activeWing.name} disabled={enteredWing}>
        <span className="door-light" aria-hidden="true">✧</span>
        <span className="door-leaf door-left" aria-hidden="true" /><span className="door-leaf door-right" aria-hidden="true" />
      </button>
      <div className="room-portal-text"><span className="room-portal-kicker">{enteredWing ? 'WELCOME TO THIS WING' : 'A NEW ROOM AWAITS'}</span>
        <h2>{activeWing.name}</h2><p>{activeWing.description}</p>
        {!enteredWing && <button className="room-enter-button" type="button" onClick={() => setEnteredWing(true)}>Enter this room <ArrowRight size={15}/></button>}
        {enteredWing && <small>{manifestStatus || 'The shelves are always growing.'}</small>}</div>
      <div className="room-bookshelf" aria-label="Choose a book from this room">
        {filtered.slice(0, 24).map((p,i) => <button type="button" key={p.id}
          className={`room-book ${index === i ? 'room-book-selected' : ''}`}
          style={{'--spine-color': p.accent || '#a37c51'}}
          onClick={() => { goTo(i); scrollToReader(); }} aria-label={'Open ' + p.title} title={p.title}>
          <span className="room-book-mark">✧</span><span className="room-book-name">{p.title}</span>
        </button>)}
        {filtered.length > 24 && <button className="room-more-books" type="button"
          onClick={() => {setDirectoryWing(wing);setDirectoryOpen(true);}}
          aria-label={`Browse all ${filtered.length} chapters in ${activeWing.name}. ${filtered.length - 24} more than shown on this shelf.`}
          title={`Browse all ${filtered.length} chapters in ${activeWing.name}`}>
          <span className="room-more-books-phi" aria-hidden="true">Φ</span>
          <span className="room-more-books-count" aria-hidden="true">+{filtered.length - 24} more</span>
          <span className="room-more-books-label" aria-hidden="true">Browse all <ArrowRight size={10}/></span>
        </button>}
      </div>
      {enteredWing && <div className="room-gallery">
        <div className="room-gallery-heading"><strong>Books in this room</strong><button type="button" onClick={() => {setDirectoryWing(wing);setDirectoryOpen(true);}}><Search size={13}/> View entire directory <ArrowRight size={13}/></button></div>
        <div className="room-cover-gallery">{filtered.slice(0, 8).map(p =>
          <BookCover page={p} key={p.id} compact onOpen={() => {
            setPendingChapterId(p.id);
            setDirectoryOpen(false);
          }} />
        )}</div>
      </div>}
    </section>

    <footer className="bottom-bar"><span>MADE WITH CURIOSITY · BUILT TO BE SHARED</span><button onClick={()=>setShowHelp(true)}><Info size={15}/> About the atlas</button><span>ENTER THE FIELD <span className="bottom-flower">✻</span> 2026</span></footer>

    {portalOpen && active && <div className="portal-modal" data-atlas-modal="portal" role="dialog" aria-modal="true" aria-label={`${active.title} fullscreen reader`}>
      <div className="portal-modal-header"><span><BookOpen size={19}/> {active.title} <small>{publication ? 'ZENODO RECORD' : 'LIVE SITE'}</small></span><div><a href={active.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/> Open outside atlas</a><button data-atlas-initial-focus aria-label="Close fullscreen reader" onClick={()=>setPortalOpen(false)}><X size={20}/></button></div></div>
      {fieldception
        ? <MirrorChamber depth={mirrorDepth}
            onDeeper={() => setMirrorDepth(d => nextMirrorDepth(d, 1))}
            onSurface={() => setMirrorDepth(d => nextMirrorDepth(d, -1))}/>
        : publication
          ? <PublicationLeaf page={active} fullscreen/>
          : <iframe key={'full-'+active.id} title={`Fullscreen website ${active.title}`} src={active.url} referrerPolicy="strict-origin-when-cross-origin" sandbox={PREVIEW_SANDBOX} allow="fullscreen" allowFullScreen />}
      <p className="modal-embed-hint">{fieldception ? 'The Infinite Atlas is a bounded illustration. Open outside the Atlas to view the actual site.' : publication ? 'This is an index reference, not a live PDF preview. Open Zenodo for the original record and files.' : 'If a page is blank, its host may prevent iframe embedding. Use “Open outside atlas.”'}</p>
    </div>}

    {mapOpen && <LibraryMap wings={wings} catalog={catalog} currentWing={wing} visitedIds={visitedChapters}
      onClose={() => setMapOpen(false)} onEnterWing={enterRoomFromMap} onOpenChapter={openChapterFromMap}
      journeys={visitorJourneys} activeTour={activeTour} onStartTour={(id, repo) => {setMapOpen(false);selectJourney(id, repo);}}/>}

    {directoryOpen && <div className="directory-overlay" role="presentation" onMouseDown={() => setDirectoryOpen(false)}>
      <section className="directory-panel" data-atlas-modal="directory" role="dialog" aria-modal="true" aria-labelledby="directory-title" onMouseDown={e=>e.stopPropagation()}>
        <header className="directory-head">
          <div><span className="eyebrow">THE GREAT CATALOG · VOLUME ONE</span><h2 id="directory-title">The Atlas Directory</h2><p>{catalog.length} unique chapters collected in one searchable place. Find a doorway, or return to a book you loved.</p></div>
          <button type="button" data-atlas-initial-focus className="directory-close" aria-label="Close directory" onClick={()=>setDirectoryOpen(false)}><X size={21}/></button>
        </header>
        <div className="directory-tools">
          <label className="directory-search"><Search size={16}/><input value={directorySearch} onChange={e => setDirectorySearch(e.target.value)} placeholder="Search every world, tool, and experiment..." aria-label="Search the Atlas directory" /></label>
          <select aria-label="Filter directory by wing" value={directoryWing} onChange={e=>setDirectoryWing(e.target.value)}>
            {wings.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <output className="directory-result-count" aria-live="polite">{visibleDirectoryResults.length} of {directoryCounts[directoryCollection]} chapters</output>
        </div>
        <div className="directory-collections" role="group" aria-label="Directory collections">
          {directoryCollections.map(collection => <button type="button" key={collection.id}
            className={directoryCollection === collection.id ? 'directory-collection-active' : ''}
            aria-pressed={directoryCollection === collection.id}
            onClick={() => setDirectoryCollection(collection.id)}>
            {collection.label}<span aria-hidden="true">{directoryCounts[collection.id]}</span>
          </button>)}
          <span className="directory-collections-hint">Tip: Ctrl / ⌘ + K to find a chapter</span>
        </div>
        <div className="directory-results" key={directoryCollection + directoryWing + directorySearch}>
          {visibleDirectoryResults.map(p => <article key={p.id} className={`directory-entry ${directoryPreview?.id === p.id ? 'directory-entry-peeking' : ''}`}>
            <BookCover page={p} onOpen={() => openChapterFromDirectory(p)} compact />
            <div className="directory-entry-copy"><h3>{p.title}</h3><span>{p.category} · {p.repo || 'Personal chapter'}</span>
              {(visitedChapters.includes(p.id) || favoriteIds.includes(p.id)) && <div className="directory-chapter-status">
                {visitedChapters.includes(p.id) && <span><Check size={12}/> Explored</span>}
                {favoriteIds.includes(p.id) && <span><Bookmark size={12}/> Bookmarked</span>}
              </div>}
              <p>{p.desc || 'An open door to another project.'}</p>
              <div className="directory-entry-actions">
              <button type="button" aria-expanded={directoryPreview?.id === p.id}
                aria-controls={directoryPreview?.id === p.id ? `directory-peek-${p.id}` : undefined}
                onClick={() => setDirectoryPreview(previous => previous?.id === p.id ? null : { id: p.id, live: false })}>
                <Eye size={14}/> {directoryPreview?.id === p.id ? 'Close preview' : 'Peek inside'}
              </button>
              <button type="button" onClick={() => openChapterFromDirectory(p)}><BookOpen size={14}/> Read chapter</button>
              <button type="button" onClick={() => beginEdit(p)}><Settings2 size={14}/> Edit label</button>
              <a href={p.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14}/> Visit site</a></div>
            </div>
            {directoryPreview?.id === p.id && <div className="directory-peek-slot" id={`directory-peek-${p.id}`}>
              <DirectoryPeek page={p} live={directoryPreview.live}
                onToggleLive={() => setDirectoryPreview(previous =>
                  previous?.id === p.id ? { ...previous, live: !previous.live } : previous)}
                onRead={() => openChapterFromDirectory(p)}
                onClose={() => setDirectoryPreview(null)} />
            </div>}
          </article>)}
          {!visibleDirectoryResults.length && <div className="directory-empty" role="status">
            {directoryCollection === 'visited' ? 'No explored chapters match this search. Open a book to add it to your visitor passport.' :
              directoryCollection === 'favorites' ? 'No bookmarked chapters match. Bookmark a chapter in the reader to see it here.' :
              directoryCollection === 'unexplored' ? 'No unexplored chapters match. Try a different room or clear your search.' :
              'No chapters match your search. Try a different phrase or room.'}
          </div>}
        </div>
        <p className="directory-note">Editorial category and title changes are saved only in this browser. The shared published catalog is updated through reviewed repository changes.</p>
      </section>
    </div>}

    {editorPage && <div className="directory-overlay" role="presentation" onMouseDown={() => setEditorPage(null)}>
      <section className="entry-edit-panel" data-atlas-modal="editor" role="dialog" aria-modal="true" aria-labelledby="edit-entry-title" onMouseDown={e=>e.stopPropagation()}>
        <button data-atlas-initial-focus className="directory-close edit-close" onClick={() => setEditorPage(null)} aria-label="Close editor"><X size={20}/></button>
        <span className="eyebrow">LOCAL CURATOR DESK</span><h2 id="edit-entry-title">Edit this book's label</h2>
        <p>Personalizing this label does not change GitHub or anyone else's Atlas.</p>
        <form onSubmit={saveEditedChapter} className="directory-edit-form">
          <label>Project title<input required maxLength={80} value={editForm.title} onChange={e => setEditForm(v=>({...v,title:e.target.value}))}/></label>
          <label>Library section<select value={editForm.category} onChange={e => setEditForm(v=>({...v,category:e.target.value}))}>{categories.filter(c=>c!=='All').map(c=><option key={c}>{c}</option>)}</select></label>
          <label>Description<textarea rows={3} maxLength={300} value={editForm.desc} onChange={e => setEditForm(v=>({...v,desc:e.target.value}))}/></label>
          <button className="gold-btn" type="submit"><Check size={16}/> Save my label</button>
        </form>
      </section>
    </div>}

    {showHelp && <div className="modal-cover" onMouseDown={()=>setShowHelp(false)}><section className="small-modal" data-atlas-modal="help" role="dialog" aria-modal="true" aria-labelledby="help-title" onMouseDown={e=>e.stopPropagation()}><button data-atlas-initial-focus className="modal-x" aria-label="Close" onClick={()=>setShowHelp(false)}><X/></button><span className="eyebrow">A NOTE FROM THE LIBRARY</span><h2 id="help-title">A book made of doorways.</h2><p>The Field Atlas is a real React app, wrapped in a warm study. Each chapter previews a GitHub Pages website in an iframe and offers a direct link. Some browsers and projects refuse embedded frames, so the direct link is always available.</p><p>Turn chapters with the arrows or keyboard, choose a library wing, bookmark favorites, or add sites by URL. A daily public-site manifest automatically adds verified live GitHub Pages to the shared book. Unverified suggestions remain in the private-to-this-browser approval inbox. Personal bookmarks and changes stay in this browser.</p><div className="modal-notice"><Star size={18}/> The book is a guide, never a permission grant. Embedded sites keep their own functionality and safety rules.</div></section></div>}

    {shelfOpen && <div className="modal-cover" onMouseDown={()=>setShelfOpen(false)}><section className="curate-modal" data-atlas-modal="shelf" role="dialog" aria-modal="true" aria-labelledby="curate-title" onMouseDown={e=>e.stopPropagation()}>
      <button type="button" data-atlas-initial-focus className="modal-x" aria-label="Close shelf editor" onClick={()=>setShelfOpen(false)}><X size={23}/></button>
      <span className="eyebrow"><WandSparkles size={15}/> YOUR LIBRARY, YOUR CHAPTERS</span>
      <h2 id="curate-title">Curate the Atlas</h2>
      <p className="modal-lede">Verified public GitHub Pages are added to the shared book during daily deployment. Other Pages-enabled repositories remain in the review inbox until you approve them locally. No private repository is scanned.</p>
      <p className="public-catalog-status" role="status">{manifestStatus || 'Loading the public Pages inventory…'}</p>
      <div className="discovery-controls"><button type="button" className="discover-btn scan-inline" onClick={downloadCatalogAudit}><BookOpen size={16}/> Export category audit (.json)</button><small>Read-only export of visible chapter titles, links, descriptions and categories, including personal links. Review before sharing. Nothing uploads or changes.</small></div>
      {auditNotice && <p className="sync-status" role="status">{auditNotice}</p>}
      <div className="discovery-controls"><label className="scan-toggle"><input type="checkbox" checked={discovery.autoEnabled} onChange={e => setDiscovery(d => ({...d, autoEnabled:e.target.checked}))}/> Check for new sites once daily when this browser opens the Atlas</label><button type="button" className="discover-btn scan-inline" onClick={() => scanLibrary(false)} disabled={syncing}><RefreshCw size={16} className={syncing ? 'spinning':''}/>{syncing ? 'Scanning public sites…' : 'Scan GitHub Pages now'}</button></div>
      {syncStatus && <p className="sync-status" role="status">{syncStatus}</p>}
      <section className="arrivals-board" aria-label="New project arrivals"><div className="arrivals-header"><h3><Sparkles size={18}/> New arrivals <span>{discovery.candidates.length}</span></h3><small>Suggested rooms need approval. A Pages flag does not verify a live or embeddable website.</small></div>
      {discovery.candidates.length ? <div className="arrivals-list">{discovery.candidates.map(p => <div className="arrival-entry" key={p.id}><div><strong>{p.title}</strong><small>{wings.find(w => w.id===wingForCategory(p.category))?.shortName || 'Other'} · {p.url}</small><p>{p.desc}</p></div><div className="arrival-actions"><a href={p.url} target="_blank" rel="noopener noreferrer" title={'Visit '+p.title}>Preview ↗</a><button className="arrival-approve" onClick={() => approveCandidate(p.id)}><Check size={14}/> Add chapter</button><button className="arrival-dismiss" aria-label={'Dismiss '+p.title} onClick={() => dismissCandidate(p.id)}><X size={16}/></button></div></div>)}</div> : <p className="arrivals-empty">No waiting arrivals. New public GitHub Pages projects will appear here after the next scan.</p>}</section>
      <div className="curate-grid">
        <div className="curate-left">
          <h3>Add a doorway</h3>
          <form onSubmit={addPage} className="page-form">
            <label>Chapter name<input required maxLength={80} placeholder="The next wonderful thing" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></label>
            <label>Published site URL<input type="url" required placeholder="https://michaelwave369.github.io/..." value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value,category:isZenodoEntry(e.target.value) && f.category==='Other' ? 'Publications' : f.category}))}/></label>
            <label>Category<select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{categories.filter(c=>c!=='All').map(c=><option key={c}>{c}</option>)}</select></label>
            <label>Description<textarea rows={3} maxLength={300} placeholder="What is this world for?" value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))}/></label>
            {formError && <p className="form-error">{formError}</p>}
            <button className="gold-btn" type="submit"><Plus size={16}/> Add to book</button>
          </form>
          <p className="tiny-note">Public discoveries await review in the arrivals inbox above. Only this browser sees approved custom chapters until the repository catalog is updated.</p>
        </div>
        <div className="curate-right"><div className="shelf-heading"><h3>Current chapters <small>{catalog.length}</small></h3><button title="Reset to curated ten" onClick={resetCatalog}><RotateCcw size={15}/> Reset</button></div>
          <div className="curate-list">{catalog.map((p,i)=><div key={p.id} className="curate-entry"><span className="curate-index">{String(i+1).padStart(2,'0')}</span><span className="curate-entry-main"><strong>{p.title}</strong><small>{p.url}</small></span><button className="curate-remove" title={`Remove ${p.title} from this browser's book`} aria-label={`Remove ${p.title}`} onClick={()=>removePage(p.id)}><X size={17}/></button></div>)}</div>
        </div>
      </div>
    </section></div>}
  </main>;
}

createRoot(document.getElementById('root')).render(<App/>);
