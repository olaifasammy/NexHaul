import React, { useState } from 'react';
import { Building2, User, MapPin, Sparkles } from 'lucide-react';

interface NewGameModalProps {
  onCreateGame: (companyName: string, founderName: string, hqCity: string, hqState: string, logoIcon: string) => void;
}

export const NewGameModal: React.FC<NewGameModalProps> = ({ onCreateGame }) => {
  const [companyName, setCompanyName] = useState('Apex Transport Co.');
  const [founderName, setFounderName] = useState('Alex Vance');
  const [hqCity, setHqCity] = useState('Dallas');
  const [hqState, setHqState] = useState('TX');
  const [logoIcon, setLogoIcon] = useState('🚚');

  const logos = ['🚚', '🌐', '📦', '⚡', '⛰️', '🚛', '⭐', '🔥'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    onCreateGame(companyName.trim(), founderName.trim(), hqCity.trim(), hqState.trim(), logoIcon);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        
        <div className="text-center space-y-1 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto text-2xl border border-blue-500/30">
            🚚
          </div>
          <h2 className="text-lg font-black text-white">Found New Logistics Enterprise</h2>
          <p className="text-xs text-slate-400">Establish your corporate identity and headquarters.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Company Name</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 font-bold"
              placeholder="e.g. Apex Transport Co."
            />
          </div>

          {/* Founder Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Founder & CEO Name</span>
            </label>
            <input
              type="text"
              value={founderName}
              onChange={(e) => setFounderName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 font-bold"
              placeholder="e.g. Alex Vance"
            />
          </div>

          {/* HQ Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>HQ City</span>
              </label>
              <input
                type="text"
                value={hqCity}
                onChange={(e) => setHqCity(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 font-bold"
                placeholder="Dallas"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">State / Region</label>
              <input
                type="text"
                value={hqState}
                onChange={(e) => setHqState(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 font-bold"
                placeholder="TX"
              />
            </div>
          </div>

          {/* Company Logo Icon Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Corporate Logo Badge</label>
            <div className="grid grid-cols-8 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              {logos.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setLogoIcon(icon)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition ${
                    logoIcon === icon ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 mt-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Logistics Enterprise</span>
          </button>

        </form>

      </div>
    </div>
  );
};
