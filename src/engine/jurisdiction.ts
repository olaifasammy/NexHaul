import type { TruckClass, TruckRegion, CargoCategory, TrailerType, Truck, Contract, Driver, Trailer, RegionalHubInfo } from '../types/game';
import { SIMULATION_CONFIG } from '../config/simulation';

export interface ClassLimitSpec {
  maxPayloadTons: number;
  label: string;
  description: string;
  allowedCargoTypes: CargoCategory[];
  topSpeedGovernorMph: number;
}

export const TRUCK_CLASS_LIMITS: Record<TruckClass, ClassLimitSpec> = {
  'Class 3 Light': {
    maxPayloadTons: 10,
    label: 'Light Metro Box Truck (Max 10T)',
    description: 'City delivery box truck. Restricted to general freight and perishable metro deliveries up to 10 tons.',
    allowedCargoTypes: ['General Freight', 'Perishable Foods'],
    topSpeedGovernorMph: 85
  },
  'Class 6 Medium': {
    maxPayloadTons: 20,
    label: 'Medium Regional Straight Truck (Max 20T)',
    description: 'Regional distribution truck. Suitable for regional freight and tech electronics up to 20 tons.',
    allowedCargoTypes: ['General Freight', 'Perishable Foods', 'High Value Tech'],
    topSpeedGovernorMph: 82
  },
  'Class 8 Highway': {
    maxPayloadTons: 38,
    label: 'Class 8 Interstate Highway Tractor (Max 38T)',
    description: 'Standard long-haul highway tractor. Permitted for interstate dry van, reefer, and tankers up to 38 tons.',
    allowedCargoTypes: ['General Freight', 'Perishable Foods', 'High Value Tech', 'Hazardous Chemicals'],
    topSpeedGovernorMph: 80
  },
  'Class 8 Heavy': {
    maxPayloadTons: 55,
    label: 'Class 8 Heavy Duty Hauler (Max 55T)',
    description: 'High-torque heavy duty tractor. Permitted for heavy machinery, lowboys, and HazMat up to 55 tons.',
    allowedCargoTypes: ['General Freight', 'Perishable Foods', 'High Value Tech', 'Hazardous Chemicals', 'Heavy Machinery'],
    topSpeedGovernorMph: 78
  },
  'Super Hauler': {
    maxPayloadTons: 100,
    label: 'Super Hauler Flagship (Max 100T)',
    description: 'Ultra-heavy haul flagship cabover/long-hood. Approved for B-Trains, multi-axle superloads, and oversized cargo up to 100 tons.',
    allowedCargoTypes: ['General Freight', 'Perishable Foods', 'High Value Tech', 'Hazardous Chemicals', 'Heavy Machinery'],
    topSpeedGovernorMph: 88
  }
};

export interface RegionalJurisdictionSpec {
  speedLimitMph: number;
  speedLimitKmh: number;
  speedUnitLabel: string;
  tollRatePer80Mi: number;
  cabRequirement: string;
  maxGrossWeightTons: number;
}

export const REGIONAL_JURISDICTIONS: Record<TruckRegion, RegionalJurisdictionSpec> = {
  'America': {
    speedLimitMph: 75,
    speedLimitKmh: 120,
    speedUnitLabel: 'MPH',
    tollRatePer80Mi: 15,
    cabRequirement: 'Conventional Long Hood & Day Cabs permitted',
    maxGrossWeightTons: 40 // 80,000 lbs federal bridge formula limit
  },
  'Europe': {
    speedLimitMph: 56, // EU mandatory 90 km/h speed limiter
    speedLimitKmh: 90,
    speedUnitLabel: 'km/h',
    tollRatePer80Mi: 25,
    cabRequirement: 'Cabover (COE) required for European overall length regulations',
    maxGrossWeightTons: 44 // 44 Tonnes EU limit
  },
  'Asia': {
    speedLimitMph: 50, // 80 km/h speed limit
    speedLimitKmh: 80,
    speedUnitLabel: 'km/h',
    tollRatePer80Mi: 20,
    cabRequirement: 'Compact COE & high-density axle configurations',
    maxGrossWeightTons: 50
  },
  'Africa': {
    speedLimitMph: 65,
    speedLimitKmh: 105,
    speedUnitLabel: 'km/h',
    tollRatePer80Mi: 18,
    cabRequirement: 'Heavy-duty rugged conventional & robust suspension',
    maxGrossWeightTons: 48
  },
  'Electric EV': {
    speedLimitMph: 70,
    speedLimitKmh: 112,
    speedUnitLabel: 'MPH',
    tollRatePer80Mi: 10, // Green zero-emission toll incentive
    cabRequirement: 'Zero-emission aerodynamic cabover suite',
    maxGrossWeightTons: 42 // Battery pack tare weight credit
  }
};

