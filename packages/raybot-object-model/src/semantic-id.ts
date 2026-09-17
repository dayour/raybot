/**
 * Parsers and formatters for the two Coral identifier systems.
 *
 * Both systems are positional, so both are cheap to parse and cheap to
 * validate. The parsers are deliberately strict: an identifier that does not
 * decompose cleanly is a bug in the caller, not something to guess at.
 */

import type {
  ApiSemanticId,
  CoralArea,
  CoralSemanticId,
} from './coral.js';
import { API_NAMESPACES, CORAL_AREAS } from './coral.js';

/** Thrown when an identifier cannot be parsed. */
export class SemanticIdError extends Error {
  constructor(
    message: string,
    readonly input: string,
  ) {
    super(`${message}: ${JSON.stringify(input)}`);
    this.name = 'SemanticIdError';
  }
}

const CORAL_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isCoralArea(value: string): value is CoralArea {
  return (CORAL_AREAS as readonly string[]).includes(value);
}

/**
 * Parses a `coral.<area>.<surface>.<component>[.<state>]` identifier.
 *
 * The surface segment may itself be dotted, for example
 * `settings.agent-details`. Because of that the parse is anchored from both
 * ends: the first segment after `coral` is the area, the last segment is the
 * component unless a recognised state suffix is present, and everything left
 * over in the middle is the surface.
 *
 * @throws {SemanticIdError} when the identifier is not well formed.
 */
export function parseCoralId(id: string): CoralSemanticId {
  if (typeof id !== 'string' || id.length === 0) {
    throw new SemanticIdError('empty coral id', String(id));
  }
  const parts = id.split('.');
  if (parts[0] !== 'coral') {
    throw new SemanticIdError('coral id must start with "coral"', id);
  }
  if (parts.length < 4) {
    throw new SemanticIdError(
      'coral id needs at least coral.<area>.<surface>.<component>',
      id,
    );
  }
  const area = parts[1]!;
  if (!isCoralArea(area)) {
    throw new SemanticIdError(`unknown coral area "${area}"`, id);
  }

  const rest = parts.slice(2);
  for (const segment of rest) {
    if (!CORAL_SEGMENT.test(segment)) {
      throw new SemanticIdError(`invalid segment "${segment}"`, id);
    }
  }

  let state: string | undefined;
  let tail = rest;
  const last = rest[rest.length - 1]!;
  if (rest.length >= 3 && isStateSegment(last)) {
    state = last;
    tail = rest.slice(0, -1);
  }

  const component = tail[tail.length - 1]!;
  const surface = tail.slice(0, -1).join('.');
  if (!surface) {
    throw new SemanticIdError('coral id is missing a surface segment', id);
  }

  return state === undefined
    ? { area, surface, component }
    : { area, surface, component, state };
}

const STATE_LITERALS = new Set(['disabled', 'checked', 'unchecked']);

/** Returns true when a trailing segment follows the state-suffix rules. */
export function isStateSegment(segment: string): boolean {
  if (STATE_LITERALS.has(segment)) return true;
  if (/^step-\d+$/.test(segment)) return true;
  if (/^ord-\d+$/.test(segment)) return true;
  if (/^tab-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment)) return true;
  return false;
}

/** Renders a {@link CoralSemanticId} back into its canonical string form. */
export function formatCoralId(id: CoralSemanticId): string {
  const segments = ['coral', id.area, id.surface, id.component];
  if (id.state) segments.push(id.state);
  return segments.join('.');
}

/** Non-throwing variant of {@link parseCoralId}. */
export function tryParseCoralId(id: string): CoralSemanticId | null {
  try {
    return parseCoralId(id);
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------- API ids ---- */

const API_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9-]*$/;

/**
 * Parses a `{namespace}:{surface}:{group}:{operation}` API identifier.
 *
 * Some real identifiers carry a versioned surface such as `cs:bm:v2:...`, which
 * yields five colon-separated segments. In that case the version is folded into
 * the surface so that `cs:bm:v2:publish:post` parses with surface `bm:v2`.
 *
 * @throws {SemanticIdError} when the identifier is not well formed.
 */
export function parseApiId(id: string): ApiSemanticId {
  if (typeof id !== 'string' || id.length === 0) {
    throw new SemanticIdError('empty api id', String(id));
  }
  const parts = id.split(':');
  if (parts.length < 4) {
    throw new SemanticIdError(
      'api id needs at least namespace:surface:group:operation',
      id,
    );
  }
  for (const segment of parts) {
    if (!API_SEGMENT.test(segment)) {
      throw new SemanticIdError(`invalid segment "${segment}"`, id);
    }
  }
  const namespace = parts[0]!;
  const operation = parts[parts.length - 1]!;
  const group = parts[parts.length - 2]!;
  const surface = parts.slice(1, -2).join(':');
  return { namespace, surface, group, operation };
}

/** Renders an {@link ApiSemanticId} back into its canonical string form. */
export function formatApiId(id: ApiSemanticId): string {
  return [id.namespace, id.surface, id.group, id.operation].join(':');
}

/** Non-throwing variant of {@link parseApiId}. */
export function tryParseApiId(id: string): ApiSemanticId | null {
  try {
    return parseApiId(id);
  } catch {
    return null;
  }
}

/** True when the namespace is one of the registered ground-truth namespaces. */
export function isKnownApiNamespace(namespace: string): boolean {
  return Object.prototype.hasOwnProperty.call(API_NAMESPACES, namespace);
}

/* ------------------------------------------------------ testid conversion - */

/**
 * Normalizes a raw Coral `data-testid` into semantic id segments.
 *
 * Coral test ids mix dotted and dashed styles and are tied to internal
 * component names, so this is a best-effort normalization rather than a total
 * function. It strips the conventional `agent-` prefix and the conventional
 * `-button` / `-trigger` suffixes, then splits on the first dot.
 *
 * The result still needs an `area` and a `surface`, which only a human or a
 * surface-aware lookup can supply, so the return value is a partial id.
 */
export function normalizeTestId(testId: string): {
  component: string;
  hint: string | null;
} {
  const [head, ...tailParts] = testId.split('.');
  const tail = tailParts.join('.');
  const raw = tail || head || '';
  const component = raw
    .replace(/^agent-/, '')
    .replace(/-(button|trigger|toggle|input|entry)$/, '')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
  return {
    component: component || testId.toLowerCase(),
    hint: tail ? (head ?? null) : null,
  };
}
