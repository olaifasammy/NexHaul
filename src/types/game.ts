export type TruckClass = 'Class 3 Light' | 'Class 6 Medium' | 'Class 8 Highway' | 'Class 8 Heavy' | 'Super Hauler';
export type TruckRegion = 'America' | 'Europe' | 'Asia' | 'Africa' | 'Electric EV';

export interface TruckUpgrade {
  engineStage: number; // +horsepower, +speed
  fuelTankStage: number; // +capacity
  aeroStage: number; // -fuel consumption
  comfortStage: number; // -driver fatigue build-up
  gpsStage: number; // +route speed / reduces traffic delays
}

export interface EngineSpecs {
  model: string;
  horsepower: number;
  torqueLbFt: number;
  transmission: string;
}

export interface Truck {
  id: string;
  name: string;
  brand: string;
  region: TruckRegion;
  modelClass: TruckClass;
  engineSpecs: EngineSpecs;
  sleeperCabType: string;
  price: number;
  horsepower: number;
  curbWeightTons: number;
  maxFuelLitres: number;
  currentFuelLitres: number;
  fuelEfficiencyMpg: number;
  conditionPercent: number;
  oilLifePercent: number;
  tireTreadPercent: number;
  hasPrePass: boolean;
  durabilityRating: number;
  assignedDriverId: string | null;
  assignedTrailerId: string | null;
  assignedContractId: string | null;
  upgrades: TruckUpgrade;
  imageIcon: string;
  imageUrl: string;
  description: string;
  isComingSoon?: boolean;
  topSpeedMph?: number;

  // Realism States
  currentCity: string;
  status: 'idle' | 'in_transit' | 'deadheading' | 'resting' | 'fueling' | 'breakdown' | 'maintenance';
  odometerMiles: number;
  hasInsurance: boolean;
  predictiveAlertSent?: boolean;
  oilAlertSent?: boolean;
  tireAlertSent?: boolean;
  maintenanceSecondsRemaining?: number;
  scheduledMaintenanceAfterJob?: boolean;
  scheduledMaintenanceServices?: string[];
  scheduledUpgradeParts?: Array<'engineStage' | 'fuelTankStage' | 'aeroStage' | 'comfortStage' | 'gpsStage'>;

  // Full Truck Attributes & Telemetry
  vin: string;
  licensePlate: string;
  axleConfig: string;
  emissionsStandard: string;
  defLevelLitres: number;
  maxDefLitres: number;
  brakeWearPercent: number;
  batteryHealthPercent: number;
  suspensionHealthPercent: number;

  // Backward compatibility aliases
  maxFuelGallons?: number;
  currentFuelGallons?: number;
}

export type TrailerType = 'Dry Van' | 'Refrigerated' | 'Flatbed' | 'Fuel Tanker' | 'Lowboy Heavy' | 'HazMat Container';

export interface Trailer {
  id: string;
  name: string;
  manufacturer: string;
  type: TrailerType;
  capacityTons: number;
  tareWeightTons: number;
  price: number;
  conditionPercent: number;
  hazmatCertified: boolean;
  assignedTruckId: string | null;
  imageIcon: string;
  imageUrl: string;
  description: string;
  
  // Realism
  currentFuelLitres?: number; // For Reefers (Cooling unit)
  maxFuelLitres?: number;
  currentTempF?: number;      // For Refrigerated cargo temperature
  setPointTempF?: number;     // e.g. -5F or 34F
  hasInsurance: boolean;
}

export type DriverTrait = 
  | 'Eco-Driver'      // -15% fuel usage
  | 'Night Owl'        // +20% speed at night
  | 'Mechanic'         // -30% wear & tear
  | 'Speed Demon'      // +15% speed, +10% wear
  | 'HazMat Specialist'// +25% payout on HazMat routes
  | 'Veteran Hauler';  // +15% XP gain

export type CDLClassType = 'Class A CDL' | 'Class A + HazMat' | 'Class A + Tanker' | 'Class A + Oversized Heavy';

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  cdlClass: CDLClassType;
  experienceYears: number;
  cleanRecordScore: number; // 0 - 100%
  skillLevel: number;
  xp: number;
  maxXp: number;
  fatiguePercent: number; // 0 - 100
  moralePercent: number; // 0 - 100
  eldShiftHoursRemaining: number; // 0 - 11.0 hours
  dailySalary: number;
  traits: DriverTrait[];
  assignedTruckId: string | null;

  // Realism
  isResting: boolean;
  restSecondsRemaining: number;
}

