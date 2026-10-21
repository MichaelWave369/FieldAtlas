import { isVerifiedPublishedPage } from './catalog.js';

/** Validate the deployed public-site manifest before publishing new chapters. */
export function parseAtlasManifest(manifest) {
  if (!manifest || manifest.schema_version !== 1 ||
      manifest.owner !== 'MichaelWave369' || !Array.isArray(manifest.pages)) {
    throw new Error('Unexpected public catalog format');
  }
  return manifest.pages.filter(isVerifiedPublishedPage).map(item => ({
    ...item,
    title: String(item.title || item.repo).slice(0, 80),
    desc: String(item.desc || '').slice(0, 300),
    kicker: 'LIVE FROM THE FIELD',
    pullquote: 'Every world deserves its own doorway.',
    accent: '#e5bf87',
  }));
}
