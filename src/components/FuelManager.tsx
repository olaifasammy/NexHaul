import React from 'react';
import type { GameSaveState } from '../types/game';
import { Fuel, TrendingDown, TrendingUp, Minus, DollarSign, Droplets, Clock } from 'lucide-react';

interface FuelManagerProps {
  state: GameSaveState;
  onBuyBulkFuel: (litres: number) => void;
  onTopOffFleetFromDepot: () => void;
  onToggleAutoRefuel: () => void;
}

export const FuelManager: React.FC<FuelManagerProps> = ({
  state,
  onBuyBulkFuel,
  onTopOffFleetFromDepot,
  onToggleAutoRefuel,
}) => {
  const currentReserveL = state.bulkFuelReserveLitres || 0;
  const maxCapacityL = state.bulkFuelCapacityLitres || 20000;
  
  const pendingDeliveries = state.pendingFuelDeliveries || [];
  const pendingTotalL = pendingDeliveries.reduce((sum, d) => sum + d.amountLitres, 0);
  
  const reservePercent = Math.min(100, Math.floor((currentReserveL / maxCapacityL) * 100));
  const pendingPercent = Math.min(100, Math.floor((pendingTotalL / maxCapacityL) * 100));

  const retailPrice = state.currentDieselMarketPrice || 1.45;
  const wholesalePrice = state.wholesaleRackPrice || +(retailPrice * 0.82).toFixed(2);
  const savingsPerLitre = +(retailPrice - wholesalePrice).toFixed(2);

  const spaceRemainingL = Math.max(0, maxCapacityL - currentReserveL - pendingTotalL);

  const priceHistory = state.fuelPriceHistory || [1.52, 1.48, 1.44, 1.42, 1.45];

  // Calculate fleet need in Litres
  const totalFleetMissingFuelL = state.trucks.reduce((sum, t) => {
    const max = t.maxFuelLitres || (t.maxFuelGallons ? t.maxFuelGallons * 3.785 : 850);
    const curr = t.currentFuelLitres ?? (t.currentFuelGallons ? t.currentFuelGallons * 3.785 : max);
    return sum + Math.max(0, max - curr);
  }, 0);

  // Helper for pricing preview
  const getWholesalePreview = (litres: number) => {
    let volumeDiscount = 1.0;
    if (litres >= 25000) volumeDiscount = 0.88;
    else if (litres >= 12000) volumeDiscount = 0.94;
    else if (litres >= 5000) volumeDiscount = 0.98;
    return +(wholesalePrice * volumeDiscount).toFixed(2);
  };

  return (
    <div className="space-y-4">
      
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <Fuel className="w-4 h-4 text-amber-400" />
          <span>HQ Bulk Fuel Terminal & Commodity Market</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Buy wholesale diesel in bulk when market rates drop. Refuel your fleet from company tanks in Litres to avoid retail highway markup!
        </p>
      </div>

      {/* Industrial Storage Tank Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Bulk Diesel Storage Tank</h3>
              <div className="text-[10px] text-blue-400 font-semibold">Tier {state.depot?.fuelTerminalLevel || 1} Terminal Capacity</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-base font-extrabold text-amber-400 font-mono">
              {Math.floor(currentReserveL).toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ {maxCapacityL.toLocaleString()} L</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">{reservePercent}% Full</div>
          </div>
        </div>

        {/* Visual Liquid Tank Gauge */}
        <div className="space-y-1">
          <div className="w-full bg-slate-950 h-5 rounded-xl overflow-hidden border border-slate-800 relative flex">
            {/* Current Reserve */}
            <div 
              className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 h-full transition-all duration-500 relative"
              style={{ width: `${reservePercent}%` }}
            >
              <div className="absolute inset-0 bg-white/10 animate-pulse" />
            </div>
            {/* Pending Deliveries */}
            <div 
              className="bg-blue-500/30 h-full transition-all duration-500 relative border-l border-white/10"
              style={{ width: `${pendingPercent}%` }}
            >
              <div className="absolute inset-0 bg-blue-400/20 animate-pulse" />
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>{reservePercent}% Reserved</span>
            {pendingTotalL > 0 && <span className="text-blue-400">+{Math.floor(pendingTotalL).toLocaleString()}L Incoming</span>}
            <span>{maxCapacityL.toLocaleString()} Litres Max</span>
          </div>
        </div>

        {/* Pending Delivery Logistics */}
        {pendingDeliveries.length > 0 && (
          <div className="space-y-2 py-2 border-t border-slate-800/60">
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>In-Transit Fuel Deliveries</span>
            </div>
            {pendingDeliveries.map((delivery) => {
              const mins = Math.floor(delivery.remainingSeconds / 60);
              const secs = Math.floor(delivery.remainingSeconds % 60);
              return (
                <div key={delivery.id} className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg border border-slate-800/40 text-[10px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-slate-300 font-bold">{delivery.amountLitres.toLocaleString()}L Tanker</span>
                  </div>
                  <div className="text-blue-400 font-mono font-bold">
                    ETA: {mins}:{secs.toString().padStart(2, '0')}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fleet Fueling Summary */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
          <div>
            <span className="text-slate-400 text-[10px] block">Fleet Pumping Need</span>
            <strong className="text-slate-200 font-mono">{Math.floor(totalFleetMissingFuelL)} Litres</strong>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block">Reserve Status</span>
            <strong className={currentReserveL >= totalFleetMissingFuelL ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
              {currentReserveL >= totalFleetMissingFuelL ? "✓ Sufficient Fuel" : "⚠️ Needs Refill"}
            </strong>
          </div>
        </div>

        {/* 1-Tap Fleet Bulk Refuel */}
        <button
          onClick={onTopOffFleetFromDepot}
          disabled={currentReserveL <= 15 || totalFleetMissingFuelL <= 5}
          className="w-full py-2 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-amber-600/20 disabled:opacity-40 flex items-center justify-center space-x-1.5"
        >
          <Fuel className="w-3.5 h-3.5" />
          <span>Pump Bulk Fuel to All Idle Trucks ($0 Cash)</span>
        </button>

        {/* Company Fuel Logistics Policy Toggle */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-white font-bold text-[11px]">Auto-Pump Returning Trucks</div>
            <div className="text-[9px] text-slate-400">Tops off tanks from bulk reserve at $0 cost</div>
          </div>

          <button
            onClick={onToggleAutoRefuel}
            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
              state.autoRefuelFromDepot ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start border border-slate-700'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow" />
          </button>
        </div>
      </div>

      {/* Live Market Spot Price vs Wholesale Contract Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">📈</span>
            <h3 className="font-bold text-white text-sm">Diesel Commodity Market (Per Litre)</h3>
          </div>

          <div className="flex items-center space-x-1 text-xs">
            {state.dieselPriceTrend === 'falling' ? (
              <span className="flex items-center space-x-1 text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                <TrendingDown className="w-3 h-3" />
                <span>Rate Falling</span>
              </span>
            ) : state.dieselPriceTrend === 'rising' ? (
              <span className="flex items-center space-x-1 text-rose-400 font-bold text-[11px] bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                <TrendingUp className="w-3 h-3" />
                <span>Rate Rising</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-slate-400 font-bold text-[11px] bg-slate-800 px-2 py-0.5 rounded-lg">
                <Minus className="w-3 h-3" />
                <span>Rate Stable</span>
              </span>
            )}
          </div>
        </div>

        {/* Price Comparison in Litres */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Retail Highway Pump Rate</span>
            <strong className="text-rose-400 font-mono text-base font-extrabold">${retailPrice.toFixed(2)}/L</strong>
            <span className="text-[9px] text-slate-500 block">Retail highway tax & stations</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-blue-500/30">
            <span className="text-blue-400 text-[10px] block">HQ Wholesale Rack Rate</span>
            <strong className="text-emerald-400 font-mono text-base font-extrabold">${wholesalePrice.toFixed(2)}/L</strong>
            <span className="text-[9px] text-emerald-400 font-semibold block">Save ${savingsPerLitre.toFixed(2)}/L</span>
          </div>
        </div>

        {/* Price History Sparkline */}
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-medium">
            <span>Recent Price Trend (Spot Diesel)</span>
            <span className="font-mono text-slate-300">${priceHistory[priceHistory.length - 1]?.toFixed(2)} / Litre</span>
          </div>
          <div className="flex items-end space-x-1.5 h-10 pt-1">
            {priceHistory.map((p, idx) => {
              const min = 1.10;
              const max = 2.10;
              const heightPct = Math.max(15, Math.min(100, Math.floor(((p - min) / (max - min)) * 100)));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-0.5">
                  <div 
                    className="w-full bg-blue-500/70 hover:bg-blue-400 rounded-t transition-all"
                    style={{ height: `${heightPct}%` }}
                    title={`$${p.toFixed(2)}/L`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Wholesale Delivery Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-slate-800 pb-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Schedule Tanker Delivery (Wholesale)</span>
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          
          {/* Option: 5,000 L Tanker */}
          <button
            onClick={() => onBuyBulkFuel(5000)}
            disabled={spaceRemainingL < 5000 || state.cash < 5000 * getWholesalePreview(5000)}
            className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 rounded-xl text-left transition disabled:opacity-40 active:scale-95"
          >
            <div className="text-white font-bold text-xs uppercase tracking-tighter">5,000L Delivery</div>
            <div className="text-emerald-400 font-mono font-extrabold text-sm mt-0.5">${Math.floor(5000 * getWholesalePreview(5000)).toLocaleString()}</div>
            <div className="text-[9px] text-slate-500 font-bold">${getWholesalePreview(5000)}/L • 2% Off</div>
          </button>

          {/* Option: 12,000 L Tanker */}
          <button
            onClick={() => onBuyBulkFuel(12000)}
            disabled={spaceRemainingL < 12000 || state.cash < 12000 * getWholesalePreview(12000)}
            className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 rounded-xl text-left transition disabled:opacity-40 active:scale-95"
          >
            <div className="text-white font-bold text-xs uppercase tracking-tighter">12,000L Regional</div>
            <div className="text-emerald-400 font-mono font-extrabold text-sm mt-0.5">${Math.floor(12000 * getWholesalePreview(12000)).toLocaleString()}</div>
            <div className="text-[9px] text-slate-500 font-bold">${getWholesalePreview(12000)}/L • 6% Off</div>
          </button>

          {/* Option: 25,000 L Tanker */}
          <button
            onClick={() => onBuyBulkFuel(25000)}
            disabled={spaceRemainingL < 25000 || state.cash < 25000 * getWholesalePreview(25000)}
            className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 rounded-xl text-left transition disabled:opacity-40 active:scale-95"
          >
            <div className="text-white font-bold text-xs uppercase tracking-tighter">25,000L B-Train</div>
            <div className="text-emerald-400 font-mono font-extrabold text-sm mt-0.5">${Math.floor(25000 * getWholesalePreview(25000)).toLocaleString()}</div>
            <div className="text-[9px] text-slate-500 font-bold">${getWholesalePreview(25000)}/L • 12% Off</div>
          </button>

          {/* Option: Top off Tanker */}
          <button
            onClick={() => onBuyBulkFuel(spaceRemainingL)}
            disabled={spaceRemainingL <= 1000 || state.cash < spaceRemainingL * getWholesalePreview(spaceRemainingL)}
            className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-blue-500/40 rounded-xl text-left transition disabled:opacity-40 active:scale-95"
          >
            <div className="text-blue-400 font-bold text-xs uppercase tracking-tighter">Fill Tanker</div>
            <div className="text-emerald-400 font-mono font-extrabold text-sm mt-0.5">
              ${Math.floor(spaceRemainingL * getWholesalePreview(spaceRemainingL)).toLocaleString()}
            </div>
            <div className="text-[9px] text-slate-500 font-bold">Max Space Volume</div>
          </button>

        </div>
      </div>

    </div>
  );
};
