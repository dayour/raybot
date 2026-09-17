---
id: knowledge
title: Knowledge sources
sidebar_label: Knowledge
---

# Knowledge sources

```ts
export type KnowledgeSourceKind =
  | 'publicWebsite'
  | 'sharePoint'
  | 'dataverse'
  | 'file'
  | 'enterpriseData'
  | 'microsoftIQ';

export interface KnowledgeSource extends Evidenced {
  kind: KnowledgeSourceKind;
  name: string;
  url?: string;
  description?: string;
}
```

`KnowledgeSourceKind` is a closed union rather than a `string` because the add-knowledge flow presents
a fixed set of cards. The set was enumerated by opening `dv-knowledge-add-button` and reading every
card in the dialog, captured in [Phase 2](../runbook/phase-2-right-rail.mdx).

## The six kinds

| Kind | Card | `url` | Notes |
| --- | --- | --- | --- |
| `publicWebsite` | Public website | Required | Crawls a public URL. What Raybot uses. |
| `sharePoint` | SharePoint | Required | Site or document library URL. |
| `dataverse` | Dataverse | Not used | Table picker in the current environment. |
| `file` | Files | Not used | Uploaded documents. |
| `enterpriseData` | Enterprise data | Not used | Connector-backed sources. |
| `microsoftIQ` | Microsoft IQ | Not used | Bound knowledge base, modelled separately as `MicrosoftIQBinding`. |

`microsoftIQ` appears in the union for completeness, but a Microsoft IQ binding carries far more state
than a `KnowledgeSource` can express - service, region, SKU, api-version, output mode, synthesis
model. It therefore has its own interface and its own array on `AgentConfiguration`. A binding should
be represented as a `MicrosoftIQBinding`, not as a `KnowledgeSource` with `kind: 'microsoftIQ'`.

## Raybot's source

```ts
{
  kind: 'publicWebsite',
  name: 'Ray documentation',
  url: 'https://docs.ray.io',
  confidence: 'CONFIRMED',
}
```

One source, pointed at the official Ray documentation root. This is the source that produced the four
live citations in Preview during [Phase 5](../runbook/phase-5-publish-evaluate.mdx) - the strongest
single piece of evidence that the agent was grounding correctly, and the reason the zero-percent
evaluation score is attributed to the evaluation runtime rather than to the agent.

## description is orchestrator input, not documentation

The `description` field is easy to misread as a human-facing label. It is not. The generative
orchestrator reads it when deciding whether a given user turn warrants searching this source.

A description of `Ray docs` gives the orchestrator almost nothing to match on. A description that
names the topics the source covers - autoscaling, placement groups, the object store, RLlib - gives it
something to route against. The same rule applies to `AgentTool.description`; see
[Tools](./tools.md).

## What the model does not capture

The crawl is asynchronous and has its own lifecycle - queued, crawling, indexed, failed - and a public
website source can sit in a partially-indexed state for some time after the card reports success. The
model has no status field, because the audit never captured a source in any state other than settled.
Adding a speculative `status` union would be an `UNCONFIRMED` claim in a model whose whole premise is
that claims are graded.

If you need crawl status, read it from the Dataverse row, not from this model.

## Related

- [Microsoft IQ](./tools.md#microsoft-iq-is-not-a-tool) - why the IQ binding sits apart
- [Phase 3: Foundry IQ](../runbook/phase-3-foundry-iq.mdx) - the Basic-tier constraint
- [Constraints](../reference/constraints.md)
