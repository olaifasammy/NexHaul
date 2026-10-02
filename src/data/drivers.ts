import type { Driver, DriverTrait, CDLClassType } from '../types/game';

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'driver-player',
    name: 'You (Fleet Owner Operator)',
    avatar: '👨‍✈️',
    cdlClass: 'Class A + HazMat',
    experienceYears: 10,
    cleanRecordScore: 100,
    skillLevel: 1,
    xp: 0,
    maxXp: 100,
    fatiguePercent: 0,
    moralePercent: 100,
    eldShiftHoursRemaining: 11.0,
    dailySalary: 0,
    traits: ['Eco-Driver', 'Mechanic'],
    assignedTruckId: null
  }
];

export interface DriverCandidate {
  marketId: string;
  name: string;
  avatar: string;
  cdlClass: CDLClassType;
  experienceYears: number;
  cleanRecordScore: number;
  skillLevel: number;
  dailySalary: number;
  traits: DriverTrait[];
  specialty: string;
  background: string;
  qualityTier: DriverQualityTier;
}

export type DriverQualityTier =
  | 'Rookie'
  | 'Experienced'
  | 'Veteran'
  | 'Elite';

interface DriverQualityProfile {
  tier: DriverQualityTier;
  weight: number;
  minExp: number;
  maxExp: number;
  minSkill: number;
  maxSkill: number;
  minSafety: number;
  maxSafety: number;
  salaryMultiplier: number;
}

const DRIVER_QUALITY_PROFILES: DriverQualityProfile[] = [
  {
    tier: 'Rookie',
    weight: 45,
    minExp: 0,
    maxExp: 2,
    minSkill: 1,
    maxSkill: 3,
    minSafety: 78,
    maxSafety: 98,
    salaryMultiplier: 0.82
  },
  {
    tier: 'Experienced',
    weight: 38,
    minExp: 3,
    maxExp: 9,
    minSkill: 3,
    maxSkill: 6,
    minSafety: 84,
    maxSafety: 100,
    salaryMultiplier: 1.0
  },
  {
    tier: 'Veteran',
    weight: 14,
    minExp: 10,
    maxExp: 19,
    minSkill: 5,
    maxSkill: 8,
    minSafety: 88,
    maxSafety: 100,
    salaryMultiplier: 1.22
  },
  {
    tier: 'Elite',
    weight: 3,
    minExp: 15,
    maxExp: 30,
    minSkill: 8,
    maxSkill: 10,
    minSafety: 94,
    maxSafety: 100,
    salaryMultiplier: 1.5
  }
];

function pickQualityTier(): DriverQualityProfile {
  const roll = Math.random() * 100;
  let cursor = 0;

  for (const profile of DRIVER_QUALITY_PROFILES) {
    cursor += profile.weight;
    if (roll < cursor) return profile;
  }

  return DRIVER_QUALITY_PROFILES[1];
}

const DRIVER_FIRST_NAMES = [
  // North America & Western
  'Marcus', 'James', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph',
  'Thomas', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven',
  'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy',
  'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan',
  'Stephen', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Alexander', 'Patrick',
  'Tyler', 'Aaron', 'Henry', 'Douglas', 'Peter', 'Adam', 'Nathan', 'Zachary',
  'Kyle', 'Ethan', 'Christian', 'Sean', 'Austin', 'Noah', 'Jesse', 'Bryan',
  // Europe & Scandinavia
  'Sven', 'Lars', 'Henrik', 'Anders', 'Magnus', 'Erik', 'Johan', 'Stefan',
  'Lukas', 'Jan', 'Klaus', 'Hans', 'Dieter', 'Wolfgang', 'Matteo', 'Luca',
  'Marco', 'Pierre', 'Jean', 'Michel', 'Philippe', 'Liam', 'Conor', 'Oliver',
  // Eastern Europe
  'Nikolai', 'Dmitri', 'Sergei', 'Viktor', 'Alexei', 'Mikhail', 'Ivan', 'Andrei',
  'Stanislav', 'Tomasz', 'Piotr', 'Krzysztof', 'Pawel', 'Marek',
  // Hispanic & Latin America
  'Carlos', 'Alejandro', 'Diego', 'Miguel', 'Javier', 'Fernando', 'Ricardo', 'Gabriel',
  'Mateo', 'Sebastian', 'Rodrigo', 'Rafael', 'Hector', 'Emilio', 'Manuel', 'Eduardo',
  'Jorge', 'Luis', 'Roberto', 'Pedro',
  // Asia & Middle East
  'Kenji', 'Hiroshi', 'Takeshi', 'Daiki', 'Min-jun', 'Ji-hoon', 'Sung-ho', 'Wei',
  'Jun', 'Chen', 'Ming', 'Ravi', 'Arjun', 'Rajesh', 'Sanjay', 'Vikram', 'Tariq',
  // Africa
  'Kwame', 'Kofi', 'Malik', 'Darius', 'Babatunde', 'Tendai', 'Olamide', 'Jabari',
  // Female Commercial Operators
  'Elena', 'Sarah', 'Rachel', 'Natalie', 'Maya', 'Nina', 'Layla', 'Grace',
  'Olivia', 'Amira', 'Sofia', 'Hannah', 'Emma', 'Leah', 'Maria', 'Chloe',
  'Zoe', 'Jessica', 'Jennifer', 'Amanda', 'Ashley', 'Stephanie', 'Melissa', 'Nicole',
  'Elizabeth', 'Heather', 'Tiffany', 'Michelle', 'Amber', 'Megan', 'Kimberly'
];

