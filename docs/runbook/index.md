---
id: index
title: The runbook
sidebar_label: Overview
---

# The runbook

The complete, reproducible build of Raybot, in seven phases and twenty-three steps. Every step names
the control it operated and the capture it produced.

## Method

Three rules governed the whole build.

1. **UI only.** Every action goes through `playwright-browser_*` MCP tools driving a real browser.
   The single exception is Phase 3, where Microsoft IQ has no creation UI and the knowledge base must
   be built with Azure CLI and the Azure AI Search REST surface.
2. **Screenshot after every action.** Not after every milestone — after every action. This is what
   surfaced the silent HTTP 500s and the consent flag that no UI element mentions.
3. **Self-reflection between steps.** Read the resulting state before issuing the next command,
   rather than executing a pre-planned script.

## The phases

| Phase | Subject | Outcome |
| --- | --- | --- |
| [1](./phase-1-build.mdx) | Build the agent | Complete. Agent ID minted, icon uploaded. |
| [2](./phase-2-right-rail.mdx) | Right-rail configuration | Complete. Knowledge, skill, memory configured. |
| [3](./phase-3-foundry-iq.mdx) | Microsoft IQ | Complete. Verified grounding in Preview. |
| [4](./phase-4-settings.mdx) | Settings | Complete. Four tabs catalogued. |
| [5](./phase-5-publish-evaluate.mdx) | Publish, Preview, Evaluate, Monitor | Mixed. Preview works; Evaluate scores zero. |
| [6](./phase-6-teams.mdx) | Teams and M365 distribution | Blocked. Tenant admin required. |
| [7](./phase-7-reaudit.mdx) | Workflow designer and analytics re-audit | Complete. 26 captures, 13 node types. |

## Tool surface

| Tool | Used for |
| --- | --- |
| `playwright-browser_*` MCP | Every UI action in every phase |
| `filesystem` MCP | Writing captures and artifacts to disk |
| Azure CLI | Phase 3 only: search service provisioning |
| Azure AI Search REST | Phase 3 only: knowledge source and knowledge base creation |

## Ground-truth reconciliation

The runbook and its audit were cross-checked against the authoritative Copilot Studio and Agent
Studio API corpus and the `agent-studio-cli` kit. Three things were adopted from it:

1. **The official API identifier format** `{namespace}:{surface}:{group}:{operation}`. Namespaces:
   `cs` Copilot Studio platform, `as` local kit, `ac` cards, `lt` tiles. Surfaces: `cs:dv` Dataverse,
   `cs:bm` Bot Management and Island Gateway, `cs:env`, `cs:bap`, `cs:runtime`, `cs:graph`. Every
   endpoint in the API map now carries a `semanticId`.
2. **The confidence model** CONFIRMED / SOURCE-INSPECTED / UNCONFIRMED.
3. **Four corroborations** that matched observed behaviour exactly: the Island Gateway host pattern,
   the evaluation v2 query-generation path, the Dataverse `POST /api/data/v9.2/bots` plus
   `PvaProvision` create model, and the `channels/msteams/app/status` 500 correlating with the ACP
   consent gate.

The corpus was used for **validation only**. Every numbered step below remains plain browser
automation; the runbook requires no direct API calls outside Phase 3.

## What was proven, and what was not

**Proven.** The agent builds, grounds, and answers correctly. Preview returns accurate Ray answers
with live `docs.ray.io` citations. Microsoft IQ is invoked and shows its retrieval trace. The
Build-tab icon publishes without friction.

**Not proven.** Teams catalog registration never succeeded. Evaluation never produced a meaningful
score. Analytics never showed populated metrics, because no environment had real end-user traffic.
Each of these is documented with the evidence that establishes the cause.
