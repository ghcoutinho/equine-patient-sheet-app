# equine-patient-sheet-app

A clinical flowsheet, dosing and decision-support app for equine colic and
neonatal foal patients. Built for Dr Gustavo Coutinho, equine surgeon.

Live at https://ghcoutinho.github.io/equine-patient-sheet-app/ · deployed from
`master` by GitHub Actions on push.

---

## Read this first: the rules that matter

This app computes drug volumes and displays prognostic figures to a clinician.
Every rule below exists because breaking it produced a real defect in this
codebase. They are not style preferences.

### 1. Never display a number the app did not compute

No placeholder values, no "example" figures, no fixed-percentage progress bars
standing in for data. If a value has not been charted, say so.

Defects this rule was written from:
- A "CAS contribution ledger" showing `+2 Heart Rate / +1 Lactate` that read no
  patient data at all.
- Score track bars drawn at fixed widths (15%/40%/30%, 30%/20%/30%) that drew
  the same picture for every patient.
- A sepsis meter pinned at 65%.
- Trend sparklines built from fixed-height divs (40/45/60/75/100%).
- `heartRate || 110` and `lactate || 6.2` fallbacks that invented a vital sign
  when none was charted.

### 2. Never fabricate an observation

Creating a patient, applying a dose, or any other action must not write a
flowsheet column nobody charted.

Defects this rule was written from:
- Admission wrote a column timestamped `14:30` with HR 44, temp 38.0, RR 18,
  lactate 1.2 — so every new horse arrived with a normal set of vitals nobody
  took, attributed to nobody. This is what made saved rounds read
  "Unattributed".
- The dose calculator appended a whole round and invented the vitals to fill it
  (HR 88, temp 38.5, lactate 2.1) when the patient had no previous round.
- Flowsheet quick-entry inferred `motility: 'Absent' | 'Decreased'` from reflux
  volume. Motility is auscultated, not calculated from the litres in the bucket.

### 3. Never attribute a formula to a source the code does not implement

If the arithmetic is a ward convention, label it a ward convention. If a
published threshold is implemented exactly, cite it. Do not put a citation chip
next to an approximation.

`src/data/colicThresholds.ts` is the pattern: every threshold carries its source
string and a `provenance` marker of `'published'` or `'ward-convention'`.

Deleted for breaking this rule: `prognosis.ts`'s `calculateCAS`, whose own
comments called its thresholds "approximations" while the UI cited a paper.

### 4. Respect zero

A charted `0` is a finding. Use `Number.isFinite(x)`, never `x || fallback` and
never bare truthiness. Pain score 0, Obel grade 0, band neutrophils 0 and
lactate 0 are all real values that must not be treated as missing.

### 5. Missing data widens the range; it does not score as normal

Scores return `ScoreBounds { min, max, isExact }` (see
`src/utils/missingDataHandler.ts`). An uncharted parameter contributes its full
possible span to the range and sets `isExact: false`. The UI shows `3–7`, not
`3`. "Not charted" and "normal" are different states and must look different.

### 6. Age and species context are not decoration

Adult thresholds applied to a foal will flag normal physiology as critical. A
neonate's heart rate of 100 crosses the adult ">75 bpm high risk" line and means
nothing. Check `patient.isFoal` / `patientAge()` before applying any threshold,
and say which population the threshold came from.

Foals are charted in °F and adults in °C (`vitals.temperatureF` /
`vitals.temperatureC`). Anything reading temperature must handle both — a bug
where only the Celsius field was read meant foal temperatures never reached any
scoring panel.

### 7. Verify in the running app, not in the diff

`tsc` passing is not evidence the feature works. Build it, serve it, drive it in
a browser, and read the actual rendered output. Several defects above passed
typecheck and lint cleanly.

`npm test` must pass before any change is called done — alongside build, lint
and `tsc`, not instead of driving the app. Unit tests catch the arithmetic
class of defect (a 10× dose error, a band boundary one integer off); they do
not catch a value that was never wired to a view. Both checks are required.

### 8. Flag, do not silently correct, suspect source data

When a published table contains an obvious error (Equine Internal Medicine Table
15.6 prints fibrinogen as "< 400 g/dL", 1000× off), surface it to the clinician
rather than quietly fixing it. Same for genuine disagreements between sources —
gentamicin's Table 20.14 dose versus the chapter text was left for clinical
judgement with both shown.

### 9. No silent caps

If a view filters or truncates, say what was hidden and offer it. The dose
calculator hid 26 foal-only drugs from an adult patient with no indication,
which is part of why the formulary "looked half its size".

---

## Stack and commands

