import { useState, useMemo } from 'react';
import type { GameSaveState, DepotUpgrade, StaffRole, TruckRegion, HubLocation, TruckClass } from '../types/game';
import { getDepotCosts } from '../data/depots';
import { Building2, ArrowUpCircle, Zap, Landmark, Briefcase, ShieldCheck, Settings as SettingsIcon, Globe, CheckCircle, Truck as TruckIcon, Wrench, Users, Search, SlidersHorizontal, Gauge } from 'lucide-react';
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
  onBuyHub: (hubId: string) => void;
  onSetActiveHub: (hubId: string) => void;
  onRelocateTruckToHub: (truckId: string, targetHubId: string) => void;
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
type HubViewTab = 'hubs' | 'fleet' | 'repair' | 'hr';

export const HQDepot: React.FC<HQDepotProps> = ({
  state, onUpgradeDepotBuilding, onUpgradeSkill,
  onTakeLoan, onRepayLoan, onHireStaff, onFireStaff,
  onUpgradeStructure, onResetSave, onImportSave, onBuyHeavyHaulPermit,
  onAcceptInvestor, onLaunchIPO, onPayDividend, onClaimMilestone,
  onHireDriver, onRestDriver, onBonusDriver, onFireDriver, onAssignDriverTruck, onRaiseDriverPay,
  onToggleAutoDispatch,
  onNewGame, onSwitchGame, onDeleteGame,
  onBuyHub, onSetActiveHub, onRelocateTruckToHub
}) => {
  const [subTab, setSubTab] = useState<HQSubTab>('profile');
  const [selectedRegion, setSelectedRegion] = useState<TruckRegion>('America');
  const [hubViewTab, setHubViewTab] = useState<HubViewTab>('hubs');

  // Fleet management filters for active hub
  const [fleetSearchQuery, setFleetSearchQuery] = useState('');
  const [fleetStatusFilter, setFleetStatusFilter] = useState<'all' | 'idle' | 'in_transit' | 'maintenance' | 'shipping'>('all');
  const [fleetClassFilter, setFleetClassFilter] = useState<'all' | TruckClass>('all');

  const tabs: { id: HQSubTab; label: string; icon: typeof Building2 }[] = [
    { id: 'profile', label: 'Company Info', icon: ShieldCheck },
    { id: 'depot', label: 'Hub & Terminals', icon: Building2 },
    { id: 'skills', label: 'Skills', icon: Zap },
    { id: 'finance', label: 'Finance', icon: Landmark },
    { id: 'staff', label: 'Staff & Drivers', icon: Briefcase },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const buildingData = getDepotCosts(state.depot);
  const hubsList: HubLocation[] = state.hubs || [];
  const activeHub = hubsList.find(h => h.id === state.activeHubId) || hubsList[0];

  const regionHubs = hubsList.filter(h => h.region === selectedRegion);

  const activeHubTrucks = state.trucks.filter(t => t.hubId === activeHub?.id || (!t.hubId && t.stationedHub === activeHub?.region));

  const filteredHubFleet = useMemo(() => {
    const query = fleetSearchQuery.trim().toLowerCase();
    return activeHubTrucks.filter(truck => {
      const matchesSearch = !query || truck.name.toLowerCase().includes(query) || truck.brand.toLowerCase().includes(query);
      const matchesStatus = fleetStatusFilter === 'all' || truck.status === fleetStatusFilter;
      const matchesClass = fleetClassFilter === 'all' || truck.modelClass === fleetClassFilter;
      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [activeHubTrucks, fleetSearchQuery, fleetStatusFilter, fleetClassFilter]);

  return (
    <div className="space-y-6">
      {/* HQ Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-blue-400" />
          <span>Headquarters & Regional Hubs</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Active Hub: <strong className="text-amber-400">{activeHub?.name}</strong> ({activeHub?.cityName}) • Central command for global logistics terminals.
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
      {subTab === 'profile' && <CompanyProfileView state={state} onUpgradeStructure={onUpgradeStructure} />}
      {subTab === 'skills' && <SkillTree state={state} onUpgradeSkill={onUpgradeSkill} />}
      {subTab === 'finance' && <FinanceHub state={state} onTakeLoan={onTakeLoan} onRepayLoan={onRepayLoan} onAcceptInvestor={onAcceptInvestor} onLaunchIPO={onLaunchIPO} onPayDividend={onPayDividend} onClaimMilestone={onClaimMilestone} />}
      {subTab === 'staff' && <StaffManager state={state} onHireStaff={onHireStaff} onFireStaff={onFireStaff} onHireDriver={onHireDriver} onRestDriver={onRestDriver} onBonusDriver={onBonusDriver} onFireDriver={onFireDriver} onAssignDriverTruck={onAssignDriverTruck} onRaiseDriverPay={onRaiseDriverPay} />}
      {subTab === 'settings' && <Settings state={state} onResetSave={onResetSave} onImportSave={onImportSave} onNewGame={onNewGame} onSwitchGame={onSwitchGame} onDeleteGame={onDeleteGame} />}

      {subTab === 'depot' && (
        <div className="space-y-6">
          
          {/* Regional Hub Selector Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Global Hub Network & Terminals</span>
              </h3>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                Active: {activeHub?.name}
              </span>
            </div>

            {/* Region Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Select Region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as TruckRegion)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-blue-500"
              >
                <option value="America">🇺🇸 America</option>
                <option value="Europe">🇪🇺 Europe</option>
                <option value="Africa">🌍 Africa</option>
                <option value="Asia">🌏 Asia</option>
                <option value="Electric EV">⚡ Electric EV</option>
              </select>
            </div>

            {/* Hubs in Selected Region */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {regionHubs.map((hub) => {
                const isCurrentActive = hub.id === activeHub?.id;
                const canAfford = state.cash >= hub.cost;
                const levelMet = state.companyLevel >= hub.levelRequirement;

                return (
                  <div key={hub.id} className={`p-4 rounded-xl border space-y-3 ${isCurrentActive ? 'bg-blue-950/30 border-blue-500/50 shadow-lg' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs">{hub.name}</span>
                          {hub.isHq && <span className="text-[8px] font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-500/30">HQ</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{hub.cityName}</div>
                      </div>
                      {hub.isUnlocked ? (
                        isCurrentActive ? (
                          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                            Active View
                          </span>
                        ) : (
                          <button
                            onClick={() => onSetActiveHub(hub.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg transition"
                          >
                            Switch to Hub
                          </button>
                        )
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Locked</span>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 leading-relaxed">{hub.description}</p>

                    {!hub.isUnlocked && (
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className={`text-xs font-bold font-mono ${canAfford ? 'text-emerald-400' : 'text-rose-400'}`}>${hub.cost.toLocaleString()}</div>
                          <div className={`text-[9px] font-bold ${levelMet ? 'text-blue-400' : 'text-slate-500'}`}>Req. Level {hub.levelRequirement}</div>
                        </div>
                        <button
                          onClick={() => onBuyHub(hub.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-lg transition"
                        >
                          Establish Hub
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE HUB LOCALIZED WORKSPACE (Fleets with Filters, Repair Bay, HR) */}
          {activeHub && activeHub.isUnlocked && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                    <span>🏢 Workspace: {activeHub.name}</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">Managing local assets stationed at {activeHub.cityName}.</p>
                </div>

                {/* Sub-tabs for active hub */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setHubViewTab('fleet')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${hubViewTab === 'fleet' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                  >
                    <TruckIcon className="w-3 h-3" />
                    <span>Hub Fleet ({activeHubTrucks.length})</span>
                  </button>
                  <button
                    onClick={() => setHubViewTab('repair')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${hubViewTab === 'repair' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                  >
                    <Wrench className="w-3 h-3" />
                    <span>Repair Bay</span>
                  </button>
                  <button
                    onClick={() => setHubViewTab('hr')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${hubViewTab === 'hr' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                  >
                    <Users className="w-3 h-3" />
                    <span>HR Lounge</span>
                  </button>
                </div>
              </div>

              {/* Hub Fleet View with Clean Filters & Search */}
              {hubViewTab === 'fleet' && (
                <div className="space-y-4">
                  {/* Fleet Search & Filter Toolbar */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="text"
                          value={fleetSearchQuery}
                          onChange={(e) => setFleetSearchQuery(e.target.value)}
                          placeholder="Search hub fleet by name or brand..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={fleetStatusFilter}
                          onChange={(e: any) => setFleetStatusFilter(e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                        >
                          <option value="all">All Statuses</option>
                          <option value="idle">Idle in Garage</option>
                          <option value="in_transit">En-route</option>
                          <option value="maintenance">In Maintenance</option>
                          <option value="shipping">In Shipping</option>
                        </select>

                        <select
                          value={fleetClassFilter}
                          onChange={(e: any) => setFleetClassFilter(e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                        >
                          <option value="all">All Classes</option>
                          <option value="Class 3 Light">Light Box</option>
                          <option value="Class 6 Medium">Medium</option>
                          <option value="Class 8 Highway">Highway</option>
                          <option value="Class 8 Heavy">Heavy Duty</option>
                          <option value="Super Hauler">Super Hauler</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {filteredHubFleet.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500 italic border border-dashed border-slate-800 rounded-xl">
                      No trucks match your filter criteria at {activeHub.name}.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredHubFleet.map(truck => (
                        <div key={truck.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5 shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-white text-xs">{truck.name}</div>
                              <div className="text-[10px] text-blue-400 font-mono">{truck.brand} • {truck.modelClass}</div>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{Math.floor(truck.conditionPercent)}% Cond</span>
                          </div>

                          <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between bg-slate-900 p-2 rounded-lg">
                            <span>Odometer: {Math.floor(truck.odometerMiles || 0).toLocaleString()} mi</span>
                            <span className={truck.status === 'in_transit' ? 'text-amber-400 font-bold' : truck.status === 'maintenance' ? 'text-rose-400 font-bold' : truck.status === 'shipping' ? 'text-blue-400 font-bold' : 'text-emerald-400 font-bold'}>
                              {truck.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                            <select
                              id={`hub-relocate-${truck.id}`}
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white outline-none"
                              defaultValue=""
                            >
                              <option value="" disabled>Relocate/Ship to Hub ($18k)...</option>
                              {hubsList.map(h => (
                                h.isUnlocked && h.id !== activeHub.id ? (
                                  <option key={h.id} value={h.id}>{h.name} ({h.region})</option>
                                ) : null
                              ))}
                            </select>
                            <button
                              onClick={() => {
                                const sel = document.getElementById(`hub-relocate-${truck.id}`) as HTMLSelectElement;
                                if (sel && sel.value) {
                                  onRelocateTruckToHub(truck.id, sel.value);
                                }
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-lg transition"
                            >
                              Ship
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Hub Repair Bay View */}
              {hubViewTab === 'repair' && (
                <div className="space-y-3">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white">Local Hub Repair Bay (Tier {state.depot.repairBayLevel})</div>
                      <span className="text-[10px] font-mono text-emerald-400">15% Discount per Tier</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      All maintenance and servicing orders for trucks stationed at {activeHub.name} are processed through this terminal's service bays.
                    </p>
                    <div className="pt-2">
                      <span className="text-xs text-slate-400 italic">Manage servicing directly in the Fleet Manager or Inspection Bay for each vehicle.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Hub HR Management View */}
              {hubViewTab === 'hr' && (
                <div className="space-y-3">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-white">Local Driver Lounge & Personnel</div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Drivers stationed at {activeHub.name} utilize this terminal's driver rest lounge (+{(state.depot.driverLoungeLevel * 20)}% fatigue recovery speed).
                    </p>
                    <div className="pt-2">
                      <span className="text-xs text-slate-400 italic">Manage hiring, salaries, and rest breaks in the Staff & Drivers tab.</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Depot Building Upgrades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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

        </div>
      )}
    </div>
  );
};
