---
id: coral-surface
title: Coral surfaces and elements
sidebar_label: Coral surfaces
---

# Coral surfaces and elements

The `coral` module models the ground-truth audit corpus: sixteen captured surfaces, 1,627 elements,
177 unique test ids, and 57 endpoints across seven hosts.

The identifier grammars themselves are covered in [Naming](../coral-schema/naming.md). This page
covers the record types that carry the captured data.

## CoralSurface

One row per captured surface - a full DOM dump of a page or dialog.

```ts
export interface CoralSurface {
  surface: string;
  dumpFile: string;
  total: number;
  interactive: number;
  hasTestId: number;
  testIdOnlyNonInteractive: number;
  missingLabel: number;
  disabled: number;
  notVisible: number;
  occludedVisibleNotTopmost: number;
  dupTestIdsInSurface: number;
  uniqueTestIds: number;
  isModal: boolean;
}
```

Every count is a separate field rather than a nested stats object, because the export is a flat table
and flattening at read time would add a transform for no gain.

Three of the counters are worth explaining, because they encode findings rather than arithmetic:

**`testIdOnlyNonInteractive`** - elements carrying a `data-testid` that are nonetheless not
interactive. Coral attaches test ids to many layout wrappers. The practical consequence: **the
presence of a test id is not a signal that an element can be clicked.** Automation that locates by
test id and then clicks will sometimes click a `div`. This counter exists to make the size of that
trap visible per surface.

**`occludedVisibleNotTopmost`** - elements that are visible in layout but covered by another element
at their centre point. These pass a naive visibility check and then fail to receive a click. This is
the single most common source of a flaky "element is visible but click does nothing" failure.

**`dupTestIdsInSurface`** - test ids appearing more than once *within one surface*. Distinct from
`CoralTestId.isShared`, which tracks reuse *across* surfaces. A duplicate within a surface means a
test-id locator is ambiguous on that page and needs a `.first()` or a scoping container.

`isModal` separates dialogs from pages. Modal surfaces were captured with the dialog open over its
parent, so their element counts include the underlying page - a fact worth remembering before summing
`total` across all sixteen rows and expecting it to equal the corpus size.

Browse at [Surfaces](../coral-schema/surfaces.mdx).

## CoralElement

One row per element, 1,627 of them.

```ts
export interface CoralElement {
  surface: string;
  testId: string | null;
  tag: string;
  role: string | null;
  label: string | null;
  labelSource: string | null;
  isInteractive: boolean;
  interactiveReason: string | null;
  isDisabled: boolean;
}
```

Four fields are nullable, and each null is meaningful: no test id, no ARIA role, no derivable
accessible name, not classified as interactive.

`labelSource` and `interactiveReason` are typed `string | null` on the record even though the module
also declares unions for them:

```ts
export type LabelSource =
  | 'aria-label' | 'aria-labelledby' | 'title' | 'alt'
  | 'placeholder' | 'value' | 'text' | 'testid' | 'none';

export type InteractiveReason =
  | 'tag' | 'role' | 'tabindex' | 'onclick' | 'contenteditable' | 'none';
```

The unions document the closed sets the extractor emits. The record fields stay `string` because the
extractor is a separate program with its own lifecycle: a new detection heuristic would emit a value
the union does not contain, and a narrowed type would then reject valid ground-truth data at
validation time. The looser field means new data loads and the union tells you what was expected.

`LabelSource` is ordered by strength. An explicit `aria-label` is authoritative; a name recovered
from visible text drifts whenever copy changes. A locator built on a `text`-sourced label is
inherently more fragile than one built on `aria-label`.

Browse at [Element explorer](../coral-schema/element-explorer.mdx).

## CoralTestId

The aggregated view - one row per unique test id, 177 of them.

```ts
export interface CoralTestId {
  testId: string;
  occurrences: number;
  surfaces: string[];
  surfaceCount: number;
  isShared: boolean;
  tags: string[];
  roles: string[];
  anyInteractive: boolean;
  sampleLabel: string | null;
}
```

`isShared` is `surfaceCount > 1`, precomputed because it is the field everything filters on: **76 of
the 177 test ids are shared across surfaces.** A test-id locator with no surface scope is ambiguous
for 43 percent of the corpus.

`tags` and `roles` are arrays because the same test id can land on different elements in different
places - the audit found ids appearing as both a `button` and a `div`.

`anyInteractive` is an any-quantifier, not an all-quantifier. A `true` value means *at least one*
occurrence is interactive, which is exactly the right question when deciding whether a test id is
ever clickable, and exactly the wrong one when deciding whether a *specific* occurrence is.

Browse at [Test id catalog](../coral-schema/testid-catalog.mdx) and
[Shared test ids](../coral-schema/shared-testids.mdx).

## Network types

```ts
export interface ApiHost {
  key: string;
  host: string;
  role: string;
  requestCount: number;
}

export interface ApiEndpoint extends Evidenced {
  domain: string;
  domainTitle: string | null;
  method: string;
  host: string;
  hostName: string;
  path: string;
  count: number;
  purpose: string;
  semanticId: string;
  confidence: ConfidenceLevel;
  status?: string | null;
}
```

`path` carries `{key}` placeholders substituted for observed identifiers, so endpoints collapse into
routes rather than fanning out per GUID.

`domainTitle` is `string | null` and is **null in all 57 rows**. The titles live in the domain lookup,
not on the endpoint row. This was caught by the
[data validator](./json-schemas.md), not by `tsc` - nothing imports the dataset as a typed value, so
the drift was invisible to the compiler until the schemas started checking the data.

`status` is likewise null throughout the published export.

Browse at [Endpoints](../api/endpoints.mdx) and [Hosts](../api/hosts.mdx).

## AuditTotals

The corpus roll-up, one object.

```ts
export interface AuditTotals {
  generated: string;
  auditDate: string;
  surfaces: number;
  elements: number;
  interactive: number;
  withTestId: number;
  uniqueTestIds: number;
  interactiveMissingLabel: number;
  sharedTestIds: number;
  labelSourceDistribution: LabelSourceCount[];
  interactiveReasonDistribution: InteractiveReasonCount[];
  roleDistribution: RoleCount[];
  api: {
    allRequests: number;
    functionalApiRequests: number;
    excluded: number;
    statusDistribution: Record<string, number>;
    endpointCount: number;
    domainCount: number;
  };
  gallery: { entries: number; missing: number };
}
```

The three distributions are arrays of labelled counts, not keyed objects:

```ts
export interface LabelSourceCount { source: string; count: number }
export interface InteractiveReasonCount { reason: string; count: number }
export interface RoleCount { role: string; count: number }
```

They were originally typed `Record<string, number>` and the validator rejected the real data. The
exporter emits arrays because **the label is data** - values like `aria-label`, `native-control`, and
`none` are content, and several are not comfortable object keys. Three concrete interfaces exist
rather than one generic shape because the key name differs per distribution: `source`, `reason`,
`role`.

`api.statusDistribution` stays a `Record` because its keys are HTTP status codes - a genuinely
key-shaped domain.

Browse at [Metrics](../coral-schema/metrics.mdx).

## Related

- [Naming](../coral-schema/naming.md) - the two identifier grammars
- [Confidence model](../coral-schema/confidence.md)
- [API ground truth](../api/ground-truth.md)
- [JSON Schemas](./json-schemas.md)
