---
id: changelog
title: Changelog
sidebar_label: Changelog
---

# Changelog

Dated record of the Raybot build, the re-audit, the repository reorganization, and this wiki.

Dates are from commit timestamps and capture metadata, not from recollection.

## 2026-06-07 — Build and audit

The Coral build session. Raybot created end to end through the Copilot Studio UI, driven by
Playwright MCP with a screenshot after every action.

| Event | Detail |
| --- | --- |
| Agent created | ID `4de4ada9-ad61-4c22-a0d0-a0bd1c189f4e` minted at first save |
| Schema name | `Default_Raybot_vyN1Rz` |
| Environment | Cypherdyne `Default-6b104499-c49f-45dc-b3a2-df95efd6eeb4` |
| Identity | `darbot@timelarp.com` |
| Model | Claude Sonnet 4.6 |
| Knowledge | `https://docs.ray.io` |
| Skill | `ray-cluster-troubleshooter` |
| Microsoft IQ | Foundry IQ KB `raybot-kb` |
| Memory | Enabled |

Phases 1 through 6 completed in this session. Phase 3 is the only phase that used non-browser
tooling — Azure CLI and the Search REST API.

Same-day outcomes:

- Icon accepted at 256 px after the 512 px render was rejected
- Foundry IQ rebuilt on Basic after the Free-tier attempt proved invisible to the picker
- Preview grounded correctly with four `docs.ray.io` citations
- Evaluation scored 0 percent with 6 Fail, at 12:47 PM, by Darbot
- Teams blocked

The ground-truth DOM and network audit ran the same day: 16 surfaces, 1,627 elements, 1,249 requests.

Validation the same day using `@darbotlabs/darbot-browser-mcp@1.3.0` over `file://`. Zero console
errors across four tabs, 38 of 38 gallery images returning HTTP 200, four PDFs exported.

## 2026-06-17 — Re-audit and repository seed

**Phase 7 re-audit**, under a different identity: `dayour@microsoft.com`, Copilot-DYdev25
`bbf34eea-8ed1-e502-a74c-6a7b21a8b002`.

| Finding | Detail |
| --- | --- |
| Monitor renamed | Now Analytics, at `/bots/{botId}/analytics/summary` |
| Legacy route | `/monitor` redirects to `/overview` |
| Workflows designer | Module `s01-workflow-designer/22.19.1` |
| Trigger types | 4 |
| Node types | 13, captured one at a time |

The 13 node types: Agent, Classify, M365 Copilot, Human review, Connector, Function, Variable,
If/Else, Loop, Note, Switch, Scope, End.

**Repository seeded** at 15:09 +0100 as commit `16e4d1a` — 206 files, 71,796 insertions, pushed to
`DarbotLM/raybot` under the darbotlabs identity. The repository was created wholesale from
already-existing artifacts rather than grown incrementally, which is why there is no incremental
history before this point.

**Screenshot reorganization**, 16:24:49Z, Copilot CLI session `d106b6f4`. 49 tool calls. 66 PNG files
moved from the repository root into `screenshots/`, with all markdown and script references rewritten
to match.

Result: commit `7698a0d` — 71 files changed, 59 insertions, 59 deletions.

All nine PowerShell commands from that session are recovered verbatim in the
[session command reference](../session/index.md).

A second CLI session the same minute, `a38c8e08` at 16:24:29Z, was a misfire — four PowerShell probes
hunting a directory that does not exist. It is recorded because the forensic claim is "exactly two
sessions touched this repository", and omitting the useless one would weaken that claim.

## 2026-09-16 and 2026-09-17 — This wiki

Docusaurus site and typed object model built at `dayour/raybot`, deployed to GitHub Pages.

| Commit | Contents |
| --- | --- |
| `4bf9a11` | Initial commit — 137 files, 51,626 insertions |
| `fd7f4d9` | Sync `package-lock.json` with the object-model workspace |
| `c91c90c` | Fix internal links for `trailingSlash: false`; add the issue-filing script |
| `2149862` | API surface pages; fix a latent `Column.header` bug in the evaluation table |
| `7a0e259` | Coral schema pages — confidence, surfaces, test ids, elements, label gaps, metrics |

Three build failures were found and fixed before the first deploy:

1. **SSG crash** — `<StatGrid />` rendered with no `stats` prop, and a `DataTable` given `searchKeys`
   as an array where the component expects a function.
2. **`/docs/intro` 404** — `docs/intro.md` carries `slug: /`, so it serves at `/docs`.
3. **Trailing-slash 404s** — `trailingSlash: false` emits `build/docs/api.html`, served at
   `/docs/api`. Links written with a trailing slash 404 in production. `onBrokenLinks: 'throw'`
   validates doc-relative markdown links but **not** navbar `to:` paths or JSX `<Link to=>`, so these
   only surfaced through live HTTP checks after deploy.

The first CI run failed on `npm ci` because `package-lock.json` predated the object-model workspace.
Fixed with `npm install --package-lock-only`.

Twelve issues were filed to track the remaining pages. They are worked sequentially, one issue per
commit.

## Provenance gap

**The original Coral build session has no surviving transcript.**

Neither the local nor the cloud Copilot CLI session store holds it. The build ran under a different
client. Legacy Step 0 points at `...\Clawpilot\raybot-runbook` via `filesystem-create_directory`, and
that directory no longer exists on C:, D:, or E:.

A session **does** exist at that path — `75113b80-f1b6-45af-9551-05aff22e030f`. On inspection it is a
review session, not the build. An earlier version of this record claimed no such session existed;
that claim was wrong because the search window had been set from the commit date rather than the
session date. The correction is recorded rather than quietly applied.

What survives: the runbook prose, 163 screenshots, and the audit JSON. There is no replayable
transcript, and this wiki does not pretend otherwise.

See [session forensics](../session/index.md) for the full method and the store queries that
established this.
