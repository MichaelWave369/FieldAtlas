import { isInfiniteAtlas } from './fieldception.js';
/**
 * Field Atlas v0.4 public-safe library catalog curator.
 * Names/categories below come from publicly described projects, not private
 * repositories. These are editorial labels, not claims about functionality.
 * A descriptive fallback is used for new releases until reviewed.
 */
export const projectOverrides = Object.freeze({
  '12fold': { title:'Twelvefold Earth Compact', category:'Research' },
  'PocketBrain': { title:'PocketBrain', category:'Intelligence' },
  'Vibe': { title:'Vibe Language', category:'Systems' },
  'Peekaboo': { title:'Peekaboo', category:'Tools' },
  'FamilyVault': { title:'FamilyVault', category:'Tools' },
  'reporider': { title:'RepoRider', category:'Tools' },
  'inspection-closeout-pilot': { title:'Inspection Closeout Pilot', category:'Tools' },
  'parallax-arc': { title:'Parallax Arc', category:'Games' },
  'kindbridge369': { title:'KindBridge369', category:'Tools' },
  'concrete-atlas': { title:'Concrete Atlas', category:'Creative' },
  'phioffice369': { title:'PhiOffice369', category:'Tools' },
  'particleforge369': { title:'ParticleForge369', category:'Research' },
  'PorchQuest369': { title:'PorchQuest369', category:'Games' },
  'ProofArcade': { title:'Proof Arcade', category:'Games' },
  'datacenter-ledger-explorer': { title:'Data Center Ledger Explorer', category:'Research' },
  'SCAM-A-LAX': { title:'SCAM-A-LAX', category:'Tools' },
  'consent_mirror_369': { title:'Consent Mirror', category:'Research' },
  'schumann-live-react': { title:'Schumann Resonance Observatory', category:'Research' },
  'enter-the-field-research': { title:'Enter the Field Research', category:'Research' },
  'ravedial-archive-explorer': { title:'RaveDial Archive Explorer', category:'Creative' },
  'VAL': { title:'VAL: Antikythera Lab', category:'Research' },
  'FrontPorchAI': { title:'AI on the Front Porch', category:'Tools' },
  'focusbridge21': { title:'FocusBridge21', category:'Tools' },
  'infinitylens369': { title:'Infinity Lens', category:'Creative' },
  'ParaCalc369': { title:'ParaCalc369', category:'Tools' },
  'mictek-house': { title:'MicTek Album House', category:'Creative' },
  'hidden-equations-of-feeling': { title:'Hidden Equations of Feeling', category:'Research' },
  'personamirror369': { title:'Persona Mirror', category:'Research' },
  'pain-joy-continuum': { title:'Pain–Joy Continuum', category:'Research' },
  'michaelwhughes-portfolio': { title:'MichaelWave Portfolio', category:'Tools' },
  'brainsweatstudios': { title:'BrainSweat Studios', category:'Creative' },
  'WaveForgeStudio': { title:'WaveForge Studio', category:'Creative' },
  'lumen_sword_369': { title:'Lumen Sword', category:'Creative' },
  'FieldAtlas': { title:'The Infinite Atlas · Φ∞', category:'Other', desc:'The book that contains itself: a bounded mirror chamber where the Field reflects the Field.' },
  'LabelFit': { title:'LabelFit', category:'Tools' },
  'MoreBounceLabs': { title:'More Bounce Labs', category:'Creative' },
  'MemeForge': { title:'MemeForge', category:'Creative' },
  'AquaCymatics369': { title:'AquaCymatics369', category:'Research' },
  'parallax-369-public-primer': { title:'Parallax Primer', category:'Research' },
  'phi369-element-spiral-atlas': { title:'Element Spiral Atlas', category:'Research' },
  'parallax-gran-prix': { title:'Parallax Grand Prix', category:'Games' },
  'Infinite-Porch': { title:'Infinite Porch', category:'Systems' },
  'JukeBot': { title:'JukeBot', category:'Creative' },
  'paracut': { title:'Paracut', category:'Creative' },
  'CineSwarm': { title:'CineSwarm', category:'Creative' },
  'EmberFlow369': { title:'EmberFlow369', category:'Systems' },
  'FieldAccord': { title:'FieldAccord', category:'Systems' },
  'BudgetGenius': { title:'BudgetGenius', category:'Tools' },
  'NestedBubbleGear': { title:'Nested Bubble Gear', category:'Research' },
});

const lookup = new Map(Object.entries(projectOverrides).map(([key, value]) => [key.toLowerCase(), value]));

