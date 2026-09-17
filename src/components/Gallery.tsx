import React, { useMemo, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import galleryData from '@site/data/gallery.json';

export interface GalleryEntry {
  order: number;
  file: string;
  phase: string;
  caption: string;
  exists: boolean;
}

const entries = galleryData as GalleryEntry[];

const PHASE_LABEL: Record<string, string> = {
  build: 'Phase 1 - Build',
  knowledge: 'Phase 2 - Knowledge',
  tools: 'Phase 2 - Tools',
  skills: 'Phase 2 - Skills',
  connected: 'Phase 2 - Connected agents',
  memory: 'Phase 2 - Memory',
  iq: 'Phase 3 - Microsoft IQ',
  settings: 'Phase 4 - Settings',
  publish: 'Phase 5 - Publish',
  preview: 'Phase 5 - Preview',
  evaluate: 'Phase 5 - Evaluate',
  monitor: 'Phase 5 - Monitor',
  teams: 'Phase 6 - Teams',
  runtime: 'Phase 7 - Runtime re-audit',
  workflow: 'Phase 7 - Workflows designer',
};

function GalleryCard({ entry }: { entry: GalleryEntry }) {
  const src = useBaseUrl(`img/${entry.file}`);
  return (
    <figure className="raybotGalleryCard">
      <a href={src} target="_blank" rel="noreferrer">
        <img src={src} alt={entry.caption} loading="lazy" />
      </a>
      <figcaption className="raybotGalleryCard__body">
        <span className="raybotGalleryCard__phase">
          {entry.order}. {PHASE_LABEL[entry.phase] ?? entry.phase}
        </span>
        <span className="raybotGalleryCard__caption">{entry.caption}</span>
        <span className="raybotGalleryCard__file">{entry.file}</span>
      </figcaption>
    </figure>
  );
}

/**
 * The full 67-capture gallery, filterable by phase and free text.
 *
 * `phase` filtering is offered in the manifest's own ordering rather than
 * alphabetically, so the dropdown reads as the build timeline.
 */
export default function Gallery({ phase }: { phase?: string }) {
  const [query, setQuery] = useState('');
  const [phaseFilter, setPhaseFilter] = useState(phase ?? '');

  const phases = useMemo(() => {
    const seen: string[] = [];
    for (const e of entries) if (!seen.includes(e.phase)) seen.push(e.phase);
    return seen;
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (phaseFilter && e.phase !== phaseFilter) return false;
      if (!q) return true;
      return (
        e.caption.toLowerCase().includes(q) || e.file.toLowerCase().includes(q)
      );
    });
  }, [query, phaseFilter]);

  return (
    <div>
      <div className="raybotToolbar">
        <input
          type="search"
          value={query}
          placeholder="Search captions and filenames"
          aria-label="Search captures"
          onChange={(e) => setQuery(e.target.value)}
        />
        {!phase && (
          <select
            aria-label="Phase"
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
          >
            <option value="">All phases</option>
            {phases.map((p) => (
              <option key={p} value={p}>
                {PHASE_LABEL[p] ?? p}
              </option>
            ))}
          </select>
        )}
        <span className="raybotToolbar__count">
          {visible.length} of {entries.length} captures
        </span>
      </div>
      <div className="raybotGallery">
        {visible.map((e) => (
          <GalleryCard key={e.order} entry={e} />
        ))}
      </div>
    </div>
  );
}

export { entries as galleryEntries, PHASE_LABEL };
