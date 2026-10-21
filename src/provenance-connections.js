import { safeUrl } from './catalog.js';
import { DOCUMENTED_CONNECTIONS, CONNECTION_STATUS } from './documented-connections.js';

export const CONNECTION_KINDS = Object.freeze({
  'navigation-link': 'Navigation / public link',
  'creative-handoff': 'Creative handoff contract',
  'runtime-adapter': 'Runtime adapter contract',
});

function repoId(value) {
  return String(value || '').trim().toLowerCase();
}

function eligiblePage(page) {
  return Boolean(page && repoId(page.repo) && safeUrl(page.url));
}

/** Verify schema and fixed, commit-pinned HTTPS public source citations. */
export function validateDocumentedConnection(entry) {
  if (!entry || !entry.id || !CONNECTION_KINDS[entry.kind] ||
    !entry.fromRepo || !entry.toRepo || repoId(entry.fromRepo) === repoId(entry.toRepo) ||
    !entry.summary || !entry.scope) return false;
  try {
    const evidence = new URL(entry.evidenceUrl);
    return evidence.protocol === 'https:' && evidence.hostname === 'github.com' &&
      /^\/MichaelWave369\/[\w.-]+\/blob\/[a-f0-9]{40}\/README\.md$/i.test(evidence.pathname) &&
      /^#L\d+(?:-L\d+)?$/.test(evidence.hash);
  } catch { return false; }
}

/**
 * Resolve only entries with BOTH endpoints already in the accessible Atlas.
 * Inbound claims are displayed as inbound; direction is never flipped.
 * No user-authored labels or descriptions become sourced provenance.
 */
export function resolveDocumentedConnections(active, catalog = [], registry = DOCUMENTED_CONNECTIONS) {
  if (!eligiblePage(active) || !Array.isArray(catalog) || !Array.isArray(registry)) return [];
  const byRepo = new Map();
  for (const page of catalog) {
    if (eligiblePage(page) && !byRepo.has(repoId(page.repo))) byRepo.set(repoId(page.repo),page);
  }
  if (byRepo.get(repoId(active.repo))?.id !== active.id) return [];
  const seen = new Set();
  const result = [];
  for (const entry of registry) {
    if (!validateDocumentedConnection(entry) || seen.has(entry.id)) continue;
    const from=byRepo.get(repoId(entry.fromRepo));
    const to=byRepo.get(repoId(entry.toRepo));
    if (!from || !to || from.id === to.id) continue;
    const outbound=from.id === active.id;
    const inbound=to.id === active.id;
    if (!outbound && !inbound) continue;
    seen.add(entry.id);
    result.push({
      id:entry.id, page:outbound ? to : from, direction:outbound ? 'outbound' : 'inbound',
      kind:entry.kind, label:CONNECTION_KINDS[entry.kind], summary:entry.summary,
      scope:entry.scope, evidenceUrl:entry.evidenceUrl,
      status:CONNECTION_STATUS,
    });
  }
  return result;
}
