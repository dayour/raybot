import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * Sidebars are trimmed to pages that exist. Remaining sections are tracked as
 * open issues on the repository and will be restored here as pages land.
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
      items: ['automation/index'],
    },
    {
      type: 'category',
      label: 'Evaluation',
      items: ['evaluation/index'],
    },
    {
      type: 'category',
      label: 'Screenshots',
      items: ['screenshots/index', 'screenshots/gallery'],
    },
    {
      type: 'category',
      label: 'Session forensics',
      items: ['session/index'],
    },
    {
      type: 'category',
      label: 'Reference',
      items: ['reference/errata'],
    },
  ],

  objectModelSidebar: [
    'object-model/index',
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
      items: ['coral-schema/index', 'coral-schema/naming'],
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
