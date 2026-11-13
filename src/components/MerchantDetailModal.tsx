import React, { useState } from 'react';
import { Merchant } from '../types';
import { 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  ShieldCheck, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Send, 
  Share2, 
  Copy,
  MessageSquareQuote,
  ExternalLink
} from 'lucide-react';
import { MerchantAvatar } from './MerchantAvatar';
import { MerchantPosterModal } from './MerchantPosterModal';
import { useLanguage } from '../i18n/LanguageContext';
import {
  getLocalizedMerchantName,
  getLocalizedMerchantSecondaryName,
  translateCategory,
  translateTier,
} from '../i18n/domainTranslations';

interface MerchantDetailModalProps {
  merchant: Merchant | null;
  onClose: () => void;
  onOpenAIReputation: (merchant: Merchant) => void;
  onOpenMutualHelpWithMerchant: (merchant: Merchant) => void;
}

export const MerchantDetailModal: React.FC<MerchantDetailModalProps> = ({
  merchant,
  onClose,
  onOpenAIReputation,
  onOpenMutualHelpWithMerchant,
}) => {
  const { isEn, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [directMsg, setDirectMsg] = useState('');
  const [showDirectMsgBox, setShowDirectMsgBox] = useState(false);
  const [msgSent, setMsgSent] = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);

  if (!merchant) return null;

  const primaryName = getLocalizedMerchantName(merchant, isEn);
  const secondaryName = getLocalizedMerchantSecondaryName(merchant, isEn);
  const displayCategory = translateCategory(merchant.category, isEn);
  const displayTier = translateTier(merchant.tier, isEn);

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const shareUrl = `${origin}${pathname}?merchant=${merchant.id}`;
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendDirectMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directMsg.trim()) return;
    setMsgSent(true);
    setTimeout(() => {
      setShowDirectMsgBox(false);
      setMsgSent(false);
      setDirectMsg('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2.5 sm:p-4 bg-[#0F172A]/75 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-white border border-[#E8E6DF] rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-[#0F172A] my-3 sm:my-8">
        {/* Sticky Obsidian Header */}
        <div className="sticky top-0 z-10 bg-[#0F172A] text-white px-6 py-4 border-b border-[#C5A059]/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#DFBA73] uppercase tracking-wider">
              {t('融商汇认证商企档案', 'WBCA Verified Enterprise Dossier')}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">{displayCategory}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPosterModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl gold-gradient text-[#0F172A] text-xs font-bold shadow-sm hover:brightness-105 transition-all"
              title={t('生成包含专属二维码的独立名片海报', 'Generate custom QR credential poster')}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('生成名片海报', 'Share Card')}</span>
            </button>
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                copied
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/15'
              }`}
              title={t('复制商户专属名片直达链接 (?merchant=ID)', 'Copy permanent direct enterprise link (?merchant=ID)')}
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5 text-[#DFBA73]" />}
              <span className="hidden sm:inline">
                {copied ? t('已复制链接', 'Copied') : t('复制直达链接', 'Copy Link')}
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 bg-[#F7F7F5]/40">
          {/* Crisp Editorial Identity Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#C5A059]/45 text-[#0F172A] luxury-shadow">
            <div className="flex items-center gap-4">
              <MerchantAvatar
                merchant={merchant}
                size="xl"
                showBadge={true}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#0F172A]">
                    {primaryName}
                  </h3>
                  <ShieldCheck className="w-5 h-5 text-[#9E7425]" />
                </div>
                {secondaryName && (
                  <p className="text-xs text-slate-600 mt-0.5">{secondaryName}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-600">
                  <span className="text-[#9E7425] font-semibold">
                    {merchant.entityType === 'individual'
                      ? t('个人执业专家', 'Independent Practitioner')
                      : t('企业认证商户', 'Verified Corporate Member')}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span>{displayTier}</span>
                  <span className="text-slate-300">·</span>
                  <span>
                    {t(`始创于 ${merchant.establishedYear} 年`, `Est. ${merchant.establishedYear}`)}
                  </span>
                </div>
              </div>
            </div>

            {/* Credibility Score */}
            <div className="sm:text-right bg-[#F7F7F5] px-4 py-2.5 rounded-xl border border-[#C5A059]/40">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                {t('商会信用综合评分', 'WBCA Credibility Score')}
              </div>
              <div className="text-2xl font-bold text-gold-ink font-editorial flex items-center sm:justify-end gap-1">
                {merchant.credibilityScore}
                <span className="text-xs font-sans font-normal text-slate-500">/ 100</span>
              </div>
              <div className="text-[10px] text-[#9E7425] font-semibold">
                {t('AAA级合规示范单位', 'AAA Compliance Distinction')}
              </div>
            </div>
          </div>

          {/* Exclusive Deep-Link & SEO Indexing Showcase Box */}
          <div className="p-4 rounded-2xl bg-white border border-[#E8E6DF] space-y-2.5 luxury-shadow">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                <span className="flex h-2 w-2 rounded-full bg-[#C5A059]" />
                <span>{t('商户专属独立直达链接', 'Permanent Enterprise Permalink')}</span>
                <span className="font-mono text-[11px] text-[#9E7425]">
                  ?merchant={merchant.id}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                {t('Google & AI 知识图谱永久索引', 'Google & AI Knowledge Graph Indexed')}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl px-3 py-2 text-xs font-mono text-[#0F172A] truncate select-all">
                {typeof window !== 'undefined'
                  ? `${window.location.origin}${window.location.pathname}?merchant=${merchant.id}`
                  : `?merchant=${merchant.id}`}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleCopyLink}
                  className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#0F172A] hover:bg-[#1E293B] text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('已复制链接', 'Copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#DFBA73]" />
                      <span>{t('复制链接', 'Copy URL')}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowPosterModal(true)}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all gold-gradient text-[#0F172A] hover:brightness-105"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('名片海报', 'QR Poster')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Delisted Warning Banner */}
          {(merchant.isDelisted || merchant.auditStatus === 'SUSPENDED') && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
              <span className="text-base">⚠️</span>
              <div>
                <span className="font-bold text-rose-800">
                  {t('融商汇公信风控警示：该商企已被商会下架屏蔽', 'WBCA Compliance Advisory: Listing Currently Suspended')}
                </span>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  {t('原因备案：', 'Recorded Reason: ')}
                  {merchant.delistReason ||
                    t(
                      '存在严重会员投诉或失信舆情，经商会秘书处核实暂予下架公示',
                      'Suspended pending Secretariat compliance review.'
                    )}
                </p>
              </div>
            </div>
          )}

          {/* Editorial Tagline */}
          {merchant.tagline && (
            <div className="p-4 rounded-xl bg-white border border-[#E8E6DF] text-sm text-[#0F172A] font-editorial italic border-l-2 border-l-[#C5A059]">
              &ldquo;{merchant.tagline}&rdquo;
            </div>
          )}

          {/* Member Exclusive Privilege */}
          {merchant.memberPrivilege && (
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#C5A059]/40 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#9E7425]">
                <Award className="w-4 h-4 text-[#C5A059]" />
                {t('滑铁卢融商汇 · 会员专享尊享特权', 'WBCA · Exclusive Member Privilege')}
              </div>
              <p className="text-xs text-[#0F172A] leading-relaxed pl-6">
                {merchant.memberPrivilege}
              </p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2 bg-white p-5 rounded-2xl border border-[#E8E6DF]">
            <h4 className="text-xs font-bold uppercase text-[#9E7425] tracking-wider">
              {t('企业简介与专业背景', 'Corporate Overview & Credentials')}
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {merchant.description}
            </p>
          </div>

          {/* Core Services */}
          {merchant.services && merchant.services.length > 0 && (
            <div className="space-y-2.5 bg-white p-5 rounded-2xl border border-[#E8E6DF]">
              <h4 className="text-xs font-bold uppercase text-[#9E7425] tracking-wider">
                {t('核心业务与服务范畴', 'Core Advisory & Service Lines')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {merchant.services.map((srv, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF] text-xs text-[#0F172A] font-medium"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#9E7425] flex-shrink-0" />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Representative Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#E8E6DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 luxury-shadow">
            <div className="flex items-center gap-3.5">
              <MerchantAvatar
                merchant={{
                  name: merchant.repName,
                  logo: merchant.photoUrl || (merchant.entityType === 'individual' ? merchant.logo : ''),
                  entityType: 'individual',
                }}
                size="md"
                showBadge={true}
              />
              <div>
                <div className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <span>{merchant.repName}</span>
                  <span className="text-xs text-[#9E7425] font-normal">
                    {merchant.repTitle || t('法定代表 / 核心负责人', 'Managing Principal')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {merchant.entityType === 'individual'
                    ? t('商会注册个人执业专家 · 实名认证档案', 'WBCA Registered Practitioner · Verified Profile')
                    : t(`「${primaryName}」商会官方对接负责人`, `Official WBCA Representative for ${primaryName}`)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDirectMsgBox(true)}
              className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#F7F7F5] hover:bg-[#0F172A] hover:text-white border border-[#E8E6DF] text-[#0F172A] text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Send className="w-3 h-3 text-[#9E7425]" />
              <span>{t('直连商信', 'Direct Inquiry')}</span>
            </button>
          </div>

          {/* Contact & Location Info */}
          <div className="space-y-2.5 bg-white p-5 rounded-2xl border border-[#E8E6DF]">
            <h4 className="text-xs font-bold uppercase text-[#9E7425] tracking-wider">
              {t('联络方式与办公驻地', 'Contact & Office Location')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF]">
                <MapPin className="w-4 h-4 text-[#9E7425] flex-shrink-0" />
                <span className="text-[#0F172A] truncate">{merchant.address}</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF]">
                <Phone className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span className="text-[#0F172A] font-medium">{merchant.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF]">
                <Mail className="w-4 h-4 text-[#0F172A] flex-shrink-0" />
                <span className="text-[#0F172A] truncate">{merchant.email}</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF]">
                <Globe className="w-4 h-4 text-[#9E7425] flex-shrink-0" />
                {merchant.website && merchant.website.trim() ? (
                  <a
                    href={merchant.website.startsWith('http') ? merchant.website : `https://${merchant.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#9E7425] hover:underline truncate flex items-center gap-1 font-semibold"
                  >
                    <span>{merchant.website}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                ) : (
                  <span className="text-slate-400 italic text-xs">
                    {t('暂未公开企业网址', 'Corporate website not listed')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Community Feedback */}
          {merchant.sampleReviews && merchant.sampleReviews.length > 0 && (
            <div className="space-y-2.5 bg-white p-5 rounded-2xl border border-[#E8E6DF]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-[#9E7425] tracking-wider">
                  {t(
                    `商会会员真实履约点评 (${merchant.sampleReviews.length})`,
                    `Verified Member Endorsements (${merchant.sampleReviews.length})`
                  )}
                </h4>
                <div className="flex items-center gap-1 text-xs text-[#9E7425] font-semibold">
                  <Star className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
                  <span>{merchant.rating} {t('综合星级', 'Rating')}</span>
                </div>
              </div>

              <div className="space-y-2">
                {merchant.sampleReviews.map((rev, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
                        <MessageSquareQuote className="w-3.5 h-3.5 text-[#9E7425]" />
                        <span>{rev.author}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{rev.date}</span>
                    </div>
                    <p className="text-xs text-slate-700 italic">&ldquo;{rev.content}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Direct Message Input Drawer */}
          {showDirectMsgBox && (
            <form onSubmit={handleSendDirectMsg} className="p-4 rounded-2xl bg-white border border-[#C5A059]/50 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-[#9E7425]" />
                  {t(
                    `向 ${merchant.repName} (${primaryName}) 发送商会内信`,
                    `Send Direct Message to ${merchant.repName} (${primaryName})`
                  )}
                </h5>
                <button
                  type="button"
                  onClick={() => setShowDirectMsgBox(false)}
                  className="text-xs text-slate-500 hover:text-[#0F172A]"
                >
                  {t('收起', 'Collapse')}
                </button>
              </div>

              {msgSent ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs text-center font-semibold">
                  {t(
                    '✓ 内信已通过融商汇通道发送，负责人将收到即时提醒！',
                    '✓ Dispatched via WBCA Executive Desk. The representative has been notified.'
                  )}
                </div>
              ) : (
                <>
                  <textarea
                    rows={3}
                    required
                    value={directMsg}
                    onChange={(e) => setDirectMsg(e.target.value)}
                    placeholder={t(
                      `您好 ${merchant.repName}，我是融商汇会员，希望就以下事项与贵司沟通探讨...`,
                      `Hello ${merchant.repName}, I am reaching out via the WBCA Directory regarding a strategic collaboration...`
                    )}
                    className="w-full p-2.5 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 gold-gradient text-[#0F172A] font-bold rounded-lg text-xs"
                    >
                      {t('确认发送', 'Send Message')}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>

        {/* Sticky Footer Actions */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-[#E8E6DF] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenAIReputation(merchant)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-xs shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#DFBA73]" />
              {t('生成 AI 商誉与舆情诊断', 'Run AI Reputation Audit')}
            </button>

            <button
              onClick={() => setShowPosterModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F7F7F5] hover:bg-amber-50 border border-[#C5A059]/50 text-[#9E7425] font-semibold text-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#9E7425]" />
              {t('生成名片海报', 'Generate Poster')}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDirectMsgBox(!showDirectMsgBox)}
              className="px-4 py-2 rounded-xl bg-[#F7F7F5] hover:bg-slate-200 border border-[#E8E6DF] text-[#0F172A] font-semibold text-xs transition-colors"
            >
              {t('发送商信', 'Message')}
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenMutualHelpWithMerchant(merchant);
              }}
              className="px-4 py-2 rounded-xl gold-gradient hover:brightness-105 text-[#0F172A] font-bold text-xs shadow-sm transition-all"
            >
              {t('发起互助合作', 'Initiate Partnership')}
            </button>
          </div>
        </div>
      </div>

      {showPosterModal && (
        <MerchantPosterModal
          merchant={merchant}
          onClose={() => setShowPosterModal(false)}
        />
      )}
    </div>
  );
};
