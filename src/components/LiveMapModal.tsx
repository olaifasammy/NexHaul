import { RealMapCanvas } from './RealMapCanvas';
import React, { useState } from 'react';
import type { GameSaveState } from '../types/game';
import { X, ZoomIn, ZoomOut, RotateCcw, Navigation, MapPin, Truck as TruckIcon, Shield, Fuel, Globe } from 'lucide-react';

interface LiveMapModalProps {
  state: GameSaveState;
  onClose: () => void;
}

// Simulated coordinates for key cities per region for vector map plotting
export const CITY_COORDS: Record<string, { x: number; y: number; region: string }> = {
  // America
  'Chicago Hub': { x: 300, y: 180, region: 'America' },
  'Chicago Interchange': { x: 300, y: 180, region: 'America' },
  'Milwaukee Depot': { x: 290, y: 160, region: 'America' },
  'Detroit Logistics Park': { x: 340, y: 175, region: 'America' },
  'Dallas Logistics': { x: 240, y: 320, region: 'America' },
  'Fort Worth Rail': { x: 230, y: 325, region: 'America' },
  'Los Angeles Hub': { x: 100, y: 280, region: 'America' },
  'Seattle Port': { x: 110, y: 100, region: 'America' },
  'Atlanta Railhead': { x: 360, y: 300, region: 'America' },
  'New York Wharf': { x: 420, y: 165, region: 'America' },
  'Miami Terminals': { x: 400, y: 410, region: 'America' },
  'Houston Terminal': { x: 260, y: 360, region: 'America' },
  'Denver Terminal': { x: 180, y: 220, region: 'America' },
  'Phoenix Interchange': { x: 140, y: 310, region: 'America' },
  'Portland Dock': { x: 105, y: 120, region: 'America' },
  'San Francisco Wharf': { x: 90, y: 250, region: 'America' },
  'Silicon Valley Cluster': { x: 95, y: 255, region: 'America' },
  'Dallas Data Fortress': { x: 240, y: 320, region: 'America' },
  'Houston Chem Complex': { x: 265, y: 365, region: 'America' },
  'Atlanta Processing Hub': { x: 360, y: 300, region: 'America' },
  'Newark Port': { x: 415, y: 168, region: 'America' },
  'Harrisburg Logistics Park': { x: 395, y: 172, region: 'America' },
  'Baltimore Marine Terminal': { x: 398, y: 185, region: 'America' },
  'Philadelphia Wharf': { x: 410, y: 175, region: 'America' },
  'Pittsburgh Steel Complex': { x: 375, y: 180, region: 'America' },
  'Boston Freight Hub': { x: 440, y: 145, region: 'America' },
  'Albany Interchange': { x: 425, y: 148, region: 'America' },
  'Indianapolis Logistics Center': { x: 330, y: 195, region: 'America' },
  'Columbus Inland Port': { x: 350, y: 190, region: 'America' },
  'Louisville Air Hub': { x: 335, y: 215, region: 'America' },
  'Memphis Distribution Hub': { x: 305, y: 260, region: 'America' },
  'Kansas City Intermodal': { x: 275, y: 210, region: 'America' },
  'St. Louis River Terminal': { x: 305, y: 215, region: 'America' },
  'Cleveland Industrial Hub': { x: 365, y: 170, region: 'America' },
  'Minneapolis Railhead': { x: 285, y: 140, region: 'America' },
  'Savannah Garden City Terminal': { x: 370, y: 320, region: 'America' },
  'New Orleans Gulf Terminal': { x: 305, y: 385, region: 'America' },
  'Jacksonville Port': { x: 375, y: 360, region: 'America' },
  'Mobile Port': { x: 325, y: 365, region: 'America' },
  'Nashville Music & Freight Hub': { x: 330, y: 250, region: 'America' },
  'Charlotte Logistics Park': { x: 375, y: 270, region: 'America' },
  'Laredo Border Gateway': { x: 235, y: 410, region: 'America' },
  'San Antonio Trade Hub': { x: 245, y: 380, region: 'America' },
  'El Paso Border Terminal': { x: 185, y: 360, region: 'America' },
  'Austin Tech Complex': { x: 255, y: 365, region: 'America' },
  'Reno Sierra Logistics Park': { x: 115, y: 190, region: 'America' },
  'Salt Lake City Intermountain Hub': { x: 155, y: 185, region: 'America' },
  'Albuquerque Terminal': { x: 190, y: 305, region: 'America' },
  'Boise Agricultural Dock': { x: 130, y: 135, region: 'America' },
  'Cheyenne Plains Terminal': { x: 200, y: 195, region: 'America' },
  'Long Beach Port': { x: 98, y: 285, region: 'America' },
  'Oakland Marine Terminal': { x: 88, y: 245, region: 'America' },
  'Tacoma Port': { x: 108, y: 105, region: 'America' },
  'Sacramento Valley Hub': { x: 95, y: 205, region: 'America' },
  'San Diego Border Terminal': { x: 105, y: 300, region: 'America' },
  'Spokane Inland Port': { x: 125, y: 108, region: 'America' },

  // Europe
  'Rotterdam Port': { x: 220, y: 200, region: 'Europe' },
  'Berlin Cargo Terminal': { x: 310, y: 190, region: 'Europe' },
  'Hamburg Terminal': { x: 295, y: 165, region: 'Europe' },
  'Munich Hub': { x: 290, y: 260, region: 'Europe' },
  'Milan Logistics': { x: 275, y: 300, region: 'Europe' },
  'Paris Hub': { x: 200, y: 250, region: 'Europe' },
  'Prague Rail Terminal': { x: 320, y: 225, region: 'Europe' },
  'Gothenburg Wharf': { x: 315, y: 110, region: 'Europe' },
  'Stockholm Logistics': { x: 360, y: 100, region: 'Europe' },
  'Madrid Interchange': { x: 140, y: 370, region: 'Europe' },
  'Lisbon Wharf': { x: 100, y: 385, region: 'Europe' },
  'Warsaw Terminal': { x: 370, y: 195, region: 'Europe' },
  'Vilnius Hub': { x: 405, y: 165, region: 'Europe' },

  // Asia
  'Tokyo Industrial Wharf': { x: 380, y: 220, region: 'Asia' },
  'Tokyo Wharf': { x: 380, y: 220, region: 'Asia' },
  'Osaka West Railhead': { x: 335, y: 250, region: 'Asia' },
  'Nagoya Interchange': { x: 360, y: 235, region: 'Asia' },
  'Seoul Hub': { x: 250, y: 190, region: 'Asia' },
  'Busan Terminal': { x: 275, y: 225, region: 'Asia' },
  'Shanghai Terminal': { x: 260, y: 290, region: 'Asia' },
  'Wuhan Interchange': { x: 240, y: 305, region: 'Asia' },
  'Singapore Port': { x: 180, y: 410, region: 'Asia' },
  'Kuala Lumpur Hub': { x: 170, y: 390, region: 'Asia' },
  'Taipei Terminals': { x: 290, y: 330, region: 'Asia' },
  'Kaohsiung Rail': { x: 285, y: 350, region: 'Asia' },
  'Bangkok Terminal': { x: 190, y: 350, region: 'Asia' },
  'Chiang Mai Interchange': { x: 185, y: 310, region: 'Asia' },

  // Africa
  'Cairo Logistics Hub': { x: 340, y: 150, region: 'Africa' },
  'Lagos Port': { x: 180, y: 280, region: 'Africa' },
  'Johannesburg Terminal': { x: 280, y: 420, region: 'Africa' },
  'Nairobi Hub': { x: 330, y: 340, region: 'Africa' },
  'Casablanca Wharf': { x: 130, y: 140, region: 'Africa' },
  'Cape Town Depot': { x: 260, y: 460, region: 'Africa' },
  'Mombasa Port': { x: 350, y: 350, region: 'Africa' },
};

