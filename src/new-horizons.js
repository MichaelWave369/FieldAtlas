/**
 * Editorial source spotlights for confirmed public repositories.
 * These are not auto-added book chapters or assertions of a live GitHub Pages build.
 * A reader action is offered only when the same repository is already available
 * in the visitor's accessible Atlas catalog.
 */
export const RECENT_FIELD_PROJECTS = Object.freeze([
  { repo:'BTM', title:'Break the Matrix', label:'Retro FPS · WebXR', summary:'A classic-styled sci-fi shooter that grew into an immersive Quest 3 experience.' },
  { repo:'SparkTheSubstrate', title:'Spark: The Substrate', label:'Fantasy · WebXR', summary:'Elemental combat, consequential choices, and an immersive journey through the Descent.' },
  { repo:'EchoesOfTheNine', title:'Echoes of the Nine', label:'JRPG · Adventure', summary:'A science-fantasy role-playing tale with turn-based battles and immersive experiments.' },
  { repo:'TweedleVerse', title:'TweedleVerse', label:'Comedy · Games', summary:'The absurd world of Stemside, with original arcade games and detective adventures.' },
  { repo:'LENZ', title:'LENZ', label:'Genre-shifting game', summary:'A prototype that moves between exploration, survival horror, dungeons and platforming.' },
  { repo:'FieldStoryForge', title:'FieldStoryForge', label:'Interactive comics', summary:'Create branching comic-book adventures with choices, offline exports, and a story map.' },
  { repo:'GenEWrist', title:'Gen.E.Wrist', label:'XR · Interface', summary:'A reusable wrist interface with persistent 3–6–9 home and context-aware WORLD mode.' },
  { repo:'BackyardProductionCompany', title:'Backyard Production Company', label:'Creative pipeline', summary:'A production studio lot connecting art, sound, animation, and XR workflows.' },
  { repo:'ReelCommons', title:'REEL Commons', label:'Media tools', summary:'An open creative media toolkit in the growing studio ecosystem.' },
].map(project => Object.freeze({
  ...project,
  sourceUrl: 'https://github.com/MichaelWave369/' + project.repo,
})));

export function selectRecentFieldProjects(catalog = []) {
  const accessible = new Map();
  for (const chapter of Array.isArray(catalog) ? catalog : []) {
    const repo = String(chapter?.repo || '').trim().toLowerCase();
    if (!repo || accessible.has(repo) || !/^https:\/\//i.test(String(chapter?.url || ''))) continue;
    accessible.set(repo, chapter);
  }
  return RECENT_FIELD_PROJECTS.map(project => ({
    project,
    chapter: accessible.get(project.repo.toLowerCase()) || null,
  }));
}
