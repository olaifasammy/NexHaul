import type { Truck } from '../types/game';

export const INITIAL_TRUCKS: Truck[] = [
  {
    id: 'truck-starter-1',
    name: 'BriskCargo 200 Utility',
    brand: 'BriskCargo',
    region: 'America',
    modelClass: 'Class 3 Light',
    curbWeightTons: 5.0,
    engineSpecs: {
      model: '6.7L Power Stroke V8 Turbo Diesel',
      horsepower: 330,
      torqueLbFt: 750,
      transmission: '10-Speed Automatic'
    },
    sleeperCabType: 'Regular Day Cab',
    price: 48000,
    horsepower: 330,
    maxFuelLitres: 180,
    currentFuelLitres: 180,
    fuelEfficiencyMpg: 14.0,
    conditionPercent: 100,
    oilLifePercent: 100,
    tireTreadPercent: 100,
    hasPrePass: true,
    durabilityRating: 75,
    assignedDriverId: null,
    assignedTrailerId: 'trailer-starter-1',
    assignedContractId: null,
    upgrades: { engineStage: 0, fuelTankStage: 0, aeroStage: 0, comfortStage: 0, gpsStage: 0 },
    imageIcon: '🚚',
    imageUrl: '/trucks/Freightliner_Cascadia_126.png',
    description: 'Agile light-duty commercial delivery rig. Low fuel burn for local metro freight and express regional contracts.'
  }
];

