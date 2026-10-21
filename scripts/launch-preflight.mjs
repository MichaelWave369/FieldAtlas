import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const CURRENT_PUBLISHED_ORIGIN = 'https://michaelwave369.github.io/FieldAtlas/';
const ASSETS = ['index.html','robots.txt','sitemap.xml'];

/**
 * Static-only release preflight. This never grants approval for DNS or a
 * live launch: a green report is NOT browser acceptance.
 */
export function auditStaticLaunch(distDir = 'dist') {
  const dir = resolve(distDir);
  const checks = [];
  const check = (name, pass, detail) => checks.push({name, pass: Boolean(pass), detail});
  for (const name of ASSETS) check('asset:'+name, existsSync(resolve(dir,name)), 'Static output includes '+name);
  const html = existsSync(resolve(dir,'index.html')) ? readFileSync(resolve(dir,'index.html'),'utf8') : '';
  const robots = existsSync(resolve(dir,'robots.txt')) ? readFileSync(resolve(dir,'robots.txt'),'utf8') : '';
  const sitemap = existsSync(resolve(dir,'sitemap.xml')) ? readFileSync(resolve(dir,'sitemap.xml'),'utf8') : '';

  check('html-title', /<title>The Field Atlas/.test(html), 'Public title present');
  check('html-language', /<html lang="en">/.test(html), 'Document language present');
  check('canonical-current-origin',
    html.includes('rel="canonical" href="'+CURRENT_PUBLISHED_ORIGIN+'"'),
    'Pinned to the current GitHub Pages URL, not the future domain');
  check('social-metadata',
    html.includes('property="og:title"') && html.includes('property="og:description"') &&
    html.includes('property="og:url" content="'+CURRENT_PUBLISHED_ORIGIN+'"') &&
    html.includes('property="og:image"') && html.includes('name="twitter:card"'),
    'Open Graph and Twitter summary metadata included');
  check('relative-vite-assets',
    !/(?:src|href)="\/assets\//.test(html) && /(?:src|href)="\.\/assets\//.test(html),
    'Vite generated relative asset paths for current Pages mount');
  check('robots-current-origin',robots.includes('Sitemap: '+CURRENT_PUBLISHED_ORIGIN+'sitemap.xml'),
    'Robots file references current deployed sitemap');
  check('sitemap-current-origin',sitemap.includes('<loc>'+CURRENT_PUBLISHED_ORIGIN+'</loc>'),
    'Sitemap references the current site entrance');
  check('no-custom-domain-cutover',
    !existsSync(resolve(dir,'CNAME')),
    'No CNAME in build: requires explicit post-acceptance approval');

  return {
    schema:'field-atlas-static-preflight-v1',
    target:CURRENT_PUBLISHED_ORIGIN,
    passed:checks.every(item=>item.pass),
    scope:'STATIC_BUILD_ONLY_NOT_BROWSER_OR_DNS_ACCEPTANCE',
    checks,
  };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const report = auditStaticLaunch(process.argv[2] || 'dist');
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  if (!report.passed) process.exitCode = 1;
}
