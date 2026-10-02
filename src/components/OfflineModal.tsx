import type { OfflineProgressSummary } from '../types/game';
import { Award, DollarSign, Fuel, MapPin, CheckCircle2 } from 'lucide-react';

interface OfflineModalProps {
  summary: OfflineProgressSummary;
  onClose: () => void;
}

export const OfflineModal: React.FC<OfflineModalProps> = ({ summary, onClose }) => {
  const elapsedMinutes = Math.floor(summary.elapsedSeconds / 60);
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  const remainingMins = elapsedMinutes % 60;

  const timeText = elapsedHours > 0 
    ? `${elapsedHours}h ${remainingMins}m` 
    : `${elapsedMinutes} minute(s)`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-blue-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        
        {/* Banner */}
        <div className="text-center space-y-1">
          <div className="w-14 h-14 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-blue-500/30">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Welcome Back, Dispatcher!</h2>
          <p className="text-xs text-slate-300">
            Your logistics fleet remained active while you were away for <strong className="text-blue-400 font-mono">{timeText}</strong>.
          </p>
        </div>

        {/* Offline Summary Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-400 font-medium flex items-center space-x-1 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offline Revenue</span>
            </div>
            <div className="text-lg font-extrabold text-emerald-400 font-mono">
              +${summary.totalCashEarned.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-400 font-medium flex items-center space-x-1 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Deliveries Done</span>
            </div>
            <div className="text-lg font-extrabold text-white font-mono">
              {summary.completedContractsCount} Contracts
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-400 font-medium flex items-center space-x-1 mb-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Miles Haul</span>
            </div>
            <div className="text-lg font-extrabold text-slate-200 font-mono">
              {Math.floor(summary.totalMilesDriven).toLocaleString()} mi
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-400 font-medium flex items-center space-x-1 mb-1">
              <Fuel className="w-3.5 h-3.5 text-rose-400" />
              <span>Fuel Consumed</span>
            </div>
            <div className="text-lg font-extrabold text-slate-200 font-mono">
              {Math.floor(summary.totalFuelConsumedGallons)} Gal
            </div>
          </div>

        </div>

        {/* Action button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition"
        >
          Collect Earnings & Resume Operations
        </button>

      </div>
    </div>
  );
};
