import React, { useMemo, useState, useRef, useEffect } from 'react';
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
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

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
    x: 50 + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1)) * 900,
    y: 40 + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat || 1)) * 520,
  });

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

      // Re-implementing Quadratic Bezier Curve Math for the truck position
      const a = project(origin.lat, origin.lng);
      const b = project(dest.lat, dest.lng);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const curve = Math.max(-60, Math.min(60, dx * 0.15));
      const cx = (a.x + b.x) / 2 - curve;
      const cy = (a.y + b.y) / 2 + curve;

      const t = ratio;
      const currentX = (1-t)*(1-t)*a.x + 2*(1-t)*t*cx + t*t*b.x;
      const currentY = (1-t)*(1-t)*a.y + 2*(1-t)*t*cy + t*t*b.y;
      
      return {
        truckId: truck.id,
        x: currentX,
        y: currentY,
        origin: a,
        dest: b,
        cx,
        cy,
        truck,
        isIdle: false
      };
    });
  }, [trucks, contracts, bounds]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const dx = (clientX - lastMousePos.current.x) / zoom;
    const dy = (clientY - lastMousePos.current.y) / zoom;
    
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="relative w-full h-full bg-[#05070a] overflow-hidden rounded-xl border border-slate-900/50 cursor-grab active:cursor-grabbing">
      <svg 
        ref={svgRef}
        viewBox="0 0 1000 600" 
        className="w-full h-full transform transition-transform duration-300 ease-out origin-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <g transform={`scale(${zoom}) translate(${offset.x}, ${offset.y})`}>
          {/* Active Transport Corridors (Curved Bezier Lanes) */}
          {showRoutes && activeTruckPositions.filter(p => !p.isIdle).map(p => (
            <g key={`route-${p.truckId}`} opacity="0.3">
              <path 
                d={`M ${p.origin?.x} ${p.origin?.y} Q ${p.cx} ${p.cy} ${p.dest?.x} ${p.dest?.y}`}
                stroke="#1e293b" strokeWidth="1" fill="none" strokeDasharray="2 2"
              />
              <path 
                d={`M ${p.origin?.x} ${p.origin?.y} Q ${p.cx} ${p.cy} ${p.x} ${p.y}`}
                stroke="#3b82f6" strokeWidth="1.5" fill="none"
              />
            </g>
          ))}

          {/* Cities & Logistics Hubs */}
          {cities.map(([name, city]) => {
            const pos = project(city.lat, city.lng);
            return (
              <g key={`city-${name}`} transform={`translate(${pos.x}, ${pos.y})`}>
                <circle r="1.5" fill="#334155" />
                <circle r="0.8" fill="#94a3b8" />
                {showLabels && (
                  <text 
                    x="4" y="2" 
                    fill="#475569" 
                    fontSize="6" 
                    fontWeight="600" 
                    fontFamily="monospace"
                    className="pointer-events-none select-none uppercase tracking-tighter"
                  >
                    {labelFor(name)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Live Truck Telemetry Beacons */}
          {activeTruckPositions.map(p => (
            <g 
              key={`truck-${p.truckId}`} 
              transform={`translate(${p.x}, ${p.y})`}
              onClick={() => onSelectTruck(p.truckId)}
              className="cursor-pointer group"
            >
              {!p.isIdle && (
                <circle r="6" fill="#10b981" fillOpacity="0.15" className="animate-pulse" />
              )}
              
              <rect 
                x="-2.5" y="-2.5" width="5" height="5" 
                fill={p.isIdle ? '#334155' : '#10b981'} 
                stroke="#fff" strokeWidth="0.5"
              />
              
              <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                 <rect x="6" y="-12" width="60" height="20" fill="#000" fillOpacity="0.8" rx="2" />
                 <text x="10" y="-4" fill="#fff" fontSize="5" fontWeight="bold">{p.truck.name}</text>
                 <text x="10" y="4" fill="#94a3b8" fontSize="4">{p.truck.status}</text>
              </g>
            </g>
          ))}
        </g>
      </svg>

      {/* Interactive HUD Legend */}
      <div className="absolute bottom-2 left-2 flex items-center gap-3 text-[7px] text-slate-500 font-bold uppercase tracking-widest pointer-events-none select-none bg-slate-950/40 px-2 py-1 rounded-full backdrop-blur-sm">
        <span className="flex items-center gap-1"><span className="w-1 h-1 bg-emerald-500" /> Live</span>
        <span className="flex items-center gap-1"><span className="w-1 h-1 bg-blue-500" /> Corridor</span>
        <span className="text-slate-600 ml-2">Drag to Pan • Pinch to Zoom</span>
      </div>
    </div>
  );
};
