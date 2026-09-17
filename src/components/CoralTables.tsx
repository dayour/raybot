import React from 'react';
import DataTable, { Column } from './DataTable';
import { ConfidenceBadge } from './Badge';
import surfacesData from '@site/data/surfaces.json';
import testIdsData from '@site/data/testids.json';
import elementsData from '@site/data/elements.json';
import labelGapsData from '@site/data/label-gaps.json';
import endpointsData from '@site/data/api-endpoints.json';
import hostsData from '@site/data/api-hosts.json';

export interface SurfaceRow {
  surface: string;
  dumpFile: string;
  total: number;
  interactive: number;
  hasTestId: number;
  testIdOnlyNonInteractive: number;
  missingLabel: number;
  disabled: number;
  notVisible: number;
  occludedVisibleNotTopmost: number;
  dupTestIdsInSurface: number;
  uniqueTestIds: number;
  isModal: boolean;
  dumpFileExists: boolean;
}

export interface TestIdRow {
  testId: string;
  occurrences: number;
  surfaces: string[];
  surfaceCount: number;
  isShared: boolean;
  tags: string[];
  roles: string[];
  anyInteractive: boolean;
  sampleLabel: string | null;
}

export interface ElementRow {
  surface: string;
  testId: string | null;
  tag: string;
  role: string | null;
  label: string | null;
  labelSource: string | null;
  isInteractive: boolean;
  interactiveReason: string | null;
  isDisabled: boolean;
}

export interface EndpointRow {
  domain: string;
  domainTitle: string;
  method: string;
  host: string;
  hostName: string;
  path: string;
  count: number;
  purpose: string;
  semanticId: string;
  confidence: string;
  status?: string | null;
  note?: string | null;
}

export interface HostRow {
  key: string;
  host: string;
  role: string;
  requestCount: number;
}

const surfaces = surfacesData as SurfaceRow[];
const testIds = testIdsData as TestIdRow[];
const elements = elementsData as ElementRow[];
const endpoints = endpointsData as EndpointRow[];
const hosts = hostsData as HostRow[];

/* ------------------------------------------------------------- surfaces --- */

export function SurfaceTable() {
  const columns: Column<SurfaceRow>[] = [
    { key: 'surface', header: 'Surface', mono: true },
    { key: 'total', header: 'Elements', align: 'right' },
    { key: 'interactive', header: 'Interactive', align: 'right' },
    { key: 'hasTestId', header: 'With testid', align: 'right' },
    { key: 'uniqueTestIds', header: 'Unique testids', align: 'right' },
    { key: 'missingLabel', header: 'Label gaps', align: 'right' },
    { key: 'disabled', header: 'Disabled', align: 'right' },
    { key: 'notVisible', header: 'Not visible', align: 'right' },
    {
      key: 'occludedVisibleNotTopmost',
      header: 'Occluded',
      align: 'right',
    },
    { key: 'dupTestIdsInSurface', header: 'Dup testids', align: 'right' },
  ];
  return (
    <DataTable
      rows={surfaces}
      columns={columns}
      noun="surfaces"
      pageSize={20}
      initialSort={{ key: 'total', dir: 'desc' }}
      searchPlaceholder="Search surfaces"
      facets={[
        {
          key: 'kind',
          label: 'kinds',
          value: (r) => (r.isModal ? 'dialog' : 'page'),
        },
      ]}
      searchKeys={(r) => `${r.surface} ${r.dumpFile}`}
    />
  );
}

/* -------------------------------------------------------------- test ids -- */

export function TestIdTable() {
  const columns: Column<TestIdRow>[] = [
    { key: 'testId', header: 'data-testid', mono: true },
    { key: 'occurrences', header: 'Occurrences', align: 'right' },
    { key: 'surfaceCount', header: 'Surfaces', align: 'right' },
    {
      key: 'surfaces',
      header: 'Appears on',
      sortable: false,
      render: (r) => (
        <span className="raybotMuted">{r.surfaces.join(', ')}</span>
      ),
      value: (r) => r.surfaces.join(' '),
    },
    {
      key: 'roles',
      header: 'Roles',
      sortable: false,
      value: (r) => r.roles.join(' '),
      render: (r) =>
        r.roles.length ? (
          <code>{r.roles.join(', ')}</code>
        ) : (
          <span className="raybotMuted">—</span>
        ),
    },
    { key: 'anyInteractive', header: 'Interactive' },
    { key: 'sampleLabel', header: 'Sample label' },
  ];
  return (
    <DataTable
      rows={testIds}
      columns={columns}
      noun="test ids"
      pageSize={50}
      initialSort={{ key: 'testId', dir: 'asc' }}
      searchPlaceholder="Search test ids and labels"
      facets={[
        {
          key: 'shared',
          label: 'scopes',
          value: (r) => (r.isShared ? 'shared' : 'single-surface'),
        },
        {
          key: 'interactive',
          label: 'kinds',
          value: (r) => (r.anyInteractive ? 'interactive' : 'static'),
        },
      ]}
      searchKeys={(r) =>
        `${r.testId} ${r.sampleLabel ?? ''} ${r.surfaces.join(' ')}`
      }
    />
  );
}

/* -------------------------------------------------------------- elements -- */