React 19 · Vite 8 · TypeScript 6 · Tailwind v4 (`@tailwindcss/vite`) · oxlint
Node 22 · npm 10

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc -b && vite build  — MUST pass before claiming done
npm run lint         # oxlint
npx tsc --noEmit -p tsconfig.app.json
npm test             # vitest run — MUST pass before any change is called done
npm run test:watch   # vitest, watch mode
```

Fonts (Hanken Grotesk, JetBrains Mono) and Material Symbols load from Google
Fonts via `index.html`. Offline, icons render as their ligature names
("table_chart") — that is a network symptom, not a bug.

### CI

`.github/workflows/ci.yml` runs lint, `tsc --noEmit` and `npm test` on every
push and pull request. It does not build or touch Pages — that stays
`deploy.yml`'s job alone, so the two workflows cannot race each other.

### Deployment

Push to `master`; `.github/workflows/deploy.yml` builds and publishes to GitHub
Pages. `vite.config.ts` sets `base` for the project sub-path — assets must not
use absolute `/assets/...` paths or the deployed page renders blank.

Do **not** add a second Pages workflow (a "Static HTML" template workflow once
raced this one and republished unbuilt source). Do not add heavy devDependencies
casually — a stray `playwright` entry once broke `npm ci` with EUSAGE and would
have failed every deploy.

---

## Architecture

Single-page app, no router. `src/App.tsx` holds all state and switches views on
a `ViewTab` union. Patients persist to `localStorage` via
`src/utils/persistence.ts` (`eps.patients.v1`, `eps.clinician.v1`, schema
versioned, writes guarded — `saveFailed` surfaces a banner).

```
src/
  types.ts                    # every shared type; Patient is the root aggregate
  App.tsx                     # state + view switch
  components/
    TopNavBar / SideNavBar / MobileBottomNav   # all render from data/navigation.ts
    NewAssessmentModal        # admission + round selection
    ui/                       # PatientMark, Sparkline, GutSoundsQuadrant
    views/                    # one file per ViewTab
  data/                       # reference data and catalogues (no logic)
  utils/                      # pure computation (no JSX)
