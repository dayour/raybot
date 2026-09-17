/**
 * The evaluation model.
 *
 * Copilot Studio evaluations are driven by a CSV test set. The importer accepts
 * a three-column shape and caps a single conversation-type set at six pairs.
 */

import type { Evidenced, IsoInstant } from './common.js';

/** Test-set data type offered by the evaluation importer. */
export type EvalDataType = 'Conversation' | 'SingleTurn';

/** One question-and-expected-response pair. */
export interface EvalTestCase {
  /** 1-based conversation ordinal, the CSV's first column. */
  conversationNumber: number;
  question: string;
  /** Expected or reference response. */
  response: string;
}

/** A complete evaluation test set. */
export interface EvalTestSet extends Evidenced {
  name: string;
  dataType: EvalDataType;
  cases: EvalTestCase[];
}

/** Per-case outcome from an evaluation run. */
export interface EvalCaseResult {
  conversationNumber: number;
  passed: boolean;
  /** The response the agent actually produced. */
  actualResponse?: string;
  failureReason?: string;
}

/** The result of one evaluation run. */
export interface EvalRun extends Evidenced {
  testSetName: string;
  runAt?: IsoInstant;
  testedBy?: string;
  /** General quality score as reported by the Evaluate tab, 0 to 100. */
  generalQualityPercent: number;
  passed: number;
  failed: number;
  results?: EvalCaseResult[];
  /**
   * Set when the score reflects a platform limitation rather than agent
   * behaviour. Raybot scored zero percent while the identical questions
   * grounded correctly in Preview with live citations.
   */
  runtimeLimitation?: string;
}

/** Maximum number of conversation pairs accepted in one imported test set. */
export const EVAL_MAX_CONVERSATION_PAIRS = 6;

/** Maximum character length enforced on the Reference response field. */
export const EVAL_REFERENCE_MAX_LENGTH = 1000;

/** Column order required by the evaluation CSV importer. */
export const EVAL_CSV_COLUMNS = [
  'conversationNumber',
  'question',
  'response',
] as const;

/**
 * Validates a test set against the importer's observed constraints.
 *
 * Returns a list of human-readable problems; an empty list means the set will
 * import cleanly.
 */
export function validateEvalTestSet(set: EvalTestSet): string[] {
  const problems: string[] = [];
  if (set.cases.length === 0) {
    problems.push('Test set contains no cases.');
  }
  if (
    set.dataType === 'Conversation' &&
    set.cases.length > EVAL_MAX_CONVERSATION_PAIRS
  ) {
    problems.push(
      `Conversation test sets accept at most ${EVAL_MAX_CONVERSATION_PAIRS} pairs; got ${set.cases.length}.`,
    );
  }
  const seen = new Set<number>();
  for (const c of set.cases) {
    if (!Number.isInteger(c.conversationNumber) || c.conversationNumber < 1) {
      problems.push(
        `conversationNumber must be a positive integer; got ${String(c.conversationNumber)}.`,
      );
    }
    if (seen.has(c.conversationNumber)) {
      problems.push(`Duplicate conversationNumber ${c.conversationNumber}.`);
    }
    seen.add(c.conversationNumber);
    if (!c.question.trim()) {
      problems.push(`Case ${c.conversationNumber} has an empty question.`);
    }
    if (!c.response.trim()) {
      problems.push(`Case ${c.conversationNumber} has an empty response.`);
    }
    if (c.response.length > EVAL_REFERENCE_MAX_LENGTH) {
      problems.push(
        `Case ${c.conversationNumber} response is ${c.response.length} characters; the field caps at ${EVAL_REFERENCE_MAX_LENGTH}.`,
      );
    }
  }
  return problems;
}
