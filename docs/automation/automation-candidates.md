---
id: automation-candidates
title: Automation candidates
sidebar_label: Automation candidates
description: Twenty-five ranked automation candidates mined from 262 session plans, 145 skills, and the Coral playbook, deduplicated against work already in flight.
---

import DataTable from '@site/src/components/DataTable';

# Automation candidates

While the [Phase 8 catalog](../runbook/phase-8-showcase-catalog.mdx) was being
rebuilt, a parallel agent mined the local session corpus for work worth
automating. It returned twenty-five ranked candidates.

The source report is `coral-schema/automation-candidates.md` in the audit
repository. This page reproduces its findings and explains the one structural
decision that makes it useful.

## What was mined

| Source | Count |
|---|---|
| Session-state directories scanned | 2,923 |
| Titled session plans (`plan.md`) | 262 |
| Machine-level skills | 100+ |
| User-level skills | 45 |
| Fleet agents (`dayour-*`) | 80 |
| Ranked candidates returned | 25 |

The corpus is one workstation's accumulated agent sessions, not an
organisation-wide survey. Candidates reflect what **this operator** repeatedly
did by hand, which is exactly the signal that matters for deciding what to
automate next, and exactly the wrong signal for claiming general demand.

## The dedup baseline is the important part

Before ranking anything, the harvest established what was **already being
built**, and flagged every candidate touching that set:

| Existing work | Status |
|---|---|
| GitHub key management | in flight |
| `owcp-incident-loadtest` - timer-driven Dataverse incident generator | BUILT |
| `coral-agent-builder` - one-shot create / name / instruct / greeting / publish / preview | in flight |
| `mcp-edge-unlock` - clear a stale `mcp-msedge` lock to recover Playwright | in flight |
| `dataverse-rest-kit` - az-token plus Web API metadata / create / update / file-column helpers | in flight |
| `flow-clone-runcontext` - guided Save-As plus trigger Scope (User/Org) and Run-as | in flight |
| `darbot-file-validate` - validate local `file://` HTML via darbot-browser MCP | in flight |
| `pa-flow-pdf-to-record` - persist a generated document back to its source row and flag it | in flight |

A ranked list of automation ideas is close to worthless without this step. Any
sufficiently large session corpus will surface the same high-frequency tasks
repeatedly, and those are precisely the tasks someone has already started
automating - which is *why* they recur. Ranking by frequency alone reliably
promotes solved problems to the top.

Four of the top ten overlap existing work. They stay on the list because
overlap is not duplication - a partially-built tool may still need the
generalisation a candidate describes - but they are marked, and they are not
counted as net-new value.

## Top ten

<DataTable
  rows={[
    { rank: 1, name: 'Bulk Agent Security Hardening', rationale: 'Apply web-channel and security settings across an agent fleet in one pass.', overlap: 'net-new' },
    { rank: 2, name: 'Eval-at-Publish ALM Gate', rationale: 'Run evaluations at publish time and block on regression.', overlap: 'net-new' },
    { rank: 3, name: 'One-Shot Coral Agent Provisioner', rationale: 'Parameterized create, configure, publish, and preview in a single pass.', overlap: 'coral-agent-builder' },
    { rank: 4, name: 'Dataverse REST Kit / Row-from-Template', rationale: 'Token-auth metadata plus create and update, including file columns.', overlap: 'dataverse-rest-kit' },
    { rank: 5, name: 'PDF/Doc to Record Persister', rationale: 'Write a generated document back to its source row and flag it.', overlap: 'pa-flow-pdf-to-record' },
    { rank: 6, name: 'Workshop Environment Pool Provisioner', rationale: 'Throttled parallel environment creation for labs.', overlap: 'net-new' },
    { rank: 7, name: 'HTML Wiki / Showcase Builder', rationale: 'Self-contained branded HTML wikis from a repository or session corpus.', overlap: 'net-new' },
    { rank: 8, name: 'GitHub Repo Bootstrap', rationale: 'Standardize CI/CD, issues, and Actions for new repositories.', overlap: 'net-new' },
    { rank: 9, name: 'Engagement / RoB Report Generator', rationale: 'Turn a CRM URL into an enriched HTML engagement report.', overlap: 'net-new' },
    { rank: 10, name: 'Screenshot/Browser Capture to Doc Pipeline', rationale: 'Privacy-safe captures feeding runbooks and wikis.', overlap: 'partial' },
  ]}
  columns={[
    { key: 'rank', header: '#', mono: true, align: 'right' },
    { key: 'name', header: 'Candidate', sortable: true },
    { key: 'rationale', header: 'Rationale' },
    { key: 'overlap', header: 'Overlap', sortable: true },
  ]}
  searchKeys={(r) => `${r.name} ${r.rationale} ${r.overlap}`}
  facets={[{ key: 'overlap', label: 'Overlap', value: (r) => r.overlap }]}
  noun="candidates"
  pageSize={10}
  searchPlaceholder="Search candidates"
