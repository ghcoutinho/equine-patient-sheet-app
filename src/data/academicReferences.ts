export interface AcademicReference {
  id: string;
  kind: 'journal' | 'book';
  authors?: string;
  year?: number;
  title: string;
  journal?: string;
  volumeInfo?: string;
  doi?: string;
  pmid?: string;
  pmcid?: string;
  url?: string;
  /** Which panel(s)/threshold(s) in this app cite it. Not exhaustive prose —
   * just enough that a clinician can find where the number came from. */
  usedFor: string;
}

/**
 * Every source this app actually implements a threshold, score or citation
 * from — nothing else.
 *
 * This used to be 72 entries: the ~10 below, plus FHIR/software-architecture
 * articles unrelated to any clinical content, and duplicate/background
 * reading for topics this app doesn't score (an AI-decision-support scoping
 * review, several alternative sepsis-scoring papers, secondary write-ups of
 * the same three papers already listed here under a primary citation). None
 * of that was wrong to have researched, but presenting it as "the sources"
 * of a clinical tool — next to entries this app genuinely implements —
 * blurred which citations are structural and which were background reading.
 * Rule 3 exists for exactly this: a citation chip means the code implements
 * that source, not that someone once read it.
 *
 * Two entries also had the wrong first author on the citation itself
 * (transcription error against the actual paper, not a disagreement between
 * sources) — corrected here rather than carried forward.
 *
 * Not included: Reed/Bayly/Sellon's Equine Internal Medicine and the
 * individual chapter citations within it (Axon & Palmer 2008, Wilkins 2018),
 * plus Sant et al. 2024 and Martín-Cuervo et al. 2025 — all cited inline,
 * with their own caveats, in `RANGE_SOURCES` in
 * `data/ageStratifiedReferenceRanges.ts`, next to the reference intervals
 * they support rather than in a separate bibliography.
 */
