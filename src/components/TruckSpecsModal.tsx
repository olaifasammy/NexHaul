import React from 'react';
import type { Truck } from '../types/game';
import { 
  Gauge, Truck as TruckIcon, ShieldCheck, Activity, Flame, 
  Scale, DollarSign, Wrench, X, Award, Wind, Zap, Cpu
} from 'lucide-react';

interface Props {
  truck: Truck;
  onClose: () => void;
  onToggleInsurance?: (truckId: string) => void;
  onTogglePrePass?: (truckId: string) => void;
}

const money = (n: number) => `$${Math.max(0, n).toLocaleString()}`;

export const TruckSpecsModal: React.FC<Props> = ({
  truck,
  onClose,
  onToggleInsurance,
  onTogglePrePass,
}) => {
  const cond = truck.conditionPercent ?? 100;
  const basePrice = truck.price || 120000;
  const estimatedValuation = Math.floor(basePrice * (cond / 100) * 0.78);
  const costPerMile = +(0.45 + (100 - cond) * 0.0015).toFixed(2);
  const curbWeight = truck.curbWeightTons || (truck.modelClass === 'Class 3 Light' ? 4.5 : 8.2);
  const gcwr = truck.gcwrTons || (truck.modelClass === 'Class 3 Light' ? 12 : 40);
  const idleBurn = truck.idleFuelBurnRateLitresPerHour || 2.2;
  const finalDrive = truck.finalDriveRatio || 3.42;
  const retarder = truck.retarderHp || (truck.horsepower || 400);
  const safety = truck.safetyScore || 92;
  const co2 = truck.co2GramsPerMile || 1250;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto no-scrollbar text-slate-100">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="text-4xl p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700">{truck.imageIcon || '🚚'}</div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {truck.modelClass || 'Class 8 Highway'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ID: {truck.id}</span>
              </div>
              <h2 className="text-lg font-black text-white mt-1">{truck.name}</h2>
              <p className="text-xs text-slate-400">{truck.brand} • VIN: <span className="font-mono text-slate-300">{truck.vin || '1HD99823X'}</span> • Plate: <span className="font-mono text-amber-300">{truck.licensePlate || 'TX-849-TR'}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real Photo / Visual Card */}
        {truck.imageUrl && (
          <div className="h-44 w-full rounded-2xl overflow-hidden relative border border-slate-800 bg-slate-950 flex items-center justify-center shadow-inner">
            <img 
              src={truck.imageUrl} 
              alt={truck.name} 
              className="w-full h-full object-contain object-center"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
              <span className="font-bold text-white bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-700">
                {truck.emissionsStandard || 'EPA 2024 (Tier 4)'}
              </span>
              <span className="font-bold text-emerald-400 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-700">
                {truck.axleConfig || '6x4 Tandem'}
              </span>
            </div>
          </div>
        )}

        {/* Section 1: Powertrain & Engine Engineering */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Cpu className="w-4 h-4" /> Powertrain & Performance Engineering
          </h3>
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 space-y-1">
              <span className="text-slate-400 block">Engine Model</span>
              <strong className="text-white text-sm block truncate">{truck.engineSpecs?.model || 'Inline-6 Turbo Diesel'}</strong>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 space-y-1">
              <span className="text-slate-400 block">Transmission</span>
              <strong className="text-white text-sm block truncate">{truck.engineSpecs?.transmission || '12-Speed Automated'}</strong>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 space-y-1">
              <span className="text-slate-400 block">Power Output</span>
              <strong className="text-amber-400 text-sm font-mono block">{truck.horsepower || 400} HP • {truck.engineSpecs?.torqueLbFt || (truck.horsepower || 400) * 3} lb-ft</strong>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 space-y-1">
              <span className="text-slate-400 block">Drivetrain & Retarder</span>
              <strong className="text-slate-200 text-sm font-mono block">Final Drive {finalDrive} • {retarder} HP Retarder</strong>
            </div>
          </div>
        </div>

        {/* Section 2: Operating Economics & Valuation */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4" /> Operating Economics & Valuation
          </h3>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 text-center">
              <span className="text-[10px] text-slate-400 block">Est. Market Value</span>
              <strong className="text-emerald-400 font-extrabold text-sm mt-0.5 block">{money(estimatedValuation)}</strong>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 text-center">
              <span className="text-[10px] text-slate-400 block">Cost Per Mile</span>
              <strong className="text-sky-400 font-extrabold text-sm mt-0.5 block">${costPerMile}/mi</strong>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 text-center">
              <span className="text-[10px] text-slate-400 block">Fuel Economy</span>
              <strong className="text-amber-300 font-extrabold text-sm mt-0.5 block">{truck.fuelEfficiencyMpg || 6.8} MPG</strong>
            </div>
          </div>
        </div>

        {/* Section 3: Weights, Axles & Capacities */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Scale className="w-4 h-4" /> Weights, Axles & Tank Capacities
          </h3>
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block">Curb / GCWR Weight</span>
                <strong className="text-white text-sm">{curbWeight} Tons / {gcwr} Tons Max</strong>
              </div>
              <Scale className="w-6 h-6 text-sky-400" />
            </div>
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block">Fuel & DEF Tank</span>
                <strong className="text-white text-sm">{truck.maxFuelLitres || 850} L / {truck.maxDefLitres || 90} L</strong>
              </div>
              <Flame className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Section 4: Safety, Emissions & Cabin Comfort */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <Award className="w-4 h-4" /> Safety, Emissions & Driver Comfort
          </h3>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 text-center">
              <span className="text-[10px] text-slate-400 block">Safety Score</span>
              <strong className="text-emerald-400 font-bold text-sm block">{safety}/100</strong>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 text-center">
              <span className="text-[10px] text-slate-400 block">CO2 Footprint</span>
              <strong className="text-slate-200 font-mono text-xs block mt-0.5">{co2} g/mi</strong>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 text-center">
              <span className="text-[10px] text-slate-400 block">Idle Burn Rate</span>
              <strong className="text-amber-400 font-mono text-xs block mt-0.5">{idleBurn} L/hr</strong>
            </div>
          </div>
        </div>

        {/* Action / Close */}
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm rounded-2xl transition shadow-lg shadow-amber-500/20 active:scale-95"
        >
          Close Specifications
        </button>

      </div>
    </div>
  );
};
