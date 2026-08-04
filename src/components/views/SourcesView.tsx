import React from 'react';
import { ACADEMIC_REFERENCES, exportToRIS } from '../../data/academicReferences';

/**
 * Every source this app actually implements a threshold, score or citation
 * from — nothing else. See the long comment at the top of
 * data/academicReferences.ts for why the list used to be 72 entries and now
 * isn't, and for the two citations that were corrected against the actual
 * paper rather than carried forward with the wrong first author.
 *
 * A score panel's citation chip (ScorePanelCard) links here when it has a
 * `sourceRefId` — every panel does except the two that are explicitly not
 * citing a specific paper (the GI severity ledger's "ward convention", the
 * neonatal SIRS panel's uncited thresholds).
 */
export const SourcesView: React.FC = () => {
  const books = ACADEMIC_REFERENCES.filter((r) => r.kind === 'book');
  const journals = ACADEMIC_REFERENCES.filter((r) => r.kind === 'journal');

  const Entry: React.FC<{ r: (typeof ACADEMIC_REFERENCES)[number] }> = ({ r }) => (
    <li id={`ref-${r.id}`} className="py-3 border-b border-[#E2E8F0] last:border-0">
      <p className="font-body-md text-sm text-[#0b1c30]">
        {r.authors && <span>{r.authors}. </span>}
        {r.year && <span>{r.year}. </span>}
        <span className="italic">{r.title}</span>
        {r.journal && <span>. {r.journal}</span>}
        {r.volumeInfo && <span> {r.volumeInfo}</span>}
        {r.doi && (
          <>
            {' · '}
            <a
              href={`https://doi.org/${r.doi}`}
              target="_blank"
              rel="noreferrer"
              className="text-[#0037b0] underline"
            >
              doi:{r.doi}
            </a>
          </>
        )}
        {!r.doi && r.url && (
          <>
            {' · '}
            <a
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="text-[#0037b0] underline"
            >
              link
            </a>
          </>
        )}
      </p>
      <p className="font-derived-value text-xs text-[#747686] mt-1">Used for: {r.usedFor}</p>
    </li>
  );

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-6 bg-[#F8FAFC]">
      <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-[#0b1c30]">Sources</h1>
          <p className="font-body-md text-sm text-[#434655] mt-1">
            Every citation a score panel or published threshold in this app implements — not a
            reading list. If a number on a panel carries a citation chip, it links here.
          </p>
        </div>
        <button
          type="button"
          onClick={exportToRIS}
          className="px-3 py-1.5 text-xs font-label-caps bg-white border border-[#c4c5d7] rounded text-[#434655] hover:bg-[#eff4ff] flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          Export .ris
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm">
        <h2 className="font-headline text-base font-bold text-[#0b1c30] mb-1">Books</h2>
        <p className="font-derived-value text-xs text-[#747686] mb-2">
          Cited throughout <code>data/colicThresholds.ts</code>, not through a ScorePanel — no
          edition or year is asserted here that this app hasn't verified.
        </p>
        <ul>
          {books.map((r) => (
            <Entry key={r.id} r={r} />
          ))}
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm">
        <h2 className="font-headline text-base font-bold text-[#0b1c30] mb-2">Journal articles</h2>
        <ul>
          {journals.map((r) => (
            <Entry key={r.id} r={r} />
          ))}
        </ul>
      </div>

      <p className="font-derived-value text-[11px] text-[#747686] leading-snug">
        Reference intervals (Cornell, Sant et al. 2024, Martín-Cuervo et al. 2025, and the Equine
        Internal Medicine tables) are cited separately, next to the intervals they support, in{' '}
        <code>data/ageStratifiedReferenceRanges.ts</code> — see the Reference Ranges tab.
      </p>
    </div>
  );
};
