/**
 * R4B provenance ledger: reviewed public repository claims.
 *
 * DOCUMENTED != independently runtime-verified. Evidence is pinned to GitHub
 * commit URLs. Never infer a connection from prose similarity.
 */
export const DOCUMENTED_CONNECTIONS = Object.freeze([
  {
    "id": "atlas-future-archive",
    "fromRepo": "FieldAtlas",
    "toRepo": "FutureArchive",
    "kind": "navigation-link",
    "summary": "The Atlas provides a permanent doorway to Future Archive's independently hosted art gallery and matching print links.",
    "evidenceUrl": "https://github.com/MichaelWave369/FieldAtlas/blob/49f428d911a0a9f1fe55eabe308691254bc57138/README.md#L3-L7",
    "scope": "Documented navigation and matching art-print links, not a shared runtime"
  },
  {
    "id": "future-archive-atlas",
    "fromRepo": "FutureArchive",
    "toRepo": "FieldAtlas",
    "kind": "navigation-link",
    "summary": "The gallery links to the Atlas entrance and to matching starter-catalog chapters from individual prints.",
    "evidenceUrl": "https://github.com/MichaelWave369/FutureArchive/blob/c2e9c029b9b560a6248dd744fdbbd9fa90ccee11/README.md#L3-L5",
    "scope": "Documented outbound links, not runtime integration"
  },
  {
    "id": "domistika-auralith",
    "fromRepo": "Domistika",
    "toRepo": "Auralith369",
    "kind": "creative-handoff",
    "summary": "Auralith documents protected-layer import from Domistika using Creative Bridge v2 and its public SDK.",
    "evidenceUrl": "https://github.com/MichaelWave369/Auralith369/blob/e21a0eb85172daf1ae02b0bb1913973e85963617/README.md#L62-L87",
    "scope": "Documented candidate/alpha creative interchange, not proof of a successful user session"
  },
  {
    "id": "siliconlouvre-domistika",
    "fromRepo": "SiliconLouvre",
    "toRepo": "Domistika",
    "kind": "creative-handoff",
    "summary": "Domistika documents a short-lived, locally approved SVG receiver for Silicon Louvre's Creative Studio.",
    "evidenceUrl": "https://github.com/MichaelWave369/Domistika/blob/98682ac403ebc56cf393f85137dc3b68b19dc980/README.md#L1-L10",
    "scope": "Documented receiver; import remains user-confirmed and conditional on a matching sender release"
  },
  {
    "id": "pixelforge-spark",
    "fromRepo": "parallax-pixelforge",
    "toRepo": "SparkTheSubstrate",
    "kind": "runtime-adapter",
    "summary": "PixelForge documents a version-pinned external SPARK runtime bridge and a cross-repository qualification command.",
    "evidenceUrl": "https://github.com/MichaelWave369/parallax-pixelforge/blob/ac51ee9e52e16f37d03f7f70e290ffd38fb8640b/README.md#L191-L212",
    "scope": "Documented local adapter and test contract, not proof the public game is connected in the browser"
  }
].map(item => Object.freeze(item)));

export const CONNECTION_REVIEW_DATE = '2026-10-21';
export const CONNECTION_STATUS = 'DOCUMENTED_NOT_RUNTIME_VERIFIED';
