import { ALL_ENTERED_FIELDS, type LabField } from './labs';

/**
 * PDF lab-report import — best-effort text matching only, never a save path.
 *
 * There is no backend here (see CLAUDE.md, Architecture principle A), so this
 * runs entirely in the browser: the PDF bytes never leave the device. Reading
 * an arbitrary lab report's layout is inherently heuristic — different
 * analysers and different labs format the same panel differently — so every
 * match carries the raw line it was pulled from, and the caller is expected
 * to route matches through the same draft-and-review step a manually typed
 * panel goes through, never straight into a saved LabPanel. A wrong guess
 * here is a wrong value in a clinical record, which is a different order of
 * risk than a UI bug — hence review-before-save is not optional.
 */

export interface ExtractedLabValue {
  fieldId: string;
  field: LabField;
  /** The number this reading matched, as parsed from the PDF text. */
  value: number;
  /** The exact source line the match came from, for the reviewer to check against the PDF. */
  sourceLine: string;
}

export interface PdfExtractionResult {
  matches: ExtractedLabValue[];
  /** Full extracted text, in case the reviewer wants to scan for something the matcher missed. */
  text: string;
}

/**
 * Label aliases per field id, most-specific first. Matching is a whole-word,
 * case-insensitive search against each line of the report, so "Ca" cannot
 * match inside "Calcium corrected" ahead of the intended alias and "Cl" cannot
 * match inside "Chloride" twice. Order matters where one label is a prefix of
 * another (ionised calcium before total calcium, bands before segs).
 */
const FIELD_ALIASES: Record<string, string[]> = {
  lab_pcv: ['pcv', 'packed cell volume', 'hct', 'haematocrit', 'hematocrit'],
  lab_rbc: ['rbc', 'red blood cell', 'red cell count', 'erythrocytes'],
  lab_hgb: ['hgb', 'hb\\b', 'haemoglobin', 'hemoglobin'],
  lab_platelets: ['platelets', 'plt\\b'],
  lab_wbc: ['wbc', 'white blood cell', 'white cell count', 'leukocytes'],
  lab_fibrinogen: ['fibrinogen', 'fibr\\b'],
  lab_rdw: ['rdw'],
  lab_neuts_band: ['band neutrophils', 'bands\\b', 'band neuts'],
  lab_neuts_seg: ['segmented neutrophils', 'segs\\b', 'seg neuts', 'neutrophils'],
  lab_lymphocytes: ['lymphocytes', 'lymphs\\b'],
  lab_monocytes: ['monocytes', 'monos\\b'],
  lab_eosinophils: ['eosinophils', 'eos\\b'],
  lab_basophils: ['basophils', 'basos\\b'],
  lab_sodium: ['sodium', 'na\\+', 'na\\b'],
  lab_potassium: ['potassium', 'k\\+', 'k\\b'],
  lab_chloride: ['chloride', 'cl-', 'cl\\b'],
  lab_bicarbonate: ['bicarbonate', 'hco3-', 'hco3\\b', 'tco2'],
  lab_bun: ['urea nitrogen', 'bun\\b', 'blood urea'],
  lab_creatinine: ['creatinine', 'creat\\b'],
  lab_glucose: ['glucose', 'gluc\\b'],
  lab_lactate: ['lactate', 'lac\\b'],
  lab_tp: ['total protein', 'tp\\b'],
  lab_albumin: ['albumin', 'alb\\b'],
  lab_ionized_calcium: ['ionised calcium', 'ionized calcium', 'ica\\b', 'ca2\\+', 'ca\\+\\+'],
  lab_calcium: ['calcium, total', 'calcium\\b', 'ca\\b'],
  lab_phosphate: ['phosphate', 'phosphorus', 'po4', 'phos\\b'],
  lab_magnesium: ['magnesium', 'mg2\\+', 'mg\\b'],
  lab_ast: ['ast\\b', 'aspartate aminotransferase'],
  lab_ggt: ['ggt\\b', 'gamma.?glutamyl'],
  lab_gldh: ['gldh\\b', 'glutamate dehydrogenase'],
  lab_alp: ['alp\\b', 'alkaline phosphatase'],
  lab_ldh: ['ldh\\b', 'lactate dehydrogenase'],
  lab_ck: ['ck\\b', 'creatine kinase', 'cpk\\b'],
  lab_dbili: ['direct bilirubin', 'dbili\\b', 'd\\.?\\s?bili'],
  lab_tbili: ['total bilirubin', 'tbili\\b', 't\\.?\\s?bili', 'bilirubin\\b'],
  lab_bile_acids: ['bile acids'],
  lab_triglycerides: ['triglycerides', 'trig\\b'],
  lab_cholesterol: ['cholesterol', 'chol\\b'],
  lab_tibc: ['tibc', 'total iron binding'],
  lab_iron: ['iron\\b', 'fe\\b'],
  lab_saa: ['serum amyloid a', 'saa\\b'],
  lab_ngal: ['ngal'],
  lab_ph: ['\\bph\\b'],
  lab_pco2: ['pco2', 'carbon dioxide tension'],
  lab_po2: ['po2', 'oxygen tension'],
  lab_hco3: ['hco3-', 'hco3\\b', 'bicarbonate'],
  lab_base_excess: ['base excess', '\\bbe\\b'],
  lab_igg: ['igg'],
  lab_igm: ['igm'],
  lab_iga: ['iga'],
};