export const LiveMapModal: React.FC<LiveMapModalProps> = ({ state, onClose }) => {
  const [zoom, setZoom] = useState<number>(1.0);
  const [selectedRegion, setSelectedRegion] = useState<'America' | 'Europe' | 'Asia' | 'Africa' | 'Global'>('Global');
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);

  const activeContracts = state.activeContracts || [];
  const trucks = state.trucks || [];
  const drivers = state.drivers || [];

  const handleZoomIn = () => setZoom(prev => Math.min(2.5, +(prev + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoom(prev => Math.max(0.8, +(prev - 0.25).toFixed(2)));
  const handleResetZoom = () => setZoom(1.0);

  const selectedTruck = trucks.find(t => t?.id === selectedTruckId);
  const selectedContract = activeContracts.find(c => c?.assignedTruckId === selectedTruckId);
  const selectedDriver = drivers.find(d => d?.id === selectedTruck?.assignedDriverId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Globe className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">Global GPS Telemetry & Live Map</h2>
              <p className="text-[10px] text-slate-400">Real-time vector satellite tracking across unified continental transport corridors</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[10px]">
              {(['Global', 'America', 'Europe', 'Asia', 'Africa'] as const).map(reg => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-2 py-1 rounded-lg font-bold transition ${selectedRegion === reg ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  {reg === 'Global' ? '🌐 Global' : reg === 'America' ? '🇺🇸 USA' : reg === 'Europe' ? '🇪🇺 EU' : reg === 'Asia' ? '🌏 Asia' : '🌍 Africa'}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Map Toolbar / Controls */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-300 shrink-0">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <strong className="text-emerald-400 font-bold">{activeContracts.length} Active Rigs</strong>
            </span>
            <span className="text-slate-500">•</span>
            <span>Weather: <strong className="text-amber-300">{state.activeWeather}</strong></span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button onClick={handleZoomIn} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200" title="Zoom In">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleZoomOut} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200" title="Zoom Out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleResetZoom} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200" title="Reset Zoom">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Map Canvas Area */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center p-4">
          
          {/* Real Geographic Map */}
          <div className="absolute inset-0">
            <RealMapCanvas
              region={selectedRegion}
              contracts={activeContracts}
              trucks={trucks}
              selectedTruckId={selectedTruckId}
              onSelectTruck={setSelectedTruckId}
              zoom={zoom}
            />
          </div>


          

          {/* Floating Telemetry Inspection Card (When Truck Clicked) */}
          {selectedTruck && selectedContract && (
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 border border-amber-500/40 backdrop-blur-md p-3.5 rounded-xl shadow-2xl space-y-2 text-xs animate-in slide-in-from-bottom">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{selectedTruck.imageIcon || '🚚'}</span>
                  <div>
                    <h3 className="font-extrabold text-white">{selectedTruck.name}</h3>
                    <div className="text-[10px] text-amber-400 font-semibold">{selectedTruck.brand} • Driver: {selectedDriver?.name || 'Assigned'}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedTruckId(null)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-300">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Route</span>
                  <strong className="text-slate-200 truncate">{selectedContract.origin} → {selectedContract.destination}</strong>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Progress</span>
                  <strong className="text-emerald-400">{Math.floor(((selectedContract.progressMiles || 0) / selectedContract.distanceMiles) * 100)}% Complete</strong>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Fuel Level</span>
                  <strong className="text-amber-400">{Math.floor(selectedTruck.currentFuelLitres)}L / {selectedTruck.fuelCapacityLitres}L</strong>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span>Click any 🚚 marker on the map to inspect live rig telemetry.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
          >
            Close Map
          </button>
        </div>

      </div>
    </div>
  );
};
