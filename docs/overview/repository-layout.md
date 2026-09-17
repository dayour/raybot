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
├── RUNBOOK.md                    main runbook, Phases 1-7, 448 lines
├── RUNBOOK.legacy.md             preserved narrative, Steps 0-20, 315 lines
├── screenshot-map.md             41 curated plus 35 superseded crosswalk
├── raybot-evalset.csv            6 Ray question-and-answer pairs
├── raybot-logo.svg               the only non-PNG brand asset in the root
├── screenshots/                  107 files
├── captures-2026-06-17/
│   ├── raw/                      26 unannotated captures
│   └── annotated/                26 annotated captures
└── coral-schema/                 40 files, audit engine and ground truth
    ├── coral-ui-audit.html       self-contained interactive report
    ├── naming-schema.md          the two identifier layers
    ├── schema-validation.md      coverage narrative
    ├── schema-validation.json    coverage numbers
    ├── api-schema-map.json       57 endpoints, 11 domains, 7 hosts
    ├── tab-audit-log.json        live designer-tab state, 2026-06-07
    ├── ui-elements-dump.json     raw per-surface element dump
    ├── elements-slim.json        1,627 rows, abbreviated keys
    ├── surfaces/                 one JSON per audited surface
    └── darbot-validation/        independent validation pass
```

## The two runbooks

`RUNBOOK.md` is the current document: seven phases, a companion-audit index, and a process review.
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

There are two, and they are not interchangeable.

| Folder | Count | Naming | Source |
| --- | --- | --- | --- |
| `screenshots/` | 107 | `NN_<phase>_<surface>_<detail>.png` | Phases 1 through 6, plus brand assets |
| `captures-2026-06-17/annotated/` | 26 | `NN-<topic>-<detail>.png` | Phase 7 re-audit, annotated |
| `captures-2026-06-17/raw/` | 26 | same stems | Phase 7 re-audit, unannotated |

The underscore versus hyphen distinction is load-bearing. The screenshot-move commands in session
`d106b6f4` used exactly that difference to route each filename to the right folder with two separate
regular expressions. See [Command reference](../session/command-reference.md).

The 67 captures surfaced in this wiki's [gallery](../screenshots/gallery.mdx) are the curated subset:
41 from `screenshots/` and 26 from `captures-2026-06-17/annotated/`.

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

Four PowerShell scripts and two Python files sit in `coral-schema/`. The one worth knowing about is
`rename-screenshots.ps1`, which is now effectively a no-op. It was written before the screenshot
move, when sources sat in the repository root and destinations in `screenshots/`. After commit
`7698a0d` both its source and destination paths resolve inside `screenshots/`, so re-running it
changes nothing. It survives as a re-run guard, not as a working tool. See
[Errata](../reference/errata.md).

## Commit lineage

The repository has an unusually short history.

| Commit | Author | Change |
| --- | --- | --- |
| `16e4d1a` | darbotlabs | Initial seed: 206 files, 71,796 insertions, no incremental history |
| `7698a0d` | dayour | Move all screenshots to `screenshots/` and update references: 71 files changed |

The seed commit means the build itself produced no version history. Everything that happened before
`16e4d1a` exists only as prose, captures, and audit JSON.
