---
id: intro
title: Raybot
sidebar_label: Introduction
sidebar_position: 1
slug: /
---

# Raybot

Raybot is a Ray and Ray-clusters expert agent, built end to end inside Microsoft Copilot Studio's
next-generation runtime — codename **Coral** — using nothing but browser automation.

This site is the complete record of that build: the runbook that produced the agent, the
ground-truth UI and API audit of the runtime it was built in, a typed object model and SDK derived
from both, the recovered terminal history, and all 67 screenshots.

## What makes this different

Most agent documentation describes what a product is supposed to do. This one describes what it
actually did, on a specific tenant, on specific dates, with a screenshot for every assertion.

- **Every step is UI-only.** The agent was created, configured, published, and tested through
  Playwright MCP driving a real browser. The one exception is Phase 3, which needs Azure CLI and the
  Azure AI Search REST surface because no UI exists for it yet.
- **Every step was captured.** A screenshot was taken after every action, not after every milestone.
  That discipline is what surfaced the silent HTTP 500s and the tenant consent flag that the maker UI
  never explains.
- **Every claim carries a confidence level.** The audit distinguishes `CONFIRMED` (observed live)
  from `SOURCE-INSPECTED` (read from code) and `UNCONFIRMED` (inferred). This audit is `CONFIRMED`
  throughout.
- **The failures are documented as carefully as the successes.** Raybot's Teams channel never
  reached the tenant catalog and its evaluation scored zero percent. Both are explained, with the
  network evidence that proves neither is an agent-quality problem.

## The agent

| Property | Value |
| --- | --- |
| Agent ID | `4de4ada9-ad61-4c22-a0d0-a0bd1c189f4e` |
| Schema name | `Default_Raybot_vyN1Rz` |
| Environment | Cypherdyne, `Default-6b104499-c49f-45dc-b3a2-df95efd6eeb4` |
| Model | Claude Sonnet 4.6 |
| Knowledge | `https://docs.ray.io` |
| Skill | `ray-cluster-troubleshooter` |
| Microsoft IQ | Foundry IQ knowledge base `raybot-kb` |
| Memory | Enabled |
| Built by | `darbot@timelarp.com` |
| Re-audited by | `dayour@microsoft.com` |

## The audit

| Measure | Count |
| --- | --- |
| Surfaces audited | 16 |
| Elements catalogued | 1,627 |
| Interactive elements | 1,115 |
| Elements carrying a test id | 983 |
| Unique test ids | 177 |
| Test ids shared across surfaces | 76 |
| Interactive elements with no derivable label | 228 |
| Network requests observed | 1,249 |
| Functional requests classified | 611 |
| API endpoints mapped | 57 |
| Screenshots | 67 |

## Where to start

- If you want to **reproduce the build**, start at the [Runbook](./runbook/index.md).
- If you want to **understand the runtime**, start at the [Coral schema](./coral-schema/index.mdx).
- If you want to **write code against it**, start at the [Object model](./object-model/index.md).
- If you want to **see it**, start at the [Gallery](./screenshots/gallery.mdx).
- If you want to **know how this record was reconstructed**, start at
  [Session forensics](./session/index.md).

## Honesty notes

These qualifications apply to everything on this site.

1. `isInteractive` in the element audit is **computed** from native control type, `href`, ARIA role,
   `tabindex`, and `contenteditable`. It is independent of whether an element carries a
   `data-testid`. An element can be interactive with no test id, and can carry a test id while being
   inert.
2. `derivedLabel` is a **heuristic**, not a strict accessible-name computation. The heuristic used
   for each row is recorded in `labelSource`. Treat the 228 label gaps as a lower bound on
   accessibility work, not as an audit finding.
3. The API map is **observed network activity**, not a published contract. Endpoint names, shapes,
   and behaviours were read off the wire. They can change without notice.
4. This record covers a **preview runtime on one tenant**. Tenant policy materially changed outcomes:
   the Teams blocker is a tenant consent gate, and the Microsoft IQ blocker is an Azure SKU gate.
   Neither is universal.
5. There are **no emojis anywhere on this site**, by convention. Status is conveyed by words and
   badges.
