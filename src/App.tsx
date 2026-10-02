import { getMaintenanceQuote } from './engine/maintenancePricing';
import { SIMULATION_CONFIG } from './config/simulation';
import { useState, useEffect, useRef } from 'react';
import type { GameSaveState, OfflineProgressSummary, DepotUpgrade, Truck } from './types/game';
import { getInitialGameState, loadGameStateFromStorage, saveGameStateToStorage } from './engine/storage';
import { getSaveSlots, getActiveSaveId, setActiveSaveId, loadGameplayState, saveGameplayState, createNewGameplay, deleteGameplay } from './engine/gameplayStorage';
import { processSimulationTick, calculateOfflineProgress, getRefuelCost } from './engine/simulation';
import { CATALOG_TRUCKS } from './data/trucks';
import { CATALOG_TRAILERS } from './data/trailers';
import { HIRABLE_DRIVERS_POOL } from './data/drivers';
import { generateRandomContract, generateBatchContracts } from './data/contracts';
import { SKILL_TREE } from './data/skills';

import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import type { TabType } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { FleetManager } from './components/FleetManager';
import { TruckInspectionModal } from './components/TruckInspectionModal';
import { FreightBoard } from './components/FreightBoard';
import { validateDispatchJurisdictionAndLimits } from './engine/jurisdiction';
import { FuelManager } from './components/FuelManager';
import { HQDepot } from './components/HQDepot';
import { MarketHub } from './components/MarketHub';
import { LeaderboardModal } from './components/LeaderboardModal';
import { LiveMapModal } from './components/LiveMapModal';
import { NewGameModal } from './components/NewGameModal';
import { OfflineModal } from './components/OfflineModal';
import { RepairBayView } from './components/RepairBayView';
import type { StaffRole } from './types/game';

function generateTruckId(trucks: Truck[]): string {
  let maxNum = 0;
  for (const t of trucks) {
    const parts = t.id?.split('-');
    const lastPart = parts ? parseInt(parts[parts.length - 1], 10) : NaN;
    if (!isNaN(lastPart) && lastPart > maxNum) {
      maxNum = lastPart;
    }
  }
  const nextNum = Math.max(maxNum + 1, trucks.length + 1);
  return `truck-${nextNum}`;
}

function generateTrailerId(trailers: any[]): string {
  let maxNum = 0;
  for (const tr of trailers) {
    const parts = tr.id?.split('-');
    const lastPart = parts ? parseInt(parts[parts.length - 1], 10) : NaN;
    if (!isNaN(lastPart) && lastPart > maxNum) {
      maxNum = lastPart;
    }
  }
  const nextNum = Math.max(maxNum + 1, trailers.length + 1);
  return `trailer-${nextNum}`;
}

