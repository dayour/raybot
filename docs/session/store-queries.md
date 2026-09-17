---
id: store-queries
title: Store queries
sidebar_label: Store queries
---

# Store queries

The queries that worked against both Copilot CLI session stores, the ones that did not, and the
performance rules that separate them.

Reproducing the [provenance](./provenance.md) analysis requires all of these.

## Two stores, two dialects

| Store | Engine | Dialect | Scope |
| --- | --- | --- | --- |
| Cloud | DuckDB | DuckDB SQL | All sessions across machines |
| Local | SQLite | SQLite SQL | This machine only |

**They are not interchangeable.** DuckDB-only constructs fail against the local store:

| DuckDB | SQLite equivalent |
| --- | --- |
| `now() - INTERVAL '7 days'` | `date('now', '-7 days')` |
| `ILIKE` | `LIKE`, or FTS5 `MATCH` |
| `date_diff('minute', a, b)` | `(julianday(b) - julianday(a)) * 1440` |
| `contains(s, 'x')` | `instr(s, 'x')` |

## Schema differences

The cloud store has `sessions`, `turns`, `checkpoints`, `session_files`, `session_refs`, `events`,
`tool_requests`, and `attachments`.

The local store has the first five only. It has **no** `events`, `tool_requests`, or `attachments`.

The local store adds two tables the cloud store lacks:

- `assistant_usage_events` — per-turn token and duration rows
- `search_index` — an FTS5 virtual table over session content

The local `sessions` table is also narrower: `id`, `cwd`, `repository`, `host_type`, `branch`,
`summary`, `created_at`, `updated_at`. No `task_id`, `agent_name`, or `agent_description`.

Querying a column that exists in one store and not the other produces `no such column`, which is at
least a loud failure.

## Finding sessions by working directory

The starting query. Fast and safe on both stores.

```sql
SELECT id, cwd, created_at, updated_at, summary
FROM sessions
WHERE cwd LIKE '%raybot%'
ORDER BY created_at DESC
LIMIT 50;
```

`sessions` is small — on the order of thousands of rows per user — so this needs no time filter.

## Full-text search, local only

The local store's FTS5 index is the fastest way to find content across all sessions.

```sql
SELECT session_id, source_type, source_id
FROM search_index
WHERE search_index MATCH 'raybot'
LIMIT 50;
```

Querying `MATCH 'raybot'` returned **two rows**, both unrelated Azure resource-group work. That
negative result is one of the five evidence points on the [provenance](./provenance.md) page.

There is no FTS equivalent on the cloud store. Use `ILIKE` with a time filter instead.

## Profiling a session's tool usage

```sql
SELECT tool_start_name, COUNT(*) AS calls
FROM events
WHERE session_id = '75113b80-f1b6-45af-9551-05aff22e030f'
  AND type = 'tool.execution_complete'
GROUP BY tool_start_name
ORDER BY calls DESC;
```

Cloud store only. This is what established that session `75113b80` is a review session: 94 `view`, 37
`powershell`, 19 `session_store_sql`, and only 3 `apply_patch`. No browser tooling at all.

The `session_id` filter is doing the heavy lifting. The storage is partitioned by `session_id`, so a
filtered query on `events` is fast where an unfiltered one is not.

## Finding sessions that touched a file

```sql
SELECT session_id, file_path, tool_name, turn_index, first_seen_at
FROM session_files
WHERE file_path LIKE '%RUNBOOK%'
  AND first_seen_at > now() - INTERVAL '180 days'
ORDER BY first_seen_at DESC
LIMIT 50;
```

`session_files` is the direct answer to "what session edited this file", and it is much cheaper than
scanning turn content for the filename.

## Finding sessions by commit or PR

```sql
SELECT session_id, ref_type, ref_value, created_at
FROM session_refs
WHERE ref_type = 'commit'
  AND created_at > now() - INTERVAL '180 days'
LIMIT 50;
```

`session_refs` beats ILIKE-scanning `turns` for "pull request" or a SHA by a wide margin, because
`ref_type` is an exact-match predicate.

## The performance rules

These are not style preferences. Violating them causes timeouts.

**1. `sessions` is fast. Query it freely.** Thousands of rows, no time filter needed.

**2. `tool_requests` times out at 60 seconds.** Even with `LIMIT 12` and `substr()` applied to
`arguments_json`. This was attempted repeatedly and failed every time.

The practical consequence: **you cannot recover tool arguments.** The nine commands on the
[command reference](./command-reference.md) page were reconstructed from turn content, because the
table that actually holds them is unqueryable.

**3. Always filter `turns` and `events` by time.** `turns` can exceed 50,000 rows and `events`
100,000. An unfiltered scan will not return.

```sql
WHERE timestamp > now() - INTERVAL '7 days'
```

Start at 7 days. Widen only when 7 produces nothing.

**4. Never ILIKE-scan `turns` or `events` without a narrowing predicate.** Combine ILIKE with a time
filter, a `session_id`, or an exact-match column such as `events.type`. ILIKE alone on a large table
is a guaranteed timeout.

**5. Select only the columns you need.** The cloud store is columnar. `SELECT *` on `events`, which
has roughly 90 columns, is dramatically more expensive than selecting three.

**6. Include `session_id` in `WHERE` or `JOIN` wherever possible.** The partitioning key.

**7. Break complex queries into steps.** Find candidate `session_id` values with a cheap filtered
query, then query details for those specific ids. A single multi-table JOIN with an ILIKE on the
unfiltered side will time out.

## The rule that actually mattered

**Set the time window from the artifact under investigation, not from intuition.**

The retracted finding described on the [provenance](./provenance.md) page happened because a search
window was set from the **commit date** — June 2026 — while the session in question is dated
**September 2026**. The query was correct. The window was wrong. The result was a confident negative
that was simply false.

A negative result from a bounded query is only as trustworthy as the bound. Before reporting "no rows
found", state the window explicitly and check it against the date of the thing being looked for.

## Local timestamp formats do not compare cleanly

The local store mixes two timestamp formats in the same columns: SQLite's `'YYYY-MM-DD HH:MM:SS'` and
ISO `'YYYY-MM-DDTHH:MM:SS.sssZ'`.

They only compare safely at day granularity. Compare the 10-character date prefix of **both** sides:

```sql
WHERE substr(created_at, 1, 10) >= date('now', '-7 days')
```

Not:

```sql
WHERE created_at > datetime('now', '-7 days')
```

The second form silently excludes every ISO-formatted row, because `'2026-09-17T06:00:00.000Z'`
sorts after `'2026-09-17 06:00:00'` in ways that depend on the `T`. This is a quiet wrong-answer
failure, not an error.

## Command history is not a transcript

`~/.copilot/command-history-state.json` retains only the **last 50 prompts**. It is a shell-history
convenience feature, not an archive.

It was checked during this analysis and contained nothing relevant, which is expected rather than
surprising. It is listed here so nobody spends time on it twice.
