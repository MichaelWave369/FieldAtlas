/**
 * Editorial source spotlights for confirmed public repositories.
 * These are not auto-added book chapters or assertions of a live GitHub Pages build.
 * A reader action is offered only when the same repository is already available
 * in the visitor's accessible Atlas catalog.
 */
export const RECENT_FIELD_PROJECTS = Object.freeze([
  { repo:"PhiBall369", title:"PhiBall369 · Pinball Workshop", label:"Pinball · Browser engine", summary:"A new browser-first pinball and table-building project, with physics and themed tables on its roadmap." },
  { repo:"GMED", title:"GMED", label:"Engineering · Release discipline", summary:"A playful home for the merge-and-verify workflow and its evidence-first engineering habits." },
  { repo:"PhiTriBrain369", title:"PhiTriBrain369", label:"Intelligence · Architecture", summary:"Experiments in coordinating distinct AI planning, memory, and verification roles." },
  { repo:"PhiMadaPrime", title:"PhiMadaPrime", label:"Systems · Operator fleet", summary:"An evolving virtual office for coordinating project operators, agent teams, and the wider Field." },
  { repo:"ARCLight", title:"ARCLight", label:"Storytelling · Sci-fi", summary:"A developing science-fiction universe spanning the ARCLight vessel, its crew, and connected stories." },
  { repo:"RacetoOblivion", title:"Race to Oblivion", label:"Games · Narrative worlds", summary:"A time-and-dimension-spanning game concept with Elsewhen, the Interval, and Subject:369." },
  { repo:"OverStrings", title:"OverStrings", label:"XR · Hand tracking", summary:"An open Quest hand-tracking project supporting more expressive interactions across immersive worlds." },
  { repo:"CompAware", title:"CompAware", label:"Research · Design", summary:"An exploratory repository for computational-awareness concepts and silicon-oriented embodiment design." },
  { repo:"RetroVerse", title:"RetroVerse", label:"Learning · Retro computing", summary:"Browser-based retro-computing museum experiments and playable preservation interfaces." },
  { repo:"PhiOS-Mobile", title:"PhiOS Mobile", label:"Systems · Mobile", summary:"A mobile companion initiative for extending PhiOS concepts onto handheld devices." },
  { repo:"PhianoSheets", title:"PhianoSheets", label:"Music · Notation", summary:"A music-creation and notation workbench exploring tuning, composition, and musical ideas." },
  { repo:"PaperGhost", title:"PaperGhost", label:"Tools · Public library", summary:"An open collection project for practical digital essentials and reusable tools." },
  { repo:"BTM", title:"Break the Matrix", label:"Retro FPS · WebXR", summary:"A classic-styled sci-fi shooter that grew into an immersive Quest 3 experience." },
  { repo:"SparkTheSubstrate", title:"Spark: The Substrate", label:"Fantasy · WebXR", summary:"Elemental combat, consequential choices, and an immersive journey through the Descent." },
  { repo:"EchoesOfTheNine", title:"Echoes of the Nine", label:"JRPG · Adventure", summary:"A science-fantasy role-playing tale with turn-based battles and immersive experiments." },
  { repo:"TweedleVerse", title:"TweedleVerse", label:"Comedy · Games", summary:"The absurd world of Stemside, with original arcade games and detective adventures." },
  { repo:"LENZ", title:"LENZ", label:"Genre-shifting game", summary:"A prototype that moves between exploration, survival horror, dungeons and platforming." },
  { repo:"FieldStoryForge", title:"FieldStoryForge", label:"Interactive comics", summary:"Create branching comic-book adventures with choices, offline exports, and a story map." },
  { repo:"GenEWrist", title:"Gen.E.Wrist", label:"XR · Interface", summary:"A reusable wrist interface with persistent 3–6–9 home and context-aware WORLD mode." },
  { repo:"BackyardProductionCompany", title:"Backyard Production Company", label:"Creative pipeline", summary:"A production studio lot connecting art, sound, animation, and XR workflows." },
  { repo:"ReelCommons", title:"REEL Commons", label:"Media tools", summary:"An open creative media toolkit in the growing studio ecosystem." },
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
