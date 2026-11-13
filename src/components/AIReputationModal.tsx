import React, { useEffect, useState } from 'react';
import { Merchant, AIReputationResult } from '../types';
import { fetchMerchantReputationAnalysis } from '../services/aiService';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Globe, 
  X, 
  RefreshCw
} from 'lucide-react';
import { MerchantAvatar } from './MerchantAvatar';
import { useLanguage } from '../i18n/LanguageContext';
import { getLocalizedMerchantName, translateCategory } from '../i18n/domainTranslations';

interface AIReputationModalProps {
  merchant: Merchant | null;
  onClose: () => void;
}

export const AIReputationModal: React.FC<AIReputationModalProps> = ({
  merchant,
  onClose,
}) => {
  const { lang, isEn, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<AIReputationResult | null>(null);

  const runAnalysis = async () => {
    if (!merchant) return;
    setLoading(true);

    try {
      const data = await fetchMerchantReputationAnalysis(
        {
          name: getLocalizedMerchantName(merchant, isEn),
          category: translateCategory(merchant.category, isEn),
          description: merchant.description,
          establishedYear: merchant.establishedYear,
          address: merchant.address,
          sampleReviews: merchant.sampleReviews
            ?.map((r) => `${r.author}: ${r.content}`)
            .join('; '),
        },
        lang
      );
      setReport(data);
    } catch (err: any) {
      // Fallback handled inside service
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (merchant) {
      runAnalysis();
    }
  }, [merchant, lang]);

  if (!merchant) return null;

  const merchantName = getLocalizedMerchantName(merchant, isEn);
  const categoryLabel = translateCategory(merchant.category, isEn);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2.5 sm:p-4 bg-[#0F172A]/75 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-white border border-[#E8E6DF] rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-[#0F172A] my-3 sm:my-8">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0F172A] text-white px-6 py-4 border-b border-[#C5A059]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white/10 text-[#DFBA73] border border-[#C5A059]/40">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-base font-bold text-white">
                {t('AI 企业商誉与公信力综合体检报告', 'AI Corporate Reputation & Trust Dossier')}
              </h3>
              <p className="text-[11px] text-slate-300">
                {t(
                  '实时声誉研判 · Google检索口碑指数 · 商会信用评级',
                  'Real-Time Sentiment Intelligence · Google Citation Pulse · Alliance Trust Rating'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 text-slate-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-[#F7F7F5]/50">
          {/* Target Business Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#E8E6DF] flex items-center justify-between gap-4 luxury-shadow">
            <div className="flex items-center gap-3">
              <MerchantAvatar merchant={merchant} size="md" showBadge={false} />
              <div>
                <h4 className="font-editorial text-base font-bold text-[#0F172A]">{merchantName}</h4>
                <p className="text-xs text-slate-500">
                  {categoryLabel} · {t('代表', 'Principal')}: {merchant.repName} · {t('驻地', 'Base')}: {merchant.address}
                </p>
              </div>
            </div>

            <button
              onClick={runAnalysis}
              disabled={loading}
              className="p-2 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF] hover:border-[#C5A059] text-slate-600 hover:text-[#0F172A] transition-colors"
              title={t('重新检测', 'Re-run Audit')}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="py-14 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full border-4 border-[#E8E6DF] border-t-[#C5A059] animate-spin" />
              <div className="space-y-1">
                <p className="font-editorial text-base font-bold text-[#0F172A]">
                  {t('正在生成多维度商誉分析报告...', 'Compiling Multi-Dimensional Reputation Audit...')}
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {t(
                    '正在检索本地 Google 商誉提及、分析商会互助契约履约数据、生成多维度舆情雷达与提升建议...',
                    'Analyzing regional citations, alliance fulfillment history, sentiment distribution, and strategic recommendations...'
                  )}
                </p>
              </div>
            </div>
          ) : report ? (
            <div className="space-y-5">
              {/* Score & Tier Banner */}
              <div className="p-5 rounded-2xl bg-white text-[#0F172A] border border-[#C5A059]/45 flex flex-col sm:flex-row items-center justify-between gap-4 luxury-shadow">
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 text-[#9E7425] text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                    <span>{report.trustTier}</span>
                  </div>
                  <h4 className="font-editorial text-lg font-bold text-[#0F172A]">
                    {t('商誉健康度评级：', 'Credibility Standing: ')}
                    {report.sentiment === 'POSITIVE'
                      ? t('极高 · 诚信示范', 'Exemplary · Verified Standing')
                      : t('良好 · 持续关注', 'Sound · Monitored')}
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                    {report.analysisSummary}
                  </p>
                </div>

                <div className="text-center p-4 rounded-xl bg-[#F7F7F5] border border-[#C5A059]/45 min-w-[125px]">
                  <div className="text-[11px] text-slate-600 font-medium">
                    {t('综合公信分', 'Trust Index')}
                  </div>
                  <div className="text-4xl font-bold text-gold-ink font-editorial">
                    {report.credibilityScore}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {t('满分 100 分', 'Out of 100')}
                  </div>
                </div>
              </div>

              {/* Google Search & Public Sentiment Radar */}
              <div className="p-5 rounded-2xl bg-white border border-[#E8E6DF] space-y-3 luxury-shadow">
                <div className="flex items-center justify-between text-xs font-bold text-[#0F172A]">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#9E7425]" />
                    {t('Google 检索声誉与社区舆情分布', 'Google Search Sentiment & Community Pulse')}
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {report.googleSearchSentiment.mentionFrequency}
                  </span>
                </div>

                <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#F7F7F5] border border-[#E8E6DF]">
                  <div
                    className="h-full bg-emerald-600 transition-all"
                    style={{ width: `${report.googleSearchSentiment.positiveRatio}%` }}
                  />
                  <div
                    className="h-full bg-[#C5A059] transition-all"
                    style={{ width: `${report.googleSearchSentiment.neutralRatio}%` }}
                  />
                  <div
                    className="h-full bg-rose-500 transition-all"
                    style={{ width: `${report.googleSearchSentiment.negativeRatio}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    {t('正面好评', 'Positive')} {report.googleSearchSentiment.positiveRatio}%
                  </span>
                  <span className="flex items-center gap-1 text-[#9E7425]">
                    <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                    {t('中立/咨询', 'Neutral')} {report.googleSearchSentiment.neutralRatio}%
                  </span>
                  <span className="flex items-center gap-1 text-rose-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    {t('待核实争议', 'Flagged')} {report.googleSearchSentiment.negativeRatio}%
                  </span>
                </div>
              </div>

              {/* Strengths & Risks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-2 luxury-shadow">
                  <h5 className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {t('商誉优势与核心公信力', 'Core Reputation Strengths')}
                  </h5>
                  <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
                    {report.strengths.map((s, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#C5A059]/40 space-y-2 luxury-shadow">
                  <h5 className="font-bold text-[#9E7425] flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-[#C5A059]" />
                    {t('潜在商誉关注与提升点', 'Strategic Enhancement Areas')}
                  </h5>
                  <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
                    {report.riskPoints.map((r, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="p-5 rounded-2xl bg-white border border-[#E8E6DF] space-y-3 text-xs luxury-shadow">
                <h5 className="font-bold text-[#0F172A] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#9E7425]" />
                  {t('商会专家建议行动计划 (Actionable Roadmap)', 'Recommended Executive Action Plan')}
                </h5>
                <div className="space-y-2">
                  {report.actionableRecommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF] text-slate-700"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#0F172A] text-[#DFBA73] font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-[#E8E6DF] flex items-center justify-between text-xs text-slate-500">
          <span>{t('滑铁卢融商汇 · 官方商誉分析报告', 'WBCA · Official Trust & Reputation Report')}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold rounded-xl transition-colors"
          >
            {t('完成查看', 'Done')}
          </button>
        </div>
      </div>
    </div>
  );
};
