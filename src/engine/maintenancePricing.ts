import type { Truck } from '../types/game';
import { SIMULATION_CONFIG } from '../config/simulation';

export type MaintenanceServiceKey =
  | 'oil'
  | 'tires'
  | 'brakes'
  | 'battery'
  | 'suspension'
  | 'def'
  | 'body';

export interface MaintenanceQuote {
  cost: number;
  timeSecs: number;
}

const clampPercent = (value: number): number =>
  Math.max(0, Math.min(100, value));

export function getMaintenanceQuote(
  truck: Truck,
  key: MaintenanceServiceKey
): MaintenanceQuote {
  const service = SIMULATION_CONFIG.maintenance.service;

  switch (key) {
    case 'oil': {
      const wear = (100 - clampPercent(truck.oilLifePercent ?? 100)) / 100;
      return {
        cost: Math.ceil(service.oil.cost * wear),
        timeSecs: Math.ceil(service.oil.timeSeconds * wear),
      };
    }

    case 'tires': {
      const wear = (100 - clampPercent(truck.tireTreadPercent ?? 100)) / 100;
      return {
        cost: Math.ceil(service.tires.cost * wear),
        timeSecs: Math.ceil(service.tires.timeSeconds * wear),
      };
    }

    case 'brakes': {
      const wear = (100 - clampPercent(truck.brakeWearPercent ?? 100)) / 100;
      return {
        cost: Math.ceil(service.brakes.cost * wear),
        timeSecs: Math.ceil(service.brakes.timeSeconds * wear),
      };
    }

    case 'battery': {
      const wear = (100 - clampPercent(truck.batteryHealthPercent ?? 100)) / 100;
      return {
        cost: Math.ceil(service.battery.cost * wear),
        timeSecs: Math.ceil(service.battery.timeSeconds * wear),
      };
    }

    case 'suspension': {
      const wear =
        (100 - clampPercent(truck.suspensionHealthPercent ?? 100)) / 100;
      return {
        cost: Math.ceil(service.suspension.cost * wear),
        timeSecs: Math.ceil(service.suspension.timeSeconds * wear),
      };
    }

    case 'def': {
      const maxDef = Math.max(0, truck.maxDefLitres ?? 0);
      const currentDef = Math.max(
        0,
        Math.min(maxDef, truck.defLevelLitres ?? 0)
      );
      const missingFraction =
        maxDef > 0 ? (maxDef - currentDef) / maxDef : 0;

      return {
        cost: Math.ceil(service.def.cost * missingFraction),
        timeSecs: Math.ceil(service.def.timeSeconds * missingFraction),
      };
    }

    case 'body': {
      const missingCondition = Math.max(
        0,
        100 - clampPercent(truck.conditionPercent ?? 100)
      );

      return {
        cost: Math.ceil(
          missingCondition * service.body.costPerConditionPoint
        ),
        timeSecs: Math.ceil(
          service.body.timeSeconds * (missingCondition / 100)
        ),
      };
    }
  }
}
