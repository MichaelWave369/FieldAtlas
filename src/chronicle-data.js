/**
 * R8 Field Chronicle: a dated, cross-repository view of the existing R7
 * public-owner snapshot. GitHub metadata observations and recent merged PRs
 * are evidence of source activity, never proof of deployment or completion.
 */
import { isDossierName } from './encyclopedia-data.js';
import { DOCUMENTED_CONNECTIONS } from './documented-connections.js';
import { CONNECTION_KINDS, validateDocumentedConnection } from './provenance-connections.js';

export const CHRONICLE_KINDS = Object.freeze([
  { id:'all', label:'All recorded events' },
  { id:'created', label:'Repo origins' },
  { id:'merged', label:'Merged PRs' },
  { id:'pushed', label:'Latest pushes' },
]);
const KINDS = new Set(CHRONICLE_KINDS.map(k=>k.id));
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const YEAR_RE = /^\d{4}$/;
const ID_MAX = Number.MAX_SAFE_INTEGER;
const MAX_EVENTS = 4000;

function validRecord(r) {
  return Boolean(r && r.isPublic === true && isDossierName(r.repo) &&
    Number.isSafeInteger(r.id) && r.id > 0 && r.id <= ID_MAX);
}
function dateStamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
}
function repoUrl(r) {
  return 'https://github.com/MichaelWave369/' + encodeURIComponent(r.repo);
}

/** Deduplicated, chronologically sortable evidence records, with safe URLs. */
export function createChronicleEvents(dossiers = []) {
  if (!Array.isArray(dossiers)) return [];
  const events = [], seenRepo = new Set();
  for (const r of dossiers) {
    if (!validRecord(r) || seenRepo.has(r.repo.toLowerCase())) continue;
    seenRepo.add(r.repo.toLowerCase());
    const base = {
      repo:r.repo, repositoryId:r.id, sourceUrl:repoUrl(r),
      archived:r.archived === true,
    };
    const creation = dateStamp(r.createdAt);
    if (creation) events.push({
      ...base, id:r.id+':created', kind:'created', date:creation,
      title:'Repository created', detail:'GitHub creation timestamp; not necessarily the first idea or prototype.',
      evidenceUrl:base.sourceUrl,
    });
    const pushed = dateStamp(r.pushedAt);
    if (pushed) events.push({
      ...base, id:r.id+':pushed', kind:'pushed', date:pushed,
      title:'Latest push observed', detail:'GitHub last-push timestamp; not a verified release or deployment.',
      evidenceUrl:base.sourceUrl,
    });
    const seenPr = new Set();
    for (const pr of Array.isArray(r.milestones) ? r.milestones : []) {
      const merged = dateStamp(pr?.date);
      if (pr?.kind !== 'merged-pr' || !Number.isSafeInteger(pr.number) ||
        pr.number <= 0 || !merged || seenPr.has(pr.number)) continue;
      seenPr.add(pr.number);
      events.push({
        ...base, id:r.id+':pr:'+pr.number, kind:'merged', date:merged, number:pr.number,
        title:'Merged PR #'+pr.number,
        detail:String(pr.title || 'Untitled pull request').slice(0,140),
        evidenceUrl:base.sourceUrl+'/pull/'+pr.number,
      });
    }
  }
  return events.sort((a,b)=>Date.parse(b.date)-Date.parse(a.date) ||
    a.repo.localeCompare(b.repo) || a.id.localeCompare(b.id)).slice(0,MAX_EVENTS);
}

export function getChronicleStats(dossiers = [], events = []) {
  const records = Array.isArray(dossiers) ? dossiers.filter(validRecord) : [];
  const data = Array.isArray(events) ? events : [];
  const observed = new Set(data.map(e=>e.repo.toLowerCase()));
  return {
    repositories:observed.size,
    created:data.filter(e=>e.kind==='created').length,
    merged:data.filter(e=>e.kind==='merged').length,
    pushed:data.filter(e=>e.kind==='pushed').length,
    historyUnavailable:records.filter(r=>r.historyStatus !== 'checked').length,
  };
}

