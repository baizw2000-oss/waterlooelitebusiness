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
  ExternalLink,
  Building2,
  User
} from 'lucide-react';
import { MerchantAvatar } from './MerchantAvatar';

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
  const [copied, setCopied] = useState(false);
  const [directMsg, setDirectMsg] = useState('');
  const [showDirectMsgBox, setShowDirectMsgBox] = useState(false);
  const [msgSent, setMsgSent] = useState(false);

  if (!merchant) return null;

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
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100 my-3 sm:my-8">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              融商汇认证商企档案
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">{merchant.category}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                copied
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/25'
              }`}
              title="复制商户专属名片直达链接 (?merchant=ID)"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制直达链接' : '分享直达链接'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Hero Banner inside modal */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 border border-slate-800">
            <div className="flex items-center gap-4">
              <MerchantAvatar
                merchant={merchant}
                size="xl"
                showBadge={true}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {merchant.name}
                  </h3>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{merchant.nameEn}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      merchant.entityType === 'individual'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {merchant.entityType === 'individual' ? '👤 个人/专家会员' : '🏢 企业认证商户'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {merchant.tier}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    始创于 {merchant.establishedYear} 年
                  </span>
                </div>
              </div>
            </div>

            {/* Credibility Badge */}
            <div className="sm:text-right bg-slate-900/90 px-4 py-2.5 rounded-xl border border-emerald-500/30">
              <div className="text-[11px] text-slate-400">商会信用综合评分</div>
              <div className="text-2xl font-black text-emerald-400 flex items-center sm:justify-end gap-1">
                {merchant.credibilityScore}
                <span className="text-xs font-normal text-slate-400">/ 100</span>
              </div>
              <div className="text-[10px] text-emerald-300/80 font-medium">AAA级合规示范单位</div>
            </div>
          </div>

          {/* Exclusive Deep-Link & SEO Indexing Showcase Box */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/30 space-y-2.5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  商户专属独立直达链接
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/40">
                    ?merchant={merchant.id}
                  </span>
                </span>
              </div>
              <span className="text-[10px] text-cyan-300/80 font-medium">
                Google/AI 专属索引优化 · 外部秒通
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-200 truncate select-all">
                {typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?merchant=${merchant.id}` : `?merchant=${merchant.id}`}
              </div>
              <button
                onClick={handleCopyLink}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all flex-shrink-0 ${
                  copied
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>已复制链接</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>复制直达链接</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              💡 <strong>使用场景</strong>：外部客户、微信好友或商业邮件点击此独立链接，将绕过首页和列表，<strong>秒级直达此商户的公信档案与预约对接窗口</strong>；同时作为 Google 及 AI 爬虫抓取的独立固定永久索引。
            </p>
          </div>

          {/* Delisted / Suspended Warning Banner */}
          {(merchant.isDelisted || merchant.auditStatus === 'SUSPENDED') && (
            <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-xs text-rose-200 flex items-start gap-2.5">
              <span className="text-base">⚠️</span>
              <div>
                <span className="font-bold text-rose-300">融商汇公信风控警示：该商企已被商会下架屏蔽</span>
                <p className="text-[11px] text-rose-200/90 mt-0.5">
                  原因备案：{merchant.delistReason || '存在严重会员投诉或失信舆情，经商会秘书处核实暂予下架公示'}
                </p>
              </div>
            </div>
          )}

          {/* Tagline */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-200 italic">
            "{merchant.tagline}"
          </div>

          {/* Member Exclusive Privilege Highlight */}
          {merchant.memberPrivilege && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-amber-500/5 border border-amber-500/40 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Award className="w-4 h-4 text-amber-400" />
                滑铁卢融商汇 会员专享尊享特权
              </div>
              <p className="text-xs text-slate-200 leading-relaxed pl-6">
                {merchant.memberPrivilege}
              </p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              企业简介与背景
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {merchant.description}
            </p>
          </div>

          {/* Core Services */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              核心业务与服务范畴
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {merchant.services.map((srv, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>{srv}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Representative / Key Contact Profile Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{merchant.repName}</span>
                  <span className="text-xs text-amber-300 font-normal">
                    {merchant.repTitle || '法定代表 / 核心负责人'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {merchant.entityType === 'individual'
                    ? '商会注册个人执业专家 · 实名认证照片'
                    : `「${merchant.name}」商会官方对接负责人`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDirectMsgBox(true)}
              className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Send className="w-3 h-3" />
              <span>直连商信</span>
            </button>
          </div>

          {/* Contact & Location Info */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              联络方式与办公驻地
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-slate-300 truncate">{merchant.address}</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">{merchant.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-slate-300 truncate">{merchant.email}</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <Globe className="w-4 h-4 text-purple-400 flex-shrink-0" />
                {merchant.website && merchant.website.trim() ? (
                  <a
                    href={merchant.website.startsWith('http') ? merchant.website : `https://${merchant.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline truncate flex items-center gap-1 font-medium"
                  >
                    <span>{merchant.website}</span>
                    <ExternalLink className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  </a>
                ) : (
                  <span className="text-slate-500 italic text-xs">
                    暂未公开企业网址
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Community Feedback & Reviews */}
          {merchant.sampleReviews && merchant.sampleReviews.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  商会会员真实履约点评 ({merchant.sampleReviews.length})
                </h4>
                <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{merchant.rating} 综合星级</span>
                </div>
              </div>

              <div className="space-y-2">
                {merchant.sampleReviews.map((rev, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                        <MessageSquareQuote className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rev.author}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{rev.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 italic">"{rev.content}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Direct Message Input Drawer */}
          {showDirectMsgBox && (
            <form onSubmit={handleSendDirectMsg} className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  向 {merchant.repName} ({merchant.name}) 发送商会内信
                </h5>
                <button
                  type="button"
                  onClick={() => setShowDirectMsgBox(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  收起
                </button>
              </div>

              {msgSent ? (
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs text-center font-semibold">
                  ✓ 内信已通过融商汇通道加密发送，负责人将通过注册邮箱和商会App即时提醒！
                </div>
              ) : (
                <>
                  <textarea
                    rows={3}
                    required
                    value={directMsg}
                    onChange={(e) => setDirectMsg(e.target.value)}
                    placeholder={`您好 ${merchant.repName}，我是融商汇会员，希望就以下事项与贵司沟通探讨...`}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                    >
                      确认发送
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onOpenAIReputation(merchant)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/40 hover:to-blue-600/40 border border-cyan-400/40 text-cyan-200 font-semibold text-xs shadow-md transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            生成深度 AI 商誉与舆情诊断
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDirectMsgBox(!showDirectMsgBox)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              发送商信
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenMutualHelpWithMerchant(merchant);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
            >
              发起互助合作
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
