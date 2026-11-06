/**
 * R7 Living Encyclopedia: publish an evidence-oriented snapshot of PUBLIC,
 * owner-controlled GitHub repositories. Nothing here promotes a repository to
 * a verified live website; the Pages catalog remains a separate trust gate.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { publicRepositories, OWNER } from './sync-public-pages.mjs';

export const ENCYCLOPEDIA_OUTPUT = 'public/encyclopedia.json';
export const ENCYCLOPEDIA_SCHEMA = 1;
const NAME_RE = /^(?!\.{1,2}$)[A-Za-z0-9._-]{1,100}$/;
const SHA_RE = /^[a-f0-9]{40}$/i;

function isoDate(value) {
  const time = typeof value === 'string' ? Date.parse(value) : NaN;
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

export function publicDossierCandidate(repo, owner = OWNER) {
  if (!repo || repo.owner?.login?.toLowerCase() !== owner.toLowerCase() ||
    repo.private !== false || repo.visibility === 'private' ||
    !Number.isSafeInteger(repo.id) || repo.id <= 0 ||
    typeof repo.name !== 'string' || !NAME_RE.test(repo.name)) return null;
  return {
    id: repo.id,
    repo: repo.name,
    description: String(repo.description || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 300),
    language: typeof repo.language === 'string' ? repo.language.slice(0, 40) : null,
    createdAt: isoDate(repo.created_at),
    pushedAt: isoDate(repo.pushed_at),
    archived: repo.archived === true,
    fork: repo.fork === true,
    isPublic: true,
    historyStatus: 'not-checked',
    milestones: [],
  };
}

export function mergedMilestones(pulls = []) {
  if (!Array.isArray(pulls)) return [];
  const seen = new Set();
  return pulls.filter(pr => Number.isSafeInteger(pr?.number) && pr.number > 0 &&
    isoDate(pr?.merged_at) && !seen.has(pr.number) && seen.add(pr.number))
    .sort((a, b) => Date.parse(b.merged_at) - Date.parse(a.merged_at))
    .slice(0, 4)
    .map(pr => ({
      kind: 'merged-pr',
      number: pr.number,
      title: String(pr.title || 'Untitled pull request').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 140),
      date: isoDate(pr.merged_at),
      commit: SHA_RE.test(pr.merge_commit_sha || '') ? pr.merge_commit_sha.toLowerCase() : null,
    }));
}

async function pooled(items, limit, work) {
  let cursor = 0;
  const results = new Array(items.length);
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await work(items[index]);
    }
  }));
  return results;
}

export async function fetchMergedPulls(repo, { fetcher = fetch, owner = OWNER, token = '' } = {}) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'FieldAtlas-LivingEncyclopedia',
    ...(token ? { Authorization: 'Bearer ' + token } : {}),
  };
  const url = 'https://api.github.com/repos/' + owner + '/' + encodeURIComponent(repo) +
    '/pulls?state=closed&sort=updated&direction=desc&per_page=15';
  const response = await fetcher(url, { headers, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('PR read HTTP ' + response.status);
  const pulls = await response.json();
  if (!Array.isArray(pulls)) throw new Error('Malformed public PR response');
  return mergedMilestones(pulls);
}

export async function buildEncyclopediaSnapshot({ fetcher = fetch, owner = OWNER,
  token = '', now = new Date().toISOString() } = {}) {
  const raw = await publicRepositories(fetcher, owner, token);
  const unique = new Map();
  for (const candidate of raw.map(r => publicDossierCandidate(r, owner)).filter(Boolean)) {
    const key = candidate.repo.toLowerCase();
    if (!unique.has(key)) unique.set(key, candidate);
  }
  const records = [...unique.values()].sort((a,b) => a.repo.localeCompare(b.repo, 'en', {sensitivity:'base'}));
  const withHistory = await pooled(records, 6, async record => {
    try {
      const milestones = await fetchMergedPulls(record.repo, {fetcher, owner, token});
      return {...record, milestones, historyStatus:'checked'};
    } catch {
      // A failed history read is UNKNOWN, not evidence of no merges.
      return {...record, historyStatus:'unavailable'};
    }
  });
  return {
    schema_version: ENCYCLOPEDIA_SCHEMA,
    owner,
    generated_at: isoDate(now),
    complete: true,
    repository_count: withHistory.length,
    repositories: withHistory,
  };
}

async function main() {
  try {
    const result = await buildEncyclopediaSnapshot({ token: process.env.GITHUB_TOKEN || '' });
    await mkdir('public', { recursive:true });
    await writeFile(ENCYCLOPEDIA_OUTPUT, JSON.stringify(result,null,2) + '\n', 'utf8');
    console.log('R7 Encyclopedia: ' + result.repository_count + ' owner-public source dossiers; ' +
      result.repositories.filter(r=>r.historyStatus==='unavailable').length + ' PR histories unavailable.');
  } catch (error) {
    // Preserve checked-in offline fallback without forging a successful refresh.
    const old = JSON.parse(await readFile(ENCYCLOPEDIA_OUTPUT,'utf8'));
    if (old.schema_version !== ENCYCLOPEDIA_SCHEMA || old.owner !== OWNER ||
      !Array.isArray(old.repositories)) throw error;
    console.warn('R7 public inventory refresh unavailable; keeping last snapshot: ' + error.message);
  }
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await main();
