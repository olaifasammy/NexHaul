import React, { useState } from 'react';
import type { GameSaveState, CorporateStructureType } from '../types/game';
import { 
  Building2, 
  ShieldCheck, 
  DollarSign, 
  Award, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Truck, 
  Globe, 
  Shield, 
  Landmark, 
  Scale, 
  BadgeCheck, 
  Activity, 
  MapPin, 
  Briefcase,
  ChevronRight,
  Gauge
} from 'lucide-react';

interface CompanyProfileViewProps {
  state: GameSaveState;
  onUpgradeStructure: (newStructure: 'Sole Proprietorship' | 'LLC' | 'Corporation' | 'Publicly Traded (IPO)') => void;
}

export const CompanyProfileView: React.FC<CompanyProfileViewProps> = ({ state, onUpgradeStructure }) => {
  const [activeSection, setActiveSection] = useState<'credentials' | 'financials' | 'safety' | 'governance'>('credentials');

  const profile = state.profile || {
    founderName: 'Alex Vance',
    foundedDate: 'January 2026',
    corporateStructure: 'LLC' as CorporateStructureType,
    creditScore: 740,
    creditRating: 'A',
    corporateTaxRate: 0.21,
    insuranceMonthlyPerTruck: 420,
    companyValuation: 185000,
    brandScore: 65,
    hqAddress: '1048 Logistics Parkway, Terminal Suite 500',
    hqCity: 'Dallas',
    hqState: 'TX',
    usdotNumber: 'USDOT 3948210',
    mcNumber: 'MC-894210-C',
    einTaxId: '84-9201482',
    missionStatement: 'Delivering nationwide commercial freight with uncompromising safety, efficiency, and premier reliability.',
    logoIcon: '🚚',
    registrationStatus: 'Good Standing' as const
  };

  // Live Asset & Valuation Calculations
  const fleetValue = state.trucks.reduce((sum, t) => sum + (t.price || 120000) * Math.max(0.6, (t.conditionPercent ?? 100) / 100), 0);
  const trailerValue = state.trailers.reduce((sum, t) => sum + (t.price || 30000) * Math.max(0.6, (t.conditionPercent ?? 100) / 100), 0);
  const fuelReserveValue = Math.floor((state.bulkFuelReserveLitres || 0) * (state.currentDieselMarketPrice || 1.45));
  const depotInfrastructureValue = ((state.depot?.repairBayLevel || 1) * 35000) + ((state.depot?.fuelTerminalLevel || 1) * 25000);
  const totalEnterpriseAssets = state.cash + fleetValue + trailerValue + fuelReserveValue + depotInfrastructureValue;

  const totalPayloadCapacityTons = state.trailers.reduce((sum, tr) => sum + (tr.capacityTons || 24), 0);
  const fleetAvgCondition = state.trucks.length > 0
    ? Math.floor(state.trucks.reduce((sum, t) => sum + (t.conditionPercent ?? 100), 0) / state.trucks.length)
    : 100;

  const scacCode = state.companyName ? state.companyName.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'APXH' : 'APXH';

  return (
    <div className="space-y-6">
      
      {/* Executive Authority Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 border border-slate-700/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Regulatory Sub-Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 text-[10px] font-mono uppercase tracking-widest text-slate-400">
          <div className="flex items-center space-x-2">
            <BadgeCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-bold">Federal Motor Carrier Safety Administration (FMCSA)</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>SCAC: <strong className="text-white">{scacCode}</strong></span>
            <span>•</span>
            <span>DUNS: <strong className="text-white">08-392-1940</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {profile.registrationStatus || 'Active & Authorized'}
            </span>
          </div>
        </div>

        {/* Company Identity Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-1">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-blue-950 border border-blue-400/40">
              {profile.logoIcon || '🚚'}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-2xl font-black text-white tracking-tight">{state.companyName}</h1>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold rounded-lg border border-blue-500/30">
                  {profile.corporateStructure}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1 flex items-center space-x-2">
                <span>HQ: {profile.hqCity}, {profile.hqState}</span>
                <span>•</span>
                <span>Established {profile.foundedDate}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">Tier {state.companyLevel} Motor Carrier</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 shrink-0 text-left sm:text-right">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Total Enterprise Asset Valuation</span>
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight mt-0.5">
              ${Math.round(totalEnterpriseAssets).toLocaleString()}
            </div>
            <span className="text-[9px] text-slate-500 font-mono">Audited GAAP Net Worth</span>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs italic text-slate-300">
          "{profile.missionStatement}"
        </div>
      </div>

      {/* Corporate Section Navigation Tabs */}
      <div className="flex items-center space-x-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveSection('credentials')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            activeSection === 'credentials'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Carrier Authority</span>
        </button>

        <button
          onClick={() => setActiveSection('financials')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            activeSection === 'financials'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Balance Sheet</span>
        </button>

        <button
          onClick={() => setActiveSection('safety')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            activeSection === 'safety'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Safety Audit (SMS)</span>
        </button>

        <button
          onClick={() => setActiveSection('governance')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            activeSection === 'governance'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Legal Entity</span>
        </button>
      </div>

      {/* SECTION 1: CARRIER AUTHORITY & CREDENTIALS */}
      {activeSection === 'credentials' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 uppercase tracking-wider font-mono">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>FMCSA & DOT Operating Credentials</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">USDOT Operating Authority</span>
                <span className="text-base text-white font-extrabold">{profile.usdotNumber}</span>
                <span className="text-[10px] text-emerald-400 font-semibold block">✓ Verified Active Intermodal</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">ICC MC Docket Number</span>
                <span className="text-base text-white font-extrabold">{profile.mcNumber}</span>
                <span className="text-[10px] text-emerald-400 font-semibold block">✓ Common Carrier of Property</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Federal Taxpayer ID (EIN)</span>
                <span className="text-base text-white font-extrabold">{profile.einTaxId}</span>
                <span className="text-[10px] text-slate-400 font-semibold block">IRS Form 1099/W-2 Certified</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">SCAC & D&B Registry</span>
                <span className="text-base text-white font-extrabold">{scacCode} • 08-392-1940</span>
                <span className="text-[10px] text-blue-400 font-semibold block">Commercial Credit Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Managing Executive</span>
                <strong className="text-white text-sm block">{profile.founderName} (CEO & Operating Officer)</strong>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Liability & Cargo Insurance</span>
                <strong className="text-emerald-400 text-sm block">Form BMC-91X ($2,000,000 Policy)</strong>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">HQ Terminal Facility</span>
                <strong className="text-slate-200 text-sm block">{profile.hqAddress}, {profile.hqCity}, {profile.hqState}</strong>
              </div>
            </div>
          </div>

          {/* Operational Footprint */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              Authorized Regional Jurisdictions
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['America', 'Europe', 'Asia', 'Africa'] as const).map(region => {
                const isUnlocked = (state.unlockedRegions || ['America']).includes(region);
                return (
                  <div key={region} className={`p-3 rounded-2xl border ${isUnlocked ? 'bg-slate-950 border-emerald-500/40 text-white' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{region}</span>
                      <span className={`text-[10px] font-mono ${isUnlocked ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>
                        {isUnlocked ? 'Active Rights' : 'Locked'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: FINANCIAL BALANCE SHEET */}
      {activeSection === 'financials' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2 uppercase tracking-wider font-mono">
                <Landmark className="w-4 h-4 text-emerald-400" />
                <span>Enterprise Consolidated Balance Sheet</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">FY2026 Audit Ready</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Cash Treasury</span>
                <span className="text-base text-emerald-400 font-black font-mono mt-1 block">${Math.round(state.cash).toLocaleString()}</span>
                <span className="text-[10px] text-slate-400">Liquid Working Capital</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Operating Tractors</span>
                <span className="text-base text-white font-black font-mono mt-1 block">${Math.round(fleetValue).toLocaleString()}</span>
                <span className="text-[10px] text-slate-400">{state.trucks.length} Commercial Rigs</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Trailer Inventory</span>
                <span className="text-base text-white font-black font-mono mt-1 block">${Math.round(trailerValue).toLocaleString()}</span>
                <span className="text-[10px] text-slate-400">{state.trailers.length} Semi-Trailers ({totalPayloadCapacityTons}T Payload)</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Bulk Fuel Reserves</span>
                <span className="text-base text-amber-400 font-black font-mono mt-1 block">${fuelReserveValue.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400">{(state.bulkFuelReserveLitres || 0).toLocaleString()} Litres Reserve</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Depot Infrastructure</span>
                <span className="text-base text-white font-black font-mono mt-1 block">${depotInfrastructureValue.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400">Terminals & Service Bays</span>
              </div>
            </div>

            {/* Corporate Credit Rating */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Commercial Credit Score (Dun & Bradstreet Paydex)</span>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-black text-emerald-400 font-mono">{profile.creditRating} Grade ({profile.creditScore} / 850)</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold rounded-lg border border-emerald-500/30">
                    Prime Borrower
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-400 font-mono space-y-0.5">
                <div>Corporate Tax Bracket: <strong className="text-amber-400">{(profile.corporateTaxRate * 100).toFixed(0)}% Effective</strong></div>
                <div>Fleet Insurance Premium: <strong className="text-slate-200">${profile.insuranceMonthlyPerTruck} / vehicle / month</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SAFETY AUDIT (SMS BASICS) */}
      {activeSection === 'safety' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 uppercase tracking-wider font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>FMCSA Safety Measurement System (SMS BASICs)</span>
            </h3>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs rounded-lg border border-emerald-500/30">
              SAFETY RATING: SATISFACTORY (CLEAN)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Unsafe Driving BASIC</span>
              <div className="text-lg font-black text-emerald-400 font-mono">0.0% (Clean Record)</div>
              <p className="text-[10px] text-slate-500">Zero active speeding or reckless driving infractions recorded.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Hours of Service (HOS) Compliance</span>
              <div className="text-lg font-black text-emerald-400 font-mono">100% ELD Verified</div>
              <p className="text-[10px] text-slate-500">Electronic logging device compliant across all active tractors.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Vehicle Maintenance & Pre-Trip</span>
              <div className="text-lg font-black text-emerald-400 font-mono">{fleetAvgCondition}% Fleet Health Score</div>
              <p className="text-[10px] text-slate-500">Regular HQ repair bay servicing keeps out-of-service violations low.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Driver Fitness & CDL Endorsement</span>
              <div className="text-lg font-black text-emerald-400 font-mono">100% Certified</div>
              <p className="text-[10px] text-slate-500">Class A, HazMat, and Tanker endorsements verified with state DMVs.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Customer Brand Reputation</span>
              <div className="text-lg font-black text-amber-400 font-mono">{Math.floor(profile.brandScore || 65)} / 100</div>
              <p className="text-[10px] text-slate-500">Shipper trust metric derived from on-time delivery track record.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Lifetime Deliveries Finished</span>
              <div className="text-lg font-black text-white font-mono">{state.stats?.deliveriesCompleted || 0} Successful Hauls</div>
              <p className="text-[10px] text-slate-500">Total verified freight contracts fulfilled without contract breach.</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: CORPORATE LEGAL GOVERNANCE & ENTITY STRUCTURE */}
      {activeSection === 'governance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 uppercase tracking-wider font-mono">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Corporate Entity Structure & Capital Formation</span>
            </h3>
            <span className="text-xs text-blue-400 font-mono font-bold">Active Structure: {profile.corporateStructure}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* LLC */}
            <div className={`p-5 rounded-2xl border transition relative space-y-3 ${
              profile.corporateStructure === 'LLC'
                ? 'bg-blue-600/15 border-blue-500 shadow-xl shadow-blue-950'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-white">Limited Liability Co. (LLC)</span>
                {profile.corporateStructure === 'LLC' && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Standard commercial carrier entity shielding owner assets. 21% flat corporate tax rate with pass-through flexibility.
              </p>
              <div className="text-[10px] font-mono text-slate-400 space-y-0.5 pt-2 border-t border-slate-800">
                <div>Tax Rate: <strong className="text-white">21%</strong></div>
                <div>Capital Access: <strong className="text-white">Commercial Bank Loans</strong></div>
              </div>
              {profile.corporateStructure !== 'LLC' && (
                <button
                  onClick={() => onUpgradeStructure('LLC')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                >
                  Restructure to LLC
                </button>
              )}
            </div>

            {/* C-Corporation */}
            <div className={`p-5 rounded-2xl border transition relative space-y-3 ${
              profile.corporateStructure === 'Corporation'
                ? 'bg-blue-600/15 border-blue-500 shadow-xl shadow-blue-950'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-white">C-Corporation (Enterprise)</span>
                {profile.corporateStructure === 'Corporation' && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Institutional corporate framework. 18% corporate tax rate. Unlocks private investor equity placements and enterprise lines of credit.
              </p>
              <div className="text-[10px] font-mono text-slate-400 space-y-0.5 pt-2 border-t border-slate-800">
                <div>Tax Rate: <strong className="text-white">18% (14% reduction)</strong></div>
                <div>Capital Access: <strong className="text-white">Angel & Venture Equity</strong></div>
              </div>
              {profile.corporateStructure !== 'Corporation' && (
                <button
                  onClick={() => onUpgradeStructure('Corporation')}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-900/30"
                >
                  Incorporate (C-Corp)
                </button>
              )}
            </div>

            {/* Publicly Traded IPO */}
            <div className={`p-5 rounded-2xl border transition relative space-y-3 ${
              profile.corporateStructure === 'Publicly Traded (IPO)'
                ? 'bg-blue-600/15 border-blue-500 shadow-xl shadow-blue-950'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-white">Publicly Traded (IPO)</span>
                {profile.corporateStructure === 'Publicly Traded (IPO)' && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Listed on major stock exchanges. 15% corporate tax rate. Unlocks public share offerings and institutional bond issuance.
              </p>
              <div className="text-[10px] font-mono text-slate-400 space-y-0.5 pt-2 border-t border-slate-800">
                <div>Tax Rate: <strong className="text-white">15% (28% reduction)</strong></div>
                <div>Capital Access: <strong className="text-white">Public Capital Markets</strong></div>
              </div>
              {profile.corporateStructure !== 'Publicly Traded (IPO)' && (
                <button
                  onClick={() => onUpgradeStructure('Publicly Traded (IPO)')}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-900/30"
                >
                  Launch Public IPO
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