export function ElementTable() {
  const columns: Column<ElementRow>[] = [
    { key: 'surface', header: 'Surface', mono: true },
    { key: 'tag', header: 'Tag', mono: true },
    { key: 'role', header: 'Role', mono: true },
    { key: 'testId', header: 'data-testid', mono: true },
    { key: 'label', header: 'Derived label' },
    { key: 'labelSource', header: 'Label source' },
    { key: 'interactiveReason', header: 'Interactive reason' },
    { key: 'isDisabled', header: 'Disabled' },
  ];
  return (
    <DataTable
      rows={elements}
      columns={columns}
      noun="elements"
      pageSize={60}
      searchPlaceholder="Search labels, test ids, tags"
      facets={[
        { key: 'surface', label: 'surfaces', value: (r) => r.surface },
        { key: 'role', label: 'roles', value: (r) => r.role ?? 'none' },
        {
          key: 'interactive',
          label: 'kinds',
          value: (r) => (r.isInteractive ? 'interactive' : 'static'),
        },
        {
          key: 'labelSource',
          label: 'label sources',
          value: (r) => r.labelSource ?? 'none',
        },
      ]}
      searchKeys={(r) =>
        `${r.surface} ${r.tag} ${r.role ?? ''} ${r.testId ?? ''} ${r.label ?? ''}`
      }
    />
  );
}

/* ------------------------------------------------------------ label gaps -- */

export function LabelGapTable() {
  const rows = labelGapsData as Array<Record<string, unknown>>;
  const keys = rows.length > 0 ? Object.keys(rows[0]) : [];
  const columns: Column<Record<string, unknown>>[] = keys.map((k) => ({
    key: k,
    header: k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
    mono: ['surface', 'testid', 'tag', 'role', 'type'].includes(k.toLowerCase()),
  }));
  return (
    <DataTable
      rows={rows}
      columns={columns}
      noun="label gaps"
      pageSize={50}
      initialSort={{ key: 'surface', dir: 'asc' }}
      searchPlaceholder="Search label gaps"
      facets={[
        {
          key: 'surface',
          label: 'surfaces',
          value: (r) => String(r.surface ?? ''),
        },
        { key: 'tag', label: 'tags', value: (r) => String(r.tag ?? '') },
        { key: 'role', label: 'roles', value: (r) => String(r.role ?? 'none') },
      ]}
    />
  );
}

/* --------------------------------------------------------- shared testids - */

/**
 * Derived from the full test id index rather than the audit's own
 * `sharedTestIdsAcrossSurfaces` array, which publishes only the top 40 rows.
 */
export function SharedTestIdTable() {
  const rows = testIds.filter((t) => t.isShared);
  const columns: Column<TestIdRow>[] = [
    { key: 'testId', header: 'data-testid', mono: true },
    { key: 'surfaceCount', header: 'Surfaces', align: 'right' },
    { key: 'occurrences', header: 'Occurrences', align: 'right' },
    {
      key: 'surfaces',
      header: 'Appears on',
      sortable: false,
      value: (r) => r.surfaces.join(' '),
      render: (r) => (
        <span className="raybotMuted">{r.surfaces.join(', ')}</span>
      ),
    },
    { key: 'anyInteractive', header: 'Interactive' },
    { key: 'sampleLabel', header: 'Sample label' },
  ];
  return (
    <DataTable
      rows={rows}
      columns={columns}
      noun="shared test ids"
      pageSize={50}
      initialSort={{ key: 'surfaceCount', dir: 'desc' }}
      searchPlaceholder="Search shared test ids"
    />
  );
}

/* ------------------------------------------------------------- api tables - */

export function EndpointTable() {
  const columns: Column<EndpointRow>[] = [
    { key: 'method', header: 'Method', mono: true },
    { key: 'hostName', header: 'Host', mono: true },
    { key: 'path', header: 'Path', mono: true },
    { key: 'count', header: 'Requests', align: 'right' },
    { key: 'semanticId', header: 'Semantic id', mono: true },
    { key: 'purpose', header: 'Purpose' },
    {
      key: 'confidence',
      header: 'Confidence',
      render: (r) => <ConfidenceBadge level={r.confidence} />,
    },
  ];
  return (
    <DataTable
      rows={endpoints}
      columns={columns}
      noun="endpoints"
      pageSize={30}
      initialSort={{ key: 'count', dir: 'desc' }}
      searchPlaceholder="Search paths, purposes, semantic ids"
      facets={[
        { key: 'domain', label: 'domains', value: (r) => r.domain },
        { key: 'host', label: 'hosts', value: (r) => r.host },
        { key: 'method', label: 'methods', value: (r) => r.method },
        { key: 'confidence', label: 'confidence', value: (r) => r.confidence },
      ]}
      searchKeys={(r) =>
        `${r.method} ${r.path} ${r.purpose} ${r.semanticId} ${r.domainTitle}`
      }
    />
  );
}

export function HostTable() {
  const columns: Column<HostRow>[] = [
    { key: 'key', header: 'Key', mono: true },
    { key: 'host', header: 'Host', mono: true },
    { key: 'role', header: 'Role' },
    { key: 'requestCount', header: 'Requests', align: 'right' },
  ];
  return (
    <DataTable
      rows={hosts}
      columns={columns}
      noun="hosts"
      pageSize={20}
      initialSort={{ key: 'requestCount', dir: 'desc' }}
      searchPlaceholder="Search hosts"
    />
  );
}

export { surfaces, testIds, elements, endpoints, hosts };
