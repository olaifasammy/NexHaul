import type { CargoCategory } from '../types/game';

export type AmericanHubType =
  | 'Container Port'
  | 'Inland Fulfillment'
  | 'Heavy Industrial'
  | 'Intermodal Rail'
  | 'USMCA Border Gateway'
  | 'Air Cargo Nexus'
  | 'Agricultural Terminal'
  | 'Tech & Data Hub';

export type AmericanCorridor =
  | 'Northeast & Mid-Atlantic'
  | 'Midwest & Great Lakes'
  | 'South & Gulf Coast'
  | 'USMCA Border & Texas'
  | 'Mountain West'
  | 'Pacific Coast & Northwest';

export type AmericanCityProfile = {
  name: string;
  corridor: AmericanCorridor;
  hubType: AmericanHubType;
  primaryCargo: CargoCategory[];
  economicRole: 'Export Surplus' | 'Import Sink' | 'Balanced Distribution' | 'Heavy Manufacturing';
  fuelPriceMultiplier: number;
  tollMultiplier: number;
  description: string;
};

export const AMERICAN_CITIES_DATA: Record<string, AmericanCityProfile> = {
  'Chicago Hub': {
    name: 'Chicago Hub',
    corridor: 'Midwest & Great Lakes',
    hubType: 'Intermodal Rail',
    primaryCargo: ['General Freight', 'Perishable Foods', 'Heavy Machinery'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 1.02,
    tollMultiplier: 1.15,
    description: 'The historic railroad capital of North America. Massive intermodal yards connecting East Coast maritime cargo to Midwestern manufacturing.'
  },
  'Chicago Interchange': {
    name: 'Chicago Interchange',
    corridor: 'Midwest & Great Lakes',
    hubType: 'Intermodal Rail',
    primaryCargo: ['General Freight', 'Heavy Machinery', 'High Value Tech'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 1.03,
    tollMultiplier: 1.20,
    description: 'High-speed beltway and truck freight transfer station streamlining transcontinental freight flows.'
  },
  'Milwaukee Depot': {
    name: 'Milwaukee Depot',
    corridor: 'Midwest & Great Lakes',
    hubType: 'Heavy Industrial',
    primaryCargo: ['Heavy Machinery', 'General Freight', 'Perishable Foods'],
    economicRole: 'Heavy Manufacturing',
    fuelPriceMultiplier: 1.00,
    tollMultiplier: 1.05,
    description: 'Great Lakes industrial manufacturing center specializing in heavy machinery and agricultural equipment transport.'
  },
  'Detroit Logistics Park': {
    name: 'Detroit Logistics Park',
    corridor: 'Midwest & Great Lakes',
    hubType: 'Heavy Industrial',
    primaryCargo: ['Heavy Machinery', 'General Freight', 'High Value Tech'],
    economicRole: 'Heavy Manufacturing',
    fuelPriceMultiplier: 1.04,
    tollMultiplier: 1.10,
    description: 'Automotive manufacturing and parts distribution heartland with dedicated just-in-time logistics bays.'
  },
  'Dallas Logistics': {
    name: 'Dallas Logistics',
    corridor: 'USMCA Border & Texas',
    hubType: 'Inland Fulfillment',
    primaryCargo: ['General Freight', 'Perishable Foods', 'High Value Tech'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 0.94,
    tollMultiplier: 1.05,
    description: 'Southwestern commercial distribution empire acting as the primary inland freight nexus for Texas.'
  },
  'Fort Worth Rail': {
    name: 'Fort Worth Rail',
    corridor: 'USMCA Border & Texas',
    hubType: 'Intermodal Rail',
    primaryCargo: ['Heavy Machinery', 'General Freight', 'Hazardous Chemicals'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 0.95,
    tollMultiplier: 1.00,
    description: 'Major Class I rail classification yards and intermodal container transload terminal.'
  },
  'Los Angeles Hub': {
    name: 'Los Angeles Hub',
    corridor: 'Pacific Coast & Northwest',
    hubType: 'Container Port',
    primaryCargo: ['General Freight', 'High Value Tech', 'Perishable Foods'],
    economicRole: 'Import Sink',
    fuelPriceMultiplier: 1.18,
    tollMultiplier: 1.25,
    description: 'Pacific rim trade gateway handling massive import volumes of consumer goods, electronics, and produce.'
  },
  'Seattle Port': {
    name: 'Seattle Port',
    corridor: 'Pacific Coast & Northwest',
    hubType: 'Container Port',
    primaryCargo: ['General Freight', 'Perishable Foods', 'Heavy Machinery'],
    economicRole: 'Export Surplus',
    fuelPriceMultiplier: 1.12,
    tollMultiplier: 1.10,
    description: 'Pacific Northwest deepwater port specializing in Alaskan maritime trade, timber exports, and containerized freight.'
  },
  'Atlanta Railhead': {
    name: 'Atlanta Railhead',
    corridor: 'South & Gulf Coast',
    hubType: 'Intermodal Rail',
    primaryCargo: ['General Freight', 'Perishable Foods', 'High Value Tech'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 0.96,
    tollMultiplier: 1.02,
    description: 'The dominant transportation and distribution crossroads of the American Southeast.'
  },
  'New York Wharf': {
    name: 'New York Wharf',
    corridor: 'Northeast & Mid-Atlantic',
    hubType: 'Container Port',
    primaryCargo: ['General Freight', 'High Value Tech', 'Perishable Foods'],
    economicRole: 'Import Sink',
    fuelPriceMultiplier: 1.15,
    tollMultiplier: 1.40,
    description: 'Metropolitan import terminal supplying dense urban markets along the Northeast megalopolis.'
  },
  'Miami Terminals': {
    name: 'Miami Terminals',
    corridor: 'South & Gulf Coast',
    hubType: 'Container Port',
    primaryCargo: ['Perishable Foods', 'General Freight', 'High Value Tech'],
    economicRole: 'Import Sink',
    fuelPriceMultiplier: 1.05,
    tollMultiplier: 1.10,
    description: 'Southern gateway for Caribbean and Latin American trade, perishable produce, and cruise logistics.'
  },
  'Houston Terminal': {
    name: 'Houston Terminal',
    corridor: 'USMCA Border & Texas',
    hubType: 'Container Port',
    primaryCargo: ['Hazardous Chemicals', 'Heavy Machinery', 'General Freight'],
    economicRole: 'Export Surplus',
    fuelPriceMultiplier: 0.92,
    tollMultiplier: 1.05,
    description: 'Gulf Coast maritime and energy powerhouse driving petrochemical, refining, and heavy equipment transport.'
  },
  'Denver Terminal': {
    name: 'Denver Terminal',
    corridor: 'Mountain West',
    hubType: 'Inland Fulfillment',
    primaryCargo: ['General Freight', 'Perishable Foods', 'Heavy Machinery'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 0.98,
    tollMultiplier: 1.00,
    description: 'The Rocky Mountain distribution anchor connecting transcontinental freight across high-altitude passes.'
  },
  'Phoenix Interchange': {
    name: 'Phoenix Interchange',
    corridor: 'Mountain West',
    hubType: 'Inland Fulfillment',
    primaryCargo: ['General Freight', 'High Value Tech', 'Perishable Foods'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 1.00,
    tollMultiplier: 1.00,
    description: 'Southwestern desert distribution and semiconductor manufacturing corridor nexus.'
  },
  'Portland Dock': {
    name: 'Portland Dock',
    corridor: 'Pacific Coast & Northwest',
    hubType: 'Container Port',
    primaryCargo: ['Perishable Foods', 'General Freight', 'Heavy Machinery'],
    economicRole: 'Export Surplus',
    fuelPriceMultiplier: 1.08,
    tollMultiplier: 1.05,
    description: 'Columbia River maritime port specializing in agricultural grain exports, lumber, and manufactured goods.'
  },
  'San Francisco Wharf': {
    name: 'San Francisco Wharf',
    corridor: 'Pacific Coast & Northwest',
    hubType: 'Container Port',
    primaryCargo: ['High Value Tech', 'General Freight', 'Perishable Foods'],
    economicRole: 'Import Sink',
    fuelPriceMultiplier: 1.16,
    tollMultiplier: 1.30,
    description: 'Bay Area maritime terminal handling high-value consumer goods and tech sector supply chains.'
  },
  'Silicon Valley Cluster': {
    name: 'Silicon Valley Cluster',
    corridor: 'Pacific Coast & Northwest',
    hubType: 'Tech & Data Hub',
    primaryCargo: ['High Value Tech', 'General Freight'],
    economicRole: 'Export Surplus',
    fuelPriceMultiplier: 1.15,
    tollMultiplier: 1.25,
    description: 'Global innovation capital generating high-value precision electronics, semiconductor components, and server gear.'
  },
  'Dallas Data Fortress': {
    name: 'Dallas Data Fortress',
    corridor: 'USMCA Border & Texas',
    hubType: 'Tech & Data Hub',
    primaryCargo: ['High Value Tech', 'General Freight'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 0.95,
    tollMultiplier: 1.05,
    description: 'Secure enterprise server and tech hardware logistics facility serving the southern technology corridor.'
  },
  'Houston Chem Complex': {
    name: 'Houston Chem Complex',
    corridor: 'USMCA Border & Texas',
    hubType: 'Heavy Industrial',
    primaryCargo: ['Hazardous Chemicals', 'Heavy Machinery'],
    economicRole: 'Export Surplus',
    fuelPriceMultiplier: 0.91,
    tollMultiplier: 1.05,
    description: 'Massive refinery and chemical processing complex producing industrial feedstocks, polymers, and hazardous chemicals.'
  },
  'Atlanta Processing Hub': {
    name: 'Atlanta Processing Hub',
    corridor: 'South & Gulf Coast',
    hubType: 'Inland Fulfillment',
    primaryCargo: ['General Freight', 'Perishable Foods', 'High Value Tech'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 0.96,
    tollMultiplier: 1.02,
    description: 'Advanced regional sorting and automated fulfillment center serving the southeastern logistics ring.'
  },
  'Newark Port': {
    name: 'Newark Port',
    corridor: 'Northeast & Mid-Atlantic',
    hubType: 'Container Port',
    primaryCargo: ['General Freight', 'High Value Tech', 'Hazardous Chemicals'],
    economicRole: 'Import Sink',
    fuelPriceMultiplier: 1.14,
    tollMultiplier: 1.35,
    description: 'Principal container shipping terminal for the Port of New York and New Jersey.'
  },
  'Harrisburg Logistics Park': {
    name: 'Harrisburg Logistics Park',
    corridor: 'Northeast & Mid-Atlantic',
    hubType: 'Inland Fulfillment',
    primaryCargo: ['General Freight', 'Perishable Foods', 'High Value Tech'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 1.02,
    tollMultiplier: 1.20,
    description: 'The warehouse alley capital of the Mid-Atlantic, featuring millions of square feet of distribution centers along I-81.'
  },
  'Baltimore Marine Terminal': {
    name: 'Baltimore Marine Terminal',
    corridor: 'Northeast & Mid-Atlantic',
    hubType: 'Container Port',
    primaryCargo: ['Heavy Machinery', 'General Freight', 'Hazardous Chemicals'],
    economicRole: 'Import Sink',
    fuelPriceMultiplier: 1.10,
    tollMultiplier: 1.25,
    description: 'Major mid-Atlantic port renowned for automobile roll-on/roll-off import terminals and heavy steel handling.'
  },
  'Philadelphia Wharf': {
    name: 'Philadelphia Wharf',
    corridor: 'Northeast & Mid-Atlantic',
    hubType: 'Container Port',
    primaryCargo: ['Perishable Foods', 'General Freight', 'High Value Tech'],
    economicRole: 'Import Sink',
    fuelPriceMultiplier: 1.12,
    tollMultiplier: 1.30,
    description: 'Specialized river port handling refrigerated fruit, paper products, and consumer goods.'
  },
  'Pittsburgh Steel Complex': {
    name: 'Pittsburgh Steel Complex',
    corridor: 'Northeast & Mid-Atlantic',
    hubType: 'Heavy Industrial',
    primaryCargo: ['Heavy Machinery', 'Hazardous Chemicals', 'General Freight'],
    economicRole: 'Heavy Manufacturing',
    fuelPriceMultiplier: 1.03,
    tollMultiplier: 1.20,
    description: 'Historic steel and heavy manufacturing hub producing structural metalwork and industrial machinery.'
  },
  'Boston Freight Hub': {
    name: 'Boston Freight Hub',
    corridor: 'Northeast & Mid-Atlantic',
    hubType: 'Inland Fulfillment',
    primaryCargo: ['General Freight', 'High Value Tech', 'Perishable Foods'],
    economicRole: 'Import Sink',
    fuelPriceMultiplier: 1.16,
    tollMultiplier: 1.35,
    description: 'New England distribution anchor serving biotechnology, education, and densely populated metro retail.'
  },
  'Albany Interchange': {
    name: 'Albany Interchange',
    corridor: 'Northeast & Mid-Atlantic',
    hubType: 'Intermodal Rail',
    primaryCargo: ['General Freight', 'Perishable Foods', 'Heavy Machinery'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 1.05,
    tollMultiplier: 1.20,
    description: 'Strategic New York upstate corridor connecting the Berkeways, Canada, and the Midwest.'
  },
  'Indianapolis Logistics Center': {
    name: 'Indianapolis Logistics Center',
    corridor: 'Midwest & Great Lakes',
    hubType: 'Inland Fulfillment',
    primaryCargo: ['General Freight', 'Perishable Foods', 'High Value Tech'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 0.98,
    tollMultiplier: 1.10,
    description: 'The quintessential "Crossroads of America" featuring massive interstate convergence and logistics parks.'
  },
  'Columbus Inland Port': {
    name: 'Columbus Inland Port',
    corridor: 'Midwest & Great Lakes',
    hubType: 'Air Cargo Nexus',
    primaryCargo: ['General Freight', 'High Value Tech', 'Perishable Foods'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 0.99,
    tollMultiplier: 1.12,
    description: 'Rickenbacker international freight airport and multi-modal logistics powerhouse.'
  },
  'Louisville Air Hub': {
    name: 'Louisville Air Hub',
    corridor: 'Midwest & Great Lakes',
    hubType: 'Air Cargo Nexus',
    primaryCargo: ['High Value Tech', 'General Freight', 'Perishable Foods'],
    economicRole: 'Export Surplus',
    fuelPriceMultiplier: 0.97,
    tollMultiplier: 1.08,
    description: 'Global air express parcel sorting nexus operating around the clock for time-critical logistics.'
  },
  'Memphis Distribution Hub': {
    name: 'Memphis Distribution Hub',
    corridor: 'South & Gulf Coast',
    hubType: 'Air Cargo Nexus',
    primaryCargo: ['High Value Tech', 'General Freight', 'Perishable Foods'],
    economicRole: 'Export Surplus',
    fuelPriceMultiplier: 0.95,
    tollMultiplier: 1.02,
    description: 'Global cargo airport and river-rail-truck intermodal epicenter of the Mid-South.'
  },
  'Kansas City Intermodal': {
    name: 'Kansas City Intermodal',
    corridor: 'Midwest & Great Lakes',
    hubType: 'Intermodal Rail',
    primaryCargo: ['Heavy Machinery', 'General Freight', 'Perishable Foods'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 0.96,
    tollMultiplier: 1.04,
    description: 'Major transcontinental rail freight transload and agricultural commodity hub.'
  },
  'St. Louis River Terminal': {
    name: 'St. Louis River Terminal',
    corridor: 'Midwest & Great Lakes',
    hubType: 'Heavy Industrial',
    primaryCargo: ['Heavy Machinery', 'Agricultural Seed Dispatch', 'General Freight'],
    economicRole: 'Export Surplus',
    fuelPriceMultiplier: 0.97,
    tollMultiplier: 1.05,
    description: 'Inland river barge and rail freight convergence point serving Midwestern grain and manufacturing.'
  },
  'Cleveland Industrial Hub': {
    name: 'Cleveland Industrial Hub',
    corridor: 'Midwest & Great Lakes',
    hubType: 'Heavy Industrial',
    primaryCargo: ['Heavy Machinery', 'Hazardous Chemicals', 'General Freight'],
    economicRole: 'Heavy Manufacturing',
    fuelPriceMultiplier: 1.01,
    tollMultiplier: 1.12,
    description: 'Great Lakes manufacturing and metal processing center along Lake Erie.'
  },
  'Minneapolis Railhead': {
    name: 'Minneapolis Railhead',
    corridor: 'Midwest & Great Lakes',
    hubType: 'Intermodal Rail',
    primaryCargo: ['Agricultural Seed Dispatch', 'General Freight', 'Heavy Machinery'],
    economicRole: 'Export Surplus',
    fuelPriceMultiplier: 0.99,
    tollMultiplier: 1.05,
    description: 'Upper Midwest agricultural, timber, and rail freight distribution gateway.'
  },
  'Savannah Garden City Terminal': {
    name: 'Savannah Garden City Terminal',
    corridor: 'South & Gulf Coast',
    hubType: 'Container Port',
    primaryCargo: ['General Freight', 'Perishable Foods', 'Heavy Machinery'],
    economicRole: 'Export Surplus',
    fuelPriceMultiplier: 0.97,
    tollMultiplier: 1.02,
    description: 'One of the fastest-growing and most efficient container export ports on the Atlantic coast.'
  },
  'New Orleans Gulf Terminal': {
    name: 'New Orleans Gulf Terminal',
    corridor: 'South & Gulf Coast',
    hubType: 'Container Port',
    primaryCargo: ['Hazardous Chemicals', 'Heavy Machinery', 'General Freight'],
    economicRole: 'Export Surplus',
    fuelPriceMultiplier: 0.94,
    tollMultiplier: 1.00,
    description: 'Mouth of the Mississippi River ocean-river intermodal port handling bulk grain and petrochemicals.'
  },
  'Jacksonville Port': {
    name: 'Jacksonville Port',
    corridor: 'South & Gulf Coast',
    hubType: 'Container Port',
    primaryCargo: ['General Freight', 'Perishable Foods', 'Heavy Machinery'],
    economicRole: 'Import Sink',
    fuelPriceMultiplier: 0.98,
    tollMultiplier: 1.05,
    description: 'Southeastern maritime and rail hub connecting Florida consumer markets with international trade.'
  },
  'Mobile Port': {
    name: 'Mobile Port',
    corridor: 'South & Gulf Coast',
    hubType: 'Container Port',
    primaryCargo: ['Heavy Machinery', 'Hazardous Chemicals', 'General Freight'],
    economicRole: 'Export Surplus',
    fuelPriceMultiplier: 0.93,
    tollMultiplier: 1.00,
    description: 'Gulf Coast container and steel import facility with direct inland rail corridors.'
  },
  'Nashville Music & Freight Hub': {
    name: 'Nashville Music & Freight Hub',
    corridor: 'South & Gulf Coast',
    hubType: 'Inland Fulfillment',
    primaryCargo: ['General Freight', 'High Value Tech', 'Perishable Foods'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 0.96,
    tollMultiplier: 1.02,
    description: 'Thriving southern commercial center and I-40/I-65 freight distribution crossroads.'
  },
  'Charlotte Logistics Park': {
    name: 'Charlotte Logistics Park',
    corridor: 'South & Gulf Coast',
    hubType: 'Inland Fulfillment',
    primaryCargo: ['General Freight', 'High Value Tech', 'Perishable Foods'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 0.97,
    tollMultiplier: 1.05,
    description: 'Carolinas financial and high-speed distribution hub linking the Piedmont industrial crescent.'
  },
  'Laredo Border Gateway': {
    name: 'Laredo Border Gateway',
    corridor: 'USMCA Border & Texas',
    hubType: 'USMCA Border Gateway',
    primaryCargo: ['Heavy Machinery', 'General Freight', 'High Value Tech'],
    economicRole: 'Export Surplus',
    fuelPriceMultiplier: 0.90,
    tollMultiplier: 1.00,
    description: 'The single largest inland port of entry for USMCA trade, processing thousands of cross-border tractor-trailers daily.'
  },
  'San Antonio Trade Hub': {
    name: 'San Antonio Trade Hub',
    corridor: 'USMCA Border & Texas',
    hubType: 'USMCA Border Gateway',
    primaryCargo: ['Heavy Machinery', 'General Freight', 'Perishable Foods'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 0.93,
    tollMultiplier: 1.04,
    description: 'Military, aerospace, and Mexico trade corridor logistics staging center.'
  },
  'El Paso Border Terminal': {
    name: 'El Paso Border Terminal',
    corridor: 'USMCA Border & Texas',
    hubType: 'USMCA Border Gateway',
    primaryCargo: ['Heavy Machinery', 'General Freight', 'High Value Tech'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 0.92,
    tollMultiplier: 1.00,
    description: 'Western Texas international border bottleneck and maquiladora supply chain corridor.'
  },
  'Austin Tech Complex': {
    name: 'Austin Tech Complex',
    corridor: 'USMCA Border & Texas',
    hubType: 'Tech & Data Hub',
    primaryCargo: ['High Value Tech', 'General Freight'],
    economicRole: 'Export Surplus',
    fuelPriceMultiplier: 0.95,
    tollMultiplier: 1.05,
    description: 'Silicon Hills manufacturing and tech logistics center producing advanced semiconductors and software hardware.'
  },
  'Reno Sierra Logistics Park': {
    name: 'Reno Sierra Logistics Park',
    corridor: 'Mountain West',
    hubType: 'Inland Fulfillment',
    primaryCargo: ['General Freight', 'High Value Tech', 'Perishable Foods'],
    economicRole: 'Export Surplus',
    fuelPriceMultiplier: 1.05,
    tollMultiplier: 1.02,
    description: 'Northern Nevada tax-advantage distribution sanctuary serving the entire West Coast retail market.'
  },
  'Salt Lake City Intermountain Hub': {
    name: 'Salt Lake City Intermountain Hub',
    corridor: 'Mountain West',
    hubType: 'Intermodal Rail',
    primaryCargo: ['General Freight', 'Heavy Machinery', 'Perishable Foods'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 0.98,
    tollMultiplier: 1.00,
    description: 'The crossroads of the Intermountain West connecting Pacific routes to the central plains.'
  },
  'Albuquerque Terminal': {
    name: 'Albuquerque Terminal',
    corridor: 'Mountain West',
    hubType: 'Inland Fulfillment',
    primaryCargo: ['General Freight', 'Perishable Foods'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 0.97,
    tollMultiplier: 1.00,
    description: 'Southwestern high-altitude corridor stop along historic Route 66 and I-40.'
  },
  'Boise Agricultural Dock': {
    name: 'Boise Agricultural Dock',
    corridor: 'Pacific Coast & Northwest',
    hubType: 'Agricultural Terminal',
    primaryCargo: ['Perishable Foods', 'Agricultural Seed Dispatch', 'General Freight'],
    economicRole: 'Export Surplus',
    fuelPriceMultiplier: 1.00,
    tollMultiplier: 1.00,
    description: 'Idaho agricultural powerhouse specializing in refrigerated produce and potato supply chains.'
  },
  'Cheyenne Plains Terminal': {
    name: 'Cheyenne Plains Terminal',
    corridor: 'Mountain West',
    hubType: 'Inland Fulfillment',
    primaryCargo: ['General Freight', 'Heavy Machinery'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 0.99,
    tollMultiplier: 1.00,
    description: 'Wyoming energy corridor and transcontinental freight I-80 bypass hub.'
  },
  'Long Beach Port': {
    name: 'Long Beach Port',
    corridor: 'Pacific Coast & Northwest',
    hubType: 'Container Port',
    primaryCargo: ['General Freight', 'High Value Tech', 'Perishable Foods'],
    economicRole: 'Import Sink',
    fuelPriceMultiplier: 1.17,
    tollMultiplier: 1.25,
    description: 'Twin container port titan alongside Los Angeles handling immense trans-Pacific trade.'
  },
  'Oakland Marine Terminal': {
    name: 'Oakland Marine Terminal',
    corridor: 'Pacific Coast & Northwest',
    hubType: 'Container Port',
    primaryCargo: ['Perishable Foods', 'General Freight', 'Heavy Machinery'],
    economicRole: 'Export Surplus',
    fuelPriceMultiplier: 1.14,
    tollMultiplier: 1.20,
    description: 'Northern California container export terminal specializing in Central Valley agricultural products.'
  },
  'Tacoma Port': {
    name: 'Tacoma Port',
    corridor: 'Pacific Coast & Northwest',
    hubType: 'Container Port',
    primaryCargo: ['Heavy Machinery', 'General Freight', 'Perishable Foods'],
    economicRole: 'Export Surplus',
    fuelPriceMultiplier: 1.11,
    tollMultiplier: 1.10,
    description: 'Puget Sound deepwater container port with extensive on-dock intermodal rail capability.'
  },
  'Sacramento Valley Hub': {
    name: 'Sacramento Valley Hub',
    corridor: 'Pacific Coast & Northwest',
    hubType: 'Agricultural Terminal',
    primaryCargo: ['Perishable Foods', 'Agricultural Seed Dispatch', 'General Freight'],
    economicRole: 'Export Surplus',
    fuelPriceMultiplier: 1.10,
    tollMultiplier: 1.15,
    description: 'Agricultural heartland distribution center dispatching fresh fruits, nuts, and produce across America.'
  },
  'San Diego Border Terminal': {
    name: 'San Diego Border Terminal',
    corridor: 'Pacific Coast & Northwest',
    hubType: 'USMCA Border Gateway',
    primaryCargo: ['High Value Tech', 'General Freight', 'Perishable Foods'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 1.15,
    tollMultiplier: 1.20,
    description: 'Southwestern border manufacturing and biotech logistics exchange point.'
  },
  'Spokane Inland Port': {
    name: 'Spokane Inland Port',
    corridor: 'Pacific Coast & Northwest',
    hubType: 'Inland Fulfillment',
    primaryCargo: ['General Freight', 'Heavy Machinery', 'Perishable Foods'],
    economicRole: 'Balanced Distribution',
    fuelPriceMultiplier: 1.02,
    tollMultiplier: 1.05,
    description: 'Pacific Northwest inland rail and interstate distribution nexus along I-90.'
  }
};
