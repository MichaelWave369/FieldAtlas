/**
 * Starter book pages.
 * homepage-derived URLs were read from the owner's public GitHub repository metadata.
 * Other GitHub Pages-pattern URLs are editable inside the app and not guaranteed to frame.
 * The user can curate the book or discover additional public Pages repositories.
 */
export const seedPages = [
  {
    id: 'superphivessel', repo: 'SuperPhiVessel',
    title: 'Super Φ.Vessel', kicker: 'THE INTELLIGENCE CHAMBER',
    category: 'Intelligence',
    url: 'https://michaelwave369.github.io/SuperPhiVessel/',
    desc: 'An evolving home for local-first intelligence, creative collaboration, memory, and governed agents.',
    pullquote: 'A place where human intention meets silicon imagination.',
    accent: '#be9eff', index: 'I', featured: true,
  },
  {
    id: 'phios', repo: 'PhiOS', title: 'PhiOS', kicker: 'THE SOVEREIGN SHELL',
    category: 'Systems',
    url: 'https://michaelwave369.github.io/PhiOS/',
    desc: 'A governed computing world that puts capability, permission, and continuity in their own proper places.',
    pullquote: 'Capability is not authority.', accent: '#98c8e7', index: 'II',
  },
  {
    id: 'pixelforge', repo: 'parallax-pixelforge', title: 'PixelForge Studio', kicker: 'THE CREATIVE WORKSHOP',
    category: 'Creative',
    url: 'https://michaelwave369.github.io/parallax-pixelforge/',
    desc: 'A studio for visual experiments, creative assets, worlds, and immersive design.',
    pullquote: 'Every new world begins as one little spark.', accent: '#f2b67b', index: 'III',
  },
  {
    id: 'siliconlouvre', repo: 'SiliconLouvre', title: 'The Silicon Louvre', kicker: 'THE GALLERY',
    category: 'Creative',
    url: 'https://michaelwave369.github.io/SiliconLouvre/',
    desc: 'An exhibition space for human and AI artwork, side-by-side creations, and strange beautiful ideas.',
    pullquote: 'Different hands. Shared wonder.', accent: '#e4b6cd', index: 'IV',
  },
  {
    id: 'fielddeck', repo: 'FieldDeck', title: 'FieldDeck', kicker: 'THE OPERATOR DESK',
    category: 'Tools',
    url: 'https://michaelwave369.github.io/FieldDeck/',
    desc: 'A button-first space for skills, workflows, automations, scripts, and agent-accessible tools.',
    pullquote: 'A useful idea deserves a useful button.', accent: '#a9d0a0', index: 'V',
  },
  {
    id: 'domistika', repo: 'Domistika', title: 'Domistika', kicker: 'THE ART ROOM',
    category: 'Creative',
    url: 'https://michaelwave369.github.io/Domistika/',
    desc: 'A colorful creative laboratory for geometric art, symmetry, drawing, motion, and agent collaboration.',
    pullquote: 'Make something just because it makes you smile.', accent: '#eebc87', index: 'VI',
  },
  {
    id: 'auralith', repo: 'Auralith369', title: 'Auralith', kicker: 'THE SOUND CHAMBER',
    category: 'Creative',
    url: 'https://michaelwave369.github.io/Auralith369/',
    desc: 'A visual and sound-focused creative studio with effects, looks, and exportable artistic experiments.',
    pullquote: 'Give the imagination somewhere to resonate.', accent: '#a4b4fa', index: 'VII',
  },
  {
    id: 'phimirrorhex', repo: 'PhiMirrorHex', title: 'Phi Mirror Hex', kicker: 'THE MIRROR LAB',
    category: 'Research',
    url: 'https://michaelwave369.github.io/PhiMirrorHex/',
    desc: 'An exploratory playground for hexagonal geometries, reflective forms, and measurement-minded visual ideas.',
    pullquote: 'Turn a pattern and discover a new question.', accent: '#c4dece', index: 'VIII',
  },
  {
    id: 'gilthouse', repo: 'GiltHouse', title: 'GiltHouse', kicker: 'THE GAME ROOM',
    category: 'Games',
    url: 'https://michaelwave369.github.io/GiltHouse/',
    desc: 'A Vegas-inspired game world with classic casino atmosphere, exploration, and a growing city beyond.',
    pullquote: 'Some stories begin with one more hand.', accent: '#f4d17f', index: 'IX',
  },
];

export const owner = 'MichaelWave369';

export const categories = ['All', 'Intelligence', 'Systems', 'Creative', 'Tools', 'Research', 'Games', 'Other'];

// Wings organize the *book*, not GitHub permissions. New projects receive a
// suggested wing until someone explicitly approves their chapter.
export const wings = [
  { id: 'all', name: 'The Whole Library', shortName: 'All rooms', description: 'Every little world, gathered into one living book.', glyph: '✧' },
  { id: 'research', name: 'The Research Wing', shortName: 'Research', description: 'Questions, experiments, geometry, and measured ideas.', glyph: '◇' },
  { id: 'creative', name: 'The Creative Wing', shortName: 'Creative', description: 'Visual art, sound, studios, and exhibitions.', glyph: '✦' },
  { id: 'engineering', name: 'The Engineering Wing', shortName: 'Engineering', description: 'Operating systems, agents, bridges, and useful tools.', glyph: '⌘' },
  { id: 'games', name: 'The Game Room', shortName: 'Games', description: 'Playful worlds, arcade adventures, and experiments.', glyph: '♠' },
  { id: 'annex', name: 'The Curious Annex', shortName: 'Other', description: 'Surprises that do not need a conventional shelf.', glyph: '☆' },
];

