/**
 * The Coral schema layer.
 *
 * Coral is the codename for the next-generation Copilot Studio runtime. This
 * module models the two identity systems that the audit established: the UI
 * element layer (`coral.<area>.<surface>.<component>[.<state>]`) and the API
 * route layer (`{namespace}:{surface}:{group}:{operation}`), plus the captured
 * surfaces, elements, and endpoints that populate them.
 */

import type { ConfidenceLevel, Evidenced } from './common.js';

/* ---------------------------------------------------------------- UI layer */

/**
 * Top-level UI region.
 *
 * The area is chosen by where the element lives structurally, not by what it
 * does. Persistent chrome is always `shell` even when it triggers a build
 * action, because the disambiguating value of the segment comes from location.
 */
export type CoralArea =
  | 'shell'
  | 'toolbar'
  | 'build'
  | 'panel'
  | 'dialog'
  | 'preview'
  | 'evaluate'
  | 'monitor';

export const CORAL_AREAS: readonly CoralArea[] = [
  'shell',
  'toolbar',
  'build',
  'panel',
  'dialog',
  'preview',
  'evaluate',
  'monitor',
] as const;

/** Human-readable definition of each area, used by the docs and by linting. */
export const CORAL_AREA_RULES: Record<CoralArea, string> = {
  shell:
    'Persistent app chrome present on every surface: left nav, environment switcher, account pill, skip link.',
  toolbar:
    'The agent command bar: Save, Share, Send feedback, More options, Publish, Customize publish channels, and the designer tablist.',
  build:
    'The Build canvas itself: icon, name, instructions editor, and the editor formatting toolbar.',
  panel:
    'The right-hand Agent configuration rail: Model, Microsoft IQ, Skills, Tools, Knowledge, Connected agents, Memory.',
  dialog:
    'Any modal surface, including every add-* dialog and the four-tab Agent settings dialog.',
  preview: 'The Preview designer tab at the /preview SPA route.',
  evaluate: 'The Evaluate designer tab at the /evaluate SPA route.',
  monitor:
    'The Monitor designer tab, which resolves to the /analytics SPA route in the re-audited runtime.',
};

/**
 * Optional trailing state segment.
 *
 * Apply a state segment only when two elements would otherwise collide, or when
 * the state is semantically load-bearing.
 */
export type CoralStateSegment =
  | 'disabled'
  | 'checked'
  | 'unchecked'
  | `step-${number}`
  | `tab-${string}`
  | `ord-${number}`;

/** A parsed `coral.<area>.<surface>.<component>[.<state>]` identifier. */
export interface CoralSemanticId {
  area: CoralArea;
  /** Dotted surface path, for example `settings.agent-details`. */
  surface: string;
  component: string;
  state?: string;
}

/* --------------------------------------------------------------- API layer */

/**
 * API namespace prefixes established by the ground-truth corpus.
 */
export type ApiNamespace = 'cs' | 'as' | 'ac' | 'lt' | 'fc' | 'evidence' | 'dl';

export const API_NAMESPACES: Record<ApiNamespace, string> = {
  cs: 'Copilot Studio platform',
  as: 'Agent Studio local kit',
  ac: 'Adaptive Card',
  lt: 'Live Tile',
  fc: 'Flashcard',
  evidence: 'Citation and evidence',
  dl: 'Direct Line',
};

/** Surface codes that follow the namespace in an API semantic id. */
export const API_SURFACE_CODES: Record<string, string> = {
  'cs:dv': 'Dataverse Web API',
  'cs:bm': 'Bot Management / Island Gateway',
  'cs:bm:v2': 'Bot Management v2',
  'cs:env': 'Power Platform environment API',
  'cs:bap': 'Business Application Platform',
  'cs:runtime': 'Agentic test runtime',
  'cs:graph': 'Microsoft Graph',
  dl: 'Direct Line',
};

