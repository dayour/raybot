---
id: workflow
title: Workflow
sidebar_label: Workflow
---

# Workflow

Captured during the [Phase 7 re-audit](../runbook/phase-7-reaudit.mdx) from designer module:

```ts
export const WORKFLOW_DESIGNER_MODULE = 's01-workflow-designer/22.19.1';
```

The module version is recorded as a constant because the catalogs below are a snapshot of one build
of one module. Pinning the version makes the snapshot falsifiable: if a later capture disagrees, the
module version tells you whether that is drift or a contradiction.

## Triggers

```ts
export type WorkflowTriggerKind = 'manual' | 'recurrence' | 'event' | 'agent';

export interface WorkflowTriggerDefinition {
  kind: WorkflowTriggerKind;
  label: string;
  description: string;
}
```

| `kind` | Label | Runs when |
| --- | --- | --- |
| `manual` | Manually | A person starts it from the designer. |
| `recurrence` | On a schedule | A configured recurrence fires. |
| `event` | When an event occurs | An external event arrives. |
| `agent` | When an agent calls it | An agent invokes it as a tool. |

`agent` is the one that connects the two halves of this documentation. A workflow with that trigger
appears in the Workflows tab of the add-tool flyout and becomes callable by the orchestrator - the
workflow *is* a tool. See [Tools](./tools.md#workflows-are-tools).

## Nodes

```ts
export interface WorkflowNodeDefinition {
  kind: WorkflowNodeKind;
  pickerLabel: string;
  description: string;
  isContainer: boolean;
  isTerminal: boolean;
}
```

Thirteen entries in `WORKFLOW_NODES`:

| `kind` | `pickerLabel` | Container | Terminal |
| --- | --- | --- | --- |
| `agent` | Agent | no | no |
| `classify` | Classify | no | no |
| `m365Copilot` | Microsoft 365 Copilot | no | no |
| `humanReview` | Human review | no | no |
| `connector` | Connector | no | no |
| `function` | Function | no | no |
| `variable` | Variable | no | no |
| `ifElse` | If/Else | **yes** | no |
| `loop` | Loop | **yes** | no |
| `note` | Note | no | no |
| `switch` | Switch | **yes** | no |
| `scope` | Scope | **yes** | no |
| `end` | End | no | **yes** |

Four containers, one terminal.

### pickerLabel is the automation contract

`pickerLabel` holds the exact accessible name the picker renders, because that string is what a
role-based locator matches:

```js
await page.getByRole('button', { name: `Select action: ${def.pickerLabel}` }).click();
```

Element refs from an accessibility snapshot go stale the moment the DOM re-renders, which the picker
does on every open. Role plus accessible name survives. Keeping the exact label in the model means
automation can be driven from the catalog rather than from hand-written strings.

`Microsoft 365 Copilot` is the label that punishes guessing - the `kind` is `m365Copilot`, and a
locator built from the kind will not match.

### isContainer and isTerminal

Two booleans rather than one `nodeCategory` union, because they are independent properties and the
combinations are not mutually exclusive in principle. They drive `WorkflowNode`:

```ts
export interface WorkflowNode extends Evidenced {
  id: string;
  kind: WorkflowNodeKind;
  displayName?: string;
  next?: string[];
  children?: WorkflowNode[];
}
```

`children` is populated only for container kinds. `next` is absent on terminal kinds - an `end` node
hands control nowhere. Neither rule is enforced by the type; both are documented invariants, because
enforcing them would require a discriminated union over thirteen kinds to express two facts already
available from `WORKFLOW_NODE_BY_KIND`.

## Connector and Function are pickers, not nodes

This is the most important correction in the catalog, and the one an inventory built from the picker
list alone gets wrong.

**Selecting Connector or Function does not place a node.** Both open a secondary catalog and place
nothing until a specific action or function is chosen. Every other entry in the list places a node
immediately.

Treating all thirteen as node types is therefore wrong about two of them. The model keeps them in
`WorkflowNodeKind` because they are genuine entries in the picker with genuine accessible names - the
catalog describes the picker faithfully - but a consumer generating a node palette should know that
two of the thirteen are doorways.

The Function catalog behind that doorway holds five groups:

| Group | Functions |
| --- | --- |
| Data Operations | 7 |
| Date Time | 6 |
| HTTP | 3 |
| Schedule | 2 |
| Request | 1 |

### Ten in the palette, thirteen in the dialog

The left-hand Add palette shows ten nodes. The Add dialog additionally exposes `switch`, `scope`, and
`end`. The catalog is the union of both, which is why a palette screenshot and this table disagree on
count. See [Workflow node capture](../automation/workflow-node-capture.md).

## Lookup helper

```ts
export const WORKFLOW_NODE_BY_KIND: Record<WorkflowNodeKind, WorkflowNodeDefinition>;
```

Built with `Object.fromEntries` over `WORKFLOW_NODES`. The `Record` key type is the union, so the
lookup is total - `WORKFLOW_NODE_BY_KIND[kind]` needs no undefined check, and adding a kind without
adding its definition is a compile error.

```ts
import { WORKFLOW_NODE_BY_KIND } from '@raybot/object-model';

WORKFLOW_NODE_BY_KIND.m365Copilot.pickerLabel; // 'Microsoft 365 Copilot'
WORKFLOW_NODE_BY_KIND.scope.isContainer;       // true
```

## Workflow

```ts
export interface Workflow extends Evidenced {
  name: string;
  trigger: WorkflowTriggerKind;
  nodes: WorkflowNode[];
  designerModule?: string;
}
```

`designerModule` on the instance mirrors the package constant so a serialised workflow carries the
module version it was captured against, independently of whatever version the reading package was
built from.

No concrete `Workflow` instance ships in the package. The re-audit captured the *catalogs*, not a
built workflow - each node was placed on a fresh canvas, screenshotted, and discarded. Shipping a
fixture would mean inventing one.

## Related

- [Workflow node capture](../automation/workflow-node-capture.md) - the per-node capture loop
- [Phase 7: Re-audit](../runbook/phase-7-reaudit.mdx)
- [Tools](./tools.md)
