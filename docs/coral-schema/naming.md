---
id: naming
title: Naming schema
sidebar_label: Naming schema
---

# Naming schema

Two parallel identifier layers: one for UI elements, one for API operations. They are deliberately
different formats so that an identifier is self-describing about which layer it belongs to.

## UI layer

```text
coral.<area>.<surface>.<component>[.<state>]
```

Lowercase, dot-separated, hyphens inside a segment. The state suffix is optional.

### Areas

| Area | Covers |
| --- | --- |
| `shell` | Application chrome, navigation, global controls |
| `toolbar` | Command bars |
| `build` | The agent build canvas |
| `panel` | The right rail and its sections |
| `dialog` | Modals, flyouts, confirmation surfaces |
| `preview` | The preview conversation pane |
| `evaluate` | Test sets and evaluation runs |
| `monitor` | Analytics, formerly Monitor |

### States

The state segment is drawn from a closed set, which is what makes parsing unambiguous. A trailing
segment that is not a known state is treated as part of the component, so
`coral.panel.build.knowledge-add.disabled` parses with a state and
`coral.panel.build.knowledge.add.button` does not.

### Examples

```text
coral.toolbar.build.save-button
coral.panel.build.knowledge-add.disabled
coral.dialog.knowledge.public-website.url-input
coral.evaluate.testset.import-button
```

## API layer

```text
{namespace}:{surface}:{group}:{operation}
```

Colon-separated, four segments, all required.

### Namespaces

| Namespace | Meaning |
| --- | --- |
| `cs` | Copilot Studio platform |
| `as` | Local kit |
| `ac` | Cards |
| `lt` | Tiles |
| `evidence` | Audit-side evidence records |
| `dl` | Audit-side data-lineage records |

### Surfaces

| Surface | Backing service |
| --- | --- |
| `cs:dv` | Dataverse |
| `cs:bm` | Bot Management and the Island Gateway |
| `cs:env` | Environment |
| `cs:bap` | Business Application Platform |
| `cs:runtime` | Conversation runtime |
| `cs:graph` | Microsoft Graph |

### Examples

```text
cs:dv:bots:create
cs:bm:channels:msteams-status
cs:runtime:conversation:send
cs:env:tenant:get
```

This format was adopted from the authoritative Copilot Studio corpus rather than invented for this
audit, so identifiers here line up with the published model instead of forming a parallel vocabulary.

## Parsing

Both layers round-trip through `@raybot/object-model`.

```ts
import { parseCoralId, formatCoralId, parseApiId, formatApiId } from '@raybot/object-model';

formatCoralId(parseCoralId('coral.panel.build.knowledge-add.disabled'));
// 'coral.panel.build.knowledge-add.disabled'

formatApiId(parseApiId('cs:dv:bots:create'));
// 'cs:dv:bots:create'
```

Both throw `SemanticIdError` on malformed input. Use `tryParseCoralId` and `tryParseApiId` for
non-throwing variants.

## Test ids are not identifiers

A `data-testid` is not a semantic identifier and must not be used as one. 76 of the 177 unique test
ids in this audit appear on more than one surface. A test id alone is not a sufficient selector
across the application — it must be qualified by surface.

This is why the semantic id includes the surface segment in both layers. It is also why the runbook
records the surface alongside every `data-testid` it cites.

`normalizeTestId()` in the object model lowercases and trims, because the audit data itself is
inconsistent in casing: `label-gaps.json` keys are lowercase while `testids.json` preserves the
source casing.
