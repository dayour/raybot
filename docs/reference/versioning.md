---
id: versioning
title: Versioning strategy
sidebar_label: Versioning
description: Why this site is not versioned today, the exact trigger that would change that, and the mechanism ready to use when it fires.
---

This site is **not versioned**. That is a decision, not an omission, and it has a defined trigger.

## The decision

Docusaurus versioning snapshots the entire `docs/` tree into `versioned_docs/version-N`, giving
readers a version picker and permanent URLs per version. It is the right tool when a documented
product ships breaking changes on a cadence and consumers are pinned to older releases.

None of that applies here yet.

| Condition for versioning | Status |
| --- | --- |
| Multiple supported releases in the wild | No. Coral ships continuously; there is one live surface. |
| Readers pinned to an older release | No. Nobody can choose an older Coral. |
| Breaking changes between documented states | Partially. See the trigger below. |
| Cost of snapshotting is low | No. A snapshot duplicates 66 pages and the entire capture set. |

Versioning now would triple the maintenance surface to describe a product that has exactly one
version available to anyone.

## What is used instead

Three mechanisms already cover the ground versioning would cover, more cheaply and more honestly.

**Dated captures.** Every screenshot carries the date it was taken, and the capture directories are
named for their date — `captures-2026-06-17`. A reader can always tell how old an image is without a
version picker.

**The confidence model.** Every fact in the [object model](../object-model/index.md) declares
`CONFIRMED`, `SOURCE-INSPECTED`, or `UNCONFIRMED`. Staleness shows up as a downgrade in confidence,
which is more useful than a version number because it is per-fact rather than per-site.

**The re-audit phase.** [Phase 7](../runbook/phase-7-reaudit.mdx) is a re-run of the audit against a
later build of Coral, written as a diff against the original. That is the pattern for handling
drift: re-audit and record the delta in place, not fork the tree.

Phase 7 is also the proof the pattern works. Between the original build and the re-audit, Monitor was
renamed Analytics and its route moved from `/monitor` to `/bots/{botId}/analytics/summary`. That
change is recorded as a delta on one page. Under versioning it would have required a full snapshot to
express the same single fact.

## The trigger

Versioning starts when **a re-audit invalidates more than roughly a third of the captured surface at
once**, such that a single tree can no longer honestly describe both states.

Concretely, any one of these:

- A Coral navigation overhaul that changes more than five of the sixteen audited surfaces.
- A test-id scheme change that invalidates a majority of the 177 catalogued test ids.
- An API rename that breaks more than a third of the 57 catalogued endpoints.

Below that threshold, in-place deltas stay clearer. Above it, the two states genuinely are different
products and deserve separate trees.

## The mechanism, when it fires

```bash
npm run docusaurus docs:version 2026.06
```

That snapshots the current tree as the dated version, leaves `docs/` as the working next version, and
adds a version dropdown. Required follow-ups:

1. Add a `versions` entry to the docs preset in `docusaurus.config.ts` so the snapshot gets a readable
   label and the current tree is labelled as unreleased.
2. Add the version dropdown to the navbar.
3. Decide whether captures are copied into the snapshot or shared. **Share them.** The images are
   large and immutable; duplicating a capture set per version is pure waste, and the dated directory
   names already disambiguate.
4. Exclude `versioned_docs` from the search index budget check — the current index is already 1.6 MB.

Versions are named by audit date, not by semantic version. There is no Raybot release number to track,
and a date is the only label that means anything for a capture-backed audit.

## What this does not prove

Choosing not to version says nothing about whether the current content is accurate. It says the site
has one state worth publishing. The
[changelog](./changelog.md) records what changed and when; the
[errata](./errata.md) records what is known to be wrong. Those are the pages to read for currency,
not a version picker.
