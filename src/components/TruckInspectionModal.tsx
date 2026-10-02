import React, { useMemo, useState, useEffect } from 'react';
import type { GameSaveState, InsuranceCoverageTier } from '../types/game';
import { getMaintenanceQuote, type MaintenanceServiceKey } from '../engine/maintenancePricing';
import { SIMULATION_CONFIG } from '../config/simulation';
import {
  Wrench, Fuel, ShieldCheck, Radio, Truck, CheckCircle2,
  AlertTriangle, Clock, Droplet
} from 'lucide-react';

interface Props {
  state: GameSaveState;
  onApproveService: (truckId: string, services: string[], scheduleAfterJob: boolean) => void;
  onRefuelTruck: (truckId: string) => void;
  onRepairTruck: (truckId: string) => void;
  onFileInsuranceClaim: (truckId: string) => void;
  onInstallPrePass: (truckId: string) => void;
  onSetInsuranceTier: (truckId: string, tier: InsuranceCoverageTier) => void;
  initialTruckId?: string | null;
  onBack?: () => void;
}

const services: { key: MaintenanceServiceKey; label: string; field: keyof import('../types/game').Truck; unit: string }[] = [
  { key: 'oil', label: 'Engine oil', field: 'oilLifePercent', unit: '%' },
  { key: 'tires', label: 'Tires', field: 'tireTreadPercent', unit: '%' },
  { key: 'brakes', label: 'Brakes', field: 'brakeWearPercent', unit: '%' },
  { key: 'battery', label: 'Battery', field: 'batteryHealthPercent', unit: '%' },
  { key: 'suspension', label: 'Suspension', field: 'suspensionHealthPercent', unit: '%' },
  { key: 'def', label: 'DEF fluid', field: 'defLevelLitres', unit: ' L' },
  { key: 'body', label: 'Body / engine repair', field: 'conditionPercent', unit: '%' },
];

const money = (n: number) => `$${Math.max(0, n).toLocaleString()}`;
const pct = (n: number | undefined) => Math.max(0, Math.min(100, n ?? 100));

