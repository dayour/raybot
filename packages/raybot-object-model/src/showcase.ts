/**
 * The Coral showcase workflow catalog, built 2026-06-17 through 2026-06-19.
 *
 * Two distinct bodies of work are modelled here, and they are not versions of
 * each other:
 *
 * 1. A single fully-captured branching workflow (`Incident Triage and Routing`)
 *    built one action at a time with a screenshot after every command. This is
 *    the pedagogical artefact: it shows what the designer does, in order.
 * 2. An eleven-workflow catalog rebuilt on 2026-06-19 against real first-party
 *    connectors. This is the reference artefact: it shows what a production
 *    shape looks like once the designer is understood.
 *
 * The eleven-workflow catalog REPLACED an earlier stub catalog whose workflows
 * contained only Variable, Classify, and Note nodes. The stubs were discarded
 * rather than migrated, because a workflow with no connector and no agent does
 * not exercise the parts of the designer that actually fail. That deliberate
 * discard is why this file models the rebuild as the catalog and does not carry
 * the stub set at all.
 */

import type { Evidenced, Guid } from './common';

/**
 * The environment the showcase catalog was built in.
 *
 * Note that this is NOT the environment Raybot itself lives in. Raybot was
 * built in `Default-6b104499-c49f-45dc-b3a2-df95efd6eeb4`; the showcase
 * workflows were built in the darbotlabs Cypherdyne environment below. Any
 * cross-reference between a Raybot agent id and a showcase flow id is a
 * cross-tenant reference and will not resolve in a single session.
 */
export const SHOWCASE_ENVIRONMENT_ID = 'cf7ff9ef-f698-e22d-b864-28f0b7851614';

/** Workflows designer build observed during the 2026-06-19 rebuild. */
export const SHOWCASE_DESIGNER_VERSION = 'v23.4.2';

/** Workflows designer build observed during the 2026-06-17 Phase 7 re-audit. */
export const REAUDIT_DESIGNER_VERSION = 's01-workflow-designer/22.19.1';

/** The reviewer every Human review gate in the catalog is assigned to. */
export const SHOWCASE_REVIEWER = 'darbot@timelarp.com';

/**
 * The connector family bound to a showcase workflow's first action.
 *
 * `none` is a real, intentional value: three of the eleven workflows are
 * agent-first by design, because their input is a free-text scope rather than
 * a query against an external system. They are not incomplete.
 */
export type ShowcaseConnectorFamily = 'github' | 'office365users' | 'none';

/** A first-party connector action bound into a showcase workflow. */
export interface ShowcaseConnector {
  family: ShowcaseConnectorFamily;
  /** The exact action label as it appears in the picker, or null when agent-first. */
  action: string | null;
  /** The connector parameter the trigger input is bound to, or null when agent-first. */
  boundParameter: string | null;
}

/**
 * One workflow in the eleven-workflow showcase catalog.
 *
 * Every entry follows the same three-part shape: a typed text input, an
 * optional connector, an agent that reduces the connector output to a single
 * machine-readable decision line, and a human gate. The decision signal is the
 * load-bearing part. It exists so that a downstream consumer can branch on one
 * grep-able token instead of parsing free prose, and it is the reason each
 * agent's instructions end with a fixed final line.
 */
export interface ShowcaseWorkflow extends Evidenced {
  /** Catalog ordinal, `01` through `11`, zero-padded to match capture folders. */
  ordinal: string;
  name: string;
  /** The single typed Text input on the Start trigger. */
  input: string;
  connector: ShowcaseConnector;
  /**
   * The uppercase token the agent step is instructed to emit on its final line,
   * for example `ROTATION` or `MERGE_BLOCK`.
   */
  decisionSignal: string;
  /** First eight characters of the flow GUID. Full GUIDs were not exported. */
  flowIdPrefix: string;
  /** Capture folder holding the three per-workflow step stills. */
  captureFolder: string;
}

/**
 * The eleven published showcase workflows.
 *
 * Confidence is `CONFIRMED` throughout: each was driven in the designer, each
 * published successfully, and each has a three-still capture folder plus an
 * annotated full-flow frame.
 */
