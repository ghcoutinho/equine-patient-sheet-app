import type { ViewTab } from '../types';

/**
 * The single source of truth for navigation.
 *
 * The three nav bars previously each hardcoded their own list, which drifted:
 * `dashboard` had three separate entries ("Dashboard", "Patient Ward",
 * "Archive Cases"), `intelligence` was called "Live Intel", "GI / Colic Intel"
 * and "Alerts" depending on where you looked, and "Support & Docs" opened the
 * suite overview. A tab now has exactly one label, one icon and one home.
 */

export type NavGroup = 'chart' | 'decision' | 'reference' | 'records';

export interface NavItem {
  id: ViewTab;
  /** Canonical name. Used verbatim in every nav surface. */
  label: string;
  /** Abbreviated form for the mobile bar, where ~10 characters fit. */
  shortLabel: string;
  icon: string;
  /** Material Symbols renders some glyphs better filled. */
  filled?: boolean;
  group: NavGroup;
  /** One line of "what is this for", shown as the title attribute. */
  hint: string;
  /** Promoted to the mobile bottom bar; the rest live behind "More". */
  mobilePrimary?: boolean;
}

export const NAV_GROUP_LABEL: Record<NavGroup, string> = {
  chart: 'Charting',
  decision: 'Decision support',
  reference: 'Reference',
  records: 'Records',
};

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'flowsheet',
    label: 'Flowsheet',
    shortLabel: 'Flowsheet',
    icon: 'table_chart',
    group: 'chart',
    hint: 'Charted rounds for the active patient, newest column on the right',
    mobilePrimary: true,
  },
  {
    id: 'assess',
    label: 'Vitals & Round',
    shortLabel: 'Round',
    icon: 'vital_signs',
    filled: true,
    group: 'chart',
    hint: 'Record a new round: TPR, GI, pain, laminitis, support lines',
    mobilePrimary: true,
  },
  {
    id: 'meds',
    label: 'Medications & Support',
    shortLabel: 'Meds',
    icon: 'medication',
    group: 'chart',
    hint: 'Drugs, fluids and CRIs on this patient — running, due and stopped',
    mobilePrimary: true,
  },
  {
    id: 'labs',
    label: 'Laboratory',
    shortLabel: 'Labs',
    icon: 'science',
    group: 'chart',
    hint: 'Full panels with reference intervals; indices and ratios calculated',
  },
  {
    id: 'intelligence',
    label: 'Clinical Intelligence',
    shortLabel: 'Intel',
    icon: 'monitoring',
    group: 'decision',
    hint: 'Scores, call-surgeon triggers and prognostic flags from the latest round',
    mobilePrimary: true,
  },
  {
    id: 'scores',
    label: 'Scores & Foal',
    shortLabel: 'Scores',
    icon: 'analytics',
    group: 'decision',
    hint: 'Neonatal sepsis, foal survival and adult GI sepsis scoring inputs',
  },
  {
    id: 'fluids',
    label: 'Fluid Balance',
    shortLabel: 'Fluids',
    icon: 'water_full',
    group: 'decision',
    hint: 'Intake from running lines, output from reflux and insensible loss',
  },
  {
    id: 'calculator',
    label: 'Dose Calculator',
    shortLabel: 'Doses',
    icon: 'vaccines',
    group: 'reference',
    hint: 'Weight-based dose and volume from the formulary',
  },
  {
    id: 'ranges',
    label: 'Reference Ranges',
    shortLabel: 'Ranges',
    icon: 'biotech',
    group: 'reference',
    hint: 'Published intervals by age class, with their source populations',
  },
  {
    id: 'sources',
    label: 'Sources',
    shortLabel: 'Sources',
    icon: 'menu_book',
    group: 'reference',
    hint: 'Every citation a score panel or threshold actually implements',
  },
  {
    id: 'dashboard',
    label: 'Patient Ward',
    shortLabel: 'Ward',
    icon: 'grid_view',
    group: 'records',
    hint: 'Every active patient at a glance',
  },
  {
    id: 'patients',
    label: 'Patient Records',
    shortLabel: 'Records',
    icon: 'folder_shared',
    group: 'records',
    hint: 'Edit, discharge, archive and delete patients; set who is charting',
  },
  {
    id: 'overview',
    label: 'About This Suite',
    shortLabel: 'About',
    icon: 'help',
    group: 'records',
    hint: 'What each module does and where its numbers come from',
  },
];

export const NAV_ORDER: NavGroup[] = ['chart', 'decision', 'reference', 'records'];

export const navItem = (id: ViewTab): NavItem | undefined =>
  NAV_ITEMS.find((i) => i.id === id);

export const navLabel = (id: ViewTab): string => navItem(id)?.label ?? id;

export const itemsInGroup = (group: NavGroup): NavItem[] =>
  NAV_ITEMS.filter((i) => i.group === group);

export const MOBILE_PRIMARY = NAV_ITEMS.filter((i) => i.mobilePrimary);
