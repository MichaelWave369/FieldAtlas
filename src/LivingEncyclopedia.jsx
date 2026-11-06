import React, { useMemo, useState } from 'react';
import { BookOpen, ExternalLink, GitMerge, LibraryBig, Search, Clock3, Network, Share2 } from 'lucide-react';
import {
  readDossierQuery, findDossier, dossierConnections, dossierTimeline,
  dossierConstellationUrl, dossierShareUrl,
} from './encyclopedia-data.js';
import { constellationProjectId } from './constellation-bridge.js';

const CHUNK_SIZE = 16;
function dateLabel(value) {
  if (!value) return 'Not recorded';
  return new Date(value).toLocaleDateString('en-US', {year:'numeric',month:'short',day:'numeric'});
}

/**
 * A source dossier is not a website chapter. A dossier may exist even when
 * the public repository has no verified GitHub Pages deployment.
 */
export default function LivingEncyclopedia({
  active, dossiers = [], generatedAt, complete, status, catalog = [], publishedPages = [],
  onReadChapter,
}) {
  const [requested] = useState(() => readDossierQuery(typeof window === 'undefined' ? '' : window.location.search));
  const [chosen, setChosen] = useState(requested);
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(CHUNK_SIZE);
  const selected = findDossier(dossiers,chosen || active?.repo) || (!chosen ? dossiers[0] : null);
  const requestedMissing = Boolean(chosen && !findDossier(dossiers,chosen));
  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return dossiers;
    return dossiers.filter(d => [d.repo,d.description,d.language].join(' ').toLowerCase().includes(term));
  },[dossiers,query]);
  const timeline = useMemo(() => dossierTimeline(selected),[selected]);
  const connections = useMemo(() => dossierConnections(selected,dossiers),[selected,dossiers]);
  const chapter = selected ? catalog.find(p =>
    p?.repo?.toLowerCase() === selected.repo.toLowerCase() &&
    constellationProjectId(p,publishedPages) === 'github:' + selected.id
  ) : null;
  const constellation = dossierConstellationUrl(selected);
  const share = selected && typeof window !== 'undefined'
    ? dossierShareUrl(window.location.href,selected.repo) : null;

  return <details id="living-encyclopedia" className="atlas-encyclopedia"
    open={Boolean(requested)} aria-label="Living Encyclopedia of public source repositories">
    <summary className="atlas-encyclopedia-toggle">
      <span className="atlas-encyclopedia-crest" aria-hidden="true">Φ</span>
      <span className="atlas-encyclopedia-heading">
        <small>R7 · THE SOURCE LEDGER</small>
        <strong>The Living Encyclopedia</strong>
        <span>{dossiers.length} public source dossiers · Last refresh: {dateLabel(generatedAt)}</span>
      </span>
      <span className="atlas-encyclopedia-enter">Explore project histories →</span>
    </summary>
    <div className="atlas-encyclopedia-content">
      <p className="atlas-encyclopedia-intro">
        Every public repository gets a source dossier, even when it has no live website.
        Timestamps come from GitHub. Milestone titles are real merged pull requests, not verified
        releases, deployments or finished features. Documented links have pinned source evidence.
      </p>
      <p className="atlas-encyclopedia-status" role="status">{status}{!complete && dossiers.length ? ' · Snapshot may be incomplete.' : ''}</p>
      <div className="atlas-encyclopedia-layout">
        <aside className="atlas-encyclopedia-directory" aria-label="Public project dossier directory">
          <label htmlFor="atlas-encyclopedia-search"><Search size={15}/> Find a project</label>
          <input id="atlas-encyclopedia-search" type="search" placeholder="Project, purpose, language…"
            value={query} onChange={e => {setQuery(e.target.value);setVisible(CHUNK_SIZE);}} />
          <small>{filtered.length} public source records matching</small>
          <div className="atlas-encyclopedia-list">
            {filtered.slice(0,visible).map(d => <button type="button"
              key={d.id} className={selected?.id===d.id ? 'atlas-dossier-selected' : ''}
              aria-current={selected?.id===d.id ? 'true' : undefined}
              onClick={() => setChosen(d.repo)}>
              <span>{d.repo}</span><small>{d.archived ? 'Archived' : d.language || 'Source project'}</small>
            </button>)}
            {!filtered.length && <p className="atlas-encyclopedia-empty">No matching public dossier. Try another search.</p>}
          </div>
          {filtered.length > visible && <button className="atlas-encyclopedia-more" type="button"
            onClick={() => setVisible(n=>n+CHUNK_SIZE)}>Show more ({filtered.length-visible} remain)</button>}
          <small className="atlas-encyclopedia-disclaimer">Source records and live website chapters have separate verification rules.</small>
        </aside>
        <div className="atlas-encyclopedia-dossier" aria-live="polite">
          {requestedMissing && <p className="atlas-encyclopedia-warning" role="status">
            The requested repository is not present in this public owner snapshot. Nothing was looked up privately.
          </p>}
          {selected ? <>
            <header className="atlas-encyclopedia-dossier-head">
              <span className="atlas-encyclopedia-kicker"><LibraryBig size={15}/> VERIFIED PUBLIC GITHUB SOURCE</span>
              <h3>{selected.repo}</h3>
              <p>{selected.description || 'No public description supplied by the repository owner.'}</p>
              <div className="atlas-encyclopedia-metadata">
                <span>{selected.language || 'Language not listed'}</span>
                {selected.archived && <span>Archived repository</span>}
                {selected.fork && <span>Public fork</span>}
                <span>GitHub ID {selected.id}</span>
              </div>
            </header>
            <div className="atlas-encyclopedia-actions">
              <a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={15}/> Open source</a>
              {chapter && <button type="button" onClick={() => onReadChapter(chapter)}><BookOpen size={15}/> Read live chapter</button>}
              {constellation && <a href={constellation} target="_blank" rel="noopener noreferrer"><Network size={15}/> Locate in Constellation</a>}
              {share && <a href={share}><Share2 size={15}/> Share dossier link</a>}
            </div>
            {!chapter && <p className="atlas-encyclopedia-source-only">Source-only dossier. No verified, accessible live chapter is implied.</p>}
            <section className="atlas-encyclopedia-timeline" aria-label={'Public development history for '+selected.repo}>
              <h4><Clock3 size={16}/> Public development history</h4>
              {timeline.length ? <ol>{timeline.map(event => <li key={event.id}>
                <span className="atlas-encyclopedia-date">{dateLabel(event.date)}</span>
                <div><strong>{event.label}</strong><p>{event.detail}</p>
                  <a href={event.url} target="_blank" rel="noopener noreferrer">
                    {event.id.startsWith('pr-') ? 'Review merged PR' : 'View public repository'} <ExternalLink size={13}/>
                  </a>
                  {event.commit && <small> Merge commit: {event.commit.slice(0,12)}</small>}
                </div>
              </li>)}</ol> : <p>No dated public history in this snapshot.</p>}
              {selected.historyStatus !== 'checked' && <p className="atlas-encyclopedia-history-note">
                Recent PR history could not be checked. This does not mean no milestones exist.
              </p>}
            </section>
            <section className="atlas-encyclopedia-relations" aria-label="Source-documented relationships">
              <h4><GitMerge size={16}/> Documented project relationships</h4>
              {connections.length ? connections.map(link => <article key={link.id}>
                <div><strong>{link.direction === 'outbound' ? 'From' : 'To'} {selected.repo} · {link.label}</strong>
                  <p>{link.summary}</p><small>{link.scope}</small></div>
                <div className="atlas-encyclopedia-connection-actions">
                  <button type="button" onClick={() => setChosen(link.other.repo)}>Visit {link.other.repo} dossier</button>
                  <a href={link.evidenceUrl} target="_blank" rel="noopener noreferrer">Pinned source evidence <ExternalLink size={13}/></a>
                </div>
              </article>) : <p>No citation-pinned technical relationship is recorded for this project.
                Related titles elsewhere in the Atlas are editorial suggestions, not proof of integration.</p>}
            </section>
          </> : <div className="atlas-encyclopedia-empty">No dossier selected. The original living book and its chapters are still available above.</div>}
        </div>
      </div>
    </div>
  </details>;
}
