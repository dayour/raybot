import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * Every id below must resolve to a file in `docs/`, and every relative link in
 * those files must resolve, because `onBrokenLinks` is set to `throw`. Both are
 * deliberate: a sidebar is the only structural index of the site, and a silent
 * gap in it is indistinguishable from a page that was never written.
 *
 * The tree currently covers all 66 doc pages. `schemaSidebar` stays a single
 * sidebar while its two categories hold nine and four pages; it splits if
 * either exceeds ten. Versioning is deliberately off -- see
 * `docs/reference/versioning.md` for the trigger that would turn it on.
 */
const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Overview',
      collapsed: false,
      items: [
        'overview/identity',
        'overview/architecture',
        'overview/repository-layout',
        'overview/glossary',
      ],
    },
    {
      type: 'category',
      label: 'Runbook',
      collapsed: false,
      items: [
        'runbook/index',
        'runbook/phase-1-build',
        'runbook/phase-2-right-rail',
        'runbook/phase-3-foundry-iq',
        'runbook/phase-4-settings',
        'runbook/phase-5-publish-evaluate',
        'runbook/phase-6-teams',
        'runbook/phase-7-reaudit',
        'runbook/legacy',
      ],
    },
    {
      type: 'category',
      label: 'Automation',
      items: [
        'automation/index',
        'automation/playwright-mcp',
        'automation/capture-patterns',
        'automation/workflow-node-capture',
        'automation/darbot-browser-mcp',
        'automation/scripts',
      ],
    },
    {
      type: 'category',
      label: 'Evaluation',
      items: ['evaluation/index', 'evaluation/evalset', 'evaluation/results'],
    },
    {
      type: 'category',
      label: 'Screenshots',
      items: [
        'screenshots/index',
        'screenshots/gallery',
        'screenshots/map',
        'screenshots/analysis',
      ],
    },
    {
      type: 'category',
      label: 'Session forensics',
      items: [
        'session/index',
        'session/command-reference',
        'session/store-queries',
        'session/provenance',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/constraints',
        'reference/troubleshooting',
        'reference/versioning',
        'reference/changelog',
        'reference/errata',
      ],
    },
  ],

  objectModelSidebar: [
    'object-model/index',
    'object-model/live-values',
    {
      type: 'category',
      label: 'Agent',
      collapsed: false,
      items: [
        'object-model/agent',
        'object-model/identity',
        'object-model/knowledge',
        'object-model/tools',
        'object-model/skills',
        'object-model/connected-agents',
        'object-model/memory',
        'object-model/settings',
        'object-model/publishing',
      ],
    },
    {
      type: 'category',
      label: 'Platform',
      collapsed: false,
      items: [
        'object-model/evaluation',
        'object-model/workflow',
        'object-model/coral-surface',
      ],
    },
    {
      type: 'category',
      label: 'Provenance',
      collapsed: false,
      items: ['object-model/runbook', 'object-model/session'],
    },
    'object-model/json-schemas',
    {
      type: 'category',
      label: 'SDK',
      collapsed: false,
      items: ['sdk/index'],
    },
  ],

  schemaSidebar: [
    {
      type: 'category',
      label: 'Coral schema',
      collapsed: false,
      items: [
        'coral-schema/index',
        'coral-schema/naming',
        'coral-schema/confidence',
        'coral-schema/surfaces',
        'coral-schema/testid-catalog',
        'coral-schema/shared-testids',
        'coral-schema/element-explorer',
        'coral-schema/label-gaps',
        'coral-schema/metrics',
      ],
    },
    {
      type: 'category',
      label: 'API surface',
      collapsed: false,
      items: ['api/index', 'api/hosts', 'api/endpoints', 'api/ground-truth'],
    },
  ],
};

export default sidebars;
