---
name: Field Atlas manual release review
about: Record real-device and cross-project acceptance evidence before any custom-domain launch
title: "[Field Atlas R5] Manual Grand Opening review"
---

## Candidate and evidence

- Exact Git commit SHA:
- Successful **post-deploy** workflow URL:
- Machine acceptance packet / HTTP evidence link:
- Date, tester, devices, browsers, and OS:

## Visitor reality checks

For every result, mark **PASS**, **FAIL**, **BLOCKED**, or **NOT TESTED**.
Include an evidence link or reproducible notes. Do not treat a successful
automated workflow as proof of hands-on testing.

| Review | Result | Evidence / problem |
|---|---|---|
| Wide desktop book, tabs and preview | NOT TESTED | |
| Physical phone touch and landscape | NOT TESTED | |
| Keyboard Tab, arrows, Escape and focus return | NOT TESTED | |
| Screen reader NVDA/VoiceOver | NOT TESTED | |
| Reduced-motion OS setting | NOT TESTED | |
| External studios, games and research | NOT TESTED | |
| Live public catalog / at least 3 projects | NOT TESTED | |
| Passport backup, restore, bad-file rejection | NOT TESTED | |
| Real social share preview and deep links | NOT TESTED | |
| Long catalog memory, loading and responsive performance | NOT TESTED | |
| Registrar control and authoritative DNS snapshot | NOT TESTED | |
| Reversible HTTPS, apex/www and legacy URL cutover plan | NOT TESTED | |

## Five actual chapter walk-throughs

Use `docs/R5F_PORTAL_COMPATIBILITY.md` for exact links and expectations.
For **each** portal: open its Atlas deep link, check the "Open this world"
(or "Open Zenodo record") new-tab fallback, try the tool/game in its own
tab, then record whether the *limited* iframe preview worked separately.

- [ ] Super Φ.Vessel: agent interface; public route, security/permissions
- [ ] Domistika: drawing brushes and local editing
- [ ] PixelForge: creative controls, export, WebGL where supported
- [ ] GiltHouse: keyboard and touch game controls
- [ ] Zenodo UFP × DCF: record/citation, no live iframe

## Blockers and disposition

- Known failures / affected devices:
- Fix issues / follow-up PRs:
- Current recommendation: **NOT APPROVED**
- Human reviewer and explicit signoff only after all 12 requirements have
  verified PASS evidence tied to one exact reviewed commit.

**Do not change `enterthefield.org`, CNAME, GitHub Pages custom-domain
settings, DNS, share canonicals or redirect behavior as part of this issue.**