export interface DispatchValidationResult {
  isValid: boolean;
  warnings: string[];
  blockers: string[];
}

export function validateDispatchJurisdictionAndLimits(
  truck: Truck,
  contract: Contract,
  driver: Driver,
  trailer?: Trailer,
  unlockedRegions: TruckRegion[] = ['America'],
  heavyHaulPermits: TruckRegion[] = [],
  companyLevel: number = 1,
  regionalHubs: Record<TruckRegion, RegionalHubInfo> = {}
): DispatchValidationResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  // 1. Regional Hub & Operating Permit Check (Realism: Must own physical terminal in region to operate trucks there!)
  const hub = regionalHubs[contract.region];
  if (!hub || !hub.isUnlocked) {
    blockers.push(`Regional Logistics Hub Required: You must purchase a regional terminal/hub in ${contract.region} (${hub?.cityName || 'Continental Terminal'}) before operating or dispatching trucks there.`);
  }

  // Truck Stationed Hub Match Check (Realism: Truck must be stationed at the hub in the contract's region)
  if (truck.stationedHub && truck.stationedHub !== contract.region && truck.stationedHub !== 'Electric EV') {
    blockers.push(`Stationed Hub Mismatch: ${truck.name} is stationed at ${truck.stationedHub} Terminal and cannot operate in ${contract.region}. Relocate/ship the truck to ${contract.region} first.`);
  }

  const unlocked = unlockedRegions || ['America'];
  if (!unlocked.includes(contract.region)) {
    blockers.push(`Region Permit Required: Operating rights for ${contract.region} jurisdiction not acquired in HQ Depot.`);
  }

  if (truck.region !== contract.region && truck.region !== 'Electric EV') {
    warnings.push(`Cross-Jurisdiction Haul: ${truck.name} is registered in ${truck.region}, operating in ${contract.region}. Tolls & inspections +20%.`);
  }

  // 2 & 3. Equipment, Trailer, Weight & Engine Power Capacity Compatibility
  const classSpec = TRUCK_CLASS_LIMITS[truck.modelClass] || TRUCK_CLASS_LIMITS['Class 8 Highway'];

  if (truck.modelClass === 'Class 3 Light') {
    if (contract.requiredTrailerType !== 'Dry Van' || contract.weightTons > 10) {
      blockers.push(`No Compatible Vehicle: Light Box Truck cannot haul ${contract.requiredTrailerType} or loads over 10T.`);
    }
  } else {
    if (!trailer) {
      blockers.push(`No Compatible Vehicle / Missing Trailer: ${truck.name} requires an attached trailer to accept freight tenders.`);
    } else {
      if (trailer.type !== contract.requiredTrailerType) {
        blockers.push(`No Compatible Vehicle / Trailer Type Mismatch: Tender requires ${contract.requiredTrailerType}, but attached trailer is ${trailer.type}.`);
      }
    }
  }

  const rigMaxPayload = calculateRigMaxPayloadTons(truck, trailer);
  if (contract.weightTons > rigMaxPayload) {
    const hpMultiplier = 1 + ((truck.upgrades?.engineStage || 0) * SIMULATION_CONFIG.physics.engineStageHpMultiplier);
    const effectiveHp = Math.round(truck.horsepower * hpMultiplier);
    const baseTorque = truck.engineSpecs?.torqueLbFt || (truck.horsepower * 3);
    const effectiveTorque = Math.round(baseTorque * (1 + ((truck.upgrades?.engineStage || 0) * 0.1)));
    const powerCap = Math.round((effectiveHp * 0.085 + effectiveTorque * 0.012) * 10) / 10;

    if (contract.weightTons > powerCap) {
      blockers.push(`Insufficient Engine Power (GCWR Limit): ${effectiveHp} HP / ${effectiveTorque} lb-ft engine capacity of ${truck.name} cannot haul ${contract.weightTons}T (Engine Max Payload Limit: ${powerCap}T. Engine upgrade required).`);
    } else if (trailer && contract.weightTons > trailer.capacityTons) {
      blockers.push(`Overweight for Trailer: ${contract.weightTons}T load exceeds ${trailer.name}'s capacity (${trailer.capacityTons}T limit).`);
    } else {
      blockers.push(`Overweight Payload: ${contract.weightTons}T load exceeds ${truck.name}'s ${truck.modelClass} rating (${classSpec.maxPayloadTons}T limit).`);
    }
  }

  // 4. HazMat CDL Endorsement & Trailer Safety
  if (trailer) {
    const regionalSpec = REGIONAL_JURISDICTIONS[contract.region];

    const truckWeight = truck.curbWeightTons ?? SIMULATION_CONFIG.vehicleDefaults.referenceEmptyWeightTons;
    const trailerWeight = trailer.tareWeightTons ?? 0;
    const grossWeight = truckWeight + trailerWeight + contract.weightTons;

    const normalGrossLimit = regionalSpec.maxGrossWeightTons;

    if (grossWeight > normalGrossLimit) {
      const hasHeavyHaulPermit = heavyHaulPermits.includes(contract.region);

      if (!hasHeavyHaulPermit) {
        blockers.push(
          `Overweight Gross Weight: ${grossWeight.toFixed(1)}T gross exceeds the ${contract.region} legal limit of ${normalGrossLimit}T. Heavy-Haul Permit Required.`
        );
      } else {
        const permitLevel =
          SIMULATION_CONFIG.compliance.heavyHaul.minimumCompanyLevel[contract.region];

        const permitLimit =
          SIMULATION_CONFIG.compliance.heavyHaul.maximumPermittedGrossWeightTons[contract.region];

        if (companyLevel < permitLevel) {
          blockers.push(
            `Heavy-Haul Permit Invalid: ${contract.region} operations require company level ${permitLevel}.`
          );
        }

        if (grossWeight > permitLimit) {
          blockers.push(
            `Overweight Gross Weight: ${grossWeight.toFixed(1)}T gross exceeds the ${contract.region} Heavy-Haul Permit limit of ${permitLimit}T.`
          );
        }

        const cdl = driver.cdlClass || '';

        if (
          SIMULATION_CONFIG.compliance.heavyHaul.requiresOversizedHeavyCdl &&
          !cdl.includes('Oversized Heavy')
        ) {
          blockers.push(
            `CDL Violation: Driver ${driver.name} requires a Class A + Oversized Heavy CDL for permitted heavy-haul operations.`
          );
        }
      }
    }
  }

  if (contract.cargoCategory === 'Hazardous Chemicals') {
    const cdl = driver.cdlClass || "";
    const traits = driver.traits || [];
    const driverHasHazmat = cdl.includes('HazMat') || traits.includes('HazMat Specialist');
    if (!driverHasHazmat) {
      blockers.push(`CDL Violation: Driver ${driver.name} lacks required HazMat Class A CDL endorsement.`);
    }
    if (trailer && !trailer.hazmatCertified && trailer.type !== 'HazMat Container' && trailer.type !== 'Fuel Tanker') {
      blockers.push(`HazMat Certification Missing: Trailer ${trailer.name} is not HazMat certified.`);
    }
  }

  return {
    isValid: blockers.length === 0,
    warnings,
    blockers
  };
}

