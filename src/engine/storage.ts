import type { GameSaveState } from '../types/game';
import { INITIAL_TRUCKS } from '../data/trucks';
import { INITIAL_TRAILERS } from '../data/trailers';
import { INITIAL_DRIVERS } from '../data/drivers';
import { INITIAL_AVAILABLE_CONTRACTS } from '../data/contracts';
import { INITIAL_DEPOT } from '../data/depots';

function getWeatherDuration(): number {
  const hours = 2 + Math.random() * 6;
  return hours * 3600;
}

const SAVE_KEY = 'TRUCK_EMPIRE_SIM_SAVE_V1';

export function getInitialGameState(): GameSaveState {
  return {
    version: 1,
    companyName: 'Apex Transport Co.',
    cash: 22000,
    companyLevel: 1,
    companyXp: 0,
    maxCompanyXp: 200,
    lastSavedTimestamp: Date.now(),
    bulkFuelReserveLitres: 2000,
    bulkFuelCapacityLitres: 20000,
    pendingFuelDeliveries: [],
    currentDieselMarketPrice: 2.50,
    wholesaleRackPrice: 2.05,
    dieselPriceTrend: 'stable',
    fuelPriceHistory: [2.48, 2.52, 2.49, 2.50],
    totalFuelCostSaved: 0,
    autoRefuelFromDepot: true,
    activeWeather: 'Clear Skies',
    weatherTimer: 0,
    weatherDuration: getWeatherDuration(),
    weatherForecast: ['Clear Skies', 'Heavy Rain', 'Dense Fog'],
    trucks: [],
    trailers: [],
    drivers: [],
    activeContracts: [],
    availableContracts: JSON.parse(JSON.stringify(INITIAL_AVAILABLE_CONTRACTS)),
    depot: { ...INITIAL_DEPOT },
    skills: {
      'eco-mastery': 0,
      'mechanic-precision': 0,
      'dispatcher-broker': 0,
      'driver-stamina': 0,
      'hazmat-permit': 0
    },
    unlockedRegions: ['America'],
    heavyHaulPermits: [],
    eventLogs: [
      {
        id: 'init-1',
        timestamp: Date.now(),
        title: 'Welcome to Truck Empire!',
        message: 'Your logistics enterprise is operational. Dispatch your first cargo route from the Freight Board!',
        type: 'info'
      }
    ],
    stats: {
      totalEarnings: 0,
      totalMilesDriven: 0,
      deliveriesCompleted: 0,
      fuelSpentGallons: 0,
      totalTollsPaid: 0,
      totalFinesPaid: 0,
      revenueHistory: [],
      expenseHistory: []
    },
    loans: [],
    investors: [
      {
        id: 'inv-1',
        title: 'Seed Angel Round',
        investorName: 'Horizon Logistics Ventures',
        capitalInjected: 50000,
        equityPercent: 12.0,
        monthlyDividendExpectation: 1200,
        unlockedAtCompanyLevel: 1,
        status: 'available'
      },
      {
        id: 'inv-2',
        title: 'Series A Growth Capital',
        investorName: 'Pacific Freight Partners',
        capitalInjected: 250000,
        equityPercent: 20.0,
        monthlyDividendExpectation: 6500,
        unlockedAtCompanyLevel: 3,
        status: 'available'
      },
      {
        id: 'inv-3',
        title: 'Institutional Equity Round',
        investorName: 'Global Highway Holdings',
        capitalInjected: 1000000,
        equityPercent: 25.0,
        monthlyDividendExpectation: 28000,
        unlockedAtCompanyLevel: 5,
        status: 'available'
      }
    ],
    shipperRetainers: [
      {
        id: 'retainer-1',
        shipperName: 'Midwest Logistics Corp',
        origin: 'Chicago Hub',
        destination: 'Detroit Logistics Park',
        cargoCategory: 'General Freight',
        weeklyPayout: 18500,
        requiredTrucksCount: 1,
        durationWeeksRemaining: 4,
        status: 'active'
      }
    ],
    ipo: {
      isPubliclyTraded: false,
      stockSymbol: 'APEX',
      sharePrice: 10.00,
      sharesOutstanding: 100000,
      publicFloatPercent: 30.0,
      marketCap: 1000000,
      priceHistory: [10.00],
      totalDividendsPaid: 0
    },
    staff: [],
    profile: {
      founderName: 'Alex Vance',
      foundedDate: 'January 2026',
      corporateStructure: 'LLC',
      creditScore: 720,
      creditRating: 'A',
      corporateTaxRate: 0.21,
      insuranceMonthlyPerTruck: 420,
      companyValuation: 150000,
      brandScore: 50,
      hqAddress: '1048 Logistics Parkway, Suite 500',
      hqCity: 'Dallas',
      hqState: 'TX',
      usdotNumber: 'USDOT 3948210',
      mcNumber: 'MC-894210-C',
      einTaxId: '84-9201482',
      missionStatement: 'Delivering nationwide commercial freight with uncompromising safety, efficiency, and premier reliability.',
      logoIcon: '🚚',
      registrationStatus: 'Good Standing'
    },
    commodityPrices: {
      'General Freight': { price: 100, basePrice: 100, trend: 'stable', priceHistory: [100, 100, 100] },
      'Perishable Foods': { price: 120, basePrice: 120, trend: 'stable', priceHistory: [120, 120, 120] },
      'Heavy Machinery': { price: 150, basePrice: 150, trend: 'stable', priceHistory: [150, 150, 150] },
      'Hazardous Chemicals': { price: 200, basePrice: 200, trend: 'stable', priceHistory: [200, 200, 200] },
      'High Value Tech': { price: 250, basePrice: 250, trend: 'stable', priceHistory: [250, 250, 250] },
    },
    financialHistory: [],
    gameHour: 8.0,
    gameDay: 1,
    gameMonth: 1,
    gameYear: 2026,
    isDaytime: true,
    accountingCycleSeconds: 0,
    accountingCycleCount: 0,
    totalSalariesPaid: 0,
    totalTaxesPaid: 0,
    totalLoanInterestPaid: 0,
    totalPenaltiesPaid: 0
  };
}

