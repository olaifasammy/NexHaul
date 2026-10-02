import React, { useState } from 'react';
import type { GameSaveState, Truck, InsuranceCoverageTier } from '../types/game';
import { getRefuelCost } from '../engine/simulation';
import { getMaintenanceQuote } from '../engine/maintenancePricing';
import { TruckInspectionModal } from './TruckInspectionModal';
import { TruckSpecsModal } from './TruckSpecsModal';
import { ServiceApprovalModal } from './ServiceApprovalModal';
import { RepairBayView } from './RepairBayView';
import { TruckUpgradeModal } from './TruckUpgradeModal';
import type { TabType } from './Navigation';
import { Wrench, Fuel, X, Info, Gauge, Flame, Clock, MapPin, Droplet, CircleDot, Radio } from 'lucide-react';

interface FleetManagerProps {
  state: GameSaveState;
  onRefuelTruck: (truckId: string) => void;
  onRepairTruck: (truckId: string) => void;
  onExpediteRepair: (truckId: string) => void;
  onServiceOil: (truckId: string) => void;
  onServiceTires: (truckId: string) => void;
  onServiceBrakes: (truckId: string) => void;
  onServiceBattery: (truckId: string) => void;
  onServiceSuspension: (truckId: string) => void;
  onRefillDef: (truckId: string) => void;
  onInstallPrePass: (truckId: string) => void;
  onFileInsuranceClaim: (truckId: string) => void;
  onAttachTrailer: (truckId: string, trailerId: string | null) => void;
  onSetInsuranceTier: (truckId: string, tier: InsuranceCoverageTier) => void;
  onSetTrailerInsuranceTier: (trailerId: string, tier: InsuranceCoverageTier) => void;
  onSellTruck: (truckId: string) => void;
  onSellTrailer: (trailerId: string) => void;
  onSubmitUpgrades?: (truckId: string, selectedParts: Array<keyof Truck['upgrades']>, totalCost: number, totalSeconds: number, scheduleAfterJob: boolean) => void;
  onNavigateTab?: (tab: TabType, truckId?: string) => void;
}

