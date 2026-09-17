---
id: ground-truth
title: Ground truth
sidebar_label: Ground truth
---

# Ground truth

What was independently corroborated, what was not, and how to tell the difference.

## The problem with an observed map

An API map built from network capture has an obvious weakness: it records what a client did, not what
a service promises. Observed behaviour can be incidental — a quirk of one environment, one identity,
one tenant's policy configuration, or one build of the client.

The mitigation applied here was to reconcile the observed map against the authoritative Copilot
Studio corpus, and to record which observations survived that reconciliation intact.

Four did, exactly.

## The four corroborated observations

**1. The Island Gateway host pattern.**

```text
powervamg.{region}.gateway.prod.island.powerapps.com
```

Observed on every channel-management request. The region token, the `island` segment, and the `prod`
environment marker all match the published pattern. This matters because it establishes that the
Dataverse / gateway split described on the [hosts](./hosts.mdx) page is architectural rather than an
artifact of this environment.

**2. The v2 evaluation query path.**

```text
.../makerevaluations/queries/generate?ApplyV2Migration=true
```

Both the path and the `ApplyV2Migration` query parameter match. This is relevant to the
[evaluation](../evaluation/index.mdx) result: the 0 percent score came from the v2 evaluation
pipeline, not a legacy path, so the failure cannot be attributed to hitting a deprecated endpoint.

**3. The agent create call.**

```text
POST /api/data/v9.2/bots
```

Using the `PvaProvision` create model. The path, the API version, and the create model all match.
This confirms that the agent id is minted by Dataverse on create, which is the mechanism behind the
first-save gate on Publish, Share, and Evaluate.

**4. The Teams channel status failure correlates with the ACP consent gate.**

```text
GET /api/botmanagement/v1/channels/msteams/app/status  ->  HTTP 500
```

The correlation with the Tenant App Customization Policy consent state is the corroborated part. The
edit-details PUT observed alongside it carries `isConsentProvidedToChangeACPToAny=false`, and the
published behaviour of that flag matches what was observed: without consent, tenant app registration
cannot complete.

This is the single most useful corroboration in the audit, because it converts an opaque HTTP 500
into a named, actionable tenant-administration task.

## What was not corroborated

Most of the map. Of 57 endpoints, four were matched exactly. The remaining 53 are `CONFIRMED` in the
sense that they were **observed live** — the request was made, the response was received, the status
code is real — but they were not independently matched against a published contract.

The distinction matters and is worth stating plainly:

| Claim | Strength |
| --- | --- |
| "This request was made and returned this status" | Directly observed, high confidence |
| "This endpoint exists and behaves this way in general" | Inferred from a single environment |
| "This matches the published contract" | True for exactly four endpoints |

The confidence grade on each row reflects the first claim, not the third. A row marked `CONFIRMED`
means the capture is real, not that the endpoint is contractually guaranteed.

## How to extend this map safely

If you are adding to this map from your own capture:

1. **Record the status code, including failures.** The nine HTTP 500s are the most informative rows
   in the entire dataset. A map that only records successes would have missed the Teams failure
   entirely.
2. **Record the count.** It distinguishes a load-bearing endpoint from an incidental one.
3. **Do not template identifiers away.** A concrete path with a real agent id is auditable. A
   templated path is an interpretation.
4. **Grade honestly.** `SOURCE-INSPECTED` for something read from source or documentation but not
   observed executing. `UNCONFIRMED` for anything inferred. Do not promote a grade because a claim
   seems obviously true.
5. **State the environment.** Status codes are a function of tenant policy, identity, and licensing
   as much as of the service.

## Environment caveats

Every observation in this map was made under:

- Environment `Default-6b104499-c49f-45dc-b3a2-df95efd6eeb4` (Cypherdyne)
- Identity `darbot@timelarp.com` for the build, `dayour@microsoft.com` for the 2026-06-17 re-audit
- A tenant where ACP consent had **not** been granted
- Before, during, and after a Free-tier Azure AI Search service was replaced with a Basic-tier one

The ACP consent state in particular is not a property of Copilot Studio. It is a property of this
tenant. A tenant with consent granted would produce a different Teams result and a different set of
status codes, without any of the other observations changing.
