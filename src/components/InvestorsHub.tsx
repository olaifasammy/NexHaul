import React from 'react';
import type { GameSaveState, InvestorRound } from '../types/game';
import { TrendingUp, PieChart, Award, DollarSign, Building, Globe } from 'lucide-react';

interface InvestorsHubProps {
  state: GameSaveState;
  onAcceptInvestor: (roundId: string) => void;
  onLaunchIPO: () => void;
  onPayDividend: (amount: number) => void;
}

export const InvestorsHub: React.FC<InvestorsHubProps> = ({ state, onAcceptInvestor, onLaunchIPO, onPayDividend }) => {
  const ipo = state.ipo;
  const investors = state.investors;

  const totalEquityOwned = investors
    .filter(i => i.status === 'active')
    .reduce((sum, i) => sum + i.equityPercent, 0) + (ipo.isPubliclyTraded ? ipo.publicFloatPercent : 0);

  const founderEquity = Math.max(10, 100 - totalEquityOwned);

  const handleDividendClick = () => {
    const totalDiv = Math.floor(state.cash * 0.05);
    if (totalDiv > 100) {
      onPayDividend(totalDiv);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <span>Investors & Public Markets (IPO)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Secure venture capital rounds or take your logistics enterprise public on the stock exchange.
        </p>
      </div>

      {/* Equity Breakdown Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <PieChart className="w-4 h-4 text-blue-400" />
          <span>Company Ownership Distribution</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="text-[10px] text-slate-400">Founder Stake</div>
            <div className="text-xl font-black text-emerald-400 font-mono">{founderEquity.toFixed(1)}%</div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="text-[10px] text-slate-400">Venture / PE Investors</div>
            <div className="text-xl font-black text-blue-400 font-mono">
              {investors.filter(i => i.status === 'active').reduce((s, i) => s + i.equityPercent, 0).toFixed(1)}%
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="text-[10px] text-slate-400">Public Float (IPO)</div>
            <div className="text-xl font-black text-amber-400 font-mono">
              {ipo.isPubliclyTraded ? `${ipo.publicFloatPercent}%` : '0.0% (Private)'}
            </div>
          </div>
        </div>
      </div>

      {/* IPO / Public Market Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Public Stock Exchange (IPO)</span>
          </h3>
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
            ipo.isPubliclyTraded ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
          }`}>
            {ipo.isPubliclyTraded ? `Ticker: ${ipo.stockSymbol}` : 'Private Enterprise'}
          </span>
        </div>

        {ipo.isPubliclyTraded ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Share Price</div>
                <div className="text-lg font-bold font-mono text-emerald-400">${ipo.sharePrice.toFixed(2)}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Market Capitalization</div>
                <div className="text-lg font-bold font-mono text-white">${Math.round(ipo.marketCap).toLocaleString()}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Shares Outstanding</div>
                <div className="text-lg font-bold font-mono text-blue-400">{ipo.sharesOutstanding.toLocaleString()}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Total Dividends Paid</div>
                <div className="text-lg font-bold font-mono text-amber-400">${Math.round(ipo.totalDividendsPaid).toLocaleString()}</div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={handleDividendClick}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition"
              >
                Issue Shareholder Dividend (5% Treasury)
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              Taking your company public via an Initial Public Offering (IPO) raises massive capital by listing shares on the exchange, but subjects your leadership to public shareholders and quarterly earnings expectations.
            </p>
            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Requirement: Company Level 3+ & Credit Score 700+
              </div>
              <button
                onClick={onLaunchIPO}
                disabled={state.companyLevel < 3 || (state.profile?.creditScore || 700) < 700}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition disabled:opacity-40"
              >
                Launch Initial Public Offering (IPO)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Venture Capital Investment Rounds */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Award className="w-4 h-4 text-blue-400" />
          <span>Venture Capital & Private Equity Rounds</span>
        </h3>

        <div className="space-y-3">
          {investors.map((inv) => {
            const isActive = inv.status === 'active';
            const canUnlock = state.companyLevel >= inv.unlockedAtCompanyLevel && !isActive;

            return (
              <div key={inv.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-white text-sm">{inv.title}</h4>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isActive ? 'Secured' : `Tier ${inv.unlockedAtCompanyLevel} Req.`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">{inv.investorName} • Gives <strong className="text-emerald-400">${inv.capitalInjected.toLocaleString()}</strong> for <strong className="text-blue-400">{inv.equityPercent}% Equity</strong></div>
                </div>

                {!isActive && (
                  <button
                    onClick={() => onAcceptInvestor(inv.id)}
                    disabled={!canUnlock}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition disabled:opacity-40 flex-shrink-0"
                  >
                    Accept Funding Round
                  </button>
                )}
                {isActive && (
                  <span className="text-xs text-emerald-400 font-bold font-mono">Active Investment</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
