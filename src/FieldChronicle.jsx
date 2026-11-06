import React, { useMemo, useState } from 'react';
import { ArrowDownUp, BookOpen, CalendarDays, Clock3, ExternalLink, GitMerge, History, Network, Search, Share2 } from 'lucide-react';
import {
  CHRONICLE_KINDS, createChronicleEvents, filterChronicleEvents,
  groupChronicleEvents, getChronicleStats, monthActivity, chronicleCrossroads,
  readChronicleQuery, chronicleShareUrl,
} from './chronicle-data.js';
import { findDossier, dossierShareUrl, dossierConstellationUrl } from './encyclopedia-data.js';
import './chronicle.css';

const PAGE_SIZE = 48;
const PULSE_MONTHS = 14;
const EVENT_LABELS = Object.freeze({
  created:'Repository origin',merged:'Merged PR',pushed:'GitHub push observation',
});
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {year:'numeric',month:'short',day:'numeric',timeZone:'UTC'});
const MONTH_FORMAT = new Intl.DateTimeFormat('en-US', {year:'numeric',month:'long',timeZone:'UTC'});
const monthDate = month => new Date(month+'-01T12:00:00Z');
const displayMonth = month => MONTH_FORMAT.format(monthDate(month));

/**
 * Timeline is a read-only lens over the same public source snapshot as R7.
 * A date is not inferred for an undated evidence link. Every source action
 * opens GitHub, and source-only projects do not become live website chapters.
 */
