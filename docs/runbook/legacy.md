---
id: legacy
title: The legacy runbook
sidebar_label: Legacy runbook
---

# The legacy runbook

`RUNBOOK.legacy.md` is the original narrative, written as twenty sequential steps before the
seven-phase rewrite. It was preserved rather than deleted because it holds detail the rewrite
dropped.

Where the two disagree: `RUNBOOK.md` is authoritative on **what the runtime does**.
`RUNBOOK.legacy.md` is authoritative on **what the original session did**.

## What only the legacy version records

### Step 0 — the working directory

```text
MCP: filesystem-create_directory
path: ...\Clawpilot\raybot-runbook
```

This is the single most important line in the legacy document, because it is the only surviving
pointer to where the build actually ran.

That directory **no longer exists** on any local drive. It is also not the directory the current
repository lives in. See [Provenance](../session/provenance.md) for what this implies about the
recoverability of the build transcript.

### The exact entry URL

```text
https://copilotstudio.preview.microsoft.com/environments/Default-6b104499-c49f-45dc-b3a2-df95efd6eeb4/home
```

Note the `preview` subdomain. Coral was reached through the preview host, not the production one.
The rewrite says "Copilot Studio home" and drops the URL.

### The intermediate route

Clicking `suggestion-agent` lands on `/agents/new`. The rewrite records the destination as "the
unified Build designer" without the route.

### The original Microsoft IQ decision

The legacy document records Microsoft IQ as *"Not enabled (preview/cost)"* at the time the right rail
was first catalogued. Phase 3 in the rewrite is the later work that reversed that decision and
actually built the knowledge base. The legacy text preserves the intermediate state, which is why
the two documents appear to contradict each other on this point.

### The Evaluate field catalogue

The legacy version carries the fuller specification:

| Detail | Value |
| --- | --- |
| CSV template | Downloaded via fwlink 2335991 |
| Template schema | `conversationNumber,question,response` |
| Upload limit | 5 MB |
| Conversation pairs | Maximum 6 per conversation |
| Reference field | Optional, `maxLength` 1000 |
| Quick set | Auto-generates 10 cases |

### The verbose Teams narrative

Lines 172 through 237 of the legacy document are a far longer account of the Teams failure than the
rewrite's Phase 6. It walks the full sequence of attempts, including the dead classic deeplinks, the
several search surfaces that do not search apps, and the reasoning that isolated ACP consent as the
root cause rather than a maker error.

If you are debugging a similar Teams blocker, read the legacy narrative rather than the condensed
phase.

## Screenshot naming

The legacy document references an older naming scheme, which the crosswalk in `screenshot-map.md`
resolves.

| Legacy | Current |
| --- | --- |
| `01-agent-named-raybot.png` | `01_build_agent_create.png` |
| `02-instructions.png` | `02_build_instructions.png` |
| `03-saved.png` | `03_build_saved.png` |
| `04-MicrosoftIQ.png` | superseded by `18_iq_add-dialog.png` |
| `05-knowledge-dialog.png` | `05_knowledge_add-dialog.png` |
| `09-skills-dialog.png` | `15_skills_add-dialog.png` |

The crosswalk covers 41 curated captures and 35 superseded ones. See
Screenshot map.

## Why keep it

Three reasons.

1. **Provenance.** Step 0 is the only record of the original working directory, and the only reason
   we know the build did not run where the repository now lives.
2. **Detail loss is real.** The rewrite is better organised and materially less complete on the
   Evaluate schema and the Teams diagnosis.
3. **It shows the decision sequence.** The legacy text captures Microsoft IQ as not enabled; the
   rewrite captures it as built and verified. Reading both shows the order in which conclusions were
   reached, which a clean final document deliberately hides.
