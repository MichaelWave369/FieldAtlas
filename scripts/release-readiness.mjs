import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const REQUIRED_MANUAL_CHECKS = Object.freeze([
  'desktop-chromium','mobile-touch','keyboard-focus','screen-reader',
  'reduced-motion','project-embedding','live-catalog','passport-transfer',
  'share-seo','performance','domain-control','domain-rollout-plan',
]);

/**
 * Pending is not accepted. CI validates the ledger's format but never signs
 * off for a human or changes the domain.
 */
export function inspectReleaseAcceptance(ledger, candidateCommit = '') {
  const errors = [];
  if (!ledger || ledger.schema !== 'field-atlas-manual-release-acceptance-v1')
    errors.push('Unsupported release acceptance schema.');
  if (!Array.isArray(ledger?.checks)) errors.push('Missing acceptance checks.');
  const checks = Array.isArray(ledger?.checks) ? ledger.checks : [];
  const seen = new Set();
  for (const entry of checks) {
    if (!entry || typeof entry.id !== 'string' || seen.has(entry.id)) {
      errors.push('Missing or duplicate check identifier.');
      continue;
    }
    seen.add(entry.id);
    if (!['PENDING','PASS','FAIL','BLOCKED'].includes(entry.status))
      errors.push('Invalid status: ' + entry.id);
    if (entry.status === 'PASS' && (!entry.evidence || !String(entry.evidence).trim()))
      errors.push('PASS requires referenced evidence: ' + entry.id);
  }
  for (const id of REQUIRED_MANUAL_CHECKS)
    if (!seen.has(id)) errors.push('Missing required manual check: ' + id);
  if (ledger?.canonicalOrigin !== 'https://michaelwave369.github.io/FieldAtlas/')
    errors.push('Release candidate must retain the current canonical origin.');
  const pending = checks.filter(entry => entry.status !== 'PASS').map(entry => entry.id);
  const commitMatches = Boolean(candidateCommit && ledger?.reviewedCommit === candidateCommit);
  const manualApproval = Boolean(ledger?.disposition === 'APPROVED' &&
    ledger?.reviewer && ledger?.signedAt && commitMatches && pending.length === 0);
  if (ledger?.disposition === 'APPROVED' && !manualApproval)
    errors.push('Approval missing reviewer, date, matching commit, or passing evidence.');
  return {
    schema:'field-atlas-release-readiness-report-v1',
    approved: errors.length === 0 && manualApproval,
    manualChecksPassed: checks.length - pending.length,
    manualChecksTotal: REQUIRED_MANUAL_CHECKS.length,
    pending, errors,
    warning:'AUTOMATED E2E AND STATIC CI ARE NOT MANUAL ACCEPTANCE OR DNS AUTHORIZATION',
  };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const file = process.argv[2] && !process.argv[2].startsWith('--')
    ? process.argv[2] : 'release/acceptance.json';
  const ledger = JSON.parse(readFileSync(resolve(file),'utf8'));
  const commit = process.env.GITHUB_SHA || process.env.FIELD_ATLAS_RELEASE_COMMIT || '';
  const report = inspectReleaseAcceptance(ledger, commit);
  process.stdout.write(JSON.stringify(report,null,2) + '\n');
  // --check validates ledger structure without declaring release readiness.
  // --gate is an explicit release promotion gate and fails until signoff.
  if (report.errors.length || (process.argv.includes('--gate') && !report.approved))
    process.exitCode = 1;
}