export type CargoCategory = 'General Freight' | 'Perishable Foods' | 'Heavy Machinery' | 'Hazardous Chemicals' | 'High Value Tech';

export interface Contract {
  id: string;
  title: string;
  origin: string;
  destination: string;
  cargoCategory: CargoCategory;
  requiredTrailerType: TrailerType;
  distanceMiles: number;
  weightTons: number;
  payoutCash: number;
  payoutXp: number;
  timeLimitMinutes: number;
  dangerLevel: 1 | 2 | 3 | 4 | 5;
  region: TruckRegion;
  
  // Active dispatch state & Negotiation
  assignedTruckId?: string;
  assignedDriverId?: string;
  progressMiles?: number;
  elapsedSeconds?: number;
  startTime?: number;
  status: 'available' | 'in_progress' | 'completed' | 'failed';
  negotiationOffer?: number;
  negotiationStatus?: 'none' | 'pending' | 'accepted' | 'rejected' | 'countered';
  counterOfferPayout?: number;
  negotiationRound?: number;
  shipperPatience?: number; // 0 to 100
  shipperPersonality?: 'greedy' | 'fair' | 'urgent' | 'corporate';
  isUrgent?: boolean;
  expirySecondsRemaining?: number;
  expirySecondsTotal?: number;

  // Round Trip & Backhaul Logistics
  isRoundTrip?: boolean;
  returnLeg?: {
    destination: string;
    cargoCategory: CargoCategory;
    payoutCash: number;
    distanceMiles: number;
    requiredTrailerType: TrailerType;
  };
  isBackhaul?: boolean;
  backhaulDiscountPercent?: number;
}

export interface DepotUpgrade {
  repairBayLevel: number;
  fuelTerminalLevel: number;
  driverLoungeLevel: number;
  dispatchAILevel: number;
  warehouseLevel: number;
}

export interface PlayerSkill {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  costPoints: number;
  category: 'Driving' | 'Logistics' | 'Maintenance';
  icon: string;
}

export interface RoadEventLog {
  id: string;
  timestamp: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  cashChange?: number;
}

export interface OfflineProgressSummary {
  elapsedSeconds: number;
  completedContractsCount: number;
  totalCashEarned: number;
  totalXpEarned: number;
  totalMilesDriven: number;
  totalFuelConsumedGallons: number;
  events: RoadEventLog[];
}

export type WeatherType = 'Clear Skies' | 'Heavy Rain' | 'Blizzard Warning' | 'Dense Fog';

export interface BankLoan {
  id: string;
  title: string;
  lenderName: string;
  principalAmount: number;
  remainingBalance: number;
  interestRateAnnual: number; // e.g. 0.075 for 7.5% APR
  monthlyPayment: number;
  remainingMonths: number;
  totalMonths: number;
}

export interface InvestorRound {
  id: string;
  title: string;
  investorName: string;
  capitalInjected: number;
  equityPercent: number; // e.g. 15.0%
  monthlyDividendExpectation: number;
  unlockedAtCompanyLevel: number;
  status: 'available' | 'active' | 'completed';
}

export interface IPOMarketState {
  isPubliclyTraded: boolean;
  stockSymbol: string;
  sharePrice: number;
  sharesOutstanding: number;
  publicFloatPercent: number;
  marketCap: number;
  priceHistory: number[];
  totalDividendsPaid: number;
}

export type StaffRole = 'dispatcher' | 'accountant' | 'mechanic' | 'hr_manager' | 'safety_officer';

export interface OfficeStaff {
  id: string;
  name: string;
  role: StaffRole;
  salaryMonthly: number;
  skillRating: number; // 1 - 100
  avatar: string;
  efficiencyBonus: number; // percentage bonus
  hiredTimestamp: number;
}

export type CorporateStructureType = 'Sole Proprietorship' | 'LLC' | 'Corporation' | 'Publicly Traded (IPO)';

export interface CompanyProfile {
  founderName: string;
  foundedDate: string;
  corporateStructure: CorporateStructureType;
  creditScore: number; // 300 - 850
  creditRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'D';
  corporateTaxRate: number; // e.g. 0.21 (21%)
  insuranceMonthlyPerTruck: number;
  companyValuation: number;
  brandScore: number; // 0 - 100 customer reputation & brand score

