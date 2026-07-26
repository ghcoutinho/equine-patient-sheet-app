import re
import json

def parse_markdown_to_ts(md_path, ts_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    categories = re.split(r'## \d+\.\s+(.*?)\n', content)
    
    entries = []
    
    for i in range(1, len(categories), 2):
        category_name = categories[i].strip()
        table_text = categories[i+1]
        
        lines = table_text.strip().split('\n')
        if len(lines) < 3: continue
        
        for line in lines[2:]:
            if not line.strip().startswith('|'): continue
            cols = [c.strip() for c in line.split('|')[1:-1]]
            if len(cols) < 11: continue
            
            name = cols[0]
            brand = cols[1] if cols[1] != '-' else ''
            
            dose_range = cols[2]
            doseMin, doseMax, doseDefault = 0, 0, 0
            
            if '-' in dose_range:
                parts = dose_range.split('-')
                try:
                    doseMin = float(parts[0].strip().split()[0])
                    doseMax = float(parts[1].strip().split()[0])
                    doseDefault = doseMin
                except:
                    pass
            else:
                try:
                    doseMin = float(dose_range.split()[0])
                    doseMax = doseMin
                    doseDefault = doseMin
                except:
                    pass
            
            unit = cols[3]
            conc_str = cols[4]
            conc = 0
            if conc_str != '-':
                try:
                    conc = float(re.search(r'[\d\.]+', conc_str).group())
                except:
                    pass
                    
            route = [r.strip() for r in cols[5].split('/')]
            freq = cols[6]
            indications = [cols[7]]
            cautions = cols[8]
            patient_type = cols[9]
            is_cri = cols[10].lower() == 'yes'
            
            _id = name.lower().replace(' ', '_').replace('(', '').replace(')', '')
            
            entry = {
                "id": _id,
                "name": name,
                "brandName": brand,
                "category": category_name,
                "doseMin": doseMin,
                "doseMax": doseMax,
                "doseDefault": doseDefault,
                "doseUnit": unit,
                "concentration": conc,
                "concentrationUnit": "mg/mL" if conc else "",
                "route": route,
                "frequency": freq,
                "indications": indications,
                "cautions": cautions,
                "notes": "",
                "isCRI": is_cri,
                "patientType": patient_type
            }
            entries.append(entry)
            
    ts_content = "import { DrugFormularyItem } from '../types';\n\nexport const EXPANDED_FORMULARY: DrugFormularyItem[] = "
    ts_content += json.dumps(entries, indent=2)
    ts_content += ";\n"
    
    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)

parse_markdown_to_ts(r'C:\Users\ghcou\.gemini\antigravity\brain\9e518e37-7d2a-4151-a89a-675db73be149\scratch\expanded_formulary.md', r'C:\Users\ghcou\.gemini\antigravity\scratch\equine-patient-sheet-app\src\data\expandedFormulary.ts')
