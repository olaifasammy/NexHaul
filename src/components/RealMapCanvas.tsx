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

const COLORS: Record<string, string> = {
  America: '#f5a623',
  Europe: '#35c6df',
  Asia: '#b59aff',
  Africa: '#65d68a',
};

type Point = { x: number; y: number };

function seeded(n: number) {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
}

const labelFor = (name: string) =>
  name.replace(/ (Hub|Terminal|Depot|Port|Wharf|Logistics|Interchange|Railhead|Rail|Cluster|Complex|Park|Processing Hub|Data Fortress)/, '');

export const RealMapCanvas: React.FC<{
  region: MapRegion;
  contracts: Contract[];
  trucks: Truck[];
  selectedTruckId: string | null;
  onSelectTruck: (id: string) => void;
  zoom?: number;
}> = ({ region, contracts, trucks, selectedTruckId, onSelectTruck, zoom = 1 }) => {
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

  const project = (lat: number, lng: number): Point => ({
    x: 45 + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1)) * 910,
    y: 35 + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat || 1)) * 530,
  });

  const cityPoints = useMemo(
    () => cities.map(([name, city], i) => ({ name, ...project(city.lat, city.lng), seed: i + 1 })),
    [cities, bounds],
  );

  const visibleContracts = contracts.filter(c => region === 'Global' || c.region === region);

  const routeData = visibleContracts.map(contract => {
    const origin = CITY_LOCATIONS[contract.origin];
    const destination = CITY_LOCATIONS[contract.destination];
    if (!origin || !destination) return null;
    const a = project(origin.lat, origin.lng);
    const b = project(destination.lat, destination.lng);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const curve = Math.max(-75, Math.min(75, dx * 0.1));
    const path = `M ${a.x} ${a.y} Q ${(a.x + b.x) / 2 - curve} ${(a.y + b.y) / 2 + curve} ${b.x} ${b.y}`;
    const progress = Math.max(0, Math.min(1, (contract.progressMiles || 0) / Math.max(1, contract.distanceMiles)));
    const t = progress;
    const current = {
      x: (1-t)*(1-t)*a.x + 2*(1-t)*t*((a.x+b.x)/2-curve) + t*t*b.x,
      y: (1-t)*(1-t)*a.y + 2*(1-t)*t*((a.y+b.y)/2+curve) + t*t*b.y,
    };
    const truck = trucks.find(item => item.id === contract.assignedTruckId);
    return { contract, path, current, progress, truck };
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  // Each city gets a dense, irregular street grid around its center.
  const cityStreets = cityPoints.flatMap((city, cityIndex) => {
    const streets: React.ReactNode[] = [];
    const radius = 20 + (seeded(city.seed) * 18);
    for (let i = -3; i <= 3; i++) {
      const offset = i * 9;
      const bend = (seeded(city.seed * 20 + i + 8) - .5) * 13;
      streets.push(
        <path key={`street-h-${cityIndex}-${i}`}
          d={`M ${city.x-radius} ${city.y+offset} Q ${city.x+bend} ${city.y+offset+bend} ${city.x+radius} ${city.y+offset- bend}`}
          stroke="#65777a" strokeWidth="1.15" opacity=".35" fill="none" />,
        <path key={`street-v-${cityIndex}-${i}`}
          d={`M ${city.x+offset} ${city.y-radius} Q ${city.x+offset+bend} ${city.y+bend} ${city.x+offset-bend} ${city.y+radius}`}
          stroke="#65777a" strokeWidth="1.15" opacity=".32" fill="none" />,
      );
    }
    for (let b = 0; b < 10; b++) {
      const angle = seeded(city.seed * 80 + b) * Math.PI * 2;
      const dist = radius * (.55 + seeded(city.seed + b * 7) * .7);
      const x = city.x + Math.cos(angle) * dist;
      const y = city.y + Math.sin(angle) * dist;
      streets.push(
        <rect key={`block-${cityIndex}-${b}`} x={x} y={y} width={5 + seeded(b+city.seed)*7}
          height={4 + seeded(b*2+city.seed)*6} rx="1" fill="#8a9a8b" opacity=".13"
          transform={`rotate(${seeded(b+city.seed*3)*50-25} ${x} ${y})`} />,
      );
    }
    return streets;
  });

  // Main corridors connect nearby cities, with secondary roads branching outward.
  const highwayPaths = useMemo(() => {
    const points = cityPoints;
    const links = new Set<string>();
    const paths: { d: string; major: boolean; id: string }[] = [];
    points.forEach((a, i) => {
      const nearest = points
        .map((b, j) => ({ b, j, distance: Math.hypot(a.x-b.x, a.y-b.y) }))
        .filter(item => item.j !== i)
        .sort((x,y) => x.distance-y.distance)
        .slice(0, region === 'Global' ? 1 : 2);
      nearest.forEach(({ b, j, distance }) => {
        const key = [Math.min(i,j),Math.max(i,j)].join('-');
        if (links.has(key)) return;
        links.add(key);
        const bend = (seeded(i*31+j*17)-.5) * Math.min(70,distance*.22);
        const midX = (a.x+b.x)/2 + bend;
        const midY = (a.y+b.y)/2 - bend*.65;
        paths.push({
          d: `M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`,
          major: distance > 90,
          id: key,
        });
      });
    });
    return paths;
  }, [cityPoints, region]);

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: '#172a2b' }}>
      <svg
        viewBox={`${(1000 - 1000 / Math.max(1, Math.min(zoom, 4))) / 2} ${(600 - 600 / Math.max(1, Math.min(zoom, 4))) / 2} ${1000 / Math.max(1, Math.min(zoom, 4))} ${600 / Math.max(1, Math.min(zoom, 4))}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id="map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" fill="none" stroke="#b0c1ad" strokeOpacity=".035" strokeWidth="1" />
          </pattern>
          <linearGradient id="land-shade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#253d39" />
            <stop offset="55%" stopColor="#1b302e" />
            <stop offset="100%" stopColor="#142526" />
          </linearGradient>
          <radialGradient id="city-glow">
            <stop offset="0%" stopColor="#d4b77b" stopOpacity=".18" />
            <stop offset="100%" stopColor="#d4b77b" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="1000" height="600" fill="url(#land-shade)" />
        <rect width="1000" height="600" fill="url(#map-grid)" />

        {Array.from({length: 20}, (_,i) => {
          const y = i*37-40;
          const bend = seeded(i+70)*100-50;
          return <path key={`contour-${i}`}
            d={`M-50 ${y} C220 ${y+bend}, 620 ${y-bend}, 1050 ${y+35}`}
            fill="none" stroke={i%4===0 ? '#7c9272' : '#789087'}
            strokeWidth={i%4===0 ? 20 : 9} strokeOpacity={i%4===0 ? '.045' : '.035'} />;
        })}

        {/* Rivers and waterways */}
        <path d="M-30 130 C130 180 170 100 300 165 S530 270 640 220 S850 150 1030 220"
          fill="none" stroke="#32606a" strokeWidth="13" opacity=".22" />
        <path d="M-30 130 C130 180 170 100 300 165 S530 270 640 220 S850 150 1030 220"
          fill="none" stroke="#5a8790" strokeWidth="2.5" opacity=".38" />
        <path d="M160 630 C210 500 180 420 320 360 S520 300 580 -30"
          fill="none" stroke="#32606a" strokeWidth="10" opacity=".18" />

        {/* Local streets first, beneath highways */}
        {cityStreets}

        {/* Regional highways with layered asphalt and center markings */}
        {highwayPaths.map(({d,major,id}) => (
          <g key={`highway-${id}`}>
            <path d={d} fill="none" stroke="#101b1d" strokeWidth={major ? 10 : 6} opacity=".72" strokeLinecap="round" />
            <path d={d} fill="none" stroke={major ? '#b2a68c' : '#667775'} strokeWidth={major ? 6.5 : 3.5} opacity=".92" strokeLinecap="round" />
            <path d={d} fill="none" stroke={major ? '#e0d4b5' : '#aeb6a5'} strokeWidth={major ? 1.1 : .7}
              strokeDasharray={major ? '8 9' : '4 8'} opacity=".65" strokeLinecap="round" />
          </g>
        ))}

        {/* Interchange loops and ramps near larger junctions */}
        {cityPoints.map((city,i) => (
          <g key={`junction-${i}`} opacity=".75">
            <ellipse cx={city.x} cy={city.y} rx="13" ry="7" fill="none" stroke="#b9b39b" strokeWidth="2.2"
              transform={`rotate(${seeded(i+9)*70-35} ${city.x} ${city.y})`} />
            <path d={`M ${city.x-18} ${city.y+12} Q ${city.x-4} ${city.y-12} ${city.x+15} ${city.y-8}`}
              fill="none" stroke="#8f998b" strokeWidth="2" />
          </g>
        ))}

        {/* Subtle urban glow and city labels */}
        {cityPoints.map((city,i) => (
          <g key={`city-${city.name}`}>
            <circle cx={city.x} cy={city.y} r="65" fill="url(#city-glow)" />
            <circle cx={city.x} cy={city.y} r="8" fill="#e5d5ad" opacity=".16" />
            <circle cx={city.x} cy={city.y} r="4" fill="#f1e7cb" stroke="#263432" strokeWidth="1.8" />
            <text x={city.x+9} y={city.y-10} fill="#e1e8db" fontSize="11" fontWeight="600"
              stroke="#172a2b" strokeWidth="3.2" paintOrder="stroke" opacity=".96">
              {labelFor(city.name)}
            </text>
          </g>
        ))}

        {/* Active delivery routes */}
        {routeData.map(({contract,path}) => (
          <g key={`route-${contract.id}`}>
            <path d={path} fill="none" stroke="#081214" strokeWidth="8" opacity=".8" />
            <path d={path} fill="none" stroke={COLORS[contract.region] || '#f5f5f5'}
              strokeWidth="3.5" strokeLinecap="round" opacity=".96" />
            <path d={path} fill="none" stroke="#fff" strokeWidth="1"
              strokeDasharray="3 8" opacity=".5" />
          </g>
        ))}

        {/* Truck markers */}
        {routeData.filter(item => item.truck).map(({contract,current,progress,truck}) => {
          if (!truck) return null;
          const selected = selectedTruckId === truck.id;
          return (
            <g key={`truck-${truck.id}-${contract.id}`}
              onClick={() => onSelectTruck(truck.id)} role="button" tabIndex={0}
              aria-label={`Select ${truck.name}`} style={{cursor:'pointer'}}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') onSelectTruck(truck.id);
              }}>
              {selected && <circle cx={current.x} cy={current.y} r="20" fill="#fff" opacity=".2" />}
              <circle cx={current.x} cy={current.y} r="12"
                fill="#101a1b" stroke={selected ? '#fff' : '#f5b942'} strokeWidth={selected ? 2.5 : 1.5} />
              <text x={current.x} y={current.y+5} textAnchor="middle" fontSize="15">🚚</text>
              <title>{truck.name} — {Math.floor(progress*100)}% complete</title>
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-white/10 bg-slate-950/75 px-3 py-2 text-[10px] tracking-wide text-slate-300 backdrop-blur">
        <div className="font-semibold text-slate-100">{region === 'Global' ? 'WORLD NETWORK' : `${region.toUpperCase()} NETWORK`}</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="inline-block h-1 w-5 rounded bg-amber-400" /> HIGHWAYS
          <span className="ml-1 inline-block h-1 w-5 rounded bg-slate-500" /> LOCAL ROADS
        </div>
      </div>
    </div>
  );
};