const DRIVER_LAST_NAMES = [
  'Vance', 'Rostova', 'Reed', 'Kalu', 'Lindqvist', 'Turner', 'Morgan',
  'Bennett', 'Cole', 'Hayes', 'Walker', 'Foster', 'Brooks', 'Parker',
  'Mitchell', 'Carter', 'Reyes', 'Grant', 'Murphy', 'Cooper',
  'Williams', 'Adams', 'Torres', 'Price', 'Mason', 'Ellis', 'Wright',
  'Davis', 'Hunter', 'Stone', 'Scott', 'Taylor', 'King', 'Johnson',
  'Smith', 'Brown', 'Jones', 'Miller', 'Wilson', 'Moore', 'Anderson',
  'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia',
  'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Hall',
  'Allen', 'Young', 'Hernandez', 'Nelson', 'Campbell', 'Roberts', 'Gomez',
  'Phillips', 'Evans', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers',
  'Ortiz', 'Gutierrez', 'Chavez', 'Rivera', 'Schmidt', 'Weber', 'Meyer',
  'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Fischer', 'Johansson', 'Nilsson',
  'Larsson', 'Olsson', 'Persson', 'Hansen', 'Jensen', 'Dubois', 'Laurent',
  'Moreau', 'Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Nowak',
  'Kowalski', 'Wisniewski', 'Wozniak', 'Ivanov', 'Smirnov', 'Kuznetsov', 'Popov',
  'Tanaka', 'Sato', 'Suzuki', 'Takahashi', 'Watanabe', 'Park', 'Choi',
  'Kang', 'Zhang', 'Liu', 'Singh', 'Patel', 'Sharma', 'Verma',
  'Okafor', 'Mensah', 'Diallo', 'Traore', 'Mwangi'
];

/**
 * Procedural Infinite Driver Name Generator.
 * Combines authentic first names, optional middle initials, and last names,
 * rigorously checking against existing drivers and market candidates to guarantee zero duplicates.
 */
export function generateUniqueDriverName(excludeNames: Set<string> | string[] = []): string {
  const excludeSet = excludeNames instanceof Set 
    ? excludeNames 
    : new Set(excludeNames.map(n => n.trim().toLowerCase()));

  for (let attempt = 0; attempt < 500; attempt++) {
    const first = pick(DRIVER_FIRST_NAMES);
    const last = pick(DRIVER_LAST_NAMES);
    const useMiddle = Math.random() < 0.40;
    const middleInitial = useMiddle ? ` ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}.` : '';
    const candidateName = `${first}${middleInitial} ${last}`;

    if (!excludeSet.has(candidateName.toLowerCase())) {
      return candidateName;
    }
  }

  // Fallback with unique commercial badge if extreme collision occurs
  const fallback = `${pick(DRIVER_FIRST_NAMES)} ${pick(DRIVER_LAST_NAMES)} #${Math.floor(100 + Math.random() * 900)}`;
  return fallback;
}

const DRIVER_AVATARS = [
  '👨‍🦱', '👩‍🦰', '👨‍🦳', '👩‍🦱', '🧔', '👨‍🦲', '👩', '👨',
  '👩‍🦳', '👨‍🦰'
];

