/**
 * Editorial shelf proposals from the 2026-10-17 browser export (105 chapters),
 * plus an October 20 public-repository README review of new games and tools.
 * Changes are explicitly identified by repository, never inferred from arbitrary URLs.
 * The six original library rooms remain unchanged. Browser-local edits override these.
 * See docs/CATALOG_CENSUS_2026-10-17.md and docs/CATEGORY_REVIEW_2026-10-20.md.
 */
export const censusCategoryOverrides = Object.freeze({
  'axiomforge-ledger': 'Tools',
  'beyondthebuzz': 'Learning',
  'browsallax': 'Tools',
  'cannabiverse': 'Research',
  'cfd': 'Research',
  'chippydip': 'Music',
  'codeveil369': 'Research',
  'collaborationjunction': 'Research',
  'dcl': 'Research',
  'dropzone': 'Tools',
  'evie': 'Tools',
  'fieldmanual369': 'Learning',
  'futurearchive': 'Galleries',
  'glo': 'People & Practice',
  'infiniteafterhours': 'Creative',
  'infiniteinterconnects': 'Systems',
  'langarian-math': 'Research',
  'mythsplicer': 'Games',
  'nbgpocketmesh': 'Research',
  'nevora-codex': 'People & Practice',
  'parallax-watchtower': 'Tools',
  'phi-morph': 'Research',
  'phi5': 'Systems',
  'phicleanroom': 'Tools',
  'phicompile': 'Tools',
  'phifieldlab': 'Intelligence',
  'phipie': 'Systems',
  'phiportal': 'Systems',
  'phiscribe': 'Tools',
  'phiskrit': 'Learning',
  'phistream': 'Intelligence',
  'pulse369': 'Games',
  'the-mdf-files': 'Creative',
  'think-tank': 'Intelligence',
  'jukebot': 'Music',
  'lumen_sword_369': 'People & Practice',
  'mictek-house': 'Music',
  'morebouncelabs': 'Music',
  'morebouncemethod': 'People & Practice',
  'openblueprintstudio': 'Tools',
  'ravedial-archive-explorer': 'Music',
  'siliconlouvre': 'Galleries',
  'frontporchai': 'Learning',
  'cannabis-as-sacred-medicine': 'Learning',
  'infinite-commons': 'Systems',
  'consent_mirror_369': 'Learning',
  'enter-the-field-research': 'Publications',
  'pain-joy-continuum': 'People & Practice',
  'personamirror369': 'People & Practice',
  'parallax-369-public-primer': 'Learning',
  // Oct 20 additions: playable collections and game runtimes, not generic app guesses.
  'commontable': 'Games',
  'puzzlepen': 'Games',
  'codedex': 'Games',
  'phicade': 'Games',
  'proofarcade': 'Games',
  'nightcircuit': 'Games',
  'oakstreetrumble': 'Games',

  // Creative applications: coloring, animation and printable artwork.
  'huehatch': 'Creative',
  'framefieldstudio': 'Creative',
  'rastaphi': 'Creative',

  // Engineering tools, including a Fallout mod-making studio, not a playable Fallout game.
  'wastelandworkshopstudio': 'Tools',
  'reelcommons': 'Tools',
  'pockerec': 'Tools',
  'loopcatch': 'Tools',
  'repoready': 'Tools',
  'fieldshield': 'Tools',

  // Research / education and system infrastructure.
  'mriphi': 'Research',
  'regenerationatlas': 'Research',
  'aquaphi': 'Research',
  'gitporch': 'Systems',
  'tmc': 'Systems',
  'fieldcloudworker': 'Systems',
  'lau': 'Learning',
});

export function censusCategoryForRepo(repo) {
  return censusCategoryOverrides[String(repo || '').trim().toLowerCase()] || null;
}
