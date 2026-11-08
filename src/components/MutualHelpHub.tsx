import React, { useState } from 'react';
import { HelpPost, Merchant, UserProfile } from '../types';
import { 
  Users, 
  PlusCircle, 
  Sparkles, 
  Award, 
  MessageSquare, 
  Clock, 
  Search, 
  Send, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Mail,
  ShieldCheck,
  AlertCircle,
  Building2,
  UserCheck,
  Trash2,
  Ban,
  Eye,
  EyeOff,
  Edit3,
  X,
  AlertTriangle,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAvatar } from './UserAvatar';

interface MutualHelpHubProps {
  posts: HelpPost[];
  merchants: Merchant[];
  userPoints: number;
  user?: UserProfile;
  onAddPost: (newPost: HelpPost) => void;
  onApproveAndBroadcastPost?: (postId: string | number) => void;
  onApprovePost?: (postId: string | number) => void;
  onRejectPost?: (postId: string | number, reason?: string) => void;
  onDelistPost?: (postId: string | number, reason?: string) => void;
  onRelistPost?: (postId: string | number) => void;
  onUpdatePost?: (postId: string | number, updates: Partial<HelpPost>) => void;
  onDeletePost?: (postId: string | number) => void;
  onAddOffer: (postId: string | number, content: string) => void;
  onAcceptOffer: (postId: string | number, offerId: string | number, rewardPoints: number) => void;
  onOpenSmartMatch: () => void;
  prefillMerchant?: Merchant | null;
  onOpenLogin?: () => void;
  onLoginSuccess?: (memberProfile: UserProfile) => void;
  onOpenMerchantApply?: () => void;
}

