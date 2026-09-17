---
id: workflow-node-capture
title: Workflow node capture
sidebar_label: Workflow node capture
---

# Workflow node capture

The deterministic reset loop that captured thirteen workflow node types one at a time, and the
reason it has to be a reset loop rather than a sequence.

This is the most reusable finding in the project. It generalizes to any stateful canvas UI with no
clear control.

## The problem

The Coral workflow designer opens at `/flows/new/canvas` with a single **Start** node, which defaults
to a **Manual** trigger. Adding a step is additive and there is no reset. Capture node type two by
adding it after node type one, and the screenshot shows both. By node thirteen the canvas is
unreadable and the captures are useless as reference material.

The obvious fix — undo after each capture — does not work reliably. Undo restores graph state but
not panel state, and the health-center banner accumulates independently of the node count.

## The loop

Four steps, repeated in full for each of the thirteen node types.

```js
// 1. Reset: a fresh canvas is the only reliable clear.
await page.goto('.../flows/new/canvas');
await page.waitForTimeout(3500);

// 2. Open the Add dialog from the Start node.
await page.getByRole('button', { name: 'Add a step after Start' }).first().click();
await page.waitForTimeout(1500);

// 3. Place exactly one node.
await page.getByRole('button', { name: 'Select action: <NodeName>' }).click();
await page.waitForTimeout(2500);

// 4. Capture.
// browser_take_screenshot -> captures-2026-06-17/raw/NN-node-<name>.png
```

## Why each number is what it is

| Wait | Value | What it is waiting for |
| --- | --- | --- |
| After `goto` | 3500 ms | Designer module `s01-workflow-designer/22.19.1` to load and the canvas to settle to a single Start node. This is the longest wait because it is a full module boot, not a re-render. |
| After opening Add | 1500 ms | The centered Add dialog to render its Featured and Connectors tabs. |
| After selecting a node | 2500 ms | The node to place, the configuration panel to open, and the "Setup needed" badge plus health-center banner to appear. Capturing earlier produces an image missing the validation state, which is the interesting part. |

These are fixed delays, not condition waits, and that is a deliberate tradeoff. A condition wait
needs a stable predicate; the thing being characterized is precisely which controls appear, so there
is no predicate available in advance. Fixed delays sized generously produce a reproducible capture
set at the cost of wall-clock time.

## Why role locators are mandatory here

Every iteration crosses at least three snapshot boundaries. Element references are positional
handles into a serialized accessibility tree, and the tree is reserialized on every snapshot — so a
ref captured at step 2 is meaningless by step 3, and dangerously meaningless rather than merely
invalid, because it may resolve to a different element rather than failing.

`getByRole('button', { name: ... })` re-resolves against the live DOM at call time. It is the only
locator form that survives the loop.

The `.first()` on step 2 matters: container nodes introduce additional "Add a step" affordances, and
without it the locator becomes ambiguous the moment a Loop or Scope is on the canvas.

## The thirteen node types

The left Add palette shows ten. The Add dialog exposes three more — Switch, Scope, and End — which is
why an inventory taken from the palette alone is incomplete.

| Node | Capture | Behavior worth recording |
| --- | --- | --- |
| Agent | 12 | Configure and Test sub-tabs. Connection, agent plus model (Claude Sonnet 4.6), **Instructions required**, Microsoft IQ. Reports 3 issues until instructions are set. |
| Classify | 13 | AI classification routing by categories and instructions. |
| M365 Copilot | 14 | Calls Microsoft 365 Copilot. |
| Human review | 15 | Pauses for approval. Approvers and prompt. |
| Connector | 16 | Opens the connector catalog — Office 365, OneDrive, SharePoint, X, RSS, Dropbox, 1000 plus. A picker: places no node until a choice is made. |
| Function | 17 | Opens Select a function — Data Operations (7), Date Time (6), HTTP (3), Schedule (2), Request (1). Also a picker. |
| Variable | 18 | Initialize Variable. Name required, Type defaults to String, Value accepts dynamic content. |
| If/Else | 19 | Condition builder with AND, property/operator/value rows. **Else branch auto-created.** |
| Loop | 20 | Dashed container with an inner plus. For each, array expression, Run sequentially toggle — parallel by default. |
| Note | 21 | Freestanding yellow sticky. **Not wired into the flow.** |
| Switch | 22 | Case 1 plus **Default auto-created**. Switch expression, match value, add a case. |
| Scope | 23 | Dashed container. Groups actions; **any inner failure fails the whole scope.** |
| End | 24 | Terminator. Run status defaults to Succeeded, selectable. |

Two of the thirteen — Connector and Function — are pickers rather than nodes. They open a catalog and
place nothing until a selection is made, so their captures show a dialog, not a canvas node. An
inventory that treats all thirteen as node types will be wrong about those two.

## Trigger types

Captured separately from the Start node configuration dropdown, not through the Add loop.

| Trigger | Meaning |
| --- | --- |
| Manual | Run on demand. The canvas default. |
| Recurrence | Schedule. |
| Connector | External service. |
| When a HTTP request is received | Inbound webhook. |

## Generalizing this

The pattern applies whenever all three of these hold:

1. The surface is stateful and additive.
2. There is no reset control, or the reset control is itself unreliable.
3. You need N independent captures rather than one capture of N things.

The answer is always: make navigation the reset, size the settle delay to the slowest boot path, and
re-resolve every locator by role after every boundary.

## Related

- [Capture patterns](./capture-patterns.md) — the four other recurring failure modes.
- [Phase 7](../runbook/phase-7-reaudit.mdx) — the re-audit this loop was built for.