export const SHOWCASE_WORKFLOWS: readonly ShowcaseWorkflow[] = [
  {
    ordinal: '01',
    name: 'GitHub Key and Token Lifecycle',
    input: 'repoQuery',
    connector: { family: 'github', action: 'Search Github using Query', boundParameter: 'query' },
    decisionSignal: 'ROTATION',
    flowIdPrefix: '15a4f189',
    captureFolder: 'captures-2026-06-18/wf01-real',
    confidence: 'CONFIRMED',
  },
  {
    ordinal: '02',
    name: 'GitHub PR Triage and Review Routing',
    input: 'prQuery',
    connector: { family: 'github', action: 'Search Github using Query', boundParameter: 'query' },
    decisionSignal: 'MERGE_BLOCK',
    flowIdPrefix: '4362af9a',
    captureFolder: 'captures-2026-06-18/wf02-real',
    confidence: 'CONFIRMED',
  },
  {
    ordinal: '03',
    name: 'GitHub Issue Auto-Labeler',
    input: 'issueQuery',
    connector: { family: 'github', action: 'Search Github using Query', boundParameter: 'query' },
    decisionSignal: 'APPLY_LABELS',
    flowIdPrefix: 'c9d8fa92',
    captureFolder: 'captures-2026-06-18/wf03-real',
    confidence: 'CONFIRMED',
  },
  {
    ordinal: '04',
    name: 'Secret Exposure Scan and Alert',
    input: 'secretQuery',
    connector: { family: 'github', action: 'Search Github using Query', boundParameter: 'query' },
    decisionSignal: 'SECRET_EXPOSED',
    flowIdPrefix: 'a10da6bc',
    captureFolder: 'captures-2026-06-18/wf04-real',
    confidence: 'CONFIRMED',
  },
  {
    ordinal: '05',
    name: 'Repo Onboarding Provisioner',
    input: 'repoQuery',
    connector: { family: 'github', action: 'Search Github using Query', boundParameter: 'query' },
    decisionSignal: 'PROVISION',
    flowIdPrefix: 'e3dada34',
    captureFolder: 'captures-2026-06-18/wf05-real',
    confidence: 'CONFIRMED',
  },
  {
    ordinal: '06',
    name: 'Release Notes Generator',
    input: 'releaseQuery',
    connector: { family: 'github', action: 'Search Github using Query', boundParameter: 'query' },
    decisionSignal: 'BREAKING_CHANGES',
    flowIdPrefix: '3825f5a1',
    captureFolder: 'captures-2026-06-18/wf06-real',
    confidence: 'CONFIRMED',
  },
  {
    ordinal: '07',
    name: 'Incident to Teams Bridge',
    input: 'incidentText',
    connector: { family: 'none', action: null, boundParameter: null },
    decisionSignal: 'POST_TO_TEAMS',
    flowIdPrefix: '50074e25',
    captureFolder: 'captures-2026-06-18/wf07-real',
    confidence: 'CONFIRMED',
    note: 'Agent-first by design: the input is free-text incident prose, not a query.',
  },
  {
    ordinal: '08',
    name: 'Quarterly Access Review',
    input: 'accessScope',
    connector: {
      family: 'office365users',
      action: 'Search for users',
      boundParameter: 'searchTerm',
    },
    decisionSignal: 'FLAG_FOR_REVOCATION',
    flowIdPrefix: '0ea6baa7',
    captureFolder: 'captures-2026-06-18/wf08-real',
    confidence: 'CONFIRMED',
    note: 'The only non-GitHub connector in the catalog.',
  },
  {
    ordinal: '09',
    name: 'Dependency Health Monitor',
    input: 'depQuery',
    connector: { family: 'github', action: 'Search Github using Query', boundParameter: 'query' },
    decisionSignal: 'DEPENDENCY_ACTION_REQUIRED',
    flowIdPrefix: 'd4cda0ba',
    captureFolder: 'captures-2026-06-18/wf09-real',
    confidence: 'CONFIRMED',
  },
  {
    ordinal: '10',
    name: 'Docs Capture and Publish Pipeline',
    input: 'docTopic',
    connector: { family: 'none', action: null, boundParameter: null },
    decisionSignal: 'READY_TO_PUBLISH',
    flowIdPrefix: 'cee82ed1',
    captureFolder: 'captures-2026-06-18/wf10-real',
    confidence: 'CONFIRMED',
    note: 'Agent-first by design: the input is a topic, not a query.',
  },
  {
    ordinal: '11',
    name: 'Cloud Key Rotation Orchestrator',
    input: 'keyScope',
    connector: { family: 'none', action: null, boundParameter: null },
    decisionSignal: 'ROTATION_APPROVAL_REQUIRED',
    flowIdPrefix: 'd4a383ef',
    captureFolder: 'captures-2026-06-18/wf11-real',
    confidence: 'CONFIRMED',
    note: 'Agent-first by design: the input is a key scope, not a query.',
  },
] as const;

/** Number of workflows in the showcase catalog. */
export const SHOWCASE_WORKFLOW_COUNT = SHOWCASE_WORKFLOWS.length;

/**
 * The fully-captured reference workflow built on 2026-06-17.
 *
 * This one is modelled separately from the catalog because it is a different
 * kind of artefact: it branches three ways off a Classify node, where every
 * catalog workflow is linear. It is the only capture set in the repository
 * that shows a multi-branch Coral workflow assembled action by action.
 */
