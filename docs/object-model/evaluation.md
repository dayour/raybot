---
id: evaluation
title: Evaluation types
sidebar_label: Evaluation
---

# Evaluation types

The `evaluation` module models the Copilot Studio Evaluate tab: a CSV-imported test set, a run over
it, and the per-case outcomes.

For the Raybot test set itself and the analysis of its run, see
[Evaluation](../evaluation/index.mdx). This page covers the types.

## Test set

```ts
export type EvalDataType = 'Conversation' | 'SingleTurn';

export interface EvalTestCase {
  conversationNumber: number;
  question: string;
  response: string;
}

export interface EvalTestSet extends Evidenced {
  name: string;
  dataType: EvalDataType;
  cases: EvalTestCase[];
}
```

`EvalTestCase` field names match the CSV header exactly, because they are the CSV header:

```ts
export const EVAL_CSV_COLUMNS = ['conversationNumber', 'question', 'response'] as const;
```

The importer is positional and the column order is not negotiable. Exporting the order as a constant
means a writer can emit a conforming file without hard-coding the header:

```ts
const header = EVAL_CSV_COLUMNS.join(',');
```

`response` is the *expected* or reference response, not the one the agent produced. The produced
response lives on `EvalCaseResult.actualResponse`. The naming is inherited from the CSV and is worth
being careful about - it is the single easiest field in the model to misread.

## The two importer constraints

```ts
export const EVAL_MAX_CONVERSATION_PAIRS = 6;
export const EVAL_REFERENCE_MAX_LENGTH = 1000;
```

| Constant | Rule |
| --- | --- |
| `EVAL_MAX_CONVERSATION_PAIRS` | A `Conversation` test set accepts at most six pairs. |
| `EVAL_REFERENCE_MAX_LENGTH` | The Reference response field caps at 1000 characters. |

The pair cap applies to `Conversation` sets only, which is why `validateEvalTestSet` guards it behind
a `dataType` check rather than applying it universally. `SingleTurn` behaviour past six cases was
never exercised, so no cap is asserted for it.

Raybot's set is exactly six pairs - at the ceiling, not by coincidence.

## validateEvalTestSet

```ts
export function validateEvalTestSet(set: EvalTestSet): string[];
```

Returns a list of human-readable problems. An empty array means the set will import cleanly.

It is the only non-trivial function in the package, and it exists because the importer has four
interacting rules rather than one:

| Check | Condition |
| --- | --- |
| Non-empty | `cases.length > 0` |
| Pair cap | `Conversation` sets hold at most `EVAL_MAX_CONVERSATION_PAIRS` |
| Ordinal validity | `conversationNumber` is a positive integer |
| Ordinal uniqueness | No duplicate `conversationNumber` |
| Field emptiness | `question` and `response` are non-blank after trimming |
| Reference length | `response.length <= EVAL_REFERENCE_MAX_LENGTH` |

```ts
import { validateEvalTestSet } from '@raybot/object-model';

const problems = validateEvalTestSet(set);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
```

It returns strings rather than throwing, and rather than returning a boolean. Throwing would stop at
the first problem, forcing a fix-and-rerun loop over a six-row file. A boolean would say a set is
invalid without saying why. A string list reports everything wrong in one pass.

Note the emptiness checks trim first: a cell containing only whitespace is treated as empty, because
that is how the importer treats it.

## Run

```ts
export interface EvalCaseResult {
  conversationNumber: number;
  passed: boolean;
  actualResponse?: string;
  failureReason?: string;
}

export interface EvalRun extends Evidenced {
  testSetName: string;
  runAt?: IsoInstant;
  testedBy?: string;
  generalQualityPercent: number;
  passed: number;
  failed: number;
  results?: EvalCaseResult[];
  runtimeLimitation?: string;
}
```

`passed` and `failed` are stored as counts alongside the optional `results` array, which is
redundant when `results` is present. The redundancy is deliberate: the Evaluate tab reports the
summary counts prominently and the per-case detail behind a drill-down, so a run reconstructed from
the summary alone is a legitimate, incomplete-but-honest record.

## runtimeLimitation

```ts
runtimeLimitation?: string;
```

This field is the reason the model is worth having. Raybot's recorded run:

```ts
export const RAYBOT_EVAL_RUN: EvalRun = {
  testSetName: 'Ray Knowledge Eval - 6Q',
  runAt: '2026-06-07T12:47:00Z',
  testedBy: 'Darbot',
  generalQualityPercent: 0,
  passed: 0,
  failed: 6,
  runtimeLimitation:
    'Evaluate runtime limitation. Draft returns the system fallback; Published returns HTTP 500. ' +
    'Preview grounds the identical questions correctly with four docs.ray.io citations, so the agent itself is sound.',
  confidence: 'CONFIRMED',
};
```

Zero percent, six failures. Without `runtimeLimitation`, that record says the agent is useless. With
it, the record says what actually happened: the draft target returned the system fallback string and
the published target returned HTTP 500, while the same six questions grounded correctly in Preview
with live citations.

The score is `CONFIRMED` - it really was zero. The *interpretation* of the score is what the field
carries. This is the same structural move as
[`PublishChannel`'s two booleans](./publishing.md#the-two-field-enablement-model): when the platform
reports something that is true but misleading, the model records both the report and the
qualification.

Full analysis at [Evaluation results](../evaluation/results.md).

## Related

- [Evaluation test set](../evaluation/evalset.md) - the six Ray pairs
- [Evaluation results](../evaluation/results.md)
- [Phase 5](../runbook/phase-5-publish-evaluate.mdx)
