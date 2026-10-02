import type { Contract, TrailerType, CargoCategory, TruckRegion } from '../types/game';
import { AMERICAN_CITIES_DATA } from './americanCities';

export const INITIAL_AVAILABLE_CONTRACTS: Contract[] = [
  {
    id: 'contract-light-1',
    title: 'Brisk Cargo Express (I-90 Metro — Chicago Hub → Milwaukee Depot)',
    origin: 'Chicago Hub',
    destination: 'Milwaukee Depot',
    cargoCategory: 'General Freight',
    requiredTrailerType: 'Dry Van',
    distanceMiles: 92,
    weightTons: 4,
    payoutCash: 2150,
    payoutXp: 110,
    timeLimitMinutes: 320,
    dangerLevel: 1,
    region: 'America',
    status: 'available',
    isUrgent: true,
    expirySecondsTotal: 3600,
    expirySecondsRemaining: 3600
  },
  {
    id: 'contract-light-2',
    title: 'Urban Parcel Restock (Metro Loop — Dallas Logistics → Fort Worth Rail)',
    origin: 'Dallas Logistics',
    destination: 'Fort Worth Rail',
    cargoCategory: 'General Freight',
    requiredTrailerType: 'Dry Van',
    distanceMiles: 45,
    weightTons: 3,
    payoutCash: 1420,
    payoutXp: 85,
    timeLimitMinutes: 240,
    dangerLevel: 1,
    region: 'America',
    status: 'available',
    isUrgent: false,
    expirySecondsTotal: 7200,
    expirySecondsRemaining: 7200
  },
  {
    id: 'contract-1',
    title: 'Metro Grocery Supply (I-90 Express — Chicago Interchange → Detroit Park)',
    origin: 'Chicago Interchange',
    destination: 'Detroit Logistics Park',
    cargoCategory: 'General Freight',
    requiredTrailerType: 'Dry Van',
    distanceMiles: 280,
    weightTons: 12,
    payoutCash: 4356,
    payoutXp: 180,
    timeLimitMinutes: 1500,
    dangerLevel: 1,
    region: 'America',
    status: 'available',
    isUrgent: false,
    expirySecondsTotal: 14400,
    expirySecondsRemaining: 14400
  },
  {
    id: 'contract-2',
    title: 'Fresh Dairy (E30 Trans-European Corridor — Rotterdam Port → Berlin Terminal)',
    origin: 'Rotterdam Port',
    destination: 'Berlin Cargo Terminal',
    cargoCategory: 'Perishable Foods',
    requiredTrailerType: 'Refrigerated',
    distanceMiles: 420,
    weightTons: 18,
    payoutCash: 7502,
    payoutXp: 310,
    timeLimitMinutes: 1400,
    dangerLevel: 2,
    region: 'Europe',
    status: 'available',
    isUrgent: true,
    expirySecondsTotal: 5400,
    expirySecondsRemaining: 5400
  },
  {
    id: 'contract-3',
    title: 'Precision Machining (Asian Highway AH1 — Tokyo Wharf → Osaka Railhead)',
    origin: 'Tokyo Industrial Wharf',
    destination: 'Osaka West Railhead',
    cargoCategory: 'Heavy Machinery',
    requiredTrailerType: 'Flatbed',
    distanceMiles: 310,
    weightTons: 22,
    payoutCash: 6171,
    payoutXp: 260,
    timeLimitMinutes: 1650,
    dangerLevel: 3,
    region: 'Asia',
    status: 'available',
    isUrgent: false,
    expirySecondsTotal: 21600,
    expirySecondsRemaining: 21600
  },
  {
    id: 'contract-4',
    title: 'High-Tech Servers (Route 66 Corridor — Silicon Valley → Dallas Fortress)',
    origin: 'Silicon Valley Cluster',
    destination: 'Dallas Data Fortress',
    cargoCategory: 'High Value Tech',
    requiredTrailerType: 'Dry Van',
    distanceMiles: 1450,
    weightTons: 9,
    payoutCash: 29645,
    payoutXp: 1200,
    timeLimitMinutes: 7500,
    dangerLevel: 2,
    region: 'America',
    status: 'available',
    isUrgent: false,
    expirySecondsTotal: 28800,
    expirySecondsRemaining: 28800
  },
  {
    id: 'contract-5',
    title: 'Wholesale Chemical Feedstock (HazMat Bio — Houston Chem → Atlanta Hub)',
    origin: 'Houston Chem Complex',
    destination: 'Atlanta Processing Hub',
    cargoCategory: 'Hazardous Chemicals',
    requiredTrailerType: 'HazMat Container',
    distanceMiles: 780,
    weightTons: 26,
    payoutCash: 20328,
    payoutXp: 880,
    timeLimitMinutes: 2600,
    dangerLevel: 4,
    region: 'America',
    status: 'available',
    isUrgent: true,
    expirySecondsTotal: 7200,
    expirySecondsRemaining: 7200
  }
];

