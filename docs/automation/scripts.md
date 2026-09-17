---
id: scripts
title: Scripts
sidebar_label: Scripts
---

# Scripts

The PowerShell and Python in both repositories, what each one actually does, and the language
gotchas that cost time.

## Inventory

### Source repository — `C:\0DEV0\raybot`

| Script | Lines | Role |
| --- | --- | --- |
| `coral-schema/extract-surface.ps1` | 31 | Recovers the JSON payload from a `browser_evaluate` tool-output temp file and writes `surfaces/<Name>.json` |
| `coral-schema/build-validation.ps1` | 110 | Aggregates the per-surface JSON into `schema-validation.json` and `ui-elements-dump.json` |
| `coral-schema/build-html-report.ps1` | 209 | Emits the single-file `coral-ui-audit.html` with all datasets inlined |
| `coral-schema/rename-screenshots.ps1` | 62 | Maps 41 original captures to curated `NN_<phase>_<subject>.png` names with captions |
| `coral-schema/annotate.py` | 80 | Draws a title banner and labeled callout boxes on one screenshot |
| `coral-schema/annotate_batch.py` | 362 | Applies a per-image callout spec to the whole 2026-06-17 capture set |

### Wiki repository — `C:\0DEV0\raybot-wiki`

| Script | Role |
| --- | --- |
| `scripts/export-wiki-data.ps1` | Reads the audit artifacts from the source repository and emits the normalized JSON dataset in `data/` that both the wiki and `@raybot/object-model` consume |
| `scripts/open-issues.ps1` | Files the twelve tracking issues with their labels. Kept in-tree because the issue bodies are the page specifications |

## extract-surface.ps1: parsing tool output

The DOM harvest ran as a `browser_evaluate` expression returning a JSON string. The tool wrote that
return value to a temp file as a **JSON string literal** — the payload double-encoded — followed by
echoed source text:

```
### Result
"{\"provenance\":{...},\"elements\":[...]}"
<echoed source>
```

Naive parsing fails twice over: the file is not valid JSON as a whole, and the first `ConvertFrom-Json`
yields a string rather than an object. The script walks from the first quote to the matching
unescaped closing quote, honoring backslash escapes, then converts twice — once to recover the inner
JSON text, once to validate it — and writes the inner text verbatim.

The double conversion is the point. `$inner` is what gets written to disk; `$obj` exists only so that
malformed payloads fail loudly at extraction time rather than silently at aggregation time.

## build-validation.ps1: the aggregate

This is where every headline number in the [metrics](../coral-schema/metrics.mdx) page originates —
surfaces, elements, interactive count, testid coverage, unique testids, label gaps, and shared
testids.

Two details matter downstream:

**Shared testids are truncated.** The script publishes only the top 40:

```powershell
sharedTestIdsAcrossSurfaces = ($sharedAcrossSurfaces |
    Sort-Object surfaces -Descending | Select-Object -First 40)
```

The true count is 76. Any consumer that reads `shared-testids.json` as complete will undercount by
36, which is why this wiki's `SharedTestIdTable` derives from `testids.json` instead.

**The `$meta` key is a literal.** The aggregated dump uses `'$meta'` as a hashtable key. In the
first HTML report build that key leaked into generated JavaScript as `APIMAP['$meta']` in a context
where it broke parsing. The fix is recorded in the
[Darbot validation](./darbot-browser-mcp.md) pass as the "Prior `APIMAP['$meta']` bug — Gone" row.

## rename-screenshots.ps1: now a re-run guard

Originally this script read originals from the repository root and wrote curated copies into
`screenshots/`. After the 2026-06-17 consolidation moved all 66 root PNGs into `screenshots/`, it was
rewritten so that both source and destination are `screenshots/`:

```powershell
$dest = Join-Path $rb 'screenshots'
$src  = Join-Path $dest $old
Copy-Item $src (Join-Path $dest $newName) -Force
```

It is now effectively idempotent — a no-op re-run guard. Its remaining value is as **data**: the
`[ordered]` map is the authoritative filename-to-caption-to-phase crosswalk, and it is what
`gallery.json` and this wiki's [screenshot map](../screenshots/map.md) are built from.

It also fails loudly on drift. Any original missing from `screenshots/` produces
`Write-Warning "MISSING SOURCE: $old"` and is skipped, so the reported copy count diverging from 41
is a signal that the capture set has been disturbed.

## PowerShell gotchas that cost time

### `$PSScriptRoot` is empty inside a `param()` default

Under Windows PowerShell 5.1, `$PSScriptRoot` is not populated at the time `param()` defaults are
evaluated. This does not throw — it silently yields an empty string, and `Join-Path` on an empty
first argument produces a path relative to the current directory. The script then writes its output
somewhere plausible but wrong.

The fix is to default the parameter to `$null` and resolve the path in the body:

```powershell
param(
    [string]$Source = 'C:\0DEV0\raybot',
    [string]$Dest
)

if (-not $Dest) {
    $repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
    $Dest = Join-Path (Split-Path -Parent $repoRoot) 'data'
}
```

`extract-surface.ps1` sidesteps the same problem by using `$PSCommandPath`, which is populated in the
body.

### `[ordered]@{}` does not expose keys as properties

An ordered dictionary is an `OrderedDictionary`, not a `PSCustomObject`. Property-style access
returns `$null` rather than throwing:

```powershell
$h = [ordered]@{ surface = 'build' }
$h.surface     # works - OrderedDictionary happens to support this
$h | Select-Object -ExpandProperty surface   # fails - no such property
```

The failure mode is a pipeline that quietly produces nothing. Use index access, `$h['surface']`, or
convert with `[pscustomobject]$h` before piping. `build-validation.ps1` converts deliberately —
`[pscustomobject]@{ ... }` for anything destined for `Format-Table`, `[ordered]@{ ... }` only for
things destined for `ConvertTo-Json` where key order is the goal.

### Writing JSON without a BOM

`Set-Content -Encoding UTF8` writes a BOM under Windows PowerShell 5.1. Tools that read the file as
plain UTF-8 see `\ufeff` as the first character and fail to parse. `export-wiki-data.ps1` uses the
.NET writer explicitly:

```powershell
[System.IO.File]::WriteAllText($Path, $json, (New-Object System.Text.UTF8Encoding($false)))
```

The `$false` argument is what suppresses the BOM. This is wrapped as `Write-JsonFile` and used for
every emitted dataset so that re-running the export produces reviewable diffs rather than
whole-file churn.

## The Python annotators

`annotate.py` takes a source image, a destination, a banner title, and a list of
`x,y,w,h,Label` callout specs in source-image pixel coordinates. It draws a rounded accent rectangle
per callout plus a label chip, and a title banner across the top.

`annotate_batch.py` embeds the same drawing engine and adds a per-image callout specification for
the 2026-06-17 set, with coordinates verified against each raw screenshot at 1869x894 or 1869x895.
A leading `!` on a label switches that callout from the blue accent to crimson for emphasis.

Both depend on Pillow and on Segoe UI or Arial being resolvable by filename, with a fallback chain.
The hardcoded resolution is the fragile part: re-capturing at a different viewport size invalidates
every coordinate in the 362-line spec.

## A forensic note

`build-validation.ps1` and `build-html-report.ps1` both carry a hardcoded default path:

```
C:\Users\dayour\OneDrive - Microsoft\Documents\Clawpilot\raybot-runbook\coral-schema
```

That directory no longer exists on C:, D:, or E:. It is the strongest surviving evidence that the
original Coral build ran under a different client from a different working directory, and it
corroborates the legacy runbook's Step 0, which creates exactly that path. See
[provenance](../session/provenance.md).
