---
id: confidence
title: Confidence model
sidebar_label: Confidence model
---

# Confidence model

Every assertion in this project carries a grade. The grade is not decoration — it determines what the
assertion can be used for.

## The three grades

| Grade | Means | Safe to |
| --- | --- | --- |
| `CONFIRMED` | Observed live in a running system | Automate against, cite as fact |
| `SOURCE-INSPECTED` | Read from source or a published artifact, not observed executing | Design against, verify before relying on |
| `UNCONFIRMED` | Inferred or asserted without direct evidence | Treat as a hypothesis |

There is deliberately no fourth grade for "documented". Documentation that has not been observed
executing is `SOURCE-INSPECTED` at best. This project was built partly because the documentation and
the runtime disagreed in several places.

## This audit is CONFIRMED throughout

Every element row came from a live DOM walk in a running Coral session. Every endpoint came from a
live network capture in the same session. Nothing in the audit output was inferred, copied from
documentation, or reconstructed from memory.

That is a strong claim, so it is worth being precise about what it does and does not cover.

**What `CONFIRMED` covers here:** the element existed in the DOM at capture time with the recorded
tag, role, test id, and disabled state. The request was made and returned the recorded status code.

**What it does not cover:** that the element will exist in a future build, that the endpoint is
contractually guaranteed, or that the behaviour generalizes beyond this environment and identity.
See [ground truth](../api/ground-truth.md) for the API-side version of this caveat.

## Aggregation

Confidence composes downward. A composite is only as strong as its weakest member.

```ts
export function weakestConfidence(levels: ConfidenceLevel[]): ConfidenceLevel {
  if (levels.includes('UNCONFIRMED')) return 'UNCONFIRMED';
  if (levels.includes('SOURCE-INSPECTED')) return 'SOURCE-INSPECTED';
  return 'CONFIRMED';
}
```

A `CONFIRMED` agent containing one `UNCONFIRMED` tool is `UNCONFIRMED` as a whole. This is
intentional and occasionally inconvenient. It prevents a high-confidence wrapper from laundering a
low-confidence claim, which is the most common way evidence quality silently degrades.

## The four honesty notes

These qualify every number in the audit and are reproduced here in full, because a metric without its
methodology is a liability.

### 1. Interactivity is computed, not read from test ids

`isInteractive` is derived from native control type, presence of `href`, ARIA role, `tabindex`, and
`contenteditable`. It is calculated **independently** of whether an element carries a `data-testid`.

Two consequences follow, and both occur in the data:

- An element can be interactive with **no** test id. There are 228 such elements with no derivable
  label, and more with labels.
- An element can carry a test id while being **inert**. The per-surface
  `testIdOnlyNonInteractive` column counts these.

So "elements with a test id" and "interactive elements" are overlapping sets, not nested ones. Any
analysis that treats a test id as proof of interactivity will be wrong.

### 2. Labels are heuristic

`derivedLabel` is a heuristic, not a strict accessible-name computation per the ARIA specification.
The heuristic that produced each value is recorded in `labelSource`, so you can see which rule fired.

This means the 228 [label gaps](./label-gaps.mdx) are a **lower bound on investigation**, not an
accessibility finding. An element with no derivable label may still have a correct accessible name
that the heuristic missed. Conversely, an element with a derived label may still fail a real
accessible-name check.

Reporting these as accessibility defects would overstate the evidence. They are candidates.

### 3. The API map is observed traffic

The endpoint map records what the client did, not what the service promises. It was reconciled
against the authoritative corpus, and four observations matched exactly, but it was not replaced by
the corpus. Absence from the map is not evidence that an endpoint does not exist.

### 4. Test ids are not unique

76 of 177 unique test ids appear on more than one surface. A `data-testid` alone is **not** a
sufficient selector across the application. It must be qualified by surface.

This is the single most actionable finding in the audit for anyone writing automation. See
[shared test ids](./shared-testids.mdx).

## Why grade at all

Two reasons.

**It makes retraction cheap.** When [an earlier forensics finding turned out to be
wrong](../session/index.md), the correction was a localized change because the claim had been scoped
to its evidence rather than stated flatly.

**It makes the gaps visible.** A document with no grades reads uniformly confident. A document with
grades shows you exactly where the thin ice is, which is the information you actually need before
depending on it.
