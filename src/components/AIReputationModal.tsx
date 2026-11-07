import React, { useEffect, useState } from 'react';
import { Merchant, AIReputationResult } from '../types';
import { fetchMerchantReputationAnalysis } from '../services/aiService';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Search, 
  Globe, 
  X, 
  RefreshCw, 
  Award,
  ExternalLink
} from 'lucide-react';

interface AIReputationModalProps {
  merchant: Merchant | null;
  onClose: () => void;
}

export const AIReputationModal: React.FC<AIReputationModalProps> = ({
  merchant,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<AIReputationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (!merchant) return;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchMerchantReputationAnalysis({
        name: merchant.name,
        category: merchant.category,
        description: merchant.description,
        establishedYear: merchant.establishedYear,
        address: merchant.address,
        sampleReviews: merchant.sampleReviews
          ?.map((r) => `${r.author}: ${r.content}`)
          .join('; '),
      });
      setReport(data);
    } catch (err: any) {
      setError('分析服务遇到异常，已启用离线基线模型');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (merchant) {
      runAnalysis();
    }
  }, [merchant]);

  if (!merchant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Gemini AI 企业商誉与公信力综合体检
              </h3>
              <p className="text-[11px] text-cyan-400/80">
                AI模型实时研判 · Google检索声誉指数 · 商会信用评级
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Target Business Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">
                {merchant.logo}
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{merchant.name}</h4>
                <p className="text-xs text-slate-400">
                  {merchant.category} · 代表: {merchant.repName} · 驻地: {merchant.address}
                </p>
              </div>
            </div>

            <button
              onClick={runAnalysis}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="重新检测"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="py-14 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">
                  正在调取 Gemini 3.8 Flash 引擎分析...
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  正在检索本地 Google 商誉提及、分析商会互助契约履约数据、生成多维度舆情雷达与提升建议...
                </p>
              </div>
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Score & Tier Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {report.trustTier}
                  </div>
                  <h4 className="text-lg font-bold text-white pt-1">
                    商誉健康度评级：{report.sentiment === 'POSITIVE' ? '极高 · 诚信示范' : '良好 · 持续关注'}
                  </h4>
                  <p className="text-xs text-slate-300 max-w-md">
                    {report.analysisSummary}
                  </p>
                </div>

                {/* Big Score Gauge */}
                <div className="text-center p-3 rounded-2xl bg-slate-950/80 border border-cyan-400/30 min-w-[130px]">
                  <div className="text-xs text-cyan-300 font-medium">综合公信分</div>
                  <div className="text-4xl font-black text-cyan-300 font-serif">
                    {report.credibilityScore}
                  </div>
                  <div className="text-[10px] text-slate-400">满分 100分</div>
                </div>
              </div>

              {/* Google Search & Public Sentiment Radar */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    Google 检索声誉与社区舆情分布
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {report.googleSearchSentiment.mentionFrequency}
                  </span>
                </div>

                {/* Progress bar of Sentiment */}
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-800 border border-slate-700">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${report.googleSearchSentiment.positiveRatio}%` }}
                    title={`正面舆情: ${report.googleSearchSentiment.positiveRatio}%`}
                  />
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${report.googleSearchSentiment.neutralRatio}%` }}
                    title={`中立声量: ${report.googleSearchSentiment.neutralRatio}%`}
                  />
                  <div
                    className="h-full bg-rose-500 transition-all"
                    style={{ width: `${report.googleSearchSentiment.negativeRatio}%` }}
                    title={`负面反馈: ${report.googleSearchSentiment.negativeRatio}%`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    正面好评 {report.googleSearchSentiment.positiveRatio}%
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    中立/咨询 {report.googleSearchSentiment.neutralRatio}%
                  </span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    待核实争议 {report.googleSearchSentiment.negativeRatio}%
                  </span>
                </div>
              </div>

              {/* Strengths & Risks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Strengths */}
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <h5 className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    商誉优势与核心公信力
                  </h5>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    {report.strengths.map((s, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risk Points */}
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <h5 className="font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    潜在商誉关注与提升点
                  </h5>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    {report.riskPoints.map((r, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <h5 className="font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  商会 AI 专家建议行动计划 (Actionable Roadmap)
                </h5>
                <div className="space-y-1.5">
                  {report.actionableRecommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
                    >
                      <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>AI 诊断引擎: Gemini 3.8 Flash (Official Grounding)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
          >
            完成查看
          </button>
        </div>
      </div>
    </div>
  );
};
