---
id: agent
title: Agent aggregate
sidebar_label: Agent
---

# Agent aggregate

`RaybotAgent` is the root of the model. Everything else in the `agent` module hangs off it.

```ts
export interface RaybotAgent {
  identity: AgentIdentity;
  configuration: AgentConfiguration;
  settings: AgentSettings;
  channels: PublishChannel[];
  confidence: ConfidenceLevel;
}
```

The four members map one-to-one onto the four things a maker actually manipulates in Coral, in the
order the runbook manipulates them:

| Member | Where it is edited | Runbook phase |
| --- | --- | --- |
| `identity` | Minted by the platform, then read-only | [Phase 1](../runbook/phase-1-build.mdx) |
| `configuration` | Build canvas and the right rail | [Phase 1](../runbook/phase-1-build.mdx), [Phase 2](../runbook/phase-2-right-rail.mdx), [Phase 3](../runbook/phase-3-foundry-iq.mdx) |
| `settings` | The four-tab Agent settings dialog | [Phase 4](../runbook/phase-4-settings.mdx) |
| `channels` | Customize publish channels | [Phase 5](../runbook/phase-5-publish-evaluate.mdx), [Phase 6](../runbook/phase-6-teams.mdx) |

## Why the split exists

The obvious alternative is one flat agent object. The split is deliberate, and it comes from a
property of the product: **the three groups have different mutability rules.**

`identity` is write-once. `configuration` is freely editable and takes effect on the draft
immediately. `settings` is freely editable but some of its fields are projections of `identity` and
are therefore read-only. `channels` is not editable at all in the normal sense - a channel is
*enabled*, and whether that enablement worked is discovered later, out of band.

Collapsing those into one object would make it impossible to express "this field cannot be changed"
without annotating every field individually.

## Build configuration

```ts
export interface AgentConfiguration {
  model: string;
  instructions?: string;
  icon?: AgentIcon;
  knowledge: KnowledgeSource[];
  tools: AgentTool[];
  skills: AgentSkill[];
  connectedAgents: ConnectedAgent[];
  microsoftIQ: MicrosoftIQBinding[];
  memory: AgentMemory;
}
```

The five array members are exactly the five add-buttons on the right rail, plus Microsoft IQ. They
are arrays rather than optional singletons because the rail permits several of each - even where
Raybot only ever used one.

`model` is a plain `string`, not a union. Coral's model picker is server-driven and the list changed
between the build and the re-audit; freezing it into a union would encode a snapshot as if it were a
contract. The value observed on Raybot is `Claude Sonnet 4.6`.

`instructions` is optional because an agent can be saved with none. Raybot has instructions; the
model does not require them.

## The canonical instance

`RAYBOT` is a fully populated `RaybotAgent` and doubles as the reference fixture for the package.

```ts
import { RAYBOT } from '@raybot/object-model';

RAYBOT.identity.agentId;        // '4de4ada9-ad61-4c22-a0d0-a0bd1c189f4e'
RAYBOT.configuration.model;     // 'Claude Sonnet 4.6'
RAYBOT.configuration.knowledge; // one publicWebsite source at https://docs.ray.io
RAYBOT.configuration.tools;     // [] - surveyed, never attached
RAYBOT.channels.length;         // 2
```

Two members are empty arrays, and that is a finding rather than an omission. Raybot surveyed all four
tool catalogs in Phase 2 and attached nothing; it opened the connected-agent picker and found it
empty. Both facts are recorded as empty arrays with the explanation living in the runbook phase,
because an empty array is the honest representation of "we looked and took nothing".

## Operators

`RAYBOT_OPERATORS` records who touched the agent and in what capacity. Two identities were involved,
and conflating them would make the provenance unreadable.

```ts
export const RAYBOT_OPERATORS = [
  { upn: 'darbot@timelarp.com',  role: 'build',    note: 'Built the agent end to end through the Coral UI.' },
  { upn: 'dayour@microsoft.com', role: 're-audit', note: 'Ran the 2026-06-17 re-audit. Copilot-DYdev25, bbf34eea-8ed1-e502-a74c-6a7b21a8b002.' },
] as const;
```

See [Identity](../overview/identity.md) for the full identity crosswalk.

## Aggregate confidence

`RaybotAgent.confidence` is `CONFIRMED`, and that claim is checkable rather than asserted: every
`Evidenced` member below it is also `CONFIRMED`, so `weakestConfidence()` over the tree returns
`CONFIRMED`.

```ts
import { weakestConfidence } from '@raybot/object-model';

weakestConfidence([
  ...RAYBOT.configuration.knowledge.map(k => k.confidence),
  ...RAYBOT.configuration.skills.map(s => s.confidence),
  ...RAYBOT.configuration.microsoftIQ.map(m => m.confidence),
  ...RAYBOT.channels.map(c => c.confidence),
]); // 'CONFIRMED'
```

If any component were downgraded, the aggregate claim would have to move with it. See
[Confidence model](../coral-schema/confidence.md).

## Related

- [Identity](./identity.md) - the write-once half and the first-save minting behaviour
- [Settings](./settings.md) - the four tabs
- [Publishing](./publishing.md) - `PublishChannel` and the two-field enablement model
