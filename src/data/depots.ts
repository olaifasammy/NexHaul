import type { DepotUpgrade } from '../types/game';

export const INITIAL_DEPOT: DepotUpgrade = {
  repairBayLevel: 1,
  fuelTerminalLevel: 1,
  driverLoungeLevel: 1,
  dispatchAILevel: 0,
  warehouseLevel: 1,
};

export interface DepotUpgradeCost {
  title: string;
  description: string;
  currentLevel: number;
  maxLevel: number;
  nextCost: number;
  icon: string;
}

export function getDepotCosts(depot: DepotUpgrade): Record<keyof DepotUpgrade, DepotUpgradeCost> {
  return {
    repairBayLevel: {
      title: 'HQ Repair Bay',
      description: 'Lowers truck repair costs by 15% per tier and speeds up maintenance.',
      currentLevel: depot.repairBayLevel,
      maxLevel: 5,
      nextCost: depot.repairBayLevel * 5000,
      icon: '🔧'
    },
    fuelTerminalLevel: {
      title: 'Bulk Fuel Terminal',
      description: 'Unlocks discounted fuel prices (10% savings per tier).',
      currentLevel: depot.fuelTerminalLevel,
      maxLevel: 5,
      nextCost: depot.fuelTerminalLevel * 8000,
      icon: '⛽'
    },
    driverLoungeLevel: {
      title: 'Driver Rest Lounge',
      description: 'Increases driver fatigue recovery rate by 20% per tier.',
      currentLevel: depot.driverLoungeLevel,
      maxLevel: 5,
      nextCost: depot.driverLoungeLevel * 6000,
      icon: '🛌'
    },
    dispatchAILevel: {
      title: 'Automated Dispatch Center',
      description: 'Auto-assigns idle trucks to top available freight contracts.',
      currentLevel: depot.dispatchAILevel,
      maxLevel: 3,
      nextCost: (depot.dispatchAILevel + 1) * 15000,
      icon: '🤖'
    },
    warehouseLevel: {
      title: 'Logistics Warehouse',
      description: 'Increases available freight board offer listings.',
      currentLevel: depot.warehouseLevel,
      maxLevel: 5,
      nextCost: depot.warehouseLevel * 4000,
      icon: '🏬'
    }
  };
}
