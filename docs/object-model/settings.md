---
id: settings
title: Settings
sidebar_label: Settings
---

# Settings

```ts
export interface AgentSettings {
  details: DetailsSettings;
  security: SecuritySettings;
  generativeAi: GenerativeAiSettings;
  conversationStart: ConversationStartSettings;
}
```

Four members, one per tab of the Agent settings dialog. The structure deliberately mirrors the
dialog rather than flattening it, so a capture of one tab maps onto exactly one member.

Walked in [Phase 4](../runbook/phase-4-settings.mdx).

## Details

```ts
export interface DetailsSettings {
  displayName: string;
  description?: string;
  /** Read-only after the first save. */
  schemaName: string;
  /** Read-only after the first save. */
  agentId: Guid;
}
```

Two of the four fields are rendered disabled. They are modelled anyway because the tab displays them
- omitting them would misrepresent the surface. See
[Identity](./identity.md#the-read-only-projection-in-settings) for why the duplication with
`AgentIdentity` is intentional.

## Security

```ts
export type AuthenticationMode =
  | 'NoAuthentication'
  | 'AuthenticateWithMicrosoft'
  | 'Manual';

export interface SecuritySettings {
  authentication: AuthenticationMode;
  requireSecuredAccess: boolean;
}
```

Raybot uses `AuthenticateWithMicrosoft` with `requireSecuredAccess: false`.

**Do not enable `requireSecuredAccess` while relying on the Demo or Preview surfaces.** Doing so locks
the maker out of their own agent preview: the preview surface is not an authenticated channel, so it
cannot satisfy the requirement, and the agent stops responding there with no diagnostic pointing back
at the setting. Leave it off until a real channel is carrying traffic.

This is recorded in the TSDoc on the field itself, so it reaches anyone reading the type or the
[emitted schema](./json-schemas.md).

## Generative AI

```ts
export type ModerationLevel =
  | 'Minimum'
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Maximum';

export const MODERATION_LEVELS: readonly ModerationLevel[] = [
  'Minimum', 'Low', 'Medium', 'High', 'Maximum',
] as const;

export interface GenerativeAiSettings {
  moderationLevel: ModerationLevel;
  userFeedbackEnabled: boolean;
}
```

`MODERATION_LEVELS` exists as an ordered array alongside the union because **the order is
semantic**: the values run from least to most restrictive, and the control is a slider, not a
dropdown. A `Set` or an unordered union loses the fact that `High` is more restrictive than `Medium`.

Anything that renders the slider, or compares two agents' moderation posture, needs the ordering:

```ts
import { MODERATION_LEVELS } from '@raybot/object-model';

const isStricter = (a: ModerationLevel, b: ModerationLevel) =>
  MODERATION_LEVELS.indexOf(a) > MODERATION_LEVELS.indexOf(b);
```

Raybot: `Medium`, the midpoint, with `userFeedbackEnabled: false`.

Feedback is off because thumbs-up and thumbs-down chips would have appeared in every Preview capture,
adding UI that carries no information about the agent while cluttering the gallery.

## Conversation start

```ts
export interface ConversationStartSettings {
  greeting?: string;
  suggestedPrompts: string[];
}
```

Both empty for Raybot. `greeting` is `undefined`; `suggestedPrompts` is `[]`.

The asymmetry is intentional and follows the same convention used throughout the model:
`suggestedPrompts` is a required array because an empty list is a meaningful, observed state, while
`greeting` is optional because the field can genuinely be unset.

Leaving both empty was a testing decision. A greeting occupies the first turn of every Preview
conversation, and suggested prompts bias the tester toward questions the agent is known to handle.
Both would have contaminated the [Phase 5](../runbook/phase-5-publish-evaluate.mdx) grounding
evidence. An empty conversation start means the first thing in every transcript is a real question.

## What is not modelled

The dialog has exactly four tabs and all four are modelled. What is *not* captured is the
Dataverse-side representation: these settings persist to columns on the `bot` row, and the model does
not record which column backs which field. That mapping was never established during the audit. See
[API ground truth](../api/ground-truth.md) for what the Dataverse surface does expose.

## Related

- [Identity](./identity.md)
- [Publishing](./publishing.md)
- [Constraints](../reference/constraints.md)