export interface IncidentTriageBuildStep {
  /** Zero-padded capture ordinal, `00` through `16`. */
  ordinal: string;
  /** Capture basename, without extension, inside the showcase annotated folder. */
  capture: string;
  /** What the capture shows. */
  description: string;
}

export const INCIDENT_TRIAGE_WORKFLOW_ID: Guid = '29162552-181c-6272-eadf-4638b99c471e';

export const INCIDENT_TRIAGE_BUILD_STEPS: readonly IncidentTriageBuildStep[] = [
  {
    ordinal: '00',
    capture: '00-workflows-list-darbotlabs',
    description: 'Workflows list in the darbotlabs environment; New workflow entry point.',
  },
  {
    ordinal: '01',
    capture: '01-new-blank-canvas',
    description: 'Blank canvas with the single Start (trigger) node; left Add palette.',
  },
  {
    ordinal: '02',
    capture: '02-renamed-workflow',
    description: 'Rename the workflow title to "Incident Triage and Routing".',
  },
  {
    ordinal: '03',
    capture: '03-trigger-input-types',
    description: 'Trigger config: pick an input type.',
  },
  {
    ordinal: '04',
    capture: '04-trigger-input-text-added',
    description: 'Text input incidentText added to the trigger.',
  },
  {
    ordinal: '05',
    capture: '05-add-action-catalog',
    description: 'Add-action catalog (Agent / Classify / Variable and the rest).',
  },
  {
    ordinal: '06',
    capture: '06-node-variable-severity',
    description: 'Variable node: name=severity, Type=String, Value=unclassified.',
  },
  {
    ordinal: '07',
    capture: '07-add-catalog-after-variable',
    description: 'Add next action after Variable, selecting Classify.',
  },
  {
    ordinal: '08',
    capture: '08-classify-configured',
    description: 'Classify configured with Critical / Standard / Other plus descriptions.',
  },
  {
    ordinal: '09',
    capture: '09-human-review-critical-branch',
    description: 'Human review on the Critical branch (config panel).',
  },
  {
    ordinal: '10',
    capture: '10-human-review-configured',
    description: 'Human review configured (Channel=Outlook, inputs mapped).',
  },
  {
    ordinal: '11',
    capture: '11-human-review-complete',
    description: 'Critical branch complete.',
  },
  {
    ordinal: '12',
    capture: '12-agent-standard-branch',
    description: 'Agent node on the Standard branch.',
  },
  {
    ordinal: '13',
    capture: '13-agent-configured-clean',
    description: 'Agent configured, no errors (fit-to-view).',
  },
  {
    ordinal: '14',
    capture: '14-add-catalog-other-branch',
    description: 'Add action on the Other branch.',
  },
  {
    ordinal: '15',
    capture: '15-note-other-branch',
    description: 'Yellow Note (fallback) on the Other branch.',
  },
  {
    ordinal: '16',
    capture: '16-published',
    description: 'Published; success banner, Test enabled.',
  },
] as const;

/**
 * A designer behaviour that cost time during the showcase builds.
 *
 * These are modelled as data rather than prose because several of them are
 * preconditions for any future automation against the designer: an automation
 * that does not close the Agent config panel before opening the next step
 * picker will time out, every time, with no error that explains why.
 */
export interface DesignerPitfall extends Evidenced {
  id: string;
  /** Short statement of the behaviour. */
  symptom: string;
  /** What to do instead. */
  mitigation: string;
  /** Which build surfaced it. */
  observedIn: 'incident-triage' | 'showcase-rebuild';
}

