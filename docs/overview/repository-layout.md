---
id: repository-layout
title: Repository layout
sidebar_label: Repository layout
---

# Repository layout

The source repository is [`DarbotLM/raybot`](https://github.com/DarbotLM/raybot). It holds 206 files:
163 PNG, 22 JSON, 7 Markdown, 4 PDF, 4 PowerShell, 2 Python, and one each of CSV, HTML, and SVG.

```text
raybot/
├── README.md                     entry point and honesty notes
├── RUNBOOK.md                    main runbook, Phases 1-8, 570 lines
├── RUNBOOK.legacy.md             preserved narrative, Steps 0-20, 315 lines
├── screenshot-map.md             41 curated plus 35 superseded crosswalk
├── raybot-evalset.csv            6 Ray question-and-answer pairs
├── raybot-logo.svg               the only non-PNG brand asset in the root
├── NN_<phase>_....png            66 numbered originals, at the root
├── screenshots/                  41 curated phase-ordered renames
├── captures-2026-06-17/
│   ├── raw/                      26 unannotated captures
│   ├── annotated/                26 annotated captures
│   └── showcase/                 34 files, Incident Triage build
├── captures-2026-06-18/          70 files, showcase workflow catalog
│   ├── wfNN/                     stub-catalog stills (discarded set)
│   ├── wfNN-real/                connector-backed build stills
│   ├── annotated/                stub-catalog annotations
│   ├── annotated-real/           connector-backed annotations
│   └── node-rects.json           measured node geometry, per workflow
└── coral-schema/                 audit engine and ground truth
    ├── coral-ui-audit.html       self-contained interactive report
    ├── naming-schema.md          the two identifier layers
    ├── automation-candidates.md  25 ranked candidates, 2026-06-18 harvest
    ├── schema-validation.md      coverage narrative
    ├── schema-validation.json    coverage numbers
    ├── api-schema-map.json       57 endpoints, 11 domains, 7 hosts
    ├── gallery.json              95 curated captures
    ├── tab-audit-log.json        live designer-tab state, 2026-06-07
    ├── ui-elements-dump.json     raw per-surface element dump
    ├── elements-slim.json        1,627 rows, abbreviated keys
    ├── annotate_*.py             three Pillow annotators
    ├── surfaces/                 one JSON per audited surface
    └── darbot-validation/        independent validation pass
```

The screenshot layout has changed twice. Commit `7698a0d` moved all 66 numbered
originals into `screenshots/`; a later commit moved them back to the root and
left `screenshots/` holding only the 41 curated renames. The tree above is the
**current** arrangement. Any document describing `screenshots/` as holding
everything predates the reversion.

## The two runbooks

`RUNBOOK.md` is the current document: eight phases, a companion-audit index, and a process review.
`RUNBOOK.legacy.md` is the original narrative written as twenty sequential steps. It was preserved
rather than deleted because it contains detail the rewrite dropped:

- The original working directory, `...\Clawpilot\raybot-runbook`, reached through
  `filesystem-create_directory`. That directory no longer exists on any local drive.
- The full Evaluate field catalogue, including the CSV template download link (fwlink 2335991), the
  six-pair conversation ceiling, and the 1000-character limit on the Reference field.
- A far more verbose account of the Teams failure, running from line 172 to line 237.

Where the two disagree, `RUNBOOK.md` is authoritative on **what the runtime does** and
`RUNBOOK.legacy.md` is authoritative on **what the original session did**.

## The capture folders

There are four, and they are not interchangeable.

| Folder | Count | Naming | Source |
| --- | --- | --- | --- |
| repository root | 66 | `NN_<phase>_<surface>_<detail>.png` | Phases 1 through 6 originals |
| `screenshots/` | 41 | `NN-<phase>-<detail>.png` | Phases 1 through 6, curated renames |
| `captures-2026-06-17/` | 86 | `NN-<topic>-<detail>.png` | Phase 7 re-audit plus the Incident Triage build |
| `captures-2026-06-18/` | 70 | `wfNN[-real]/NN-<state>.png` | Phase 8 showcase catalog |

The underscore versus hyphen distinction is load-bearing. The screenshot-move commands in session
`d106b6f4` used exactly that difference to route each filename to the right folder with two separate
regular expressions. See [Command reference](../session/command-reference.md).

`captures-2026-06-18/` carries both the **discarded** stub catalog (`wfNN/`,
`annotated/`) and the connector-backed rebuild that replaced it (`wfNN-real/`,
`annotated-real/`). Neither folder name signals which is current. Read the
`-real` variants unless specifically looking for the discarded set - see
[Phase 8](../runbook/phase-8-showcase-catalog.mdx).

The 95 captures surfaced in this wiki's [gallery](../screenshots/gallery.mdx) are the curated subset
drawn from all four locations.

## The audit folder

`coral-schema/` is the ground-truth half of the project, and it is self-describing. Start with
`coral-ui-audit.html`, which is a single self-contained file holding a searchable element table, the
API map, and a screenshot gallery. Everything else in the folder is the data that report renders.

Read the JSON directly if you are building tooling:

| File | Shape |
| --- | --- |
| `elements-slim.json` | Flat array of 1,627 rows with abbreviated keys |
| `schema-validation.json` | Totals, per-surface counts, label gaps, shared test ids |
| `api-schema-map.json` | `domains` array of 11, `hosts` object map of 7 |
| `tab-audit-log.json` | Per-tab route, semantic route, and live state |
| `surfaces/*.json` | Per-surface harness output |

The abbreviated keys in `elements-slim.json` are: `s` surface, `t` test id, `tag`, `r` role,
`l` label, `ls` label source, `i` is-interactive, `ir` interactive reason, `d` disabled.

## The scripts

Four PowerShell scripts and five Python files sit in `coral-schema/`.

`rename-screenshots.ps1` maps the 66 numbered originals at the repository root to
the 41 curated names in `screenshots/`. It originally hardcoded an absolute path
into a OneDrive-synced authoring workspace, making it unrunnable outside one
machine; it now derives paths from `$PSScriptRoot` and treats that workspace as
an optional fallback. Eight of its 41 mapped sources - originals 69 through 76 -
were never committed, so a default run resolves 33 of 41 and reports the rest by
name. `-RequireAllSources` makes that gap fatal. Re-runs are byte-identical. See
[Errata](../reference/errata.md).

Three of the Python files are Pillow annotators that turn raw canvas captures
into labelled figures. See [Annotation pipeline](../automation/annotation-pipeline.md).

## Commit lineage

The repository has an unusually short history.

| Commit | Author | Change |
| --- | --- | --- |
| `16e4d1a` | darbotlabs | Initial seed: 206 files, 71,796 insertions, no incremental history |
| `7698a0d` | dayour | Move all screenshots to `screenshots/` and update references: 71 files changed |
| `b9f9595` | darbotlabs | Showcase workflow: Incident Triage and Routing, 17 annotated captures, Step 24 |
| `9206f4b` | darbotlabs | 11-workflow Coral showcase catalog plus session-harvest report |
| `56562d8` | darbotlabs | Rebuild the 11 showcase workflows with real connectors, agent, and human review |
| `d18c852` | dayour | Fix the four documented errata |

The seed commit means the build itself produced no version history. Everything that happened before
`16e4d1a` exists only as prose, captures, and audit JSON.
