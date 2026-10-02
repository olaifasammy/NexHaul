import React, { useState } from 'react';
import type { Truck, GameSaveState } from '../types/game';
import { X, Wrench, Clock, DollarSign, Check, Shield, Flame, Gauge, Zap, ArrowUpRight } from 'lucide-react';

interface TruckUpgradeModalProps {
  truck: Truck;
  state: GameSaveState;
  onClose: () => void;
  onSubmitUpgrades: (truckId: string, selectedParts: Array<keyof Truck['upgrades']>, totalCost: number, totalSeconds: number, scheduleAfterJob: boolean) => void;
}

export const UPGRADE_DEFINITIONS: Record<keyof Truck['upgrades'], {
  name: string;
  icon: string;
  description: string;
  costs: number[];
  timesSeconds: number[];
  benefits: string[];
}> = {
  engineStage: {
    name: 'Engine ECU & Turbo Tune',
    icon: '🔥',
    description: 'Upgrades turbocharger boost, fuel rails, and ECU mapping for increased horsepower and torque.',
    costs: [0, 4500, 9500, 18000],
    timesSeconds: [0, 1800, 3600, 7200], // 30m, 1h, 2h
    benefits: ['Stock Power', '+12% HP & Torque', '+24% HP & Torque, High Boost', '+36% HP & Torque, Heavy-Duty Spec']
  },
  fuelTankStage: {
    name: 'Extended Range Fuel Tanks',
    icon: '⛽',
    description: 'Installs dual auxiliary saddle tanks and high-capacity fuel reservoirs.',
    costs: [0, 3000, 6500, 12000],
    timesSeconds: [0, 1200, 2400, 4800],
    benefits: ['Stock Capacity', '+25% Fuel Capacity', '+50% Fuel Capacity', '+100% Super Capacity']
  },
  aeroStage: {
    name: 'Aerodynamic Fairing Package',
    icon: '💨',
    description: 'Adds roof deflectors, cab extenders, and chassis side skirts to cut aerodynamic drag.',
    costs: [0, 3500, 7000, 14000],
    timesSeconds: [0, 1500, 3000, 6000],
    benefits: ['Standard Drag', '+2.5% Fuel Efficiency', '+5.0% Fuel Efficiency', '+10.0% Max Fuel Efficiency']
  },
  comfortStage: {
    name: 'Air-Ride Cabin & Executive Suite',
    icon: '🛏️',
    description: 'Upgrades to air-suspension driver seating and deluxe dual-bunk sleeper amenities.',
    costs: [0, 2500, 5500, 10000],
    timesSeconds: [0, 1200, 2400, 4800],
    benefits: ['Standard Suspension', '-20% Fatigue Accumulation', '-35% Fatigue Accumulation', '-50% Fatigue Accumulation']
  },
  gpsStage: {
    name: 'AI Fleet Telematics & GPS Suite',
    icon: '🛰️',
    description: 'Installs commercial traffic-routing AI, pre-pass compliance, and autonomous speed governors.',
    costs: [0, 4000, 8000, 15000],
    timesSeconds: [0, 1500, 3000, 6000],
    benefits: ['Standard Navigation', '+3 MPH Route Speed', '+6 MPH Route Speed, Zero Traffic Delay', '+9 MPH Speed, Optimized Telematics']
  }
};

