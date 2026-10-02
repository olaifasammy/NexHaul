import type { PlayerSkill } from '../types/game';

export const SKILL_TREE: PlayerSkill[] = [
  // ============================================================
  // DRIVING
  // ============================================================
  {
    id: 'eco-mastery',
    name: 'Eco-Driving Mastery',
    description: 'Improves fuel-efficient driving practices across the company.',
    level: 0, maxLevel: 5, costPoints: 1,
    category: 'Driving', icon: '⛽'
  },
  {
    id: 'defensive-driving',
    name: 'Defensive Driving',
    description: 'Reduces accident exposure through better following distance, hazard awareness, and braking discipline.',
    level: 0, maxLevel: 8, costPoints: 1,
    category: 'Driving', icon: '🛡️'
  },
  {
    id: 'long-haul-endurance',
    name: 'Long-Haul Endurance',
    description: 'Improves driver efficiency and reliability on extended interstate and cross-border runs.',
    level: 0, maxLevel: 6, costPoints: 1,
    category: 'Driving', icon: '🛣️'
  },
  {
    id: 'mountain-driving',
    name: 'Mountain Operations',
    description: 'Develops safer and more efficient operation on steep grades, descents, and mountain corridors.',
    level: 0, maxLevel: 5, costPoints: 2,
    category: 'Driving', icon: '⛰️'
  },
  {
    id: 'night-driving',
    name: 'Night Operations',
    description: 'Improves reliability and safety during overnight freight operations.',
    level: 0, maxLevel: 5, costPoints: 2,
    category: 'Driving', icon: '🌙'
  },
  {
    id: 'weather-driving',
    name: 'Severe Weather Driving',
    description: 'Improves operational resilience during rain, snow, wind, and other adverse conditions.',
    level: 0, maxLevel: 6, costPoints: 2,
    category: 'Driving', icon: '🌧️'
  },
  {
    id: 'precision-maneuvering',
    name: 'Precision Maneuvering',
    description: 'Improves low-speed control, backing, docking, and tight-yard operations.',
    level: 0, maxLevel: 5, costPoints: 1,
    category: 'Driving', icon: '🎯'
  },

  // ============================================================
  // MAINTENANCE & FLEET
  // ============================================================
  {
    id: 'mechanic-precision',
    name: 'Fleet Preventive Care',
    description: 'Reduces truck condition degradation through preventive maintenance discipline.',
    level: 0, maxLevel: 5, costPoints: 1,
    category: 'Maintenance', icon: '🔧'
  },
  {
    id: 'vehicle-diagnostics',
    name: 'Vehicle Diagnostics',
    description: 'Improves early detection of mechanical problems before they become expensive failures.',
    level: 0, maxLevel: 6, costPoints: 2,
    category: 'Maintenance', icon: '🧰'
  },
  {
    id: 'tire-management',
    name: 'Tire Management',
    description: 'Improves tire-life planning, pressure management, and replacement timing.',
    level: 0, maxLevel: 5, costPoints: 1,
    category: 'Maintenance', icon: '🛞'
  },
  {
    id: 'breakdown-prevention',
    name: 'Breakdown Prevention',
    description: 'Reduces the frequency and severity of avoidable roadside failures.',
    level: 0, maxLevel: 7, costPoints: 2,
    category: 'Maintenance', icon: '🚧'
  },
  {
    id: 'parts-management',
    name: 'Parts Management',
    description: 'Improves spare-parts planning and reduces maintenance delays caused by missing components.',
    level: 0, maxLevel: 6, costPoints: 2,
    category: 'Maintenance', icon: '📦'
  },
  {
    id: 'fleet-utilization',
    name: 'Fleet Utilization',
    description: 'Improves productive truck utilization and reduces unnecessary idle time.',
    level: 0, maxLevel: 8, costPoints: 2,
    category: 'Maintenance', icon: '🚛'
  },

  // ============================================================
  // LOGISTICS & DISPATCH
  // ============================================================
  {
    id: 'dispatcher-broker',
    name: 'Brokerage Negotiation',
    description: 'Improves freight negotiation and contract payout results.',
    level: 0, maxLevel: 5, costPoints: 1,
    category: 'Logistics', icon: '📈'
  },
  {
    id: 'route-planning',
    name: 'Route Planning',
    description: 'Improves route selection, travel-time estimates, and operational planning.',
    level: 0, maxLevel: 8, costPoints: 1,
    category: 'Logistics', icon: '🗺️'
  },
  {
    id: 'load-optimization',
    name: 'Load Optimization',
    description: 'Improves weight distribution, trailer utilization, and load planning.',
    level: 0, maxLevel: 7, costPoints: 2,
    category: 'Logistics', icon: '📐'
  },
  {
    id: 'deadhead-reduction',
    name: 'Deadhead Reduction',
    description: 'Improves backhaul planning and reduces empty miles between loads.',
    level: 0, maxLevel: 8, costPoints: 2,
    category: 'Logistics', icon: '🔄'
  },
  {
    id: 'dispatch-efficiency',
    name: 'Dispatch Efficiency',
    description: 'Improves truck-to-load matching and overall dispatch coordination.',
    level: 0, maxLevel: 8, costPoints: 2,
    category: 'Logistics', icon: '📡'
  },
  {
    id: 'freight-networking',
    name: 'Freight Network Development',
    description: 'Improves access to repeat lanes, backhauls, and established shipper relationships.',
    level: 0, maxLevel: 10, costPoints: 3,
    category: 'Logistics', icon: '🌐'
  },

  // ============================================================
  // DRIVER MANAGEMENT
  // ============================================================
  {
    id: 'driver-stamina',
    name: 'Driver Wellness Program',
    description: 'Reduces driver fatigue buildup through better scheduling and wellness practices.',
    level: 0, maxLevel: 5, costPoints: 2,
    category: 'Driving', icon: '☕'
  },
  {
    id: 'driver-training',
    name: 'Driver Training Program',
    description: 'Improves the quality and development rate of newly hired drivers.',
    level: 0, maxLevel: 8, costPoints: 2,
    category: 'Driving', icon: '🎓'
  },
  {
    id: 'driver-retention',
    name: 'Driver Retention',
    description: 'Improves driver retention through better scheduling, support, and operating practices.',
    level: 0, maxLevel: 7, costPoints: 2,
    category: 'Driving', icon: '👥'
  },
  {
    id: 'safety-culture',
    name: 'Safety Culture',
    description: 'Creates stronger company-wide safety practices and operational discipline.',
    level: 0, maxLevel: 10, costPoints: 3,
    category: 'Driving', icon: '🏅'
  },

  // ============================================================
  // SPECIALIZED FREIGHT
  // ============================================================
  {
    id: 'hazmat-permit',
    name: 'HazMat Priority Clearance',
    description: 'Improves access to and profitability of hazardous and regulated freight.',
    level: 0, maxLevel: 3, costPoints: 2,
    category: 'Logistics', icon: '☣️'
  },
  {
    id: 'reefer-specialist',
    name: 'Refrigerated Freight',
    description: 'Develops expertise in temperature-sensitive and time-critical refrigerated cargo.',
    level: 0, maxLevel: 6, costPoints: 2,
    category: 'Logistics', icon: '❄️'
  },
  {
    id: 'heavy-haul-specialist',
    name: 'Heavy Haul Operations',
    description: 'Develops expertise in oversized and heavy equipment transportation.',
    level: 0, maxLevel: 8, costPoints: 3,
    category: 'Logistics', icon: '🏗️'
  },
  {
    id: 'high-value-security',
    name: 'High-Value Freight Security',
    description: 'Improves handling procedures and operational reliability for high-value cargo.',
    level: 0, maxLevel: 6, costPoints: 3,
    category: 'Logistics', icon: '🔐'
  },
  {
    id: 'oversize-permits',
    name: 'Oversize Permit Operations',
    description: 'Improves planning and compliance for oversize and overweight movements.',
    level: 0, maxLevel: 7, costPoints: 3,
    category: 'Logistics', icon: '📋'
  },

  // ============================================================
  // CORPORATE OPERATIONS
  // ============================================================
  {
    id: 'financial-management',
    name: 'Financial Management',
    description: 'Improves company cash-flow planning, budgeting, and financial resilience.',
    level: 0, maxLevel: 10, costPoints: 3,
    category: 'Logistics', icon: '💰'
  },
  {
    id: 'procurement',
    name: 'Fleet Procurement',
    description: 'Improves purchasing and replacement planning for trucks, trailers, and equipment.',
    level: 0, maxLevel: 8, costPoints: 3,
    category: 'Maintenance', icon: '🏢'
  },
  {
    id: 'compliance-management',
    name: 'Compliance Management',
    description: 'Improves regulatory planning, documentation, and operational compliance.',
    level: 0, maxLevel: 10, costPoints: 3,
    category: 'Logistics', icon: '⚖️'
  },
  {
    id: 'customer-relations',
    name: 'Customer Relationships',
    description: 'Improves shipper retention, repeat freight opportunities, and company reputation.',
    level: 0, maxLevel: 10, costPoints: 3,
    category: 'Logistics', icon: '🤝'
  },
  {
    id: 'operations-management',
    name: 'Operations Management',
    description: 'Improves coordination between drivers, dispatch, maintenance, and freight operations.',
    level: 0, maxLevel: 10, costPoints: 4,
    category: 'Logistics', icon: '🏭'
  }
];
