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
  }
];