export const CATALOG_TRUCKS: Omit<Truck, 'id' | 'assignedDriverId' | 'assignedTrailerId' | 'assignedContractId' | 'currentFuelLitres' | 'conditionPercent' | 'oilLifePercent' | 'tireTreadPercent' | 'hasPrePass' | 'upgrades'>[] = [
  // ==================== STARTER BOX TRUCK ====================
  {
    name: 'BriskCargo 200 Utility Box Truck',
    brand: 'BriskCargo',
    region: 'America',
    modelClass: 'Class 3 Light',
    curbWeightTons: 5.0,
    engineSpecs: {
      model: '6.7L Power Stroke V8 Turbo Diesel',
      horsepower: 330,
      torqueLbFt: 750,
      transmission: '10-Speed Automatic'
    },
    sleeperCabType: 'Regular Day Cab',
    price: 48000,
    horsepower: 330,
    maxFuelLitres: 180,
    fuelEfficiencyMpg: 14.0,
    durabilityRating: 75,
    imageIcon: '🚚',
    imageUrl: '/trucks/Brisk.png',
    description: 'Agile light-duty commercial delivery box truck. Low fuel burn for local metro freight and express regional contracts.',
    topSpeedMph: 85
  },

  // ==================== AMERICAN HEAVYWEIGHTS ====================
  {
    name: 'Peterbilt 579 UltraLoft',
    brand: 'Peterbilt',
    region: 'America',
    modelClass: 'Class 8 Highway',
    curbWeightTons: 7.0,
    engineSpecs: {
      model: 'PACCAR MX-13 / Cummins X15 Efficiency',
      horsepower: 510,
      torqueLbFt: 1850,
      transmission: 'Eaton Endurant 12-Speed Automated'
    },
    sleeperCabType: '80" UltraLoft Integrated Suite',
    price: 175000,
    horsepower: 510,
    maxFuelLitres: 1000,
    fuelEfficiencyMpg: 8.5,
    durabilityRating: 95,
    imageIcon: '🚛',
    imageUrl: '/trucks/Peterbilt_579_UltraLoft.png',
    description: 'The pinnacle of American owner-operator comfort. Features aerodynamic fairings, expansive 80-inch double-bunk UltraLoft sleeper, and high-efficiency PACCAR powertrain.',
    topSpeedMph: 80
  },
  {
    name: 'Kenworth W900L Studio Sleeper',
    brand: 'Kenworth',
    region: 'America',
    modelClass: 'Class 8 Heavy',
    curbWeightTons: 8.2,
    engineSpecs: {
      model: 'Cummins X15 Performance Series 15L',
      horsepower: 605,
      torqueLbFt: 2050,
      transmission: 'Eaton Fuller 18-Speed Manual'
    },
    sleeperCabType: '86" Studio Sleeper Lounge',
    price: 195000,
    horsepower: 605,
    maxFuelLitres: 1135,
    fuelEfficiencyMpg: 6.8,
    durabilityRating: 96,
    imageIcon: '🚜',
    imageUrl: '/trucks/Kenworth_W900L.png',
    description: 'The legendary extended-hood American icon. Dual chrome stacks, massive 2,050 lb-ft torque, and an 86-inch studio suite with sofa-bed designed for heavy haul and oversized trailers.',
    topSpeedMph: 78
  },
  {
    name: 'Freightliner Cascadia 126',
    brand: 'Freightliner',
    region: 'America',
    modelClass: 'Class 8 Highway',
    curbWeightTons: 6.8,
    engineSpecs: {
      model: 'Detroit DD15 14.8L Heavy Duty',
      horsepower: 505,
      torqueLbFt: 1850,
      transmission: 'Detroit DT12 Direct-Drive 12-Speed'
    },
    sleeperCabType: '72" Raised Roof Double Bunk',
    price: 155000,
    horsepower: 505,
    maxFuelLitres: 850,
    fuelEfficiencyMpg: 9.0,
    durabilityRating: 90,
    imageIcon: '🚛',
    imageUrl: '/trucks/Freightliner_Cascadia_126.png',
    description: 'North America’s most popular fleet highway tractor. Renowned for low operating costs, advanced Detroit Assurance radar safety, and reliable interstate reliability.',
    topSpeedMph: 82
  },
  {
    name: 'Mack Anthem 70" Stand-Up',
    brand: 'Mack Trucks',
    region: 'America',
    modelClass: 'Class 8 Highway',
    curbWeightTons: 7.0,
    engineSpecs: {
      model: 'Mack MP8-TC Turbo Compound 13L',
      horsepower: 505,
      torqueLbFt: 1860,
      transmission: 'Mack mDRIVE 13-Speed HD Automated'
    },
    sleeperCabType: '70" Stand-Up Aerodynamic Cab',
    price: 162000,
    horsepower: 505,
    maxFuelLitres: 800,
    fuelEfficiencyMpg: 8.2,
    durabilityRating: 92,
    imageIcon: '🚛',
    imageUrl: '/trucks/Mack_Anthem_70_Stand-Up.png',
    description: 'Muscular American styling with rugged Mack bulldog durability. Turbo Compound engine recovers exhaust energy into mechanical crank power for mountain grades.',
    topSpeedMph: 80
  },

  // ==================== EUROPEAN CABOVERS ====================
  {
    name: 'Scania 770 S V8 "King of the Road"',
    brand: 'Scania',
    region: 'Europe',
    modelClass: 'Super Hauler',
    curbWeightTons: 9.2,
    engineSpecs: {
      model: 'Scania DC16 16.4L Twin-Turbo V8',
      horsepower: 770,
      torqueLbFt: 2729, // 3,700 Nm
      transmission: 'Scania Opticruise G33CH 14-Speed'
    },
    sleeperCabType: 'CS20H Highline Flat-Floor Suite',
    price: 240000,
    horsepower: 770,
    maxFuelLitres: 1200,
    fuelEfficiencyMpg: 7.4,
    durabilityRating: 98,
    imageIcon: '👑',
    imageUrl: '/trucks/Scania707.png',
    description: 'The world’s most powerful serial production truck engine. Raw 770 HP and 3,700 Nm torque with a luxury flat-floor cabin, designed to effortlessly haul 80-ton Nordic B-Train combinations.',
    topSpeedMph: 110
  },
  {
    name: 'Volvo FH16 750 Globetrotter XXL',
    brand: 'Volvo Trucks',
    region: 'Europe',
    modelClass: 'Super Hauler',
    curbWeightTons: 9.0,
    engineSpecs: {
      model: 'Volvo D16K 16.1L Inline-6 Turbo',
      horsepower: 750,
      torqueLbFt: 2618, // 3,550 Nm
      transmission: 'Volvo I-Shift with Crawler Gears'
    },
    sleeperCabType: 'Globetrotter XXL Extended Cabin',
    price: 230000,
    horsepower: 750,
    maxFuelLitres: 1100,
    fuelEfficiencyMpg: 7.6,
    durabilityRating: 97,
    imageIcon: '🚛',
    imageUrl: '/trucks/Volvo_FH16_750_Globetrotter_XXL.png',
    description: 'Scandinavian engineering benchmark. Features Volvo Dynamic Steering, crawler gears capable of starting from standstill at 325 tons, and the extended XXL Globetrotter sleeper.',
    topSpeedMph: 86
  },
  {
    name: 'Mercedes-Benz Actros L 1863 GigaSpace',
    brand: 'Mercedes-Benz',
    region: 'Europe',
    modelClass: 'Class 8 Highway',
    curbWeightTons: 7.8,
    engineSpecs: {
      model: 'OM 473 15.6L Turbocompound Inline-6',
      horsepower: 625,
      torqueLbFt: 2212, // 3,000 Nm
      transmission: 'Mercedes PowerShift 3 12-Speed'
    },
    sleeperCabType: 'GigaSpace 2.13m Standing Height',
    price: 195000,
    horsepower: 625,
    maxFuelLitres: 950,
    fuelEfficiencyMpg: 8.5,
    durabilityRating: 95,
    imageIcon: '⭐',
    imageUrl: '/trucks/Mercedes-Benz_Actros_L_1863_GIGASPACE.png',
    description: 'Ultra-modern German engineering with MirrorCam digital cameras replacing side mirrors, Active Drive Assist 2 partial autonomous driving, and the cavernous GigaSpace cab.',
    topSpeedMph: 82
  },
  {
    name: 'MAN TGX 18.640 Individual Lion S',
    brand: 'MAN Truck & Bus',
    region: 'Europe',
    modelClass: 'Class 8 Highway',
    curbWeightTons: 7.7,
    engineSpecs: {
      model: 'MAN D38 15.2L Twin-Turbo Euro 6e',
      horsepower: 640,
      torqueLbFt: 2212,
      transmission: 'MAN TipMatic 12+2 with Retarder'
    },
    sleeperCabType: 'GX High-Roof Flagship Cab',
    price: 188000,
    horsepower: 640,
    maxFuelLitres: 900,
    fuelEfficiencyMpg: 8.2,
    durabilityRating: 94,
    imageIcon: '🦁',
    imageUrl: '/trucks/MAN_TGX_18.640_Individual_Lions.png',
    description: 'The luxury performance trim from Munich. Carbon-weave styling accents, Alcantara upholstery, built-in kitchen wall with microwave/coffeemaker, and 640 HP torque delivery.',
    topSpeedMph: 82
  },

  // ==================== ASIAN COMMERCIAL FLEET ====================
  {
    name: 'Isuzu Giga Max 520 CXZ',
    brand: 'Isuzu Motors',
    region: 'Asia',
    modelClass: 'Class 8 Heavy',
    curbWeightTons: 8.5,
    engineSpecs: {
      model: 'Isuzu 6WG1-TCS 15.6L OHC Turbo',
      horsepower: 520,
      torqueLbFt: 1660,
      transmission: 'Smoother-Gx 16-Speed Automated'
    },
    sleeperCabType: 'Aero High-Roof Standard Sleeper',
    price: 138000,
    horsepower: 520,
    maxFuelLitres: 650,
    fuelEfficiencyMpg: 9.0,
    durabilityRating: 96,
    imageIcon: '🚛',
    imageUrl: '/trucks/Isuzu.png',
    description: 'Japan’s premier heavy commercial hauler. Extreme mechanical durability, renowned for million-kilometer engine life without overhaul and ultra-reliable urban/highway versatility.',
    topSpeedMph: 78
  },
  {
    name: 'Hino 700 Series Heavy Hauler',
    brand: 'Hino (Toyota Group)',
    region: 'Asia',
    modelClass: 'Class 8 Heavy',
    curbWeightTons: 8.3,
    engineSpecs: {
      model: 'Hino E13C-BK 12.9L Turbo Intercooled',
      horsepower: 480,
      torqueLbFt: 1590,
      transmission: 'ZF TraXon 16-Speed Automated'
    },
    sleeperCabType: 'High-Comfort Air-Suspended Cab',
    price: 132000,
    horsepower: 480,
    maxFuelLitres: 600,
    fuelEfficiencyMpg: 9.4,
    durabilityRating: 95,
    imageIcon: '🚛',
    imageUrl: '/trucks/Hino-700.png',
    description: 'Toyota Group’s commercial heavy tractor. Renowned for outstanding fuel economy, low maintenance costs, and full air-suspended chassis smoothing rough highway surfaces.',
    topSpeedMph: 78
  },
  {
    name: 'Hyundai Xcient Heavy Tractor 540',
    brand: 'Hyundai Commercial',
    region: 'Asia',
    modelClass: 'Class 8 Highway',
    curbWeightTons: 7.5,
    engineSpecs: {
      model: 'Hyundai Powertech 12.7L Turbo Diesel',
      horsepower: 540,
      torqueLbFt: 1918,
      transmission: 'ZF TraXon 12-Speed Automated'
    },
    sleeperCabType: 'Wide High-Roof Sleeper Suite',
    price: 142000,
    horsepower: 540,
    maxFuelLitres: 700,
    fuelEfficiencyMpg: 9.0,
    durabilityRating: 92,
    imageIcon: '🚛',
    imageUrl: '/trucks/Hyundai.png',
    description: 'Modern South Korean flagship tractor. Aerodynamic European-styled cab with premium digital driver cockpit, smart cruise control, and heavy payload capacity.',
    topSpeedMph: 80
  },

  // ==================== ELECTRIC TRUCKS ====================
  {
    name: 'Tesla Semi (Megawatt EV)',
    brand: 'Tesla Motors',
    region: 'Electric EV',
    modelClass: 'Class 8 Highway',
    curbWeightTons: 7.5,
    engineSpecs: {
      model: 'Tri-Motor Carbon-Sleeved Electric Rotor',
      horsepower: 1020,
      torqueLbFt: 2500,
      transmission: 'Direct-Drive Single Speed Reduction'
    },
    sleeperCabType: 'Center-Seat Panoramic Tech Cabin',
    price: 275000,
    horsepower: 1020,
    maxFuelLitres: 900,
    fuelEfficiencyMpg: 24.0,
    durabilityRating: 96,
    imageIcon: '⚡',
    imageUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&auto=format&fit=crop&q=80',
    description: 'Revolutionary tri-motor electric long-hauler. Center-seat driving position, 0-60 in 20s with full 82,000 lb load, and 1,000 kW Megawatt charging capability.',
    topSpeedMph: 75,
    unlockRequirement: { companyLevel: 3, description: 'Requires Company Tier 3' }
  },
  {
    name: 'Mercedes-Benz eActros 600',
    brand: 'Mercedes-Benz',
    region: 'Electric EV',
    modelClass: 'Class 8 Highway',
    curbWeightTons: 7.8,
    engineSpecs: {
      model: 'Dual Electric Motor 800V e-Axle',
      horsepower: 816,
      torqueLbFt: 2100,
      transmission: 'Integrated 4-Speed e-Axle'
    },
    sleeperCabType: 'ProCabin Aerodynamic Sleeper',
    price: 340000,
    horsepower: 816,
    maxFuelLitres: 850,
    fuelEfficiencyMpg: 22.0,
    durabilityRating: 97,
    imageIcon: '⚡',
    imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80',
    description: 'Next-generation 600 kWh Lithium Iron Phosphate long-distance electric tractor. Capable of driving 500 km between charges without intermediate recharging.',
    topSpeedMph: 70,
    unlockRequirement: { companyLevel: 4, description: 'Requires Company Tier 4' }
  },
  {
    name: 'Volvo FH Electric Globetrotter',
    brand: 'Volvo Trucks',
    region: 'Electric EV',
    modelClass: 'Class 8 Highway',
    curbWeightTons: 7.5,
    engineSpecs: {
      model: 'Tri-Electric Motor Powertrain',
      horsepower: 666,
      torqueLbFt: 1770,
      transmission: 'Volvo I-Shift Automated 12-Speed'
    },
    sleeperCabType: 'Globetrotter Silent Sleeper',
    price: 310000,
    horsepower: 666,
    maxFuelLitres: 800,
    fuelEfficiencyMpg: 21.0,
    durabilityRating: 98,
    imageIcon: '⚡',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80',
    description: 'Zero exhaust emissions with whisper-quiet cabin operation. 540 kWh battery array delivering 300 km regional duty range with proven Volvo I-Shift transmission.',
    topSpeedMph: 70,
    unlockRequirement: { companyLevel: 5, description: 'Requires Company Tier 5' }
  }
];