const AMERICAN_ROUTES = [
  { origin: 'Los Angeles Hub', dest: 'Seattle Port', desc: 'I-5 Pacific Coast Corridor' },
  { origin: 'Dallas Logistics', dest: 'Atlanta Railhead', desc: 'I-20 Southern Corridor' },
  { origin: 'Chicago Interchange', dest: 'New York Wharf', desc: 'I-80 Midwest-East Link' },
  { origin: 'Miami Terminals', dest: 'Houston Terminal', desc: 'I-10 Gulf Coast Route' },
  { origin: 'Denver Terminal', dest: 'Phoenix Interchange', desc: 'I-25 Mountain Corridor' },
  { origin: 'Portland Dock', dest: 'San Francisco Wharf', desc: 'US-101 Coastal Highway' },
  { origin: 'Newark Port', dest: 'Harrisburg Logistics Park', desc: 'I-78 Mid-Atlantic Freight Alley' },
  { origin: 'Savannah Garden City Terminal', dest: 'Atlanta Processing Hub', desc: 'I-16 Southeast Container Route' },
  { origin: 'Laredo Border Gateway', dest: 'Indianapolis Logistics Center', desc: 'I-35 / I-70 USMCA Trade Corridor' },
  { origin: 'Reno Sierra Logistics Park', dest: 'Long Beach Port', desc: 'I-15 / US-395 Western Logistics Route' },
  { origin: 'Memphis Distribution Hub', dest: 'Columbus Inland Port', desc: 'I-40 / I-70 Midwest-South Connector' },
  { origin: 'Kansas City Intermodal', dest: 'Chicago Hub', desc: 'I-70 / I-55 Heartland Freight Axis' },
  { origin: 'Salt Lake City Intermountain Hub', dest: 'Denver Terminal', desc: 'I-80 Rockies Transcontinental Route' },
  { origin: 'Louisville Air Hub', dest: 'Newark Port', desc: 'I-70 / I-78 Express Parcel Route' },
  { origin: 'Tacoma Port', dest: 'Boise Agricultural Dock', desc: 'I-90 / I-84 Pacific Northwest Route' },
  { origin: 'Charlotte Logistics Park', dest: 'Baltimore Marine Terminal', desc: 'I-85 / I-95 Atlantic Seaboard Route' }
];

const EUROPEAN_ROUTES = [
  { origin: 'Rotterdam Port', dest: 'Hamburg Terminal', desc: 'E30 Trans-European Highway' },
  { origin: 'Munich Hub', dest: 'Milan Logistics', desc: 'E45 Alpine Pass Route' },
  { origin: 'Paris Hub', dest: 'Prague Rail Terminal', desc: 'E50 Central Link' },
  { origin: 'Gothenburg Wharf', dest: 'Stockholm Logistics', desc: 'E4 Nordic Highway' },
  { origin: 'Madrid Interchange', dest: 'Lisbon Wharf', desc: 'E90 Iberian Route' },
  { origin: 'Warsaw Terminal', dest: 'Vilnius Hub', desc: 'Via Baltica Corridor' },
];

