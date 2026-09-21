---
id: errata
title: Errata
sidebar_label: Errata
description: Inconsistencies found in the source repository, what each one turned out to be on re-inspection, and how each was resolved.
---

# Errata

Inconsistencies found in the source repository, recorded rather than silently
corrected, because the source repository is the primary artifact and this wiki is
a derived one.

**All four source-repository items below are now fixed**, in
[`DarbotLM/raybot@d18c852`](https://github.com/DarbotLM/raybot/commit/d18c852).
Each entry keeps its original finding, because the discrepancy between what was
first reported and what was actually true is the useful part.

## How these were re-derived before fixing

The four findings were made against commit `7698a0d`. By the time they were
fixed, the source repository had advanced three commits to `56562d8` - adding the
showcase workflow builds, a rebuilt eleven-workflow catalog, and a session-harvest
report.

The fixes were therefore **re-derived against the current tree rather than
applied as written**. That turned out to matter: three of the four had changed
shape, and one had changed so completely that applying the original fix would
have introduced a new error. A stale errata item is not a safe thing to action.

## 1. Disagreeing screenshot counts

**Original finding.** `README.md` stated 67 gallery captures.
`darbot-validation/README.md` reported 38 of 38 verified. `screenshot-map.md`
crosswalked 41 curated captures. Three numbers, assessed as all correct in their
own scope and therefore not an error.

**What was actually true.** The scoping assessment was right, but one number was
genuinely stale rather than merely unscoped. `gallery.json` had grown to **95**
entries when the showcase captures landed. The README's 67 was not a
differently-scoped count; it was simply out of date.

There were also four counts in circulation by then, not three, because the
screenshot layout reverted and the 66 numbered originals at the repository root
became a distinct set again.

**Resolved.** README corrected to 95. All four counts now scoped in a single
table in `screenshot-map.md`:

| Count | Scope |
|---|---|
| 95 | Every capture in `gallery.json` |
| 66 | Numbered originals committed at the repository root |
| 41 | Curated phase-ordered renames |
| 38 | Images verified HTTP 200 in the 2026-06-07 validation run |

Documented in [Screenshots](../screenshots/index.md).

## 2. Emoji contradicting the stated convention

**Original finding.** `README.md` states "No emojis anywhere by convention."
`RUNBOOK.md` lines 88 and 128 contain check, warning, and cross emoji - two
violations.

**What was actually true.** Twenty-one violations, not two. Twelve in
`RUNBOOK.md` and nine in `RUNBOOK.legacy.md`, which had not been checked at all.
The original finding was positional - it recorded the two lines someone happened
to notice - and the real sweep needed a position-independent pass over both
files.

**Resolved.** All twenty-one replaced with explicit labels: `CONFIRMED:`,
`WARNING:`, `FAILED:`. Two trailing check marks on step headings were dropped
rather than relabelled, because a heading does not need a status prefix.

The labels are strictly more informative than the glyphs they replaced. A check
mark means "good"; `CONFIRMED:` means the claim was observed directly, which is
the distinction this entire repository is organised around.

## 3. Pre-move wording in `screenshot-map.md`

**Original finding.** The header read "Originals are also preserved in
`screenshots/`" - written before the 2026-06-17 move, technically true
afterwards, but ambiguous.

**What was actually true.** The header no longer said that. It had become a
description of the **external authoring workspace** - referring to
`raybot-runbook/` and "the workspace root," neither of which is a path in the
repository. A reader following it would look for directories that do not exist.

The screenshot layout had also reverted: the 66 numbered originals moved back to
the repository root, and `screenshots/` now holds only the 41 curated renames -
the reverse of the arrangement the original errata item assumed.

**Resolved.** Header rewritten to describe the actual repository layout, with the
four-count scope table. The external workspace is no longer referenced as though
it were part of the repository.

## 4. `rename-screenshots.ps1`

**Original finding.** The script's source and destination both pointed into
`screenshots/`, making re-runs no-ops. Assessed as a re-run guard rather than a
rename tool.

**What was actually true.** Not a no-op, and the idempotence was never the
problem. The script hardcoded an absolute path into a OneDrive-synced folder on
one specific workstation, which made it unrunnable for anyone else - a harder
failure than doing nothing.

Re-inspection also surfaced a fact the original finding missed: **8 of its 41
mapped source files were never committed to the repository.** Originals 69
through 76 exist only in the external workspace. Their curated outputs are all
present in `screenshots/`, so the gap is invisible unless the script is actually
run.

**Resolved.** Repointed to repository-relative paths derived from
`$PSScriptRoot`, with the external workspace retained as an optional fallback
resolved through `$env:USERPROFILE`. The 8 missing sources are now reported by
name in a single consolidated message rather than as scattered per-file warnings,
and a `-RequireAllSources` switch makes the gap fatal for callers that need all
41.

Verified across both branches: 41 of 41 with the external folder present, 33 of
41 with a named eight-item report when absent, and byte-identical output on
re-run.

## 5. Corrected forensics finding

**Where.** An earlier analysis pass, not the source repository.

**Assessment.** An earlier pass reported that no Copilot CLI session existed at
the `Clawpilot\raybot-runbook` path. This was wrong: the search window was set to
June, derived from the commit date, while the session is dated September.

Session `75113b80-f1b6-45af-9551-05aff22e030f` exists and has been inspected. The
corrected finding is narrower but still holds - it is a **review** session, not
the Coral build. The build transcript genuinely does not exist in either store.

A second correction from the same pass: the `Clawpilot\raybot-runbook` directory
was reported as absent from disk. It exists. That error and the session-window
error share a cause - a negative result was accepted without checking whether the
search that produced it was scoped correctly.

**Action.** Corrected in [Session forensics](../session/index.md). Recorded here
because a retracted finding is worth more than a quietly deleted one.

## What these five have in common

Four of the five were **understated**, in the same direction: two emoji became
twenty-one, a no-op became an unrunnable hardcoded path, an ambiguous sentence
became a reference to nonexistent directories, and a correctly-scoped count
became a stale one.

The pattern is that each original finding recorded the **first instance
encountered** and generalised from it without sweeping for the rest. That is a
cheap error to make and an expensive one to inherit, because a fix sized to the
reported scope leaves most of the problem in place and marks it resolved.

The practical consequence: every item here was re-derived from scratch before
being fixed, and none was fixed as written.

## Not errata

For completeness, three things that look like errors and are not:

- **The 0 percent evaluation score.** Real, recorded, and qualified. The agent
  grounds correctly in Preview; the evaluation harness returns a fallback on
  Draft and HTTP 500 on Published.
- **The Teams channel showing as enabled.** The maker UI genuinely reports
  enabled. The tenant registration genuinely never completed. Both statements are
  true simultaneously, which is why the object model carries `uiReportsEnabled`
  and `verifiedReachable` as separate fields.
- **The wasted Free-tier search service.** `raybot-foundryiq-search` was built on
  the Free tier before the Basic-tier requirement was known. It is recorded as a
  dead end rather than removed from the narrative.

A fourth, added with Phase 8: **the discarded stub workflow catalog.** Eleven
workflows were built, annotated, and then replaced wholesale by connector-backed
rebuilds. Both the stubs' annotator and their annotated output remain in the
repository. That is deliberate - the stubs are the evidence for why the rebuild
was necessary. See
[Phase 8](../runbook/phase-8-showcase-catalog.mdx) and the
[annotation pipeline](../automation/annotation-pipeline.md).
