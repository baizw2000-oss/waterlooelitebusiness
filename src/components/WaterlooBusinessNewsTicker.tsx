import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  RefreshCw,
  Pause,
  Play,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertCircle,
  Newspaper,
} from 'lucide-react';
import {
  WaterlooNewsIndustry,
  WaterlooNewsItem,
  WaterlooNewsResponse,
} from '../types';
import { fetchWaterlooBusinessNews } from '../services/aiService';
import { useLanguage } from '../i18n/LanguageContext';

interface IndustryOption {
  id: WaterlooNewsIndustry;
  zh: string;
  en: string;
}

const INDUSTRY_OPTIONS: IndustryOption[] = [
  { id: 'all', zh: '全部行业', en: 'All Sectors' },
  { id: 'tech', zh: '科技与AI', en: 'Tech & AI' },
  { id: 'finance', zh: '金融与财税', en: 'Finance & Tax' },
  { id: 'realEstate', zh: '商业地产', en: 'Commercial Realty' },
  { id: 'policy', zh: '政商与资助', en: 'Grants & Policy' },
  { id: 'commerce', zh: '零售与物流', en: 'Retail & Logistics' },
];

export const WaterlooBusinessNewsTicker: React.FC = () => {
  const { lang, isEn, t } = useLanguage();
  const [industry, setIndustry] = useState<WaterlooNewsIndustry>('all');
  const [newsData, setNewsData] = useState<WaterlooNewsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<WaterlooNewsItem | null>(null);

  const loadNews = useCallback(
    async (targetIndustry: WaterlooNewsIndustry, forceRefresh = false) => {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await fetchWaterlooBusinessNews(targetIndustry, lang, forceRefresh);
        setNewsData(data);
        setSelectedItem((prev) => {
          if (prev && data.items.some((item) => item.id === prev.id)) {
            return prev;
          }
          return null;
        });
      } catch (err: any) {
        setError(
          err?.message ||
            t(
              '暂时无法获取滑铁卢实时商情，请稍后重试。',
              'Unable to load Waterloo Business News right now. Please try again.'
            )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [lang, t]
  );

  useEffect(() => {
    loadNews(industry, false);
  }, [industry, lang, loadNews]);

  const items = newsData?.items || [];
  const groundingSources = newsData?.groundingSources || [];
  const isGoogleGrounded = newsData?.source === 'google-search-grounding';

  const formattedTime = newsData?.updatedAt
    ? new Date(newsData.updatedAt).toLocaleTimeString(isEn ? 'en-CA' : 'zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const handleSelectTickerItem = (item: WaterlooNewsItem) => {
    setSelectedItem((curr) => (curr?.id === item.id ? null : item));
  };

  return (
    <div
      className="rounded-xl border border-[#E8E6DF] bg-[#F7F7F5]/85 overflow-hidden"
      aria-label={t('滑铁卢商情快讯', 'Waterloo Business News')}
    >
      {/* Top Bar: Title, Search Attribution, Industry Segmented Filter, Controls */}
      <div className="px-3.5 sm:px-4 py-2.5 border-b border-[#E8E6DF] bg-white/80 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A] whitespace-nowrap">
            <Newspaper className="w-3.5 h-3.5 text-[#9E7425]" />
            <span>{t('滑铁卢实时商情', 'Waterloo Business News')}</span>
          </div>
          <span className="text-slate-300 text-xs" aria-hidden="true">
            ·
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 whitespace-nowrap">
            <Globe className="w-3 h-3 text-[#C5A059]" />
            <span>
              {isGoogleGrounded
                ? t('Google Search 实时检索', 'Google Search Grounded')
                : t('滑铁卢产业快讯摘要', 'Waterloo Sector Briefing')}
            </span>
          </span>
          {formattedTime && (
            <>
              <span className="text-slate-300 text-xs hidden sm:inline" aria-hidden="true">
                ·
              </span>
              <span className="text-[11px] text-slate-500 font-mono tabular-nums whitespace-nowrap">
                {t(`更新于 ${formattedTime}`, `Updated ${formattedTime}`)}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2">
          {/* Segmented Industry Filter Buttons */}
          <div
            className="flex items-center gap-1 p-0.5 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg overflow-x-auto scrollbar-none max-w-full"
            role="tablist"
            aria-label={t('按行业筛选商情', 'Filter news by industry')}
          >
            {INDUSTRY_OPTIONS.map((opt) => {
              const active = industry === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setIndustry(opt.id);
                    setSelectedItem(null);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-[#0F172A] font-semibold shadow-xs border border-[#E8E6DF]'
                      : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  {isEn ? opt.en : opt.zh}
                </button>
              );
            })}
          </div>

          {/* Interactive Ticker Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-slate-600 hover:text-[#0F172A] hover:bg-[#F7F7F5] transition-colors whitespace-nowrap"
              title={
                isPaused
                  ? t('继续滚动快讯', 'Resume ticker scroll')
                  : t('暂停滚动快讯', 'Pause ticker scroll')
              }
            >
              {isPaused ? (
                <Play className="w-3 h-3 text-[#9E7425]" />
              ) : (
                <Pause className="w-3 h-3 text-[#9E7425]" />
              )}
              <span className="hidden sm:inline">
                {isPaused ? t('继续', 'Play') : t('暂停', 'Pause')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => loadNews(industry, true)}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-slate-600 hover:text-[#0F172A] hover:bg-[#F7F7F5] disabled:opacity-50 transition-colors whitespace-nowrap"
              title={t('通过 Google Search 刷新最新商情', 'Refresh live news via Google Search')}
            >
              <RefreshCw
                className={`w-3 h-3 text-[#9E7425] ${loading || refreshing ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">{t('刷新', 'Refresh')}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded((e) => !e)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-[#9E7425] hover:text-[#0F172A] hover:bg-[#F7F7F5] transition-colors whitespace-nowrap"
              aria-expanded={isExpanded}
            >
              <span>{isExpanded ? t('收起简报', 'Hide Digest') : t('展开简报', 'Full Digest')}</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Scrolling Ticker Strip */}
      <div className="px-3.5 sm:px-4 py-2.5 flex items-center gap-3 overflow-hidden bg-white/40">
        {loading && items.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-slate-500 py-0.5">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C5A059]" />
            <span>
              {t(
                '正在通过 Google Search 检索滑铁卢最新行业商情...',
                'Searching live Waterloo Region business updates via Google Search...'
              )}
            </span>
          </div>
        ) : error && items.length === 0 ? (
          <div className="flex items-center justify-between w-full gap-3 text-xs text-rose-700">
            <span className="inline-flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </span>
            <button
              type="button"
              onClick={() => loadNews(industry, true)}
              className="font-semibold text-[#9E7425] hover:underline whitespace-nowrap"
            >
              {t('重试', 'Retry')}
            </button>
          </div>
        ) : (
          <div className="overflow-hidden whitespace-nowrap flex-1">
            <div
              className="animate-ticker text-xs text-[#0F172A]"
              style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
            >
              {items.concat(items).map((item, idx) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <button
                    key={`${item.id}-${idx}`}
                    type="button"
                    onClick={() => handleSelectTickerItem(item)}
                    className={`inline-flex items-center mx-5 gap-2 text-left transition-colors hover:text-[#9E7425] focus-visible:outline-none focus-visible:underline ${
                      isSelected ? 'text-[#9E7425] font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span className="text-[11px] font-semibold text-[#9E7425]">
                      {item.industry}
                    </span>
                    <span className="text-slate-300" aria-hidden="true">
                      ·
                    </span>
                    <span className="font-medium">{item.headline}</span>
                    {item.sourceTitle && (
                      <>
                        <span className="text-slate-300" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-[11px] text-slate-500">{item.sourceTitle}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected Ticker Item Spotlight (shown when user clicks a headline while collapsed) */}
      {!isExpanded && selectedItem && (
        <div className="px-4 py-3.5 border-t border-[#E8E6DF] bg-white space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span className="font-semibold text-[#9E7425]">{selectedItem.industry}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedItem.publishedHint}</span>
              {selectedItem.sourceTitle && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{selectedItem.sourceTitle}</span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="text-[11px] text-slate-500 hover:text-[#0F172A]"
            >
              {t('收起详情', 'Dismiss')}
            </button>
          </div>
          <p className="text-sm font-semibold text-[#0F172A] leading-snug">
            {selectedItem.headline}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">{selectedItem.summary}</p>
          {selectedItem.sourceUrl && (
            <div className="pt-1">
              <a
                href={selectedItem.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#9E7425] hover:text-[#0F172A] transition-colors"
              >
                <span>{t('查看原始来源报道', 'Read Original Source')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Expanded Full Executive Digest + Verified Google Search Sources */}
      {isExpanded && items.length > 0 && (
        <div className="border-t border-[#E8E6DF] bg-white divide-y divide-[#E8E6DF]">
          {items.map((item) => (
            <article key={item.id} className="px-4 py-3.5 space-y-1.5 hover:bg-[#F7F7F5]/60 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[#9E7425]">{item.industry}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.publishedHint}</span>
                  {item.sourceTitle && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{item.sourceTitle}</span>
                    </>
                  )}
                </div>
                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#9E7425] hover:text-[#0F172A] transition-colors whitespace-nowrap"
                  >
                    <span>{t('来源', 'Source')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <h3 className="text-sm font-semibold text-[#0F172A] leading-snug">
                {item.headline}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.summary}</p>
            </article>
          ))}

          {groundingSources.length > 0 && (
            <div className="px-4 py-2.5 bg-[#F7F7F5] flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-600 whitespace-nowrap">
                {t('Google 检索验证来源：', 'Google Search Sources:')}
              </span>
              {groundingSources.map((src, i) => (
                <a
                  key={`${src.uri}-${i}`}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className="inline-flex items-center gap-1 text-[#9E7425] hover:text-[#0F172A] hover:underline max-w-[220px] truncate"
                  title={src.title || src.uri}
                >
                  <span className="truncate">{src.title || src.uri}</span>
                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {newsData?.quotaLimited && newsData?.notice && (
        <div className="px-3.5 sm:px-4 py-1.5 border-t border-[#E8E6DF] bg-[#FFFDF7] text-[11px] text-slate-600 flex items-center justify-between gap-2">
          <span>{newsData.notice}</span>
        </div>
      )}
    </div>
  );
};