const fieldById = new Map(ALL_ENTERED_FIELDS.map((f) => [f.id, f]));

/** First signed decimal number in a string, or undefined if there isn't one. */
function firstNumber(s: string): number | undefined {
  const m = s.match(/-?\d+(?:\.\d+)?/);
  if (!m) return undefined;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Match known lab fields against extracted PDF text, line by line. A field
 * already matched on an earlier line is not matched again — the first hit
 * wins, on the assumption a report lists each analyte once.
 */
export function matchLabValues(text: string): ExtractedLabValue[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const matched = new Set<string>();
  const out: ExtractedLabValue[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    // One field per line: fields are declared most-specific-alias-first (e.g.
    // ionised calcium before total calcium), and a line's first field match
    // consumes the whole line so a generic alias can't also match inside a
    // more specific label that already claimed it ("calcium" inside "ionised
    // calcium").
    for (const [fieldId, aliases] of Object.entries(FIELD_ALIASES)) {
      if (matched.has(fieldId)) continue;
      const field = fieldById.get(fieldId);
      if (!field) continue;
      const hit = aliases.find((a) => new RegExp(a, 'i').test(lower));
      if (!hit) continue;
      // Look for the number after the matched label, not before it — labels
      // are followed by their value in every layout seen so far, and this
      // avoids picking up a preceding line number or reference-range digit.
      const idx = lower.search(new RegExp(hit, 'i'));
      const afterLabel = line.slice(idx).replace(new RegExp(hit, 'i'), '');
      const value = firstNumber(afterLabel);
      if (value === undefined) break; // label matched but no number followed it — not this field
      matched.add(fieldId);
      out.push({ fieldId, field, value, sourceLine: line });
      break;
    }
  }

  return out.sort((a, b) => a.field.name.localeCompare(b.field.name));
}

let pdfjsModulePromise: Promise<typeof import('pdfjs-dist')> | undefined;

async function loadPdfjs() {
  if (!pdfjsModulePromise) {
    pdfjsModulePromise = (async () => {
      const pdfjs = await import('pdfjs-dist');
      const workerUrl = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      return pdfjs;
    })();
  }
  return pdfjsModulePromise;
}

/**
 * pdf.js hands back text as a flat list of positioned fragments, not lines —
 * reconstructing rows from y-position (grouping fragments within a small
 * tolerance) before sorting each row left-to-right by x-position is what
 * keeps "Na+   138   mEq/L   132-146" on one line instead of interleaved with
 * the next row's fragments, which is what the label-then-number matcher above
 * depends on.
 */
function linesFromTextContent(items: unknown[]): string[] {
  const Y_TOLERANCE = 2;
  const rows: { y: number; parts: { x: number; str: string }[] }[] = [];
  for (const raw of items) {
    const it = raw as { str?: string; transform?: number[] };
    const str = it.str?.trim();
    if (!str || !it.transform) continue;
    const x = it.transform[4];
    const y = it.transform[5];
    let row = rows.find((r) => Math.abs(r.y - y) <= Y_TOLERANCE);
    if (!row) {
      row = { y, parts: [] };
      rows.push(row);
    }
    row.parts.push({ x, str });
  }
  // Higher y is higher on the page in PDF coordinate space.
  rows.sort((a, b) => b.y - a.y);
  return rows.map((r) =>
    r.parts
      .sort((a, b) => a.x - b.x)
      .map((p) => p.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

/** Extract all text from a PDF file, page by page, entirely client-side. */
export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await loadPdfjs();
  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(linesFromTextContent(content.items).join('\n'));
  }
  return pages.join('\n');
}

/** Run extraction and matching against an uploaded PDF in one step. */
export async function extractLabValuesFromPdf(file: File): Promise<PdfExtractionResult> {
  const text = await extractPdfText(file);
  return { matches: matchLabValues(text), text };
}
