import React, { useState } from 'react';
import { TabType } from '../types';
import { 
  ShieldCheck, 
  Sparkles, 
  Users, 
  Calendar, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  TrendingUp, 
  Building2
} from 'lucide-react';

interface BrandHeroProps {
  setCurrentTab: (tab: TabType) => void;
  onSearchDirectory: (query: string) => void;
  onOpenSmartMatch: () => void;
  onCheckIn: () => void;
  hasCheckedInToday: boolean;
}

export const BrandHero: React.FC<BrandHeroProps> = ({
  setCurrentTab,
  onSearchDirectory,
  onOpenSmartMatch,
  onCheckIn,
  hasCheckedInToday,
}) => {
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
    <div className="space-y-8 sm:space-y-12">
      {/* 1. Grand Vision Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 p-6 sm:p-10 lg:p-12 shadow-2xl">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-16 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-semibold text-amber-300 tracking-wide uppercase">
              Waterloo Elite Business Association · 滑铁卢名商会
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              智汇滑铁卢 · 商道融天下 <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-amber-500 bg-clip-text text-transparent">
                互助铸商誉 · 协同赢未来
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed pt-2">
              根植安省滑铁卢高科技走廊与商业腹地，汇聚科技、财税法务、商业地产、跨境实业与高教精英。以非营利之初心理念，构建集「可信商户名录」、「商机供需互助」、「公信力AI评价」与「专属信用积分」为一体的会员赋能数字枢纽。
            </p>
          </div>

          {/* Quick Search Bar directly in Hero */}
          <form onSubmit={handleSearchSubmit} className="pt-2 max-w-xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-amber-400/80 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="检索滑铁卢本地商户：如 会计师、AI开发、商业厂房、高端餐饮..."
                className="w-full pl-12 pr-28 py-3.5 bg-slate-900/90 border border-amber-500/30 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
              >
                搜索名录
              </button>
            </div>
          </form>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setCurrentTab('help')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
            >
              <Users className="w-4 h-4" />
              发布互助 / 对接商机
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSmartMatch}
              className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-cyan-400/40 text-cyan-200 font-semibold text-sm flex items-center gap-2 transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
              AI 智能精准商机撮合
            </button>

            <button
              onClick={onCheckIn}
              disabled={hasCheckedInToday}
              className={`px-4 py-2.5 rounded-xl border text-sm font-semibold flex items-center gap-1.5 transition-all ${
                hasCheckedInToday
                  ? 'bg-slate-800/40 border-slate-700 text-slate-400 cursor-default'
                  : 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              {hasCheckedInToday ? '今日已签到 (+10分)' : '每日签到赚积分'}
            </button>
          </div>
        </div>
      </section>

      {/* 2. Four Core Pillars of WEBA */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              滑铁卢名商会 四大核心赋能支柱
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              以科技与信誉为双轮驱动，构建真正产生商业价值的本地非营利华商生态
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: '卓越公信商誉体系',
              desc: '结合商会实名认证与Google/社群多维口碑，引入AI信誉评价引擎，为每家会员建立值得信赖的商誉数字凭证。',
              icon: ShieldCheck,
              accent: 'from-amber-500/20 to-amber-900/10',
              border: 'border-amber-500/30',
              iconColor: 'text-amber-400',
              action: () => setCurrentTab('directory'),
              btnText: '浏览认证商录',
            },
            {
              title: '深度会员互助圈',
              desc: '拒绝无效社交，聚焦真实业务需求。供需采购、高管法务求助、厂房选址、人才急聘，以悬赏机制激发快速响应。',
              icon: Users,
              accent: 'from-blue-500/20 to-blue-900/10',
              border: 'border-blue-500/30',
              iconColor: 'text-blue-400',
              action: () => setCurrentTab('help'),
              btnText: '进入互助看板',
            },
            {
              title: '高端活动与私董峰会',
              desc: '定期举办UW科技领袖峰会、高管财税合规闭门会与天使投资人酒会，集成动态二维码电子签到与即时积分回馈。',
              icon: Calendar,
              accent: 'from-emerald-500/20 to-emerald-900/10',
              border: 'border-emerald-500/30',
              iconColor: 'text-emerald-400',
              action: () => setCurrentTab('events'),
              btnText: '查看近期活动',
            },
            {
              title: '名商专属积分通兑',
              desc: '履约互助、活动出席、商户互荐均可累积名商积分，通兑官网黄金展位曝光、私董席位及商会年度名册整版推广。',
              icon: Award,
              accent: 'from-purple-500/20 to-purple-900/10',
              border: 'border-purple-500/30',
              iconColor: 'text-purple-400',
              action: () => setCurrentTab('points'),
              btnText: '探索积分商城',
            },
          ].map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={i}
                className={`p-5 rounded-2xl bg-gradient-to-b ${pillar.accent} bg-slate-900/70 border ${pillar.border} flex flex-col justify-between hover:translate-y-[-2px] transition-transform shadow-lg`}
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950/80 flex items-center justify-center border border-slate-700/80">
                    <Icon className={`w-5 h-5 ${pillar.iconColor}`} />
                  </div>
                  <h3 className="text-base font-bold text-white">{pillar.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{pillar.desc}</p>
                </div>
                <button
                  onClick={pillar.action}
                  className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-between group"
                >
                  <span>{pillar.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
