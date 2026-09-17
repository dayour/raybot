/**
 * The session-forensics model.
 *
 * Copilot CLI persists two parallel session stores. Reconstructing how the
 * Raybot repository reached its current state means reading both, because
 * neither alone is complete.
 */

import type { Evidenced, IsoInstant } from './common.js';

/**
 * Which store a record came from.
 *
 * - `local`  SQLite at `~/.copilot/session-store.db`, queried with SQLite
 *            syntax, holds only this machine's sessions, and exposes the FTS5
 *            `search_index` virtual table plus `assistant_usage_events`.
 * - `cloud`  DuckDB-backed, queried with DuckDB syntax, spans machines, and
 *            adds the `events`, `tool_requests`, and `attachments` tables.
 */
export type SessionStoreKind = 'local' | 'cloud';

/** A single recorded CLI session. */
export interface SessionRecord extends Evidenced {
  id: string;
  /** Matching id in the other store, when the session was mirrored. */
  mirroredId?: string;
  store: SessionStoreKind;
  cwd: string;
  createdAt: IsoInstant;
  updatedAt?: IsoInstant;
  summary?: string;
  /** Tool-call counts keyed by tool name. */
  toolCalls?: Record<string, number>;
  /** What this session actually accomplished, in one line. */
  outcome?: string;
}

/** A shell command recovered from a session transcript. */
export interface SessionCommand {
  /** 1-based position within its session. */
  ordinal: number;
  /** The command exactly as issued. */
  command: string;
  /** What the command was trying to achieve. */
  intent: string;
  succeeded: boolean;
  /** Present when `succeeded` is false. */
  failureReason?: string;
  /** Observable result, such as a file count or a commit hash. */
  result?: string;
}

/** A screenshot captured during the build. */
export interface ScreenshotCapture {
  /** Repository-relative path, including its folder prefix. */
  file: string;
  /** Runbook phase the capture belongs to. */
  phase: string;
  caption: string;
  /** Sort order within the gallery. */
  order: number;
}

/**
 * The nine shell commands from session `d106b6f4`, the screenshot
 * reorganisation that produced commit `7698a0d`.
 *
 * Command one is preserved deliberately: it is the only failure in the set and
 * it documents a real PowerShell constraint.
 */
export const SCREENSHOT_MOVE_COMMANDS: SessionCommand[] = [
  {
    ordinal: 1,
    command:
      'Get-ChildItem -Path . -MaxDepth 1 -Filter "*.png" | ForEach-Object { Move-Item $_.FullName screenshots\\ }',
    intent: 'Move only the root-level PNG files into screenshots/.',
    succeeded: false,
    failureReason:
      'Get-ChildItem has no -MaxDepth parameter. -Depth exists but only applies together with -Recurse, so it cannot express "this directory only".',
  },
  {
    ordinal: 2,
    command:
      'Get-ChildItem -Path . -Filter "*.png" | Where-Object { $_.DirectoryName -eq (Get-Location).Path } | ForEach-Object { Move-Item $_.FullName screenshots\\ }',
    intent:
      'Retry the move, constraining depth by comparing DirectoryName to the current path instead of using a depth switch.',
    succeeded: true,
    result: '66 PNG files moved into screenshots/.',
  },
  {
    ordinal: 3,
    command:
      "(Get-Content RUNBOOK.md -Raw) -replace '(?<![\\w/])(\\d{2}_[a-z][\\w-]+\\.png)', 'screenshots/$1' | Set-Content RUNBOOK.md",
    intent:
      'Repoint the phase-numbered captures in RUNBOOK.md at their new folder.',
    succeeded: true,
  },
  {
    ordinal: 4,
    command:
      "(Get-Content RUNBOOK.md -Raw) -replace '(?<![\\w/])(\\d{2}-[\\w-]+\\.png)', 'captures-2026-06-17/annotated/$1' | Set-Content RUNBOOK.md",
    intent:
      'Repoint the hyphenated annotated captures, which live in a different folder from the underscored ones.',
    succeeded: true,
  },
  {
    ordinal: 5,
    command:
      "(Get-Content RUNBOOK.legacy.md -Raw) -replace '(?<![\\w/])(\\d{2}_[a-z][\\w-]+\\.png)', 'screenshots/$1' -replace '(?<![\\w/])(\\d{2}-[\\w-]+\\.png)', 'captures-2026-06-17/annotated/$1' -replace '(?<![\\w/])(raybot-logo[\\w-]*\\.png|raybot-icon-teams-white\\.png)', 'screenshots/$1' | Set-Content RUNBOOK.legacy.md",
    intent:
      'Apply both capture rewrites to the legacy runbook and additionally prefix the brand assets, which do not match either numbered pattern.',
    succeeded: true,
  },
  {
    ordinal: 6,
    command:
      'Get-ChildItem -Path . -Filter "*.png" | Where-Object { $_.DirectoryName -eq (Get-Location).Path } | Measure-Object',
    intent: 'Confirm the repository root holds no PNG files.',
    succeeded: true,
    result: 'Count 0.',
  },
  {
    ordinal: 7,
    command: 'git --no-pager status --short',
    intent: 'Inspect the working tree before staging.',
    succeeded: true,
  },
  {
    ordinal: 8,
    command: 'git --no-pager add -A',
    intent:
      'Stage everything so git can pair deletions with additions and record renames rather than 66 delete-add pairs.',
    succeeded: true,
    result: 'Rename detection confirmed for all moved captures.',
  },
  {
    ordinal: 9,
    command:
      'git --no-pager commit -m "Move all screenshots to screenshots/ folder and update references"',
    intent: 'Record the reorganisation.',
    succeeded: true,
    result: 'Commit 7698a0d, 71 files changed, 59 insertions, 59 deletions.',
  },
];

