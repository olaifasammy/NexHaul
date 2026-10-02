import React, { useState } from 'react';
import type { GameSaveState } from '../types/game';
import { exportSaveToJSON, importSaveFromJSON } from '../engine/storage';
import { getSaveSlots, getActiveSaveId } from '../engine/gameplayStorage';
import { Settings as SettingsIcon, Download, Upload, RotateCcw, Check, AlertCircle, Gamepad2, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface SettingsProps {
  state: GameSaveState;
  onResetSave: () => void;
  onImportSave: (newState: GameSaveState) => void;
  onNewGame: () => void;
  onSwitchGame: (saveId: string) => void;
  onDeleteGame: (saveId: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ state, onResetSave, onImportSave, onNewGame, onSwitchGame, onDeleteGame }) => {
  const [importText, setImportText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [importError, setImportError] = useState(false);

  const slots = getSaveSlots();
  const activeId = getActiveSaveId();

  const handleExport = () => {
    const json = exportSaveToJSON(state);
    navigator.clipboard.writeText(json);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const handleImportSubmit = () => {
    const parsed = importSaveFromJSON(importText);
    if (parsed) {
      onImportSave(parsed);
      setImportText('');
      setImportError(false);
      alert('Save game state imported successfully!');
    } else {
      setImportError(true);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-blue-400" />
          <span>Game Settings & Data Management</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage multiple gameplay save slots, start new enterprises, export/import backups, or reset progress.
        </p>
      </div>

      {/* Gameplay Save Slots & New Game Manager */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Gameplay Sessions & Save Slots</h3>
          </div>
          <button
            onClick={onNewGame}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Game</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {slots.length === 0 ? (
            <div className="text-xs text-slate-500 italic text-center py-4">No saved gameplays found.</div>
          ) : (
            slots.map((slot) => {
              const isActive = slot.id === activeId;
              return (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                    isActive
                      ? 'bg-blue-600/15 border-blue-500/40 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-white text-xs">{slot.companyName}</h4>
                      {isActive && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] font-extrabold rounded flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      CEO: {slot.founderName} • HQ: {slot.hqCity} • Lvl {slot.companyLevel} • ${slot.cash.toLocaleString()} • {slot.truckCount} Rigs
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isActive && (
                      <button
                        onClick={() => onSwitchGame(slot.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition"
                      >
                        Load
                      </button>
                    )}
                    {slots.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete save "${slot.companyName}"? This cannot be undone.`)) {
                            onDeleteGame(slot.id);
                          }
                        }}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                        title="Delete Save"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Export Save Data */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Backup Data</span>
        </h3>
        <p className="text-xs text-slate-400">
          Copy your active game save JSON string to clipboard.
        </p>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition flex items-center space-x-2"
        >
          {copySuccess ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          <span>{copySuccess ? 'Copied to Clipboard!' : 'Copy Save JSON'}</span>
        </button>
      </div>

      {/* Import Save Data */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
          <Upload className="w-4 h-4 text-blue-400" />
          <span>Import Backup Data</span>
        </h3>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Paste save game JSON string here..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono h-24 focus:outline-none focus:border-blue-500"
        />
        {importError && (
          <div className="text-xs text-rose-400 flex items-center space-x-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Invalid save file format! Please check the JSON string.</span>
          </div>
        )}
        <button
          onClick={handleImportSubmit}
          disabled={!importText.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition disabled:opacity-40"
        >
          Import & Overwrite Save
        </button>
      </div>

      {/* Reset Data */}
      <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-rose-400 flex items-center space-x-2">
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <span>Reset Company Progress</span>
        </h3>
        <p className="text-xs text-slate-400">
          Wipes local storage and restarts your logistics company from scratch.
        </p>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all progress? This action cannot be undone!')) {
              onResetSave();
            }
          }}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl transition"
        >
          Reset All Data
        </button>
      </div>

    </div>
  );
};