const DRIVER_ARCHETYPES = [
  {
    name: 'Regional Specialist',
    minExp: 1,
    maxExp: 8,
    skillBias: 0,
    salaryBias: 0,
    specialties: ['Regional Freight', 'City Distribution', 'Retail Freight'],
    backgrounds: ['Started in local distribution and moved into Class A work.', 'Built experience running regional routes for a mid-size carrier.']
  },
  {
    name: 'Long-Haul Veteran',
    minExp: 8,
    maxExp: 25,
    skillBias: 1,
    salaryBias: 45,
    specialties: ['Long Haul', 'Cross-Country', 'Dry Van'],
    backgrounds: ['Spent years running coast-to-coast freight for national carriers.', 'Veteran interstate driver with extensive long-haul mileage.']
  },
  {
    name: 'Refrigerated Specialist',
    minExp: 4,
    maxExp: 18,
    skillBias: 1,
    salaryBias: 35,
    specialties: ['Refrigerated Freight', 'Produce', 'Cold Chain'],
    backgrounds: ['Specialized in temperature-controlled food distribution.', 'Experienced reefer operator familiar with strict delivery windows.']
  },
  {
    name: 'Hazmat Professional',
    minExp: 6,
    maxExp: 22,
    skillBias: 1,
    salaryBias: 70,
    specialties: ['HazMat', 'Chemical Freight', 'Tank Transport'],
    backgrounds: ['Built a career hauling regulated chemical freight.', 'Experienced hazardous-materials driver with strong compliance history.']
  },
  {
    name: 'Heavy Haul Operator',
    minExp: 7,
    maxExp: 25,
    skillBias: 1,
    salaryBias: 85,
    specialties: ['Heavy Haul', 'Oversize Loads', 'Construction Equipment'],
    backgrounds: ['Worked specialized heavy-haul routes for construction contractors.', 'Experienced with oversized equipment and permit-controlled routes.']
  },
  {
    name: 'Night Freight Specialist',
    minExp: 2,
    maxExp: 15,
    skillBias: 0,
    salaryBias: 20,
    specialties: ['Night Freight', 'Overnight Linehaul', 'Express Freight'],
    backgrounds: ['Prefers overnight linehaul and time-sensitive freight.', 'Built experience on night schedules and express delivery networks.']
  },
  {
    name: 'Fleet Veteran',
    minExp: 12,
    maxExp: 30,
    skillBias: 2,
    salaryBias: 90,
    specialties: ['Fleet Operations', 'Long Haul', 'Driver Training'],
    backgrounds: ['Former lead driver with experience mentoring newer drivers.', 'Veteran operator with decades of fleet and interstate experience.']
  }
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function weightedTraitPool(): DriverTrait[] {
  const traits: DriverTrait[] = [];

  if (Math.random() < 0.28) traits.push('Eco-Driver');
  if (Math.random() < 0.18) traits.push('Night Owl');
  if (Math.random() < 0.14) traits.push('Mechanic');
  if (Math.random() < 0.12) traits.push('Speed Demon');
  if (Math.random() < 0.12) traits.push('HazMat Specialist');
  if (Math.random() < 0.24) traits.push('Veteran Hauler');

  return traits.slice(0, randomInt(0, 2));
}

function chooseCdl(specialty: string): CDLClassType {
  if (specialty.includes('HazMat') || specialty.includes('Chemical') || specialty.includes('Tank')) {
    return Math.random() < 0.35 ? 'Class A + Tanker' : 'Class A + HazMat';
  }

  if (specialty.includes('Heavy') || specialty.includes('Oversize') || specialty.includes('Construction')) {
    return 'Class A + Oversized Heavy';
  }

  if (specialty.includes('Refrigerated') || specialty.includes('Produce') || specialty.includes('Cold')) {
    return 'Class A CDL';
  }

  return Math.random() < 0.12 ? 'Class A + Tanker' : 'Class A CDL';
}

export function generateDriverCandidate(excludeNames: string[] = []): DriverCandidate {
  const quality = pickQualityTier();

  // Quality tier sets the broad career band, while archetype adds specialization.
  const compatibleArchetypes = DRIVER_ARCHETYPES.filter(
    archetype =>
      archetype.maxExp >= quality.minExp &&
      archetype.minExp <= quality.maxExp
  );

  const archetype = pick(
    compatibleArchetypes.length > 0
      ? compatibleArchetypes
      : DRIVER_ARCHETYPES
  );

  const experienceYears = randomInt(
    Math.max(quality.minExp, archetype.minExp),
    Math.min(quality.maxExp, archetype.maxExp)
  );

  // Skill has individual variation. Experience helps, but does not completely
  // determine ability.
  const experienceSkill = Math.floor(experienceYears / 4);
  const performanceVariance =
    quality.tier === 'Elite'
      ? randomInt(0, 1)
      : randomInt(-1, 1);

  let skillLevel = Math.max(
    quality.minSkill,
    Math.min(
      quality.maxSkill,
      Math.round(
        (quality.minSkill + quality.maxSkill) / 2 +
        experienceSkill * 0.25 +
        archetype.skillBias +
        performanceVariance
      )
    )
  );

  // Elite applicants are genuinely uncommon and consistently strong.
  if (quality.tier === 'Elite') {
    skillLevel = randomInt(8, 10);
  }

  // Safety varies individually, but higher-quality candidates tend to have
  // stronger records.
  const safetyBase = randomInt(
    quality.minSafety,
    quality.maxSafety
  );

  const experienceSafetyBonus =
    Math.min(4, Math.floor(experienceYears / 5));

  const safetyVariance =
    quality.tier === 'Rookie'
      ? randomInt(-8, 3)
      : randomInt(-4, 2);

  const cleanRecordScore = Math.max(
    70,
    Math.min(
      100,
      safetyBase + experienceSafetyBonus + safetyVariance
    )
  );

  const specialty = pick(archetype.specialties);
  const cdlClass = chooseCdl(specialty);

  let salary =
    (
      125 +
      experienceYears * 8 +
      skillLevel * 12 +
      archetype.salaryBias +
      randomInt(-15, 25)
    ) * quality.salaryMultiplier;

  if (cdlClass === 'Class A + HazMat') salary += 35;
  if (cdlClass === 'Class A + Tanker') salary += 20;
  if (cdlClass === 'Class A + Oversized Heavy') salary += 45;

  // Elite and veteran drivers command noticeably higher pay.
  if (quality.tier === 'Veteran') salary += 35;
  if (quality.tier === 'Elite') salary += 90;

  salary = Math.max(
    100,
    Math.round(salary / 5) * 5
  );

  const traits = weightedTraitPool();

  // Quality affects trait depth.
  if (
    quality.tier === 'Veteran' &&
    !traits.includes('Veteran Hauler') &&
    Math.random() < 0.7
  ) {
    traits.push('Veteran Hauler');
  }

  if (
    quality.tier === 'Elite' &&
    !traits.includes('Veteran Hauler') &&
    Math.random() < 0.85
  ) {
    traits.push('Veteran Hauler');
  }

  // Specialized candidates are more likely to have matching traits.
  if (
    (specialty.includes('HazMat') ||
      specialty.includes('Chemical') ||
      specialty.includes('Tank')) &&
    !traits.includes('HazMat Specialist') &&
    Math.random() < (quality.tier === 'Elite' ? 0.8 : 0.45)
  ) {
    traits.push('HazMat Specialist');
  }

  if (
    specialty.includes('Night') &&
    !traits.includes('Night Owl') &&
    Math.random() < 0.65
  ) {
    traits.push('Night Owl');
  }

  // Elite applicants are more likely to have multiple useful traits.
  if (
    quality.tier === 'Elite' &&
    traits.length < 2 &&
    Math.random() < 0.75
  ) {
    const extraTraits = weightedTraitPool();

    for (const trait of extraTraits) {
      if (!traits.includes(trait) && traits.length < 2) {
        traits.push(trait);
      }
    }
  }

  const backgroundsByTier: Record<DriverQualityTier, string[]> = {
    Rookie: [
      'Recently moved into commercial Class A work after local delivery experience.',
      'Newer interstate driver looking for a first long-term carrier.',
      'Early-career driver with a clean start and limited long-haul mileage.'
    ],
    Experienced: [
      'Established carrier driver with several years of dependable route experience.',
      'Experienced regional operator looking for better equipment and freight.',
      'Several years of commercial driving across regional and interstate routes.'
    ],
    Veteran: [
      'Long-time professional driver with extensive interstate mileage.',
      'Veteran operator who has worked for multiple established carriers.',
      'Seasoned driver with years of experience handling demanding freight schedules.'
    ],
    Elite: [
      'Highly sought-after veteran operator with an exceptional professional record.',
      'Former lead driver known for difficult routes, premium freight, and mentoring.',
      'Rare senior driver with extensive mileage and experience across specialized freight.'
    ]
  };

  return {
    marketId: `candidate-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
    name: generateUniqueDriverName(excludeNames),
    avatar: pick(DRIVER_AVATARS),
    cdlClass,
    experienceYears,
    cleanRecordScore,
    skillLevel,
    dailySalary: salary,
    traits: [...new Set(traits)].slice(0, 2),
    specialty,
    background: pick(backgroundsByTier[quality.tier]),
    qualityTier: quality.tier
  };
}

export function generateDriverMarket(count = 4, excludeNames: string[] = []): DriverCandidate[] {
  const candidates: DriverCandidate[] = [];
  const currentExcludes = new Set(excludeNames.map(n => n.trim().toLowerCase()));

  while (candidates.length < count) {
    const candidate = generateDriverCandidate([...currentExcludes]);
    candidates.push(candidate);
    currentExcludes.add(candidate.name.toLowerCase());
  }

  return candidates;
}

// Kept for compatibility with older imports and any external references.
// The live Driver Lounge now uses generateDriverMarket() instead.
export const HIRABLE_DRIVERS_POOL: DriverCandidate[] = generateDriverMarket(8);