/**
 * Sessions that touched Raybot, as recovered from both stores.
 *
 * The Coral build itself is absent. It ran under a different client through
 * Playwright MCP and never wrote a Copilot CLI transcript, so the runbook
 * prose, the captures, and the audit JSON are the only surviving record.
 */
export const RAYBOT_SESSIONS: SessionRecord[] = [
  {
    id: 'a38c8e08',
    mirroredId: 'c9366683',
    store: 'local',
    cwd: 'C:\\Users\\dayour',
    createdAt: '2026-06-17T16:24:29Z',
    outcome:
      'Misfire. Four PowerShell probes hunting a "roo" folder that does not exist. No Raybot work performed.',
    confidence: 'CONFIRMED',
  },
  {
    id: 'd106b6f4-2782-4f83-9ff2-e46f8c07137f',
    mirroredId: '06aa7bb9',
    store: 'cloud',
    cwd: 'C:\\0DEV0\\raybot',
    createdAt: '2026-06-17T16:24:49Z',
    updatedAt: '2026-06-18T06:32:31Z',
    toolCalls: { view: 17, grep: 9, powershell: 9, glob: 8, edit: 6 },
    outcome:
      'Screenshot reorganisation. Produced commit 7698a0d. Source of SCREENSHOT_MOVE_COMMANDS.',
    confidence: 'CONFIRMED',
  },
  {
    id: '75113b80-f1b6-45af-9551-05aff22e030f',
    store: 'cloud',
    cwd: 'C:\\Users\\dayour\\OneDrive - Microsoft\\Documents\\Clawpilot\\raybot-runbook',
    createdAt: '2026-09-16T21:49:18Z',
    updatedAt: '2026-09-17T03:09:17Z',
    toolCalls: {
      view: 94,
      powershell: 37,
      session_store_sql: 19,
      sql: 6,
      glob: 3,
      rg: 3,
      apply_patch: 3,
      ask_user: 2,
    },
    outcome:
      'Review and reorganisation of the runbook from the Clawpilot working copy. Despite sharing a path with the legacy Step 0 directory, this is a review session, not the Coral build.',
    confidence: 'CONFIRMED',
  },
];

/** Commits in the repository's short lineage. */
export const RAYBOT_COMMITS = [
  {
    sha: '16e4d1a',
    author: 'darbotlabs',
    summary:
      'Initial seed. 206 files, 71,796 insertions, committed wholesale with no incremental history.',
  },
  {
    sha: '7698a0d',
    author: 'dayour',
    summary:
      'Move all screenshots to screenshots/ and update references. 71 files changed.',
  },
] as const;
