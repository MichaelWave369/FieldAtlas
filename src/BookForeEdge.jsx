import React from 'react';
import {
  BookOpen, Bookmark, ChevronRight, Compass, Keyboard, LibraryBig,
  Map as MapIcon, Maximize2, Search, Settings2, Sparkles, X,
} from 'lucide-react';

/**
 * The book's physical-looking fore-edge index.
 * Content remains mounted once: these tabs operate the original reader/catalog.
 */
const tabs = [
  { id: 'rooms', label: 'Rooms', glyph: '✧', Icon: LibraryBig },
  { id: 'reader', label: 'Reader', glyph: '◇', Icon: BookOpen },
  { id: 'discover', label: 'Discover', glyph: '✦', Icon: Compass },
  { id: 'chapters', label: 'Chapters', glyph: '☷', Icon: Bookmark },
  { id: 'map', label: 'Map', glyph: '⌖', Icon: MapIcon },
  { id: 'curate', label: 'Curate', glyph: '✎', Icon: Settings2 },
];
const panelNames = { rooms: 'Explore the rooms', reader: 'Reader controls', discover: 'Discovery Compass', chapters: 'Chapter index' };

export default function BookForeEdge({
  activePanel, onPanelChange, wings, wing, onChooseWing,
  onOpenMap, onOpenCurate, focusMode, onToggleFocus, onLocate,
  compassFilters, compassWing, onCompassWing, undiscoveredCount,
  compassChoicesCount, onSurprise, compassNotice, search, onSearch,
  category, onCategory, categories, filtered, activeIndex, onGoToChapter,
  onOpenDirectory,
}) {
  const chooseTab = id => {
    if (id === 'map') { onPanelChange(null); onOpenMap(); return; }
    if (id === 'curate') { onPanelChange(null); onOpenCurate(); return; }
    onPanelChange(previous => previous === id ? null : id);
  };
  const firstVisible = search.trim() ? 0 : Math.max(0, activeIndex - 3);
  const chapterPreview = filtered.slice(firstVisible, firstVisible + 10);

  return <>
    <nav className="book-edge-index" aria-label="Index tabs along the right edge of the book">
      {tabs.map(({ id, label, glyph, Icon }, step) => {
        const isPanel = Object.hasOwn(panelNames, id);
        const selected = activePanel === id;
        return <button type="button" key={id}
          className={`book-edge-tab ${selected ? 'book-edge-tab-open' : ''}`}
          style={{ '--tab-step': step }}
          aria-expanded={isPanel ? selected : undefined}
          aria-controls={selected ? `book-panel-${id}` : undefined}
          aria-haspopup={!isPanel ? 'dialog' : undefined}
          aria-label={`Open ${label.toLowerCase()} ${isPanel ? 'tab' : 'view'}`}
          onClick={() => chooseTab(id)}>
          <span className="book-tab-number" aria-hidden="true">{String(step + 1).padStart(2, '0')}</span>
          <Icon size={16} strokeWidth={1.6} aria-hidden="true"/>
          <span className="book-tab-label">{label}</span>
          <span className="book-tab-glyph" aria-hidden="true">{glyph}</span>
        </button>;
      })}
    </nav>

    {activePanel && <aside className="book-edge-panel" id={`book-panel-${activePanel}`}
      aria-label={panelNames[activePanel]} role="region">
      <header className="book-edge-panel-head">
        <div><span className="book-edge-eyebrow">THE FIELD ATLAS · BOOK INDEX</span>
          <h2>{panelNames[activePanel]}</h2></div>
        <button type="button" className="book-edge-close" onClick={() => onPanelChange(null)} aria-label="Close book index panel"><X size={19}/></button>
      </header>

      {activePanel === 'rooms' && <>
        <p className="book-edge-lede">Every wing has its own worlds. Choose a room to open its pages.</p>
        <div className="book-edge-room-grid">
          {wings.map(w => <button key={w.id} type="button"
            className={`book-edge-room ${wing === w.id ? 'is-selected' : ''}`}
            aria-pressed={wing === w.id}
            onClick={() => {onChooseWing(w.id); onPanelChange(null);}}>
            <span className="book-edge-room-glyph" aria-hidden="true">{w.glyph}</span>
            <span>{w.name}</span><ChevronRight size={14}/>
          </button>)}
        </div>
        <button className="book-edge-secondary" type="button" onClick={() => {onPanelChange(null); onOpenMap();}}><MapIcon size={16}/> Explore the library map</button>
      </>}

      {activePanel === 'reader' && <>
        <p className="book-edge-lede">Turn the pages of the living book, or step into the quiet Reader's Sanctuary.</p>
        <div className="book-edge-action-stack">
          <button type="button" className="book-edge-primary" onClick={() => {onPanelChange(null); onToggleFocus();}} aria-pressed={focusMode}>
            <Maximize2 size={17}/>{focusMode ? 'Return to the library' : 'Enter Focus Mode'}
          </button>
          <button type="button" className="book-edge-secondary" onClick={() => {onPanelChange(null);onLocate();}}>
            <BookOpen size={17}/> Back to the open book
          </button>
        </div>
        <p className="book-edge-tip"><Keyboard size={15}/> Use left and right arrow keys to turn pages when no menu is open.</p>
      </>}

      {activePanel === 'discover' && <>
        <p className="book-edge-lede">An unexpected doorway awaits. The compass favors worlds you haven't visited.</p>
        <label className="book-edge-field" htmlFor="book-edge-compass">Explore a room
          <select id="book-edge-compass" value={compassWing}
            onChange={e => onCompassWing(e.target.value)}>
            {compassFilters.map(choice => <option key={choice.id} value={choice.id}>{choice.title}</option>)}
          </select>
        </label>
        <div className="book-edge-discovery-meta">{undiscoveredCount} chapters not yet visited</div>
        <button type="button" className="book-edge-primary" disabled={!compassChoicesCount}
          onClick={onSurprise}><Sparkles size={17}/> Surprise Me <ChevronRight size={15}/></button>
        {compassNotice && <p className="book-edge-notice" role="status">{compassNotice}</p>}
      </>}

      {activePanel === 'chapters' && <>
        <p className="book-edge-lede">{filtered.length} chapters on this shelf. Find a world, or browse the entire library.</p>
        <label className="book-edge-field" htmlFor="book-edge-search">Search chapters
          <span className="book-edge-input"><Search size={16}/><input id="book-edge-search" value={search}
            onChange={e => onSearch(e.target.value)} placeholder="Find a chapter…"/></span>
        </label>
        <label className="book-edge-field" htmlFor="book-edge-category">Category
          <select id="book-edge-category" value={category}
            onChange={e => onCategory(e.target.value)}>
            {[...categories, 'Favorites'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <div className="book-edge-chapter-list" aria-label="Matching chapters">
          {chapterPreview.map((p, offset) => {
            const i = firstVisible + offset;
            return <button type="button" key={p.id} className={i === activeIndex ? 'is-selected' : ''}
              aria-current={i === activeIndex ? 'page' : undefined}
              onClick={() => {onGoToChapter(i);onPanelChange(null);}}>
              <span>{String(i + 1).padStart(2, '0')}</span><strong>{p.title}</strong>
            </button>;
          })}
          {!chapterPreview.length && <p className="book-edge-empty">No chapters match. Clear your search or change the category.</p>}
        </div>
        <button type="button" className="book-edge-secondary" onClick={() => {onPanelChange(null);onOpenDirectory();}}>
          <Search size={16}/> Browse complete chapter directory
        </button>
      </>}
    </aside>}
  </>;
}
