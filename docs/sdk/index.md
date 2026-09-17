---
id: index
title: SDK
sidebar_label: Overview
---

# SDK

`@raybot/object-model` is a dependency-free TypeScript package providing the types, constants, and
parsers described in the [object model](../object-model/index.md).

## Installation

The package lives in this repository as an npm workspace.

```bash
git clone https://github.com/dayour/raybot.git
cd raybot
npm install
```

```ts
import { RAYBOT, parseCoralId, validateEvalTestSet } from '@raybot/object-model';
```

## Semantic identifier parsing

Both identifier layers round-trip.

```ts
import { parseCoralId, formatCoralId } from '@raybot/object-model';

const id = parseCoralId('coral.panel.build.knowledge-add.disabled');
// {
//   area: 'panel',
//   surface: 'build',
//   component: 'knowledge-add',
//   state: 'disabled'
// }

formatCoralId(id); // 'coral.panel.build.knowledge-add.disabled'
```

```ts
import { parseApiId } from '@raybot/object-model';

parseApiId('cs:dv:bots:create');
// { namespace: 'cs', surface: 'dv', group: 'bots', operation: 'create' }
```

Both throw `SemanticIdError` on malformed input. Non-throwing variants are available as
`tryParseCoralId` and `tryParseApiId`.

The valid areas are `shell`, `toolbar`, `build`, `panel`, `dialog`, `preview`, `evaluate`, and
`monitor`. The state segment is optional and drawn from a closed set, which is why
`coral.panel.build.knowledge-add.disabled` parses as a state and
`coral.panel.build.knowledge.add.button` does not.

## Validation

```ts
import { validateEvalTestSet } from '@raybot/object-model';

const problems = validateEvalTestSet({
  name: 'Ray Knowledge Eval - 6Q',
  dataType: 'Conversation',
  cases: [/* ... */],
  confidence: 'CONFIRMED',
});

if (problems.length) {
  console.error(problems.join('\n'));
}
```

It enforces the constraints the importer actually applies: at most six pairs on a conversation set,
a 1000-character ceiling on the reference response, positive and unique conversation numbers, and no
empty questions or responses.

```ts
import { isIconAcceptable, ICON_MAX_BYTES } from '@raybot/object-model';

isIconAcceptable({ contentType: 'image/png', sizeBytes: 200_499 }); // false, the 512px render
isIconAcceptable({ contentType: 'image/png', sizeBytes: 55_091 });  // true,  the 256px render
```

## Workflow node lookup

The thirteen node types captured in [Phase 7](../runbook/phase-7-reaudit.mdx) are enumerated.

```ts
import { WORKFLOW_NODES, WORKFLOW_NODE_BY_KIND } from '@raybot/object-model';

WORKFLOW_NODES.length;                    // 13
WORKFLOW_NODE_BY_KIND.loop.isContainer;   // true
WORKFLOW_NODE_BY_KIND.note.isWired;       // false
```

## Reading the audit datasets

The exported `data/*.json` files in this repository are the audit, reshaped for consumption. They are
plain JSON with no package dependency.

| File | Rows |
| --- | --- |
| `elements.json` | 1,627 |
| `testids.json` | 177 |
| `surfaces.json` | 16 |
| `label-gaps.json` | 228 |
| `api-endpoints.json` | 57 |
| `api-hosts.json` | 7 |
| `gallery.json` | 67 |
| `evalset.json` | 6 |
| `audit-totals.json` | 1 |
| `tab-audit-log.json` | 4 |

Regenerate them from the source repository with:

```powershell
npm run export-data -- -Source C:\0DEV0\raybot
```

## Status

The package source is complete and typechecks cleanly. Published builds, emitted JSON Schemas, and
the full API reference are tracked as open issues on the repository.
