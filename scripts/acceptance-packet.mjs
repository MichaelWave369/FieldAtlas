import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { inspectReleaseAcceptance } from './release-readiness.mjs';

/**
 * Capture GitHub/Playwright machine evidence without pretending the human
 * launch checklist has passed. JSON reporter stats come from a single run.
 */
export function summarizePlaywrightEvidence(report) {
  if (!report || !report.stats || !Number.isInteger(report.stats.expected) ||
      !Number.isInteger(report.stats.unexpected) || !Number.isInteger(report.stats.skipped) ||
      !Number.isInteger(report.stats.flaky) || report.stats.expected < 0 ||
      report.stats.unexpected < 0 || report.stats.skipped < 0 || report.stats.flaky < 0) {
    return { status: 'NOT_RUN', passed: 0, failed: 0, flaky: 0, skipped: 0, projects: [] };
  }
  const { expected, unexpected, flaky, skipped } = report.stats;
  const projects = Array.isArray(report.config?.projects) ?
    report.config.projects.map(item => item.name).filter(name => typeof name === 'string') : [];
  return {
    status: unexpected ? 'FAIL' : flaky ? 'RETRY_WARNING' : expected ? 'PASS' : 'NOT_RUN',
    passed: expected, failed: unexpected, flaky, skipped, projects,
  };
}

export function makeAcceptancePacket({
  ledger, playwrightReport, sha = '', runId = '', repository = '', channel = 'candidate',
  generatedAt = new Date().toISOString(),
}) {
  const automated = summarizePlaywrightEvidence(playwrightReport);
  const human = inspectReleaseAcceptance(ledger, sha);
  const permittedChannel = channel === 'deployed' ? 'deployed' : 'candidate';
  const sourceLink = /^[0-9]+$/.test(String(runId)) &&
    /^[-\w]+\/[-\w.]+$/.test(repository) ?
    'https://github.com/' + repository + '/actions/runs/' + runId : null;
  return {
    schema: 'field-atlas-acceptance-packet-v1',
    generatedAt,
    sourceCommit: /^[a-f0-9]{40}$/i.test(sha) ? sha.toLowerCase() : null,
    channel: permittedChannel,
    workflowEvidence: sourceLink,
    browserAutomated: automated,
    humanReview: {
      approved: human.approved,
      completed: human.manualChecksPassed,
      required: human.manualChecksTotal,
      outstanding: human.pending,
      errors: human.errors,
      disposition: ledger?.disposition || 'UNKNOWN',
    },
    domainMigrationPermitted: false,
    caution: 'Machine evidence does not replace physical-device/screen-reader acceptance, ownership verification, or explicit domain-change authorization.',
  };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const input = process.argv.find(a => a.startsWith('--input='))?.slice(8) ||
    'test-results/atlas-playwright.json';
  const output = process.argv.find(a => a.startsWith('--output='))?.slice(9) ||
    'release-evidence/acceptance-packet.json';
  const channel = process.argv.includes('--deployed') ? 'deployed' : 'candidate';
  const readJson = path => {
    try { return JSON.parse(readFileSync(resolve(path), 'utf8')); } catch { return null; }
  };
  const ledger = readJson('release/acceptance.json');
  const packet = makeAcceptancePacket({
    ledger, playwrightReport: readJson(input), sha: process.env.GITHUB_SHA || '',
    runId: process.env.GITHUB_RUN_ID || '', repository: process.env.GITHUB_REPOSITORY || '',
    channel,
  });
  mkdirSync(dirname(resolve(output)), { recursive: true });
  writeFileSync(resolve(output), JSON.stringify(packet, null, 2) + '\n');
  process.stdout.write(JSON.stringify(packet, null, 2) + '\n');
  if (packet.humanReview.errors.length) process.exitCode = 1;
}