```

**`src/data/navigation.ts` is the single source of truth for navigation.** All
three nav bars render from it. Adding a tab means adding a `ViewTab` member, a
`NAV_ITEMS` entry, and a branch in `App.tsx` — nothing else. Do not hardcode a
nav list in a component; that drift is what produced three "Dashboard" entries
and one tab with three different names.

### Key modules

| Module | Responsibility |
|---|---|
| `utils/doseCalculation.ts` | Weight-based dose → volume. Unit *families* (mass: g/mg/mcg · activity: IU/mU). Cross-family division is refused, not guessed. |
| `utils/labs.ts` | Lab panel definition + derived parameters. **Calculated values are never entered.** |
| `utils/intelligence.ts` | Charted round → scoring inputs; criterion-level panels |
| `data/colicThresholds.ts` | Every published colic threshold, with provenance |
| `utils/callSurgeonTriggers.ts` | Ward escalation rules from the charted round |
| `utils/treatments.ts` | Treatment sheet: status, forward schedule, routes |
| `utils/schedule.ts` | Monitoring intervals and "next due" |
| `utils/missingDataHandler.ts` | `ScoreBounds` arithmetic — see rule 5 |
| `data/patientIdentity.ts` | Age from date of birth, sex, which mark to draw |

### Two invariants worth stating

**Derived lab values are computed on read, never stored.** MCHC is haemoglobin
over haematocrit; globulin is total protein minus albumin. If both the inputs
and the result were stored, a panel could contradict its own arithmetic. See
`DERIVED_PARAMETERS` in `utils/labs.ts`.

**Peritoneal and plasma lactate are separate fields.** The comparison is the
finding — peritoneal exceeding plasma indicates strangulated small intestine —
and it is lost if they share a column.

---

## Known state — what is not done

### Tests: the calculation core, not the app

Vitest is installed (`npm test` / `npm run test:watch`, no config file of its
own — `vite.config.ts` is enough). 179 tests across 8 files in
`src/**/__tests__/*.test.ts`, covering the modules the "10× overdose" defect
came from (`concentrationMgMl / 10` in the volume calculation — exactly the
class of defect a unit test catches and a reviewer's eye does not):

- `doseCalculation.ts` — unit families (mass, activity), cross-family refusal,
  `%` as g/100 mL, rates, totals, opaque units, qualifier text, doses already
  expressed as a volume.
- `labs.ts` — `computeDerived` for every derived parameter, `differentialCheck`,
  `flagValue`.
- `colicThresholds.ts` — every band boundary, `comparePeritonealLactate`,
  `readPcvTp` splitting, `readReflux`, `readHeartRate` trajectory including the
  ±2 bpm dead-band.
- `missingDataHandler.ts` — `calculateScoreBounds`, in particular `isExact`
  going false when any single item is uncharted.
- `schedule.ts` / `treatments.ts` — due-state boundaries, `upcomingDoses`
  horizon capping, `intervalFromFrequency` across q6h / q8-12h / BID / CRI.
- `patientIdentity.ts` — `ageClassFromDays` at each cohort edge, `betweenBands`,
  the legacy no-date-of-birth fallback.
- `intelligence.ts` — `columnToEntry`'s °F→°C conversion, so a foal's
  temperature is proven to reach the scoring panels.

**Not covered — deliberately out of scope for this pass, not forgotten:**
`callSurgeonTriggers.ts`, `prognosis.ts`, `neonatalSepsisScore.ts`,
`gutSounds.ts`, `biomarkerEvaluator.ts`,
`manure.ts`, `referenceLookup.ts`, `formNavigation.ts`, `persistence.ts`
(localStorage read/write and schema versioning), every `data/*.ts` catalogue
other than `colicThresholds.ts` and `patientIdentity.ts`, and all of
`components/` — no view has ever been rendered under test. Rule 7 still
applies: passing tests are not evidence a value reaches the screen.

### Orphaned modules — real work nothing reaches

`utils/neonatalSepsisScore.ts` (Brewer & Koterba, ~150 lines of genuine clinical
logic) · `data/academicReferences.ts` (72 references, no view) ·
`data/flowsheetRows.ts`

`utils/physiologicalValidator.ts` and `data/neonatalReferenceRanges.ts` were
deleted (2026-07-31): the validator duplicated `prognosis.ts`'s cited cut-offs
on the retired `PatientCategory` axis rather than the current `patientAge()`
model, and the reference ranges were an uncited, superseded duplicate of
`ageStratifiedReferenceRanges.ts`. Neither had an importer.

### Structural limits

- **Single-browser storage.** No sync, no second device, no colleague. Clearing
  site data loses everything. A ward tool needs a backend and auth.
- **No print or export.** The flowsheet cannot reach the medical record.
- **`casScoreConfirmed` is still a stored literal** on `Patient`, not computed.
  `NeonatalAssessmentView` writes it. It should come from a scoring engine.
- **6 duplicate ids remain in `expandedFormulary.ts`** (`vasopressin`,
  `epinephrine`, `prednisolone`, `furosemide`, `dantrolene`, `acetazolamide`) —
  all same-dose or low-magnitude (≤2×) variants cross-listed under a second
  category, not a resolution hazard the way the three below were. React keys
  work around it with `${id}-${index}`; searching is unaffected. The three
  ids that mixed clinically distinct doses were split (2026-07-31), because
  nothing stops a future `formularyId`-based lookup from resolving the wrong
  one: `atropine_bradycardia` (0.01–0.02 mg/kg) vs `atropine_organophosphate`
  (0.1–0.2 mg/kg, 10×) · `dexamethasone_respiratory` (0.02–0.1 mg/kg) vs
  `dexamethasone_immunosuppressive` (0.05–0.2 mg/kg) vs
  `dexamethasone_parturition` (100 mg total — a different dosing paradigm, not
  just a different number) · `n-acetylcysteine_mucolytic` (10 mg/kg) vs
  `n-acetylcysteine_toxicity` (140 mg/kg, 14×). No code currently resolves a
  formulary entry by id — `formularyId` is written once from the selected list
  item and never read back — so this was a data fix with no behaviour change.
- The formulary's `patientType` split hides drugs by age class (surfaced, not
  silent — see rule 9).

### Planned but not started

Charge capture and billing, building on the `Treatment` model — `stoppedAt`
closes an order rather than deleting it precisely so the record of what ran and
for how long survives to be billed.

---

## Clinical sources

Reference intervals: Cornell (adult) · AJVR 2024 Sant et al. and Equine Internal
Medicine Tables 20.9 / 20.12 / 20.14 (foal) · Frontiers 2025. Foal cohorts are
the published study populations (0–2 d, 5–10 d, 20–32 d) — ages between them are
marked as such rather than presented as measured.

Colic thresholds: Freeman *Colic Surgery in the Horse* · Blikslager *The Equine
Acute Abdomen*. See `data/colicThresholds.ts`.

Scoring: Biondi 2026 SIRS · Brewer & Koterba · Bottegaro 2024 / McGovern 2025
admission cut-offs.

The Rood & Riddle formulary is **not** bulk-imported — it is proprietary. Use it
as a cross-check; the source of record is the clinician's own EIM tables.

---

## Working with Dr Coutinho

He is a practising equine surgeon and will catch clinical errors — several
defects in this codebase were found by him using the app, not by review. Report
what was verified and what was not; do not describe untested work as working.

When a change involves a clinical judgement (a threshold, a drug concentration,
which population a figure applies to), surface the judgement rather than
deciding silently. Penicillin G potassium/sodium is a worked example: it carried
300,000 IU/mL copied from the procaine entry, but as a lyophilised powder it has
no fixed bottle strength at all — the right fix was removing the number and
explaining why, not substituting a different one.

## Git

Branch `feat/clinical-assessment-tools` tracks `master`; both currently point at
the same commit. Commit messages in this repo explain *why* a change was made
and what defect it addresses, not just what changed.
