import React from 'react';
import { ArrowRight, BookOpen, Check, GitBranch, Sparkles } from 'lucide-react';
import { categoryPalette } from './curation.js';

/**
 * A small optional constellation panel, not a second book or navigation modal.
 * Suggestions are computed from catalog metadata, not asserted integrations.
 */
export default function FieldThreads({ active, threads, visitedIds = [], onFollow }) {
  if (!active || !threads?.length) return null;
  const visited = new Set(visitedIds);
  return <details className="field-threads" key={active.id}>
    <summary className="field-threads-toggle">
      <span className="field-threads-toggle-glyph" aria-hidden="true">✧</span>
      <span className="field-threads-toggle-copy">
        <strong>THE FIELD CONSTELLATION</strong>
        <small>{threads.length} neighboring chapters · Find the threads between worlds</small>
      </span>
      <span className="field-threads-action">Explore connections <ArrowRight size={15}/></span>
    </summary>
    <div className="field-threads-content">
      <header className="field-threads-heading">
        <span className="field-threads-eyebrow"><Sparkles size={14}/> CONNECTED BY CURIOSITY</span>
        <h3>One world leads to another.</h3>
        <p>Explore related corners of the same library. These are suggested paths based on chapter labels and descriptions, not verified technical integrations.</p>
      </header>
      <div className="field-threads-network" aria-label={'Chapter constellation around ' + active.title}>
        <div className="field-threads-center" aria-label={'Current chapter: ' + active.title}>
          <span className="field-threads-center-mark" aria-hidden="true">Φ</span>
          <span>CURRENT CHAPTER</span>
          <strong>{active.title}</strong>
          <small>{active.category}</small>
        </div>
        <div className="field-threads-neighbors">
          {threads.map(({ page, reason, reasonKind }) => {
            const accent = page.accent || (categoryPalette[page.category] || categoryPalette.Other).color;
            return <button type="button" key={page.id} className="field-thread-link"
              onClick={() => onFollow(page)}
              aria-label={'Explore related chapter ' + page.title + '. ' + reason}
              style={{ '--thread-accent': accent }}>
              <span className="field-thread-mark" aria-hidden="true"><GitBranch size={16}/></span>
              <span className="field-thread-copy">
                <strong>{page.title}</strong>
                <span>{page.category} · {reason}</span>
              </span>
              {visited.has(page.id) && <Check className="field-thread-visited" size={15} aria-label="Already explored"/>}
              <BookOpen className="field-thread-arrow" size={15} aria-hidden="true"/>
            </button>;
          })}
        </div>
      </div>
      <p className="field-threads-note">The constellation is built entirely from chapters already available in this Atlas. Opening a suggested chapter uses the original reader and visitor passport.</p>
    </div>
  </details>;
}
