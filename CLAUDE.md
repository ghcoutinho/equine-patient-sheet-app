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

## Architecture principles

The nine rules above are defect-derived — each one records something this
codebase actually shipped wrong. The five principles below are different in
kind: they are forward-looking design commitments, adopted 2026-08-03, for
turning this from an electronic record into a patient-safety device. They are
kept separate so the rules above keep their meaning as a defect ledger.

**A. Every datum carries who and when.** Any write — a round, a lab value, a
dose given, a rate change — stamps `[timestamp + logged user]` at the point of
entry, not at save time. This is what makes the evolution timeline and the
audit trail possible, and it is the reason "Unattributed" is a bug rather than
a default (see rule 2).

**B. Data belongs to the episode, not the screen.** The record is keyed on
patient + admission, and it does not matter whether lactate was entered from
the surgery screen or the lab screen — it lands in the same place. A screen is
a view onto the episode, never its own store. A readmission is a new episode,
not an append to the last one.

**C. Prescribing and administering are different acts.** The clinician sets
drug, dose and interval; the ward records what actually went in, when, and by
whom. They are separate objects with separate permissions and separate
timestamps. A dose outside its window is soft-stopped — blocked by default,
overridable with a logged reason — because an absolute block just moves the
error into false charting.

**D. A continuous infusion is not a dose.** A CRI has a start, a rate, rate
*changes*, bag changes and an end — not a schedule of administrations. Volume
infused is derived from rate × elapsed time, never typed. This is why rate must
be structured (value + unit), not free text.

**E. Scores recompute, never re-type.** A scoring panel pulls the most recent
valid value for each input and recalculates. No score asks the clinician to
enter a number the record already holds, and no score result is stored as a
literal — see `buildPanels` in `utils/intelligence.ts`, and the
`casScoreConfirmed` field that was deleted for breaking this.

**Storage note.** These are being built single-device first, with the data
model shaped so a backend drops in without rework. Cross-device duplicate-dose
prevention and any ward-wide live view are *blocked* until then, not merely
unbuilt: `localStorage` gives two tablets two separate databases, and a safety
interlock that only one tablet can see is worse than none.

### The admission boundary (Track 1, in progress, 2026-08-04)

Principle B calls for the record to belong to the episode, not the screen, and
for a readmission to be a new episode rather than an append to the last one.
A full per-episode entity — splitting `flowsheetHistory`, `treatments` and
`labPanels` off `Patient` into their own store — is a bigger restructure than
this pass takes on: every view that reads them would have to change at once
to follow, for a single-device, single-clinician tool that does not yet need
the full generality. `SCHEMA_VERSION` in `persistence.ts` also constrains this
hard: a version bump wipes every stored patient and reseeds from
`INITIAL_PATIENTS`, so every change here had to be additive — new optional
fields only, nothing restructured or required.

What shipped instead: `Patient.currentAdmissionStartedAt`, an optional
timestamp set on admission and again on every reactivation
(`PatientManagementView`'s "Reactivate" button used to just flip `lifecycle`
back to `'ACTIVE'` with no boundary at all — a horse discharged in May and
reactivated in August would resume charting onto the same continuous
`flowsheetHistory`, and the "most recent round" every scoring panel,
call-surgeon trigger and "Prev:" reference reads could be three months stale
with nothing saying so). `utils/admission.ts` exposes the boundary-aware reads
— `columnsInCurrentAdmission`, `earlierAdmissionColumnCount`, and a
`latestColumn(patient)` that superseded `callSurgeonTriggers.ts`'s old
`latestColumn(history)` — and every scoring panel, trigger and the
`FlowsheetView` grid now reads through them instead of indexing
`flowsheetHistory` directly. The grid defaults to the current admission with a
"Show N earlier admission rounds" toggle; nothing is hidden permanently (rule
9). A column with no `recordedAt`, or a patient with no boundary set at all
(every legacy/sample patient), is never excluded — both default to "include
it" rather than guessing which admission it belongs to.

Also shipped (2026-08-04): clinician is now mandatory before any write, hard
block with no override. Every save action that used to fall back to
`clinician || 'Unattributed'` — `RoundEntryView`'s save, `FlowsheetView`'s
inline edit and quick-add, `NeonatalAssessmentView`'s labs save,
`TreatmentsView`'s Given/Stop, `DoseEntryPanel`'s add-to-sheet (shared by the
Medications tab and the Dose Calculator) — is disabled until a name is set in
the top bar, via a shared `ClinicianRequiredNotice` component carrying one
message everywhere. Found in passing: `FlowsheetView`'s quick-add-column path
wrote a column with no `recordedAt` or `recordedBy` at all; now timestamped
and attributed like every other write path.

Also shipped (2026-08-04): `PatientLifecycle` gained `AWAITING_ARRIVAL`. New
Admission creates a patient in that state instead of `ACTIVE` — pre-registered,
not yet physically here. `App.tsx`'s new `wardPatients` list filters it out of
`DashboardView`/`ClinicalSuiteOverview` so a not-yet-arrived horse doesn't
count toward "Active Cases"; `PatientManagementView` still shows every
lifecycle state, with a matching filter tab. Its "Mark arrived" action
(replacing "Reactivate" for this specific state) moves the patient to
`ACTIVE`, opens the admission boundary at that moment rather than at
registration time, and resets the stale "AWAITING ARRIVAL" `statusLabel` chip
to "ADMITTED".

