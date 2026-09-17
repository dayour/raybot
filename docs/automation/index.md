---
id: index
title: Automation
sidebar_label: Overview
---

# Automation

The build was performed by an AI agent driving a real browser through Model Context Protocol tools.
No Copilot Studio SDK, no API scripting outside Phase 3, and no recorded macro. This section
documents how, and what breaks.

## The tool surface

| Tool family | Role |
| --- | --- |
| `playwright-browser_*` | Every UI action in every phase |
| `filesystem` | Writing captures and artifacts to disk |
| Azure CLI | Phase 3 only |
| Azure AI Search REST | Phase 3 only |
| `@darbotlabs/darbot-browser-mcp` | Independent validation of the audit report |

## The three rules

**UI only.** If a maker cannot do it in the browser, it is not part of the runbook. Phase 3 breaks
this rule because Microsoft IQ has no creation UI at all, and that break is called out explicitly
rather than hidden.

**Screenshot after every action.** Not after every step, and not after every milestone. This is the
expensive rule and the one that paid for itself: the silent HTTP 500s in Phase 6 and the
`isConsentProvidedToChangeACPToAny=false` flag were only recoverable because the network trace was
captured alongside each UI state.

**Self-reflection between steps.** Read the resulting state before issuing the next command. The
build was not a pre-planned script being replayed; each action was chosen after observing the
previous result. This is why the runbook contains rejections and retries rather than a clean path.

## What is fragile

Five failure modes recurred often enough to be worth naming.

1. **Element references go stale on every snapshot.** Use role and text locators, never stored refs.
2. **Adjacent React fields jumble under `type` and `fill`.** Use the native value setter through
   `browser_evaluate`.
3. **Deep SPA navigation can drop the session** and force re-authentication. In-app clicks are more
   reliable than `browser_navigate` to a deep route.
4. **Clicking an agent name opens a new tab** at index 1. Subsequent actions target the wrong page
   unless you follow it.
5. **Canvas state accumulates.** Capturing many configuration panels requires a deterministic reset
   between each one.

Each of these is documented with its workaround in Capture patterns.

## In this section

- Playwright MCP — the tool inventory and the control-identification strategy.
- Capture patterns — the five failure modes and their workarounds.
- Workflow node capture — the deterministic reset loop that captured
  thirteen node types.
- Darbot Browser MCP — the independent validation pass and its known
  driver limitation.
- Scripts — the PowerShell and Python in the repository, including the one that is
  now a no-op.