/>

The strongest net-new additions, per the report's own summary: **#1 Bulk Agent
Security Hardening, #2 Eval-at-Publish, #6 Workshop Pool Provisioner, #7 Wiki
Builder, #8 Repo Bootstrap, #9 RoB Report**.

### Two sketches worth reading

The report expressed its top two candidates as Coral workflow shapes, which is
what makes them directly actionable against the node inventory in
[Phase 7](../runbook/phase-7-reaudit.mdx):

**Bulk Agent Security Hardening**

```
Trigger -> Connector(Dataverse: list agents) -> Loop -> Switch(channel)
        -> Connector(set security) -> Human review -> Note(audit) -> End
```

**Eval-at-Publish ALM Gate**

```
Trigger(publish) -> Function(run eval set) -> Classify(pass/fail) -> If/Else
        -> [fail] Human review -> Note(scorecard) -> End
```

Both use node types this audit confirmed exist - Loop, Switch, If/Else, Function,
Human review, Note. Neither has been built.

The second one is pointed directly at a failure this audit documented: Raybot's
evaluation run [scored 0% against questions that ground correctly in
Preview](../runbook/phase-5-publish-evaluate.mdx). An eval gate built on that
runtime today would block every publish. The candidate is sound; its dependency
is not ready.

## Candidates 11 through 25, by domain

**Copilot Studio agent operations**

| # | Candidate | Overlap |
|---|---|---|
| 11 | Agent Clone / User-vs-Org Parallel Runner | `flow-clone-runcontext` |
| 12 | Eval Scenario Library Expander | net-new |
| 13 | Adaptive Card / Flashcard Generator | net-new |

**Dataverse / Power Platform**

| # | Candidate |
|---|---|
| 14 | Choice / Option-Set and Metadata Discovery Helper |
| 15 | Power Automate Flow View / Pipeline Generator |
| 16 | PAC / Auth Session Manager |

**M365 / Graph**

| # | Candidate |
|---|---|
| 17 | Expense Report Drafter |
| 18 | Tenant Intelligence / Entra Enrichment |
| 19 | Lokka-Powered Graph Sync |

**GitHub / DevOps**

| # | Candidate |
|---|---|
| 20 | Repo / Codebase Audit and Analysis Report |
| 21 | Docusaurus / Docs-Site Publisher |

**Documentation and deck pipelines**

| # | Candidate |
|---|---|
| 22 | PPTX / Deck Builder (brand-aware) |
| 23 | DOCX / Architecture Doc Generator |

**Knowledge graph and session intelligence**

| # | Candidate |
|---|---|
| 24 | Session-History Harvester |
| 25 | Voice-of-Customer Aggregator |

**Azure and infrastructure** were assessed as lower priority for Coral
specifically: cost optimization reporting, observability and KQL workbooks, and
passwordless Postgres setup.

Candidate 24 is the harvester that produced this list. It nominated itself, and
the report says so explicitly rather than quietly omitting it - a self-nominating
tool is a legitimate finding about the corpus, and hiding it would have
understated how much of this work is meta.

Candidate 21 - a docs-site publisher - describes this wiki. The wiki was built by
hand before the harvest ran.

## What this list does not establish

It is a ranking of **opportunity**, not a plan. Nothing here carries an estimate,
an owner, a dependency graph, or evidence that the underlying platform can
support it - as the Eval-at-Publish dependency above demonstrates.

The corpus is also single-operator, so "high value" here means "recurred often in
one person's work." Treat the ranking as a prompt for a prioritisation
conversation rather than its conclusion.

## Related

- [Phase 8 - Showcase catalog](../runbook/phase-8-showcase-catalog.mdx) - built
  in parallel with this harvest
- [Session forensics](../session/index.md) - the Copilot CLI session record for
  this repository
- [Scripts](./scripts.md) - the automation actually present in the repository
