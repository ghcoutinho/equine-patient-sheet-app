/**
 * Horse breed picklist.
 *
 * A free-text breed field meant "Thoroughbred", "thoroughbred" and "TB" were
 * three different values wherever breed is matched against something else —
 * `breedErythronFor` (`data/breedReferenceRanges.ts`) already has to do a
 * substring match to cope with it. A picklist doesn't fix every existing
 * record, but it stops the drift going forward, the same reasoning `ROUTES`
 * in `utils/treatments.ts` and `MANURE_CONSISTENCIES` already follow.
 *
 * Not a closed set: 'Other' keeps a free-text fallback so an unlisted or
 * cross-bred entry is never blocked. Breeds with a published erythron
 * reference (`BREED_ERYTHRON`) are listed first so the common hospital
 * caseload doesn't need to scroll past ninety pony and draft breeds to find
 * "Thoroughbred".
 */

export const BREEDS_WITH_REFERENCE_DATA = [
  'Thoroughbred',
  'Standardbred',
  'Quarter Horse',
  'Appaloosa',
  'Arabian',
  'Clydesdale',
  'Percheron',
] as const;

export const OTHER_BREEDS = [
  'Warmblood',
  'Andalusian (PRE)',
  'Lusitano',
  'Friesian',
  'Irish Draught',
  'Irish Sports Horse',
  'Cob',
  'Welsh Cob',
  'Welsh Pony',
  'Connemara Pony',
  'Shetland Pony',
  'New Forest Pony',
  'Dartmoor Pony',
  'Fjord',
  'Haflinger',
  'Icelandic Horse',
  'Highland Pony',
  'Miniature Horse',
  'Paint Horse',
  'Morgan',
  'Tennessee Walking Horse',
  'Missouri Fox Trotter',
  'Rocky Mountain Horse',
  'Mustang',
  'Criollo',
  'Mangalarga Marchador',
  'Campolina',
  'Paso Fino',
  'Peruvian Paso',
  'Akhal-Teke',
  'Trakehner',
  'Hanoverian',
  'Oldenburg',
  'Holsteiner',
  'Dutch Warmblood (KWPN)',
  'Belgian Warmblood',
  'Selle Français',
  'Anglo-Arabian',
  'Part-Arabian',
  'Shire',
  'Suffolk Punch',
  'Belgian Draft',
  'Gypsy Vanner / Gypsy Cob',
  'Lipizzaner',
  'Andravida',
  'Marwari',
  'Kathiawari',
  'Falabella',
  'Pony of the Americas',
  'Mule',
  'Donkey',
] as const;

/** Common caseload breeds first, then the rest, alphabetised within each group. */
export const HORSE_BREEDS: string[] = [
  ...BREEDS_WITH_REFERENCE_DATA,
  ...[...OTHER_BREEDS].sort((a, b) => a.localeCompare(b)),
];

export const BREED_OTHER_OPTION = 'Other (specify)';
