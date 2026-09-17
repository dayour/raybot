---
id: runbook
title: Runbook types
sidebar_label: Runbook
---

# Runbook types

A runbook is an ordered set of phases; each phase is an ordered set of steps; each step records the
UI target it acted on, the captures that prove the result, and the outcome.

The model is **capture-first**: a step with no evidence is expressible, but it cannot honestly claim
`CONFIRMED` confidence.

## Step

```ts
export type StepMechanism =
  | 'browser'
  | 'azure-cli'
  | 'rest'
  | 'powershell'
  | 'manual';

export interface StepTarget {
  testId?: string;
  semanticId?: string;
  role?: string;
  name?: string;
}

export interface RunbookStep extends Evidenced {
  ordinal: number;
  title: string;
  mechanism: StepMechanism;
  target?: StepTarget;
  captures: string[];
  outcome: OutcomeStatus;
  constraint?: string;
}
```

`mechanism` records how a step was actually carried out, and it is the field that makes the
project's central claim checkable. The build was UI-only - except where it demonstrably was not.
Every step is `browser` apart from [Phase 3](../runbook/phase-3-foundry-iq.mdx), where Foundry IQ
provisioning required `azure-cli` and `rest`. Recording the mechanism per step turns "UI-only, except
Phase 3" from a caveat in prose into a queryable property:

```ts
phases.flatMap(p => p.steps).filter(s => s.mechanism !== 'browser');
```

`target` is optional and holds all four ways to address an element. A step can carry a raw
`data-testid`, a normalized `coral.*` semantic id, or an ARIA `role` plus accessible `name` - or
several at once. Both addressing styles are kept because they fail differently: test ids are stable
across copy changes but [ambiguous for 76 of 177 ids](./coral-surface.md#coraltestid), while
role-plus-name is unambiguous but drifts with wording.

`captures` is a required array, not optional. An empty array is the honest representation of an
unevidenced step, and requiring the field forces that to be stated rather than omitted.

`constraint` carries the gotcha a step surfaced - the 100 KB icon ceiling, the Basic-tier floor, the
published-only rule. These are the sentences a reader actually needs, so they are a first-class
field rather than prose buried in the step title.

## Phase

```ts
export interface RunbookPhase extends Evidenced {
  number: number;
  title: string;
  summary: string;
  outcome: OutcomeStatus;
  steps: RunbookStep[];
  blockedReason?: string;
}
```

`blockedReason` is populated when `outcome` is `BLOCKED` or `PARTIAL`. The pairing is a documented
invariant rather than a structural one; a discriminated union on `outcome` would make the
five-variant type awkward for the three outcomes that never carry a reason.

## OutcomeStatus

```ts
export type OutcomeStatus =
  | 'DONE'
  | 'PARTIAL'
  | 'BLOCKED'
  | 'FAILED'
  | 'NOT-ATTEMPTED';
```

Five values, and the distinctions among the last four are the point:

| Value | Meaning |
| --- | --- |
| `DONE` | Completed as intended. |
| `PARTIAL` | Completed, with a material caveat. Phase 5: published and grounded, but the evaluation scored zero. |
| `BLOCKED` | Could not complete due to an external condition. Phase 6: tenant consent never granted. |
| `FAILED` | Attempted and did not work, with no external blocker to point at. |
| `NOT-ATTEMPTED` | Never tried. |

A three-value success/failure/skipped enum would have collapsed Phase 5 and Phase 6 into the same
bucket. They are not the same: Phase 5 produced a working agent with one broken measurement, while
Phase 6 produced nothing and could not have, regardless of maker effort. `BLOCKED` versus `FAILED`
carries the further distinction of whether anyone at the maker level could have done something
differently.

## RAYBOT_PHASES

```ts
export const RAYBOT_PHASES: readonly {
  number: number;
  id: string;
  title: string;
  outcome: OutcomeStatus;
  summary: string;
}[];
```

The canonical seven-phase index:

| # | `id` | Title | Outcome |
| --- | --- | --- | --- |
| 1 | `build` | Build | `DONE` |
| 2 | `right-rail` | Right rail configuration | `DONE` |
| 3 | `foundry-iq` | Foundry IQ knowledge base | `DONE` |
| 4 | `settings` | Settings | `DONE` |
| 5 | `publish-evaluate` | Publish, Preview, Evaluate, Monitor | `PARTIAL` |
| 6 | `teams` | Teams channel | `BLOCKED` |
| 7 | `reaudit` | Runtime re-audit | `DONE` |

Note the shape: it is an inline type carrying `number`, `id`, `title`, `outcome`, and `summary` - but
**not** `steps`. It is deliberately not `RunbookPhase[]`.

The step detail is narrative. It changes as the product changes, it is long, and it is already
written as prose in the [runbook pages](../runbook/index.md). Duplicating it into a constant would
create two sources of truth that drift. The constant carries the index - the part that is stable,
short, and needed programmatically for navigation and status rollups. `RunbookPhase` and
`RunbookStep` remain available for consumers modelling their own runbooks.

`id` is the slug used in the documentation route, so the constant doubles as a navigation model:
phase 3 is `/docs/runbook/phase-3-foundry-iq`.

## Runbook

```ts
export interface Runbook extends Evidenced {
  title: string;
  validatedOn: IsoDate;
  phases: RunbookPhase[];
}
```

`validatedOn` is the date the content was last checked end to end, not the date it was written. A
runbook that documents a moving product is only as trustworthy as its last validation, and dating
that separately from authorship makes staleness visible.

## Related

- [Runbook](../runbook/index.md) - the seven phases as prose
- [Legacy runbook](../runbook/legacy.md) - the preserved 21-step narrative
- [Confidence model](../coral-schema/confidence.md)
