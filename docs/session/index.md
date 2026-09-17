---
id: index
title: Session forensics
sidebar_label: Overview
---

# Session forensics

What the Copilot CLI session stores actually retain about this project, the terminal commands that
were recovered, and why the original build transcript does not exist.

## The stores that were searched

| Store | Location | Notes |
| --- | --- | --- |
| Local session store | `~/.copilot/session-store.db` | 23 MB plus a 4.5 MB WAL |
| Local data store | `~/.copilot/data.db` | |
| Command history | `~/.copilot/command-history-state.json` | Retains only the last 50 prompts |
| Chat transcripts | `~/.copilot/chats/` | |
| Sidebar state | `~/.copilot/sidebar-sessions-state/` | |
| Logs | `~/.copilot/logs/` | |
| Cloud session store | Queried via `session_store_sql` | `sessions`, `turns`, `session_files`, `session_refs`, `events`, `tool_requests` |

## Pages in this section

| Page | Contents |
| --- | --- |
| [Command reference](./command-reference.md) | The nine recovered PowerShell commands, fully annotated |
| [Store queries](./store-queries.md) | Working queries against both stores, with the performance rules |
| [Provenance](./provenance.md) | The full evidence chain, including the retracted finding |

## Sessions that touched this project

Three, and only three.

| Session | Working directory | Created | Character |
| --- | --- | --- | --- |
| `d106b6f4-2782-4f83-9ff2-e46f8c07137f` | `C:\0DEV0\raybot` | 2026-06-17 16:24:49Z | The screenshot move. 49 tool calls. Produced commit `7698a0d`. |
| `75113b80-f1b6-45af-9551-05aff22e030f` | `...\Clawpilot\raybot-runbook` | 2026-09-16 | A **review** session, not the build. 94 view, 37 powershell, 19 session_store_sql. |
| `7cb46a30-fc17-4277-aa1c-f7e289f94c8f` | `C:\0DEV0\raybot` | 2026-09-17 | This session: the wiki and object model. |

A fourth session, `a38c8e08`, was created one second before `d106b6f4` in `C:\Users\dayour` and is a
misfire — four PowerShell probes hunting a `roo` folder that does not exist. It never touched the
repository.

## Correction

An earlier pass through this material reported that **no** session existed at the
`Clawpilot\raybot-runbook` path. That was wrong. The search window was set to June, and the session
is dated September.

The corrected finding is narrower but still holds: session `75113b80` is a **review** of the runbook,
not the build that produced it. The full retraction, and the rule it produced, are on the
[provenance](./provenance.md) page.

## The build transcript does not exist

Five independent evidence points support this, the strongest being that `RUNBOOK.legacy.md` Step 0
creates its working directory via `filesystem-create_directory` — an MCP filesystem tool, not a
Copilot CLI shell call. **The build ran under a different client**, whose transcripts were never in
these stores.

The surviving record of the Coral build is the runbook prose, the screenshots, and the audit JSON.
There is no replayable transcript. That is precisely why the runbook records the exact `data-testid`
of every control it touched — it was written to be the transcript.

The full chain is on [provenance](./provenance.md).

## The nine recovered commands

From session `d106b6f4`, in order. The prompt that started it:

> move all the screenshots from C:\0DEV0\raybot to C:\0DEV0\raybot\screenshots folder and set all
> relevant scripts and docs within raybot to use the screenshots folder going forward

| # | Command | Outcome |
| --- | --- | --- |
| 1 | `Get-ChildItem -Path . -MaxDepth 1 -Filter "*.png" \| ...` | Failed — `-MaxDepth` is not a valid parameter |
| 2 | Retry with `Where-Object { $_.DirectoryName -eq (Get-Location).Path }` | Moved 66 files |
| 3 | Regex `(\d{2}_[a-z][\w-]+\.png)` to `screenshots/$1` on `RUNBOOK.md` | Phase 1-6 references |
| 4 | Regex `(\d{2}-[\w-]+\.png)` to `captures-2026-06-17/annotated/$1` | Phase 7 references |
| 5 | Both rewrites on `RUNBOOK.legacy.md`, plus brand-asset prefixing | Legacy narrative |
| 6 | Verify no PNGs remain in the repository root | Confirmed |
| 7 | `git --no-pager status --short` | Working-tree inspection |
| 8 | `git --no-pager add -A` | Rename detection confirmed |
| 9 | `git --no-pager commit -m "Move all screenshots..."` | Commit `7698a0d` |

Result: 71 files changed, 59 insertions, 59 deletions. Git detected all 66 moves as renames rather
than delete-plus-add pairs, which is why the commit is 118 lines rather than tens of thousands.

Each command is annotated in full on the [command reference](./command-reference.md) page.

## Store query notes

Three rules govern reproducing this analysis:

- `sessions` is fast. `tool_requests` **times out at 60 seconds** even with `LIMIT 12` and `substr()`
  — the nine commands were reconstructed from turn content, not from it.
- Always filter `turns` and `events` by time. Never ILIKE-scan unfiltered.
- **Set the time window from the artifact, not from intuition.** The correction above happened
  because the window was set from the commit date rather than the session date.

Every working query is on [store queries](./store-queries.md).
