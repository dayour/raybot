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
is dated September. The session exists and has been inspected.

The corrected finding is narrower but still holds: session `75113b80` is a **review** of the runbook,
not the build that produced it. Its tool profile is dominated by `view` and read-only
`session_store_sql`, with only three `apply_patch` calls. There is no Playwright activity, no browser
automation, and no Copilot Studio navigation anywhere in it.

## The build transcript does not exist

The evidence:

1. No session in either store references Playwright, Coral, or Copilot Studio in the relevant window.
2. The local FTS `search_index` table, queried with `MATCH 'raybot'`, returns two rows, both unrelated
   Azure resource-group work.
3. `command-history-state.json` retains only the last 50 prompts. None of them is a build prompt.
4. `RUNBOOK.legacy.md` Step 0 points at `...\Clawpilot\raybot-runbook` created via
   `filesystem-create_directory` — an MCP filesystem tool, not a Copilot CLI shell call. The build
   ran under a **different client**.
5. The repository arrived whole. Commit `16e4d1a` (darbotlabs, 2026-06-17 15:09 +0100) added all 206
   files in one shot: 71,796 insertions, no prior history.

So the surviving record of the Coral build is the runbook prose, the 67 screenshots, and the audit
JSON. There is no replayable transcript. That is precisely why the runbook records the exact
`data-testid` of every control it touched — it was written to be the transcript.

## The nine recovered commands

From session `d106b6f4`, in order. The prompt that started it:

> move all the screenshots from C:\0DEV0\raybot to C:\0DEV0\raybot\screenshots folder and set all
> relevant scripts and docs within raybot to use the screenshots folder going forward

**1. First move attempt — failed.**

```powershell
Get-ChildItem -Path . -MaxDepth 1 -Filter "*.png" | ForEach-Object { Move-Item $_.FullName "screenshots\" }
```

`-MaxDepth` is not a valid parameter on `Get-ChildItem`. It exists on `Get-ChildItem -Recurse` only
in PowerShell 7 via `-Depth`, and never as `-MaxDepth`.

**2. Retry with a directory filter — succeeded, 66 files moved.**

```powershell
Get-ChildItem -Path . -Filter "*.png" | Where-Object { $_.DirectoryName -eq (Get-Location).Path } | ForEach-Object { Move-Item $_.FullName "screenshots\" }
```

**3. Rewrite Phase 1 through 6 references in `RUNBOOK.md`.**

Regex `(\d{2}_[a-z][\w-]+\.png)` replaced with `screenshots/$1`.

**4. Rewrite Phase 7 references in `RUNBOOK.md`.**

Regex `(\d{2}-[\w-]+\.png)` replaced with `captures-2026-06-17/annotated/$1`.

**5. Same two rewrites on `RUNBOOK.legacy.md`**, plus prefixing for `raybot-logo*.png` and
`raybot-icon-teams-white.png`.

**6. Verify no PNGs remain in the repository root.**

**7. Inspect the working tree.**

```powershell
git --no-pager status --short
```

**8. Stage everything, confirming rename detection.**

```powershell
git --no-pager add -A
```

Git correctly detected all 66 moves as renames rather than delete-plus-add pairs, which is why the
resulting commit is 59 insertions and 59 deletions rather than thousands.

**9. Commit.**

```powershell
git --no-pager commit -m "Move all screenshots to screenshots/ folder and update references..."
```

Result: commit `7698a0d`, 71 files changed, 59 insertions, 59 deletions.

## Store query notes

For anyone reproducing this analysis:

- The `sessions` table is fast and safe to query broadly.
- The `tool_requests` table **times out at 60 seconds** even with `LIMIT 12` and `substr()` applied
  to the arguments column. Do not try to recover tool arguments from it. The nine commands above were
  reconstructed from turn content, not from `tool_requests`.
- Always filter on time. `turns` and `events` are large enough that an unfiltered `ILIKE` scan will
  time out.
- Set the time window from the artifact, not from intuition. The correction described above happened
  because the window was set from the commit date rather than from the session date.