export const MutualHelpHub: React.FC<MutualHelpHubProps> = ({
  posts,
  merchants,
  userPoints,
  user,
  onAddPost,
  onApproveAndBroadcastPost,
  onApprovePost,
  onRejectPost,
  onDelistPost,
  onRelistPost,
  onUpdatePost,
  onDeletePost,
  onAddOffer,
  onAcceptOffer,
  onOpenSmartMatch,
  prefillMerchant,
  onOpenLogin,
  onLoginSuccess,
  onOpenMerchantApply,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [activeStatus, setActiveStatus] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(Boolean(prefillMerchant));
  const [expandedPostId, setExpandedPostId] = useState<string | number | null>(posts[0]?.id || null);
  const [replyText, setReplyText] = useState<{ [postId: string]: string }>({});
  const [broadcastNotice, setBroadcastNotice] = useState<string>('');

  // Check if admin is authenticated (synced with admin panel)
  const isAdmin = typeof window !== 'undefined' && sessionStorage.getItem('weba_admin_auth') === 'true';

  // Submitter identity choice in modal: 'member' (Chamber member) or 'external' (Prospective client/partner)
  const [submitterType, setSubmitterType] = useState<'member' | 'external'>('external');
  
  // External Prospect Form Inputs
  const [externalName, setExternalName] = useState('');
  const [externalCompany, setExternalCompany] = useState('');
  const [externalPhone, setExternalPhone] = useState('');
  const [externalEmail, setExternalEmail] = useState('');

  // Common Post Form State
  const [newTitle, setNewTitle] = useState(
    prefillMerchant ? `【商机合作】寻求与「${prefillMerchant.name}」开展专项业务协同` : ''
  );
  const [newCategory, setNewCategory] = useState<'商机合作' | '供需对接' | '紧急求助' | '资源共享'>('商机合作');
  const [newDesc, setNewDesc] = useState('');
  const [newRewardPoints, setNewRewardPoints] = useState<number>(50);
  const [newTags, setNewTags] = useState('本地采购, 业务协同');
  const [newContact, setNewContact] = useState('');

  // Admin Management Modal States: Edit, Delist, Delete
  const [editingPost, setEditingPost] = useState<HelpPost | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<'商机合作' | '供需对接' | '紧急求助' | '资源共享'>('商机合作');
  const [editDesc, setEditDesc] = useState('');
  const [editRewardPoints, setEditRewardPoints] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<'待对接' | '对接中' | '已圆满解决'>('待对接');
  const [editAuditStatus, setEditAuditStatus] = useState<'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED'>('APPROVED');
  const [editTags, setEditTags] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editIsDelisted, setEditIsDelisted] = useState(false);
  const [editDelistReason, setEditDelistReason] = useState('');

  const [delistingPost, setDelistingPost] = useState<HelpPost | null>(null);
  const [delistReasonInput, setDelistReasonInput] = useState('不符合商会发布规范或已失效');
  const [deletingPost, setDeletingPost] = useState<HelpPost | null>(null);

  // Count pending and delisted posts for admin tabs
  const pendingPostsCount = posts.filter((p) => p.auditStatus === 'PENDING_APPROVAL').length;
  const delistedPostsCount = posts.filter((p) => Boolean(p.isDelisted)).length;

  const filteredPosts = posts.filter((p) => {
    // If filtering specifically by '待审核' (Admin only)
    if (activeStatus === '待审核') {
      return p.auditStatus === 'PENDING_APPROVAL';
    }

    // If filtering specifically by '已下架' (Admin only)
    if (activeStatus === '已下架') {
      return Boolean(p.isDelisted);
    }

    // Normal visitors cannot see delisted, unapproved, or rejected posts
    if (!isAdmin) {
      if (p.isDelisted) return false;
      if (p.auditStatus === 'PENDING_APPROVAL') return false;
      if (p.auditStatus === 'REJECTED') return false;
    }

    // If admin is in a regular status tab (e.g. 待对接, 对接中, 已圆满解决), don't show delisted ones unless looking at 全部 or 已下架
    if (isAdmin && p.isDelisted && activeStatus !== '全部') {
      return false;
    }

    const matchesCat = activeCategory === '全部' || p.category === activeCategory;
    const matchesStat = activeStatus === '全部' || p.status === activeStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesQ =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.authorCompany.toLowerCase().includes(q) ||
      p.authorName.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesStat && matchesQ;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const isExternal = submitterType === 'external';

    // Strict qualification check: If submitting as a Chamber Member, user MUST be authenticated as a member
    if (!isExternal && !user?.isMember) {
      alert('⚠️ 发布【商会认证企业会员】商机合作需要认证商会实名企业会员资格！\n\n系统已为您打开企业会员登录核验窗口，请先完成会员身份核验登录，或选择【外部潜在客户 / 合作伙伴】通道提交。');
      if (onOpenLogin) onOpenLogin();
      return;
    }

    if (isExternal) {
      if (!externalName.trim()) {
        alert('请填写您的联络代表姓名');
        return;
      }
      if (!externalPhone.trim() && !externalEmail.trim()) {
        alert('请至少留下联络电话或邮箱，以便商会秘书处核验及企业与您取得联系');
        return;
      }
    }

    const contactStr = isExternal
      ? `电话: ${externalPhone.trim() || '未填'} | 邮箱: ${externalEmail.trim() || '未填'}`
      : (newContact.trim() || user?.phone || user?.email || '商会平台内信沟通');

    const newPost: HelpPost = {
      id: Date.now(),
      authorUid: isExternal ? undefined : user?.uid,
      authorName: isExternal ? externalName.trim() : (user?.name || '商会实名会员'),
      authorCompany: isExternal ? (externalCompany.trim() || '外部潜在客户') : (user?.company || '名商会认证企业'),
      authorAvatar: isExternal ? '💼' : (user?.avatar || '👨‍💼'),
      authorPhone: isExternal ? externalPhone.trim() : user?.phone,
      authorEmail: isExternal ? externalEmail.trim() : user?.email,
      isExternalProspect: isExternal,
      auditStatus: isExternal ? 'PENDING_APPROVAL' : 'APPROVED',
      broadcastStatus: isExternal ? 'NOT_BROADCASTED' : 'BROADCASTED',
      broadcastedAt: isExternal ? undefined : new Date().toISOString(),
      isDelisted: false,
      title: newTitle.trim(),
      category: newCategory,
      description: newDesc.trim(),
      rewardPoints: Number(newRewardPoints) || 0,
      createdAt: '刚刚',
      status: '待对接',
      responsesCount: 0,
      tags: newTags.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
      contactInfo: contactStr,
      offers: [],
    };

    onAddPost(newPost);
    setShowCreateModal(false);

    if (isExternal) {
      // Scheme B: External Prospect notification
      setBroadcastNotice(
        '🎉 需求提交成功！商会秘书处已收到您的合作申请，正在进行真实性核验。核验通过后系统将立即向全商会企业邮件群发通报并组织对接，请保持联络畅通！'
      );
    } else {
      // Member direct broadcast
      const recipientCount = merchants.filter((m) => m.email).length;
      setBroadcastNotice(
        `🎉 商机互助已成功发布！系统已启动全员邮件广播程序，向商会全部 ${recipientCount} 家会员企业邮箱同步发送通报！`
      );
    }

    setTimeout(() => {
      setBroadcastNotice('');
    }, 8000);

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setNewRewardPoints(50);
    setExternalName('');
    setExternalCompany('');
    setExternalPhone('');
    setExternalEmail('');
  };

  // Start Edit Post Handler
  const handleStartEditPost = (post: HelpPost) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditCategory(post.category);
    setEditDesc(post.description);
    setEditRewardPoints(post.rewardPoints || 0);
    setEditStatus(post.status);
    setEditAuditStatus(post.auditStatus || 'APPROVED');
    setEditTags((post.tags || []).join(', '));
    setEditContact(post.contactInfo || '');
    setEditIsDelisted(Boolean(post.isDelisted));
    setEditDelistReason(post.delistReason || '不符合商会发布规范或已失效');
  };

  // Save Edit Post Handler
  const handleSaveEditPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editTitle.trim() || !editDesc.trim()) return;

    const updates: Partial<HelpPost> = {
      title: editTitle.trim(),
      category: editCategory,
      description: editDesc.trim(),
      rewardPoints: Number(editRewardPoints) || 0,
      status: editStatus,
      auditStatus: editAuditStatus,
      tags: editTags.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
      contactInfo: editContact.trim(),
      isDelisted: editIsDelisted,
      delistReason: editIsDelisted ? (editDelistReason.trim() || '不符合商会发布规范或已失效') : undefined,
      delistedAt: editIsDelisted ? (editingPost.delistedAt || new Date().toISOString()) : undefined,
      delistedBy: editIsDelisted ? (editingPost.delistedBy || user?.name || '商会秘书处') : undefined,
    };

    if (onUpdatePost) {
      onUpdatePost(editingPost.id, updates);
    }
    setEditingPost(null);
    setBroadcastNotice('✅ 商机互助修改成功，已实时同步保存至云端数据库！');
    setTimeout(() => setBroadcastNotice(''), 6000);
  };

  // Confirm Delist Handler
  const handleConfirmDelist = () => {
    if (!delistingPost) return;
    if (onDelistPost) {
      onDelistPost(delistingPost.id, delistReasonInput.trim());
    }
    setDelistingPost(null);
    setBroadcastNotice('⚠️ 该商机已成功下架（普通会员与访客已无法查看）。');
    setTimeout(() => setBroadcastNotice(''), 6000);
  };

  // Confirm Relist Handler
  const handleRelist = (postId: string | number) => {
    if (onRelistPost) {
      onRelistPost(postId);
    }
    setBroadcastNotice('✅ 该商机已重新上架，恢复全平台会员浏览！');
    setTimeout(() => setBroadcastNotice(''), 6000);
  };

  // Confirm Delete Handler
  const handleConfirmDelete = () => {
    if (!deletingPost) return;
    if (onDeletePost) {
      onDeletePost(deletingPost.id);
    }
    setDeletingPost(null);
    setBroadcastNotice('🗑 该商机记录已从云端数据库彻底删除！');
    setTimeout(() => setBroadcastNotice(''), 6000);
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
            滑铁卢创商汇 · 商机合作与互助圈
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            开放外部商机对接 · 疑难痛点悬赏 · 真实企业采购 · 点对点诚信履约
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
            发布商机 / 互助需求
          </button>
        </div>
      </div>

      {/* Admin Pending Opportunity Alert Banner */}
      {isAdmin && pendingPostsCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <span>
              <strong>商会秘书处审核提醒：</strong>当前有 <span className="font-bold text-amber-300 underline">{pendingPostsCount}</span> 笔外部潜在客户提交的商机需求等待核验！核验通过后可一键群发全员广播。
            </span>
          </div>
          <button
            onClick={() => setActiveStatus('待审核')}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex-shrink-0 transition-colors"
          >
            立即审核待审商机 ({pendingPostsCount})
          </button>
        </div>
      )}

      {/* Broadcast Alert / Toast Notification */}
      {broadcastNotice && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/50 shadow-xl shadow-amber-500/10 text-white flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300">系统操作通知</h4>
              <p className="text-xs text-slate-300 mt-0.5">{broadcastNotice}</p>
            </div>
          </div>
          <button
            onClick={() => setBroadcastNotice('')}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索商机标题、合作需求、发起企业、联络人或关键词..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['全部', '商机合作', '供需对接', '紧急求助', '资源共享'].map((cat) => (
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

          {/* Status Tabs */}
          <div className="flex items-center gap-2 text-slate-400 flex-wrap">
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
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveStatus('待审核')}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors ${
                    activeStatus === '待审核'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                  }`}
                >
                  待审核 ({pendingPostsCount})
                </button>
                <button
                  onClick={() => setActiveStatus('已下架')}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors ${
                    activeStatus === '已下架'
                      ? 'bg-rose-500 text-white border-rose-400'
                      : 'bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25'
                  }`}
                >
                  已下架 ({delistedPostsCount})
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 p-8 space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">
              {activeStatus === '待审核' 
                ? '当前暂无待审核的商机需求' 
                : activeStatus === '已下架'
                ? '当前暂无已下架的商机'
                : '未找到匹配的互助或商机需求'}
            </h4>
            <p className="text-xs text-slate-500">
              您可以切换分类筛选，或者立即发布一条新的合作需求！
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isExpanded = expandedPostId === post.id;
            const isPending = post.auditStatus === 'PENDING_APPROVAL';
            const isDelisted = Boolean(post.isDelisted);

            return (
              <div
                key={post.id}
                className={`rounded-2xl border transition-all p-5 space-y-4 shadow-lg ${
                  isDelisted
                    ? 'bg-rose-950/15 border-rose-900/60 opacity-90'
                    : isPending
                    ? 'bg-amber-950/20 border-amber-500/50 shadow-amber-500/10'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Delisted Alert Banner for Admin */}
                {isDelisted && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-rose-300">
                          ⚠️ 该商机已被管理员下架（普通会员与访客不可见）
                        </span>
                        <p className="text-[11px] text-rose-200/70 mt-0.5">
                          下架原因：<strong className="text-white">{post.delistReason || '不符合商会发布规范或已失效'}</strong> · 
                          操作人：{post.delistedBy || '商会秘书处'}
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleRelist(post.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold self-end sm:self-auto flex items-center gap-1 shadow"
                        title="重新上架，恢复在商机互助圈公开展出"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        重新上架恢复展示
                      </button>
                    )}
                  </div>
                )}

                {/* Pending Audit Alert for Admin */}
                {isPending && (
                  <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-300 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          外部潜在客户商机 · 待秘书处核验
                        </span>
                        <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-300">
                          暂未群发
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-200/80">
                        外部联络人：<strong className="text-white">{post.authorName}</strong> · 
                        企业/单位：<strong className="text-white">{post.authorCompany}</strong> · 
                        联络电话：<strong className="text-white">{post.authorPhone || '未填'}</strong> · 
                        邮箱：<strong className="text-white">{post.authorEmail || '未填'}</strong>
                      </p>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                        {onApproveAndBroadcastPost && (
                          <button
                            onClick={() => {
                              confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
                              onApproveAndBroadcastPost(post.id);
                            }}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shadow"
                            title="审核通过并立即以BCC密送群发邮件通报全商会商企"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            审核通过并全员广播
                          </button>
                        )}

                        {onApprovePost && (
                          <button
                            onClick={() => onApprovePost(post.id)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1"
                            title="仅审核通过在网站展示，不触发全员发信"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            仅通过上架
                          </button>
                        )}

                        {onRejectPost && (
                          <button
                            onClick={() => onRejectPost(post.id, '不符合商会发布规范')}
                            className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-1 border border-rose-500/30"
                            title="驳回该商机"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            驳回
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <UserAvatar avatar={post.authorAvatar} name={post.authorName || post.authorCompany} size="md" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">
                          {post.authorName}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({post.authorCompany})
                        </span>
                        {/* Member vs External Tag */}
                        {post.isExternalProspect ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                            <UserCheck className="w-3 h-3" />
                            外部潜客商机 · 秘书处核验
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 font-semibold">
                            <Building2 className="w-3 h-3" />
                            商会认证企业会员
                          </span>
                        )}
                        {isDelisted && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold">
                            <EyeOff className="w-3 h-3" />
                            已下架
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{post.createdAt}</span>
                        <span>·</span>
                        <span className="text-amber-400/80 font-medium">{post.category}</span>
                        {post.broadcastStatus === 'BROADCASTED' && (
                          <>
                            <span>·</span>
                            <span className="text-sky-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              已全员通报
                            </span>
                          </>
                        )}
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
                    联络渠道: <strong className="text-slate-200">{post.contactInfo}</strong>
                  </span>
                </div>

                {/* Admin Management Toolbar */}
                {isAdmin && (
                  <div className="pt-2 pb-1 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>管理员操作权:</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleStartEditPost(post)}
                        className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                        title="修改标题、分类、内容、积分及审核状态"
                      >
                        <Edit3 className="w-3 h-3" />
                        编辑修改
                      </button>

                      {/* Delist / Relist Button */}
                      {post.isDelisted ? (
                        <button
                          onClick={() => handleRelist(post.id)}
                          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                          title="重新上架，恢复普通会员浏览"
                        >
                          <Eye className="w-3 h-3" />
                          重新上架
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setDelistingPost(post);
                            setDelistReasonInput(post.delistReason || '不符合商会发布规范或已失效');
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-amber-300 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                          title="下架此商机，普通访客和会员将无法浏览"
                        >
                          <EyeOff className="w-3 h-3 text-amber-400" />
                          下架
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeletingPost(post)}
                        className="px-2.5 py-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 rounded-lg border border-transparent hover:border-rose-500/30 transition-colors flex items-center gap-1"
                        title="从云端数据库彻底删除"
                      >
                        <Trash2 className="w-3 h-3" />
                        彻底删除
                      </button>
                    </div>
                  </div>
                )}

                {/* Offer Responses Section Toggle */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>查看会员响应与解决方案 ({post.offers?.length || 0})</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Optional Admin Re-broadcast Button */}
                  {isAdmin && post.auditStatus === 'APPROVED' && post.broadcastStatus !== 'BROADCASTED' && onApproveAndBroadcastPost && (
                    <button
                      onClick={() => onApproveAndBroadcastPost(post.id)}
                      className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      全员补发邮件
                    </button>
                  )}
                </div>

                {/* Expanded Offer Thread */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 animate-in fade-in">
                    {/* Existing Offers */}
                    {(!post.offers || post.offers.length === 0) ? (
                      <p className="text-xs text-slate-500 italic py-2">
                        暂未收到商企响应，快来抢先提供合作资源或解决方案赚取悬赏积分吧！
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
                                <span className="text-[11px] text-slate-400">
                                  ({offer.responderCompany})
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  · {offer.createdAt}
                                </span>
                              </div>

                              {offer.accepted ? (
                                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                                  <Check className="w-3 h-3" />
                                  已采纳方案
                                </span>
                              ) : (
                                post.status !== '已圆满解决' && (
                                  <button
                                    onClick={() => handleAccept(post.id, offer.id, post.rewardPoints)}
                                    className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold transition-colors"
                                  >
                                    采纳并支付悬赏
                                  </button>
                                )
                              )}
                            </div>

                            <p className="text-slate-300 leading-relaxed pl-1">
                              {offer.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Response Input */}
                    {post.status !== '已圆满解决' && !isDelisted && (
                      <div className="pt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={replyText[String(post.id)] || ''}
                          onChange={(e) =>
                            setReplyText({
                              ...replyText,
                              [String(post.id)]: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendOffer(post.id);
                          }}
                          placeholder="作为商会认证商户，为此需求提供解决方案或商业资源..."
                          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
                        />
                        <button
                          onClick={() => handleSendOffer(post.id)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>响应对接</span>
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

      {/* Admin Edit Help Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    管理员编辑商机互助记录
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    商机 ID: {editingPost.id} · 发起人: {editingPost.authorName} ({editingPost.authorCompany})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingPost(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPost} className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  商机 / 需求标题 *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Category & Status & Reward */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    所属板块
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="商机合作">商机合作</option>
                    <option value="供需对接">供需对接</option>
                    <option value="紧急求助">紧急求助</option>
                    <option value="资源共享">资源共享</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    对接进展状态
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="待对接">待对接</option>
                    <option value="对接中">对接中</option>
                    <option value="已圆满解决">已圆满解决</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    悬赏积分 (点)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={editRewardPoints}
                    onChange={(e) => setEditRewardPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                  </input>
                </div>
              </div>

              {/* Audit Status & Delist Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    审核状态 (Audit Status)
                  </label>
                  <select
                    value={editAuditStatus}
                    onChange={(e) => setEditAuditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="APPROVED">已通过审核 (APPROVED)</option>
                    <option value="PENDING_APPROVAL">待秘书处审核 (PENDING_APPROVAL)</option>
                    <option value="REJECTED">已驳回 (REJECTED)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    上架显示控制 (Delist Control)
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsDelisted}
                        onChange={(e) => setEditIsDelisted(e.target.checked)}
                        className="w-4 h-4 rounded text-rose-500 focus:ring-0 bg-slate-900 border-slate-700"
                      />
                      <span className={editIsDelisted ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        {editIsDelisted ? '已下架（仅管理员可见）' : '正常上架展示中'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Delist Reason (if delisted) */}
              {editIsDelisted && (
                <div>
                  <label className="block text-rose-300 font-semibold mb-1">
                    下架原因说明
                  </label>
                  <input
                    type="text"
                    value={editDelistReason}
                    onChange={(e) => setEditDelistReason(e.target.value)}
                    placeholder="如：不符合商会发布规范或商业信息已失效"
                    className="w-full px-3 py-2 bg-slate-950 border border-rose-500/40 rounded-xl text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  需求详细描述与诉求 *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Contact Info & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    对外联络方式
                  </label>
                  <input
                    type="text"
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    行业标签（逗号隔开）
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  保存修改并同步至云端数据库
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Delist Reason Dialog */}
      {delistingPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                <EyeOff className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">下架商机需求</h3>
                <p className="text-xs text-slate-400">下架后，普通访客和会员企业将无法看到此卡片</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400">商机标题：</span>
              <strong className="text-white block mt-0.5">{delistingPost.title}</strong>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-slate-300 font-semibold">
                下架原因备忘（供管理员查阅）
              </label>
              <input
                type="text"
                value={delistReasonInput}
                onChange={(e) => setDelistReasonInput(e.target.value)}
                placeholder="如：需求已在外部完结、内容失实或不合规"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setDelistingPost(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDelist}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
              >
                确认下架该需求
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Delete Confirmation Dialog */}
      {deletingPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">彻底删除商机需求</h3>
                <p className="text-xs text-rose-300/80">此操作将永久彻底从 Firestore 云端数据库中抹除！</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400">将删除的目标商机：</span>
              <strong className="text-white block mt-0.5">{deletingPost.title}</strong>
              <span className="text-[11px] text-slate-500 block mt-1">
                发起单位: {deletingPost.authorCompany} ({deletingPost.authorName})
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              彻底删除后，该商机的所有历史对接方案与记录都将无法恢复。如仅需暂停对外展示，建议使用<strong>「下架」</strong>功能。
            </p>

            <div className="pt-2 flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setDeletingPost(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl"
              >
                确认彻底删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl my-6 sm:my-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    发布商机合作 · 互助悬赏需求
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    面向滑铁卢华商社群与外部合作伙伴发布重大商业项目与采购诉求
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scheme B: Submitter Identity Choice */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                请选择您的发布身份类型：
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSubmitterType('external')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    submitterType === 'external'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    外部潜在客户 / 合作伙伴
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    无需商会会员身份 · 经秘书处核验真实性后统一全员广播
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSubmitterType('member')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    submitterType === 'member'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    商会认证企业会员
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    已入会实名认证企业 · 系统即刻触发全员邮件协同广播
                  </p>
                </button>
              </div>

              {/* Submitter Qualification Status Notice */}
              {submitterType === 'member' && (
                user?.isMember ? (
                  <div className="p-3 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/40 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-amber-300">✓ 实名企业会员身份已核验：</span>
                        <span className="text-white font-semibold">{user.company}</span>
                        <span className="text-slate-400 text-[11px] ml-1">({user.name} · {user.tier || '认证商户'})</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex-shrink-0">
                      ✓ 具备即刻全员广播权
                    </span>
                  </div>
                ) : (
                  <div className="p-3.5 bg-amber-950/40 border-2 border-amber-500/50 rounded-xl space-y-2 text-xs animate-in fade-in">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-amber-300">
                          【商会认证企业会员】通道需认证实名会员企业资格
                        </p>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          当前处于<strong>外部商业访客视角（未登录商会会员账号）</strong>。
                          发布商会认证合作商机必须先进行会员身份核验；外部采购方或潜在合作伙伴请选择上方<strong>【外部潜在客户】</strong>通道提交（经秘书处人工核验后全员广播）。
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-500/20">
                      {onOpenLogin && (
                        <button
                          type="button"
                          onClick={onOpenLogin}
                          className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>立即核验/登录企业会员账号</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSubmitterType('external')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                      >
                        切换为外部潜在客户通道
                      </button>
                      {onOpenMerchantApply && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateModal(false);
                            onOpenMerchantApply();
                          }}
                          className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold underline underline-offset-2 ml-auto"
                        >
                          申请入驻名商会
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* External Submitter Information Fields */}
              {submitterType === 'external' && (
                <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    外部合作代表联络信息（供秘书处真实性审核及对接）
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        联络代表姓名 *
                      </label>
                      <input
                        type="text"
                        required
                        value={externalName}
                        onChange={(e) => setExternalName(e.target.value)}
                        placeholder="如：李先生 / 张经理"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        企业 / 采购方名称
                      </label>
                      <input
                        type="text"
                        value={externalCompany}
                        onChange={(e) => setExternalCompany(e.target.value)}
                        placeholder="如：加拿大东方科技 / 个人买家"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        联络电话（手机/微信）*
                      </label>
                      <input
                        type="tel"
                        value={externalPhone}
                        onChange={(e) => setExternalPhone(e.target.value)}
                        placeholder="如：+1 (519) 888-0000"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        联系邮箱（接收商户方案）*
                      </label>
                      <input
                        type="email"
                        value={externalEmail}
                        onChange={(e) => setExternalEmail(e.target.value)}
                        placeholder="如：business@example.com"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  商机 / 需求标题 *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="如：寻求 Waterloo 本地智能仓储与跨境物流长期合作商..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Category & Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    所属板块
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="商机合作">商机合作 (重大项目/业务协同)</option>
                    <option value="供需对接">供需对接 (本地物料采购/服务采购)</option>
                    <option value="紧急求助">紧急求助 (合规政策/紧急周转)</option>
                    <option value="资源共享">资源共享 (场地/设备/渠道闲置)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    商会悬赏积分（点）
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={newRewardPoints}
                    onChange={(e) => setNewRewardPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    采纳商户方案后将自动划转悬赏奖励，当前积分: {userPoints}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  需求详细描述与合作意向 *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="请详细列出您的具体合作诉求、合作周期、交付标准、预算范围或对合作方的特定资质要求..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Tags & Contact (for Member mode) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    标签（逗号隔开）
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="如：精密制造, 研发退税, 厂房租赁"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {submitterType === 'member' && (
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      对外联系方式展示
                    </label>
                    <input
                      type="text"
                      value={newContact}
                      onChange={(e) => setNewContact(e.target.value)}
                      placeholder="微信 / 办公电话 / 工作邮箱"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 font-bold rounded-xl shadow-md transition-all ${
                    submitterType === 'external'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white'
                      : user?.isMember
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  }`}
                >
                  {submitterType === 'external'
                    ? '提交需求至秘书处核验'
                    : user?.isMember
                    ? '确认发布并全员广播'
                    : '需先核验实名会员资格后发布'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