const ASIAN_ROUTES = [
  { origin: 'Tokyo Wharf', dest: 'Nagoya Interchange', desc: 'Tomei Expressway' },
  { origin: 'Seoul Hub', dest: 'Busan Terminal', desc: 'Gyeongbu Corridor (AH1)' },
  { origin: 'Shanghai Terminal', dest: 'Wuhan Interchange', desc: 'G50 Yangtze Corridor' },
  { origin: 'Singapore Port', dest: 'Kuala Lumpur Hub', desc: 'Asian Highway AH2' },
  { origin: 'Taipei Terminals', dest: 'Kaohsiung Rail', desc: 'National Highway No. 1' },
  { origin: 'Bangkok Terminal', dest: 'Chiang Mai Interchange', desc: 'Asian Highway AH3' },
];

const AFRICAN_ROUTES = [
  { origin: 'Cairo Logistics Hub', dest: 'Nairobi Hub', desc: 'Trans-African Highway (Cairo-Cape Town)' },
  { origin: 'Lagos Port', dest: 'Cairo Logistics Hub', desc: 'West-North Trans-Saharan Link' },
  { origin: 'Johannesburg Terminal', dest: 'Nairobi Hub', desc: 'Great North Road Corridor' },
  { origin: 'Casablanca Wharf', dest: 'Lagos Port', desc: 'Atlantic Coastal Route' },
  { origin: 'Cape Town Depot', dest: 'Johannesburg Terminal', desc: 'N1 South African Freight Corridor' },
  { origin: 'Mombasa Port', dest: 'Nairobi Hub', desc: 'Northern Corridor East Africa' },
];

const LIGHT_METRO_PREFIXES = [
  'Brisk Cargo Metro Express', 'Urban Parcel Dispatch', 'Local Retail Restock', 
  'Express Grocery Delivery', 'Pharmacy Medical Supply', 'Brisk Utility Distribution'
];

const CARGO_PREFIXES = [
  'Metro Grocery Supply', 'Fresh Dairy Express', 'Precision Machining', 'High-Tech Servers',
  'Wholesale Chemical Feedstock', 'Aerospace Components', 'Industrial Machinery', 'Volatile Petrochemicals',
  'Chemical Bio-Shields', 'Perishable Produce Run', 'Heavy Construction Kit', 'Medical Supply Chain',
  'Electronics Freight', 'Cold Chain Logistics', 'Auto Parts Delivery', 'Mining Equipment Transport',
  'Textile Bulk Shipment', 'Agricultural Seed Dispatch', 'Construction Material Haul', 'Retail Distribution Load'
];

const CARGO_TYPES: { title: string; category: CargoCategory; trailer: TrailerType; danger: 1|2|3|4|5; payMultiplier: number }[] = [
  { title: 'Warehouse Pallets', category: 'General Freight', trailer: 'Dry Van', danger: 1, payMultiplier: 1.0 },
  { title: 'Chilled Produce', category: 'Perishable Foods', trailer: 'Refrigerated', danger: 2, payMultiplier: 1.35 },
  { title: 'Industrial Machinery', category: 'Heavy Machinery', trailer: 'Flatbed', danger: 3, payMultiplier: 1.70 },
  { title: 'Volatile Petrochemicals', category: 'Hazardous Chemicals', trailer: 'Fuel Tanker', danger: 4, payMultiplier: 2.25 },
  { title: 'Aerospace Components', category: 'High Value Tech', trailer: 'Lowboy Heavy', danger: 3, payMultiplier: 1.90 },
  { title: 'Chemical Bio-Shields', category: 'Hazardous Chemicals', trailer: 'HazMat Container', danger: 5, payMultiplier: 2.60 },
];

