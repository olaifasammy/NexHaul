import type { GameSaveState, OfflineProgressSummary, RoadEventLog, WeatherType, Truck, Contract, Driver, Trailer, BankLoan, FinancialStatementRecord } from '../types/game';
import { generateRandomContract } from '../data/contracts';
import { calculateVehiclePerformance } from './incident/vehiclePerformance';
import { evaluateRoadsideIncidents } from './incident/incidentEngine';
import { validateDispatchJurisdictionAndLimits, REGIONAL_JURISDICTIONS } from './jurisdiction';

import { SIMULATION_CONFIG } from '../config/simulation';
import { getCompanyXpRequirement } from './companyProgression';
const WEATHERS: WeatherType[] = ['Clear Skies', 'Heavy Rain', 'Blizzard Warning', 'Dense Fog'];

/**
 * Returns a random weather duration between 2-8 hours (in seconds)
 * Weather systems typically last several hours
 */
function getWeatherDuration(): number {
  // Random duration between 2 and 8 hours, converted to seconds
  const hours = SIMULATION_CONFIG.weather.durationMinHours + Math.random() * (SIMULATION_CONFIG.weather.durationMaxHours - SIMULATION_CONFIG.weather.durationMinHours); // 2-8 hours
  return hours * SIMULATION_CONFIG.time.secondsPerHour;
}

/**
 * Determines if weather should change based on time elapsed and probability
 */
function shouldChangeWeather(state: GameSaveState, deltaSeconds: number): boolean {
  // If weather has exceeded its duration, it's time to change
  if (state.weatherTimer >= (state.weatherDuration ?? 0)) {
    return true;
  }
  
  // Otherwise, small random chance for unexpected weather shifts
  // Much lower probability than before to avoid frequent changes
  const baseProbabilityPerSecond = SIMULATION_CONFIG.weather.changeChancePerSecond; // Very low base probability
  return Math.random() < (baseProbabilityPerSecond * deltaSeconds);
}

/**
 * Generates appropriate weather based on time of day (gameHour: 0-24)
 * This creates realistic daily weather patterns
 */
function generateWeatherForTimeOfDay(gameHour: number): WeatherType {
  // Normalize hour to 0-24 range
  const hour = ((gameHour % 24) + 24) % 24;
  
  // Define weather probabilities by time of day
  // Morning (6 AM - 12 PM): Generally clearer
  // Afternoon (12 PM - 6 PM): More variable, chance of storms
  // Evening/Night (6 PM - 6 AM): Clearing tends to occur
  
  if (hour >= 6 && hour < 12) {
    // Morning: 70% clear, 20% light rain, 10% fog
    const rand = Math.random();
    if (rand < SIMULATION_CONFIG.weather.morningClearChance) return 'Clear Skies';
    else if (rand < SIMULATION_CONFIG.weather.morningRainChance) return 'Heavy Rain';
    else return 'Dense Fog';
  } else if (hour >= 12 && hour < 18) {
    // Afternoon: 40% clear, 30% rain, 20% fog, 10% blizzard (if applicable)
    const rand = Math.random();
    if (rand < SIMULATION_CONFIG.weather.afternoonClearChance) return 'Clear Skies';
    else if (rand < SIMULATION_CONFIG.weather.afternoonRainChance) return 'Heavy Rain';
    else if (rand < SIMULATION_CONFIG.weather.afternoonFogChance) return 'Dense Fog';
    else return 'Blizzard Warning';
  } else {
    // Evening/Night (6 PM - 6 AM): 60% clear, 25% rain, 10% fog, 5% blizzard
    const rand = Math.random();
    if (rand < SIMULATION_CONFIG.weather.nightClearChance) return 'Clear Skies';
    else if (rand < SIMULATION_CONFIG.weather.nightRainChance) return 'Heavy Rain';
    else if (rand < SIMULATION_CONFIG.weather.nightFogChance) return 'Dense Fog';
    else return 'Blizzard Warning';
  }
}

export type DrivingMotionState = 'Accelerating' | 'Cruising' | 'Decelerating' | 'Slow Crawl' | 'Stationary';

export interface TruckPhysicsResult {
  speedMph: number;
  currentMpg: number;
  motionState: DrivingMotionState;
  cruisingSpeedMph: number;
}

/**
 * Calculates realistic physics for a truck including speed and fuel efficiency.
 * Factors in: Truck HP, Curb Weight, Trailer Weight, Cargo Weight, Driver Skills, 
 * Weather, Tire Condition, Aero Drag, and dynamic driving motion states (accelerating,
 * cruising, decelerating, slow crawl, and stationary toll/depot stops).
 */
