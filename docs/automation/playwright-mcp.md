---
id: playwright-mcp
title: Playwright MCP
sidebar_label: Playwright MCP
---

# Playwright MCP

Every UI action in the Raybot build was issued through Playwright MCP tools against a real
Microsoft Edge session signed in as `darbot@timelarp.com`. No Copilot Studio SDK, no Dataverse
scripting, no recorded macro. This page documents the tool surface, why the constraint was chosen,
and how controls were identified.

## Why UI only

Copilot Studio's next-generation runtime (codename Coral) was, at build time, a preview surface with
no public authoring API. Documenting it through an SDK would have documented the SDK, not the
product. Driving the browser produces a record of what a maker actually sees and clicks, which is
what a runbook is for.

The constraint has one deliberate exception. **Phase 3** — Microsoft IQ / Foundry IQ — has no
creation UI at all. A knowledge base must exist in Azure AI Search before Copilot Studio's picker can
list it. That phase drops to Azure CLI and the Search REST API, and the break is called out in the
runbook rather than hidden. See [Phase 3](../runbook/phase-3-foundry-iq.mdx).

## Tool inventory

These are the tools that appear by name in the runbooks, with the count of distinct citations across
`RUNBOOK.md` and `RUNBOOK.legacy.md`.

| Tool | Citations | What it was used for |
| --- | --- | --- |
| `browser_click` | 9 | The default action. Every button, tab, toggle, and menu item. |
| `browser_evaluate` | 4 | The escape hatch. Native value setters for React inputs, and the DOM harvest that produced the surface JSON. |
| `browser_navigate` | 4 | Entering a surface by URL. Used sparingly — see the session-drop failure mode. |
| `browser_type` | 4 | Single-field text entry only. Unsafe for adjacent React fields. |
| `browser_run_code` | 3 | Role and text locators when a snapshot ref would have gone stale. |
| `browser_take_screenshot` | 3 | The capture rule. Invoked after every action, not every step. |
| `browser_file_upload` | 2 | The agent icon in Phase 1 and the Teams app-package icon in Phase 6. |
| `browser_press_key` | 1 | Keyboard-only interactions where a click had no target. |
| `browser_tabs` | 1 | Following the new tab that opens at index 1 when an agent name is clicked. |

Two non-browser tool families sit alongside these:

| Family | Role |
| --- | --- |
| `filesystem` | Writing captures and JSON artifacts to disk. The legacy Step 0 used `filesystem-create_directory` against `...\Clawpilot\raybot-runbook`. |
| Azure CLI plus Azure AI Search REST | Phase 3 only. |

## Identifying controls

Coral is a React application that ships `data-testid` attributes densely — 983 of 1,627 captured
elements carry one, across 177 unique values. That makes testids the primary locator, and it is why
the [Coral schema](../coral-schema/index.mdx) section exists at all: the audit is essentially a
published locator catalog.

The identification order used during the build was:

1. **`data-testid`**, where one exists and is unique on the surface. 76 testids are reused across
   more than one surface, so uniqueness must be checked per surface, not globally — see
   [shared testids](../coral-schema/shared-testids.mdx).
2. **Role plus accessible name**, via `getByRole('button', { name: '...' })`. This is the only
   approach that survives a re-snapshot, and it is mandatory inside any multi-step loop.
3. **Visible text**, as a last resort. Brittle against localization, and noted as such wherever the
   runbook relies on it.

228 interactive elements carry no derivable label at all. Those are the ones that force approach 1,
and where no testid exists either, they are effectively unaddressable without a structural selector.
That gap is quantified in [label gaps](../coral-schema/label-gaps.mdx).

## What this tooling could not do

- **It could not grant tenant consent.** Phase 6 is blocked behind
  `isConsentProvidedToChangeACPToAny=false`, an Application Customization Policy flag set outside
  the maker surface. No amount of browser automation clears it.
- **It could not read the evaluation runtime's internals.** Evaluate returned a system fallback for
  the Draft agent and HTTP 500 for the Published one. The browser sees the outcome, not the cause.
- **It could not load `file://` URLs.** Playwright blocks them, which is why the HTML audit report
  was validated with a different driver entirely — see
  [Darbot Browser MCP](./darbot-browser-mcp.md).

## Related

- [Capture patterns](./capture-patterns.md) — the five recurring failure modes and their workarounds.
- [Workflow node capture](./workflow-node-capture.md) — the deterministic reset loop.
- [Scripts](./scripts.md) — the PowerShell and Python that processed what the browser produced.
