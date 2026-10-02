import React, { useMemo, useState } from 'react';
import type { GameSaveState } from '../types/game';
import { CATALOG_TRUCKS } from '../data/trucks';
import { CATALOG_TRAILERS } from '../data/trailers';

import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Coins,
  Fuel,
  Globe2,
  Heart,
  Landmark,
  Package,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Store,
  TrendingDown,
  TrendingUp,
  Truck,
  Wallet,
  X,
  Zap,
} from 'lucide-react';

interface MarketHubProps {
  state: GameSaveState;
  onBuyTruck: (
    truckModel: typeof CATALOG_TRUCKS[0],
    customName?: string
  ) => void;
  onBuyTrailer: (
    trailerModel: typeof CATALOG_TRAILERS[0]
  ) => void;
  onBuyCrypto: (symbol: string, usdAmount: number) => void;
  onSellCrypto: (symbol: string, coinAmount: number) => void;
}

type MarketTab =
  | 'overview'
  | 'dealership'
  | 'crypto'
  | 'commodities';

type DealershipMode = 'trucks' | 'trailers';

type Region =
  | 'All'
  | 'America'
  | 'Europe'
  | 'Asia'
  | 'Electric EV';

const formatMoney = (value: number) =>
  `$${value.toLocaleString('en-US')}`;

const formatCompactMoney = (value: number) => {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `$${Math.round(value / 1_000)}K`;
  }

  return `$${value.toLocaleString('en-US')}`;
};

const regionFlag = (region: string) => {
  switch (region) {
    case 'America':
      return '🇺🇸';
    case 'Europe':
      return '🇪🇺';
    case 'Asia':
      return '🌏';
    case 'Electric EV':
      return '⚡';
    default:
      return '🌐';
  }
};

const getTrailerImage = (trailer: any) =>
  trailer.imageUrl ||
  trailer.image ||
  trailer.thumbnail ||
  undefined;

const getTruckImage = (truck: any) =>
  truck.imageUrl ||
  truck.image ||
  truck.thumbnail ||
  undefined;

