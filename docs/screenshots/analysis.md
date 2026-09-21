---
id: analysis
title: Capture analysis
sidebar_label: Capture analysis
---

# Capture analysis

What the 95 captures collectively prove, which ones are load-bearing evidence for a documented
constraint, and which are context only.

Because [no build transcript exists](../session/provenance.md), the screenshots carry more
evidentiary weight here than they would in a project that had one.

## Distribution by phase

| Phase | Captures | Share |
| --- | --- | --- |
| workflow | 17 | 18 percent |
| showcase | 17 | 18 percent |
| wf-real | 11 | 12 percent |
| evaluate | 8 | 8 percent |
| settings | 7 | 7 percent |
| tools | 6 | 6 percent |
| iq | 5 | 5 percent |
| build | 4 | 4 percent |
| knowledge | 4 | 4 percent |
| runtime | 4 | 4 percent |
| skills | 3 | 3 percent |
| teams | 3 | 3 percent |
| publish | 2 | 2 percent |
| connected | 1 | 1 percent |
| memory | 1 | 1 percent |
| monitor | 1 | 1 percent |
| preview | 1 | 1 percent |
| **Total** | **95** | |

Workflow work dominates: `workflow`, `showcase`, and `wf-real` together account
for 45 of 95 captures, nearly half the corpus. All three postdate the original
Raybot build. The agent itself - the nominal subject of this repository - is
documented in roughly thirty frames.

That imbalance is real and worth stating plainly. The designer turned out to be
the more interesting surface, and the capture record followed the interest rather
than the original scope.

## Why workflow is 17 of 95

The workflow designer accounts for a quarter of all captures despite being a **single surface**
discovered during the Phase 7 re-audit, not part of the original build.

The reason is the capture method. The designer exposes 13 node types, each only visible after opening
the add-step menu and selecting it. There is no view that shows all 13 at once, so each required its
own navigation, its own wait, and its own screenshot:

```ts
await page.goto('/flows/new/canvas');
await page.waitForTimeout(3500);
await page.getByRole('button', { name: 'Add a step after Start' }).click();
await page.getByRole('button', { name: 'Select action: Loop' }).click();
// screenshot
```

13 node types plus 4 trigger types is 17. The count is a direct function of the enumeration, not of
the surface's importance.

This is a useful general observation: **capture counts measure enumeration cost, not significance.**
Memory has one capture and is a shipped feature. Workflow has 17 and was a survey.

## Load-bearing captures

These prove a documented constraint. Remove the capture and the claim becomes assertion.

| Constraint | Proving captures | What they show |
| --- | --- | --- |
| Icon limit is 100 KB | Rejection at 195.8 KB, acceptance at 53.8 KB | Two outcomes bracketing the ceiling |
| Foundry IQ needs Basic tier | `20_iq_select-kb.png` | The picker empty against a Free-tier service |
| Evaluation is a runtime limitation | `37_evaluate_results.png` plus `22_iq_verified-preview.png` | 0 percent alongside correct grounding |
| Teams is blocked by tenant policy | `40_teams_publish-acp-blocked.png` | The ACP consent failure |
| Teams absence is real | `41_teams_search-no-result.png` | Raybot missing from "Built for your org" |
| Publish is inline | `32_publish_inline.png` | No dialog, command-bar state change only |
| Knowledge grounds correctly | `22_iq_verified-preview.png` | Four `docs.ray.io` citations in Preview |

### The icon pair is the clearest example

Two captures — one rejection at 195.8 KB, one acceptance at 53.8 KB — establish a 100 KB ceiling that
appears in no documentation and in no error message.

Neither capture alone is sufficient. The rejection alone proves only that *some* limit exists below
195.8 KB. The acceptance alone proves only that 53.8 KB is under it. Together they bracket the
constraint, and the round number between them makes 100 KB the obvious ceiling.

This is what makes the pair evidence rather than anecdote, and it is worth imitating: when
establishing an undocumented limit, capture both sides of it.

### The evaluation pair is the most important

`37_evaluate_results.png` shows 0 percent with 6 Fail. On its own it reads as a broken agent.

`22_iq_verified-preview.png` shows the same agent grounding correctly with four citations.

Held together, the two captures relocate the fault from the agent to the evaluation runtime. Neither
capture supports that conclusion alone. The conclusion lives in the pair.

This is the single most consequential inference in the whole project, and it rests entirely on two
screenshots taken minutes apart in the same session.

## Context-only captures

These establish the environment rather than prove a constraint: navigation shots, loading states,
tab surveys, intermediate form states.

The 35 superseded originals on the [screenshot map](./map.md) are almost entirely this category —
`38-teams-launcher.png`, `41-teams-loaded.png`, `42-teams-home.png`, `43-teams-tab2.png` are a
navigation trail, not findings.

They were kept rather than deleted for one reason: **they prove the navigation happened.** The Teams
claim is that Raybot is absent from a store the operator actually reached and searched. The trail of
context shots is what distinguishes that from not having looked properly.

## What the captures do not prove

**They do not prove the runbook's `data-testid` claims.** A screenshot shows rendered pixels, not
attributes. The test id claims are corroborated by the
[Coral schema audit](../coral-schema/index.mdx), which walked the DOM directly — a separate
evidence source with 1,627 element rows.

**They do not prove timing.** Nothing in a PNG establishes when it was taken beyond file metadata,
which is weak evidence.

**They do not prove the absence of anything.** `41_teams_search-no-result.png` shows one search
returning no Raybot. It does not prove Raybot was unreachable by every path — that conclusion needs
`store-provider-app:co:tenantapps` listing only MeetingAssist and NanoBot, which came from network
inspection rather than a capture.

Screenshots are good at proving that something appeared. They are poor at proving that nothing did.

## Capture discipline

Every action produced a screenshot. Not every interesting action — every action.

That is why 35 of 76 originals were ultimately superseded: most captures document a step that turned
out not to matter. The 46 percent discard rate is the cost of the method, and it is the right trade.

The alternative — capturing selectively, at moments judged significant — fails precisely at the
moments that turn out to matter later. The icon rejection was not obviously significant when it
happened. It became the only evidence for a documented constraint.

You cannot know in advance which capture will be load-bearing. Capture everything and discard
afterwards.
