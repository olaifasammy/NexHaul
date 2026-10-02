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
    totalPenaltiesPaid: 0,
    regionalHubs: {
      'America': { region: 'America', hubName: 'Dallas Central Logistics HQ', cityName: 'Dallas, TX', cost: 0, levelRequirement: 1, isUnlocked: true, description: 'Primary North American headquarters and dispatch center.' },
      'Europe': { region: 'Europe', hubName: 'Rotterdam EuroPort Terminal', cityName: 'Rotterdam, NL', cost: 250000, levelRequirement: 3, isUnlocked: false, description: 'European continental freight hub and COE fleet terminal.' },
      'Africa': { region: 'Africa', hubName: 'Cairo Trans-African Gateway', cityName: 'Cairo, EG', cost: 300000, levelRequirement: 4, isUnlocked: false, description: 'North & Sub-Saharan trade corridor operations hub.' },
      'Asia': { region: 'Asia', hubName: 'Singapore Maritime & Express Hub', cityName: 'Singapore', cost: 400000, levelRequirement: 5, isUnlocked: false, description: 'East Asian expressway and high-density corridor terminal.' },
      'Electric EV': { region: 'Electric EV', hubName: 'Silicon Valley Megawatt Depot', cityName: 'San Jose, CA', cost: 150000, levelRequirement: 2, isUnlocked: false, description: 'Dedicated zero-emission megacharging and electric EV fleet depot.' }
    },
    hubs: [
      { id: 'hub-america-hq', name: 'Dallas Central Logistics HQ', region: 'America', cityName: 'Dallas, TX', isHq: true, isUnlocked: true, cost: 0, levelRequirement: 1, description: 'Primary North American headquarters and regional command center.' },
      { id: 'hub-america-chi', name: 'Chicago Freight Gateway', region: 'America', cityName: 'Chicago, IL', isHq: false, isUnlocked: false, cost: 100000, levelRequirement: 2, description: 'Midwest distribution hub expanding interstate hauling capacity.' },
      { id: 'hub-america-lax', name: 'Los Angeles Pacific Terminal', region: 'America', cityName: 'Los Angeles, CA', isHq: false, isUnlocked: false, cost: 120000, levelRequirement: 3, description: 'West coast container freight and port access terminal.' },
      { id: 'hub-europe-hq', name: 'Rotterdam EuroPort HQ', region: 'Europe', cityName: 'Rotterdam, NL', isHq: true, isUnlocked: false, cost: 250000, levelRequirement: 3, description: 'European continental freight headquarters and COE fleet terminal.' },
      { id: 'hub-europe-fra', name: 'Frankfurt Interstate Depot', region: 'Europe', cityName: 'Frankfurt, DE', isHq: false, isUnlocked: false, cost: 180000, levelRequirement: 4, description: 'Central European corridor hub for high-speed freight delivery.' },
      { id: 'hub-africa-hq', name: 'Cairo Trans-African Gateway HQ', region: 'Africa', cityName: 'Cairo, EG', isHq: true, isUnlocked: false, cost: 300000, levelRequirement: 4, description: 'North & Sub-Saharan trade corridor operations headquarters.' },
      { id: 'hub-asia-hq', name: 'Singapore Maritime & Express HQ', region: 'Asia', cityName: 'Singapore', isHq: true, isUnlocked: false, cost: 400000, levelRequirement: 5, description: 'East Asian expressway and high-density corridor headquarters.' },
      { id: 'hub-ev-hq', name: 'Silicon Valley Megawatt Depot HQ', region: 'Electric EV', cityName: 'San Jose, CA', isHq: true, isUnlocked: false, cost: 150000, levelRequirement: 2, description: 'Dedicated zero-emission megacharging and electric EV fleet headquarters.' }
    ],
    activeHubId: 'hub-america-hq',
    cryptoMarket: {
      assets: {
        BTC: { symbol: 'BTC', name: 'Bitcoin', price: 65430.00, basePrice: 64000.00, change24h: 3.4, high24h: 66800.00, low24h: 63100.00, volume24h: 28450120, priceHistory: [63500, 63800, 64200, 64800, 65100, 65430], trend: 'rising', description: 'The decentralized digital gold standard of global finance.' },
        ETH: { symbol: 'ETH', name: 'Ethereum', price: 3480.00, basePrice: 3400.00, change24h: 5.1, high24h: 3550.00, low24h: 3310.00, volume24h: 14120400, priceHistory: [3320, 3360, 3410, 3450, 3480], trend: 'rising', description: 'Smart contract platform powering decentralized logistics networks.' },
        TRCK: { symbol: 'TRCK', name: 'TruckCoin', price: 1.45, basePrice: 1.20, change24h: 18.4, high24h: 1.52, low24h: 1.18, volume24h: 5240000, priceHistory: [1.20, 1.25, 1.32, 1.40, 1.45], trend: 'rising', description: 'Native utility token for automated fleet smart contracts and autonomous corridor tolling.' },
        HAUL: { symbol: 'HAUL', name: 'HaulerDAO', price: 14.20, basePrice: 13.50, change24h: -1.2, high24h: 15.10, low24h: 13.80, volume24h: 3150000, priceHistory: [14.80, 14.60, 14.30, 14.10, 14.20], trend: 'falling', description: 'Governance and liquidity staking token for interstate freight syndicates.' },
        SOL: { symbol: 'SOL', name: 'Solana', price: 192.50, basePrice: 180.00, change24h: 8.7, high24h: 198.00, low24h: 179.00, volume24h: 12890000, priceHistory: [178, 181, 185, 189, 192.5], trend: 'rising', description: 'High-throughput ultra-low-latency blockchain for instant GPS freight escrow.' },
        BDSL: { symbol: 'BDSL', name: 'BitDiesel', price: 2.85, basePrice: 2.60, change24h: 4.2, high24h: 2.95, low24h: 2.72, volume24h: 1940000, priceHistory: [2.65, 2.70, 2.78, 2.82, 2.85], trend: 'rising', description: 'Synthetic commodity token pegged to global bulk diesel refinery futures.' },
        USDT: { symbol: 'USDT', name: 'Tether USD', price: 1.00, basePrice: 1.00, change24h: 0.0, high24h: 1.01, low24h: 0.99, volume24h: 45000000, priceHistory: [1.00, 1.00, 1.00, 1.00, 1.00], trend: 'stable', description: 'USD-pegged stablecoin for rapid liquidity positioning.' },
        DOGE: { symbol: 'DOGE', name: 'Dogecoin', price: 0.18, basePrice: 0.15, change24h: 14.2, high24h: 0.19, low24h: 0.14, volume24h: 8900000, priceHistory: [0.15, 0.16, 0.17, 0.175, 0.18], trend: 'rising', description: 'The ultimate meme currency accepted by select truck stops.' },
        AVAX: { symbol: 'AVAX', name: 'Avalanche', price: 32.40, basePrice: 30.00, change24h: 6.8, high24h: 33.50, low24h: 29.80, volume24h: 4120000, priceHistory: [29.5, 30.2, 31.0, 31.8, 32.4], trend: 'rising', description: 'Subnet blockchain architecture for regional supply chain tracking.' },
        LINK: { symbol: 'LINK', name: 'Chainlink', price: 18.20, basePrice: 17.50, change24h: 2.4, high24h: 18.90, low24h: 17.20, volume24h: 2850000, priceHistory: [17.4, 17.7, 17.9, 18.0, 18.2], trend: 'rising', description: 'Decentralized oracle network feeding real-time highway IoT sensor data.' },
        RENDER: { symbol: 'RENDER', name: 'Render Network', price: 8.45, basePrice: 7.80, change24h: 9.1, high24h: 8.80, low24h: 7.60, volume24h: 3400000, priceHistory: [7.7, 7.9, 8.1, 8.3, 8.45], trend: 'rising', description: 'GPU compute power network powering autonomous self-driving truck AI.' },
        XRP: { symbol: 'XRP', name: 'Ripple', price: 0.58, basePrice: 0.55, change24h: 1.5, high24h: 0.60, low24h: 0.54, volume24h: 6100000, priceHistory: [0.55, 0.56, 0.57, 0.575, 0.58], trend: 'stable', description: 'Institutional cross-border settlement rails for international freight.' },
        POL: { symbol: 'POL', name: 'Polygon', price: 0.72, basePrice: 0.65, change24h: 4.5, high24h: 0.75, low24h: 0.64, volume24h: 4800000, priceHistory: [0.66, 0.68, 0.70, 0.71, 0.72], trend: 'rising', description: 'Layer-2 scaling network for instant zero-fee corridor toll micro-payments.' },
        SUI: { symbol: 'SUI', name: 'Sui Network', price: 2.10, basePrice: 1.90, change24h: 12.8, high24h: 2.20, low24h: 1.85, volume24h: 7200000, priceHistory: [1.92, 1.98, 2.04, 2.08, 2.10], trend: 'rising', description: 'High-performance parallel execution chain for autonomous freight routing.' },
        SHIB: { symbol: 'SHIB', name: 'ShibaHauler', price: 0.000028, basePrice: 0.000025, change24h: 7.4, high24h: 0.000030, low24h: 0.000024, volume24h: 9500000, priceHistory: [0.000025, 0.000026, 0.000027, 0.0000275, 0.000028], trend: 'rising', description: 'Community meme token adopted by independent cross-country owner-operators.' },
        BNB: { symbol: 'BNB', name: 'Binance Coin', price: 610.00, basePrice: 590.00, change24h: 2.1, high24h: 625.00, low24h: 585.00, volume24h: 15400000, priceHistory: [592, 598, 604, 608, 610], trend: 'rising', description: 'Global utility token for decentralized fuel station and depot settlement.' }
      },
      holdings: {},
      tradeHistory: [],
      newsFeed: [
        { id: 'news-1', timestamp: Date.now() - 3600000, headline: 'Whale wallet accumulates 50,000 TruckCoin ($TRCK) on decentralized exchange.', impactSymbol: 'TRCK', impactPercent: 8.5, source: 'CryptoLogistics Wire' },
        { id: 'news-2', timestamp: Date.now() - 7200000, headline: 'Global refinery bottleneck spikes synthetic BitDiesel ($BDSL) token futures.', impactSymbol: 'BDSL', impactPercent: 4.2, source: 'Terminal Alpha' }
      ]
    }
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

      const defaultCryptoAssets = getInitialGameState().cryptoMarket.assets;
      if (!parsed.cryptoMarket) {
        parsed.cryptoMarket = getInitialGameState().cryptoMarket;
      } else {
        if (!parsed.cryptoMarket.assets) parsed.cryptoMarket.assets = {};
        for (const [sym, ast] of Object.entries(defaultCryptoAssets)) {
          if (!parsed.cryptoMarket.assets[sym]) {
            parsed.cryptoMarket.assets[sym] = ast;
          }
        }
        if (!parsed.cryptoMarket.holdings) parsed.cryptoMarket.holdings = {};
        if (!parsed.cryptoMarket.tradeHistory) parsed.cryptoMarket.tradeHistory = [];
        if (!parsed.cryptoMarket.newsFeed) parsed.cryptoMarket.newsFeed = [];
      }

      const defaultHubs = getInitialGameState().regionalHubs;
      if (!parsed.regionalHubs) {
        parsed.regionalHubs = defaultHubs;
      } else {
        for (const [reg, hubInfo] of Object.entries(defaultHubs)) {
          if (!parsed.regionalHubs[reg as TruckRegion]) {
            parsed.regionalHubs[reg as TruckRegion] = hubInfo;
          }
        }
      }

      const defaultHubsList = getInitialGameState().hubs;
      if (!parsed.hubs || !Array.isArray(parsed.hubs) || parsed.hubs.length === 0) {
        parsed.hubs = defaultHubsList;
      } else {
        defaultHubsList.forEach(defHub => {
          if (!parsed.hubs.some(h => h.id === defHub.id)) {
            parsed.hubs.push(defHub);
          }
        });
      }
      if (!parsed.activeHubId) parsed.activeHubId = 'hub-america-hq';

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
          if (!t.stationedHub) t.stationedHub = t.region || 'America';
          if (!t.hubId) {
            const matchingHub = (parsed.hubs || []).find(h => h.region === t.stationedHub && h.isHq);
            t.hubId = matchingHub ? matchingHub.id : 'hub-america-hq';
          }
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

      // Sanitize 1-to-1 Truck & Driver Assignments
      if (Array.isArray(parsed.trucks) && Array.isArray(parsed.drivers)) {
        const assignedDrivers = new Set<string>();
        parsed.trucks.forEach(t => {
          if (t && t.assignedDriverId) {
            if (assignedDrivers.has(t.assignedDriverId)) {
              t.assignedDriverId = null;
            } else {
              assignedDrivers.add(t.assignedDriverId);
            }
          }
        });

        const assignedTrucks = new Set<string>();
        parsed.drivers.forEach(d => {
          if (d && d.assignedTruckId) {
            if (assignedTrucks.has(d.assignedTruckId)) {
              d.assignedTruckId = null;
            } else {
              assignedTrucks.add(d.assignedTruckId);
            }
          }
        });

        parsed.trucks.forEach(t => {
          if (t && t.assignedDriverId) {
            const d = parsed.drivers.find(x => x && x.id === t.assignedDriverId);
            if (d) d.assignedTruckId = t.id;
            else t.assignedDriverId = null;
          }
        });
        parsed.drivers.forEach(d => {
          if (d && d.assignedTruckId) {
            const t = parsed.trucks.find(x => x && x.id === d.assignedTruckId);
            if (t) t.assignedDriverId = d.id;
            else d.assignedTruckId = null;
          }
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
