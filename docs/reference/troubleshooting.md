---
id: troubleshooting
title: Troubleshooting
sidebar_label: Troubleshooting
---

# Troubleshooting

Each failure mode encountered during the build, what it looked like, and what was actually wrong.

The common thread: in every case the visible symptom pointed somewhere other than the cause.

## Teams channel says enabled, agent is absent from Teams

**Symptom.** The Channels tab reports the Microsoft Teams channel as enabled. Raybot does not appear
in Teams under "Built for your org".

**What the UI shows.** Success. There is no warning, no pending state, no error banner.

**Actual cause.** Tenant App Customization Policy consent was never granted. The Edit-details PUT
carries `isConsentProvidedToChangeACPToAny=false`, and
`GET /api/botmanagement/v1/channels/msteams/app/status` returns **HTTP 500 on every publish**.

**How it was found.** Network inspection. Nothing in the UI surfaces either signal.

Corroboration: `store-provider-app:co:tenantapps` lists only MeetingAssist and NanoBot. Raybot was
never registered as a tenant app.

**Resolution.** Tenant administrator action. Not fixable from Copilot Studio.

**Diagnostic.** If the channel reports enabled but the agent is absent, check
`msteams/app/status` directly. A 500 there is the tell.

## Evaluation scores 0 percent while Preview works

**Symptom.** The evaluation run scores 0 percent with 6 Fail results. Preview, on the same agent,
grounds correctly and returns four `docs.ray.io` citations.

**Naive reading.** The agent is broken.

**Actual cause.** An evaluation-runtime limitation. Two distinct behaviours depending on which
version is targeted:

| Target | Behaviour |
| --- | --- |
| Current draft | Returns the system fallback response, not a grounded answer |
| Published | Returns HTTP 500 |

Neither path exercised the agent's actual knowledge configuration. The score measures the evaluation
runtime, not the agent.

**How it was established.** Preview and Evaluate were run against the same agent in the same session.
Preview grounded correctly. That single comparison is the whole argument, and it is why the run was
kept in the record rather than discarded.

**Resolution.** None available. Documented as a runtime limitation.

**Diagnostic.** Before concluding an agent scored badly, run the same questions through Preview. If
Preview grounds and Evaluate does not, the problem is the harness.

## Foundry IQ knowledge base not in the picker

**Symptom.** A knowledge base was created successfully through the Search REST API. The Copilot
Studio picker shows nothing.

**What the UI shows.** An empty dropdown. No error, no empty-state explanation.

**Actual cause.** The search service is on the **Free** tier. Foundry IQ requires **Basic** or above.
Free-tier services accept knowledge base creation through the API without complaint and are then
invisible to the picker.

**Cost.** `raybot-foundryiq-search` was built on Free in Australia East and wholly discarded.

**Resolution.** Recreate on Basic.

```bash
az search service create --name darbotlm --resource-group rg-DarbotLM \
  --sku basic --location centralus
```

**Diagnostic.** If the picker is empty, check the SKU before checking anything else.

## HTTP 404 on `/knowledgeBases`

**Symptom.** `PUT $svc/knowledgeBases/raybot-kb` returns 404.

**Naive reading.** Wrong path.

**Actual cause.** Wrong api-version. `/knowledgeBases` is only exposed on
`api-version=2025-11-01-preview`. Earlier versions return 404 for the path itself, which is
indistinguishable from a typo.

**Resolution.** Pin the api-version explicitly on every call.

## Knowledge base returns nothing useful

**Symptom.** `POST $svc/knowledgeBases/raybot-kb/retrieve` succeeds but produces no synthesized
answer.

**Actual cause.** Web knowledge sources require `outputMode: "answerSynthesis"`, and answer synthesis
requires an Azure OpenAI model listed in `models[]`. Omitting either produces a technically valid
knowledge base that cannot answer.

**Resolution.**

```json
{
  "knowledgeSources": [{ "name": "ray-docs-web" }],
  "outputMode": "answerSynthesis",
  "retrievalReasoningEffort": { "kind": "low" },
  "models": [{ "azureOpenAIParameters": { "modelName": "gpt-4.1" } }]
}
```

## Icon upload rejected

**Symptom.** The icon upload fails. The error does not state the size limit or the file's size.

**Actual cause.** The file exceeds 100 KB. A 512 px render came to 195.8 KB.

**Resolution.** Re-render at 256 px. That produced 53.8 KB, which was accepted.

**Diagnostic.** If a PNG upload fails with no stated reason, check the byte size against 100 KB
before checking anything else about the file.

## Publish, Share, or Evaluate do nothing

**Symptom.** The toolbar buttons are visible and clicking them has no effect.

**Actual cause.** The agent has not been saved. The agent ID is minted at first save, and all three
actions are gated on it.

**Resolution.** Press `agent-command-bar.save-button` once.

## Playwright fills the wrong field

**Symptom.** Filling two adjacent React inputs in sequence produces interleaved or jumbled text
across both.

**Actual cause.** Playwright's `type` and `fill` do not interact well with adjacent controlled React
inputs. React's synthetic event handling does not observe the intermediate states it expects.

**Resolution.** Set the value through the native setter and dispatch an input event via
`browser_evaluate`, rather than using `type` or `fill`, for any multi-field form.

## Selector matches the wrong element

**Symptom.** A test-id selector resolves and the interaction lands somewhere unexpected. Or it works
until a modal opens, then fails.

**Actual cause.** 76 of 177 test ids appear on more than one surface. A test id alone is not a
sufficient selector.

**Resolution.** Qualify by surface container, or prefer role plus accessible name. See
[shared test ids](../coral-schema/shared-testids.mdx).

## Element reference is stale

**Symptom.** A previously valid element ref fails after any page change.

**Actual cause.** Refs go stale on every snapshot in Coral.

**Resolution.** Never cache refs. Re-query by role and name each time. This is exactly why the
[Phase 7](../runbook/phase-7-reaudit.mdx) per-node capture loop re-navigates to
`/flows/new/canvas` for every one of the 13 node types rather than reusing the canvas.

## Playwright cannot open `file://`

**Symptom.** Navigation to a local file URL is blocked.

**Actual cause.** Playwright blocks `file://` navigation by policy.

**Resolution.** The validation run used `@darbotlabs/darbot-browser-mcp@1.3.0` instead.

**Known limitation of that workaround.** Version 1.3.0 throws
`page._snapshotForAI is not a function`, which breaks screenshot, snapshot, and click. Navigation and
network inspection still work, which was enough for the validation.

## `Get-ChildItem -MaxDepth` fails

**Symptom.** `Get-ChildItem -Path . -MaxDepth 1` errors.

**Actual cause.** `-MaxDepth` is not a valid `Get-ChildItem` parameter. It belongs to
`Get-ChildItem -Recurse` in some shells and not to this cmdlet.

**Resolution.** Filter on `DirectoryName`:

```powershell
Get-ChildItem -Path . -Filter "*.png" |
  Where-Object { $_.DirectoryName -eq (Get-Location).Path }
```

This is command 1 and command 2 in the [session command reference](../session/index.md).