export function App() {
  const [activeSaveId, setActiveSaveIdState] = useState<string | null>(() => {
    const active = getActiveSaveId();
    if (active) return active;
    const slots = getSaveSlots();
    if (slots.length > 0) return slots[0].id;
    return null;
  });

  const [gameState, setGameState] = useState<GameSaveState>(() => {
    const active = getActiveSaveId() || (getSaveSlots()[0]?.id);
    if (active) {
      const saved = loadGameplayState(active);
      if (saved) return saved;
    }
    return getInitialGameState();
  });

  const gameStateRef = useRef(gameState);

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [inspectionTruckId, setInspectionTruckId] = useState<string | null>(null);
  const [offlineSummary, setOfflineSummary] = useState<OfflineProgressSummary | null>(null);
  const [saveStatusText, setSaveStatusText] = useState<string>('Auto-saved');
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showLiveMap, setShowLiveMap] = useState<boolean>(false);
  const [showNewGameModal, setShowNewGameModal] = useState<boolean>(() => {
    return getSaveSlots().length === 0;
  });

  const [purchaseApprovalModal, setPurchaseApprovalModal] = useState<{
    title: string;
    description: string;
    cost: number;
    onConfirm: () => void;
  } | null>(null);

  const [purchaseResultModal, setPurchaseResultModal] = useState<{
    title: string;
    message: string;
    success: boolean;
  } | null>(null);

  /*
  // DEV: Automatically seed money on load for testing
  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      cash: prev.cash + 1000000 // Adds 1 million for testing
    }));
  }, []);
  */

  // Keep gameStateRef in sync with gameState
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // On App Mount: Load active gameplay & calculate offline progression
  useEffect(() => {
    const slots = getSaveSlots();
    let currentId = getActiveSaveId();

    if (!currentId && slots.length > 0) {
      currentId = slots[0].id;
      setActiveSaveId(currentId);
      setActiveSaveIdState(currentId);
    }

    if (currentId) {
      const loadedState = loadGameplayState(currentId);
      if (loadedState) {
        const now = Date.now();
        const offlineSeconds = Math.floor((now - loadedState.lastSavedTimestamp) / 1000);

        if (offlineSeconds >= 30) {
          const { updatedState, summary } = calculateOfflineProgress(loadedState, offlineSeconds);
          setGameState(updatedState);
          setOfflineSummary(summary);
        } else {
          setGameState(loadedState);
        }
      }
    } else {
      setShowNewGameModal(true);
    }

    // Visibility change handler to catch background/resume cycles
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setGameState(prev => {
          const now = Date.now();
          const offlineSeconds = Math.floor((now - prev.lastSavedTimestamp) / 1000);
          
          if (offlineSeconds >= 30) {
            const { updatedState, summary } = calculateOfflineProgress(prev, offlineSeconds);
            setOfflineSummary(summary);
            return updatedState;
          }
          return prev;
        });
      } else {
        if (activeSaveId) {
          saveGameplayState(gameStateRef.current, activeSaveId);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Real-time Simulation Loop (250ms tick = 4 updates/sec, 10x sim speed)
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => {
        const { nextState } = processSimulationTick(prev, 2.5);
        return nextState;
      });
    }, 250);

    return () => clearInterval(timer);
  }, []);

  // TEMP DEBUG: inspect active dispatch state every 10 seconds
  useEffect(() => {
    const debugTimer = setInterval(() => {
      const state = gameStateRef.current;
      console.log('[DISPATCH DEBUG]', {
        activeContracts: (state.activeContracts || []).map(c => ({
          id: c.id,
          status: c.status,
          truckId: c.assignedTruckId,
          driverId: c.assignedDriverId,
          progress: c.progressMiles
        })),
        trucks: (state.trucks || []).map(t => ({
          id: t.id,
          status: t.status,
          contractId: t.assignedContractId
        }))
      });
    }, 10000);
    return () => clearInterval(debugTimer);
  }, []);

  // Auto-save every 10 seconds
  useEffect(() => {
    const saveTimer = setInterval(() => {
      if (activeSaveId) {
        saveGameplayState(gameStateRef.current, activeSaveId);
        setGameState(prev => ({ ...prev, lastSavedTimestamp: Date.now() }));
        setSaveStatusText('Auto-saved');
      }
    }, 10000);

    return () => clearInterval(saveTimer);
  }, [activeSaveId]);

  // Handlers
  const handleManualSave = () => {
    if (activeSaveId) {
      saveGameplayState(gameState, activeSaveId);
      setSaveStatusText('Saved!');
      setTimeout(() => setSaveStatusText('Auto-saved'), 2000);
    }
  };

  const handleCreateNewGame = (companyName: string, founderName: string, hqCity: string, hqState: string, logoIcon: string) => {
    const newId = createNewGameplay(companyName, founderName, hqCity, hqState, logoIcon);
    setActiveSaveId(newId);
    setActiveSaveIdState(newId);
    const newState = loadGameplayState(newId);
    if (newState) setGameState(newState);
    setShowNewGameModal(false);
  };

  const handleDispatchContract = (contractId: string, truckId: string, driverId: string) => {
    let dispatchAccepted = false;

    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;

      const contract = next.availableContracts.find(c => c.id === contractId);
      const truck = next.trucks.find(t => t.id === truckId);
      const driver = next.drivers.find(d => d.id === driverId);

      if (!contract || !truck || !driver) return prev;

      const trailer = next.trailers.find(t => t.id === truck.assignedTrailerId);

      const validation = validateDispatchJurisdictionAndLimits(
        truck,
        contract,
        driver,
        trailer,
        next.unlockedRegions || ['America'],
        next.heavyHaulPermits || [],
        next.companyLevel,
        next.regionalHubs || {}
      );

      if (!validation.isValid) {
        console.warn('Dispatch rejected:', validation.blockers);
        return prev;
      }

      contract.status = 'in_progress';
      contract.assignedTruckId = truckId;
      contract.assignedDriverId = driverId;
      contract.progressMiles = 0;
      contract.elapsedSeconds = 0;

      truck.assignedContractId = contractId;
      driver.assignedTruckId = truckId;

      next.activeContracts.push(contract);
      next.availableContracts = next.availableContracts.filter(
        c => c.id !== contractId
      );

      dispatchAccepted = true;
      return next;
    });

    if (dispatchAccepted) {
      setActiveTab('dashboard');
    }
  };

  const handleNegotiateContract = (contractId: string, offerAmount: number) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const contract = next.availableContracts.find(c => c.id === contractId);
      if (!contract) return prev;

      // Realism: Multi-round negotiation logic
      contract.negotiationRound = (contract.negotiationRound || 0) + 1;
      const round = contract.negotiationRound;
      const personality = contract.shipperPersonality || 'fair';
      const patience = contract.shipperPatience ?? SIMULATION_CONFIG.contracts.negotiation.defaultPatience;
      
      const brandScore = next.profile?.brandScore || SIMULATION_CONFIG.contracts.negotiation.creditScoreReference;
      const creditScore = next.profile?.creditScore || 700;
      
      // Calculate basic willingness based on company reputation
      const reputationBonus = (brandScore / SIMULATION_CONFIG.contracts.negotiation.brandScoreDivisor) + ((creditScore - SIMULATION_CONFIG.contracts.negotiation.creditScoreReference) / SIMULATION_CONFIG.contracts.negotiation.creditScoreDivisor);
      
      // Determine shipper price thresholds
      let tolerance = 1.05; // 5% over base
      if (personality === 'greedy') tolerance = 1.02;
      else if (personality === 'urgent') tolerance = 1.15;
      else if (personality === 'corporate') tolerance = 1.08;
      
      const maxAcceptable = contract.payoutCash * (tolerance + reputationBonus);
      const hardRejectLimit = maxAcceptable * (SIMULATION_CONFIG.contracts.negotiation.hardRejectMultiplier + (patience / SIMULATION_CONFIG.contracts.negotiation.patienceDivisor)); // Beyond this, instant withdrawal

      // Case 1: Instant Acceptance
      if (offerAmount <= maxAcceptable) {
        contract.payoutCash = Math.floor(offerAmount);
        contract.negotiationStatus = 'accepted';
        contract.negotiationOffer = offerAmount;
        next.eventLogs.unshift({
          id: `neg-acc-${Date.now()}`,
          timestamp: Date.now(),
          title: `Negotiation Accepted`,
          message: `Shipper accepted your offer of $${offerAmount.toLocaleString()} for "${contract.title}".`,
          type: 'success'
        });
      } 
      // Case 2: Hard Reject (Offer too greedy or patience gone)
      else if (offerAmount > hardRejectLimit || (patience <= 10 && offerAmount > maxAcceptable)) {
        contract.negotiationStatus = 'rejected';
        next.availableContracts = next.availableContracts.filter(c => c.id !== contractId);
        next.eventLogs.unshift({
          id: `neg-fail-${Date.now()}`,
          timestamp: Date.now(),
          title: `Negotiation Terminated`,
          message: `Shipper was offended by your offer or ran out of patience. The contract for "${contract.title}" has been withdrawn.`,
          type: 'danger'
        });
      }
      // Case 3: Counter-Offer
      else {
        // Decrease patience
        const patienceLoss = 15 + (Math.random() * 20);
        contract.shipperPatience = Math.max(0, patience - (patienceLoss / (personality === 'urgent' ? SIMULATION_CONFIG.contracts.negotiation.urgentPatienceMultiplier : 1)));
        
        // Counter is a middle ground
        const currentCounter = contract.counterOfferPayout || contract.payoutCash;
        const counter = Math.floor(currentCounter + (offerAmount - currentCounter) * (SIMULATION_CONFIG.contracts.negotiation.counterOfferBaseWeight + (patience / SIMULATION_CONFIG.contracts.negotiation.counterOfferPatienceDivisor)));
        
        contract.negotiationStatus = 'countered';
        contract.counterOfferPayout = counter;
        contract.negotiationOffer = offerAmount;
        
        next.eventLogs.unshift({
          id: `neg-counter-${Date.now()}`,
          timestamp: Date.now(),
          title: `Shipper Counter-Offer`,
          message: `Shipper counter-offered $${counter.toLocaleString()} for "${contract.title}". Patience: ${Math.floor(contract.shipperPatience)}%`,
          type: 'warning'
        });
      }

      return next;
    });
  };

  const handleDeclineNegotiation = (contractId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const contract = next.availableContracts.find(c => c.id === contractId);
      if (!contract) return prev;

      next.availableContracts = next.availableContracts.filter(c => c.id !== contractId);
      next.eventLogs.unshift({
        id: `negotiation-decline-${Date.now()}`,
        timestamp: Date.now(),
        title: `Negotiation Concluded`,
        message: `You declined the counter-offer for "${contract.title}". The contract has been withdrawn.`,
        type: 'info'
      });

      return next;
    });
  };

  const handleRefuelTruck = (truckId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const truck = next.trucks.find(t => t.id === truckId);
      if (!truck) return prev;

      const currentL = truck.currentFuelLitres ?? (truck.currentFuelGallons ? truck.currentFuelGallons * SIMULATION_CONFIG.fuel.litresPerUsGallon : 0);
      const maxL = truck.maxFuelLitres || (truck.maxFuelGallons ? truck.maxFuelGallons * SIMULATION_CONFIG.fuel.litresPerUsGallon : 850);
      const neededFuelL = Math.max(0, maxL - currentL);

      const trailer = truck.assignedTrailerId ? next.trailers.find(tr => tr.id === truck.assignedTrailerId && tr.type === 'Refrigerated') : null;
      const reeferMaxL = trailer ? (trailer.maxFuelLitres ?? SIMULATION_CONFIG.reefer.defaultFuelCapacityLitres) : 0;
      const reeferCurrentL = trailer ? (trailer.currentFuelLitres ?? reeferMaxL) : 0;
      const neededReeferL = trailer ? Math.max(0, reeferMaxL - reeferCurrentL) : 0;

      const totalNeededL = neededFuelL + neededReeferL;
      if (totalNeededL <= 0) return prev;

      // Draw from company wholesale bulk reserve at $0 cash cost!
      if (next.bulkFuelReserveLitres >= totalNeededL) {
        next.bulkFuelReserveLitres -= totalNeededL;
        truck.currentFuelLitres = maxL;
        truck.currentFuelGallons = +(truck.currentFuelLitres / SIMULATION_CONFIG.fuel.litresPerUsGallon).toFixed(1);

        if (trailer) {
          trailer.currentFuelLitres = reeferMaxL;
          trailer.currentTempF = trailer.setPointTempF ?? SIMULATION_CONFIG.reefer.defaultSetPointF;
        }

        next.eventLogs.unshift({
          id: `refuel-success-${Date.now()}`,
          timestamp: Date.now(),
          title: '⛽ Fleet Refueled',
          message: `${truck.name}${trailer ? ' & Reefer Unit' : ''} refueled successfully from depot storage (${Math.floor(totalNeededL)} L).`,
          type: 'success'
        });
      } else {
        next.eventLogs.unshift({
          id: `fuel-error-${Date.now()}`,
          timestamp: Date.now(),
          title: '⛽ Fuel Storage Empty / Insufficient',
          message: `Unable to refuel ${truck.name}: Depot fuel storage has ${Math.floor(next.bulkFuelReserveLitres)} L (needed ${Math.floor(totalNeededL)} L). Please purchase diesel wholesale in the Fuel Manager!`,
          type: 'error'
        });
      }

      return next;
    });
  };

  const handleBuyBulkFuel = (litres: number) => {
    let volumeDiscount = 1.0;
    if (litres >= 25000) volumeDiscount = 0.88;
    else if (litres >= 12000) volumeDiscount = 0.94;
    else if (litres >= 5000) volumeDiscount = 0.98;

    const baseWholesale = gameState.wholesaleRackPrice || +(gameState.currentDieselMarketPrice * 0.82).toFixed(2);
    const actualWholesalePrice = +(baseWholesale * volumeDiscount).toFixed(2);

    const maxCap = gameState.bulkFuelCapacityLitres || 20000;
    const pendingTotal = gameState.pendingFuelDeliveries.reduce((sum, d) => sum + d.amountLitres, 0);
    const space = Math.max(0, maxCap - gameState.bulkFuelReserveLitres - pendingTotal);
    const actualLitres = Math.min(litres, space);

    if (actualLitres < 1000) {
      setPurchaseResultModal({
        title: 'Fuel Order Failed',
        message: `Insufficient bulk storage space or order too small (minimum 1,000L). Available storage space: ${space.toLocaleString()}L.`,
        success: false
      });
      return;
    }

    const actualCost = Math.floor(actualLitres * actualWholesalePrice);
    if (gameState.cash < actualCost) {
      setPurchaseResultModal({
        title: 'Fuel Order Failed',
        message: `Insufficient funds! Wholesale diesel order of ${actualLitres.toLocaleString()}L costs $${actualCost.toLocaleString()}, but you have $${gameState.cash.toLocaleString()}.`,
        success: false
      });
      return;
    }

    setPurchaseApprovalModal({
      title: 'Bulk Wholesale Diesel Order',
      description: `Confirm order of ${actualLitres.toLocaleString()} Litres of wholesale diesel at $${actualWholesalePrice}/L.`,
      cost: actualCost,
      onConfirm: () => {
        setGameState(prev => {
          const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
          if (next.cash < actualCost) return next;

          next.cash -= actualCost;
          const deliverySeconds = Math.max(SIMULATION_CONFIG.contracts.minimumFuelDeliverySeconds, Math.floor(actualLitres * SIMULATION_CONFIG.contracts.fuelDeliverySecondsPerLitre)); 
          
          next.pendingFuelDeliveries.push({
            id: `delivery-${Date.now()}`,
            amountLitres: actualLitres,
            remainingSeconds: deliverySeconds,
            totalCost: actualCost
          });

          const retailCost = Math.floor(actualLitres * next.currentDieselMarketPrice);
          next.totalFuelCostSaved = (next.totalFuelCostSaved || 0) + (retailCost - actualCost);

          return next;
        });

        setPurchaseResultModal({
          title: 'Fuel Order Dispatched!',
          message: `Successfully ordered ${actualLitres.toLocaleString()}L of wholesale diesel for $${actualCost.toLocaleString()}. Delivery tank truck en-route to depot storage.`,
          success: true
        });
        setPurchaseApprovalModal(null);
      }
    });
  };

  const handleTopOffFleetFromDepot = () => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      if (next.bulkFuelReserveLitres <= 0) return prev;

      next.trucks.forEach(t => {
        const currentL = t.currentFuelLitres ?? (t.currentFuelGallons ? t.currentFuelGallons * SIMULATION_CONFIG.fuel.litresPerUsGallon : 0);
        const maxL = t.maxFuelLitres || (t.maxFuelGallons ? t.maxFuelGallons * SIMULATION_CONFIG.fuel.litresPerUsGallon : 850);
        
        if (!t.assignedContractId && currentL < maxL && next.bulkFuelReserveLitres > 0) {
          const needed = maxL - currentL;
          const pumped = Math.min(needed, next.bulkFuelReserveLitres);
          t.currentFuelLitres = currentL + pumped;
          t.currentFuelGallons = +(t.currentFuelLitres / SIMULATION_CONFIG.fuel.litresPerUsGallon).toFixed(1);
          next.bulkFuelReserveLitres -= pumped;
        }
      });

      return next;
    });
  };

  const handleToggleAutoRefuel = () => {
    setGameState(prev => ({
      ...prev,
      autoRefuelFromDepot: !prev.autoRefuelFromDepot
    }));
  };

  const handleToggleAutoDispatch = () => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      if (!next.depot) next.depot = { repairBayLevel: 1, fuelTerminalLevel: 1, driverLoungeLevel: 1, dispatchAILevel: 0, warehouseLevel: 1 };
      const current = next.depot.isAutoDispatchEnabled ?? true;
      next.depot.isAutoDispatchEnabled = !current;
      return next;
    });
  };

  const handleExpediteRepair = (truckId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const truck = next.trucks.find(t => t.id === truckId);
      if (!truck) return prev;

      const remainingSecs = truck.maintenanceSecondsRemaining || 3600;
      const remainingMins = Math.ceil(remainingSecs / 60);
      const repairBayLvl = next.depot?.repairBayLevel || 1;
      const bayDiscount = Math.max(0.6, 1 - (repairBayLvl * 0.05));
      const expediteCost = Math.max(80, Math.floor((remainingMins * SIMULATION_CONFIG.maintenance.service.expedite.costPerMinute + SIMULATION_CONFIG.maintenance.service.expedite.baseFee) * bayDiscount));

      if (next.cash < expediteCost) return prev;

      next.cash -= expediteCost;
      truck.conditionPercent = SIMULATION_CONFIG.vehicleDefaults.startingConditionPercent;
      truck.oilLifePercent = SIMULATION_CONFIG.vehicleDefaults.startingOilLifePercent;
      truck.tireTreadPercent = SIMULATION_CONFIG.vehicleDefaults.startingTireTreadPercent;
      truck.brakeWearPercent = SIMULATION_CONFIG.vehicleDefaults.startingBrakeWearPercent;
      truck.batteryHealthPercent = SIMULATION_CONFIG.vehicleDefaults.startingBatteryHealthPercent;
      truck.suspensionHealthPercent = SIMULATION_CONFIG.vehicleDefaults.startingSuspensionHealthPercent;
      truck.status = 'idle';
      truck.maintenanceSecondsRemaining = 0;
      truck.scheduledUpgradeParts = [];
      truck.scheduledMaintenanceServices = [];
      return next;
    });
  };

  const handleRepairTruck = (truckId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const truck = next.trucks.find(t => t.id === truckId);
      if (!truck) return prev;

      const repairBayLvl = next.depot.repairBayLevel || 1;
      const cost = Math.floor((100 - (truck.conditionPercent ?? 100)) * SIMULATION_CONFIG.maintenance.service.body.costPerConditionPoint * Math.max((SIMULATION_CONFIG.maintenance.repairBay?.minimumDiscountFactor ?? 0.5), 1 - (repairBayLvl * (SIMULATION_CONFIG.maintenance.repairBay?.discountPerLevel ?? 0.1))));
      if (next.cash < cost) return prev;

      next.cash -= cost;
      truck.conditionPercent = SIMULATION_CONFIG.vehicleDefaults.startingConditionPercent;
      return next;
    });
  };

  const handleFileInsuranceClaim = (truckId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const truck = next.trucks.find(t => t.id === truckId);
      if (!truck) return prev;
      const tier = truck.insuranceTier || (truck.hasInsurance ? 'Standard Collision' : 'None');
      if (tier === 'None' || tier === 'Liability Only') return prev;
      if (truck.conditionPercent >= SIMULATION_CONFIG.maintenance.condition.insuranceClaimMinimumPercent && truck.status !== 'breakdown') return prev;

      const repairBayLvl = next.depot.repairBayLevel || 1;
      const repairCost = Math.floor((100 - truck.conditionPercent) * SIMULATION_CONFIG.maintenance.service.body.costPerConditionPoint * Math.max((SIMULATION_CONFIG.maintenance.repairBay?.minimumDiscountFactor ?? 0.5), 1 - (repairBayLvl * (SIMULATION_CONFIG.maintenance.repairBay?.discountPerLevel ?? 0.1))));
      
      const deductible = tier === 'Full Comprehensive' ? 0 : SIMULATION_CONFIG.maintenance.insurance.deductible;
      const reimbursementRate = tier === 'Full Comprehensive' ? 1.0 : SIMULATION_CONFIG.maintenance.insurance.reimbursementRate;

      if (next.cash < deductible) return prev;

      next.cash -= deductible;
      const payout = Math.floor(repairCost * reimbursementRate);
      next.cash += payout;

      truck.conditionPercent = Math.min(SIMULATION_CONFIG.vehicleDefaults.startingConditionPercent, truck.conditionPercent + SIMULATION_CONFIG.maintenance.condition.insuranceRepairBonusPercent);
      if (truck.status === 'breakdown') truck.status = 'idle';

      next.eventLogs.unshift({
        id: `insurance-claim-${Date.now()}`,
        timestamp: Date.now(),
        title: `Insurance Claim Approved (${tier})`,
        message: `Underwriters approved claim for ${truck.name}. Paid $${deductible} deductible, received $${payout} repair reimbursement, and restored unit condition!`,
        type: 'success',
        cashChange: payout - deductible
      });

      return next;
    });
  };

  const handleServiceOil = (truckId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const truck = next.trucks.find(t => t.id === truckId);
      if (!truck) return prev;
      const quote = getMaintenanceQuote(truck, 'oil');
      if (next.cash < quote.cost) return prev;

      next.cash -= quote.cost;
      truck.oilLifePercent = SIMULATION_CONFIG.vehicleDefaults.startingOilLifePercent;
      return next;
    });
  };

  const handleServiceTires = (truckId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const truck = next.trucks.find(t => t.id === truckId);
      if (!truck) return prev;
      const quote = getMaintenanceQuote(truck, 'tires');
      if (next.cash < quote.cost) return prev;

      next.cash -= quote.cost;
      truck.tireTreadPercent = SIMULATION_CONFIG.vehicleDefaults.startingTireTreadPercent;
      return next;
    });
  };

  const handleServiceBrakes = (truckId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const truck = next.trucks.find(t => t.id === truckId);
      if (!truck || next.cash < SIMULATION_CONFIG.maintenance.service.brakes.cost || truck.status === 'in_transit') return prev;

      next.cash -= SIMULATION_CONFIG.maintenance.service.brakes.cost;
      truck.brakeWearPercent = SIMULATION_CONFIG.vehicleDefaults.startingBrakeWearPercent;
      truck.status = 'maintenance';
      truck.maintenanceSecondsRemaining = SIMULATION_CONFIG.maintenance.service.brakes.timeSeconds;
      return next;
    });
  };

  const handleServiceBattery = (truckId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const truck = next.trucks.find(t => t.id === truckId);
      if (!truck || next.cash < SIMULATION_CONFIG.maintenance.service.battery.cost || truck.status === 'in_transit') return prev;

      next.cash -= SIMULATION_CONFIG.maintenance.service.battery.cost;
      truck.batteryHealthPercent = SIMULATION_CONFIG.vehicleDefaults.startingBatteryHealthPercent;
      truck.status = 'maintenance';
      truck.maintenanceSecondsRemaining = SIMULATION_CONFIG.maintenance.service.battery.timeSeconds;
      return next;
    });
  };

  const handleServiceSuspension = (truckId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const truck = next.trucks.find(t => t.id === truckId);
      if (!truck || next.cash < SIMULATION_CONFIG.maintenance.service.suspension.cost || truck.status === 'in_transit') return prev;

      next.cash -= SIMULATION_CONFIG.maintenance.service.suspension.cost;
      truck.suspensionHealthPercent = SIMULATION_CONFIG.vehicleDefaults.startingSuspensionHealthPercent;
      truck.status = 'maintenance';
      truck.maintenanceSecondsRemaining = SIMULATION_CONFIG.maintenance.service.suspension.timeSeconds;
      return next;
    });
  };

  const handleRefillDef = (truckId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const truck = next.trucks.find(t => t.id === truckId);
      if (!truck || next.cash < SIMULATION_CONFIG.maintenance.service.def.cost) return prev;

      next.cash -= SIMULATION_CONFIG.maintenance.service.def.cost;
      truck.defLevelLitres = truck.maxDefLitres || SIMULATION_CONFIG.fuel.defaultTankCapacityLitres;
      return next;
    });
  };

  const handleApproveService = (truckId: string, selectedServices: string[], scheduleAfterJob: boolean) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const truck = next.trucks.find(t => t.id === truckId);

      if (!truck || selectedServices.length === 0) return prev;

      // Prevent duplicate payment / duplicate service orders.
      if (
        truck.status === 'maintenance' ||
        truck.scheduledMaintenanceAfterJob === true
      ) {
        next.eventLogs.unshift({
          id: `maint-error-${Date.now()}`,
          timestamp: Date.now(),
          title: '🔧 Maintenance Error',
          message: `Unable to schedule maintenance for ${truck.name}: Rig already in service bay or maintenance scheduled.`,
          type: 'error'
        });
        return next;
      }

      const serviceCosts: Record<string, {
        cost: number;
        timeSecs: number;
        apply: () => void;
      }> = {
        oil: {
          ...getMaintenanceQuote(truck, 'oil'),
          apply: () => {
            truck.oilLifePercent =
              SIMULATION_CONFIG.vehicleDefaults.startingOilLifePercent;
          }
        },
        tires: {
          ...getMaintenanceQuote(truck, 'tires'),
          apply: () => {
            truck.tireTreadPercent =
              SIMULATION_CONFIG.vehicleDefaults.startingTireTreadPercent;
          }
        },
        brakes: {
          ...getMaintenanceQuote(truck, 'brakes'),
          apply: () => {
            truck.brakeWearPercent =
              SIMULATION_CONFIG.vehicleDefaults.startingBrakeWearPercent;
          }
        },
        battery: {
          ...getMaintenanceQuote(truck, 'battery'),
          apply: () => {
            truck.batteryHealthPercent =
              SIMULATION_CONFIG.vehicleDefaults.startingBatteryHealthPercent;
          }
        },
        suspension: {
          ...getMaintenanceQuote(truck, 'suspension'),
          apply: () => {
            truck.suspensionHealthPercent =
              SIMULATION_CONFIG.vehicleDefaults.startingSuspensionHealthPercent;
          }
        },
        def: {
          ...getMaintenanceQuote(truck, 'def'),
          apply: () => {
            truck.defLevelLitres =
              truck.maxDefLitres ||
              SIMULATION_CONFIG.fuel.defaultTankCapacityLitres;
          }
        },
        body: {
          ...getMaintenanceQuote(truck, 'body'),
          apply: () => {
            truck.conditionPercent =
              SIMULATION_CONFIG.vehicleDefaults.startingConditionPercent;

            if (truck.status === 'breakdown') {
              truck.status = 'idle';
            }
          }
        }
      };

      const billableServices = selectedServices.filter(key => {
        const service = serviceCosts[key];
        return Boolean(service && (service.cost > 0 || service.timeSecs > 0));
      });

      let totalCost = 0;
      let totalTime = 0;

      for (const key of billableServices) {
        const service = serviceCosts[key];
        totalCost += service.cost;
        totalTime += service.timeSecs;
      }

      if (billableServices.length === 0 || totalCost <= 0 || totalTime <= 0 || next.cash < totalCost) {
        next.eventLogs.unshift({
          id: `maint-error-${Date.now()}`,
          timestamp: Date.now(),
          title: '🔧 Maintenance Error',
          message: `Unable to process service request for ${truck.name}: ${next.cash < totalCost ? 'Insufficient funds.' : 'No billable services selected.'}`,
          type: 'error'
        });
        return next;
      }

      /*
       * Scheduling a repair while the truck is working:
       * - reserve the order
       * - charge once
       * - DO NOT apply the repairs yet
       * - DO NOT put the truck in the repair bay yet
       */
      if (scheduleAfterJob) {
        if (!truck.assignedContractId && truck.status !== 'in_transit') {
          return prev;
        }

        next.cash -= totalCost;

        truck.scheduledMaintenanceAfterJob = true;
        truck.scheduledMaintenanceServices = [...billableServices];
        truck.maintenanceSecondsRemaining = totalTime;

        next.eventLogs.unshift({
          id: `maint-sched-${Date.now()}`,
          timestamp: Date.now(),
          title: '🔧 Maintenance Scheduled',
          message: `Service estimate approved for ${truck.name} ($${totalCost.toLocaleString()}). Rig will enter the HQ repair bay after completing its current delivery.`,
          type: 'success',
          cashChange: -totalCost
        });

        return next;
      }

      /*
       * Immediate service:
       * - must not be actively driving on a delivery
       * - charge once
       * - enter the repair bay
       */
      if (truck.status === 'in_transit') {
        return prev;
      }

      next.cash -= totalCost;

      // Store the purchased service order. Repairs are applied only
      // when the repair-bay timer finishes.
      truck.scheduledMaintenanceAfterJob = false;
      truck.scheduledMaintenanceServices = [...billableServices];
      truck.status = 'maintenance';
      truck.maintenanceSecondsRemaining = totalTime;

      next.eventLogs.unshift({
        id: `maint-now-${Date.now()}`,
        timestamp: Date.now(),
        title: '🔧 Repair Bay Servicing',
        message: `Service estimate approved for ${truck.name} ($${totalCost.toLocaleString()}). Rig entered the HQ repair bay for servicing.`,
        type: 'success',
        cashChange: -totalCost
      });

      return next;
    });
  };

  const handleInstallPrePass = (truckId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const truck = next.trucks.find(t => t.id === truckId);
      if (!truck || truck.hasPrePass || next.cash < SIMULATION_CONFIG.compliance.prePass.installationCost) return prev;

      next.cash -= SIMULATION_CONFIG.compliance.prePass.installationCost;
      truck.hasPrePass = true;
      return next;
    });
  };

  const handleBuyCrypto = (symbol: string, usdAmount: number) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      if (!next.cryptoMarket) return prev;
      if (next.cash < usdAmount || usdAmount <= 0) return prev;

      const asset = next.cryptoMarket.assets[symbol];
      if (!asset) return prev;

      const fee = usdAmount * 0.001; // 0.1% exchange fee
      const effectiveUsd = usdAmount - fee;
      const coinAmount = effectiveUsd / asset.price;

      next.cash -= usdAmount;

      if (!next.cryptoMarket.holdings[symbol]) {
        next.cryptoMarket.holdings[symbol] = {
          symbol,
          amount: 0,
          totalInvested: 0,
          averageBuyPrice: 0
        };
      }

      const holding = next.cryptoMarket.holdings[symbol];
      const newTotalInvested = holding.totalInvested + effectiveUsd;
      const newAmount = holding.amount + coinAmount;
      const newAvgPrice = newAmount > 0 ? newTotalInvested / newAmount : asset.price;

      holding.amount = newAmount;
      holding.totalInvested = newTotalInvested;
      holding.averageBuyPrice = newAvgPrice;

      if (!next.cryptoMarket.tradeHistory) next.cryptoMarket.tradeHistory = [];
      next.cryptoMarket.tradeHistory.unshift({
        id: `trade-${Date.now()}`,
        timestamp: Date.now(),
        symbol,
        type: 'buy',
        amount: coinAmount,
        price: asset.price,
        totalUsd: usdAmount,
        feeUsd: fee
      });
      if (next.cryptoMarket.tradeHistory.length > 50) next.cryptoMarket.tradeHistory.pop();

      next.eventLogs.unshift({
        id: `crypto-buy-${Date.now()}`,
        timestamp: Date.now(),
        title: `Crypto Buy Executed: ${symbol}`,
        message: `Purchased ${coinAmount.toFixed(4)} ${symbol} for $${usdAmount.toLocaleString()} at $${asset.price.toLocaleString()} (${fee.toFixed(2)} fee).`,
        type: 'success',
        cashChange: -usdAmount
      });

      return next;
    });
  };

  const handleSellCrypto = (symbol: string, coinAmount: number) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      if (!next.cryptoMarket) return prev;
      const holding = next.cryptoMarket.holdings[symbol];
      const asset = next.cryptoMarket.assets[symbol];
      if (!holding || !asset || holding.amount < coinAmount || coinAmount <= 0) return prev;

      const grossUsd = coinAmount * asset.price;
      const fee = grossUsd * 0.001; // 0.1% exchange fee
      const netUsd = grossUsd - fee;

      next.cash += netUsd;

      const remainingAmount = holding.amount - coinAmount;
      if (remainingAmount <= 0.000001) {
        delete next.cryptoMarket.holdings[symbol];
      } else {
        holding.amount = remainingAmount;
        holding.totalInvested = holding.totalInvested * (remainingAmount / (holding.amount + coinAmount));
      }

      if (!next.cryptoMarket.tradeHistory) next.cryptoMarket.tradeHistory = [];
      next.cryptoMarket.tradeHistory.unshift({
        id: `trade-${Date.now()}`,
        timestamp: Date.now(),
        symbol,
        type: 'sell',
        amount: coinAmount,
        price: asset.price,
        totalUsd: netUsd,
        feeUsd: fee
      });
      if (next.cryptoMarket.tradeHistory.length > 50) next.cryptoMarket.tradeHistory.pop();

      next.eventLogs.unshift({
        id: `crypto-sell-${Date.now()}`,
        timestamp: Date.now(),
        title: `Crypto Sell Executed: ${symbol}`,
        message: `Sold ${coinAmount.toFixed(4)} ${symbol} for $${netUsd.toLocaleString()} net at $${asset.price.toLocaleString()} (${fee.toFixed(2)} fee).`,
        type: 'success',
        cashChange: netUsd
      });

      return next;
    });
  };

  const handleRelocateTruck = (truckId: string, targetHub: TruckRegion) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const truck = next.trucks.find(t => t.id === truckId);
      if (!truck || truck.status === 'in_transit' || truck.status === 'shipping' || truck.assignedContractId) return prev;

      const hubs = next.regionalHubs || {};
      const target = hubs[targetHub];
      if (!target || !target.isUnlocked) return prev;

      const shippingCost = 18000;
      if (next.cash < shippingCost) return prev;

      next.cash -= shippingCost;
      truck.status = 'shipping';
      truck.destinationHub = targetHub;
      truck.shippingSecondsRemaining = 300;

      next.eventLogs.unshift({
        id: `relocate-truck-${truckId}-${Date.now()}`,
        timestamp: Date.now(),
        title: `🚢 Intercontinental Fleet Shipping Initiated`,
        message: `${truck.name} dispatched to port for cargo carrier transit from ${truck.stationedHub} to ${targetHub} Terminal (-$${shippingCost.toLocaleString()}).`,
        type: 'info',
        cashChange: -shippingCost
      });

      return next;
    });
  };

  const handleBuyTruck = (model: typeof CATALOG_TRUCKS[0], customName?: string) => {
    const regionalHubs = gameState.regionalHubs || {};
    const hub = regionalHubs[model.region];
    if (model.region && model.region !== 'Electric EV' && (!hub || !hub.isUnlocked)) {
      setPurchaseResultModal({
        title: 'Purchase Denied: Regional Hub Required',
        message: `You must acquire the ${model.region} Regional Hub (${hub?.hubName || 'Continental Terminal'}) in Headquarters before purchasing or stationing trucks in this region.`,
        success: false
      });
      return;
    }

    if (model.unlockRequirement && gameState.companyLevel < model.unlockRequirement.companyLevel) {
      setPurchaseResultModal({
        title: 'Purchase Failed',
        message: `Company Level ${model.unlockRequirement.companyLevel} required to acquire ${model.name}.`,
        success: false
      });
      return;
    }
    if (gameState.cash < model.price) {
      setPurchaseResultModal({
        title: 'Purchase Failed',
        message: `Insufficient funds! ${model.name} costs $${model.price.toLocaleString()}, but you have $${gameState.cash.toLocaleString()}.`,
        success: false
      });
      return;
    }

    setPurchaseApprovalModal({
      title: `Acquire Commercial Rig: ${customName || model.name}`,
      description: `Confirm purchase of ${model.name} (${model.horsepower} HP, ${model.modelClass}).`,
      cost: model.price,
      onConfirm: () => {
        setGameState(prev => {
          if (model.unlockRequirement && prev.companyLevel < model.unlockRequirement.companyLevel) return prev;
          if (prev.cash < model.price) return prev;

          const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
          next.cash -= model.price;

          const newTruck: Truck = {
            id: generateTruckId(next.trucks),
            name: customName || model.name,
            brand: model.brand,
            region: model.region,
            modelClass: model.modelClass,
            engineSpecs: JSON.parse(JSON.stringify(model.engineSpecs)),
            sleeperCabType: model.sleeperCabType,
            price: model.price,
            horsepower: model.horsepower,
            maxFuelLitres: model.maxFuelLitres,
            currentFuelLitres: model.maxFuelLitres,
            maxFuelGallons: Math.round(model.maxFuelLitres / SIMULATION_CONFIG.fuel.litresPerUsGallon),
            currentFuelGallons: Math.round(model.maxFuelLitres / SIMULATION_CONFIG.fuel.litresPerUsGallon),
            fuelEfficiencyMpg: model.fuelEfficiencyMpg,
            conditionPercent: SIMULATION_CONFIG.vehicleDefaults.startingConditionPercent,
            oilLifePercent: SIMULATION_CONFIG.vehicleDefaults.startingOilLifePercent,
            tireTreadPercent: SIMULATION_CONFIG.vehicleDefaults.startingTireTreadPercent,
            hasPrePass: false,
            durabilityRating: model.durabilityRating,
            assignedDriverId: null,
            assignedTrailerId: null,
            assignedContractId: null,
            upgrades: { engineStage: 0, fuelTankStage: 0, aeroStage: 0, comfortStage: 0, gpsStage: 0 },
            imageIcon: model.imageIcon,
            imageUrl: model.imageUrl,
            description: model.description,
            currentCity: 'HQ Depot',
            status: 'shipping',
            stationedHub: model.region,
            shippingSecondsRemaining: 180,
            destinationHub: model.region,
            odometerMiles: 0,
            hasInsurance: true,
            vin: '1HD' + Math.random().toString(36).substring(2, 15).toUpperCase(),
            licensePlate: (model.region === 'Europe' ? 'DE-' : model.region === 'Asia' ? 'JP-' : 'TX-') + Math.floor(100 + Math.random() * 900) + '-TR',
            axleConfig: model.modelClass === 'Class 3 Light' ? '4x2 Single' : model.modelClass === 'Super Hauler' ? '8x4 Tridem' : '6x4 Tandem',
            emissionsStandard: model.region === 'Europe' ? 'Euro VI-e' : model.region === 'Electric EV' ? 'Zero Emissions (EV)' : 'EPA 2024 (Tier 4)',
            defLevelLitres: model.modelClass === 'Class 3 Light'
              ? SIMULATION_CONFIG.vehicleDefaults.defCapacityLightLitres
              : SIMULATION_CONFIG.vehicleDefaults.defCapacityHeavyLitres,
            maxDefLitres: model.modelClass === 'Class 3 Light'
              ? SIMULATION_CONFIG.vehicleDefaults.defCapacityLightLitres
              : SIMULATION_CONFIG.vehicleDefaults.defCapacityHeavyLitres,
            brakeWearPercent: SIMULATION_CONFIG.vehicleDefaults.startingBrakeWearPercent,
            batteryHealthPercent: SIMULATION_CONFIG.vehicleDefaults.startingBatteryHealthPercent,
            suspensionHealthPercent: SIMULATION_CONFIG.vehicleDefaults.startingSuspensionHealthPercent
          };

          next.trucks.push(newTruck);
          return next;
        });

        setPurchaseResultModal({
          title: 'Purchase Successful!',
          message: `Successfully acquired ${customName || model.name} for $${model.price.toLocaleString()}. Rig is now stationed at HQ Depot.`,
          success: true
        });
        setPurchaseApprovalModal(null);
      }
    });
  };

  const handleBuyTrailer = (model: typeof CATALOG_TRAILERS[0]) => {
    if (gameState.cash < model.price) {
      setPurchaseResultModal({
        title: 'Purchase Failed',
        message: `Insufficient funds! ${model.name} costs $${model.price.toLocaleString()}, but you have $${gameState.cash.toLocaleString()}.`,
        success: false
      });
      return;
    }

    setPurchaseApprovalModal({
      title: `Acquire Trailer: ${model.name}`,
      description: `Confirm purchase of ${model.manufacturer} ${model.type} trailer (${model.capacityTons}T capacity).`,
      cost: model.price,
      onConfirm: () => {
        setGameState(prev => {
          if (prev.cash < model.price) return prev;

          const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
          next.cash -= model.price;

          next.trailers.push({
            id: generateTrailerId(next.trailers),
            name: model.name,
            manufacturer: model.manufacturer,
            type: model.type,
            capacityTons: model.capacityTons,
            price: model.price,
            conditionPercent: SIMULATION_CONFIG.vehicleDefaults.startingConditionPercent,
            hazmatCertified: model.hazmatCertified,
            assignedTruckId: null,
            imageIcon: model.imageIcon,
            imageUrl: model.imageUrl,
            description: model.description
          });

          return next;
        });

        setPurchaseResultModal({
          title: 'Purchase Successful!',
          message: `Successfully acquired ${model.name} for $${model.price.toLocaleString()}. Trailer is ready in company yard.`,
          success: true
        });
        setPurchaseApprovalModal(null);
      }
    });
  };

  const handleSellTruck = (truckId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const truck = next.trucks.find(t => t.id === truckId);
      if (!truck || truck.assignedContractId || truck.status === 'in_transit') return prev;

      const basePrice = truck.price || 120000;
      const cond = truck.conditionPercent ?? 100;
      const conditionFactor = Math.max(0.55, cond / 100);
      const refund = Math.floor(basePrice * conditionFactor * 0.85);

      next.cash += refund;

      if (truck.assignedDriverId) {
        const driver = next.drivers.find(d => d.id === truck.assignedDriverId);
        if (driver) driver.assignedTruckId = null;
      }

      next.trailers.forEach(tr => {
        if (tr.assignedTruckId === truckId) tr.assignedTruckId = null;
      });

      next.trucks = next.trucks.filter(t => t.id !== truckId);

      next.eventLogs.unshift({
        id: `sell-truck-${Date.now()}`,
        timestamp: Date.now(),
        title: `Rig Sold: ${truck.name}`,
        message: `Sold commercial rig ${truck.name} for $${refund.toLocaleString()} (Condition: ${Math.floor(cond)}%).`,
        type: 'success',
        cashChange: refund
      });

      return next;
    });
  };

  const handleSellTrailer = (trailerId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const trailer = next.trailers.find(t => t.id === trailerId);
      if (!trailer) return prev;

      if (trailer.assignedTruckId) {
        const assignedTruck = next.trucks.find(t => t.id === trailer.assignedTruckId);
        if (assignedTruck && (assignedTruck.assignedContractId || assignedTruck.status === 'in_transit')) {
          return prev;
        }
        trailer.assignedTruckId = null;
      }

      const basePrice = trailer.price || 25000;
      const cond = trailer.conditionPercent ?? 100;
      const refund = Math.floor(basePrice * (cond / 100) * 0.70);

      next.cash += refund;

      next.trucks.forEach(t => {
        if (t.assignedTrailerId === trailerId) t.assignedTrailerId = null;
      });

      next.trailers = next.trailers.filter(tr => tr.id !== trailerId);

      next.eventLogs.unshift({
        id: `sell-trailer-${Date.now()}`,
        timestamp: Date.now(),
        title: `Trailer Sold: ${trailer.name}`,
        message: `Sold trailer ${trailer.name} for $${refund.toLocaleString()} (Condition: ${Math.floor(cond)}%).`,
        type: 'success',
        cashChange: refund
      });

      return next;
    });
  };

  const handleUpgradeTruckPart = (truckId: string, part: 'engineStage' | 'fuelTankStage' | 'aeroStage' | 'comfortStage' | 'gpsStage') => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const truck = next.trucks.find(t => t.id === truckId);
      if (!truck) return prev;

      const currentStage = truck.upgrades[part];
      if (currentStage >= 5) return prev;

      const cost = (currentStage + 1) * 3000;
      if (next.cash < cost) return prev;

      next.cash -= cost;
      truck.upgrades[part] += 1;
      return next;
    });
  };

  const handleScheduleTruckUpgrades = (
    truckId: string,
    selectedParts: Array<keyof Truck['upgrades']>,
    totalCost: number,
    totalSeconds: number,
    scheduleAfterJob: boolean
  ) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const truck = next.trucks.find(t => t.id === truckId);
      if (!truck) return prev;
      if (next.cash < totalCost) return prev;

      next.cash -= totalCost;

      const existingScheduledParts = truck.scheduledUpgradeParts || [];
      const mergedParts = Array.from(new Set([...existingScheduledParts, ...selectedParts])) as Array<keyof Truck['upgrades']>;

      if (scheduleAfterJob) {
        if (!truck.assignedContractId && truck.status !== 'in_transit') {
          truck.status = 'maintenance';
          truck.scheduledMaintenanceAfterJob = false;
          truck.scheduledUpgradeParts = mergedParts;
          truck.maintenanceSecondsRemaining = (truck.maintenanceSecondsRemaining || 0) + totalSeconds;
        } else {
          truck.scheduledMaintenanceAfterJob = true;
          truck.scheduledUpgradeParts = mergedParts;
          truck.maintenanceSecondsRemaining = (truck.maintenanceSecondsRemaining || 0) + totalSeconds;
        }
      } else {
        if (truck.status === 'in_transit') {
          truck.scheduledMaintenanceAfterJob = true;
          truck.scheduledUpgradeParts = mergedParts;
          truck.maintenanceSecondsRemaining = (truck.maintenanceSecondsRemaining || 0) + totalSeconds;
        } else {
          truck.status = 'maintenance';
          truck.scheduledMaintenanceAfterJob = false;
          truck.scheduledUpgradeParts = mergedParts;
          truck.maintenanceSecondsRemaining = (truck.maintenanceSecondsRemaining || 0) + totalSeconds;
        }
      }

      next.eventLogs.unshift({
        id: `upgrade-order-${Date.now()}`,
        timestamp: Date.now(),
        title: '⚙️ Upgrade Order Approved',
        message: `${selectedParts.length} upgrade component(s) approved for ${truck.name} ($${totalCost.toLocaleString()}). Rig scheduled in HQ Repair Bay (${Math.ceil(totalSeconds / 60)} mins).`,
        type: 'info',
        cashChange: -totalCost
      });

      return next;
    });
  };

  const handleAttachTrailer = (truckId: string, trailerId: string | null) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const truck = next.trucks.find(t => t.id === truckId);
      if (!truck) return prev;

      // Detach prior trailer if any
      next.trailers.forEach(tr => {
        if (tr.assignedTruckId === truckId) tr.assignedTruckId = null;
      });

      truck.assignedTrailerId = trailerId;
      if (trailerId) {
        const trailer = next.trailers.find(tr => tr.id === trailerId);
        if (trailer) trailer.assignedTruckId = truckId;
      }

      return next;
    });
  };

  const handleBonusDriver = (driverId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      if (next.cash < SIMULATION_CONFIG.driver.morale.loungeCost) return prev;
      const driver = next.drivers.find(d => d.id === driverId);
      if (!driver) return prev;

      next.cash -= SIMULATION_CONFIG.driver.morale.loungeCost;
      driver.moralePercent = Math.min(100, (driver.moralePercent || SIMULATION_CONFIG.driver.morale.fullPercent) + SIMULATION_CONFIG.driver.morale.loungeMoraleBonus);
      return next;
    });
  };

  const handleRaiseDriverPay = (driverId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const driver = next.drivers.find(d => d.id === driverId);
      if (!driver) return prev;

      driver.dailySalary += 30;
      driver.moralePercent = Math.min(100, (driver.moralePercent || 100) + 20);

      next.eventLogs.unshift({
        id: `driver-raise-${Date.now()}`,
        timestamp: Date.now(),
        title: `Salary Raised: ${driver.name}`,
        message: `${driver.name}'s daily wage increased to $${driver.dailySalary}/day. Morale boosted!`,
        type: 'success'
      });

      return next;
    });
  };

  const handleFireDriver = (driverId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const driver = next.drivers.find(d => d.id === driverId);
      if (!driver || driver.id === 'driver-player') return prev; // Cannot fire owner operator

      // Unassign truck if assigned
      if (driver.assignedTruckId) {
        const truck = next.trucks.find(t => t.id === driver.assignedTruckId);
        if (truck) truck.assignedDriverId = null;
      }

      next.drivers = next.drivers.filter(d => d.id !== driverId);
      return next;
    });
  };

  const handleAssignDriverTruck = (driverId: string, truckId: string | null) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;

      // Clear any other truck currently referencing this driver
      next.trucks.forEach(t => {
        if (t.assignedDriverId === driverId) {
          t.assignedDriverId = null;
        }
      });

      // Clear any other driver currently referencing this target truck
      if (truckId) {
        next.drivers.forEach(d => {
          if (d.assignedTruckId === truckId) {
            d.assignedTruckId = null;
          }
        });
      }

      const driver = next.drivers.find(d => d.id === driverId);
      if (driver) {
        driver.assignedTruckId = truckId;
      }

      if (truckId) {
        const truck = next.trucks.find(t => t.id === truckId);
        if (truck) {
          truck.assignedDriverId = driverId;
        }
      }

      return next;
    });
  };

  const handleHireDriver = (candidate: typeof HIRABLE_DRIVERS_POOL[0]) => {
    setGameState(prev => {
      // Prevent duplicate hiring of the same driver
      if (prev.drivers.some(d => d.name.toLowerCase() === candidate.name.toLowerCase())) {
        return prev;
      }

      const fee = candidate.skillLevel * SIMULATION_CONFIG.finance.staff.recruitingFeePerSkillLevel;
      if (prev.cash < fee) return prev;

      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      next.cash -= fee;

      next.drivers.push({
        id: `driver-${Date.now()}`,
        name: candidate.name,
        avatar: candidate.avatar,
        cdlClass: candidate.cdlClass,
        experienceYears: candidate.experienceYears,
        cleanRecordScore: candidate.cleanRecordScore,
        skillLevel: candidate.skillLevel,
        xp: 0,
        maxXp: candidate.skillLevel * SIMULATION_CONFIG.finance.staff.initialXpPerSkillLevel,
        fatiguePercent: 0,
        moralePercent: 100,
        eldShiftHoursRemaining: 11.0,
        dailySalary: candidate.dailySalary,
        traits: candidate.traits,
        assignedTruckId: null
      });

      return next;
    });
  };

  const handleRestDriver = (driverId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const driver = next.drivers.find(d => d.id === driverId);
      if (driver) driver.fatiguePercent = Math.max(0, driver.fatiguePercent - 25);
      return next;
    });
  };

  const handleUpgradeDepotBuilding = (buildingKey: keyof DepotUpgrade) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const currentLevel = next.depot[buildingKey];
      const cost = (currentLevel + 1) * 5000;
      if (next.cash < cost) return prev;

      next.cash -= cost;
      next.depot[buildingKey] += 1;

      // Realism: Upgrading fuel terminal increases bulk capacity
      if (buildingKey === 'fuelTerminalLevel') {
        next.bulkFuelCapacityLitres = 20000 + (next.depot.fuelTerminalLevel * 15000);
      }

      return next;
    });
  };

  const handleUpgradeSkill = (skillId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;

      // Skill definition
      const skill = SKILL_TREE.find(s => s.id === skillId);
      if (!skill) return prev;

      // Keep old saves compatible with newly added skills.
      if (!next.skills) next.skills = {};

      const currentLevel = next.skills[skillId] || 0;

      // Never allow a skill to exceed its defined mastery level.
      if (currentLevel >= skill.maxLevel) return prev;

      // Total company skill points are earned progressively rather than
      // receiving two points for every company level forever.
      const level = Math.max(1, next.companyLevel || 1);

      const totalSkillPoints =
        level <= 10
          ? level
          : 10 + Math.floor((level - 10) / 2);

      const spentPoints = Object.entries(next.skills).reduce((sum, [id, lvl]) => {
        const skillDef = SKILL_TREE.find(s => s.id === id);
        return sum + ((lvl || 0) * (skillDef?.costPoints || 1));
      }, 0);

      const availablePoints = Math.max(0, totalSkillPoints - spentPoints);

      if (availablePoints < skill.costPoints) return prev;

      next.skills[skillId] = currentLevel + 1;

      return next;
    });
  };

  const handleTakeLoan = (principal: number, termMonths: number, title: string, lenderName: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const creditScore = next.profile?.creditScore || 720;
      const scoreDiff = SIMULATION_CONFIG.finance.credit.maximumScore - creditScore;
      const baseRate = termMonths >= 60 ? 0.055 : termMonths >= 24 ? 0.065 : 0.085;
      const interestRateAnnual = +(baseRate + (scoreDiff / SIMULATION_CONFIG.finance.credit.interestRateScoreRange) * SIMULATION_CONFIG.finance.credit.interestRateSpread).toFixed(3);

      const monthlyRate = interestRateAnnual / 12;
      const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);

      next.cash += principal;
      next.loans.push({
        id: `loan-${Date.now()}`,
        title,
        lenderName,
        principalAmount: principal,
        remainingBalance: principal * 1.12,
        interestRateAnnual,
        monthlyPayment: Math.round(monthlyPayment),
        remainingMonths: termMonths,
        totalMonths: termMonths
      });

      return next;
    });
  };

  const handleRepayLoan = (loanId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const loan = next.loans.find(l => l.id === loanId);
      if (!loan || next.cash < loan.remainingBalance) return prev;

      next.cash -= Math.round(loan.remainingBalance);
      next.loans = next.loans.filter(l => l.id !== loanId);
      return next;
    });
  };

  const handleAcceptInvestor = (roundId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const inv = next.investors.find(i => i.id === roundId);
      if (!inv || inv.status === 'active') return prev;

      inv.status = 'active';
      next.cash += inv.capitalInjected;
      return next;
    });
  };

  const handleLaunchIPO = () => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      if (next.ipo.isPubliclyTraded || next.companyLevel < 3) return prev;

      next.ipo.isPubliclyTraded = true;
      const raiseCash = 500000;
      next.cash += raiseCash;
      next.ipo.sharePrice = 15.00;
      next.ipo.marketCap = next.ipo.sharePrice * next.ipo.sharesOutstanding;
      next.profile.corporateStructure = 'Publicly Traded (IPO)';
      next.profile.corporateTaxRate = 0.15;
      return next;
    });
  };

  const handlePayDividend = (amount: number) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      if (next.cash < amount) return prev;
      next.cash -= amount;
      next.ipo.totalDividendsPaid = (next.ipo.totalDividendsPaid || 0) + amount;
      return next;
    });
  };

  const handleHireStaff = (role: StaffRole, name: string, salary: number, skill: number, bonus: number) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      if (next.cash < salary) return prev;

      next.cash -= Math.floor(salary * 0.5);
      next.staff.push({
        id: `staff-${Date.now()}`,
        name,
        role,
        salaryMonthly: salary,
        skillRating: skill,
        avatar: '👤',
        efficiencyBonus: bonus,
        hiredTimestamp: Date.now()
      });
      return next;
    });
  };

  const handleFireStaff = (staffId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      next.staff = next.staff.filter(s => s.id !== staffId);
      return next;
    });
  };

  const handleUpgradeStructure = (newStructure: 'Sole Proprietorship' | 'LLC' | 'Corporation' | 'Publicly Traded (IPO)') => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      next.profile.corporateStructure = newStructure;
      if (newStructure === 'Corporation') next.profile.corporateTaxRate = 0.18;
      else if (newStructure === 'Publicly Traded (IPO)') next.profile.corporateTaxRate = 0.15;
      else next.profile.corporateTaxRate = 0.21;
      return next;
    });
  };

  const handleBuyRegionalHub = (region: TruckRegion) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      if (!next.regionalHubs || !next.regionalHubs[region]) return prev;
      const hub = next.regionalHubs[region];
      if (hub.isUnlocked) return prev;

      if (next.companyLevel < hub.levelRequirement) {
        setPurchaseResultModal({
          title: 'Hub Acquisition Denied',
          message: `Company Level ${hub.levelRequirement} required to establish a logistics hub in ${region} (${hub.hubName}).`,
          success: false
        });
        return prev;
      }

      if (next.cash < hub.cost) {
        setPurchaseResultModal({
          title: 'Hub Acquisition Denied',
          message: `Insufficient funds! ${hub.hubName} costs $${hub.cost.toLocaleString()}, but you have $${next.cash.toLocaleString()}.`,
          success: false
        });
        return prev;
      }

      next.cash -= hub.cost;
      hub.isUnlocked = true;

      if (!next.unlockedRegions) next.unlockedRegions = ['America'];
      if (!next.unlockedRegions.includes(region)) {
        next.unlockedRegions.push(region);
      }

      next.eventLogs.unshift({
        id: `regional-hub-${region}-${Date.now()}`,
        timestamp: Date.now(),
        title: `🏢 Regional Hub Established: ${region}`,
        message: `Successfully established ${hub.hubName} in ${hub.cityName} for $${hub.cost.toLocaleString()}. Fleet operations and contract dispatching in ${region} are now fully authorized!`,
        type: 'success',
        cashChange: -hub.cost
      });

      return next;
    });

    setPurchaseResultModal({
      title: 'Regional Hub Established!',
      message: `Successfully acquired regional logistics terminal. You can now station trucks and dispatch freight across ${region}!`,
      success: true
    });
  };

  const handleUnlockRegion = (region: TruckRegion) => {
    if (gameState.unlockedRegions.includes(region)) return;

    const costMap: Record<string, number> = { 'Europe': 50000, 'Africa': 100000, 'Asia': 150000 };
    const levelMap: Record<string, number> = { 'Europe': 3, 'Africa': 4, 'Asia': 5 };
    
    const cost = costMap[region] || 0;
    const levelReq = levelMap[region] || 0;
    
    if (gameState.companyLevel < levelReq) {
      setPurchaseResultModal({
        title: 'Permit Denied',
        message: `Company Level ${levelReq} required to unlock regional operating rights in ${region}.`,
        success: false
      });
      return;
    }
    if (gameState.cash < cost) {
      setPurchaseResultModal({
        title: 'Permit Denied',
        message: `Insufficient funds! ${region} operating permit costs $${cost.toLocaleString()}, but you have $${gameState.cash.toLocaleString()}.`,
        success: false
      });
      return;
    }

    setPurchaseApprovalModal({
      title: `Acquire Operating Permit: ${region}`,
      description: `Confirm acquisition of commercial transit and logistics operating rights for the ${region} network.`,
      cost: cost,
      onConfirm: () => {
        setGameState(prev => {
          const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
          next.cash -= cost;
          next.unlockedRegions.push(region);
          
          next.eventLogs.unshift({
            id: `unlock-region-${region}-${Date.now()}`,
            timestamp: Date.now(),
            title: `Permit Issued: ${region}`,
            message: `Your company has been granted commercial operating rights for the ${region} logistics network.`,
            type: 'success',
            cashChange: -cost
          });
          
          return next;
        });

        setPurchaseResultModal({
          title: 'Permit Approved!',
          message: `Successfully acquired operating permit for ${region} for $${cost.toLocaleString()}. New international contracts are now available!`,
          success: true
        });
        setPurchaseApprovalModal(null);
      }
    });
  };

  const handleBuyHeavyHaulPermit = (region: TruckRegion) => {
    setGameState(prev => {
      const cost = SIMULATION_CONFIG.compliance.heavyHaul.permitCost[region];
      const levelReq = SIMULATION_CONFIG.compliance.heavyHaul.minimumCompanyLevel[region];

      if (
        (prev.heavyHaulPermits || []).includes(region) ||
        !(prev.unlockedRegions || ['America']).includes(region) ||
        prev.cash < cost ||
        prev.companyLevel < levelReq
      ) {
        return prev;
      }

      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;

      if (!next.heavyHaulPermits) {
        next.heavyHaulPermits = [];
      }

      next.cash -= cost;
      next.heavyHaulPermits.push(region);

      next.eventLogs.unshift({
        id: 'heavy-haul-permit-' + region + '-' + Date.now(),
        timestamp: Date.now(),
        title: 'Heavy-Haul Permit Issued: ' + region,
        message: 'Regional overweight authorization acquired for ' + region + ' operations.',
        type: 'success',
        cashChange: -cost
      });

      return next;
    });
  };

  const handleClaimMilestone = (milestoneId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const m = (next.milestones || []).find(item => item.id === milestoneId);
      if (!m || m.isClaimed) return prev;

      m.isClaimed = true;
      next.cash += m.rewardCash;
      next.eventLogs.unshift({
        id: `claim-milestone-${m.id}-${Date.now()}`,
        timestamp: Date.now(),
        title: `Milestone Claimed: ${m.title}`,
        message: `Claimed +$${m.rewardCash.toLocaleString()} treasury reward for milestone accomplishment!`,
        type: 'success',
        cashChange: m.rewardCash
      });

      return next;
    });
  };

  const handleSetTruckInsuranceTier = (truckId: string, tier: InsuranceCoverageTier) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const truck = next.trucks.find(t => t.id === truckId);
      if (truck) {
        truck.insuranceTier = tier;
        truck.hasInsurance = tier !== 'None';
      }
      return next;
    });
  };

  const handleSetTrailerInsuranceTier = (trailerId: string, tier: InsuranceCoverageTier) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const trailer = next.trailers.find(t => t.id === trailerId);
      if (trailer) {
        trailer.insuranceTier = tier;
        trailer.hasInsurance = tier !== 'None';
      }
      return next;
    });
  };

  const handleRecallTruck = (contractId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const contract = next.activeContracts.find(c => c.id === contractId);
      if (!contract) return prev;

      if (contract.assignedTruckId) {
        const truck = next.trucks.find(t => t.id === contract.assignedTruckId);
        if (truck) {
          truck.assignedContractId = null;
          truck.status = 'idle';
        }
      }

      if (contract.assignedDriverId) {
        const driver = next.drivers.find(d => d.id === contract.assignedDriverId);
        if (driver) {
          driver.assignedTruckId = null;
        }
      }

      const cancellationFee = SIMULATION_CONFIG.contracts.cancellationFee;
      next.cash = Math.max(0, next.cash - cancellationFee);

      next.eventLogs.unshift({
        id: `recall-contract-${Date.now()}`,
        timestamp: Date.now(),
        title: `Haul Recalled & Aborted`,
        message: `Dispatch order cancelled for "${contract.title}". Rig ordered back to terminal (-$${cancellationFee} breach fee).`,
        type: 'warning',
        cashChange: -cancellationFee
      });

      next.activeContracts = next.activeContracts.filter(c => c.id !== contractId);
      return next;
    });
  };

  const handleEmergencyRepairTruck = (truckId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const truck = next.trucks.find(t => t.id === truckId);
      if (!truck) return prev;

      // Realistic roadside mechanic pricing:
      // 1. Mobile callout & diagnostics dispatch fee ($150)
      const dispatchCalloutFee = 150;
      
      // 2. Realistic on-site roadside labor & parts (targeted fix rather than rebuilding truck)
      const conditionDeficit = Math.max(0, 85 - (truck.conditionPercent ?? 100));
      const partsAndLabor = Math.floor(conditionDeficit * 6); // $6/pt instead of punitive $35/pt

      // 3. Infrastructure & staff mechanic corporate discount (up to 30%)
      const repairBayLvl = next.depot.repairBayLevel || 1;
      const staffDiscount = Math.max(0.70, 1 - (repairBayLvl * 0.08));
      let subtotal = Math.floor((dispatchCalloutFee + partsAndLabor) * staffDiscount);

      // 4. Commercial Roadside Assistance Insurance coverage (75% covered if truck has active insurance)
      let finalCost = subtotal;
      let insuranceCoveredAmount = 0;
      if (truck.hasInsurance) {
        insuranceCoveredAmount = Math.floor(subtotal * 0.75);
        finalCost = Math.max(95, subtotal - insuranceCoveredAmount);
      }

      if (next.cash < finalCost) return prev;

      next.cash -= finalCost;

      // Comprehensive roadside restoration: restore condition, recharge battery, patch tires & air lines
      truck.conditionPercent = Math.max(85, truck.conditionPercent || 85);
      truck.batteryHealthPercent = Math.max(90, truck.batteryHealthPercent || 90);
      truck.brakeWearPercent = Math.max(70, truck.brakeWearPercent || 70);
      truck.tireTreadPercent = Math.max(70, truck.tireTreadPercent || 70);
      truck.suspensionHealthPercent = Math.max(75, truck.suspensionHealthPercent || 75);
      truck.oilLifePercent = Math.max(60, truck.oilLifePercent || 60);
      truck.defLevelLitres = Math.max(40, truck.defLevelLitres || 40);

      // Re-enable vehicle immediately so it resumes transit
      truck.status = truck.assignedContractId ? 'in_transit' : 'idle';
      truck.maintenanceSecondsRemaining = 0;
      truck.scheduledMaintenanceAfterJob = false;

      next.eventLogs.unshift({
        id: `roadside-repair-${Date.now()}`,
        timestamp: Date.now(),
        title: `🚨 Roadside Assistance Dispatched`,
        message: `Mobile service unit serviced ${truck.name} on-location. Restored to 85% road safety and cleared breakdown.${truck.hasInsurance ? ` Commercial insurance covered $${insuranceCoveredAmount.toLocaleString()} of the service.` : ''} Cost: $${finalCost.toLocaleString()}.`,
        type: 'success',
        cashChange: -finalCost
      });

      return next;
    });
  };

  const handleForceRestDriver = (driverId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const driver = next.drivers.find(d => d.id === driverId);
      if (!driver) return prev;

      driver.isResting = true;
      driver.restSecondsRemaining = SIMULATION_CONFIG.driver.rest.forcedRestHours * 3600;
      driver.fatiguePercent = Math.max(0, driver.fatiguePercent - 30);

      if (driver.assignedTruckId) {
        const truck = next.trucks.find(t => t.id === driver.assignedTruckId);
        if (truck) truck.status = 'resting';
      }

      next.eventLogs.unshift({
        id: `force-rest-${Date.now()}`,
        timestamp: Date.now(),
        title: `Mandatory Driver Rest Initiated`,
        message: `${driver.name} pulled into a highway rest stop for a nap break. Fatigue recovering...`,
        type: 'info'
      });

      return next;
    });
  };

  const handleWakeDriver = (driverId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const driver = next.drivers.find(d => d.id === driverId);
      if (!driver) return prev;

      driver.isResting = false;
      driver.restSecondsRemaining = 0;

      if (driver.assignedTruckId) {
        const truck = next.trucks.find(t => t.id === driver.assignedTruckId);
        if (truck && truck.status === 'resting') {
          truck.status = truck.assignedContractId ? 'in_transit' : 'idle';
        }
      }

      next.eventLogs.unshift({
        id: `wake-driver-${Date.now()}`,
        timestamp: Date.now(),
        title: `Driver Resumed Transit`,
        message: `${driver.name} woke up and resumed highway transit (Fatigue: ${Math.floor(driver.fatiguePercent)}%).`,
        type: 'info'
      });

      return next;
    });
  };

  const handleCoffeeBoostDriver = (driverId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const driver = next.drivers.find(d => d.id === driverId);
      if (!driver || next.cash < SIMULATION_CONFIG.driver.morale.coffeeCost) return prev;

      next.cash -= SIMULATION_CONFIG.driver.morale.coffeeCost;
      driver.fatiguePercent = Math.max(0, driver.fatiguePercent - 20);
      driver.moralePercent = Math.min(100, (driver.moralePercent || SIMULATION_CONFIG.driver.morale.fullPercent) + SIMULATION_CONFIG.driver.morale.coffeeMoraleBonus);

      next.eventLogs.unshift({
        id: `coffee-boost-${Date.now()}`,
        timestamp: Date.now(),
        title: `☕ Espresso Boost Delivered`,
        message: `Purchased double espresso for ${driver.name} (-$${SIMULATION_CONFIG.driver.morale.coffeeCost}). Fatigue reduced to ${Math.floor(driver.fatiguePercent)}%!`,
        type: 'success',
        cashChange: -SIMULATION_CONFIG.driver.morale.coffeeCost
      });

      return next;
    });
  };

  const handleRefuelReefer = (trailerId: string) => {
    setGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
      const trailer = next.trailers.find(t => t.id === trailerId);
      if (!trailer || trailer.type !== 'Refrigerated') return prev;

      const currentL = trailer.currentFuelLitres || 0;
      const maxL = trailer.maxFuelLitres || SIMULATION_CONFIG.reefer.defaultFuelCapacityLitres;
      const neededL = maxL - currentL;
      if (neededL <= 0) return prev;

      const fuelCost = Math.floor(neededL * next.currentDieselMarketPrice);
      const serviceFee = SIMULATION_CONFIG.driver.morale.coffeeCost;
      const totalCost = fuelCost + serviceFee;

      if (next.cash < totalCost) return prev;

      next.cash -= totalCost;
      trailer.currentFuelLitres = maxL;
      trailer.currentTempF = trailer.setPointTempF || 34;

      next.eventLogs.unshift({
        id: `reefer-refuel-${Date.now()}`,
        timestamp: Date.now(),
        title: `❄️ Reefer Unit Refueled`,
        message: `Roadside fuel tender pumped ${Math.floor(neededL)}L into cooling unit for ${trailer.name}. Temp reset to ${trailer.currentTempF}°F.`,
        type: 'success',
        cashChange: -totalCost
      });

      return next;
    });
  };

  const handleResetSave = () => {
    localStorage.clear();
    setGameState(getInitialGameState());
    setShowNewGameModal(true);
  };

  const handleImportSave = (newState: GameSaveState) => {
    setGameState(newState);
    saveGameStateToStorage(newState);
  };

  const handleNewGame = () => {
    setShowNewGameModal(true);
  };

  const handleSwitchGame = (saveId: string) => {
    setActiveSaveId(saveId);
    setActiveSaveIdState(saveId);
    const loaded = loadGameplayState(saveId);
    if (loaded) {
      setGameState(loaded);
    }
  };

  const handleDeleteGame = (saveId: string) => {
    deleteGameplay(saveId);
    const slots = getSaveSlots();
    if (slots.length > 0) {
      handleSwitchGame(slots[0].id);
    } else {
      setShowNewGameModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Native App Top Header Bar */}
      <Header 
        state={gameState} 
        onManualSave={handleManualSave} 
        saveStatusText={saveStatusText} 
        onOpenFuelTab={() => setActiveTab('fuel')}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenLiveMap={() => setShowLiveMap(true)}
      />

      {/* Main Mobile App Frame */}
      <main className="max-w-md w-full mx-auto min-h-screen pt-[108px] pb-24 px-3 space-y-4 bg-slate-950 border-x border-slate-800/40 shadow-2xl">
        {activeTab === 'dashboard' && (
          <Dashboard 
            state={gameState} 
            onNavigateTab={(tab) => setActiveTab(tab)} 
            onRecallTruck={handleRecallTruck}
            onEmergencyRepairTruck={handleEmergencyRepairTruck}
            onForceRestDriver={handleForceRestDriver}
            onWakeDriver={handleWakeDriver}
            onCoffeeBoostDriver={handleCoffeeBoostDriver}
            onRefuelReefer={handleRefuelReefer}
            onOpenLiveMap={() => setShowLiveMap(true)}
          />
        )}

        {activeTab === 'fleet' && (
          <FleetManager
            state={gameState}
            onRefuelTruck={handleRefuelTruck}
            onRepairTruck={handleRepairTruck}
            onExpediteRepair={handleExpediteRepair}
            onServiceOil={handleServiceOil}
            onServiceTires={handleServiceTires}
            onServiceBrakes={handleServiceBrakes}
            onServiceBattery={handleServiceBattery}
            onServiceSuspension={handleServiceSuspension}
            onRefillDef={handleRefillDef}
            onInstallPrePass={handleInstallPrePass}
            onFileInsuranceClaim={handleFileInsuranceClaim}
            onApproveService={handleApproveService}
            onAttachTrailer={handleAttachTrailer}
            onSetInsuranceTier={handleSetTruckInsuranceTier}
            onSetTrailerInsuranceTier={handleSetTrailerInsuranceTier}
            onRelocateTruck={handleRelocateTruck}
            onSellTruck={handleSellTruck}
            onSellTrailer={handleSellTrailer}
            onSubmitUpgrades={handleScheduleTruckUpgrades}
            onNavigateTab={(tab, truckId) => {
              if (truckId) setInspectionTruckId(truckId);
              setActiveTab(tab);
            }}
          />
        )}

        {activeTab === 'maintenance' && (
          <TruckInspectionModal
            state={gameState}
            onApproveService={handleApproveService}
            onRefuelTruck={handleRefuelTruck}
            onRepairTruck={handleRepairTruck}
            onFileInsuranceClaim={handleFileInsuranceClaim}
            onInstallPrePass={handleInstallPrePass}
            onSetInsuranceTier={handleSetTruckInsuranceTier}
            initialTruckId={inspectionTruckId}
            onBack={() => setActiveTab('fleet')}
          />
        )}

        {activeTab === 'freight' && (
          <FreightBoard
            state={gameState}
            onDispatchContract={handleDispatchContract}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onNegotiateContract={handleNegotiateContract}
            onDeclineNegotiation={handleDeclineNegotiation}
            onRefreshJobs={() => {
              if (gameState.cash < SIMULATION_CONFIG.contracts.broker.refreshFee) {
                alert("Insufficient funds! Refreshing job board costs $${SIMULATION_CONFIG.contracts.broker.refreshFee}.");
                return;
              }
              setGameState(prev => {
                const next = JSON.parse(JSON.stringify(prev)) as GameSaveState;
                if (next.cash < SIMULATION_CONFIG.contracts.broker.refreshFee) return next;
                next.cash -= SIMULATION_CONFIG.compliance.prePass.installationCost;
                const ownedTrailers = (next.trailers || []).map(t => t.type);
                next.availableContracts = generateBatchContracts(
                  12,
                  next.companyLevel,
                  next.commodityPrices,
                  next.unlockedRegions,
                  ownedTrailers
                );
                if (!next.eventLogs) next.eventLogs = [];
                next.eventLogs.unshift({
                  id: `event-refresh-${Date.now()}`,
                  timestamp: Date.now(),
                  title: 'Job Board Refreshed',
                  message: 'New freight contracts acquired from brokers (-$${SIMULATION_CONFIG.contracts.broker.refreshFee}).',
                  type: 'info',
                  cashChange: -250
                });
                return next;
              });
            }}
          />
        )}

        {activeTab === 'market' && (
          <MarketHub
            state={gameState}
            onBuyTruck={handleBuyTruck}
            onBuyTrailer={handleBuyTrailer}
            onBuyCrypto={handleBuyCrypto}
            onSellCrypto={handleSellCrypto}
          />
        )}

        {activeTab === 'fuel' && (
          <FuelManager 
            state={gameState} 
            onBuyBulkFuel={handleBuyBulkFuel}
            onTopOffFleetFromDepot={handleTopOffFleetFromDepot}
            onToggleAutoRefuel={handleToggleAutoRefuel}
          />
        )}

        {activeTab === 'depot' && (
          <HQDepot
            state={gameState}
            onUpgradeDepotBuilding={handleUpgradeDepotBuilding}
            onUpgradeSkill={handleUpgradeSkill}
            onTakeLoan={handleTakeLoan}
            onRepayLoan={handleRepayLoan}
            onHireStaff={handleHireStaff}
            onFireStaff={handleFireStaff}
            onUpgradeStructure={handleUpgradeStructure}
            onUnlockRegion={handleUnlockRegion}
            onBuyRegionalHub={handleBuyRegionalHub}
            onBuyHeavyHaulPermit={handleBuyHeavyHaulPermit}
            onClaimMilestone={handleClaimMilestone}
            onResetSave={handleResetSave}
            onImportSave={handleImportSave}
            onAcceptInvestor={handleAcceptInvestor}
            onLaunchIPO={handleLaunchIPO}
            onPayDividend={handlePayDividend}
            onHireDriver={handleHireDriver}
            onRestDriver={handleRestDriver}
            onBonusDriver={handleBonusDriver}
            onFireDriver={handleFireDriver}
            onAssignDriverTruck={handleAssignDriverTruck}
            onRaiseDriverPay={handleRaiseDriverPay}
            onToggleAutoDispatch={handleToggleAutoDispatch}
            onNewGame={handleNewGame}
            onSwitchGame={handleSwitchGame}
            onDeleteGame={handleDeleteGame}
          />
        )}

        {activeTab === 'repair' && (
          <RepairBayView
            state={gameState}
            onExpediteRepair={handleExpediteRepair}
          />
        )}

        {activeTab === 'staff' && (
          <StaffManager
            state={gameState}
            onHireStaff={handleHireStaff}
            onFireStaff={handleFireStaff}
          />
        )}

        {activeTab === 'profile' && (
          <CompanyProfileView
            state={gameState}
            onUpgradeStructure={handleUpgradeStructure}
          />
        )}

        {activeTab === 'skills' && (
          <SkillTree
            state={gameState}
            onUpgradeSkill={handleUpgradeSkill}
          />
        )}

        {activeTab === 'settings' && (
          <Settings
            state={gameState}
            onResetSave={handleResetSave}
            onImportSave={handleImportSave}
          />
        )}
      </main>

      {/* Fixed Bottom Mobile Navigation */}
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        availableContractsCount={gameState.availableContracts.length}
        activeDispatchesCount={gameState.activeContracts.length}
        maintenanceCount={gameState.trucks.filter(t => t && t.status === 'maintenance').length}
      />

      {/* Offline Calculation Modal */}
      {offlineSummary && (
        <OfflineModal 
          summary={offlineSummary} 
          onClose={() => setOfflineSummary(null)} 
        />
      )}

      {/* Global Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal 
          state={gameState} 
          onClose={() => setShowLeaderboard(false)} 
        />
      )}

      {/* Live Map Modal */}
      {showLiveMap && (
        <LiveMapModal 
          state={gameState} 
          onClose={() => setShowLiveMap(false)} 
        />
      )}

      {/* New Game Company Creation Modal */}
      {showNewGameModal && (
        <NewGameModal 
          onCreateGame={handleCreateNewGame} 
        />
      )}

      {/* Purchase Approval Modal */}
      {purchaseApprovalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 text-xl font-bold">🛒</div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">Approval Required</span>
                <h3 className="text-base font-black text-white">{purchaseApprovalModal.title}</h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              {purchaseApprovalModal.description}
            </p>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Cost:</span>
              <strong className="text-amber-400 font-mono text-sm">${purchaseApprovalModal.cost.toLocaleString()}</strong>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setPurchaseApprovalModal(null)}
                className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition"
              >
                Cancel
              </button>
              <button
                onClick={purchaseApprovalModal.onConfirm}
                className="py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-2xl transition shadow-lg shadow-amber-500/20 active:scale-95"
              >
                Approve & Buy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Result Modal */}
      {purchaseResultModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-slate-100 text-center">
            <div className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${
              purchaseResultModal.success 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                : 'bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
            }`}>
              {purchaseResultModal.success ? '✓' : '✕'}
            </div>

            <div>
              <h3 className={`text-base font-black ${purchaseResultModal.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                {purchaseResultModal.title}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {purchaseResultModal.message}
              </p>
            </div>

            <button
              onClick={() => setPurchaseResultModal(null)}
              className={`w-full py-3.5 font-extrabold text-xs rounded-2xl transition shadow-lg active:scale-95 ${
                purchaseResultModal.success
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
              }`}
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
