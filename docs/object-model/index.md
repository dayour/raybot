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

## Pages in this section

| Page | Covers |
| --- | --- |
| [Agent](./agent.md) | `RaybotAgent`, `AgentConfiguration`, the `RAYBOT` canonical instance |
| [Identity](./identity.md) | `AgentIdentity`, first-save id minting, `schemaName` generation |
| [Knowledge](./knowledge.md) | `KnowledgeSource` and the six source kinds |
| [Tools](./tools.md) | `AgentTool`, the four catalogs, `MicrosoftIQBinding` |
| [Skills](./skills.md) | `AgentSkill`, the 64 and 1024 character field caps |
| [Connected agents](./connected-agents.md) | `ConnectedAgent` and the published-only constraint |
| [Memory](./memory.md) | `AgentMemory` |
| [Settings](./settings.md) | The four settings tabs, `ModerationLevel`, `AuthenticationMode` |
| [Publishing](./publishing.md) | `PublishChannel`, `PublishOperation`, the two-field enablement model |
| [Evaluation](./evaluation.md) | `EvalTestSet`, `EvalRun`, `validateEvalTestSet` |
| [Workflow](./workflow.md) | The 4 triggers and 13 node kinds |
| [Coral surfaces](./coral-surface.md) | `CoralSurface`, `CoralElement`, `CoralTestId`, `ApiEndpoint`, `AuditTotals` |
| [Runbook](./runbook.md) | `RunbookPhase`, `RunbookStep`, `RAYBOT_PHASES`, `OutcomeStatus` |
| [Session](./session.md) | `SessionRecord`, `SessionCommand`, `SCREENSHOT_MOVE_COMMANDS` |
| [JSON Schemas](./json-schemas.md) | The 41 emitted schemas and the CI data validation gate |

## Modules

| Module | Contents |
| --- | --- |
| `common` | `ConfidenceLevel`, `Evidenced`, `OutcomeStatus`, `weakestConfidence()` |
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
  /** Capture filenames, dump filenames, or request ids that back the claim. */
  evidence?: string[];
  /** Free-text qualifier, used when a claim is true only under conditions. */
  note?: string | null;
}
```

`weakestConfidence()` aggregates: a composite is only as strong as its weakest member. A `CONFIRMED`
agent containing an `UNCONFIRMED` tool is `UNCONFIRMED` as a whole.

```ts
export const CONFIDENCE_RANK: Record<ConfidenceLevel, number> = {
  CONFIRMED: 0,
  'SOURCE-INSPECTED': 1,
  UNCONFIRMED: 2,
};
```

Lower rank is stronger evidence, so aggregation is a max over the rank. See
[Confidence model](../coral-schema/confidence.md).

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
expressed as two fields. See [Publishing](./publishing.md).

## Documented constants

Constraints discovered by hitting them are encoded rather than described.

| Constant | Value | Discovered by |
| --- | --- | --- |
| `ICON_MAX_BYTES` | `102400` | A 512px PNG at 195.8 KB being rejected |
| `ICON_SIZE_OBSERVATIONS` | 512px rejected, 256px accepted | Two upload attempts |
| `SKILL_NAME_MAX_LENGTH` | `64` | Reading `maxLength` off `skill-name-input` |
| `SKILL_DESCRIPTION_MAX_LENGTH` | `1024` | Reading `maxLength` off `skill-description-input` |
| `MICROSOFT_IQ_MIN_SKU` | `'basic'` | A Free-tier knowledge base never appearing in the picker |
| `SEARCH_API_VERSION` | `'2025-11-01-preview'` | Every other api-version 404ing on `/knowledgeBases` |
| `EVAL_MAX_CONVERSATION_PAIRS` | `6` | The importer capping a conversation set at six pairs |
| `EVAL_REFERENCE_MAX_LENGTH` | `1000` | The Reference response field cap |
| `WORKFLOW_DESIGNER_MODULE` | `'s01-workflow-designer/22.19.1'` | Reading the loaded module version |

Each is documented on the page for its module, alongside the observation that produced it.

## Design rules

1. **No runtime dependencies.** The package is types plus small pure functions.
2. **Constants over prose.** A limit discovered by hitting it is encoded as a number, with the
   observation that produced it alongside.
3. **Failures are modelled.** `blockedReason`, `runtimeLimitation`, and `SessionCommand.succeeded`
   exist so that a failed outcome is representable rather than absent.
4. **Confidence travels with data.** Any interface extending `Evidenced` carries its own grade.
5. **Loose where the producer is external.** Fields fed by a separate extractor stay `string` even
   where a union documents the expected set, so new ground-truth data loads rather than failing
   validation.

## Verification

The package typechecks under `strict`, emits 41 JSON Schemas, and validates seven exported datasets -
1,891 records - against them on every push. See [JSON Schemas](./json-schemas.md).

```bash
npm run typecheck
npm run schemas
npm run validate-data
```