Also shipped (2026-08-04): the `Recorded { at, by }` envelope. `stampRecorded`
in `utils/recorded.ts` is the only place a `Recorded` value is constructed —
one call, both fields, always together — and every attribution write
(`RoundEntryView`, `FlowsheetView`'s edit and quick-add, `NeonatalAssessmentView`,
`TreatmentsView`'s Given/Stop) now goes through it instead of hand-stamping
`new Date().toISOString()` next to `clinician`. `Administration` — already
shaped `{id, at, by, amountText}` — formally extends `Recorded` now, which
tightens `by` from optional to required with zero change to stored JSON.
`LabPanel.collectedAt` and `Treatment.startedAt` deliberately don't route
through it: both are clinical event times the clinician chooses, not write
timestamps, so pairing them with "now" would silently override a backdated
entry. This closes out Track 1.

### Medication safety (Track 2, 2026-08-14)

Principle C (prescribing and administering are different acts) and principle D
(a continuous infusion is not a dose) landed in three pieces.

**Soft-stop on early doses.** `recordGiven` in `TreatmentsView` used to write
an administration unconditionally — nothing stopped a second "Given" click
minutes after the first from double-dosing a patient. It now checks
`treatmentStatus`: a dose is "early" when the order is `RUNNING` (not yet due)
and a prior dose already exists to anchor the interval against — a first dose
is never flagged. An early dose prompts for a reason; no reason, no write. The
reason is stored on `Administration.earlyOverrideReason` and shown inline with
a warning icon, so the override is visible on the sheet, not buried. This is
the one-device version of the vision's cross-device duplicate-dose interlock,
which stays blocked until there's a backend (see the storage note above) —
but the same risk from a second click on one device needed no backend at all.

**Structured rate.** `Treatment` gained `rateValue`/`rateUnit`, additive next
to the existing free-text `rateText`. The formulary CRI path already computes
a clean volume rate (`result.volume`/`result.volumeUnit` from `computeDose` —
e.g. `2.08 mL/hr`, not the `mg/kg/hr` dosing spec) and just assigns it; manual
entry's free-text rate input was replaced with a number field plus a unit
select drawn from a new fixed list (`RATE_UNITS` in `utils/treatments.ts`),
the same reasoning `ROUTES` already uses. `rateText` is still derived and
written for both paths, so no existing display site needed to change.

**CRI event log.** `Treatment` gained `criEvents?: CriEvent[]` — additive; a
CRI created before this has none. Each event
(`START`/`RATE_CHANGE`/`BAG_CHANGE`/`PAUSE`/`RESUME`/`STOP`) stamps who/when
via `Recorded`. `utils/cri.ts`'s `infusedVolumeMl` walks the log, accumulating
rate × elapsed time across running segments and excluding paused/stopped time;
a CRI with no log falls back to one constant segment from `startedAt` to
`stoppedAt`/now at the treatment's own rate, so old CRIs still get a computed
volume. Consistent with rule 1, a mass-based rate (`mg/kg/hr`, `mcg/kg/min`)
never gets guess-converted to a volume without a concentration —
`infusedVolumeMl` returns `undefined` rather than fabricate one.
`DoseEntryPanel` seeds a `START` event whenever a CRI is created with a real
volume-based rate; `TreatmentsView` adds Rate/Bag/Pause actions and a Resume
for a paused line, and `Stop` now also appends a `STOP` event for a CRI
alongside the `stoppedAt`/`stoppedBy`/`stopReason` fields it already wrote.
This closes out Track 2.

### Fluid balance (Track 3, 2026-08-14)

Wires in `INSENSIBLE_LOSS` (recorded in `colicThresholds.ts` since 2026-08-04,
unused until now) as the last piece of a new panel: intake from Track 2's
structured rates, output from charted reflux plus insensible loss.

`utils/fluidBalance.ts` computes it. Intake sums every continuous line's
`infusedVolumeMl` plus plain-volume bolus administrations matched against
`"<number> mL"` specifically — a rate-shaped amount like `"2.08 mL/hr"` is
already counted through the line's own event log, not double-counted here. A
line with a rate that can't convert to volume (mass-based) is excluded from
intake but reported why in `excludedIntake` rather than silently dropped
(rule 9). Output sums reflux across every round in the current admission
(`columnsInCurrentAdmission`, Track 1's boundary) plus insensible loss scaled
by weight and elapsed time. Output and balance are always ranges, never a
midpoint — insensible loss can't be measured at the bedside, so collapsing it
to one number would misrepresent how much of the balance is charted versus
estimated (rule 1). New tab: **Fluid Balance**, next to Intelligence and
Scores.

Extending `isContinuousLine` (Track 2's CRI machinery) to FLUID-kind
treatments, not just CRI, turned out to be a prerequisite: a plain
crystalloid maintenance line is mechanically identical to a drug CRI, and
intake needs both.

Fixed along the way: `DoseEntryPanel`'s seeded `START` event stamped
`stampRecorded(clinician)` — write time — instead of the treatment's own
`startedAt`. Backdating a line's start (normal when logging a line that was
actually hung an hour ago) desynced the event log from the treatment, so
`infusedVolumeMl` integrated from "now" instead of from when the line
actually went up — a 24-hour, 100 mL/hr line read as 0 mL infused instead of
~2,400. Caught live before this shipped; the START event now takes
`startedAt` directly rather than re-stamping the write time.

### Evolution timeline (Track 4, 2026-08-14)

"Evolução" in the original vision — the record read forward as one merged
chronological feed instead of one screen at a time. `utils/episodeTimeline.ts`
merges three sources: rounds charted and edited (scoped to the current
admission via Track 1's `columnsInCurrentAdmission`), lab panels (unscoped,
matching `LabPanelView` itself), and every treatment event — not just
started/given/stopped, which is all `utils/treatments.ts`'s existing
`treatmentTimeline` surfaces, but every CRI event kind from Track 2's
`criEvents` log (rate changed, bag changed, paused, resumed) too. A treatment
stopped before the event log existed still gets a `TREATMENT_STOPPED` event
from the legacy `stoppedAt`/`stoppedBy` fields — nothing already on a sheet
drops out of the feed. A dose given under Track 2's early-dose override is
flagged with its reason shown inline. New tab: **Evolution**, rendering the
feed grouped by day. `treatmentTimeline` itself is untouched — narrower and
treatment-only by design, still used by `TreatmentsView`'s own "Given" mode.

### Deterioration alerts and NG-tube timer (Track 5, 2026-08-14)

Track 6 (backend/multi-user sync) stays deferred, per the earlier decision
recorded in the Storage note above — this pass covered Track 5 only.

**Ward-wide deterioration alerts.** `DashboardView`'s CRITICAL/WATCH coloring
and card labels used to read `patient.status`/`statusLabel` — fields set once
in sample data and never recomputed by anything, the same class of defect
rule 1 exists to prevent. A patient's card stayed the same colour forever
regardless of what was charted afterward. `utils/wardAlerts.ts` now computes
real severity per patient from `callSurgeonTriggers.ts`'s existing trigger
engine (the HR-rising trigger among them), scoped to the current admission
boundary, and the dashboard derives its counts, coloring and card label from
that. Found and fixed the same way: `patient.criActive` was equally static;
the "CRI Status" chip now reads `activeInfusions` (Track 2) — a real CRI
treatment was added to the sample data (Star Gazer) so the demo still shows
a running line, computed rather than fabricated. Both dead fields are
removed from `Patient` now that nothing reads them.

**NG-tube reassessment timer.** `schedule.ts` gains an `NG_TUBE` task kind.
Charting `nasogastricTube` as "In place" opens the task or resets its clock;
"Not placed"/"Removed" closes it; a round that doesn't touch the field
leaves the schedule untouched — silence about the tube is not evidence it
came out (rule 2). The 2-hour interval (`NG_TUBE_REASSESSMENT_HOURS`) is a
clinician-supplied ward convention, the same way `INSENSIBLE_LOSS` was, not
a published figure.

### Literature review plan, Sprint 1 (2026-08-15)

The app now has a second, code-verified evidence base alongside the clinical
sources above: `E:\Claude\Clinical app\plano_revisao_app_vs_literatura.md`
cross-checks 15 recommendations from a five-source literature synthesis
against the actual source, item by item, and sequences the confirmed gaps
into sprints. This entry covers Sprint 1 — the three lowest-risk items, each
extending an existing pattern rather than requiring new architecture.

**Three published fever tiers, not one line (A2).** The old pyrexia trigger
was a single 38.5°C cut-off. `readPyrexia` (`data/colicThresholds.ts`)
replaces it with three tiers from Loomes et al. 2025 (Equine Vet J
57:827-861) — mild (>38.6°C), significant (>39.2°C, OR 5.06 for postop
infection, 95% CI 2.10-12.20), high (>39.4°C, additionally associated with
diarrhoea and laminitis) — mapped to watch/warning/critical rather than one
flat severity. NSAID adjustment (−0.3°C on every tier, generalising a single
adjusted pair Bauck 2023 states) is *derived*, not a new manual field:
`utils/nsaid.ts` matches `Treatment.drug` against known NSAID names and
checks actual `Administration` timestamps for a dose within the last 4
hours — never a toggle a clinician could forget to set.

This widened `ClinicalTrigger.severity` from two levels to three
(`'watch' | 'warning' | 'critical'`, reusing the `AssessmentSeverity` scale
already used elsewhere rather than inventing a new one) — updated at all
four call sites (`FlowsheetView`, `RoundEntryView`, `LiveIntelligenceView`,
`wardAlerts.ts`) and their trigger-rendering UI.

**Trend generalised beyond heart rate (A3 extension).**
`readLactateTrend`/`readTemperatureTrend` follow the same
derivative-over-snapshot pattern `readHeartRate` established. Temperature
trend reads through the same NSAID-aware tiers `readPyrexia` uses.

**NG-tube removal suggestion (A4 extension).** Fires only when the tube is
charted "In place" on both the current and previous round *and* reflux was
below the significance threshold both times — two consecutive checks, never
one, and never suggests removing a tube the round didn't chart as present.

Remaining sprints (blood gas module, validated pain score, Salmonella
surveillance, etc.) are sequenced in the companion plan document.

### Literature review plan, Sprint 2 (2026-08-15)

**Complications, by identity and consequence, not by symptom text (A5).**
Gandini et al. 2023 found that none of 272 reviewed studies defined
"complication" explicitly. `types.ts` adds `ComplicationId` (19 members —
every complication that paper's four temporal-consequence tables name),
`ComplicationFrame` (`'MEDICAL' | 'RELAPAROTOMY' | 'FATAL' |
'POST_DISCHARGE'`) and `Complication extends Recorded`
(`{id, complicationId, frame, note?, resolvedAt?, resolvedBy?}`, closed
without deleting — same pattern as `Treatment.stoppedAt`). `frame` is a
per-instance field, not fixed per `ComplicationId`: Gandini's own tables show
the same complication (e.g. postoperative colic) landing in different frames
depending on individual patient outcome.

`data/complications.ts`'s `COMPLICATION_META` supplies a standardised
definition for the roughly half of the 19 where the source review documents
explicitly proposed one; the rest show "No standardised definition proposed
yet" rather than an invented cut-off — the absence is a faithful reflection
of what the literature doesn't yet agree on.

**Odds-ratio-weighted severity, not raw prevalence (A1).** Loomes et al. 2025
(Table 4) is the only source in this app's evidence base with an
elective-surgery comparator, and it exists for 8 of the 19 complications.
`orTierFor` maps OR > 10 → CRITICAL, OR 4-10 → ALERT, a non-significant OR or
OR < 4 → WATCH, and no comparator at all → `NOT_ESTABLISHED` — reported
honestly rather than defaulted into a tier the data doesn't support. This is
why fever (OR 17.97) outranks the far more prevalent postoperative colic (OR
4.11) in the new `ComplicationsView` tab, and why 11 of the 19 complications
(colic-only findings with nothing to compare against) never escalate ward
severity from this source alone.

`utils/wardAlerts.ts` now also derives triggers from open, unresolved
complications at CRITICAL/ALERT/WATCH tier — the same `ClinicalTrigger` shape
the round-based triggers use, so `wardAlert`/`topTrigger` need no special
case. A resolved complication, or one with `NOT_ESTABLISHED` tier, produces
no trigger.

### Literature review plan, Sprint 3 (2026-08-15)

**A8 (blood gas, 10 parameters) turned out to already be implemented** —
`labs.ts`'s `BLOOD_GAS_FIELDS` (pH, pCO₂, pO₂, HCO₃⁻, base excess) plus five
of `CHEMISTRY_FIELDS` (Na⁺, K⁺, Cl⁻, Mg²⁺, ionised Ca²⁺), all with Cornell
reference ranges. The review plan's original "Ausente" verdict only checked
`types.ts`; lab panel fields live in `labs.ts`/`cornellReferenceRanges.ts`
instead, so this needed a doc correction rather than any code — same shape
as A6 in the prior sprint map revision.

**A7 — peritoneal fluid cytology, the 5 fields genuinely missing.** The
review plan's "cor estruturada (não texto livre)" gap was also already
wrong: `PERITONEAL_FLUID` (`data/clinicalAssessments.ts`) is a structured,
severity-tagged pick, not free text. What was actually missing: total
protein, TCC and % degenerate neutrophils (`readPeritonealCytology`,
`data/colicThresholds.ts`, cited to Freeman/Blikslager, same source string
as `PERITONEAL_LACTATE`/`PCV_TP`/`REFLUX`), plus odor and intracellular
bacteria as new structured picks (`PERITONEAL_ODOR`, `PERITONEAL_BACTERIA`).
Intracellular bacteria present is its own critical call-surgeon trigger
(`peritoneal-bacteria`) — Freeman/Blikslager report it as confirming septic
peritonitis and indicating emergency surgery, a distinct finding from the
cytology thresholds. Wired into `RoundEntryView`, `ColicReadouts`,
`FlowsheetView` and `callSurgeonTriggers.ts` the same way the Sprint 1
trend fields were.

**B7 — SAA read correctly in the post-coeliotomy window.**
`biomarkerEvaluator.ts` previously flagged any SAA over 50 µg/mL as "active
inflammation" with no source at all (the code's own comment already said
so). That floor is gone. In its place: Bowlby et al. 2021's finding
(`SAA_POSTOP`, `data/colicThresholds.ts`) that SAA up to 568 µg/mL is normal
in the first 48h after coeliotomy, applied only within that window and
reported as a distinct `NORMAL_POSTOP` interpretation rather than folded
into `NORMAL` — so it's visible that the read is contextual, not silent.
This needed a new field, `Patient.surgeryPerformedAt` (set in Patient
Records, blank by default — many colic admissions are managed medically and
never see surgery), and `intelligence.ts`'s `columnToEntry` gained a
`hoursSincePostop` helper that measures against the *lab panel's*
`collectedAt`, not the round's time, since SAA is panel-sourced. Hoeberg's
sepsis/non-survival cut-offs (1,050/1,250 µg/mL) are unchanged and still
override the postop-normal read if crossed.

18 new tests. Live-verified: peritoneal cytology and intracellular-bacteria
triggers firing correctly from a charted round; SAA of 500 µg/mL rendering
as green "NORMAL POSTOP" (not the red sepsis-risk styling) once a surgery
time within the last 20h was set on the patient record.

### Literature review plan, Sprint 4 (2026-08-15)

**B1 — Composite Pain Scale and EAAPS, from the actual papers, not a
synthesis summary.** The review plan's B1 gap named van Loon 2014 and
Maskato 2020 but neither source document reproduced those papers' specific
behavioural sub-items — implementing them from the synthesis alone would
have meant inventing clinical criteria with someone else's citation on
them, which rule 3 exists to prevent. B1 was deferred rather than
guessed at; the user then supplied both PDFs directly, which unblocked it
properly.

`data/clinicalAssessments.ts` gains 9 `CPS_*` definitions, one per
behavioural sub-item of Bussières et al. 2008's Composite Pain Scale
(Table 2), transcribed verbatim as applied to visceral colic pain in van
Loon et al. 2014 — reluctance to move, sweating, kicking at abdomen,
pawing, posture, head movement, appetite, interactive behaviour, response
to palpation. Each option's severity tag (normal/watch/warning/critical)
doubles as its 0–3 CPS point value, a direct fit since `AssessmentSeverity`
already has exactly 4 tiers — `cpsPoints()` in `utils/intelligence.ts`
reads it back via `severityOf` rather than storing the number twice. The
scale's other 4 sub-items (heart rate, respiratory rate, digestive sounds,
temperature) are physiological and are derived from vitals/gut-sounds
already charted elsewhere, exactly Table 2's published bands — never
re-entered. `cpsPanel()` sums all 13 to a 0–39 total, following the same
`ScorePanel`/`Criterion` shape as `sirsPanel`/`casPanel`/`giSeverityPanel`.
Unlike CAS, van Loon 2014 publishes no single validated cut-off — only that
non-survivors' scores were significantly higher throughout the
post-operative period (median AUC ≈10 vs ≈4, P < 0.001) — so the panel's
severity banding is explicitly labelled a ward convention referencing that
range, not the source study's own threshold.

EAAPS (Maskato et al. 2020, Table 1) is a single "highest behaviour wins"
pick, which is exactly what a single-select already does — one new
`AssessmentDefinition` (`EAAPS`) plus an `EAAPS_SCORE` lookup for its 0–5
integer score. Unlike CPS, Maskato 2020 does publish three specific
cut-offs, each validated against a different construct (severe pain > 2.5,
surgical treatment > 3.5, mortality > 4.5) — `EAAPS_CUTOFFS`
(`data/colicThresholds.ts`) and a new `Readout` in `ColicReadouts.tsx`
present all three individually, the same "don't sum what wasn't validated
as a sum" treatment as the existing Bottegaro/McGovern admission cut-offs.

**B3 — Salmonella surveillance (Bauck 2023).** New `data/salmonella.ts`:
`evaluateSalmonellaIsolation()` requires all three published criteria
together (fever > 102°F/38.9°C, diarrhoea, WBC < 5,000/µL) — a partial
match is reported honestly ("meets 2 of 3") rather than as a false
positive or a silent miss. `SalmonellaTest` (method, result, `Recorded`)
and `Patient.salmonellaIsolation` are new; a `SALMONELLA` schedule-task
kind is seeded at admission (due immediately, 72h routine interval,
matching "collect on every case, not just suspected ones") and
`setSalmonellaIsolation()` retunes it to 12h the moment a clinician
confirms isolation, not from whenever the next sample happens to land. The
isolation criteria only ever *suggest* — nothing in this module sets
`salmonellaIsolation` automatically. New `SalmonellaPanel.tsx`, embedded in
the Laboratory tab: sample log, isolation toggle, and the automated
isolation-criteria read. A matching `callSurgeonTriggers.ts` entry
(`salmonella-isolation`) surfaces the same suggestion as a warning-severity
trigger when a round happens to chart all three inputs at once.

**B6 — Post-anaesthetic ocular exam (Loomes et al. 2025).** One new
structured pick, `OCULAR_EXAM` — corneal *abrasion*, not ulceration (the
precise finding the source reports), present in 17.6% of horses after
general anaesthesia and clinically under-diagnosed without fluorescein. No
odds ratio by anaesthesia duration is published, so this stays a simple
pass/fail finding rather than being folded into the OR-tier complication
model from Sprint 2.

22 new tests (373→395, 20→21 files). Live-verified: all 9 CPS
picks and the EAAPS pick render with the exact published criteria text;
selecting the top tier on 3 CPS items shows "CRITICAL" and the panel
computes a 14–35/39 range from what's charted, citing van Loon 2014;
EAAPS "Rolling" reads 5/5 and cites the mortality cut-off (>4.5, LR+ 5.5);
a charted corneal abrasion fires the `ocular` trigger with the 17.6%
citation; the Salmonella panel's isolation toggle and sample log both
persist, and the isolation-criteria readout correctly reports "2 of 3" for
a partial match.

### Literature review plan, Sprint 5 (2026-08-15) — plan complete

**B4 — post-op refeeding timeline, by lesion type (Bauck 2023).** New
`data/nutritionTimeline.ts`: four lesion-type rows (non-strangulating,
strangulating small intestine, large intestine with SIRS, large intestine
resection), each with its own water/food start time and diet. `Patient`
gains `lesionType` — a clinician-set classification, deliberately separate
from `diagnosis` free text ("large colon volvulus" doesn't say on its own
whether a resection was done) — edited in Patient Records alongside
`surgeryPerformedAt`. Two of the four rows are gated on a fixed number of
hours after recovery from anaesthesia (reads `surgeryPerformedAt`, added in
Sprint 3); the other two are gated on SIRS resolving instead, read from
`sirsPanel`'s own severity (`normal` → resolved, `critical` → not, `watch`
or no data → unknown) rather than re-deriving SIRS status a second way.
Rendered as a new "Post-op refeeding timeline" section on Clinical
Intelligence, adult patients only.

