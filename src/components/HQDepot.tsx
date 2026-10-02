import { useState } from 'react';
import type { GameSaveState, DepotUpgrade, StaffRole, TruckRegion } from '../types/game';
import { getDepotCosts } from '../data/depots';
import { SIMULATION_CONFIG } from '../config/simulation';
import { Building2, ArrowUpCircle, Zap, Landmark, Briefcase, ShieldCheck, Settings as SettingsIcon, Globe, MapPin, CheckCircle } from 'lucide-react';
import { HIRABLE_DRIVERS_POOL } from '../data/drivers';

import { SkillTree } from './SkillTree';
import { FinanceHub } from './FinanceHub';
import { StaffManager } from './StaffManager';
import { DriverLounge } from './DriverLounge';
import { CompanyProfileView } from './CompanyProfileView';
import { Settings } from './Settings';

interface HQDepotProps {
  state: GameSaveState;
  onUpgradeDepotBuilding: (buildingKey: keyof DepotUpgrade) => void;
  onUpgradeSkill: (skillId: string) => void;
  onTakeLoan: (principal: number, termMonths: number, title: string, lender: string) => void;
  onRepayLoan: (loanId: string) => void;
  onHireStaff: (role: StaffRole, name: string, salary: number, skill: number, bonus: number) => void;
  onFireStaff: (staffId: string) => void;
  onUpgradeStructure: (newStructure: 'Sole Proprietorship' | 'LLC' | 'Corporation' | 'Publicly Traded (IPO)') => void;
  onUnlockRegion: (region: TruckRegion) => void;
  onBuyHeavyHaulPermit: (region: TruckRegion) => void;
  onResetSave: () => void;
  onImportSave: (newState: GameSaveState) => void;
  onAcceptInvestor: (roundId: string) => void;
  onLaunchIPO: () => void;
  onPayDividend: (amount: number) => void;
  onClaimMilestone?: (milestoneId: string) => void;
  onHireDriver: (driverCandidate: typeof HIRABLE_DRIVERS_POOL[0]) => void;
  onRestDriver: (driverId: string) => void;
  onBonusDriver: (driverId: string) => void;
  onFireDriver: (driverId: string) => void;
  onAssignDriverTruck: (driverId: string, truckId: string | null) => void;
  onRaiseDriverPay: (driverId: string) => void;
  onToggleAutoDispatch?: () => void;
  onNewGame: () => void;
  onSwitchGame: (saveId: string) => void;
  onDeleteGame: (saveId: string) => void;
}

type HQSubTab = 'profile' | 'depot' | 'skills' | 'finance' | 'staff' | 'settings';