export function wingForCategory(category) {
  if (category === 'Research') return 'research';
  if (category === 'Creative') return 'creative';
  if (['Intelligence', 'Systems', 'Tools'].includes(category)) return 'engineering';
  if (category === 'Games') return 'games';
  return 'annex';
}

export function safeUrl(input) {
  try {
    const value = new URL(input);
    if (value.protocol !== 'https:' && !(value.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(value.hostname))) return null;
    return value.href;
  } catch { return null; }
}

function normalizedUrl(url) {
  const safe = safeUrl(url);
  return safe ? safe.replace(/\/$/, '').toLowerCase() : '';
}

export function uniqueMerge(oldItems, additions) {
  const ids = new Set(oldItems.map(p => p.id));
  const urls = new Set(oldItems.map(p => normalizedUrl(p.url)).filter(Boolean));
  const repos = new Set(oldItems.map(p => String(p.repo || '').toLowerCase()).filter(Boolean));
  const next = [...oldItems];
  for (const page of additions) {
    const normalized = safeUrl(page.url);
    const repo = String(page.repo || '').toLowerCase();
    if (!normalized || ids.has(page.id) || urls.has(normalizedUrl(normalized)) || (repo && repos.has(repo))) continue;
    next.push({ ...page, url: normalized });
    ids.add(page.id);
    urls.add(normalizedUrl(normalized));
    if (repo) repos.add(repo);
  }
  return next;
}

export function githubPagesUrl(repo) {
  const homepage = safeUrl(repo.homepage || '');
  const pagesHost = owner.toLowerCase() + '.github.io';
  if (homepage && new URL(homepage).hostname.toLowerCase() === pagesHost) return homepage;
  // A user/org Pages repo is hosted at the root, not /owner.github.io/.
  if (repo.name.toLowerCase() === pagesHost) return 'https://' + pagesHost + '/';
  return 'https://' + pagesHost + '/' + encodeURIComponent(repo.name) + '/';
}

export function inferCategory(name = '') {
  const n = name.toLowerCase();
  if (/museum|louvre|studio|auralith|domistika|pixel|art|music|cinema|cineswarm|creative|forge.*image/.test(n)) return 'Creative';
  if (/game|arcade|cade|rumble|circuit|sparkthesubstrate|gilt|meme/.test(n)) return 'Games';
  if (/research|bubble|mirror|lattice|metric|chron|quantum|cymatic|phi369-element|experiment|equation/.test(n)) return 'Research';
  if (/vessel|brain|agent|intelligence|ai$/.test(n)) return 'Intelligence';
  if (/os$|kernel|network|porch|accord|bridge|flow|cloud/.test(n)) return 'Systems';
  if (/deck|budget|medic|label|tool|bot|app/.test(n)) return 'Tools';
  return 'Other';
}

export function makeDiscoveredPage(repo) {
  return {
    id: 'gh-' + repo.id,
    repo: repo.name,
    title: repo.name.replace(/[-_]/g, ' '),
    kicker: 'FOUND IN THE FIELD',
    category: inferCategory(repo.name),
    url: githubPagesUrl(repo),
    desc: String(repo.description || 'Another doorway in the growing Field collection.').slice(0, 300),
    pullquote: 'Every repository is a little universe.',
    accent: '#e6c893',
    index: '★',
    discovered: true,
  };
}

export function newArrivals(discovered, current, dismissedIds = []) {
  const ids = new Set(current.map(p => p.id));
  const urls = new Set(current.map(p => normalizedUrl(p.url)).filter(Boolean));
  const repos = new Set(current.map(p => String(p.repo || '').toLowerCase()).filter(Boolean));
  const ignored = new Set(dismissedIds);
  const seen = new Set();
  return discovered.filter(item => {
    const url = normalizedUrl(item.url), repo = String(item.repo || '').toLowerCase();
    if (!url || !item.id || ids.has(item.id) || urls.has(url) || (repo && repos.has(repo)) || ignored.has(item.id) || seen.has(item.id) || seen.has(url)) return false;
    seen.add(item.id); seen.add(url);
    return true;
  });
}

export const DISCOVERY_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function shouldAutoDiscover(lastCheck, now = Date.now()) {
  return !Number.isFinite(lastCheck) || lastCheck <= 0 || now - lastCheck >= DISCOVERY_INTERVAL_MS;
}

// Read-only, public metadata only. 'has_pages' means enabled, not that a site
// is reachable, embeddable, or safe to feature. Candidates need approval.
export async function discoverGithubPages(user = owner, fetcher = fetch) {
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(user)) throw new Error('Invalid GitHub owner.');
  const found = [];
  for (let page = 1; page <= 4; page++) {
    const resp = await fetcher('https://api.github.com/users/' + encodeURIComponent(user) + '/repos?per_page=100&page=' + page + '&type=owner&sort=full_name', {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!resp.ok) throw new Error('GitHub returned ' + resp.status + '. Try again after the API rate limit resets.');
    const list = await resp.json();
    if (!Array.isArray(list)) throw new Error('Unexpected GitHub response.');
    for (const repo of list) {
      if (repo.owner?.login?.toLowerCase() === user.toLowerCase() && repo.has_pages && !repo.private && repo.visibility !== 'private' && !repo.archived && typeof repo.name === 'string') found.push(makeDiscoveredPage(repo));
    }
    if (list.length < 100) break;
  }
  return found;
}
