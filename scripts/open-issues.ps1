$ErrorActionPreference = 'Stop'
$repo = 'dayour/raybot'

$issues = @(
  @{
    title = 'Object model: per-module reference pages (16 pages)'
    labels = 'documentation,object-model'
    body = @'
The object model ships with only an overview page. Each module needs a reference page documenting its
types, constants, and the evidence behind them.

Sidebar entries to restore under `objectModelSidebar`:

- [ ] `object-model/agent` - AgentIdentity, AgentConfiguration, the RAYBOT aggregate
- [ ] `object-model/identity` - agent id, schema name, environment, the first-save minting behaviour
- [ ] `object-model/knowledge` - KnowledgeSource, public website vs SharePoint vs Dataverse
- [ ] `object-model/tools` - Tool, the four add-tool tabs, custom connector shape
- [ ] `object-model/skills` - Skill, field length limits (name 64, description 1024, instructions markdown)
- [ ] `object-model/connected-agents` - ConnectedAgent and the published-only constraint
- [ ] `object-model/memory` - MemoryConfiguration
- [ ] `object-model/settings` - the four settings tabs, moderation levels, auth modes
- [ ] `object-model/publishing` - PublishOperation, Channel, uiReportsEnabled vs verifiedReachable
- [ ] `object-model/evaluation` - EvalTestSet, EvalRun, validateEvalTestSet
- [ ] `object-model/workflow` - the 4 triggers and 13 node types
- [ ] `object-model/coral-surface` - CoralSurface, CoralElement, CoralEndpoint
- [ ] `object-model/runbook` - RunbookPhase, RunbookStep, RAYBOT_PHASES
- [ ] `object-model/session` - SessionRecord, SessionCommand, SCREENSHOT_MOVE_COMMANDS
- [ ] `object-model/json-schemas` - the emitted schemas (blocked on the JSON Schema issue)
- [ ] `object-model/index` - expand the overview once the above exist

Each page should follow the house style: state the type, show the shape, cite the evidence that
produced any hard-coded constant, and link to the runbook phase where it was observed.

Source: `packages/raybot-object-model/src/*.ts`, which is complete and typechecks cleanly.
'@
  },
  @{
    title = 'Object model: emit JSON Schemas from the TypeScript types'
    labels = 'object-model,infrastructure'
    body = @'
The object model is TypeScript-only. Consumers outside TypeScript have no machine-readable contract.

Emit JSON Schema (draft 2020-12) for the exported interfaces so the model can validate data in any
language, and so the audit datasets in `data/` can be validated against it in CI.

Proposed approach:

- [ ] Add `ts-json-schema-generator` (or `typescript-json-schema`) as a dev dependency
- [ ] Emit to `packages/raybot-object-model/schemas/*.json`, one file per top-level interface
- [ ] Add an `npm run schemas` script
- [ ] Validate the emitted schemas against the exported `data/*.json` fixtures in CI
- [ ] Publish them as static assets on the site so they are addressable by URL
- [ ] Write `object-model/json-schemas` documenting what is emitted and how to consume it

Must preserve the `ConfidenceLevel` enum as a closed string union in the emitted schema.
'@
  },
  @{
    title = 'Object model: package README and build/publish decision'
    labels = 'object-model,infrastructure'
    body = @'
Two loose ends on `@raybot/object-model`.

**1. The package has no README.** It needs one covering installation, the confidence primitive, the
`RAYBOT` canonical instance, semantic id parsing, and validation. Much of this can be lifted from
`docs/sdk/index.md`, but the package README should stand alone.

**2. Nothing builds the package.** It is currently source-only. The Docusaurus site documents it but
does not import from it, so the two can drift silently.

Decide between:

- **Source-only.** Simplest. The site keeps documenting the package without importing it. Risk: the
  docs and the types drift, and nothing catches it.
- **Built and imported.** Add a `tsc` build emitting `dist/` plus declarations, and have the site
  import constants (`ICON_MAX_BYTES`, `WORKFLOW_NODES`, `RAYBOT`) directly. Docs then cannot drift
  from the model, because a stale reference fails the build.
- **Published to npm.** Only worth it if there are external consumers.

Recommendation: built and imported. The whole point of the model is that the documentation and the
types agree, and importing is the only thing that enforces it.

CI already runs `npx tsc --noEmit -p packages/raybot-object-model/tsconfig.json`, so the typecheck
gate exists regardless.
'@
  },
  @{
    title = 'Coral schema: data-driven pages (7 pages)'
    labels = 'documentation,schema'
    body = @'
The Coral schema section has an overview and a naming page. The data-backed pages are missing, and
the components to render them already exist in `src/components/CoralTables.tsx`.

- [ ] `coral-schema/confidence` - the three-grade model, why this audit is CONFIRMED throughout, and
      the four honesty notes in full
- [ ] `coral-schema/surfaces` - all 16 surfaces with per-surface element counts. Component:
      `SurfaceTable`
- [ ] `coral-schema/testid-catalog` - all 177 unique test ids with the surfaces each appears on.
      Component: `TestIdTable`
- [ ] `coral-schema/element-explorer` - all 1,627 elements, filterable by surface, role, and
      interactivity. Component: `ElementTable`
- [ ] `coral-schema/label-gaps` - the 228 interactive elements with no derivable label, with the
      caveat that `derivedLabel` is a heuristic and this is a lower bound. Component: `LabelGapTable`
- [ ] `coral-schema/shared-testids` - the 76 test ids appearing on more than one surface, and why a
      test id alone is not a sufficient selector. Component: `SharedTestIdTable`. Note the audit
      publishes only the top 40; the component derives the full set from `testids.json`
- [ ] `coral-schema/metrics` - all audit totals in one place with methodology notes

Data is already exported to `data/elements.json`, `data/testids.json`, `data/surfaces.json`,
`data/label-gaps.json`, and `data/audit-totals.json`.

Restore the entries in `sidebars.ts` under `schemaSidebar` as pages land.
'@
  },
  @{
    title = 'API surface: hosts, endpoints, and ground-truth pages (3 pages)'
    labels = 'documentation,schema'
    body = @'
The API section has an overview only.

- [ ] `api/hosts` - all 7 hosts, what each backs, and why the Dataverse / Island Gateway split is the
      structural cause of the Phase 6 Teams failure. Component: `HostTable`
- [ ] `api/endpoints` - all 57 endpoints filterable by domain, with semantic id, method, status, and
      observed count. Component: `EndpointTable`
- [ ] `api/ground-truth` - the four observations corroborated exactly against the authoritative
      Copilot Studio corpus, plus a clear statement of what this map is not (it is observed traffic,
      not a published contract)

Data is exported to `data/api-endpoints.json` and `data/api-hosts.json`. Both components exist in
`src/components/CoralTables.tsx`.
'@
  },
  @{
    title = 'Automation: Playwright MCP and capture-pattern pages (5 pages)'
    labels = 'documentation'
    body = @'
`automation/index.md` exists and links to five sibling pages that do not. Those links are currently
de-linked to keep the build green, and must be restored as the pages land.

- [ ] `automation/playwright-mcp` - the MCP setup, why the build was UI-only, and the tool surface used
- [ ] `automation/capture-patterns` - the screenshot-after-every-action rule, naming conventions for
      both schemes, and how captures map to runbook steps
- [ ] `automation/workflow-node-capture` - the per-node loop from Phase 7 in full:
      `page.goto('/flows/new/canvas')` plus a 3500ms settle, then
      `getByRole('button', { name: 'Add a step after Start' })`, then
      `getByRole('button', { name: 'Select action: <Node>' })`, then screenshot. Document why refs go
      stale on every snapshot and why role and text locators are mandatory
- [ ] `automation/darbot-browser-mcp` - the `file://` validation pass with
      `@darbotlabs/darbot-browser-mcp@1.3.0`, why Playwright could not be used, and the known
      `page._snapshotForAI is not a function` limitation
- [ ] `automation/scripts` - `export-wiki-data.ps1` and the source-repo scripts, including the
      PowerShell gotchas that cost time: `$PSScriptRoot` being empty inside a `param()` default under
      WinPS 5.1, and `[ordered]@{}` not exposing keys as properties

The stale-ref rule in particular is the single most reusable finding in the whole project and
deserves its own page.
'@
  },
  @{
    title = 'Evaluation: evalset and results pages (2 pages)'
    labels = 'documentation'
    body = @'
`evaluation/index.mdx` covers the 0 percent result and the importer constraints. Two pages remain.

- [ ] `evaluation/evalset` - the six Ray question and answer pairs in full, the CSV contract
      (`conversationNumber,question,response`), and guidance on authoring a replacement set
- [ ] `evaluation/results` - the full run record: 2026-06-07 12:47 PM, tested by Darbot, 0 percent,
      six of six Fail, Draft returning the system fallback, Published returning HTTP 500, set against
      the Preview transcript that grounded correctly with four `docs.ray.io` citations

`overview/architecture.md` has a de-linked reference to `evaluation/results` that should be restored
when it lands.

The results page matters more than the score. An agent that grounds correctly in Preview and fails
under Evaluate is evidence about the harness, and that distinction is the whole reason the 0 percent
is safe to publish.
'@
  },
  @{
    title = 'Screenshots: map and analysis pages (2 pages)'
    labels = 'documentation'
    body = @'
The screenshots section has an overview and the gallery. Two pages remain.

- [ ] `screenshots/map` - the full crosswalk from `screenshot-map.md`: 41 curated captures against 35
      superseded originals, with the reason each was superseded
- [ ] `screenshots/analysis` - what the captures collectively prove. Distribution by phase, why the
      workflow designer accounts for 17 of 67, which captures are load-bearing evidence for a
      documented constraint, and which are context only

`runbook/legacy.md` has a de-linked reference to `screenshots/map` to restore.

The analysis page should make the evidence chain explicit: for each documented constraint, which
capture proves it. The icon size limit is the clearest example - two captures, one rejection at
195.8 KB and one acceptance at 53.8 KB, establish the 100 KB ceiling without needing documentation.
'@
  },
  @{
    title = 'Session forensics: command reference, store queries, provenance (3 pages)'
    labels = 'documentation'
    body = @'
`session/index.md` covers all of this in summary, including the nine recovered commands. Split into
dedicated pages for depth.

- [ ] `session/command-reference` - the nine commands from session `d106b6f4` with full annotation:
      why `-MaxDepth` is invalid on `Get-ChildItem`, why the `Where-Object` retry works, both regex
      rewrites, and why git rename detection kept commit `7698a0d` to 59 insertions and 59 deletions
      rather than thousands
- [ ] `session/store-queries` - the working queries against both stores, with the performance rules:
      `sessions` is fast, `tool_requests` times out at 60 seconds even with `LIMIT 12` and `substr()`,
      always filter `turns` and `events` by time, never ILIKE-scan unfiltered
- [ ] `session/provenance` - the full chain of evidence that the Coral build transcript does not
      exist, including the retracted finding

`overview/repository-layout.md` has a de-linked reference to `session/command-reference`, and
`runbook/legacy.md` one to `session/provenance`.

The provenance page must keep the correction visible rather than quietly fixing it. An earlier pass
reported that no session existed at the `Clawpilot\raybot-runbook` path; that was wrong, because the
search window was set from the commit date (June) rather than the session date (September). Session
`75113b80-f1b6-45af-9551-05aff22e030f` does exist. The corrected finding is narrower - it is a review
session, not the build - and it still supports the conclusion. Recording the retraction is more useful
than deleting it.
'@
  },
  @{
    title = 'Reference: constraints, troubleshooting, changelog (3 pages)'
    labels = 'documentation'
    body = @'
The reference section has errata only.

- [ ] `reference/constraints` - every discovered limit in one table with the observation that produced
      it: icon PNG-only and 100 KB (512px = 195.8 KB rejected, 256px = 53.8 KB accepted), Foundry IQ
      Basic tier floor, Search api-version `2025-11-01-preview` as the only version exposing
      `/knowledgeBases`, web knowledge sources requiring `outputMode: answerSynthesis` plus an Azure
      OpenAI model, skill field lengths (name 64, description 1024), eval 6-pair and 5 MB and
      1000-character reference limits, publish and share and evaluate all gated on first save,
      connected agents requiring the target to be published
- [ ] `reference/troubleshooting` - the failure modes with their actual causes: Teams channel showing
      enabled while `msteams/app/status` returns HTTP 500, evaluation scoring 0 percent while Preview
      grounds correctly, Foundry IQ knowledge bases absent from the picker on Free tier, icon upload
      rejected with no size shown in the error
- [ ] `reference/changelog` - dated record of the build, the 2026-06-17 re-audit, the screenshot move,
      and this wiki

The constraints page is the highest-value page remaining. Every row is a limit that cost time to
discover and that no documentation states.
'@
  },
  @{
    title = 'Site: restore full sidebar as pages land'
    labels = 'infrastructure,documentation'
    body = @'
`sidebars.ts` was trimmed to the 25 pages that exist so the site could ship. The full intended tree is
roughly 60 pages.

As each section issue closes, restore its entries. Two rules to keep the build green:

1. **Every sidebar id must resolve to a file.** A missing id fails the build.
2. **Every relative link must resolve.** `onBrokenLinks: 'throw'` is set deliberately and should stay
   that way. Several links were de-linked to plain text to ship; they are listed in the relevant
   section issues and should be restored to real links as targets appear.

Also worth doing once the tree is larger:

- [ ] Enable local search (`@easyops-cn/docusaurus-search-local`)
- [ ] Add a `versions` strategy if the Coral runtime changes enough to invalidate captures
- [ ] Consider splitting `schemaSidebar` once the Coral and API sections each exceed ten pages
'@
  },
  @{
    title = 'Source repo: fix the four documented errata in DarbotLM/raybot'
    labels = 'source-repo,documentation'
    body = @'
Four inconsistencies are documented at https://dayour.github.io/raybot/docs/reference/errata and
should be fixed in the source repository, [DarbotLM/raybot](https://github.com/DarbotLM/raybot).
Filed here because that is where the analysis lives.

- [ ] **Emoji in `RUNBOOK.md`.** `README.md` line 40 states "No emojis anywhere by convention" while
      `RUNBOOK.md` lines 88 and 128 contain check, warning, and cross emoji. Either remove the two
      occurrences or soften the README claim.
- [ ] **Pre-move wording in `screenshot-map.md` line 4.** It reads "Originals are also preserved in
      `screenshots/`", which was written before the 2026-06-17 move. It is now technically true but
      implies `screenshots/` is an archive alongside a working set elsewhere, when it is the only
      location.
- [ ] **`coral-schema/rename-screenshots.ps1` is a no-op.** Both its source and destination now point
      into `screenshots/`. Either delete it or comment it as retained for provenance and intentionally
      idempotent.
- [ ] **Three screenshot counts.** 67 in `gallery.json`, 41 in `screenshot-map.md`, 38 in
      `darbot-validation/README.md`. All three are correct in scope and none needs changing, but a
      one-line scope note in each would stop the confusion recurring.

Not errata, and deliberately left alone: the 0 percent evaluation score, the Teams channel reporting
enabled while unreachable, and the wasted Free-tier search service. All three are real outcomes and
are recorded with their qualifications intact.
'@
  }
)

foreach ($i in $issues) {
  $tmp = New-TemporaryFile
  Set-Content -Path $tmp -Value $i.body -Encoding UTF8
  $url = gh issue create --repo $repo --title $i.title --label $i.labels --body-file $tmp
  Remove-Item $tmp -Force
  Write-Output $url
}
