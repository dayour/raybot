---
id: json-schemas
title: JSON Schemas
sidebar_label: JSON Schemas
---

# JSON Schemas

`@raybot/object-model` emits **41 JSON Schema documents**, draft 2020-12, one per top-level exported
interface. They exist so that consumers outside TypeScript have a machine-readable contract, and so
that the audit datasets can be validated against the model in CI.

## Where they are

| Location | Purpose |
| --- | --- |
| `packages/raybot-object-model/schemas/*.schema.json` | Source of truth. Committed, and checked for drift in CI. |
| `static/schemas/*.schema.json` | Mirror served by the site, so each schema is addressable by URL. |
| `https://dayour.github.io/raybot/schemas/<Type>.schema.json` | The published `$id` of every schema. |

`schemas/index.json` lists every emitted schema with its type name, filename, and `$id`.

## Shape of an emitted schema

Each file is a `$ref` into a `definitions` block. The referenced type sits at the top; everything it
transitively depends on is inlined as a sibling definition. That makes each file self-contained —
no cross-file `$ref` resolution is required to validate against it.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://dayour.github.io/raybot/schemas/ApiEndpoint.schema.json",
  "$ref": "#/definitions/ApiEndpoint",
  "definitions": {
    "ApiEndpoint": { "type": "object", "properties": { "...": {} } },
    "ConfidenceLevel": {
      "type": "string",
      "enum": ["CONFIRMED", "SOURCE-INSPECTED", "UNCONFIRMED"]
    }
  }
}
```

TSDoc comments survive the transform as `description`. The confidence model's reasoning is therefore
present in every schema that carries an `Evidenced` field, not just in the TypeScript source.

## The confidence enum stays closed

`ConfidenceLevel` must remain a closed string union in the emitted schema. It is the primitive that
makes every other claim in the model auditable, and widening it to `string` would let a consumer
record a fourth confidence grade that nothing in this project defines.

The emit is configured with `expose: 'export'` and `topRef: true`, which keeps the union as a named
definition with an explicit `enum` rather than inlining it as a bare `string`. This is asserted by
the CI drift check: a change that collapses the enum changes the emitted file, and an uncommitted
change fails the build.

## Generating

```bash
npm run schemas
```

Runs `packages/raybot-object-model/scripts/emit-schemas.mjs`, which:

1. Builds a `ts-json-schema-generator` generator over `src/index.ts` using the package `tsconfig`.
2. Emits one schema per name in the explicit `TYPES` allowlist.
3. Writes `schemas/index.json`.
4. Clears and repopulates `static/schemas/`.

`skipTypeCheck` is off, so a type error in the model fails the emit rather than producing a schema
from a broken program.

### Why an allowlist rather than everything exported

The module also exports bare union aliases — `ConfidenceLevel`, `OutcomeStatus`,
`WorkflowNodeKind`, `LabelSource`, and others. They have no object shape of their own, and each is
already inlined as a named definition inside every schema that references it. Emitting them as
standalone files would add 20 documents that no consumer would validate against.

The allowlist is also a deliberate review surface: adding a type to the published contract is an
explicit edit, not a side effect of exporting something new.

## Validating data against them

```bash
npm run validate-data
```

Runs `scripts/validate-data.mjs`, which compiles each schema with Ajv 2020 and validates the
exported datasets in `data/`.

| Dataset | Schema | Records |
| --- | --- | --- |
| `surfaces.json` | `CoralSurface` | 16 |
| `elements.json` | `CoralElement` | 1,627 |
| `testids.json` | `CoralTestId` | 177 |
| `api-hosts.json` | `ApiHost` | 7 |
| `api-endpoints.json` | `ApiEndpoint` | 57 |
| `audit-totals.json` | `AuditTotals` | 1 |
| `evalset.json` | `EvalTestCase` | 6 |

1,891 records across seven datasets. Failures print the first three offending rows with their
instance paths, then a per-dataset summary.

Four datasets are not yet bound: `gallery.json`, `label-gaps.json`, `shared-testids.json`, and
`tab-audit-log.json`. Their shapes are export-local projections rather than model types, and binding
them would mean inventing types to describe an intermediate artifact. That is tracked as a gap
rather than papered over.

## What this gate caught

The validation pass was not ceremonial. On its first run it failed two of seven datasets and found
two genuine drifts between the model and the ground truth:

**`ApiEndpoint.domainTitle` was typed `string`, and is `null` in all 57 rows.** The domain titles
live in the domain lookup, not on the endpoint row. The type was wrong; it is now `string | null`,
with a comment explaining why.

**`AuditTotals` distributions were typed `Record<string, number>`, and are arrays of labelled
counts.** The exporter emits `[{ source, count }]`, `[{ reason, count }]`, and `[{ role, count }]`
because the labels are data — `aria-label`, `native-control`, `none` — and several are not safe
object keys. Three new interfaces now describe them: `LabelSourceCount`,
`InteractiveReasonCount`, and `RoleCount`.

A third, smaller mismatch surfaced at the same time: `Evidenced.note` was `string | undefined`, but
PowerShell's `ConvertTo-Json` emits absent optional members as `null`, not as absent keys. It is now
`string | null | undefined`.

None of these were visible to `tsc`, because nothing in the repository was importing the datasets as
typed values. That is precisely the drift this gate exists to catch.

## CI

Four steps run on every push to `main`, before the site build:

```yaml
- name: Typecheck object model
  run: npx tsc --noEmit -p packages/raybot-object-model/tsconfig.json

- name: Emit JSON Schemas
  run: npm run schemas

- name: Check emitted schemas are committed
  run: git diff --exit-code -- packages/raybot-object-model/schemas static/schemas

- name: Validate audit datasets against schemas
  run: npm run validate-data
```

The drift check is the important one. It makes the committed schemas a reviewable artifact: changing
a type without regenerating fails the build, so a schema diff always appears in the same pull request
as the type change that caused it.

## Consuming from another language

The schemas are plain draft 2020-12 with no custom keywords and no external `$ref`s, so any
conformant validator works. Fetch by `$id`:

```python
import json, urllib.request
import jsonschema

url = "https://dayour.github.io/raybot/schemas/ApiEndpoint.schema.json"
schema = json.load(urllib.request.urlopen(url))
jsonschema.validate(instance=endpoint, schema=schema)
```

`additionalProperties` is left open. The datasets carry export-local extras —
`surfaces.json` adds `dumpFileExists`, `evalset.json` adds `questionLength` and `responseLength` —
and rejecting those would fail valid data. If you need a closed contract, tighten it in your own
consumer rather than in the published schema.

## Related

- [Confidence model](../coral-schema/confidence.md) — what the `ConfidenceLevel` enum means.
- [SDK](../sdk/index.md) — the TypeScript-side API.
- [Ground truth](../api/ground-truth.md) — how the datasets these validate were produced.
