# Raybot

Object model, runbook, and Coral ground-truth schema for **Raybot** — a Ray and Ray-clusters expert
agent built entirely through the browser UI in Microsoft Copilot Studio's next-generation runtime,
codename **Coral**.

**Site:** https://dayour.github.io/raybot/

## What this is

A documentation site and a TypeScript object model derived from a real build. Every constraint in it
was discovered by hitting it, every identifier was read off a live DOM, and every endpoint was
observed on the wire.

| | |
| --- | --- |
| Agent ID | `4de4ada9-ad61-4c22-a0d0-a0bd1c189f4e` |
| Schema name | `Default_Raybot_vyN1Rz` |
| Environment | `Default-6b104499-c49f-45dc-b3a2-df95efd6eeb4` |
| Model | Claude Sonnet 4.6 |
| Knowledge | `https://docs.ray.io` |
| Skill | `ray-cluster-troubleshooter` |
| Microsoft IQ | Foundry IQ knowledge base `raybot-kb` |
| Memory | Enabled |

## Contents

- **Runbook** — seven phases from first save to Teams channel, with every `data-testid` and every
  capture that proves it.
- **Coral schema** — 16 surfaces, 1,627 elements, 1,115 interactive, 177 unique test ids, 228 label
  gaps, 76 test ids shared across surfaces.
- **API surface** — 57 endpoints across 11 domains and 7 hosts, from 1,249 observed requests of
  which 611 were functional.
- **Screenshot gallery** — 67 curated captures, filterable by phase.
- **Session forensics** — what the Copilot CLI session stores retain, the nine recovered terminal
  commands, and why the build transcript does not exist.
- **Object model** — `@raybot/object-model`, a dependency-free TypeScript package.

## Honesty notes

This project records what happened, including the parts that did not work.

- **The evaluation scored 0 percent**, six of six Fail. The same agent grounds correctly in Preview
  with four `docs.ray.io` citations. Draft returns the system fallback and Published returns HTTP
  500 — an evaluation-runtime limitation, not an agent-quality result.
- **The Teams channel is blocked.** The maker UI reports "Channel enabled" while
  `GET /api/botmanagement/v1/channels/msteams/app/status` returns HTTP 500 on every publish, and
  Raybot never appears in the tenant catalog. The cause is an ungranted Tenant App Customization
  Policy consent, with zero actionable signal in the UI.
- **A search service was wasted.** Foundry IQ requires Basic tier or higher. A Free-tier service was
  provisioned first and its knowledge bases never appeared in the picker.
- **The build transcript does not exist.** The Coral build ran under a client that left no Copilot
  CLI session. The surviving record is the runbook prose, the screenshots, and the audit JSON.

No emojis anywhere, by convention.

## Development

```bash
npm install
npm start          # dev server
npm run build      # production build
npm run typecheck  # object model
```

Regenerate the exported datasets from the source repository:

```powershell
npm run export-data -- -Source C:\0DEV0\raybot
```

## Source repository

The primary artifact is [DarbotLM/raybot](https://github.com/DarbotLM/raybot) — the runbook, the
screenshots, and the `coral-schema/` audit output. This repository is derived from it.

## Status

The site ships with the runbook, Coral schema, API surface, screenshot gallery, session forensics,
evaluation, object model, and SDK sections. Per-module reference pages, JSON Schema emission, and the
remaining automation and reference pages are tracked as open issues.

## License

MIT
