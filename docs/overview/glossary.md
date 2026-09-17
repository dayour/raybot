---
id: glossary
title: Glossary
sidebar_label: Glossary
---

# Glossary

Terms used throughout this site, defined as they are used here rather than as they appear in product
documentation.

### ACP — App Customization Policy

A Microsoft Teams tenant policy governing whether app metadata (name, icon, description) may be
changed. Raybot's Teams distribution is blocked because ACP consent was never granted in the tenant;
the edit-details request carries `isConsentProvidedToChangeACPToAny=false`. Requires a tenant admin
to resolve.

### Agent ID

The platform-minted GUID identifying an agent. Created on the **first successful save**, not when the
create dialog is submitted. Raybot's is `4de4ada9-ad61-4c22-a0d0-a0bd1c189f4e`.

### Agentic retrieval

Retrieval that plans queries, executes searches, and synthesises an answer before returning, rather
than returning raw passages. Microsoft IQ performs agentic retrieval; a plain public-website
knowledge source does not.

### Confidence level

The audit's evidence grade. One of:

- **CONFIRMED** — observed live in a running system.
- **SOURCE-INSPECTED** — read from source code or a published artifact, not observed executing.
- **UNCONFIRMED** — inferred or asserted without direct evidence.

This audit is CONFIRMED throughout.

### Coral

The internal codename for Copilot Studio's next-generation runtime and maker surface. Distinguished
from the classic experience by the unified Build designer, the right-hand Agent configuration rail,
inline publishing with no confirmation dialog, and the `coral.*` test-id convention.

### `data-testid`

The DOM attribute the audit keys on. 983 of the 1,627 catalogued elements carry one, resolving to 177
unique values, of which 76 appear on more than one surface. Test ids are the most stable automation
handle in Coral, but they are not unique and not universal.

### Derived label

A heuristic accessible-name approximation computed by the audit harness. The heuristic that produced
each value is recorded in `labelSource`. It is **not** a strict accessible-name computation, so the
228 elements with no derivable label are a lower bound on accessibility gaps, not a finding.

### Foundry IQ

The Azure AI Search feature backing Microsoft IQ. Exposes `/knowledgeSources` and `/knowledgeBases`
on the `2025-11-01-preview` REST surface. Requires Basic tier or higher for knowledge bases to appear
in the Copilot Studio picker.

### Interactive

A computed property in the element audit, derived from native control type, presence of `href`, ARIA
role, `tabindex`, or `contenteditable`. Computed independently of `data-testid`. 1,115 of 1,627
elements are interactive.

### Island Gateway

The host serving channel management operations, at
`powervamg.{region}.gateway.prod.island.powerapps.com`. Separate from Dataverse. The split explains
how a channel can report enabled in a Dataverse-backed UI while gateway-side registration has failed.

### Knowledge base

In Foundry IQ, the queryable aggregate built over one or more knowledge sources. Raybot's is
`raybot-kb`, built over the `ray-docs-web` source with `outputMode: answerSynthesis`.

### Knowledge source

In Foundry IQ, a single origin of content. Raybot's is `ray-docs-web`, of `kind: web`, which requires
no additional parameters.

### MCP — Model Context Protocol

The protocol used to drive the browser during the build. `playwright-browser_*` tools performed every
UI action; `filesystem` tools handled local files. MCP also appears as a tool catalog tab inside
Copilot Studio itself.

### Microsoft IQ

The Copilot Studio right-rail section that binds an agent to a Foundry IQ knowledge base. The add
dialog offers exactly one option, Foundry IQ (Preview). It binds; it does not create.

### Publish v2

The asynchronous publish mechanism. A `POST` to a publish-operations endpoint returns an operation
identifier which is then long-polled. Coral has no publish confirmation dialog, so the command-bar
button text is the only progress signal.

### `PvaProvision`

The Dataverse create model observed on `POST /api/data/v9.2/bots` when an agent is created.

### Ray

The distributed computing framework Raybot is an expert on. Its documentation at `https://docs.ray.io`
is the agent's sole knowledge source. Relevant subsystems: Ray Core, Data, Train, Tune, Serve, RLlib.
Relevant cluster topics: head and worker nodes, autoscaling, KubeRay, the Dashboard, and placement
groups.

### Schema name

The generated Dataverse logical name for an agent, carrying a random suffix. Read-only from the
moment it is assigned. Raybot's is `Default_Raybot_vyN1Rz`.

### Semantic ID

A stable identifier assigned by the audit. Two layers exist:

- **UI** — `coral.<area>.<surface>.<component>[.<state>]`
- **API** — `{namespace}:{surface}:{group}:{operation}`

See [Naming schema](../coral-schema/naming.md).

### Skill

A named, instruction-driven capability authored in the skill editor. Created either blank or from a
generated draft. Raybot's is `ray-cluster-troubleshooter`, authored blank.

### Surface

One audited screen or dialog. Sixteen were catalogued. A surface is the unit the element audit and
the naming schema both organise around.

### Test set

A CSV-imported collection of question-and-expected-response pairs used by Evaluate. Conversation-type
sets accept at most six pairs; the Reference field caps at 1000 characters. Raybot's is
"Ray Knowledge Eval - 6Q".
