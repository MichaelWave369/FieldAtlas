/**
 * Explicit archival references from the author's public Enter the Field research
 * index (MichaelWave369/enter-the-field-research, index.html, fallback catalog).
 *
 * These are curated reference claims, NOT independently live-verified Zenodo API
 * metadata. The official Zenodo record is authoritative for availability,
 * authorship, resource type, dates, files, and revisions.
 *
 * Keep stable record IDs; do not synthesize unlisted records or scrape private data.
 */
export const researchRecordReferences = Object.freeze([
  {
    id: '22838612',
    title: 'UFP × Dynamic Causal Foam Axis C0 v0.1.0: Predictive Closure of Spectral Boundary Observers',
    description: 'Research contract for testing whether coarse observables of a bounded causal-foam toy substrate provide predictive descriptions.',
    type: 'Technical note', date: '2026-09-19',
  },
  {
    id: '22838463',
    title: 'Dynamic Causal Foam v0.3.0: Spectral Propagation and Emergent Metric Research Architecture',
    description: 'Prospective architecture for exploring spectral propagation, defect-like structures, relational clocks, and effective geometry.',
    type: 'Technical note', date: '2026-09-19',
  },
  {
    id: '22730366',
    title: 'UFP-NB1 v0.3.0 Candidate: Predictive Compression and Compiled Observer Cost',
    description: 'Finite relational-graph research on predictive compression, observer cost, history initialization, and exact scaling through N=7.',
    type: 'Technical note', date: '2026-09-12',
  },
  {
    id: '21121324',
    title: 'Reduced Thaw-Term Closure in the SaaSy Cosmology Model',
    description: 'A conservation lemma and bounded compatibility assessment for a reduced SaaSy Hamiltonian model.',
    type: 'Preprint', date: '2026-07-02',
  },
  {
    id: '20682375',
    title: 'Persistent Record Kernel (PRK): Complete Resh Review One-Doc v0.4',
    description: 'Governed persistence-theory framework with falsification-first review and explicit claim boundaries.',
    type: 'Publication', date: '2026-06-13',
  },
  {
    id: '20483957',
    title: 'PersonaMirror369: A Humane Atlas for the Masks We Wear',
    description: 'Local-first software record for consent-centered reflection and journaling.',
    type: 'Software', date: '2026-06-01',
  },
  {
    id: '20481411',
    title: 'The Hidden Equations of Feeling',
    description: 'Symbolic formula atlas and creative-design app for emotion and storytelling patterns.',
    type: 'Software', date: '2026-06-01',
  },
  {
    id: '20480310',
    title: 'LumenSword369: The Sword Cuts Fog, Not People',
    description: 'Local-first humane communication and possibility-language practice tool.',
    type: 'Software', date: '2026-05-31',
  },
  {
    id: '20479334',
    title: 'ConsentMirror369',
    description: 'Local-first pressure-literacy and consent-awareness software reference.',
    type: 'Software', date: '2026-05-31',
  },
  {
    id: '20469484',
    title: 'GoldenJoy369: No-Zero Spiral Runtime',
    description: 'Creative continuity prototype and formula framework for returning to projects.',
    type: 'Software', date: '2026-05-31',
  },
  {
    id: '20466505',
    title: 'AI on the Front Porch: A Family Bridge for Understanding Artificial Intelligence',
    description: 'Plainspoken family-oriented resource for understanding AI without hype or blind trust.',
    type: 'Other', date: '2026-05-30',
  },
  {
    id: '20466412',
    title: 'Governance Drift in AI-Assisted Workflows: RSDC v0.11.1',
    description: 'Role-separated audit approach to AI workflow governance drift, receipts, and claim boundaries.',
    type: 'Software', date: '2026-05-30',
  },
  {
    id: '20422692',
    title: 'The Chill Convergence Principle (Φ-System)',
    description: 'Working paper on stable progress under complexity, alignment, and continuity.',
    type: 'Working paper', date: '2026-05-28',
  },
  {
    id: '20421291',
    title: 'Pain–Joy Continuum: The Joy Crucible Master Spec',
    description: 'Reflective framework for meaning-making, agency, dignity, and constructive service.',
    type: 'Report', date: '2026-05-28',
  },
  {
    id: '20420539',
    title: 'Cannabis as Sacred Medicine: Healing the Body, Restoring Dignity, and Transmuting Pain into Joy',
    description: 'Public education, policy, and testimony record emphasizing harm reduction and claim discipline.',
    type: 'Report', date: '2026-05-28',
  },
]);

export function createPublicationChapter(record) {
  if (!record || !/^\d{5,16}$/.test(String(record.id || ''))) return null;
  const id = String(record.id);
  return {
    id: 'zenodo-' + id,
    repo: 'zenodo-' + id,
    title: record.title,
    category: 'Publications',
    url: 'https://zenodo.org/records/' + id,
    desc: record.description,
    kicker: 'ZENODO RESEARCH OBJECT · ' + record.type.toUpperCase(),
    pullquote: 'The original record holds the evidence.',
    accent: '#dcc9a8',
    coverTone: 'archive',
    coverGlyph: '▤',
    index: '◇',
    sourceKind: 'curated-research-record',
    doi: '10.5281/zenodo.' + id,
    recordType: record.type,
    recordDate: record.date,
    sourceNote: 'Curated reference from Enter the Field Research Archive. Check the Zenodo record for authoritative metadata.',
  };
}

export const publicationChapters = Object.freeze(researchRecordReferences.map(createPublicationChapter).filter(Boolean));

export function isPublicationChapter(page) {
  return Boolean(page && page.sourceKind === 'curated-research-record'
    && /^zenodo-\d{5,16}$/.test(String(page.repo || ''))
    && page.url === 'https://zenodo.org/records/' + String(page.repo).slice(7));
}