export const MarketHub: React.FC<MarketHubProps> = ({
  state,
  onBuyTruck,
  onBuyTrailer,
  onBuyCrypto,
  onSellCrypto,
}) => {
  const [activeTab, setActiveTab] =
    useState<MarketTab>('overview');

  const [dealershipMode, setDealershipMode] =
    useState<DealershipMode>('trucks');

  const [regionFilter, setRegionFilter] =
    useState<Region>('All');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [favorites, setFavorites] =
    useState<string[]>([]);

  const [showFilters, setShowFilters] =
    useState(false);

  // Crypto tab local state
  const [selectedCryptoSymbol, setSelectedCryptoSymbol] = useState<string>('BTC');
  const [cryptoTradeType, setCryptoTradeType] = useState<'buy' | 'sell'>('buy');
  const [cryptoTradeInput, setCryptoTradeInput] = useState<string>('');
  const [hoveredPoint, setHoveredPoint] = useState<{ val: number; index: number } | null>(null);

  const toggleFavorite = (id: string) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const filteredTrucks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return CATALOG_TRUCKS.filter((truck: any) => {
      const matchesRegion =
        regionFilter === 'All' ||
        truck.region === regionFilter;

      const matchesSearch =
        !query ||
        truck.name?.toLowerCase().includes(query) ||
        truck.brand?.toLowerCase().includes(query) ||
        truck.modelClass?.toLowerCase().includes(query);

      return matchesRegion && matchesSearch;
    });
  }, [regionFilter, searchQuery]);

  const filteredTrailers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return CATALOG_TRAILERS.filter((trailer: any) => {
      const matchesSearch =
        !query ||
        trailer.name?.toLowerCase().includes(query) ||
        trailer.manufacturer?.toLowerCase().includes(query) ||
        trailer.type?.toLowerCase().includes(query);

      return matchesSearch;
    });
  }, [searchQuery]);

  const switchTab = (tab: MarketTab) => {
    setActiveTab(tab);

    if (tab === 'dealership') {
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-full bg-[#070b12] text-white">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-5 lg:px-7">

        {/* =========================================================
            HEADER
        ========================================================= */}
        <header className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0b111b] shadow-2xl">

          {/* subtle background glow */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-500/[0.05] blur-3xl" />

          <div className="relative flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
                <Globe2 className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black tracking-tight sm:text-lg">
                    GLOBAL LOGISTICS
                    <span className="text-blue-400"> EXCHANGE</span>
                  </h1>

                  <span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-400 sm:inline-flex">
                    Live Market
                  </span>
                </div>

                <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">
                  Commercial assets • Trade • Finance • Logistics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">

              {/* cash */}
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2">
                <Wallet className="h-4 w-4 text-emerald-400" />

                <div>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
                    Available Cash
                  </p>
                  <p className="font-mono text-xs font-black text-white sm:text-sm">
                    {formatMoney(state.cash)}
                  </p>
                </div>
              </div>

              {/* market status */}
              <div className="hidden items-center gap-2 rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2 sm:flex">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>

                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                  Market Open
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* =========================================================
            PRIMARY NAVIGATION
        ========================================================= */}
        <div className="sticky top-2 z-30 mt-3">
          <div className="grid grid-cols-4 gap-1 rounded-2xl border border-white/[0.07] bg-[#0b111b]/95 p-1.5 shadow-xl backdrop-blur-xl">

            <MarketNavButton
              active={activeTab === 'overview'}
              icon={<Store />}
              label="Overview"
              onClick={() => switchTab('overview')}
            />

            <MarketNavButton
              active={activeTab === 'dealership'}
              icon={<Truck />}
              label="Dealership"
              onClick={() => switchTab('dealership')}
            />

            <MarketNavButton
              active={activeTab === 'crypto'}
              icon={<Coins />}
              label="Crypto"
              onClick={() => switchTab('crypto')}
            />

            <MarketNavButton
              active={activeTab === 'commodities'}
              icon={<BarChart3 />}
              label="Futures"
              onClick={() => switchTab('commodities')}
            />

          </div>
        </div>

        {/* =========================================================
            OVERVIEW
        ========================================================= */}
        {activeTab === 'overview' && (
          <div className="mt-4 space-y-4">

            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl border border-blue-400/10 bg-gradient-to-br from-[#0d1726] via-[#0a111c] to-[#080c13] p-5 sm:p-7">

              <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(37,99,235,.16),transparent_65%)]" />

              <div className="relative max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-blue-300">
                  <Sparkles className="h-3 w-3" />
                  Global marketplace
                </div>

                <h2 className="max-w-xl text-2xl font-black leading-tight tracking-tight sm:text-4xl">
                  Everything your
                  <span className="text-blue-400"> fleet </span>
                  needs.
                </h2>

                <p className="mt-3 max-w-lg text-xs leading-relaxed text-slate-400 sm:text-sm">
                  Buy commercial trucks, trailers and fleet equipment
                  through the global logistics exchange.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() => switchTab('dealership')}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 active:scale-[.98]"
                  >
                    Browse Inventory
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => switchTab('commodities')}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-white/[0.07]"
                  >
                    Market Data
                    <BarChart3 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </section>

            {/* Market metrics */}
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">

              <MetricCard
                label="Fleet Assets"
                value={String(CATALOG_TRUCKS.length + CATALOG_TRAILERS.length)}
                icon={<Truck />}
                accent="blue"
              />

              <MetricCard
                label="Truck Inventory"
                value={String(CATALOG_TRUCKS.length)}
                icon={<Truck />}
                accent="cyan"
              />

              <MetricCard
                label="Trailer Inventory"
                value={String(CATALOG_TRAILERS.length)}
                icon={<Package />}
                accent="amber"
              />

              <MetricCard
                label="Your Cash"
                value={formatCompactMoney(state.cash)}
                icon={<Wallet />}
                accent="emerald"
              />

            </section>

            {/* Marketplace categories */}
            <section className="grid gap-3 md:grid-cols-3">

              <CategoryCard
                title="Asset Dealership"
                description="Trucks & trailers"
                icon={<Truck />}
                accent="blue"
                onClick={() => switchTab('dealership')}
              />

              <CategoryCard
                title="Digital Assets"
                description="Crypto exchange"
                icon={<Coins />}
                accent="amber"
                onClick={() => switchTab('crypto')}
              />

              <CategoryCard
                title="Commodity Futures"
                description="Logistics market data"
                icon={<TrendingUp />}
                accent="purple"
                onClick={() => switchTab('commodities')}
              />

            </section>

            {/* Market status */}
            <section className="rounded-2xl border border-white/[0.06] bg-[#0b111b] p-4">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
                    <Landmark className="h-5 w-5 text-slate-400" />
                  </div>

                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                      Global Trade Indices
                    </h3>

                    <p className="mt-1 text-[10px] text-slate-500">
                      Logistics equipment exchange status
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MarketTicker
                    name="LOGI"
                    value="+12.8%"
                    positive
                  />

                  <MarketTicker
                    name="FUEL"
                    value="-2.4%"
                    positive={false}
                  />

                  <div className="hidden h-8 w-px bg-white/[0.06] sm:block" />

                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    ONLINE
                  </div>
                </div>

              </div>
            </section>

          </div>
        )}

        {/* =========================================================
            DEALERSHIP
        ========================================================= */}
        {activeTab === 'dealership' && (
          <div className="mt-4 space-y-4">

            {/* Dealership heading */}
            <section className="rounded-3xl border border-white/[0.06] bg-[#0b111b] p-4 sm:p-5">

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
                      <Truck className="h-4 w-4 text-blue-400" />
                    </div>

                    <div>
                      <h2 className="text-lg font-black tracking-tight">
                        Asset Dealership
                      </h2>

                      <p className="text-[10px] text-slate-500">
                        Commercial vehicles & specialized equipment
                      </p>
                    </div>
                  </div>
                </div>

                {/* trucks / trailers */}
                <div className="flex rounded-xl border border-white/[0.06] bg-black/20 p-1">
                  <ToggleButton
                    active={dealershipMode === 'trucks'}
                    icon={<Truck />}
                    label="Trucks"
                    onClick={() => {
                      setDealershipMode('trucks');
                      setSearchQuery('');
                    }}
                  />

                  <ToggleButton
                    active={dealershipMode === 'trailers'}
                    icon={<Package />}
                    label="Trailers"
                    onClick={() => {
                      setDealershipMode('trailers');
                      setSearchQuery('');
                    }}
                  />
                </div>

              </div>

              {/* Search */}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">

                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      dealershipMode === 'trucks'
                        ? 'Search trucks, brands or classes...'
                        : 'Search trailers or manufacturers...'
                    }
                    className="h-10 w-full rounded-xl border border-white/[0.07] bg-[#070b12] pl-10 pr-9 text-xs text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                  />

                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowFilters((value) => !value)}
                  className={`flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-bold transition ${
                    showFilters
                      ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
                      : 'border-white/[0.07] bg-[#070b12] text-slate-400 hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                </button>

              </div>

              {/* Truck filters */}
              {dealershipMode === 'trucks' && (
                <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {(
                    [
                      'All',
                      'America',
                      'Europe',
                      'Asia',
                      'Electric EV',
                    ] as Region[]
                  ).map((region) => (
                    <button
                      key={region}
                      onClick={() => setRegionFilter(region)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-bold transition ${
                        regionFilter === region
                          ? 'border-blue-500/50 bg-blue-500 text-white'
                          : 'border-white/[0.06] bg-[#070b12] text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <span>{regionFlag(region)}</span>
                      {region}
                    </button>
                  ))}
                </div>
              )}

            </section>

            {/* Inventory */}
            {dealershipMode === 'trucks' ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                {filteredTrucks.map((truckModel: any, idx) => {
                  const canAfford =
                    state.cash >= truckModel.price;

                  const id = `truck-${idx}-${truckModel.name}`;

                  return (
                    <TruckCard
                      key={id}
                      truck={truckModel}
                      canAfford={canAfford}
                      favorite={favorites.includes(id)}
                      onFavorite={() => toggleFavorite(id)}
                      onBuy={() => onBuyTruck(truckModel)}
                    />
                  );
                })}

              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                {filteredTrailers.map((trailerModel: any, idx) => {
                  const canAfford =
                    state.cash >= trailerModel.price;

                  const id = `trailer-${idx}-${trailerModel.name}`;

                  return (
                    <TrailerCard
                      key={id}
                      trailer={trailerModel}
                      canAfford={canAfford}
                      favorite={favorites.includes(id)}
                      onFavorite={() => toggleFavorite(id)}
                      onBuy={() =>
                        onBuyTrailer(trailerModel)
                      }
                    />
                  );
                })}

              </div>
            )}

            {/* Empty state */}
            {(
              dealershipMode === 'trucks'
                ? filteredTrucks.length === 0
                : filteredTrailers.length === 0
            ) && (
              <div className="rounded-2xl border border-dashed border-white/[0.08] bg-[#0b111b] py-16 text-center">
                <Search className="mx-auto h-8 w-8 text-slate-700" />

                <h3 className="mt-3 text-sm font-bold text-slate-300">
                  No inventory found
                </h3>

                <p className="mt-1 text-xs text-slate-600">
                  Try another search or remove your filters.
                </p>
              </div>
            )}

          </div>
        )}

        {/* =========================================================
            CRYPTO
        ========================================================= */}
        {activeTab === 'crypto' && (() => {
          const cryptoMarket = state.cryptoMarket || { assets: {}, holdings: {}, tradeHistory: [], newsFeed: [] };
          const assets = cryptoMarket.assets || {};
          const holdings = cryptoMarket.holdings || {};
          const activeAsset = assets[selectedCryptoSymbol] || Object.values(assets)[0] || {
            symbol: 'BTC',
            name: 'Bitcoin',
            price: 65000,
            basePrice: 64000,
            change24h: 3.4,
            high24h: 66000,
            low24h: 63000,
            volume24h: 10000000,
            priceHistory: [64000, 64500, 65000],
            trend: 'rising',
            description: 'Digital asset'
          };

          const activeHolding = holdings[activeAsset.symbol];
          const ownedAmount = activeHolding ? activeHolding.amount : 0;

          // Calculate Total Portfolio Value & P&L
          let totalPortfolioValue = 0;
          let totalPortfolioInvested = 0;
          Object.entries(holdings).forEach(([sym, h]) => {
            const ast = assets[sym];
            if (ast && h) {
              totalPortfolioValue += h.amount * ast.price;
              totalPortfolioInvested += h.totalInvested;
            }
          });
          const totalPortfolioPnL = totalPortfolioValue - totalPortfolioInvested;
          const totalPortfolioPnLPct = totalPortfolioInvested > 0 ? (totalPortfolioPnL / totalPortfolioInvested) * 100 : 0;

          const handleExecuteTrade = () => {
            const val = parseFloat(cryptoTradeInput);
            if (isNaN(val) || val <= 0) return;

            if (cryptoTradeType === 'buy') {
              if (state.cash < val) return;
              onBuyCrypto(activeAsset.symbol, val);
            } else {
              let coinAmountToSell = val;
              // If user entered a USD value instead of coin units, auto-convert USD to coins
              if (val > ownedAmount && val <= (ownedAmount * activeAsset.price)) {
                coinAmountToSell = val / activeAsset.price;
              }
              if (ownedAmount < coinAmountToSell) return;
              onSellCrypto(activeAsset.symbol, coinAmountToSell);
            }
            setCryptoTradeInput('');
          };

          const setQuickPercentage = (pct: number) => {
            if (cryptoTradeType === 'buy') {
              const targetUsd = (state.cash * pct);
              setCryptoTradeInput(targetUsd.toFixed(2));
            } else {
              const targetCoin = (ownedAmount * pct);
              setCryptoTradeInput(targetCoin.toFixed(6));
            }
          };

          return (
            <div className="mt-4 space-y-4">

              {/* Crypto Header Metrics */}
              <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard
                  label="Crypto Portfolio"
                  value={formatMoney(totalPortfolioValue)}
                  icon={<Coins />}
                  accent="amber"
                />
                <MetricCard
                  label="Unrealized P&L"
                  value={`${totalPortfolioPnL >= 0 ? '+' : ''}${formatMoney(totalPortfolioPnL)} (${totalPortfolioPnLPct.toFixed(1)}%)`}
                  icon={<TrendingUp />}
                  accent={totalPortfolioPnL >= 0 ? 'emerald' : 'amber'}
                />
                <MetricCard
                  label="Available Cash"
                  value={formatMoney(state.cash)}
                  icon={<Wallet />}
                  accent="emerald"
                />
                <MetricCard
                  label="24h Exchange Vol"
                  value={formatCompactMoney(Object.values(assets).reduce((acc: number, a: any) => acc + (a.volume24h || 0), 0))}
                  icon={<BarChart3 />}
                  accent="blue"
                />
              </section>

              {/* Top 24h Rise / Fall Ticker Bar */}
              {(() => {
                const list = Object.values(assets) as any[];
                if (list.length === 0) return null;
                const sorted = [...list].sort((a, b) => b.change24h - a.change24h);
                const topGainer = sorted[0];
                const topLoser = sorted[sorted.length - 1];

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-xs">🚀</div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Top 24h Gainer</p>
                          <p className="text-xs font-black text-white">{topGainer.name} ({topGainer.symbol})</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-black text-emerald-400">+{topGainer.change24h}%</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl border border-rose-500/20 bg-rose-500/5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 font-black text-xs">🔻</div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Top 24h Loser</p>
                          <p className="text-xs font-black text-white">{topLoser.name} ({topLoser.symbol})</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-black text-rose-400">{topLoser.change24h}%</span>
                    </div>
                  </div>
                );
              })()}

              {/* Main Exchange Terminal Grid */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                {/* Left 1 Col: Coin List */}
                <div className="rounded-3xl border border-white/[0.07] bg-[#0b111b] p-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                      Digital Assets
                    </h3>
                    <span className="text-[9px] font-bold text-amber-400">SPOT / LOGISTICS</span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {Object.values(assets).map((asset: any) => {
                      const isSelected = asset.symbol === activeAsset.symbol;
                      const holding = holdings[asset.symbol];
                      const val = holding ? holding.amount * asset.price : 0;

                      return (
                        <button
                          key={asset.symbol}
                          onClick={() => {
                            setSelectedCryptoSymbol(asset.symbol);
                            setCryptoTradeInput('');
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition ${
                            isSelected
                              ? 'border-amber-400/40 bg-amber-400/10 shadow-lg shadow-amber-950/20'
                              : 'border-white/[0.05] bg-black/20 hover:border-white/10 hover:bg-white/[0.03]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-400/20 font-black text-amber-400 text-xs">
                              {asset.symbol.slice(0, 3)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-white">{asset.symbol}</span>
                                <span className="text-[9px] text-slate-500">{asset.name}</span>
                              </div>
                              <p className="font-mono text-xs font-bold text-slate-300 mt-0.5">
                                ${asset.price >= 10 ? asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : asset.price.toFixed(4)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className={`inline-flex items-center gap-0.5 text-[10px] font-black ${
                              asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {asset.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                            </span>
                            {val > 0 && (
                              <p className="font-mono text-[9px] text-amber-300 mt-0.5">
                                {formatMoney(val)}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right 2 Cols: Detailed Chart & Trading Terminal */}
                <div className="lg:col-span-2 space-y-4">

                  {/* Chart & Specs Header */}
                  <div className="rounded-3xl border border-white/[0.07] bg-[#0b111b] p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400 font-black text-base">
                          {activeAsset.symbol}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-black text-white">{activeAsset.name}</h2>
                            <span className="rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[9px] font-black uppercase text-amber-300">
                              Verified
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{activeAsset.description}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-mono text-2xl font-black text-white">
                          ${activeAsset.price >= 10 ? activeAsset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : activeAsset.price.toFixed(4)}
                        </p>
                        <p className={`text-xs font-black ${activeAsset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {activeAsset.change24h >= 0 ? '+' : ''}{activeAsset.change24h}% (24h)
                        </p>
                      </div>
                    </div>

                    {/* SVG Price Chart */}
                    <div className="mt-4 pt-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                        <span>Live Price Action (Ticks)</span>
                        <div className="flex gap-3 font-mono">
                          <span>High: ${activeAsset.high24h >= 10 ? activeAsset.high24h.toLocaleString() : activeAsset.high24h.toFixed(4)}</span>
                          <span>Low: ${activeAsset.low24h >= 10 ? activeAsset.low24h.toLocaleString() : activeAsset.low24h.toFixed(4)}</span>
                          <span>Vol: {formatCompactMoney(activeAsset.volume24h)}</span>
                        </div>
                      </div>

                      <div className="h-28 w-full rounded-2xl bg-black/40 border border-white/[0.04] px-3 py-2 relative flex items-center justify-center overflow-hidden">
                        {activeAsset.priceHistory && activeAsset.priceHistory.length > 1 ? (() => {
                          const history = activeAsset.priceHistory;
                          const min = Math.min(...history);
                          const max = Math.max(...history);
                          const range = max - min || 1;
                          const width = 500;
                          const height = 90;

                          const pts = history.map((val: number, idx: number) => {
                            const x = (idx / (history.length - 1)) * (width - 40) + 20;
                            const y = height - ((val - min) / range) * (height - 25) - 12;
                            return { x, y, val };
                          });

                          let pathD = `M ${pts[0].x} ${pts[0].y}`;
                          for (let i = 0; i < pts.length - 1; i++) {
                            const xc = (pts[i].x + pts[i + 1].x) / 2;
                            const yc = (pts[i].y + pts[i + 1].y) / 2;
                            pathD += ` Q ${pts[i].x} ${pts[i].y}, ${xc} ${yc}`;
                          }

                          return (
                            <div className="w-full h-full relative flex items-center">
                              {hoveredPoint && (
                                <div className="absolute top-1 left-2 bg-black/80 border border-amber-400/30 rounded px-2 py-0.5 text-[9px] font-mono text-amber-300 z-10">
                                  Past Price [t-{history.length - 1 - hoveredPoint.index}]: ${hoveredPoint.val >= 10 ? hoveredPoint.val.toLocaleString() : hoveredPoint.val.toFixed(4)}
                                </div>
                              )}
                              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                                <defs>
                                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>
                                <path
                                  d={`${pathD} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`}
                                  fill="url(#chartGrad)"
                                />
                                <path
                                  fill="none"
                                  stroke="#f59e0b"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  d={pathD}
                                />
                                {pts.map((pt, idx) => (
                                  <circle
                                    key={idx}
                                    cx={pt.x}
                                    cy={pt.y}
                                    r={hoveredPoint?.index === idx ? 5 : 3}
                                    className="cursor-pointer transition-all duration-150"
                                    fill={hoveredPoint?.index === idx ? '#fbbf24' : '#f59e0b'}
                                    stroke="#070b12"
                                    strokeWidth="1.5"
                                    onMouseEnter={() => setHoveredPoint({ val: pt.val, index: idx })}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                  />
                                ))}
                              </svg>
                            </div>
                          );
                        })() : (
                          <span className="text-xs text-slate-600">Gathering price history...</span>
                        )}
                      </div>
                    </div>

                    {/* Trading Terminal Form */}
                    <div className="mt-5 rounded-2xl border border-white/[0.06] bg-black/30 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex rounded-xl border border-white/[0.06] bg-black/40 p-1">
                          <button
                            onClick={() => setCryptoTradeType('buy')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-black transition ${
                              cryptoTradeType === 'buy' ? 'bg-emerald-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            BUY {activeAsset.symbol}
                          </button>
                          <button
                            onClick={() => setCryptoTradeType('sell')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-black transition ${
                              cryptoTradeType === 'sell' ? 'bg-rose-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            SELL {activeAsset.symbol}
                          </button>
                        </div>

                        <div className="text-right text-xs">
                          {cryptoTradeType === 'buy' ? (
                            <span className="text-slate-400">Available Cash: <strong className="text-emerald-400">{formatMoney(state.cash)}</strong></span>
                          ) : (
                            <span className="text-slate-400">Owned: <strong className="text-amber-400">{ownedAmount.toFixed(4)} {activeAsset.symbol}</strong></span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                            {cryptoTradeType === 'buy' ? 'USD Amount ($)' : `Amount (${activeAsset.symbol})`}
                          </span>
                          <input
                            type="number"
                            value={cryptoTradeInput}
                            onChange={(e) => setCryptoTradeInput(e.target.value)}
                            placeholder="0.00"
                            className="w-full h-12 rounded-xl border border-white/[0.08] bg-[#070b12] pl-36 pr-4 font-mono text-sm text-white outline-none focus:border-amber-400/50"
                          />
                        </div>

                        {/* Quick Percent Buttons */}
                        <div className="grid grid-cols-4 gap-2">
                          <button onClick={() => setQuickPercentage(0.25)} className="py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] text-[10px] font-bold text-slate-300 hover:bg-white/[0.07]">25%</button>
                          <button onClick={() => setQuickPercentage(0.50)} className="py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] text-[10px] font-bold text-slate-300 hover:bg-white/[0.07]">50%</button>
                          <button onClick={() => setQuickPercentage(0.75)} className="py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] text-[10px] font-bold text-slate-300 hover:bg-white/[0.07]">75%</button>
                          <button onClick={() => setQuickPercentage(1.00)} className="py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] text-[10px] font-bold text-slate-300 hover:bg-white/[0.07]">MAX</button>
                        </div>

                        <button
                          onClick={handleExecuteTrade}
                          className={`w-full h-12 rounded-xl font-black text-xs transition active:scale-[.99] ${
                            cryptoTradeType === 'buy'
                              ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-950/20'
                              : 'bg-rose-500 text-black hover:bg-rose-400 shadow-lg shadow-rose-950/20'
                          }`}
                        >
                          {cryptoTradeType === 'buy' ? `EXECUTE BUY ORDER (${activeAsset.symbol})` : `EXECUTE SELL ORDER (${activeAsset.symbol})`}
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

              {/* Holdings & Recent Trades Section */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                {/* Holdings table */}
                <div className="rounded-3xl border border-white/[0.07] bg-[#0b111b] p-5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-3">
                    Your Crypto Portfolio Holdings
                  </h3>

                  {Object.keys(holdings).length > 0 ? (
                    <div className="space-y-2">
                      {Object.values(holdings).map((holding: any) => {
                        const ast = assets[holding.symbol];
                        if (!ast) return null;
                        const currentVal = holding.amount * ast.price;
                        const pnl = currentVal - holding.totalInvested;
                        const pnlPct = holding.totalInvested > 0 ? (pnl / holding.totalInvested) * 100 : 0;

                        return (
                          <div key={holding.symbol} className="flex items-center justify-between p-3 rounded-2xl border border-white/[0.05] bg-black/20">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-white">{holding.symbol}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{holding.amount.toFixed(4)} units</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">Avg Buy: ${holding.averageBuyPrice.toLocaleString()}</p>
                            </div>

                            <div className="text-right">
                              <p className="font-mono text-xs font-black text-white">{formatMoney(currentVal)}</p>
                              <p className={`text-[10px] font-black ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {pnl >= 0 ? '+' : ''}{formatMoney(pnl)} ({pnlPct.toFixed(1)}%)
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-10 text-center text-xs text-slate-600 border border-dashed border-white/[0.06] rounded-2xl">
                      No active crypto holdings. Buy tokens from the exchange above!
                    </div>
                  )}
                </div>

                {/* Crypto News & Alpha Feed */}
                <div className="rounded-3xl border border-white/[0.07] bg-[#0b111b] p-5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    Crypto & Logistics Alpha Feed
                  </h3>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {(cryptoMarket.newsFeed || []).map((news: any) => (
                      <div key={news.id} className="p-3 rounded-2xl border border-white/[0.05] bg-black/20 text-xs">
                        <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
                          <span className="font-bold text-amber-400">{news.source}</span>
                          <span>{new Date(news.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-300 font-medium leading-relaxed">{news.headline}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          );
        })()}

        {/* =========================================================
            FUTURES
        ========================================================= */}
        {activeTab === 'commodities' && (
          <div className="mt-4 space-y-4">

            <section className="relative overflow-hidden rounded-3xl border border-purple-400/10 bg-gradient-to-br from-[#130d1c] via-[#0d0c13] to-[#090c12] p-6 sm:p-8">

              <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

              <div className="relative max-w-2xl">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-400/10">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                </div>

                <h2 className="mt-5 text-2xl font-black">
                  Futures Trading
                </h2>

                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Logistics capacity, fuel and commodity market
                  instruments.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">

                  <MarketInstrument
                    name="Diesel"
                    value="$1.84/L"
                    change="+1.8%"
                  />

                  <MarketInstrument
                    name="Freight"
                    value="1,284"
                    change="+4.2%"
                  />

                  <MarketInstrument
                    name="Steel"
                    value="$742/t"
                    change="-0.7%"
                    negative
                  />

                </div>

                <div className="mt-5 flex items-center gap-2 rounded-xl border border-amber-400/10 bg-amber-400/5 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />

                  <p className="text-[10px] font-bold text-amber-300">
                    Futures instruments are currently undergoing
                    regulatory review.
                  </p>
                </div>

              </div>
            </section>

          </div>
        )}

      </div>
    </div>
  );
};

/* ===============================================================
   NAV BUTTON
================================================================ */

interface MarketNavButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const MarketNavButton: React.FC<MarketNavButtonProps> = ({
  active,
  icon,
  label,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[10px] font-black transition sm:gap-2 sm:text-xs ${
        active
          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
          : 'text-slate-500 hover:bg-white/[0.03] hover:text-slate-200'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement, {
        className: 'h-3.5 w-3.5 sm:h-4 sm:w-4',
      })}

      <span>{label}</span>
    </button>
  );
};

/* ===============================================================
   METRIC CARD
================================================================ */

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: 'blue' | 'cyan' | 'amber' | 'emerald';
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  accent,
}) => {
  const colors = {
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/10',
    cyan: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/10',
    amber: 'text-amber-400 bg-amber-400/10 border-amber-400/10',
    emerald:
      'text-emerald-400 bg-emerald-400/10 border-emerald-400/10',
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0b111b] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
          {label}
        </span>

        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg border ${colors[accent]}`}
        >
          {React.cloneElement(
            icon as React.ReactElement,
            {
              className: 'h-3.5 w-3.5',
            }
          )}
        </div>
      </div>

      <div className="mt-3 font-mono text-lg font-black text-white">
        {value}
      </div>
    </div>
  );
};

/* ===============================================================
   CATEGORY CARD
================================================================ */

interface CategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: 'blue' | 'amber' | 'purple';
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  description,
  icon,
  accent,
  onClick,
}) => {
  const styles = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/10',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/10',
    purple:
      'bg-purple-500/10 text-purple-400 border-purple-500/10',
  };

  return (
    <button
      onClick={onClick}
      className="group flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0b111b] p-4 text-left transition hover:-translate-y-0.5 hover:border-white/10 hover:bg-[#0e1520]"
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${styles[accent]}`}
        >
          {React.cloneElement(
            icon as React.ReactElement,
            {
              className: 'h-5 w-5',
            }
          )}
        </div>

        <div>
          <h3 className="text-xs font-black text-white">
            {title}
          </h3>

          <p className="mt-0.5 text-[10px] text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <ChevronRight className="h-4 w-4 text-slate-700 transition group-hover:translate-x-0.5 group-hover:text-slate-300" />
    </button>
  );
};

