# R9 · The Field Experimental Wing (draft candidate)

## Scope and status

This branch adds a small, separate research instrument at \`/experiment-lab/\` and an
opt-in **Explore in Lab (experimental)** link from existing public-source dossiers.
It does not replace the Atlas book, the R7 encyclopedia, the R8 Chronicle, or the
FieldConstellation observatory. **Candidate only; no deployment or release approval.**

## Modes

1. **Synthetic network**: a fixed 12-node, 18-edge graph, with adjustable symmetric
   coupling, impulsive activation, bounded numerical integration, and voluntary Web Audio
   notes when a visitor selects nodes. The model approximates
   \`dx/dt = k Σ(weight · (neighbor - node)) - decay · node\` using explicit Euler steps.
   It is a **teaching demonstration**, not a physical tensegrity solver, quantum computer,
   or live PhiOS/Agentora network monitor.
2. **Public source evidence**: opens with a \`?repo=Name\` passed from an existing
   R7 dossier. The lab fetches the **same-origin** \`encyclopedia.json\` snapshot.
   It independently checks the public owner, schema, numeric identity, requested
   repository name, and non-duplicate identity. It displays a star graph connecting a
   public GitHub repository to the **observations about that repository**:
   creation time, last push, and up to four recent actually merged PRs. Edges have
   the meaning \`documents\`, **not** calls, dependencies, integrations, or runtime
   communication. GitHub URLs are constructed from validated owner/repository identity
   and positive PR numbers. The graph does not promote a source dossier to a
   verified live Pages chapter.

No mode reads or writes private repositories, collects user identities, executes
external app code, embeds third-party iframes, or changes Atlas's passport, bookmarks,
local edits, tour routes, Pages catalog, DNS, domain, and acceptance ledger.

## Entry and data contract

- Atlas dossier → relative, same-origin full-tab \`experiment-lab/?repo=<valid-name>\`.
- Public snapshot only from \`../encyclopedia.json\`; no GitHub credentials in browser.
- If a project is absent from the available or **partial** snapshot, source mode
  remains disabled. The visitor may still use the explicitly synthetic graph.
- No data passes to FieldConstellation, Ω-OS, or external peers. The Constellation
  bridge remains entirely separate. No WebXR runtime is claimed in this stage.

## Verification

Run:

\`\`\`bash
npm test
npm run build
npm run test:e2e
\`\`\`

At a minimum, manually inspect:
- Lab opens directly and through an R7 dossier on desktop/mobile.
- Query string with a valid public repo shows correct metadata and original GitHub
  source links; an unavailable/invalid/duplicate repo request never invents a graph.
- Synthetic mode's Run, Pause, Reset, slider, pointer hit targets, and keyboard-accessible
  node list work without audio, with audio blocked, and after audio opt-in.
- Closing or hiding the tab stops the numerical update timer.
- Reduced-motion and small-viewport presentation, browser back link, and focus order.
- Returning visitors retain original book, passport, shared chapter links, and
  verified Pages preview behavior without migration.
- Check the actual GitHub Pages subpath \`/FieldAtlas/experiment-lab/\`.
  CI passing does not establish real browser audio, Quest 3 usability, WebXR, live
  source availability, or manual accessibility acceptance.

Issue #32's twelve manual release gates remain **NOT APPROVED**. No release,
merge, deployment, DNS, service activation, or domain mutation is authorized by
this candidate.
