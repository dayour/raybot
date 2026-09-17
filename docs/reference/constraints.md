---
id: constraints
title: Constraints
sidebar_label: Constraints
---

# Constraints

Every hard limit discovered during the build, with the observation that produced it.

None of these are stated in product documentation. Each one cost time to find.

## Agent icon

| Constraint | Value | Evidence |
| --- | --- | --- |
| Format | PNG only | Upload dialog rejects other formats |
| Maximum size | 100 KB | 512 px render at 195.8 KB rejected |
| Working size | 256 px | 53.8 KB, accepted |

The rejection message does not state the limit or the file's size. It says the upload failed. The
100 KB figure was established by bisecting render sizes, not by reading it anywhere.

Practical consequence: render at 256 px. A 512 px PNG of any reasonable complexity exceeds 100 KB.

The Build-tab icon has **no admin gate**. This is worth stating because the Teams app-package icon
does — see [Phase 6](../runbook/phase-6-teams.mdx).

## Save gating

| Action | Available before first save |
| --- | --- |
| Publish | No |
| Share | No |
| Evaluate | No |

The agent ID is minted at first save. Until `agent-command-bar.save-button` has been pressed once,
there is no agent to publish, share, or evaluate, and the controls are inert.

This is the single most disorienting thing about the Build tab on first use: the toolbar is fully
rendered and looks operable.

## Identity fields

Identity fields become **read-only after first save**. Name and schema name cannot be changed
afterward through the UI.

`Default_Raybot_vyN1Rz` is therefore permanent for this agent. The `vyN1Rz` suffix is generated, not
chosen.

Decide naming before the first save, not after.

## Connected agents

Only **published** agents can be connected. The picker's empty state says so, but only after you open
it.

A draft agent is invisible to the connected-agents picker regardless of how complete it is. Publish
first, then connect.

## Foundry IQ and Azure AI Search

| Constraint | Value |
| --- | --- |
| Minimum tier | Basic |
| API version exposing `/knowledgeBases` | `2025-11-01-preview` |
| Web knowledge sources require | `outputMode: answerSynthesis` |
| Answer synthesis requires | An Azure OpenAI model in `models[]` |

**The tier floor is the expensive one.** Free-tier search services can be created, and knowledge
bases can be created on them through the REST API without error. They simply never appear in the
Copilot Studio picker.

`raybot-foundryiq-search` was built on Free in Australia East and was entirely wasted. There is no
error, no warning, and no empty-state text explaining the absence. The only signal is that the
dropdown stays empty.

The api-version constraint is equally silent. Earlier api-versions return 404 on `/knowledgeBases`,
which reads as "wrong path" rather than "wrong version".

```bash
az search service create --name darbotlm --resource-group rg-DarbotLM \
  --sku basic --location centralus
```

## Skill fields

| Field | Type | Limit |
| --- | --- | --- |
| `skill-name-input` | INPUT | 64 characters |
| `skill-description-input` | TEXTAREA | 1,024 characters |
| `skill-instructions-input` | TEXTAREA | Markdown, no observed limit |

The instructions field accepts markdown and is the only one of the three without an enforced ceiling
observed during the build.

## Evaluation

| Constraint | Value |
| --- | --- |
| CSV schema | `conversationNumber,question,response` |
| CSV maximum size | 5 MB |
| Q-A pairs per conversation | 6 |
| `Reference` field maximum | 1,000 characters |
| Quick conversation set | Auto-generates 10 |

The 6-pair ceiling is per conversation, not per test set. `raybot-evalset.csv` carries 6 pairs in one
conversation, which is the maximum a single conversation holds.

Test method is **General quality**. Agent version is **Current draft** or **Published**.

## Moderation and authentication

| Setting | Range | Used |
| --- | --- | --- |
| Moderation | Minimum to Maximum | Medium |
| Authentication | Several | Authenticate with Microsoft |

**Do not enable "Require secured access" while using Demo or Preview.** It breaks both. The setting
is correct for production and wrong for every iteration loop before it.

## Publishing

Coral publishes **inline**, with no confirmation dialog. `POST publishv2-operations` followed by a
long poll.

The absence of a dialog means there is no confirmation step and no obvious completion signal beyond
the toolbar state changing. Watch the network, not the UI, if you need to know when it finished.

## Teams

| Constraint | Evidence |
| --- | --- |
| Tenant App Customization Policy consent required | `isConsentProvidedToChangeACPToAny=false` on the Edit-details PUT |
| Channel status endpoint fails | `GET /api/botmanagement/v1/channels/msteams/app/status` returns HTTP 500 |

The UI reports "Channel enabled". The agent does not appear in Teams. Both statements are true
simultaneously, and nothing in the UI reconciles them.

This is a tenant-admin blocker with **zero actionable UI signal**. See
[Phase 6](../runbook/phase-6-teams.mdx) and [troubleshooting](./troubleshooting.md).

## Automation

| Constraint | Consequence |
| --- | --- |
| Element refs go stale on every snapshot | Re-query by role and name each time |
| Test ids are not unique | 76 of 177 span multiple surfaces |
| Playwright `type` and `fill` jumble adjacent React fields | Use a native value setter via `browser_evaluate` for multi-field forms |
| Playwright blocks `file://` | Validation used `@darbotlabs/darbot-browser-mcp@1.3.0` instead |

The React field-jumbling behaviour is the least obvious of these. Filling two adjacent controlled
inputs in sequence produces interleaved text, because React's synthetic event handling does not see
the intermediate states the way it expects. The workaround is to set the value through the native
setter and dispatch an input event.

## Constraints that do not exist

Worth stating, because their absence was also tested:

- No rate limit was hit during any capture session
- No limit was found on the number of knowledge sources
- No limit was found on the number of tools attached
- The Build-tab icon has no admin gate, unlike the Teams app-package icon