/* ===============================================================
   TOGGLE
================================================================ */

interface ToggleButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  active,
  icon,
  label,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-black transition ${
        active
          ? 'bg-blue-500 text-white shadow-md shadow-blue-500/10'
          : 'text-slate-500 hover:text-white'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement, {
        className: 'h-3.5 w-3.5',
      })}

      {label}
    </button>
  );
};

/* ===============================================================
   TRUCK CARD
================================================================ */

interface TruckCardProps {
  truck: any;
  canAfford: boolean;
  favorite: boolean;
  onFavorite: () => void;
  onBuy: () => void;
}

const TruckCard: React.FC<TruckCardProps> = ({
  truck,
  canAfford,
  favorite,
  onFavorite,
  onBuy,
}) => {
  const image = getTruckImage(truck);

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b111b] transition duration-300 hover:-translate-y-1 hover:border-blue-400/20 hover:shadow-2xl hover:shadow-blue-950/20">

      {/* image */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-b from-[#111a27] to-[#070b12]">

        {image ? (
          <img
            src={image}
            alt={truck.name}
            className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Truck className="h-20 w-20 text-slate-800" />
          </div>
        )}

        {/* top badges */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5">

          <span className="rounded-md border border-white/10 bg-black/70 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-slate-200 backdrop-blur">
            {regionFlag(truck.region)} {truck.region}
          </span>

          {truck.modelClass && (
            <span className="rounded-md border border-blue-400/20 bg-blue-500/10 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-blue-300 backdrop-blur">
              {truck.modelClass}
            </span>
          )}

        </div>

        <button
          onClick={onFavorite}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/60 text-slate-400 backdrop-blur transition hover:text-white"
          aria-label="Favorite"
        >
          <Heart
            className={`h-4 w-4 ${
              favorite
                ? 'fill-rose-500 text-rose-500'
                : ''
            }`}
          />
        </button>

        {/* gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0b111b] to-transparent" />
      </div>

      {/* information */}
      <div className="p-4">

        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-white">
              {truck.name}
            </h3>

            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-blue-400">
              {truck.brand}
            </p>
          </div>

          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
        </div>

        <div className="mt-4 grid grid-cols-3 divide-x divide-white/[0.06] rounded-xl border border-white/[0.05] bg-black/20 py-2">

          <VehicleStat
            label="Class"
            value={truck.modelClass || 'Heavy'}
          />

          <VehicleStat
            label="Region"
            value={truck.region || 'Global'}
          />

          <VehicleStat
            label="Status"
            value="Available"
          />

        </div>

        <div className="mt-4 flex items-end justify-between gap-3">

          <div>
            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-600">
              Market Price
            </p>

            <p className="mt-0.5 font-mono text-xl font-black text-emerald-400">
              {formatMoney(truck.price)}
            </p>
          </div>

          <button
            disabled={!canAfford}
            onClick={onBuy}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-[10px] font-black text-black transition hover:bg-emerald-400 active:scale-[.98] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {canAfford ? 'BUY RIG' : 'INSUFFICIENT'}
          </button>

        </div>

      </div>
    </article>
  );
};

/* ===============================================================
   TRAILER CARD
================================================================ */

interface TrailerCardProps {
  trailer: any;
  canAfford: boolean;
  favorite: boolean;
  onFavorite: () => void;
  onBuy: () => void;
}

const TrailerCard: React.FC<TrailerCardProps> = ({
  trailer,
  canAfford,
  favorite,
  onFavorite,
  onBuy,
}) => {
  const image = getTrailerImage(trailer);

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b111b] transition duration-300 hover:-translate-y-1 hover:border-amber-400/20 hover:shadow-2xl hover:shadow-amber-950/20">

      <div className="relative h-48 overflow-hidden bg-gradient-to-b from-[#111a27] to-[#070b12]">

        {image ? (
          <img
            src={image}
            alt={trailer.name}
            className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-20 w-20 text-slate-800" />
          </div>
        )}

        <div className="absolute left-3 top-3 rounded-md border border-amber-400/20 bg-black/70 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-amber-300 backdrop-blur">
          {trailer.type || 'Trailer'}
        </div>

        <button
          onClick={onFavorite}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/60 text-slate-400 backdrop-blur transition hover:text-white"
          aria-label="Favorite"
        >
          <Heart
            className={`h-4 w-4 ${
              favorite
                ? 'fill-rose-500 text-rose-500'
                : ''
            }`}
          />
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0b111b] to-transparent" />
      </div>

      <div className="p-4">

        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-white">
              {trailer.name}
            </h3>

            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
              {trailer.manufacturer || 'Independent'}
            </p>
          </div>

          <Package className="h-4 w-4 shrink-0 text-slate-600" />
        </div>

        <div className="mt-4 grid grid-cols-3 divide-x divide-white/[0.06] rounded-xl border border-white/[0.05] bg-black/20 py-2">

          <VehicleStat
            label="Type"
            value={trailer.type || 'General'}
          />

          <VehicleStat
            label="Status"
            value="Available"
          />

          <VehicleStat
            label="Market"
            value="Global"
          />

        </div>

        <div className="mt-4 flex items-end justify-between gap-3">

          <div>
            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-600">
              Market Price
            </p>

            <p className="mt-0.5 font-mono text-xl font-black text-emerald-400">
              {formatMoney(trailer.price)}
            </p>
          </div>

          <button
            disabled={!canAfford}
            onClick={onBuy}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-[10px] font-black text-black transition hover:bg-emerald-400 active:scale-[.98] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {canAfford ? 'BUY TRAILER' : 'INSUFFICIENT'}
          </button>

        </div>

      </div>
    </article>
  );
};

