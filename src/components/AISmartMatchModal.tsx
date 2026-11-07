import React, { useState } from 'react';
import { Merchant, AIMatchResult } from '../types';
import { fetchSmartMatch } from '../services/aiService';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Building2, 
  X, 
  ArrowRight, 
  RefreshCw, 
  ThumbsUp, 
  Lightbulb
} from 'lucide-react';

interface AISmartMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchants: Merchant[];
  onSelectMerchant: (merchant: Merchant) => void;
  onOpenMutualHelpWithNeed: (text: string) => void;
}

export const AISmartMatchModal: React.FC<AISmartMatchModalProps> = ({
  isOpen,
  onClose,
  merchants,
  onSelectMerchant,
  onOpenMutualHelpWithNeed,
}) => {
  const [needText, setNeedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<AIMatchResult | null>(null);

  if (!isOpen) return null;

  const quickPresets = [
    '寻找熟悉滑铁卢大学科研成果转化的企业级AI研发团队',
    '寻找安省SR&ED高新技术税收抵免与加中跨境公司架构CPA',
    '寻求大滑铁卢地区（K-W）8000平尺轻工业仓储选址与租约谈判',
    '筹备150人名商年会，需要高规格冷餐宴会及定制主厨私房菜',
  ];

  const handleMatch = async (textToUse?: string) => {
    const query = textToUse || needText;
    if (!query.trim()) return;

    setLoading(true);
    setMatchResult(null);

    try {
      const result = await fetchSmartMatch({
        needDescription: query.trim(),
        category: '综合商业互助',
        budgetOrReward: '名商会常规互助',
        existingMembers: merchants.map((m) => ({
          id: m.id,
          name: m.name,
          category: m.category,
          desc: m.tagline,
          rating: m.credibilityScore,
        })),
      });

      setMatchResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const recommendedMerchants = merchants.filter((m) =>
    matchResult?.recommendedMemberIds.includes(m.id)
  );

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
              <h3 className="text-sm sm:text-base font-bold text-white">
                滑铁卢名商会 AI 商机智能撮合引擎
              </h3>
              <p className="text-[11px] text-cyan-400/80">
                以自然语言语义理解，快速精准穿透280+本地认证企业供需网络
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

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Input Area */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300">
              输入您的合作设想、采购意向或业务痛点：
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={needText}
                onChange={(e) => setNeedText(e.target.value)}
                placeholder="例如：我们是一家初创公司，准备在滑铁卢租赁新办公楼，同时希望对公立项申请安省高新技术研发退税SR&ED..."
                className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 shadow-inner"
              />
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                常用商机模板快捷填入：
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setNeedText(preset);
                      handleMatch(preset);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all text-left"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => handleMatch()}
                disabled={loading || !needText.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    AI 语义解析匹配中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    开始智能撮合推荐
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Area */}
          {matchResult && (
            <div className="space-y-5 animate-in fade-in border-t border-slate-800 pt-5">
              {/* Rationale Banner */}
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    撮合逻辑与信誉匹配理由
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold">
                    匹配契合度: {matchResult.confidenceScore}%
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {matchResult.matchRationale}
                </p>
              </div>

              {/* Recommended Merchants Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  推荐对接的滑铁卢名商会员 ({recommendedMerchants.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendedMerchants.map((merchant) => (
                    <div
                      key={merchant.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-400/50 transition-all space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
                          {merchant.logo}
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-white line-clamp-1">
                            {merchant.name}
                          </h5>
                          <p className="text-[11px] text-slate-400">
                            {merchant.category} · 代表: {merchant.repName}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2">
                        {merchant.tagline}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                        <span className="text-emerald-400 font-semibold text-[11px]">
                          信誉 {merchant.credibilityScore}分
                        </span>
                        <button
                          onClick={() => {
                            onClose();
                            onSelectMerchant(merchant);
                          }}
                          className="text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1"
                        >
                          查看主页
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Next Steps */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <h5 className="font-bold text-white">推荐推进步骤 (Next Steps)：</h5>
                <ul className="space-y-1.5 text-slate-300">
                  {matchResult.suggestedNextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Jump to Post Help */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 text-xs">
                <span className="text-amber-200">
                  想把此需求发布到商会互助圈悬赏，让更多商户公开报名？
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onOpenMutualHelpWithNeed(needText);
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg whitespace-nowrap shadow"
                >
                  去互助圈悬赏发布
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
