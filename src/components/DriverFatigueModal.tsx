import React from 'react';
import type { GameSaveState, Driver } from '../types/game';
import { Coffee, BedDouble, Play, Zap, ShieldAlert, X, Truck, Clock } from 'lucide-react';

interface DriverFatigueModalProps {
  state: GameSaveState;
  onClose: () => void;
  onForceRestDriver: (driverId: string) => void;
  onWakeDriver: (driverId: string) => void;
  onCoffeeBoostDriver: (driverId: string) => void;
}

export const DriverFatigueModal: React.FC<DriverFatigueModalProps> = ({
  state,
  onClose,
  onForceRestDriver,
  onWakeDriver,
  onCoffeeBoostDriver
}) => {
  // Find drivers who have elevated fatigue (>= 60%) or are currently resting
  const fatigueDrivers = state.drivers.filter(d => {
    return d.fatiguePercent >= 60 || d.isResting;
  });

  const criticalCount = state.drivers.filter(d => d.fatiguePercent >= 75 && !d.isResting).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coffee className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>Driver HOS & Fatigue Center</span>
                {criticalCount > 0 && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                    {criticalCount} Critical
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Manage Hours-of-Service shifts, rest breaks, and fatigue boosts.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Driver List Scrollable Container */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {fatigueDrivers.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs italic">
              All fleet drivers are fresh, fully rested, and operating well within HOS limits.
            </div>
          ) : (
            fatigueDrivers.map((driver) => {
              const truck = state.trucks.find(t => t.id === driver.assignedTruckId);
              const contract = state.activeContracts.find(c => c.assignedTruckId === truck?.id);
              
              const isHighFatigue = driver.fatiguePercent >= 75;
              const isResting = driver.isResting || truck?.status === 'resting';

              const statusColor = 
                isResting ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                driver.fatiguePercent >= 90 ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse' :
                driver.fatiguePercent >= 75 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

              const statusText = 
                isResting ? 'Resting at Truck Stop' :
                driver.fatiguePercent >= 90 ? 'Critical Exhaustion (Forced Park)' :
                driver.fatiguePercent >= 75 ? 'Needs Sleep (Notice)' :
                'Fresh & Alert';

              return (
                <div 
                  key={driver.id}
                  className={`bg-slate-950/80 border ${isHighFatigue && !isResting ? 'border-rose-500/40 shadow-rose-950/20' : 'border-slate-800'} rounded-xl p-3.5 space-y-3 shadow-md`}
                >
                  {/* Driver Header Row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-2xl">{driver.avatar || '👤'}</span>
                      <div>
                        <div className="text-xs font-extrabold text-white flex items-center space-x-1.5">
                          <span>{driver.name}</span>
                          <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">
                            Rank {driver.skillLevel}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center space-x-1">
                          <Truck className="w-3 h-3 text-slate-500 inline" />
                          <span className="truncate max-w-[150px]">{truck?.name || 'Unassigned'}</span>
                          {contract && <span className="text-slate-500">• {contract.origin} → {contract.destination}</span>}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>

                  {/* Fatigue Meter & HOS Shift Bar */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span className="text-slate-400 uppercase tracking-tight">Fatigue Level</span>
                        <span className={isHighFatigue ? 'text-rose-400 font-mono font-bold' : 'text-slate-200 font-mono'}>
                          {Math.floor(driver.fatiguePercent)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            driver.fatiguePercent >= 85 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' :
                            driver.fatiguePercent >= 60 ? 'bg-amber-500' :
                            'bg-emerald-500'
                          }`} 
                          style={{ width: `${Math.min(100, driver.fatiguePercent)}%` }} 
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span className="text-slate-400 uppercase tracking-tight">ELD Shift Clock</span>
                        <span className="text-blue-400 font-mono font-bold">
                          {driver.eldShiftHoursRemaining.toFixed(1)}h / 11.0h
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-500" 
                          style={{ width: `${Math.min(100, (driver.eldShiftHoursRemaining / 11.0) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dispatcher Actions Row */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    {/* If resting: Resume Route button */}
                    {isResting ? (
                      <button
                        onClick={() => onWakeDriver(driver.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume Route</span>
                      </button>
                    ) : (
                      <>
                        {/* Coffee Boost */}
                        <button
                          onClick={() => onCoffeeBoostDriver(driver.id)}
                          disabled={state.cash < 50 || driver.fatiguePercent <= 5}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-amber-950 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 text-slate-200 text-[11px] font-bold rounded-xl transition disabled:opacity-40 flex items-center space-x-1"
                          title="Reduce fatigue by -20% with espresso ($50)"
                        >
                          <Coffee className="w-3.5 h-3.5 text-amber-400" />
                          <span>Espresso Boost ($50)</span>
                        </button>

                        {/* Order Driver Rest */}
                        <button
                          onClick={() => onForceRestDriver(driver.id)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1"
                        >
                          <BedDouble className="w-3.5 h-3.5" />
                          <span>Pull Over & Rest</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono flex-shrink-0">
          <span>Drivers automatically resume transit when fully rested.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