/* ===============================================================
   VEHICLE STAT
================================================================ */

const VehicleStat: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => {
  return (
    <div className="min-w-0 px-2 text-center">
      <p className="truncate text-[7px] font-bold uppercase tracking-widest text-slate-600">
        {label}
      </p>

      <p className="mt-1 truncate text-[9px] font-bold text-slate-300">
        {value}
      </p>
    </div>
  );
};

/* ===============================================================
   MARKET TICKER
================================================================ */

const MarketTicker: React.FC<{
  name: string;
  value: string;
  positive: boolean;
}> = ({ name, value, positive }) => {
  return (
    <div className="hidden items-center gap-2 sm:flex">
      <span className="text-[9px] font-bold text-slate-500">
        {name}
      </span>

      <span
        className={`flex items-center gap-0.5 font-mono text-[9px] font-black ${
          positive
            ? 'text-emerald-400'
            : 'text-rose-400'
        }`}
      >
        {positive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}

        {value}
      </span>
    </div>
  );
};

/* ===============================================================
   CRYPTO CARD
================================================================ */

const CryptoCard: React.FC<{
  name: string;
  price: string;
  change: string;
  positive: boolean;
}> = ({ name, price, change, positive }) => {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">

      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
          {name}
        </span>

        <CircleDollarSign className="h-4 w-4 text-amber-400" />
      </div>

      <p className="mt-3 font-mono text-lg font-black">
        {price}
      </p>

      <p
        className={`mt-1 flex items-center gap-1 text-[10px] font-bold ${
          positive
            ? 'text-emerald-400'
            : 'text-rose-400'
        }`}
      >
        {positive ? '+' : ''}
        {change}
      </p>
    </div>
  );
};

/* ===============================================================
   MARKET INSTRUMENT
================================================================ */

const MarketInstrument: React.FC<{
  name: string;
  value: string;
  change: string;
  negative?: boolean;
}> = ({ name, value, change, negative }) => {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">

      <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">
        {name}
      </p>

      <p className="mt-2 font-mono text-lg font-black text-white">
        {value}
      </p>

      <p
        className={`mt-1 text-[10px] font-bold ${
          negative
            ? 'text-rose-400'
            : 'text-emerald-400'
        }`}
      >
        {negative ? '' : '+'}
        {change}
      </p>

    </div>
  );
};