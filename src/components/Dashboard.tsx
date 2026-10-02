import React, { useState, useEffect } from 'react';
import type { GameSaveState } from '../types/game';
import type { TabType } from './Navigation';
import { calculateTruckPhysics, formatShortDriverTruckIdentifier, type DrivingMotionState } from '../engine/simulation';
import { DriverFatigueModal } from './DriverFatigueModal';
import { RealMapCanvas } from './RealMapCanvas';
import { CITY_COORDS } from './LiveMapModal';
import { 
  Gauge, 
  Navigation, 
  ShieldCheck, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Shield, 
  AlertTriangle, 
  Wrench, 
  RefreshCw, 
  Truck, 
  Activity, 
  BedDouble, 
  Snowflake,
  Play,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Search,
  Maximize2,
  Plus,
  Minus
} from 'lucide-react';

interface DashboardProps {
  state: GameSaveState;
  onNavigateTab: (tab: TabType) => void;
  onRecallTruck?: (contractId: string) => void;
  onEmergencyRepairTruck?: (truckId: string) => void;
  onForceRestDriver?: (driverId: string) => void;
  onWakeDriver?: (driverId: string) => void;
  onCoffeeBoostDriver?: (driverId: string) => void;
  onRefuelReefer?: (trailerId: string) => void;
  onOpenLiveMap?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  state, 
  onNavigateTab, 
  onRecallTruck,
  onEmergencyRepairTruck,
  onForceRestDriver,
  onWakeDriver,
  onCoffeeBoostDriver,
  onRefuelReefer,
  onOpenLiveMap
}) => {
  const activeContracts = state.activeContracts?.filter(c => c && c.status === 'in_progress') || [];
  const idleTrucks = state.trucks?.filter(t => t && !t.assignedContractId && t.status !== 'in_transit') || [];

  // Log Feed Filter State
  const [logFilter, setLogFilter] = useState<'all' | 'financials' | 'safety' | 'completions'>('all');
  const [showFatigueModal, setShowFatigueModal] = useState(false);

  // Active Hauls View State (Filtering & Pagination)
  const [activeViewFilter, setActiveViewFilter] = useState<'all' | 'cruising' | 'resting' | 'attention'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredContracts = activeContracts.filter(contract => {
    const truck = state.trucks.find(t => t.id === contract.assignedTruckId);
    const driver = state.drivers.find(d => d.id === contract.assignedDriverId);
    const trailer = state.trailers.find(t => t.id === truck?.assignedTrailerId);

    // Search Query Match (Title, Driver, Truck)
    const matchesSearch = 
      (contract.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (driver?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (truck?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Type Filters
    if (activeViewFilter === 'cruising') return truck?.status === 'in_transit' && (driver?.fatiguePercent || 0) < 75;
    if (activeViewFilter === 'resting') return driver?.isResting || truck?.status === 'resting';
    if (activeViewFilter === 'attention') {
      const needsService = (truck?.conditionPercent || 100) < 30 || truck?.status === 'breakdown';
      const needsRest = (driver?.fatiguePercent || 0) >= 75;
      const needsReefer = trailer?.type === 'Refrigerated' && ((trailer.currentFuelLitres || 0) < 30 || (trailer.currentTempF || 34) > 40);
      return needsService || needsRest || needsReefer;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const paginatedContracts = filteredContracts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getWeatherIcon = (w: string) => {
    switch(w) {
      case 'Heavy Rain': return '🌧️';
      case 'Blizzard Warning': return '❄️';
      case 'Dense Fog': return '🌁';
      default: return '☀️';
    }
  };

  // Track expanded contract card - default to null (collapsed)
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Flashby news ticker state
  const [newsIndex, setNewsIndex] = useState(0);

  // Live Map widget state on Dashboard
  const [mapRegion, setMapRegion] = useState<'America' | 'Europe' | 'Asia' | 'Africa'>('America');
  const [mapZoom, setMapZoom] = useState<number>(1.0);
  const [mapSelectedTruckId, setMapSelectedTruckId] = useState<string | null>(null);

  const remainingWeatherSeconds = Math.max(0, (state.weatherDuration ?? 7200) - (state.weatherTimer ?? 0));
  const remainingWeatherMins = Math.ceil(remainingWeatherSeconds / 60);
  const weatherArrivalText = remainingWeatherMins <= 60 
    ? `in about ${Math.max(1, remainingWeatherMins)} minute(s)` 
    : `in about ${(remainingWeatherMins / 60).toFixed(1)} hour(s)`;

  const nextIncomingWeather = state.weatherForecast?.[0] || 'Heavy Rain';

  const flashbyNews = [
    `⚡ Broker Bulletin: Tier ${state.companyLevel} logistics demand surging across regional transport corridors.`,
    `⛽ Diesel Market Ticker: Current market price at $${state.currentDieselMarketPrice?.toFixed(2) || '1.45'}/L (${state.dieselPriceTrend || 'stable'}).`,
    `🌤️ Current Conditions: ${state.activeWeather}.`,
    `🌦️ Weather Alert: ${nextIncomingWeather} is moving in ${weatherArrivalText}! Prepare your fleet and routes.`,
    `🚚 Fleet Activity: ${activeContracts?.length || 0} active haul(s) in transit, ${idleTrucks?.length || 0} rig(s) ready in terminal.`,
    `🏆 Global Rankings: Corporations competing for top logistics dominance in Q3 rankings.`,
    `🛡️ Safety Directive: HOS shift compliance and vehicle maintenance reduce mechanical failure rates.`
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setNewsIndex(prev => (prev + 1) % flashbyNews.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [flashbyNews.length]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // Filter drivers requiring fatigue attention (fatigue >= 75% and not currently resting)
  const fatigueAlertDrivers = (state.drivers || []).filter(d => d.fatiguePercent >= 75 && !d.isResting && Boolean(d.assignedTruckId));

  // Aggregate Mechanical & Cargo Safety Alerts
  const criticalAlerts: { id: string; type: 'danger' | 'warning'; title: string; message: string; actionText?: string; onAction?: () => void }[] = [];

  activeContracts.forEach(contract => {
    const truck = state.trucks?.find(t => t && t.id === contract.assignedTruckId);
    const trailer = state.trailers?.find(t => t && t.id === truck?.assignedTrailerId);

    const isCriticalCondition = (truck.conditionPercent ?? 100) <= 20;
    const isGenuinelyBroken = truck.status === 'breakdown' && ((truck.conditionPercent ?? 100) < 40 || (truck.batteryHealthPercent ?? 100) < 15);

    if (truck && (isGenuinelyBroken || isCriticalCondition)) {
      criticalAlerts.push({
        id: `alert-breakdown-${truck.id}`,
        type: 'danger',
        title: `Mechanical Breakdown: ${truck.name}`,
        message: `Condition at ${Math.floor(truck.conditionPercent)}%. Severe speed loss or mechanical failure!`,
        actionText: 'Roadside Service',
        onAction: () => onEmergencyRepairTruck?.(truck.id)
      });
    }

    if (trailer && trailer.type === 'Refrigerated') {
      const temp = trailer.currentTempF ?? 34;
      const reeferFuel = trailer.currentFuelLitres ?? 150;
      if (temp > 40 || reeferFuel < 30) {
        criticalAlerts.push({
          id: `alert-reefer-${trailer.id}`,
          type: 'danger',
          title: `Reefer Unit Failure: ${trailer.name}`,
          message: reeferFuel < 30 ? `Reefer fuel dangerously low (${Math.floor(reeferFuel)}L)!` : `Cargo temp warm at ${Math.round(temp)}°F! Spoilage risk!`,
          actionText: 'Refuel Reefer',
          onAction: () => onRefuelReefer?.(trailer.id)
        });
      }
    }
  });

  // Filter logs according to tab selection
  const filteredLogs = (state.eventLogs || []).filter(log => {
    if (logFilter === 'financials') return log.cashChange !== undefined;
    if (logFilter === 'safety') return log.type === 'warning' || log.type === 'danger';
    if (logFilter === 'completions') return (log.title || "").toLowerCase().includes('complete') || (log.title || "").toLowerCase().includes('delivered');
    return true;
  });

  return (
    <div className="space-y-4">
      
      {/* Mechanical & Cargo Safety Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-rose-950/60 border border-rose-500/40 rounded-2xl p-3.5 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-rose-400 font-extrabold text-xs">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <span className="uppercase tracking-wider">Mechanical & Safety Warnings ({criticalAlerts.length})</span>
            </div>
            <span className="text-[10px] text-rose-300 font-mono font-semibold bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
              Immediate Action Needed
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {criticalAlerts.map(alert => (
              <div key={alert.id} className="bg-slate-950/80 border border-rose-500/20 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-extrabold text-white text-xs">{alert.title}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">{alert.message}</div>
                </div>
                {alert.actionText && alert.onAction && (
                  <button
                    onClick={alert.onAction}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-[10px] rounded-lg shadow transition whitespace-nowrap flex-shrink-0 flex items-center space-x-1"
                  >
                    <span>{alert.actionText}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Driver Fatigue & HOS Notice Bar */}
      {fatigueAlertDrivers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border border-amber-500/40 rounded-2xl p-3.5 shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <Coffee className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-amber-300 flex items-center space-x-2">
                <span>Driver Rest Notice</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-400 font-mono px-1.5 py-0.2 rounded border border-amber-500/30">
                  {fatigueAlertDrivers.length} Driver(s)
                </span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                {fatigueAlertDrivers.map(d => `${d.name} (${Math.floor(d.fatiguePercent)}% fatigue)`).join(', ')}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowFatigueModal(true)}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition whitespace-nowrap flex-shrink-0"
          >
            Manage Shifts
          </button>
        </div>
      )}

      {/* Industry Wire & Flashby News Ticker Section */}
      {(() => {
        const flashbyNews = [
          `⚡ Broker Bulletin: Tier ${state.companyLevel} logistics demand surging across regional transport corridors.`,
          `⛽ Diesel Market Ticker: Current market price at $${state.currentDieselMarketPrice?.toFixed(2) || '1.45'}/L (${state.dieselPriceTrend || 'stable'}).`,
          `🌤️ Regional Weather Report: ${state.activeWeather} active. Expect transit speed adaptations and road safety cautions.`,
          `🚚 Fleet Activity: ${activeContracts?.length || 0} active haul(s) in transit, ${idleTrucks?.length || 0} rig(s) ready in terminal.`,
          `🏆 Global Rankings: Corporations competing for top logistics dominance in Q3 rankings.`,
          `🛡️ Safety Directive: HOS shift compliance and vehicle maintenance reduce mechanical failure rates.`
        ];
        
        return (
          <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold text-amber-400 uppercase tracking-widest flex items-center space-x-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span>Live Industry Wire & Flashby News</span>
              </h2>
              <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400">
                <span>[{newsIndex + 1}/{flashbyNews.length}]</span>
                <button
                  onClick={() => setNewsIndex(prev => (prev - 1 + flashbyNews.length) % flashbyNews.length)}
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                  title="Previous News"
                >
                  ◀
                </button>
                <button
                  onClick={() => setNewsIndex(prev => (prev + 1) % flashbyNews.length)}
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                  title="Next News"
                >
                  ▶
                </button>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl min-h-[50px] flex items-center transition-all duration-300">
              <p className="text-xs text-slate-200 font-medium leading-snug animate-in fade-in">
                {flashbyNews[newsIndex]}
              </p>
            </div>
          </div>
        );
      })()}

      {/* Active Dispatches Section with Pagination & Search */}
      <div className="space-y-3">
        {/* Automated Dispatch Active Banner */}
        {((state.depot?.dispatchAILevel || 0) > 0 && (state.depot?.isAutoDispatchEnabled ?? true)) && (
          <div className="bg-blue-600/15 border border-blue-500/30 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-md w-fit">
            <span className="text-base animate-ai-jump-bend">🤖</span>
            <div className="flex items-center -space-x-1">
              {[...Array(state.depot.dispatchAILevel)].map((_, i) => (
                <span key={i} className="text-amber-400 text-xs drop-shadow">⭐</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
          <h3 className="text-xs font-bold text-slate-100 flex items-center space-x-2 uppercase tracking-wider">
            <Gauge className="w-4 h-4 text-amber-400" />
            <span>Active Hauls & Telemetry</span>
          </h3>
          
          {/* Dispatch Filters */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'All', icon: Activity },
              { id: 'cruising', label: 'Cruising', icon: Play },
              { id: 'resting', label: 'Resting', icon: BedDouble },
              { id: 'attention', label: 'Alerts', icon: AlertTriangle }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => { setActiveViewFilter(f.id as any); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 border transition ${
                  activeViewFilter === f.id 
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-950/30 font-extrabold' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <f.icon className="w-3 h-3" />
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Pagination Control Header */}
        <div className="flex items-center justify-between gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-800/60">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
            <input 
              type="text"
              placeholder="Search active dispatches..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 text-[11px] text-slate-200 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-500/50"
            />
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center space-x-2 shrink-0">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-1 bg-slate-800 rounded-lg text-slate-400 disabled:opacity-30 active:scale-90"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-mono font-bold text-slate-500 min-w-[32px] text-center">
                {currentPage} / {totalPages}
              </span>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-1 bg-slate-800 rounded-lg text-slate-400 disabled:opacity-30 active:scale-90"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {filteredContracts.length === 0 ? (
          <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-800">
              <MapPin className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <h4 className="text-slate-200 text-xs font-extrabold uppercase tracking-wider">
                {activeContracts.length === 0 ? 'No Active Hauls' : 'No matching results'}
              </h4>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                {activeContracts.length === 0 
                  ? 'Accept a contract tender from the board and assign a commercial truck and driver to begin transit.'
                  : 'Adjust your filters or search query to find active dispatches.'}
              </p>
            </div>
            {activeContracts.length === 0 && (
              <button
                onClick={() => onNavigateTab('freight')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-amber-500/20"
              >
                Browse Freight Tenders
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {paginatedContracts.map((contract) => {
              if (!contract) return null;

              const truck = state.trucks?.find(t => t && t.id === contract.assignedTruckId);
              const driver = state.drivers?.find(d => d && d.id === contract.assignedDriverId);
              const trailer = state.trailers?.find(t => t && t.id === truck?.assignedTrailerId);
              
              const progressMiles = contract.progressMiles || 0;
              const remainingMiles = Math.max(0, contract.distanceMiles - progressMiles);
              const rawPercent = Math.min(100, (progressMiles / contract.distanceMiles) * 100);

              // Physics calculations
              const physics = truck && driver 
                ? calculateTruckPhysics(truck, contract, driver, state.activeWeather, state.skills, state.trailers)
                : { speedMph: 0, currentMpg: 8.0, motionState: 'Stationary' as DrivingMotionState, cruisingSpeedMph: 0 };
              
              const { speedMph, currentMpg, motionState } = physics;
              const shortIdentifier = formatShortDriverTruckIdentifier(driver?.name, truck?.name, truck?.id);
              
              const isEurope = truck?.region === 'Europe';
              const speedText = isEurope 
                ? `${Math.round(speedMph * 1.609)} km/h` 
                : `${Math.round(speedMph)} MPH`;

              const burnL100km = (235.215 / Math.max(1, currentMpg)).toFixed(1);

              const etaSeconds = speedMph > 0 ? (remainingMiles / speedMph) * 3600 : 0;
              const etaMinutes = Math.floor(etaSeconds / 60);
              const etaHours = Math.floor(etaMinutes / 60);
              const remainingMins = etaMinutes % 60;
              const etaText = etaHours > 0 ? `${etaHours}h ${remainingMins}m` : `${etaMinutes} min`;

              const weatherIcon = getWeatherIcon(state.activeWeather);
              const isExpanded = expandedId === contract.id;

              const isDriverResting = driver?.isResting || truck?.status === 'resting';

              const motionBadgeStyle = 
                isDriverResting ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                motionState === 'Accelerating' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                motionState === 'Cruising' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                motionState === 'Decelerating' ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' :
                motionState === 'Slow Crawl' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                'bg-slate-700/30 text-slate-300 border-slate-600';

              const motionShortTag = 
                isDriverResting ? 'Resting' :
                motionState === 'Accelerating' ? 'Acc' :
                motionState === 'Cruising' ? 'Cruise' :
                motionState === 'Decelerating' ? 'Dec' :
                motionState === 'Slow Crawl' ? 'Slow' :
                'Stationary';

              const statusLabel = 
                isDriverResting ? 'Driver Resting' :
                truck?.status === 'fueling' ? 'Refueling Stop' :
                truck?.status === 'breakdown' ? 'Mechanical Failure' :
                `${motionState} (${speedText})`;

              const statusColor = 
                isDriverResting ? 'text-amber-400' :
                truck?.status === 'fueling' ? 'text-amber-400' :
                truck?.status === 'breakdown' ? 'text-rose-500' :
                motionState === 'Accelerating' ? 'text-amber-400' :
                motionState === 'Cruising' ? 'text-emerald-400' :
                motionState === 'Decelerating' ? 'text-sky-400' :
                motionState === 'Slow Crawl' ? 'text-orange-400' :
                'text-slate-400';

              return (
                <div 
                  key={contract.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md transition-all duration-200"
                >
                  {/* COMPACT VIEW (COLLAPSED CARD HEADER) */}
                  <div 
                    onClick={() => toggleExpand(contract.id)}
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 select-none"
                  >
                    <div className="flex items-center space-x-2.5 truncate flex-1">
                      <span className="text-base flex-shrink-0">{truck?.imageIcon || '🚚'}</span>
                      <div className="truncate flex-1">
                        <div className="text-xs font-black text-white truncate max-w-[200px] sm:max-w-md flex items-center space-x-1.5">
                          <span className="truncate">{shortIdentifier}</span>
                        </div>
                        <div className="text-[10px] text-slate-300 font-medium truncate mt-0.5">
                          {contract.title} • {contract.origin} → {contract.destination}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1 flex flex-wrap items-center gap-1.5">
                          {isDriverResting ? (
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              <BedDouble className="w-3 h-3" /> Resting
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1">
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${motionBadgeStyle}`}>
                                {motionShortTag}
                              </span>
                              <span className="text-white font-bold">{speedText}</span>
                            </span>
                          )}
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">${contract.payoutCash.toLocaleString()}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-bold">{etaText}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-2">
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                        {Math.floor(rawPercent)}%
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Progress Line in Collapsed Mode */}
                  {!isExpanded && (
                    <div className="w-full bg-slate-950 h-1.5 relative overflow-hidden">
                      <div className="bg-amber-500 h-full transition-all duration-1000 shadow-[0_0_8px_rgba(245,158,11,0.5)]" style={{ width: `${rawPercent}%` }} />
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 -ml-2 text-[10px] transition-all duration-1000 z-10" 
                        style={{ left: `${rawPercent}%` }}
                      >
                        {truck?.imageIcon || '🚚'}
                      </div>
                    </div>
                  )}

                  {/* DETAILED VIEW (EXPANDED PANEL) */}
                  {isExpanded && (
                    <div className="border-t border-slate-800/80 p-4 space-y-4 bg-slate-950/20">
                      
                      {/* Driver Rest Recovery HUD (When resting) */}
                      {isDriverResting && driver && (
                        <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between gap-3 shadow-md">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30 text-amber-400">
                              <BedDouble className="w-4 h-4 animate-pulse" />
                            </div>
                            <div>
                              <div className="text-xs font-extrabold text-amber-300 flex items-center space-x-1.5">
                                <span>{driver.name} is Resting</span>
                                <span className="text-[9px] font-mono text-slate-400">({Math.ceil((driver.restSecondsRemaining || 0) / 3600)}h left)</span>
                              </div>
                              <div className="text-[10px] text-slate-300 font-mono mt-0.5">
                                Fatigue: <strong className="text-emerald-400">{Math.floor(driver.fatiguePercent)}%</strong> (Recovering) • HOS Shift: <strong className="text-amber-400">{driver.eldShiftHoursRemaining.toFixed(1)}h</strong>
                              </div>
                            </div>
                          </div>

                          {onWakeDriver && (
                            <button
                              onClick={() => onWakeDriver(driver.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1 whitespace-nowrap flex-shrink-0"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Resume Route</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Emergency Interventions & Recall Action Bar */}
                      <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-950/70 rounded-xl border border-slate-800/80">
                        {/* Abort & Recall Contract */}
                        {onRecallTruck && (
                          <button
                            onClick={() => onRecallTruck(contract.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 hover:border-rose-500/40 text-slate-300 border border-slate-700 text-[10px] font-bold rounded-lg transition flex items-center space-x-1"
                          >
                            <RefreshCw className="w-3 h-3 text-rose-400" />
                            <span>Abort & Recall Rig</span>
                          </button>
                        )}

                        {/* Roadside Repair Intervention - only for genuinely impaired or disabled rigs */}
                        {truck && (truck.status === 'breakdown' || (truck.conditionPercent ?? 100) <= 25) && (truck.conditionPercent ?? 100) < 50 && onEmergencyRepairTruck && (
                          <button
                            onClick={() => onEmergencyRepairTruck(truck.id)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] rounded-lg shadow transition flex items-center space-x-1 animate-pulse"
                          >
                            <Wrench className="w-3 h-3" />
                            <span>Roadside Repair</span>
                          </button>
                        )}

                        {/* Order Mandatory Driver Rest */}
                        {driver && !isDriverResting && (driver.fatiguePercent >= 70 || driver.eldShiftHoursRemaining <= 2.0) && onForceRestDriver && (
                          <button
                            onClick={() => onForceRestDriver(driver.id)}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] rounded-lg shadow transition flex items-center space-x-1"
                          >
                            <BedDouble className="w-3 h-3" />
                            <span>Order Driver Rest</span>
                          </button>
                        )}

                        {/* Espresso Boost */}
                        {driver && !isDriverResting && driver.fatiguePercent >= 40 && onCoffeeBoostDriver && (
                          <button
                            onClick={() => onCoffeeBoostDriver(driver.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-amber-950 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 text-slate-200 text-[10px] font-bold rounded-lg transition flex items-center space-x-1"
                          >
                            <Coffee className="w-3 h-3 text-amber-400" />
                            <span>Espresso ($50)</span>
                          </button>
                        )}

                        {/* Emergency Reefer Refuel */}
                        {trailer && trailer.type === 'Refrigerated' && (trailer.currentFuelLitres || 0) < 30 && onRefuelReefer && (
                          <button
                            onClick={() => onRefuelReefer(trailer.id)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded-lg shadow transition flex items-center space-x-1"
                          >
                            <Snowflake className="w-3 h-3" />
                            <span>Refuel Reefer</span>
                          </button>
                        )}
                      </div>

                      {/* Interactive Route Visualizer HUD */}
                      <div className="relative space-y-2.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">
                          <div className="flex items-center space-x-1.5">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            <span>{contract.origin}</span>
                          </div>
                          <div className={statusColor}>{statusLabel}</div>
                          <div className="flex items-center space-x-1.5">
                            <span>{contract.destination}</span>
                            <MapPin className="w-3 h-3 text-emerald-400" />
                          </div>
                        </div>

                        <div className="w-full h-10 bg-slate-900 rounded-xl border border-slate-800 relative flex items-center px-4 overflow-hidden">
                          {/* Road Stripes Visual */}
                          <div className="absolute inset-0 flex items-center justify-around opacity-10 pointer-events-none">
                             {[...Array(12)].map((_, i) => <div key={i} className="w-5 h-0.5 bg-white" />)}
                          </div>

                          <div className="h-2 bg-slate-800 w-full absolute left-0 rounded-full mx-4 opacity-40" />
                          <div className="h-2 bg-amber-500 transition-all duration-1000 absolute left-0 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.6)]" style={{ width: `${rawPercent}%`, marginLeft: '16px', maxWidth: 'calc(100% - 32px)' }} />
                          
                          <div 
                            className="absolute transition-all duration-1000 flex flex-col items-center z-10" 
                            style={{ left: `calc(${rawPercent}% - 8px)` }}
                          >
                             <div className="flex flex-col items-center group">
                                <span className="text-[9px] bg-slate-950/90 text-amber-300 font-mono border border-slate-700 px-1.5 py-0.5 rounded mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-20">
                                   {shortIdentifier}: {isDriverResting ? 'Resting' : `${motionState} • ${speedText}`}
                                </span>
                                <span 
                                  className="text-xl filter drop-shadow-[0_2px_4px_rgba(59,130,246,0.4)]"
                                  style={{ 
                                    transform: truck?.status === 'deadheading' ? 'scaleX(1)' : 'scaleX(-1)', 
                                    display: 'inline-block' 
                                  }}
                                >
                                  {isDriverResting ? '🅿️' : (truck?.imageIcon || '🚚')}
                                </span>
                             </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
                           <span>{Math.floor(progressMiles).toLocaleString()} mi</span>
                           <span>{weatherIcon} {state.activeWeather} • {contract.region}</span>
                           <span>{Math.ceil(remainingMiles).toLocaleString()} mi left</span>
                        </div>
                      </div>

                      {/* GPS Navigation & Toll Preview */}
                      <div className="flex items-center justify-between px-2 py-1.5 bg-slate-950/50 rounded-lg border border-slate-800/40 text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                         <div className="flex items-center gap-1.5">
                            <Navigation className="w-3 h-3 text-amber-500 animate-pulse" />
                            <span>GPS: {contract.origin} → {contract.destination} ({contract.region})</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <Shield className="w-3 h-3 text-amber-500" />
                            <span>Tolls: ~${Math.floor(contract.distanceMiles / 80) * (contract.region === 'Europe' ? 25 : contract.region === 'Asia' ? 20 : 15)}</span>
                         </div>
                      </div>

                      {/* Real-time Telemetry Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 flex flex-col justify-center">
                           <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tight mb-1">Efficiency</div>
                           <div className="text-xs font-extrabold text-amber-400 font-mono">{burnL100km} L/100km</div>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 flex flex-col justify-center">
                           <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tight mb-1">E.L.D Clock</div>
                           <div className="text-xs font-extrabold text-white font-mono">{(driver?.eldShiftHoursRemaining || 0).toFixed(1)}h Shift</div>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 flex flex-col justify-center">
                           <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tight mb-1">Rig Condition</div>
                           <div className="text-xs font-extrabold text-emerald-400 font-mono">{Math.floor(truck?.conditionPercent || 0)}%</div>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 flex flex-col justify-center">
                           <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tight mb-1">Arrival Est.</div>
                           <div className="text-xs font-extrabold text-amber-400 font-mono">{isDriverResting ? 'Paused (Rest)' : etaText}</div>
                        </div>
                      </div>

                      {/* Cargo Logistics Manifest */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                         <div className="flex items-center justify-between mb-2">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                               <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                               <span>Cargo Logistics Manifest</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">Odometer: {Math.floor(truck?.odometerMiles || 0).toLocaleString()} mi</span>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                               <div className="flex justify-between text-[10px]">
                                  <span className="text-slate-500">Personnel</span>
                                  <span className="text-slate-200 font-bold">{driver?.name}</span>
                               </div>
                               <div className="flex justify-between text-[10px]">
                                  <span className="text-slate-500">Fatigue Level</span>
                                  <span className={(driver?.fatiguePercent || 0) > 80 ? 'text-rose-500 font-bold' : isDriverResting ? 'text-emerald-400 font-bold' : 'text-slate-200'}>
                                    {Math.floor(driver?.fatiguePercent || 0)}% {isDriverResting && '💤'}
                                  </span>
                               </div>
                            </div>
                            <div className="space-y-1.5">
                               <div className="flex justify-between text-[10px]">
                                  <span className="text-slate-500">Equipment</span>
                                  <span className="text-slate-200 font-bold">{trailer?.type || 'No Trailer'}</span>
                               </div>
                               {trailer?.type === 'Refrigerated' ? (
                                  <>
                                     <div className="flex justify-between text-[10px]">
                                        <span className="text-slate-500">Reefer Unit Fuel</span>
                                        <span className={(trailer.currentFuelLitres || 0) < 30 ? 'text-rose-500 animate-pulse font-bold' : 'text-emerald-400 font-bold'}>
                                           {Math.floor(trailer.currentFuelLitres || 0)} L
                                        </span>
                                     </div>
                                     <div className="flex justify-between text-[10px]">
                                        <span className="text-slate-500">Reefer Temperature</span>
                                        <span className={(trailer.currentTempF || 34) > 40 ? 'text-rose-400 animate-pulse font-bold' : 'text-cyan-400 font-bold'}>
                                           {Math.round(trailer.currentTempF || 34)}°F
                                        </span>
                                     </div>
                                  </>
                               ) : (
                                  <div className="flex justify-between text-[10px]">
                                     <span className="text-slate-500">Truck Fuel</span>
                                     <span className="text-amber-400 font-bold">{Math.floor(truck?.currentFuelLitres || 0)} L</span>
                                  </div>
                                )}
                            </div>
                         </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live GPS Fleet Map & Movement Widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Live GPS Fleet Map & Movement
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px]">
              {(['America', 'Europe', 'Asia', 'Africa'] as const).map(reg => (
                <button
                  key={reg}
                  onClick={() => setMapRegion(reg)}
                  className={`px-2 py-0.5 rounded-lg font-bold transition ${mapRegion === reg ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  {reg === 'America' ? '🇺🇸 USA' : reg === 'Europe' ? '🇪🇺 EU' : reg === 'Asia' ? '🌏 Asia' : '🌍 Africa'}
                </button>
              ))}
            </div>

            {onOpenLiveMap && (
              <button
                onClick={onOpenLiveMap}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 transition"
                title="Expand Fullscreen Map"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Vector Map Canvas */}
        <div className="relative w-full h-80 bg-[#090d16] rounded-xl border border-slate-800 overflow-hidden shadow-inner group">
          <RealMapCanvas 
            region={mapRegion}
            contracts={activeContracts}
            trucks={state.trucks}
            selectedTruckId={mapSelectedTruckId}
            onSelectTruck={(id) => setMapSelectedTruckId(id)}
            zoom={mapZoom}
            showLabels={mapZoom > 0.9}
          />

          {/* Map Status Overlay (Corner) */}
          <div className="absolute top-3 left-3 flex items-center space-x-2 bg-slate-900/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700/50 pointer-events-none select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Sector {mapRegion} Link</span>
          </div>

          {/* Map Controls */}
          <div className="absolute bottom-3 right-3 flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-2xl transition-opacity opacity-0 group-hover:opacity-100">
            <button 
              onClick={() => setMapZoom(prev => Math.min(2.5, +(prev + 0.25).toFixed(2)))} 
              className="p-1 text-slate-200 hover:bg-slate-800 rounded-lg transition"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setMapZoom(prev => Math.max(0.6, +(prev - 0.25).toFixed(2)))} 
              className="p-1 text-slate-200 hover:bg-slate-800 rounded-lg transition"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setMapZoom(1.0)} 
              className="px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-white transition"
            >
              RESET
            </button>
          </div>
        </div>

        {/* Selected Truck Quick Inspect */}
        {mapSelectedTruckId && (() => {
          const t = state.trucks?.find(tr => tr.id === mapSelectedTruckId);
          const c = activeContracts.find(con => con.assignedTruckId === mapSelectedTruckId);
          if (!t || !c) return null;
          const assignedD = state.drivers?.find(d => d.id === t.assignedDriverId);
          const shortMapId = formatShortDriverTruckIdentifier(assignedD?.name, t.name, t.id);

          return (
            <div className="bg-slate-950 p-2.5 rounded-xl border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span>{t.imageIcon || '🚚'}</span>
                <div>
                  <div className="font-bold text-white">{shortMapId}</div>
                  <div className="text-[10px] text-slate-300">{c.title} ({c.origin} → {c.destination})</div>
                  <div className="text-[10px] text-amber-400">Progress: {Math.floor(((c.progressMiles || 0) / c.distanceMiles) * 100)}% • Fuel: {Math.floor(t.currentFuelLitres)}L</div>
                </div>
              </div>
              <button onClick={() => setMapSelectedTruckId(null)} className="text-slate-400 hover:text-white px-1.5 py-0.5 bg-slate-900 rounded">✕</button>
            </div>
          );
        })()}
      </div>

      {/* Operations Event Log Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-100 flex items-center space-x-2 uppercase tracking-wider">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Operations Road Log</span>
          </h3>

          {/* Log Filters */}
          <div className="flex items-center space-x-1 text-[9px] font-bold">
            <button
              onClick={() => setLogFilter('all')}
              className={`px-2 py-0.5 rounded-lg transition ${logFilter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-slate-950'}`}
            >
              All
            </button>
            <button
              onClick={() => setLogFilter('financials')}
              className={`px-2 py-0.5 rounded-lg transition ${logFilter === 'financials' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white bg-slate-950'}`}
            >
              Cash
            </button>
            <button
              onClick={() => setLogFilter('safety')}
              className={`px-2 py-0.5 rounded-lg transition ${logFilter === 'safety' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white bg-slate-950'}`}
            >
              Alerts
            </button>
            <button
              onClick={() => setLogFilter('completions')}
              className={`px-2 py-0.5 rounded-lg transition ${logFilter === 'completions' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white bg-slate-950'}`}
            >
              Jobs
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
          {filteredLogs.length === 0 ? (
            <div className="text-[11px] text-slate-400 italic py-2 text-center">
              No recent road log entries matching filter.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div 
                key={log.id}
                className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-xl flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${
                      log.type === 'success' ? 'text-emerald-400' :
                      log.type === 'warning' ? 'text-amber-400' :
                      log.type === 'danger' ? 'text-rose-400' : 'text-cyan-400'
                    }`}>
                      {log.title}
                    </span>

                    {/* Cash Change Badge */}
                    {log.cashChange !== undefined && log.cashChange !== 0 && (
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                        log.cashChange > 0 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {log.cashChange > 0 ? `+$${log.cashChange.toLocaleString()}` : `-$${Math.abs(log.cashChange).toLocaleString()}`}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 mt-0.5 text-[11px] leading-tight">{log.message}</p>
                </div>

                <span className="text-[9px] text-slate-500 font-mono whitespace-nowrap ml-1">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Driver HOS & Fatigue Control Center Modal */}
      {showFatigueModal && (
        <DriverFatigueModal 
          state={state}
          onClose={() => setShowFatigueModal(false)}
          onForceRestDriver={onForceRestDriver!}
          onWakeDriver={onWakeDriver!}
          onCoffeeBoostDriver={onCoffeeBoostDriver!}
        />
      )}

    </div>
  );
};
