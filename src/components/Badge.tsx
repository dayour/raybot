import React from 'react';

export type BadgeTone =
  | 'confirmed'
  | 'sourceInspected'
  | 'unconfirmed'
  | 'ok'
  | 'warn'
  | 'fail'
  | 'blocked'
  | 'neutral';

const CONFIDENCE_TONE: Record<string, BadgeTone> = {
  CONFIRMED: 'confirmed',
  'SOURCE-INSPECTED': 'sourceInspected',
  UNCONFIRMED: 'unconfirmed',
};

const STATUS_TONE: Record<string, BadgeTone> = {
  OK: 'ok',
  PASS: 'ok',
  DONE: 'ok',
  PARTIAL: 'warn',
  WARN: 'warn',
  FAIL: 'fail',
  BLOCKED: 'blocked',
};

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
}) {
  return <span className={`raybotBadge raybotBadge--${tone}`}>{children}</span>;
}

/** Renders a CONFIRMED / SOURCE-INSPECTED / UNCONFIRMED confidence level. */
export function ConfidenceBadge({ level }: { level?: string | null }) {
  if (!level) return <span className="raybotMuted">—</span>;
  return <Badge tone={CONFIDENCE_TONE[level] ?? 'neutral'}>{level}</Badge>;
}

/** Renders a runbook or channel status token. */
export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="raybotMuted">—</span>;
  const key = status.toUpperCase();
  return <Badge tone={STATUS_TONE[key] ?? 'neutral'}>{status}</Badge>;
}

/** Renders an HTTP status code with success/failure tone. */
export function HttpBadge({ code }: { code: number | string }) {
  const n = typeof code === 'number' ? code : Number(code);
  let tone: BadgeTone = 'neutral';
  if (!Number.isNaN(n)) {
    if (n >= 200 && n < 300) tone = 'ok';
    else if (n >= 400 && n < 500) tone = 'warn';
    else if (n >= 500) tone = 'fail';
  } else {
    tone = 'fail';
  }
  return <Badge tone={tone}>{String(code)}</Badge>;
}

export default Badge;
