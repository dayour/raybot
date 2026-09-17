---
id: tools
title: Tools
sidebar_label: Tools
---

# Tools

```ts
export type ToolCatalog =
  | 'featured'
  | 'mcp'
  | 'connectors'
  | 'workflows'
  | 'custom';

export interface AgentTool extends Evidenced {
  catalog: ToolCatalog;
  name: string;
  description?: string;
  mcpServer?: string;
  connectorId?: string;
}
```

## The four tabs plus custom

`agent-side-panel.tools.add-button` opens a flyout with four catalog tabs and a separate explicit Add
affordance. Enumerated in [Phase 2](../runbook/phase-2-right-rail.mdx).

| `catalog` | Tab | What it offers |
| --- | --- | --- |
| `featured` | Featured | A curated first-party set surfaced ahead of the full catalogs. |
| `mcp` | MCP | Model Context Protocol servers. Populates `mcpServer`. |
| `connectors` | Connectors | Power Platform connector actions. Populates `connectorId`. |
| `workflows` | Workflows | Workflows in the environment exposed as agent-callable tools. |
| `custom` | (Add) | The explicit affordance for registering a tool present in none of the four catalogs. |

`custom` is modelled as a fifth catalog value rather than as a boolean flag because from the model's
point of view it is simply a fifth provenance for a tool. The distinction that matters downstream is
"where did this tool come from", and the answer for a hand-registered tool is "nowhere in the
catalogs".

## The two optional discriminator fields

`mcpServer` and `connectorId` are both optional, and which one is populated is determined by
`catalog`:

| `catalog` | `mcpServer` | `connectorId` |
| --- | --- | --- |
| `mcp` | Set | Absent |
| `connectors` | Absent | Set |
| `featured`, `workflows`, `custom` | Absent | Absent |

This is a loose encoding. A discriminated union keyed on `catalog` would make the illegal states
unrepresentable. It was not used because the audit never attached a tool, so the exact payload shape
for each catalog is `UNCONFIRMED`. Tightening the type would assert a structure that was never
observed. The loose shape is the honest one until a capture exists that pins it down.

## Raybot attached no tools

```ts
RAYBOT.configuration.tools; // []
```

All four catalogs were opened and surveyed in Phase 2; nothing was attached. Ray expertise came from
the knowledge source and the skill, neither of which is a tool.

The empty array is a finding. It means every grounded answer Raybot produced in Preview came from
retrieval over `https://docs.ray.io`, with no tool call in the loop - which is what makes the four
citations meaningful as evidence.

## Workflows are tools

The `workflows` catalog is the bridge between the two halves of this documentation. A workflow whose
trigger is `agent` is exposed here and becomes invocable by the orchestrator:

```ts
{
  kind: 'agent',
  label: 'When an agent calls it',
  description: 'The workflow is exposed as a tool and runs when an agent invokes it.',
}
```

So the trigger kind on the workflow side determines visibility on the tool side. See
[Workflow](./workflow.md).

## Microsoft IQ is not a tool

Microsoft IQ appears on the right rail alongside Tools, Skills, and Knowledge, which invites the
assumption that it is one of them. It is not. It is a binding to an externally provisioned Azure AI
Search knowledge base, with its own provisioning story, its own REST api-version, and a hard SKU
floor.

It therefore gets `MicrosoftIQBinding` and its own array on `AgentConfiguration`:

```ts
export interface MicrosoftIQBinding extends Evidenced {
  knowledgeBase: string;
  searchService: string;
  region: string;
  sku: 'free' | 'basic' | 'standard' | 'standard2' | 'standard3';
  knowledgeSources: string[];
  apiVersion: string;
  outputMode?: 'answerSynthesis' | 'extractiveData';
  retrievalReasoningEffort?: 'low' | 'medium' | 'high';
  synthesisModel?: string;
}

export const MICROSOFT_IQ_MIN_SKU = 'basic';
export const SEARCH_API_VERSION = '2025-11-01-preview';
```

Both constants encode a blocker that cost real time:

- **`MICROSOFT_IQ_MIN_SKU = 'basic'`** - knowledge bases on a Free-tier search service never appear in
  the Copilot Studio picker, even when they answer correctly over REST. A Free-tier service
  (`raybot-foundryiq-search`, Australia East) was provisioned first and had to be discarded.
- **`SEARCH_API_VERSION = '2025-11-01-preview'`** - the only api-version that exposes the
  `/knowledgeBases` surface at all. Any other version 404s.

Raybot's binding:

```ts
{
  knowledgeBase: 'raybot-kb',
  searchService: 'darbotlm',
  region: 'centralus',
  sku: 'basic',
  knowledgeSources: ['ray-docs-web'],
  apiVersion: '2025-11-01-preview',
  outputMode: 'answerSynthesis',
  retrievalReasoningEffort: 'low',
  synthesisModel: 'gpt-4.1',
  confidence: 'CONFIRMED',
}
```

Full provisioning sequence at [Phase 3](../runbook/phase-3-foundry-iq.mdx).

## Related

- [Skills](./skills.md)
- [Knowledge](./knowledge.md)
- [Workflow](./workflow.md)
