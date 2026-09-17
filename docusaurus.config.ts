import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const ORG = 'dayour';
const PROJECT = 'raybot';
const SOURCE_REPO = 'https://github.com/DarbotLM/raybot';

const config: Config = {
  title: 'Raybot',
  tagline:
    'Object model, runbook, and Coral ground-truth schema for a Ray expert agent built UI-only in Copilot Studio',
  favicon: 'img/raybot-logo.svg',

  url: `https://${ORG}.github.io`,
  baseUrl: `/${PROJECT}/`,

  organizationName: ORG,
  projectName: PROJECT,
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',
  onBrokenMarkdownLinks: 'warn',
  onDuplicateRoutes: 'throw',

  markdown: {
    mermaid: true,
  },
  themes: [
    '@docusaurus/theme-mermaid',
    [
      // Local, build-time search index. No third-party service, no network
      // call, and no API key -- the index ships as a static asset alongside
      // the site, which matters because this content is an internal audit.
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        indexPages: true,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        searchResultLimits: 12,
        searchBarShortcutHint: false,
      },
    ],
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          editUrl: `https://github.com/${ORG}/${PROJECT}/tree/main/`,
          showLastUpdateTime: false,
          breadcrumbs: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/raybot-logo.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: false,
      },
    },
    navbar: {
      title: 'Raybot',
      logo: {
        alt: 'Raybot',
        src: 'img/raybot-logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'docSidebar',
          sidebarId: 'objectModelSidebar',
          position: 'left',
          label: 'Object Model',
        },
        {
          type: 'docSidebar',
          sidebarId: 'schemaSidebar',
          position: 'left',
          label: 'Coral Schema',
        },
        { to: '/docs/screenshots/gallery', label: 'Gallery', position: 'left' },
        {
          href: SOURCE_REPO,
          label: 'Audit repo',
          position: 'right',
        },
        {
          href: `https://github.com/${ORG}/${PROJECT}`,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            { label: 'Overview', to: '/docs' },
            { label: 'Runbook', to: '/docs/runbook' },
            { label: 'Automation', to: '/docs/automation' },
            { label: 'Evaluation', to: '/docs/evaluation' },
          ],
        },
        {
          title: 'Reference',
          items: [
            { label: 'Object model', to: '/docs/object-model' },
            { label: 'SDK', to: '/docs/sdk' },
            { label: 'Coral schema', to: '/docs/coral-schema' },
            { label: 'Errata', to: '/docs/reference/errata' },
          ],
        },
        {
          title: 'Source',
          items: [
            { label: 'Wiki repository', href: `https://github.com/${ORG}/${PROJECT}` },
            { label: 'Audit repository', href: SOURCE_REPO },
            { label: 'Ray documentation', href: 'https://docs.ray.io' },
          ],
        },
      ],
      copyright: `Raybot documentation. Built from a ground-truth audit captured 2026-06-07 and re-audited 2026-06-17.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'powershell', 'json', 'typescript', 'yaml', 'python'],
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
