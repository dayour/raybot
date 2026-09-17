---
id: capture-patterns
title: Capture patterns
sidebar_label: Capture patterns
---

# Capture patterns

The screenshot-after-every-action rule, the two naming schemes it produced, and the five failure
modes that recurred often enough to be worth naming.

## The rule

Capture after every **action**, not after every step and not after every milestone.

This is the expensive rule. It is also the one that paid for itself. The Phase 6 Teams blocker
presents in the UI as a success — the channel reads "Channel enabled" — and the only contrary
evidence is an HTTP 500 on
`GET /api/botmanagement/v1/channels/msteams/app/status` and an
`isConsentProvidedToChangeACPToAny=false` flag in an Edit-details `PUT` body. Neither is visible
without a network trace captured alongside the UI state at the moment of the action.

A capture is therefore not just a PNG. It is the PNG plus whatever network and console state the
driver could read at the same instant.

## Two naming schemes

The repository carries captures under two conventions, because they were produced by two different
passes eleven days apart.

| Scheme | Pattern | Where | Count |
| --- | --- | --- | --- |
| Curated | `NN_<phase>_<subject>.png` | `screenshots/` | 41 canonical, drawn from originals numbered 01 through 76 |
| Raw and annotated | `NN-<subject>.png` | `captures-2026-06-17/raw/` and `/annotated/` | 26 each |

The curated scheme encodes narrative order in `NN` and gallery grouping in `<phase>`. The raw scheme
encodes only capture order. The crosswalk between the original numbering and the curated names —
including the 35 originals that were superseded and not promoted — is in the
[screenshot map](../screenshots/map.md).

The mapping itself is data, not prose: it lives as an `[ordered]` hashtable inside
`coral-schema/rename-screenshots.ps1`, keyed by original filename, with
`@(newName, phase, caption)` as the value. That is the authoritative source for gallery captions.

## Failure mode 1: refs go stale on every snapshot

**Symptom.** A stored element reference from snapshot N fails, or worse, resolves to a different
element, on snapshot N+1.

**Cause.** Snapshot refs are positional handles into a freshly serialized accessibility tree. A React
re-render renumbers them. Coral re-renders constantly.

**Workaround.** Never store a ref across a snapshot boundary. Use role and text locators through
`browser_run_code`:

```js
getByRole('button', { name: 'Add a step after Start' }).first().click()
```

This is the single most reusable finding in the project and it has its own page:
[workflow node capture](./workflow-node-capture.md).

## Failure mode 2: adjacent React fields jumble under type and fill

**Symptom.** Filling a multi-field form with `browser_type` or Playwright `fill` produces text
distributed across the wrong inputs — characters from field two landing in field one, or a field
silently reverting on blur.

**Cause.** Controlled React inputs with `onChange` handlers that re-render siblings. Synthetic
keystrokes race the re-render.

**Workaround.** Set the value through the native setter and dispatch the event React listens for:

```js
const setter = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype, 'value'
).set;
setter.call(el, text);
el.dispatchEvent(new Event('input', { bubbles: true }));
```

Issued via `browser_evaluate`. This is the documented approach for the skill form, which has three
adjacent fields — `skill-name-input`, `skill-description-input`, `skill-instructions-input`.

## Failure mode 3: deep SPA navigation drops the session

**Symptom.** `browser_navigate` to a deep route lands on a re-authentication prompt rather than the
target surface.

**Cause.** The route is reached before the SPA's auth context rehydrates, so the router treats the
session as absent.

**Workaround.** Prefer in-app clicks to direct navigation. Where a deep URL is genuinely needed —
as in the workflow node loop — pair it with a fixed settle delay and verify the expected control is
present before proceeding.

## Failure mode 4: clicking an agent name opens a new tab

**Symptom.** Every action after opening an agent from the list targets the list page, not the agent.

**Cause.** The agent list opens the designer in a new browser tab at index 1. The driver stays
attached to index 0.

**Workaround.** Follow the tab explicitly:

```
browser_tabs select index:1
```

Then re-establish locators. Nothing carried over from the previous tab is valid.

## Failure mode 5: canvas state accumulates

**Symptom.** Capturing a series of configuration panels produces images contaminated by nodes added
in earlier iterations.

**Cause.** The workflow canvas is stateful and additive. There is no "clear" control.

**Workaround.** Reset by navigating to a fresh canvas each iteration rather than trying to undo. The
full loop is on the [workflow node capture](./workflow-node-capture.md) page.

## What a good capture set looks like

- Every capture has a preceding action that is named in the runbook.
- Rejections and retries are captured, not just successes. The 512-pixel icon that was rejected at
  195.8 KB is as much a part of the record as the 256-pixel one that was accepted at 53.8 KB.
- Blocked states are captured. `41_teams_search-no-result.png` exists specifically to record an
  absence.
- Captions are stored as data alongside the filename mapping, not embedded in prose that will drift.
