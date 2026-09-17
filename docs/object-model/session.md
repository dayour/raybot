---
id: session
title: Session forensics types
sidebar_label: Session
---

# Session forensics types

The `session` module models what could be recovered about how this repository reached its current
state. The narrative is at [Session forensics](../session/index.md); this page covers the types.

## Two stores

```ts
export type SessionStoreKind = 'local' | 'cloud';
```

Copilot CLI persists two parallel session stores, and **neither alone is complete**, which is why the
kind is modelled rather than assumed:

| `store` | Backing | Dialect | Scope | Tables not in the other |
| --- | --- | --- | --- | --- |
| `local` | SQLite at `~/.copilot/session-store.db` | SQLite | This machine only | FTS5 `search_index`, `assistant_usage_events` |
| `cloud` | DuckDB-backed | DuckDB | Across machines | `events`, `tool_requests`, `attachments` |

The dialect difference is not cosmetic. `ILIKE`, `date_diff`, and `now() - INTERVAL '7 days'` work
against the cloud store and fail against the local one; full-text search via `MATCH` works only
locally. A query written for one store does not run against the other. See
[Store queries](../session/store-queries.md).

## SessionRecord

```ts
export interface SessionRecord extends Evidenced {
  id: string;
  mirroredId?: string;
  store: SessionStoreKind;
  cwd: string;
  createdAt: IsoInstant;
  updatedAt?: IsoInstant;
  summary?: string;
  toolCalls?: Record<string, number>;
  outcome?: string;
}
```

`mirroredId` exists because **the same session carries different ids in the two stores.** Correlating
them by id fails. They correlate on `cwd` plus `createdAt`, and `mirroredId` records the pairing once
it has been established, so the work is not repeated.

`cwd` is the primary filter for "did this session touch the repository", and it is more reliable than
searching transcripts - a session that ran in `C:\0DEV0\raybot` touched Raybot whether or not it ever
said the word.

`toolCalls` is a `Record<string, number>` rather than a union of known tool names because the tool
set changes between CLI versions. A closed union would reject a session from a newer client.

`outcome` is a one-line statement of what the session actually accomplished, written after reading
the transcript. It is the field that distinguishes a session that did work from one that merely ran.

## The three recovered sessions

```ts
export const RAYBOT_SESSIONS: SessionRecord[];
```

| `id` | `cwd` | Outcome |
| --- | --- | --- |
| `a38c8e08` (cloud `c9366683`) | `C:\Users\dayour` | Misfire. Four PowerShell probes hunting a `roo` folder that does not exist. |
| `d106b6f4` (cloud `06aa7bb9`) | `C:\0DEV0\raybot` | Screenshot reorganisation. Produced commit `7698a0d`. |
| `75113b80` | `...\Clawpilot\raybot-runbook` | Review and reorganisation from the Clawpilot working copy. |

The misfire is retained deliberately. A forensic record that lists only the sessions that did
something implies the search was targeted; listing the misfire shows the search was exhaustive over
the window.

The third session is the trap. Its `cwd` is the same path the legacy runbook's Step 0 points at, which
makes it look like the Coral build. Its tool-call profile says otherwise - 94 `view`, 37 `powershell`,
19 `session_store_sql`, and zero browser automation. It is a review session that happened to run in
the same directory.

**The Coral build itself is absent from both stores.** It ran under a different client through
Playwright MCP and never wrote a Copilot CLI transcript. The runbook prose, the captures, and the
audit JSON are the only surviving record. See [Provenance](../session/provenance.md).

## SessionCommand

```ts
export interface SessionCommand {
  ordinal: number;
  command: string;
  intent: string;
  succeeded: boolean;
  failureReason?: string;
  result?: string;
}
```

`intent` is separate from `command` because a recovered shell command without stated intent is
archaeology. The command says what ran; `intent` says what it was for.

`succeeded` is required, and `failureReason` is populated when it is `false`. This is the same
pattern as `PublishChannel.blockedReason` and `EvalRun.runtimeLimitation`: **failures are first-class
records, not absences.**

## SCREENSHOT_MOVE_COMMANDS

```ts
export const SCREENSHOT_MOVE_COMMANDS: SessionCommand[];
```

The nine commands of session `d106b6f4`, the screenshot reorganisation that produced commit
`7698a0d` - 71 files changed, 59 insertions, 59 deletions.

Command one is preserved deliberately, and it is the only failure in the set:

```powershell
Get-ChildItem -Path . -MaxDepth 1 -Filter "*.png" | ForEach-Object { Move-Item $_.FullName screenshots\ }
```

`Get-ChildItem` has no `-MaxDepth` parameter. `-Depth` exists but applies only together with
`-Recurse`, so it cannot express "this directory only". The working form compares `DirectoryName`
against the current path instead:

```powershell
Get-ChildItem -Path . -Filter "*.png" |
  Where-Object { $_.DirectoryName -eq (Get-Location).Path } |
  ForEach-Object { Move-Item $_.FullName screenshots\ }
```

That moved 66 files. Keeping the failure in the record means the next reader does not rediscover the
same constraint.

Full annotated listing at [Command reference](../session/command-reference.md).

## ScreenshotCapture

```ts
export interface ScreenshotCapture {
  file: string;
  phase: string;
  caption: string;
  order: number;
}
```

`file` is repository-relative **including its folder prefix**, which matters because the captures live
in two different directories after the reorganisation: `screenshots/` for the underscored
phase-numbered set, `captures-2026-06-17/annotated/` for the hyphenated re-audit set. A bare filename
is ambiguous between them.

`order` is explicit rather than derived from the filename. The numeric prefixes are per-phase and
restart, so lexical sorting interleaves phases.

## RAYBOT_COMMITS

```ts
export const RAYBOT_COMMITS = [
  { sha: '16e4d1a', author: 'darbotlabs', summary: 'Initial seed. 206 files, 71,796 insertions, committed wholesale with no incremental history.' },
  { sha: '7698a0d', author: 'dayour',     summary: 'Move all screenshots to screenshots/ and update references. 71 files changed.' },
] as const;
```

Two commits. The first is a wholesale seed with no incremental history, which is itself the evidence
that the build happened somewhere else and was copied in.

## Related

- [Session forensics](../session/index.md)
- [Command reference](../session/command-reference.md)
- [Provenance](../session/provenance.md)
- [Store queries](../session/store-queries.md)
