import React, { useMemo, useState } from 'react';
import type { Truck } from '../types/game';
import {
  X, Wrench, Droplets, Disc3, ShieldCheck, Battery,
  Gauge, Fuel, Settings, Truck as TruckIcon, Scale,
  Check, AlertTriangle, ArrowRight
} from 'lucide-react';

interface ServiceApprovalModalProps {
  truck: Truck;
  onClose: () => void;
  onApproveService: (
    truckId: string,
    selectedServices: string[],
    scheduleAfterJob: boolean
  ) => void;
  playerCash: number;
}

type Service = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  field?: keyof Truck;
  unit?: string;
  cost?: number;
};

const services: Service[] = [
  {
    id: 'oil',
    title: 'Engine Oil Change',
    description: 'Restore oil life and protect the engine from wear.',
    icon: Droplets,
    color: 'amber',
    field: 'oilLifePercent',
    unit: '% life',
  },
  {
    id: 'tires',
    title: 'Tire Replacement',
    description: 'Restore tread depth for traction and blowout prevention.',
    icon: Disc3,
    color: 'blue',
    field: 'tireTreadPercent',
    unit: '% tread',
  },
  {
    id: 'brakes',
    title: 'Brake Pad Service',
    description: 'Restore braking performance and safe stopping distance.',
    icon: Gauge,
    color: 'rose',
    field: 'brakeWearPercent',
    unit: '% health',
  },
  {
    id: 'battery',
    title: 'Battery Replacement',
    description: 'Prevent electrical faults and starting problems.',
    icon: Battery,
    color: 'emerald',
    field: 'batteryHealthPercent',
    unit: '% health',
  },
  {
    id: 'suspension',
    title: 'Suspension Overhaul',
    description: 'Restore steering response, stability, and handling.',
    icon: Settings,
    color: 'violet',
    field: 'suspensionHealthPercent',
    unit: '% health',
  },
  {
    id: 'def',
    title: 'DEF Fluid Refill',
    description: 'Refill diesel exhaust fluid for emissions compliance.',
    icon: Droplets,
    color: 'cyan',
    field: 'defLevelLitres',
    unit: 'L',
  },
  {
    id: 'body',
    title: 'Body & Engine Repair',
    description: 'Repair collision damage and restore vehicle condition.',
    icon: Wrench,
    color: 'orange',
    field: 'conditionPercent',
    unit: '% condition',
  },
  {
    id: 'refuel',
    title: 'Refueling',
    description: 'Fill the fuel tanks using depot wholesale storage.',
    icon: Fuel,
    color: 'lime',
    field: 'currentFuelLitres',
    unit: 'L',
  },
  {
    id: 'insurance',
    title: 'Fleet Protection',
    description: 'Insurance covers 80% of accident repairs. Claims have a $250 deductible.',
    icon: ShieldCheck,
    color: 'sky',
  },
  {
    id: 'prepass',
    title: 'PrePass Weigh Bypass',
    description: 'Automatically bypass weigh stations for $50/month.',
    icon: Scale,
    color: 'fuchsia',
  },
];

const colorStyles: Record<string, string> = {
  amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  rose: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  violet: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  cyan: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  lime: 'text-lime-400 bg-lime-400/10 border-lime-400/20',
  sky: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  fuchsia: 'text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/20',
};

const readNumber = (truck: Truck, field?: keyof Truck) => {
  if (!field) return null;
  const value = truck[field];
  return typeof value === 'number' ? value : null;
};

