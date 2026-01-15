/**
 * UN Sustainable Development Goals (SDGs)
 * Norwegian names matching the current site implementation
 */

/**
 * Represents a single UN Sustainable Development Goal
 */
export interface SDGGoal {
  /** SDG number (1-17) */
  id: number;
  /** Norwegian name of the goal */
  name: string;
  /** Official UN SDG color (hex) */
  color: string;
}

/**
 * All 17 UN Sustainable Development Goals with Norwegian names
 * Names sourced from src/filter.js to match existing site
 */
export const sdgGoals: readonly SDGGoal[] = [
  {
    id: 1,
    name: 'Utrydde fattigdom',
    color: '#E5243B',
  },
  {
    id: 2,
    name: 'Utrydde sult',
    color: '#DDA63A',
  },
  {
    id: 3,
    name: 'God helse og livskvalitet',
    color: '#4C9F38',
  },
  {
    id: 4,
    name: 'God utdanning',
    color: '#C5192D',
  },
  {
    id: 5,
    name: 'Likestilling',
    color: '#FF3A21',
  },
  {
    id: 6,
    name: 'Rent vann og gode sanitærforhold',
    color: '#26BDE2',
  },
  {
    id: 7,
    name: 'Ren energi',
    color: '#FCC30B',
  },
  {
    id: 8,
    name: 'Anstendig arbeid og økonomisk vekst',
    color: '#A21942',
  },
  {
    id: 9,
    name: 'Industri- innovasjon og infrastruktur',
    color: '#FD6925',
  },
  {
    id: 10,
    name: 'Mindre ulikhet',
    color: '#DD1367',
  },
  {
    id: 11,
    name: 'Bærekraftige byer og lokalsamfunn',
    color: '#FD9D24',
  },
  {
    id: 12,
    name: 'Ansvarlig forbruk og produksjon',
    color: '#BF8B2E',
  },
  {
    id: 13,
    name: 'Stoppe klimaendringene',
    color: '#3F7E44',
  },
  {
    id: 14,
    name: 'Livet i havet',
    color: '#0A97D9',
  },
  {
    id: 15,
    name: 'Livet på land',
    color: '#56C02B',
  },
  {
    id: 16,
    name: 'Fred- rettferdighet og velfungerende institusjoner',
    color: '#00689D',
  },
  {
    id: 17,
    name: 'Samarbeid om å nå målene',
    color: '#19486A',
  },
] as const;

/**
 * Get an SDG goal by its ID (1-17)
 */
export function getSDGById(id: number): SDGGoal | undefined {
  return sdgGoals.find((goal) => goal.id === id);
}

/**
 * Get an SDG goal by its Norwegian name
 */
export function getSDGByName(name: string): SDGGoal | undefined {
  return sdgGoals.find((goal) => goal.name === name);
}

/**
 * Get multiple SDG goals by their names
 */
export function getSDGsByNames(names: string[]): SDGGoal[] {
  return names
    .map((name) => getSDGByName(name))
    .filter((goal): goal is SDGGoal => goal !== undefined);
}
