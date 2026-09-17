/**
 * Shared primitives used across the whole Raybot object model.
 *
 * Every fact recorded by the audit carries a confidence level. Nothing in this
 * model is allowed to assert a value without declaring how that value was
 * established, because the entire build was observational: it was produced by
 * driving a browser and recording what happened, not by reading a published
 * specification.
 */

/**
 * How a recorded fact was established.
 *
 * - `CONFIRMED` - observed directly in the running product: a DOM dump, a
 *   captured network request, or a screenshot showing the resulting state.
 * - `SOURCE-INSPECTED` - read out of shipped client source (bundle, sourcemap,
 *   or manifest) but never exercised at runtime during the audit.
 * - `UNCONFIRMED` - inferred from naming, adjacency, or documentation, with no
 *   direct observation behind it.
 */
export type ConfidenceLevel = 'CONFIRMED' | 'SOURCE-INSPECTED' | 'UNCONFIRMED';

export const CONFIDENCE_LEVELS: readonly ConfidenceLevel[] = [
  'CONFIRMED',
  'SOURCE-INSPECTED',
  'UNCONFIRMED',
] as const;

/** Ordering helper: lower is stronger evidence. */
export const CONFIDENCE_RANK: Record<ConfidenceLevel, number> = {
  CONFIRMED: 0,
  'SOURCE-INSPECTED': 1,
  UNCONFIRMED: 2,
};

/** Any object-model node that can declare its evidential basis. */
export interface Evidenced {
  confidence: ConfidenceLevel;
  /**
   * Capture filenames, dump filenames, or request ids that back the claim.
   * Relative to the audit repository root.
   */
  evidence?: string[];
  /** Free-text qualifier, used when a claim is true only under conditions. */
  note?: string | null;
}

/** An ISO-8601 date, `YYYY-MM-DD`. */
export type IsoDate = string;

/** An ISO-8601 instant, `YYYY-MM-DDTHH:mm:ssZ`. */
export type IsoInstant = string;

/** A GUID in canonical 8-4-4-4-12 lowercase form. */
export type Guid = string;

/** Outcome of a runbook phase, step, or channel activation. */
export type OutcomeStatus =
  | 'DONE'
  | 'PARTIAL'
  | 'BLOCKED'
  | 'FAILED'
  | 'NOT-ATTEMPTED';

/** Convenience guard for {@link ConfidenceLevel}. */
export function isConfidenceLevel(value: unknown): value is ConfidenceLevel {
  return (
    typeof value === 'string' &&
    (CONFIDENCE_LEVELS as readonly string[]).includes(value)
  );
}

/**
 * Returns the weakest confidence among the inputs.
 *
 * A composite claim can never be stronger than its weakest component, so
 * aggregating a phase, a surface, or a whole document uses this rule.
 */
export function weakestConfidence(
  levels: readonly ConfidenceLevel[],
): ConfidenceLevel {
  let worst: ConfidenceLevel = 'CONFIRMED';
  for (const level of levels) {
    if (CONFIDENCE_RANK[level] > CONFIDENCE_RANK[worst]) worst = level;
  }
  return worst;
}
