import React from 'react';
import type { GameSaveState } from '../types/game';
import { Truck, Wallet, Globe, Fuel, ChevronRight, CloudSun, Navigation } from 'lucide-react';
import { getCompanyRank } from '../engine/companyProgression';

interface HeaderProps {
  state: GameSaveState;
  onManualSave: () => void;
  saveStatusText: string;
  onOpenFuelTab?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenLiveMap?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  state, 
  onManualSave, 
  saveStatusText, 
  onOpenFuelTab, 
  onOpenLeaderboard,
  onOpenLiveMap
}) => {
  const activeCount = state.activeContracts?.length || 0;
  const companyXpPercent = Math.min(100, Math.floor(((state.companyXp || 0) / (state.maxCompanyXp || 100)) * 100));

  const getWeatherIcon = (w: string) => {
    switch(w) {
      case 'Heavy Rain': return '🌧️';
      case 'Blizzard Warning': return '❄️';
      case 'Dense Fog': return '🌁';
      default: return '☀️';
    }
  };

  const getWeatherEffect = (w: string) => {
    switch(w) {
      case 'Heavy Rain': return '-15%';
      case 'Blizzard Warning': return '-50%';
      case 'Dense Fog': return '-30%';
      default: return null;
    }
  };

  const gameHour = state.gameHour || 8.0;
  const hours = Math.floor(gameHour);
  const minutes = Math.floor((gameHour - hours) * 60);
  const hours12 = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const timeStr = `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;

  const weatherIcon = getWeatherIcon(state.activeWeather);
  const speedPenalty = getWeatherEffect(state.activeWeather);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-slate-900/95 border-b border-slate-800/90 backdrop-blur-xl pb-1">
      {/* Top Header Row */}
      <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-between gap-2">
        
        {/* Left: Company & Level Badge */}
        <div className="flex items-center space-x-2 truncate">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs shadow-inner flex-shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="text-xs font-extrabold text-white tracking-tight leading-none truncate max-w-[85px] sm:max-w-[110px]">
              {state.companyName}
            </div>
            <div className="flex items-center space-x-1 text-[10px] text-amber-400 font-semibold mt-0.5 truncate">
              <span className="truncate">{getCompanyRank(state.companyLevel)}</span>
              <span>•</span>
              <span>Lv {state.companyLevel}</span>
              <span>•</span>
              <span>{companyXpPercent}%</span>
            </div>
          </div>
        </div>

        {/* Center: Prominent Treasury Cash Balance */}
        <div className="flex items-center space-x-1 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 shadow-inner flex-shrink-0">
          <Wallet className={`w-3.5 h-3.5 ${state.cash < 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
          <span className={`text-xs font-extrabold font-mono ${state.cash < 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
            ${state.cash.toLocaleString()}
          </span>
        </div>

        {/* Right: Active Rigs & Rankings */}
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <div className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700/60 flex items-center space-x-1">
            <span>🚚</span>
            <span>{activeCount}/{(state.trucks || []).length}</span>
          </div>

          <button
            onClick={onOpenLeaderboard}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 rounded-lg border border-slate-700 transition"
            title="Global Logistics Rankings"
          >
            <Globe className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenLiveMap}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 rounded-lg border border-slate-700 transition"
            title="Live GPS Fleet Map"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Sub-Bar: Fuel Price Ticker, Clock & Weather */}
      <div className="bg-slate-950 border-t border-slate-800/80 px-3 py-1 flex items-center justify-between text-[10px] font-medium text-slate-400 gap-2 overflow-x-auto no-scrollbar">
        
        {/* Diesel Fuel Market Price */}
        <div 
          onClick={onOpenFuelTab}
          className="flex items-center space-x-1 cursor-pointer hover:text-slate-200 transition flex-shrink-0"
          title="Open Fuel Hub"
        >
          <Fuel className="w-3 h-3 text-amber-400 animate-pulse" />
          <strong className="text-amber-300 font-mono font-bold">${state.currentDieselMarketPrice?.toFixed(2) || '1.45'}/L</strong>
          <ChevronRight className="w-3 h-3 text-slate-500" />
        </div>

        {/* Time & Current Weather Together */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="font-mono font-bold text-slate-200">
            <span>{timeStr}</span>
          </div>

          <div className="flex items-center space-x-1 border-l border-slate-800 pl-3">
            <span className="text-xs">{weatherIcon}</span>
            <span className="text-slate-200 font-semibold">{state.activeWeather}</span>
            {speedPenalty && (
              <span className="text-[8px] font-mono font-bold text-rose-400 bg-rose-500/10 px-1 py-0.2 rounded border border-rose-500/20">
                {speedPenalty}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Level Progress Bar Line */}
      <div className="w-full bg-slate-950 h-0.5 overflow-hidden">
        <div 
          className="bg-amber-500 h-full transition-all duration-300"
          style={{ width: `${companyXpPercent}%` }}
        />
      </div>
    </header>
  );
};
