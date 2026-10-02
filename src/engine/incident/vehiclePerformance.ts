import type { Truck } from '../../types/game';
import type { VehiclePerformanceResult } from './incidentTypes';

export function calculateVehiclePerformance(truck: Truck): VehiclePerformanceResult {
  let speedMultiplier = 1.0;
  let fuelEfficiencyMultiplier = 1.0;
  let isDeRated = false;
  let isBrakeFailed = false;
  let isStranded = false;

  const condition = truck.conditionPercent ?? 100;
  const tireTread = truck.tireTreadPercent ?? 100;
  const brakes = truck.brakeWearPercent ?? 100;
  const suspension = truck.suspensionHealthPercent ?? 100;
  const battery = truck.batteryHealthPercent ?? 100;
  const def = truck.defLevelLitres ?? 90;
  const fuel = truck.currentFuelLitres ?? 100;

  // 1. Condition penalties
  if (condition < 20) {
    speedMultiplier *= 0.45;
    fuelEfficiencyMultiplier *= 0.60;
  } else if (condition < 50) {
    speedMultiplier *= 0.80;
  }

  // 2. Brake Failure & Wear
  if (brakes < 5) {
    isBrakeFailed = true;
    speedMultiplier *= 0.20; // Emergency crawl
  } else if (brakes < 25) {
    speedMultiplier *= 0.85; // Cautious slowing
  }

  // 3. Tire Tread penalties (hydroplaning risk / traction)
  if (tireTread < 15) {
    speedMultiplier *= 0.75;
  }

  // 4. Suspension health
  if (suspension < 15) {
    speedMultiplier *= 0.70;
  }

  // 5. Battery / Electrical
  if (battery < 10) {
    isStranded = true;
  }

  // 6. DEF Emissions De-Rate (75% power cut)
  if (def <= 0) {
    isDeRated = true;
    speedMultiplier *= 0.25;
  }

  // 7. Fuel starvation
  if (fuel < 5) {
    speedMultiplier *= 0.30;
  }

  return {
    speedMultiplier,
    fuelEfficiencyMultiplier,
    isDeRated,
    isBrakeFailed,
    isStranded
  };
}
