/**
 * Build a public, verified GitHub Pages chapter list at deploy time.
 *
 * Public owner metadata only. Private repos never enter the manifest.
 * A Pages flag alone is NOT proof of a published, usable website.
 * The probe makes an HTTP HEAD/GET request to the owner github.io URL,
 * accepts HTTPS redirects (e.g. to a custom domain), and confirms HTML.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { inferCategory } from '../src/catalog.js';
import { curateProject } from '../src/curation.js';

export const OWNER = 'MichaelWave369';
export const OUTPUT = 'public/pages-discovered.json';

export function pagesCandidate(repo, owner = OWNER) {
  if (!repo || repo.owner?.login?.toLowerCase() !== owner.toLowerCase()
    || repo.private || repo.visibility === 'private' || repo.archived || !repo.has_pages
    || typeof repo.name !== 'string' || !/^[a-zA-Z0-9._-]+$/.test(repo.name)) return null;
  const host = owner.toLowerCase() + '.github.io';
  return {
    id: 'gh-' + String(repo.id),
    repo: repo.name,
    title: repo.name.replace(/[-_]/g, ' '),
    desc: String(repo.description || 'Another live project from the Field.').slice(0, 300),
    url: 'https://' + host + (repo.name.toLowerCase() === host ? '/' : '/' + encodeURIComponent(repo.name) + '/'),
  };
}

export async function publicRepositories(fetcher = fetch, owner = OWNER, token = '') {
  const result = [];
  for (let page = 1; page <= 10; page++) {
    const response = await fetcher('https://api.github.com/users/' + owner + '/repos?per_page=100&page=' + page + '&type=owner&sort=full_name', {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'FieldAtlas-PublicCatalog',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error('Public GitHub repository discovery HTTP ' + response.status);
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error('Malformed repository inventory');
    result.push(...batch);
    if (batch.length < 100) break;
  }
  return result;
}

export async function probePages(url, fetcher = fetch) {
  try {
    const response = await fetcher(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'FieldAtlas-PagesVerifier' },
    });
    if (response.ok && new URL(response.url || url).protocol === 'https:'
      && (response.headers.get('content-type') || '').toLowerCase().includes('text/html')) {
      return { reachable: true, url: response.url || url };
    }
    // Some hosts do not implement HEAD; retry a bounded GET only for method errors.
    if (![403, 405, 501].includes(response.status)) return { reachable: false, reason: 'HTTP ' + response.status };
  } catch {
    // Attempt GET below; no site is promoted based on a failed HEAD.
  }
  try {
    const response = await fetcher(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'FieldAtlas-PagesVerifier', Range: 'bytes=0-2048' },
    });
    if (response.body?.cancel) await response.body.cancel();
    if (response.ok && new URL(response.url || url).protocol === 'https:'
      && (response.headers.get('content-type') || '').toLowerCase().includes('text/html')) {
      return { reachable: true, url: response.url || url };
    }
    return { reachable: false, reason: 'HTTP ' + response.status };
  } catch {
    return { reachable: false, reason: 'Network or timeout' };
  }
}

async function parallelMap(items, limit, worker) {
  let next = 0;
  const result = Array(items.length);
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      result[index] = await worker(items[index]);
    }
  }));
  return result;
}

export async function buildManifest({ fetcher = fetch, owner = OWNER, token = '' } = {}) {
  const repositories = await publicRepositories(fetcher, owner, token);
  const candidates = repositories.map(r => pagesCandidate(r, owner)).filter(Boolean);
  const probes = await parallelMap(candidates, 8, c => probePages(c.url, fetcher));
  const pages = candidates.flatMap((item, i) => probes[i].reachable ? [curateProject({
    ...item,
    url: probes[i].url,
    verified: true,
    category: inferCategory(item.repo, item.desc),
    published: true,
  })] : []);
  pages.sort((a, b) => a.repo.localeCompare(b.repo, 'en', { sensitivity: 'base' }));
  return {
    schema_version: 1,
    owner,
    generated_at: new Date().toISOString(),
    publicly_listed_repos: repositories.length,
    pages_enabled: candidates.length,
    verified_count: pages.length,
    unavailable_count: candidates.length - pages.length,
    pages,
  };
}

async function main() {
  try {
    const manifest = await buildManifest({ token: process.env.GITHUB_TOKEN || '' });
    await mkdir('public', { recursive: true });
    await writeFile(OUTPUT, JSON.stringify(manifest, null, 2) + '\n');
    console.log('FieldAtlas: ' + manifest.publicly_listed_repos + ' public repos; '
      + manifest.pages_enabled + ' Pages-enabled; ' + manifest.verified_count + ' verified live HTML pages; '
      + manifest.unavailable_count + ' currently unverified.');
  } catch (error) {
    // Keep a last-known manifest when the API is down; never publish bogus sites.
    try {
      const backup = JSON.parse(await readFile(OUTPUT, 'utf8'));
      if (backup.schema_version !== 1 || !Array.isArray(backup.pages)) throw new Error('No valid last-known manifest');
      console.warn('Discovery unavailable; using checked-in manifest: ' + error.message);
    } catch {
      throw error;
    }
  }
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) await main();