Also new: `exerciseReturnPhase()`, the fixed 30-day-stall /
30-day-paddock / 30-day-pasture / 90-day-athletic-return protocol the
source recommends for owner guidance, anchored to `Patient.dischargedAt`
(from Track 1) — undefined before discharge, since the clock only starts
once the horse actually goes home.

**B5 — post-discharge follow-up, using Sprint 2's complication frames
directly.** The review plan called this out explicitly: "Frame 4 is
literally this functionality." No new data model — `POST_DISCHARGE_PRIORITY`
(`data/complications.ts`) is 5 existing `ComplicationId`s (postoperative
colic, incisional hernia, incisional complication, laminitis, adhesions),
each with its Gandini et al. 2023 (Table 4, post-discharge frame)
prevalence and a note-prompt hint (e.g. "estimated size" for a hernia).
`ComplicationsView.tsx` gains a checklist, shown only once
`patient.lifecycle === 'DISCHARGED'`: a "Log" button per priority
complication pre-fills the existing add-complication form with that id and
`frame: 'POST_DISCHARGE'`, and reads "Logged" once one exists. The
exercise-return phase readout lives in the same section, since both are
"life after discharge" concerns.

This closes every gap the review plan identified (Sprints 1–5). Remaining
items (B2 sequenced POI protocol, C1–C4 prognosis/XAI research) were never
scheduled as engineering sprints — see the companion plan document.

