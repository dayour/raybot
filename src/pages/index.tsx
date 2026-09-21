import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import StatGrid from '@site/src/components/StatGrid';
import totals from '@site/data/audit-totals.json';

const CARDS = [
  {
    title: 'Runbook',
    to: '/docs/runbook',
    body: 'Seven phases from first save to Teams channel, with every data-testid, every constraint, and every capture that proves it.',
  },
  {
    title: 'Object model',
    to: '/docs/object-model',
    body: 'A typed model of the agent, its knowledge, tools, skills, settings, publish channels, evaluations, and workflow nodes.',
  },
  {
    title: 'SDK',
    to: '/docs/sdk',
    body: 'The @raybot/object-model package: types, JSON Schemas, semantic id parsing, and validators over the audit datasets.',
  },
  {
    title: 'Coral schema',
    to: '/docs/coral-schema',
    body: 'Sixteen surfaces, 1,627 elements, 177 unique test ids, and the naming scheme that binds the UI layer to the API layer.',
  },
  {
    title: 'API surface',
    to: '/docs/api',
    body: 'Fifty-seven observed endpoints across eleven functional domains and seven hosts, each with a confidence rating.',
  },
  {
    title: 'Screenshot gallery',
    to: '/docs/screenshots/gallery',
    body: 'All 95 curated captures, filterable by phase, with the crosswalk to the superseded originals.',
  },
  {
    title: 'Automation patterns',
    to: '/docs/automation',
    body: 'The Playwright MCP conventions that made the build reproducible, including the per-node capture loop and the stale-ref rule.',
  },
  {
    title: 'Session forensics',
    to: '/docs/session',
    body: 'What the Copilot CLI session stores actually retain, the nine recovered terminal commands, and why the build transcript is gone.',
  },
];

export default function Home() {
  return (
    <Layout
      title="Raybot"
      description="Object model, runbook, and Coral ground-truth schema for a Ray expert agent built UI-only in Copilot Studio."
    >
      <header className="raybotHero">
        <div className="container">
          <div className="raybotHero__eyebrow">
            Copilot Studio next-generation runtime, codename Coral
          </div>
          <h1 className="raybotHero__title">Raybot</h1>
          <p className="raybotHero__subtitle">
            A Ray and Ray-clusters expert agent, built end to end through the
            browser only, with a screenshot after every action and a ground-truth
            DOM and network audit behind it. This site is the object model, the
            runbook, and the schema reference for that build.
          </p>
          <div className="raybotHero__actions">
            <Link className="button button--primary button--lg" to="/docs">
              Read the overview
            </Link>
            <Link
              className="button button--secondary button--lg"
              to="/docs/runbook"
            >
              Open the runbook
            </Link>
            <Link
              className="button button--secondary button--lg"
              to="/docs/object-model"
            >
              Object model
            </Link>
          </div>
        </div>
      </header>

      <main className="container margin-vert--lg">
        <h2>What the audit measured</h2>
        <StatGrid
          stats={[
            {
              label: 'Surfaces',
              value: totals.surfaces,
              hint: 'Pages and dialogs captured as complete DOM dumps',
            },
            {
              label: 'Elements',
              value: totals.elements,
              hint: `${totals.interactive.toLocaleString('en-US')} interactive`,
            },
            {
              label: 'Unique test ids',
              value: totals.uniqueTestIds,
              hint: `${totals.withTestId.toLocaleString('en-US')} elements carry one`,
            },
            {
              label: 'Shared test ids',
              value: totals.sharedTestIds,
              hint: 'Appear on more than one surface',
            },
            {
              label: 'Label gaps',
              value: totals.interactiveMissingLabel,
              hint: 'Interactive elements with no derivable accessible name',
            },
            {
              label: 'API endpoints',
              value: totals.api.endpointCount,
              hint: `${totals.api.domainCount} functional domains`,
            },
            {
              label: 'Network requests',
              value: totals.api.allRequests,
              hint: `${totals.api.functionalApiRequests.toLocaleString('en-US')} functional after filtering`,
            },
            {
              label: 'Captures',
              value: totals.gallery.entries,
              hint: 'Curated gallery, every file verified present',
            },
          ]}
        />

        <h2>Start here</h2>
        <div className="raybotCards">
          {CARDS.map((c) => (
            <Link className="raybotCard" key={c.to} to={c.to}>
              <div className="raybotCard__title">{c.title}</div>
              <div className="raybotCard__body">{c.body}</div>
            </Link>
          ))}
        </div>

        <h2>Honesty notes</h2>
        <p className="raybotMuted">
          This documentation reports what the build actually produced, including
          the parts that did not work. The Teams channel is blocked by a tenant
          App Customization Policy consent that was never granted. The built-in
          evaluation scored zero percent against a six-pair eval set even though
          the same questions ground correctly in Preview with live citations.
          Both outcomes are documented in full rather than omitted.
        </p>
      </main>
    </Layout>
  );
}
