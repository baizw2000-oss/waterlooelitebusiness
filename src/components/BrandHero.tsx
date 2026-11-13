import React, { useState } from 'react';
import { TabType, UserProfile } from '../types';
import { 
  ShieldCheck, 
  Sparkles, 
  Users, 
  Calendar, 
  Award, 
  ArrowRight, 
  Search, 
  Building2,
  Compass
} from 'lucide-react';
import { MembershipPrivilegeMatrix } from './MembershipPrivilegeMatrix';
import { WaterlooBusinessNewsTicker } from './WaterlooBusinessNewsTicker';
import { useLanguage } from '../i18n/LanguageContext';

interface BrandHeroProps {
  setCurrentTab: (tab: TabType) => void;
  onSearchDirectory: (query: string) => void;
  onOpenSmartMatch: () => void;
  onCheckIn: () => void;
  hasCheckedInToday: boolean;
  user: UserProfile;
  onOpenMerchantApply: () => void;
  onOpenLogin: () => void;
}

export const BrandHero: React.FC<BrandHeroProps> = ({
  setCurrentTab,
  onSearchDirectory,
  onOpenSmartMatch,
  onCheckIn,
  hasCheckedInToday,
  user,
  onOpenMerchantApply,
  onOpenLogin,
}) => {
  const { isEn, t } = useLanguage();
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchDirectory(searchInput.trim());
      setCurrentTab('directory');
    } else {
      setCurrentTab('directory');
    }
  };

  return (
    <div className="space-y-12 sm:space-y-14">
      {/* 1. Signature Editorial White & Warm Ivory Hero Header */}
      <section className="relative overflow-hidden rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-10 lg:p-12 luxury-shadow text-[#0F172A]">
        {/* Subtle Champagne Gold Warm Radiance */}
        <div className="absolute -top-24 right-0 w-[440px] h-[440px] bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none animate-vault-glow" />
        <div className="absolute -bottom-24 left-1/4 w-80 h-80 bg-[#DFBA73]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Quiet Editorial Authority Line */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
            <span className="inline-flex items-center gap-1.5 text-[#9E7425] font-bold uppercase tracking-widest">
              <Compass className="w-3.5 h-3.5 text-[#C5A059]" />
              Waterloo Business Convergence Alliance
            </span>
            <span className="text-slate-300 hidden sm:inline">·</span>
            <span>{t('加拿大滑铁卢高科技走廊', "Canada's Waterloo Innovation Corridor")}</span>
            <span className="text-slate-300 hidden sm:inline">·</span>
            <span>{t('非营利华商产业实名联盟', 'Non-Profit Verified Enterprise Alliance')}</span>
          </div>

          {/* Editorial Serif Main Headline */}
          <div className="space-y-3">
            {isEn ? (
              <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#0F172A] leading-[1.15]">
                Converging Waterloo&apos;s Finest Minds <br />
                <span className="text-gold-ink">
                  Trusted Leadership · Shared Prosperity
                </span>
              </h1>
            ) : (
              <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#0F172A] leading-[1.2]">
                智汇滑铁卢 · 商道融天下 <br />
                <span className="text-gold-ink">
                  融商聚势 · 协同赢未来
                </span>
              </h1>
            )}
          </div>

          {/* Core Fact Sheet / AnswerBox */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#F7F7F5] border border-[#E8E6DF]">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#9E7425] font-bold mb-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#C5A059]" />
              <span>{t('联盟核心定位与公信力档案 (Alliance Fact Sheet)', 'Alliance Charter & Trust Fact Sheet')}</span>
            </div>
            {isEn ? (
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                Rooted in Ontario&apos;s Waterloo Technology Corridor (Waterloo / Kitchener / Cambridge), the{' '}
                <strong className="text-[#0F172A] font-semibold">Waterloo Business Convergence Alliance (WBCA)</strong> unites premier leaders across wealth advisory, legal &amp; tax counsel, deep tech, executive education, and cross-border commerce. Every verified corporate member receives{' '}
                <strong className="text-[#9E7425] font-semibold">
                  official alliance endorsement, an independent ?merchant=ID direct profile, network-wide opportunity broadcasts
                </strong>
                , and{' '}
                <strong className="text-[#9E7425] font-semibold">
                  Gemini AI reputation audits &amp; executive matchmaking
                </strong>
                .
              </p>
            ) : (
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                滑铁卢融商汇（WBCA）根植安大略省滑铁卢高科技走廊（Waterloo / Kitchener / Cambridge），汇聚产融投资、财税法务、科技创新、教育培训与跨境实业领军企业。我们为实名认证会员提供<strong className="text-[#9E7425] font-semibold">权威商会公信力背书、专属 ?merchant=ID 独立直达链接、全员商机邮件协同广播</strong>以及<strong className="text-[#9E7425] font-semibold">Gemini AI 商誉评价与智能撮合</strong>赋能。
              </p>
            )}
          </div>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-[#9E7425] pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t(
                  '检索滑铁卢认证名录：如 柏源金融、白政玮、会计法务、AI开发、商业地产...',
                  'Search verified Waterloo enterprises: BV Financial, Legal & Tax, AI Engineering, Realty...'
                )}
                className="w-full pl-11 pr-28 sm:pr-32 py-3.5 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-2 gold-gradient text-[#0F172A] font-bold text-xs rounded-lg shadow-sm hover:brightness-105 transition-all"
              >
                {t('搜索名录', 'Search')}
              </button>
            </div>
          </form>

          {/* Editorial Action Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={onOpenMerchantApply}
              className="px-5 py-3 rounded-xl gold-gradient text-[#0F172A] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm hover:brightness-105 transition-all group"
            >
              <Building2 className="w-4 h-4" />
              <span>{t('申请商户入驻名录 (2分钟极速通道)', 'Apply for Directory Listing (2-Min Fast Track)')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setCurrentTab('help')}
              className="px-5 py-3 rounded-xl bg-[#F7F7F5] hover:bg-[#EFECE4] border border-[#E8E6DF] text-[#0F172A] font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all"
            >
              <Users className="w-4 h-4 text-[#9E7425]" />
              <span>{t('发布商机互助 / 悬赏', 'Post Business Inquiry')}</span>
            </button>

            <button
              onClick={onOpenSmartMatch}
              className="px-4 py-3 rounded-xl bg-white hover:bg-[#FFFDF7] border border-[#C5A059]/45 text-[#9E7425] font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span>{t('AI 智能精准撮合', 'AI Executive Match')}</span>
            </button>

            <button
              onClick={onCheckIn}
              disabled={hasCheckedInToday}
              className={`px-4 py-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                hasCheckedInToday
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 cursor-default'
                  : 'bg-[#FFFDF7] border-[#C5A059]/45 text-[#9E7425] hover:bg-[#FDF6E2]'
              }`}
            >
              <Award className="w-4 h-4" />
              {hasCheckedInToday
                ? t('今日已签到 (+10分)', 'Checked In Today (+10 Pts)')
                : t('每日签到赚积分', 'Daily Check-In')}
            </button>
          </div>
        </div>

        {/* Real-Time Google Search Grounded Waterloo Business News Ticker */}
        <div className="relative z-10 mt-7 pt-5 border-t border-[#E8E6DF]">
          <WaterlooBusinessNewsTicker />
        </div>
      </section>

      {/* 2. Membership Privilege & Fast-Track Onboarding Matrix */}
      <section>
        <MembershipPrivilegeMatrix
          user={user}
          onOpenApplyModal={onOpenMerchantApply}
          onOpenLogin={onOpenLogin}
          variant="inline"
        />
      </section>

      {/* 3. Four Core Pillars in Crisp Editorial Pure White Cards */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E8E6DF] pb-4">
          <div>
            <div className="text-[11px] font-bold text-[#9E7425] uppercase tracking-[0.2em] mb-1">
              Core Alliance Architecture
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              {t('滑铁卢融商汇 · 四大核心赋能支柱', 'WBCA · Four Strategic Pillars of Value')}
            </h2>
          </div>
          <button
            onClick={() => setCurrentTab('directory')}
            className="text-xs font-bold text-[#9E7425] hover:text-[#0F172A] flex items-center gap-1 self-start sm:self-auto transition-colors"
          >
            <span>{t('查阅全部认证商录', 'Explore Verified Directory')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              num: '01',
              title: t('卓越公信商誉体系', 'Verified Trust & Reputation'),
              desc: t(
                '结合商会实名认证与 Google/社群多维口碑，引入 Gemini AI 商誉评价引擎，为每家会员建立权威的公信力数字凭证。',
                'Combines WBCA Secretariat verification with Google and peer sentiment via Gemini AI audits, creating an authoritative digital trust credential for every member.'
              ),
              icon: ShieldCheck,
              action: () => setCurrentTab('directory'),
              btnText: t('浏览认证商录', 'Browse Directory'),
            },
            {
              num: '02',
              title: t('深度会员互助圈', 'Executive Mutual Aid Hub'),
              desc: t(
                '拒绝无效社交，聚焦真实业务需求。供需采购、高管法务求助、厂房选址、人才急聘，以邮件广播机制激发高效响应。',
                'Focused B2B collaboration without superficial networking. Post procurement needs, advisory inquiries, and partnerships amplified via network-wide dispatch.'
              ),
              icon: Users,
              action: () => setCurrentTab('help'),
              btnText: t('进入互助看板', 'Open Mutual Aid'),
            },
            {
              num: '03',
              title: t('高端活动与私董峰会', 'Summits & Private Roundtables'),
              desc: t(
                '定期举办滑铁卢科技领袖峰会、高管财税合规闭门会与天使投资人酒会，集成动态二维码电子签到与即时积分回馈。',
                'Curated Waterloo tech summits, executive tax briefings, and capital receptions featuring dynamic QR e-passes and instant check-in credit rewards.'
              ),
              icon: Calendar,
              action: () => setCurrentTab('events'),
              btnText: t('查看近期活动', 'View Upcoming Events'),
            },
            {
              num: '04',
              title: t('名商专属积分通兑', 'Trust Credit Rewards Mall'),
              desc: t(
                '履约互助、活动出席、商户互荐均可累积名商积分，通兑官网黄金展位曝光、私董席位及商会年度名册整版推广。',
                'Earn trust credits through engagement, referrals, and event attendance—redeemable for homepage showcases, VIP summit seats, and editorial features.'
              ),
              icon: Award,
              action: () => setCurrentTab('points'),
              btnText: t('探索积分商城', 'Explore Rewards'),
            },
          ].map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white border border-[#E8E6DF] hover:border-[#C5A059]/60 flex flex-col justify-between luxury-shadow transition-all hover:-translate-y-0.5"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF] flex items-center justify-center text-[#9E7425]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-editorial text-xl font-bold text-[#C5A059]/70">
                      {pillar.num}
                    </span>
                  </div>
                  <h3 className="font-editorial text-lg font-bold text-[#0F172A] tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal pl-3 border-l-2 border-[#C5A059]/40">
                    {pillar.desc}
                  </p>
                </div>
                <button
                  onClick={pillar.action}
                  className="mt-5 pt-3.5 border-t border-[#E8E6DF] text-xs font-bold text-[#0F172A] hover:text-[#9E7425] flex items-center justify-between group transition-colors"
                >
                  <span>{pillar.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C5A059] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
