export function getCompanyXpRequirement(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return Math.max(200, Math.floor(200 * Math.pow(safeLevel, 1.35)));
}

export function getCompanyRank(level: number): string {
  const safeLevel = Math.max(1, Math.floor(level));

  if (safeLevel >= 5000) return 'Global Logistics Enterprise';
  if (safeLevel >= 2500) return 'Multinational Logistics Network';
  if (safeLevel >= 1000) return 'Global Logistics Group';
  if (safeLevel >= 500) return 'Global Freight Network';
  if (safeLevel >= 250) return 'International Logistics Group';
  if (safeLevel >= 100) return 'National Logistics Group';
  if (safeLevel >= 50) return 'Major Carrier';
  if (safeLevel >= 25) return 'Long-Haul Carrier';
  if (safeLevel >= 10) return 'Regional Carrier';
  if (safeLevel >= 5) return 'Established Carrier';
  if (safeLevel >= 2) return 'Small Carrier';

  return 'New Carrier';
}
