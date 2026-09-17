---
id: index
title: Object model
sidebar_label: Overview
---

# Object model

A typed model of Raybot, the Coral runtime, and the runbook that produced both. It ships as
`@raybot/object-model`, a dependency-free TypeScript package.

The model is **evidence-first**. Every aggregate carries a confidence level, and the constants in it
trace to a specific capture, network request, or audit row rather than to documentation.

## Modules

| Module | Contents |
| --- | --- |
| `common` | `ConfidenceLevel`, the `Evidenced` base interface, `weakestConfidence()` |
| `agent` | Identity, icon, knowledge, tools, skills, connected agents, Microsoft IQ, memory, settings, publishing |
| `coral` | UI and API identifier layers, surfaces, elements, endpoints, `AuditTotals` |
| `semantic-id` | `parseCoralId`, `formatCoralId`, `parseApiId`, `formatApiId`, `normalizeTestId` |
| `workflow` | `WORKFLOW_TRIGGERS`, `WORKFLOW_NODES`, `WORKFLOW_NODE_BY_KIND` |
| `runbook` | `RunbookPhase`, `RunbookStep`, `RAYBOT_PHASES` |
| `evaluation` | `EvalTestSet`, `EvalRun`, `validateEvalTestSet` |
| `session` | `SessionRecord`, `SessionCommand`, `SCREENSHOT_MOVE_COMMANDS` |
| `raybot` | `RAYBOT`, the canonical instance |

## The confidence primitive

Everything descends from one idea: an assertion is worth exactly as much as the evidence behind it.

```ts
export type ConfidenceLevel = 'CONFIRMED' | 'SOURCE-INSPECTED' | 'UNCONFIRMED';

export interface Evidenced {
  confidence: ConfidenceLevel;
  evidence?: string;
}
```

`weakestConfidence()` aggregates: a composite is only as strong as its weakest member. A `CONFIRMED`
agent containing an `UNCONFIRMED` tool is `UNCONFIRMED` as a whole.

## The canonical instance

`RAYBOT` is the agent exactly as it existed at the close of the audit, and doubles as the reference
fixture.

```ts
import { RAYBOT } from '@raybot/object-model';

RAYBOT.identity.agentId;          // '4de4ada9-ad61-4c22-a0d0-a0bd1c189f4e'
RAYBOT.identity.schemaName;       // 'Default_Raybot_vyN1Rz'
RAYBOT.configuration.model;       // 'Claude Sonnet 4.6'
RAYBOT.configuration.memory;      // { enabled: true }
RAYBOT.settings.generativeAi;     // { moderationLevel: 'Medium', userFeedbackEnabled: false }
```

The channel list encodes the Phase 6 failure structurally rather than in prose:

```ts
RAYBOT.channels.find(c => c.kind === 'teams');
// {
//   kind: 'teams',
//   uiReportsEnabled: true,      // the maker UI said "Channel enabled"
//   verifiedReachable: false,    // it never reached the tenant catalog
//   blockedReason: 'Tenant App Customization Policy consent was never granted...'
// }
```

The separation of `uiReportsEnabled` from `verifiedReachable` is the whole lesson of Phase 6,
expressed as two fields.

## Documented constants

Constraints discovered by hitting them are encoded rather than described.

```ts
ICON_MAX_BYTES;                 // 102400
ICON_SIZE_OBSERVATIONS;         // 512px = 200499 rejected, 256px = 55091 accepted
SEARCH_API_VERSION;             // '2025-11-01-preview'
MICROSOFT_IQ_MIN_SKU;           // 'basic'
EVAL_MAX_CONVERSATION_PAIRS;    // 6
EVAL_REFERENCE_MAX_LENGTH;      // 1000
WORKFLOW_DESIGNER_MODULE;       // 's01-workflow-designer/22.19.1'
```

## Design rules

1. **No runtime dependencies.** The package is types plus small pure functions.
2. **Constants over prose.** A limit that was discovered by hitting it is encoded as a number, with
   the observation that produced it alongside.
3. **Failures are modelled.** `blockedReason`, `runtimeLimitation`, and `SessionCommand.succeeded`
   exist so that a failed outcome is representable rather than absent.
4. **Confidence travels with data.** Any interface extending `Evidenced` carries its own grade.

## Status

The package source is complete and typechecks cleanly. Per-module reference pages, the JSON Schema
emission, and the SDK recipe pages are tracked as open issues on the repository.
