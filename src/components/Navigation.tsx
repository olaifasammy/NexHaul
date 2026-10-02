import React from 'react';
import { Home, Scroll, Truck, Fuel, Building2, ShoppingCart } from 'lucide-react';

export type TabType = 'dashboard' | 'freight' | 'fleet' | 'maintenance' | 'market' | 'fuel' | 'depot';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  availableContractsCount: number;
  activeDispatchesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  availableContractsCount,
  activeDispatchesCount
}) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Home', icon: Home, badge: activeDispatchesCount > 0 ? activeDispatchesCount : null },
    { id: 'freight' as TabType, label: 'Jobs', icon: Scroll, badge: availableContractsCount },
    { id: 'fleet' as TabType, label: 'Garage', icon: Truck, badge: null },
    { id: 'market' as TabType, label: 'Market', icon: ShoppingCart, badge: null },
    { id: 'fuel' as TabType, label: 'Fuel Hub', icon: Fuel, badge: null },
    { id: 'depot' as TabType, label: 'HQ Depot', icon: Building2, badge: null },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800/90 backdrop-blur-xl pb-safe">
      <div className="max-w-md mx-auto px-2 py-2 flex items-center justify-between overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-150 active:scale-95 flex-shrink-0 min-w-[56px] ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${isActive ? 'scale-125 stroke-[2.5]' : 'stroke-[1.5]'}`} />
                {tab.badge !== null && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 text-[8px] font-extrabold px-1 rounded-full border border-slate-900 animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight whitespace-nowrap">{tab.label}</span>

              {/* Active Pill Indicator */}
              {isActive && (
                <span className="absolute -bottom-1.5 w-4 h-1 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
