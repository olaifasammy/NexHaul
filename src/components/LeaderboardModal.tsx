import React, { useState } from 'react';
import type { GameSaveState } from '../types/game';
import { Globe, X, Trophy, MapPin } from 'lucide-react';

interface LeaderboardModalProps {
  state: GameSaveState;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ state, onClose }) => {
  const [scope, setScope] = useState<'global' | 'regional' | 'country'>('global');
  const [rankBy, setRankBy] = useState<'wealth' | 'miles'>('wealth');

  const playerWealth = state.cash + 
    state.trucks.reduce((sum, t) => sum + (t.price || 50000), 0) +
    state.trailers.reduce((sum, t) => sum + (t.price || 15000), 0);

  const playerMiles = Math.floor(state.stats?.totalMilesDriven || 0);

  // Rival companies list with region and country tags
  const rivals = [
    { name: 'Global Freight Corp', region: 'America', country: 'USA', wealth: 3450000, miles: 68400, logo: '🌐' },
    { name: 'Trans-Euro Logistics', region: 'Europe', country: 'Germany', wealth: 2890000, miles: 54200, logo: '🇪🇺' },
    { name: 'Pacific Express', region: 'America', country: 'USA', wealth: 2150000, miles: 41800, logo: '🚛' },
    { name: 'Nippon Cargo Lines', region: 'Asia', country: 'Japan', wealth: 1840000, miles: 36900, logo: '🇯🇵' },
    { name: 'Atlas Interstate', region: 'America', country: 'USA', wealth: 1250000, miles: 24500, logo: '⛰️' },
    { name: 'EuroHaul GmbH', region: 'Europe', country: 'Germany', wealth: 980000, miles: 19800, logo: '🇩🇪' },
    { name: 'Silk Road Trans', region: 'Asia', country: 'China', wealth: 810000, miles: 15600, logo: '🌏' },
    { name: 'Nordic Freight AB', region: 'Europe', country: 'Sweden', wealth: 640000, miles: 12300, logo: '❄️' },
    { name: 'Alpine Express', region: 'Europe', country: 'Switzerland', wealth: 520000, miles: 9800, logo: '🏔️' },
    { name: 'Kobe Heavy Transport', region: 'Asia', country: 'Japan', wealth: 450000, miles: 8200, logo: '🗼' }
  ];

  // Include player company
  const playerCompany = {
    name: state.companyName || 'Apex Transport Co.',
    region: 'America',
    country: 'USA',
    wealth: playerWealth,
    miles: playerMiles,
    logo: state.profile?.logoIcon || '🚚',
    isPlayer: true
  };

  const allCompanies = [...rivals, playerCompany];

  // Filter by scope
  const filteredCompanies = allCompanies.filter(c => {
    if (scope === 'regional') return c.region === 'America';
    if (scope === 'country') return c.country === 'USA';
    return true; // global
  });

  // Sort by metric
  filteredCompanies.sort((a, b) => {
    if (rankBy === 'wealth') return b.wealth - a.wealth;
    return b.miles - a.miles;
  });

  const findPlayerRank = filteredCompanies.findIndex(c => c.isPlayer) + 1;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/30">
              <Globe className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Global Logistics Rankings</h3>
              <p className="text-xs text-slate-400">Competitive Enterprise Leaderboard</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters: Scope & Rank By */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['global', 'regional', 'country'] as const).map(s => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={`py-1.5 rounded-lg font-bold capitalize transition ${
                  scope === s ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setRankBy('wealth')}
              className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center space-x-1.5 ${
                rankBy === 'wealth' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Rank by Wealth</span>
            </button>
            <button
              onClick={() => setRankBy('miles')}
              className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center space-x-1.5 ${
                rankBy === 'miles' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Rank by Miles Covered</span>
            </button>
          </div>
        </div>

        {/* Player Rank Highlight */}
        <div className="bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-500/30 p-3.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-black text-blue-400 font-mono">#{findPlayerRank}</div>
            <div>
              <div className="text-xs font-bold text-white">Your Standing ({state.companyName})</div>
              <div className="text-[10px] text-slate-400">Scope: {scope.toUpperCase()} • Metric: {rankBy.toUpperCase()}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-emerald-400">
              {rankBy === 'wealth' ? `$${playerWealth.toLocaleString()}` : `${playerMiles.toLocaleString()} mi`}
            </div>
          </div>
        </div>

        {/* Rankings Table */}
        <div className="space-y-2">
          {filteredCompanies.map((company, index) => {
            const isPlayer = company.isPlayer;
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-xl border transition ${
                  isPlayer 
                    ? 'bg-blue-600/15 border-blue-500/40 shadow-md' 
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                    index === 0 ? 'bg-amber-500 text-slate-950 font-black' :
                    index === 1 ? 'bg-slate-300 text-slate-950 font-bold' :
                    index === 2 ? 'bg-amber-700 text-white font-bold' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="text-xl">{company.logo}</div>
                  <div>
                    <h4 className={`font-bold text-xs ${isPlayer ? 'text-blue-400' : 'text-white'}`}>
                      {company.name} {isPlayer && '(You)'}
                    </h4>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1.5">
                      <span>{company.region}</span>
                      <span>•</span>
                      <span>{company.country}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs font-extrabold text-emerald-400">
                    ${company.wealth.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {company.miles.toLocaleString()} mi
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
