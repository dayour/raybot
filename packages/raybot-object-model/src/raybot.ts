/**
 * The canonical Raybot instance.
 *
 * This is the agent exactly as it existed at the close of the 2026-06-07 audit
 * and the 2026-06-17 re-audit. It doubles as the reference fixture for the
 * model: every field below was read off a captured surface or a recorded
 * request, and the accompanying evaluation and Microsoft IQ records carry the
 * same provenance.
 */

import type { RaybotAgent } from './agent.js';
import type { EvalRun, EvalTestSet } from './evaluation.js';

/** Raybot, as built. */
export const RAYBOT: RaybotAgent = {
  identity: {
    agentId: '4de4ada9-ad61-4c22-a0d0-a0bd1c189f4e',
    displayName: 'Raybot',
    schemaName: 'Default_Raybot_vyN1Rz',
    environmentId: 'Default-6b104499-c49f-45dc-b3a2-df95efd6eeb4',
    environmentName: 'Cypherdyne',
    description:
      'An expert on Ray and Ray clusters, grounded in the official Ray documentation.',
  },
  configuration: {
    model: 'Claude Sonnet 4.6',
    knowledge: [
      {
        kind: 'publicWebsite',
        name: 'Ray documentation',
        url: 'https://docs.ray.io',
        confidence: 'CONFIRMED',
      },
    ],
    tools: [],
    skills: [
      {
        name: 'ray-cluster-troubleshooter',
        entryMode: 'blank',
        confidence: 'CONFIRMED',
      },
    ],
    connectedAgents: [],
    microsoftIQ: [
      {
        knowledgeBase: 'raybot-kb',
        searchService: 'darbotlm',
        region: 'centralus',
        sku: 'basic',
        knowledgeSources: ['ray-docs-web'],
        apiVersion: '2025-11-01-preview',
        outputMode: 'answerSynthesis',
        retrievalReasoningEffort: 'low',
        synthesisModel: 'gpt-4.1',
        confidence: 'CONFIRMED',
      },
    ],
    memory: { enabled: true },
  },
  settings: {
    details: {
      displayName: 'Raybot',
      schemaName: 'Default_Raybot_vyN1Rz',
      agentId: '4de4ada9-ad61-4c22-a0d0-a0bd1c189f4e',
    },
    security: {
      authentication: 'AuthenticateWithMicrosoft',
      requireSecuredAccess: false,
    },
    generativeAi: {
      moderationLevel: 'Medium',
      userFeedbackEnabled: false,
    },
    conversationStart: {
      greeting: undefined,
      suggestedPrompts: [],
    },
  },
  channels: [
    {
      kind: 'demo',
      uiReportsEnabled: true,
      verifiedReachable: true,
      confidence: 'CONFIRMED',
    },
    {
      kind: 'teams',
      uiReportsEnabled: true,
      verifiedReachable: false,
      blockedReason:
        'Tenant App Customization Policy consent was never granted. The channel status endpoint returns HTTP 500 on every publish and the edit-details payload carries isConsentProvidedToChangeACPToAny=false. The agent never appears under "Built for your org".',
      confidence: 'CONFIRMED',
    },
  ],
  confidence: 'CONFIRMED',
};

/** The six-pair Ray knowledge test set used on the Evaluate tab. */
export const RAYBOT_EVAL_SET: EvalTestSet = {
  name: 'Ray Knowledge Eval - 6Q',
  dataType: 'Conversation',
  cases: [],
  confidence: 'CONFIRMED',
};

/**
 * The single recorded evaluation run.
 *
 * The zero percent score is a runtime limitation, not a quality signal. The
 * draft target returns the system fallback string instead of a grounded answer,
 * and the published target returns HTTP 500. The same six questions answered
 * correctly in Preview with four live docs.ray.io citations.
 */
export const RAYBOT_EVAL_RUN: EvalRun = {
  testSetName: 'Ray Knowledge Eval - 6Q',
  runAt: '2026-06-07T12:47:00Z',
  testedBy: 'Darbot',
  generalQualityPercent: 0,
  passed: 0,
  failed: 6,
  runtimeLimitation:
    'Evaluate runtime limitation. Draft returns the system fallback; Published returns HTTP 500. Preview grounds the identical questions correctly with four docs.ray.io citations, so the agent itself is sound.',
  confidence: 'CONFIRMED',
};

/** Identities that operated on the agent, and in what capacity. */
export const RAYBOT_OPERATORS = [
  {
    upn: 'darbot@timelarp.com',
    role: 'build',
    note: 'Built the agent end to end through the Coral UI.',
  },
  {
    upn: 'dayour@microsoft.com',
    role: 're-audit',
    note: 'Ran the 2026-06-17 re-audit. Copilot-DYdev25, bbf34eea-8ed1-e502-a74c-6a7b21a8b002.',
  },
] as const;
