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
import { useLanguage } from '../i18n/LanguageContext';
import {
  translateHelpCategory,
  translateHelpStatus,
  translateRelativeTime,
  translateSystemText,
  translateTier,
  translateUserField,
} from '../i18n/domainTranslations';

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
  const { isEn, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [activeStatus, setActiveStatus] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(Boolean(prefillMerchant));
  const [expandedPostId, setExpandedPostId] = useState<string | number | null>(posts[0]?.id || null);
  const [replyText, setReplyText] = useState<{ [postId: string]: string }>({});
  const [broadcastNotice, setBroadcastNotice] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

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
    prefillMerchant
      ? isEn
        ? `[Strategic Inquiry] Seeking business collaboration with "${prefillMerchant.nameEn || prefillMerchant.name}"`
        : `【商机合作】寻求与「${prefillMerchant.name}」开展专项业务协同`
      : ''
  );
  const [newCategory, setNewCategory] = useState<'商机合作' | '供需对接' | '紧急求助' | '资源共享'>('商机合作');
  const [newDesc, setNewDesc] = useState('');
  const [newRewardPoints, setNewRewardPoints] = useState<number>(50);
  const [newTags, setNewTags] = useState(isEn ? 'Local Procurement, Strategic Synergy' : '本地采购, 业务协同');
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
  const [delistReasonInput, setDelistReasonInput] = useState(
    isEn ? 'No longer aligns with Alliance publishing standards or has expired' : '不符合商会发布规范或已失效'
  );
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
    setFormError('');
    if (!newTitle.trim() || !newDesc.trim()) return;

    const isExternal = submitterType === 'external';

    if (!isExternal && !user?.isMember) {
      setFormError(
        t(
          '发布【商会认证企业会员】商机合作需要实名企业会员资格！请先完成会员身份核验登录，或切换至【外部潜在客户 / 合作伙伴】通道提交。',
          'Publishing via the Verified Corporate Member channel requires an authenticated member account. Please sign in or switch to the External Prospect / Partner channel.'
        )
      );
      if (onOpenLogin) onOpenLogin();
      return;
    }

    if (isExternal) {
      if (!externalName.trim()) {
        setFormError(t('请填写您的联络代表姓名', 'Please enter your primary contact name.'));
        return;
      }
      if (!externalPhone.trim() && !externalEmail.trim()) {
        setFormError(
          t(
            '请至少留下联络电话或邮箱，以便商会秘书处核验及企业与您取得联系',
            'Please provide at least a phone number or email address so the Secretariat and member firms can reach you.'
          )
        );
        return;
      }
    }

    const contactStr = isExternal
      ? `${t('电话', 'Tel')}: ${externalPhone.trim() || t('未填', 'Not provided')} | ${t('邮箱', 'Email')}: ${externalEmail.trim() || t('未填', 'Not provided')}`
      : (newContact.trim() || user?.phone || user?.email || t('商会平台内信沟通', 'In-Portal Direct Messaging'));

    const newPost: HelpPost = {
      id: Date.now(),
      authorUid: isExternal ? undefined : user?.uid,
      authorName: isExternal ? externalName.trim() : (user?.name || t('商会实名会员', 'WBCA Verified Member')),
      authorCompany: isExternal ? (externalCompany.trim() || t('外部潜在客户', 'External Prospect')) : (user?.company || t('融商汇认证企业', 'WBCA Certified Enterprise')),
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
      setBroadcastNotice(
        t(
          '需求提交成功！商会秘书处已收到您的合作申请，正在进行真实性核验。核验通过后系统将立即向全商会企业邮件群发通报并组织对接，请保持联络畅通！',
          'Inquiry submitted. The WBCA Secretariat has received your request for verification. Once approved, it will be broadcast via email across all Alliance member enterprises.'
        )
      );
    } else {
      const recipientCount = merchants.filter((m) => m.email).length;
      setBroadcastNotice(
        t(
          `商机互助已成功发布！系统已启动全员邮件广播程序，向商会全部 ${recipientCount} 家会员企业邮箱同步发送通报！`,
          `Opportunity published! An automated email broadcast has been dispatched to all ${recipientCount} verified WBCA member enterprises.`
        )
      );
    }

    setTimeout(() => {
      setBroadcastNotice('');
    }, 8000);

    setNewTitle('');
    setNewDesc('');
    setNewRewardPoints(50);
    setExternalName('');
    setExternalCompany('');
    setExternalPhone('');
    setExternalEmail('');
  };

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
    setEditDelistReason(post.delistReason || t('不符合商会发布规范或已失效', 'No longer aligns with Alliance publishing standards or has expired'));
  };

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
      delistReason: editIsDelisted ? (editDelistReason.trim() || t('不符合商会发布规范或已失效', 'No longer aligns with Alliance publishing standards or has expired')) : undefined,
      delistedAt: editIsDelisted ? (editingPost.delistedAt || new Date().toISOString()) : undefined,
      delistedBy: editIsDelisted ? (editingPost.delistedBy || user?.name || t('商会秘书处', 'WBCA Secretariat')) : undefined,
    };

    if (onUpdatePost) {
      onUpdatePost(editingPost.id, updates);
    }
    setEditingPost(null);
    setBroadcastNotice(t('商机互助修改成功，已实时同步保存至云端数据库！', 'Opportunity record updated and synchronized to cloud storage.'));
    setTimeout(() => setBroadcastNotice(''), 6000);
  };

  const handleConfirmDelist = () => {
    if (!delistingPost) return;
    if (onDelistPost) {
      onDelistPost(delistingPost.id, delistReasonInput.trim());
    }
    setDelistingPost(null);
    setBroadcastNotice(t('该商机已成功下架（普通会员与访客已无法查看）。', 'Opportunity delisted and hidden from public and general member view.'));
    setTimeout(() => setBroadcastNotice(''), 6000);
  };

  const handleRelist = (postId: string | number) => {
    if (onRelistPost) {
      onRelistPost(postId);
    }
    setBroadcastNotice(t('该商机已重新上架，恢复全平台会员浏览！', 'Opportunity relisted and restored to full platform visibility.'));
    setTimeout(() => setBroadcastNotice(''), 6000);
  };

  const handleConfirmDelete = () => {
    if (!deletingPost) return;
    if (onDeletePost) {
      onDeletePost(deletingPost.id);
    }
    setDeletingPost(null);
    setBroadcastNotice(t('该商机记录已从云端数据库彻底删除！', 'Opportunity record permanently deleted from Firestore.'));
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
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-editorial flex items-center gap-2">
            <Users className="w-6 h-6 text-[#C5A059]" />
            {t('滑铁卢融商汇 · 商机合作与互助圈', 'WBCA Mutual-Aid & Business Exchange')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {t(
              '开放外部商机对接 · 疑难痛点悬赏 · 真实企业采购 · 点对点诚信履约',
              'Open Venture Inquiries · Advisory Bounties · Verified Corporate Procurement · Trusted Peer Execution'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenSmartMatch}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#C5A059]/45 text-[#0F172A] hover:bg-[#F7F7F5] text-xs sm:text-sm font-semibold transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            {t('AI 自动撮合需求', 'AI Smart Match')}
          </button>

          <button
            onClick={() => {
              setFormError('');
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl gold-gradient text-[#0F172A] font-bold text-xs sm:text-sm shadow-md transition-all hover:opacity-95"
          >
            <PlusCircle className="w-4 h-4" />
            {t('发布商机 / 互助需求', 'Post Inquiry / Opportunity')}
          </button>
        </div>
      </div>

      {/* Admin Pending Opportunity Alert Banner */}
      {isAdmin && pendingPostsCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-[#C5A059]/45 text-[#0F172A] text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-100 text-[#9E7425] border border-[#C5A059]/35">
              <AlertCircle className="w-4 h-4 text-[#9E7425]" />
            </div>
            <span>
              <strong>{t('商会秘书处审核提醒：', 'Secretariat Review Alert: ')}</strong>
              {t('当前有 ', 'There are ')}
              <span className="font-bold text-[#9E7425] underline">{pendingPostsCount}</span>
              {t(' 笔外部潜在客户提交的商机需求等待核验！核验通过后可一键群发全员广播。', ' external prospect inquiries awaiting verification before full member broadcast.')}
            </span>
          </div>
          <button
            onClick={() => setActiveStatus('待审核')}
            className="px-3.5 py-1.5 gold-gradient text-[#0F172A] font-bold rounded-xl text-xs flex-shrink-0 transition-opacity hover:opacity-95 self-end sm:self-auto"
          >
            {t(`立即审核待审商机 (${pendingPostsCount})`, `Review Pending (${pendingPostsCount})`)}
          </button>
        </div>
      )}

      {/* Broadcast Alert / Toast Notification */}
      {broadcastNotice && (
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#C5A059]/45 shadow-lg text-white flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/35 text-[#DFBA73] flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#DFBA73]">{t('系统操作通知', 'System Notification')}</h4>
              <p className="text-xs text-slate-200 mt-0.5">{broadcastNotice}</p>
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
      <div className="bg-white p-4 rounded-2xl border border-[#E8E6DF] space-y-4 luxury-shadow">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(
              '搜索商机标题、合作需求、发起企业、联络人或关键词...',
              'Search opportunity titles, collaboration needs, companies, contacts, or keywords...'
            )}
            className="w-full pl-10 pr-4 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['全部', '商机合作', '供需对接', '紧急求助', '资源共享'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all border ${
                  activeCategory === cat
                    ? 'bg-[#0F172A] text-[#DFBA73] border-[#0F172A] shadow-sm'
                    : 'bg-[#F7F7F5] text-slate-600 hover:text-[#0F172A] border-[#E8E6DF]'
                }`}
              >
                {translateHelpCategory(cat, isEn)}
              </button>
            ))}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 text-slate-500 flex-wrap">
            <span>{t('状态:', 'Status:')}</span>
            {['全部', '待对接', '对接中', '已圆满解决'].map((st) => (
              <button
                key={st}
                onClick={() => setActiveStatus(st)}
                className={`hover:text-[#0F172A] transition-colors ${
                  activeStatus === st ? 'text-[#9E7425] font-bold underline underline-offset-4' : ''
                }`}
              >
                {st === '全部' ? t('全部', 'All') : translateHelpStatus(st, isEn)}
              </button>
            ))}
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveStatus('待审核')}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors ${
                    activeStatus === '待审核'
                      ? 'bg-[#0F172A] text-[#DFBA73] border-[#0F172A]'
                      : 'bg-amber-50 text-[#9E7425] border-[#C5A059]/45 hover:bg-amber-100'
                  }`}
                >
                  {t(`待审核 (${pendingPostsCount})`, `Pending Review (${pendingPostsCount})`)}
                </button>
                <button
                  onClick={() => setActiveStatus('已下架')}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors ${
                    activeStatus === '已下架'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {t(`已下架 (${delistedPostsCount})`, `Delisted (${delistedPostsCount})`)}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E8E6DF] p-8 space-y-3 luxury-shadow">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-semibold text-[#0F172A]">
              {activeStatus === '待审核'
                ? t('当前暂无待审核的商机需求', 'No inquiries currently awaiting Secretariat review')
                : activeStatus === '已下架'
                ? t('当前暂无已下架的商机', 'No delisted opportunities found')
                : t('未找到匹配的互助或商机需求', 'No matching inquiries or business opportunities found')}
            </h4>
            <p className="text-xs text-slate-500">
              {t('您可以切换分类筛选，或者立即发布一条新的合作需求！', 'Adjust your category filters or publish a new collaboration request.')}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isExpanded = expandedPostId === post.id;
            const isPending = post.auditStatus === 'PENDING_APPROVAL';
            const isDelisted = Boolean(post.isDelisted);
            const authorDisplayName = translateUserField(post.authorName, isEn);
            const authorDisplayCompany = translateUserField(post.authorCompany, isEn);

            return (
              <div
                key={post.id}
                className={`rounded-2xl border transition-all p-5 space-y-4 luxury-shadow ${
                  isDelisted
                    ? 'bg-rose-50/50 border-rose-200 opacity-95'
                    : isPending
                    ? 'bg-amber-50/40 border-[#C5A059]'
                    : 'bg-white border-[#E8E6DF] hover:border-[#C5A059]/60'
                }`}
              >
                {/* Delisted Alert Banner for Admin */}
                {isDelisted && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-rose-800">
                          {t('该商机已被管理员下架（普通会员与访客不可见）', 'This opportunity has been delisted by Administration (hidden from public & members)')}
                        </span>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          {t('下架原因：', 'Reason: ')}
                          <strong className="text-[#0F172A]">
                            {translateSystemText(post.delistReason, isEn) || t('不符合商会发布规范或已失效', 'No longer aligns with Alliance publishing standards or has expired')}
                          </strong>{' '}
                          · {t('操作人：', 'By: ')}
                          {translateUserField(post.delistedBy, isEn, t('商会秘书处', 'WBCA Secretariat'))}
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleRelist(post.id)}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold self-end sm:self-auto flex items-center gap-1 shadow-sm"
                        title={t('重新上架，恢复在商机互助圈公开展出', 'Relist and restore to public exchange')}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {t('重新上架恢复展示', 'Relist Opportunity')}
                      </button>
                    )}
                  </div>
                )}

                {/* Pending Audit Alert for Admin */}
                {isPending && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-[#C5A059]/45 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#9E7425] flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {t('外部潜在客户商机 · 待秘书处核验', 'External Prospect Inquiry · Pending Secretariat Review')}
                        </span>
                        <span className="text-[10px] bg-white border border-[#E8E6DF] px-2 py-0.5 rounded text-slate-600">
                          {t('暂未群发', 'Not Broadcasted')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {t('外部联络人：', 'Contact: ')}<strong className="text-[#0F172A]">{authorDisplayName}</strong> ·{' '}
                        {t('企业/单位：', 'Company: ')}<strong className="text-[#0F172A]">{authorDisplayCompany}</strong> ·{' '}
                        {t('联络电话：', 'Phone: ')}<strong className="text-[#0F172A]">{post.authorPhone || t('未填', 'Not provided')}</strong> ·{' '}
                        {t('邮箱：', 'Email: ')}<strong className="text-[#0F172A]">{post.authorEmail || t('未填', 'Not provided')}</strong>
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
                            className="px-3.5 py-1.5 gold-gradient text-[#0F172A] font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm"
                            title={t('审核通过并立即以BCC密送群发邮件通报全商会商企', 'Approve and immediately broadcast via BCC to all member firms')}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            {t('审核通过并全员广播', 'Approve & Broadcast')}
                          </button>
                        )}

                        {onApprovePost && (
                          <button
                            onClick={() => onApprovePost(post.id)}
                            className="px-3 py-1.5 bg-white hover:bg-[#F7F7F5] text-[#0F172A] border border-[#E8E6DF] font-semibold rounded-xl text-xs flex items-center gap-1"
                            title={t('仅审核通过在网站展示，不触发全员发信', 'Approve on-site without triggering mass email broadcast')}
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            {t('仅通过上架', 'Approve Only')}
                          </button>
                        )}

                        {onRejectPost && (
                          <button
                            onClick={() => onRejectPost(post.id, t('不符合商会发布规范', 'Does not meet Alliance publishing guidelines'))}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs flex items-center gap-1 border border-rose-200"
                            title={t('驳回该商机', 'Reject inquiry')}
                          >
                            <Ban className="w-3.5 h-3.5" />
                            {t('驳回', 'Reject')}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <UserAvatar avatar={post.authorAvatar} name={authorDisplayName || authorDisplayCompany} size="md" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[#0F172A]">
                          {authorDisplayName}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({authorDisplayCompany})
                        </span>
                        {post.isExternalProspect ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            {t('外部潜客商机 · 秘书处核验', 'External Prospect · Secretariat Vetted')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#0F172A] border border-[#C5A059]/40 text-[#DFBA73] font-semibold">
                            <Building2 className="w-3 h-3" />
                            {t('商会认证企业会员', 'Verified Corporate Member')}
                          </span>
                        )}
                        {isDelisted && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold">
                            <EyeOff className="w-3 h-3" />
                            {t('已下架', 'Delisted')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                        <Clock className="w-3 h-3" />
                        <span>{translateRelativeTime(post.createdAt, isEn)}</span>
                        <span>·</span>
                        <span className="text-[#9E7425] font-semibold">{translateHelpCategory(post.category, isEn)}</span>
                        {post.broadcastStatus === 'BROADCASTED' && (
                          <>
                            <span>·</span>
                            <span className="text-sky-700 flex items-center gap-1 font-medium">
                              <Mail className="w-3 h-3 text-sky-600" />
                              {t('已全员通报', 'Broadcasted to Members')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.rewardPoints > 0 && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-[#C5A059]/40 text-[#9E7425] text-xs font-bold">
                        <Award className="w-3.5 h-3.5 text-[#C5A059]" />
                        {t(`悬赏 ${post.rewardPoints} 积分`, `${post.rewardPoints} Pts Bounty`)}
                      </span>
                    )}

                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                        post.status === '已圆满解决'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : post.status === '对接中'
                          ? 'bg-sky-50 text-sky-800 border-sky-200'
                          : 'bg-amber-50 text-[#9E7425] border-[#C5A059]/40'
                      }`}
                    >
                      {translateHelpStatus(post.status, isEn)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-[#0F172A] leading-snug font-editorial">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {post.description}
                  </p>
                </div>

                {/* Tags & Contact */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E8E6DF] text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {post.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#F7F7F5] text-slate-600 border border-[#E8E6DF]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <span className="text-slate-500 text-[11px]">
                    {t('联络渠道: ', 'Contact Channel: ')}
                    <strong className="text-[#0F172A]">{translateSystemText(post.contactInfo, isEn)}</strong>
                  </span>
                </div>

                {/* Admin Management Toolbar */}
                {isAdmin && (
                  <div className="pt-2 pb-1 border-t border-[#E8E6DF] flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>{t('管理员操作权:', 'Admin Controls:')}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleStartEditPost(post)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#9E7425] border border-[#C5A059]/40 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                        title={t('修改标题、分类、内容、积分及审核状态', 'Edit title, category, description, bounty & audit status')}
                      >
                        <Edit3 className="w-3 h-3" />
                        {t('编辑修改', 'Edit')}
                      </button>

                      {post.isDelisted ? (
                        <button
                          onClick={() => handleRelist(post.id)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                          title={t('重新上架，恢复普通会员浏览', 'Relist for member visibility')}
                        >
                          <Eye className="w-3 h-3" />
                          {t('重新上架', 'Relist')}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setDelistingPost(post);
                            setDelistReasonInput(
                              translateSystemText(post.delistReason, isEn) ||
                                t('不符合商会发布规范或已失效', 'No longer aligns with Alliance publishing standards or has expired')
                            );
                          }}
                          className="px-2.5 py-1 bg-[#F7F7F5] hover:bg-[#EFECE4] text-slate-700 border border-[#E8E6DF] hover:text-[#9E7425] rounded-lg font-semibold flex items-center gap-1 transition-colors"
                          title={t('下架此商机，普通访客和会员将无法浏览', 'Delist this opportunity from public & member view')}
                        >
                          <EyeOff className="w-3 h-3 text-[#C5A059]" />
                          {t('下架', 'Delist')}
                        </button>
                      )}

                      <button
                        onClick={() => setDeletingPost(post)}
                        className="px-2.5 py-1 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors flex items-center gap-1"
                        title={t('从云端数据库彻底删除', 'Permanently delete from database')}
                      >
                        <Trash2 className="w-3 h-3" />
                        {t('彻底删除', 'Delete')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Offer Responses Section Toggle */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#9E7425] hover:text-[#0F172A] transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>
                      {t(
                        `查看会员响应与解决方案 (${post.offers?.length || 0})`,
                        `View Member Responses & Proposals (${post.offers?.length || 0})`
                      )}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isAdmin && post.auditStatus === 'APPROVED' && post.broadcastStatus !== 'BROADCASTED' && onApproveAndBroadcastPost && (
                    <button
                      onClick={() => onApproveAndBroadcastPost(post.id)}
                      className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      {t('全员补发邮件', 'Broadcast Email Now')}
                    </button>
                  )}
                </div>

                {/* Expanded Offer Thread */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#E8E6DF] space-y-3 animate-in fade-in">
                    {(!post.offers || post.offers.length === 0) ? (
                      <p className="text-xs text-slate-500 italic py-2">
                        {t(
                          '暂未收到商企响应，快来抢先提供合作资源或解决方案赚取悬赏积分吧！',
                          'No member proposals yet. Be the first to offer strategic resources or solutions to earn the bounty.'
                        )}
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {post.offers.map((offer) => (
                          <div
                            key={offer.id}
                            className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                              offer.accepted
                                ? 'bg-emerald-50 border-emerald-200'
                                : 'bg-[#F7F7F5] border-[#E8E6DF]'
                            }`}
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#0F172A]">
                                  {translateUserField(offer.responderName, isEn)}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  ({translateUserField(offer.responderCompany, isEn)})
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  · {translateRelativeTime(offer.createdAt, isEn)}
                                </span>
                              </div>

                              {offer.accepted ? (
                                <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                                  <Check className="w-3 h-3" />
                                  {t('已采纳方案', 'Proposal Accepted')}
                                </span>
                              ) : (
                                post.status !== '已圆满解决' && (
                                  <button
                                    onClick={() => handleAccept(post.id, offer.id, post.rewardPoints)}
                                    className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-[#9E7425] border border-[#C5A059]/45 text-[11px] font-semibold transition-colors"
                                  >
                                    {t('采纳并支付悬赏', 'Accept & Release Bounty')}
                                  </button>
                                )
                              )}
                            </div>

                            <p className="text-slate-700 leading-relaxed pl-1">
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
                          placeholder={t(
                            '作为商会认证商户，为此需求提供解决方案或商业资源...',
                            'Offer a solution or commercial partnership as a WBCA member...'
                          )}
                          className="flex-1 px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                        />
                        <button
                          onClick={() => handleSendOffer(post.id)}
                          className="px-4 py-2 gold-gradient text-[#0F172A] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-opacity hover:opacity-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{t('响应对接', 'Submit Proposal')}</span>
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
        <div className="fixed inset-0 z-50 bg-[#0F172A]/65 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E8E6DF] rounded-2xl max-w-2xl w-full shadow-2xl my-8 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#C5A059]/25 bg-[#0F172A]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/35 text-[#DFBA73] flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-editorial">
                    {t('管理员编辑商机互助记录', 'Admin: Edit Business Opportunity Record')}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {t('商机 ID:', 'Opportunity ID:')} {editingPost.id} · {t('发起人:', 'Author:')}{' '}
                    {translateUserField(editingPost.authorName, isEn, editingPost.authorName)} (
                    {translateUserField(editingPost.authorCompany, isEn, editingPost.authorCompany)})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingPost(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPost} className="p-6 space-y-4 text-xs bg-white">
              {/* Title */}
              <div>
                <label className="block text-[#0F172A] font-semibold mb-1">
                  {t('商机 / 需求标题 *', 'Opportunity / Inquiry Title *')}
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {/* Category & Status & Reward */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('所属板块', 'Category')}
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="商机合作">{translateHelpCategory('商机合作', isEn)}</option>
                    <option value="供需对接">{translateHelpCategory('供需对接', isEn)}</option>
                    <option value="紧急求助">{translateHelpCategory('紧急求助', isEn)}</option>
                    <option value="资源共享">{translateHelpCategory('资源共享', isEn)}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('对接进展状态', 'Matching Status')}
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="待对接">{translateHelpStatus('待对接', isEn)}</option>
                    <option value="对接中">{translateHelpStatus('对接中', isEn)}</option>
                    <option value="已圆满解决">{translateHelpStatus('已圆满解决', isEn)}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('悬赏积分 (点)', 'Bounty Reward (Pts)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={editRewardPoints}
                    onChange={(e) => setEditRewardPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Audit Status & Delist Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#F7F7F5] rounded-xl border border-[#E8E6DF]">
                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('审核状态 (Audit Status)', 'Audit Status')}
                  </label>
                  <select
                    value={editAuditStatus}
                    onChange={(e) => setEditAuditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="APPROVED">{t('已通过审核 (APPROVED)', 'Approved (APPROVED)')}</option>
                    <option value="PENDING_APPROVAL">{t('待秘书处审核 (PENDING_APPROVAL)', 'Pending Secretariat Review (PENDING_APPROVAL)')}</option>
                    <option value="REJECTED">{t('已驳回 (REJECTED)', 'Rejected (REJECTED)')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('上架显示控制 (Delist Control)', 'Visibility / Delist Control')}
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsDelisted}
                        onChange={(e) => setEditIsDelisted(e.target.checked)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-0 border-[#E8E6DF]"
                      />
                      <span className={editIsDelisted ? 'text-rose-700 font-bold' : 'text-slate-600'}>
                        {editIsDelisted
                          ? t('已下架（仅管理员可见）', 'Delisted (Admin Only)')
                          : t('正常上架展示中', 'Published & Live')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Delist Reason (if delisted) */}
              {editIsDelisted && (
                <div>
                  <label className="block text-rose-700 font-semibold mb-1">
                    {t('下架原因说明', 'Delisting Reason')}
                  </label>
                  <input
                    type="text"
                    value={editDelistReason}
                    onChange={(e) => setEditDelistReason(e.target.value)}
                    placeholder={t('如：不符合商会发布规范或商业信息已失效', 'e.g., Does not meet Alliance standards or inquiry expired')}
                    className="w-full px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-[#0F172A] focus:outline-none focus:border-rose-400"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-[#0F172A] font-semibold mb-1">
                  {t('需求详细描述与诉求 *', 'Detailed Requirements & Scope *')}
                </label>
                <textarea
                  rows={4}
                  required
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {/* Contact Info & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('对外联络方式', 'Public Contact Information')}
                  </label>
                  <input
                    type="text"
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('行业标签（逗号隔开）', 'Industry Tags (comma-separated)')}
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-[#E8E6DF] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 bg-[#F7F7F5] hover:bg-[#EFECE4] text-slate-700 border border-[#E8E6DF] rounded-xl font-medium"
                >
                  {t('取消', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 gold-gradient text-[#0F172A] font-bold rounded-xl shadow-md transition-opacity hover:opacity-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {t('保存修改并同步至云端数据库', 'Save Changes & Sync to Cloud')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Delist Reason Dialog */}
      {delistingPost && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E6DF] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-[#0F172A] px-6 py-4 border-b border-[#C5A059]/25 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/35 text-[#DFBA73] flex items-center justify-center flex-shrink-0">
                <EyeOff className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-editorial">
                  {t('下架商机需求', 'Delist Opportunity Posting')}
                </h3>
                <p className="text-xs text-slate-300">
                  {t('下架后，普通访客和会员企业将无法看到此卡片', 'Once delisted, this posting will be hidden from guests and members.')}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 bg-white">
              <div className="p-3 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF] text-xs">
                <span className="text-slate-500">{t('商机标题：', 'Opportunity Title: ')}</span>
                <strong className="text-[#0F172A] block mt-0.5">{delistingPost.title}</strong>
              </div>

              <div className="space-y-1 text-xs">
                <label className="block text-[#0F172A] font-semibold">
                  {t('下架原因备忘（供管理员查阅）', 'Delisting Memo (Admin Reference)')}
                </label>
                <input
                  type="text"
                  value={delistReasonInput}
                  onChange={(e) => setDelistReasonInput(e.target.value)}
                  placeholder={t('如：需求已在外部完结、内容失实或不合规', 'e.g., Fulfilled externally, inaccurate, or non-compliant')}
                  className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setDelistingPost(null)}
                  className="px-4 py-2 bg-[#F7F7F5] hover:bg-[#EFECE4] text-slate-700 border border-[#E8E6DF] rounded-xl font-medium"
                >
                  {t('取消', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelist}
                  className="px-4 py-2 gold-gradient text-[#0F172A] font-bold rounded-xl shadow-sm"
                >
                  {t('确认下架该需求', 'Confirm Delist')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Delete Confirmation Dialog */}
      {deletingPost && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A] font-editorial">
                  {t('彻底删除商机需求', 'Permanently Delete Opportunity')}
                </h3>
                <p className="text-xs text-rose-700">
                  {t('此操作将永久彻底从 Firestore 云端数据库中抹除！', 'This will permanently erase the record from Firestore!')}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF] text-xs">
              <span className="text-slate-500">{t('将删除的目标商机：', 'Target Posting to Delete: ')}</span>
              <strong className="text-[#0F172A] block mt-0.5">{deletingPost.title}</strong>
              <span className="text-[11px] text-slate-500 block mt-1">
                {t('发起单位:', 'Posted by:')}{' '}
                {translateUserField(deletingPost.authorCompany, isEn, deletingPost.authorCompany)} (
                {translateUserField(deletingPost.authorName, isEn, deletingPost.authorName)})
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isEn ? (
                <>
                  Once permanently deleted, all associated proposals and matching records cannot be recovered. To pause public visibility instead, consider using <strong>Delist</strong>.
                </>
              ) : (
                <>
                  彻底删除后，该商机的所有历史对接方案与记录都将无法恢复。如仅需暂停对外展示，建议使用<strong>「下架」</strong>功能。
                </>
              )}
            </p>

            <div className="pt-2 flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setDeletingPost(null)}
                className="px-4 py-2 bg-[#F7F7F5] hover:bg-[#EFECE4] text-slate-700 border border-[#E8E6DF] rounded-xl font-medium"
              >
                {t('取消', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm"
              >
                {t('确认彻底删除', 'Confirm Permanent Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/65 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-white border border-[#E8E6DF] rounded-2xl max-w-xl w-full shadow-2xl my-6 sm:my-10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#C5A059]/25 bg-[#0F172A]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/35 text-[#DFBA73] flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-editorial">
                    {t('发布商机合作 · 互助悬赏需求', 'Post Business Opportunity & Bounty Inquiry')}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {t(
                      '面向滑铁卢华商社群与外部合作伙伴发布重大商业项目与采购诉求',
                      'Publish strategic mandates and procurement inquiries to Waterloo’s verified business network.'
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 bg-white">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{formError}</span>
                </div>
              )}

              {/* Scheme B: Submitter Identity Choice */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#0F172A]">
                  {t('请选择您的发布身份类型：', 'Select Your Publishing Identity:')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitterType('external');
                      setFormError('');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      submitterType === 'external'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                        : 'bg-[#F7F7F5] border-[#E8E6DF] text-slate-600 hover:text-[#0F172A] hover:border-[#C5A059]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      {t('外部潜在客户 / 合作伙伴', 'External Prospect / Partner')}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                      {t(
                        '无需商会会员身份 · 经秘书处核验真实性后统一全员广播',
                        'No membership required · Secretariat verifies authenticity before member-wide broadcast'
                      )}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitterType('member');
                      setFormError('');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      submitterType === 'member'
                        ? 'bg-[#0F172A] border-[#C5A059] text-white shadow-sm'
                        : 'bg-[#F7F7F5] border-[#E8E6DF] text-slate-600 hover:text-[#0F172A] hover:border-[#C5A059]/50'
                    }`}
                  >
                    <div className={`flex items-center gap-2 font-bold text-xs ${submitterType === 'member' ? 'text-[#DFBA73]' : 'text-[#0F172A]'}`}>
                      <Building2 className={`w-4 h-4 ${submitterType === 'member' ? 'text-[#DFBA73]' : 'text-[#C5A059]'}`} />
                      {t('商会认证企业会员', 'WBCA Verified Corporate Member')}
                    </div>
                    <p className={`text-[10px] mt-1 leading-normal ${submitterType === 'member' ? 'text-slate-300' : 'text-slate-500'}`}>
                      {t(
                        '已入会实名认证企业 · 系统即刻触发全员邮件协同广播',
                        'Verified Alliance enterprise · Triggers instant network-wide email broadcast'
                      )}
                    </p>
                  </button>
                </div>

                {/* Submitter Qualification Status Notice */}
                {submitterType === 'member' && (
                  user?.isMember ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 text-xs animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-emerald-800">
                            {t('✓ 实名企业会员身份已核验：', '✓ Verified Corporate Member Authenticated: ')}
                          </span>
                          <span className="text-[#0F172A] font-semibold">
                            {translateUserField(user.company, isEn, user.company)}
                          </span>
                          <span className="text-slate-500 text-[11px] ml-1">
                            ({translateUserField(user.name, isEn, user.name)} · {translateTier(user.tier || '认证商户', isEn)})
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-white text-emerald-800 text-[10px] font-bold border border-emerald-200 flex-shrink-0">
                        {t('✓ 具备即刻全员广播权', '✓ Instant Broadcast Enabled')}
                      </span>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-amber-50 border border-[#C5A059]/50 rounded-xl space-y-2 text-xs animate-in fade-in">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-[#9E7425] flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-bold text-[#0F172A]">
                            {t(
                              '【商会认证企业会员】通道需认证实名会员企业资格',
                              'The Verified Corporate Member channel requires member authentication'
                            )}
                          </p>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {isEn ? (
                              <>
                                You are currently browsing in <strong className="text-[#0F172A]">Guest Access mode (not signed in)</strong>.
                                Publishing as a verified member requires authentication; external buyers or partners may select the <strong className="text-emerald-800">External Prospect</strong> channel above (broadcasted after Secretariat review).
                              </>
                            ) : (
                              <>
                                当前处于<strong className="text-[#0F172A]">外部商业访客视角（未登录商会会员账号）</strong>。
                                发布商会认证合作商机必须先进行会员身份核验；外部采购方或潜在合作伙伴请选择上方<strong className="text-emerald-800">【外部潜在客户】</strong>通道提交（经秘书处人工核验后全员广播）。
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#C5A059]/25">
                        {onOpenLogin && (
                          <button
                            type="button"
                            onClick={onOpenLogin}
                            className="px-3 py-1.5 gold-gradient text-[#0F172A] font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{t('立即核验/登录企业会员账号', 'Verify & Sign In as Member')}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSubmitterType('external')}
                          className="px-3 py-1.5 bg-white hover:bg-[#F7F7F5] text-[#0F172A] border border-[#E8E6DF] rounded-lg text-xs font-medium"
                        >
                          {t('切换为外部潜在客户通道', 'Switch to External Prospect Channel')}
                        </button>
                        {onOpenMerchantApply && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowCreateModal(false);
                              onOpenMerchantApply();
                            }}
                            className="text-[#9E7425] hover:text-[#0F172A] text-[11px] font-semibold underline underline-offset-2 ml-auto"
                          >
                            {t('申请入驻融商汇', 'Apply for WBCA Membership')}
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
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      {t(
                        '外部合作代表联络信息（供秘书处真实性审核及对接）',
                        'External Representative Contact Details (For Secretariat Verification & Follow-Up)'
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#0F172A] font-medium mb-1">
                          {t('联络代表姓名 *', 'Contact Name *')}
                        </label>
                        <input
                          type="text"
                          required
                          value={externalName}
                          onChange={(e) => setExternalName(e.target.value)}
                          placeholder={t('如：李先生 / 张经理', 'e.g., Alex Li / Sarah Zhang')}
                          className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[#0F172A] font-medium mb-1">
                          {t('企业 / 采购方名称', 'Company / Organization')}
                        </label>
                        <input
                          type="text"
                          value={externalCompany}
                          onChange={(e) => setExternalCompany(e.target.value)}
                          placeholder={t('如：加拿大东方科技 / 个人买家', 'e.g., Northbridge Dynamics / Private Buyer')}
                          className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#0F172A] font-medium mb-1">
                          {t('联络电话（手机/微信）*', 'Phone / WeChat *')}
                        </label>
                        <input
                          type="tel"
                          value={externalPhone}
                          onChange={(e) => setExternalPhone(e.target.value)}
                          placeholder={t('如：+1 (519) 888-0000', 'e.g., +1 (519) 888-0000')}
                          className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[#0F172A] font-medium mb-1">
                          {t('联系邮箱（接收商户方案）*', 'Contact Email (For Proposals) *')}
                        </label>
                        <input
                          type="email"
                          value={externalEmail}
                          onChange={(e) => setExternalEmail(e.target.value)}
                          placeholder={t('如：business@example.com', 'e.g., business@example.com')}
                          className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-[#0F172A] font-medium mb-1">
                    {t('商机 / 需求标题 *', 'Opportunity / Inquiry Title *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={t(
                      '如：寻求 Waterloo 本地智能仓储与跨境物流长期合作商...',
                      'e.g., Seeking long-term smart warehousing and cross-border logistics partner in Waterloo...'
                    )}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                {/* Category & Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#0F172A] font-medium mb-1">
                      {t('所属板块', 'Category')}
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                    >
                      <option value="商机合作">
                        {t('商机合作 (重大项目/业务协同)', 'Business Venture (Strategic Projects / Synergy)')}
                      </option>
                      <option value="供需对接">
                        {t('供需对接 (本地物料采购/服务采购)', 'Supply & Demand (Local Procurement / Services)')}
                      </option>
                      <option value="紧急求助">
                        {t('紧急求助 (合规政策/紧急周转)', 'Urgent Advisory (Compliance / Time-Sensitive)')}
                      </option>
                      <option value="资源共享">
                        {t('资源共享 (场地/设备/渠道闲置)', 'Resource Exchange (Space / Equipment / Channels)')}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#0F172A] font-medium mb-1">
                      {t('商会悬赏积分（点）', 'Escrowed Bounty Points')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={newRewardPoints}
                      onChange={(e) => setNewRewardPoints(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      {t(
                        `采纳商户方案后将自动划转悬赏奖励，当前积分: ${userPoints}`,
                        `Automatically transferred upon accepting a member’s proposal. Current balance: ${userPoints} pts`
                      )}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[#0F172A] font-medium mb-1">
                    {t('需求详细描述与合作意向 *', 'Detailed Scope & Collaboration Intent *')}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder={t(
                      '请详细列出您的具体合作诉求、合作周期、交付标准、预算范围或对合作方的特定资质要求...',
                      'Specify your business requirements, timeline, deliverables, budget range, and any preferred vendor credentials...'
                    )}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                {/* Tags & Contact (for Member mode) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#0F172A] font-medium mb-1">
                      {t('标签（逗号隔开）', 'Tags (comma-separated)')}
                    </label>
                    <input
                      type="text"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder={t('如：精密制造, 研发退税, 厂房租赁', 'e.g., Precision Mfg, SR&ED, Commercial Lease')}
                      className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  {submitterType === 'member' && (
                    <div>
                      <label className="block text-[#0F172A] font-medium mb-1">
                        {t('对外联系方式展示', 'Public Contact Display')}
                      </label>
                      <input
                        type="text"
                        value={newContact}
                        onChange={(e) => setNewContact(e.target.value)}
                        placeholder={t('微信 / 办公电话 / 工作邮箱', 'WeChat / Office Phone / Work Email')}
                        className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="pt-3 border-t border-[#E8E6DF] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-[#F7F7F5] hover:bg-[#EFECE4] text-slate-700 border border-[#E8E6DF] rounded-xl font-medium"
                  >
                    {t('取消', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 font-bold rounded-xl shadow-md transition-all ${
                      submitterType === 'external'
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        : user?.isMember
                        ? 'gold-gradient text-[#0F172A] hover:opacity-95'
                        : 'bg-amber-50 text-[#9E7425] border border-[#C5A059]/45 hover:bg-amber-100'
                    }`}
                  >
                    {submitterType === 'external'
                      ? t('提交需求至秘书处核验', 'Submit to Secretariat for Review')
                      : user?.isMember
                      ? t('确认发布并全员广播', 'Publish & Broadcast to Network')
                      : t('需先核验实名会员资格后发布', 'Verify Member Identity to Publish')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
