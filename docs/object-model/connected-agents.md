---
id: connected-agents
title: Connected agents
sidebar_label: Connected agents
---

# Connected agents

```ts
export interface ConnectedAgent extends Evidenced {
  agentId: Guid;
  displayName: string;
  /** Always true in practice, because the picker filters drafts out. */
  isPublished: boolean;
}
```

## The published-only constraint

`agent-side-panel.connected-agents.add-button` opens a picker that states the rule outright:

> Only published agents can be connected.

This is the single most common cause of an empty connected-agent picker, and it is not obvious from
the empty state alone. A maker with several agents in the environment opens the picker, sees nothing,
and concludes the feature is broken. In fact every candidate is a draft.

Captured in [Phase 2](../runbook/phase-2-right-rail.mdx), screenshot
`23_connected_add-dialog.png`.

## Why isPublished is modelled at all

Given the picker filters drafts out, every `ConnectedAgent` that can exist has `isPublished: true`.
The field looks redundant.

It is kept for two reasons.

**It makes the constraint discoverable from the type.** A developer reading `ConnectedAgent` learns
the rule without reading the runbook. The TSDoc comment - "Always true in practice, because the picker
filters drafts out" - carries into the
[emitted JSON Schema](./json-schemas.md) as a `description`, so it reaches consumers in other
languages too.

**Publication is not permanent.** An agent can be connected while published and later have its
publication state change. The connection record then refers to something that would no longer be
selectable. Modelling the field leaves room to represent that drift instead of silently implying it
cannot happen.

It is typed `boolean` rather than `true` for the same reason. Narrowing to the literal would make the
stale case unrepresentable.

## Raybot has none

```ts
RAYBOT.configuration.connectedAgents; // []
```

The picker was opened and found empty - there were no published agents in the Cypherdyne default
environment at build time. The empty array records that the flow was exercised and yielded nothing,
which is different from the flow never being attempted.

This is the same convention used for `tools`, and it is why both live as required arrays rather than
optional members: an absent array would be ambiguous between "not attempted" and "attempted, empty".
See [Agent aggregate](./agent.md).

## The ordering dependency this creates

The constraint imposes a build order that is invisible until it bites: **a multi-agent topology has to
be built leaf-first.**

Child agents must be published before the parent can reference them. A maker who builds the
orchestrating parent first will find nothing to connect to it. Combined with the
[first-save minting rule](./identity.md#the-first-save-minting-behaviour) - Publish stays disabled
until the first save mints an id - the minimum sequence per child is:

1. Create the child agent
2. Save it, minting its id and unlocking Publish
3. Publish it
4. Only now does it appear in the parent's connected-agent picker

## Related

- [Agent aggregate](./agent.md)
- [Publishing](./publishing.md)
- [Identity](./identity.md)
