---
id: identity
title: Identity
sidebar_label: Identity
---

# Identity

```ts
export interface AgentIdentity {
  agentId: Guid;
  displayName: string;
  schemaName: string;
  environmentId: string;
  environmentName?: string;
  description?: string;
}
```

Raybot's values:

| Field | Value |
| --- | --- |
| `agentId` | `4de4ada9-ad61-4c22-a0d0-a0bd1c189f4e` |
| `displayName` | `Raybot` |
| `schemaName` | `Default_Raybot_vyN1Rz` |
| `environmentId` | `Default-6b104499-c49f-45dc-b3a2-df95efd6eeb4` |
| `environmentName` | `Cypherdyne` |

## The first-save minting behaviour

This is the single most load-bearing observation in Phase 1, and it explains a UI state that looks
like a bug.

**The agent id is minted on the first successful save, not when the create dialog is submitted.**

Before that save, the agent exists only as unsaved editor state. Publish, Share, and Evaluate are all
disabled, because each of them needs an id to address. A maker who opens the create flow, fills in a
name and instructions, and then reaches for Publish will find it greyed out with no explanation
offered.

The fix is to press Save. The sequence is:

1. `suggestion-agent` - pick or dismiss a suggestion
2. Enter the name
3. Author the instructions
4. `agent-command-bar.save-button` - **the id is minted here**
5. Publish, Share, and Evaluate become enabled

Captured in [Phase 1](../runbook/phase-1-build.mdx).

## schemaName is generated, not chosen

`schemaName` is the Dataverse logical name. The platform generates it as the display name with a
random six-character suffix:

```
Raybot  ->  Default_Raybot_vyN1Rz
            ^^^^^^^        ^^^^^^
            prefix         random suffix
```

It is read-only from the moment it is assigned. Renaming the agent later changes `displayName` and
leaves `schemaName` untouched, so the two drift apart permanently after the first rename. Any code
that reconstructs `schemaName` from `displayName` is wrong for every renamed agent.

`schemaName` is what appears in Dataverse `bots(...)` lookups, so it - not `displayName` - is the
join key when correlating designer state with Dataverse rows. See
[API ground truth](../api/ground-truth.md).

## environmentId shape

For a default environment, `environmentId` is `Default-` followed by the tenant GUID:

```
Default-6b104499-c49f-45dc-b3a2-df95efd6eeb4
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        tenant guid
```

Non-default environments use a bare environment GUID with no prefix. The type is `string` rather than
`Guid` for exactly that reason - the default-environment form is not a valid GUID.

## The read-only projection in settings

`DetailsSettings` repeats `schemaName` and `agentId`:

```ts
export interface DetailsSettings {
  displayName: string;
  description?: string;
  /** Read-only after the first save. */
  schemaName: string;
  /** Read-only after the first save. */
  agentId: Guid;
}
```

The duplication is intentional and mirrors the product. The Details settings tab *displays* both
fields, and both are rendered disabled. Modelling the tab without them would misrepresent what the
tab shows; modelling them as editable would misrepresent what it permits.

The invariant is that `settings.details.agentId === identity.agentId` and
`settings.details.schemaName === identity.schemaName`, always. The model does not enforce it
structurally, because doing so would require the settings object to hold a reference back to
identity, which breaks the ability to serialise a settings tab on its own.

## Two identities operated on this agent

The build and the re-audit ran under different accounts in different tenants:

| Role | UPN | Context |
| --- | --- | --- |
| Build | `darbot@timelarp.com` | Original end-to-end Coral build |
| Re-audit | `dayour@microsoft.com` | 2026-06-17 re-audit, Copilot-DYdev25, `bbf34eea-8ed1-e502-a74c-6a7b21a8b002` |

This matters when reading captures: a screenshot's account pill tells you which pass it came from.
Full crosswalk at [Identity](../overview/identity.md).

## Related

- [Agent aggregate](./agent.md)
- [Settings](./settings.md) - the Details tab
- [Constraints](../reference/constraints.md)