export const HQDepot: React.FC<HQDepotProps> = ({
  state, onUpgradeDepotBuilding, onUpgradeSkill,
  onTakeLoan, onRepayLoan, onHireStaff, onFireStaff,
  onUpgradeStructure, onResetSave, onImportSave, onBuyHeavyHaulPermit,
  onAcceptInvestor, onLaunchIPO, onPayDividend, onClaimMilestone,
  onHireDriver, onRestDriver, onBonusDriver, onFireDriver, onAssignDriverTruck, onRaiseDriverPay,
  onToggleAutoDispatch,
  onNewGame, onSwitchGame, onDeleteGame
}) => {
  const [subTab, setSubTab] = useState<HQSubTab>('profile');
  const [staffSubTab, setStaffSubTab] = useState<'office' | 'drivers'>('office');

  const tabs: { id: HQSubTab; label: string; icon: typeof Building2 }[] = [
    { id: 'profile', label: 'Company Info', icon: ShieldCheck },
    { id: 'depot', label: 'Depot', icon: Building2 },
    { id: 'skills', label: 'Skills', icon: Zap },
    { id: 'finance', label: 'Finance', icon: Landmark },
    { id: 'staff', label: 'Staff & Drivers', icon: Briefcase },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const buildingData = getDepotCosts(state.depot);

  const regionPermits: { id: TruckRegion; label: string; cost: number; level: number; description: string }[] = [
    { id: 'Europe', label: 'European Operating Permit', cost: 50000, level: 3, description: 'Unlocks transit rights for European corridors (EU/UK/Scandinavia).' },
    { id: 'Asia', label: 'Asian Logistics Permit', cost: 150000, level: 5, description: 'Unlocks high-demand expressways in Japan, Korea, and Southeast Asia.' },
    { id: 'Africa', label: 'African Continental Permit', cost: 100000, level: 4, description: 'Unlocks trade corridors across North, West, East, and Southern Africa.' },
  ];

  return (
    <div className="space-y-6">
      {/* HQ Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-blue-400" />
          <span>Headquarters & Logistics</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Central command for infrastructure, skills, finance, staff, and company profile.
        </p>
      </div>

      {/* Internal Modern Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {subTab === 'depot' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(Object.keys(buildingData) as Array<keyof DepotUpgrade>).map((key) => {
              const building = buildingData[key];
              const isMax = building.currentLevel >= building.maxLevel;
              const canAfford = state.cash >= building.nextCost && !isMax;
              return (
                <div
                  key={key}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl p-2.5 bg-slate-800 rounded-2xl">{building.icon}</div>
                        <div>
                          <h3 className="font-bold text-white text-base">{building.title}</h3>
                          <div className="text-xs text-blue-400 font-semibold">Tier {building.currentLevel} / {building.maxLevel}</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg">Level {building.currentLevel}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{building.description}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="font-mono text-emerald-400 font-bold text-sm">
                      {isMax ? 'MAX LEVEL' : `$${building.nextCost.toLocaleString()}`}
                    </div>
                    <div className="flex items-center space-x-2">
                      {key === 'dispatchAILevel' && building.currentLevel > 0 && onToggleAutoDispatch && (
                        <button
                          onClick={onToggleAutoDispatch}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
                            (state.depot.isAutoDispatchEnabled ?? true)
                              ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-600/30'
                              : 'bg-rose-600/20 text-rose-300 border-rose-500/30 hover:bg-rose-600/30'
                          }`}
                        >
                          {(state.depot.isAutoDispatchEnabled ?? true) ? '🤖 AI Active (Pause)' : '⏸️ AI Paused (Resume)'}
                        </button>
                      )}
                      {!isMax && (
                        <button
                          onClick={() => onUpgradeDepotBuilding(key)}
                          disabled={!canAfford}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition disabled:opacity-40 flex items-center space-x-1.5"
                        >
                          <ArrowUpCircle className="w-4 h-4" />
                          <span>Upgrade Infrastructure</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Region Permits Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 mt-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>International Logistics Permits</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Secure regional operating licenses to expand your freight network globally.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {regionPermits.map((permit) => {
                const isUnlocked = state.unlockedRegions.includes(permit.id);
                const canAfford = state.cash >= permit.cost;
                const levelMet = state.companyLevel >= permit.level;
                
                return (
                  <div key={permit.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-xs">{permit.label}</div>
                      {isUnlocked ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Locked</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{permit.description}</p>
                    
                    {!isUnlocked && (
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className={`text-xs font-bold font-mono ${canAfford ? 'text-emerald-400' : 'text-rose-400'}`}>${permit.cost.toLocaleString()}</div>
                          <div className={`text-[9px] font-bold ${levelMet ? 'text-blue-400' : 'text-slate-500'}`}>Req. Level {permit.level}</div>
                        </div>
                        <button
                          onClick={() => onUnlockRegion(permit.id)}
                          disabled={!canAfford || !levelMet}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-lg transition disabled:opacity-30"
                        >
                          Buy Permit
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Heavy-Haul Permits Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 mt-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Heavy-Haul & Overweight Permits</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Authorizes regional gross-weight exceptions. Truck and trailer payload ratings still apply.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.keys(SIMULATION_CONFIG.compliance.heavyHaul.permitCost) as TruckRegion[]).map((region) => {
                const cost = SIMULATION_CONFIG.compliance.heavyHaul.permitCost[region];
                const level = SIMULATION_CONFIG.compliance.heavyHaul.minimumCompanyLevel[region];
                const grossLimit = SIMULATION_CONFIG.compliance.heavyHaul.maximumPermittedGrossWeightTons[region];
                const isActive = (state.heavyHaulPermits || []).includes(region);
                const hasOperatingPermit = (state.unlockedRegions || ['America']).includes(region);
                const canAfford = state.cash >= cost;
                const levelMet = state.companyLevel >= level;

                return (
                  <div key={region} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-xs">{region} Heavy-Haul Authorization</div>
                      {isActive ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Not Acquired</span>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Permits gross vehicle weight up to {grossLimit}T in {region}. Requires Class A + Oversized Heavy driver qualification.
                    </p>

                    {!isActive && (
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className={canAfford ? 'text-xs font-bold font-mono text-emerald-400' : 'text-xs font-bold font-mono text-rose-400'}>
                            ${cost.toLocaleString()}
                          </div>
                          <div className={levelMet ? 'text-[9px] font-bold text-blue-400' : 'text-[9px] font-bold text-slate-500'}>
                            Req. Level {level}
                          </div>
                          {!hasOperatingPermit && (
                            <div className="text-[9px] font-bold text-amber-400">
                              Regional Operating Permit Required
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => onBuyHeavyHaulPermit(region)}
                          disabled={!canAfford || !levelMet || !hasOperatingPermit}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] rounded-lg transition disabled:opacity-30"
                        >
                          Buy Permit
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {subTab === 'skills' && (
        <SkillTree state={state} onUpgradeSkill={onUpgradeSkill} />
      )}

      {subTab === 'finance' && (
        <FinanceHub
          state={state}
          onTakeLoan={onTakeLoan}
          onRepayLoan={onRepayLoan}
          onAcceptInvestor={onAcceptInvestor}
          onLaunchIPO={onLaunchIPO}
          onPayDividend={onPayDividend}
          onClaimMilestone={onClaimMilestone}
        />
      )}

      {subTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setStaffSubTab('office')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                staffSubTab === 'office' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🏢 Office Staff ({state.staff?.length || 0})
            </button>
            <button
              onClick={() => setStaffSubTab('drivers')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                staffSubTab === 'drivers' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👨‍✈️ Drivers Roster ({state.drivers?.length || 0})
            </button>
          </div>

          {staffSubTab === 'office' ? (
            <StaffManager state={state} onHireStaff={onHireStaff} onFireStaff={onFireStaff} />
          ) : (
            <DriverLounge
              state={state}
              onHireDriver={onHireDriver}
              onRestDriver={onRestDriver}
              onBonusDriver={onBonusDriver}
              onFireDriver={onFireDriver}
              onAssignDriverTruck={onAssignDriverTruck}
              onRaiseDriverPay={onRaiseDriverPay}
            />
          )}
        </div>
      )}

      {subTab === 'profile' && (
        <CompanyProfileView state={state} onUpgradeStructure={onUpgradeStructure} />
      )}

      {subTab === 'settings' && (
        <Settings 
          state={state} 
          onResetSave={onResetSave} 
          onImportSave={onImportSave}
          onNewGame={onNewGame}
          onSwitchGame={onSwitchGame}
          onDeleteGame={onDeleteGame}
        />
      )}
    </div>
  );
};
