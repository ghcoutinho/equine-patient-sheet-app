export interface AcademicReference {
  id: string;
  authors?: string;
  year?: number;
  title: string;
  journal?: string;
  volumeInfo?: string;
  doi?: string;
  pmid?: string;
  pmcid?: string;
  url?: string;
  tags?: string[];
}

export const ACADEMIC_REFERENCES: AcademicReference[] = [
  {
    id: 'biondi-2026',
    authors: 'Biondi V, Pugliese M, Gambadauro P, et al.',
    year: 2026,
    title: 'Evaluation of systemic inflammatory response syndrome criteria in horses with colic associated with acute gastrointestinal disease',
    journal: 'Front Vet Sci',
    doi: '10.3389/fvets.2026.1822426'
  },
  {
    id: 'bottegaro-2024',
    authors: 'Brkljača Bottegaro N, Magoga JA, Bojanić K, et al.',
    year: 2024,
    title: 'Prognostic factors assessed by blood analysis at the time of patient admission for horse colic',
    journal: 'Veterinarska stanica',
    volumeInfo: '56(5)',
    doi: '10.46419/vs.56.5.5'
  },
  {
    id: 'mcgovern-2025',
    authors: 'McGovern KF',
    year: 2025,
    title: 'Clinical insights: Advances in equine adult critical care',
    journal: 'Equine Vet J',
    doi: '10.1111/evj.14523'
  },
  {
    id: 'gao-2026',
    authors: 'Gao Y, Luo Z, Dong Z, Li S',
    year: 2026,
    title: 'The Role of Artificial Intelligence in Equine Colic: A Scoping Review of Diagnostic, Prognostic, and Decision-Support Applications',
    journal: 'The Veterinary Journal',
    doi: '10.1016/J.TVJL.2026.106781'
  },
  {
    id: 'brewer-1988',
    authors: 'Brewer BD, Koterba AM',
    year: 1988,
    title: 'Development of a scoring system for the early diagnosis of equine neonatal sepsis',
    journal: 'Equine Vet J',
    volumeInfo: '20(1):18-22'
  },
  {
    id: 'weber-2015',
    authors: 'Weber EJ, Sanchez LC',
    year: 2015,
    title: 'Evaluation of updated sepsis scoring systems and systemic inflammatory response syndrome criteria and their association with sepsis in equine neonates',
    journal: 'J Vet Intern Med',
    pmcid: 'PMC5980351'
  },
  {
    id: 'wong-2015',
    authors: 'Wong DM, Ruby RE, Ward JL, et al.',
    year: 2015,
    title: 'Evaluation of systemic inflammatory response syndrome (SIRS) criteria in 1068 neonatal foals',
    journal: 'J Vet Emerg Crit Care'
  },
  {
    id: 'farrell-2021',
    authors: 'Farrell A, Kersh K, Liepman R, Dembek KA',
    year: 2021,
    title: 'Development of a Colic Scoring System to Predict Outcome in Horses',
    journal: 'Front Vet Sci',
    pmcid: 'PMC8531487'
  },
  {
    id: 'nocera-2026',
    authors: 'Nocera I, Cingottini D, Franco CD, et al.',
    year: 2026,
    title: 'In-Depth Analysis of the Prognostic Factors Associated with Short-Term Outcome in Equine Colic Patients: Multicentric Retrospective Study',
    journal: 'Animals'
  },
  {
    id: 'reed-2018',
    authors: 'Reed SM, Bayly WM, Sellon DC',
    year: 2018,
    title: 'Equine Internal Medicine (4th Edition)',
    journal: 'Elsevier'
  },
  {
    id: 'hurcombe-2014',
    authors: 'Hurcombe SDA, et al.',
    year: 2014,
    title: 'Development of a Likelihood of Survival Scoring System for Hospitalized Equine Neonates Using Generalized Boosted Regression Modeling',
    journal: 'J Vet Intern Med',
    pmcid: 'PMC4189956'
  },
  {
    id: 'segelid-2019',
    authors: 'Segelid M, et al.',
    year: 2019,
    title: 'Evaluation of the foal survival score in a Danish-Swedish population',
    journal: 'Acta Vet Scand',
    pmcid: 'PMC6524090'
  },
  {
    id: 'nieto-2019',
    authors: 'Nieto JE, et al.',
    year: 2019,
    title: 'Comparative Review of Equine SIRS, Sepsis, and Neutrophils',
    journal: 'Front Vet Sci',
    doi: '10.3389/fvets.2019.00069'
  },
  {
    id: 'borchers-2023',
    authors: 'Borchers A, et al.',
    year: 2023,
    title: 'NGAL as marker of sepsis in neonatal foals',
    journal: 'PLoS One',
    pmcid: 'PMC10194986'
  },
  {
    id: 'dembek-2023',
    authors: 'Dembek KA, et al.',
    year: 2023,
    title: 'Red blood cell distribution width to platelet ratio in neonatal foals with sepsis',
    journal: 'J Vet Intern Med',
    volumeInfo: '37(4):1552'
  },
  {
    id: 'delacalle-2023',
    authors: 'De La Calle J, et al.',
    year: 2023,
    title: 'SIRS and Predictors of Infection/Mortality in 1068 Critically Ill Newborn Foals',
    journal: 'Front Vet Sci',
    pmcid: 'PMC11911538'
  },
  {
    id: 'schoster-2022',
    authors: 'Schoster A, et al.',
    year: 2022,
    title: 'Predictive Models for Equine Emergency Exploratory Laparotomy',
    journal: 'Animals'
  },
  {
    id: 'biondi-2022',
    authors: 'Biondi V, et al.',
    year: 2022,
    title: 'New Diagnostic Score for Sepsis in Adult Horses with Acute GI Disease',
    journal: 'Animals'
  },
  {
    id: 'net-craft-2026',
    title: 'Modern Healthcare App Development: Trends, Tools, and Strategy',
    journal: 'Net-Craft.com',
    url: 'https://www.net-craft.com/blog/2026/07/23/healthcare-app-development/'
  },
  {
    id: 'pmc-fhir-8367140',
    title: 'The Fast Health Interoperability Resources (FHIR) Standard: Systematic Literature Review of Implementations, Applications, Challenges and Opportunities',
    journal: 'PMC',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8367140/'
  },
  {
    id: 'firely-fhir',
    authors: 'Firely',
    title: 'Stand-alone FHIR consulting',
    journal: 'Firely',
    url: 'https://fire.ly/stand-alone-fhir-consulting/'
  },
  {
    id: 'taction-fhir',
    authors: 'Taction Software',
    title: 'SMART on FHIR App Development Tutorial | Guide',
    journal: 'Taction Software',
    url: 'https://www.tactionsoft.com/blog/smart-on-fhir-app-development-tutorial/'
  },
  {
    id: 'included-health-tech',
    authors: 'Included Health',
    title: 'Answering the Tech Stack Question',
    journal: 'Included Health',
    url: 'https://includedhealth.com/blog/tech/answering-the-tech-stack-question/'
  },
  {
    id: 'momentum-healthtech-2026',
    authors: 'Momentum',
    title: 'HealthTech Tech Stack 2026: Expert Recommendations',
    journal: 'Momentum',
    url: 'https://www.themomentum.ai/blog/choosing-the-right-tech-stack-for-your-healthtech-mvp'
  },
  {
    id: 'medium-healthcare-app',
    authors: 'Serena Gray',
    title: 'Application Development for Healthcare: Key Considerations',
    journal: 'Medium',
    url: 'https://serenagray2451.medium.com/application-development-for-healthcare-key-considerations-7aea2b26243e'
  },
  {
    id: 'anokwa-2010',
    authors: 'Yaw Anokwa',
    year: 2010,
    title: 'Open Data Kit: Tools to Build Information Services for Developing Regions',
    journal: 'Yaw Anokwa',
    url: 'https://www.anokwa.com/publications/2010_ICTD_OpenDataKit_Paper.pdf'
  },
  {
    id: 'odkx-2010',
    authors: 'ODK-X',
    year: 2010,
    title: 'Open Data Kit: Tools to Build Information Services for Developing Regions',
    journal: 'ODK-X',
    url: 'https://odk-x.org/assets/files/ODK-Paper-ICTD-2010.pdf'
  },
  {
    id: 'pmc-sirs-foals',
    title: 'The Systemic Inflammatory Response Syndrome and Predictors of Infection and Mortality in 1068 Critically Ill Newborn Foals',
    journal: 'PMC',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11911538/'
  },
  {
    id: 'bryeko-vet',
    authors: 'Brye Kobayashi',
    title: 'UX Case Study: Veterinary website',
    journal: 'UX Design',
    url: 'https://bryeko.com/vet-website'
  },
  {
    id: 'cabi-neonatal-septicemia',
    year: 2005,
    title: 'A Prospective Study of Neonatal Septicemia and Factors Influencing Survival',
    journal: 'CABI Digital Library',
    url: 'https://www.cabidigitallibrary.org/doi/pdf/10.5555/20053193855'
  },
  {
    id: 'researchgate-sirs-neonates',
    title: 'Defining the Systemic Inflammatory Response Syndrome in Equine Neonates',
    journal: 'ResearchGate',
    url: 'https://www.researchgate.net/publication/284562321_Defining_the_Systemic_Inflammatory_Response_Syndrome_in_Equine_Neonates'
  },
  {
    id: 'vettimes-neonatal-septicaemia',
    title: 'NEONATAL SEPTICAEMIA IN FOALS',
    journal: 'Vet Times',
    url: 'https://www.vettimes.co.uk/app/uploads/wp-post-to-pdf-enhanced-cache/1/neonatal-septicaemia-in-foals.pdf'
  },
  {
    id: 'vtechworks-equine-sepsis',
    title: 'Equine Neonatal Sepsis: The Pathophysiology of Severe Inflammation and Infection',
    journal: 'VTechWorks',
    url: 'https://vtechworks.lib.vt.edu/server/api/core/bitstreams/af4ed872-d6bf-4c05-80d8-39376817d8be/content'
  },
  {
    id: 'acvim-cwa',
    title: 'Clinical Writing Assessment 1 Complete Failure of Transfer of Passive Immunity, Sepsis, Omphalophlebitis, and Equine Neonatal M',
    journal: 'ACVIM',
    url: 'https://www.acvim.org/sites/default/files/2025-11/CWA-Example-2_for-web.pdf'
  },
  {
    id: 'vetmed-prematurity',
    year: 2012,
    title: 'Prematurity in foals: Predisposing factors and long-term outcomes',
    journal: 'Veterinary Extension',
    url: 'https://extension.vetmed.ufl.edu/files/2012/03/What-to-do-with-the-septic-foal.pdf'
  },
  {
    id: 'researchgate-equine-neonatal-sepsis',
    title: 'Equine Neonatal Sepsis',
    journal: 'ResearchGate',
    url: 'https://www.researchgate.net/publication/7694798_Equine_Neonatal_Sepsis'
  },
  {
    id: 'sava-foal-sepsis',
    year: 2015,
    title: 'Foal sepsis: A new take on an old killer',
    journal: 'SAVA',
    url: 'https://www.sava.co.za/vetnews/2015/September/VN%20CPD%20September%202015.pdf'
  },
  {
    id: 'hippiatrika-sepsis',
    year: 2001,
    title: 'Clinical symptoms and laboratory data in newborn foals with sepsis – a retrospective analysis',
    journal: 'Hippiatrika',
    url: 'https://www.hippiatrika.com/download.htm?id=20010628'
  },
  {
    id: 'cabi-infectious-disease',
    year: 2009,
    title: 'INFECTIOUS DISEASE IN THE NEONATAL FOAL',
    journal: 'CABI Digital Library',
    url: 'https://www.cabidigitallibrary.org/doi/pdf/10.5555/20093142546'
  },
  {
    id: 'dvm360-equine-neonatal-sepsis',
    title: 'Equine neonatal sepsis: causes, consequences, diagnosis (Proceedings)',
    journal: 'DVM360',
    url: 'https://www.dvm360.com/view/equine-neonatal-sepsis-causes-consequences-diagnosis-proceedings'
  },
  {
    id: 'pmc-sepsis-scoring',
    title: 'Evaluation of updated sepsis scoring systems and systemic inflammatory response syndrome criteria and their association with sepsis in equine neonates',
    journal: 'PMC',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5980351/'
  },
  {
    id: 'avma-molecular-markers',
    title: 'Expression of molecular markers in blood of neonatal foals with sepsis in',
    journal: 'AVMA Journals',
    url: 'https://avmajournals.avma.org/view/journals/ajvr/67/6/ajvr.67.6.1045.xml'
  },
  {
    id: 'avma-factors-survival',
    title: 'Factors associated with survival of neonatal foals with bacteremia and racing performance of surviving Thoroughbreds: 423 cases (1982–2007)',
    journal: 'AVMA Journals',
    url: 'https://avmajournals.avma.org/view/journals/javma/233/9/javma.233.9.1446.xml'
  },
  {
    id: 'plosone-ngal-1',
    title: 'Use of admission serum neutrophil gelatinase-associated lipocalin (NGAL) concentrations as a marker of sepsis and outcome in neonatal foals',
    journal: 'PLOS One',
    url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0285819'
  },
  {
    id: 'plosone-ngal-2',
    title: 'Use of admission serum neutrophil gelatinase-associated lipocalin (NGAL) concentrations as a marker of sepsis and outcome in neonatal foals',
    journal: 'PLOS',
    url: 'https://journals.plos.org/plosone/article/file?type=printable&id=10.1371/journal.pone.0285819'
  },
  {
    id: 'pmc-ngal',
    title: 'Use of admission serum neutrophil gelatinase-associated lipocalin (NGAL) concentrations as a marker of sepsis and outcome in neonatal foals',
    journal: 'PMC',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10194986/'
  },
  {
    id: 'madbarn-scoring-system',
    title: 'Development of a scoring system for the early diagnosis of equine neonatal sepsis.',
    journal: 'Mad Barn',
    url: 'https://madbarn.com/research/development-of-a-scoring-system-for-the-early-diagnosis-of-equine-neonatal-sepsis/'
  },
  {
    id: 'vetjournal-parenteral-nutrition',
    year: 2006,
    title: 'Parenteral nutrition in foals: a retrospective study of 45 cases (2000–2004)',
    journal: 'Vetjournal',
    url: 'https://vetjournal.it/archivio_pdf/2006/2262.pdf'
  },
  {
    id: 'avma-pharmacokinetics',
    year: 1992,
    title: 'Relation between pharmacokinetics of amikacin sulfate and sepsis score in clinically - normal and hospitalized neonatal foals',
    journal: 'AVMA Journals',
    url: 'https://avmajournals.avma.org/view/journals/javma/200/9/javma.1992.200.09.1339.pdf'
  },
  {
    id: 'pmc-foal-survival-score',
    title: 'Evaluation of the foal survival score in a Danish‐Swedish population of neonatal foals upon hospital admission',
    journal: 'PMC',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6524090/'
  },
  {
    id: 'pmc-disorders-foals',
    title: 'Disorders of Foals',
    journal: 'PMC',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7195946/'
  },
  {
    id: 'researchgate-predict-sepsis',
    title: 'Evaluation of a score designed to predict sepsis in foals',
    journal: 'ResearchGate',
    url: 'https://www.researchgate.net/publication/227814749_Evaluation_of_a_score_designed_to_predict_sepsis_in_foals'
  },
  {
    id: 'researchgate-updated-sepsis',
    title: 'Evaluation of updated sepsis scoring systems and systemic inflammatory response syndrome criteria and their association with sepsis in equine neonates',
    journal: 'ResearchGate',
    url: 'https://www.researchgate.net/publication/324033561_Evaluation_of_updated_sepsis_scoring_systems_and_systemic_inflammatory_response_syndrome_criteria_and_their_association_with_sepsis_in_equine_neonates'
  },
  {
    id: 'ovid-reevaluation',
    year: 2015,
    title: 'Re-evaluation of the sepsis score in equine neonates',
    journal: 'Ovid',
    url: 'https://www.ovid.com/01515464-201505000-00006'
  },
  {
    id: 'anzcvs-proceedings',
    year: 2018,
    title: 'ANZCVS EQUINE EQUINE CHAPTER PROCEEDINGS 2018',
    journal: 'Australian and New Zealand College of Veterinary Scientists',
    url: 'https://anzcvs.org.au/anzcvs-dev-media/11968/2018%20ANZCVS%20EQUINE%20CHAPTER%20PROCEEDINGS.pdf'
  },
  {
    id: 'frontiers-comparative-review',
    year: 2019,
    title: 'A Comparative Review of Equine SIRS, Sepsis, and Neutrophils',
    journal: 'Frontiers',
    url: 'https://www.frontiersin.org/journals/veterinary-science/articles/10.3389/fvets.2019.00069/full'
  },
  {
    id: 'avma-liver-enzyme-1',
    title: 'Clinical implications of high liver enzyme activities in hospitalized neonatal foals',
    journal: 'AVMA Journals',
    url: 'https://avmajournals.avma.org/view/journals/javma/239/5/javma.239.5.661.xml'
  },
  {
    id: 'avma-liver-enzyme-2',
    title: 'Clinical implications of high liver enzyme activities in hospitalized neonatal foals',
    journal: 'AVMA Journals',
    url: 'https://avmajournals.avma.org/view/journals/javma/239/5/javma.239.5.661.pdf'
  },
  {
    id: 'oxford-updated-sepsis',
    title: 'Evaluation of updated sepsis scoring systems and systemic inflammatory response syndrome criteria and their association with sepsis in equine neonates',
    journal: 'Journal of Veterinary Internal Medicine',
    url: 'https://academic.oup.com/jvim/article/32/3/1185/8449661'
  },
  {
    id: 'madbarn-updated-sepsis',
    title: 'Evaluation of updated sepsis scoring systems and systemic inflammatory response syndrome criteria and their association with sepsis in equine neonates.',
    journal: 'Mad Barn',
    url: 'https://madbarn.com/research/evaluation-of-updated-sepsis-scoring-systems-and-systemic-inflammatory-response-syndrome-criteria-and-their-association-with-sepsis-in-equine-neonates/'
  },
  {
    id: 'slu-serum-amyloid',
    title: 'Serum amyloid A as a marker to detect sepsis and predict outcome in hospitalized neonatal foals',
    journal: 'Administrative page for SLU library',
    url: 'https://pub.epsilon.slu.se/id/document/20411092'
  },
  {
    id: 'oxford-red-blood-cell',
    title: 'Red blood cell distribution width to platelet ratio in neonatal foals with sepsis',
    journal: 'Journal of Veterinary Internal Medicine',
    url: 'https://academic.oup.com/jvim/article/37/4/1552/8447955'
  },
  {
    id: 'orbi-foal-survival',
    year: 2019,
    title: 'Evaluation of the Foal Survival Score in a Danish-Swedish population of neonatal foals upon hospital admission',
    journal: 'ORBi',
    url: 'https://orbi.uliege.be/bitstream/2268/238001/1/Bohlin_et_al-2019-Journal_of_Veterinary_Internal_Medicine.pdf'
  },
  {
    id: 'pmc-likelihood-survival',
    year: 2014,
    title: 'Development of a Likelihood of Survival Scoring System for Hospitalized Equine Neonates Using Generalized Boosted Regression Modeling',
    journal: 'PMC',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4189956/'
  },
  {
    id: 'mdpi-indepth-analysis',
    title: 'In-Depth Analysis of the Prognostic Factors Associated with Short-Term Outcome in Equine Colic Patients: Multicentric Retrospective Study',
    journal: 'MDPI',
    url: 'https://www.mdpi.com/2076-2615/16/3/496'
  },
  {
    id: 'mdpi-predictive-models',
    title: 'Predictive Models for Equine Emergency Exploratory Laparotomy in Spain: Pre-, Intra-, and Post-Operative-Mortality-Associated Factors',
    journal: 'MDPI',
    url: 'https://www.mdpi.com/2076-2615/12/11/1375'
  },
  {
    id: 'pmc-colic-scoring',
    title: 'Development of a Colic Scoring System to Predict Outcome in Horses',
    journal: 'PMC',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8531487/'
  },
  {
    id: 'preprints-prognostic-significance',
    year: 2023,
    title: 'Prognostic Significance of Physiological and Biochemical Parameters in Colic-Afflicted Equine',
    journal: 'Preprints.org',
    url: 'https://www.preprints.org/manuscript/202311.0809'
  },
  {
    id: 'madbarn-prognosis-colic',
    title: 'Prognosis in equine colic patients using multivariable analysis.',
    journal: 'Mad Barn',
    url: 'https://madbarn.com/research/prognosis-in-equine-colic-patients-using-multivariable-analysis/'
  },
  {
    id: 'researchgate-prognostic-factors',
    title: 'Prognostic factors in equine colic',
    journal: 'ResearchGate',
    url: 'https://www.researchgate.net/publication/286757005_Prognostic_factors_in_equine_colic'
  },
  {
    id: 'mdpi-new-diagnostic',
    title: 'New Diagnostic Score for Sepsis in Adult Horses with Acute Gastrointestinal Disease',
    journal: 'MDPI',
    url: 'https://www.mdpi.com/2076-2615/16/6/962'
  },
  {
    id: 'madbarn-new-diagnostic',
    title: 'New Diagnostic Score for Sepsis in Adult Horses with Acute Gastrointestinal Disease.',
    journal: 'Mad Barn',
    url: 'https://madbarn.com/research/new-diagnostic-score-for-sepsis-in-adult-horses-with-acute-gastrointestinal-disease/'
  }
];

export function exportToRIS(): void {
  const risContent = ACADEMIC_REFERENCES.map(ref => {
    let entry = `TY  - JOUR\n`;
    entry += `TI  - ${ref.title}\n`;
    if (ref.authors) {
      const authorList = ref.authors.split(',').map(a => a.trim());
      authorList.forEach(a => {
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
