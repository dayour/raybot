---
id: provenance
title: Provenance
sidebar_label: Provenance
---

# Provenance

The full chain of evidence that the original Coral build transcript does not exist, including the
finding that had to be retracted along the way.

**Conclusion first: there is no replayable transcript of the Raybot build.** The surviving record is
the runbook prose, 163 screenshots, and the audit JSON.

## Why this matters

The runbook makes specific, checkable claims: that a particular `data-testid` was clicked, that a
512 px PNG was rejected at 195.8 KB, that `msteams/app/status` returned HTTP 500.

If a transcript existed, every one of those claims would be independently verifiable. Without one,
they rest on the prose and the screenshots.

That is a weaker evidentiary position, and it is better to state it than to let the runbook's
precision imply a rigour the provenance does not support.

## Sessions that touched this project

Three, and only three.

| Session | Working directory | Created | Character |
| --- | --- | --- | --- |
| `d106b6f4-2782-4f83-9ff2-e46f8c07137f` | `C:\0DEV0\raybot` | 2026-06-17 16:24:49Z | The screenshot move. 49 tool calls. Produced commit `7698a0d`. |
| `75113b80-f1b6-45af-9551-05aff22e030f` | `...\Clawpilot\raybot-runbook` | 2026-09-16 | A review session, not the build. |
| `7cb46a30-fc17-4277-aa1c-f7e289f94c8f` | `C:\0DEV0\raybot` | 2026-09-17 | This session: the wiki and object model. |

A fourth, `a38c8e08`, was created **one second before** `d106b6f4` in `C:\Users\dayour`. It is a
misfire — four PowerShell probes hunting a `roo` folder that does not exist — and it never touched
the repository.

It is recorded because the claim being made is "exactly three sessions touched this project".
Omitting an adjacent session that did not qualify would make that claim unfalsifiable.

## The retraction

**An earlier pass reported that no session existed at the `Clawpilot\raybot-runbook` path. That was
wrong.**

The cause was mechanical. The search window had been set from the **commit date** — the repository
was seeded 2026-06-17 — while the session in question is dated **2026-09-16**. The query was
syntactically fine and returned zero rows correctly, for a window that did not contain the session.

Session `75113b80-f1b6-45af-9551-05aff22e030f` exists and has been inspected.

**The corrected finding is narrower and still supports the conclusion.** Its tool profile:

| Tool | Calls |
| --- | --- |
| `view` | 94 |
| `powershell` | 37 |
| `session_store_sql` | 19 |
| `apply_patch` | 3 |

94 reads to 3 writes. No Playwright. No browser automation. No Copilot Studio navigation. This is a
session reading and analysing a runbook that already existed, not one producing it.

The retraction is kept visible rather than quietly corrected, for two reasons. It is the origin of
the most useful rule on the [store queries](./store-queries.md) page — set the window from the
artifact, not from intuition. And a provenance document that silently revises its own findings is
not doing its job.

## The five evidence points

**1. No session in either store references the build tooling.**

Neither store contains a session referencing Playwright, Coral, or Copilot Studio in the relevant
window. Both stores were queried, with the window widened well past the seed date after the
retraction above.

**2. Full-text search returns nothing relevant.**

The local store's FTS5 `search_index`, queried with `MATCH 'raybot'`, returns exactly two rows. Both
are unrelated Azure resource-group work.

An eight-hour browser-automation session producing 163 screenshots would not be invisible to a
full-text index over its own transcript.

**3. Command history holds nothing.**

`~/.copilot/command-history-state.json` retains the last 50 prompts. None is a build prompt. This is
weak evidence on its own — 50 is a small window — and it is listed for completeness rather than
weight.

**4. The build ran under a different client.**

This is the strongest point. `RUNBOOK.legacy.md` Step 0 records the working directory being created
at `...\Clawpilot\raybot-runbook` via **`filesystem-create_directory`**.

That is an **MCP filesystem tool**, not a Copilot CLI shell call. Copilot CLI creates directories
through its shell. The tool name is direct evidence that the build ran under a different host
application, whose transcripts are not in the Copilot CLI stores and were never going to be.

The directory itself no longer exists on C:, D:, or E:.

**5. The repository arrived whole.**

Commit `16e4d1a`, darbotlabs, 2026-06-17 15:09 +0100: **206 files, 71,796 insertions, no parent**.

The repository was created from artifacts that already existed elsewhere. There is no incremental
history because the work was not done in this repository.

## What the absence does not mean

**It does not mean the build did not happen.** 163 screenshots, a live agent ID, a working Foundry IQ
knowledge base, and 1,249 captured network requests are substantial physical evidence.

**It does not mean the runbook is unreliable.** It means the runbook is the primary source rather
than a secondary one. Its claims stand on their own precision and on the screenshots, not on a
transcript that could corroborate them.

That is exactly why the runbook records the `data-testid` of every control it touched. It was written
to **be** the transcript, by someone who knew there would not be another.

## The compensating controls

The audit exists because the transcript does not.

| Control | What it independently establishes |
| --- | --- |
| 163 screenshots | Visual state at each step, timestamped |
| 1,627 element rows | The DOM as it actually was, per surface |
| 1,249 captured requests | Network behaviour, including the failures |
| `CONFIRMED` grading | Every assertion tagged by evidence class |
| Per-testid citation in prose | Each runbook step names its target control |

None of these is a transcript. Together they make most of the runbook's factual claims checkable
against something other than the prose, which is the practical purpose a transcript would have
served.

## Reproducing this analysis

Every query used is on the [store queries](./store-queries.md) page. The one rule that matters:

**Set the time window from the artifact under investigation.** A bounded negative result is only as
good as its bound, and the bound is the easiest thing in the whole analysis to get wrong.