21 new tests (395→414, 21→22 files). Live-verified: setting a patient's
lesion type to "Large intestine resection" and checking Clinical
Intelligence shows the refeeding timeline correctly gated on SIRS
("waiting on SIRS to resolve") rather than a clock time; discharging a
patient and opening Complications shows the 5-item post-discharge
checklist with prevalence percentages and the exercise-return phase
("Stall rest, day 0"); logging "Postoperative colic" from the checklist
pre-fills the form with `frame: 'POST_DISCHARGE'`, and the checklist item
flips to "Logged" once saved.

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
| `utils/admission.ts` | Current-admission boundary — see below |
| `utils/recorded.ts` | `stampRecorded` — the only place `{at, by}` is constructed |
| `utils/cri.ts` | `infusedVolumeMl`, `isContinuousLine` — volume from rate × elapsed time, for CRI and FLUID alike |
| `utils/fluidBalance.ts` | Intake vs. reflux + insensible loss, always a range |
| `utils/episodeTimeline.ts` | Rounds + labs + treatment events, merged and sorted |
| `utils/wardAlerts.ts` | Per-patient severity from the trigger engine, ward-wide |
| `utils/nsaid.ts` | `nsaidGivenWithin` — derives recent-NSAID from charted administrations |
| `data/complications.ts` | Standardised complication definitions + `orTierFor` OR-weighted severity |
| `data/salmonella.ts` | Isolation-criteria evaluation + surveillance interval constants |
| `data/clinicalAssessments.ts`'s `CPS_*`/`EAAPS` | Composite Pain Scale (van Loon 2014) and EAAPS (Maskato 2020) definitions |
| `data/nutritionTimeline.ts` | Post-op refeeding timeline by lesion type + return-to-exercise phase |

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
own — `vite.config.ts` is enough). 414 tests across 22 files in
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
- `intelligence.ts` — `columnToEntry`'s °F→°C conversion (so a foal's
  temperature is proven to reach the scoring panels), the WBC K/µL→cells/µL
  conversion (a charted 9.0 K/µL must not read as leukopenic — this is the
  same class of defect as the 10× overdose bug, just on a scoring threshold
  instead of a dose), and lab-panel sourcing for total calcium, SAA, NGAL,
  RPR, band neutrophils, fibrinogen and blood gas; `casPanel`'s band edges,
  the lactate table's closed gap, and the > 7 cutoff including the
  indeterminate case where missing data straddles it; `foalSurvivalPanel`'s
  legacy fallback (`gestationalAgeDays` over `fssPrematurityDays`, and the
  two staying independently selectable) including the `(legacy record)`
  evidence tag and that a fresh round takes priority over a legacy field.
