---
id: memory
title: Memory
sidebar_label: Memory
---

# Memory

```ts
/** Conversation memory toggle state on the Build tab right rail. */
export interface AgentMemory {
  enabled: boolean;
}
```

The smallest interface in the model: a single boolean, because the control is a single toggle.

## The control

`agent-side-panel.memory.toggle` sits at the bottom of the right rail, below Connected agents. It is
a plain on/off switch with no configuration surface behind it - no retention window, no scope
selector, no storage target. Captured in [Phase 2](../runbook/phase-2-right-rail.mdx), screenshot
`24_memory_enabled.png`.

Raybot has it on:

```ts
RAYBOT.configuration.memory; // { enabled: true }
```

## Why it is an interface and not a boolean

`AgentConfiguration.memory` could have been `memoryEnabled: boolean`. It is an object instead, and
the reason is forward shape rather than present need.

Memory is the one right-rail feature whose UI is plainly a placeholder. Every other feature on the
rail - knowledge, tools, skills, connected agents, Microsoft IQ - opens a dialog with real
configuration behind it. Memory is a naked switch. When retention, scope, or a storage target appear,
they will attach to memory, and an interface absorbs them additively:

```ts
export interface AgentMemory {
  enabled: boolean;
  // retentionDays?: number;
  // scope?: 'conversation' | 'user' | 'tenant';
}
```

A boolean field would force a breaking change at that point. An interface with one member costs
nothing now and avoids the break later.

This is the only place in the model where a shape is chosen for anticipated change rather than
observed structure, and it is called out here so the inconsistency is deliberate rather than
accidental.

## What was not established

The audit toggled memory on and captured the result. It did not:

- Verify that memory actually influenced a later turn
- Determine the retention window
- Determine whether memory is scoped per user, per conversation, or per agent
- Locate where memory is stored, or find an API surface that reads or clears it

`AgentMemory` therefore does not extend `Evidenced`. The toggle state is `CONFIRMED` by direct
observation, but there is no behavioural claim attached to it that would need grading. The interface
asserts exactly one thing - that the switch was on - and that thing is visible in a screenshot.

Anything you read elsewhere about how Coral memory behaves did not come from this audit.

## Related

- [Agent aggregate](./agent.md)
- [Phase 2: Right rail](../runbook/phase-2-right-rail.mdx)
- [Confidence model](../coral-schema/confidence.md)
