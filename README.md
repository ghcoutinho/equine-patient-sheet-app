# Equine Patient Sheet App

![Equine Patient Sheet App](https://img.shields.io/badge/Clinical_Status-Ready-success)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)

A professional, offline-first clinical application designed for equine surgeons and internal medicine specialists. This app seamlessly integrates evidence-based medicine, expansive pharmacological formularies, and dynamic physiological scoring into a unified intensive care flowsheet.

> *"As an equine surgeon, I built this application to mirror my own clinical thought process when evaluating a horse in pain. It bridges the gap between bedside clinical intuition and the most advanced prognostic algorithms available today, translating standard clinical and laboratory data into real-time, actionable insights."* 
> — **Dr. Gustavo Henrique Coutinho, Creator**

## Key Features

### 1. Dynamic ICU Flowsheet
*   **Adaptive Schemas:** The flowsheet automatically shifts parameters based on the patient category (Neonatal Foal vs. Adult Colic vs. Adult GI).
*   **Real-time Validation:** Physiological inputs are instantly validated against established reference ranges (e.g., Cornell Reference Values).
*   **Sparkline Trends:** Visualizes numeric trends (like Heart Rate or Lactate) directly in the flowsheet rows for immediate recognition of patient trajectory.

### 2. Advanced Prognosis Engine & XAI
*   **Neonatal Sepsis & Survival (FSS):** Integrates the Brewer & Koterba Sepsis Score and the Foal Survival Score to predict outcomes mathematically.
*   **Adult Sepsis & Colic Assessment (CAS):** Computes Adult SIRS criteria (Biondi 2026) and specific colic prognostic markers.
*   **Explainable AI (XAI) Drill-Down:** Based on Gao (2026), the engine features a "SHAP-like" visual drill-down. It transparently shows the clinician exactly *why* a specific score was generated (e.g., highlighting that a Lactate of 4.5 mmol/L is disproportionately skewing the mortality risk).

### 3. Massive Drug Formulary & Dose Calculator
*   **193-Drug Database:** Expands upon standard formularies using *Equine Internal Medicine* (Reed, Bayly & Sellon, 2018), covering 24 clinical categories.
*   **Clinical Guardrails:** When adding a medication, the calculator auto-computes exact mL/mg dosages based on weight. It enforces a strict **clinician confirmation workflow** that pre-suggests the optimal route and application interval.

### 4. Structured Clinical Assessment Tools
Imported from the Colic Monitoring Tool (`colic-flowsheet-app`) and generalised so that adding an assessment is a data entry rather than a new component.

*   **Four-Quadrant Gut Sounds:** Auscultation is charted per quadrant — left/right × dorsal/ventral — each graded `++` hypermotile, `+` normal, `-` reduced, `0` absent. A live anatomical cross mirrors the layout the clinician just auscultated, the motility impression and CAS gut-sound grade are derived from the four grades rather than typed separately, and the flowsheet renders the quadrant cross inline so a trend is readable across rounds.
*   **One-Tap Structured Findings:** Fourteen catalogued assessments — mucous membranes, mentation, pain behaviour, analgesia, rectal examination, FLASH abdominal ultrasound, peritoneal fluid appearance, reflux appearance, nasogastric tube, response to medical therapy, digital pulse, cryotherapy, IV catheter site and incision status. Each option carries a triage weight that drives cell colour and escalation.
*   **Manure Recorder:** Passage recorded explicitly as yes/no, with amount and consistency qualifiers, so successive rounds without manure are visible as a finding rather than as blank cells.
*   **Call-Surgeon Trigger Engine:** Eleven ward escalation rules evaluated live against the round being charted and against the latest saved round — tachycardia, tachypnoea, pyrexia, net reflux, pain score, refractory response, absent gut sounds, rectal findings, FLASH findings, peritoneal fluid and hyperlactataemia, plus a laminitis watch. Every alert shows the charted evidence and the rule that fired, and no alert is ever raised from absent data.

> These triage weightings and escalation thresholds are ward conventions agreed with the attending clinician. They are clinical decision support, not validated outcome models, and the interface labels them as such.

### 5. Academic Literature Integration
*   The application includes a built-in library of the primary literature powering the algorithms. Clinicians can audit the exact DOIs, study parameters, and implementation logic used for every cutoff threshold in the app.

## Architecture & Tech Stack

- **Framework:** React 19 + Vite
- **Language:** Strict TypeScript
- **Design System:** Custom Dark-Mode Clinical UI (Vanilla CSS + CSS Variables)
- **Data Persistence:** LocalStorage / Offline-First Progressive Web App (PWA) architecture.

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Development Server:**
   ```bash
   npm run dev
   ```

3. **Build for Production:**
   ```bash
   npm run build
   ```

## Clinical Disclaimer

This application is designed as an assistive tool for licensed veterinary professionals. While the algorithms are sourced from peer-reviewed literature, they do not replace clinical judgment. Always verify medication dosages and physiological interpretations.