export const DESIGNER_PITFALLS: readonly DesignerPitfall[] = [
  {
    id: 'agent-output-structured-blocks-publish',
    symptom:
      'Selecting Structured output or Custom structured output on an Agent node adds required property fields, producing "Fix 1 error before publishing" and reinstating the Setup needed badge.',
    mitigation:
      'Reselect Text response unless every required property will actually be filled.',
    observedIn: 'incident-triage',
    confidence: 'CONFIRMED',
  },
  {
    id: 'escape-commits-dropdown-value',
    symptom:
      'Pressing Escape while an Output dropdown is open closes the entire node panel and commits an unintended value.',
    mitigation: 'Click the desired option explicitly; never dismiss a dropdown with Escape.',
    observedIn: 'incident-triage',
    confidence: 'CONFIRMED',
  },
  {
    id: 'note-is-canvas-sticky',
    symptom:
      'The Note node (testid action-item-canvasNote) is a canvas sticky, not a step. It is not wired into the flow.',
    mitigation:
      'Double-click to focus its textarea, set the value, then click empty canvas to commit. Use it to document a branch that intentionally has no automated action.',
    observedIn: 'incident-triage',
    confidence: 'CONFIRMED',
  },
  {
    id: 'new-canvas-deeplink-redirects',
    symptom: 'The /flows/new/canvas deep link redirects to /workflows.',
    mitigation:
      'Click the New Workflow primary button via getByTestId("my-work-create").getByText("New Workflow"). The chevron menu only offers New classic workflow, which is a different designer.',
    observedIn: 'showcase-rebuild',
    confidence: 'CONFIRMED',
  },
  {
    id: 'agent-instructions-newline-truncates',
    symptom:
      'A newline or a / character inside Agent instructions opens the slash menu and truncates the instruction.',
    mitigation: 'Type agent instructions as one continuous line with no inline dynamic tokens.',
    observedIn: 'showcase-rebuild',
    confidence: 'CONFIRMED',
  },
  {
    id: 'agent-panel-blocks-next-picker',
    symptom:
      'After saving an Agent step with Ctrl+S the config panel stays open and blocks the next "Add a step after Agent" picker, which then times out with no useful error.',
    mitigation:
      'Close the panel (Close button, then click empty canvas) before adding the next step. Build the Agent and the Human review in separate calls.',
    observedIn: 'showcase-rebuild',
    confidence: 'CONFIRMED',
  },
  {
    id: 'approvals-list-dynamic-properties-500',
    symptom:
      'Configuring Human review spams benign advancedapprovals/listDynamicProperties 500 responses in the console.',
    mitigation:
      'Ignore them. They do not block configuration or publish, and the gate works afterwards.',
    observedIn: 'showcase-rebuild',
    confidence: 'CONFIRMED',
  },
  {
    id: 'test-enables-after-publish-delay',
    symptom: 'The Test button enables several seconds after Publish reports success.',
    mitigation: 'Re-check after a short wait before concluding the publish did not take.',
    observedIn: 'showcase-rebuild',
    confidence: 'CONFIRMED',
  },
] as const;

/**
 * A ranked automation candidate from the 2026-06-18 session-history harvest.
 *
 * The harvest mined 262 titled session plans, 145 skills, and the Coral
 * playbook, then deduplicated against work already in flight. The `overlap`
 * field is the important one: a candidate that overlaps existing work is not
 * discarded, but it is not counted as net-new value either.
 */
export interface AutomationCandidate {
  rank: number;
  name: string;
  /** Why it is worth building. */
  rationale: string;
  /** Existing work it duplicates, or null when net-new. */
  overlap: string | null;
}

export const AUTOMATION_CANDIDATES: readonly AutomationCandidate[] = [
  {
    rank: 1,
    name: 'Bulk Agent Security Hardening',
    rationale: 'Apply web-channel and security settings across an agent fleet in one pass.',
    overlap: null,
  },
  {
    rank: 2,
    name: 'Eval-at-Publish ALM Gate',
    rationale: 'Run evaluations at publish time and block on regression.',
    overlap: null,
  },
  {
    rank: 3,
    name: 'One-Shot Coral Agent Provisioner',
    rationale: 'Parameterized create, configure, publish, and preview in a single pass.',
    overlap: 'coral-agent-builder',
  },
  {
    rank: 4,
    name: 'Dataverse REST Kit / Row-from-Template',
    rationale: 'Token-auth metadata plus create and update, including file columns.',
    overlap: 'dataverse-rest-kit',
  },
  {
    rank: 5,
    name: 'PDF/Doc to Record Persister',
    rationale: 'Write a generated document back to its source row and flag it.',
    overlap: 'pa-flow-pdf-to-record',
  },
  {
    rank: 6,
    name: 'Workshop Environment Pool Provisioner',
    rationale: 'Throttled parallel environment creation for labs.',
    overlap: null,
  },
  {
    rank: 7,
    name: 'HTML Wiki / Showcase Builder',
    rationale: 'Self-contained branded HTML wikis from a repository or session corpus.',
    overlap: null,
  },
  {
    rank: 8,
    name: 'GitHub Repo Bootstrap',
    rationale: 'Standardize CI/CD, issues, and Actions for new repositories.',
    overlap: null,
  },
  {
    rank: 9,
    name: 'Engagement / RoB Report Generator',
    rationale: 'Turn a CRM URL into an enriched HTML engagement report.',
    overlap: null,
  },
  {
    rank: 10,
    name: 'Screenshot/Browser Capture to Doc Pipeline',
    rationale: 'Privacy-safe captures feeding runbooks and wikis.',
    overlap: 'partial',
  },
] as const;

/** Totals reported by the 2026-06-18 session-history harvest. */
export const HARVEST_TOTALS = {
  sessionStateDirectories: 2923,
  titledSessionPlans: 262,
  machineSkills: 100,
  userSkills: 45,
  fleetAgents: 80,
  rankedCandidates: 25,
} as const;
