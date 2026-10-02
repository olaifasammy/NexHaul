import React from 'react';
import type { GameSaveState, OfficeStaff, StaffRole } from '../types/game';
import { Users, UserPlus, Briefcase, DollarSign, Award, Trash2 } from 'lucide-react';

interface StaffManagerProps {
  state: GameSaveState;
  onHireStaff: (role: StaffRole, name: string, salary: number, skill: number, bonus: number) => void;
  onFireStaff: (staffId: string) => void;
}

const CANDIDATE_POOL = [
  { name: 'Sarah Jenkins', role: 'dispatcher' as StaffRole, salary: 3500, skill: 85, bonus: 12 },
  { name: 'Marcus Sterling', role: 'accountant' as StaffRole, salary: 4200, skill: 90, bonus: 15 },
  { name: 'Elena Rostova', role: 'mechanic' as StaffRole, salary: 3800, skill: 88, bonus: 20 },
  { name: 'David Thorne', role: 'hr_manager' as StaffRole, salary: 4000, skill: 82, bonus: 10 },
  { name: 'Rachel Chen', role: 'safety_officer' as StaffRole, salary: 3600, skill: 86, bonus: 18 }
];

export const StaffManager: React.FC<StaffManagerProps> = ({ state, onHireStaff, onFireStaff }) => {
  const staffList = state.staff || [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Briefcase className="w-5 h-5 text-blue-400" />
          <span>Office & Headquarters Staff</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Hire corporate specialists to automate dispatch efficiency, reduce tax liabilities, minimize fleet wear, and boost driver morale.
        </p>
      </div>

      {/* Active Staff Roster */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Active Corporate Staff ({staffList.length})</span>
        </h3>

        {staffList.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs italic">
            No office staff hired yet. Hire specialists below to gain corporate buffs.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {staffList.map((member) => (
              <div key={member.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{member.name}</h4>
                    <div className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">{member.role.replace('_', ' ')}</div>
                  </div>
                  <button
                    onClick={() => onFireStaff(member.id)}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                    title="Terminate Contract"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-900 p-2 rounded-lg">
                    <span className="text-slate-500 block text-[9px]">Monthly Salary</span>
                    <span className="text-amber-400 font-bold">${member.salaryMonthly.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg">
                    <span className="text-slate-500 block text-[9px]">Efficiency Bonus</span>
                    <span className="text-emerald-400 font-bold">+{member.efficiencyBonus}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hire Candidates Pool */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <UserPlus className="w-4 h-4 text-blue-400" />
          <span>Available Candidates for Hire</span>
        </h3>

        <div className="space-y-3">
          {CANDIDATE_POOL.map((candidate, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-white text-sm">{candidate.name}</h4>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold uppercase">
                    {candidate.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Skill Rating: <strong className="text-white">{candidate.skillRating}/100</strong> • Monthly Salary: <strong className="text-amber-400">${candidate.salary.toLocaleString()}</strong> • Bonus: <strong className="text-emerald-400">+{candidate.bonus}%</strong>
                </div>
              </div>

              <button
                onClick={() => onHireStaff(candidate.role, candidate.name, candidate.salary, candidate.skill, candidate.bonus)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex-shrink-0"
              >
                Hire Specialist
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