- `biomarkerEvaluator.ts` — every SAA/NGAL/RPR cut-off against its cited
  paper, including the boundary values themselves (1,050/1,250 mg/L,
  455/1,104 µg/L, 0.0928).
- `neonatalSepsisScore.ts` — every published band edge for all twelve
  criteria, the blood-gas item's both-values-together rule, the petechiae/
  injected-membranes OR, and that a normal dam-history *note* no longer
  scores as an abnormal *finding*.
- `academicReferences.ts` — no duplicate ids, every entry has a title and a
  "used for", and every `sourceRefId` a `ScorePanel` sets resolves to a real
  entry — a typo here fails a test instead of shipping a dead citation link.
- `admission.ts` — a column with no `recordedAt` or a patient with no boundary
  set is never excluded; a boundary excludes everything charted before it and
  includes a round charted exactly on it; `latestColumn` never resurrects a
  round from a previous admission.
- `recorded.ts` — `stampRecorded` always returns a non-empty `by` alongside a
  valid `at` from a single call.
- `cri.ts` — `infusedVolumeMl` integrates constant and rate-changed segments
  correctly, excludes paused/stopped time, refuses to guess a volume from a
  mass-based rate, and matches the legacy single-segment fallback when there
  is no event log; `currentRate` prefers the log over the treatment's own
  rate; `isPaused` is true only when the most recent event is an unmatched
  `PAUSE`.
