import React from 'react';
import { Compass, Briefcase, GraduationCap, Sparkles, CheckSquare } from 'lucide-react';

export type TabKey = 'explore' | 'careers' | 'courses' | 'ai_chat' | 'plan';

interface AndroidNavBarProps {
  currentTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  savedCount: number;
  activePlanCount: number;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  currentTab,
  onTabChange,
  activePlanCount,
}) => {
  const tabs = [
    { key: 'explore' as TabKey, label: 'Explore', icon: Compass },
    { key: 'careers' as TabKey, label: 'Careers', icon: Briefcase },
    { key: 'courses' as TabKey, label: 'Courses', icon: GraduationCap },
    { key: 'ai_chat' as TabKey, label: 'AI Guide', icon: Sparkles, highlight: true },
    { key: 'plan' as TabKey, label: 'My Plan', icon: CheckSquare, badge: activePlanCount },
  ];

  return (
    <nav
      className="w-full bg-[#162720] border-t border-emerald-900/40 text-stone-300 px-2 py-1 flex items-center justify-around z-30 shrink-0 shadow-lg select-none"
      aria-label="Android Bottom Navigation"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`group relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all duration-200 tap-bounce ${
              isActive ? 'text-emerald-300 font-semibold' : 'text-stone-400 hover:text-stone-200'
            }`}
            aria-selected={isActive}
            role="tab"
          >
            {/* Material 3 active pill background */}
            <div
              className={`relative px-4 py-1 rounded-full transition-all duration-200 ${
                isActive
                  ? tab.highlight
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-950/50 scale-105'
                    : 'bg-emerald-800/80 text-emerald-200 shadow-sm'
                  : 'group-hover:bg-emerald-950/40'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}
              />

              {/* Badge indicator */}
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center justify-center leading-none">
                  {tab.badge}
                </span>
              ) : null}

              {/* Sparkle dot for AI */}
              {tab.highlight && !isActive && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>

            <span className="text-[11px] mt-0.5 tracking-tight">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