export function calculateTruckPhysics(
  truck: Truck,
  contract: Contract | null,
  driver: Driver | null,
  weather: WeatherType,
  skills: Record<string, number> = {},
  allTrailers: Trailer[] = [],
  dispatcherStaffBonus: number = 0
): TruckPhysicsResult {
  // 1. Authoritative weights and mass distribution
  const truckWeight = truck.curbWeightTons ?? SIMULATION_CONFIG.vehicleDefaults.referenceEmptyWeightTons;
  const activeTrailer = allTrailers.find(t => t.id === truck.assignedTrailerId);
  const trailerWeight = activeTrailer?.tareWeightTons ?? (truck.modelClass === 'Class 3 Light' ? 0 : 7.0);

  // LOAD WEIGHT: Cargo weight directly defines gross vehicle inertia, acceleration, and grade resistance
  const cargoWeight = contract?.weightTons || 0;
  const totalGrossWeight = truckWeight + trailerWeight + cargoWeight;

  // 2. Powerplant Dynamics: Horsepower, Torque & Condition degradation
  // Mechanical condition degrades peak engine output smoothly
  const conditionFactor = Math.pow(Math.max(0.25, (truck.conditionPercent ?? 100) / 100), 0.35);

  const hpMultiplier = 1 + ((truck.upgrades?.engineStage || 0) * SIMULATION_CONFIG.physics.engineStageHpMultiplier);
  const totalHP = truck.horsepower * hpMultiplier * conditionFactor;

  // Power-to-Weight Ratio (Effective HP per Ton of total gross weight)
  const hpPerTon = totalHP / Math.max(4.0, totalGrossWeight);

  // 3. Continuous Aerodynamic & Mass Cruising Speed Equilibrium
  // Light loads (25+ HP/ton) glide near 72-75 MPH; heavy loads (8-14 HP/ton) cruise at 56-64 MPH.
  let cruisingSpeed = 38 + 36 * (1 - Math.exp(-0.09 * hpPerTon));

  // Direct cargo weight inertia penalty: each ton of heavy freight adds mass drag
  if (cargoWeight > 12) {
    const heavyCargoDrag = Math.min(10, (cargoWeight - 12) * 0.28);
    cruisingSpeed -= heavyCargoDrag;
  }

  // 4. Driver Skill & Trait Behaviors
  const traits = driver?.traits || [];
  const driverSkill = driver?.skillLevel || 1;

  // Experienced drivers manage gear shifting and momentum efficiently (+0.5 MPH per skill level)
  cruisingSpeed += driverSkill * 0.5;

  if (traits.includes('Speed Demon')) {
    cruisingSpeed += 6.0; // Aggressive driver runs fast
  }
  if (traits.includes('Eco-Driver')) {
    // Disciplined driver caps cruising at the optimal 58-62 MPH fuel-conservation sweet spot
    cruisingSpeed = Math.min(cruisingSpeed, 60.5);
  }
  if (traits.includes('Night Owl') && weather === 'Clear Skies') {
    cruisingSpeed += 3.5;
  }

  // GPS routing optimization bonuses
  cruisingSpeed += ((truck.upgrades?.gpsStage || 0) * SIMULATION_CONFIG.physics.gpsSpeedBonusPerStage);

  // Corporate dispatcher route clearance bonus
  if (dispatcherStaffBonus > 0) {
    cruisingSpeed += (dispatcherStaffBonus * SIMULATION_CONFIG.physics.dispatcherSpeedBonusPerPoint);
  }

  // Driver Fatigue Degradation
  const fatigue = driver?.fatiguePercent || 0;
  if (fatigue > 55) {
    const fatigueLoss = ((fatigue - 55) / 45) * 0.22; // up to -22% speed loss when exhausted
    cruisingSpeed *= (1 - fatigueLoss);
  }

  // 5. Vehicle Component Health (Tires, Brakes, Suspension)
  const tireTread = truck.tireTreadPercent ?? SIMULATION_CONFIG.vehicleDefaults.startingTireTreadPercent;
  if (tireTread < 60) {
    const tireDrag = ((60 - tireTread) / 60) * 0.12; // Rolling drag on worn tires
    cruisingSpeed *= (1 - tireDrag);
  }

  const brakeWear = truck.brakeWearPercent ?? 100;
  if (brakeWear < 35) {
    const brakeCaution = ((35 - brakeWear) / 35) * 0.10; // Cautious pacing for stopping distance
    cruisingSpeed *= (1 - brakeCaution);
  }

  const suspensionHealth = truck.suspensionHealthPercent ?? 100;
  if (suspensionHealth < 35) {
    const suspensionVibe = ((35 - suspensionHealth) / 35) * 0.08; // Cab oscillation limit
    cruisingSpeed *= (1 - suspensionVibe);
  }

  // 6. Weather & Environmental Friction
  if (weather === 'Heavy Rain') {
    const wetTireTraction = tireTread < 40 ? 0.80 : 0.88;
    cruisingSpeed *= wetTireTraction;
  } else if (weather === 'Dense Fog') {
    const fogVisibilityCap = 42 + ((truck.upgrades?.gpsStage || 0) * 3);
    cruisingSpeed = Math.min(cruisingSpeed * 0.72, fogVisibilityCap);
  } else if (weather === 'Blizzard Warning') {
    cruisingSpeed = Math.min(cruisingSpeed * 0.52, 36);
  }

  // Low fuel starvation warning speed cut
  if (truck.currentFuelLitres < SIMULATION_CONFIG.physics.lowFuelThresholdLitres) {
    cruisingSpeed *= SIMULATION_CONFIG.physics.lowFuelSpeedMultiplier;
  }

  // 7. Regional Speed Limiters & Highway Governors
  const regionSpec = contract?.region ? REGIONAL_JURISDICTIONS[contract.region] : REGIONAL_JURISDICTIONS['America'];
  const regionalLimit = regionSpec ? regionSpec.speedLimitMph : 75;

  const truckGovernor = truck.topSpeedMph || SIMULATION_CONFIG.physics.defaultTopSpeedMph;
  const legalSpeedCap = Math.min(truckGovernor, regionalLimit) + ((truck.upgrades?.gpsStage || 0) * 2);

  cruisingSpeed = Math.min(cruisingSpeed, legalSpeedCap);
  cruisingSpeed = Math.max(15, cruisingSpeed);

  // 8. Unique Route Elevation Waves & Terrain Gradients
  // Every contract has its own unique route terrain profile based on its origin, destination, and ID
  const routeHash = contract 
    ? (contract.id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 23) + 7
    : 13;
  const progress = contract?.progressMiles || 0;
  const terrainGrade = Math.sin((progress + routeHash) * 0.16) * 0.045; // -4.5% downhill to +4.5% uphill

  let speedMph = cruisingSpeed;

  if (terrainGrade > 0) {
    // Climbing uphill: heavily penalized by cargo mass and low HP/ton!
    const gradeMassPenalty = (cargoWeight / 18) * (terrainGrade / 0.045) * 12 * Math.max(0.6, 16 / Math.max(6, hpPerTon));
    const veteranMitigation = traits.includes('Veteran Hauler') ? 2.5 : 0;
    speedMph -= Math.max(0, gradeMassPenalty - veteranMitigation);
  } else if (terrainGrade < 0) {
    // Downhill momentum
    speedMph += Math.abs(terrainGrade / 0.045) * 3.0;
  }

  speedMph = Math.min(speedMph, legalSpeedCap + 2);
  speedMph = Math.max(14, speedMph);

  const finalCruisingSpeed = +speedMph.toFixed(1);

  // 9. Fuel Efficiency (MPG) Logic
  let currentMpg = truck.fuelEfficiencyMpg;

  // Weight penalty: Cargo weight + rig weight directly affects fuel burn!
  const referenceWeight = SIMULATION_CONFIG.physics.mpgReferenceWeightTons;
  const weightRatio = referenceWeight / Math.max(referenceWeight, totalGrossWeight);
  const weightFactor = Math.max(
    SIMULATION_CONFIG.physics.minimumMpgWeightFactor,
    Math.pow(weightRatio, SIMULATION_CONFIG.physics.mpgWeightExponent)
  );
  currentMpg *= weightFactor;

  // Aerodynamics & Trailers
  let aeroMultiplier = 1 + ((truck.upgrades?.aeroStage || 0) * SIMULATION_CONFIG.physics.aeroEfficiencyBonusPerStage);
  if (activeTrailer?.type === 'Flatbed') aeroMultiplier *= SIMULATION_CONFIG.physics.flatbedAeroMultiplier;
  if (activeTrailer?.type === 'Lowboy Heavy') aeroMultiplier *= SIMULATION_CONFIG.physics.lowboyAeroMultiplier;
  currentMpg *= aeroMultiplier;

  // Tire rolling resistance
  if (tireTread < SIMULATION_CONFIG.physics.tireMpgThreshold) {
    const tireEfficiency = 1 - ((SIMULATION_CONFIG.physics.tireMpgThreshold - tireTread) * SIMULATION_CONFIG.physics.tireMpgPenaltyPerPercent);
    currentMpg *= Math.max(SIMULATION_CONFIG.physics.minimumTireMpgMultiplier, tireEfficiency);
  }

  // Engine mechanical wear
  if (truck.conditionPercent < SIMULATION_CONFIG.physics.conditionMpgThreshold) {
    const conditionEfficiency = 1 - ((SIMULATION_CONFIG.physics.conditionMpgThreshold - truck.conditionPercent) * SIMULATION_CONFIG.physics.conditionMpgPenaltyPerPercent);
    currentMpg *= Math.max(SIMULATION_CONFIG.physics.minimumConditionMpgMultiplier, conditionEfficiency);
  }

  // Weather resistance
  if (weather === 'Heavy Rain') currentMpg *= SIMULATION_CONFIG.physics.rainMpgMultiplier;
  else if (weather === 'Dense Fog') currentMpg *= SIMULATION_CONFIG.physics.fogMpgMultiplier;
  else if (weather === 'Blizzard Warning') currentMpg *= SIMULATION_CONFIG.physics.blizzardMpgMultiplier;

  // Eco-Driver trait and skill
  if (traits.includes('Eco-Driver')) currentMpg *= SIMULATION_CONFIG.physics.ecoTraitMpgMultiplier;
  const ecoSkillLevel = skills['eco-mastery'] || 0;
  currentMpg *= (1 + ecoSkillLevel * SIMULATION_CONFIG.physics.ecoSkillMpgBonusPerLevel);
  currentMpg *= (1 + driverSkill * SIMULATION_CONFIG.physics.driverSkillMpgBonusPerLevel);

  // Speed-based drag penalty above 60 MPH
  if (speedMph > 60) {
    const dragPenalty = 1 - (Math.pow(speedMph - 60, 1.4) * 0.012);
    currentMpg *= Math.max(0.65, dragPenalty);
  }

  // 10. Dynamic Driving Motion States (Accelerating, Cruising, Decelerating, Slow Crawl, Stationary)
  let motionState: DrivingMotionState = 'Cruising';

  if (truck.status === 'resting' || driver?.isResting || truck.status === 'fueling' || truck.status === 'maintenance') {
    motionState = 'Stationary';
    speedMph = 0;
  } else if (contract && contract.status === 'in_progress') {
    const distance = contract.distanceMiles || 100;
    const remaining = Math.max(0, distance - progress);

    if (progress <= 3.5) {
      // Departure acceleration from origin hub
      motionState = 'Accelerating';
      // Heavy cargo accelerates much slower than light box trucks!
      const loadInertiaFactor = Math.max(0.45, 1 - (cargoWeight / 70));
      const ramp = Math.max(0.12, (progress / 3.5) * loadInertiaFactor);
      speedMph = Math.max(14, Math.min(finalCruisingSpeed, 16 + ramp * (finalCruisingSpeed - 16)));
    } else if (remaining <= 3.5) {
      // Arrival deceleration into destination depot
      motionState = 'Decelerating';
      const decel = Math.max(0.1, remaining / 3.5);
      speedMph = Math.max(12, Math.min(finalCruisingSpeed, 14 + decel * (finalCruisingSpeed - 14)));
    } else {
      // Highway transit dynamics: tolls, weigh stations, terrain
      const highwayCycle = (progress + routeHash) % 40;
      if (highwayCycle >= 38.6 && highwayCycle <= 39.4) {
        // Toll plaza / weigh scale crawling lane (8-14 MPH)
        motionState = 'Slow Crawl';
        speedMph = Math.max(8, Math.min(14, finalCruisingSpeed * 0.20));
      } else if (highwayCycle > 39.4) {
        // Accelerating out of toll plaza back onto open highway
        motionState = 'Accelerating';
        const resumeRamp = (highwayCycle - 39.4) / 0.6;
        speedMph = Math.max(18, Math.min(finalCruisingSpeed, 18 + resumeRamp * (finalCruisingSpeed - 18)));
      } else if (highwayCycle >= 37.2 && highwayCycle < 38.6) {
        // Decelerating approaching toll / scale
        motionState = 'Decelerating';
        speedMph = Math.max(16, finalCruisingSpeed * 0.45);
      } else if (weather === 'Dense Fog' || weather === 'Blizzard Warning' || hpPerTon < 8.5 || terrainGrade > 0.035 || truck.conditionPercent < 25) {
        motionState = 'Slow Crawl';
        speedMph = Math.min(speedMph, 34);
      } else {
        motionState = 'Cruising';
      }
    }
  }

  return { 
    speedMph: +speedMph.toFixed(1), 
    currentMpg: +currentMpg.toFixed(2),
    motionState,
    cruisingSpeedMph: finalCruisingSpeed
  };
}

/**
 * Shortens driver name, vehicle name, and vehicle id into a compact, professional identifier:
 * e.g. "M. Vance • Peterbilt 579 (#starter-1)"
 */
export function formatShortDriverTruckIdentifier(
  driverName?: string | null,
  truckName?: string | null,
  truckId?: string | null
): string {
  let shortDriver = 'No Driver';
  if (driverName) {
    if (driverName.includes('Fleet Owner') || driverName.includes('You')) {
      shortDriver = 'You (Owner)';
    } else {
      const parts = driverName.trim().split(/\s+/);
      if (parts.length >= 2) {
        shortDriver = `${parts[0][0]}. ${parts[parts.length - 1]}`;
      } else {
        shortDriver = driverName;
      }
    }
  }

  let shortTruck = 'Rig';
  if (truckName) {
    shortTruck = truckName
      .replace(/"[^"]*"/g, '')
      .replace(/\s*(UltraLoft|Studio Sleeper|GigaSpace|Individual Lion S|Globetrotter XXL|Globetrotter|Megawatt EV|ProCabin|Heavy Hauler|Heavy Tractor 540|CXZ|Utility Box Truck|Box Truck|Utility)/gi, '')
      .trim();
  }

  let shortId = '';
  if (truckId) {
    shortId = truckId.replace(/^truck-/, '#');
    if (/^#\d{10,}$/.test(shortId)) {
      shortId = `#T-${shortId.slice(-4)}`;
    }
  }

  return `${shortDriver} • ${shortTruck} (${shortId})`;
}

export function calculateTruckSpeed(
  truck: Truck,
  contract: Contract | null,
  driver: Driver | null,
  weather: WeatherType,
  allTrailers: Trailer[] = []
): number {
  return calculateTruckPhysics(truck, contract, driver, weather, {}, allTrailers).speedMph;
}