- `fluidBalance.ts` — continuous-line intake via `infusedVolumeMl`, a
  mass-based rate excluded but reported in `excludedIntake`, a plain-mL
  bolus counted but a rate-shaped `amountText` is not (already counted
  through the line), reflux summed only from rounds inside the current
  admission boundary, insensible loss scaled by weight and elapsed days as
  a range that always widens the balance rather than narrowing it to one
  number.
- `episodeTimeline.ts` — every source sorts newest-first together; a round
  and its edit both appear; a round with no `recordedAt` is never placed in
  time on a guess and a round from before the admission boundary is
  excluded; an early-override dose is flagged with its reason; every CRI
  event kind except `START` appears (`START` is already `t.startedAt`); a
  treatment with no `STOP` event in its log falls back to `stoppedAt`, and
  one that has a `STOP` event doesn't get double-counted.
- `wardAlerts.ts` — `sirsCriteriaMet` alone forces critical severity even
  with no trigger firing; a boundary-scoped patient never reads a stale
  round from a previous admission; `wardAlerts` excludes an
  `AWAITING_ARRIVAL`, `DISCHARGED` or `ARCHIVED` patient but includes a
  legacy patient with no `lifecycle` field at all; `topTrigger` prefers
  critical over warning.
- `schedule.ts` — the NG-tube task opens on "In place", resets its clock on
  a later round that still finds it in place, closes on "Removed", and is
  untouched by a round that never charts the field at all; a round with
  nothing charted never opens the task from nothing.