/**
 * Calculates the true maximum payload capacity (tons) of a truck and trailer rig
 * factoring in Truck Class limits, Trailer structural capacity, and Engine Power / Torque (GCWR).
 */
export function calculateRigMaxPayloadTons(truck: Truck, trailer?: Trailer): number {
  const classSpec = TRUCK_CLASS_LIMITS[truck.modelClass] || TRUCK_CLASS_LIMITS['Class 8 Highway'];
  const classLimit = classSpec.maxPayloadTons;

  const trailerLimit = trailer ? trailer.capacityTons : (truck.modelClass === 'Class 3 Light' ? 10 : 0);

  // Engine power and torque contribution
  const hpMultiplier = 1 + ((truck.upgrades?.engineStage || 0) * SIMULATION_CONFIG.physics.engineStageHpMultiplier);
  const effectiveHp = truck.horsepower * hpMultiplier;
  const baseTorque = truck.engineSpecs?.torqueLbFt || (truck.horsepower * 3);
  const effectiveTorque = baseTorque * (1 + ((truck.upgrades?.engineStage || 0) * 0.1));

  // Power-based payload capacity formula (tons) combining HP and Torque
  const powerCapacityTons = Math.round((effectiveHp * 0.085 + effectiveTorque * 0.012) * 10) / 10;

  return Math.min(classLimit, trailerLimit, powerCapacityTons);
}
