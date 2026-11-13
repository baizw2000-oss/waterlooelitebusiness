import React from 'react';
import { TabType } from '../types';
import { Home, Search, Users, Calendar, Award, User } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

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
  const { t } = useLanguage();

  const tabs = [
    { id: 'home', label: t('首页', 'Home'), icon: Home },
    { id: 'directory', label: t('名商录', 'Directory'), icon: Search },
    { id: 'help', label: t('互助圈', 'Mutual Aid'), icon: Users, badge: unreadHelpCount },
    { id: 'events', label: t('活动', 'Events'), icon: Calendar },
    { id: 'points', label: t('积分', 'Rewards'), icon: Award },
    { id: 'profile', label: t('我的', 'Profile'), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#E8E6DF] shadow-lg py-1.5 px-2 md:hidden">
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
                    ? 'text-[#9E7425] bg-[#C5A059]/15'
                    : 'text-slate-500 hover:text-[#0F172A]'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 font-medium ${
                  isActive ? 'text-[#9E7425] font-bold' : 'text-slate-500'
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
