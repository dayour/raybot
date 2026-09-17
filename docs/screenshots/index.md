---
id: index
title: Screenshots
sidebar_label: Overview
---

# Screenshots

Every action in the build was captured. The rule was simple and absolute: screenshot after every
action, before moving to the next one. That is what makes the runbook verifiable rather than
anecdotal.

## The three counts

Three different numbers appear across the source repository, and all three are correct in their own
scope. This has confused readers, so it is stated plainly here.

| Count | Source | Scope |
| --- | --- | --- |
| 67 | `gallery.json` | Every curated capture carried into the gallery |
| 41 | `screenshot-map.md` | Phase 1 through 6 curated captures only, with 35 superseded originals crosswalked |
| 38 | `darbot-validation/README.md` | Images that loaded successfully during the `file://` validation pass |

67 is the total. 41 is the Phase 1 through 6 subset. 38 is what the validation harness actually
requested and confirmed HTTP 200 on. None of them contradicts the others.

## Two naming conventions

The build and the re-audit used different schemes, and both are preserved rather than normalized.

**Phases 1 through 6**, in `screenshots/`:

```text
NN_<phase>_<surface>_<detail>.png
```

**Phase 7**, in `captures-2026-06-17/`:

```text
NN-<topic>-<detail>.png
```

Phase 7 keeps both a `raw/` and an `annotated/` copy of each of its 26 captures. The gallery uses
the annotated set.

## Distribution by phase

| Phase | Captures |
| --- | --- |
| Workflow designer | 17 |
| Evaluate | 8 |
| Settings | 7 |
| Tools | 6 |
| Microsoft IQ | 5 |
| Build | 4 |
| Knowledge | 4 |
| Runtime | 4 |
| Skills | 3 |
| Teams | 3 |
| Publish | 2 |
| Connected agents | 1 |
| Memory | 1 |
| Monitor | 1 |
| Preview | 1 |

The workflow designer dominates because Phase 7 captured all thirteen node types individually, each
requiring a fresh canvas load.

## Where they live now

All PNGs were moved out of the repository root into `screenshots/` on 2026-06-17, and every reference
in `RUNBOOK.md` and `RUNBOOK.legacy.md` was rewritten to match. The nine commands that did this are
documented in [session forensics](../session/index.md).

The move was clean: git detected all 66 files as renames, so commit `7698a0d` is 59 insertions and 59
deletions rather than a full re-add.

## Validation

On 2026-06-07 the gallery was validated with `@darbotlabs/darbot-browser-mcp@1.3.0` driving a
`file://` load, because Playwright blocks the `file://` protocol.

| Check | Result |
| --- | --- |
| Console errors across 4 tabs | 0 |
| Gallery images returning HTTP 200 | 38 of 38 |
| PDFs exported | 4 |

One known limitation in that driver version: `page._snapshotForAI is not a function`, which breaks
screenshot, snapshot, and click. Navigation and network assertions still work, which was enough for
this validation.

## Browse

See the [gallery](./gallery.mdx) for all 67 captures with phase filtering.
