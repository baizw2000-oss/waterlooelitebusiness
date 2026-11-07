import React, { useState } from 'react';
import { HelpPost, Merchant, UserProfile } from '../types';
import { 
  Users, 
  PlusCircle, 
  Sparkles, 
  Award, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Tag, 
  Search, 
  Send, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Mail
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MutualHelpHubProps {
  posts: HelpPost[];
  merchants: Merchant[];
  userPoints: number;
  user?: UserProfile;
  onAddPost: (newPost: HelpPost) => void;
  onAddOffer: (postId: string | number, content: string) => void;
  onAcceptOffer: (postId: string | number, offerId: string | number, rewardPoints: number) => void;
  onOpenSmartMatch: () => void;
  prefillMerchant?: Merchant | null;
}

export const MutualHelpHub: React.FC<MutualHelpHubProps> = ({
  posts,
  merchants,
  userPoints,
  user,
  onAddPost,
  onAddOffer,
  onAcceptOffer,
  onOpenSmartMatch,
  prefillMerchant,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [activeStatus, setActiveStatus] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(Boolean(prefillMerchant));
  const [expandedPostId, setExpandedPostId] = useState<string | number | null>(posts[0]?.id || null);
  const [replyText, setReplyText] = useState<{ [postId: string]: string }>({});
  const [broadcastNotice, setBroadcastNotice] = useState<string>('');

  // Create Form State
  const [newTitle, setNewTitle] = useState(
    prefillMerchant ? `【商机合作】寻求与「${prefillMerchant.name}」开展专项业务协同` : ''
  );
  const [newCategory, setNewCategory] = useState<'商机合作' | '供需对接' | '紧急求助' | '资源共享'>('供需对接');
  const [newDesc, setNewDesc] = useState('');
  const [newRewardPoints, setNewRewardPoints] = useState<number>(50);
  const [newTags, setNewTags] = useState('本地采购, 会员协同');
  const [newContact, setNewContact] = useState('滑铁卢企业联络处');

  const filteredPosts = posts.filter((p) => {
    const matchesCat = activeCategory === '全部' || p.category === activeCategory;
    const matchesStat = activeStatus === '全部' || p.status === activeStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesQ =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.authorCompany.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesStat && matchesQ;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const newPost: HelpPost = {
      id: Date.now(),
      authorUid: user?.uid,
      authorName: user?.name || '商会实名会员',
      authorCompany: user?.company || '名商会认证企业',
      authorAvatar: user?.avatar || '👨‍💼',
      title: newTitle.trim(),
      category: newCategory,
      description: newDesc.trim(),
      rewardPoints: Number(newRewardPoints) || 0,
      createdAt: '刚刚',
      status: '待对接',
      responsesCount: 0,
      tags: newTags.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
      contactInfo: newContact.trim() || user?.phone || user?.email || '',
      offers: [],
    };

    onAddPost(newPost);
    setShowCreateModal(false);

    // Count merchants with email
    const recipientCount = merchants.filter((m) => m.email).length;
    setBroadcastNotice(
      `🎉 商机互助已成功发布！系统已启动全员邮件广播程序，向商会全部 ${recipientCount} 家会员企业邮箱同步发送通报！`
    );
    setTimeout(() => {
      setBroadcastNotice('');
    }, 7000);

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setNewRewardPoints(50);
  };

  const handleSendOffer = (postId: string | number) => {
    const text = replyText[String(postId)];
    if (!text || !text.trim()) return;
    onAddOffer(postId, text.trim());
    setReplyText((prev) => ({ ...prev, [String(postId)]: '' }));
  };

  const handleAccept = (postId: string | number, offerId: string | number, points: number) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    onAcceptOffer(postId, offerId, points);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            滑铁卢名商互助圈与商机枢纽
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            企业供需直通 · 疑难痛点悬赏 · 资源共享 · 点对点诚信履约
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSmartMatch}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 hover:bg-cyan-900/60 text-xs sm:text-sm font-semibold transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            AI 自动撮合需求
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            发布互助 / 悬赏商机
          </button>
        </div>
      </div>

      {/* Broadcast Success Notice Banner */}
      {broadcastNotice && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/80 via-blue-950/70 to-slate-900 border border-sky-500/40 text-sky-200 text-xs sm:text-sm flex items-start sm:items-center justify-between gap-3 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 flex-shrink-0">
              <Mail className="w-4 h-4 text-sky-400" />
            </div>
            <span className="font-medium text-white">{broadcastNotice}</span>
          </div>
          <button
            onClick={() => setBroadcastNotice('')}
            className="text-slate-400 hover:text-white p-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3.5 shadow-xl">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="在互助圈内搜索：如 厂房选址、税务稽查、CNC打样、展厅租用..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {['全部', '供需对接', '商机合作', '紧急求助', '资源共享'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>状态:</span>
            {['全部', '待对接', '对接中', '已圆满解决'].map((st) => (
              <button
                key={st}
                onClick={() => setActiveStatus(st)}
                className={`hover:text-white transition-colors ${
                  activeStatus === st ? 'text-amber-400 font-semibold' : ''
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 p-8 space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">
              未找到匹配的互助或商机帖子
            </h4>
            <p className="text-xs text-slate-500">
              您可以切换分类筛选，或者立即发起第一条互助需求！
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isExpanded = expandedPostId === post.id;
            return (
              <div
                key={post.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all p-5 space-y-4 shadow-lg"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
                      {post.authorAvatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {post.authorName}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({post.authorCompany})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{post.createdAt}</span>
                        <span>·</span>
                        <span className="text-amber-400/80 font-medium">{post.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.rewardPoints > 0 && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        悬赏 {post.rewardPoints} 积分
                      </span>
                    )}

                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                        post.status === '已圆满解决'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                          : post.status === '对接中'
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {post.description}
                  </p>
                </div>

                {/* Tags & Contact */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {post.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <span className="text-slate-400 text-[11px]">
                    联络渠道: <strong className="text-slate-300">{post.contactInfo}</strong>
                  </span>
                </div>

                {/* Offer Responses Section Toggle */}
                <div className="pt-2">
                  <button
                    onClick={() =>
                      setExpandedPostId(isExpanded ? null : post.id)
                    }
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>查看会员响应与解决方案 ({post.offers.length})</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Expanded Offer Thread */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 animate-in fade-in">
                    {/* Existing Offers */}
                    {post.offers.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-2">
                        暂未收到响应，快来抢先提供解决方案赚取悬赏积分吧！
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {post.offers.map((offer) => (
                          <div
                            key={offer.id}
                            className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                              offer.accepted
                                ? 'bg-emerald-950/30 border-emerald-500/40'
                                : 'bg-slate-950/60 border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">
                                  {offer.responderName}
                                </span>
                                <span className="text-slate-400">
                                  ({offer.responderCompany})
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {offer.createdAt}
                                </span>
                              </div>

                              {offer.accepted ? (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                                  <Check className="w-3 h-3" />
                                  已采纳方案 (获得 {post.rewardPoints} 积分)
                                </span>
                              ) : (
                                post.status !== '已圆满解决' && (
                                  <button
                                    onClick={() =>
                                      handleAccept(post.id, offer.id, post.rewardPoints)
                                    }
                                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[10px] shadow"
                                  >
                                    采纳方案并释放悬赏积分
                                  </button>
                                )
                              )}
                            </div>
                            <p className="text-slate-300 leading-relaxed">
                              {offer.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Submit Offer Form */}
                    {post.status !== '已圆满解决' && (
                      <div className="pt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={replyText[String(post.id)] || ''}
                          onChange={(e) =>
                            setReplyText({ ...replyText, [String(post.id)]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendOffer(post.id);
                          }}
                          placeholder="撰写您的资源方案或联络建议（作为会员协助互助）..."
                          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        />
                        <button
                          onClick={() => handleSendOffer(post.id)}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow"
                        >
                          <Send className="w-3.5 h-3.5" />
                          提交响应
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Help Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  发布商机对接 / 互助需求
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-200 text-xs flex items-start gap-2">
              <Mail className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-white">全员邮件通报机制：</span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  发布后，系统将自动向商会名录中所有已登记的企业邮箱（共 {merchants.filter((m) => m.email).length} 家）以<strong>密件抄送 (BCC)</strong> 方式派发商机通报，全员速览的同时严密保护会员邮箱隐私。
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  需求标题 *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如：【供需对接】寻求滑铁卢本地具备安规认证的轻工五金加工..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    互助类型 *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="供需对接">供需对接</option>
                    <option value="商机合作">商机合作</option>
                    <option value="紧急求助">紧急求助</option>
                    <option value="资源共享">资源共享</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    悬赏名商积分 (可用: {userPoints}分)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={userPoints}
                    value={newRewardPoints}
                    onChange={(e) => setNewRewardPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  详细描述与具体要求 *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="请详细列出您的具体需求、交付时间表、地域范围或对合作方的特定资质要求..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    标签（英文或中文逗号隔开）
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="如：精密制造, 研发退税"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    首选联络信息
                  </label>
                  <input
                    type="text"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    placeholder="如：微信 / 电话 / 邮箱"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-md"
                >
                  确认发布
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
