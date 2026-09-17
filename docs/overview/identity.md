---
id: identity
title: Identity and environment
sidebar_label: Identity
---

# Identity and environment

Everything here was read off the Agent settings dialog, the Dataverse payloads observed during save,
or the browser session itself. Nothing is inferred.

## The agent

| Field | Value | Where it comes from |
| --- | --- | --- |
| Agent ID | `4de4ada9-ad61-4c22-a0d0-a0bd1c189f4e` | Minted by the platform on first save |
| Display name | `Raybot` | Set by the maker, editable |
| Schema name | `Default_Raybot_vyN1Rz` | Generated with a random suffix, read-only forever |
| Solution | `Common Data Services Default Solution` | Assigned at create, read-only |
| Primary language | `English` | Assigned at create, read-only |

The schema name is the Dataverse logical name. It is what `bots(...)` lookups key on, and it is the
value you need when correlating an agent to rows in the platform tables. It is generated, not chosen,
and the random suffix means you cannot predict it before the first save.

:::note The agent ID is minted on save, not on create
Submitting the create dialog does not mint an agent ID. The first successful **Save** does. Until
that save completes, the Publish, Share, and Evaluate commands stay disabled, because all three need
an ID to address. This ordering is the single most common source of confusion in Phase 1.
:::

## The environment

| Field | Value |
| --- | --- |
| Environment name | Cypherdyne (default) |
| Environment ID | `Default-6b104499-c49f-45dc-b3a2-df95efd6eeb4` |
| Tenant GUID | `6b104499-c49f-45dc-b3a2-df95efd6eeb4` |

Default environments carry the `Default-` prefix followed by the tenant GUID. Non-default
environments use a bare GUID. If you are parsing environment identifiers, handle both shapes.

## The identities

Two different accounts operated on this agent, in two different tenants, at two different times.
Keeping them apart matters when reading the captures, because the chrome differs.

| Identity | Role | Context |
| --- | --- | --- |
| `darbot@timelarp.com` | Build | Cypherdyne. Phases 1 through 6, 2026-06-07 and earlier. |
| `dayour@microsoft.com` | Re-audit | Copilot-DYdev25, `bbf34eea-8ed1-e502-a74c-6a7b21a8b002`. Phase 7, 2026-06-17. |

The Phase 7 captures come from a different tenant than Phases 1 through 6. That is deliberate — the
re-audit was checking whether the runtime had drifted, and a second tenant is a stronger test than
re-running in the same one. It also means the Phase 7 agent names in the captures are DYdev25
agents (AskHR, PowerAssist) rather than Raybot itself. The **surfaces** are what Phase 7 documents,
not the agents shown in them.

## The Azure resources

Phase 3 provisioned real Azure infrastructure. These are the resources Microsoft IQ depends on.

| Resource | Value |
| --- | --- |
| Subscription | `88dc9c38-361e-4516-9072-ae9504620c0f` (MSFT_funded, Cypherdyne) |
| Resource group | `rg-DarbotLM` |
| Search service | `darbotlm`, Basic tier, Central US |
| Knowledge source | `ray-docs-web`, kind `web` |
| Knowledge base | `raybot-kb` |
| Synthesis model | `gpt-4.1` on `darbotlm-resource` |

A second search service, `raybot-foundryiq-search` (Free tier, Australia East), was built first and
discarded. Its knowledge base worked correctly over REST but never appeared in the Copilot Studio
picker, because the picker filters out Free-tier services. See
[Phase 3](../runbook/phase-3-foundry-iq.mdx).

## Model

The agent runs on **Claude Sonnet 4.6**, selected in the right-rail model picker on the Build tab.
The same model is offered inside the Workflows designer Agent node, where it appears as the default
for newly placed agent nodes.
