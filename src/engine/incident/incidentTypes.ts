import type { Truck, Driver, WeatherType, RoadEventLog } from '../../types/game';

export type AccidentSeverity = 'small' | 'medium' | 'fatal';

export interface VehiclePerformanceResult {
  speedMultiplier: number;
  fuelEfficiencyMultiplier: number;
  isDeRated: boolean;
  isBrakeFailed: boolean;
  isStranded: boolean;
}

export interface IncidentEvaluationResult {
  events: RoadEventLog[];
  updatedTruck: Truck;
  updatedDriver: Driver;
  cashPenalty: number;
  contractFailed: boolean;
}
