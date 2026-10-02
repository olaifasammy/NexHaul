import type { Trailer } from '../types/game';

export const INITIAL_TRAILERS: Trailer[] = [
  {
    id: 'trailer-starter-1',
    name: 'Great Dane Champion Box 28ft',
    manufacturer: 'Great Dane',
    type: 'Dry Van',
    tareWeightTons: 7.0,
    capacityTons: 14,
    price: 6500,
    conditionPercent: 100,
    hazmatCertified: false,
    assignedTruckId: 'truck-starter-1',
    imageIcon: '📦',
    imageUrl: '/trailers/GreatDane-trailer.png',
    description: 'Compact 28ft single-axle pup dry freight van. Ideal for city freight delivery, retail pallet transport, and starter logistics.'
  }
];

export const CATALOG_TRAILERS: Omit<Trailer, 'id' | 'assignedTruckId' | 'conditionPercent'>[] = [
  {
    name: 'Great Dane Everest 53ft Dry Van',
    manufacturer: 'Great Dane Trailers',
    type: 'Dry Van',
    capacityTons: 26,
    price: 18000,
    hazmatCertified: false,
    imageIcon: '📦',
    imageUrl: '/trailers/GreatDane-trailer.png',
    description: 'The North American standard 53ft composite-wall dry van. Engineered for high-volume palletized consumer freight and interstate warehouse transfers.'
  },
  {
    name: 'Wabash National ArcticLite Reefer 53ft',
    manufacturer: 'Wabash National',
    type: 'Refrigerated',
    tareWeightTons: 8.5,
    capacityTons: 24,
    price: 34000,
    hazmatCertified: false,
    imageIcon: '❄️',
    imageUrl: '/trailers/Articlite-trailer.png',
    description: 'Thermo King / Carrier multi-temp refrigeration unit. Thermal insulated composite floor and walls maintaining -20°F for fresh produce, meats, and pharmaceuticals.'
  },
  {
    name: 'Schmitz Cargobull S.CS Curtainside',
    manufacturer: 'Schmitz Cargobull',
    type: 'Dry Van',
    tareWeightTons: 7.0,
    capacityTons: 28,
    price: 24000,
    hazmatCertified: false,
    imageIcon: '🚛',
    imageUrl: '/trailers/Scnmitz-trailer.png',
    description: 'European sliding curtain-sider semi-trailer with sliding roof. Enables rapid forklift side-loading for industrial cargo and beverage logistics.'
  },
  {
    name: 'Fontaine Velocity Aluminum Flatbed 48ft',
    manufacturer: 'Fontaine Trailer',
    type: 'Flatbed',
    tareWeightTons: 5.5,
    capacityTons: 32,
    price: 26000,
    hazmatCertified: false,
    imageIcon: '🪵',
    imageUrl: '/trailers/Flatbed-trailer.png',
    description: 'High-strength aluminum/steel combo platform with integrated winch tracks. Designed for structural steel beams, timber, building materials, and machinery.'
  },
  {
    name: 'Polar Tank Aluminum Petroleum Tanker',
    manufacturer: 'Polar Tank Trailer',
    type: 'Fuel Tanker',
    tareWeightTons: 7.5,
    capacityTons: 28,
    price: 48000,
    hazmatCertified: true,
    imageIcon: '⛽',
    imageUrl: '/trailers/Tanker-trailer.png',
    description: 'Four-compartment DOT 406 aluminum liquid tanker with vapor recovery and bottom-loading manifold. Certified for jet fuel, diesel, and gasoline bulk hauling.'
  },
  {
    name: 'Goldhofer MPA 4-Axle Heavy Lowboy',
    manufacturer: 'Goldhofer Transport',
    type: 'Lowboy Heavy',
    tareWeightTons: 14.0,
    capacityTons: 58,
    price: 68000,
    hazmatCertified: false,
    imageIcon: '🏗️',
    imageUrl: '/trailers/Lowbody-trailer.png',
    description: 'German hydraulic gooseneck low-bed trailer with independent MacPherson axle suspension. Engineered to haul massive 50+ ton mining excavators and wind turbine blades.'
  },
  {
    name: 'Stoughton HazMat Chemical ISO Chassis',
    manufacturer: 'Stoughton Trailers',
    type: 'HazMat Container',
    tareWeightTons: 9.0,
    capacityTons: 35,
    price: 52000,
    hazmatCertified: true,
    imageIcon: '☣️',
    imageUrl: '/trailers/Bio-trailer.png',
    description: 'Reinforced stainless steel ISO tank container chassis with explosion-proof grounding and emergency shutoff valves. DOT Class 1-9 HazMat certified.'
  }
];
