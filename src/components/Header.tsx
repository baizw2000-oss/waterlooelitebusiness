import React from 'react';
import { TabType, UserProfile } from '../types';
import { Award, Smartphone, Monitor, Sparkles, User } from 'lucide-react';

interface HeaderProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  userPoints: number;
  user: UserProfile;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  onOpenSmartMatch: () => void;
  isFirestoreConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  userPoints,
  user,
  isMobileFrame,
  setIsMobileFrame,
  onOpenSmartMatch,
  isFirestoreConnected = true,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-amber-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => setCurrentTab('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-700 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center border border-amber-400/40">
                <span className="text-xl sm:text-2xl font-serif font-black bg-gradient-to-br from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
                  商
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  滑铁卢名商会
                  <span className="hidden sm:inline-block text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    WEBA
                  </span>
                </h1>
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] text-amber-400/70 hidden sm:block font-medium">
                  Waterloo Elite Business Association
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {[
              { id: 'home', label: '首页愿景' },
              { id: 'directory', label: '名商目录' },
              { id: 'help', label: '商机互助圈' },
              { id: 'events', label: '活动报名' },
              { id: 'points', label: '积分商城' },
              { id: 'profile', label: '个人中心' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as TabType)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentTab === tab.id
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Action Tools & User Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* AI Smart Match Trigger */}
            <button
              onClick={onOpenSmartMatch}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-400/40 text-cyan-200 hover:from-cyan-600/50 hover:to-blue-600/50 transition-all shadow-sm shadow-cyan-500/20"
              title="使用Gemini AI匹配滑铁卢本地商户与互助商机"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span className="hidden sm:inline">AI商机撮合</span>
              <span className="sm:hidden">AI撮合</span>
            </button>

            {/* View Mode Switcher */}
            <button
              onClick={() => setIsMobileFrame(!isMobileFrame)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isMobileFrame
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="切换手机App预览框架与桌面大屏模式"
            >
              {isMobileFrame ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden lg:inline">手机视口</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">宽屏模式</span>
                </>
              )}
            </button>

            {/* Member Points & Profile Chip */}
            <button 
              onClick={() => setCurrentTab('profile')}
              className={`flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full border transition-all ${
                currentTab === 'profile'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-800/90 border-amber-500/30 hover:border-amber-400/60 text-slate-200'
              }`}
              title="查看个人中心与资料"
            >
              <span className="text-base">{user.avatar}</span>
              <span className="text-xs font-bold text-amber-300">
                {userPoints.toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-500/70 hidden sm:inline">分</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