export function processSimulationTick(state: GameSaveState, deltaSeconds: number, shouldClone: boolean = true): { nextState: GameSaveState; events: RoadEventLog[] } {
  const newEvents: RoadEventLog[] = [];
  const nextState: GameSaveState = shouldClone ? JSON.parse(JSON.stringify(state)) : state;

  // Ensure all collections and skills are initialized for safe state migration
  if (!nextState.skills) nextState.skills = {};
  if (!nextState.staff) nextState.staff = [];
  if (!nextState.trucks) nextState.trucks = [];
  if (!nextState.trailers) nextState.trailers = [];
  if (!nextState.drivers) nextState.drivers = [];
  if (!nextState.activeContracts) nextState.activeContracts = [];
  if (!nextState.availableContracts) nextState.availableContracts = [];
  if (!nextState.pendingFuelDeliveries) nextState.pendingFuelDeliveries = [];
  if (!nextState.eventLogs) nextState.eventLogs = [];
  if (!nextState.unlockedRegions) nextState.unlockedRegions = ['America'];

  // Defensive array initialization for fleet objects
  nextState.drivers.forEach(d => {
    if (!d.traits) d.traits = [];
    if (!d.cdlClass) d.cdlClass = 'Class A CDL';
  });
  nextState.trucks.forEach(t => {
    if (!t.upgrades) t.upgrades = { engineStage: 0, fuelTankStage: 0, aeroStage: 0, comfortStage: 0, gpsStage: 0 };
    if (t.batteryHealthPercent === undefined || isNaN(t.batteryHealthPercent)) t.batteryHealthPercent = 100;
    if (t.brakeWearPercent === undefined || isNaN(t.brakeWearPercent)) t.brakeWearPercent = 100;
    if (t.suspensionHealthPercent === undefined || isNaN(t.suspensionHealthPercent)) t.suspensionHealthPercent = 100;
    if (t.tireTreadPercent === undefined || isNaN(t.tireTreadPercent)) t.tireTreadPercent = 100;
    if (t.conditionPercent === undefined || isNaN(t.conditionPercent)) t.conditionPercent = 100;

    // Self-healing guard: A healthy vehicle with good condition and battery must NEVER be stuck in breakdown
    if (t.status === 'breakdown' && t.conditionPercent >= 40 && t.batteryHealthPercent >= 30) {
      t.status = t.assignedContractId ? 'in_transit' : 'idle';
    }
  });

  // FLEET & CONTRACT SELF-HEALING / SANITY CHECK: Clean up orphan truck assignments and contract mismatches
  nextState.trucks.forEach(truck => {
    if (truck.assignedContractId) {
      const contract = nextState.activeContracts.find(c => c.id === truck.assignedContractId && c.status === 'in_progress');
      if (!contract) {
        // Orphaned truck assignment! Clean up.
        truck.assignedContractId = null;
        if (truck.status === 'in_transit' || truck.status === 'fueling') {
          truck.status = 'idle';
        }
      }
    } else {
      if (truck.status === 'in_transit' || truck.status === 'fueling') {
        truck.status = 'idle';
      }
    }
  });

  nextState.drivers.forEach(driver => {
    if (driver.assignedTruckId) {
      const truck = nextState.trucks.find(t => t.id === driver.assignedTruckId);
      if (!truck) {
        driver.assignedTruckId = null;
        driver.isResting = false;
      }
    }
  });

  const ecoSkillLevel = nextState.skills['eco-mastery'] || 0;
  const maintenanceSkillLevel = nextState.skills['mechanic-precision'] || 0;
  const dispatcherSkillLevel = nextState.skills['dispatcher-broker'] || 0;

  // Calculate Cumulative Corporate Staff Department Bonuses
  const dispatcherStaffBonus = nextState.staff.filter(s => s.role === 'dispatcher').reduce((sum, s) => sum + s.efficiencyBonus, 0);
  const accountantStaffBonus = nextState.staff.filter(s => s.role === 'accountant').reduce((sum, s) => sum + s.efficiencyBonus, 0);
  const mechanicStaffBonus = nextState.staff.filter(s => s.role === 'mechanic').reduce((sum, s) => sum + s.efficiencyBonus, 0);
  const hrStaffBonus = nextState.staff.filter(s => s.role === 'hr_manager').reduce((sum, s) => sum + s.efficiencyBonus, 0);
  const safetyStaffBonus = nextState.staff.filter(s => s.role === 'safety_officer').reduce((sum, s) => sum + s.efficiencyBonus, 0);

  // Process Trucks in HQ Repair Bay Maintenance
  nextState.trucks.forEach(truck => {
    if (truck.status !== 'maintenance') return;

    const remSecs =
      truck.maintenanceSecondsRemaining ??
      SIMULATION_CONFIG.maintenance.service.body.timeSeconds;

    const newRemSecs = Math.max(0, remSecs - deltaSeconds);
    truck.maintenanceSecondsRemaining = newRemSecs;

    if (newRemSecs > 0) return;

    const services = truck.scheduledMaintenanceServices || [];

    // Apply only the services that were actually purchased.
    for (const service of services) {
      switch (service) {
        case 'oil':
          truck.oilLifePercent =
            SIMULATION_CONFIG.vehicleDefaults.startingOilLifePercent;
          break;

        case 'tires':
          truck.tireTreadPercent =
            SIMULATION_CONFIG.vehicleDefaults.startingTireTreadPercent;
          break;

        case 'brakes':
          truck.brakeWearPercent =
            SIMULATION_CONFIG.vehicleDefaults.startingBrakeWearPercent;
          break;

        case 'battery':
          truck.batteryHealthPercent =
            SIMULATION_CONFIG.vehicleDefaults.startingBatteryHealthPercent;
          break;

        case 'suspension':
          truck.suspensionHealthPercent =
            SIMULATION_CONFIG.vehicleDefaults.startingSuspensionHealthPercent;
          break;

        case 'def':
          truck.defLevelLitres =
            truck.maxDefLitres ||
            SIMULATION_CONFIG.fuel.defaultTankCapacityLitres;
          break;

        case 'body':
          truck.conditionPercent =
            SIMULATION_CONFIG.vehicleDefaults.startingConditionPercent;
          break;
      }
    }

    const upgradeParts = truck.scheduledUpgradeParts || [];
    for (const part of upgradeParts) {
      if (truck.upgrades && truck.upgrades[part] !== undefined) {
        truck.upgrades[part] = Math.min(3, (truck.upgrades[part] || 0) + 1);
      }
    }
    truck.scheduledUpgradeParts = undefined;

    truck.status = 'idle';
    truck.maintenanceSecondsRemaining = 0;
    truck.scheduledMaintenanceAfterJob = false;
    truck.scheduledMaintenanceServices = undefined;

    const hasUpgrades = upgradeParts.length > 0;
    const hasServices = services.length > 0;

    newEvents.push({
      id: `repair-complete-${truck.id}-${Date.now()}`,
      timestamp: Date.now(),
      title: hasUpgrades ? `⚙️ Vehicle Upgrades & Servicing Complete` : `🔧 Repair Bay Servicing Complete`,
      message: hasUpgrades && hasServices
        ? `${truck.name} finished ${services.length} maintenance service items and successfully installed ${upgradeParts.length} performance upgrade(s)!`
        : hasUpgrades
        ? `${truck.name} successfully installed ${upgradeParts.length} performance upgrade component(s) in the HQ repair bay and returned to service.`
        : hasServices
        ? `${truck.name} completed ${services.length} approved service item${services.length === 1 ? '' : 's'} and returned to the garage.`
        : `${truck.name} completed its repair-bay service and returned to the garage.`,
      type: 'success'
    });
  });

  // Automated Dispatch Center AI
  const dispatchAILevel = nextState.depot?.dispatchAILevel || 0;
  const isAutoDispatchActive = dispatchAILevel > 0 && (nextState.depot?.isAutoDispatchEnabled ?? true);
  if (isAutoDispatchActive && nextState.availableContracts && nextState.availableContracts.length > 0) {
    let autoDispatchesCount = 0;

    for (const truck of nextState.trucks) {
      if (autoDispatchesCount >= dispatchAILevel) break;

      // Only dispatch trucks that are currently idle and not assigned to a contract
      if (truck.status !== 'idle' || truck.assignedContractId) continue;

      // SAFETY GUARD: Never override scheduled maintenance or pending upgrades!
      if (truck.scheduledMaintenanceAfterJob || (truck.scheduledUpgradeParts && truck.scheduledUpgradeParts.length > 0)) continue;

      // Driver must be assigned and ready
      const driver = nextState.drivers.find(d => d && d.id === truck.assignedDriverId);
      if (!driver || driver.isResting || driver.fatiguePercent >= 90) continue;

      // Attached trailer
      const trailer = nextState.trailers.find(tr => tr && tr.id === truck.assignedTrailerId);

      // Find candidate contracts: Prioritize backhauls and contracts starting from truck's current city
      const truckCity = truck.currentCity || 'HQ Depot';
      const candidateContracts = [...nextState.availableContracts]
        .filter(c => c && c.status === 'available' && !c.assignedTruckId)
        .sort((a, b) => {
          const aMatch = a.origin === truckCity ? 2 : (a.isBackhaul ? 1 : 0);
          const bMatch = b.origin === truckCity ? 2 : (b.isBackhaul ? 1 : 0);
          if (aMatch !== bMatch) return bMatch - aMatch;
          return b.payoutCash - a.payoutCash;
        });

      for (const contract of candidateContracts) {
        const validation = validateDispatchJurisdictionAndLimits(
          truck,
          contract,
          driver,
          trailer,
          nextState.unlockedRegions || ['America'],
          nextState.heavyHaulPermits || [],
          nextState.companyLevel || 1
        );

        if (validation.isValid) {
          // AI Tier 2+ Auto-Negotiation bonus (+8% to +15% payout increase)
          if (dispatchAILevel >= 2) {
            const negotiationMultiplier = 1.08 + Math.random() * 0.07;
            contract.payoutCash = Math.floor(contract.payoutCash * negotiationMultiplier);
          }

          contract.status = 'in_progress';
          contract.progressMiles = 0;
          contract.elapsedSeconds = 0;
          contract.assignedTruckId = truck.id;
          contract.assignedDriverId = driver.id;
          if (trailer) contract.assignedTrailerId = trailer.id;

          truck.assignedContractId = contract.id;
          truck.status = 'in_transit';
          driver.assignedTruckId = truck.id;

          // Remove from available and add to active
          nextState.availableContracts = nextState.availableContracts.filter(c => c.id !== contract.id);
          if (!nextState.activeContracts) nextState.activeContracts = [];
          
          // CRITICAL BUG FIX: Ensure Automated Dispatch contracts are initialized with 'in_progress'
          // and added to the active list so they are processed in the SAME tick.
          const activeContract: Contract = {
            ...contract,
            status: 'in_progress',
            progressMiles: 0,
            elapsedSeconds: 0,
            assignedTruckId: truck.id,
            assignedDriverId: driver.id,
            assignedTrailerId: trailer?.id
          };
          nextState.activeContracts.push(activeContract);

          const actionTitle = dispatchAILevel >= 2 ? '🤖 AI Tier 2 Negotiation & Dispatch' : '🤖 Automated Dispatch AI';
          const actionMsg = dispatchAILevel >= 2
            ? `Automated Dispatch Center (Tier ${dispatchAILevel}) negotiated higher freight rates & assigned ${truck.name} & ${driver.name} to ${contract.title} ($${contract.payoutCash.toLocaleString()}).`
            : `Automated Dispatch Center (Tier ${dispatchAILevel}) assigned ${truck.name} & ${driver.name} to ${contract.title} ($${contract.payoutCash.toLocaleString()}).`;

          newEvents.push({
            id: `auto-dispatch-${contract.id}-${Date.now()}`,
            timestamp: Date.now(),
            title: actionTitle,
            message: actionMsg,
            type: 'success'
          });

          autoDispatchesCount++;
          break;
        }
      }
    }
  }

  // Initialize Global Calendar (if missing)
  if (nextState.gameHour === undefined) nextState.gameHour = SIMULATION_CONFIG.time.initialGameHour;
  if (nextState.gameDay === undefined) nextState.gameDay = 1;
  if (nextState.gameMonth === undefined) nextState.gameMonth = 1;
  if (nextState.gameYear === undefined) nextState.gameYear = 2026;

  // Initialize weather system & forecast if missing
  if (nextState.activeWeather === undefined) nextState.activeWeather = 'Clear Skies';
  if (nextState.weatherTimer === undefined) nextState.weatherTimer = 0;
  if (nextState.weatherDuration === undefined) nextState.weatherDuration = getWeatherDuration();
  if (!nextState.weatherForecast || !Array.isArray(nextState.weatherForecast) || nextState.weatherForecast.length === 0) {
    nextState.weatherForecast = ['Clear Skies', 'Heavy Rain', 'Dense Fog'];
  }

  // Advance game time Scale: 1 real hour = 1.5 game hours (1.5x speed)
  const TIME_MULTIPLIER = SIMULATION_CONFIG.time.gameSpeedMultiplier;
  const gameDeltaHours = (deltaSeconds / SIMULATION_CONFIG.time.secondsPerHour) * TIME_MULTIPLIER;

  // Dynamic Diesel Market Price Fluctuation (Realistic commodity market: $1.00 to $5.00 range, mean-reverting, scarcity & surplus cycles)
  if (nextState.currentDieselMarketPrice === undefined) nextState.currentDieselMarketPrice = SIMULATION_CONFIG.market.diesel.baseEquilibrium;
  if (nextState.wholesaleRackPrice === undefined) nextState.wholesaleRackPrice = +(SIMULATION_CONFIG.market.diesel.baseEquilibrium * SIMULATION_CONFIG.market.diesel.wholesaleMultiplier).toFixed(2);
  if (!nextState.fuelPriceHistory || nextState.fuelPriceHistory.length === 0) {
    nextState.fuelPriceHistory = [SIMULATION_CONFIG.market.diesel.baseEquilibrium, SIMULATION_CONFIG.market.diesel.baseEquilibrium, SIMULATION_CONFIG.market.diesel.baseEquilibrium, SIMULATION_CONFIG.market.diesel.baseEquilibrium];
  }

  if (Math.random() < (0.005 * deltaSeconds)) {
    const oldPrice = nextState.currentDieselMarketPrice;
    
    // Commodity market dynamics: mean-reversion toward base equilibrium ($2.60)
    const baseEquilibrium = SIMULATION_CONFIG.market.diesel.baseEquilibrium;
    const meanReversion = (baseEquilibrium - oldPrice) * SIMULATION_CONFIG.market.diesel.meanReversionRate;
    
    // Random market volatility / sentiment shock
    const randomShock = (Math.random() - SIMULATION_CONFIG.market.diesel.shockCenter) * SIMULATION_CONFIG.market.diesel.randomShockAmplitude;
    
    // Trend persistence / cycle bias (scarcity vs surplus corrections near boundaries)
    let trendBias = 0;
    if (oldPrice < SIMULATION_CONFIG.market.diesel.lowPriceThreshold) {
      trendBias = SIMULATION_CONFIG.market.diesel.lowPriceRecoveryBias; // Recovery pressure near price floor
    } else if (oldPrice > SIMULATION_CONFIG.market.diesel.highPriceThreshold) {
      trendBias = SIMULATION_CONFIG.market.diesel.highPriceCorrectionBias; // Correction pressure near price ceiling
    }

    const delta = meanReversion + randomShock + trendBias;
    const newPrice = Math.max(SIMULATION_CONFIG.market.diesel.minimumPrice, Math.min(SIMULATION_CONFIG.market.diesel.maximumPrice, +(oldPrice + delta).toFixed(2)));
    
    nextState.currentDieselMarketPrice = newPrice;
    nextState.dieselPriceTrend = newPrice > oldPrice ? 'rising' : newPrice < oldPrice ? 'falling' : 'stable';
    nextState.wholesaleRackPrice = +(newPrice * SIMULATION_CONFIG.market.diesel.wholesaleMultiplier).toFixed(2);

    if (!nextState.fuelPriceHistory) nextState.fuelPriceHistory = [];
    nextState.fuelPriceHistory.push(newPrice);
    if (nextState.fuelPriceHistory.length > SIMULATION_CONFIG.market.diesel.historyLength) nextState.fuelPriceHistory.shift();

    // Event notification on extreme scarcity or surplus
    if (newPrice >= SIMULATION_CONFIG.market.diesel.scarcityEventThreshold && oldPrice < SIMULATION_CONFIG.market.diesel.scarcityEventThreshold) {
      newEvents.push({
        id: `diesel-scarcity-${Date.now()}`,
        timestamp: Date.now(),
        title: '⚠️ Severe Diesel Scarcity',
        message: `Global refinery supply crunch has spiked retail diesel spot prices to $${newPrice.toFixed(2)}/L!`,
        type: 'warning'
      });
    } else if (newPrice <= SIMULATION_CONFIG.market.diesel.surplusEventThreshold && oldPrice > SIMULATION_CONFIG.market.diesel.surplusEventThreshold) {
      newEvents.push({
        id: `diesel-glut-${Date.now()}`,
        timestamp: Date.now(),
        title: '⛽ Major Fuel Surplus (Low Prices)',
        message: `Crude oil oversupply and refinery glut have driven spot diesel prices down to $${newPrice.toFixed(2)}/L!`,
        type: 'success'
      });
    }
  }

  // Enhanced Weather System with time-of-day patterns and durations
  
  // Increment weather timer
  nextState.weatherTimer += deltaSeconds;

  // Check if weather should change
  if (shouldChangeWeather(nextState, deltaSeconds)) {
    const oldWeather = nextState.activeWeather;
    let newWeather: WeatherType;
    
    // If weather expired, choose new weather based on time of day
    if (nextState.weatherTimer >= (nextState.weatherDuration ?? 0)) {
      // Pull from forecast safely
      newWeather = (nextState.weatherForecast && nextState.weatherForecast.length > 0) 
        ? nextState.weatherForecast[0] 
        : generateWeatherForTimeOfDay(nextState.gameHour);
      
      // Advance forecast
      const futureWeather = generateWeatherForTimeOfDay(nextState.gameHour + 12);
      const currentForecast = nextState.weatherForecast || [];
      const slicedForecast = currentForecast.length > 1 ? currentForecast.slice(1) : ['Clear Skies', 'Heavy Rain'];
      nextState.weatherForecast = [...slicedForecast, futureWeather];
      
      // Reset timer for new weather period
      nextState.weatherTimer = 0;
      nextState.weatherDuration = getWeatherDuration();
    } else {
      // Random change - pick different weather
      const availableWeathers = WEATHERS.filter(w => w !== nextState.activeWeather);
      newWeather = availableWeathers[Math.floor(Math.random() * availableWeathers.length)];
    }
    
    nextState.activeWeather = newWeather;
    
    if (oldWeather !== newWeather) {
      newEvents.push({
        id: `weather-${Date.now()}`,
        timestamp: Date.now(),
        title: `Weather Shift: ${newWeather}`,
        message: `Road conditions updated to ${newWeather}. Drive safely!`,
        type: 'info'
      });
    }
  }

  // Process Pending Fuel Deliveries
  if (nextState.pendingFuelDeliveries.length > 0) {
    nextState.pendingFuelDeliveries = nextState.pendingFuelDeliveries.map(delivery => ({
      ...delivery,
      remainingSeconds: Math.max(0, delivery.remainingSeconds - deltaSeconds)
    }));

    const completed = nextState.pendingFuelDeliveries.filter(d => d.remainingSeconds <= 0);
    if (completed.length > 0) {
      completed.forEach(d => {
        const space = nextState.bulkFuelCapacityLitres - nextState.bulkFuelReserveLitres;
        const actualAdded = Math.min(d.amountLitres, space);
        nextState.bulkFuelReserveLitres += actualAdded;
        
        newEvents.push({
          id: `fuel-delivery-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          title: `Bulk Fuel Delivered`,
          message: `Tanker arrival complete. ${Math.floor(actualAdded).toLocaleString()} Litres pumped into HQ storage.`,
          type: 'success'
        });
      });
      nextState.pendingFuelDeliveries = nextState.pendingFuelDeliveries.filter(d => d.remainingSeconds > 0);
    }
  }

  // Self-heal contracts with status 'in_transit' to 'in_progress'
  if (nextState.activeContracts) {
    nextState.activeContracts.forEach(c => {
      // DEBUG: Ensure contracts have valid IDs and status
      if (c && (c.status as string) === 'in_transit') {
        c.status = 'in_progress';
        if (c.progressMiles === undefined) c.progressMiles = 0;
        if (c.elapsedSeconds === undefined) c.elapsedSeconds = 0;
      }
    });
  }

  // Process each contract in progress
  // Filter out any invalid/null contracts before processing
  nextState.activeContracts = (nextState.activeContracts || []).filter(c => c && c.id);

  // Tier 3 AI Autonomous Incident Response (Breakdown Mechanic Approval & Driver Espresso Boost)
  const dispatchAILevelForIncidents = nextState.depot?.dispatchAILevel || 0;
  if (dispatchAILevelForIncidents >= 3 && (nextState.depot?.isAutoDispatchEnabled ?? true)) {
    nextState.trucks.forEach(truck => {
      if (truck.status === 'breakdown' && nextState.cash >= 350) {
        nextState.cash -= 350;
        truck.conditionPercent = Math.max(85, truck.conditionPercent);
        truck.status = truck.assignedContractId ? 'in_transit' : 'idle';
        newEvents.push({
          id: `ai-tier3-repair-${truck.id}-${Date.now()}`,
          timestamp: Date.now(),
          title: `🤖 Tier 3 AI Incident Response: Mechanic Dispatched`,
          message: `Automated Dispatch AI Tier 3 detected breakdown on ${truck.name}. Automatically approved mobile mechanic dispatch (-$350). Unit restored to 85% operating condition.`,
          type: 'success',
          cashChange: -350
        });
      }
    });

    nextState.drivers.forEach(driver => {
      if (driver.fatiguePercent >= 75 && !driver.isResting && nextState.cash >= SIMULATION_CONFIG.driver.morale.coffeeCost) {
        nextState.cash -= SIMULATION_CONFIG.driver.morale.coffeeCost;
        driver.fatiguePercent = Math.max(0, driver.fatiguePercent - 25);
        driver.moralePercent = Math.min(100, (driver.moralePercent || 100) + 15);
        newEvents.push({
          id: `ai-tier3-coffee-${driver.id}-${Date.now()}`,
          timestamp: Date.now(),
          title: `🤖 Tier 3 AI Roadside Care: Espresso Boost`,
          message: `Automated Dispatch AI Tier 3 detected driver fatigue for ${driver.name} (>=75%). Automatically purchased roadside espresso and rest stop (-$${SIMULATION_CONFIG.driver.morale.coffeeCost}). Fatigue reduced by 25%!`,
          type: 'success',
          cashChange: -SIMULATION_CONFIG.driver.morale.coffeeCost
        });
      }
    });
  }

  nextState.activeContracts.forEach((contract) => {
    if (contract.status !== 'in_progress' || !contract.assignedTruckId || !contract.assignedDriverId) return;

    const truck = nextState.trucks.find(t => t.id === contract.assignedTruckId);
    const driver = nextState.drivers.find(d => d.id === contract.assignedDriverId);
    const trailer = nextState.trailers.find(t => t.id === truck?.assignedTrailerId);

    if (!truck || !driver) return;

    // 1. HOS Rest Recovery Check
    if (driver.isResting) {
      driver.restSecondsRemaining = Math.max(0, (driver.restSecondsRemaining || 0) - deltaSeconds);
      truck.status = 'resting';
      
    // Fast roadside rest recovery (accelerated by HQ Driver Lounge level)
      const loungeMultiplier = 1 + ((nextState.depot?.driverLoungeLevel || 1) - 1) * 0.20;
      driver.fatiguePercent = Math.max(0, driver.fatiguePercent - (deltaSeconds / SIMULATION_CONFIG.time.secondsPerMinute) * SIMULATION_CONFIG.driver.fatigueRecoveryPerMinute * loungeMultiplier);
      driver.eldShiftHoursRemaining = +((1 - (driver.fatiguePercent / SIMULATION_CONFIG.general.fullPercent)) * SIMULATION_CONFIG.driver.shiftHours).toFixed(1);

      // As soon as fatigue drops to 0% or rest timer expires, driver IMMEDIATELY resumes transit
      if (driver.fatiguePercent <= 0 || driver.restSecondsRemaining <= 0) {
        driver.fatiguePercent = 0;
        driver.eldShiftHoursRemaining = SIMULATION_CONFIG.driver.shiftHours;
        driver.isResting = false;
        driver.restSecondsRemaining = 0;
        truck.status = 'in_transit';
        newEvents.push({
          id: `rest-end-${Date.now()}`,
          timestamp: Date.now(),
          title: `Driver Fully Rested`,
          message: `${driver.name} is 100% rested and back on the road!`,
          type: 'info'
        });
      }
      return; // Truck is parked while resting
    }

    // Trigger mandatory force park & rest ONLY when reaching 90% fatigue
    if (driver.fatiguePercent >= SIMULATION_CONFIG.driver.mandatoryRestFatigueThreshold) {
      driver.isResting = true;
      driver.restSecondsRemaining = SIMULATION_CONFIG.driver.mandatoryRestSeconds;
      truck.status = 'resting';
      newEvents.push({
        id: `rest-start-${Date.now()}`,
        timestamp: Date.now(),
        title: `Mandatory Rest: ${SIMULATION_CONFIG.driver.fatigue.mandatoryRestThreshold}% Fatigue Reached`,
        message: `${driver.name} reached ${SIMULATION_CONFIG.driver.fatigue.mandatoryRestThreshold}% critical fatigue. Pulled over to rest area for mandatory sleep.`,
        type: 'warning'
      });
      return;
    }

    // 2. Commercial In-Transit Fueling Check
    const currentL = truck.currentFuelLitres || 0;
    if (currentL < SIMULATION_CONFIG.fuel.emergencyFuelThresholdLitres && nextState.cash >= SIMULATION_CONFIG.fuel.minimumCashForFuelCheck) {
      const fuelToBuy = (truck.maxFuelLitres || SIMULATION_CONFIG.fuel.defaultTankCapacityLitres) - currentL;
      const fuelCost = Math.floor(fuelToBuy * nextState.currentDieselMarketPrice);
      
      if (nextState.cash >= fuelCost) {
        nextState.cash -= fuelCost;
        truck.currentFuelLitres = truck.maxFuelLitres;
        truck.currentFuelGallons = +(truck.currentFuelLitres / SIMULATION_CONFIG.fuel.litresPerUsGallon).toFixed(1);
        
        newEvents.push({
          id: `transit-fuel-${Date.now()}`,
          timestamp: Date.now(),
          title: `⛽ Highway Refueling Stop`,
          message: `${truck.name} was low on fuel. Stopped at roadside truck stop. Pumped ${Math.floor(fuelToBuy)}L at market price (-$${fuelCost}).`,
          type: 'warning',
          cashChange: -fuelCost
        });
        truck.status = 'fueling';
        return; 
      }
    }

    truck.status = 'in_transit';

    // Determine speed and fuel efficiency using physics engine
    const physics = calculateTruckPhysics(
      truck, 
      contract, 
      driver, 
      nextState.activeWeather, 
      nextState.skills,
      nextState.trailers,
      dispatcherStaffBonus
    );
    let { speedMph, currentMpg } = physics;

    // Apply modular vehicle performance state modifiers (brakes, tires, suspension, DEF, battery)
    const perf = calculateVehiclePerformance(truck);
    speedMph *= perf.speedMultiplier;
    currentMpg *= perf.fuelEfficiencyMultiplier;

    if (perf.isStranded) {
      truck.status = 'breakdown';
      newEvents.push({
        id: `battery-fail-${truck.id}-${Date.now()}`,
        timestamp: Date.now(),
        title: `⚡ Electrical Battery Failure`,
        message: `${truck.name} battery and electrical system completely failed. Rig is stranded!`,
        type: 'danger'
      });
      return;
    }

    // Check if truck condition is too low to drive
    if (truck.conditionPercent <= SIMULATION_CONFIG.maintenance.criticalConditionThreshold) {
      if (!contract.elapsedSeconds || contract.elapsedSeconds % SIMULATION_CONFIG.time.secondsPerMinute < deltaSeconds) {
        newEvents.push({
          id: `event-breakdown-${Date.now()}`,
          timestamp: Date.now(),
          title: `Breakdown Alert: ${truck.name}`,
          message: `${truck.name} condition critical (${Math.floor(truck.conditionPercent)}%). Operating at emergency crawl speed!`,
          type: 'warning'
        });
      }
      truck.status = 'breakdown';
    }

    const milesThisTick = speedMph * gameDeltaHours;

    // Evaluate roadside incidents (accidents, brake failure crashes, etc.)
    const incidentResult = evaluateRoadsideIncidents(truck, driver, nextState.activeWeather, milesThisTick, deltaSeconds);
    if (incidentResult.events.length > 0) {
      newEvents.push(...incidentResult.events);
      if (incidentResult.cashPenalty > 0) {
        nextState.cash -= incidentResult.cashPenalty;
        nextState.stats.totalFinesPaid = (nextState.stats.totalFinesPaid || 0) + incidentResult.cashPenalty;
      }
      if (incidentResult.truckDamage > 0) {
        truck.conditionPercent = Math.max(0, truck.conditionPercent - incidentResult.truckDamage);
      }
      if (incidentResult.contractFailed) {
        contract.status = 'failed';
        truck.status = 'idle';
        truck.assignedContractId = null;
        driver.assignedTruckId = null;
        return;
      }
    }
    
    // Fuel calculation in Litres using physics-calculated MPG
    const fuelConsumedLitres = (milesThisTick / Math.max(1, currentMpg)) * SIMULATION_CONFIG.fuel.litresPerUsGallon;
    truck.currentFuelLitres = Math.max(0, (truck.currentFuelLitres || 0) - fuelConsumedLitres);
    truck.currentFuelGallons = +(truck.currentFuelLitres / SIMULATION_CONFIG.fuel.litresPerUsGallon).toFixed(1);
    nextState.stats.fuelSpentGallons += fuelConsumedLitres;

    // Reefer Temperature Maintenance (Cooling Unit Reliability)
    if (trailer && trailer.type === 'Refrigerated') {
      const targetTemp = trailer.setPointTempF ?? SIMULATION_CONFIG.reefer.defaultSetPointF;
      trailer.currentTempF = targetTemp;
      const maxL = trailer.maxFuelLitres || SIMULATION_CONFIG.reefer.defaultFuelCapacityLitres;
      trailer.currentFuelLitres = maxL;
    }

    // Wear and tear calculation (Rig, Oil, Tires)
    let wearRatePerMile = SIMULATION_CONFIG.maintenance.baseWearPerMile / Math.max(1, truck.durabilityRating / SIMULATION_CONFIG.maintenance.durabilityReference);
    if ((driver.traits || []).includes('Mechanic')) wearRatePerMile *= SIMULATION_CONFIG.maintenance.mechanicTraitMultiplier;
    wearRatePerMile *= (1 - maintenanceSkillLevel * SIMULATION_CONFIG.maintenance.maintenanceSkillReductionPerLevel);

    // Mechanic staff reduces physical wear & tear across fleet
    const mechanicWearFactor = Math.max(SIMULATION_CONFIG.maintenance.minimumStaffWearMultiplier, 1 - (mechanicStaffBonus / SIMULATION_CONFIG.general.staffBonusPercentBase));
    wearRatePerMile *= mechanicWearFactor;

    truck.conditionPercent = Math.max(0, truck.conditionPercent - (milesThisTick * wearRatePerMile));
    truck.oilLifePercent = Math.max(0, truck.oilLifePercent - (milesThisTick * SIMULATION_CONFIG.maintenance.oilWearPerMile * mechanicWearFactor));
    truck.tireTreadPercent = Math.max(0, truck.tireTreadPercent - (milesThisTick * SIMULATION_CONFIG.maintenance.tireWearPerMile * mechanicWearFactor));
    truck.odometerMiles = (truck.odometerMiles || 0) + milesThisTick;

    // Predictive Maintenance Alerts
    if (truck.conditionPercent <= SIMULATION_CONFIG.maintenance.predictiveConditionThreshold && !truck.predictiveAlertSent) {
      truck.predictiveAlertSent = true;
      newEvents.push({
        id: `pred-cond-${truck.id}-${Date.now()}`,
        timestamp: Date.now(),
        title: `Predictive Alert: ${truck.name}`,
        message: `Fleet telemetry detects critical vehicle condition (${Math.floor(truck.conditionPercent)}%). Schedule maintenance to prevent breakdown!`,
        type: 'warning'
      });
    }
    if (truck.oilLifePercent <= SIMULATION_CONFIG.maintenance.predictiveOilThreshold && !truck.oilAlertSent) {
      truck.oilAlertSent = true;
      newEvents.push({
        id: `pred-oil-${truck.id}-${Date.now()}`,
        timestamp: Date.now(),
        title: `Maintenance Warning: ${truck.name}`,
        message: `Oil life low (${Math.floor(truck.oilLifePercent)}%). Service required.`,
        type: 'warning'
      });
    }
    if (truck.tireTreadPercent <= SIMULATION_CONFIG.maintenance.predictiveTireThreshold && !truck.tireAlertSent) {
      truck.tireAlertSent = true;
      newEvents.push({
        id: `pred-tire-${truck.id}-${Date.now()}`,
        timestamp: Date.now(),
        title: `Maintenance Warning: ${truck.name}`,
        message: `Tire tread depth critical (${Math.floor(truck.tireTreadPercent)}%). Replace tires.`,
        type: 'warning'
      });
    }

    if (truck.conditionPercent > SIMULATION_CONFIG.maintenance.predictiveResetThreshold) truck.predictiveAlertSent = false;
    if (truck.oilLifePercent > SIMULATION_CONFIG.maintenance.predictiveResetThreshold) truck.oilAlertSent = false;
    if (truck.tireTreadPercent > SIMULATION_CONFIG.maintenance.predictiveResetThreshold) truck.tireAlertSent = false;

    // Fatigue & ELD hours buildup (HR manager reduces driver fatigue rate)
    let fatigueRatePerHour = SIMULATION_CONFIG.driver.baseFatiguePerHour;
    if ((driver.traits || []).includes('Night Owl')) fatigueRatePerHour *= SIMULATION_CONFIG.driver.nightOwlMultiplier;
    fatigueRatePerHour *= Math.max(SIMULATION_CONFIG.driver.minimumHrStaffFatigueMultiplier, 1 - (hrStaffBonus / SIMULATION_CONFIG.general.staffBonusPercentBase));

    driver.fatiguePercent = Math.min(SIMULATION_CONFIG.general.fullPercent, driver.fatiguePercent + (gameDeltaHours * fatigueRatePerHour));
    driver.eldShiftHoursRemaining = +((1 - (driver.fatiguePercent / SIMULATION_CONFIG.general.fullPercent)) * SIMULATION_CONFIG.driver.shiftHours).toFixed(1);

    // Update contract progress
    const oldProgress = contract.progressMiles || 0;
    contract.progressMiles = oldProgress + milesThisTick;
    contract.elapsedSeconds = (contract.elapsedSeconds || 0) + (gameDeltaHours * SIMULATION_CONFIG.time.secondsPerHour);
    nextState.stats.totalMilesDriven += milesThisTick;

    // 3. REGULATORY & COMPLIANCE (Phase 5)
    
    // HOS (Hours of Service) Violation Check
    if (driver.eldShiftHoursRemaining <= 0 && !driver.isResting) {
       // Risk of fine every minute driving past limit
       if (Math.random() < (SIMULATION_CONFIG.compliance.hos.violationChancePerSecond * deltaSeconds)) {
          const fine = SIMULATION_CONFIG.compliance.hos.fine;
          nextState.cash -= fine;
          nextState.stats.totalFinesPaid = (nextState.stats.totalFinesPaid || 0) + fine;
          newEvents.push({
            id: `fine-hos-${Date.now()}`,
            timestamp: Date.now(),
            title: `HOS Violation Fine`,
            message: `DOT Enforcement stopped ${driver.name} for driving past HOS shift limits. -$${fine} fine issued.`,
            type: 'danger',
            cashChange: -fine
          });
       }
    }

    // DOT Random Inspections
    // Lower chance if truck has PrePass, higher if condition is bad
    let inspectionChance = SIMULATION_CONFIG.compliance.dotInspection.baseChancePerSecond;
    if (!truck.hasPrePass) inspectionChance *= SIMULATION_CONFIG.compliance.dotInspection.noPrePassMultiplier;
    if (truck.conditionPercent < SIMULATION_CONFIG.compliance.dotInspection.poorConditionThreshold) inspectionChance *= SIMULATION_CONFIG.compliance.dotInspection.poorConditionMultiplier;
    
    if (Math.random() < (inspectionChance * deltaSeconds)) {
       let dotFine = 0;
       let dotMessage = `${driver.name} was pulled into a DOT weigh station for a random inspection. Everything was compliant!`;
       
       if (truck.conditionPercent < SIMULATION_CONFIG.compliance.dotInspection.criticalConditionThreshold) {
          dotFine = SIMULATION_CONFIG.compliance.dotInspection.criticalConditionFine;
          dotMessage = `DOT Inspection found critical maintenance violations on ${truck.name}. Safety fine issued.`;
       } else if (driver.cleanRecordScore < SIMULATION_CONFIG.compliance.dotInspection.cleanRecordThreshold) {
          dotFine = SIMULATION_CONFIG.compliance.dotInspection.documentationFine;
          dotMessage = `DOT roadside inspection flagged driver record issues for ${driver.name}. Documentation fine issued.`;
       }

       if (dotFine > 0) {
          nextState.cash -= dotFine;
          nextState.stats.totalFinesPaid = (nextState.stats.totalFinesPaid || 0) + dotFine;
          newEvents.push({
            id: `dot-inspection-${Date.now()}`,
            timestamp: Date.now(),
            title: dotFine > 0 ? `DOT Violation` : `DOT Inspection`,
            message: dotMessage,
            type: dotFine > 0 ? 'danger' : 'info',
            cashChange: dotFine > 0 ? -dotFine : undefined
          });
       }
    }

    // 4. CONTRACT MANAGEMENT (Phase 3/11)

    // Delivery deadline in game seconds (max 1 hour / 60 minutes)
    const effectiveTimeLimitSeconds = (contract.timeLimitMinutes || SIMULATION_CONFIG.contracts.minimumTimeLimitMinutes) * SIMULATION_CONFIG.time.secondsPerMinute;

    // Check Severe Expiry Time Limit Failure (if extremely overdue while still in transit)
    if (contract.elapsedSeconds > effectiveTimeLimitSeconds * SIMULATION_CONFIG.contracts.severeOverdueMultiplier) {
       // 1. Mark as Breached instead of Failed
       contract.status = 'breached'; 
       
       // 2. Calculate Recovery Fee (40% of payout for time/fuel wasted)
       const recoveryFee = Math.floor(contract.payoutCash * SIMULATION_CONFIG.contracts.recoveryFeeMultiplier);
       nextState.cash += recoveryFee;
       
       // 3. Reputation Penalty
       if (!nextState.profile) nextState.profile = { founderName: 'Alex', hqCity: 'Dallas', hqState: 'TX', usdotNumber: '', mcNumber: '', einTaxId: '', missionStatement: '', logoIcon: '🚚', registrationStatus: 'Good Standing', corporateStructure: 'LLC', corporateTaxRate: 0.21, insuranceMonthlyPerTruck: 420, creditRating: 'A', creditScore: 720, brandScore: 50 };
       nextState.profile.brandScore = Math.max(SIMULATION_CONFIG.general.brandScoreMinimum, (nextState.profile.brandScore || SIMULATION_CONFIG.finance.profileDefaults.brandScore) - SIMULATION_CONFIG.general.serviceBrandScorePenalty);
       
       newEvents.push({
         id: `breached-time-${contract.id}-${Date.now()}`,
         timestamp: Date.now(),
         title: `Contract Breached: Customer Cancellation`,
         message: `Delivery window for "${contract.title}" exceeded. Customer cancelled the order en-route. Received $${recoveryFee} recovery fee for transit costs.`,
         type: 'warning',
         cashChange: recoveryFee
       });
       
       // 4. Release assets
       truck.status = 'idle';
       truck.assignedContractId = null;
       driver.assignedTruckId = null;
       
       return;
    }

    // Toll Logic: Charge every 80 miles
    const TOLL_INTERVAL = SIMULATION_CONFIG.contracts.tollIntervalMiles;
    if (Math.floor(oldProgress / TOLL_INTERVAL) !== Math.floor(contract.progressMiles / TOLL_INTERVAL)) {
      let tollCost = SIMULATION_CONFIG.contracts.baseToll; // Base toll
      if (contract.region === 'Europe') tollCost = SIMULATION_CONFIG.contracts.europeToll;
      else if (contract.region === 'Asia') tollCost = SIMULATION_CONFIG.contracts.asiaToll;
      
      // Heavy loads pay more
      if (contract.weightTons > SIMULATION_CONFIG.contracts.heavyTollWeightThresholdTons) tollCost *= SIMULATION_CONFIG.contracts.heavyTollMultiplier;

      nextState.cash -= tollCost;
      nextState.stats.totalTollsPaid = (nextState.stats.totalTollsPaid || 0) + tollCost;
      
      newEvents.push({
        id: `toll-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        title: `Highway Toll: ${contract.region}`,
        message: `${truck.name} passed through a commercial toll plaza. -$${tollCost} debited from treasury.`,
        type: 'warning',
        cashChange: -tollCost
      });
    }

    // Check completion
    if (contract.progressMiles >= contract.distanceMiles) {
      contract.status = 'completed';
      truck.currentCity = contract.destination;

      // Round Trip & Backhaul generation
      if (contract.isRoundTrip && contract.returnLeg) {
        const backhaulContract: Contract = {
          id: `backhaul-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
          title: `Return Backhaul (${contract.destination} → ${contract.origin}) [🔙 Backhaul Loop]`,
          origin: contract.destination,
          destination: contract.origin,
          cargoCategory: contract.returnLeg.cargoCategory,
          requiredTrailerType: contract.returnLeg.requiredTrailerType,
          distanceMiles: contract.returnLeg.distanceMiles,
          weightTons: contract.weightTons,
          payoutCash: contract.returnLeg.payoutCash,
          payoutXp: contract.payoutXp,
          timeLimitMinutes: contract.timeLimitMinutes,
          dangerLevel: contract.dangerLevel,
          region: contract.region,
          status: 'available',
          negotiationStatus: 'none',
          isBackhaul: true,
          expirySecondsTotal: 14400,
          expirySecondsRemaining: 14400
        };
        if (!nextState.availableContracts) nextState.availableContracts = [];
        nextState.availableContracts.unshift(backhaulContract);

        newEvents.push({
          id: `backhaul-spawn-${Date.now()}`,
          timestamp: Date.now(),
          title: `📦 Return Backhaul Freight Unlocked`,
          message: `${truck.name} delivered cargo to ${contract.destination}. Exclusive return backhaul freight posted to the Freight Board for zero deadhead!`,
          type: 'success'
        });
      }

      if (truck.scheduledMaintenanceAfterJob) {
        truck.status = 'maintenance';

        newEvents.push({
          id: `maintenance-start-${truck.id}-${Date.now()}`,
          timestamp: Date.now(),
          title: '🔧 Truck Entered Repair Bay',
          message: `${truck.name} completed its delivery and entered the HQ repair bay for its pre-paid maintenance order.`,
          type: 'info'
        });
      } else {
        truck.status = 'idle';
      }

      // Check if delivery was on time or late
      const isLateDelivery = contract.elapsedSeconds > effectiveTimeLimitSeconds;

      // Payout math: modified by dispatch broker skill AND dispatcher staff bonus
      let finalPayout = contract.payoutCash * (1 + dispatcherSkillLevel * SIMULATION_CONFIG.contracts.dispatcherPayoutBonusPerSkillLevel + (dispatcherStaffBonus / SIMULATION_CONFIG.general.staffBonusPercentBase));
      const traits = driver.traits || [];
      if (traits.includes('HazMat Specialist') && (contract.cargoCategory === 'Hazardous Chemicals' || contract.cargoCategory === 'High Value Tech')) {
        finalPayout *= 1.25;
      }

      // Apply late penalty deduction if delivered past deadline (5% penalty)
      if (isLateDelivery) {
        finalPayout *= SIMULATION_CONFIG.contracts.latePayoutMultiplier;
      }

      nextState.cash += Math.floor(finalPayout);
      nextState.stats.totalEarnings += Math.floor(finalPayout);
      nextState.stats.deliveriesCompleted += 1;

      // Ensure profile exists
      if (!nextState.profile) nextState.profile = { founderName: 'Alex', hqCity: 'Dallas', hqState: 'TX', usdotNumber: '', mcNumber: '', einTaxId: '', missionStatement: '', logoIcon: '🚚', registrationStatus: 'Good Standing', corporateStructure: 'LLC', corporateTaxRate: 0.21, insuranceMonthlyPerTruck: 420, creditRating: 'A', creditScore: 720, brandScore: 50 };

      // Reputation (Brand Score) adjustment
      if (isLateDelivery) {
        nextState.profile.brandScore = Math.max(SIMULATION_CONFIG.general.brandScoreMinimum, (nextState.profile.brandScore || SIMULATION_CONFIG.finance.profileDefaults.brandScore) - SIMULATION_CONFIG.general.failedContractBrandScorePenalty);
        newEvents.push({
          id: `late-delivery-${contract.id}-${Date.now()}`,
          timestamp: Date.now(),
          title: `⚠️ Late Delivery`,
          message: `${driver.name} delivered "${contract.title}" past the deadline. Payout docked 5% and Brand Score reduced by 0.5%!`,
          type: 'warning',
          cashChange: Math.floor(finalPayout)
        });
      } else {
        nextState.profile.brandScore = Math.min(SIMULATION_CONFIG.general.brandScoreMaximum, (nextState.profile.brandScore || SIMULATION_CONFIG.finance.profileDefaults.brandScore) + SIMULATION_CONFIG.general.completedContractBrandScoreBonus);
      }

      // XP math
      let xpEarned = contract.payoutXp;
      if (traits.includes('Veteran Hauler')) xpEarned *= SIMULATION_CONFIG.contracts.veteranHaulerXpMultiplier;

      driver.xp += xpEarned;
      if (driver.xp >= driver.maxXp) {
        driver.skillLevel += 1;
        driver.xp -= driver.maxXp;
        driver.maxXp = Math.floor(driver.maxXp * 1.4);
        newEvents.push({
          id: `event-driver-lvl-${Date.now()}`,
          timestamp: Date.now(),
          title: `Driver Promoted!`,
          message: `${driver.name} leveled up to Rank ${driver.skillLevel}!`,
          type: 'success'
        });
      }

      // Company XP
      nextState.companyXp += Math.floor(
        xpEarned * SIMULATION_CONFIG.contracts.completionXpCompanyMultiplier
      );

      // Normalize the XP requirement so old saves migrate to the new progression curve.
      nextState.maxCompanyXp = getCompanyXpRequirement(nextState.companyLevel);

      // A large delivery can earn enough XP for multiple company levels.
      let companyLevelsGained = 0;

      while (nextState.companyXp >= nextState.maxCompanyXp) {
        nextState.companyXp -= nextState.maxCompanyXp;
        nextState.companyLevel += 1;
        companyLevelsGained += 1;
        nextState.maxCompanyXp = getCompanyXpRequirement(nextState.companyLevel);
      }

      if (companyLevelsGained > 0) {
        newEvents.push({
          id: `event-company-lvl-${Date.now()}`,
          timestamp: Date.now(),
          title: `Company Reputation Increased!`,
          message:
            companyLevelsGained === 1
              ? `Company reached Level ${nextState.companyLevel}! New contracts and opportunities are becoming available.`
              : `Company advanced ${companyLevelsGained} levels and reached Level ${nextState.companyLevel}! New contracts and opportunities are becoming available.`,
          type: 'success'
        });
      }

      // Event log
      const eventLog: RoadEventLog = {
        id: `event-complete-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        timestamp: Date.now(),
        title: `Delivery Complete: ${contract.title}`,
        message: `${driver.name} delivered ${contract.weightTons} tons of ${contract.cargoCategory} to ${contract.destination}. Earned +$${Math.floor(finalPayout).toLocaleString()}`,
        type: 'success',
        cashChange: Math.floor(finalPayout)
      };
      newEvents.push(eventLog);

      // Auto-refuel from HQ depot if policy enabled and truck is returning
      if (nextState.autoRefuelFromDepot) {
        const missingL = truck.maxFuelLitres - truck.currentFuelLitres;
        if (missingL > 5) {
          if (nextState.bulkFuelReserveLitres >= missingL) {
            nextState.bulkFuelReserveLitres -= missingL;
            truck.currentFuelLitres = truck.maxFuelLitres;
            truck.currentFuelGallons = +(truck.currentFuelLitres / SIMULATION_CONFIG.fuel.litresPerUsGallon).toFixed(1);
            
            newEvents.push({
              id: `event-autorefuel-${Date.now()}`,
              timestamp: Date.now(),
              title: `Auto-Refuel: ${truck.name}`,
              message: `${truck.name} topped off from HQ bulk reserve upon return.`,
              type: 'info'
            });
          }
        }

        // Refuel Reefer too
        if (trailer && trailer.type === 'Refrigerated') {
          const reeferNeeded =
          (trailer.maxFuelLitres ?? SIMULATION_CONFIG.reefer.defaultFuelCapacityLitres) -
          (trailer.currentFuelLitres ?? 0);
          if (nextState.bulkFuelReserveLitres >= reeferNeeded) {
             nextState.bulkFuelReserveLitres -= reeferNeeded;
             trailer.currentFuelLitres = (trailer.maxFuelLitres || SIMULATION_CONFIG.reefer.defaultFuelCapacityLitres);
          }
        }
      }

      // Unassign truck & driver
      truck.assignedContractId = null;
      driver.assignedTruckId = null;
    }
  });

  // Clean up completed contracts from activeContracts array
  nextState.activeContracts = nextState.activeContracts.filter(c => c.status === 'in_progress' || c.status === 'available'); // available for deadheading if we add it

  // Process available contracts expiration & dynamic rotation
  if (nextState.availableContracts && nextState.availableContracts.length > 0) {
    nextState.availableContracts = nextState.availableContracts.map(c => {
      if (c.status === 'available') {
        const total = c.expirySecondsTotal ?? SIMULATION_CONFIG.contracts.simulation.expiryDefaultSeconds;
        const remaining = (c.expirySecondsRemaining ?? total) - deltaSeconds;
        return { ...c, expirySecondsRemaining: Math.max(0, remaining) };
      }
      return c;
    }).filter(c => c.status !== 'available' || (c.expirySecondsRemaining ?? 1) > 0);

    // If available contracts drop below 8, generate new ones dynamically
    if (nextState.availableContracts.length < 8) {
      const newContract = generateRandomContract(nextState.companyLevel, nextState.commodityPrices, nextState.unlockedRegions, Math.random() < SIMULATION_CONFIG.contracts.simulation.urgentContractChance);
      nextState.availableContracts.push(newContract);
    }
  }

  // -------------------------------------------------------------
  // Global Calendar & Time Progression (Day/Night & Monthly Billing)
  // -------------------------------------------------------------
  nextState.gameHour += gameDeltaHours;
  nextState.isDaytime = nextState.gameHour >= SIMULATION_CONFIG.time.daytimeStartHour && nextState.gameHour < SIMULATION_CONFIG.time.daytimeEndHour;

  let triggeredMonthlyBilling = false;
  if (nextState.gameHour >= 24.0) {
    nextState.gameHour -= 24.0;
    nextState.gameDay += 1;

    // Weekly Shipper Retainer Payout (every 7 days)
    if (nextState.gameDay % 7 === 0 && nextState.shipperRetainers && nextState.shipperRetainers.length > 0) {
      let totalRetainerIncome = 0;
      nextState.shipperRetainers.forEach(retainer => {
        if (retainer.status === 'active' && retainer.durationWeeksRemaining > 0) {
          totalRetainerIncome += retainer.weeklyPayout;
          retainer.durationWeeksRemaining -= 1;
          if (retainer.durationWeeksRemaining <= 0) {
            retainer.status = 'completed';
          }
        }
      });
      if (totalRetainerIncome > 0) {
        nextState.cash += totalRetainerIncome;
        newEvents.push({
          id: `retainer-weekly-${Date.now()}`,
          timestamp: Date.now(),
          title: `💼 Weekly Shipper Retainer Payout`,
          message: `Received guaranteed weekly retainer revenue from corporate logistics contracts (+$${totalRetainerIncome.toLocaleString()}).`,
          type: 'success',
          cashChange: totalRetainerIncome
        });
      }
    }

    // True Monthly Billing on the 1st of every month (30-day billing cycle)
    if (
      nextState.gameDay >
      SIMULATION_CONFIG.finance.calendar.daysPerMonth
    ) {
      nextState.gameDay = 1;
      nextState.gameMonth += 1;
      if (
        nextState.gameMonth >
        SIMULATION_CONFIG.finance.calendar.monthsPerYear
      ) {
        nextState.gameMonth = 1;
        nextState.gameYear += 1;
      }
      triggeredMonthlyBilling = true;
    }
  }

  // Monthly Billing Settlement Execution on the 1st of the Month
  if (triggeredMonthlyBilling) {
    // Record history
    if (!nextState.stats.revenueHistory) nextState.stats.revenueHistory = [];
    if (!nextState.stats.expenseHistory) nextState.stats.expenseHistory = [];
    
    // Last month stats
    const lastMonthRevenue = nextState.activeContracts
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + c.payoutCash, 0); // This isn't perfect as we clear them, but we have accounting history anyway
    
    // We'll use the financial history which is already being recorded
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const periodName = `${monthNames[nextState.gameMonth]} ${nextState.gameYear}`;

    // 1. Driver Full Monthly Salaries (Daily salary × 30 days)
    const totalDriverMonthlySalaries = nextState.drivers.reduce((sum, d) => sum + Math.round(
          d.dailySalary * SIMULATION_CONFIG.finance.salaries.driverDaysPerMonth
        ), 0);

    // 2. Office Staff Monthly Salaries
    const totalStaffSalaries = nextState.staff?.reduce((sum, s) => sum + s.salaryMonthly, 0) || 0;

    // 3. Fleet Insurance (Billed based on professional coverage tiers)
    const baseInsurancePerTruck = nextState.profile?.insuranceMonthlyPerTruck || 420;
    const safetyDiscountFactor = Math.max(SIMULATION_CONFIG.maintenance.insurance.minimumInsuranceDiscountFactor, 1 - (safetyStaffBonus / SIMULATION_CONFIG.general.staffBonusPercentBase));

    let totalInsuranceExpenses = 0;
    nextState.trucks.forEach(t => {
      const tier = t.insuranceTier || (t.hasInsurance ? 'Standard Collision' : 'None');
      let multiplier = 0;
      if (tier === 'Liability Only') multiplier = 0.45;
      else if (tier === 'Standard Collision') multiplier = 1.0;
      else if (tier === 'Full Comprehensive') multiplier = 1.60;
      
      if (multiplier > 0) {
        totalInsuranceExpenses += Math.round(baseInsurancePerTruck * multiplier * safetyDiscountFactor);
      }
    });

    nextState.trailers.forEach(tr => {
      const tier = tr.insuranceTier || (tr.hasInsurance ? 'Standard Collision' : 'None');
      let multiplier = 0;
      if (tier === 'Liability Only') multiplier = 0.20;
      else if (tier === 'Standard Collision') multiplier = SIMULATION_CONFIG.maintenance.insurance.trailerRateMultiplier;
      else if (tier === 'Full Comprehensive') multiplier = SIMULATION_CONFIG.maintenance.insurance.trailerRateMultiplier * 1.5;

      if (multiplier > 0) {
        totalInsuranceExpenses += Math.round(baseInsurancePerTruck * multiplier * safetyDiscountFactor);
      }
    });

    // 4. Loan Monthly Payments & Interest Amortization
    let totalLoanPayment = 0;
    let totalLoanInterest = 0;
    const remainingLoans: BankLoan[] = [];

    (nextState.loans || []).forEach(loan => {
      const monthlyPmt = loan.monthlyPayment;
      const interestPortion = Math.round(loan.remainingBalance * (loan.interestRateAnnual / 12));
      const principalPortion = Math.max(0, monthlyPmt - interestPortion);

      totalLoanPayment += monthlyPmt;
      totalLoanInterest += interestPortion;
      loan.remainingBalance = Math.max(0, loan.remainingBalance - principalPortion);
      loan.remainingMonths = Math.max(0, loan.remainingMonths - 1);

      if (loan.remainingBalance > 10 && loan.remainingMonths > 0) {
        remainingLoans.push(loan);
      } else {
        newEvents.push({
          id: `loan-paid-${loan.id}-${Date.now()}`,
          timestamp: Date.now(),
          title: `Loan Fully Discharged!`,
          message: `Congratulations! ${loan.title} from ${loan.lenderName} has been paid off in full.`,
          type: 'success'
        });
      }
    });
    nextState.loans = remainingLoans;

    // 5. Corporate Taxes (With Accountant Tax Optimization)
    const baseTaxRate =
      nextState.profile?.corporateTaxRate ??
      SIMULATION_CONFIG.finance.tax.defaultCorporateRate;
    const accountantTaxFactor = Math.max(
      SIMULATION_CONFIG.finance.tax.minimumEffectiveRateMultiplier,
      1 - (accountantStaffBonus / SIMULATION_CONFIG.general.staffBonusPercentBase)
    );
    const effectiveTaxRate = +(baseTaxRate * accountantTaxFactor).toFixed(3);
    if (nextState.profile) {
      nextState.profile.corporateTaxRate = effectiveTaxRate;
    }

    const totalMonthlyExpenses = totalDriverMonthlySalaries + totalStaffSalaries + totalInsuranceExpenses + totalLoanPayment;

    // Deduct from Treasury
    nextState.cash -= totalMonthlyExpenses;
    nextState.totalSalariesPaid = (nextState.totalSalariesPaid || 0) + totalDriverMonthlySalaries + totalStaffSalaries;
    nextState.totalLoanInterestPaid = (nextState.totalLoanInterestPaid || 0) + totalLoanInterest;

    // Accountant Bookkeeping Savings: Tax Rebates
    let auditBonusCash = 0;
    if (
      accountantStaffBonus > 0 &&
      Math.random() < SIMULATION_CONFIG.finance.tax.accountantRebateChance
    ) {
      auditBonusCash = Math.round(
        totalStaffSalaries *
          SIMULATION_CONFIG.finance.tax.accountantRebateStaffSalaryMultiplier +
        accountantStaffBonus *
          SIMULATION_CONFIG.finance.tax.accountantRebateBonusPerSkill
      );
      nextState.cash += auditBonusCash;
      newEvents.push({
        id: `accountant-rebate-${Date.now()}`,
        timestamp: Date.now(),
        title: `Annual Tax Rebate & Depreciation Claim`,
        message: `Corporate accounting department successfully filed Form 1120, securing $${auditBonusCash.toLocaleString()} in fuel tax rebates and asset depreciation write-offs.`,
        type: 'success',
        cashChange: auditBonusCash
      });
    }

    // Safety Officer Bonus: Terminal Inspection
    if (safetyStaffBonus > 0) {
      if (nextState.profile) {
        nextState.profile.creditScore = Math.min(
          SIMULATION_CONFIG.finance.credit.maximumScore,
          (nextState.profile.creditScore || 720) +
            SIMULATION_CONFIG.finance.credit.safetyOfficerChange
        );
      }
    }

    // Credit Rating Updates
    if (nextState.profile) {
      if (nextState.cash >= 0) {
        nextState.profile.creditScore = Math.min(
          SIMULATION_CONFIG.finance.credit.maximumScore,
          (nextState.profile.creditScore || 720) +
            SIMULATION_CONFIG.finance.credit.positiveCashChange
        );
      } else {
        nextState.profile.creditScore = Math.max(
          SIMULATION_CONFIG.finance.credit.minimumScore,
          (nextState.profile.creditScore || 720) +
            SIMULATION_CONFIG.finance.credit.negativeCashChange
        );
        newEvents.push({
          id: `monthly-default-${Date.now()}`,
          timestamp: Date.now(),
          title: `Monthly Debt & Payroll Default!`,
          message: `Treasury balance is negative (-$${Math.abs(nextState.cash).toLocaleString()}). Missed monthly payroll and insurance obligations severely damaged corporate credit rating!`,
          type: 'danger'
        });
      }

      const score = nextState.profile.creditScore;
      if (score >= 800) nextState.profile.creditRating = 'AAA';
      else if (score >= 750) nextState.profile.creditRating = 'AA';
      else if (score >= 700) nextState.profile.creditRating = 'A';
      else if (score >= 650) nextState.profile.creditRating = 'BBB';
      else if (score >= 600) nextState.profile.creditRating = 'BB';
      else if (score >= 550) nextState.profile.creditRating = 'B';
      else if (score >= 500) nextState.profile.creditRating = 'CCC';
      else nextState.profile.creditRating = 'D';
    }

    // Append to Financial Statement History
    const stmt: FinancialStatementRecord = {
      id: `stmt-monthly-${Date.now()}`,
      timestamp: Date.now(),
      periodLabel: periodName,
      revenue: 0,
      fuelExpenses: 0,
      maintenanceExpenses: 0,
      driverSalaries: totalDriverMonthlySalaries,
      staffSalaries: totalStaffSalaries,
      insuranceExpenses: totalInsuranceExpenses,
      penaltyExpenses: 0,
      loanInterest: totalLoanInterest,
      taxesPaid: 0,
      netProfit: auditBonusCash - totalMonthlyExpenses,
      cashEndPeriod: nextState.cash
    };

    if (!nextState.financialHistory) nextState.financialHistory = [];
    nextState.financialHistory.unshift(stmt);
    if (nextState.financialHistory.length > 24) nextState.financialHistory.pop();

    newEvents.push({
      id: `monthly-settlement-event-${Date.now()}`,
      timestamp: Date.now(),
      title: `Monthly Financial Settlement: ${periodName}`,
      message: `Monthly Payroll ($${(totalDriverMonthlySalaries + totalStaffSalaries).toLocaleString()}), Insured Fleet ($${totalInsuranceExpenses.toLocaleString()}) & Loans ($${totalLoanPayment.toLocaleString()}) settled successfully.`,
      type: 'info',
      cashChange: -totalMonthlyExpenses
    });
  }

  // Keep logs capped at last 30 entries
  nextState.eventLogs = [...newEvents, ...nextState.eventLogs].slice(0, SIMULATION_CONFIG.contracts.simulation.eventLogLimit);

  // Replenish available contracts continuously (artificial infinite jobs auto creation system, scaled by Warehouse Level)
  if (!nextState.availableContracts) nextState.availableContracts = [];
  const maxContractListings = 8 + (nextState.depot?.warehouseLevel || 1) * 4;
  if (nextState.availableContracts.length < maxContractListings) {
    const lightBoxCount = nextState.availableContracts.filter(c => c.weightTons <= SIMULATION_CONFIG.contracts.simulation.lightBoxWeightThresholdTons && c.requiredTrailerType === 'Dry Van').length;
    const needLightBox = lightBoxCount < 2;

    const ownedTrailers = (nextState.trailers || []).map(t => t.type);
    const needed = maxContractListings - nextState.availableContracts.length;
    const existingTitles = new Set(nextState.availableContracts.map(c => c.title));
    for (let i = 0; i < needed; i++) {
      const forceLight = needLightBox && i < 2;
      const forcedTrailer = !forceLight && ownedTrailers.length > 0 && Math.random() < 0.5
        ? ownedTrailers[Math.floor(Math.random() * ownedTrailers.length)]
        : undefined;

      let newContract = generateRandomContract(nextState.companyLevel, nextState.commodityPrices, nextState.unlockedRegions, forceLight, forcedTrailer);
      let attempts = 0;
      while (existingTitles.has(newContract.title) && attempts < SIMULATION_CONFIG.contracts.simulation.duplicateGenerationAttempts) {
        newContract = generateRandomContract(nextState.companyLevel, nextState.commodityPrices, nextState.unlockedRegions, forceLight, forcedTrailer);
        attempts++;
      }
      existingTitles.add(newContract.title);
      nextState.availableContracts.push(newContract);
    }
  }

  return { nextState, events: newEvents };
}

export function calculateOfflineProgress(state: GameSaveState, offlineSeconds: number): { updatedState: GameSaveState; summary: OfflineProgressSummary } {
  // Apply the 1.5x game speed multiplier consistent with the real-time loop
  const speedMultiplier = SIMULATION_CONFIG.time.gameSpeedMultiplier;
  const gameSecondsToSimulate = offlineSeconds * speedMultiplier;
  
  // Cap offline progress at 12 hours of REAL time (which is 24 hours of game time)
  const capGameSeconds = Math.min(gameSecondsToSimulate, SIMULATION_CONFIG.time.maxSimulationHoursPerTick * SIMULATION_CONFIG.time.secondsPerHour * speedMultiplier); 
  const tickChunk = SIMULATION_CONFIG.time.simulationTickSeconds; // simulate in 30-second game intervals for faster processing of large windows
  let totalTicks = Math.floor(capGameSeconds / tickChunk);

  let currentSimState = JSON.parse(JSON.stringify(state)); // Clone once for the whole simulation
  const allEvents: RoadEventLog[] = [];
  let initialCash = state.cash;
  let initialMiles = state.stats.totalMilesDriven;
  let initialFuel = state.stats.fuelSpentGallons;
  let completedCount = 0;

  for (let i = 0; i < totalTicks; i++) {
    const { events } = processSimulationTick(currentSimState, tickChunk, false);
    allEvents.push(...events);
    completedCount += events.filter(e => e.title.startsWith('Delivery Complete')).length;
  }

  const summary: OfflineProgressSummary = {
    elapsedSeconds: offlineSeconds,
    completedContractsCount: completedCount,
    totalCashEarned: currentSimState.cash - initialCash,
    totalXpEarned: currentSimState.companyXp - state.companyXp,
    totalMilesDriven: currentSimState.stats.totalMilesDriven - initialMiles,
    totalFuelConsumedGallons: currentSimState.stats.fuelSpentGallons - initialFuel,
    events: allEvents
  };

  currentSimState.lastSavedTimestamp = Date.now();
  return { updatedState: currentSimState, summary };
}

export function getRefuelCost(litres: number, fuelTerminalLevel: number, marketPricePerLitre: number = SIMULATION_CONFIG.fuel.refuelBasePricePerLitre): number {
  const discountMultiplier = 1 - (fuelTerminalLevel * SIMULATION_CONFIG.fuel.refuelDiscountPerTerminalLevel); // 8% per level discount
  const finalPricePerLitre = marketPricePerLitre * Math.max(SIMULATION_CONFIG.fuel.minimumRefuelPriceMultiplier, discountMultiplier);
  return Math.floor(litres * finalPricePerLitre);
}
