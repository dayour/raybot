---
id: errata
title: Errata
sidebar_label: Errata
---

# Errata

Known inconsistencies in the source repository. They are recorded rather than silently corrected,
because the source repository is the primary artifact and this wiki is a derived one.

## 1. Three different screenshot counts

**Where.** `README.md` states the gallery has 67 captures. `darbot-validation/README.md` reports
38 of 38 images verified. `screenshot-map.md` crosswalks 41 curated captures against 35 superseded
originals.

**Assessment.** Not an error. All three are correct in their own scope:

- 67 is the total curated set in `gallery.json`.
- 41 is the Phase 1 through 6 subset, which is all `screenshot-map.md` covers.
- 38 is what the `file://` validation harness actually requested and confirmed HTTP 200 on.

**Action.** Documented in [Screenshots](../screenshots/index.md). No change to the source repository
is warranted, though a one-line scope note in each README would prevent the confusion recurring.

## 2. Emoji in `RUNBOOK.md` contradicts the stated convention

**Where.** `README.md` line 40 states "No emojis anywhere by convention." `RUNBOOK.md` lines 88 and
128 contain check, warning, and cross emoji.

**Assessment.** A genuine inconsistency. The convention is stated as absolute and is violated twice.

**Action.** Either remove the two occurrences or soften the README claim. Tracked as an open issue.
This wiki follows the stricter reading and contains no emoji.

## 3. Pre-move wording in `screenshot-map.md`

**Where.** `screenshot-map.md` line 4 reads "Originals are also preserved in `screenshots/`."

**Assessment.** Written before the 2026-06-17 move, when `screenshots/` held only a subset and the
root held the rest. After the move it is technically true but reads ambiguously — it implies
`screenshots/` is an archive of originals alongside a working set elsewhere, when in fact it is now
the only location.

**Action.** Reword to state that `screenshots/` is the canonical location. Tracked as an open issue.

## 4. `rename-screenshots.ps1` is now a no-op

**Where.** `coral-schema/rename-screenshots.ps1`.

**Assessment.** The script was rewritten during the move so that both its source and destination
paths point into `screenshots/`. Re-running it does nothing. It is effectively a re-run guard rather
than a rename tool.

**Action.** Either delete it or add a comment stating it is retained for provenance and is
intentionally idempotent. Tracked as an open issue.

## 5. Corrected forensics finding

**Where.** An earlier analysis pass, not the source repository.

**Assessment.** An earlier pass reported that no Copilot CLI session existed at the
`Clawpilot\raybot-runbook` path. This was wrong: the search window was set to June, derived from the
commit date, while the session is dated September.

Session `75113b80-f1b6-45af-9551-05aff22e030f` exists and has been inspected. The corrected finding
is narrower but still holds — it is a **review** session, not the Coral build. The build transcript
genuinely does not exist in either store.

**Action.** Corrected in [Session forensics](../session/index.md). Recorded here because a
retracted finding is worth more than a quietly deleted one.

## Not errata

For completeness, three things that look like errors and are not:

- **The 0 percent evaluation score.** Real, recorded, and qualified. The agent grounds correctly in
  Preview; the evaluation harness returns a fallback on Draft and HTTP 500 on Published.
- **The Teams channel showing as enabled.** The maker UI genuinely reports enabled. The tenant
  registration genuinely never completed. Both statements are true simultaneously, which is why the
  object model carries `uiReportsEnabled` and `verifiedReachable` as separate fields.
- **The wasted Free-tier search service.** `raybot-foundryiq-search` was built on the Free tier
  before the Basic-tier requirement was known. It is recorded as a dead end rather than removed from
  the narrative.
