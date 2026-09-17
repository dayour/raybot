---
id: publishing
title: Publishing
sidebar_label: Publishing
---

# Publishing

```ts
export type PublishChannelKind =
  | 'demo'
  | 'teams'
  | 'm365Copilot'
  | 'website'
  | 'customWebsite'
  | 'slack'
  | 'directLine';

export interface PublishChannel extends Evidenced {
  kind: PublishChannelKind;
  uiReportsEnabled: boolean;
  verifiedReachable: boolean;
  blockedReason?: string;
}
```

## The two-field enablement model

`uiReportsEnabled` and `verifiedReachable` are separate fields, and that separation is the entire
lesson of [Phase 6](../runbook/phase-6-teams.mdx) expressed as type structure.

| Field | Means |
| --- | --- |
| `uiReportsEnabled` | The channel toggle in the maker UI says the channel is on. |
| `verifiedReachable` | Traffic was actually observed reaching the agent through that channel. |

A single `enabled: boolean` would have been the natural design, and it would have been unable to
represent what actually happened to Raybot's Teams channel:

```ts
{
  kind: 'teams',
  uiReportsEnabled: true,    // the UI said "Channel enabled"
  verifiedReachable: false,  // it never appeared in the tenant catalog
  blockedReason: 'Tenant App Customization Policy consent was never granted. ...',
  confidence: 'CONFIRMED',
}
```

The UI reported success. The channel was not reachable. Both statements are true simultaneously, and
a model that cannot hold both is a model that would have recorded this failure as a success.

Raybot's two channels:

| `kind` | `uiReportsEnabled` | `verifiedReachable` | Outcome |
| --- | --- | --- | --- |
| `demo` | `true` | `true` | Working. Grounded answers with four live citations. |
| `teams` | `true` | `false` | Blocked at the tenant, with no actionable UI signal. |

## The Teams failure in detail

Three independent observations back `verifiedReachable: false`:

1. `GET /api/botmanagement/v1/channels/msteams/app/status` returned **HTTP 500 on every publish**, not
   intermittently.
2. The Edit-details `PUT` payload carried `isConsentProvidedToChangeACPToAny=false` - the tenant App
   Customization Policy consent was never granted.
3. `store-provider-app:co:tenantapps` listed only MeetingAssist and NanoBot. Raybot was absent from
   Teams "Built for your org" entirely.

`blockedReason` carries the full explanation as free text rather than as a code, because the failure
is a tenant-governance condition rather than a product error state. There is no enum of blocked
reasons to draw from, and inventing one would imply the platform reports them in a structured way.
It does not - the UI reports nothing at all.

This is a tenant-admin blocker. No amount of maker-side work resolves it.

## PublishOperation

```ts
export interface PublishOperation extends Evidenced {
  operationId?: string;
  startedAt?: IsoInstant;
  completedAt?: IsoInstant;
  succeeded: boolean;
}
```

**Coral publishes inline. There is no confirmation dialog.** Pressing Publish in the command bar
posts to a publish-operations endpoint and then long-polls the returned operation id until it
terminates. The maker sees an inline progress state in the command bar and nothing else.

This is a behavioural change from the previous Copilot Studio runtime, where publishing opened a
modal. Any automation written against the old flow that waits for a dialog will hang forever - there
is no dialog to wait for. Wait on the command bar's state instead.

All three timing fields are optional because the operation id and timestamps come from the network
trace, not from the UI. A `PublishOperation` reconstructed purely from screenshots can honestly
report only `succeeded`.

## The seven channel kinds

`PublishChannelKind` enumerates the channel cards in the publish surface. Only `demo` and `teams`
were exercised; the other five are present because the set is closed in the UI and the card list was
captured. They carry no `PublishChannel` record on `RAYBOT`, which is the model's way of saying they
were seen but not attempted.

## Related

- [Phase 5: Publish and Evaluate](../runbook/phase-5-publish-evaluate.mdx)
- [Phase 6: Teams](../runbook/phase-6-teams.mdx)
- [Troubleshooting](../reference/troubleshooting.md)
- [API endpoints](../api/endpoints.mdx)
