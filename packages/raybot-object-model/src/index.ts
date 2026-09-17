/**
 * `@raybot/object-model`
 *
 * A typed, evidence-first model of the Raybot agent, the Coral runtime surface
 * it was built in, and the runbook that produced it.
 *
 * Every exported constant traces to a captured screenshot, a recorded network
 * request, or a DOM audit row. Nothing here is inferred from documentation.
 */

export * from './common.js';
export * from './agent.js';
export * from './coral.js';
export * from './semantic-id.js';
export * from './workflow.js';
export * from './runbook.js';
export * from './evaluation.js';
export * from './session.js';
export * from './raybot.js';
