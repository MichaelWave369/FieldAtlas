import React, { useEffect, useMemo, useRef } from 'react';
import { ArrowRight, BookOpen, Compass, DoorOpen, X } from 'lucide-react';
import { canEnterMapRoom, getAtlasMapRooms } from './library-map.js';

/**
 * A purely presentational floor plan: real buttons sit ABOVE decorative SVG
 * lines. No WebGL, tracking, iframe, external assets, or layout side effects.
 */
export default function LibraryMap({ wings, catalog, currentWing, visitedIds, onClose, onEnterWing, onOpenChapter }) {
  const rooms = useMemo(() => getAtlasMapRooms(wings, catalog, visitedIds), [wings, catalog, visitedIds]);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    closeRef.current?.focus();
    return () => {
      if (previouslyFocused?.isConnected && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
    };
  }, []);

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const interactive = Array.from(dialogRef.current?.querySelectorAll(
      'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
    ) || []).filter(element => !element.hidden && element.getClientRects().length > 0);
    if (!interactive.length) return;
    const first = interactive[0], last = interactive[interactive.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return <div className="atlas-map-backdrop" role="presentation" onMouseDown={event => {
    if (event.target === event.currentTarget) onClose();
  }}>
    <section className="atlas-map-dialog" ref={dialogRef} role="dialog" aria-modal="true"
      aria-labelledby="atlas-map-title" aria-describedby="atlas-map-intro" onKeyDown={handleKeyDown}>
      <header className="atlas-map-header">
        <div className="atlas-map-header-mark" aria-hidden="true"><Compass size={27}/></div>
        <div>
          <span className="atlas-map-eyebrow">THE FIELD ATLAS · A CARTOGRAPHER'S VIEW</span>
          <h2 id="atlas-map-title">The Living Library Map</h2>
          <p id="atlas-map-intro">Six doorways. One shared book. Choose a wing or open a chapter right from the map.</p>
        </div>
        <button className="atlas-map-close" type="button" ref={closeRef} onClick={onClose} aria-label="Close library map"><X size={22}/></button>
      </header>
      <div className="atlas-map-scroll">
        <div className="atlas-map-paper">
          <div className="atlas-map-compass" aria-hidden="true"><span>N</span><span>✥</span><span>S</span></div>
          <svg className="atlas-map-routes" viewBox="0 0 1000 625" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <g stroke="currentColor" strokeWidth="3" strokeDasharray="7 11" fill="none" strokeLinecap="round">
              <path d="M500 305 Q 325 307 172 124"/>
              <path d="M500 305 Q 690 300 834 124"/>
              <path d="M500 305 Q 320 309 160 318"/>
              <path d="M500 305 Q 681 319 842 318"/>
              <path d="M500 305 Q 501 433 498 518"/>
            </g>
            <g stroke="currentColor" fill="none" strokeWidth="2">
              <circle cx="500" cy="305" r="63"/><circle cx="500" cy="305" r="72" strokeDasharray="3 14"/>
              <circle cx="172" cy="124" r="10"/><circle cx="834" cy="124" r="10"/>
              <circle cx="160" cy="318" r="10"/><circle cx="842" cy="318" r="10"/><circle cx="498" cy="518" r="10"/>
            </g>
          </svg>
          <div className="atlas-map-floorplan" aria-label="Library rooms and connecting pathways">
            {rooms.map(room => <article key={room.id} className={`atlas-map-room map-room-${room.position} ${room.id === currentWing ? 'map-room-current' : ''}`}>
              <div className="atlas-map-room-top"><span className="atlas-map-room-glyph" aria-hidden="true">{room.glyph}</span>
                {room.id === currentWing && <span className="atlas-map-you-are-here">YOU ARE HERE</span>}</div>
              <h3>{room.id === 'all' ? 'The Great Atrium' : room.name}</h3>
              <p className="atlas-map-room-desc">{room.description}</p>
              <div className="atlas-map-room-meta"><span>{room.count} {room.count === 1 ? 'book' : 'books'}</span><span>{room.visitedCount} visited</span></div>
              <button className="atlas-map-enter" type="button" disabled={!canEnterMapRoom(room)}
                onClick={() => onEnterWing(room.id)}>
                <DoorOpen size={14}/> {room.id === 'all' ? 'Open the whole library' : 'Enter wing'} <ArrowRight size={13}/>
              </button>
              {!!room.previews.length && <div className="atlas-map-preview" aria-label={'A few books from ' + room.name}>
                {room.previews.map(page => <button type="button" key={page.id} title={'Read ' + page.title}
                  onClick={() => onOpenChapter(page)}><BookOpen size={12}/><span>{page.title}</span></button>)}
              </div>}
            </article>)}
          </div>
          <p className="atlas-map-watermark" aria-hidden="true">EVERY DOORWAY LEADS BACK TO THE FIELD · ✧ · MMXXVI</p>
        </div>
      </div>
      <footer className="atlas-map-footer">
        <span><Compass size={15}/> {catalog.length} accessible chapters · Your visit stamps stay in this browser</span>
        <button type="button" onClick={onClose}><BookOpen size={15}/> Return to the Book</button>
      </footer>
    </section>
  </div>;
}
