import React from 'react';
import { BookOpen, ExternalLink, Play, Square, X } from 'lucide-react';
import { categoryPalette } from './curation.js';
import { directoryPreviewHost, directoryPreviewKind } from './directory-preview.js';
import { PREVIEW_SANDBOX } from './preview-policy.js';

/**
 * A single optional live window, mounted only for the one expanded book.
 * The default illustration is original Atlas artwork, not a site screenshot.
 */
export default function DirectoryPeek({ page, live, onToggleLive, onRead, onClose }) {
  const palette = categoryPalette[page.category] || categoryPalette.Other;
  const kind = directoryPreviewKind(page);
  const glyph = page.coverGlyph || palette.glyph || '✧';
  return <section className="directory-peek" aria-label={'Chapter preview: ' + page.title}
    style={{ '--peek-accent': page.accent || palette.color }}>
    <div className="directory-peek-heading">
      <div><span className="directory-peek-eyebrow">A WINDOW INTO THE FIELD</span>
        <h4>{page.title}</h4><small>{page.category} · {directoryPreviewHost(page)}</small></div>
      <button type="button" className="directory-peek-close" aria-label={'Close preview of ' + page.title}
        onClick={onClose}><X size={17}/></button>
    </div>

    {kind === 'website' && live
      ? <div className="directory-peek-live">
          <iframe title={'Sandboxed directory preview: ' + page.title} src={page.url}
            loading="lazy" referrerPolicy="strict-origin-when-cross-origin"
            sandbox={PREVIEW_SANDBOX} allow="fullscreen" allowFullScreen />
        </div>
      : <div className="directory-peek-illustration" aria-label={'Illustrated cover for ' + page.title}>
          <span className="directory-peek-ring ring-one" aria-hidden="true"/>
          <span className="directory-peek-ring ring-two" aria-hidden="true"/>
          <span className="directory-peek-glyph" aria-hidden="true">{glyph}</span>
          <span className="directory-peek-art-label">FIELD ATLAS · ILLUSTRATED COVER</span>
        </div>}

    <p className="directory-peek-description">{page.desc || 'A doorway to another creative world.'}</p>
    {page.pullquote && <p className="directory-peek-quote">“{page.pullquote}”</p>}
    <div className="directory-peek-controls">
      {kind === 'website' && <button type="button" onClick={onToggleLive}
        className="directory-peek-live-button" aria-pressed={live}>
        {live ? <Square size={14}/> : <Play size={14}/>}
        {live ? 'Stop live preview' : 'Launch live preview'}
      </button>}
      <button type="button" onClick={onRead}><BookOpen size={14}/> Read in the book</button>
      <a href={page.url} target="_blank" rel="noopener noreferrer">
        <ExternalLink size={14}/>{kind === 'research' ? 'Open research record' : 'Open original site'}
      </a>
    </div>
    <p className="directory-peek-note">
      {kind === 'research' ? 'Research records are referenced, not embedded. Zenodo hosts the authoritative files.' :
        kind === 'mirror' ? 'The Atlas mirror is a bounded illustration. Open its chapter to explore the reflections.' :
        kind === 'unavailable' ? 'No safe website URL is available for this chapter.' :
        live ? 'This is a restricted embedded preview. Blank content does not prove the site is offline. Open original site for storage, audio, VR and other full-tab features.' :
        'This illustration is not a screenshot. Launching a preview loads one external website with limited permissions.'}
    </p>
  </section>;
}
