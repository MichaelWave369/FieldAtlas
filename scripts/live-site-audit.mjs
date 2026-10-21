import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { CURRENT_PUBLISHED_ORIGIN } from './launch-preflight.mjs';
import { COMMIT_PATTERN, RELEASE_STAMP_SCHEMA } from './release-stamp.mjs';

/**
 * Read-only production HTTP checks. Never updates the deployed site, registrar,
 * acceptance ledger, GitHub Pages configuration or local visitor storage.
 */
export function inspectLiveHome(html, origin = CURRENT_PUBLISHED_ORIGIN) {
  const checks = [];
  const check = (id, pass, detail) => checks.push({ id, pass: Boolean(pass), detail });
  check('document-title', /<title>The Field Atlas/.test(html), 'Expected public Atlas page title');
  check('canonical', html.includes('rel="canonical" href="' + origin + '"'), 'Canonical stays on current GitHub Pages');
  check('og-url', html.includes('property="og:url" content="' + origin + '"'), 'Social URL stays on current GitHub Pages');
  check('html-language', /<html lang="en">/.test(html), 'Declared English document language');
  check('responsive-viewport', /name="viewport"[^>]*width=device-width/.test(html), 'Mobile viewport available');
  check('no-early-domain-migration', !html.includes('rel="canonical" href="https://enterthefield.org/'), 'No early canonical cutover');
  const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)].map(match => match[1]);
  check('relative-bundle-links', assets.length >= 2, 'At least one JS and CSS build asset declared');
  return { checks, assets: [...new Set(assets)] };
}

export function inspectLiveTextResources({ robots = '', sitemap = '', origin = CURRENT_PUBLISHED_ORIGIN } = {}) {
  return [
    { id: 'robots-sitemap', pass: robots.includes('Sitemap: ' + origin + 'sitemap.xml'),
      detail: 'robots.txt advertises current canonical sitemap' },
    { id: 'sitemap-entrance', pass: sitemap.includes('<loc>' + origin + '</loc>'),
      detail: 'Sitemap exposes the deployed entrance' },
    { id: 'no-domain-cname', pass: !robots.includes('enterthefield.org') && !sitemap.includes('enterthefield.org'),
      detail: 'No proposed-domain references in crawler documents' },
  ];
}

export function inspectBuildIdentity(stamp, expectedSha) {
  const expected = COMMIT_PATTERN.test(expectedSha || '') ? expectedSha.toLowerCase() : '';
  const matched=Boolean(expected &&
    stamp?.schema===RELEASE_STAMP_SCHEMA &&
    stamp?.releaseStatus==='NOT_MANUALLY_APPROVED' &&
    stamp?.commit===expected);
  return {
    id:'exact-deployed-commit', pass:matched,
    detail:matched ? 'Production serves expected Git commit '+expected :
      'Production does not prove this exact Git commit is deployed (or expected SHA missing)',
  };
}

export async function fetchResource(url, fetchFn = fetch) {
  const response = await fetchFn(url, {
    redirect: 'follow',
    headers: { 'accept': '*/*', 'cache-control': 'no-cache' },
    signal: AbortSignal.timeout(15000),
  });
  const resolved = new URL(response.url || url);
  const expected = new URL(CURRENT_PUBLISHED_ORIGIN);
  if (resolved.origin !== expected.origin || !resolved.pathname.startsWith('/FieldAtlas/'))
    throw new Error('Production resource redirected outside the approved current Atlas origin: ' + resolved.href);
  if (!response.ok) throw new Error('HTTP ' + response.status + ' for ' + url);
  return response;
}

export async function auditLiveSite(fetchFn = fetch, expectedSha = process.env.FIELD_ATLAS_EXPECTED_SHA || process.env.GITHUB_SHA) {
  const checkedAt = new Date().toISOString();
  const checks = [];
  const add = (id, pass, detail) => checks.push({ id, pass: Boolean(pass), detail });
  let home = '', assets = [];
  try {
    const response = await fetchResource(CURRENT_PUBLISHED_ORIGIN, fetchFn);
    const type = response.headers.get('content-type') || '';
    add('homepage-html-response', type.includes('text/html'), 'Live root serves HTML over HTTPS');
    home = await response.text();
    const result = inspectLiveHome(home);
    checks.push(...result.checks);
    assets = result.assets;
  } catch (error) {
    add('homepage-reachable', false, String(error?.message || error));
  }
  for (const [id, path, type] of [
    ['robots', 'robots.txt', 'text/plain'],
    ['sitemap', 'sitemap.xml', 'xml'],
    ['social-image', 'study-room.webp', 'image/'],
  ]) {
    try {
      const response = await fetchResource(new URL(path, CURRENT_PUBLISHED_ORIGIN), fetchFn);
      const contentType = response.headers.get('content-type') || '';
      add(id + '-response', contentType.includes(type), path + ' served with expected media type');
      if (id === 'robots') {
        var robots = await response.text();
      } else if (id === 'sitemap') {
        var sitemap = await response.text();
      } else {
        await response.arrayBuffer();
      }
    } catch (error) {
      add(id + '-response', false, String(error?.message || error));
    }
  }
  checks.push(...inspectLiveTextResources({ robots, sitemap }));
  try {
    const response=await fetchResource(new URL('release-info.json', CURRENT_PUBLISHED_ORIGIN), fetchFn);
    const stamp=await response.json();
    checks.push(inspectBuildIdentity(stamp,expectedSha));
  } catch(error) {
    add('exact-deployed-commit',false,'Unable to read deployed build identity: '+String(error?.message||error));
  }
  for (const asset of assets) {
    try {
      const url = new URL(asset, CURRENT_PUBLISHED_ORIGIN);
      const response = await fetchResource(url, fetchFn);
      const type = response.headers.get('content-type') || '';
      const expected = asset.endsWith('.css') ? 'text/css' : 'javascript';
      add('bundle:' + asset, type.includes(expected), 'Compiled asset responds with expected media type');
    } catch (error) {
      add('bundle:' + asset, false, String(error?.message || error));
    }
  }
  return {
    schema: 'field-atlas-live-http-evidence-v1',
    checkedAt, origin: CURRENT_PUBLISHED_ORIGIN,
    outcome: checks.every(entry => entry.pass) ? 'HTTP_PASS' : 'HTTP_FAIL',
    manualAcceptance: 'NOT_EVALUATED',
    warning: 'A passing HTTP audit cannot certify live apps, screen readers, DNS control or release signoff.',
    checks,
  };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const report = await auditLiveSite();
  const serialized = JSON.stringify(report, null, 2) + '\n';
  if (process.argv[2]?.startsWith('--output=')) {
    writeFileSync(resolve(process.argv[2].slice('--output='.length)), serialized);
  }
  process.stdout.write(serialized);
  if (report.outcome !== 'HTTP_PASS') process.exitCode = 1;
}