export const TruckInspectionModal: React.FC<Props> = ({
  state,
  onApproveService,
  onRefuelTruck,
  onRepairTruck,
  onFileInsuranceClaim,
  onInstallPrePass,
  onSetInsuranceTier,
  initialTruckId,
  onBack,
}) => {
  const trucks = state.trucks.filter(Boolean);
  const [selectedId, setSelectedId] = useState(
    (initialTruckId && trucks.some(t => t.id === initialTruckId)) ? initialTruckId : (trucks[0]?.id ?? '')
  );
  const [selectedServices, setSelectedServices] = useState<MaintenanceServiceKey[]>([]);
  const [scheduleAfterJob, setScheduleAfterJob] = useState(false);

  useEffect(() => {
    if (initialTruckId && trucks.some(t => t.id === initialTruckId)) {
      setSelectedId(initialTruckId);
    }
  }, [initialTruckId, state.trucks]);

  const truck = trucks.find(t => t.id === selectedId) ?? trucks[0];
  const quotes = useMemo(() => {
    if (!truck) return [];
    return services.map(s => ({ ...s, quote: getMaintenanceQuote(truck, s.key) }));
  }, [truck]);

  const totalCost = quotes
    .filter(q => selectedServices.includes(q.key))
    .reduce((sum, q) => sum + q.quote.cost, 0);
  const totalTime = quotes
    .filter(q => selectedServices.includes(q.key))
    .reduce((sum, q) => sum + q.quote.timeSecs, 0);

  if (!truck) {
    return <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-slate-300">
      <Truck className="mb-2 h-6 w-6 text-amber-400" />
      <h2 className="text-lg font-bold text-white">Vehicle Maintenance</h2>
      <p className="mt-2 text-sm">You don't own any trucks yet. Purchase a truck to manage its maintenance.</p>
    </section>;
  }

  const currentFuel = truck.currentFuelLitres ?? 0;
  const maxFuel = truck.maxFuelLitres || 850;
  const fuelPct = maxFuel > 0 ? Math.min(100, currentFuel / maxFuel * 100) : 0;
  const defMax = truck.maxDefLitres || SIMULATION_CONFIG.fuel.defaultTankCapacityLitres;
  const defCurrent = truck.defLevelLitres ?? 0;
  const claimMinimum = SIMULATION_CONFIG.maintenance.condition.insuranceClaimMinimumPercent;
  const claimEligible = truck.hasInsurance &&
    (truck.conditionPercent < claimMinimum || truck.status === 'breakdown');
  const prePassCost = SIMULATION_CONFIG.compliance.prePass.installationCost;
  const blocked = truck.status === 'maintenance' || truck.scheduledMaintenanceAfterJob === true;
  const canSchedule = Boolean(truck.assignedContractId || truck.status === 'in_transit');

  const toggleService = (key: MaintenanceServiceKey) => {
    setSelectedServices(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="space-y-4 pb-3 text-slate-100">
      <header className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400">
            <Wrench className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Workshop</span>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1"
            >
              <span>← Back</span>
            </button>
          )}
        </div>
        <h1 className="mt-1 text-2xl font-black">Vehicle Maintenance</h1>
        <p className="mt-1 text-sm text-slate-400">Service, repair, refuel, and protect your fleet.</p>
        <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-slate-400">Select truck</label>
        <select
          value={truck.id}
          onChange={e => {
            setSelectedId(e.target.value);
            setSelectedServices([]);
            setScheduleAfterJob(false);
          }}
          className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm font-semibold text-white"
        >
          {trucks.map(t => (
            <option key={t.id} value={t.id}>
              {t.name} (ID: {t.id}) · {t.status.replace('_', ' ')}
            </option>
          ))}
        </select>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-400">Company cash</span>
          <strong className="text-emerald-400">{money(state.cash)}</strong>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 flex items-center gap-2 font-bold"><Wrench className="h-4 w-4 text-amber-400" /> Service condition</h2>
        <div className="space-y-3">
          {quotes.map(q => {
            const raw = truck[q.field];
            const value = q.key === 'def'
              ? `${Math.round(Number(raw ?? 0))} / ${defMax} L`
              : `${Math.round(pct(Number(raw)))}%`;
            const percent = q.key === 'def'
              ? (defMax > 0 ? Math.min(100, Number(raw ?? 0) / defMax * 100) : 100)
              : pct(Number(raw));
            const needs = q.quote.cost > 0 || q.quote.timeSecs > 0;
            return (
              <label key={q.key} className="block cursor-pointer">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{q.label}</span>
                  <span className={percent < 30 ? 'text-rose-400' : percent < 65 ? 'text-amber-300' : 'text-slate-300'}>{value}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className={`h-full rounded-full ${percent < 30 ? 'bg-rose-500' : percent < 65 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${percent}%` }} />
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{needs ? `${money(q.quote.cost)} · ${Math.ceil(q.quote.timeSecs / 60)} min` : 'No service needed'}</span>
                  <input
                    type="checkbox"
                    disabled={!needs || blocked}
                    checked={selectedServices.includes(q.key)}
                    onChange={() => toggleService(q.key)}
                    className="h-4 w-4 accent-amber-400"
                  />
                </div>
              </label>
            );
          })}
        </div>

        {canSchedule && (
          <label className="mt-4 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 p-3 text-sm">
            <input type="checkbox" checked={scheduleAfterJob} onChange={e => setScheduleAfterJob(e.target.checked)} className="accent-amber-400" />
            Schedule service after current delivery
          </label>
        )}

        <div className="mt-4 rounded-xl bg-slate-800 p-3">
          <div className="flex justify-between text-sm"><span className="text-slate-400">Estimated total</span><strong>{money(totalCost)}</strong></div>
          <div className="mt-1 flex justify-between text-sm"><span className="text-slate-400">Estimated service time</span><strong>{Math.ceil(totalTime / 60)} min</strong></div>
          {blocked && <p className="mt-2 text-xs text-amber-300">This truck is already in service or has maintenance scheduled.</p>}
          {!blocked && totalCost > state.cash && <p className="mt-2 text-xs text-rose-300">Insufficient cash for this service order.</p>}
          <button
            disabled={blocked || selectedServices.length === 0 || totalCost <= 0 || totalTime <= 0 || totalCost > state.cash || (scheduleAfterJob && !canSchedule)}
            onClick={() => {
              onApproveService(truck.id, selectedServices, scheduleAfterJob);
              setSelectedServices([]);
            }}
            className="mt-3 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-extrabold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Approve service order
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 flex items-center gap-2 font-bold"><Fuel className="h-4 w-4 text-sky-400" /> Depot fuel</h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Truck fuel</span>
          <strong>{Math.floor(currentFuel).toLocaleString()} / {Math.floor(maxFuel).toLocaleString()} L</strong>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-sky-400" style={{ width: `${fuelPct}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-400">Company storage</span>
          <strong>{Math.floor(state.bulkFuelReserveLitres || 0).toLocaleString()} L</strong>
        </div>
        <button
          disabled={currentFuel >= maxFuel || (state.bulkFuelReserveLitres || 0) < maxFuel - currentFuel}
          onClick={() => onRefuelTruck(truck.id)}
          className="mt-3 w-full rounded-xl border border-sky-700 bg-sky-950/60 px-4 py-3 text-sm font-bold text-sky-200 disabled:opacity-40"
        >
          <span className="inline-flex items-center justify-center gap-2"><Droplet className="h-4 w-4" /> Refill from storage tank</span>
        </button>
        <p className="mt-2 text-xs text-slate-500">Uses stored diesel; no additional cash charge. Storage must contain enough fuel to fill the truck.</p>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Professional Insurance Policy</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Coverage Tier</span>
            <select
              value={truck.insuranceTier || (truck.hasInsurance ? 'Standard Collision' : 'None')}
              onChange={(e) => onSetInsuranceTier(truck.id, e.target.value as any)}
              className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
            >
              <option value="None">None (Uninsured)</option>
              <option value="Liability Only">Liability Only (Third-Party)</option>
              <option value="Standard Collision">Standard Collision (80% / $500 Deductible)</option>
              <option value="Full Comprehensive">Full Comprehensive (100% / $0 Deductible)</option>
            </select>
          </div>
          <div className="rounded-xl bg-slate-800 p-3 text-xs text-slate-400 space-y-1">
            <div>Monthly Premium: <strong className="text-amber-400 font-mono">${Math.round((state.profile?.insuranceMonthlyPerTruck || 420) * (truck.insuranceTier === 'Liability Only' ? 0.45 : truck.insuranceTier === 'Full Comprehensive' ? 1.60 : truck.insuranceTier === 'None' ? 0 : 1.0))}</strong></div>
            <div>Claim Threshold: Below {claimMinimum}% condition or breakdown</div>
          </div>
        </div>
        <button
          disabled={!claimEligible || (truck.insuranceTier === 'None' || truck.insuranceTier === 'Liability Only') || state.cash < (truck.insuranceTier === 'Full Comprehensive' ? 0 : SIMULATION_CONFIG.maintenance.insurance.deductible)}
          onClick={() => onFileInsuranceClaim(truck.id)}
          className="mt-3 w-full rounded-xl bg-emerald-700 hover:bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-40 transition"
        >
          File insurance claim
        </button>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 flex items-center gap-2 font-bold"><Radio className="h-4 w-4 text-violet-400" /> PrePass compliance</h2>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{truck.hasPrePass ? 'Installed' : 'Not installed'}</p>
            <p className="text-xs text-slate-400">Installation: {money(prePassCost)}</p>
          </div>
          {truck.hasPrePass ? (
            <span className="rounded-lg bg-emerald-950 px-3 py-2 text-xs font-bold text-emerald-300">Active</span>
          ) : (
            <button
              disabled={state.cash < prePassCost}
              onClick={() => onInstallPrePass(truck.id)}
              className="rounded-lg bg-violet-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
            >
              Install
            </button>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-500">
        <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> Service orders are processed by the existing repair-bay simulation.</div>
        <div className="mt-1 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> For a direct full-condition repair, use the existing repair action in the Garage.</div>
      </section>
    </div>
  );
};
