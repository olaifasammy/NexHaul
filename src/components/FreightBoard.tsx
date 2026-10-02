import { useState } from 'react';
import type { GameSaveState, Contract } from '../types/game';
import { calculateTruckPhysics } from '../engine/simulation';
import { validateDispatchJurisdictionAndLimits, calculateRigMaxPayloadTons, TRUCK_CLASS_LIMITS, REGIONAL_JURISDICTIONS } from '../engine/jurisdiction';
import { Navigation, ArrowRight, Clock, Gauge, Flame, MapPin, RefreshCw, ChevronDown, ChevronUp, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { TabType } from './Navigation';

interface FreightBoardProps {
  state: GameSaveState;
  onDispatchContract: (contractId: string, truckId: string, driverId: string) => void;
  onRefreshJobs?: () => void;
  onNavigateTab: (tab: TabType) => void;
  onNegotiateContract?: (contractId: string, offerAmount: number) => void;
  onDeclineNegotiation?: (contractId: string) => void;
}

export const FreightBoard: React.FC<FreightBoardProps> = ({ state, onDispatchContract, onRefreshJobs, onNavigateTab, onNegotiateContract, onDeclineNegotiation }) => {
  const [reloading, setReloading] = useState(false);
  const [expandedContractIds, setExpandedContractIds] = useState<Set<string>>(new Set());
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedTruckId, setSelectedTruckId] = useState<string>('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');

  const availableTrucks = state.trucks.filter(t => {
    if (!t) return false;
    if (t.assignedContractId) return false;
    if (t.status === 'maintenance' || t.status === 'in_transit' || t.status === 'breakdown' || t.status === 'resting') return false;
    
    if (selectedContract) {
      const trailer = state.trailers.find(tr => tr.id === t.assignedTrailerId);
      const rigMaxPayload = calculateRigMaxPayloadTons(t, trailer);
      if (selectedContract.weightTons > rigMaxPayload) return false;

      const classSpec = TRUCK_CLASS_LIMITS[t.modelClass];
      if (classSpec && selectedContract.weightTons > classSpec.maxPayloadTons) return false;

      if (t.modelClass === 'Class 3 Light') {
        return selectedContract.requiredTrailerType === 'Dry Van' && selectedContract.weightTons <= 10;
      }

      if (!trailer) return false;
      if (trailer.type !== selectedContract.requiredTrailerType) return false;
      if (selectedContract.weightTons > trailer.capacityTons) return false;
    }

    return true;
  });
  const availableDrivers = state.drivers.filter(d => {
    if (!d) return false;
    if (d.fatiguePercent >= 90) return false;
    const isOnActiveContract = state.activeContracts?.some(c => c?.assignedDriverId === d.id);
    return !isOnActiveContract;
  });

  const toggleExpand = (contractId: string) => {
    setExpandedContractIds(prev => {
      const next = new Set(prev);
      if (next.has(contractId)) next.delete(contractId);
      else next.add(contractId);
      return next;
    });
  };

  const handleOpenDispatchModal = (contract: Contract) => {
    setSelectedContract(contract);
    
    // Auto-select first matching truck with correct trailer or box truck if available
    const matchingTruck = availableTrucks.find(t => {
      if (t.modelClass === 'Class 3 Light' && contract.requiredTrailerType === 'Dry Van') return true;
      const trailer = state.trailers.find(tr => tr.id === t.assignedTrailerId);
      return trailer && trailer.type === contract.requiredTrailerType;
    });

    const truckId = matchingTruck ? matchingTruck.id : (availableTrucks[0]?.id || '');
    setSelectedTruckId(truckId);

    const truck = state.trucks.find(t => t.id === truckId);
    if (truck?.assignedDriverId) {
      const assignedDriver = availableDrivers.find(d => d.id === truck.assignedDriverId);
      if (assignedDriver) {
        setSelectedDriverId(assignedDriver.id);
      } else if (availableDrivers.length > 0) {
        setSelectedDriverId(availableDrivers[0]?.id || '');
      } else {
        setSelectedDriverId('');
      }
    } else if (availableDrivers.length > 0) {
      setSelectedDriverId(availableDrivers[0]?.id || '');
    } else {
      setSelectedDriverId('');
    }
  };

  const handleTruckChange = (truckId: string) => {
    setSelectedTruckId(truckId);
    const truck = state.trucks.find(t => t.id === truckId);
    if (truck?.assignedDriverId) {
      const assignedDriver = availableDrivers.find(d => d.id === truck.assignedDriverId);
      if (assignedDriver) {
        setSelectedDriverId(assignedDriver.id);
      }
    }
  };

  const handleConfirmDispatch = () => {
    if (!selectedContract || !selectedTruckId || !selectedDriverId) return;
    onDispatchContract(selectedContract.id, selectedTruckId, selectedDriverId);
    setSelectedContract(null);
  };

  if (state.trucks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-blue-400" />
            <span>Job Board — Dispatch Routes</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pick open haul routes. Reload to refresh listings.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto text-3xl border border-blue-500/30">
            🚚
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Commercial Rigs Owned</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              You must acquire at least one commercial truck before you can accept freight haul contracts and dispatch routes.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('fleet')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/30 inline-flex items-center space-x-2"
          >
            <span>Go to Truck Dealership</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-amber-400" />
            <span>Job Board — Dispatch Routes</span>
          </h2>
          {((state.depot?.dispatchAILevel || 0) > 0 && (state.depot?.isAutoDispatchEnabled ?? true)) && (
            <div className="flex items-center space-x-1.5 self-start sm:self-auto">
              <span className="text-base animate-ai-jump-bend">🤖</span>
              <div className="flex items-center -space-x-1">
                {[...Array(state.depot.dispatchAILevel)].map((_, i) => (
                  <span key={i} className="text-amber-400 text-xs drop-shadow">⭐</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-400">
          Pick open haul routes. Pay is boosted +10% for new contracts.
        </p>
      </div>

      {/* Contract Cards Grid */}
      <div className="grid grid-cols-1 gap-3">
        {state.availableContracts.map((contract) => {
          const isExpanded = expandedContractIds.has(contract.id);
          
          // Check if player has at least one compatible truck and trailer matching weight & type
          const matchingTrucksCount = state.trucks.filter(t => {
            if (!t) return false;
            if (t.assignedContractId) return false;
            if (t.status === 'maintenance' || t.status === 'in_transit' || t.status === 'breakdown' || t.status === 'resting') return false;

            const trailer = state.trailers.find(tr => tr.id === t.assignedTrailerId);
            const rigMaxPayload = calculateRigMaxPayloadTons(t, trailer);
            if (contract.weightTons > rigMaxPayload) return false;

            const classSpec = TRUCK_CLASS_LIMITS[t.modelClass];
            if (classSpec && contract.weightTons > classSpec.maxPayloadTons) return false;

            if (t.modelClass === 'Class 3 Light') {
              return contract.requiredTrailerType === 'Dry Van' && contract.weightTons <= 10;
            }

            if (!trailer) return false;
            if (trailer.type !== contract.requiredTrailerType) return false;
            if (contract.weightTons > trailer.capacityTons) return false;

            return true;
          }).length;

          const isVehicleCompatible = matchingTrucksCount > 0;

          return (
            <div 
              key={contract.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md hover:border-slate-700 transition space-y-3"
            >
              {/* Compact Header (Always visible) */}
              <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(contract.id)}>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-bold text-white text-xs truncate">{contract.title}</h3>
                    {contract.isUrgent && (
                      <span className="text-[9px] font-mono font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.2 rounded shrink-0 animate-pulse">
                        🔥 URGENT
                      </span>
                    )}
                    <span className="text-[9px] font-mono font-bold bg-slate-800 text-blue-300 border border-slate-700 px-1.5 py-0.2 rounded shrink-0">
                      {contract.region === 'America' ? '🇺🇸 USA' : contract.region === 'Europe' ? '🇪🇺 EU' : contract.region === 'Asia' ? '🌏 Asia' : '⚡ EV'}
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700 px-1.5 py-0.2 rounded shrink-0">
                      ⚖️ {contract.weightTons}T
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-300 mt-0.5">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] truncate max-w-[110px]">{contract.origin}</span>
                    <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] truncate max-w-[110px]">{contract.destination}</span>
                    <span className="text-slate-500 text-[10px]">({contract.distanceMiles} mi)</span>
                  </div>

                  {/* Expiration Countdown & Urgency */}
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono pt-1">
                    <span className="flex items-center space-x-1">
                      <span>⏳ Expires in:</span>
                      <strong className={((contract.expirySecondsRemaining ?? 3600) < 600) ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-300'}>
                        {(() => {
                          const remSecs = contract.expirySecondsRemaining ?? 3600;
                          const hrs = Math.floor(remSecs / 3600);
                          const mins = Math.floor((remSecs % 3600) / 60);
                          if (hrs > 0) return `${hrs}h ${mins}m`;
                          return `${Math.max(1, mins)}m`;
                        })()}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-emerald-400 font-mono">
                      +${contract.payoutCash.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-blue-300 font-medium">+{contract.payoutXp} XP</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(contract.id);
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                    title={isExpanded ? "Collapse Details" : "Expand Details"}
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Details Section */}
              {isExpanded && (
                <div className="space-y-3 pt-2 border-t border-slate-800 animate-in fade-in zoom-in-95">
                  {/* Requirements & Cargo specs */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Cargo Type</span>
                      <strong className="text-slate-200 truncate block">{contract.cargoCategory}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Compatible Vehicle</span>
                      <strong className={`font-bold truncate block ${isVehicleCompatible ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isVehicleCompatible ? 'Available ✓' : 'No Compatible Vehicle ✗'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Danger Level</span>
                      <strong className="text-amber-400">Level {contract.dangerLevel}</strong>
                    </div>
                  </div>

                  {/* Negotiation Section */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-300">Rate Negotiation (Round {contract.negotiationRound || 0})</span>
                        <span className="text-[9px] text-slate-500 uppercase font-mono tracking-tighter">
                          Shipper: <span className="text-blue-400">{contract.shipperPersonality || 'Standard'}</span>
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        contract.negotiationStatus === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' :
                        contract.negotiationStatus === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                        contract.negotiationStatus === 'countered' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {contract.negotiationStatus === 'accepted' ? 'Accepted ✓' :
                         contract.negotiationStatus === 'rejected' ? 'Rejected ✗' :
                         contract.negotiationStatus === 'countered' ? `Counter-Offer: $${contract.counterOfferPayout?.toLocaleString()}` :
                         'Not Negotiated'}
                      </span>
                    </div>

                    {/* Shipper Patience Meter */}
                    {contract.negotiationStatus !== 'accepted' && (contract.negotiationRound || 0) > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold">
                          <span className="text-slate-500">Shipper Patience</span>
                          <span className={(contract.shipperPatience || 0) < 30 ? 'text-rose-400' : 'text-slate-300'}>
                            {Math.floor(contract.shipperPatience || 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              (contract.shipperPatience || 0) < 30 ? 'bg-rose-500' : 
                              (contract.shipperPatience || 0) < 60 ? 'bg-amber-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${contract.shipperPatience || 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {contract.negotiationStatus !== 'accepted' && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="Offer amount ($)"
                          defaultValue={Math.floor((contract.counterOfferPayout || contract.payoutCash) * 1.05)}
                          id={`negotiate-input-${contract.id}`}
                          className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 flex-1 focus:outline-none focus:border-blue-500 font-mono"
                        />
                        <button
                          onClick={() => {
                            const inputElem = document.getElementById(`negotiate-input-${contract.id}`) as HTMLInputElement;
                            if (inputElem && onNegotiateContract) {
                              const val = parseFloat(inputElem.value);
                              if (!isNaN(val) && val > 0) {
                                onNegotiateContract(contract.id, val);
                              }
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition"
                        >
                          {contract.negotiationStatus === 'countered' ? 'Counter' : 'Submit'}
                        </button>
                      </div>
                    )}

                    {contract.negotiationStatus === 'countered' && contract.counterOfferPayout && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            if (onNegotiateContract) {
                              onNegotiateContract(contract.id, contract.counterOfferPayout!);
                            }
                          }}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition"
                        >
                          Accept $ {contract.counterOfferPayout.toLocaleString()}
                        </button>
                        <button
                          onClick={() => {
                            if (onDeclineNegotiation) {
                              onDeclineNegotiation(contract.id);
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg transition"
                        >
                          Withdraw
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footer dispatch button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400 font-medium flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Est. ~{contract.timeLimitMinutes} min</span>
                    </span>

                    <button
                      onClick={() => handleOpenDispatchModal(contract)}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition shadow-lg shadow-blue-600/20"
                    >
                      Accept & Dispatch
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Bottom Refresh Button */}
      <div className="pt-2 pb-6 flex justify-center">
        <button
          onClick={() => {
            if (state.cash < 250) {
              alert("Insufficient funds! Refreshing job board costs $250.");
              return;
            }
            setReloading(true);
            if (onRefreshJobs) onRefreshJobs();
            setTimeout(() => setReloading(false), 500);
          }}
          disabled={reloading || state.cash < 250}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center space-x-2 disabled:opacity-40 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${reloading ? 'animate-spin' : ''}`} />
          <span>Refresh Listings ($250)</span>
        </button>
      </div>

      {/* DISPATCH SELECTION MODAL */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Dispatch Cargo Manifest</h3>
              <p className="text-xs text-slate-400 mt-0.5">{selectedContract.title} ({selectedContract.distanceMiles} miles)</p>
            </div>

            {/* Truck Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Select Assigned Rig</label>
              {availableTrucks.length === 0 ? (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                  No compatible vehicle! (Requires matching trailer type, weight capacity limits, and available rig in fleet).
                </div>
              ) : (
                <select
                  value={selectedTruckId}
                  onChange={(e) => handleTruckChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-500"
                >
                  {availableTrucks.map((truck) => {
                    const trailer = state.trailers.find(t => t.id === truck.assignedTrailerId);
                    const isTrailerMatch = trailer?.type === selectedContract.requiredTrailerType;
                    return (
                      <option key={truck.id} value={truck.id}>
                        {truck.imageIcon} {truck.name} — Trailer: {trailer?.name || 'None'} {isTrailerMatch ? '✓ (Match)' : '⚠️'}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Driver Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Select Driver</label>
              {availableDrivers.length === 0 ? (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                  No available drivers! Check Driver Lounge to hire or rest exhausted drivers.
                </div>
              ) : (
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-500"
                >
                  {availableDrivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.avatar} {driver.name} (Rank {driver.skillLevel}) — CDL: {driver.cdlClass}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Jurisdiction & Payload Limit Validation Results */}
            {selectedTruckId && selectedDriverId && selectedContract && (() => {
              const truck = state.trucks.find(t => t.id === selectedTruckId);
              const driver = state.drivers.find(d => d.id === selectedDriverId);
              const trailer = state.trailers.find(tr => tr.id === truck?.assignedTrailerId);
              
              if (!truck || !driver) return null;

              const validation = validateDispatchJurisdictionAndLimits(
                truck, 
                selectedContract, 
                driver, 
                trailer, 
                state.unlockedRegions || ['America']
              );

              const classSpec = TRUCK_CLASS_LIMITS[truck.modelClass] || TRUCK_CLASS_LIMITS['Class 8 Highway'];
              const regionSpec = REGIONAL_JURISDICTIONS[selectedContract.region] || REGIONAL_JURISDICTIONS['America'];

              return (
                <div className="space-y-2">
                  {/* Blocker Violations */}
                  {validation.blockers.length > 0 && (
                    <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 space-y-1 text-xs">
                      <div className="flex items-center space-x-1.5 text-rose-400 font-bold uppercase tracking-wider text-[10px]">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>Jurisdiction & Payload Blockers ({validation.blockers.length})</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                        {validation.blockers.map((b, i) => (
                          <li key={i} className="text-rose-300">{b}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings */}
                  {validation.warnings.length > 0 && (
                    <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-2.5 space-y-1 text-xs">
                      <div className="flex items-center space-x-1.5 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Jurisdiction Notice</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                        {validation.warnings.map((w, i) => (
                          <li key={i} className="text-amber-200">{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Specs Summary Badge Bar */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950 p-2 rounded-xl border border-slate-800 font-mono text-slate-400">
                    <div>Rig Payload Rating: <span className="text-slate-200 font-bold">{classSpec.maxPayloadTons}T Limit</span></div>
                    <div>Region Speed Cap: <span className="text-blue-400 font-bold">{regionSpec.speedLimitKmh} km/h ({regionSpec.speedLimitMph} MPH)</span></div>
                  </div>
                </div>
              );
            })()}

            {/* Performance Preview */}
            {selectedTruckId && selectedDriverId && (
              <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/20 space-y-3">
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center space-x-1.5">
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Physics & Dispatch Analysis</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 block">Avg. Speed</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-white">
                        {calculateTruckPhysics(
                          state.trucks.find(t => t.id === selectedTruckId)!,
                          selectedContract,
                          state.drivers.find(d => d.id === selectedDriverId)!,
                          state.activeWeather,
                          state.skills,
                          state.trailers
                        ).speedMph}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">MPH</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-center">
                    <span className="text-[10px] text-slate-500 block">Est. Duration</span>
                    <div className="flex items-center justify-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-sm font-bold text-white">
                        {(() => {
                          const physics = calculateTruckPhysics(
                            state.trucks.find(t => t.id === selectedTruckId)!,
                            selectedContract,
                            state.drivers.find(d => d.id === selectedDriverId)!,
                            state.activeWeather,
                            state.skills,
                            state.trailers
                          );
                          const totalMinutes = Math.ceil((selectedContract.distanceMiles / physics.speedMph) * 60);
                          const hours = Math.floor(totalMinutes / 60);
                          const mins = totalMinutes % 60;
                          return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                        })()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <span className="text-[10px] text-slate-500 block">Fuel Burn</span>
                    <div className="flex items-center justify-end space-x-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-sm font-bold text-white">
                        {calculateTruckPhysics(
                          state.trucks.find(t => t.id === selectedTruckId)!,
                          selectedContract,
                          state.drivers.find(d => d.id === selectedDriverId)!,
                          state.activeWeather,
                          state.skills,
                          state.trailers
                        ).currentMpg}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">MPG</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-slate-800/60">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 italic">Load Factor: {(selectedContract.weightTons + (state.trucks.find(t => t.id === selectedTruckId)?.modelClass === 'Class 3 Light' ? 4 : 15)).toFixed(1)} Tons GCW</span>
                    <span className="text-slate-500">Weather: {state.activeWeather}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedContract(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDispatch}
                disabled={(() => {
                  if (!selectedTruckId || !selectedDriverId || !selectedContract) return true;
                  const truck = state.trucks.find(t => t.id === selectedTruckId);
                  const driver = state.drivers.find(d => d.id === selectedDriverId);
                  const trailer = state.trailers.find(tr => tr.id === truck?.assignedTrailerId);
                  if (!truck || !driver) return true;

                  const validation = validateDispatchJurisdictionAndLimits(
                    truck, 
                    selectedContract, 
                    driver, 
                    trailer, 
                    state.unlockedRegions || ['America']
                  );

                  return !validation.isValid;
                })()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20"
              >
                Start Haul Route
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
