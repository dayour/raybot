import React from 'react';

export interface StatDef {
  label: string;
  value: number | string;
  hint?: string;
}

/**
 * Grid of headline numbers. Values that are numbers are locale-formatted so
 * the audit totals read consistently across every page.
 */
export default function StatGrid({ stats }: { stats: StatDef[] }) {
  return (
    <div className="raybotStats">
      {stats.map((s) => (
        <div className="raybotStat" key={s.label}>
          <div className="raybotStat__value">
            {typeof s.value === 'number'
              ? s.value.toLocaleString('en-US')
              : s.value}
          </div>
          <div className="raybotStat__label">{s.label}</div>
          {s.hint && <div className="raybotStat__hint">{s.hint}</div>}
        </div>
      ))}
    </div>
  );
}