export const ACADEMIC_REFERENCES: AcademicReference[] = [
  {
    id: 'freeman',
    kind: 'book',
    authors: 'Freeman DE',
    title: 'Colic Surgery in the Horse',
    usedFor:
      'Plasma lactate survival bands, PCV/TP splitting, reflux/DPJ volume bands, peritoneal lactate, endotoxaemia signs, heart-rate trajectory — data/colicThresholds.ts',
  },
  {
    id: 'blikslager',
    kind: 'book',
    authors: 'Blikslager AT',
    title: 'The Equine Acute Abdomen',
    usedFor:
      'Same panels as Freeman above — the two are cited together throughout data/colicThresholds.ts',
  },
  {
    id: 'biondi-2026',
    kind: 'journal',
    authors: 'Biondi V, Pugliese M, Gambadauro P, et al.',
    year: 2026,
    title:
      'Evaluation of systemic inflammatory response syndrome criteria in horses with colic associated with acute gastrointestinal disease',
    journal: 'Front Vet Sci',
    doi: '10.3389/fvets.2026.1822426',
    usedFor: 'SIRS criteria (adult) — sirsPanel in utils/intelligence.ts',
  },
  {
    id: 'bottegaro-2024',
    kind: 'journal',
    authors: 'Brkljača Bottegaro N, Magoga JA, Bojanić K, et al.',
    year: 2024,
    title: 'Prognostic factors assessed by blood analysis at the time of patient admission for horse colic',
    journal: 'Veterinarska stanica',
    volumeInfo: '56(5)',
    doi: '10.46419/vs.56.5.5',
    usedFor: 'Adult colic admission risk cut-offs — getPrognosticFlags in utils/prognosis.ts',
  },
  {
    id: 'mcgovern-2025',
    kind: 'journal',
    authors: 'McGovern KF',
    year: 2025,
    title: 'Clinical insights: Advances in equine adult critical care',
    journal: 'Equine Vet J',
    doi: '10.1111/evj.14523',
    usedFor: 'Adult colic admission risk cut-offs — getPrognosticFlags in utils/prognosis.ts',
  },
  {
    id: 'brewer-1988',
    kind: 'journal',
    authors: 'Brewer BD, Koterba AM',
    year: 1988,
    title: 'Development of a scoring system for the early diagnosis of equine neonatal sepsis',
    journal: 'Equine Vet J',
    volumeInfo: '20(1):18-22',
    usedFor:
      'Foal survival screen and Neonatal sepsis score — foalSurvivalPanel and neonatalSepsisPanel in utils/intelligence.ts / utils/neonatalSepsisScore.ts',
  },
  {
    id: 'farrell-2021',
    kind: 'journal',
    authors: 'Farrell A, Kersh K, Liepman R, Dembek KA',
    year: 2021,
    title: 'Development of a Colic Scoring System to Predict Outcome in Horses',
    journal: 'Front Vet Sci',
    volumeInfo: '8:697589',
    pmcid: 'PMC8531487',
    usedFor: 'Colic assessment score (adult) — casPanel in utils/intelligence.ts',
  },
  {
    id: 'hoeberg-2022',
    kind: 'journal',
    authors: 'Hoeberg E, et al.',
    year: 2022,
    title: 'Serum amyloid A as a marker to detect sepsis and predict outcome in hospitalized neonatal foals',
    journal: 'J Vet Intern Med',
    url: 'https://pub.epsilon.slu.se/id/document/20411092',
    usedFor:
      'SAA sepsis (1,050 mg/L) and non-survival (1,250 mg/L) cut-offs — biomarkerEvaluator.ts',
  },
  {
    id: 'laurberg-2023',
    kind: 'journal',
    // Corrected 2026-08-03: the entry this replaced (id "borchers-2023")
    // listed "Borchers A, et al." — not an author of this paper. Laurberg is
    // the actual first author, verified against the PMC record (PMC10194986).
    authors: 'Laurberg M, Saegerman C, Jacobsen S, Berg LC, Laursen SH, Hoeberg E, Sånge EA, van Galen G',
    year: 2023,
    title:
      'Use of admission serum neutrophil gelatinase-associated lipocalin (NGAL) concentrations as a marker of sepsis and outcome in neonatal foals',
    journal: 'PLOS One',
    pmcid: 'PMC10194986',
    usedFor:
      'NGAL sepsis (455 µg/L) and non-survival (1,104 µg/L) cut-offs — biomarkerEvaluator.ts',
  },
  {
    id: 'van-loon-2014',
    kind: 'journal',
    authors: 'van Loon JPAM, Jonckheer-Sheehy VSM, Back W, van Weeren PR, Hellebrekers LJ',
    year: 2014,
    title:
      'Monitoring equine visceral pain with a composite pain scale score and correlation with survival after emergency gastrointestinal surgery',
    journal: 'Vet J',
    volumeInfo: '200:109-115',
    usedFor:
      'Composite Pain Scale (CPS), 13-parameter scale originally developed by Bussières et al. 2008 (Res Vet Sci 85:294-306) for orthopaedic pain — cpsPanel in utils/intelligence.ts',
  },
  {
    id: 'scalco-2023',
    kind: 'journal',
    // Corrected 2026-08-03: the entry this replaced (id "dembek-2023") listed
    // "Dembek KA, et al." as first author — Scalco is the actual first
    // author of this specific paper (Dembek co-authored others cited here).
    authors: 'Scalco R, de Oliveira GN, da Rosa Curcio B, et al.',
    year: 2023,
    title: 'Red blood cell distribution width to platelet ratio in neonatal foals with sepsis',
    journal: 'J Vet Intern Med',
    volumeInfo: '37(4):1552-1560',
    usedFor: 'RPR sepsis cut-off (0.0928) — biomarkerEvaluator.ts',
  },
];

export function exportToRIS(): void {
  const risContent = ACADEMIC_REFERENCES.map((ref) => {
    let entry = `TY  - ${ref.kind === 'book' ? 'BOOK' : 'JOUR'}\n`;
    entry += `TI  - ${ref.title}\n`;
    if (ref.authors) {
      const authorList = ref.authors.split(',').map((a) => a.trim());
      authorList.forEach((a) => {
        entry += `AU  - ${a}\n`;
      });
    }
    if (ref.year) entry += `PY  - ${ref.year}\n`;
    if (ref.journal) entry += `JO  - ${ref.journal}\n`;
    if (ref.volumeInfo) entry += `VL  - ${ref.volumeInfo}\n`;
    if (ref.doi) entry += `DO  - ${ref.doi}\n`;
    if (ref.url) entry += `UR  - ${ref.url}\n`;
    entry += `ER  - \n`;
    return entry;
  }).join('\n');

  const blob = new Blob([risContent], { type: 'application/x-research-info-systems' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'Equine_Patient_Sheet_References.ris';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