export function generateRandomContract(
  companyLevel: number,
  commodityPrices?: Record<CargoCategory, { price: number; basePrice: number }>,
  unlockedRegions: TruckRegion[] = ['America'],
  forceLightBoxTruck: boolean = false,
  forcedTrailerType?: TrailerType
): Contract {
  // ---------------------------------------------------------------------------
  // FREIGHT MARKET MODEL
  // ---------------------------------------------------------------------------
  // The generator deliberately separates:
  //   1. lane selection
  //   2. freight type
  //   3. realistic load weight
  //   4. market conditions
  //   5. urgency
  //   6. payout
  //   7. delivery deadline
  //
  // This prevents "random everything" jobs and creates recurring freight lanes.
  // ---------------------------------------------------------------------------

  const availableGroups: { region: TruckRegion; routes: typeof AMERICAN_ROUTES }[] = [];

  if (unlockedRegions.includes('America')) {
    availableGroups.push({ region: 'America', routes: AMERICAN_ROUTES });
  }
  if (unlockedRegions.includes('Europe')) {
    availableGroups.push({ region: 'Europe', routes: EUROPEAN_ROUTES });
  }
  if (unlockedRegions.includes('Asia')) {
    availableGroups.push({ region: 'Asia', routes: ASIAN_ROUTES });
  }
  if (unlockedRegions.includes('Africa')) {
    availableGroups.push({ region: 'Africa', routes: AFRICAN_ROUTES });
  }

  const selectedGroup = availableGroups.length > 0
    ? availableGroups[Math.floor(Math.random() * availableGroups.length)]
    : { region: 'America' as TruckRegion, routes: AMERICAN_ROUTES };

  const selectedRoute =
    selectedGroup.routes[Math.floor(Math.random() * selectedGroup.routes.length)];

  // ---------------------------------------------------------------------------
  // ROUTE DISTANCES
  // ---------------------------------------------------------------------------
  // These are approximate trucking distances rather than random distances.
  // A little noise is added later to represent different pickup/drop locations.
  // ---------------------------------------------------------------------------

  const routeDistances: Record<string, number> = {
    'Los Angeles Hub|Seattle Port': 1135,
    'Dallas Logistics|Atlanta Railhead': 780,
    'Chicago Interchange|New York Wharf': 790,
    'Miami Terminals|Houston Terminal': 1180,
    'Denver Terminal|Phoenix Interchange': 860,
    'Portland Dock|San Francisco Wharf': 635,
    'Newark Port|Harrisburg Logistics Park': 185,
    'Savannah Garden City Terminal|Atlanta Processing Hub': 250,
    'Laredo Border Gateway|Indianapolis Logistics Center': 1350,
    'Reno Sierra Logistics Park|Long Beach Port': 480,
    'Memphis Distribution Hub|Columbus Inland Port': 460,
    'Kansas City Intermodal|Chicago Hub': 510,
    'Salt Lake City Intermountain Hub|Denver Terminal': 530,
    'Louisville Air Hub|Newark Port': 680,
    'Tacoma Port|Boise Agricultural Dock': 390,
    'Charlotte Logistics Park|Baltimore Marine Terminal': 390,

    'Rotterdam Port|Hamburg Terminal': 300,
    'Munich Hub|Milan Logistics': 490,
    'Paris Hub|Prague Rail Terminal': 650,
    'Gothenburg Wharf|Stockholm Logistics': 470,
    'Madrid Interchange|Lisbon Wharf': 390,
    'Warsaw Terminal|Vilnius Hub': 460,

    'Tokyo Wharf|Nagoya Interchange': 270,
    'Seoul Hub|Busan Terminal': 205,
    'Shanghai Terminal|Wuhan Interchange': 825,
    'Singapore Port|Kuala Lumpur Hub': 220,
    'Taipei Terminals|Kaohsiung Rail': 270,
    'Bangkok Terminal|Chiang Mai Interchange': 430,

    'Cairo Logistics Hub|Nairobi Hub': 4050,
    'Lagos Port|Cairo Logistics Hub': 4700,
    'Johannesburg Terminal|Nairobi Hub': 4100,
    'Casablanca Wharf|Lagos Port': 3900,
    'Cape Town Depot|Johannesburg Terminal': 1400,
    'Mombasa Port|Nairobi Hub': 485
  };

  const routeKey = `${selectedRoute.origin}|${selectedRoute.dest}`;
  const routeBaseDistance = routeDistances[routeKey] || 500;

  // ±6% route variation represents actual shipper/receiver facilities.
  const routeVariation = 0.94 + Math.random() * 0.12;

  let distanceMiles = Math.round(routeBaseDistance * routeVariation);

  // ---------------------------------------------------------------------------
  // FREIGHT PROFILES
  // ---------------------------------------------------------------------------
  // Weight is now related to the type of freight instead of being globally random.
  // ---------------------------------------------------------------------------

  type FreightProfile = {
    minWeight: number;
    maxWeight: number;
    payMultiplier: number;
    danger: 1 | 2 | 3 | 4 | 5;
    trailer: TrailerType;
    laneBias: number;
  };

  const freightProfiles: Record<CargoCategory, FreightProfile> = {
    'General Freight': {
      minWeight: 5,
      maxWeight: 22,
      payMultiplier: 1.00,
      danger: 1,
      trailer: 'Dry Van',
      laneBias: 1.0
    },
    'Perishable Foods': {
      minWeight: 7,
      maxWeight: 24,
      payMultiplier: 1.32,
      danger: 2,
      trailer: 'Refrigerated',
      laneBias: 1.05
    },
    'Heavy Machinery': {
      minWeight: 16,
      maxWeight: 34,
      payMultiplier: 1.62,
      danger: 3,
      trailer: 'Flatbed',
      laneBias: 0.82
    },
    'Hazardous Chemicals': {
      minWeight: 14,
      maxWeight: 30,
      payMultiplier: 2.05,
      danger: 4,
      trailer: 'Fuel Tanker',
      laneBias: 0.62
    },
    'High Value Tech': {
      minWeight: 4,
      maxWeight: 16,
      payMultiplier: 1.82,
      danger: 3,
      trailer: 'Dry Van',
      laneBias: 0.72
    }
  };

  // ---------------------------------------------------------------------------
  // CARGO SELECTION
  // ---------------------------------------------------------------------------
  // Normal freight boards are weighted toward ordinary dry-van work.
  // Rare/specialized cargo still appears, but doesn't dominate the board.
  // ---------------------------------------------------------------------------

  const cargoRoll = Math.random();

  let cargoCategory: CargoCategory;

  if (forceLightBoxTruck) {
    cargoCategory = Math.random() < 0.72
      ? 'General Freight'
      : 'Perishable Foods';
  } else if (forcedTrailerType) {
    const matching = CARGO_TYPES.filter(ct => ct.trailer === forcedTrailerType);
    if (matching.length > 0) {
      cargoCategory = matching[Math.floor(Math.random() * matching.length)].category;
    } else {
      cargoCategory = 'General Freight';
    }
  } else if (cargoRoll < 0.48) {
    cargoCategory = 'General Freight';
  } else if (cargoRoll < 0.68) {
    cargoCategory = 'Perishable Foods';
  } else if (cargoRoll < 0.83) {
    cargoCategory = 'Heavy Machinery';
  } else if (cargoRoll < 0.94) {
    cargoCategory = 'High Value Tech';
  } else {
    cargoCategory = 'Hazardous Chemicals';
  }

  const profile = freightProfiles[cargoCategory];

  // ---------------------------------------------------------------------------
  // LOAD WEIGHT
  // ---------------------------------------------------------------------------

  let weightTons: number;

  if (forceLightBoxTruck) {
    // Never exceed the Class 3 Light 10T payload limit.
    weightTons = Math.round((2 + Math.random() * 6) * 10) / 10;
    distanceMiles = Math.max(40, Math.min(200, distanceMiles));
  } else {
    // Most loads aren't exactly at maximum capacity.
    // Bias toward the middle of the cargo's realistic range.
    const r1 = Math.random();
    const r2 = Math.random();
    const normalized = (r1 + r2) / 2;

    weightTons = Math.round(
      (profile.minWeight +
        normalized * (profile.maxWeight - profile.minWeight)) * 10
    ) / 10;
  }

  // ---------------------------------------------------------------------------
  // FREIGHT TITLE
  // ---------------------------------------------------------------------------

  const cargoTitles: Record<CargoCategory, string[]> = {
    'General Freight': [
      'Warehouse Pallets',
      'Retail Stock',
      'Consumer Goods',
      'Distribution Center Restock',
      'Mixed Dry Freight'
    ],
    'Perishable Foods': [
      'Fresh Produce',
      'Chilled Dairy',
      'Frozen Foods',
      'Fresh Meat Shipment',
      'Temperature-Controlled Groceries'
    ],
    'Heavy Machinery': [
      'Industrial Machinery',
      'Construction Equipment',
      'Manufacturing Components',
      'Heavy Equipment Parts',
      'Production Machinery'
    ],
    'Hazardous Chemicals': [
      'Chemical Feedstock',
      'Industrial Solvents',
      'Fuel Additives',
      'Hazardous Process Chemicals',
      'Specialty Chemical Load'
    ],
    'High Value Tech': [
      'Data Center Equipment',
      'Network Hardware',
      'Precision Electronics',
      'Server Equipment',
      'High-Value Electronics'
    ]
  };

  const cargoTitleList = cargoTitles[cargoCategory];
  const cargoTitle =
    cargoTitleList[Math.floor(Math.random() * cargoTitleList.length)];

  // ---------------------------------------------------------------------------
  // LANE-BASED FREIGHT DEMAND
  // ---------------------------------------------------------------------------
  // Some lanes naturally make more sense for particular freight.
  // This is deliberately simple so the existing data model doesn't change.
  // ---------------------------------------------------------------------------

  const laneText =
    `${selectedRoute.origin} ${selectedRoute.dest}`.toLowerCase();

  let laneDemand = 1.0;

  if (
    cargoCategory === 'Perishable Foods' &&
    /port|grocery|rotterdam|hamburg|miami|seattle|singapore/.test(laneText)
  ) {
    laneDemand = 1.18;
  }

  if (
    cargoCategory === 'Heavy Machinery' &&
    /industrial|terminal|rail|chicago|detroit|munich|milan|tokyo|nagoya/.test(laneText)
  ) {
    laneDemand = 1.16;
  }

  if (
    cargoCategory === 'High Value Tech' &&
    /tokyo|seoul|taipei|san francisco|dallas|singapore|portland/.test(laneText)
  ) {
    laneDemand = 1.20;
  }

  if (
    cargoCategory === 'Hazardous Chemicals' &&
    /houston|chemical|fuel|industrial|port/.test(laneText)
  ) {
    laneDemand = 1.22;
  }

  // ---------------------------------------------------------------------------
  // COMMODITY MARKET
  // ---------------------------------------------------------------------------

  const commodityInfo = commodityPrices?.[cargoCategory];

  const rawCommodityMultiplier = commodityInfo
    ? commodityInfo.price / Math.max(1, commodityInfo.basePrice)
    : 1.0;

  // Prevent an extreme commodity price from completely breaking the freight board.
  const commodityMultiplier = Math.max(
    0.72,
    Math.min(1.38, rawCommodityMultiplier)
  );

  // ---------------------------------------------------------------------------
  // LOAD UTILIZATION
  // ---------------------------------------------------------------------------

  const maximumUsefulWeight = forceLightBoxTruck
    ? 10
    : profile.maxWeight;

  const loadFactor = Math.max(
    0.45,
    Math.min(1.0, weightTons / maximumUsefulWeight)
  );

  // ---------------------------------------------------------------------------
  // URGENCY
  // ---------------------------------------------------------------------------
  // Urgent loads are now uncommon. Perishables and high-value freight get
  // slightly higher odds because their logistics naturally reward speed.
  // ---------------------------------------------------------------------------

  let urgentChance = 0.075;

  if (cargoCategory === 'Perishable Foods') urgentChance += 0.09;
  if (cargoCategory === 'High Value Tech') urgentChance += 0.045;
  if (cargoCategory === 'Hazardous Chemicals') urgentChance += 0.025;

  if (forceLightBoxTruck) urgentChance += 0.035;

  const isUrgent = Math.random() < urgentChance;

  const urgencyMultiplier = isUrgent
    ? 1.22 + Math.random() * 0.16
    : 1.0;

  // ---------------------------------------------------------------------------
  // SHIPPER PERSONALITY
  // ---------------------------------------------------------------------------

  const personalityRoll = Math.random();

  const shipperPersonality =
    personalityRoll < 0.40
      ? 'corporate' as const
      : personalityRoll < 0.68
        ? 'fair' as const
        : personalityRoll < 0.88
          ? 'greedy' as const
          : 'urgent' as const;

  // ---------------------------------------------------------------------------
  // RATE / MILE
  // ---------------------------------------------------------------------------
  // Instead of distance being multiplied by an arbitrary giant constant,
  // model the job around an underlying freight rate.
  // ---------------------------------------------------------------------------

  const companyRateBonus = Math.min(2.0, companyLevel * 0.16);

  let ratePerMile =
    (4.15 +
      companyRateBonus +
      Math.random() * 1.45) *
    profile.payMultiplier *
    profile.laneBias;

  // Smaller loads cost more per mile because the carrier isn't filling
  // the truck as efficiently.
  if (loadFactor < 0.65) {
    ratePerMile *= 1.10;
  }

  ratePerMile *= laneDemand;
  ratePerMile *= commodityMultiplier;
  ratePerMile *= urgencyMultiplier;

  const originCity = AMERICAN_CITIES_DATA[selectedRoute.origin];
  const destCity = AMERICAN_CITIES_DATA[selectedRoute.dest];
  let imbalanceMultiplier = 1.0;
  if (originCity?.economicRole === 'Export Surplus' && destCity?.economicRole === 'Import Sink') {
    imbalanceMultiplier = 1.15;
  } else if (originCity?.economicRole === 'Import Sink') {
    imbalanceMultiplier = 1.20;
  }
  ratePerMile *= imbalanceMultiplier;

  // Regional operating complexity.
  if (selectedGroup.region === 'Europe') ratePerMile *= 1.08;
  if (selectedGroup.region === 'Asia') ratePerMile *= 1.05;
  if (selectedGroup.region === 'Africa') ratePerMile *= 1.12;

  const linehaulPayout = distanceMiles * ratePerMile;

  // Fuel, loading, tolls, handling and carrier margin are represented by
  // a controlled minimum rather than allowing tiny loads to pay absurdly little.
  const handlingFee =
    forceLightBoxTruck
      ? 180 + Math.random() * 180
      : 350 + Math.random() * 550;

  const payoutCash = Math.max(
    forceLightBoxTruck ? 650 : 1200,
    Math.floor(linehaulPayout + handlingFee)
  );

  // ---------------------------------------------------------------------------
  // XP
  // ---------------------------------------------------------------------------

  const payoutXp = Math.max(
    55,
    Math.floor(
      distanceMiles * 0.42 +
      profile.danger * 38 +
      weightTons * 4 +
      (isUrgent ? 65 : 0)
    )
  );

  // ---------------------------------------------------------------------------
  // DELIVERY WINDOW
  // ---------------------------------------------------------------------------
  // 48 mph isn't enough to represent realistic trucking time because drivers
  // need rest, fueling, loading, traffic and inspections.
  // ---------------------------------------------------------------------------

  const averageRoadSpeed = 48;
  const drivingHours = distanceMiles / averageRoadSpeed;

  const operationalHours =
    drivingHours +
    1.25 + // pickup/loading
    0.75 + // delivery/unloading
    Math.max(0, Math.ceil(drivingHours / 7.5) - 1) * 8.5; // rest periods

  const deadlineBuffer = isUrgent
    ? 1.18 + Math.random() * 0.20
    : 1.45 + Math.random() * 0.40;

  const timeLimitMinutes = Math.max(
    180,
    Math.round(operationalHours * 60 * deadlineBuffer)
  );

  // ---------------------------------------------------------------------------
  // BOARD EXPIRY
  // ---------------------------------------------------------------------------
  // Normal freight remains available for several hours.
  // Urgent freight disappears faster.
  // ---------------------------------------------------------------------------

  const expirySecondsTotal = isUrgent
    ? Math.floor(1800 + Math.random() * 5400)
    : Math.floor(7200 + Math.random() * 25200);

  // ---------------------------------------------------------------------------
  // TITLE
  // ---------------------------------------------------------------------------

  const prefix =
    forceLightBoxTruck
      ? (
          Math.random() < 0.5
            ? 'Metro Express'
            : 'Local Distribution'
        )
      : cargoTitle;

  const isRoundTrip = !forceLightBoxTruck && Math.random() < 0.35;
  const returnPayout = Math.floor(payoutCash * 1.12);

  return {
    id: `contract-gen-${Date.now()}-${Math.floor(Math.random() * 9999)}-${Math.floor(Math.random() * 9999)}`,

    title: `${prefix} (${selectedRoute.desc} — ${selectedRoute.origin} → ${selectedRoute.dest})${isRoundTrip ? ' [🔄 Round-Trip Linked]' : ''}`,

    origin: selectedRoute.origin,
    destination: selectedRoute.dest,

    cargoCategory,
    requiredTrailerType: forcedTrailerType || profile.trailer,

    distanceMiles,
    weightTons,

    payoutCash,
    payoutXp,

    timeLimitMinutes,

    dangerLevel: profile.danger,
    region: selectedGroup.region,

    status: 'available',

    negotiationStatus: 'none',
    negotiationRound: 0,
    shipperPatience: shipperPersonality === 'urgent' ? 72 : 100,
    shipperPersonality,

    isUrgent,

    expirySecondsTotal,
    expirySecondsRemaining: expirySecondsTotal,

    isRoundTrip,
    returnLeg: isRoundTrip ? {
      destination: selectedRoute.origin,
      cargoCategory,
      payoutCash: returnPayout,
      distanceMiles,
      requiredTrailerType: forcedTrailerType || profile.trailer
    } : undefined
  };
}

