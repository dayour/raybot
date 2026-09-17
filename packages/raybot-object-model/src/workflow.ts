/**
 * The Workflows designer model.
 *
 * Captured during the 2026-06-17 re-audit from module `s01-workflow-designer`
 * version `22.19.1`. Four trigger kinds and thirteen node kinds were each
 * captured individually on a fresh canvas.
 */

import type { Evidenced } from './common.js';

/** How a workflow run begins. */
export type WorkflowTriggerKind =
  | 'manual'
  | 'recurrence'
  | 'event'
  | 'agent';

export interface WorkflowTriggerDefinition {
  kind: WorkflowTriggerKind;
  label: string;
  description: string;
}

/** The four trigger kinds offered when creating a workflow. */
export const WORKFLOW_TRIGGERS: readonly WorkflowTriggerDefinition[] = [
  {
    kind: 'manual',
    label: 'Manually',
    description: 'The workflow runs when a person starts it from the designer.',
  },
  {
    kind: 'recurrence',
    label: 'On a schedule',
    description: 'The workflow runs on a recurrence you configure.',
  },
  {
    kind: 'event',
    label: 'When an event occurs',
    description: 'The workflow runs in response to an external event.',
  },
  {
    kind: 'agent',
    label: 'When an agent calls it',
    description:
      'The workflow is exposed as a tool and runs when an agent invokes it.',
  },
] as const;

/**
 * The thirteen node kinds available from the add-step picker.
 *
 * Each was captured one at a time because the picker closes on selection and
 * the canvas has to be reset before the next capture.
 */
export type WorkflowNodeKind =
  | 'agent'
  | 'classify'
  | 'm365Copilot'
  | 'humanReview'
  | 'connector'
  | 'function'
  | 'variable'
  | 'ifElse'
  | 'loop'
  | 'note'
  | 'switch'
  | 'scope'
  | 'end';

export interface WorkflowNodeDefinition {
  kind: WorkflowNodeKind;
  /** Exact accessible name used by the picker, for role-based location. */
  pickerLabel: string;
  /** What the node does once placed on the canvas. */
  description: string;
  /** True when the node can contain other nodes. */
  isContainer: boolean;
  /** True when the node terminates a branch. */
  isTerminal: boolean;
}

export const WORKFLOW_NODES: readonly WorkflowNodeDefinition[] = [
  {
    kind: 'agent',
    pickerLabel: 'Agent',
    description: 'Hands the current context to an agent and resumes with its reply.',
    isContainer: false,
    isTerminal: false,
  },
  {
    kind: 'classify',
    pickerLabel: 'Classify',
    description: 'Sorts the input into one of a set of maker-defined categories.',
    isContainer: false,
    isTerminal: false,
  },
  {
    kind: 'm365Copilot',
    pickerLabel: 'Microsoft 365 Copilot',
    description: 'Calls Microsoft 365 Copilot over the current tenant context.',
    isContainer: false,
    isTerminal: false,
  },
  {
    kind: 'humanReview',
    pickerLabel: 'Human review',
    description: 'Pauses the run and waits for a person to approve or reject.',
    isContainer: false,
    isTerminal: false,
  },
  {
    kind: 'connector',
    pickerLabel: 'Connector',
    description: 'Invokes a Power Platform connector action.',
    isContainer: false,
    isTerminal: false,
  },
  {
    kind: 'function',
    pickerLabel: 'Function',
    description: 'Evaluates an expression and yields its result.',
    isContainer: false,
    isTerminal: false,
  },
  {
    kind: 'variable',
    pickerLabel: 'Variable',
    description: 'Declares or assigns a workflow-scoped variable.',
    isContainer: false,
    isTerminal: false,
  },
  {
    kind: 'ifElse',
    pickerLabel: 'If/Else',
    description: 'Two-way branch on a boolean condition.',
    isContainer: true,
    isTerminal: false,
  },
  {
    kind: 'loop',
    pickerLabel: 'Loop',
    description: 'Repeats its body over a collection or until a condition holds.',
    isContainer: true,
    isTerminal: false,
  },
  {
    kind: 'note',
    pickerLabel: 'Note',
    description: 'Canvas annotation with no runtime behaviour.',
    isContainer: false,
    isTerminal: false,
  },
  {
    kind: 'switch',
    pickerLabel: 'Switch',
    description: 'N-way branch on a single value.',
    isContainer: true,
    isTerminal: false,
  },
  {
    kind: 'scope',
    pickerLabel: 'Scope',
    description: 'Groups a set of nodes so they can be handled as one unit.',
    isContainer: true,
    isTerminal: false,
  },
  {
    kind: 'end',
    pickerLabel: 'End',
    description: 'Terminates the current branch of the run.',
    isContainer: false,
    isTerminal: true,
  },
] as const;

/** A node placed on a concrete workflow canvas. */
export interface WorkflowNode extends Evidenced {
  id: string;
  kind: WorkflowNodeKind;
  displayName?: string;
  /** Ids of the nodes this node hands control to. */
  next?: string[];
  /** Populated for container nodes. */
  children?: WorkflowNode[];
}

/** A workflow definition. */
export interface Workflow extends Evidenced {
  name: string;
  trigger: WorkflowTriggerKind;
  nodes: WorkflowNode[];
  /** Designer module version the definition was captured against. */
  designerModule?: string;
}

/** Designer module identified during the re-audit. */
export const WORKFLOW_DESIGNER_MODULE = 's01-workflow-designer/22.19.1';

/** Lookup helper keyed by node kind. */
export const WORKFLOW_NODE_BY_KIND: Record<
  WorkflowNodeKind,
  WorkflowNodeDefinition
> = Object.fromEntries(
  WORKFLOW_NODES.map((n) => [n.kind, n]),
) as Record<WorkflowNodeKind, WorkflowNodeDefinition>;
