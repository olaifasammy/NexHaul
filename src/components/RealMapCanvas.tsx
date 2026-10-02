import React, { useMemo } from 'react';
import type { Contract, Truck } from '../types/game';

export type MapRegion = 'Global' | 'America' | 'Europe' | 'Asia' | 'Africa';

type CityLocation = {
  lat: number;
  lng: number;
  region: Exclude<MapRegion, 'Global'>;
};

const CITY_LOCATIONS: Record<string, CityLocation> = {
  'Chicago Hub': { lat: 41.8781, lng: -87.6298, region: 'America' },
  'Chicago Interchange': { lat: 41.8781, lng: -87.6298, region: 'America' },
  'Milwaukee Depot': { lat: 43.0389, lng: -87.9065, region: 'America' },
  'Detroit Logistics Park': { lat: 42.3314, lng: -83.0458, region: 'America' },
  'Dallas Logistics': { lat: 32.7767, lng: -96.797, region: 'America' },
  'Fort Worth Rail': { lat: 32.7555, lng: -97.3308, region: 'America' },
  'Los Angeles Hub': { lat: 34.0522, lng: -118.2437, region: 'America' },
  'Seattle Port': { lat: 47.6062, lng: -122.3321, region: 'America' },
  'Atlanta Railhead': { lat: 33.749, lng: -84.388, region: 'America' },
  'New York Wharf': { lat: 40.7128, lng: -74.006, region: 'America' },
  'Miami Terminals': { lat: 25.7617, lng: -80.1918, region: 'America' },
  'Houston Terminal': { lat: 29.7604, lng: -95.3698, region: 'America' },
  'Denver Terminal': { lat: 39.7392, lng: -104.9903, region: 'America' },
  'Phoenix Interchange': { lat: 33.4484, lng: -112.074, region: 'America' },
  'Portland Dock': { lat: 45.5152, lng: -122.6784, region: 'America' },
  'San Francisco Wharf': { lat: 37.7749, lng: -122.4194, region: 'America' },
  'Silicon Valley Cluster': { lat: 37.3382, lng: -121.8863, region: 'America' },
  'Dallas Data Fortress': { lat: 32.7767, lng: -96.797, region: 'America' },
  'Houston Chem Complex': { lat: 29.7604, lng: -95.3698, region: 'America' },
  'Atlanta Processing Hub': { lat: 33.749, lng: -84.388, region: 'America' },
  'Newark Port': { lat: 40.7357, lng: -74.1724, region: 'America' },
  'Harrisburg Logistics Park': { lat: 40.2732, lng: -76.8867, region: 'America' },
  'Baltimore Marine Terminal': { lat: 39.2904, lng: -76.6122, region: 'America' },
  'Philadelphia Wharf': { lat: 39.9526, lng: -75.1652, region: 'America' },
  'Pittsburgh Steel Complex': { lat: 40.4406, lng: -79.9959, region: 'America' },
  'Boston Freight Hub': { lat: 42.3601, lng: -71.0589, region: 'America' },
  'Albany Interchange': { lat: 42.6526, lng: -73.7562, region: 'America' },
  'Indianapolis Logistics Center': { lat: 39.7684, lng: -86.1581, region: 'America' },
  'Columbus Inland Port': { lat: 39.9612, lng: -82.9988, region: 'America' },
  'Louisville Air Hub': { lat: 38.2527, lng: -85.7585, region: 'America' },
  'Memphis Distribution Hub': { lat: 35.1495, lng: -90.0490, region: 'America' },
  'Kansas City Intermodal': { lat: 39.0997, lng: -94.5786, region: 'America' },
  'St. Louis River Terminal': { lat: 38.6270, lng: -90.1994, region: 'America' },
  'Cleveland Industrial Hub': { lat: 41.4993, lng: -81.6944, region: 'America' },
  'Minneapolis Railhead': { lat: 44.9778, lng: -93.2650, region: 'America' },
  'Savannah Garden City Terminal': { lat: 32.0835, lng: -81.0998, region: 'America' },
  'New Orleans Gulf Terminal': { lat: 29.9511, lng: -90.0715, region: 'America' },
  'Jacksonville Port': { lat: 30.3322, lng: -81.6557, region: 'America' },
  'Mobile Port': { lat: 30.6954, lng: -88.0399, region: 'America' },
  'Nashville Music & Freight Hub': { lat: 36.1627, lng: -86.7816, region: 'America' },
  'Charlotte Logistics Park': { lat: 35.2271, lng: -80.8431, region: 'America' },
  'Laredo Border Gateway': { lat: 27.5036, lng: -99.5076, region: 'America' },
  'San Antonio Trade Hub': { lat: 29.4241, lng: -98.4936, region: 'America' },
  'El Paso Border Terminal': { lat: 31.7619, lng: -106.4850, region: 'America' },
  'Austin Tech Complex': { lat: 30.2672, lng: -97.7431, region: 'America' },
  'Reno Sierra Logistics Park': { lat: 39.5296, lng: -119.8138, region: 'America' },
  'Salt Lake City Intermountain Hub': { lat: 40.7608, lng: -111.8910, region: 'America' },
  'Albuquerque Terminal': { lat: 35.0844, lng: -106.6504, region: 'America' },
  'Boise Agricultural Dock': { lat: 43.6150, lng: -116.2023, region: 'America' },
  'Cheyenne Plains Terminal': { lat: 41.1400, lng: -104.8202, region: 'America' },
  'Long Beach Port': { lat: 33.7701, lng: -118.1937, region: 'America' },
  'Oakland Marine Terminal': { lat: 37.8044, lng: -122.2712, region: 'America' },
  'Tacoma Port': { lat: 47.2529, lng: -122.4443, region: 'America' },
  'Sacramento Valley Hub': { lat: 38.5816, lng: -121.4944, region: 'America' },
  'San Diego Border Terminal': { lat: 32.7157, lng: -117.1611, region: 'America' },
  'Spokane Inland Port': { lat: 47.6588, lng: -117.4260, region: 'America' },

  'Rotterdam Port': { lat: 51.9244, lng: 4.4777, region: 'Europe' },
  'Berlin Cargo Terminal': { lat: 52.52, lng: 13.405, region: 'Europe' },
  'Hamburg Terminal': { lat: 53.5511, lng: 9.9937, region: 'Europe' },
  'Munich Hub': { lat: 48.1351, lng: 11.582, region: 'Europe' },
  'Milan Logistics': { lat: 45.4642, lng: 9.19, region: 'Europe' },
  'Paris Hub': { lat: 48.8566, lng: 2.3522, region: 'Europe' },
  'Prague Rail Terminal': { lat: 50.0755, lng: 14.4378, region: 'Europe' },
  'Gothenburg Wharf': { lat: 57.7089, lng: 11.9746, region: 'Europe' },
  'Stockholm Logistics': { lat: 59.3293, lng: 18.0686, region: 'Europe' },
  'Madrid Interchange': { lat: 40.4168, lng: -3.7038, region: 'Europe' },
  'Lisbon Wharf': { lat: 38.7223, lng: -9.1393, region: 'Europe' },
  'Warsaw Terminal': { lat: 52.2297, lng: 21.0122, region: 'Europe' },
  'Vilnius Hub': { lat: 54.6872, lng: 25.2797, region: 'Europe' },

  'Tokyo Industrial Wharf': { lat: 35.6762, lng: 139.6503, region: 'Asia' },
  'Tokyo Wharf': { lat: 35.6762, lng: 139.6503, region: 'Asia' },
  'Osaka West Railhead': { lat: 34.6937, lng: 135.5023, region: 'Asia' },
  'Nagoya Interchange': { lat: 35.1815, lng: 136.9066, region: 'Asia' },
  'Seoul Hub': { lat: 37.5665, lng: 126.978, region: 'Asia' },
  'Busan Terminal': { lat: 35.1796, lng: 129.0756, region: 'Asia' },
  'Shanghai Terminal': { lat: 31.2304, lng: 121.4737, region: 'Asia' },
  'Wuhan Interchange': { lat: 30.5928, lng: 114.3055, region: 'Asia' },
  'Singapore Port': { lat: 1.3521, lng: 103.8198, region: 'Asia' },
  'Kuala Lumpur Hub': { lat: 3.139, lng: 101.6869, region: 'Asia' },
  'Taipei Terminals': { lat: 25.033, lng: 121.5654, region: 'Asia' },
  'Kaohsiung Rail': { lat: 22.6273, lng: 120.3014, region: 'Asia' },
  'Bangkok Terminal': { lat: 13.7563, lng: 100.5018, region: 'Asia' },
  'Chiang Mai Interchange': { lat: 18.7883, lng: 98.9853, region: 'Asia' },

  'Cairo Logistics Hub': { lat: 30.0444, lng: 31.2357, region: 'Africa' },
  'Lagos Port': { lat: 6.455, lng: 3.3841, region: 'Africa' },
  'Johannesburg Terminal': { lat: -26.2041, lng: 28.0473, region: 'Africa' },
  'Nairobi Hub': { lat: -1.2921, lng: 36.8219, region: 'Africa' },
  'Casablanca Wharf': { lat: 33.5731, lng: -7.5898, region: 'Africa' },
  'Cape Town Depot': { lat: -33.9249, lng: 18.4241, region: 'Africa' },
  'Mombasa Port': { lat: -4.0435, lng: 39.6682, region: 'Africa' },
};