**Not covered — deliberately out of scope for this pass, not forgotten:**
`callSurgeonTriggers.ts`, `prognosis.ts`, `gutSounds.ts`, `manure.ts`,
`referenceLookup.ts`, `formNavigation.ts`, `persistence.ts` (localStorage
read/write and schema versioning), every `data/*.ts` catalogue other than
`colicThresholds.ts`, `patientIdentity.ts` and `academicReferences.ts`, and
all of `components/` — no view has ever been rendered under test. Rule 7
still applies: passing tests are not evidence a value reaches the screen.

### Orphaned modules

None remain. `data/flowsheetRows.ts` was deleted (2026-08-03) — superseded,
its fields are now real, type-checked fields on `LabField`/`NeonatalExamData`.
`data/academicReferences.ts` went from 72 entries to the 10 the code actually
cites and gained a view (see Sources, below) — no longer orphaned either way.

`utils/neonatalSepsisScore.ts` was wired in (2026-08-03), the last of the
three orphaned scoring modules. Rewritten into the `ScorePanel` shape and
renders through the same shared `ScorePanelCard` as every other panel, in
both Clinical Intelligence and `NeonatalAssessmentView`. Two defects fixed
along the way, not just the wiring:
- **The absolute-vs-percentage guess on band neutrophils is gone, not
  resolved.** The old code had no way to know which the charted number was,
  so it guessed ("under 50, assume it's a percentage of WBC"). `entry.bands`
  is now always an absolute cells/µL count — converted at the same K/µL
  boundary as WBC — so there's nothing left to guess.