export const categoryPalette = Object.freeze({
  Intelligence: { color: '#c09ff6', glyph: 'Φ', tone: 'cosmos' },
  Systems: { color: '#91c8d4', glyph: '⌘', tone: 'mechanical' },
  Creative: { color: '#f0adbc', glyph: '✦', tone: 'artistry' },
  Tools: { color: '#a6cda6', glyph: '✧', tone: 'workshop' },
  Research: { color: '#b4c9ef', glyph: '◇', tone: 'observatory' },
  Games: { color: '#e6b77d', glyph: '♠', tone: 'adventure' },
  Other: { color: '#d5bba5', glyph: '☆', tone: 'mystery' },
});

/** Public metadata based suggestion. Unknown projects stay Other. */
export function inferProjectCategory(name = '', description = '') {
  const override = lookup.get(String(name).toLowerCase());
  if (override?.category) return override.category;
  const n = String(name).toLowerCase(), d = String(description || '').toLowerCase();
  // Name patterns are intentionally specific, and generally more reliable
  // than a vague description about AI/software.
  if (/louvre|art|studio|cineswarm|music|audio|visual|pixel|waveforge|domistika|auralith|mictek|cinema|sketch|kaleido|bounce/.test(n)) return 'Creative';
  if (/game|cade|arcade|rumble|circuit|gilt|quest|gran.prix/.test(n)) return 'Games';
  if (/research|bubble|mirrorhex|lattice|metric|quant|cymatic|equation|experiment|particle|cosmology|schumann|element.spiral|observatory/.test(n)) return 'Research';
  if (/vessel|brain|agent|intelligence/.test(n)) return 'Intelligence';
  if (/phi(os|kernel)|kernel|network|bridge|runtime|accord|porch|cloud|flow/.test(n)) return 'Systems';
  if (/budget|medic|deck|label|tool|calc|bot|office|fieldatlas|rider|app/.test(n)) return 'Tools';
  // Descriptions are public but can be generic. Only infer on strong phrases.
  if (/\b(visual art|art gallery|media studio|music streaming|sound design|creative studio)\b/.test(d)) return 'Creative';
  if (/\b(video game|arcade game|role.playing game|metroidvania)\b/.test(d)) return 'Games';
  if (/\b(research workbench|physics simulation|experiment dashboard|scientific simulation)\b/.test(d)) return 'Research';
  if (/\b(agent orchestration|operating system|agent runtime)\b/.test(d)) return 'Systems';
  if (/\b(productivity suite|expense tracker|calculator|toolkit|directory|portfolio)\b/.test(d)) return 'Tools';
  return 'Other';
}

/** Preserve the original nine hand-authored stories and personal custom links. */
export function curateProject(page) {
  if (!page || typeof page !== 'object') return page;
  if (page.featured || !page.repo || String(page.id || '').startsWith('custom-')) return page;
  const override = lookup.get(String(page.repo).toLowerCase());
  const category = override?.category || inferProjectCategory(page.repo, page.desc || '');
  const theme = categoryPalette[category] || categoryPalette.Other;
  return {
    ...page,
    title: override?.title || page.title || page.repo,
    category,
    accent: isInfiniteAtlas(page) ? '#d4b7ff' : theme.color,
    coverTone: isInfiniteAtlas(page) ? 'mirrors' : theme.tone,
    coverGlyph: isInfiniteAtlas(page) ? '∞' : theme.glyph,
    ...(override?.desc ? { desc: override.desc } : {}),
  };
}

/** Apply browser-only edits last, without allowing custom URLs or IDs to mutate. */
export function applyLocalEdits(page, edits = {}) {
  if (!page) return page;
  const update = edits?.[String(page.repo || '').toLowerCase()] || edits?.[page.id] || {};
  const validCategory = Object.keys(categoryPalette).includes(update.category) ? update.category : null;
  const title = typeof update.title === 'string' && update.title.trim() ? update.title.trim().slice(0, 80) : page.title;
  const desc = typeof update.desc === 'string' ? update.desc.trim().slice(0, 300) : page.desc;
  const category = validCategory || page.category;
  const theme = categoryPalette[category] || categoryPalette.Other;
  return { ...page, title, desc, category, accent: isInfiniteAtlas(page) ? '#d4b7ff' : theme.color, coverTone: isInfiniteAtlas(page) ? 'mirrors' : theme.tone, coverGlyph: isInfiniteAtlas(page) ? '∞' : theme.glyph };
}
