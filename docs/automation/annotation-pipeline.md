---
id: annotation-pipeline
title: Annotation pipeline
sidebar_label: Annotation pipeline
description: Three Python annotators that turn raw Coral captures into labelled figures, and the measured-geometry sidecar that makes one of them reproducible.
---

# Annotation pipeline

A raw screenshot of a Coral workflow canvas shows four grey rounded rectangles
connected by lines. Which one is the connector, which is the agent, and which is
the approval gate is not recoverable from the image. The annotators exist to put
that information back.

Three scripts live in `coral-schema/`, all built on Pillow, all emitting PNG to a
sibling `annotated*` folder. They differ in one respect that matters more than
anything else about them: **where the callout coordinates come from.**

| Script | Source set | Output | Geometry source |
|---|---|---|---|
| `annotate_showcase.py` | `captures-2026-06-17/showcase/` | `showcase/annotated/` | hardcoded `SPECS` dict |
| `annotate_wfcatalog.py` | `captures-2026-06-18/` stub catalog | `captures-2026-06-18/annotated/` | hardcoded per-workflow |
| `annotate_real_builds.py` | `captures-2026-06-18/wfNN-real/` | `captures-2026-06-18/annotated-real/` | measured sidecar |

## The shared drawing conventions

All three use the same visual language, which means a reader who learns it on one
figure can read all of them:

| Colour | RGB | Meaning |
|---|---|---|
| Blue | `47, 129, 247` | supporting callout |
| Crimson | `248, 81, 73` | emphasis |
| Green | `63, 185, 80` | connector or live connection |

Emphasis is opt-in per callout by prefixing its label with `!`. That is a
deliberately crude mechanism, and it is the right one here: the alternative -
a separate `emphasis: true` field on every callout tuple - would have made every
callout in every spec longer to express a property that fewer than one in ten
callouts uses.

Each output carries a dark banner above the frame with the workflow number, its
name, and its key parameters, so a figure lifted out of its folder still says
what it is.

## Hardcoded geometry, and why it was acceptable

`annotate_showcase.py` and `annotate_wfcatalog.py` both store callout rectangles
as literal pixel coordinates, keyed by filename:

```python
SPECS = {
    "08-classify-configured.png": ("Classify configured", [
        (x, y, w, h, "Three outcomes"),
        (x, y, w, h, "!Descriptions drive routing"),
    ]),
}
```

This is brittle by construction. The coordinates are valid only for the exact
canvas size they were measured against - 2360x1170 for the showcase set, roughly
1568px wide for the stub catalog. Re-capturing at a different viewport, or a
designer change that shifts a node by twenty pixels, silently produces boxes
around empty canvas. Nothing validates that a rectangle contains what its label
claims.

It was acceptable because these two sets are **closed**. The captures were taken
once, the annotations were authored against those exact files, and neither set
will be regenerated. A hardcoded spec for a frozen input is a lookup table, not
a liability.

## The measured sidecar, and why it was necessary

`annotate_real_builds.py` is the exception, and the reason is scale. Eleven
workflows, each needing three callouts placed on a canvas whose node positions
shift depending on how many steps the flow has - agent-first flows have three
nodes where connector-backed flows have four, which moves everything downstream.

Hand-measuring thirty-three rectangles across eleven differently-shaped canvases
would have been slow and would have had to be redone on any re-capture. Instead
the node rectangles were **measured in the browser** and written to
`captures-2026-06-18/node-rects.json`:

```json
{
  "1": {
    "dpr": 0.9000000134110451,
    "rects": {
      "Start":                       { "x": 289,  "y": 422, "w": 185, "h": 29 },
      "Search Github using Query":   { "x": 558,  "y": 407, "w": 224, "h": 59 },
      "Agent":                       { "x": 850,  "y": 407, "w": 216, "h": 59 },
      "Human review":                { "x": 1134, "y": 407, "w": 216, "h": 59 }
    }
  }
}
```

Keys are workflow ordinals `1` through `11`. Rectangles are keyed by **node
label**, not by index - so the script asks for the rectangle named `Agent` rather
than "the third node," and an agent-first workflow with no connector simply has
no entry under a connector name. The absence is the signal.

### The device-pixel-ratio field is load-bearing

`dpr` is captured per workflow because it was not constant: `0.9000000134110451`
is a browser-reported ratio, not a round number someone chose. Rectangles come
out of `getBoundingClientRect()` in CSS pixels; the screenshot is in device
pixels. Annotating without the scale factor puts every box off by ten percent,
which on a 2123px-wide frame is roughly two hundred pixels - far enough to box
the wrong node entirely.

Recording it per workflow rather than once globally costs one float per entry and
removes an entire class of silent misalignment if any capture was taken at a
different zoom.

`NODE_PAD = 10` then adds a fixed ten-pixel margin around each measured rectangle
so callout boxes sit outside node borders rather than on them.

## The stub-catalog annotator is historical

`annotate_wfcatalog.py` annotates the **discarded** eleven-workflow stub catalog
- the `Start -> Variable -> Classify -> Note` shapes that were replaced by the
real connector-backed builds described in
[Phase 8](../runbook/phase-8-showcase-catalog.mdx).

It was kept rather than deleted. Its output documents what the catalog looked
like before the rebuild, which is the only surviving evidence of why the rebuild
happened: the annotated stubs make it immediately obvious that no stub touched an
external system. Deleting the script would have left the Phase 8 claim that the
stubs were "technically valid and practically worthless" unevidenced.

The naming collision is the cost of that decision. `annotated/` holds stubs and
`annotated-real/` holds the real builds, in the same capture folder, with no
indication in either name which is current. Read `annotated-real/` unless
specifically looking for the discarded set.

## Running them

```bash
cd coral-schema
python annotate_showcase.py      # 17 frames  -> showcase/annotated/
python annotate_wfcatalog.py     # 11 frames  -> captures-2026-06-18/annotated/
python annotate_real_builds.py   # 11 frames  -> captures-2026-06-18/annotated-real/
```

All three resolve paths relative to their own location via
`os.path.dirname(os.path.abspath(__file__))`, so they run correctly from any
working directory. Only Pillow is required. All three overwrite their outputs
without prompting and are safe to re-run.

`annotate_real_builds.py` additionally requires `node-rects.json` to be present
and to contain an entry for every workflow it is asked to render. Re-capturing
the source frames without re-measuring the node rectangles will produce
confidently mislabelled output rather than an error.

## Related

- [Scripts](./scripts.md) - the PowerShell automation in the repository
- [Capture patterns](./capture-patterns.md) - how the raw frames were taken
- [Phase 8 - Showcase catalog](../runbook/phase-8-showcase-catalog.mdx) - the
  workflows these annotate
- [Incident Triage build](../runbook/incident-triage-workflow.mdx) - the
  seventeen-frame set `annotate_showcase.py` labels