  // Realistic legal & operational registration
  hqAddress: string;
  hqCity: string;
  hqState: string;
  usdotNumber: string;
  mcNumber: string;
  einTaxId: string;
  missionStatement: string;
  logoIcon: string;
  registrationStatus: 'Active & Compliant' | 'Audit Under Review' | 'Good Standing';
}

export interface CommodityInfo {
  price: number;
  basePrice: number;
  trend: 'rising' | 'falling' | 'stable';
  priceHistory: number[];
}

export interface FinancialStatementRecord {
  id: string;
  timestamp: number;
  periodLabel: string;
  revenue: number;
  fuelExpenses: number;
  maintenanceExpenses: number;
  driverSalaries: number;
  staffSalaries: number;
  insuranceExpenses: number;
  penaltyExpenses: number;
  loanInterest: number;
  taxesPaid: number;
  netProfit: number;
  cashEndPeriod: number;
}

export interface FuelDelivery {
  id: string;
  amountLitres: number;
  remainingSeconds: number;
  totalCost: number;
}

export interface ShipperRetainer {
  id: string;
  shipperName: string;
  origin: string;
  destination: string;
  cargoCategory: CargoCategory;
  weeklyPayout: number;
  requiredTrucksCount: number;
  durationWeeksRemaining: number;
  status: 'active' | 'completed' | 'expired';
}

export interface GameSaveState {
  version: number;
  companyName: string;
  cash: number;
  companyLevel: number;
  companyXp: number;
  maxCompanyXp: number;
  lastSavedTimestamp: number;
  
  // Fuel Management & Bulk Storage (in Litres)
  bulkFuelReserveLitres: number; // Litres in storage
  bulkFuelCapacityLitres: number; // Total Litres capacity
  pendingFuelDeliveries: FuelDelivery[]; // Logistics queue
  currentDieselMarketPrice: number; // Spot retail price per Litre ($1.45/L)
  wholesaleRackPrice: number; // Wholesale bulk price per Litre ($1.18/L)
  dieselPriceTrend: 'rising' | 'falling' | 'stable';
  fuelPriceHistory: number[];
  totalFuelCostSaved: number;
  autoRefuelFromDepot: boolean;

  // Realistic Finance, Loans, Investors, IPO, Staff & Profile
  loans: BankLoan[];
  investors: InvestorRound[];
  shipperRetainers: ShipperRetainer[];
  ipo: IPOMarketState;
  staff: OfficeStaff[];
  profile: CompanyProfile;
  commodityPrices: Record<CargoCategory, CommodityInfo>;
  financialHistory: FinancialStatementRecord[];

  // Global Time & Calendar
  gameHour: number; // 0.0 to 24.0
  gameDay: number; // 1 to 30
  gameMonth: number; // 1 to 12
  gameYear: number; // e.g. 2026
  isDaytime: boolean;

  // Periodic Accounting Cycle Simulation
  accountingCycleSeconds: number;
  accountingCycleCount: number;
  totalSalariesPaid: number;
  totalTaxesPaid: number;
  totalLoanInterestPaid: number;
  totalPenaltiesPaid: number;

  activeWeather: WeatherType;
  weatherTimer?: number;     // Seconds elapsed in current weather
  weatherDuration?: number;  // Total seconds for current weather period
  weatherForecast: WeatherType[];

  trucks: Truck[];
  trailers: Trailer[];
  drivers: Driver[];
  activeContracts: Contract[];
  availableContracts: Contract[];
  depot: DepotUpgrade;
  skills: Record<string, number>;
  unlockedRegions: TruckRegion[];
  // Regional heavy-haul authorizations. These allow permitted gross-weight exceptions
  // but never override the truck or trailer's physical payload capacity.
  heavyHaulPermits: TruckRegion[];
  milestones: Milestone[];
  eventLogs: RoadEventLog[];
  stats: {
    totalEarnings: number;
    totalMilesDriven: number;
    deliveriesCompleted: number;
    fuelSpentGallons: number; // Total Litres spent
    totalTollsPaid: number;
    totalFinesPaid: number;
    revenueHistory: number[];
    expenseHistory: number[];
  };
}
