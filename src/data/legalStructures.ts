import type { CorporateStructureType } from '../types/game';

export interface LegalStructureDefinition {
  type: CorporateStructureType;
  title: string;
  badge: string;
  filingFee: number;
  taxRate: number; // e.g. 0.28 for 28%
  maxLoanLimit: number;
  insuranceMonthlyPerTruck: number;
  allowedInvestorRounds: string[]; // investor round ids permitted
  requiredCompanyLevel: number;
  requiredCreditScore: number;
  description: string;
  legalBenefits: string[];
  legalRestrictions: string[];
  governanceRequirements: string;
}

export const LEGAL_STRUCTURES: Record<CorporateStructureType, LegalStructureDefinition> = {
  'Sole Proprietorship': {
    type: 'Sole Proprietorship',
    title: 'Sole Proprietorship',
    badge: 'Individual Operator',
    filingFee: 0,
    taxRate: 0.28,
    maxLoanLimit: 25000,
    insuranceMonthlyPerTruck: 550,
    allowedInvestorRounds: [],
    requiredCompanyLevel: 1,
    requiredCreditScore: 500,
    description: 'Unincorporated business owned and run by one individual. Pass-through personal taxation and unlimited personal liability.',
    legalBenefits: [
      'No state or federal incorporation filing fee ($0)',
      'Simplified pass-through individual tax accounting',
      'Zero corporate governance or board reporting obligations'
    ],
    legalRestrictions: [
      'Unlimited personal liability for cargo spills & accidents',
      'Bank borrowing capped at $25,000 personal guarantee',
      'Legally prohibited from issuing shares or taking VC funding',
      'Higher commercial underwriter insurance rates ($550/mo per truck)'
    ],
    governanceRequirements: 'Owner sole discretion; no formal corporate charter required.'
  },
  'LLC': {
    type: 'LLC',
    title: 'Limited Liability Company (LLC)',
    badge: 'Registered Entity',
    filingFee: 850,
    taxRate: 0.21,
    maxLoanLimit: 150000,
    insuranceMonthlyPerTruck: 420,
    allowedInvestorRounds: ['inv-1'], // Seed Angel allowed
    requiredCompanyLevel: 2,
    requiredCreditScore: 640,
    description: 'Statutory legal entity offering personal liability protection to owners while retaining flexible partnership taxation.',
    legalBenefits: [
      'Full statutory liability shield protecting founder personal assets',
      'Corporate tax rate reduced to 21% flat',
      'Unlocks commercial equipment loans up to $150,000',
      'Permits Seed Angel investor equity agreements',
      'Moderate commercial fleet insurance rates ($420/mo per truck)'
    ],
    legalRestrictions: [
      '$850 Statutory Department of State registration & agent fee',
      'Requires registered USDOT Motor Carrier compliance filing'
    ],
    governanceRequirements: 'Operating Agreement & registered statutory agent required.'
  },
  'Corporation': {
    type: 'Corporation',
    title: 'Private Corporation (C-Corp / Ltd)',
    badge: 'Incorporated Enterprise',
    filingFee: 3500,
    taxRate: 0.18,
    maxLoanLimit: 500000,
    insuranceMonthlyPerTruck: 350,
    allowedInvestorRounds: ['inv-1', 'inv-2', 'inv-3'], // All VC rounds allowed
    requiredCompanyLevel: 3,
    requiredCreditScore: 700,
    description: 'Independent legal entity distinct from owners. Features corporate share structure, formal board governance, and institutional financing eligibility.',
    legalBenefits: [
      'Substantial corporate tax optimization rate (18%)',
      'Commercial credit lines and equipment debt up to $500,000',
      'Full eligibility for Series A and Institutional Equity rounds',
      'Tier-1 fleet underwriter insurance discount ($350/mo per truck)',
      'Perpetual corporate legal existence'
    ],
    legalRestrictions: [
      '$3,500 Legal counsel, charter drafting & state incorporation fee',
      'Mandatory Board of Directors meetings and corporate minutes',
      'Requires Minimum Tier 3 Company Reputation & 700 Credit Score'
    ],
    governanceRequirements: 'Articles of Incorporation, corporate bylaws, formal board.'
  },
  'Publicly Traded (IPO)': {
    type: 'Publicly Traded (IPO)',
    title: 'Public Corporation (PLC / SEC Listed)',
    badge: 'Exchange Traded',
    filingFee: 50000,
    taxRate: 0.14,
    maxLoanLimit: 2500000,
    insuranceMonthlyPerTruck: 280,
    allowedInvestorRounds: ['inv-1', 'inv-2', 'inv-3'],
    requiredCompanyLevel: 5,
    requiredCreditScore: 740,
    description: 'Public stock company registered with securities authorities. Shares trade freely on national financial exchanges with deep institutional liquidity.',
    legalBenefits: [
      'Lowest global corporate preferred tax rate (14%)',
      'Access to syndicated institutional debt up to $2,500,000',
      'Liquidity through public shares and continuous market cap valuation',
      'Prime multinational underwriter insurance ($280/mo per truck)',
      'Substantial public credibility for government freight tenders'
    ],
    legalRestrictions: [
      '$50,000 SEC registration, underwriting syndicate & listing fees',
      'Quarterly public earnings reports and audit scrutiny',
      'Subject to public shareholder expectations and dividend pressure',
      'Requires Tier 5 Company Reputation & 740+ Credit Score'
    ],
    governanceRequirements: 'SEC Form S-1 registration, independent audit committee, quarterly public disclosures.'
  }
};
