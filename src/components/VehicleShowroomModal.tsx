import React, { useState } from 'react';
import type { Truck, Trailer } from '../types/game';
import { CATALOG_TRUCKS } from '../data/trucks';
import { CATALOG_TRAILERS } from '../data/trailers';
import { X, Gauge, Flame, Shield, Info, Zap, Box, Weight, Globe, DollarSign, Plus, FileText, ChevronRight } from 'lucide-react';

type CatalogTruck = typeof CATALOG_TRUCKS[0];
type CatalogTrailer = typeof CATALOG_TRAILERS[0];

interface VehicleShowroomModalProps {
  vehicle: CatalogTruck | CatalogTrailer;
  type: 'truck' | 'trailer';
  onClose: () => void;
  onBuy: (vehicle: any) => void;
  canAfford: boolean;
}

export const VehicleShowroomModal: React.FC<VehicleShowroomModalProps> = ({
  vehicle,
  type,
  onClose,
  onBuy,
  canAfford
}) => {
  const isTruck = type === 'truck';
  const truck = vehicle as CatalogTruck;
  const trailer = vehicle as CatalogTrailer;

  const [showFullSpecs, setShowFullSpecs] = useState(false);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in">
      {/* Full Specs Modal Overlay */}
      {showFullSpecs && (
        <div className="absolute inset-0 z-[70] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-black text-white">Full Attributes & Technical Specs</h3>
              </div>
              <button onClick={() => setShowFullSpecs(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Vehicle Name & Brand</span>
                <div className="text-lg font-bold text-white">{vehicle.name}</div>
                <div className="text-xs text-blue-400 font-semibold">{isTruck ? truck.brand : trailer.manufacturer} ({isTruck ? truck.region : 'Universal'})</div>
              </div>

              {isTruck ? (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30">
                    <span className="text-slate-500 block mb-0.5">Model Class</span>
                    <strong className="text-white font-mono">{truck.modelClass}</strong>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30">
                    <span className="text-slate-500 block mb-0.5">Curb Weight</span>
                    <strong className="text-white font-mono">{truck.curbWeightTons} Tons</strong>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30">
                    <span className="text-slate-500 block mb-0.5">Horsepower</span>
                    <strong className="text-amber-400 font-mono">{truck.horsepower} HP</strong>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30">
                    <span className="text-slate-500 block mb-0.5">Torque Rating</span>
                    <strong className="text-emerald-400 font-mono">{truck.engineSpecs?.torqueLbFt || truck.horsepower * 3} lb-ft</strong>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30">
                    <span className="text-slate-500 block mb-0.5">Engine Model</span>
                    <strong className="text-white">{truck.engineSpecs?.model || 'Commercial Diesel'}</strong>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30">
                    <span className="text-slate-500 block mb-0.5">Transmission</span>
                    <strong className="text-white">{truck.engineSpecs?.transmission || 'Automated'}</strong>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30">
                    <span className="text-slate-500 block mb-0.5">Sleeper Cab Type</span>
                    <strong className="text-white">{truck.sleeperCabType}</strong>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30">
                    <span className="text-slate-500 block mb-0.5">Fuel Tank Capacity</span>
                    <strong className="text-blue-400 font-mono">{truck.maxFuelLitres} Litres</strong>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30">
                    <span className="text-slate-500 block mb-0.5">Fuel Economy</span>
                    <strong className="text-emerald-400 font-mono">{truck.fuelEfficiencyMpg} MPG</strong>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30">
                    <span className="text-slate-500 block mb-0.5">Durability Rating</span>
                    <strong className="text-white font-mono">{truck.durabilityRating} / 100</strong>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30">
                    <span className="text-slate-500 block mb-0.5">Trailer Type</span>
                    <strong className="text-white font-mono">{trailer.type}</strong>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30">
                    <span className="text-slate-500 block mb-0.5">Payload Capacity</span>
                    <strong className="text-amber-400 font-mono">{trailer.capacityTons} Tons</strong>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30">
                    <span className="text-slate-500 block mb-0.5">Tare Weight</span>
                    <strong className="text-white font-mono">{trailer.tareWeightTons ?? 7.0} Tons</strong>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30">
                    <span className="text-slate-500 block mb-0.5">HazMat Certified</span>
                    <strong className={trailer.hazmatCertified ? 'text-emerald-400' : 'text-slate-400'}>
                      {trailer.hazmatCertified ? 'Yes (Class 1-9)' : 'No'}
                    </strong>
                  </div>
                </div>
              )}

              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-white block mb-1">Manufacturer Overview</span>
                {vehicle.description}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowFullSpecs(false)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition text-xs uppercase tracking-wider"
              >
                Close Specs
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-700/50 rounded-[2.5rem] max-w-3xl w-full shadow-2xl overflow-hidden relative flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[95vh]">
        
        {/* Visual / Image Side */}
        <div className="w-full md:w-1/2 bg-slate-950 flex flex-col relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(30,58,138,0.2),_transparent_70%)]" />
          
          <div className="p-8 flex-1 flex items-center justify-center relative">
            <img 
              src={vehicle.imageUrl || '/placeholder-vehicle.png'} 
              alt={vehicle.name}
              className="max-h-64 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform group-hover:scale-105 transition-transform duration-700"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
            {!vehicle.imageUrl && <div className="text-9xl grayscale opacity-20">{vehicle.imageIcon}</div>}
          </div>

          <div className="p-8 bg-slate-900/50 backdrop-blur-md border-t border-slate-800">
             <div className="flex items-center justify-between mb-4">
               <span className="text-xs font-mono font-black text-blue-400 tracking-[0.2em] uppercase">Manufacturer</span>
               <span className="text-white font-bold text-sm">{isTruck ? truck.brand : trailer.manufacturer}</span>
             </div>
             <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
               "{vehicle.description}"
             </p>
          </div>
        </div>

        {/* Details Side */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between space-y-8 overflow-y-auto">
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-mono">
                {isTruck ? truck.modelClass : 'Trailer Unit'}
              </span>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter leading-none mb-1">
              {vehicle.name}
            </h2>
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
               <Globe className="w-3 h-3" />
               <span>{isTruck ? truck.region : 'Universal Registration'}</span>
            </div>
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-2 gap-4">
            {isTruck ? (
              <>
                <div className="bg-slate-800/40 p-4 rounded-3xl border border-slate-700/30">
                  <div className="flex items-center space-x-2 text-amber-400 mb-1">
                    <Flame className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest font-mono">Power</span>
                  </div>
                  <div className="text-xl font-black text-white font-mono">{truck.horsepower} <span className="text-xs text-slate-500">HP</span></div>
                </div>
                <div className="bg-slate-800/40 p-4 rounded-3xl border border-slate-700/30">
                  <div className="flex items-center space-x-2 text-blue-400 mb-1">
                    <Gauge className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest font-mono">Range</span>
                  </div>
                  <div className="text-xl font-black text-white font-mono">{truck.maxFuelLitres} <span className="text-xs text-slate-500">L</span></div>
                </div>
                <div className="col-span-2 bg-slate-800/40 p-4 rounded-3xl border border-slate-700/30">
                   <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                     <Info className="w-4 h-4" />
                     <span className="text-[10px] font-black uppercase tracking-widest font-mono">Drivetrain</span>
                   </div>
                   <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Engine</span>
                        <span className="text-slate-200">{truck.engineSpecs?.model || 'Commercial Inline-6'}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Transmission</span>
                        <span className="text-slate-200">{truck.engineSpecs?.transmission || '12-Speed Automated'}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Torque</span>
                        <span className="text-slate-200">{truck.engineSpecs?.torqueLbFt || truck.horsepower * 3} lb-ft</span>
                      </div>
                   </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-slate-800/40 p-4 rounded-3xl border border-slate-700/30">
                  <div className="flex items-center space-x-2 text-amber-400 mb-1">
                    <Weight className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest font-mono">Payload</span>
                  </div>
                  <div className="text-xl font-black text-white font-mono">{trailer.capacityTons} <span className="text-xs text-slate-500">T</span></div>
                </div>
                <div className="bg-slate-800/40 p-4 rounded-3xl border border-slate-700/30">
                  <div className="flex items-center space-x-2 text-purple-400 mb-1">
                    <Box className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest font-mono">Class</span>
                  </div>
                  <div className="text-xl font-black text-white font-mono">{trailer.type.split(' ')[0]}</div>
                </div>
                <div className="col-span-2 bg-slate-800/40 p-4 rounded-3xl border border-slate-700/30 text-xs space-y-2">
                   <div className="flex justify-between font-bold">
                     <span className="text-slate-500">HazMat Certification</span>
                     <span className={trailer.hazmatCertified ? 'text-emerald-400' : 'text-slate-400'}>
                       {trailer.hazmatCertified ? 'Class 1-9 Certified' : 'Not Certified'}
                     </span>
                   </div>
                   <div className="flex justify-between font-bold">
                     <span className="text-slate-500">Body Type</span>
                     <span className="text-slate-200">{trailer.type}</span>
                   </div>
                </div>
              </>
            )}
          </div>

          {/* Pricing & CTA */}
          <div className="pt-6 border-t border-slate-800 space-y-3">
             <button
                onClick={() => setShowFullSpecs(true)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl transition flex items-center justify-center space-x-2 text-xs uppercase tracking-wider border border-slate-700/50 shadow-md"
             >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>View Full Attributes & Specs</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
             </button>

             <div className="flex items-end justify-between mb-4">
                <div>
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono block mb-1">Total Investment</span>
                   <div className="text-4xl font-black text-emerald-400 font-mono tracking-tighter">
                      ${vehicle.price.toLocaleString()}
                   </div>
                </div>
                {!canAfford && (
                  <div className="text-right text-[10px] font-bold text-rose-500 uppercase tracking-wider animate-pulse mb-1">
                    Insufficient Capital
                  </div>
                )}
             </div>

             <button
                onClick={() => {
                   onBuy(vehicle);
                   onClose();
                }}
                disabled={!canAfford}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-40 disabled:grayscale text-white font-black rounded-[1.5rem] transition-all duration-300 shadow-xl shadow-blue-900/40 flex items-center justify-center space-x-3 text-sm uppercase tracking-widest"
             >
                <Plus className="w-5 h-5" />
                <span>Confirm Acquisition</span>
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};
