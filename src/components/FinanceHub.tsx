import React, { useState } from 'react';
import type { GameSaveState, BankLoan } from '../types/game';
import { Landmark, DollarSign, CreditCard, ArrowDownRight, ArrowUpRight, ShieldCheck, TrendingUp } from 'lucide-react';
import { InvestorsHub } from './InvestorsHub';

interface FinanceHubProps {
  state: GameSaveState;
  onTakeLoan: (principal: number, termMonths: number, title: string, lender: string) => void;
  onRepayLoan: (loanId: string) => void;
  onAcceptInvestor?: (roundId: string) => void;
  onLaunchIPO?: () => void;
  onPayDividend?: (amount: number) => void;
  onClaimMilestone?: (milestoneId: string) => void;
}

export const FinanceHub: React.FC<FinanceHubProps> = ({ state, onTakeLoan, onRepayLoan, onAcceptInvestor, onLaunchIPO, onPayDividend, onClaimMilestone }) => {
  const [selectedLoanType, setSelectedLoanType] = useState<'equipment' | 'working' | 'expansion'>('equipment');
  const [activeSubTab, setActiveSubTab] = useState<'banking' | 'milestones' | 'analytics'>('banking');

  const creditScore = state.profile?.creditScore || 720;
  
  // Calculate Interest rate based on credit score
  const getInterestRate = (baseRate: number) => {
    const scoreDiff = 850 - creditScore;
    const penalty = (scoreDiff / 500) * 0.04;
    return +(baseRate + penalty).toFixed(3);
  };

  const equipmentRate = getInterestRate(0.065);
  const workingRate = getInterestRate(0.085);
  const expansionRate = getInterestRate(0.055);

  const totalAssets = state.cash + 
    state.trucks.reduce((sum, t) => sum + (t.price || 50000), 0) +
    state.trailers.reduce((sum, t) => sum + (t.price || 15000), 0) +
    (state.bulkFuelReserveLitres * 1.2);

  const totalLiabilities = state.loans.reduce((sum, l) => sum + l.remainingBalance, 0);
  const netEquity = totalAssets - totalLiabilities;

  const handleApplyLoan = () => {
    if (selectedLoanType === 'equipment') {
      onTakeLoan(50000, 24, 'Equipment Financing Loan', 'First National Transport Bank');
    } else if (selectedLoanType === 'working') {
      onTakeLoan(20000, 12, 'Working Capital Line of Credit', 'Commercial Credit Union');
    } else {
      onTakeLoan(200000, 60, 'HQ Expansion Mortgage', 'Global Infrastructure Bank');
    }
  };

  // Milestone Progression Checking (Phase 9)
  const getMilestoneProgress = (m: any) => {
    switch (m.type) {
      case 'earnings': return state.stats.deliveriesCompleted;
      case 'fleet': return state.trucks.length;
      case 'miles': return Math.floor(state.stats.totalMilesDriven);
      case 'level': return state.companyLevel;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Landmark className="w-5 h-5 text-blue-400" />
          <span>Corporate Finance & Banking</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage commercial loans, review balance sheets, track company growth milestones, and leverage analytics dashboards.
        </p>
      </div>

      {/* Finance Navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
         <button
           onClick={() => setActiveSubTab('banking')}
           className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
             activeSubTab === 'banking' ? 'bg-slate-800 text-blue-400 border border-blue-500/30' : 'text-slate-400'
           }`}
         >
           🏦 Banking & Loans
         </button>
         <button
           onClick={() => setActiveSubTab('milestones')}
           className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
             activeSubTab === 'milestones' ? 'bg-slate-800 text-blue-400 border border-blue-500/30' : 'text-slate-400'
           }`}
         >
           🏆 Growth Milestones
         </button>
         <button
           onClick={() => setActiveSubTab('analytics')}
           className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
             activeSubTab === 'analytics' ? 'bg-slate-800 text-blue-400 border border-blue-500/30' : 'text-slate-400'
           }`}
         >
           📊 Business Analytics
         </button>
      </div>

      {activeSubTab === 'banking' && (
        <>
          {/* Credit Score & Balance Sheet Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Credit Rating</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">{state.profile?.creditRating || 'A'}</span>
            <span className="text-xs font-mono text-slate-400">({creditScore} / 850)</span>
          </div>
          <p className="text-[10px] text-slate-400">Lower interest rates unlocked with higher credit.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Assets</span>
            <ArrowUpRight className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ${Math.round(totalAssets).toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400">Fleet valuation + Cash + Fuel reserves.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Net Equity</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ${Math.round(netEquity).toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400">Assets minus outstanding bank liabilities.</p>
        </div>
      </div>

      {/* Active Loans Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <CreditCard className="w-4 h-4 text-blue-400" />
          <span>Active Bank Loans & Liabilities</span>
        </h3>

        {state.loans.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs italic">
            No active loans. Your enterprise is currently 100% debt-free.
          </div>
        ) : (
          <div className="space-y-3">
            {state.loans.map((loan) => {
              const progressPct = Math.round(((loan.totalMonths - loan.remainingMonths) / loan.totalMonths) * 100);
              return (
                <div key={loan.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{loan.title}</h4>
                      <div className="text-[10px] text-slate-400">{loan.lenderName} • {(loan.interestRateAnnual * 100).toFixed(1)}% APR</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-amber-400">${Math.round(loan.remainingBalance).toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">Monthly: ${Math.round(loan.monthlyPayment).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Term: {loan.remainingMonths} / {loan.totalMonths} months remaining</span>
                      <span>{progressPct}% Repaid</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => onRepayLoan(loan.id)}
                      disabled={state.cash < loan.remainingBalance}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition disabled:opacity-40"
                    >
                      Pay Off Entire Balance (${Math.round(loan.remainingBalance).toLocaleString()})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Apply For New Loan Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Landmark className="w-4 h-4 text-emerald-400" />
          <span>Apply For Commercial Loan</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setSelectedLoanType('equipment')}
            className={`p-3 rounded-xl border text-left transition space-y-1 ${
              selectedLoanType === 'equipment' ? 'bg-blue-600/10 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-xs">Equipment Loan</div>
            <div className="text-lg font-black font-mono text-emerald-400">$50,000</div>
            <div className="text-[10px]">24 Months • {(equipmentRate * 100).toFixed(1)}% APR</div>
          </button>

          <button
            onClick={() => setSelectedLoanType('working')}
            className={`p-3 rounded-xl border text-left transition space-y-1 ${
              selectedLoanType === 'working' ? 'bg-blue-600/10 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-xs">Working Capital</div>
            <div className="text-lg font-black font-mono text-emerald-400">$20,000</div>
            <div className="text-[10px]">12 Months • {(workingRate * 100).toFixed(1)}% APR</div>
          </button>

          <button
            onClick={() => setSelectedLoanType('expansion')}
            className={`p-3 rounded-xl border text-left transition space-y-1 ${
              selectedLoanType === 'expansion' ? 'bg-blue-600/10 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-xs">HQ Mortgage</div>
            <div className="text-lg font-black font-mono text-emerald-400">$200,000</div>
            <div className="text-[10px]">60 Months • {(expansionRate * 100).toFixed(1)}% APR</div>
          </button>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Subject to credit approval. Monthly payments are deducted automatically every game month.
          </div>
          <button
            onClick={handleApplyLoan}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition"
          >
            Secure Loan Funding
          </button>
        </div>
      </div>

      {/* Financial Statement Audit Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <CreditCard className="w-4 h-4 text-amber-400" />
          <span>Profit & Loss Audit Statements (Periodic Settlements)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Every 60 seconds of game time represents a financial settlement cycle where driver payroll, office staff salaries, commercial truck insurance, and bank debt amortizations are automatically debited from treasury.
        </p>

        {(!state.financialHistory || state.financialHistory.length === 0) ? (
          <div className="text-center py-6 text-slate-500 text-xs italic">
            No financial settlement cycles recorded yet. Keep driving to trigger the first accounting period!
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {state.financialHistory.map((stmt) => (
              <div key={stmt.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{stmt.periodLabel}</span>
                  <span className="font-mono text-slate-400">Ending Cash: <strong className="text-emerald-400">${stmt.cashEndPeriod.toLocaleString()}</strong></span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono bg-slate-900/60 p-2 rounded-lg">
                  <div>
                    <span className="text-slate-500 block">Driver Payroll</span>
                    <span className="text-amber-400">-${stmt.driverSalaries.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Staff Salaries</span>
                    <span className="text-amber-400">-${stmt.staffSalaries.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Fleet Insurance</span>
                    <span className="text-amber-400">-${stmt.insuranceExpenses.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Loan Interest</span>
                    <span className="text-amber-400">-${stmt.loanInterest.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {onAcceptInvestor && onLaunchIPO && onPayDividend && (
        <InvestorsHub
          state={state}
          onAcceptInvestor={onAcceptInvestor}
          onLaunchIPO={onLaunchIPO}
          onPayDividend={onPayDividend}
        />
      )}
        </>
      )}

      {activeSubTab === 'milestones' && (
         <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="border-b border-slate-800 pb-3">
               <h3 className="text-sm font-bold text-white">Enterprise Growth Milestones</h3>
               <p className="text-xs text-slate-400">Unlock company targets to claim high-value treasury cash bonuses.</p>
            </div>

            <div className="space-y-3">
               {(state.milestones || []).map((m) => {
                  const current = getMilestoneProgress(m);
                  const isCompleted = current >= m.target;
                  const progressPct = Math.min(100, Math.round((current / m.target) * 100));

                  return (
                     <div key={m.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                           <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-white text-xs">{m.title}</h4>
                              {m.isClaimed && (
                                 <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">Claimed</span>
                              )}
                              {!m.isClaimed && isCompleted && (
                                 <span className="text-[9px] font-bold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 animate-pulse">Pending Claim</span>
                              )}
                           </div>
                           <p className="text-[10px] text-slate-400">{m.description} (Progress: {current.toLocaleString()} / {m.target.toLocaleString()})</p>
                           
                           <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full" style={{ width: `${progressPct}%` }} />
                           </div>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0">
                           <div className="text-right">
                              <div className="text-[10px] uppercase text-slate-500 font-bold">Reward</div>
                              <div className="text-xs font-mono font-bold text-emerald-400">+${m.rewardCash.toLocaleString()}</div>
                           </div>

                           <button
                             onClick={() => {
                               if (onClaimMilestone) onClaimMilestone(m.id);
                             }}
                             disabled={!isCompleted || m.isClaimed}
                             className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-lg transition disabled:opacity-30 disabled:bg-slate-800"
                           >
                              {m.isClaimed ? 'Claimed' : 'Claim Reward'}
                           </button>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
      )}

      {activeSubTab === 'analytics' && (
         <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
               <div>
                  <h3 className="text-sm font-bold text-white">Business Analytics & Metrics Dashboard</h3>
                  <p className="text-xs text-slate-400">Lifetime operational metrics and corporate overhead reporting.</p>
               </div>
            </div>

            {/* Overall Stats Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
               <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Lifetime Freight Earnings</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm">${(state.stats?.totalEarnings || 0).toLocaleString()}</span>
               </div>
               <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Overhead Toll Expenses</span>
                  <span className="text-rose-400 font-bold font-mono text-sm">${(state.stats?.totalTollsPaid || 0).toLocaleString()}</span>
               </div>
               <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">DOT Safety Violations / Fines</span>
                  <span className="text-rose-400 font-bold font-mono text-sm">${(state.stats?.totalFinesPaid || 0).toLocaleString()}</span>
               </div>
               <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Fuel Burned</span>
                  <span className="text-amber-400 font-bold font-mono text-sm">{Math.round(state.stats?.fuelSpentGallons || 0).toLocaleString()} L</span>
               </div>
            </div>

            {/* Performance Over Time Summary */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
               <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Financial Performance Analysis</span>
               {state.financialHistory.length === 0 ? (
                  <div className="text-[11px] text-slate-400 italic text-center py-4">Establish monthly billing cycles to populate performance histories.</div>
               ) : (
                  <div className="space-y-2.5">
                     <p className="text-[10px] text-slate-400 leading-normal">
                        Your enterprise net income averages <strong className="text-emerald-400">${Math.round(state.financialHistory.reduce((sum, h) => sum + h.netProfit, 0) / state.financialHistory.length).toLocaleString()}</strong> per monthly cycle. Over {state.financialHistory.length} recorded cycles, total corporate tax optimization saved approximately <strong className="text-blue-400">${Math.round(state.financialHistory.reduce((sum, h) => sum + (h.taxesPaid * 0.15), 0)).toLocaleString()}</strong>.
                     </p>
                  </div>
               )}
            </div>
         </div>
      )}

    </div>
  );
};