export function saveGameStateToStorage(state: GameSaveState): boolean {
  try {
    const toSave: GameSaveState = {
      ...state,
      lastSavedTimestamp: Date.now()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
    return true;
  } catch (err) {
    console.error('Failed to save game state:', err);
    return false;
  }
}

export function loadGameStateFromStorage(): GameSaveState | null {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (!data) return null;
    const parsed: GameSaveState = JSON.parse(data);

    // Sanitize driver & truck assignments and ensure default fallback fields
    if (parsed) {
      if (parsed.bulkFuelReserveLitres === undefined) parsed.bulkFuelReserveLitres = (parsed as any).bulkFuelReserveGallons || 9500;
      if (parsed.bulkFuelCapacityLitres === undefined) parsed.bulkFuelCapacityLitres = (parsed as any).bulkFuelCapacityGallons || 20000;
      if (!parsed.pendingFuelDeliveries) parsed.pendingFuelDeliveries = [];
      if (parsed.currentDieselMarketPrice === undefined) parsed.currentDieselMarketPrice = 2.50;
      if (parsed.wholesaleRackPrice === undefined) parsed.wholesaleRackPrice = 2.05;
      if (!parsed.dieselPriceTrend) parsed.dieselPriceTrend = 'stable';
      if (!Array.isArray(parsed.fuelPriceHistory) || parsed.fuelPriceHistory.length === 0) {
        parsed.fuelPriceHistory = [2.48, 2.52, 2.49, 2.50];
      }
      if (parsed.totalFuelCostSaved === undefined) parsed.totalFuelCostSaved = 0;
      if (parsed.autoRefuelFromDepot === undefined) parsed.autoRefuelFromDepot = true;
      if (!parsed.activeWeather) parsed.activeWeather = 'Clear Skies';
      if (parsed.weatherTimer === undefined) parsed.weatherTimer = 0;
      if (parsed.weatherDuration === undefined) parsed.weatherDuration = getWeatherDuration();
      if (!parsed.weatherForecast) parsed.weatherForecast = ['Clear Skies', 'Heavy Rain', 'Dense Fog'];
      if (!parsed.loans) parsed.loans = [];
      if (!parsed.investors) parsed.investors = [];
      if (!parsed.shipperRetainers) parsed.shipperRetainers = [];
      if (!parsed.ipo) {
        parsed.ipo = {
          isPubliclyTraded: false,
          stockSymbol: 'APEX',
          sharePrice: 10.00,
          sharesOutstanding: 100000,
          publicFloatPercent: 30.0,
          marketCap: 1000000,
          priceHistory: [10.00],
          totalDividendsPaid: 0
        };
      }
      if (!parsed.staff) parsed.staff = [];
      if (!parsed.commodityPrices) {
        parsed.commodityPrices = {
          'General Freight': { price: 100, basePrice: 100, trend: 'stable', priceHistory: [100, 100, 100] },
          'Perishable Foods': { price: 120, basePrice: 120, trend: 'stable', priceHistory: [120, 120, 120] },
          'Heavy Machinery': { price: 150, basePrice: 150, trend: 'stable', priceHistory: [150, 150, 150] },
          'Hazardous Chemicals': { price: 200, basePrice: 200, trend: 'stable', priceHistory: [200, 200, 200] },
          'High Value Tech': { price: 250, basePrice: 250, trend: 'stable', priceHistory: [250, 250, 250] },
        };
      }
      if (!parsed.profile) {
        parsed.profile = {
          founderName: 'Alex Vance',
          foundedDate: 'January 2026',
          corporateStructure: 'LLC',
          creditScore: 720,
          creditRating: 'A',
          corporateTaxRate: 0.21,
          insuranceMonthlyPerTruck: 420,
          companyValuation: 150000,
          hqAddress: '1048 Logistics Parkway, Suite 500',
          hqCity: 'Dallas',
          hqState: 'TX',
          usdotNumber: 'USDOT 3948210',
          mcNumber: 'MC-894210-C',
          einTaxId: '84-9201482',
          missionStatement: 'Delivering nationwide commercial freight with uncompromising safety, efficiency, and premier reliability.',
          logoIcon: '🚚',
          registrationStatus: 'Good Standing'
        };
      } else {
        if (parsed.profile.brandScore === undefined) parsed.profile.brandScore = 50;
        if (!parsed.profile.hqCity) parsed.profile.hqCity = 'Dallas';
        if (!parsed.profile.hqState) parsed.profile.hqState = 'TX';
        if (!parsed.profile.usdotNumber) parsed.profile.usdotNumber = 'USDOT 3948210';
        if (!parsed.profile.mcNumber) parsed.profile.mcNumber = 'MC-894210-C';
        if (!parsed.profile.einTaxId) parsed.profile.einTaxId = '84-9201482';
        if (!parsed.profile.missionStatement) parsed.profile.missionStatement = 'Delivering nationwide commercial freight with uncompromising safety, efficiency, and premier reliability.';
        if (!parsed.profile.logoIcon) parsed.profile.logoIcon = '🚚';
        if (!parsed.profile.registrationStatus) parsed.profile.registrationStatus = 'Good Standing';
      }
      if (!parsed.financialHistory) parsed.financialHistory = [];
      if (parsed.accountingCycleSeconds === undefined) parsed.accountingCycleSeconds = 0;
      if (parsed.accountingCycleCount === undefined) parsed.accountingCycleCount = 0;
      if (parsed.totalSalariesPaid === undefined) parsed.totalSalariesPaid = 0;
      if (parsed.totalTaxesPaid === undefined) parsed.totalTaxesPaid = 0;
      if (parsed.totalLoanInterestPaid === undefined) parsed.totalLoanInterestPaid = 0;
      if (parsed.totalPenaltiesPaid === undefined) parsed.totalPenaltiesPaid = 0;
      if (parsed.totalPenaltiesPaid === undefined) parsed.totalPenaltiesPaid = 0;
      if (!parsed.unlockedRegions) parsed.unlockedRegions = ['America'];
      if (!parsed.milestones) {
        parsed.milestones = [
          { id: 'mile-1', title: 'First Steps', description: 'Complete 1 delivery', type: 'earnings', target: 1, rewardCash: 1000, isClaimed: false },
          { id: 'mile-2', title: 'Fleet Expansion', description: 'Own at least 2 trucks', type: 'fleet', target: 2, rewardCash: 5000, isClaimed: false },
          { id: 'mile-3', title: 'Road Warrior', description: 'Drive a total of 1,000 miles', type: 'miles', target: 1000, rewardCash: 8000, isClaimed: false },
          { id: 'mile-4', title: 'Logistics Titan', description: 'Reach Company Level 5', type: 'level', target: 5, rewardCash: 20000, isClaimed: false }
        ];
      }

      if (parsed.stats.totalTollsPaid === undefined) parsed.stats.totalTollsPaid = 0;
      if (parsed.stats.totalFinesPaid === undefined) parsed.stats.totalFinesPaid = 0;
      if (!parsed.stats.revenueHistory) parsed.stats.revenueHistory = [];
      if (!parsed.stats.expenseHistory) parsed.stats.expenseHistory = [];

      const activeTruckIds = new Set((parsed.activeContracts || []).map(c => c.assignedTruckId).filter(Boolean));
      const activeContractIds = new Set((parsed.activeContracts || []).map(c => c.id).filter(Boolean));

      if (parsed.gameHour === undefined) parsed.gameHour = 8.0;
      if (parsed.gameDay === undefined) parsed.gameDay = 1;
      if (parsed.gameMonth === undefined) parsed.gameMonth = 1;
      if (parsed.gameYear === undefined) parsed.gameYear = 2026;
      if (parsed.isDaytime === undefined) parsed.isDaytime = true;
      if (parsed.weatherTimer === undefined) parsed.weatherTimer = 0;
      if (parsed.weatherDuration === undefined) parsed.weatherDuration = getWeatherDuration();

      if (Array.isArray(parsed.trucks)) {
        parsed.trucks.forEach(t => {
          if (!t) return;
          if (!t.currentCity) t.currentCity = 'HQ Depot';
          if (!t.status) t.status = 'idle';
          if (t.odometerMiles === undefined) t.odometerMiles = 0;
          if (t.hasInsurance === undefined) t.hasInsurance = true;
          if (!t.insuranceTier) t.insuranceTier = t.hasInsurance ? 'Standard Collision' : 'None';
        });
      }

      if (Array.isArray(parsed.trailers)) {
        parsed.trailers.forEach(t => {
          if (!t) return;
          if (t.type === 'Refrigerated') {
            if (t.currentFuelLitres === undefined) t.currentFuelLitres = 50;
            if (t.maxFuelLitres === undefined) t.maxFuelLitres = 150;
            if (t.currentTempF === undefined) t.currentTempF = 34;
            if (t.setPointTempF === undefined) t.setPointTempF = 34;
          }
          if (t.hasInsurance === undefined) t.hasInsurance = true;
          if (!t.insuranceTier) t.insuranceTier = t.hasInsurance ? 'Standard Collision' : 'None';
        });
      }

      if (Array.isArray(parsed.drivers)) {
        parsed.drivers.forEach(d => {
          if (!d) return;
          if (d.isResting === undefined) d.isResting = false;
          if (d.restSecondsRemaining === undefined) d.restSecondsRemaining = 0;
          if (!d.cdlClass) d.cdlClass = 'Class A CDL';
          if (d.experienceYears === undefined) d.experienceYears = 5;
          if (d.cleanRecordScore === undefined) d.cleanRecordScore = 100;
          if (d.moralePercent === undefined) d.moralePercent = 100;
          if (d.eldShiftHoursRemaining === undefined) d.eldShiftHoursRemaining = 11.0;
          if (d.assignedTruckId && !activeTruckIds.has(d.assignedTruckId)) {
            d.assignedTruckId = null;
          }
        });
      }

      if (Array.isArray(parsed.trucks)) {
        parsed.trucks.forEach(t => {
          if (!t) return;
          if (!t.brand) t.brand = 'Commercial Rig';
          if (!t.engineSpecs) {
            t.engineSpecs = {
              model: 'Commercial Turbo Diesel Engine',
              horsepower: t.horsepower || 350,
              torqueLbFt: (t.horsepower || 350) * 3,
              transmission: '10-Speed Heavy Duty'
            };
          }
          if (!t.sleeperCabType) t.sleeperCabType = 'Standard Sleeper Cab';
          if (!t.description) t.description = 'Commercial freight hauling tractor rig.';
          if (t.oilLifePercent === undefined) t.oilLifePercent = 100;
          if (t.tireTreadPercent === undefined) t.tireTreadPercent = 100;
          if (t.hasPrePass === undefined) t.hasPrePass = false;
          if (!t.vin) t.vin = '1HD948210ABCD7892';
          if (!t.licensePlate) t.licensePlate = 'TX-4829-TR';
          if (!t.axleConfig) t.axleConfig = t.modelClass === 'Class 3 Light' ? '4x2 Single' : '6x4 Tandem';
          if (!t.emissionsStandard) t.emissionsStandard = 'EPA 2024 / Euro 6';
          if (t.defLevelLitres === undefined) t.defLevelLitres = 90;
          if (t.maxDefLitres === undefined) t.maxDefLitres = 90;
          if (t.brakeWearPercent === undefined) t.brakeWearPercent = 100;
          if (t.batteryHealthPercent === undefined) t.batteryHealthPercent = 100;
          if (t.suspensionHealthPercent === undefined) t.suspensionHealthPercent = 100;
          if (t.assignedContractId && !activeContractIds.has(t.assignedContractId)) {
            t.assignedContractId = null;
            if (t.status === 'in_transit' || t.status === 'resting' || t.status === 'fueling') {
              t.status = 'idle';
            }
          }
        });
      }
    }

    return parsed;
  } catch (err) {
    console.error('Failed to load save state from storage:', err);
    return null;
  }
}

export function exportSaveToJSON(state: GameSaveState): string {
  return JSON.stringify(state, null, 2);
}

export function importSaveFromJSON(jsonString: string): GameSaveState | null {
  try {
    const parsed: GameSaveState = JSON.parse(jsonString);
    if (parsed && typeof parsed.cash === 'number' && Array.isArray(parsed.trucks)) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('Invalid save file format:', err);
    return null;
  }
}