export function filterChronicleEvents(events = [], { repo='all', kind='all', month='all', year='all', search='', order='newest' } = {}) {
  if (!Array.isArray(events)) return [];
  const term = typeof search === 'string' ? search.trim().toLowerCase().slice(0,100) : '';
  const monthValid = month === 'all' || MONTH_RE.test(month);
  const yearValid = year === 'all' || YEAR_RE.test(year);
  if (!monthValid || !yearValid || !KINDS.has(kind) || (repo !== 'all' && !isDossierName(repo))) return [];
  return events.filter(e=>(repo === 'all' || e.repo.toLowerCase() === repo.toLowerCase()) &&
    (kind === 'all' || e.kind === kind) &&
    (month === 'all' || e.date.slice(0,7) === month) &&
    (year === 'all' || e.date.slice(0,4) === year) &&
    (!term || [e.repo,e.title,e.detail].join(' ').toLowerCase().includes(term)))
    .sort((a,b)=>(order === 'oldest' ? Date.parse(a.date)-Date.parse(b.date) :
      Date.parse(b.date)-Date.parse(a.date)) || a.repo.localeCompare(b.repo) || a.id.localeCompare(b.id));
}

export function monthActivity(events = []) {
  if (!Array.isArray(events)) return [];
  const counts = new Map();
  for (const e of events) {
    if (!dateStamp(e?.date)) continue;
    const month = e.date.slice(0,7);
    counts.set(month,(counts.get(month) || 0)+1);
  }
  return [...counts].sort((a,b)=>b[0].localeCompare(a[0])).map(([month,count])=>({month,count}));
}

export function groupChronicleEvents(events = [], limit = 60) {
  if (!Array.isArray(events)) return [];
  const groups = [], max = Math.min(Math.max(0,Math.floor(Number(limit) || 0)),300);
  for (const event of events.slice(0,max)) {
    const month=event.date.slice(0,7);
    if (groups[groups.length-1]?.month !== month) groups.push({month,items:[]});
    groups[groups.length-1].items.push(event);
  }
  return groups;
}

/** Real cross-project documentary links, explicitly UNDATED. Never placed as events. */
export function chronicleCrossroads(dossiers = [], registry = DOCUMENTED_CONNECTIONS) {
  if (!Array.isArray(dossiers) || !Array.isArray(registry)) return [];
  const byRepo = new Map();
  for (const r of dossiers) if (validRecord(r) && !byRepo.has(r.repo.toLowerCase()))
    byRepo.set(r.repo.toLowerCase(),r);
  const seen = new Set(), result = [];
  for (const link of registry) {
    if (!validateDocumentedConnection(link) || seen.has(link.id)) continue;
    const from = byRepo.get(link.fromRepo.toLowerCase());
    const to = byRepo.get(link.toRepo.toLowerCase());
    if (!from || !to) continue;
    seen.add(link.id);
    result.push({
      id:link.id, from:from.repo, to:to.repo, kind:CONNECTION_KINDS[link.kind],
      summary:link.summary,scope:link.scope,evidenceUrl:link.evidenceUrl,
      status:'DOCUMENTED_NOT_RUNTIME_VERIFIED', dated:false,
    });
  }
  return result;
}

export function readChronicleQuery(search = '') {
  try {
    const params=new URLSearchParams(String(search).replace(/^\?/, ''));
    const choices=params.getAll('chronicle');
    if (choices.length!==1 || (choices[0]!=='all' && !isDossierName(choices[0]))) return null;
    const kinds=params.getAll('chronicleKind'),months=params.getAll('chronicleMonth');
    return {
      repo:choices[0],
      kind:kinds.length===1 && KINDS.has(kinds[0]) ? kinds[0] : 'all',
      month:months.length===1 && MONTH_RE.test(months[0]) ? months[0] : 'all',
    };
  } catch {return null;}
}

export function chronicleShareUrl(href,{repo='all',kind='all',month='all'}={}) {
  if (repo!=='all' && !isDossierName(repo)) return null;
  if (!KINDS.has(kind) || (month!=='all' && !MONTH_RE.test(month))) return null;
  try {
    const url = new URL(href);
    if (url.protocol!=='https:' && url.protocol!=='http:') return null;
    for (const key of ['chapter','tour','project','dossier','chronicle','chronicleKind','chronicleMonth'])
      url.searchParams.delete(key);
    url.searchParams.set('chronicle',repo);
    if (kind!=='all') url.searchParams.set('chronicleKind',kind);
    if (month!=='all') url.searchParams.set('chronicleMonth',month);
    url.hash='field-chronicle';
    return url.href;
  }catch{return null;}
}