export const FleetManager: React.FC<FleetManagerProps> = ({
  state,
  onRefuelTruck,
  onRepairTruck,
  onExpediteRepair,
  onServiceOil,
  onServiceTires,
  onServiceBrakes,
  onServiceBattery,
  onServiceSuspension,
  onRefillDef,
  onInstallPrePass,
  onFileInsuranceClaim,
  onAttachTrailer,
  onSetInsuranceTier,
  onSetTrailerInsuranceTier,
  onSellTruck,
  onSellTrailer,
  onSubmitUpgrades,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'garage' | 'yard' | 'repair'>('garage');
  const [inspectTruck, setInspectTruck] = useState<Truck | null>(null);
  const [serviceModalTruck, setServiceModalTruck] = useState<Truck | null>(null);
  const [upgradeTruck, setUpgradeTruck] = useState<Truck | null>(null);
  const [expandedTruckId, setExpandedTruckId] = useState<string | null>(null);

  const trucksList = state?.trucks || [];
  const trailersList = state?.trailers || [];
  const driversList = state?.drivers || [];

  return (
    <div className="space-y-4">
      
      {/* Automated Dispatch Active Banner */}
      {((state.depot?.dispatchAILevel || 0) > 0 && (state.depot?.isAutoDispatchEnabled ?? true)) && (
        <div className="bg-blue-600/15 border border-blue-500/30 px-3.5 py-2 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="text-lg animate-ai-jump-bend">🤖</span>
            <div className="flex items-center -space-x-1">
              {[...Array(state.depot.dispatchAILevel)].map((_, i) => (
                <span key={i} className="text-amber-400 text-xs drop-shadow">⭐</span>
              ))}
            </div>
          </div>
          <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 px-2.5 py-0.5 rounded-lg border border-blue-500/30 font-bold">
            AI Managing Fleet
          </span>
        </div>
      )}

      {/* Primary Sub navigation */}
      <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveSubTab('garage')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition active:scale-95 ${
            activeSubTab === 'garage'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          My Rigs ({trucksList.length})
        </button>
        <button
          onClick={() => setActiveSubTab('yard')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition active:scale-95 ${
            activeSubTab === 'yard'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          My Trailers ({trailersList.length})
        </button>
        <button
          onClick={() => setActiveSubTab('repair')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition active:scale-95 ${
            activeSubTab === 'repair'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Repair Bay
        </button>
      </div>

      {activeSubTab === 'repair' && (
        <RepairBayView state={state} onExpediteRepair={onExpediteRepair} />
      )}

      {/* GARAGE VIEW */}
      {activeSubTab === 'garage' && (
        <div className="space-y-3">
          {trucksList.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
              <div className="text-3xl">🚚</div>
              <h4 className="text-white font-bold text-sm">Garage Empty</h4>
              <p className="text-xs text-slate-400">Visit the Dealership to acquire your first commercial rig!</p>
            </div>
          ) : (
            trucksList.map((truck) => {
              if (!truck) return null;

              const driver = driversList.find(d => d && d.id === truck.assignedDriverId);
              const isAssignedToContract = Boolean(truck.assignedContractId);
              const isDrivingInTransit = truck.status === 'in_transit';
              const isServicingInBay = truck.status === 'maintenance';

              const maxFuelL = truck.maxFuelLitres || (truck.maxFuelGallons ? truck.maxFuelGallons * 3.785 : 850);
              const currentFuelL = truck.currentFuelLitres ?? (truck.currentFuelGallons ? truck.currentFuelGallons * 3.785 : maxFuelL);

              const condPercent = truck.conditionPercent ?? 100;
              const oilPercent = truck.oilLifePercent ?? 100;
              const tirePercent = truck.tireTreadPercent ?? 100;

              const sameModelTrucks = trucksList.filter(t => t && (t.name === truck.name || t.brand === truck.brand));
              const modelIndex = sameModelTrucks.findIndex(t => t && t.id === truck.id) + 1;

              return (
                <div 
                  key={truck.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg relative overflow-hidden"
                >
                  {/* Collapsed Header (always visible) */}
                  <button
                    onClick={() => setExpandedTruckId(expandedTruckId === truck.id ? null : truck.id)}
                    className="w-full text-left p-3 flex items-center justify-between hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{truck.imageIcon || '🚚'}</div>
                      <div>
                        <h3 className="font-bold text-white text-sm flex items-center gap-2">
                          {truck.name || 'Commercial Rig'}
                          {sameModelTrucks.length > 1 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-600/30 text-blue-300 rounded-md border border-blue-500/30">{modelIndex}</span>
                          )}
                        </h3>
                        <div className="text-[10px] text-amber-400 font-semibold">{truck.brand} • {truck.modelClass} • {truck.currentCity}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        truck.status === 'in_transit' 
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                          : truck.status === 'resting' 
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                          : truck.status === 'maintenance'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {truck.status === 'in_transit' ? 'En-route' : truck.status === 'resting' ? 'Resting' : truck.status === 'maintenance' ? 'In Repair' : 'Idle'}
                      </span>
                      <span className={`text-xs transition-transform ${expandedTruckId === truck.id ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  <div className={`px-3 pb-3 space-y-3 transition-all overflow-hidden ${expandedTruckId === truck.id ? 'block' : 'hidden'}`}>
                  {/* Real Photo Banner */}
                  {truck.imageUrl && (
                    <div className="h-36 w-full rounded-xl overflow-hidden relative border border-slate-800/80 bg-slate-950 flex items-center justify-center">
                      <img 
                        src={truck.imageUrl} 
                        alt={truck.name} 
                        className="w-full h-full object-contain object-center"
                        onError={(e) => {
                          // Graceful fallback
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700">
                          {truck.brand}
                        </span>
                        <span className="text-[10px] font-bold text-amber-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700">
                          {truck.region || 'America'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Truck Header */}
                  <div className="flex items-start justify-between border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center space-x-2.5">
                      <div className="text-3xl p-2 bg-slate-800 rounded-xl">{truck.imageIcon || '🚚'}</div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{truck.name || 'Commercial Rig'}</h3>
                        <div className="text-[10px] text-slate-400 font-mono tracking-tight">
                          ID: {truck.id} {truck.licensePlate ? `• ${truck.licensePlate}` : ''}
                        </div>
                        <div className="text-[10px] text-amber-400 font-semibold flex items-center space-x-2">
                           <span>{truck.brand || 'Commercial'} • {truck.modelClass || 'Class 8'}</span>
                           <span className="text-slate-500">•</span>
                           <span className="text-slate-300 flex items-center space-x-1">
                              <MapPin className="w-2.5 h-2.5" />
                              <span>{truck.currentCity || 'HQ Depot'}</span>
                           </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setInspectTruck(truck)}
                        className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-[10px] font-semibold flex items-center space-x-1"
                        title="Full Specs"
                      >
                        <Info className="w-3.5 h-3.5 text-amber-400" />
                        <span>Specs</span>
                      </button>

                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border ${
                        truck.status === 'in_transit'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : truck.status === 'resting'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : truck.status === 'maintenance'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {truck.status === 'in_transit' ? 'En-route' : truck.status === 'resting' ? 'Resting' : truck.status === 'maintenance' ? 'In Repair' : truck.status === 'idle' ? 'In Garage' : 'Idle'}
                      </span>
                    </div>
                  </div>

                  {/* Odometer & Tech Summary */}
                  <div className="text-[10px] bg-slate-950 p-2 rounded-xl border border-slate-800/80 flex items-center justify-between font-mono">
                     <div className="flex items-center space-x-2 text-slate-400">
                        <Gauge className="w-3 h-3" />
                        <span>Odometer:</span>
                        <span className="text-slate-200 font-bold">{Math.floor(truck.odometerMiles || 0).toLocaleString()} mi</span>
                     </div>
                     <div className="flex items-center space-x-1">
                        <span className="text-slate-500 uppercase font-bold text-[8px]">Status:</span>
                        <span className={truck.status === 'in_transit' ? 'text-amber-400 font-bold' : truck.status === 'resting' ? 'text-amber-400 font-bold' : truck.status === 'maintenance' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                           {truck.status === 'in_transit' ? 'En-route' : truck.status === 'resting' ? 'Resting' : truck.status === 'maintenance' ? 'In Repair' : truck.status === 'idle' ? 'In Garage' : 'Idle'}
                        </span>
                     </div>
                  </div>

                  {/* Engine Spec Summary */}
                  <div className="text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Engine Specs</span>
                      <span className="text-slate-200 font-bold">{truck.engineSpecs?.model || `${truck.horsepower || 350} HP Engine`}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">Output</span>
                      <span className="text-emerald-400 font-bold font-mono">{truck.horsepower || 350} HP • {truck.engineSpecs?.torqueLbFt || (truck.horsepower || 350) * 3} lb-ft</span>
                    </div>
                  </div>

                  {/* Health Meters in Litres */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <div>
                      <div className="flex justify-between font-medium text-slate-400 mb-0.5">
                        <span>Diesel Fuel</span>
                        <span className="text-slate-200 font-mono">{Math.floor(currentFuelL)} / {Math.floor(maxFuelL)} L</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${(currentFuelL / maxFuelL) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-medium text-slate-400 mb-0.5">
                        <span>Rig Health</span>
                        <span className="text-slate-200 font-mono">{Math.floor(condPercent)}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${condPercent > 50 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${condPercent}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-medium text-slate-400 mb-0.5">
                        <span>Oil Life</span>
                        <span className="text-slate-200 font-mono">{Math.floor(oilPercent)}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${oilPercent > 30 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${oilPercent}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-medium text-slate-400 mb-0.5">
                        <span>Tire Tread</span>
                        <span className="text-slate-200 font-mono">{Math.floor(tirePercent)}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${tirePercent > 30 ? 'bg-purple-500' : 'bg-rose-500'}`} style={{ width: `${tirePercent}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Trailer Attachment, Driver & PrePass */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium mb-1">Attached Trailer</div>
                      <select
                        value={truck.assignedTrailerId || ''}
                        onChange={(e) => onAttachTrailer(truck.id, e.target.value || null)}
                        disabled={isAssignedToContract}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-blue-500 disabled:opacity-50"
                      >
                        <option value="">(No Trailer)</option>
                        {trailersList.map((t) => {
                          if (!t) return null;
                          return (
                            <option 
                              key={t.id} 
                              value={t.id}
                              disabled={Boolean(t.assignedTruckId && t.assignedTruckId !== truck.id)}
                            >
                              {t.imageIcon} {t.name} ({t.type})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 font-medium mb-1">Assigned Driver</div>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 font-semibold truncate text-[11px]">
                        {driver ? `${driver.avatar || '👨‍✈️'} ${driver.name}` : '(Idle / No Driver)'}
                      </div>
                    </div>
                  </div>

                  {/* Maintenance & Upgrades Buttons Side-by-Side */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateTab) onNavigateTab('maintenance', truck.id);
                      }}
                      className="py-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
                    >
                      <span>🔧 Maintenance</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpgradeTruck(truck)}
                      className="py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <span>⚙️ Upgrades</span>
                    </button>
                  </div>

                  {/* Sell Rig Button */}
                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        const basePrice = truck.price || 120000;
                        const cond = truck.conditionPercent ?? 100;
                        const conditionFactor = Math.max(0.55, cond / 100);
                        const sellRefund = Math.floor(basePrice * conditionFactor * 0.85);
                        if (window.confirm(`Are you sure you want to sell ${truck.name} for $${sellRefund.toLocaleString()}?`)) {
                          onSellTruck(truck.id);
                        }
                      }}
                      disabled={Boolean(truck.assignedContractId || truck.status === 'in_transit')}
                      className="w-full py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition disabled:opacity-40 flex items-center justify-center space-x-1"
                    >
                      <span>Sell Rig (Est. ${Math.floor((truck.price || 120000) * Math.max(0.55, (truck.conditionPercent ?? 100) / 100) * 0.85).toLocaleString()})</span>
                    </button>
                  </div>

                  </div> {/* end expanded */}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* DEALERSHIP VIEW */}
      {activeSubTab === 'dealership' && (
        <div className="grid grid-cols-1 gap-4">
          {dealershipMode === 'trucks' ? (
            filteredCatalog.map((model, idx) => {
              const canAfford = state.cash >= model.price;
              const unlockReq = model.unlockRequirement;
              const isLocked = unlockReq ? state.companyLevel < unlockReq.companyLevel : false;

              return (
                <div 
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3 relative overflow-hidden"
                >
                  {/* Real Photo Banner */}
                  {model.imageUrl && (
                    <div className="h-40 w-full rounded-xl overflow-hidden relative border border-slate-800 bg-slate-950 flex items-center justify-center">
                      <img 
                        src={model.imageUrl} 
                        alt={model.name} 
                        className="w-full h-full object-contain object-center"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                      
                      {/* Unlock / Region Badges */}
                      <div className="absolute top-2.5 right-2.5 flex items-center space-x-1.5">
                        {unlockReq && (
                          <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full flex items-center space-x-1 shadow-lg ${
                            isLocked ? 'bg-rose-500/90 text-white' : 'bg-emerald-500/90 text-slate-950'
                          }`}>
                            <span>{isLocked ? `🔒 ${unlockReq.description}` : '🔓 Unlocked'}</span>
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2 left-2.5 flex items-center space-x-1.5">
                        <span className="text-[10px] font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700">
                          {model.brand}
                        </span>
                        <span className="text-[10px] font-bold text-amber-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700">
                          {model.region}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl p-2.5 bg-slate-800 rounded-xl">{model.imageIcon}</div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{model.name}</h3>
                        <div className="text-[10px] text-amber-400 font-semibold">{model.brand} • {model.modelClass}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => setInspectTruck(model)}
                      className="p-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg border border-amber-500/30 text-xs font-bold transition flex items-center space-x-1"
                    >
                      <Info className="w-3.5 h-3.5 text-blue-400" />
                      <span>Specs</span>
                    </button>
                  </div>

                  {/* Spec Badges in Litres */}
                  <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Horsepower</span>
                      <strong className="text-slate-200">{model.horsepower} HP</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Torque</span>
                      <strong className="text-slate-200">{model.engineSpecs?.torqueLbFt || model.horsepower * 3} lb-ft</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tank Capacity</span>
                      <strong className="text-slate-200">{model.maxFuelLitres} Litres</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {model.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <span className="text-lg font-extrabold text-emerald-400 font-mono">
                      ${model.price.toLocaleString()}
                    </span>

                    {isLocked ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-slate-800 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed border border-slate-700 flex items-center space-x-1"
                      >
                        <span>{unlockReq?.description || 'Locked'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onBuyTruck(model, customTruckName)}
                        disabled={!canAfford}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs rounded-xl transition disabled:opacity-40 flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Purchase Rig</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })
          ) : (
            CATALOG_TRAILERS.map((model, idx) => {
              const canAfford = state.cash >= model.price;
              return (
                <div 
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3 relative overflow-hidden"
                >
                  {/* Real Photo Banner */}
                  {model.imageUrl && (
                    <div className="h-36 w-full rounded-xl overflow-hidden relative border border-slate-800 bg-slate-950 flex items-center justify-center">
                      <img 
                        src={model.imageUrl} 
                        alt={model.name} 
                        className="w-full h-full object-contain object-center"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2.5 flex items-center space-x-1.5">
                        <span className="text-[10px] font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700">
                          {model.manufacturer}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <div className="text-3xl p-2.5 bg-slate-800 rounded-xl">{model.imageIcon}</div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{model.name}</h3>
                      <div className="text-xs text-amber-400 font-semibold">
                        {model.manufacturer} • {model.type} {model.hazmatCertified && '• HazMat Certified'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Payload Capacity</span>
                      <strong className="text-slate-200">{model.capacityTons} Tons</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Certification</span>
                      <strong className="text-slate-200">{model.hazmatCertified ? 'Class 1-9 HazMat' : 'Standard Freight'}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {model.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <span className="text-lg font-extrabold text-emerald-400 font-mono">
                      ${model.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() => onBuyTrailer(model)}
                      disabled={!canAfford}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs rounded-xl transition disabled:opacity-40 flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buy Trailer</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MY TRAILERS (YARD) VIEW */}
      {activeSubTab === 'yard' && (
        <div className="space-y-3">
          {trailersList.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
              <div className="text-3xl">📦</div>
              <h4 className="text-white font-bold text-sm">Trailer Yard Empty</h4>
              <p className="text-xs text-slate-400">Visit the Trailer Dealership to purchase cargo trailers!</p>
            </div>
          ) : (
            trailersList.map((trailer) => {
              if (!trailer) return null;
              const assignedTruck = trucksList.find(t => t && t.assignedTrailerId === trailer.id);
              const condPercent = trailer.conditionPercent ?? 100;
              const sellRefund = Math.floor((trailer.price || 25000) * (condPercent / 100) * 0.70);

              return (
                <div 
                  key={trailer.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3 relative overflow-hidden"
                >
                  {trailer.imageUrl && (
                    <div className="h-32 w-full rounded-xl overflow-hidden relative border border-slate-800 bg-slate-950 flex items-center justify-center">
                      <img 
                        src={trailer.imageUrl} 
                        alt={trailer.name} 
                        className="w-full h-full object-contain object-center"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2.5 flex items-center space-x-1.5">
                        <span className="text-[10px] font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700">
                          {trailer.manufacturer}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <div className="text-3xl p-2.5 bg-slate-800 rounded-xl">{trailer.imageIcon || '📦'}</div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{trailer.name}</h3>
                      <div className="text-xs text-amber-400 font-semibold">
                        {trailer.manufacturer} • {trailer.type} {trailer.hazmatCertified && '• HazMat Certified'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Payload Capacity</span>
                      <strong className="text-slate-200">{trailer.capacityTons} Tons</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Assigned Rig</span>
                      <strong className="text-amber-400">{assignedTruck ? assignedTruck.name : 'Unassigned (Yard)'}</strong>
                    </div>
                  </div>

                  {/* Trailer Condition */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between font-medium text-slate-400">
                      <span>Trailer Condition</span>
                      <span className="text-slate-200 font-mono">{Math.floor(condPercent)}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${condPercent > 50 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${condPercent}%` }} />
                    </div>
                  </div>

                  {/* Insurance Policy Tier Selector */}
                  <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">🛡️</span>
                      <div>
                        <span className="text-white font-bold block text-[11px]">Insurance Policy</span>
                        <span className="text-[10px] text-slate-400">{trailer.insuranceTier || (trailer.hasInsurance ? 'Standard Collision' : 'None')}</span>
                      </div>
                    </div>
                    <select
                      value={trailer.insuranceTier || (trailer.hasInsurance ? 'Standard Collision' : 'None')}
                      onChange={(e) => onSetTrailerInsuranceTier(trailer.id, e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-[11px] font-semibold focus:outline-none focus:border-blue-500"
                    >
                      <option value="None">None</option>
                      <option value="Liability Only">Liability</option>
                      <option value="Standard Collision">Standard</option>
                      <option value="Full Comprehensive">Comprehensive</option>
                    </select>
                  </div>

                  {/* Sell Trailer Button */}
                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to sell ${trailer.name} for $${sellRefund.toLocaleString()}?`)) {
                          onSellTrailer(trailer.id);
                        }
                      }}
                      disabled={Boolean(assignedTruck && assignedTruck.status === 'in_transit')}
                      className="w-full py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition disabled:opacity-40 flex items-center justify-center space-x-1"
                    >
                      <span>Sell Trailer (Est. ${sellRefund.toLocaleString()})</span>
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* FULL TRUCK SPECIFICATION INSPECTION MODAL OR SHOWROOM */}
      {inspectTruck && (
        Boolean((inspectTruck as any)?.id) ? (
          <TruckSpecsModal
            truck={inspectTruck as Truck}
            onClose={() => setInspectTruck(null)}
            onToggleInsurance={(id, tier) => onSetInsuranceTier(id, tier || 'Standard Collision')}
            onTogglePrePass={(id) => onInstallPrePass(id)}
          />
        ) : (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            {/* Header with Close button */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="text-4xl p-2 bg-slate-800 rounded-2xl">{inspectTruck.imageIcon}</div>
                <div>
                  <h3 className="text-base font-extrabold text-white">{inspectTruck.name}</h3>
                  <div className="text-xs text-amber-400 font-semibold">{inspectTruck.brand || 'Commercial'} • {inspectTruck.modelClass}</div>
                </div>
              </div>

              <button
                onClick={() => setInspectTruck(null)}
                className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo banner in Modal */}
            {inspectTruck.imageUrl && (
              <div className="h-48 w-full rounded-xl overflow-hidden relative border border-slate-800 bg-slate-950 flex items-center justify-center">
                <img 
                  src={inspectTruck.imageUrl} 
                  alt={inspectTruck.name} 
                  className="w-full h-full object-contain object-center"
                />
              </div>
            )}

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              {inspectTruck.description || 'Commercial tractor rig.'}
            </p>

            {/* Engine & Powertrain Specs Card */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Powertrain & Mechanical Specs</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Engine Model</span>
                  <strong className="text-slate-200">{inspectTruck.engineSpecs?.model || 'Cummins / Detroit Diesel'}</strong>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Horsepower</span>
                  <strong className="text-emerald-400 font-mono font-extrabold">{inspectTruck.horsepower || 350} HP</strong>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Peak Torque</span>
                  <strong className="text-amber-400 font-mono font-extrabold">{inspectTruck.engineSpecs?.torqueLbFt || (inspectTruck.horsepower || 350) * 3} lb-ft</strong>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Transmission</span>
                  <strong className="text-slate-200">{inspectTruck.engineSpecs?.transmission || '12-Speed Automated'}</strong>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Top Speed</span>
                  <strong className="text-amber-400 font-mono font-extrabold">{inspectTruck.topSpeedMph || 80} MPH</strong>
                </div>
              </div>
            </div>

            {/* Sleeper Cab & Fuel Range (Litres) */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>Cab Comfort & Fuel Range (Litres)</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Sleeper Suite</span>
                  <strong className="text-slate-200">{inspectTruck.sleeperCabType || 'Standard Sleeper Cab'}</strong>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Fuel Tank Capacity</span>
                  <strong className="text-slate-200 font-mono">{inspectTruck.maxFuelLitres || (inspectTruck.maxFuelGallons ? Math.floor(inspectTruck.maxFuelGallons * 3.785) : 850)} Litres</strong>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Base Economy</span>
                  <strong className="text-slate-200 font-mono">{inspectTruck.fuelEfficiencyMpg || 8.0} MPG</strong>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Durability Rating</span>
                  <strong className="text-slate-200 font-mono">{inspectTruck.durabilityRating || 80} / 100</strong>
                </div>
              </div>
            </div>

            {/* Name Edit at Purchase */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <label className="text-[10px] font-bold text-amber-400 uppercase">Custom Name</label>
              <input
                type="text"
                value={customTruckName}
                onChange={(e) => setCustomTruckName(e.target.value)}
                placeholder={inspectTruck.name || 'Truck Name'}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
              <div className="text-[10px] text-slate-400">Leave blank to use default model name.</div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-xl font-extrabold text-emerald-400 font-mono">
                ${inspectTruck.price.toLocaleString()}
              </span>

              {inspectTruck.isComingSoon ? (
                <button
                  disabled
                  className="px-5 py-2.5 bg-slate-800 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed border border-slate-700 flex items-center space-x-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Prototype / Coming Soon</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onBuyTruck(inspectTruck, customTruckName);
                    setInspectTruck(null);
                    setCustomTruckName('');
                  }}
                  disabled={state.cash < inspectTruck.price}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs rounded-xl transition disabled:opacity-40"
                >
                  Purchase Rig (${inspectTruck.price.toLocaleString()})
                </button>
              )}
            </div>

          </div>
        </div>
        )
      )}

      {/* SERVICE APPROVAL & SCHEDULING MODAL */}
      {serviceModalTruck && (
        <ServiceApprovalModal
          truck={serviceModalTruck}
          onClose={() => setServiceModalTruck(null)}
          onApproveService={(truckId, services, schedule) => {
            onApproveService(truckId, services, schedule);
            setServiceModalTruck(null);
            setInspectTruck(null);
          }}
          playerCash={state.cash}
        />
      )}

      {/* VEHICLE UPGRADES & WORKSHOP MODAL */}
      {upgradeTruck && (
        <TruckUpgradeModal
          truck={upgradeTruck}
          state={state}
          onClose={() => setUpgradeTruck(null)}
          onSubmitUpgrades={(truckId, parts, cost, time, sched) => {
            if (onSubmitUpgrades) {
              onSubmitUpgrades(truckId, parts, cost, time, sched);
            }
          }}
        />
      )}

    </div>
  );
};