const labelFor = (name: string) =>
  name.replace(/ (Hub|Terminal|Depot|Port|Wharf|Logistics|Interchange|Railhead|Rail|Cluster|Complex|Park|Processing Hub|Data Fortress|Logistics Center|Inland Port|Air Hub|Distribution Hub|River Terminal|Industrial Hub|Garden City Terminal|Gulf Terminal|Border Gateway|Trade Hub|Border Terminal|Tech Complex|Sierra Logistics Park|Intermountain Hub|Agricultural Dock|Plains Terminal|Marine Terminal|Valley Hub|Inland Port)/, '');

export const RealMapCanvas: React.FC<{
  region: MapRegion;
  contracts: Contract[];
  trucks: Truck[];
  selectedTruckId: string | null;
  onSelectTruck: (id: string) => void;
  zoom?: number;
  showLabels?: boolean;
  showRoutes?: boolean;
}> = ({ region, contracts, trucks, selectedTruckId, onSelectTruck, zoom = 1, showLabels = true, showRoutes = true }) => {
  const cities = useMemo(
    () => Object.entries(CITY_LOCATIONS).filter(([, c]) => region === 'Global' || c.region === region),
    [region],
  );

  const bounds = useMemo(() => {
    const source = cities.map(([, c]) => c);
    if (!source.length) return { minLat: -60, maxLat: 75, minLng: -180, maxLng: 180 };
    const padLat = region === 'Global' ? 12 : region === 'America' ? 8 : 5;
    const padLng = region === 'Global' ? 20 : region === 'America' ? 12 : 8;
    return {
      minLat: Math.min(...source.map(c => c.lat)) - padLat,
      maxLat: Math.max(...source.map(c => c.lat)) + padLat,
      minLng: Math.min(...source.map(c => c.lng)) - padLng,
      maxLng: Math.max(...source.map(c => c.lng)) + padLng,
    };
  }, [cities, region]);

  const project = (lat: number, lng: number) => ({
    x: 45 + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1)) * 910,
    y: 35 + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat || 1)) * 530,
  });

  const cityPoints = useMemo(
    () => cities.map(([name, city]) => ({ name, ...project(city.lat, city.lng) })),
    [cities, bounds]
  );

  const activeTruckPositions = useMemo(() => {
    return trucks.map(truck => {
      const contract = contracts.find(c => c.assignedTruckId === truck.id && c.status === 'in_progress');
      if (!contract) {
        const loc = CITY_LOCATIONS[truck.currentCity] || CITY_LOCATIONS['Dallas Logistics'];
        return { truckId: truck.id, ...project(loc.lat, loc.lng), truck, isIdle: true };
      }
      
      const origin = CITY_LOCATIONS[contract.origin] || CITY_LOCATIONS['Dallas Logistics'];
      const dest = CITY_LOCATIONS[contract.destination] || CITY_LOCATIONS['Chicago Hub'];
      const ratio = Math.min(0.99, (contract.progressMiles || 0) / (contract.distanceMiles || 1));
      
      const currentLat = origin.lat + (dest.lat - origin.lat) * ratio;
      const currentLng = origin.lng + (dest.lng - origin.lng) * ratio;
      
      return {
        truckId: truck.id,
        ...project(currentLat, currentLng),
        origin: project(origin.lat, origin.lng),
        dest: project(dest.lat, dest.lng),
        truck,
        isIdle: false
      };
    });
  }, [trucks, contracts, bounds]);

  return (
    <div className="relative w-full h-full bg-[#090d16] overflow-hidden rounded-xl border border-slate-800/50 shadow-2xl">
      <svg 
        viewBox="0 0 1000 600" 
        className="w-full h-full transform transition-transform duration-500 ease-out origin-center"
        style={{ transform: `scale(${zoom})` }}
      >
        <defs>
          <radialGradient id="hub-glow">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Global Grid Lines */}
        <g opacity="0.05">
          {[...Array(20)].map((_, i) => (
            <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="600" stroke="#94a3b8" strokeWidth="1" />
          ))}
          {[...Array(12)].map((_, i) => (
            <line key={`h-${i}`} x1="0" y1={i * 50} x2="1000" y2={i * 50} stroke="#94a3b8" strokeWidth="1" />
          ))}
        </g>

        {/* Active Transport Corridors */}
        {showRoutes && activeTruckPositions.filter(p => !p.isIdle).map(p => (
          <g key={`route-${p.truckId}`}>
            <path 
              d={`M ${p.origin?.x} ${p.origin?.y} L ${p.dest?.x} ${p.dest?.y}`}
              stroke="#1e293b"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 4"
            />
            <path 
              d={`M ${p.origin?.x} ${p.origin?.y} L ${p.x} ${p.y}`}
              stroke="#3b82f6"
              strokeWidth="2"
              fill="none"
              strokeOpacity="0.6"
              filter="url(#neon-glow)"
            />
          </g>
        ))}

        {/* Cities & Logistics Hubs */}
        {cityPoints.map((city) => (
          <g key={`city-${city.name}`} transform={`translate(${city.x}, ${city.y})`}>
            <circle r="12" fill="url(#hub-glow)" />
            <circle r="3" fill="#334155" />
            <circle r="1.5" fill="#facc15" filter="url(#neon-glow)" />
            {showLabels && (
              <text 
                x="6" 
                y="3" 
                fill="#94a3b8" 
                fontSize="8" 
                fontWeight="700" 
                fontFamily="monospace"
                className="pointer-events-none select-none uppercase tracking-tighter"
              >
                {labelFor(city.name)}
              </text>
            )}
          </g>
        ))}

        {/* Live Truck Telemetry Beacons */}
        {activeTruckPositions.map(p => (
          <g 
            key={`truck-${p.truckId}`} 
            transform={`translate(${p.x}, ${p.y})`}
            onClick={() => onSelectTruck(p.truckId)}
            className="cursor-pointer group"
          >
            <circle 
              r="10" 
              fill={p.isIdle ? '#64748b' : '#10b981'} 
              fillOpacity="0.2" 
              className={!p.isIdle ? "animate-ping" : ""} 
            />
            <rect 
              x="-5" 
              y="-5" 
              width="10" 
              height="10" 
              rx="2" 
              fill={p.isIdle ? '#475569' : '#10b981'} 
              stroke="#fff" 
              strokeWidth="1.5"
              className="transition-transform group-hover:scale-125 shadow-xl"
            />
            
            {/* HUD Tooltip Overlay */}
            <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
               <rect x="12" y="-25" width="100" height="45" rx="6" fill="#0f172a" fillOpacity="0.95" stroke="#334155" />
               <text x="18" y="-12" fill="#fff" fontSize="8" fontWeight="bold">{p.truck.name}</text>
               <text x="18" y="-2" fill="#94a3b8" fontSize="7">Status: {p.truck.status}</text>
               <text x="18" y="8" fill="#fbbf24" fontSize="7">Fuel: {Math.floor(p.truck.currentFuelLitres)}L</text>
               <text x="18" y="16" fill="#10b981" fontSize="7">Mpg: {p.truck.fuelEfficiencyMpg}</text>
            </g>
          </g>
        ))}
      </svg>

      {/* Map Legend / HUD Overlay */}
      <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 p-3 rounded-xl space-y-2 pointer-events-none select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">NexHaul Live Telemetry</span>
        </div>
        <div className="flex items-center gap-4 text-[9px] text-slate-400 font-bold uppercase">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-sm" /> En-Route</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-slate-500 rounded-sm" /> Idle / Garage</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-amber-400 rounded-full border border-slate-800" /> Logistics Hub</span>
        </div>
      </div>
      
      {/* Continental Indicator */}
      <div className="absolute top-4 right-4 bg-blue-600/10 backdrop-blur-sm border border-blue-500/20 px-3 py-1.5 rounded-full">
        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Sector: {region} Navigation</span>
      </div>
    </div>
  );
};