- **The history item no longer reads `patient.damHistory` for its *content*.**
  It scored any non-empty dam-history text as abnormal, including a normal
  foaling note — the check was presence-of-text, not what the text said. It
  now reads `patient.abnormalPerinatalHistory`, a clinician judgement entered
  in `NeonatalAssessmentView` next to gestation, and is split into two
  criteria (perinatal history, prematurity) instead of one opaque combined
  number, so the ledger shows which one actually contributed.

Also dropped: a duplicate neonatal-SIRS count this file computed
independently of `neonatalSirsPanel`, which already implements it and is
already wired in — two engines computing the same four criteria, kept as one.

`biomarkerEvaluator.ts` was wired into Clinical Intelligence (2026-08-03)
without ever being able to receive data — SAA, NGAL and RPR were not
chartable anywhere — and its thresholds carried no citation, published or
otherwise. Both are fixed: `lab_ngal` joined `lab_saa` in the lab panel, RPR
reads the already-derived `lab_rpr` instead of re-dividing RDW by platelets a
second way, and every cut-off now traces to its paper (Hoeberg 2022, Laurberg
2023, Scalco 2023) except the SAA "elevated" floor and the RPR "at risk"
floor, which are labelled unsourced rather than attributed to one.

`data/academicReferences.ts` was triaged from 72 entries to 10 (2026-08-03) —
what a score panel or published threshold actually implements, not a reading
list. Dropped: an AI-decision-support scoping review, several alternative
sepsis-scoring papers this app doesn't implement, secondary write-ups of the
same three biomarker papers already listed under one primary citation each,
and a run of FHIR/healthcare-app-architecture articles unrelated to any
clinical content. Kept, and newly added: Freeman and Blikslager as book
entries, since `colicThresholds.ts` cites them constantly but they were never
on the list at all. Two kept entries had the wrong first author — "Borchers"
and "Dembek" — transcription errors against the actual papers (Laurberg and
Scalco respectively), corrected rather than carried forward. `ScorePanel`
gained `sourceRefId`, and a new **Sources** tab (`SourcesView.tsx`) renders
the triaged list; a panel's citation chip is a link to its entry there when
`sourceRefId` is set, plain text when it isn't (the GI severity ledger and
neonatal SIRS panel are both deliberately uncited — nothing to link to).
Reference intervals stay cited separately, next to the intervals they
support, in `RANGE_SOURCES` in `data/ageStratifiedReferenceRanges.ts` — that
registry was already doing this well and wasn't folded in.

`utils/physiologicalValidator.ts` and `data/neonatalReferenceRanges.ts` were
deleted (2026-07-31): the validator duplicated `prognosis.ts`'s cited cut-offs
on the retired `PatientCategory` axis rather than the current `patientAge()`
model, and the reference ranges were an uncited, superseded duplicate of
`ageStratifiedReferenceRanges.ts`. Neither had an importer.

The Foal Survival Score's split-brain is fixed (2026-08-03).
`NeonatalAssessmentView` no longer runs its own scorer — it renders the same
`foalSurvivalPanel` result Clinical Intelligence does, via the shared
`ScorePanelCard` (extracted from `LiveIntelligenceView`'s formerly-private
`PanelCard`, so there is exactly one renderer for every `ScorePanel` in the
app). Cold extremities and infectious sites moved to the round's Neonatal
Exam section; gestational age now writes `patient.gestationalAgeDays`, the
field the engine actually reads, instead of the disconnected
`fssPrematurityDays`. The legacy `fssPrematurityDays`/`fssColdExtremities`/
`fssInfectiousSite` fields stay readable as a fallback — mirroring
`patientAge`'s DOB-vs-legacy-text pattern — so foals admitted before this
change keep scoring; evidence sourced that way is marked `(legacy record)`
rather than presented as current. Also removed: an unconditional "Administer
IV Plasma Transfusion & Start Broad-Spectrum Antimicrobial Therapy" block that
rendered for every foal regardless of score — hardcoded, not derived from
anything charted, the same class of defect rule 1 exists to prevent.

### Structural limits

- **Single-browser storage.** No sync, no second device, no colleague. Clearing
  site data loses everything. A ward tool needs a backend and auth.
- **No print or export.** The flowsheet cannot reach the medical record.
- **Every scoring panel reads only the single most recent round.**
  `columnToEntry(patient, latestColumn(...))` looks at one column, not the
  history — charted five minutes ago in a different round, a value reads as
  "not charted" in the current panel until it's charted again. This is
  systemic (every panel: SIRS, GI severity, CAS, foal survival), not specific
  to any one view, and it means a labs-only save from `NeonatalAssessmentView`
  can make that round's vitals-dependent panels go blank until a fuller round
  is charted. The app never fabricates from a stale round to paper over
  this — see the `(legacy record)` fallback below — but the gap itself is
  unaddressed. A real fix needs the panels to look back further than one
  column, which is a bigger design question than this pass took on.
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
admission cut-offs · Farrell, Kersh, Liepman & Dembek 2021 (Front Vet Sci
8:697589) colic assessment score (adult) — see `casPanel` in
`utils/intelligence.ts`.

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
