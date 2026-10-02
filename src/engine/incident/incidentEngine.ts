import type { Truck, Driver, WeatherType, RoadEventLog } from '../../types/game';
import type { AccidentSeverity } from './incidentTypes';

let lastIncidentTimestamp = 0;

/**
 * Evaluates realistic roadside incidents based on actual physical factors:
 * - Driver fatigue (falling asleep at the wheel)
 * - Worn brakes (catastrophic brake failure)
 * - Bald tires in freezing blizzards or heavy rain
 * - Mechanical neglect (critically low condition)
 * 
 * GUARANTEE: Well-maintained vehicles with alert drivers NEVER spontaneously break down.
 * Fleet-wide cooldown guarantees incidents never strike multiple en-route trucks simultaneously.
 */
export function evaluateRoadsideIncidents(
  truck: Truck,
  driver: Driver,
  weather: WeatherType,
  milesThisTick: number,
  deltaSeconds: number
): { events: RoadEventLog[]; cashPenalty: number; contractFailed: boolean; truckDamage: number } {
  const events: RoadEventLog[] = [];
  let cashPenalty = 0;
  let contractFailed = false;
  let truckDamage = 0;

  // Enforce fleet-wide incident cooldown (minimum 2 minutes between fleet incidents)
  const now = Date.now();
  if (now - lastIncidentTimestamp < 120000) {
    return { events, cashPenalty, contractFailed, truckDamage };
  }

  const brakes = truck.brakeWearPercent ?? 100;
  const tires = truck.tireTreadPercent ?? 100;
  const condition = truck.conditionPercent ?? 100;
  const driverSkill = driver.skillLevel || 1;
  const fatigue = driver.fatiguePercent || 0;

  // 1. WELL-MAINTAINED VEHICLE IMMUNITY:
  // If truck has acceptable mechanical condition, good brakes, good tires, and driver is alert,
  // the vehicle is safe and will NOT randomly break down or crash.
  const isVehicleMaintained = condition >= 30 && brakes >= 25 && tires >= 25;
  const isDriverAlert = fatigue <= 75;

  if (isVehicleMaintained && isDriverAlert) {
    return { events, cashPenalty, contractFailed, truckDamage };
  }

  // 2. REALISTIC TRIGGER FACTORS:
  let riskFactor = 0;
  let triggerReason = '';

  if (fatigue > 85) {
    riskFactor += 0.00008 * ((fatigue - 85) / 15);
    triggerReason = 'severe driver fatigue and microsleep at the wheel';
  }

  if (brakes < 15) {
    riskFactor += 0.00010 * ((15 - brakes) / 15);
    triggerReason = 'catastrophic brake failure and lack of stopping distance';
  }

  if (tires < 20 && (weather === 'Blizzard Warning' || weather === 'Heavy Rain')) {
    riskFactor += 0.00008 * ((20 - tires) / 20);
    triggerReason = `bald tires hydroplaning on slick ${weather} roadway`;
  }

  if (condition < 15) {
    riskFactor += 0.00008 * ((15 - condition) / 15);
    triggerReason = 'severe structural wear and critical component failure';
  }

  if (riskFactor <= 0) {
    return { events, cashPenalty, contractFailed, truckDamage };
  }

  // Driver skill mitigates risk (experienced drivers react and correct skids)
  const skillFactor = Math.max(0.25, 1 - (driverSkill * 0.07));
  const finalProbability = riskFactor * skillFactor * deltaSeconds;

  if (Math.random() < finalProbability) {
    lastIncidentTimestamp = now;

    let severity: AccidentSeverity = 'small';
    if (fatigue > 90 || brakes < 8) {
      severity = Math.random() < 0.35 ? 'fatal' : 'medium';
    } else if (tires < 12 || condition < 10) {
      severity = Math.random() < 0.5 ? 'medium' : 'small';
    }

    if (severity === 'fatal') {
      truckDamage = 35 + Math.random() * 15; // 35-50% damage
      cashPenalty = 950;
      contractFailed = Math.random() < 0.25;
      events.push({
        id: `accident-fatal-${now}`,
        timestamp: now,
        title: `🚨 Highway Incident: ${truck.name}`,
        message: `${driver.name} experienced a collision due to ${triggerReason}. Rig sustained structural damage (-${Math.round(truckDamage)}%), $${cashPenalty} police citation issued.${contractFailed ? ' Cargo damaged. Contract breached.' : ''}`,
        type: 'danger',
        cashChange: -cashPenalty
      });
    } else if (severity === 'medium') {
      truckDamage = 18 + Math.random() * 12; // 18-30% damage
      cashPenalty = 450;
      events.push({
        id: `accident-med-${now}`,
        timestamp: now,
        title: `⚠️ Road Collision: ${truck.name}`,
        message: `${driver.name} was involved in a moderate road mishap caused by ${triggerReason}. Rig damage sustained (-${Math.round(truckDamage)}%), $${cashPenalty} towing/police fee issued.`,
        type: 'danger',
        cashChange: -cashPenalty
      });
    } else {
      truckDamage = 8 + Math.random() * 8; // 8-16% damage
      cashPenalty = 150;
      events.push({
        id: `accident-small-${now}`,
        timestamp: now,
        title: `⚠️ Minor Traffic Incident: ${truck.name}`,
        message: `${driver.name} suffered a minor roadside scrape/curb strike caused by ${triggerReason}. Minor vehicle wear (-${Math.round(truckDamage)}%).`,
        type: 'warning',
        cashChange: -cashPenalty
      });
    }
  }

  return { events, cashPenalty, contractFailed, truckDamage };
}
