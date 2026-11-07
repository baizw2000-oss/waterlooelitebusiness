import React from 'react';
import { TabType } from '../types';
import { Home, Search, Users, Calendar, Award, Cpu, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  unreadHelpCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  unreadHelpCount = 0,
}) => {
  const tabs = [
    { id: 'home', label: '首页', icon: Home },
    { id: 'directory', label: '名商录', icon: Search },
    { id: 'help', label: '互助圈', icon: Users, badge: unreadHelpCount },
    { id: 'events', label: '活动', icon: Calendar },
    { id: 'points', label: '积分', icon: Award },
    { id: 'profile', label: '我的', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 shadow-2xl py-1.5 px-2 md:hidden">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as TabType)}
              className="relative flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all"
            >
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'text-amber-400 bg-amber-500/15'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900" />
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 font-medium ${
                  isActive ? 'text-amber-300 font-semibold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
