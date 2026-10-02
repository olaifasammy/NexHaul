import React from 'react';
import type { GameSaveState } from '../types/game';
import { SKILL_TREE } from '../data/skills';
import { Zap, Plus, CheckCircle2 } from 'lucide-react';

interface SkillTreeProps {
  state: GameSaveState;
  onUpgradeSkill: (skillId: string) => void;
}

export const SkillTree: React.FC<SkillTreeProps> = ({ state, onUpgradeSkill }) => {
  // Skill points become less frequent as the company matures.
  // This keeps an effectively infinite company level from producing
  // thousands of meaningless skill points.
  const level = Math.max(1, state.companyLevel || 1);
  const totalSkillPoints =
    level <= 10
      ? level
      : 10 + Math.floor((level - 10) / 2);

  const spentPoints = Object.entries(state.skills || {}).reduce((sum, [id, lvl]) => {
    const skillObj = SKILL_TREE.find(s => s.id === id);
    return sum + ((lvl || 0) * (skillObj?.costPoints || 1));
  }, 0);
  const availablePoints = Math.max(0, totalSkillPoints - spentPoints);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Company Masteries & RPG Skills</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Develop your carrier through professional training, fleet management, logistics, safety, and specialized freight operations.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-right">
          <div className="text-[10px] uppercase font-bold text-slate-400">Available Points</div>
          <div className="text-xl font-extrabold text-amber-400 font-mono">{availablePoints} SP</div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SKILL_TREE.map((skill) => {
          const currentLvl = state.skills[skill.id] || 0;
          const isMax = currentLvl >= skill.maxLevel;
          const canUpgrade = availablePoints >= skill.costPoints && !isMax;

          return (
            <div 
              key={skill.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl p-2.5 bg-slate-800 rounded-2xl">{skill.icon}</div>
                    <div>
                      <h3 className="font-bold text-white text-base">{skill.name}</h3>
                      <span className="text-xs text-blue-400 font-semibold">{skill.category} Specialty</span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-800 text-amber-400 rounded-lg">
                    Level {currentLvl} / {skill.maxLevel}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {skill.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400 font-medium">
                  Cost: <strong className="text-amber-400 font-mono">{skill.costPoints} SP</strong> / Tier
                </div>

                {!isMax ? (
                  <button
                    onClick={() => onUpgradeSkill(skill.id)}
                    disabled={!canUpgrade}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition disabled:opacity-40 flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Unlock Tier</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mastered</span>
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
