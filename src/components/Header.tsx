import React from 'react';
import { TabType, UserProfile } from '../types';
import { 
  Sparkles, 
  LogIn, 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  Lock,
  Globe
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { useLanguage } from '../i18n/LanguageContext';
import { translateUserField } from '../i18n/domainTranslations';

interface HeaderProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  userPoints: number;
  user: UserProfile;
  onOpenSmartMatch: () => void;
  onOpenLogin: () => void;
  onOpenMerchantApply?: () => void;
  onOpenPrivilegeModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  userPoints,
  user,
  onOpenSmartMatch,
  onOpenLogin,
  onOpenMerchantApply,
  onOpenPrivilegeModal,
}) => {
  const { isEn, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E6DF] text-[#0F172A] shadow-sm">
      {/* Subtle Top Private Wealth Advisory Ribbon for Guests */}
      {!user.isMember && (
        <div className="bg-[#F7F7F5] border-b border-[#E8E6DF] px-3 py-1.5 text-center text-[11px] text-slate-600 flex flex-wrap items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
          <span>
            {t(
              '当前视角：外部商业访客（仅限公开名录浏览）',
              'Current View: External Commercial Guest (Public Directory Preview)'
            )}
          </span>
          <button
            onClick={onOpenMerchantApply}
            className="text-[#9E7425] font-semibold underline underline-offset-2 hover:text-[#0F172A] ml-1 inline-flex items-center gap-0.5 transition-colors"
          >
            {t('2分钟申请企业入驻点亮名录 >', 'Apply in 2 Min to Feature Your Business >')}
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={toggleLanguage}
            className="text-[#0F172A] font-bold hover:text-[#9E7425] inline-flex items-center gap-1 transition-colors"
            title={t('Switch directly to pure English (/en)', '直接切换回中文版本 (/)')}
          >
            <Globe className="w-3 h-3 text-[#9E7425]" />
            <span>{isEn ? '中文' : 'EN · English'}</span>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => setCurrentTab('home')} 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#DFBA73] via-[#C5A059] to-[#9E7425] p-[1.5px] shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
              <div className="w-full h-full bg-[#FFFDF8] rounded-[10px] flex items-center justify-center">
                <span className={`${isEn ? 'text-base sm:text-lg tracking-tight' : 'text-xl sm:text-2xl'} font-editorial font-bold text-gold-ink`}>
                  {t('融', 'W')}
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-editorial text-sm sm:text-lg lg:text-xl font-bold tracking-tight text-[#0F172A] flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                  {t('滑铁卢融商汇', 'WBCA')}
                  <span className="hidden sm:inline-block text-[10px] font-sans uppercase font-semibold tracking-widest text-[#9E7425]">
                    {t('· WBCA', '· Waterloo')}
                  </span>
                </h1>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-normal whitespace-nowrap tracking-wide hidden sm:block">
                {t(
                  'Waterloo Business Convergence Alliance',
                  'Waterloo Business Convergence Alliance'
                )}
              </p>
            </div>
          </div>

          {/* Clean Editorial Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {[
              { id: 'home', label: t('首页愿景', 'Overview') },
              { id: 'directory', label: t('名商目录', 'Directory') },
              { id: 'help', label: t('商机互助圈', 'Mutual Aid') },
              { id: 'events', label: t('活动报名', 'Events') },
              { id: 'points', label: t('积分商城', 'Rewards') },
              { id: 'profile', label: t('个人中心', 'Profile') },
            ].map((tab) => {
              const active = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id as TabType)}
                  className={`px-2 xl:px-3 py-2 text-xs font-medium transition-all relative whitespace-nowrap ${
                    active
                      ? 'text-[#9E7425] font-semibold'
                      : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  {tab.label}
                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#C5A059] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Tools, Language Switcher & User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Prominent EN / 中文 Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-[#FFFDF7] hover:bg-[#F7F3E8] border border-[#C5A059]/60 text-[#0F172A] shadow-xs transition-all active:scale-95 whitespace-nowrap"
              title={t('Switch to pure English site (/en)', '切换回中文站点 (/)')}
              aria-label={t('Switch to English', '切换至中文')}
            >
              <Globe className="w-3.5 h-3.5 text-[#9E7425] flex-shrink-0" />
              <span>{isEn ? '中文' : 'EN'}</span>
            </button>

            {/* AI Smart Match */}
            <button
              onClick={onOpenSmartMatch}
              className="hidden md:flex items-center gap-1.5 px-2.5 xl:px-3 py-2 rounded-xl text-xs font-medium bg-[#F7F7F5] hover:bg-[#EFECE4] border border-[#E8E6DF] text-[#0F172A] transition-all whitespace-nowrap"
              title={t('智能匹配滑铁卢本地商户与互助商机', 'AI-powered business matchmaking across Waterloo Region')}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#9E7425]" />
              <span className="hidden xl:inline">{t('AI 商机撮合', 'AI Match')}</span>
              <span className="xl:hidden">{t('AI 撮合', 'AI')}</span>
            </button>

            {/* Primary Champagne Gold CTA */}
            <button
              onClick={onOpenMerchantApply}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-bold gold-gradient text-[#0F172A] shadow-sm hover:brightness-105 transition-all active:scale-95 whitespace-nowrap"
              title={t('在线申请加入滑铁卢名商名录', 'Apply online to join the WBCA Verified Directory')}
            >
              <Building2 className="w-3.5 h-3.5 text-[#0F172A] flex-shrink-0" />
              <span className="hidden sm:inline">{t('申请入驻', 'Apply')}</span>
              <span className="sm:hidden">{t('入驻', 'Join')}</span>
            </button>

            {/* Member Identity & Login Controls */}
            {user.isMember ? (
              <div className="flex items-center gap-1">
                {(() => {
                  const rawCompany = translateUserField(user.company, isEn) || translateUserField(user.name, isEn) || t('融商会员', 'Member');
                  const isClean = rawCompany && !rawCompany.startsWith('data:') && !rawCompany.startsWith('http') && rawCompany.length < 50;
                  const displayName = isClean ? rawCompany : t('融商会员', 'Member');

                  return (
                    <button 
                      onClick={() => setCurrentTab('profile')}
                      className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl border transition-all ${
                        currentTab === 'profile'
                          ? 'bg-[#FFFDF7] border-[#C5A059] text-[#0F172A] shadow-sm'
                          : 'bg-[#F7F7F5] border-[#E8E6DF] hover:border-[#C5A059]/60 text-[#0F172A]'
                      }`}
                      title={t(`实名融商会员：${displayName} · 点击进入个人中心`, `Verified Member: ${displayName} · Open Profile`)}
                    >
                      <UserAvatar avatar={user.avatar} name={displayName} size="xs" className="w-5 h-5 rounded-full flex-shrink-0" />
                      <span className="text-xs font-semibold text-[#0F172A] max-w-[64px] sm:max-w-[96px] truncate">
                        {displayName}
                      </span>
                      <span className="hidden xl:inline-flex items-center gap-0.5 text-[10px] text-[#9E7425] font-semibold">
                        <ShieldCheck className="w-3 h-3 text-[#C5A059]" />
                        {t('实名', 'Verified')}
                      </span>
                      <span className="text-xs font-bold text-[#9E7425] pl-0.5">
                        {userPoints.toLocaleString()}
                      </span>
                    </button>
                  );
                })()}

                <button
                  onClick={onOpenLogin}
                  className="p-2 text-slate-600 hover:text-[#9E7425] rounded-xl hover:bg-[#F7F7F5] transition-colors"
                  title={t('切换会员身份或退出登录', 'Switch Member Account or Sign Out')}
                >
                  <UserCheck className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold bg-[#F7F7F5] hover:bg-[#EFECE4] border border-[#E8E6DF] text-[#0F172A] transition-all active:scale-95 whitespace-nowrap"
                  title={t('登录商会会员企业账号', 'Sign in to Member Enterprise Account')}
                >
                  <LogIn className="w-3.5 h-3.5 text-[#9E7425]" />
                  <span>{t('会员登录', 'Sign In')}</span>
                </button>

                <button
                  onClick={onOpenPrivilegeModal}
                  className="hidden 2xl:flex items-center gap-1 text-[11px] text-slate-600 hover:text-[#9E7425] px-2 py-1.5 rounded-lg hover:bg-[#F7F7F5] transition-colors whitespace-nowrap"
                  title={t('点击查看会员尊享特权与外部访客权限对比', 'Compare Member Privileges vs. Guest Access')}
                >
                  <Lock className="w-3 h-3 text-[#C5A059]" />
                  <span>{t('权益对比', 'Privileges')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