export const TruckUpgradeModal: React.FC<TruckUpgradeModalProps> = ({
  truck,
  state,
  onClose,
  onSubmitUpgrades
}) => {
  const [selectedParts, setSelectedParts] = useState<Record<keyof Truck['upgrades'], boolean>>({
    engineStage: false,
    fuelTankStage: false,
    aeroStage: false,
    comfortStage: false,
    gpsStage: false,
  });

  const [scheduleAfterJob, setScheduleAfterJob] = useState(truck.status === 'in_transit');

  const togglePart = (part: keyof Truck['upgrades']) => {
    const currentStage = truck.upgrades[part] || 0;
    if (currentStage >= 3) return; // Max level 3
    setSelectedParts(prev => ({ ...prev, [part]: !prev[part] }));
  };

  let totalCost = 0;
  let totalSeconds = 0;
  const partsToUpgrade: Array<keyof Truck['upgrades']> = [];

  (Object.keys(UPGRADE_DEFINITIONS) as Array<keyof Truck['upgrades']>).forEach(part => {
    if (selectedParts[part]) {
      const currentStage = truck.upgrades[part] || 0;
      if (currentStage < 3) {
        const nextLevel = currentStage + 1;
        totalCost += UPGRADE_DEFINITIONS[part].costs[nextLevel];
        totalSeconds += UPGRADE_DEFINITIONS[part].timesSeconds[nextLevel];
        partsToUpgrade.push(part);
      }
    }
  });

  const canAfford = state.cash >= totalCost;
  const isBusy = truck.status === 'maintenance' || truck.status === 'breakdown';

  const handleConfirm = () => {
    if (!canAfford || partsToUpgrade.length === 0 || isBusy) return;
    onSubmitUpgrades(truck.id, partsToUpgrade, totalCost, totalSeconds, scheduleAfterJob);
    onClose();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const hrs = (mins / 60).toFixed(1);
    return mins < 60 ? `${mins} mins` : `${hrs} hrs`;
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-black">
              ⚙️
            </div>
            <div>
              <h3 className="text-xl font-black text-white">HQ Repair Bay — Vehicle Upgrades</h3>
              <p className="text-xs text-slate-400">Customize & install high-performance upgrades for {truck.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Upgrade Parts List */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {(Object.keys(UPGRADE_DEFINITIONS) as Array<keyof Truck['upgrades']>).map(part => {
            const def = UPGRADE_DEFINITIONS[part];
            const currentStage = truck.upgrades[part] || 0;
            const isMax = currentStage >= 3;
            const nextLevel = currentStage + 1;
            const cost = isMax ? 0 : def.costs[nextLevel];
            const timeSecs = isMax ? 0 : def.timesSeconds[nextLevel];
            const isSelected = selectedParts[part];

            return (
              <div 
                key={part}
                onClick={() => !isMax && togglePart(part)}
                className={`p-4 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                  isMax 
                    ? 'bg-slate-950/40 border-slate-800 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-950'
                    : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{def.icon}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{def.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-blue-300 border border-slate-700">
                        Level {currentStage} / 3
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{def.description}</p>
                    {!isMax && (
                      <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                        Upgrade Benefit: {def.benefits[nextLevel]}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {isMax ? (
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">MAXED</span>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-sm font-black font-mono text-emerald-400">${cost.toLocaleString()}</div>
                      <div className="text-[10px] font-mono text-slate-400 flex items-center justify-end space-x-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{formatTime(timeSecs)} in Bay</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Summary & Action */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Installation Plan</span>
              <div className="text-sm font-bold text-white">
                {partsToUpgrade.length} Upgrade{partsToUpgrade.length !== 1 ? 's' : ''} Selected
              </div>
              <div className="text-xs text-amber-400 font-mono flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Total Repair Bay Time: {formatTime(totalSeconds)}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Total Cost</span>
              <div className="text-2xl font-black font-mono text-emerald-400">${totalCost.toLocaleString()}</div>
            </div>
          </div>

          {truck.status === 'in_transit' && (
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={scheduleAfterJob} 
                onChange={(e) => setScheduleAfterJob(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0" 
              />
              <span>Schedule installation in HQ Repair Bay immediately after current delivery completes</span>
            </label>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition text-xs uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={partsToUpgrade.length === 0 || !canAfford || isBusy}
              className="flex-2 py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-40 disabled:grayscale text-white font-black rounded-2xl transition shadow-xl shadow-blue-900/40 text-xs uppercase tracking-widest flex items-center justify-center space-x-2"
            >
              <Wrench className="w-4 h-4" />
              <span>{scheduleAfterJob && truck.status === 'in_transit' ? 'Schedule Upgrade in Bay' : 'Send to Repair Bay & Upgrade'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
