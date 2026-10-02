import React, { useEffect, useState } from 'react';
import type { GameSaveState } from '../types/game';
import { generateDriverCandidate, generateDriverMarket } from '../data/drivers';
import type { DriverCandidate } from '../data/drivers';
import { Coffee, Clock, Award, DollarSign, Trash2, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { SIMULATION_CONFIG } from '../config/simulation';

interface DriverLoungeProps {
  state: GameSaveState;
  onHireDriver: (driverCandidate: DriverCandidate) => void;
  onRestDriver: (driverId: string) => void;
  onBonusDriver: (driverId: string) => void;
  onFireDriver: (driverId: string) => void;
  onAssignDriverTruck: (driverId: string, truckId: string | null) => void;
  onRaiseDriverPay: (driverId: string) => void;
}

export const DriverLounge: React.FC<DriverLoungeProps> = ({
  state,
  onHireDriver,
  onRestDriver,
  onBonusDriver,
  onFireDriver,
  onAssignDriverTruck,
  onRaiseDriverPay,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'recruitment' | 'payroll'>('roster');
  const [expandedDriverIds, setExpandedDriverIds] = useState<Set<string>>(new Set());
  const [driverMarket, setDriverMarket] = useState<DriverCandidate[]>(() => 
    generateDriverMarket(4, (state?.drivers || []).map(d => d.name))
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDriverMarket(generateDriverMarket(4, (state?.drivers || []).map(d => d.name)));
    }, 90000);

    return () => window.clearInterval(interval);
  }, [state?.drivers]);

  const driversList = state?.drivers || [];
  const trucksList = state?.trucks || [];

  const handleMarketHire = (candidate: DriverCandidate) => {
    // Hard guard against hiring the same driver multiple times
    if (driversList.some(d => d.name.toLowerCase() === candidate.name.toLowerCase())) {
      return;
    }

    onHireDriver(candidate);

    const allExcluded = [
      ...driversList.map(d => d.name),
      candidate.name,
      ...driverMarket.map(c => c.name)
    ];

    setDriverMarket(prev => [
      ...prev.filter(c => c.marketId !== candidate.marketId && c.name.toLowerCase() !== candidate.name.toLowerCase()),
      generateDriverCandidate(allExcluded)
    ].slice(-4));
  };

  const totalDailyPayroll = driversList.reduce((sum, d) => sum + (d?.dailySalary || 0), 0);
  const avgSafetyScore = driversList.length > 0 
    ? Math.floor(driversList.reduce((sum, d) => sum + (d?.cleanRecordScore || 100), 0) / driversList.length) 
    : 100;

  const toggleExpand = (driverId: string) => {
    setExpandedDriverIds(prev => {
      const next = new Set(prev);
      if (next.has(driverId)) next.delete(driverId);
      else next.add(driverId);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      
      {/* Sub navigation */}
      <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveSubTab('roster')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition active:scale-95 ${
            activeSubTab === 'roster'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Drivers Roster ({driversList.length})
        </button>
        <button
          onClick={() => setActiveSubTab('recruitment')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition active:scale-95 ${
            activeSubTab === 'recruitment'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Recruitment
        </button>
        <button
          onClick={() => setActiveSubTab('payroll')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition active:scale-95 ${
            activeSubTab === 'payroll'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Payroll & Safety
        </button>
      </div>

      {/* ROSTER VIEW */}
      {activeSubTab === 'roster' && (
        <div className="space-y-3">
          {driversList.map((driver) => {
            if (!driver) return null;

            const isExpanded = expandedDriverIds.has(driver.id);
            const isOwner = driver.id === 'driver-player';
            const isAssignedToRoute = Boolean(driver.assignedTruckId && state.activeContracts?.some(c => c?.assignedDriverId === driver.id));
            const truck = trucksList.find(t => t.id === driver.assignedTruckId);
            const morale = driver.moralePercent ?? 100;

            return (
              <div 
                key={driver.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md hover:border-slate-700 transition space-y-3"
              >
                {/* Compact Header (Always Visible) */}
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(driver.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="text-2xl w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                        {driver.avatar || '👨‍✈️'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[8px] font-bold px-1 py-0.2 rounded-full border border-slate-900">
                        L{driver.skillLevel}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                        {driver.name}
                        {isOwner && <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">Owner</span>}
                      </h4>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isAssignedToRoute ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span>{isAssignedToRoute ? 'In Transit' : 'Available'}</span>
                        <span>•</span>
                        <span>{truck ? truck.name.split(' ')[0] : 'No Rig'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-emerald-400">${driver.dailySalary}/d</div>
                      <div className="text-[9px] text-slate-400">Safety: {driver.cleanRecordScore}%</div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(driver.id);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="space-y-3 pt-3 border-t border-slate-800 animate-in fade-in zoom-in-95">
                    
                    {/* Core Metrics Grid */}
                    <div className="grid grid-cols-4 gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Fatigue</span>
                        <div className="flex items-center justify-between mt-0.5">
                          <strong className="text-slate-200 font-mono">{Math.floor(driver.fatiguePercent)}%</strong>
                        </div>
                        <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-1">
                          <div className={`h-full ${driver.fatiguePercent < 60 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${driver.fatiguePercent}%` }} />
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Shift</span>
                        <div className="flex items-center justify-between mt-0.5">
                          <strong className="text-slate-200 font-mono">{driver.eldShiftHoursRemaining.toFixed(1)}h</strong>
                        </div>
                        <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-1">
                          <div className="bg-blue-500 h-full" style={{ width: `${(driver.eldShiftHoursRemaining / 11) * 100}%` }} />
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Safety</span>
                        <div className="flex items-center justify-between mt-0.5">
                          <strong className="text-emerald-400 font-mono">{driver.cleanRecordScore}%</strong>
                        </div>
                        <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-1">
                          <div className="bg-emerald-500 h-full" style={{ width: `${driver.cleanRecordScore}%` }} />
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Morale</span>
                        <div className="flex items-center justify-between mt-0.5">
                          <strong className="text-amber-400 font-mono">{Math.floor(morale)}%</strong>
                        </div>
                        <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-1">
                          <div className="bg-amber-500 h-full" style={{ width: `${morale}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Equipment Assignment & Traits */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">Assigned Rig</label>
                        <select
                          value={driver.assignedTruckId || ''}
                          onChange={(e) => onAssignDriverTruck(driver.id, e.target.value || null)}
                          disabled={isAssignedToRoute}
                          className="w-full bg-slate-950 border border-slate-700 text-blue-400 rounded-xl p-2 text-xs font-semibold focus:outline-none focus:border-blue-500 disabled:opacity-50"
                        >
                          <option value="">(No Rig Assigned)</option>
                          {trucksList.map((t) => (
                            <option 
                              key={t.id} 
                              value={t.id}
                              disabled={Boolean(t.assignedDriverId && t.assignedDriverId !== driver.id)}
                            >
                              {t.imageIcon} {t.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">Specialist Traits</label>
                        <div className="flex flex-wrap gap-1 bg-slate-950 p-2 rounded-xl border border-slate-800 min-h-[38px] items-center">
                          {driver.traits && driver.traits.length > 0 ? (
                            driver.traits.map((trait, tIdx) => (
                              <span key={tIdx} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-lg border border-blue-500/20">
                                ⚡ {trait}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">No special traits</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Bar: Raise Pay, Rest, Bonus, Fire */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => onRaiseDriverPay(driver.id)}
                        className="py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
                        title="Raise Pay (+30$/day, +Morale)"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Raise Pay</span>
                      </button>

                      <button
                        onClick={() => onRestDriver(driver.id)}
                        disabled={isAssignedToRoute}
                        className="py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition disabled:opacity-40 flex items-center justify-center space-x-1"
                        title="Rest Driver"
                      >
                        <Coffee className="w-3.5 h-3.5" />
                        <span>Rest</span>
                      </button>

                      <button
                        onClick={() => onBonusDriver(driver.id)}
                        disabled={state.cash < 200}
                        className="py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition disabled:opacity-40 flex items-center justify-center space-x-1"
                        title="Award $200 Bonus"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Bonus ($200)</span>
                      </button>

                      {!isOwner ? (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to terminate ${driver.name}'s employment contract?`)) {
                              onFireDriver(driver.id);
                            }
                          }}
                          disabled={isAssignedToRoute}
                          className="py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition disabled:opacity-40 flex items-center justify-center space-x-1"
                          title="Terminate Contract"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Fire Driver</span>
                        </button>
                      ) : (
                        <div className="py-1.5 bg-slate-950 text-slate-500 text-[10px] font-bold rounded-xl border border-slate-800 flex items-center justify-center">
                          Owner Operator
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
        
      {/* RECRUITMENT VIEW */}
      {activeSubTab === 'recruitment' && (
        <div className="space-y-3">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-300 flex items-center justify-between">
            <div>
              <span className="font-semibold">Commercial Driver Market</span>
              <span className="text-slate-500 ml-2">New candidates rotate in regularly</span>
            </div>
            <span className="text-blue-400 font-bold">{driverMarket.length} Candidates</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {driverMarket.map((candidate) => {
              const hireFee =
                candidate.skillLevel *
                SIMULATION_CONFIG.finance.staff.recruitingFeePerSkillLevel;
              const canAfford = state.cash >= hireFee;

              return (
                <div
                  key={candidate.marketId}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl p-2 bg-slate-800 rounded-xl">
                        {candidate.avatar}
                      </div>

                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {candidate.name}
                        </h4>

                        <div className="text-[10px] text-blue-400 font-semibold">
                          {candidate.cdlClass} • {candidate.experienceYears} Yrs Experience
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          {candidate.qualityTier} Driver
                          {candidate.qualityTier === 'Elite' && (
                            <span className="ml-1 text-amber-400 font-bold">★ Rare</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400 font-mono">
                        ${hireFee.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        Recruitment Fee
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2">
                    <div>
                      <span className="text-slate-500 text-[9px] uppercase font-bold">
                        Specialty
                      </span>
                      <div className="text-xs text-blue-300 font-semibold">
                        {candidate.specialty}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[9px] uppercase font-bold">
                        Background
                      </span>
                      <div className="text-[10px] text-slate-300 leading-relaxed">
                        {candidate.background}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[9px] block">
                        Skill
                      </span>
                      <strong className="text-blue-400 font-bold">
                        L{candidate.skillLevel}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[9px] block">
                        Safety
                      </span>
                      <strong className="text-emerald-400 font-bold">
                        {candidate.cleanRecordScore}%
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[9px] block">
                        Pay Demand
                      </span>
                      <strong className="text-amber-400 font-mono font-bold">
                        ${candidate.dailySalary}/d
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-2">
                    <div className="flex flex-wrap gap-1">
                      {candidate.traits.length > 0 ? (
                        candidate.traits.map((trait, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-800 text-blue-300 text-[9px] font-bold rounded"
                          >
                            ⚡ {trait}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-slate-500">
                          No declared traits
                        </span>
                      )}
                    </div>

                    {(() => {
                      const isAlreadyEmployed = driversList.some(d => d.name.toLowerCase() === candidate.name.toLowerCase());

                      return (
                        <button
                          onClick={() => handleMarketHire(candidate)}
                          disabled={!canAfford || isAlreadyEmployed}
                          className={`px-4 py-2 font-bold text-xs rounded-xl transition ${
                            isAlreadyEmployed
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                              : 'bg-blue-600 hover:bg-blue-500 active:scale-95 text-white disabled:opacity-40'
                          }`}
                        >
                          {isAlreadyEmployed ? 'Already Employed' : 'Hire Driver'}
                        </button>
                      );
                    })()}
                </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PAYROLL & SAFETY COMPLIANCE VIEW */}
      {activeSubTab === 'payroll' && (
        <div className="space-y-3">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Company Driver Payroll & Overhead</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 text-[10px] block">Total Daily Payroll</span>
                <strong className="text-amber-400 font-mono text-base font-extrabold">${totalDailyPayroll.toLocaleString()}/day</strong>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block">Fleet Safety Rating</span>
                <strong className="text-emerald-400 font-mono text-base font-extrabold">{avgSafetyScore}% Excellent</strong>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              Driver salaries are deducted automatically from company revenue. Keeping high morale and clean driving records reduces DOT weigh station fines!
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