export default function FieldChronicle({ dossiers = [], generatedAt, complete, status }) {
  const [requested] = useState(() =>
    readChronicleQuery(typeof window === 'undefined' ? '' : window.location.search));
  const [repo, setRepo] = useState(requested?.repo || 'all');
  const [kind, setKind] = useState(requested?.kind || 'all');
  const [month, setMonth] = useState(requested?.month || 'all');
  const [year, setYear] = useState('all');
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState('newest');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const events = useMemo(()=>createChronicleEvents(dossiers),[dossiers]);
  const stats = useMemo(()=>getChronicleStats(dossiers,events),[dossiers,events]);
  const years = useMemo(()=>[...new Set(events.map(e=>e.date.slice(0,4)))].sort((a,b)=>b.localeCompare(a)),[events]);
  const pulseEvents = useMemo(()=>filterChronicleEvents(events,{repo,kind,year,search}),[events,repo,kind,year,search]);
  const activity = useMemo(()=>monthActivity(pulseEvents),[pulseEvents]);
  const filtered = useMemo(()=>filterChronicleEvents(events,{repo,kind,month,year,search,order}),
    [events,repo,kind,month,year,search,order]);
  const groups = useMemo(()=>groupChronicleEvents(filtered,visible),[filtered,visible]);
  const crosses = useMemo(()=>chronicleCrossroads(dossiers),[dossiers]);
  const visibleCrosses = crosses.filter(c=>repo==='all' ||
    c.from.toLowerCase()===repo.toLowerCase() || c.to.toLowerCase()===repo.toLowerCase()).slice(0,8);
  const focused = repo === 'all' ? null : findDossier(dossiers,repo);
  const unknownProject = repo !== 'all' && !focused;
  const share = typeof window !== 'undefined'
    ? chronicleShareUrl(window.location.href,{repo,kind,month}) : null;
  const dossier = focused && typeof window !== 'undefined'
    ? dossierShareUrl(window.location.href,focused.repo) : null;
  const constellation = dossierConstellationUrl(focused);
  const maxActivity = Math.max(1,...activity.map(a=>a.count));

  function resetPaging(next) { setVisible(PAGE_SIZE); next(); }
  function selectMonth(value) {
    resetPaging(()=>{ setMonth(m=>m===value ? 'all' : value); setYear('all'); });
  }

  return <details id="field-chronicle" className="field-chronicle"
    open={Boolean(requested)} aria-label="The Field Chronicle, documented ecosystem timeline">
    <summary className="field-chronicle-toggle">
      <span className="field-chronicle-emblem" aria-hidden="true"><History size={28}/></span>
      <span className="field-chronicle-titles">
        <small>R8 · EVIDENCE THROUGH TIME</small>
        <strong>The Field Chronicle</strong>
        <span>Trace the public source history across projects, without rewriting the past.</span>
      </span>
      <span className="field-chronicle-open">Explore the timeline →</span>
    </summary>
    <div className="field-chronicle-content">
      <p className="field-chronicle-explainer">
        A timeline of GitHub repository origins, recent actually merged pull requests and latest-push
        observations. The Chronicle does not certify deployment, completed features or the date an idea
        first existed. PR history is a bounded recent sample, not a complete log.
      </p>
      <p className="field-chronicle-source-status" role="status">
        {status}{generatedAt ? ' · Snapshot '+DATE_FORMAT.format(new Date(generatedAt)) : ' · Snapshot date unavailable'}
        {!complete ? ' · Partial or fallback inventory' : ''}
      </p>
      <div className="field-chronicle-stats" aria-label="Public source history totals">
        <div><strong>{stats.repositories}</strong><span>Repos with dated evidence</span></div>
        <div><strong>{stats.created}</strong><span>Recorded origins</span></div>
        <div><strong>{stats.merged}</strong><span>Recent merged PRs</span></div>
        <div><strong>{stats.historyUnavailable}</strong><span>PR histories unavailable</span></div>
      </div>
      <div className="field-chronicle-controls" aria-label="Chronicle filters">
        <label>Focus on project
          <select value={repo} aria-label="Chronicle project" onChange={e=>resetPaging(()=>{setRepo(e.target.value);setMonth('all');setYear('all');})}>
            <option value="all">All public projects</option>
            {dossiers.map(d=><option key={d.id} value={d.repo}>{d.repo}</option>)}
            {unknownProject && <option value={repo}>Unavailable: {repo}</option>}
          </select>
        </label>
        <label>Year
          <select value={year} aria-label="Chronicle year" onChange={e=>resetPaging(()=>{setYear(e.target.value);setMonth('all');})}>
            <option value="all">All years</option>
            {years.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label>Month
          <select value={month} aria-label="Chronicle month" onChange={e=>resetPaging(()=>{setMonth(e.target.value);setYear('all');})}>
            <option value="all">All months</option>
            {monthActivity(events).map(m=><option key={m.month} value={m.month}>{displayMonth(m.month)}</option>)}
          </select>
        </label>
        <label>Search source events
          <span className="field-chronicle-search"><Search size={15}/>
            <input type="search" value={search} aria-label="Search Chronicle"
              placeholder="Project or PR title…" onChange={e=>resetPaging(()=>setSearch(e.target.value))}/>
          </span>
        </label>
      </div>
      <div className="field-chronicle-kinds" role="group" aria-label="Chronicle event types">
        {CHRONICLE_KINDS.map(option=><button type="button" key={option.id}
          aria-pressed={kind===option.id} onClick={()=>resetPaging(()=>{setKind(option.id);setMonth('all');})}>
          {option.label}
        </button>)}
      </div>
      <section className="field-chronicle-pulse" aria-label="Dated source-activity overview">
        <header><div><small>TEMPORAL PULSE</small><h3>Where the recorded activity clusters</h3></div>
          <span>Counts of sampled source events, not commits or release counts</span></header>
        <div className="field-chronicle-months">
          {activity.slice(0,PULSE_MONTHS).reverse().map(item=><button type="button" key={item.month}
            title={displayMonth(item.month)+': '+item.count+' recorded events'}
            aria-label={displayMonth(item.month)+': '+item.count+' recorded events. Filter Chronicle to this month.'}
            aria-pressed={month===item.month} onClick={()=>selectMonth(item.month)}>
            <span className="field-chronicle-bar-track"><span className="field-chronicle-bar"
              style={{height:Math.max(8,Math.round(100*item.count/maxActivity))+'%'}}/></span>
            <strong>{item.count}</strong><small>{item.month.slice(2)}</small>
          </button>)}
          {!activity.length && <span className="field-chronicle-no-pulse">No dated activity for these filters.</span>}
        </div>
      </section>
      <div className="field-chronicle-timeline-head">
        <div><span className="field-chronicle-kicker"><CalendarDays size={15}/> VERIFIED SOURCE EVENTS</span>
          <h3>{unknownProject ? 'Project not in the public snapshot' : repo==='all' ? 'Across the Field' : repo}</h3>
          <p>{filtered.length} matching recorded events · {visible < filtered.length ? 'Showing the first '+Math.min(visible,filtered.length) : 'Showing all matching events'}</p></div>
        <div className="field-chronicle-actions">
          {dossier && <a href={dossier}><BookOpen size={14}/> Open R7 dossier</a>}
          {constellation && <a href={constellation} target="_blank" rel="noopener noreferrer"><Network size={14}/> Constellation</a>}
          {share && <a href={share}><Share2 size={14}/> Share this view</a>}
          <button type="button" aria-label={'Order events '+(order==='newest'?'oldest first':'newest first')}
            onClick={()=>resetPaging(()=>setOrder(o=>o==='newest'?'oldest':'newest'))}>
            <ArrowDownUp size={14}/> {order==='newest'?'Newest first':'Oldest first'}
          </button>
        </div>
      </div>
      <div className="field-chronicle-stream">
        {groups.map((group,index)=><section key={group.month+':'+index}
          className="field-chronicle-month-group" aria-label={'Events in '+displayMonth(group.month)}>
          <h4><span>{displayMonth(group.month)}</span><small>{group.items.length} shown</small></h4>
          <ol>{group.items.map(event=><li key={event.id} className={'field-chronicle-event field-event-'+event.kind}>
            <span className="field-chronicle-event-dot" aria-hidden="true"/>
            <article>
              <div className="field-chronicle-event-top"><span>{EVENT_LABELS[event.kind]}</span>
                <time dateTime={event.date}>{DATE_FORMAT.format(new Date(event.date))}</time></div>
              <h5><span>{event.repo}</span> · {event.title}</h5>
              <p>{event.detail}</p>
              <div className="field-chronicle-event-actions">
                <a href={event.evidenceUrl} target="_blank" rel="noopener noreferrer">
                  {event.kind==='merged'?'Inspect merged PR':'Inspect GitHub source'} <ExternalLink size={13}/></a>
                {typeof window !== 'undefined' && <a
                  href={dossierShareUrl(window.location.href,event.repo)}>R7 dossier</a>}
              </div>
            </article>
          </li>)}</ol>
        </section>)}
        {!filtered.length && <p className="field-chronicle-empty" role="status">
          No public source events match. Clear a filter or choose another project. Missing PR history
          means *unknown*, not zero merges.
        </p>}
        {filtered.length>visible && <button type="button" className="field-chronicle-more"
          onClick={()=>setVisible(n=>n+PAGE_SIZE)}>Show more history ({filtered.length-visible} remaining)</button>}
      </div>
      <section className="field-chronicle-crossroads" aria-label="Undated evidence-backed project crossroads">
        <header><GitMerge size={19}/><div><small>DOCUMENTED · UNDATED</small>
          <h3>Crossroads between projects</h3></div></header>
        <p>Source-cited relationships are shown separately because the evidence does not establish
          when the integration became operational. Connections are documented, not independently live-tested.</p>
        {visibleCrosses.length ? <div className="field-chronicle-crossroad-grid">{visibleCrosses.map(c=>
          <article key={c.id}><strong>{c.from} → {c.to}</strong><small>{c.kind}</small>
            <p>{c.summary}</p><p className="field-chronicle-scope">{c.scope}</p>
            <a href={c.evidenceUrl} target="_blank" rel="noopener noreferrer">Commit-pinned evidence <ExternalLink size={13}/></a>
          </article>)}</div>
          : <p className="field-chronicle-empty">No reviewed, citation-pinned relationship for this view.</p>}
      </section>
      <p className="field-chronicle-footnote"><Clock3 size={14}/> This is a bounded observation of public GitHub data.
        The original Atlas book, local passport and verified Pages catalog remain independent.</p>
    </div>
  </details>;
}
