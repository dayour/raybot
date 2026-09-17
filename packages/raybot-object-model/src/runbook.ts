/**
 * The runbook model.
 *
 * A runbook is an ordered set of phases; each phase is an ordered set of steps;
 * each step records the UI target it acted on, the screenshots that prove the
 * result, and the outcome. The model is deliberately capture-first: a step with
 * no evidence is expressible, but it cannot claim `CONFIRMED` confidence.
 */

import type { Evidenced, IsoDate, OutcomeStatus } from './common.js';

/** How a step was carried out. */
export type StepMechanism =
  | 'browser'
  | 'azure-cli'
  | 'rest'
  | 'powershell'
  | 'manual';

/** A UI element targeted by a step. */
export interface StepTarget {
  /** Raw Coral `data-testid`, when the step targeted one. */
  testId?: string;
  /** Normalized `coral.*` semantic id. */
  semanticId?: string;
  /** ARIA role used to locate the element, when role-based location was used. */
  role?: string;
  /** Accessible name used with the role. */
  name?: string;
}

/** One discrete action inside a phase. */
export interface RunbookStep extends Evidenced {
  /** Stable ordinal within the phase, starting at 1. */
  ordinal: number;
  title: string;
  mechanism: StepMechanism;
  target?: StepTarget;
  /** Screenshot filenames, relative to the audit repository root. */
  captures: string[];
  outcome: OutcomeStatus;
  /** Constraint or gotcha surfaced by this step. */
  constraint?: string;
}

/** A numbered phase of the runbook. */
export interface RunbookPhase extends Evidenced {
  number: number;
  title: string;
  /** One-paragraph statement of what the phase accomplishes. */
  summary: string;
  outcome: OutcomeStatus;
  steps: RunbookStep[];
  /** Why the phase is blocked or partial, when it is. */
  blockedReason?: string;
}

/** The runbook as a whole. */
export interface Runbook extends Evidenced {
  title: string;
  /** Date the runbook content was last validated end to end. */
  validatedOn: IsoDate;
  phases: RunbookPhase[];
}

/**
 * The seven phases of the Raybot runbook, with their observed outcomes.
 *
 * This constant is the canonical index used by the documentation site; the
 * full step detail lives in the prose pages rather than in code, because the
 * steps are narrative and change with the product.
 */
export const RAYBOT_PHASES: readonly {
  number: number;
  id: string;
  title: string;
  outcome: OutcomeStatus;
  summary: string;
}[] = [
  {
    number: 1,
    id: 'build',
    title: 'Build',
    outcome: 'DONE',
    summary:
      'Create the agent, name it, author instructions, save to mint the agent id, then upload a custom icon within the 100 KB PNG ceiling.',
  },
  {
    number: 2,
    id: 'right-rail',
    title: 'Right rail configuration',
    outcome: 'DONE',
    summary:
      'Attach a public website knowledge source, survey the four tool catalogs, author a blank skill, attempt a connected agent, and enable memory.',
  },
  {
    number: 3,
    id: 'foundry-iq',
    title: 'Foundry IQ knowledge base',
    outcome: 'DONE',
    summary:
      'Provision an Azure AI Search service on Basic tier, create a web knowledge source and a knowledge base over the preview REST surface, verify retrieval, then bind it as Microsoft IQ.',
  },
  {
    number: 4,
    id: 'settings',
    title: 'Settings',
    outcome: 'DONE',
    summary:
      'Walk the four settings tabs: read-only identity, Medium moderation, Authenticate with Microsoft, feedback off, empty conversation start.',
  },
  {
    number: 5,
    id: 'publish-evaluate',
    title: 'Publish, Preview, Evaluate, Monitor',
    outcome: 'PARTIAL',
    summary:
      'Publish inline with no dialog, confirm grounded Preview answers with live citations, run the six-pair evaluation, and read the analytics summary.',
  },
  {
    number: 6,
    id: 'teams',
    title: 'Teams channel',
    outcome: 'BLOCKED',
    summary:
      'Enable the Teams channel, observe the status endpoint fail, and trace the failure to a tenant App Customization Policy consent that was never granted.',
  },
  {
    number: 7,
    id: 'reaudit',
    title: 'Runtime re-audit',
    outcome: 'DONE',
    summary:
      'Re-audit the runtime under a second identity: confirm the Monitor-to-Analytics route change and capture the Workflows designer trigger and node catalogs.',
  },
] as const;
