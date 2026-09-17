---
id: skills
title: Skills
sidebar_label: Skills
---

# Skills

```ts
export type SkillEntryMode = 'blank' | 'generated';

export interface AgentSkill extends Evidenced {
  name: string;
  entryMode: SkillEntryMode;
  description?: string;
  instructions?: string;
}

export const SKILL_NAME_MAX_LENGTH = 64;
export const SKILL_DESCRIPTION_MAX_LENGTH = 1024;
```

## Field schema

The skill editor exposes three fields. Their constraints were read directly off the DOM during
[Phase 2](../runbook/phase-2-right-rail.mdx), not inferred:

| Test id | Element | Constraint | Model field |
| --- | --- | --- | --- |
| `skill-name-input` | `INPUT` | `maxLength` 64 | `name` |
| `skill-description-input` | `TEXTAREA` | `maxLength` 1024 | `description` |
| `skill-instructions-input` | `TEXTAREA` | Markdown, no observed cap | `instructions` |

Both limits are encoded as constants rather than described in prose, because a limit discovered by
reading the control is a fact the model should be able to enforce.

`instructions` carries no length constant. The control exposed no `maxLength` attribute, and the
audit never pushed it far enough to discover a server-side ceiling. Asserting a number here would be
`UNCONFIRMED`; leaving it out is honest.

## Entry mode

`agent-side-panel.skills.add-button` leads to a two-option entry-mode chooser before the editor
opens:

| `entryMode` | Test id | Behaviour |
| --- | --- | --- |
| `blank` | `skill-editor-entry-mode-blank` | Opens an empty editor. |
| `generated` | (sibling option) | Opens the editor pre-filled with a generated draft. |

The flow completes at `skill-editor-dialog-create`.

`entryMode` is retained on the persisted skill rather than being treated as a transient wizard
choice, because it is provenance: it records whether the instructions were human-authored or
model-drafted. That distinction matters when auditing why a skill behaves the way it does.

## Raybot's skill

```ts
{
  name: 'ray-cluster-troubleshooter',
  entryMode: 'blank',
  confidence: 'CONFIRMED',
}
```

Authored blank. The name fits comfortably inside the 64-character ceiling at 25 characters.

## The React input hazard

This is the most transferable finding in the phase, and it is not specific to skills.

**Playwright `type` and `fill` jumble adjacent React fields in this editor.** Filling the name, then
the description, then the instructions in sequence produces interleaved or truncated values, because
the controls are controlled React inputs whose state updates do not survive the synthetic event
sequence those helpers emit.

The working approach is `browser_evaluate` with the native value setter, which updates the DOM value
and then dispatches an `input` event that React's synthetic event system actually observes:

```js
const setter = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype, 'value',
).set;
setter.call(el, text);
el.dispatchEvent(new Event('input', { bubbles: true }));
```

Use `HTMLTextAreaElement.prototype` for the two textareas. Full treatment at
[Capture patterns](../automation/capture-patterns.md).

## Validation

The model ships the limits but no validator, deliberately. Length checking is a one-liner at the call
site:

```ts
import { SKILL_NAME_MAX_LENGTH, SKILL_DESCRIPTION_MAX_LENGTH } from '@raybot/object-model';

const problems: string[] = [];
if (skill.name.length > SKILL_NAME_MAX_LENGTH) {
  problems.push(`name is ${skill.name.length} characters; the field caps at ${SKILL_NAME_MAX_LENGTH}.`);
}
if ((skill.description?.length ?? 0) > SKILL_DESCRIPTION_MAX_LENGTH) {
  problems.push(`description exceeds ${SKILL_DESCRIPTION_MAX_LENGTH} characters.`);
}
```

`validateEvalTestSet()` exists because the evaluation importer has several interacting rules - a pair
cap, ordinal uniqueness, per-field emptiness, and a reference-length cap - that are genuinely worth
centralising. Skills have two independent length checks, which are not.

## Related

- [Tools](./tools.md)
- [Capture patterns](../automation/capture-patterns.md) - the native value setter
- [Constraints](../reference/constraints.md)
