import React, { useState } from 'react';
import { Merchant, AIMatchResult } from '../types';
import { fetchSmartMatch } from '../services/aiService';
import { 
  Sparkles, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  RefreshCw, 
  Lightbulb
} from 'lucide-react';
import { MerchantAvatar } from './MerchantAvatar';
import { useLanguage } from '../i18n/LanguageContext';
import { getLocalizedMerchantName, translateCategory } from '../i18n/domainTranslations';

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
  const { lang, isEn, t } = useLanguage();
  const [needText, setNeedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<AIMatchResult | null>(null);

  if (!isOpen) return null;

  const quickPresets = isEn
    ? [
        'Enterprise AI software engineering partner familiar with University of Waterloo commercialization',
        'Ontario CPA firm specializing in SR&ED tax credits and cross-border corporate structuring',
        '8,000 sq ft light-industrial warehouse leasing & negotiation in Kitchener-Waterloo',
        'Executive gala catering and private VIP reception planning for 150+ corporate guests',
      ]
    : [
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
        category: t('综合商业互助', 'General Business Collaboration'),
        budgetOrReward: t('融商汇常规互助', 'Standard WBCA Member Collaboration'),
        lang,
        existingMembers: merchants.map((m) => ({
          id: m.id,
          name: getLocalizedMerchantName(m, isEn),
          category: translateCategory(m.category, isEn),
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
    matchResult?.recommendedMemberIds.map(String).includes(String(m.id))
  );

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
                {t('滑铁卢融商汇 · 智能商机撮合引擎', 'WBCA · AI Executive Matchmaking Engine')}
              </h3>
              <p className="text-[11px] text-slate-300">
                {t(
                  '以语义理解精准穿透本地认证企业供需网络',
                  'Semantic matching across verified Waterloo corporate capabilities'
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

        {/* Body */}
        <div className="p-6 space-y-6 bg-[#F7F7F5]/50">
          <div className="space-y-3 bg-white p-5 rounded-2xl border border-[#E8E6DF] luxury-shadow">
            <label className="block text-xs font-bold text-[#0F172A]">
              {t('输入您的合作设想、采购意向或业务需求：', 'Describe your partnership objective, procurement need, or advisory inquiry:')}
            </label>
            <textarea
              rows={3}
              value={needText}
              onChange={(e) => setNeedText(e.target.value)}
              placeholder={t(
                '例如：我们是一家初创公司，准备在滑铁卢租赁新办公楼，同时希望申请安省高新技术研发退税 SR&ED...',
                'e.g. We are scaling our Waterloo R&D office and need commercial leasing counsel alongside Ontario SR&ED tax advisory...'
              )}
              className="w-full p-3.5 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
            />

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-[#9E7425]" />
                {t('常用商机场景快捷填入：', 'Quick Scenario Presets:')}
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
                    className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[#F7F7F5] hover:bg-[#0F172A] hover:text-white text-slate-700 border border-[#E8E6DF] transition-all text-left"
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
                className="px-5 py-2.5 gold-gradient text-[#0F172A] font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all disabled:opacity-50 hover:brightness-105"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {t('正在匹配中...', 'Matching Partners...')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    {t('开始精准撮合推荐', 'Find Matching Members')}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Area */}
          {matchResult && (
            <div className="space-y-5 animate-in fade-in">
              {/* Rationale Banner */}
              <div className="p-4 rounded-2xl bg-white text-[#0F172A] border border-[#C5A059]/45 space-y-2 luxury-shadow">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#9E7425] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                    {t('撮合逻辑与信誉匹配理由', 'Strategic Match Rationale')}
                  </span>
                  <span className="text-[#9E7425] text-[11px] font-bold">
                    {t('匹配契合度', 'Fit Confidence')}: {matchResult.confidenceScore}%
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {matchResult.matchRationale}
                </p>
              </div>

              {/* Recommended Merchants */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-[#9E7425] tracking-wider">
                  {t(
                    `推荐对接的滑铁卢融商汇企业 (${recommendedMerchants.length})`,
                    `Recommended WBCA Member Enterprises (${recommendedMerchants.length})`
                  )}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendedMerchants.map((merchant) => (
                    <div
                      key={merchant.id}
                      className="p-4 rounded-2xl bg-white border border-[#E8E6DF] hover:border-[#C5A059] transition-all space-y-3 luxury-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <MerchantAvatar merchant={merchant} size="sm" showBadge={false} />
                        <div>
                          <h5 className="font-editorial text-sm font-bold text-[#0F172A] line-clamp-1">
                            {getLocalizedMerchantName(merchant, isEn)}
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            {translateCategory(merchant.category, isEn)} · {merchant.repName}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2">
                        {merchant.tagline}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-[#E8E6DF] text-xs">
                        <span className="text-emerald-700 font-semibold text-[11px]">
                          {t(`信誉 ${merchant.credibilityScore} 分`, `Trust Score ${merchant.credibilityScore}`)}
                        </span>
                        <button
                          onClick={() => {
                            onClose();
                            onSelectMerchant(merchant);
                          }}
                          className="text-[#9E7425] hover:text-[#0F172A] font-bold flex items-center gap-1 transition-colors"
                        >
                          {t('查看档案', 'View Profile')}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Next Steps */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8E6DF] space-y-2 text-xs luxury-shadow">
                <h5 className="font-bold text-[#0F172A]">
                  {t('推荐推进步骤 (Next Steps)：', 'Recommended Next Steps:')}
                </h5>
                <ul className="space-y-1.5 text-slate-700">
                  {matchResult.suggestedNextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#0F172A] text-[#DFBA73] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Jump to Post Help */}
              <div className="p-4 rounded-2xl bg-white border border-[#C5A059]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs luxury-shadow">
                <span className="text-[#0F172A] font-medium">
                  {t(
                    '想把此需求发布到商会互助圈悬赏，让更多商户公开报名？',
                    'Publish this inquiry to the Mutual Aid Board to invite additional member proposals?'
                  )}
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onOpenMutualHelpWithNeed(needText);
                  }}
                  className="px-4 py-2 gold-gradient text-[#0F172A] font-bold rounded-xl whitespace-nowrap shadow-sm hover:brightness-105"
                >
                  {t('去互助圈悬赏发布', 'Post to Mutual Aid')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
