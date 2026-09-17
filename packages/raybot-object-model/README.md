# @raybot/object-model

A typed, evidence-first model of **Raybot** — a Ray / Ray-clusters expert agent built entirely
through the UI of Microsoft Copilot Studio's next-generation runtime (codename **Coral**) — plus the
Coral surface it was built in and the runbook that produced it.

Every exported constant traces to a captured screenshot, a recorded network request, or a DOM audit
row. Nothing in this package is inferred from product documentation.

## Installation

The package lives in the `raybot-wiki` npm workspace and is consumed by the documentation site.

```bash
npm install
npm run build --workspace @raybot/object-model
```

The build emits `dist/` with declarations and source maps. It is not published to npm; there are no
external consumers today. See [the build decision](#build-and-consumption) below.

```ts
import { RAYBOT, ICON_MAX_BYTES, WORKFLOW_NODES } from '@raybot/object-model';
```

JSON Schemas ship alongside the types and are importable by path:

```ts
import agentSchema from '@raybot/object-model/schemas/RaybotAgent.schema.json' with { type: 'json' };
```

## The confidence primitive

The model's central design decision is that **a fact and the evidence for that fact are the same
object**. Most of the interesting types extend `Evidenced`, which forces every claim to declare how
strongly it is supported and where it came from.

```ts
type ConfidenceLevel = 'CONFIRMED' | 'SOURCE-INSPECTED' | 'UNCONFIRMED';

interface Evidenced {
  confidence: ConfidenceLevel;
  evidence?: string[];
  note?: string | null;
}
```

| Level | Meaning |
| --- | --- |
| `CONFIRMED` | Observed directly in a screenshot, DOM dump, or recorded network request. |
| `SOURCE-INSPECTED` | Read out of shipped client source but never exercised at runtime. |
| `UNCONFIRMED` | Inferred. Present so that the inference is visible rather than silently mixed in. |

`CONFIDENCE_RANK` gives the levels a total order so that a set of facts can be reduced to its weakest
member — the correct way to summarise mixed evidence.

The whole audit that backs this package is `CONFIRMED` throughout. The rank exists because future
additions will not be, and the model should make that obvious rather than hide it.

## The canonical instance

`RAYBOT` is the single fully-populated `RaybotAgent`. It is a value, not a fixture: the documentation
site reads real numbers out of it, so a change to the agent's recorded configuration propagates into
the prose automatically.

```ts
import { RAYBOT } from '@raybot/object-model';

RAYBOT.identity.agentId;    // '4de4ada9-ad61-4c22-a0d0-a0bd1c189f4e'
RAYBOT.identity.schemaName; // 'Default_Raybot_vyN1Rz'
RAYBOT.memory.enabled;      // true
```

Companion instances cover the parts of the build that are not agent configuration:

| Export | What it holds |
| --- | --- |
| `RAYBOT_EVAL_SET` | The six-pair Ray Q&A test set as authored. |
| `RAYBOT_EVAL_RUN` | The 0 percent / 6 Fail result, with the runtime-limitation finding attached. |
| `RAYBOT_PHASES` | The seven runbook phases, including the two that failed. |
| `RAYBOT_SESSIONS` | The Copilot CLI sessions recovered from the local and cloud session stores. |
| `RAYBOT_COMMITS` | The commits that produced the source repository. |
| `SCREENSHOT_MOVE_COMMANDS` | The nine exact terminal commands from the screenshot reorganisation session. |

## Semantic ids

Coral names things twice — once for the DOM and once for the API — and the two schemes do not match.
`semantic-id.ts` parses and formats both.

```
UI    coral.<area>.<surface>.<component>[.<state>]
API   {namespace}:{surface}:{group}:{operation}
```

```ts
import { parseUiSemanticId, formatApiSemanticId } from '@raybot/object-model';

parseUiSemanticId('coral.agent.side-panel.tools.add-button');
// { area: 'agent', surface: 'side-panel', component: 'tools.add-button', state: undefined }
```

Parsers return a discriminated result rather than throwing, because they run over audit data where a
malformed id is itself a finding worth recording.

## Observed constraints

Constants in this package are limits that were hit during the build, not limits read from
documentation. Each one cites the observation that produced it.

| Constant | Value | Observation |
| --- | --- | --- |
| `ICON_MAX_BYTES` | `102400` | 512 px PNG at 195.8 KB rejected; 256 px at 53.8 KB accepted. |
| `SKILL_NAME_MAX_LENGTH` | `64` | `skill-name-input` DOM `maxLength`. |
| `SKILL_DESCRIPTION_MAX_LENGTH` | `1024` | `skill-description-input` DOM `maxLength`. |
| `MICROSOFT_IQ_MIN_SKU` | `'basic'` | Free-tier knowledge bases never appear in the picker. |
| `SEARCH_API_VERSION` | `'2025-11-01-preview'` | The only version exposing `/knowledgeBases`. |
| `EVAL_MAX_CONVERSATION_PAIRS` | `6` | Import ceiling observed on the evaluation test set. |
| `WORKFLOW_DESIGNER_MODULE` | `'s01-workflow-designer/22.19.1'` | Module id read from the workflows designer bundle. |

## Validation

Two scripts keep the types and the data honest.

```bash
npm run schemas        # regenerate JSON Schemas from the TypeScript sources
npm run validate-data  # validate every exported audit dataset against those schemas
```

`schemas` runs `ts-json-schema-generator` over an explicit 41-name allowlist and writes
self-contained schemas — each file carries its own `definitions` block, so a schema can be handed to
a validator on its own. TSDoc comments survive the round trip as `description`.

`validate-data` checks 1,891 records across seven datasets with Ajv 2020. It is not decorative: it
caught three real drifts between the types and the emitted data.

1. `ApiEndpoint.domainTitle` was typed `string` but was `null` in all 57 rows.
2. `AuditTotals` distributions were typed `Record<string, number>` but exported as arrays of labelled
   counts, which produced `LabelSourceCount`, `InteractiveReasonCount`, and `RoleCount`.
3. `Evidenced.note` had to widen to `string | null`, because PowerShell's `ConvertTo-Json` emits an
   absent optional as an explicit `null`.

Schemas leave `additionalProperties` open, deliberately. The exported datasets carry export-local
extras — `surfaces.json` adds `dumpFileExists`, `evalset.json` adds `questionLength` and
`responseLength` — and closing the schemas would reject correct data.

Four datasets are not schema-bound yet: `gallery.json`, `label-gaps.json`, `shared-testids.json`, and
`tab-audit-log.json`. This is a known gap rather than an oversight.

**Any change to `src/*.ts` requires re-running `npm run schemas` and committing the output.** CI
byte-compares a fresh regenerate against the committed schemas and fails on any difference.

## Build and consumption

The package is **built and imported**, not source-only.

The alternative was to leave it as source and let the documentation site describe it from the
outside. That was rejected: the entire point of the model is that the prose and the types agree, and
nothing enforces agreement except an actual import. With the site importing `@raybot/object-model`, a
renamed or deleted export fails the typecheck, and an unknown lookup key fails static site
generation. Documentation drift becomes a build error instead of a slow rot.

Publishing to npm was also rejected — there are no external consumers, and publishing would add a
release process with nothing on the other end of it.

The build is wired so it cannot be forgotten: the root `prebuild` and `pretypecheck` scripts both
build this package first, so `npm run build` and `npm run typecheck` are each self-sufficient from a
clean checkout.

## Module layout

| File | Contents |
| --- | --- |
| `common.ts` | `Evidenced`, confidence levels and ranking, shared scalar aliases. |
| `agent.ts` | Agent configuration: identity, knowledge, tools, skills, connected agents, memory, settings, publishing. |
| `coral.ts` | The audited Coral surface: surfaces, elements, test ids, API hosts and endpoints, audit totals. |
| `semantic-id.ts` | UI and API semantic id parsing and formatting. |
| `workflow.ts` | Workflow triggers, the thirteen node types, and the designer module id. |
| `runbook.ts` | Phases, steps, and outcomes, including failures. |
| `evaluation.ts` | Test sets, cases, runs, and results. |
| `session.ts` | Copilot CLI session records, tool-call tallies, and recovered commands. |
| `raybot.ts` | The canonical `RAYBOT` instance and its companions. |

## License

MIT.
