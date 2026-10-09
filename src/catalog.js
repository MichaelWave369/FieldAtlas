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

export function safeUrl(input) {
  try {
    const value = new URL(input);
    if (value.protocol !== 'https:' && !(value.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(value.hostname))) return null;
    return value.href;
  } catch { return null; }
}

export function uniqueMerge(oldItems, additions) {
  const ids = new Set(oldItems.map(p => p.id));
  const urls = new Set(oldItems.map(p => p.url.replace(/\/$/, '').toLowerCase()));
  const next = [...oldItems];
  for (const page of additions) {
    const normalized = safeUrl(page.url);
    if (!normalized || ids.has(page.id) || urls.has(normalized.replace(/\/$/, '').toLowerCase())) continue;
    next.push({ ...page, url: normalized });
    ids.add(page.id);
    urls.add(normalized.replace(/\/$/, '').toLowerCase());
  }
  return next;
}

export function githubPagesUrl(repo) {
  const homepage = safeUrl(repo.homepage || '');
  if (homepage && new URL(homepage).hostname.endsWith('.github.io')) return homepage;
  return `https://${owner.toLowerCase()}.github.io/${encodeURIComponent(repo.name)}/`;
}

export function makeDiscoveredPage(repo) {
  return {
    id: `gh-${repo.id}`,
    repo: repo.name,
    title: repo.name.replace(/[-_]/g, ' '),
    kicker: 'FOUND IN THE FIELD',
    category: 'Other',
    url: githubPagesUrl(repo),
    desc: repo.description || 'Another doorway in the growing Field collection.',
    pullquote: 'Every repository is a little universe.',
    accent: '#e6c893',
    index: '★',
    discovered: true,
  };
}

export async function discoverGithubPages(user = owner) {
  const found = [];
  for (let page = 1; page <= 4; page++) {
    const resp = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&page=${page}&type=owner&sort=full_name`);
    if (!resp.ok) throw new Error(`GitHub returned ${resp.status}. Try again after the API rate limit resets.`);
    const list = await resp.json();
    for (const repo of list) {
      if (repo.owner?.login?.toLowerCase() === user.toLowerCase() && repo.has_pages && !repo.private && !repo.archived) found.push(makeDiscoveredPage(repo));
    }
    if (list.length < 100) break;
  }
  return found;
}