/** A parsed `{namespace}:{surface}:{group}:{operation}` identifier. */
export interface ApiSemanticId {
  namespace: string;
  surface: string;
  group: string;
  operation: string;
}

/* ---------------------------------------------------------------- surfaces */

/**
 * One captured surface: a full DOM dump of a page or dialog.
 *
 * `interactive` and `hasTestId` are tracked independently on purpose. Coral
 * attaches test ids to many non-interactive wrappers, so the presence of a test
 * id is not a signal that an element can be clicked.
 */
export interface CoralSurface {
  /** Dotted surface name, for example `build.main` or `dialog.add-tool`. */
  surface: string;
  /** Filename of the raw DOM dump inside `coral-schema/surfaces/`. */
  dumpFile: string;
  total: number;
  interactive: number;
  hasTestId: number;
  /** Elements carrying a test id that are nonetheless not interactive. */
  testIdOnlyNonInteractive: number;
  /** Interactive elements with no derivable accessible name. */
  missingLabel: number;
  disabled: number;
  notVisible: number;
  /** Visible in layout but covered by another element at their centre point. */
  occludedVisibleNotTopmost: number;
  /** Test ids appearing more than once within this one surface. */
  dupTestIdsInSurface: number;
  uniqueTestIds: number;
  isModal: boolean;
}

/* ---------------------------------------------------------------- elements */

/**
 * How an accessible name was derived for an element.
 *
 * Ordered roughly by strength: an explicit `aria-label` is authoritative, while
 * a name recovered from visible text can drift with copy changes.
 */
export type LabelSource =
  | 'aria-label'
  | 'aria-labelledby'
  | 'title'
  | 'alt'
  | 'placeholder'
  | 'value'
  | 'text'
  | 'testid'
  | 'none';

/** Why the audit classified an element as interactive. */
export type InteractiveReason =
  | 'tag'
  | 'role'
  | 'tabindex'
  | 'onclick'
  | 'contenteditable'
  | 'none';

export interface CoralElement {
  surface: string;
  testId: string | null;
  tag: string;
  role: string | null;
  label: string | null;
  labelSource: string | null;
  isInteractive: boolean;
  interactiveReason: string | null;
  isDisabled: boolean;
}

/** Aggregated view of a single `data-testid` across every surface. */
export interface CoralTestId {
  testId: string;
  occurrences: number;
  surfaces: string[];
  surfaceCount: number;
  /** True when the test id appears on more than one surface. */
  isShared: boolean;
  tags: string[];
  roles: string[];
  anyInteractive: boolean;
  sampleLabel: string | null;
}

/* ----------------------------------------------------------------- network */

/** A host observed serving functional (non-telemetry) traffic. */
export interface ApiHost {
  key: string;
  host: string;
  role: string;
  requestCount: number;
}

/** A single observed endpoint, grouped into a functional domain. */
export interface ApiEndpoint extends Evidenced {
  domain: string;
  domainTitle: string;
  method: string;
  host: string;
  hostName: string;
  /** Path with `{key}` placeholders substituted for observed identifiers. */
  path: string;
  /** Number of times the endpoint was observed during the capture window. */
  count: number;
  purpose: string;
  semanticId: string;
  confidence: ConfidenceLevel;
  status?: string | null;
}

/** Roll-up of the whole audit, as published by `audit-totals.json`. */
export interface AuditTotals {
  generated: string;
  auditDate: string;
  surfaces: number;
  elements: number;
  interactive: number;
  withTestId: number;
  uniqueTestIds: number;
  interactiveMissingLabel: number;
  sharedTestIds: number;
  labelSourceDistribution: Record<string, number>;
  interactiveReasonDistribution: Record<string, number>;
  roleDistribution: Record<string, number>;
  api: {
    allRequests: number;
    functionalApiRequests: number;
    excluded: number;
    statusDistribution: Record<string, number>;
    endpointCount: number;
    domainCount: number;
  };
  gallery: { entries: number; missing: number };
}
