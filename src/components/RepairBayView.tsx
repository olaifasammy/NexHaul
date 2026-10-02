import React from 'react';
import type { GameSaveState } from '../types/game';
import { Wrench, Clock, CheckCircle2, Zap } from 'lucide-react';

interface RepairBayViewProps {
  state: GameSaveState;
  onExpediteRepair: (truckId: string) => void;
}

export const RepairBayView: React.FC<RepairBayViewProps> = ({ state, onExpediteRepair }) => {
  const trucksInMaintenance = (state.trucks || []).filter(t => t && t.status === 'maintenance');
  const repairBayLevel = state.depot?.repairBayLevel || 1;
  const maxBays = repairBayLevel * 2; // e.g. Level 1 = 2 bays, Level 3 = 6 bays

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <span>HQ Repair & Maintenance Bays</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Active service bays capacity: <span className="text-emerald-400 font-bold">{trucksInMaintenance.length} / {maxBays} Bays Occupied</span>
          </p>
        </div>
      </div>

      {trucksInMaintenance.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-2xl border border-emerald-500/30">
            ✓
          </div>
          <h4 className="text-white font-bold text-sm">All Service Bays Clear</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No commercial rigs are currently in maintenance. All operable fleet units are idle or on active haul routes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {trucksInMaintenance.map((truck) => {
            const totalSecs = truck.maintenanceSecondsRemaining || 3600;
            const progressPercent = Math.max(0, Math.min(100, 100 - ((totalSecs / 7200) * 100)));
            const remainingMins = Math.ceil(totalSecs / 60);
            const bayDiscount = Math.max(0.6, 1 - (repairBayLevel * 0.05));
            const expediteCost = Math.max(80, Math.floor((remainingMins * 4.5 + 75) * bayDiscount));
            const canAfford = state.cash >= expediteCost;

            return (
              <div 
                key={truck.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl p-2 bg-slate-800 rounded-xl">{truck.imageIcon || '🚛'}</div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{truck.name}</h4>
                      <p className="text-[10px] text-amber-400 font-semibold">{truck.brand} • {truck.modelClass}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-400 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>{Math.ceil(totalSecs / 60)} mins remaining</span>
                    </span>
                  </div>
                </div>

                {/* Work in Progress Badges */}
                {((truck.scheduledUpgradeParts && truck.scheduledUpgradeParts.length > 0) || (truck.scheduledMaintenanceServices && truck.scheduledMaintenanceServices.length > 0)) && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {truck.scheduledUpgradeParts?.map(part => (
                      <span key={part} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1">
                        <span>⚙️ Installing:</span>
                        <span className="capitalize">{part.replace('Stage', '')}</span>
                      </span>
                    ))}
                    {truck.scheduledMaintenanceServices?.map(serv => (
                      <span key={serv} className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1">
                        <span>🔧 Servicing:</span>
                        <span className="capitalize">{serv}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Servicing Progress</span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                {/* Expedite Rush Button */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Rush mechanic overtime to finish immediately</span>
                  <button
                    onClick={() => onExpediteRepair(truck.id)}
                    disabled={!canAfford}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl transition disabled:opacity-40 shadow-lg shadow-emerald-600/20 flex items-center space-x-1"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Expedite Bay (${expediteCost.toLocaleString()})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
