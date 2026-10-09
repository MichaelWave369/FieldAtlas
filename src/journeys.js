/**
 * Field Atlas v0.6 visitor journeys.
 * No private data, network calls, or model output. Tours link to chapters that
 * already exist in the public or personally curated catalog.
 */
export const visitorJourneys = Object.freeze([
  {
    id: 'first-light', name: 'First Light', glyph: '✧', accent: '#d9b98a',
    kicker: 'START HERE', description: 'An easy first walk through the Field and its builders.',
    repos: ['SuperPhiVessel', 'FieldAtlas', 'PhiOS', 'FieldDeck', 'FieldAccord'],
  },
  {
    id: 'artists-lantern', name: "The Artist's Lantern", glyph: '✦', accent: '#ecb0b4',
    kicker: 'ART & SOUND', description: 'A gallery walk through color, sound, images, and creative tools.',
    repos: ['Domistika', 'SiliconLouvre', 'parallax-pixelforge', 'Auralith369', 'infinitylens369'],
  },
  {
    id: 'research-constellation', name: 'Research Constellation', glyph: '◇', accent: '#b8cdf0',
    kicker: 'QUESTION EVERYTHING', description: 'Visit experiment spaces and visual research workbenches.',
    repos: ['NestedBubbleGear', 'PhiMirrorHex', 'particleforge369', 'schumann-live-react', 'VAL'],
  },
  {
    id: 'after-hours', name: 'After Hours', glyph: '♠', accent: '#e6b578',
    kicker: 'PLAY & EXPLORE', description: 'An arcade-flavored walk through games and playful projects.',
    repos: ['GiltHouse', 'PhiCade', 'PorchQuest369', 'parallax-arc', 'NightCircuit'],
  },
]);

export function findJourney(id) {
  return visitorJourneys.find(route => route.id === id) || null;
}

export function availableJourneyStops(routeOrId, catalog = []) {
  const route = typeof routeOrId === 'string' ? findJourney(routeOrId) : routeOrId;
  if (!route || !Array.isArray(catalog)) return [];
  const index = new Map();
  for (const page of catalog) {
    const key = String(page?.repo || '').trim().toLowerCase();
    if (key && !index.has(key) && typeof page?.url === 'string' && /^https:\/\//.test(page.url)) index.set(key,page);
  }
  const already = new Set();
  return route.repos.map(repo => index.get(repo.toLowerCase())).filter(page => {
    if (!page || already.has(page.id)) return false;
    already.add(page.id);
    return true;
  });
}

const REPO_RE = /^[A-Za-z0-9._-]{1,100}$/;

export function readAtlasLink(search = '') {
  const params = new URLSearchParams(String(search).replace(/^\?/, ''));
  const raw = params.get('chapter') || '';
  const chapter = REPO_RE.test(raw) ? raw : null;
  const tourId = params.get('tour') || '';
  const tour = findJourney(tourId)?.id || null;
  return { chapter, tour };
}

export function buildAtlasLink(href, repo, tourId = null) {
  const url = new URL(href);
  url.searchParams.delete('chapter');
  url.searchParams.delete('tour');
  url.hash = '';
  if (!REPO_RE.test(String(repo || ''))) return url.href;
  url.searchParams.set('chapter', repo);
  if (tourId && findJourney(tourId)) url.searchParams.set('tour', tourId);
  return url.href;
}

export function locateSharedChapter(catalog = [], repo = '') {
  return catalog.find(p => p?.repo && p.repo.toLowerCase() === String(repo).toLowerCase()) || null;
}
