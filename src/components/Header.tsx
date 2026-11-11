import React from 'react';
import { TabType, UserProfile } from '../types';
import { Award, Sparkles, User, LogIn, ShieldCheck, UserCheck } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface HeaderProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  userPoints: number;
  user: UserProfile;
  onOpenSmartMatch: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  userPoints,
  user,
  onOpenSmartMatch,
  onOpenLogin,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-amber-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-18">
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => setCurrentTab('home')} 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-700 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center border border-amber-400/40">
                <span className="text-lg sm:text-2xl font-serif font-black bg-gradient-to-br from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
                  融
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                  滑铁卢融商汇
                  <span className="hidden sm:inline-block text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    WBCA
                  </span>
                </h1>
              </div>
              <p className="text-[10px] sm:text-[11px] text-amber-400/70 hidden sm:block font-medium whitespace-nowrap">
                Waterloo Business Convergence Alliance
              </p>
            </div>
          </div>

          {/* Desktop & Tablet Navigation (MD and up) */}
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
                className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
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
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* AI Smart Match Trigger */}
            <button
              onClick={onOpenSmartMatch}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-400/40 text-cyan-200 hover:from-cyan-600/50 hover:to-blue-600/50 transition-all shadow-sm shadow-cyan-500/20 active:scale-95"
              title="使用Gemini AI匹配滑铁卢本地商户与互助商机"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span className="hidden sm:inline">AI商机撮合</span>
              <span className="sm:hidden text-[11px]">AI撮合</span>
            </button>

            {/* Member Identity & Login Controls */}
            {user.isMember ? (
              <div className="flex items-center gap-1 sm:gap-1.5">
                {(() => {
                  const rawName = user.company || user.name || '融商会员';
                  const isClean = rawName && !rawName.startsWith('data:') && !rawName.startsWith('http') && rawName.length < 50;
                  const displayName = isClean ? rawName : '融商会员';

                  return (
                    <button 
                      onClick={() => setCurrentTab('profile')}
                      className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full border transition-all ${
                        currentTab === 'profile'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-800/90 border-amber-500/30 hover:border-amber-400/60 text-slate-200'
                      }`}
                      title={`实名融商企：${displayName} · 点击进入个人中心`}
                    >
                      <UserAvatar avatar={user.avatar} name={displayName} size="xs" className="w-5 h-5 rounded-full flex-shrink-0" />
                      <span className="text-[11px] sm:text-xs font-semibold text-white max-w-[65px] sm:max-w-[100px] truncate">
                        {displayName}
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40 font-bold">
                        <ShieldCheck className="w-2.5 h-2.5 text-sky-400" />
                        实名
                      </span>
                      <span className="text-xs font-bold text-amber-300 pl-0.5">
                        {userPoints.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-amber-500/70 hidden lg:inline">分</span>
                    </button>
                  );
                })()}

                <button
                  onClick={onOpenLogin}
                  className="p-1.5 text-slate-400 hover:text-amber-300 rounded-lg hover:bg-slate-800 text-[11px] font-medium transition-colors"
                  title="切换会员身份或退出登录"
                >
                  <UserCheck className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all active:scale-95"
                  title="登录商会会员企业账号"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>会员登录</span>
                </button>

                <button
                  onClick={onOpenLogin}
                  className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-800"
                  title="当前为外部商业访客/潜在客户视角"
                >
                  <User className="w-3 h-3 text-slate-400" />
                  <span>外部访客</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
