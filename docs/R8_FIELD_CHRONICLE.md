# R8 · The Field Chronicle

**Scope:** read-only chronological exploration of existing R7 **owner-public GitHub evidence**, not a speculative project genealogy or deployment monitor.

## Visitor experience

A new collapsible **Field Chronicle** appears after the Living Encyclopedia in the existing Atlas study. It uses the exact same deployment-generated `encyclopedia.json` snapshot as R7. No additional browser API fetches, logins, GitHub tokens, or new dependencies are introduced.

- **Across the Field:** Combine all public source-repository event observations into one dated timeline. Filter by repository, source event type, year, month or PR-title text.
- **Temporal Pulse:** A count of dated observations by month for the chosen project/kind/year/search filters. Each visible month is keyboard-selectable and filters the actual timeline. The pulse is **not** commit frequency, deployment cadence or a measure of productivity.
- **Two reading directions:** Newest first (default) or oldest first, with a bounded initial 48 events and a deliberate Show More action.
- **Source links:** Each event links to its original public repository or numbered GitHub PR. A link back to the R7 source dossier is available.
- **Project journey:** From an R7 dossier use **View in Chronicle**; from a focused Chronicle view open its dossier or locate the repository's numeric ID in Field Constellation. The Constellation link is a locator only, not proof of an integrated application.
- **Shareable views:** `?chronicle=GMED&chronicleKind=merged&chronicleMonth=2026-11#field-chronicle` opens the filtered Chronicle. Old `?chapter=`, `?tour=`, `?project=`, and `?dossier=` routes remain independent. Missing or invalid project IDs do not trigger hidden lookups.

## Evidence model

The Chronicle derives only these dated kinds from **validated public R7 dossiers**:

| Type | Source | Exactly what it proves |
|---|---|---|
| Repository origin | GitHub `created_at` | GitHub repository existed at the recorded time. Does **not** date the original idea, first code or public launch. |
| Merged PR | Recent closed public PR with `merged_at` | A named PR was merged at that time. Does **not** guarantee deployment, test success or completed features. |
| Latest-push observation | GitHub `pushed_at` | Repository metadata showed a latest push. Does **not** guarantee publication. |

The previous R7 sync chooses **at most four** merged PRs from its bounded recent closed-PR sample; the Chronicle inherits that sampling limit. Older PRs, squash history outside the sample, issues, unmerged branches and unrecorded milestones may be missing. `historyStatus=unavailable` means *unknown*, **never zero merges**. The document is an evidence-based *partial reconstruction*, not a complete historical timeline.

Project **crossroads** are a separate, explicitly **undated** section. These reuse the existing R4B citation-pinned source ledger, only when both endpoint repositories exist in the public snapshot. No synthetic date is assigned, and documented technical interfaces are not called live-tested connections.

## Safety and backwards compatibility

- All source URLs are constructed from owner-public, constrained GitHub repository names and numeric PR numbers, not accepted from arbitrary text/JSON fields.
- Timeline creation is deterministic; no AI summaries, editorial speculation, guessed dates or invented dependencies.
- It never promotes a GitHub repository to a verified Pages chapter, and never grants iframe permissions.
- No private repository scanning, visitor-identity tracking, localStorage change, passport migration, or mutations to other repositories.
- R7's checked-in partial fallback provides nonempty Chronicle history when GitHub is temporarily unavailable; it is clearly labeled as partial with no snapshot timestamp.
- The same GitHub Actions deployment already refreshes R7's public snapshot daily. R8 consumes it automatically, without a second API quota-consuming refresh.
- No DNS, CNAME, canonical, `enterthefield.org` cutover or change to the manual release acceptance ledger. Issue #32's 12 human approval gates remain **NOT APPROVED**.

## Verification

Unit tests cover sorting, creation/merge/push semantics, month/year/kind/project filtering, duplicated/unsafe record rejection, safe canonical source URLs, partial-history accuracy, documentary crossroads and share-link validation.

Desktop and mobile-emulated Playwright flows cover a shared GMED Chronicle deep link, source PR evidence, project/kind filtering, opening from the R7 dossier, and preservation of the original reader.

**Passing automated checks authorizes only the automated scope**, not real device UX, external site function, or custom-domain migration.
