import React, { useMemo, useState } from 'react';

export type ColumnAlign = 'left' | 'right';

export interface Column<T> {
  /** Property key on the row object, or a synthetic id when `render` is used. */
  key: string;
  /** Column header text. */
  header: string;
  /** Optional custom cell renderer. */
  render?: (row: T) => React.ReactNode;
  /** Value used for sorting and for free-text search. Defaults to row[key]. */
  value?: (row: T) => string | number | boolean | null | undefined;
  align?: ColumnAlign;
  sortable?: boolean;
  /** Render the raw value inside a <code> element. */
  mono?: boolean;
}

export interface FacetDef<T> {
  key: string;
  label: string;
  /** Returns the facet value for a row, or null to exclude the row. */
  value: (row: T) => string | null;
}

export interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  /** Fields searched by the free-text box. Defaults to every column value. */
  searchKeys?: (row: T) => string;
  facets?: FacetDef<T>[];
  pageSize?: number;
  initialSort?: { key: string; dir: 'asc' | 'desc' };
  emptyMessage?: string;
  searchPlaceholder?: string;
  noun?: string;
}

function defaultValue<T>(row: T, col: Column<T>) {
  if (col.value) return col.value(row);
  return (row as Record<string, unknown>)[col.key] as
    | string
    | number
    | boolean
    | null
    | undefined;
}

function compare(a: unknown, b: unknown): number {
  const an = a === null || a === undefined || a === '';
  const bn = b === null || b === undefined || b === '';
  if (an && bn) return 0;
  if (an) return 1;
  if (bn) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b ? 0 : a ? -1 : 1;
  }
  return String(a).localeCompare(String(b), 'en', { numeric: true });
}

/**
 * Sortable, filterable, paginated table used across the Coral schema reference.
 *
 * Deliberately dependency-free: the audit datasets are small enough (the
 * largest is 1,627 rows) that client-side filtering is instant, and avoiding a
 * grid library keeps the static bundle small.
 */
export default function DataTable<T>({
  rows,
  columns,
  searchKeys,
  facets = [],
  pageSize = 50,
  initialSort,
  emptyMessage = 'No rows match the current filters.',
  searchPlaceholder = 'Search',
  noun = 'rows',
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [facetState, setFacetState] = useState<Record<string, string>>({});
  const [sort, setSort] = useState(initialSort ?? null);
  const [page, setPage] = useState(0);

  const facetOptions = useMemo(() => {
    const out: Record<string, string[]> = {};
    for (const f of facets) {
      const set = new Set<string>();
      for (const row of rows) {
        const v = f.value(row);
        if (v !== null && v !== undefined && v !== '') set.add(v);
      }
      out[f.key] = Array.from(set).sort((a, b) =>
        a.localeCompare(b, 'en', { numeric: true }),
      );
    }
    return out;
  }, [rows, facets]);

  const searchText = useMemo(() => {
    const fn =
      searchKeys ??
      ((row: T) =>
        columns
          .map((c) => defaultValue(row, c))
          .filter((v) => v !== null && v !== undefined)
          .join(' '));
    return rows.map((r) => fn(r).toLowerCase());
  }, [rows, columns, searchKeys]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const active = facets.filter((f) => facetState[f.key]);
    const out: T[] = [];
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (q && !searchText[i].includes(q)) continue;
      let ok = true;
      for (const f of active) {
        if (f.value(row) !== facetState[f.key]) {
          ok = false;
          break;
        }
      }
      if (ok) out.push(row);
    }
    return out;
  }, [rows, query, facetState, facets, searchText]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filtered;
    const copy = filtered.slice();
    copy.sort((a, b) => {
      const r = compare(defaultValue(a, col), defaultValue(b, col));
      return sort.dir === 'asc' ? r : -r;
    });
    return copy;
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visible = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);

  function toggleSort(col: Column<T>) {
    if (col.sortable === false) return;
    setPage(0);
    setSort((prev) => {
      if (!prev || prev.key !== col.key) return { key: col.key, dir: 'asc' };
      if (prev.dir === 'asc') return { key: col.key, dir: 'desc' };
      return null;
    });
  }

  return (
    <div>
      <div className="raybotToolbar">
        <input
          type="search"
          value={query}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
        />
        {facets.map((f) => (
          <select
            key={f.key}
            aria-label={f.label}
            value={facetState[f.key] ?? ''}
            onChange={(e) => {
              setFacetState((s) => ({ ...s, [f.key]: e.target.value }));
              setPage(0);
            }}
          >
            <option value="">{`All ${f.label.toLowerCase()}`}</option>
            {facetOptions[f.key].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ))}
        <span className="raybotToolbar__count">
          {sorted.length.toLocaleString('en-US')} of{' '}
          {rows.length.toLocaleString('en-US')} {noun}
        </span>
      </div>

      <div className="raybotTableWrap">
        <table className="raybotTable">
          <thead>
            <tr>
              {columns.map((c) => {
                const isSorted = sort?.key === c.key;
                const arrow = isSorted ? (sort!.dir === 'asc' ? ' \u2191' : ' \u2193') : '';
                return (
                  <th
                    key={c.key}
                    data-sortable={c.sortable === false ? 'false' : 'true'}
                    className={c.align === 'right' ? 'raybotTable__num' : undefined}
                    onClick={() => toggleSort(c)}
                    scope="col"
                  >
                    {c.header}
                    {arrow}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="raybotMuted">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {visible.map((row, i) => (
              <tr key={safePage * pageSize + i}>
                {columns.map((c) => {
                  const raw = defaultValue(row, c);
                  let content: React.ReactNode;
                  if (c.render) {
                    content = c.render(row);
                  } else if (raw === null || raw === undefined || raw === '') {
                    content = <span className="raybotMuted">—</span>;
                  } else if (typeof raw === 'boolean') {
                    content = raw ? 'yes' : 'no';
                  } else if (typeof raw === 'number') {
                    content = raw.toLocaleString('en-US');
                  } else if (c.mono) {
                    content = <code>{raw}</code>;
                  } else {
                    content = raw;
                  }
                  return (
                    <td
                      key={c.key}
                      className={c.align === 'right' ? 'raybotTable__num' : undefined}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="raybotPager">
          <button
            type="button"
            onClick={() => setPage(0)}
            disabled={safePage === 0}
          >
            First
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
          >
            Previous
          </button>
          <span>
            Page {safePage + 1} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={safePage >= pageCount - 1}
          >
            Next
          </button>
          <button
            type="button"
            onClick={() => setPage(pageCount - 1)}
            disabled={safePage >= pageCount - 1}
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
}
