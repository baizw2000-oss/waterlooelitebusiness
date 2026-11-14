import React, { useState, useCallback } from 'react';
import {
  Landmark,
  ExternalLink,
  Newspaper,
  RefreshCw,
  ChevronUp,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';
import {
  GovJurisdictionId,
  WaterlooNewsResponse,
} from '../types';
import { fetchWaterlooBusinessNews } from '../services/aiService';
import { useLanguage } from '../i18n/LanguageContext';

interface GovLinkItem {
  labelZh: string;
  labelEn: string;
  url: string;
}

interface JurisdictionCardData {
  id: GovJurisdictionId;
  levelZh: string;
  levelEn: string;
  nameZh: string;
  nameEn: string;
  focusZh: string;
  focusEn: string;
  summaryZh: string;
  summaryEn: string;
  links: GovLinkItem[];
}

const JURISDICTIONS: JurisdictionCardData[] = [
  {
    id: 'waterloo',
    levelZh: '市级政务 · 滑铁卢市',
    levelEn: 'Municipal · Waterloo, ON',
    nameZh: 'City of Waterloo 滑铁卢市政府',
    nameEn: 'City of Waterloo',
    focusZh: '商业支持 · Uptown CIP 资助 · 外贸关税应对',
    focusEn: 'Business Support · Uptown CIP Grants · Trade Resilience',
    summaryZh:
      '提供商业执照导航、Uptown Waterloo 门面与节能改造补助 (CIP)、本地推广计划及跨境关税应对资金指引。',
    summaryEn:
      'Offers dedicated EcDev concierge support, Uptown Waterloo Community Improvement Plan (CIP) grants, and trade & tariff resilience portals.',
    links: [
      {
        labelZh: '商业支持与招商官网',
        labelEn: 'Business Support Portal',
        url: 'https://www.waterloo.ca/business-support/',
      },
      {
        labelZh: 'CIP 商业改良补助',
        labelEn: 'CIP Storefront & Upgrade Grants',
        url: 'https://www.waterloo.ca/business-support/apply-for-a-community-improvement-grant/',
      },
      {
        labelZh: '外贸与关税应对资源',
        labelEn: 'Trade & Tariff Resources',
        url: 'https://www.waterloo.ca/business-support/trade-and-tariff-resources/',
      },
    ],
  },
  {
    id: 'kitchener',
    levelZh: '市级政务 · 基奇纳市',
    levelEn: 'Municipal · Kitchener, ON',
    nameZh: 'City of Kitchener 基奇纳市政府',
    nameEn: 'City of Kitchener',
    focusZh: 'Make It Kitchener · SDG Idea Factory · 产业创新',
    focusEn: 'Make It Kitchener · SDG Idea Factory · Tech & Manufacturing',
    summaryZh:
      '通过 Make It Kitchener 战略与 SDG Idea Factory 创新工场，为数字科技、先进制造与早期初创提供孵化办公及政策辅导。',
    summaryEn:
      'Drives startup incubation and industrial growth through the Make It Kitchener strategy and the SDG Idea Factory co-working innovation hub.',
    links: [
      {
        labelZh: '商业发展官方主页',
        labelEn: 'Business Development Portal',
        url: 'https://www.kitchener.ca/business-in-kitchener/business-development/',
      },
      {
        labelZh: 'Make It Kitchener 战略专页',
        labelEn: 'Make It Kitchener Strategy',
        url: 'https://www.kitchener.ca/business-in-kitchener/economic-development/make-it-kitchener/',
      },
      {
        labelZh: 'SDG Idea Factory 创新空间',
        labelEn: 'SDG Idea Factory & Hubs',
        url: 'https://www.makeitkitchener.ca/entrepreneurial-spaces/',
      },
    ],
  },
  {
    id: 'cambridge',
    levelZh: '市级政务 · 剑桥市',
    levelEn: 'Municipal · Cambridge, ON',
    nameZh: 'City of Cambridge 剑桥市政府',
    nameEn: 'City of Cambridge',
    focusZh: '先进制造招商 · 中小微咨询 · 核心区激励',
    focusEn: 'Advanced Manufacturing · SME Advisory · Core Area CIP',
    summaryZh:
      '聚焦 401 高速走廊先进制造与中小企业落地，联动地区中小企业中心提供免费创业咨询、牌照审批与核心商业区补贴对接。',
    summaryEn:
      'Supports Highway 401 industrial corridor expansion, site selection, municipal permitting, and free small business startup consultations.',
    links: [
      {
        labelZh: '经济发展与选址官网',
        labelEn: 'Economic Development Portal',
        url: 'https://www.cambridge.ca/business-building-development/economic-development/',
      },
      {
        labelZh: '中小企业免费咨询',
        labelEn: 'Small Business Services',
        url: 'https://www.cambridge.ca/business-building-development/economic-development/small-business/',
      },
      {
        labelZh: '核心商业区激励与 CIP',
        labelEn: 'Core Areas & CIP Incentives',
        url: 'https://www.cambridge.ca/business-building-development/economic-development/core-areas/',
      },
    ],
  },
  {
    id: 'guelph',
    levelZh: '市级政务 · 圭尔夫市',
    levelEn: 'Municipal · Guelph, ON',
    nameZh: 'City of Guelph 圭尔夫市政府',
    nameEn: 'City of Guelph',
    focusZh: '农业与清洁科技 · Business Centre · 许可协办',
    focusEn: 'Agri-Tech & Clean-Tech · Business Centre · Permits',
    summaryZh:
      '联合 Business Centre Guelph-Wellington 提供商业计划评审、建筑许可绿色通道以及食品生物科技与绿色制造支持。',
    summaryEn:
      'Partners with Business Centre Guelph-Wellington to deliver 1-on-1 mentorship, building permit guidance, and clean-tech expansion support.',
    links: [
      {
        labelZh: '圭尔夫经济发展局官网',
        labelEn: 'Guelph Economic Development Office',
        url: 'https://guelph.ca/business/economic-development-office/',
      },
      {
        labelZh: '中小企业孵化援助',
        labelEn: 'Small Business Assistance',
        url: 'https://guelph.ca/business/small-business-assistance/',
      },
      {
        labelZh: '商业中心扶企项目库',
        labelEn: 'Business Centre Programs',
        url: 'https://guelphbusiness.com/programs/',
      },
    ],
  },
  {
    id: 'region',
    levelZh: '区域政府 · 滑铁卢地区',
    levelEn: 'Regional · Waterloo Region',
    nameZh: 'Region of Waterloo & 区域商业枢纽',
    nameEn: 'Region of Waterloo & Regional Hubs',
    focusZh: 'WRSBC 中小企业中心 · Waterloo EDC · Communitech',
    focusEn: 'WRSBC Advisory · Waterloo EDC · Communitech',
    summaryZh:
      '统筹 KWC 三市投资与创业资助、WRSBC 创业导师与微额补贴申报，并联动 Waterloo EDC 与 Communitech 服务高成长科创企业。',
    summaryEn:
      'Unifies regional business investment, Waterloo Region Small Business Centre (WRSBC) consultations, Waterloo EDC expansion intel, and Communitech.',
    links: [
      {
        labelZh: '滑铁卢地区投资与发展官网',
        labelEn: 'Investing in Waterloo Region',
        url: 'https://www.regionofwaterloo.ca/business-and-development/investing-in-waterloo-region/',
      },
      {
        labelZh: '地区创业扶持资助计划',
        labelEn: 'Entrepreneurial Initiatives Grant',
        url: 'https://www.regionofwaterloo.ca/business-and-development/investing-in-waterloo-region/entrepreneurial-initiatives-grant/',
      },
      {
        labelZh: '地区中小企业中心 (WRSBC)',
        labelEn: 'Waterloo Region Small Business Centre',
        url: 'https://www.waterlooregionsmallbusiness.com/',
      },
      {
        labelZh: 'Waterloo EDC 投资发展局',
        labelEn: 'Waterloo EDC',
        url: 'https://www.waterlooedc.ca/',
      },
      {
        labelZh: 'Communitech 科创中心',
        labelEn: 'Communitech Innovation Hub',
        url: 'https://communitech.ca/',
      },
    ],
  },
  {
    id: 'ontario',
    levelZh: '省级政务 · 安大略省',
    levelEn: 'Provincial · Government of Ontario',
    nameZh: 'Government of Ontario 安大略省政府',
    nameEn: 'Government of Ontario',
    focusZh: 'Starter Company Plus · 区域创新中心 RIC · 资助总库',
    focusEn: 'Starter Company Plus · Regional Innovation Centres · Grants',
    summaryZh:
      '汇集最高 $5,000 加元 Starter Company Plus 创业补贴、安省区域创新中心 (RICs) 科技加速网络及全口径省级商业资助目录。',
    summaryEn:
      'Central provincial gateway for Starter Company Plus grants (up to $5,000), Ontario Regional Innovation Centres (RICs), and active SME funding.',
    links: [
      {
        labelZh: '安省企业资助总入口',
        labelEn: 'Ontario Business Funding & Help',
        url: 'https://www.ontario.ca/page/business/start/get-funding-or-more-help',
      },
      {
        labelZh: 'Starter Company Plus 拨款',
        labelEn: 'Starter Company Plus Grants',
        url: 'https://www.ontario.ca/page/starter-company-plus',
      },
      {
        labelZh: '安省区域创新中心 (RICs)',
        labelEn: 'Regional Innovation Centres',
        url: 'https://www.ontario.ca/page/regional-innovation-centre-locations',
      },
      {
        labelZh: '开放资助项目名录',
        labelEn: 'Available Funding Opportunities',
        url: 'https://www.ontario.ca/page/available-funding-opportunities-ontario-government',
      },
    ],
  },
];

export const GovernmentSupportHub: React.FC = () => {
  const { lang, isEn, t } = useLanguage();
  const [activeJurisdiction, setActiveJurisdiction] = useState<GovJurisdictionId | null>(null);
  const [newsMap, setNewsMap] = useState<Partial<Record<string, WaterlooNewsResponse>>>({});
  const [loadingId, setLoadingId] = useState<GovJurisdictionId | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadJurisdictionNews = useCallback(
    async (jurId: GovJurisdictionId, forceRefresh = false) => {
      const cacheKey = `${lang}:${jurId}`;
      if (!forceRefresh && newsMap[cacheKey]) {
        setActiveJurisdiction(jurId);
        setErrorMsg(null);
        return;
      }

      setActiveJurisdiction(jurId);
      setLoadingId(jurId);
      setErrorMsg(null);

      try {
        const res = await fetchWaterlooBusinessNews('policy', lang, forceRefresh, jurId);
        setNewsMap((prev) => ({ ...prev, [cacheKey]: res }));
      } catch (err: any) {
        setErrorMsg(
          err?.message ||
            t(
              '暂时无法获取该辖区的扶企新闻，请稍后再试。',
              'Unable to load policy news for this jurisdiction right now.'
            )
        );
      } finally {
        setLoadingId(null);
      }
    },
    [lang, newsMap, t]
  );

  const activeCacheKey = activeJurisdiction ? `${lang}:${activeJurisdiction}` : '';
  const activeNews = activeCacheKey ? newsMap[activeCacheKey] : undefined;
  const activeCard = activeJurisdiction
    ? JURISDICTIONS.find((j) => j.id === activeJurisdiction)
    : undefined;

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E8E6DF] pb-4">
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-[#9E7425] uppercase tracking-[0.2em] flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>
              {t(
                'Municipal · Regional · Provincial SME Ecosystem',
                'Municipal · Regional · Provincial SME Ecosystem'
              )}
            </span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {t(
              'WKCG 创新走廊 · 三级政府中小企与科创赋能直达',
              'WKCG Corridor · Municipal, Regional & Ontario SME Support'
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            {t(
              '直连 Waterloo、Kitchener、Cambridge、Guelph 四市政府、Waterloo Region 地区政府及安大略省政府官方扶企门户，精准查询商业补助、科创孵化与最新政策新闻。',
              'Direct official portals and live policy updates across Waterloo, Kitchener, Cambridge, Guelph, Region of Waterloo, and the Government of Ontario supporting SMEs and innovative ventures.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (activeJurisdiction) {
              setActiveJurisdiction(null);
            } else {
              loadJurisdictionNews('ontario', false);
            }
          }}
          className="text-xs font-bold text-[#9E7425] hover:text-[#0F172A] inline-flex items-center gap-1 self-start sm:self-auto transition-colors whitespace-nowrap"
        >
          <Newspaper className="w-3.5 h-3.5" />
          <span>
            {activeJurisdiction
              ? t('收起政策新闻面板', 'Close Policy News Panel')
              : t('浏览四市及省府最新扶企新闻', 'Browse Live Gov Policy News')}
          </span>
        </button>
      </div>

      {/* 6-Jurisdiction Editorial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {JURISDICTIONS.map((item) => {
          const isSelected = activeJurisdiction === item.id;
          const isLoading = loadingId === item.id;
          return (
            <div
              key={item.id}
              className={`p-5 sm:p-6 rounded-2xl bg-white border transition-all flex flex-col justify-between luxury-shadow ${
                isSelected
                  ? 'border-[#C5A059] ring-1 ring-[#C5A059]/30'
                  : 'border-[#E8E6DF] hover:border-[#C5A059]/60'
              }`}
            >
              <div className="space-y-3">
                {/* Unboxed typographic tier & region metadata */}
                <div className="text-[11px] font-semibold text-[#9E7425] tracking-wide">
                  {isEn ? item.levelEn : item.levelZh}
                </div>

                <h3 className="font-editorial text-lg font-bold text-[#0F172A] tracking-tight leading-snug">
                  {isEn ? item.nameEn : item.nameZh}
                </h3>

                <div className="text-[11px] font-medium text-slate-500">
                  {isEn ? item.focusEn : item.focusZh}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {isEn ? item.summaryEn : item.summaryZh}
                </p>

                {/* Official Direct Links */}
                <div className="pt-2 border-t border-[#E8E6DF]/80 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-500">
                    {t('政府官方网站直达：', 'Official Portals:')}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {item.links.map((lnk) => (
                      <a
                        key={lnk.url}
                        href={lnk.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        className="group flex items-center justify-between gap-2 text-xs font-medium text-[#0F172A] hover:text-[#9E7425] transition-colors py-0.5"
                      >
                        <span className="truncate">{isEn ? lnk.labelEn : lnk.labelZh}</span>
                        <ExternalLink className="w-3 h-3 text-[#C5A059] group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer: Fetch Policy & SME Innovation News */}
              <button
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setActiveJurisdiction(null);
                  } else {
                    loadJurisdictionNews(item.id, false);
                  }
                }}
                className="mt-5 pt-3.5 border-t border-[#E8E6DF] text-xs font-bold text-[#9E7425] hover:text-[#0F172A] flex items-center justify-between w-full transition-colors"
              >
                <span className="inline-flex items-center gap-1.5">
                  {isLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Newspaper className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isSelected
                      ? t('收起本辖区扶企新闻', 'Hide Policy News')
                      : t('查看本辖区扶企与创新新闻', 'View SME & Innovation News')}
                  </span>
                </span>
                {isSelected ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Expandable Jurisdiction Policy & SME Support News Panel */}
      {activeJurisdiction && (
        <div className="rounded-2xl border border-[#C5A059]/60 bg-white overflow-hidden luxury-shadow">
          <div className="px-4 sm:px-6 py-4 border-b border-[#E8E6DF] bg-[#F7F7F5] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-[11px] font-semibold text-[#9E7425]">
                {activeCard
                  ? isEn
                    ? activeCard.levelEn
                    : activeCard.levelZh
                  : ''}
              </div>
              <h3 className="font-editorial text-lg font-bold text-[#0F172A]">
                {activeCard
                  ? t(
                      `${activeCard.nameZh} · 中小企业与创新支持动态及权威链接`,
                      `${activeCard.nameEn} · SME & Innovation Policy News`
                    )
                  : ''}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Quick switcher across all 6 jurisdictions */}
              <div className="flex items-center gap-1 p-1 bg-white border border-[#E8E6DF] rounded-lg overflow-x-auto scrollbar-none max-w-full">
                {JURISDICTIONS.map((jur) => {
                  const selected = activeJurisdiction === jur.id;
                  const shortLabel =
                    jur.id === 'waterloo'
                      ? 'Waterloo'
                      : jur.id === 'kitchener'
                        ? 'Kitchener'
                        : jur.id === 'cambridge'
                          ? 'Cambridge'
                          : jur.id === 'guelph'
                            ? 'Guelph'
                            : jur.id === 'region'
                              ? t('地区政府', 'Region')
                              : t('安省政府', 'Ontario');
                  return (
                    <button
                      key={jur.id}
                      type="button"
                      onClick={() => loadJurisdictionNews(jur.id, false)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        selected
                          ? 'bg-[#0F172A] text-white font-semibold'
                          : 'text-slate-600 hover:text-[#0F172A]'
                      }`}
                    >
                      {shortLabel}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => loadJurisdictionNews(activeJurisdiction, true)}
                disabled={loadingId === activeJurisdiction}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E8E6DF] bg-white hover:bg-[#FFFDF7] text-xs font-semibold text-[#0F172A] disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-[#9E7425] ${
                    loadingId === activeJurisdiction ? 'animate-spin' : ''
                  }`}
                />
                <span>{t('刷新检索', 'Refresh')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveJurisdiction(null)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-[#0F172A] hover:bg-white transition-colors whitespace-nowrap"
              >
                <span>{t('收起', 'Close')}</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          {loadingId === activeJurisdiction && !activeNews ? (
            <div className="p-6 flex items-center gap-2.5 text-xs text-slate-600">
              <RefreshCw className="w-4 h-4 animate-spin text-[#C5A059]" />
              <span>
                {t(
                  '正在检索该级政府最新的中小企业及创新扶持政策与新闻链接...',
                  'Retrieving the latest municipal/provincial SME & innovation updates...'
                )}
              </span>
            </div>
          ) : errorMsg ? (
            <div className="p-6 flex items-center justify-between gap-3 text-xs text-rose-700">
              <span className="inline-flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </span>
              <button
                type="button"
                onClick={() => loadJurisdictionNews(activeJurisdiction, true)}
                className="font-semibold text-[#9E7425] hover:underline whitespace-nowrap"
              >
                {t('重试', 'Retry')}
              </button>
            </div>
          ) : activeNews && activeNews.items.length > 0 ? (
            <div>
              <div className="divide-y divide-[#E8E6DF]">
                {activeNews.items.map((newsItem) => (
                  <article
                    key={newsItem.id}
                    className="px-4 sm:px-6 py-4 space-y-1.5 hover:bg-[#F7F7F5]/60 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[#9E7425]">
                          {newsItem.industry}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{newsItem.publishedHint}</span>
                        {newsItem.sourceTitle && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{newsItem.sourceTitle}</span>
                          </>
                        )}
                      </div>
                      {newsItem.sourceUrl && (
                        <a
                          href={newsItem.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          referrerPolicy="no-referrer"
                          className="inline-flex items-center gap-1 font-semibold text-[#9E7425] hover:text-[#0F172A] transition-colors whitespace-nowrap"
                        >
                          <span>{t('访问官网 / 报道链接', 'Open Official Link')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-[#0F172A] leading-snug">
                      {newsItem.headline}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {newsItem.summary}
                    </p>
                  </article>
                ))}
              </div>

              {activeNews.groundingSources.length > 0 && (
                <div className="px-4 sm:px-6 py-3 bg-[#F7F7F5] border-t border-[#E8E6DF] flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-600 whitespace-nowrap">
                    {t('已核验政府及新闻源链接：', 'Verified Official & News Sources:')}
                  </span>
                  {activeNews.groundingSources.map((src, i) => (
                    <a
                      key={`${src.uri}-${i}`}
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="no-referrer"
                      className="inline-flex items-center gap-1 text-[#9E7425] hover:text-[#0F172A] hover:underline max-w-[240px] truncate"
                      title={src.title || src.uri}
                    >
                      <span className="truncate">{src.title || src.uri}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                  ))}
                </div>
              )}

              {activeNews.quotaLimited && activeNews.notice && (
                <div className="px-4 sm:px-6 py-2 bg-[#FFFDF7] border-t border-[#E8E6DF] text-[11px] text-slate-600">
                  {activeNews.notice}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
};