export const ServiceApprovalModal: React.FC<ServiceApprovalModalProps> = ({
  truck,
  onClose,
  onApproveService,
  playerCash,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [scheduleAfterJob, setScheduleAfterJob] = useState(false);

  const toggleService = (id: string) => {
    setSelected(current =>
      current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id]
    );
  };

  const selectedCount = selected.length;

  const statusFor = (service: Service) => {
    if (service.id === 'insurance') {
      return (truck as any).hasInsurance ? 'ACTIVE' : 'NOT ACTIVE';
    }
    if (service.id === 'prepass') {
      return (truck as any).hasPrePass ? 'INSTALLED' : 'NOT INSTALLED';
    }
    const value = readNumber(truck, service.field);
    if (value === null) return 'CHECK STATUS';
    if (service.id === 'def' || service.id === 'refuel') {
      return `${value.toFixed(0)} ${service.unit}`;
    }
    return `${value.toFixed(0)}%`;
  };

  const getProgress = (service: Service) => {
    const value = readNumber(truck, service.field);
    if (value === null) return null;
    if (service.id === 'def') {
      const max = (truck as any).defCapacityLitres;
      return typeof max === 'number' && max > 0
        ? Math.min(100, (value / max) * 100)
        : null;
    }
    if (service.id === 'refuel') {
      const max = (truck as any).fuelCapacityLitres;
      return typeof max === 'number' && max > 0
        ? Math.min(100, (value / max) * 100)
        : null;
    }
    return Math.max(0, Math.min(100, value));
  };

  const selectedServices = services.filter(service => selected.includes(service.id));
  const estimatedCost = selectedServices.reduce((total, service) => {
    if (service.id === 'refuel') return total;
    if (service.id === 'insurance' || service.id === 'prepass') return total;
    return total;
  }, 0);

  const canSubmit = selectedCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-md sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-2xl">
              {truck.imageIcon || '🚛'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-lg font-black tracking-tight text-white">
                  Service Center
                </h2>
                <span className="hidden rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400 sm:inline">
                  Fleet workshop
                </span>
              </div>
              <p className="truncate text-xs text-slate-400">{truck.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close service center"
            className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 border-b border-slate-800 bg-slate-950/40 px-5 py-3 sm:grid-cols-3 sm:px-7">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Available cash</p>
            <p className="mt-1 text-sm font-black tabular-nums text-emerald-400">
              ${playerCash.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Selected services</p>
            <p className="mt-1 text-sm font-black text-white">{selectedCount} <span className="font-medium text-slate-500">/ 10</span></p>
          </div>
          <div className="col-span-2 sm:col-span-1 sm:text-right">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Truck status</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Ready for inspection
            </p>
          </div>
        </div>

        {/* Service list */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-white">Maintenance & protection</h3>
              <p className="mt-1 text-xs text-slate-500">Select the services you want to request.</p>
            </div>
            <button
              onClick={() => setSelected(selected.length === services.length ? [] : services.map(s => s.id))}
              className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300"
            >
              {selected.length === services.length ? 'Clear all' : 'Select all'}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {services.map(service => {
              const Icon = service.icon;
              const active = selected.includes(service.id);
              const progress = getProgress(service);
              const status = statusFor(service);
              const installed = service.id === 'insurance'
                ? Boolean((truck as any).hasInsurance)
                : service.id === 'prepass'
                  ? Boolean((truck as any).hasPrePass)
                  : false;

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service.id)}
                  className={`group relative rounded-xl border p-3.5 text-left transition ${
                    active
                      ? 'border-cyan-500/60 bg-cyan-500/[0.07] ring-1 ring-cyan-500/20'
                      : 'border-slate-800 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${colorStyles[service.color]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-extrabold text-slate-100">{service.title}</h4>
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                          active
                            ? 'border-cyan-400 bg-cyan-400 text-slate-950'
                            : 'border-slate-600 bg-slate-900/60 text-transparent group-hover:border-slate-400'
                        }`}>
                          <Check className="h-3 w-3" />
                        </span>
                      </div>
                      <p className="mt-1 min-h-[30px] text-[10px] leading-relaxed text-slate-400">
                        {service.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${
                          installed ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          {status}
                        </span>
                        {service.id === 'refuel' ? (
                          <span className="text-[9px] font-bold text-lime-400">DEPOT · FREE</span>
                        ) : service.id === 'insurance' ? (
                          <span className="text-[9px] font-bold text-sky-400">$250 deductible</span>
                        ) : service.id === 'prepass' ? (
                          <span className="text-[9px] font-bold text-fuchsia-400">$50 / month</span>
                        ) : (
                          <span className="text-[9px] font-semibold text-slate-500">Wear-based quote</span>
                        )}
                      </div>
                      {progress !== null && (
                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-700/70">
                          <div
                            className={`h-full rounded-full transition-all ${
                              progress <= 20 ? 'bg-rose-400' : progress <= 50 ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/15 bg-amber-500/[0.04] p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-[10px] leading-relaxed text-slate-400">
              Final service prices are calculated by the maintenance system. Refueling uses depot bulk storage at no cash cost.
            </p>
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800 bg-slate-800/30 p-3">
            <input
              type="checkbox"
              checked={scheduleAfterJob}
              onChange={event => setScheduleAfterJob(event.target.checked)}
              className="h-4 w-4 accent-cyan-400"
            />
            <span className="text-xs font-semibold text-slate-300">
              Schedule selected services after the current job
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-800 bg-slate-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-xs font-bold text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onApproveService(truck.id, selected, scheduleAfterJob)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-xs font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Request {selectedCount ? `${selectedCount} service${selectedCount === 1 ? '' : 's'}` : 'service'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
