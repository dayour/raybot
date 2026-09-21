---
id: showcase
title: Showcase workflows
sidebar_label: Showcase workflows
description: Types modelling the eleven-workflow Coral catalog, the Incident Triage build, the designer pitfalls, and the automation candidate harvest.
---

# Showcase workflows

`showcase.ts` models the workflow work carried out between 2026-06-17 and
2026-06-19. It is the newest module in the package and the only one whose
subject is a *different tenant* from the rest of the model.

```ts
import {
  SHOWCASE_WORKFLOWS,
  INCIDENT_TRIAGE_BUILD_STEPS,
  DESIGNER_PITFALLS,
  AUTOMATION_CANDIDATES,
} from '@raybot/object-model';
```

## Two artefacts, modelled separately

The module carries two workflow bodies that are **not versions of each other**,
and keeping them in one type would have been wrong:

| | Incident Triage | Showcase catalog |
|---|---|---|
| Count | 1 workflow | 11 workflows |
| Shape | three-way branch off Classify | linear three-step pipeline |
| Captured | every action, 17 stills | three stills per workflow |
| Purpose | shows how the designer behaves | shows what a production shape looks like |
| Type | `IncidentTriageBuildStep` | `ShowcaseWorkflow` |

`IncidentTriageBuildStep` models a **capture in a sequence** - it has an ordinal,
a filename, and a description of what the frame shows. It carries no structural
information about the workflow at all, because the workflow's structure is
documented once in prose and does not vary per step.

`ShowcaseWorkflow` models a **workflow**, not a capture. It carries the input
name, the connector binding, the decision signal, and the flow id prefix, because
those vary across all eleven and comparing them is the entire point of the
catalog.

Forcing both into a shared `Workflow` interface would have produced a type where
most fields are null for most instances - the classic signal that two concepts
have been merged because they share a word.

## `ShowcaseWorkflow`

```ts
interface ShowcaseWorkflow extends Evidenced {
  ordinal: string;           // '01' .. '11', zero-padded to match capture folders
  name: string;
  input: string;             // the single typed Text input on the Start trigger
  connector: ShowcaseConnector;
  decisionSignal: string;    // uppercase token the agent emits on its final line
  flowIdPrefix: string;      // first 8 chars; full GUIDs were never exported
  captureFolder: string;
}
```

`ordinal` is a zero-padded **string**, not a number. It is used to build folder
paths (`captures-2026-06-18/wf01-real`), and a numeric `1` would need re-padding
at every use site. Storing the padded form once removes that.

`flowIdPrefix` is eight characters rather than a `Guid` because only eight
characters were recorded. Typing it as `Guid` would claim a full identifier the
model does not have - the field name says what it is.

## `ShowcaseConnector` and the meaning of `none`

```ts
type ShowcaseConnectorFamily = 'github' | 'office365users' | 'none';

interface ShowcaseConnector {
  family: ShowcaseConnectorFamily;
  action: string | null;          // exact picker label, null when agent-first
  boundParameter: string | null;  // connector parameter the input binds to
}
```

`'none'` is a member of the union rather than the connector being optional.

Three workflows - 07, 10, and 11 - are agent-first by design. Their input is
free-text prose rather than a query, so there is nothing to search against.
Modelling this as `connector?: ShowcaseConnector` would make "deliberately has no
connector" indistinguishable from "connector not yet recorded." An explicit
`'none'` with `action: null` states that the absence was a decision.

Every such entry additionally carries a `note` explaining the reason, so the
decision survives without reading this page.

## `DesignerPitfall`

```ts
interface DesignerPitfall extends Evidenced {
  id: string;
  symptom: string;
  mitigation: string;
  observedIn: 'incident-triage' | 'showcase-rebuild';
}
```

Eight entries. These are modelled as data rather than left in prose because
several are **preconditions for automating the designer**, and an automation
author needs them enumerable rather than discoverable.

The sharpest example: after saving an Agent step, the config panel stays open and
intercepts the click that opens the next step picker. The automation then times
out against a locator that genuinely is not present. Nothing in the failure
points at the open panel. An author who has not read
`agent-panel-blocks-next-picker` will spend an hour on it.

`observedIn` records which build surfaced each one. Two pitfalls were seen in
both builds two days apart, which is the evidence that they are designer
behaviour rather than a one-off state.

## `AutomationCandidate`

```ts
interface AutomationCandidate {
  rank: number;
  name: string;
  rationale: string;
  overlap: string | null;   // existing work it duplicates, or null when net-new
}
```

Ten entries - the report's top ten. Candidates 11 through 25 are recorded in
[the automation candidates page](../automation/automation-candidates.md) but not
in the model, because they were returned as bare names without rationale and
would populate a `rationale` field with restatements of the name.

`overlap` is the field that carries the analysis. Four of the top ten duplicate
work already in flight. A ranked list without this distinction promotes solved
problems, because the tasks that recur most in a session corpus are exactly the
tasks someone has already started automating.

This type does **not** extend `Evidenced`. Every other record in the model
describes something observed in a running product; a candidate describes work
that does not exist. There is no evidence to attach, and giving it a `confidence`
field would invite the reading that `CONFIRMED` means the candidate is sound
rather than that it was genuinely reported.

## Constants

| Constant | Value |
|---|---|
| `SHOWCASE_ENVIRONMENT_ID` | `cf7ff9ef-f698-e22d-b864-28f0b7851614` |
| `SHOWCASE_DESIGNER_VERSION` | `v23.4.2` |
| `REAUDIT_DESIGNER_VERSION` | `s01-workflow-designer/22.19.1` |
| `SHOWCASE_REVIEWER` | `darbot@timelarp.com` |
| `INCIDENT_TRIAGE_WORKFLOW_ID` | `29162552-181c-6272-eadf-4638b99c471e` |
| `SHOWCASE_WORKFLOW_COUNT` | `11` |
| `HARVEST_TOTALS` | session-harvest counts |

`SHOWCASE_ENVIRONMENT_ID` is **not** the environment Raybot lives in. Raybot was
built in `Default-6b104499-c49f-45dc-b3a2-df95efd6eeb4`; the showcase catalog was
built in the darbotlabs Cypherdyne environment. Correlating a showcase flow id
with the Raybot agent id is a cross-tenant operation that will not resolve in one
session, and the TSDoc on the constant says so at the point of use.

Both designer versions are exported side by side because they differ -
`22.19.1` during the Phase 7 re-audit, `v23.4.2` two days later during the
rebuild. Any behavioural difference between those phases has a version delta
available to explain it.

## Schemas

Five new JSON Schemas are emitted from this module: `ShowcaseConnector`,
`ShowcaseWorkflow`, `IncidentTriageBuildStep`, `DesignerPitfall`, and
`AutomationCandidate`. They join the allowlist in `emit-schemas.mjs`, bringing
the emitted total to 46.

See [JSON Schemas](./json-schemas.md) for how the allowlist works and why bare
union aliases are excluded from it.

## Related

- [Phase 8 - Showcase catalog](../runbook/phase-8-showcase-catalog.mdx)
- [Incident Triage build](../runbook/incident-triage-workflow.mdx)
- [Workflow](./workflow.md) - the node and trigger inventory from Phase 7
- [Automation candidates](../automation/automation-candidates.md)