export function generateBatchContracts(
  count: number, 
  companyLevel: number, 
  commodityPrices?: Record<CargoCategory, { price: number; basePrice: number }>,
  unlockedRegions: TruckRegion[] = ['America'],
  ownedTrailerTypes: TrailerType[] = []
): Contract[] {
  const batch: Contract[] = [];
  
  // 1. Guarantee at least one contract for every trailer type the player owns in their fleet!
  const uniqueOwnedTrailers = Array.from(new Set(ownedTrailerTypes));
  for (const trailerType of uniqueOwnedTrailers) {
    if (batch.length < count) {
      batch.push(generateRandomContract(companyLevel, commodityPrices, unlockedRegions, false, trailerType));
    }
  }

  // 2. Guarantee light box truck contracts (BriskCargo / Class 3 Light)
  const lightContractsCount = Math.min(2, Math.max(1, Math.floor(count * 0.20)));
  for (let i = 0; i < lightContractsCount && batch.length < count; i++) {
    batch.push(generateRandomContract(companyLevel, commodityPrices, unlockedRegions, true));
  }

  // 3. Fill remainder with realistic general freight
  while (batch.length < count) {
    batch.push(generateRandomContract(companyLevel, commodityPrices, unlockedRegions, false));
  }

  return batch;
}
