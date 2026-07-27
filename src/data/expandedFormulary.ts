import type { DrugFormularyItem } from '../types';

export const EXPANDED_FORMULARY: DrugFormularyItem[] = [
  {
    "id": "amikacin",
    "name": "Amikacin",
    "brandName": "Amiglyde-V",
    categories: ["Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"],
    "doseMin": 21.0,
    "doseMax": 25.0,
    "doseDefault": 21.0,
    "doseUnit": "mg/kg",
    "concentration": 250.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV",
      "IM"
    ],
    "frequency": "q24h",
    "indications": [
      "Gram-negative sepsis"
    ],
    "cautions": "Nephrotoxicity, monitor TDM",
    "notes": "",
    "isCRI": false,
    "patientType": "FOAL"
  },
  {
    "id": "ampicillin_sodium",
    "name": "Ampicillin sodium",
    "brandName": "Polyflex",
    categories: ["Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"],
    "doseMin": 20.0,
    "doseMax": 30.0,
    "doseDefault": 20.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "q6h-q8h",
    "indications": [
      "Broad spectrum sepsis"
    ],
    "cautions": "Reconstitute fresh",
    "notes": "",
    "isCRI": false,
    "patientType": "FOAL"
  },
  {
    "id": "cefotaxime",
    "name": "Cefotaxime",
    "brandName": "Claforan",
    categories: ["Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"],
    "doseMin": 20.0,
    "doseMax": 40.0,
    "doseDefault": 20.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "q6h",
    "indications": [
      "Neonatal sepsis, meningitis"
    ],
    "cautions": "Phlebitis",
    "notes": "",
    "isCRI": false,
    "patientType": "FOAL"
  },
  {
    "id": "ticarcillin-clavulanate",
    "name": "Ticarcillin-clavulanate",
    "brandName": "Timentin",
    categories: ["Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"],
    "doseMin": 50.0,
    "doseMax": 50.0,
    "doseDefault": 50.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "q6h-q8h",
    "indications": [
      "Broad spectrum, pseudomonas"
    ],
    "cautions": "High sodium load",
    "notes": "",
    "isCRI": false,
    "patientType": "FOAL"
  },
  {
    "id": "enrofloxacin",
    "name": "Enrofloxacin",
    "brandName": "Baytril",
    categories: ["Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"],
    "doseMin": 5.0,
    "doseMax": 10.0,
    "doseDefault": 5.0,
    "doseUnit": "mg/kg",
    "concentration": 100.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV",
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "Severe infections"
    ],
    "cautions": "Arthropathy in foals (use caution)",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "doxycycline",
    "name": "Doxycycline",
    "brandName": "Vibramycin",
    categories: ["Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"],
    "doseMin": 10.0,
    "doseMax": 10.0,
    "doseDefault": 10.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12h",
    "indications": [
      "Intracellular organisms"
    ],
    "cautions": "Risk of esophageal ulceration",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "azithromycin",
    "name": "Azithromycin",
    "brandName": "Zithromax",
    categories: ["Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"],
    "doseMin": 10.0,
    "doseMax": 10.0,
    "doseDefault": 10.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "Rhodococcus equi"
    ],
    "cautions": "Diarrhea, hyperthermia",
    "notes": "",
    "isCRI": false,
    "patientType": "FOAL"
  },
  {
    "id": "rifampin",
    "name": "Rifampin",
    "brandName": "Rifadin",
    categories: ["Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"],
    "doseMin": 5.0,
    "doseMax": 10.0,
    "doseDefault": 5.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12h",
    "indications": [
      "Rhodococcus equi (with macrolide)"
    ],
    "cautions": "Hepatotoxicity, red secretions",
    "notes": "",
    "isCRI": false,
    "patientType": "FOAL"
  },
  {
    "id": "nystatin",
    "name": "Nystatin",
    "brandName": "Nilstat",
    categories: ["Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"],
    "doseMin": 0,
    "doseMax": 0,
    "doseDefault": 0,
    "doseUnit": "IU/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q6h",
    "indications": [
      "GI candidiasis"
    ],
    "cautions": "Minimal systemic absorption",
    "notes": "",
    "isCRI": false,
    "patientType": "FOAL"
  },
  {
    "id": "fluconazole",
    "name": "Fluconazole",
    "brandName": "Diflucan",
    categories: ["Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"],
    "doseMin": 14.0,
    "doseMax": 14.0,
    "doseDefault": 14.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO",
      "IV"
    ],
    "frequency": "q24h",
    "indications": [
      "Systemic fungal infections"
    ],
    "cautions": "Monitor liver enzymes",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "acyclovir",
    "name": "Acyclovir",
    "brandName": "Zovirax",
    categories: ["Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"],
    "doseMin": 10.0,
    "doseMax": 20.0,
    "doseDefault": 10.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q8h-q12h",
    "indications": [
      "EHV-1"
    ],
    "cautions": "Poor oral bioavailability",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "diazepam",
    "name": "Diazepam",
    "brandName": "Valium",
    categories: ["Anticonvulsants / Neurologic"],
    "doseMin": 0.05,
    "doseMax": 0.2,
    "doseDefault": 0.05,
    "doseUnit": "mg/kg",
    "concentration": 5.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "Acute seizures"
    ],
    "cautions": "Short duration, binds to plastic",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "midazolam",
    "name": "Midazolam",
    "brandName": "Versed",
    categories: ["Anticonvulsants / Neurologic"],
    "doseMin": 0.02,
    "doseMax": 0.1,
    "doseDefault": 0.02,
    "doseUnit": "mg/kg",
    "concentration": 5.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV",
      "IM"
    ],
    "frequency": "PRN",
    "indications": [
      "Acute seizures, sedation"
    ],
    "cautions": "Less paradoxical excitement",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "midazolam_cri",
    "name": "Midazolam (CRI)",
    "brandName": "Versed",
    categories: ["Anticonvulsants / Neurologic"],
    "doseMin": 0.02,
    "doseMax": 0.06,
    "doseDefault": 0.02,
    "doseUnit": "mg/kg/hr",
    "concentration": 5.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "CRI",
    "indications": [
      "Refractory seizures"
    ],
    "cautions": "Protect from light",
    "notes": "",
    "isCRI": true,
    "patientType": "BOTH"
  },
  {
    "id": "phenobarbital",
    "name": "Phenobarbital",
    "brandName": "Luminal",
    categories: ["Anticonvulsants / Neurologic"],
    "doseMin": 5.0,
    "doseMax": 20.0,
    "doseDefault": 5.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "Seizure management"
    ],
    "cautions": "Sedation, hepatopathy",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "phenobarbital_oral",
    "name": "Phenobarbital (Oral)",
    "brandName": "Luminal",
    categories: ["Anticonvulsants / Neurologic"],
    "doseMin": 2.0,
    "doseMax": 10.0,
    "doseDefault": 2.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12h",
    "indications": [
      "Maintenance seizure control"
    ],
    "cautions": "Monitor serum levels",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "gabapentin",
    "name": "Gabapentin",
    "brandName": "Neurontin",
    categories: ["Anticonvulsants / Neurologic"],
    "doseMin": 2.5,
    "doseMax": 20.0,
    "doseDefault": 2.5,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q8h-q12h",
    "indications": [
      "Neuropathic pain"
    ],
    "cautions": "Sedation",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "levetiracetam",
    "name": "Levetiracetam",
    "brandName": "Keppra",
    categories: ["Anticonvulsants / Neurologic"],
    "doseMin": 50.0,
    "doseMax": 100.0,
    "doseDefault": 50.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO",
      "IV"
    ],
    "frequency": "q8h",
    "indications": [
      "Seizure management"
    ],
    "cautions": "Sedation",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "magnesium_sulfate",
    "name": "Magnesium sulfate",
    "brandName": "Epsom salt",
    categories: ["Anticonvulsants / Neurologic"],
    "doseMin": 50.0,
    "doseMax": 50.0,
    "doseDefault": 50.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "Seizures (asphyxia)"
    ],
    "cautions": "Hypotension",
    "notes": "",
    "isCRI": false,
    "patientType": "FOAL"
  },
  {
    "id": "potassium_bromide",
    "name": "Potassium bromide",
    "brandName": "KBr",
    categories: ["Anticonvulsants / Neurologic"],
    "doseMin": 20.0,
    "doseMax": 40.0,
    "doseDefault": 20.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "Maintenance seizure control"
    ],
    "cautions": "Long half-life",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "thiamine_b1",
    "name": "Thiamine (B1)",
    "brandName": "Vitamin B1",
    categories: ["Anticonvulsants / Neurologic"],
    "doseMin": 2.0,
    "doseMax": 5.0,
    "doseDefault": 2.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV",
      "IM"
    ],
    "frequency": "q12h-q24h",
    "indications": [
      "Thiamine deficiency, neuro"
    ],
    "cautions": "Anaphylaxis with IV",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "quinidine_gluconate",
    "name": "Quinidine gluconate",
    "brandName": "",
    categories: ["Cardiovascular"],
    "doseMin": 1.0,
    "doseMax": 2.0,
    "doseDefault": 1.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "q10min",
    "indications": [
      "Atrial fibrillation"
    ],
    "cautions": "Hypotension, arrhythmias",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "quinidine_sulfate",
    "name": "Quinidine sulfate",
    "brandName": "",
    categories: ["Cardiovascular"],
    "doseMin": 22.0,
    "doseMax": 22.0,
    "doseDefault": 22.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q2h",
    "indications": [
      "Atrial fibrillation"
    ],
    "cautions": "GI toxicity, laminitis",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "procainamide",
    "name": "Procainamide",
    "brandName": "Pronestyl",
    categories: ["Cardiovascular"],
    "doseMin": 1.0,
    "doseMax": 2.0,
    "doseDefault": 1.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "q10min",
    "indications": [
      "Ventricular arrhythmias"
    ],
    "cautions": "Hypotension",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "diltiazem",
    "name": "Diltiazem",
    "brandName": "Cardizem",
    categories: ["Cardiovascular"],
    "doseMin": 0.125,
    "doseMax": 0.125,
    "doseDefault": 0.125,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "q2min",
    "indications": [
      "Atrial fibrillation"
    ],
    "cautions": "Hypotension",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "propranolol",
    "name": "Propranolol",
    "brandName": "Inderal",
    categories: ["Cardiovascular"],
    "doseMin": 0.05,
    "doseMax": 0.1,
    "doseDefault": 0.05,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "Tachyarrhythmias"
    ],
    "cautions": "Bronchospasm",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "digoxin",
    "name": "Digoxin",
    "brandName": "Lanoxin",
    categories: ["Cardiovascular"],
    "doseMin": 0.01,
    "doseMax": 0.02,
    "doseDefault": 0.01,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12h",
    "indications": [
      "Atrial fibrillation, CHF"
    ],
    "cautions": "Narrow therapeutic index",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "vasopressin",
    "name": "Vasopressin",
    "brandName": "Pitressin",
    categories: ["Cardiovascular"],
    "doseMin": 0.5,
    "doseMax": 2.0,
    "doseDefault": 0.5,
    "doseUnit": "mU/kg/min",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "CRI",
    "indications": [
      "Vasodilatory shock"
    ],
    "cautions": "Ischemia",
    "notes": "",
    "isCRI": true,
    "patientType": "BOTH"
  },
  {
    "id": "norepinephrine",
    "name": "Norepinephrine",
    "brandName": "Levophed",
    categories: ["Cardiovascular"],
    "doseMin": 0.1,
    "doseMax": 2.0,
    "doseDefault": 0.1,
    "doseUnit": "mcg/kg/min",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "CRI",
    "indications": [
      "Severe hypotension"
    ],
    "cautions": "Tissue necrosis if extravasated",
    "notes": "",
    "isCRI": true,
    "patientType": "BOTH"
  },
  {
    "id": "phenylephrine",
    "name": "Phenylephrine",
    "brandName": "Neo-Synephrine",
    categories: ["Cardiovascular"],
    "doseMin": 1.0,
    "doseMax": 5.0,
    "doseDefault": 1.0,
    "doseUnit": "mcg/kg/min",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "CRI",
    "indications": [
      "Hypotension, nephrosplenic"
    ],
    "cautions": "Reflex bradycardia",
    "notes": "",
    "isCRI": true,
    "patientType": "ADULT"
  },
  {
    "id": "epinephrine",
    "name": "Epinephrine",
    "brandName": "Adrenalin",
    categories: ["Cardiovascular"],
    "doseMin": 0.01,
    "doseMax": 0.02,
    "doseDefault": 0.01,
    "doseUnit": "mg/kg",
    "concentration": 1.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV",
      "IM"
    ],
    "frequency": "PRN",
    "indications": [
      "Anaphylaxis, cardiac arrest"
    ],
    "cautions": "Arrhythmias",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "atropine",
    "name": "Atropine",
    "brandName": "",
    categories: ["Cardiovascular"],
    "doseMin": 0.01,
    "doseMax": 0.02,
    "doseDefault": 0.01,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "Bradycardia, vagal arrest"
    ],
    "cautions": "Ileus",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "glycopyrrolate",
    "name": "Glycopyrrolate",
    "brandName": "Robinul",
    categories: ["Cardiovascular"],
    "doseMin": 0.005,
    "doseMax": 0.01,
    "doseDefault": 0.005,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "Bradycardia"
    ],
    "cautions": "Ileus (less than atropine)",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "dexamethasone",
    "name": "Dexamethasone",
    "brandName": "Azium",
    categories: ["Respiratory"],
    "doseMin": 0.02,
    "doseMax": 0.1,
    "doseDefault": 0.02,
    "doseUnit": "mg/kg",
    "concentration": 2.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV",
      "IM",
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "Severe asthma"
    ],
    "cautions": "Laminitis risk",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "prednisolone",
    "name": "Prednisolone",
    "brandName": "",
    categories: ["Respiratory"],
    "doseMin": 1.0,
    "doseMax": 2.0,
    "doseDefault": 1.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "Equine asthma"
    ],
    "cautions": "Taper dose",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "fluticasone",
    "name": "Fluticasone",
    "brandName": "Flovent",
    categories: ["Respiratory"],
    "doseMin": 2000.0,
    "doseMax": 3000.0,
    "doseDefault": 2000.0,
    "doseUnit": "mcg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "Inhal"
    ],
    "frequency": "q12h",
    "indications": [
      "Equine asthma"
    ],
    "cautions": "Use equine inhaler mask",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "ipratropium",
    "name": "Ipratropium",
    "brandName": "Atrovent",
    categories: ["Respiratory"],
    "doseMin": 90.0,
    "doseMax": 180.0,
    "doseDefault": 90.0,
    "doseUnit": "mcg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "Inhal"
    ],
    "frequency": "q6h-q12h",
    "indications": [
      "Bronchospasm"
    ],
    "cautions": "Mild tachycardia",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "albuterol",
    "name": "Albuterol",
    "brandName": "ProAir",
    categories: ["Respiratory"],
    "doseMin": 360.0,
    "doseMax": 720.0,
    "doseDefault": 360.0,
    "doseUnit": "mcg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "Inhal"
    ],
    "frequency": "PRN",
    "indications": [
      "Acute bronchospasm"
    ],
    "cautions": "Tachycardia, sweating",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "clenbuterol",
    "name": "Clenbuterol",
    "brandName": "Ventipulmin",
    categories: ["Respiratory"],
    "doseMin": 0.8,
    "doseMax": 3.2,
    "doseDefault": 0.8,
    "doseUnit": "mcg/kg",
    "concentration": 72.5,
    "concentrationUnit": "mg/mL",
    "route": [
      "PO"
    ],
    "frequency": "q12h",
    "indications": [
      "Bronchodilation"
    ],
    "cautions": "Tachycardia, sweating",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "aminophylline",
    "name": "Aminophylline",
    "brandName": "",
    categories: ["Respiratory"],
    "doseMin": 4.0,
    "doseMax": 5.0,
    "doseDefault": 4.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "q12h",
    "indications": [
      "Bronchodilation"
    ],
    "cautions": "CNS excitement, arrhythmias",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "n-acetylcysteine",
    "name": "N-acetylcysteine",
    "brandName": "Mucomyst",
    categories: ["Respiratory"],
    "doseMin": 10.0,
    "doseMax": 10.0,
    "doseDefault": 10.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "Inhal",
      "PO"
    ],
    "frequency": "q12h",
    "indications": [
      "Mucolytic"
    ],
    "cautions": "Bronchospasm (inhalation)",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "furosemide",
    "name": "Furosemide",
    "brandName": "Salix",
    categories: ["Respiratory"],
    "doseMin": 0.5,
    "doseMax": 1.0,
    "doseDefault": 0.5,
    "doseUnit": "mg/kg",
    "concentration": 50.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "EIPH prophylaxis"
    ],
    "cautions": "Dehydration, hypokalemia",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "buscopan",
    "name": "Buscopan",
    "brandName": "Buscopan",
    categories: ["Respiratory"],
    "doseMin": 0.3,
    "doseMax": 0.3,
    "doseDefault": 0.3,
    "doseUnit": "mg/kg",
    "concentration": 20.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "Acute asthma exacerbation"
    ],
    "cautions": "Tachycardia, ileus",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "omeprazole_tx",
    "name": "Omeprazole (Tx)",
    "brandName": "Gastrogard",
    categories: ["Gastrointestinal \u2014 Ulcer Prophylaxis/Treatment"],
    "doseMin": 4.0,
    "doseMax": 4.0,
    "doseDefault": 4.0,
    "doseUnit": "mg/kg",
    "concentration": 370.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "EGUS treatment"
    ],
    "cautions": "Give on empty stomach",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "omeprazole_px",
    "name": "Omeprazole (Px)",
    "brandName": "Ulcergard",
    categories: ["Gastrointestinal \u2014 Ulcer Prophylaxis/Treatment"],
    "doseMin": 1.0,
    "doseMax": 1.0,
    "doseDefault": 1.0,
    "doseUnit": "mg/kg",
    "concentration": 370.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "EGUS prophylaxis"
    ],
    "cautions": "-",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "sucralfate",
    "name": "Sucralfate",
    "brandName": "Carafate",
    categories: ["Gastrointestinal \u2014 Ulcer Prophylaxis/Treatment"],
    "doseMin": 20.0,
    "doseMax": 40.0,
    "doseDefault": 20.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q8h-q12h",
    "indications": [
      "Glandular/colonic ulcers"
    ],
    "cautions": "Binds other drugs",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "ranitidine",
    "name": "Ranitidine",
    "brandName": "Zantac",
    categories: ["Gastrointestinal \u2014 Ulcer Prophylaxis/Treatment"],
    "doseMin": 6.6,
    "doseMax": 6.6,
    "doseDefault": 6.6,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO",
      "IV"
    ],
    "frequency": "q8h",
    "indications": [
      "EGUS treatment"
    ],
    "cautions": "Adjust in renal failure",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "cimetidine",
    "name": "Cimetidine",
    "brandName": "Tagamet",
    categories: ["Gastrointestinal \u2014 Ulcer Prophylaxis/Treatment"],
    "doseMin": 15.0,
    "doseMax": 20.0,
    "doseDefault": 15.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO",
      "IV"
    ],
    "frequency": "q8h",
    "indications": [
      "EGUS treatment"
    ],
    "cautions": "CYP450 inhibitor",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "misoprostol",
    "name": "Misoprostol",
    "brandName": "Cytotec",
    categories: ["Gastrointestinal \u2014 Ulcer Prophylaxis/Treatment"],
    "doseMin": 5.0,
    "doseMax": 10.0,
    "doseDefault": 5.0,
    "doseUnit": "mcg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q8h-q12h",
    "indications": [
      "Glandular ulcers, right dorsal colitis"
    ],
    "cautions": "Abortion in mares",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "bismuth_subsalicylate",
    "name": "Bismuth subsalicylate",
    "brandName": "Pepto-Bismol",
    categories: ["Gastrointestinal \u2014 Ulcer Prophylaxis/Treatment"],
    "doseMin": 0.5,
    "doseMax": 1.0,
    "doseDefault": 0.5,
    "doseUnit": "mL/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q6h-q8h",
    "indications": [
      "Diarrhea"
    ],
    "cautions": "Salicylate toxicity in foals",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "pantoprazole",
    "name": "Pantoprazole",
    "brandName": "Protonix",
    categories: ["Gastrointestinal \u2014 Ulcer Prophylaxis/Treatment"],
    "doseMin": 1.0,
    "doseMax": 2.0,
    "doseDefault": 1.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "q24h",
    "indications": [
      "EGUS in hospitalized pt"
    ],
    "cautions": "Reconstitute fresh",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "dioctahedral_smectite",
    "name": "Dioctahedral smectite",
    "brandName": "Bio-Sponge",
    categories: ["Gastrointestinal \u2014 Ulcer Prophylaxis/Treatment"],
    "doseMin": 1.0,
    "doseMax": 1.0,
    "doseDefault": 1.0,
    "doseUnit": "kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12h",
    "indications": [
      "Toxin binding, diarrhea"
    ],
    "cautions": "Impaction",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "saccharomyces_boulardii",
    "name": "Saccharomyces boulardii",
    "brandName": "",
    categories: ["Gastrointestinal \u2014 Ulcer Prophylaxis/Treatment"],
    "doseMin": 25.0,
    "doseMax": 50.0,
    "doseDefault": 25.0,
    "doseUnit": "g",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12h",
    "indications": [
      "Probiotic, colitis"
    ],
    "cautions": "-",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "pergolide",
    "name": "Pergolide",
    "brandName": "Prascend",
    categories: ["Endocrine"],
    "doseMin": 0.5,
    "doseMax": 1.0,
    "doseDefault": 0.5,
    "doseUnit": "mg (total)",
    "concentration": 1.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "PPID (Cushing's)"
    ],
    "cautions": "Anorexia, lethargy",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "cyproheptadine",
    "name": "Cyproheptadine",
    "brandName": "Periactin",
    categories: ["Endocrine"],
    "doseMin": 0.25,
    "doseMax": 0.5,
    "doseDefault": 0.25,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12h",
    "indications": [
      "Refractory PPID, headshaking"
    ],
    "cautions": "Sedation",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "levothyroxine",
    "name": "Levothyroxine",
    "brandName": "Thyro-L",
    categories: ["Endocrine"],
    "doseMin": 0.1,
    "doseMax": 0.1,
    "doseDefault": 0.1,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "EMS weight loss, hypothyroidism"
    ],
    "cautions": "Hyperthyroidism",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "insulin_regular",
    "name": "Insulin Regular",
    "brandName": "Humulin R",
    categories: ["Endocrine"],
    "doseMin": 0.1,
    "doseMax": 0.2,
    "doseDefault": 0.1,
    "doseUnit": "IU/kg",
    "concentration": 100.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV",
      "SC"
    ],
    "frequency": "q6h-q12h",
    "indications": [
      "Hyperglycemia"
    ],
    "cautions": "Hypoglycemia",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "insulin_regular_cri",
    "name": "Insulin Regular (CRI)",
    "brandName": "Humulin R",
    categories: ["Endocrine"],
    "doseMin": 0.01,
    "doseMax": 0.05,
    "doseDefault": 0.01,
    "doseUnit": "IU/kg/hr",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "CRI",
    "indications": [
      "Severe hyperglycemia/DKA"
    ],
    "cautions": "Hypoglycemia",
    "notes": "",
    "isCRI": true,
    "patientType": "BOTH"
  },
  {
    "id": "insulin_nph",
    "name": "Insulin NPH",
    "brandName": "Novolin N",
    categories: ["Endocrine"],
    "doseMin": 0.15,
    "doseMax": 0.25,
    "doseDefault": 0.15,
    "doseUnit": "IU/kg",
    "concentration": 100.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "SC"
    ],
    "frequency": "q12h",
    "indications": [
      "Diabetes mellitus"
    ],
    "cautions": "Hypoglycemia",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "trilostane",
    "name": "Trilostane",
    "brandName": "Vetoryl",
    categories: ["Endocrine"],
    "doseMin": 0.5,
    "doseMax": 1.0,
    "doseDefault": 0.5,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "PPID (alternative)"
    ],
    "cautions": "Adrenal necrosis",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "cabergoline",
    "name": "Cabergoline",
    "brandName": "",
    categories: ["Endocrine"],
    "doseMin": 0.005,
    "doseMax": 0.005,
    "doseDefault": 0.005,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IM"
    ],
    "frequency": "q7d",
    "indications": [
      "PPID"
    ],
    "cautions": "Injection site reactions",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "metformin",
    "name": "Metformin",
    "brandName": "Glucophage",
    categories: ["Endocrine"],
    "doseMin": 15.0,
    "doseMax": 30.0,
    "doseDefault": 15.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12h",
    "indications": [
      "EMS"
    ],
    "cautions": "Poor bioavailability",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "pioglitazone",
    "name": "Pioglitazone",
    "brandName": "Actos",
    categories: ["Endocrine"],
    "doseMin": 1.0,
    "doseMax": 1.0,
    "doseDefault": 1.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "EMS"
    ],
    "cautions": "Hepatotoxicity",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "furosemide",
    "name": "Furosemide",
    "brandName": "Salix",
    categories: ["Urinary"],
    "doseMin": 1.0,
    "doseMax": 2.0,
    "doseDefault": 1.0,
    "doseUnit": "mg/kg",
    "concentration": 50.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV",
      "IM"
    ],
    "frequency": "q8h-q12h",
    "indications": [
      "Edema, oliguric renal failure"
    ],
    "cautions": "Dehydration, hypokalemia",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "mannitol_20%",
    "name": "Mannitol (20%)",
    "brandName": "Osmitrol",
    categories: ["Urinary"],
    "doseMin": 0.25,
    "doseMax": 1.0,
    "doseDefault": 0.25,
    "doseUnit": "g/kg",
    "concentration": 20.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "Acute renal failure, increased ICP"
    ],
    "cautions": "Fluid overload",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "spironolactone",
    "name": "Spironolactone",
    "brandName": "Aldactone",
    categories: ["Urinary"],
    "doseMin": 1.0,
    "doseMax": 2.0,
    "doseDefault": 1.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12h-q24h",
    "indications": [
      "K-sparing diuresis"
    ],
    "cautions": "Hyperkalemia",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "phenazopyridine",
    "name": "Phenazopyridine",
    "brandName": "Pyridium",
    categories: ["Urinary"],
    "doseMin": 4.0,
    "doseMax": 10.0,
    "doseDefault": 4.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12h",
    "indications": [
      "Urinary tract analgesia"
    ],
    "cautions": "Methemoglobinemia",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "dantrolene",
    "name": "Dantrolene",
    "brandName": "Dantrium",
    categories: ["Urinary"],
    "doseMin": 2.0,
    "doseMax": 2.0,
    "doseDefault": 2.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12h",
    "indications": [
      "Urethral relaxation, myopathy"
    ],
    "cautions": "Hepatotoxicity, weakness",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "prazosin",
    "name": "Prazosin",
    "brandName": "Minipress",
    categories: ["Urinary"],
    "doseMin": 0.02,
    "doseMax": 0.05,
    "doseDefault": 0.02,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q8h-q12h",
    "indications": [
      "Urethral relaxation"
    ],
    "cautions": "Hypotension",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "bethanechol",
    "name": "Bethanechol",
    "brandName": "Urecholine",
    categories: ["Urinary"],
    "doseMin": 0.025,
    "doseMax": 0.075,
    "doseDefault": 0.025,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "SC"
    ],
    "frequency": "q8h",
    "indications": [
      "Bladder atony"
    ],
    "cautions": "Colic, salivation",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "ammonium_chloride",
    "name": "Ammonium chloride",
    "brandName": "",
    categories: ["Urinary"],
    "doseMin": 100.0,
    "doseMax": 200.0,
    "doseDefault": 100.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12h",
    "indications": [
      "Urine acidification"
    ],
    "cautions": "Metabolic acidosis",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "allopurinol",
    "name": "Allopurinol",
    "brandName": "Zyloprim",
    categories: ["Urinary"],
    "doseMin": 5.0,
    "doseMax": 5.0,
    "doseDefault": 5.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "Urate urolithiasis"
    ],
    "cautions": "Renal failure",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "acetazolamide",
    "name": "Acetazolamide",
    "brandName": "Diamox",
    categories: ["Urinary"],
    "doseMin": 2.0,
    "doseMax": 3.0,
    "doseDefault": 2.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12h",
    "indications": [
      "HYPP"
    ],
    "cautions": "Hypokalemia, metabolic acidosis",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "aminocaproic_acid",
    "name": "Aminocaproic acid",
    "brandName": "Amicar",
    categories: ["Hemostatic / Coagulation"],
    "doseMin": 20.0,
    "doseMax": 40.0,
    "doseDefault": 20.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "q6h-q8h",
    "indications": [
      "Hemorrhage"
    ],
    "cautions": "Thrombosis",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "aminocaproic_acid_cri",
    "name": "Aminocaproic acid (CRI)",
    "brandName": "",
    categories: ["Hemostatic / Coagulation"],
    "doseMin": 1.0,
    "doseMax": 2.0,
    "doseDefault": 1.0,
    "doseUnit": "mg/kg/hr",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "CRI",
    "indications": [
      "Severe hemorrhage"
    ],
    "cautions": "Thrombosis",
    "notes": "",
    "isCRI": true,
    "patientType": "ADULT"
  },
  {
    "id": "tranexamic_acid",
    "name": "Tranexamic acid",
    "brandName": "Lysteda",
    categories: ["Hemostatic / Coagulation"],
    "doseMin": 10.0,
    "doseMax": 20.0,
    "doseDefault": 10.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "q8h",
    "indications": [
      "Hemorrhage"
    ],
    "cautions": "Thrombosis",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "vitamin_k1",
    "name": "Vitamin K1",
    "brandName": "Phytonadione",
    categories: ["Hemostatic / Coagulation"],
    "doseMin": 1.0,
    "doseMax": 5.0,
    "doseDefault": 1.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "SC",
      "PO"
    ],
    "frequency": "q12h-q24h",
    "indications": [
      "Warfarin toxicity, coagulopathy"
    ],
    "cautions": "Anaphylaxis (IV)",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "heparin_unfractionated",
    "name": "Heparin (Unfractionated)",
    "brandName": "",
    categories: ["Hemostatic / Coagulation"],
    "doseMin": 40.0,
    "doseMax": 100.0,
    "doseDefault": 40.0,
    "doseUnit": "IU/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV",
      "SC"
    ],
    "frequency": "q8h-q12h",
    "indications": [
      "Hypercoagulability, DIC"
    ],
    "cautions": "Erythrocyte agglutination",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "lmwh_dalteparin",
    "name": "LMWH (Dalteparin)",
    "brandName": "Fragmin",
    categories: ["Hemostatic / Coagulation"],
    "doseMin": 50.0,
    "doseMax": 50.0,
    "doseDefault": 50.0,
    "doseUnit": "IU/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "SC"
    ],
    "frequency": "q24h",
    "indications": [
      "Thromboprophylaxis"
    ],
    "cautions": "Bleeding",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "aspirin",
    "name": "Aspirin",
    "brandName": "",
    categories: ["Hemostatic / Coagulation"],
    "doseMin": 5.0,
    "doseMax": 10.0,
    "doseDefault": 5.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q24h-q48h",
    "indications": [
      "Anti-platelet"
    ],
    "cautions": "Gastric ulceration",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "clopidogrel",
    "name": "Clopidogrel",
    "brandName": "Plavix",
    categories: ["Hemostatic / Coagulation"],
    "doseMin": 2.0,
    "doseMax": 2.0,
    "doseDefault": 2.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "Anti-platelet"
    ],
    "cautions": "Bleeding",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "formalin_10%",
    "name": "Formalin (10%)",
    "brandName": "",
    categories: ["Hemostatic / Coagulation"],
    "doseMin": 50.0,
    "doseMax": 100.0,
    "doseDefault": 50.0,
    "doseUnit": "mL (total)",
    "concentration": 10.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "ONCE",
    "indications": [
      "Refractory hemorrhage"
    ],
    "cautions": "Hemolysis, phlebitis",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "yunnan_baiyao",
    "name": "Yunnan Baiyao",
    "brandName": "",
    categories: ["Hemostatic / Coagulation"],
    "doseMin": 1.0,
    "doseMax": 2.0,
    "doseDefault": 1.0,
    "doseUnit": "capsules",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12h",
    "indications": [
      "Adjunct for hemorrhage"
    ],
    "cautions": "Unregulated supplement",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "dexamethasone",
    "name": "Dexamethasone",
    "brandName": "Azium",
    categories: ["Immunosuppressive / Anti-inflammatory (Steroids/Others)"],
    "doseMin": 0.05,
    "doseMax": 0.2,
    "doseDefault": 0.05,
    "doseUnit": "mg/kg",
    "concentration": 2.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV",
      "IM",
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "Immune-mediated disease"
    ],
    "cautions": "Laminitis, immunosuppression",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "prednisolone",
    "name": "Prednisolone",
    "brandName": "",
    categories: ["Immunosuppressive / Anti-inflammatory (Steroids/Others)"],
    "doseMin": 1.0,
    "doseMax": 2.0,
    "doseDefault": 1.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "Immune-mediated disease"
    ],
    "cautions": "Laminitis (less than dex)",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "azathioprine",
    "name": "Azathioprine",
    "brandName": "Imuran",
    categories: ["Immunosuppressive / Anti-inflammatory (Steroids/Others)"],
    "doseMin": 2.0,
    "doseMax": 3.0,
    "doseDefault": 2.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "IMHA, IBD"
    ],
    "cautions": "Bone marrow suppression",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "cyclophosphamide",
    "name": "Cyclophosphamide",
    "brandName": "Cytoxan",
    categories: ["Immunosuppressive / Anti-inflammatory (Steroids/Others)"],
    "doseMin": 300.0,
    "doseMax": 300.0,
    "doseDefault": 300.0,
    "doseUnit": "mg/m2",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "q3-4wks",
    "indications": [
      "Neoplasia, IMHA"
    ],
    "cautions": "Hemorrhagic cystitis",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "hydroxyurea",
    "name": "Hydroxyurea",
    "brandName": "Hydrea",
    categories: ["Immunosuppressive / Anti-inflammatory (Steroids/Others)"],
    "doseMin": 20.0,
    "doseMax": 40.0,
    "doseDefault": 20.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q3-4d",
    "indications": [
      "Polycythemia vera"
    ],
    "cautions": "Bone marrow suppression",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "gold_sodium_thiomalate",
    "name": "Gold sodium thiomalate",
    "brandName": "Myochrysine",
    categories: ["Immunosuppressive / Anti-inflammatory (Steroids/Others)"],
    "doseMin": 1.0,
    "doseMax": 1.0,
    "doseDefault": 1.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IM"
    ],
    "frequency": "weekly",
    "indications": [
      "Pemphigus foliaceus"
    ],
    "cautions": "Renal/hepatic toxicity",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "triamcinolone",
    "name": "Triamcinolone",
    "brandName": "Vetalog",
    categories: ["Immunosuppressive / Anti-inflammatory (Steroids/Others)"],
    "doseMin": 0.02,
    "doseMax": 0.04,
    "doseDefault": 0.02,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IM"
    ],
    "frequency": "PRN",
    "indications": [
      "Allergies, intra-articular"
    ],
    "cautions": "Laminitis (high risk)",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "flumethasone",
    "name": "Flumethasone",
    "brandName": "Flucort",
    categories: ["Immunosuppressive / Anti-inflammatory (Steroids/Others)"],
    "doseMin": 0.005,
    "doseMax": 0.005,
    "doseDefault": 0.005,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV",
      "IM"
    ],
    "frequency": "PRN",
    "indications": [
      "Anti-inflammatory"
    ],
    "cautions": "Laminitis",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "isoflupredone",
    "name": "Isoflupredone",
    "brandName": "Predef 2X",
    categories: ["Immunosuppressive / Anti-inflammatory (Steroids/Others)"],
    "doseMin": 0.02,
    "doseMax": 0.04,
    "doseDefault": 0.02,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IM"
    ],
    "frequency": "PRN",
    "indications": [
      "Anti-inflammatory"
    ],
    "cautions": "Severe hypokalemia",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "cyclosporine",
    "name": "Cyclosporine",
    "brandName": "Atopica",
    categories: ["Immunosuppressive / Anti-inflammatory (Steroids/Others)"],
    "doseMin": 2.5,
    "doseMax": 5.0,
    "doseDefault": 2.5,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12h-q24h",
    "indications": [
      "Immunosuppression"
    ],
    "cautions": "Variable absorption",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "methocarbamol",
    "name": "Methocarbamol",
    "brandName": "Robaxin",
    categories: ["Muscle Relaxants / Myopathy"],
    "doseMin": 10.0,
    "doseMax": 25.0,
    "doseDefault": 10.0,
    "doseUnit": "mg/kg",
    "concentration": 100.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV",
      "PO"
    ],
    "frequency": "q8h-q12h",
    "indications": [
      "Muscle spasm, tying-up"
    ],
    "cautions": "Sedation, ataxia",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "dantrolene",
    "name": "Dantrolene",
    "brandName": "Dantrium",
    categories: ["Muscle Relaxants / Myopathy"],
    "doseMin": 2.0,
    "doseMax": 4.0,
    "doseDefault": 2.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12h",
    "indications": [
      "Exertional rhabdomyolysis"
    ],
    "cautions": "Hepatotoxicity, weakness",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "acepromazine",
    "name": "Acepromazine",
    "brandName": "PromAce",
    categories: ["Muscle Relaxants / Myopathy"],
    "doseMin": 0.02,
    "doseMax": 0.04,
    "doseDefault": 0.02,
    "doseUnit": "mg/kg",
    "concentration": 10.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV",
      "IM"
    ],
    "frequency": "PRN",
    "indications": [
      "Tying-up (vasodilation)"
    ],
    "cautions": "Hypotension, paraphimosis",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "phenytoin",
    "name": "Phenytoin",
    "brandName": "Dilantin",
    categories: ["Muscle Relaxants / Myopathy"],
    "doseMin": 10.0,
    "doseMax": 15.0,
    "doseDefault": 10.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12h",
    "indications": [
      "Stringhalt, tying-up"
    ],
    "cautions": "Monitor blood levels",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "vitamin_e",
    "name": "Vitamin E",
    "brandName": "",
    categories: ["Muscle Relaxants / Myopathy"],
    "doseMin": 1000.0,
    "doseMax": 5000.0,
    "doseDefault": 1000.0,
    "doseUnit": "IU",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "EMND, myopathy"
    ],
    "cautions": "Use natural source (d-alpha)",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "selenium",
    "name": "Selenium",
    "brandName": "",
    categories: ["Muscle Relaxants / Myopathy"],
    "doseMin": 1.0,
    "doseMax": 2.5,
    "doseDefault": 1.0,
    "doseUnit": "mg (total)",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IM"
    ],
    "frequency": "q14d",
    "indications": [
      "White muscle disease"
    ],
    "cautions": "Acute toxicity",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "guaifenesin",
    "name": "Guaifenesin",
    "brandName": "",
    categories: ["Muscle Relaxants / Myopathy"],
    "doseMin": 50.0,
    "doseMax": 100.0,
    "doseDefault": 50.0,
    "doseUnit": "mg/kg",
    "concentration": 5.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "Muscle relaxation"
    ],
    "cautions": "Hemolysis if >5% conc",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "acetazolamide",
    "name": "Acetazolamide",
    "brandName": "Diamox",
    categories: ["Muscle Relaxants / Myopathy"],
    "doseMin": 2.0,
    "doseMax": 3.0,
    "doseDefault": 2.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q8h-q12h",
    "indications": [
      "HYPP maintenance"
    ],
    "cautions": "Hypokalemia",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "dextrose_50%",
    "name": "Dextrose (50%)",
    "brandName": "",
    categories: ["Muscle Relaxants / Myopathy"],
    "doseMin": 0.5,
    "doseMax": 1.0,
    "doseDefault": 0.5,
    "doseUnit": "mL/kg",
    "concentration": 50.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "Acute HYPP episode"
    ],
    "cautions": "Phlebitis",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "calcium_gluconate_23%",
    "name": "Calcium gluconate 23%",
    "brandName": "",
    categories: ["Muscle Relaxants / Myopathy"],
    "doseMin": 0.2,
    "doseMax": 0.4,
    "doseDefault": 0.2,
    "doseUnit": "mL/kg",
    "concentration": 23.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "Acute HYPP episode"
    ],
    "cautions": "Arrhythmias, bradycardia",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "atropine_ophthalmic",
    "name": "Atropine ophthalmic",
    "brandName": "",
    categories: ["Ophthalmic"],
    "doseMin": 1.0,
    "doseMax": 1.0,
    "doseDefault": 1.0,
    "doseUnit": "drop",
    "concentration": 1.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "Top",
      "Ophth"
    ],
    "frequency": "q12h-q24h",
    "indications": [
      "Uveitis"
    ],
    "cautions": "Ileus, systemic absorption",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "tropicamide",
    "name": "Tropicamide",
    "brandName": "Mydriacyl",
    categories: ["Ophthalmic"],
    "doseMin": 1.0,
    "doseMax": 1.0,
    "doseDefault": 1.0,
    "doseUnit": "drop",
    "concentration": 1.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "Top",
      "Ophth"
    ],
    "frequency": "PRN",
    "indications": [
      "Ocular exam"
    ],
    "cautions": "Short duration",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "timolol",
    "name": "Timolol",
    "brandName": "Timoptic",
    categories: ["Ophthalmic"],
    "doseMin": 1.0,
    "doseMax": 1.0,
    "doseDefault": 1.0,
    "doseUnit": "drop",
    "concentration": 0.5,
    "concentrationUnit": "mg/mL",
    "route": [
      "Top",
      "Ophth"
    ],
    "frequency": "q12h",
    "indications": [
      "Glaucoma"
    ],
    "cautions": "Systemic beta-blockade",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "dorzolamide",
    "name": "Dorzolamide",
    "brandName": "Trusopt",
    categories: ["Ophthalmic"],
    "doseMin": 1.0,
    "doseMax": 1.0,
    "doseDefault": 1.0,
    "doseUnit": "drop",
    "concentration": 2.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "Top",
      "Ophth"
    ],
    "frequency": "q8h-q12h",
    "indications": [
      "Glaucoma"
    ],
    "cautions": "Local irritation",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "ciprofloxacin_ophth",
    "name": "Ciprofloxacin ophth",
    "brandName": "Ciloxan",
    categories: ["Ophthalmic"],
    "doseMin": 1.0,
    "doseMax": 1.0,
    "doseDefault": 1.0,
    "doseUnit": "drop",
    "concentration": 0.3,
    "concentrationUnit": "mg/mL",
    "route": [
      "Top",
      "Ophth"
    ],
    "frequency": "q4h-q6h",
    "indications": [
      "Corneal ulcers"
    ],
    "cautions": "White precipitate",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "triple_antibiotic",
    "name": "Triple antibiotic",
    "brandName": "BNP",
    categories: ["Ophthalmic"],
    "doseMin": 1.0,
    "doseMax": 1.0,
    "doseDefault": 1.0,
    "doseUnit": "strip",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "Top",
      "Ophth"
    ],
    "frequency": "q4h-q6h",
    "indications": [
      "Corneal ulcers"
    ],
    "cautions": "Anaphylaxis (rare)",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "serum_autologous",
    "name": "Serum (autologous)",
    "brandName": "",
    categories: ["Ophthalmic"],
    "doseMin": 1.0,
    "doseMax": 1.0,
    "doseDefault": 1.0,
    "doseUnit": "drop",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "Top",
      "Ophth"
    ],
    "frequency": "q2h-q4h",
    "indications": [
      "Melting corneal ulcers"
    ],
    "cautions": "Keep refrigerated",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "voriconazole_ophth",
    "name": "Voriconazole ophth",
    "brandName": "",
    categories: ["Ophthalmic"],
    "doseMin": 1.0,
    "doseMax": 1.0,
    "doseDefault": 1.0,
    "doseUnit": "drop",
    "concentration": 1.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "Top",
      "Ophth"
    ],
    "frequency": "q4h-q6h",
    "indications": [
      "Fungal keratitis"
    ],
    "cautions": "Compounded",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "diclofenac_ophth",
    "name": "Diclofenac ophth",
    "brandName": "Voltaren",
    categories: ["Ophthalmic"],
    "doseMin": 1.0,
    "doseMax": 1.0,
    "doseDefault": 1.0,
    "doseUnit": "drop",
    "concentration": 0.1,
    "concentrationUnit": "mg/mL",
    "route": [
      "Top",
      "Ophth"
    ],
    "frequency": "q12h-q24h",
    "indications": [
      "Uveitis (NSAID)"
    ],
    "cautions": "Delays ulcer healing",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "flurbiprofen_ophth",
    "name": "Flurbiprofen ophth",
    "brandName": "Ocufen",
    categories: ["Ophthalmic"],
    "doseMin": 1.0,
    "doseMax": 1.0,
    "doseDefault": 1.0,
    "doseUnit": "drop",
    "concentration": 0.03,
    "concentrationUnit": "mg/mL",
    "route": [
      "Top",
      "Ophth"
    ],
    "frequency": "q12h-q24h",
    "indications": [
      "Uveitis (NSAID)"
    ],
    "cautions": "Delays ulcer healing",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "cyclosporine_ophth",
    "name": "Cyclosporine ophth",
    "brandName": "Optimmune",
    categories: ["Ophthalmic"],
    "doseMin": 1.0,
    "doseMax": 1.0,
    "doseDefault": 1.0,
    "doseUnit": "strip",
    "concentration": 0.2,
    "concentrationUnit": "mg/mL",
    "route": [
      "Top",
      "Ophth"
    ],
    "frequency": "q12h",
    "indications": [
      "ERU, IMMK"
    ],
    "cautions": "Immune suppression locally",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "chlorhexidine",
    "name": "Chlorhexidine",
    "brandName": "",
    categories: ["Dermatologic / Topical & Antiparasitic"],
    "doseMin": 0,
    "doseMax": 0,
    "doseDefault": 0,
    "doseUnit": "-",
    "concentration": 2.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "Topical"
    ],
    "frequency": "PRN",
    "indications": [
      "Skin infection"
    ],
    "cautions": "Corneal toxicity",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "silver_sulfadiazine",
    "name": "Silver sulfadiazine",
    "brandName": "Silvadene",
    categories: ["Dermatologic / Topical & Antiparasitic"],
    "doseMin": 0,
    "doseMax": 0,
    "doseDefault": 0,
    "doseUnit": "-",
    "concentration": 1.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "Topical"
    ],
    "frequency": "q12h-q24h",
    "indications": [
      "Burns, wound care"
    ],
    "cautions": "Delays granulation",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "miconazole",
    "name": "Miconazole",
    "brandName": "",
    categories: ["Dermatologic / Topical & Antiparasitic"],
    "doseMin": 0,
    "doseMax": 0,
    "doseDefault": 0,
    "doseUnit": "-",
    "concentration": 2.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "Topical"
    ],
    "frequency": "q12h",
    "indications": [
      "Dermatophytosis"
    ],
    "cautions": "Avoid eyes",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "ketoconazole",
    "name": "Ketoconazole",
    "brandName": "Nizoral",
    categories: ["Dermatologic / Topical & Antiparasitic"],
    "doseMin": 0,
    "doseMax": 0,
    "doseDefault": 0,
    "doseUnit": "-",
    "concentration": 2.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "Topical"
    ],
    "frequency": "q12h",
    "indications": [
      "Malassezia"
    ],
    "cautions": "-",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "lime_sulfur",
    "name": "Lime sulfur",
    "brandName": "",
    categories: ["Dermatologic / Topical & Antiparasitic"],
    "doseMin": 0,
    "doseMax": 0,
    "doseDefault": 0,
    "doseUnit": "-",
    "concentration": 2.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "Topical"
    ],
    "frequency": "weekly",
    "indications": [
      "Chorioptic mange"
    ],
    "cautions": "Smell, stains coat",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "ivermectin",
    "name": "Ivermectin",
    "brandName": "Eqvalan",
    categories: ["Dermatologic / Topical & Antiparasitic"],
    "doseMin": 0.2,
    "doseMax": 0.2,
    "doseDefault": 0.2,
    "doseUnit": "mg/kg",
    "concentration": 1.87,
    "concentrationUnit": "mg/mL",
    "route": [
      "PO"
    ],
    "frequency": "PRN",
    "indications": [
      "Nematodes"
    ],
    "cautions": "Do not use in foals < 4 mos",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "moxidectin",
    "name": "Moxidectin",
    "brandName": "Quest",
    categories: ["Dermatologic / Topical & Antiparasitic"],
    "doseMin": 0.4,
    "doseMax": 0.4,
    "doseDefault": 0.4,
    "doseUnit": "mg/kg",
    "concentration": 2.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "PO"
    ],
    "frequency": "PRN",
    "indications": [
      "Encysted cyathostomes"
    ],
    "cautions": "Narrow safety margin in foals",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "praziquantel",
    "name": "Praziquantel",
    "brandName": "Zimecterin",
    categories: ["Dermatologic / Topical & Antiparasitic"],
    "doseMin": 1.5,
    "doseMax": 2.5,
    "doseDefault": 1.5,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "PRN",
    "indications": [
      "Tapeworms"
    ],
    "cautions": "Usually combined with ivermectin",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "fenbendazole",
    "name": "Fenbendazole",
    "brandName": "Panacur",
    categories: ["Dermatologic / Topical & Antiparasitic"],
    "doseMin": 5.0,
    "doseMax": 10.0,
    "doseDefault": 5.0,
    "doseUnit": "mg/kg",
    "concentration": 10.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "PO"
    ],
    "frequency": "PRN",
    "indications": [
      "Ascarids, nematodes"
    ],
    "cautions": "Larvicidal dose is 10mg/kg x 5d",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "pyrantel_pamoate",
    "name": "Pyrantel pamoate",
    "brandName": "Strongid",
    categories: ["Dermatologic / Topical & Antiparasitic"],
    "doseMin": 6.6,
    "doseMax": 6.6,
    "doseDefault": 6.6,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "PRN",
    "indications": [
      "Nematodes, tapeworms(2x)"
    ],
    "cautions": "Resistance common",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "oxytocin",
    "name": "Oxytocin",
    "brandName": "",
    categories: ["Reproductive"],
    "doseMin": 10.0,
    "doseMax": 20.0,
    "doseDefault": 10.0,
    "doseUnit": "IU (total)",
    "concentration": 20.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV",
      "IM"
    ],
    "frequency": "PRN",
    "indications": [
      "Uterine clearance, retained placenta"
    ],
    "cautions": "Rupture of uterus",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "cloprostenol",
    "name": "Cloprostenol",
    "brandName": "Estrumate",
    categories: ["Reproductive"],
    "doseMin": 250.0,
    "doseMax": 250.0,
    "doseDefault": 250.0,
    "doseUnit": "mcg (total)",
    "concentration": 250.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IM"
    ],
    "frequency": "PRN",
    "indications": [
      "Luteolysis (PGF2a)"
    ],
    "cautions": "Sweating, cramping",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "dinoprost",
    "name": "Dinoprost",
    "brandName": "Lutalyse",
    categories: ["Reproductive"],
    "doseMin": 5.0,
    "doseMax": 10.0,
    "doseDefault": 5.0,
    "doseUnit": "mg (total)",
    "concentration": 5.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IM"
    ],
    "frequency": "PRN",
    "indications": [
      "Luteolysis (PGF2a)"
    ],
    "cautions": "Sweating, cramping (more severe)",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "altrenogest",
    "name": "Altrenogest",
    "brandName": "Regumate",
    categories: ["Reproductive"],
    "doseMin": 0.044,
    "doseMax": 0.044,
    "doseDefault": 0.044,
    "doseUnit": "mg/kg",
    "concentration": 2.2,
    "concentrationUnit": "mg/mL",
    "route": [
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "Suppress estrus, pregnancy maintenance"
    ],
    "cautions": "Human absorption",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "deslorelin",
    "name": "Deslorelin",
    "brandName": "SucroMate",
    categories: ["Reproductive"],
    "doseMin": 1.8,
    "doseMax": 1.8,
    "doseDefault": 1.8,
    "doseUnit": "mg (total)",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IM"
    ],
    "frequency": "ONCE",
    "indications": [
      "Induce ovulation"
    ],
    "cautions": "Downregulation if repeated",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "hcg",
    "name": "hCG",
    "brandName": "Chorulon",
    categories: ["Reproductive"],
    "doseMin": 1500.0,
    "doseMax": 3000.0,
    "doseDefault": 1500.0,
    "doseUnit": "IU (total)",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "ONCE",
    "indications": [
      "Induce ovulation"
    ],
    "cautions": "Antibody formation",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "domperidone",
    "name": "Domperidone",
    "brandName": "Equidone",
    categories: ["Reproductive"],
    "doseMin": 1.1,
    "doseMax": 1.1,
    "doseDefault": 1.1,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "Agalactia, fescue toxicosis"
    ],
    "cautions": "Rare colic",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "sulpiride",
    "name": "Sulpiride",
    "brandName": "",
    categories: ["Reproductive"],
    "doseMin": 0.5,
    "doseMax": 1.0,
    "doseDefault": 0.5,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IM"
    ],
    "frequency": "q12h",
    "indications": [
      "Agalactia"
    ],
    "cautions": "Sedation",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "dexamethasone",
    "name": "Dexamethasone",
    "brandName": "Azium",
    categories: ["Reproductive"],
    "doseMin": 100.0,
    "doseMax": 100.0,
    "doseDefault": 100.0,
    "doseUnit": "mg (total)",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IM"
    ],
    "frequency": "q24h",
    "indications": [
      "Induce parturition"
    ],
    "cautions": "Retained placenta",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "caslick's_ointment",
    "name": "Caslick's ointment",
    "brandName": "",
    categories: ["Reproductive"],
    "doseMin": 0,
    "doseMax": 0,
    "doseDefault": 0,
    "doseUnit": "-",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "Topical"
    ],
    "frequency": "PRN",
    "indications": [
      "Vulvar conformation"
    ],
    "cautions": "-",
    "notes": "",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "activated_charcoal",
    "name": "Activated charcoal",
    "brandName": "Toxiban",
    categories: ["Toxicology Antidotes"],
    "doseMin": 1.0,
    "doseMax": 3.0,
    "doseDefault": 1.0,
    "doseUnit": "g/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "PRN",
    "indications": [
      "General toxin ingestion"
    ],
    "cautions": "Aspiration, impaction",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "atropine",
    "name": "Atropine",
    "brandName": "",
    categories: ["Toxicology Antidotes"],
    "doseMin": 0.1,
    "doseMax": 0.2,
    "doseDefault": 0.1,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV (1",
      "4) SC"
    ],
    "frequency": "PRN",
    "indications": [
      "Organophosphate toxicity"
    ],
    "cautions": "Ileus",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "pralidoxime_2-pam",
    "name": "Pralidoxime (2-PAM)",
    "brandName": "Protopam",
    categories: ["Toxicology Antidotes"],
    "doseMin": 20.0,
    "doseMax": 20.0,
    "doseDefault": 20.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "q8h",
    "indications": [
      "Organophosphate toxicity"
    ],
    "cautions": "Neuromuscular blockade",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "dimercaprol_bal",
    "name": "Dimercaprol (BAL)",
    "brandName": "",
    categories: ["Toxicology Antidotes"],
    "doseMin": 3.0,
    "doseMax": 3.0,
    "doseDefault": 3.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IM"
    ],
    "frequency": "q4h",
    "indications": [
      "Arsenic, lead, mercury"
    ],
    "cautions": "Nephrotoxicity",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "calcium_edta",
    "name": "Calcium EDTA",
    "brandName": "",
    categories: ["Toxicology Antidotes"],
    "doseMin": 75.0,
    "doseMax": 75.0,
    "doseDefault": 75.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "q24h",
    "indications": [
      "Lead toxicity"
    ],
    "cautions": "Nephrotoxicity",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "methylene_blue",
    "name": "Methylene blue",
    "brandName": "",
    categories: ["Toxicology Antidotes"],
    "doseMin": 8.8,
    "doseMax": 8.8,
    "doseDefault": 8.8,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "ONCE",
    "indications": [
      "Nitrate toxicity (methemoglobinemia)"
    ],
    "cautions": "Tissue necrosis",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "n-acetylcysteine",
    "name": "N-acetylcysteine",
    "brandName": "Mucomyst",
    categories: ["Toxicology Antidotes"],
    "doseMin": 140.0,
    "doseMax": 140.0,
    "doseDefault": 140.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO",
      "IV"
    ],
    "frequency": "q6h",
    "indications": [
      "Acetaminophen toxicity"
    ],
    "cautions": "Anaphylactoid reaction",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "ascorbic_acid",
    "name": "Ascorbic acid",
    "brandName": "Vitamin C",
    categories: ["Toxicology Antidotes"],
    "doseMin": 20.0,
    "doseMax": 40.0,
    "doseDefault": 20.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "Red maple toxicity"
    ],
    "cautions": "Exacerbate tissue damage",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "ethanol_20%",
    "name": "Ethanol (20%)",
    "brandName": "",
    categories: ["Toxicology Antidotes"],
    "doseMin": 5.0,
    "doseMax": 5.0,
    "doseDefault": 5.0,
    "doseUnit": "mL/kg",
    "concentration": 20.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "q12h",
    "indications": [
      "Ethylene glycol toxicity"
    ],
    "cautions": "CNS depression",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "fomepizole_4-mp",
    "name": "Fomepizole (4-MP)",
    "brandName": "Antizol",
    categories: ["Toxicology Antidotes"],
    "doseMin": 20.0,
    "doseMax": 20.0,
    "doseDefault": 20.0,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "q12h",
    "indications": [
      "Ethylene glycol toxicity"
    ],
    "cautions": "Very expensive",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "yohimbine",
    "name": "Yohimbine",
    "brandName": "Yobine",
    categories: ["Sedation Reversal / Emergency"],
    "doseMin": 0.075,
    "doseMax": 0.12,
    "doseDefault": 0.075,
    "doseUnit": "mg/kg",
    "concentration": 2.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "Xylazine reversal"
    ],
    "cautions": "Excitement, tachycardia",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "tolazoline",
    "name": "Tolazoline",
    "brandName": "Tolazine",
    categories: ["Sedation Reversal / Emergency"],
    "doseMin": 4.0,
    "doseMax": 4.0,
    "doseDefault": 4.0,
    "doseUnit": "mg/kg",
    "concentration": 100.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "Alpha-2 reversal"
    ],
    "cautions": "GI hypermotility, fatal in alpacas",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "atipamezole",
    "name": "Atipamezole",
    "brandName": "Antisedan",
    categories: ["Sedation Reversal / Emergency"],
    "doseMin": 0.05,
    "doseMax": 0.1,
    "doseDefault": 0.05,
    "doseUnit": "mg/kg",
    "concentration": 5.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV",
      "IM"
    ],
    "frequency": "PRN",
    "indications": [
      "Detomidine/Dexmedetomidine reversal"
    ],
    "cautions": "Rapid arousal",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "naloxone",
    "name": "Naloxone",
    "brandName": "Narcan",
    categories: ["Sedation Reversal / Emergency"],
    "doseMin": 0.01,
    "doseMax": 0.02,
    "doseDefault": 0.01,
    "doseUnit": "mg/kg",
    "concentration": 0.4,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "Opioid reversal"
    ],
    "cautions": "Short half-life",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "flumazenil",
    "name": "Flumazenil",
    "brandName": "Romazicon",
    categories: ["Sedation Reversal / Emergency"],
    "doseMin": 0.01,
    "doseMax": 0.02,
    "doseDefault": 0.01,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "Benzodiazepine reversal"
    ],
    "cautions": "Seizures",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "doxapram",
    "name": "Doxapram",
    "brandName": "Dopram",
    categories: ["Sedation Reversal / Emergency"],
    "doseMin": 0.5,
    "doseMax": 1.0,
    "doseDefault": 0.5,
    "doseUnit": "mg/kg",
    "concentration": 20.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "Respiratory stimulation"
    ],
    "cautions": "Seizures",
    "notes": "",
    "isCRI": false,
    "patientType": "FOAL"
  },
  {
    "id": "epinephrine",
    "name": "Epinephrine",
    "brandName": "Adrenalin",
    categories: ["Sedation Reversal / Emergency"],
    "doseMin": 0.01,
    "doseMax": 0.02,
    "doseDefault": 0.01,
    "doseUnit": "mg/kg",
    "concentration": 1.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "Cardiac arrest"
    ],
    "cautions": "Arrhythmias",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "vasopressin",
    "name": "Vasopressin",
    "brandName": "Pitressin",
    categories: ["Sedation Reversal / Emergency"],
    "doseMin": 0.5,
    "doseMax": 1.0,
    "doseDefault": 0.5,
    "doseUnit": "mU/kg/min",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "CRI",
    "indications": [
      "CPR, severe shock"
    ],
    "cautions": "Splanchnic ischemia",
    "notes": "",
    "isCRI": true,
    "patientType": "BOTH"
  },
  {
    "id": "lidocaine",
    "name": "Lidocaine",
    "brandName": "Xylocaine",
    categories: ["Sedation Reversal / Emergency"],
    "doseMin": 1.0,
    "doseMax": 2.0,
    "doseDefault": 1.0,
    "doseUnit": "mg/kg",
    "concentration": 2.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "Ventricular tachycardia"
    ],
    "cautions": "Seizures",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },
  {
    "id": "atropine",
    "name": "Atropine",
    "brandName": "",
    categories: ["Sedation Reversal / Emergency"],
    "doseMin": 0.01,
    "doseMax": 0.02,
    "doseDefault": 0.01,
    "doseUnit": "mg/kg",
    "concentration": 15.0,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "Vagal arrest, bradycardia"
    ],
    "cautions": "Ileus",
    "notes": "",
    "isCRI": false,
    "patientType": "BOTH"
  },

  // ---------------------------------------------------------------------------
  // Adult colic / ICU formulary, ported verbatim from colic-flowsheet-app's
  // INITIAL_FORMULARY. Dose values, concentrations, cautions and source notes
  // are unchanged; only the record shape was mapped to DrugFormularyItem.
  // ---------------------------------------------------------------------------
  {
    "id": "flunixin_meglumine_0",
    "name": "Flunixin meglumine (colic / musculoskeletal pain (label))",
    "brandName": "Banamine",
    "categories": [
      "NSAIDs / analgesics"
    ],
    "doseMin": 1.1,
    "doseMax": 1.1,
    "doseDefault": 1.1,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV",
      "IM",
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "visceral/colic pain",
      "anti-endotoxic (low dose)",
      "musculoskeletal pain",
      "fever"
    ],
    "cautions": "GI ulceration, right dorsal colitis, nephrotoxicity with dehydration; can mask surgical colic signs at full analgesic dose",
    "notes": "IV preferred for colic; IM injection carries risk of clostridial myositis — source: verified_today",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "flunixin_meglumine_1",
    "name": "Flunixin meglumine (anti-endotoxic (low-dose, extra-label))",
    "brandName": "Banamine",
    "categories": [
      "NSAIDs / analgesics"
    ],
    "doseMin": 0.25,
    "doseMax": 0.25,
    "doseDefault": 0.25,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "q8h",
    "indications": [
      "visceral/colic pain",
      "anti-endotoxic (low dose)",
      "musculoskeletal pain",
      "fever"
    ],
    "cautions": "GI ulceration, right dorsal colitis, nephrotoxicity with dehydration; can mask surgical colic signs at full analgesic dose",
    "notes": "Suppresses eicosanoid production without full analgesic masking of pain; per Blikslager Ch.2 — source: verified_today",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "flunixin_meglumine_2",
    "name": "Flunixin meglumine (laminitis (extra-label))",
    "brandName": "Banamine",
    "categories": [
      "NSAIDs / analgesics"
    ],
    "doseMin": 0.5,
    "doseMax": 1.1,
    "doseDefault": 0.5,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV",
      "PO"
    ],
    "frequency": "q8h",
    "indications": [
      "visceral/colic pain",
      "anti-endotoxic (low dose)",
      "musculoskeletal pain",
      "fever"
    ],
    "cautions": "GI ulceration, right dorsal colitis, nephrotoxicity with dehydration; can mask surgical colic signs at full analgesic dose",
    "notes": "source: verified_today",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "phenylbutazone",
    "name": "Phenylbutazone",
    "brandName": "Bute",
    "categories": [
      "NSAIDs / analgesics"
    ],
    "doseMin": 2.2,
    "doseMax": 4.4,
    "doseDefault": 2.2,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV",
      "PO"
    ],
    "frequency": "q12h",
    "indications": [
      "musculoskeletal pain",
      "fever"
    ],
    "cautions": "Higher ulcerogenic/nephrotoxic potential than flunixin; avoid in dehydrated/hypovolemic colic patients",
    "notes": "IV only if perivascular leakage avoidable — severe tissue slough if perivascular — source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "firocoxib",
    "name": "Firocoxib",
    "brandName": "Equioxx",
    "categories": [
      "NSAIDs / analgesics"
    ],
    "doseMin": 0.1,
    "doseMax": 0.1,
    "doseDefault": 0.1,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "PO",
      "IV"
    ],
    "frequency": "q24h",
    "indications": [
      "musculoskeletal pain, COX-2 selective"
    ],
    "cautions": "Not first-line for acute visceral/colic pain; slower onset",
    "notes": "source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "ketoprofen",
    "name": "Ketoprofen",
    "categories": [
      "NSAIDs / analgesics"
    ],
    "doseMin": 2.2,
    "doseMax": 2.2,
    "doseDefault": 2.2,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "q24h",
    "indications": [
      "musculoskeletal and visceral pain"
    ],
    "cautions": "",
    "notes": "source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "meloxicam",
    "name": "Meloxicam",
    "categories": [
      "NSAIDs / analgesics"
    ],
    "doseMin": 0.6,
    "doseMax": 0.6,
    "doseDefault": 0.6,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV",
      "PO"
    ],
    "frequency": "q24h",
    "indications": [
      "musculoskeletal pain, foal-friendly NSAID"
    ],
    "cautions": "",
    "notes": "source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "butorphanol_0",
    "name": "Butorphanol (analgesia/sedation adjunct)",
    "categories": [
      "Opioids"
    ],
    "doseMin": 0.01,
    "doseMax": 0.02,
    "doseDefault": 0.01,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "visceral pain adjunct to alpha-2 agonist",
      "sedation adjunct"
    ],
    "cautions": "Can decrease GI motility and cause excitement/ataxia if given alone without alpha-2 agonist at higher doses",
    "notes": "low end for sedation top-up — source: verified_today",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "butorphanol_1",
    "name": "Butorphanol (full analgesic dose)",
    "categories": [
      "Opioids"
    ],
    "doseMin": 0.1,
    "doseMax": 0.2,
    "doseDefault": 0.1,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV",
      "IM"
    ],
    "frequency": "q4h",
    "indications": [
      "visceral pain adjunct to alpha-2 agonist",
      "sedation adjunct"
    ],
    "cautions": "Can decrease GI motility and cause excitement/ataxia if given alone without alpha-2 agonist at higher doses",
    "notes": "confirmed against 2026 literature (0.1–0.2 mg/kg IV/IM) — source: verified_today",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "morphine_0",
    "name": "Morphine (systemic (extra-label))",
    "categories": [
      "Opioids"
    ],
    "doseMin": 0.1,
    "doseMax": 0.2,
    "doseDefault": 0.1,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV slow",
      "IM"
    ],
    "frequency": "q4h",
    "indications": [
      "severe refractory pain, epidural analgesia"
    ],
    "cautions": "Can cause CNS excitement / ileus if given IV rapidly or without sedative co-administration",
    "notes": "Slow IV to reduce excitement; may combine with detomidine — source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "morphine_1",
    "name": "Morphine (epidural)",
    "categories": [
      "Opioids"
    ],
    "doseMin": 0.1,
    "doseMax": 0.2,
    "doseDefault": 0.1,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "epidural"
    ],
    "frequency": "PRN",
    "indications": [
      "severe refractory pain, epidural analgesia"
    ],
    "cautions": "Can cause CNS excitement / ileus if given IV rapidly or without sedative co-administration",
    "notes": "diluted in saline, preservative-free — source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "xylazine_0",
    "name": "Xylazine (colic exam / standing sedation)",
    "brandName": "Rompun",
    "categories": [
      "Alpha-2 agonists (sedation / visceral analgesia)"
    ],
    "doseMin": 0.2,
    "doseMax": 1.1,
    "doseDefault": 0.2,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "sedation",
      "visceral analgesia for colic exam"
    ],
    "cautions": "Ecbolic in pregnant mares (relatively contraindicated in late gestation vs romifidine/detomidine); bradycardia, transient hyperglycemia, decreases GI motility",
    "notes": "0.2–0.3 mg/kg = light/short sedation; 0.5–1.1 mg/kg = deeper. Confirmed range today. — source: verified_today",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "xylazine_1",
    "name": "Xylazine (IM)",
    "brandName": "Rompun",
    "categories": [
      "Alpha-2 agonists (sedation / visceral analgesia)"
    ],
    "doseMin": 1.1,
    "doseMax": 2.2,
    "doseDefault": 1.1,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IM"
    ],
    "frequency": "PRN",
    "indications": [
      "sedation",
      "visceral analgesia for colic exam"
    ],
    "cautions": "Ecbolic in pregnant mares (relatively contraindicated in late gestation vs romifidine/detomidine); bradycardia, transient hyperglycemia, decreases GI motility",
    "notes": "source: verified_today",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "detomidine_0",
    "name": "Detomidine (low-dose colic exam (preferred before dx is settled, to avoid masking surgical signs))",
    "brandName": "Dormosedan",
    "categories": [
      "Alpha-2 agonists (sedation / visceral analgesia)"
    ],
    "doseMin": 0.005,
    "doseMax": 0.015,
    "doseDefault": 0.005,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "sedation",
      "visceral analgesia for colic exam"
    ],
    "cautions": "Longer, deeper sedation than xylazine; higher doses can mask surgical-colic pain signs",
    "notes": "= 5–15 mcg/kg IV — source: verified_today",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "detomidine_1",
    "name": "Detomidine (standard sedation)",
    "brandName": "Dormosedan",
    "categories": [
      "Alpha-2 agonists (sedation / visceral analgesia)"
    ],
    "doseMin": 0.01,
    "doseMax": 0.04,
    "doseDefault": 0.01,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV",
      "IM"
    ],
    "frequency": "PRN",
    "indications": [
      "sedation",
      "visceral analgesia for colic exam"
    ],
    "cautions": "Longer, deeper sedation than xylazine; higher doses can mask surgical-colic pain signs",
    "notes": "= 10–40 mcg/kg; confirmed range today — source: verified_today",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "romifidine",
    "name": "Romifidine",
    "brandName": "Sedivet",
    "categories": [
      "Alpha-2 agonists (sedation / visceral analgesia)"
    ],
    "doseMin": 0.04,
    "doseMax": 0.12,
    "doseDefault": 0.04,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "sedation",
      "visceral analgesia"
    ],
    "cautions": "Less ataxia than detomidine/xylazine at equivalent sedation; preferred choice in pregnant mares by some clinicians",
    "notes": "source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "n_butylscopolammonium_bromide",
    "name": "N-butylscopolammonium bromide",
    "brandName": "Buscopan",
    "categories": [
      "Antispasmodics"
    ],
    "doseMin": 0.3,
    "doseMax": 0.3,
    "doseDefault": 0.3,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "spasmolytic for rectal exam",
      "impaction colic adjunct"
    ],
    "cautions": "",
    "notes": "transient tachycardia (anticholinergic) for ~30 min; single dose typically — source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "lidocaine_cri_0",
    "name": "Lidocaine (CRI) (loading dose)",
    "categories": [
      "Prokinetics"
    ],
    "doseMin": 1.3,
    "doseMax": 1.3,
    "doseDefault": 1.3,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV bolus over 10-15min"
    ],
    "frequency": "PRN",
    "indications": [
      "postoperative ileus",
      "systemic analgesia/anti-inflammatory adjunct"
    ],
    "cautions": "Toxic signs (twitching, ataxia, seizure) — stop CRI if seen; avoid in patients with pre-existing arrhythmia at high doses",
    "notes": "source: memory_standard_reference_matches_skill",
    "isCRI": true,
    "patientType": "ADULT"
  },
  {
    "id": "lidocaine_cri_1",
    "name": "Lidocaine (CRI) (CRI maintenance)",
    "categories": [
      "Prokinetics"
    ],
    "doseMin": 3,
    "doseMax": 3,
    "doseDefault": 3,
    "doseUnit": "mg/kg/h",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV CRI"
    ],
    "frequency": "PRN",
    "indications": [
      "postoperative ileus",
      "systemic analgesia/anti-inflammatory adjunct"
    ],
    "cautions": "Toxic signs (twitching, ataxia, seizure) — stop CRI if seen; avoid in patients with pre-existing arrhythmia at high doses",
    "notes": "= 0.05 mg/kg/min; per colic skill Ch.20/Ch.7. Do not exceed — toxicity: muscle fasciculations, seizures — source: memory_standard_reference_matches_skill",
    "isCRI": true,
    "patientType": "ADULT"
  },
  {
    "id": "metoclopramide",
    "name": "Metoclopramide",
    "categories": [
      "Prokinetics"
    ],
    "doseMin": 0.04,
    "doseMax": 0.04,
    "doseDefault": 0.04,
    "doseUnit": "mg/kg/h",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV CRI"
    ],
    "frequency": "PRN",
    "indications": [
      "prokinetic, mainly upper GI/gastric"
    ],
    "cautions": "Extrapyramidal/behavioral side effects (excitement, colic-like signs) in horses; used less commonly than lidocaine now",
    "notes": "source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "erythromycin_prokinetic_low_dose",
    "name": "Erythromycin (prokinetic, low dose)",
    "categories": [
      "Prokinetics"
    ],
    "doseMin": 0.5,
    "doseMax": 1,
    "doseDefault": 0.5,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV slow infusion"
    ],
    "frequency": "q6h",
    "indications": [
      "ileus, motilin-receptor agonist effect"
    ],
    "cautions": "Risk of antimicrobial-associated colitis, especially if used at antimicrobial doses; hyperthermia in foals",
    "notes": "source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "bethanechol_colic",
    "name": "Bethanechol",
    "categories": [
      "Prokinetics"
    ],
    "doseMin": 0.025,
    "doseMax": 0.03,
    "doseDefault": 0.025,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "SC"
    ],
    "frequency": "q3h",
    "indications": [
      "prokinetic, cecal/colonic"
    ],
    "cautions": "",
    "notes": "source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "neostigmine",
    "name": "Neostigmine",
    "categories": [
      "Prokinetics"
    ],
    "doseMin": 0.0022,
    "doseMax": 0.0044,
    "doseDefault": 0.0022,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "SC",
      "IV slow"
    ],
    "frequency": "PRN",
    "indications": [
      "prokinetic — use cautiously, mainly large-colon stimulation"
    ],
    "cautions": "Can worsen pain/spasm if obstruction not ruled out; controversial post-op use",
    "notes": "source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "polymyxin_b",
    "name": "Polymyxin B",
    "categories": [
      "Anti-endotoxic / adjunctive"
    ],
    "doseMin": 1000,
    "doseMax": 6000,
    "doseDefault": 1000,
    "doseUnit": "IU/kg",
    "concentration": 300000,
    "concentrationUnit": "IU/mL",
    "route": [
      "IV",
      "diluted in fluids"
    ],
    "frequency": "q8h",
    "indications": [
      "LPS binding, anti-endotoxic"
    ],
    "cautions": "Nephrotoxic; do not use in significant renal compromise or dehydration without correction first",
    "notes": "commonly cited as ~1000–6000 IU/kg q8-12h; nephrotoxic — avoid/adjust in azotemic patients — source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "pentoxifylline",
    "name": "Pentoxifylline",
    "categories": [
      "Anti-endotoxic / adjunctive"
    ],
    "doseMin": 8,
    "doseMax": 10,
    "doseDefault": 8,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "PO",
      "IV slow"
    ],
    "frequency": "q12h",
    "indications": [
      "rheologic/anti-inflammatory adjunct in endotoxemia, laminitis prophylaxis"
    ],
    "cautions": "",
    "notes": "source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "hypertonic_saline_7_2",
    "name": "Hypertonic saline 7.2%",
    "categories": [
      "Anti-endotoxic / adjunctive"
    ],
    "doseMin": 4,
    "doseMax": 4,
    "doseDefault": 4,
    "doseUnit": "mL/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [
      "fast-window shock resuscitation"
    ],
    "cautions": "",
    "notes": "must be followed by ≥5x volume of isotonic crystalloids within ~1h; effect otherwise transient. Matches colic skill Ch.6. — source: memory_standard_reference_matches_skill",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "penicillin_g_potassium_sodium",
    "name": "Penicillin G (potassium/sodium)",
    "categories": [
      "Antimicrobials"
    ],
    "doseMin": 22000,
    "doseMax": 44000,
    "doseDefault": 22000,
    "doseUnit": "IU/kg",
    "concentration": 300000,
    "concentrationUnit": "IU/mL",
    "route": [
      "IV"
    ],
    "frequency": "q6h",
    "indications": [],
    "cautions": "",
    "notes": "source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "procaine_penicillin_g",
    "name": "Procaine penicillin G",
    "categories": [
      "Antimicrobials"
    ],
    "doseMin": 22000,
    "doseMax": 22000,
    "doseDefault": 22000,
    "doseUnit": "IU/kg",
    "concentration": 300000,
    "concentrationUnit": "IU/mL",
    "route": [
      "IM"
    ],
    "frequency": "q12h",
    "indications": [],
    "cautions": "",
    "notes": "source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "gentamicin",
    "name": "Gentamicin",
    "categories": [
      "Antimicrobials"
    ],
    "doseMin": 6.6,
    "doseMax": 8,
    "doseDefault": 6.6,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "q24h",
    "indications": [],
    "cautions": "Nephrotoxic, ototoxic; contraindicated/adjust in hypovolemic or azotemic patients",
    "notes": "requires adequate hydration; nephrotoxic — check renal values / trough if prolonged use — source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "ceftiofur_sodium",
    "name": "Ceftiofur sodium",
    "categories": [
      "Antimicrobials"
    ],
    "doseMin": 2.2,
    "doseMax": 4.4,
    "doseDefault": 2.2,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV",
      "IM"
    ],
    "frequency": "q12h",
    "indications": [],
    "cautions": "",
    "notes": "source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "metronidazole",
    "name": "Metronidazole",
    "categories": [
      "Antimicrobials"
    ],
    "doseMin": 15,
    "doseMax": 25,
    "doseDefault": 15,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "PO",
      "IV slow"
    ],
    "frequency": "q8h",
    "indications": [
      "anaerobic coverage, colitis/peritonitis"
    ],
    "cautions": "",
    "notes": "source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "trimethoprim_sulfamethoxazole",
    "name": "Trimethoprim-sulfamethoxazole",
    "categories": [
      "Antimicrobials"
    ],
    "doseMin": 20,
    "doseMax": 30,
    "doseDefault": 20,
    "doseUnit": "mg/kg (combined)",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "PO"
    ],
    "frequency": "q12h",
    "indications": [],
    "cautions": "",
    "notes": "source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "isotonic_crystalloid_lrs_plasma_lyte_shock_dose",
    "name": "Isotonic crystalloid (LRS/Plasma-Lyte)  shock dose",
    "categories": [
      "Fluids / electrolytes"
    ],
    "doseMin": 60,
    "doseMax": 90,
    "doseDefault": 60,
    "doseUnit": "mL/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV"
    ],
    "frequency": "PRN",
    "indications": [],
    "cautions": "",
    "notes": "as an initial bolus/first-hour ceiling, titrated to perfusion parameters, not a fixed single push. Matches colic skill Ch.6. — source: memory_standard_reference_matches_skill",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "calcium_borogluconate_23",
    "name": "Calcium borogluconate 23%",
    "categories": [
      "Fluids / electrolytes"
    ],
    "doseMin": 0.2,
    "doseMax": 0.4,
    "doseDefault": 0.2,
    "doseUnit": "mg/kg elemental Ca (or ~0.2-0.4 mL/kg of 23% solution)",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV slow",
      "diluted"
    ],
    "frequency": "PRN",
    "indications": [],
    "cautions": "",
    "notes": "monitor heart rate/rhythm during administration — source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "magnesium_sulfate_iv_for_hypomagnesemia",
    "name": "Magnesium sulfate (IV, for hypomagnesemia)",
    "categories": [
      "Fluids / electrolytes"
    ],
    "doseMin": 25,
    "doseMax": 50,
    "doseDefault": 25,
    "doseUnit": "mg/kg (as MgSO4)",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "IV CRI",
      "diluted"
    ],
    "frequency": "PRN",
    "indications": [],
    "cautions": "",
    "notes": "given as slow CRI over hours, not bolus — source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "mineral_oil",
    "name": "Mineral oil",
    "categories": [
      "Laxatives / GI adjuncts"
    ],
    "doseMin": 2,
    "doseMax": 4,
    "doseDefault": 2,
    "doseUnit": "L total (not weight-based; ~4-8 mL/kg)",
    "concentration": 100,
    "concentrationUnit": "%",
    "route": [
      "nasogastric"
    ],
    "frequency": "q24h",
    "indications": [
      "impaction colic, lubricant laxative"
    ],
    "cautions": "Never give if aspiration risk / no swallow reflex confirmed; risk of lipoid pneumonia if aspirated",
    "notes": "app should allow either fixed-liter or mL/kg entry — source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "magnesium_sulfate_oral_epsom_salt_cathartic",
    "name": "Magnesium sulfate (oral, Epsom salt)  cathartic",
    "categories": [
      "Laxatives / GI adjuncts"
    ],
    "doseMin": 0.5,
    "doseMax": 1,
    "doseDefault": 0.5,
    "doseUnit": "g/kg",
    "concentration": 100,
    "concentrationUnit": "%",
    "route": [
      "nasogastric",
      "in water"
    ],
    "frequency": "PRN",
    "indications": [],
    "cautions": "",
    "notes": "risk of hypermagnesemia/dehydration with repeated dosing — source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "psyllium",
    "name": "Psyllium",
    "categories": [
      "Laxatives / GI adjuncts"
    ],
    "doseMin": 0.5,
    "doseMax": 1,
    "doseDefault": 0.5,
    "doseUnit": "g/kg",
    "concentration": 100,
    "concentrationUnit": "%",
    "route": [
      "PO/nasogastric"
    ],
    "frequency": "q24h",
    "indications": [],
    "cautions": "",
    "notes": "source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },
  {
    "id": "docusate_sodium_dss",
    "name": "Docusate sodium (DSS)",
    "categories": [
      "Laxatives / GI adjuncts"
    ],
    "doseMin": 10,
    "doseMax": 20,
    "doseDefault": 10,
    "doseUnit": "mg/kg",
    "concentration": 100,
    "concentrationUnit": "mg/mL",
    "route": [
      "nasogastric"
    ],
    "frequency": "PRN",
    "indications": [],
    "cautions": "",
    "notes": "do NOT combine with mineral oil (surfactant increases mucosal absorption of oil); allow washout between agents — source: memory_standard_reference",
    "isCRI": false,
    "patientType": "ADULT"
  },

  // ---------------------------------------------------------------------------
  // Foal antimicrobials from Equine Internal Medicine 4th ed. Table 20.14.
  // Doses, routes and frequencies verbatim. Concentration is left at 0 because
  // the table does not give product concentrations — the calculator asks for
  // the concentration on the bottle rather than assuming one.
  // ---------------------------------------------------------------------------
  {
    "id": "amoxicillin_trihydrate_foal",
    "name": "Amoxicillin trihydrate (foal)",
    "categories": [
      "Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"
    ],
    "doseMin": 10,
    "doseMax": 20,
    "doseDefault": 15,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IM"
    ],
    "frequency": "q8",
    "indications": [
      "Foal sepsis / infection"
    ],
    "cautions": "",
    "notes": "Oral dosing 20–30 mg/kg q6–8h also listed.",
    "isCRI": false,
    "patientType": "FOAL",
    "sourceNote": "Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed. Elsevier; 2018. Table 20.14 (Antimicrobial Dosages for Use in Foals)."
  },
  {
    "id": "cefazolin_foal",
    "name": "Cefazolin (foal)",
    "categories": [
      "Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"
    ],
    "doseMin": 25,
    "doseMax": 25,
    "doseDefault": 25,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IM"
    ],
    "frequency": "q6-8",
    "indications": [
      "Foal sepsis / infection"
    ],
    "cautions": "",
    "notes": "",
    "isCRI": false,
    "patientType": "FOAL",
    "sourceNote": "Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed. Elsevier; 2018. Table 20.14 (Antimicrobial Dosages for Use in Foals)."
  },
  {
    "id": "cefepime_foal",
    "name": "Cefepime (foal)",
    "categories": [
      "Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"
    ],
    "doseMin": 11,
    "doseMax": 11,
    "doseDefault": 11,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV",
      "IM"
    ],
    "frequency": "q8",
    "indications": [
      "Foal sepsis / infection"
    ],
    "cautions": "",
    "notes": "Fourth-generation cephalosporin; useful in multidrug-resistant infections.",
    "isCRI": false,
    "patientType": "FOAL",
    "sourceNote": "Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed. Elsevier; 2018. Table 20.14 (Antimicrobial Dosages for Use in Foals)."
  },
  {
    "id": "cefpodoxime_foal",
    "name": "Cefpodoxime proxetil (foal)",
    "categories": [
      "Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"
    ],
    "doseMin": 10,
    "doseMax": 10,
    "doseDefault": 10,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q6-12",
    "indications": [
      "Foal sepsis / infection"
    ],
    "cautions": "Cost often limits use.",
    "notes": "",
    "isCRI": false,
    "patientType": "FOAL",
    "sourceNote": "Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed. Elsevier; 2018. Table 20.14 (Antimicrobial Dosages for Use in Foals)."
  },
  {
    "id": "cephalexin_foal",
    "name": "Cephalexin (foal)",
    "categories": [
      "Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"
    ],
    "doseMin": 30,
    "doseMax": 30,
    "doseDefault": 30,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q8",
    "indications": [
      "Foal sepsis / infection"
    ],
    "cautions": "",
    "notes": "",
    "isCRI": false,
    "patientType": "FOAL",
    "sourceNote": "Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed. Elsevier; 2018. Table 20.14 (Antimicrobial Dosages for Use in Foals)."
  },
  {
    "id": "ceftriaxone_foal",
    "name": "Ceftriaxone (foal)",
    "categories": [
      "Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"
    ],
    "doseMin": 25,
    "doseMax": 25,
    "doseDefault": 25,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "q12",
    "indications": [
      "Foal sepsis / infection"
    ],
    "cautions": "",
    "notes": "",
    "isCRI": false,
    "patientType": "FOAL",
    "sourceNote": "Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed. Elsevier; 2018. Table 20.14 (Antimicrobial Dosages for Use in Foals)."
  },
  {
    "id": "chloramphenicol_foal",
    "name": "Chloramphenicol (foal)",
    "categories": [
      "Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"
    ],
    "doseMin": 50,
    "doseMax": 50,
    "doseDefault": 50,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q6",
    "indications": [
      "Foal sepsis / infection"
    ],
    "cautions": "Human aplastic anaemia risk on exposure; handle with gloves.",
    "notes": "",
    "isCRI": false,
    "patientType": "FOAL",
    "sourceNote": "Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed. Elsevier; 2018. Table 20.14 (Antimicrobial Dosages for Use in Foals)."
  },
  {
    "id": "clarithromycin_foal",
    "name": "Clarithromycin (foal)",
    "categories": [
      "Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"
    ],
    "doseMin": 7.5,
    "doseMax": 7.5,
    "doseDefault": 7.5,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12",
    "indications": [
      "Rhodococcus equi pneumonia"
    ],
    "cautions": "Hyperthermia in foals; combine with rifampin.",
    "notes": "",
    "isCRI": false,
    "patientType": "FOAL",
    "sourceNote": "Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed. Elsevier; 2018. Table 20.14 (Antimicrobial Dosages for Use in Foals)."
  },
  {
    "id": "imipenem_cilastatin_foal",
    "name": "Imipenem/cilastatin (foal)",
    "categories": [
      "Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"
    ],
    "doseMin": 10,
    "doseMax": 20,
    "doseDefault": 15,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "q6",
    "indications": [
      "Foal sepsis / infection"
    ],
    "cautions": "Reserve for multidrug-resistant infection.",
    "notes": "IM dosing 5–10 mg/kg q12h also listed.",
    "isCRI": false,
    "patientType": "FOAL",
    "sourceNote": "Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed. Elsevier; 2018. Table 20.14 (Antimicrobial Dosages for Use in Foals)."
  },
  {
    "id": "minocycline_foal",
    "name": "Minocycline (foal)",
    "categories": [
      "Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"
    ],
    "doseMin": 4,
    "doseMax": 4,
    "doseDefault": 4,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12",
    "indications": [
      "Foal sepsis / infection"
    ],
    "cautions": "",
    "notes": "",
    "isCRI": false,
    "patientType": "FOAL",
    "sourceNote": "Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed. Elsevier; 2018. Table 20.14 (Antimicrobial Dosages for Use in Foals)."
  },
  {
    "id": "valacyclovir_foal",
    "name": "Valacyclovir (foal)",
    "categories": [
      "Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"
    ],
    "doseMin": 18,
    "doseMax": 27,
    "doseDefault": 18,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12",
    "indications": [
      "Equine herpesvirus"
    ],
    "cautions": "",
    "notes": "Loading 27 mg/kg PO q8h, then maintenance 18 mg/kg PO q12h.",
    "isCRI": false,
    "patientType": "FOAL",
    "sourceNote": "Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed. Elsevier; 2018. Table 20.14 (Antimicrobial Dosages for Use in Foals)."
  },
  {
    "id": "ceftiofur_sodium_foal",
    "name": "Ceftiofur sodium (foal)",
    "categories": [
      "Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"
    ],
    "doseMin": 2.2,
    "doseMax": 5,
    "doseDefault": 5,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV"
    ],
    "frequency": "q12",
    "indications": [
      "Foal sepsis / infection"
    ],
    "cautions": "",
    "notes": "IM 2.2 mg/kg q12–24h; CRI 1.5 mg/kg/h; aerosol 2.2 mg/kg q24h.",
    "isCRI": false,
    "patientType": "FOAL",
    "sourceNote": "Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed. Elsevier; 2018. Table 20.14 (Antimicrobial Dosages for Use in Foals)."
  },
  {
    "id": "erythromycin_foal",
    "name": "Erythromycin (foal, antimicrobial)",
    "categories": [
      "Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"
    ],
    "doseMin": 25,
    "doseMax": 25,
    "doseDefault": 25,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q6-8",
    "indications": [
      "Rhodococcus equi pneumonia"
    ],
    "cautions": "Hyperthermia and diarrhoea in foals; colitis in the dam.",
    "notes": "",
    "isCRI": false,
    "patientType": "FOAL",
    "sourceNote": "Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed. Elsevier; 2018. Table 20.14 (Antimicrobial Dosages for Use in Foals)."
  },
  {
    "id": "penicillin_g_foal",
    "name": "Penicillin G (foal)",
    "categories": [
      "Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"
    ],
    "doseMin": 20000,
    "doseMax": 20000,
    "doseDefault": 20000,
    "doseUnit": "IU/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IM",
      "IV"
    ],
    "frequency": "q6-12",
    "indications": [
      "Foal sepsis / infection"
    ],
    "cautions": "",
    "notes": "Procaine penicillin IM q12h; potassium or sodium penicillin IV q6h.",
    "isCRI": false,
    "patientType": "FOAL",
    "sourceNote": "Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed. Elsevier; 2018. Table 20.14 (Antimicrobial Dosages for Use in Foals)."
  },
  {
    "id": "sulfadiazine_trimethoprim_foal",
    "name": "Sulfadiazine-trimethoprim (foal)",
    "categories": [
      "Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"
    ],
    "doseMin": 30,
    "doseMax": 30,
    "doseDefault": 30,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q12",
    "indications": [
      "Foal sepsis / infection"
    ],
    "cautions": "",
    "notes": "Combined dose.",
    "isCRI": false,
    "patientType": "FOAL",
    "sourceNote": "Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed. Elsevier; 2018. Table 20.14 (Antimicrobial Dosages for Use in Foals)."
  },
  {
    "id": "gentamicin_foal",
    "name": "Gentamicin (foal)",
    "categories": [
      "Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"
    ],
    "doseMin": 6.6,
    "doseMax": 13,
    "doseDefault": 12,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "IV",
      "IM"
    ],
    "frequency": "q24",
    "indications": [
      "Foal sepsis / infection"
    ],
    "cautions": "Nephrotoxic; therapeutic drug monitoring recommended in sick foals — aminoglycoside kinetics are unpredictable.",
    "notes": "Table 20.14 lists 11–13 mg/kg (neonates) and 6.6 mg/kg (weanlings) q24h. The chapter text cites a more recent pharmacokinetic study recommending 12 mg/kg IV q36h under 2 weeks and 6.6 mg/kg IV q24h at 2 weeks or older.",
    "isCRI": false,
    "patientType": "FOAL",
    "sourceNote": "Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed. Elsevier; 2018. Table 20.14 (Antimicrobial Dosages for Use in Foals).",
    "foalAgeBands": [
      {
        "label": "Neonate (< 2 weeks)",
        "dose": "11–13 mg/kg (text: 12 mg/kg)",
        "route": "IV, IM",
        "frequency": "q24h (text: q36h)"
      },
      {
        "label": "2 weeks and older",
        "dose": "6.6 mg/kg",
        "route": "IV",
        "frequency": "q24h"
      },
      {
        "label": "Weanling",
        "dose": "6.6 mg/kg",
        "route": "IV, IM",
        "frequency": "q24h"
      }
    ]
  },
  {
    "id": "metronidazole_foal",
    "name": "Metronidazole (foal)",
    "categories": [
      "Neonatal / Foal-Specific Drugs (Antimicrobials & Antifungals)"
    ],
    "doseMin": 10,
    "doseMax": 15,
    "doseDefault": 15,
    "doseUnit": "mg/kg",
    "concentration": 0,
    "concentrationUnit": "",
    "route": [
      "PO"
    ],
    "frequency": "q8-12",
    "indications": [
      "Anaerobic infection",
      "Clostridial enterocolitis"
    ],
    "cautions": "",
    "notes": "",
    "isCRI": false,
    "patientType": "FOAL",
    "sourceNote": "Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed. Elsevier; 2018. Table 20.14 (Antimicrobial Dosages for Use in Foals).",
    "foalAgeBands": [
      {
        "label": "Neonate",
        "dose": "10 mg/kg",
        "route": "PO",
        "frequency": "q12h"
      },
      {
        "label": "10–12 days old",
        "dose": "15 mg/kg",
        "route": "PO",
        "frequency": "q12h"
      },
      {
        "label": "Over 2 weeks",
        "dose": "15 mg/kg",
        "route": "PO",
        "frequency": "q8h"
      }
    ]
  }
];
