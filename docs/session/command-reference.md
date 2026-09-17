---
id: command-reference
title: Command reference
sidebar_label: Command reference
---

# Command reference

The nine PowerShell commands executed in session `d106b6f4-2782-4f83-9ff2-e46f8c07137f` on
2026-06-17, recovered verbatim, in order, with full annotation.

This is the only session in either Copilot CLI store that modified the source repository. Its output
is commit `7698a0d`.

## The prompt

> move all the screenshots from C:\0DEV0\raybot to C:\0DEV0\raybot\screenshots folder and set all
> relevant scripts and docs within raybot to use the screenshots folder going forward

Two requirements in one sentence: move the files, and rewrite every reference to them. The second
requirement is what makes the session interesting — a bare move would have broken 59 markdown
references silently.

## Session shape

| Tool | Calls |
| --- | --- |
| `view` | 17 |
| `grep` | 9 |
| `powershell` | 9 |
| `glob` | 8 |
| `edit` | 6 |
| **Total** | **49** |

Started 2026-06-17 16:24:49Z, last activity 2026-06-18 06:32Z.

The ratio matters: 34 read operations to 15 write operations. The session read more than twice as
much as it wrote before touching anything.

## 1. First move attempt — failed

```powershell
Get-ChildItem -Path . -MaxDepth 1 -Filter "*.png" | ForEach-Object { Move-Item $_.FullName "screenshots\" }
```

**Failed.** `-MaxDepth` is not a valid parameter on `Get-ChildItem`.

The confusion is understandable. `Get-ChildItem` has a `-Depth` parameter, which applies only in
combination with `-Recurse`. `-MaxDepth` is the spelling used by `Get-ChildItem` in no version of
PowerShell, and by `find` and several other tools in other ecosystems.

Without `-Recurse`, `Get-ChildItem` is already non-recursive, so the parameter was not needed at all.
The intent — "only the root, not subdirectories" — was already the default behaviour.

## 2. Retry with a directory filter — succeeded

```powershell
Get-ChildItem -Path . -Filter "*.png" | Where-Object { $_.DirectoryName -eq (Get-Location).Path } | ForEach-Object { Move-Item $_.FullName "screenshots\" }
```

**Moved 66 files.**

The `Where-Object` guard is belt-and-braces rather than strictly necessary: without `-Recurse`,
`Get-ChildItem` does not descend. But the guard makes the intent explicit and is harmless.

More importantly, it is **correct in the presence of the destination directory**. `screenshots\`
already existed and already contained PNG files. Had the command been written with `-Recurse`, it
would have enumerated the destination's contents and attempted to move files onto themselves.

## 3. Rewrite Phase 1 through 6 references in RUNBOOK.md

Regex `(\d{2}_[a-z][\w-]+\.png)` replaced with `screenshots/$1`.

The pattern keys on the Phase 1-6 naming convention: two digits, an underscore, then a lowercase
slug. `01_suggestion-agent.png`, `14_icon-upload.png`.

The underscore is the discriminator. It is what separates these from the Phase 7 captures, which use
a hyphen.

## 4. Rewrite Phase 7 references in RUNBOOK.md

Regex `(\d{2}-[\w-]+\.png)` replaced with `captures-2026-06-17/annotated/$1`.

Phase 7 captures use `NN-slug.png` with a hyphen, and live in a different directory. Two patterns
were required because the two capture generations used different conventions and different
destinations.

Running only one of these would have produced a half-broken document, and the breakage would have
been invisible in markdown preview — image links that fail render as alt text or a broken-image icon,
not as an error.

## 5. Both rewrites on RUNBOOK.legacy.md, plus brand-asset prefixing

The same two regexes, plus prefixing for `raybot-logo*.png` and `raybot-icon-teams-white.png`.

The brand assets did not match either numeric pattern, because they are not numbered captures. They
needed a third, explicit pass. A purely pattern-driven approach would have missed them, and again the
failure would have been silent.

## 6. Verify no PNGs remain in the repository root

The verification step. It confirms the move was complete rather than assuming it.

This is the step most often skipped. It is also the only thing standing between "66 files moved" and
"66 files moved, and I know there were exactly 66".

## 7. Inspect the working tree

```powershell
git --no-pager status --short
```

`--no-pager` matters in an automated context: without it, `git status` can invoke a pager and block
waiting for input that will never arrive.

## 8. Stage everything, confirming rename detection

```powershell
git --no-pager add -A
```

**This is the load-bearing command.**

Git does not track renames. It infers them at diff time by comparing content similarity between
deleted and added paths. Staging all 66 moves in a single operation gives Git both sides of every
pair simultaneously, so it detects all 66 as renames.

Had the deletions and additions been staged separately, or committed separately, Git would have
recorded 66 deletions and 66 additions — a diff of tens of thousands of lines of binary content.

The evidence that detection worked is the commit size.

## 9. Commit

```powershell
git --no-pager commit -m "Move all screenshots to screenshots/ folder and update references..."
```

Result: commit `7698a0d`.

| Metric | Value |
| --- | --- |
| Files changed | 71 |
| Insertions | 59 |
| Deletions | 59 |

**71 files changed, but only 118 lines touched.** 66 of the 71 are pure renames with zero content
change — Git records them as path moves. The remaining 5 are the markdown and script files whose
references were rewritten, and those account for all 118 lines.

The symmetry of 59 insertions against 59 deletions confirms every rewrite was a one-for-one line
substitution. An asymmetric count would have meant a regex had matched more or fewer times than
intended on some line.

## Why these commands were recoverable at all

They were reconstructed from **turn content**, not from `tool_requests`.

The `tool_requests` table holds the actual arguments passed to each tool call, which would be the
obvious source. It times out at 60 seconds even with `LIMIT 12` and `substr()` applied. See
[store queries](./store-queries.md).

The commands survive because the session's assistant turns quoted them in prose while explaining what
was about to run. That is a fragile provenance channel, and it is why the
[provenance](./provenance.md) page treats narrative as evidence of last resort.
