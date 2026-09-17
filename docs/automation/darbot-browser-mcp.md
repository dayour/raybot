---
id: darbot-browser-mcp
title: Darbot Browser MCP
sidebar_label: Darbot Browser MCP
---

# Darbot Browser MCP

The independent validation pass over the HTML audit report, why Playwright could not perform it, and
the driver limitation that shaped how it was done.

## Why a second driver

The audit deliverable is `coral-ui-audit.html` — a single self-contained report with four tabs, a
hash router, an embedded gallery, and inlined JSON datasets. It is meant to be opened from disk, with
no web server.

Playwright blocks `file://` URLs. Validating the report through Playwright would therefore have
required standing up an HTTP server, which validates a different artifact than the one shipped: it
proves the report works when served, not that it works as a local file.

`@darbotlabs/darbot-browser-mcp@1.3.0` permits `file://`, so it was driven directly through the MCP
SDK over stdio to validate the real artifact in its real delivery mode.

## The pass

Run 2026-06-07, Sunday PM PDT. Result: **PASS** on load, console, network, and render.

| Check | Tool | Result |
| --- | --- | --- |
| Loads via `file://` | `browser_navigate` | Page loaded directly from disk, no server |
| Page title | `browser_analyze_context` | `Coral UI Audit — Raybot`, correct |
| Console errors, Overview tab | `browser_console_messages` | 0 errors |
| Console errors, Elements tab | `browser_console_messages` | 0 errors |
| Console errors, API Map tab | `browser_console_messages` | 0 errors |
| Console errors, Gallery tab | `browser_console_messages` | 0 errors |
| Prior `APIMAP['$meta']` bug | console | Gone. No APIMAP, undefined, or syntax errors |
| Gallery images | `browser_network_requests` | 38 of 38 `screenshots/*.png` returned HTTP 200 |
| Tab deep-linking | `browser_navigate` to `#overview`, `#elements`, `#api`, `#gallery` | All four tabs activate through the hash router |
| Per-tab render capture | `browser_pdf_save` | 4 of 4 saved |

The only console message anywhere was a benign Edge INFO notice about lazily loaded images being
replaced with placeholders. Not an error.

Four PDFs were produced and are the authoritative darbot-native capture:
`darbot-overview.pdf`, `darbot-elements.pdf`, `darbot-api.pdf`, and `darbot-gallery.pdf` — the last
around 5 MB because it embeds the screenshots.

## The driver limitation

In this environment, three tools fail under `darbot-browser-mcp@1.3.0`:

```
browser_take_screenshot
browser_snapshot
browser_click
```

All three raise:

```
page._snapshotForAI is not a function
```

This is a Playwright-version mismatch in the bundled driver. It is a property of the driver build,
not of the report and not of the MCP protocol.

The practical consequence is that this driver can **observe** but cannot **interact**. Navigation,
console reading, network reading, context analysis, and PDF export all work. Anything that needs the
accessibility snapshot — including every click — does not.

Validation was therefore completed entirely through the observational tools. Deep-linking was
exercised by navigating to each hash rather than clicking each tab, which happens to be a stronger
test of the hash router than clicking would have been.

The `01-overview.png` through `04-gallery.png` PNGs in the validation folder were captured
separately, over a local HTTP server with the Chromium engine, and are supplementary flat previews
only. The PDFs are the darbot-native proof.

## What this validation does and does not establish

**Establishes.** The shipped HTML file loads from disk in a Chromium-family browser with no console
errors, resolves all 38 gallery image references, and routes correctly across all four tabs.

**Does not establish.** That the report is correct. This is a rendering and integrity check, not a
content audit. The correctness of the underlying numbers rests on the
[ground-truth methodology](../api/ground-truth.md) and the
[confidence model](../coral-schema/confidence.md), not on this pass.

**Does not establish.** That the report works in non-Chromium engines. Only Edge was exercised.

## Note on image counts

This pass verified **38** gallery images. `gallery.json` covers **41** curated captures, and
`README.md` in the source repository states **67**. Three different numbers, all defensible in their
own context — 67 is the total capture count across all phases, 41 is the curated canonical set, and
38 is what the report's gallery tab actually referenced at validation time. The discrepancy is
tracked in the [errata](../reference/errata.md).
