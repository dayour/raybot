/**
 * Live values read out of `@raybot/object-model`.
 *
 * This component exists to make documentation drift a build error. Prose that
 * quotes a model constant should render it through `<ModelValue />` rather than
 * hard-coding it, so that renaming or deleting an export breaks the typecheck
 * and an unknown lookup key breaks static site generation.
 */

import React from 'react';
import {
  CORAL_AREAS,
  EVAL_MAX_CONVERSATION_PAIRS,
  EVAL_REFERENCE_MAX_LENGTH,
  ICON_MAX_BYTES,
  MICROSOFT_IQ_MIN_SKU,
  RAYBOT,
  RAYBOT_PHASES,
  SEARCH_API_VERSION,
  SKILL_DESCRIPTION_MAX_LENGTH,
  SKILL_NAME_MAX_LENGTH,
  WORKFLOW_DESIGNER_MODULE,
  WORKFLOW_NODES,
  WORKFLOW_TRIGGERS,
} from '@raybot/object-model';

const MODEL_VALUES = {
  agentId: RAYBOT.identity.agentId,
  schemaName: RAYBOT.identity.schemaName,
  environmentId: RAYBOT.identity.environmentId,
  environmentName: RAYBOT.identity.environmentName,
  model: RAYBOT.configuration.model,
  iconMaxBytes: ICON_MAX_BYTES,
  iconMaxKilobytes: ICON_MAX_BYTES / 1024,
  skillNameMaxLength: SKILL_NAME_MAX_LENGTH,
  skillDescriptionMaxLength: SKILL_DESCRIPTION_MAX_LENGTH,
  microsoftIqMinSku: MICROSOFT_IQ_MIN_SKU,
  searchApiVersion: SEARCH_API_VERSION,
  evalMaxConversationPairs: EVAL_MAX_CONVERSATION_PAIRS,
  evalReferenceMaxLength: EVAL_REFERENCE_MAX_LENGTH,
  workflowDesignerModule: WORKFLOW_DESIGNER_MODULE,
  workflowNodeCount: WORKFLOW_NODES.length,
  workflowTriggerCount: WORKFLOW_TRIGGERS.length,
  coralAreaCount: CORAL_AREAS.length,
  runbookPhaseCount: RAYBOT_PHASES.length,
} as const satisfies Record<string, string | number>;

export type ModelValueName = keyof typeof MODEL_VALUES;

export interface ModelValueProps {
  /** Key into the model value table. An unknown key throws during the build. */
  name: ModelValueName;
  /** Render as inline code. Defaults to true. */
  code?: boolean;
}

export default function ModelValue({
  name,
  code = true,
}: ModelValueProps): React.ReactElement {
  const value = MODEL_VALUES[name];

  if (value === undefined) {
    throw new Error(
      `ModelValue: unknown name "${String(name)}". Known names: ${Object.keys(
        MODEL_VALUES,
      ).join(', ')}`,
    );
  }

  const rendered = String(value);
  return code ? <code>{rendered}</code> : <>{rendered}</>;
}

export { MODEL_VALUES };
