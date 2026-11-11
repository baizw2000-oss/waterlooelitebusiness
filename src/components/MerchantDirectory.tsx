import React, { useState } from 'react';
import { Merchant, BusinessCategory, MemberTier } from '../types';
import { 
  Search, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Sparkles, 
  Phone, 
  Mail, 
  ExternalLink, 
  PlusCircle, 
  Building2, 
  Award, 
  Check, 
  Tag, 
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ShieldAlert,
  ChevronRight,
  Info,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  Edit3,
  Trash2,
  Ban,
  RotateCcw,
  FileWarning,
  ShieldX,
  Send,
  Inbox,
  RefreshCw,
  Bell,
  Users,
  User,
  Server,
  Database,
  CheckCircle,
  HelpCircle,
  Share2,
  Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  fetchNotificationConfig, 
  updateAdminEmails, 
  fetchNotificationLogs, 
  saveSmtpConfig,
  testSmtpConnection,
  EmailLogItem 
} from '../services/notificationService';
import { MerchantAvatar } from './MerchantAvatar';
import { ImageUploader } from './ImageUploader';

interface MerchantDirectoryProps {
  merchants: Merchant[];
  onSelectMerchant: (merchant: Merchant) => void;
  onOpenAIReputation: (merchant: Merchant) => void;
  onAddNewMerchant: (newMerchant: Merchant) => void;
  onApproveMerchant?: (merchantId: string | number) => void;
  onRejectMerchant?: (merchantId: string | number, reason?: string) => void;
  onUpdateMerchant?: (merchantId: string | number, updates: Partial<Merchant>) => void;
  onDelistMerchant?: (merchantId: string | number, reason: string) => void;
  onRelistMerchant?: (merchantId: string | number) => void;
  onDeleteMerchant?: (merchantId: string | number) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: BusinessCategory;
  setSelectedCategory: (cat: BusinessCategory) => void;
}

export const MerchantDirectory: React.FC<MerchantDirectoryProps> = ({
  merchants,
  onSelectMerchant,
  onOpenAIReputation,
  onAddNewMerchant,
  onApproveMerchant,
  onRejectMerchant,
  onUpdateMerchant,
  onDelistMerchant,
  onRelistMerchant,
  onDeleteMerchant,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}) => {
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubmittedConfirmModal, setShowSubmittedConfirmModal] = useState<Merchant | null>(null);
  const [adminViewMode, setAdminViewMode] = useState(false);

  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('weba_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState('');

  // Admin Operations State (Edit, Delist, Delete)
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [editName, setEditName] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editCategory, setEditCategory] = useState<BusinessCategory>('科技研发');
  const [editTier, setEditTier] = useState<MemberTier>('认证商户');
  const [editRepName, setEditRepName] = useState('');
  const [editRepTitle, setEditRepTitle] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editMemberPrivilege, setEditMemberPrivilege] = useState('');
  const [editCredibilityScore, setEditCredibilityScore] = useState<number>(90);
  const [editServices, setEditServices] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editEntityType, setEditEntityType] = useState<'company' | 'individual'>('company');
  const [editLogo, setEditLogo] = useState('');

  const [delistingMerchant, setDelistingMerchant] = useState<Merchant | null>(null);
  const [delistReasonInput, setDelistReasonInput] = useState('');

  const [deletingMerchant, setDeletingMerchant] = useState<Merchant | null>(null);

  // Email Notification Hub State
  const [showEmailHubModal, setShowEmailHubModal] = useState(false);
  const [adminEmails, setAdminEmails] = useState<string[]>(['baizw2000@gmail.com']);
  const [newAdminEmailInput, setNewAdminEmailInput] = useState('');
  const [emailLogs, setEmailLogs] = useState<EmailLogItem[]>([]);
  const [loadingEmailLogs, setLoadingEmailLogs] = useState(false);
  const [emailPreviewItem, setEmailPreviewItem] = useState<EmailLogItem | null>(null);
  const [emailSaveMessage, setEmailSaveMessage] = useState('');

  // SMTP Central Configuration State (Persisted directly in Firestore system_config/smtp)
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState<number>(465);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('WBCA 滑铁卢融商汇秘书处 <weba.chamber@gmail.com>');
  const [hasSmtpPass, setHasSmtpPass] = useState(false);
  const [isSmtpConfigured, setIsSmtpConfigured] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedMerchantId, setCopiedMerchantId] = useState<string | number | null>(null);


  // New Merchant Form State (website defaults to blank)
  const [newName, setNewName] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newEntityType, setNewEntityType] = useState<'company' | 'individual'>('company');
  const [newLogo, setNewLogo] = useState('');
  const [newCategory, setNewCategory] = useState<BusinessCategory>('科技研发');
  const [newRepName, setNewRepName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newServices, setNewServices] = useState('');
  const [newTagsInput, setNewTagsInput] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrivilege, setNewPrivilege] = useState('');

  const categories: BusinessCategory[] = [
    '全部',
    '科技研发',
    '会计法律',
    '地产建筑',
    '餐饮零售',
    '教育培训',
    '医疗健康',
    '跨境物流',
    '金融投资',
  ];

  // Count merchants by audit and operational status
  const pendingMerchants = merchants.filter((m) => m.auditStatus === 'PENDING_APPROVAL');
  const suspendedMerchants = merchants.filter((m) => m.auditStatus === 'SUSPENDED' || m.isDelisted);
  const approvedMerchants = merchants.filter(
    (m) =>
      (m.auditStatus === 'APPROVED' || (!m.auditStatus && m.verified)) &&
      !m.isDelisted
  );

  // Helper matching function for search across all text attributes of a merchant
  const checkMerchantMatchesQuery = (m: Merchant, rawQuery: string) => {
    const q = rawQuery.toLowerCase().trim();
    if (!q) return true;
    const tokens = q.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return true;

    return tokens.every((token) => {
      const inName = (m.name || '').toLowerCase().includes(token);
      const inNameEn = (m.nameEn || '').toLowerCase().includes(token);
      const inTagline = (m.tagline || '').toLowerCase().includes(token);
      const inDesc = (m.description || '').toLowerCase().includes(token);
      const inRep = (m.repName || '').toLowerCase().includes(token);
      const inRepTitle = (m.repTitle || '').toLowerCase().includes(token);
      const inCat = (m.category || '').toLowerCase().includes(token);
      const inPrivilege = (m.memberPrivilege || '').toLowerCase().includes(token);
      const inAddress = (m.address || '').toLowerCase().includes(token);
      const inWebsite = (m.website || '').toLowerCase().includes(token);
      const inEmail = (m.email || '').toLowerCase().includes(token);
      const inPhone = (m.phone || '').toLowerCase().includes(token);
      const inTags = Array.isArray(m.tags) && m.tags.some((t) => (t || '').toLowerCase().includes(token));
      const inServices = Array.isArray(m.services) && m.services.some((s) => (s || '').toLowerCase().includes(token));

      return (
        inName ||
        inNameEn ||
        inTagline ||
        inDesc ||
        inRep ||
        inRepTitle ||
        inCat ||
        inPrivilege ||
        inAddress ||
        inWebsite ||
        inEmail ||
        inPhone ||
        inTags ||
        inServices
      );
    });
  };

  // Total matching merchants across all categories (for smart alert when user is scoped into a specific category)
  const matchesQueryAcrossAllCategories = merchants.filter((m) => {
    if (tierFilter === 'pending') return m.auditStatus === 'PENDING_APPROVAL' && checkMerchantMatchesQuery(m, searchQuery);
    if (tierFilter === 'suspended') return (m.auditStatus === 'SUSPENDED' || m.isDelisted) && checkMerchantMatchesQuery(m, searchQuery);
    const isApprovedAndActive = (m.auditStatus === 'APPROVED' || (!m.auditStatus && m.verified)) && !m.isDelisted;
    if (!adminViewMode && !isApprovedAndActive) return false;
    return checkMerchantMatchesQuery(m, searchQuery);
  });

  // Filtering
  const displayedMerchants = merchants.filter((m) => {
    // If filtering pending
    if (tierFilter === 'pending') {
      return m.auditStatus === 'PENDING_APPROVAL' && checkMerchantMatchesQuery(m, searchQuery);
    }

    // If filtering suspended / delisted
    if (tierFilter === 'suspended') {
      return (m.auditStatus === 'SUSPENDED' || m.isDelisted) && checkMerchantMatchesQuery(m, searchQuery);
    }

    // Normal public display: hide pending and suspended merchants from public view
    const isApprovedAndActive =
      (m.auditStatus === 'APPROVED' || (!m.auditStatus && m.verified)) &&
      !m.isDelisted;

    if (!adminViewMode && !isApprovedAndActive) {
      return false;
    }

    const matchesCategory = selectedCategory === '全部' || m.category === selectedCategory;
    const matchesTier =
      tierFilter === 'all' ||
      (tierFilter === 'trustee' && (m.tier === '创会理事单位' || m.tier === '金牌会员单位')) ||
      (tierFilter === 'verified' && m.verified);

    const matchesQuery = checkMerchantMatchesQuery(m, searchQuery);

    return matchesCategory && matchesTier && matchesQuery;
  });

  const handleCreateMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRepName.trim()) return;

    const parsedServices = newServices.trim()
      ? newServices.split(/[,，、 \n]+/).filter(Boolean)
      : ['专业咨询', '商业对接', '定制服务'];
    const parsedTags = newTagsInput.trim()
      ? newTagsInput.split(/[,，、 \n]+/).filter(Boolean)
      : ['名商新晋', '实名登记', '待审核'];

    const newMerchant: Merchant = {
      id: `m-${Date.now()}`,
      name: newName.trim(),
      nameEn: newNameEn.trim() || newName.trim(),
      category: newCategory,
      tier: '认证商户',
      entityType: newEntityType,
      logo: newLogo.trim() || (newEntityType === 'individual' ? '👤' : '🏢'),
      tagline: newTagline.trim() || '滑铁卢融商汇认证新晋会员单位',
      description: newDescription.trim() || '扎根滑铁卢地区，诚信经营，致力为本地社区及华商业界提供高品质专业服务。',
      repName: newRepName.trim(),
      repTitle: newEntityType === 'individual' ? '专业顾问 / 执业经纪' : '负责人 / 代表',
      phone: newPhone.trim(),
      email: newEmail.trim(),
      website: newWebsite.trim(),
      address: newAddress.trim() || 'Waterloo, ON, Canada',
      establishedYear: new Date().getFullYear(),
      rating: 5.0,
      reviewCount: 1,
      credibilityScore: 92,
      tags: parsedTags,
      services: parsedServices,
      memberPrivilege: newPrivilege.trim() || '为滑铁卢融商汇会员提供专属9折会友优惠及优先接待服务。',
      verified: false,
      featured: false,
      auditStatus: 'PENDING_APPROVAL',
      appliedAt: new Date().toISOString(),
    };

    onAddNewMerchant(newMerchant);
    setShowAddModal(false);
    setShowSubmittedConfirmModal(newMerchant);

    // Reset Form
    setNewName('');
    setNewNameEn('');
    setNewEntityType('company');
    setNewLogo('');
    setNewRepName('');
    setNewPhone('');
    setNewEmail('');
    setNewWebsite('');
    setNewAddress('');
    setNewTagline('');
    setNewServices('');
    setNewTagsInput('');
    setNewDescription('');
    setNewPrivilege('');
  };

  const handleToggleAdminMode = () => {
    if (!isAdminAuthenticated) {
      setAdminAuthError('');
      setShowAdminAuthModal(true);
    } else {
      setAdminViewMode(!adminViewMode);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminViewMode(false);
    try {
      sessionStorage.removeItem('weba_admin_auth');
    } catch {
      // ignore
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUser = adminUsername.trim().toLowerCase();
    const trimmedPass = adminPassword.trim();

    if (trimmedUser === 'admin' && trimmedPass === 'admin6688') {
      setIsAdminAuthenticated(true);
      setAdminViewMode(true);
      setAdminAuthError('');
      try {
        sessionStorage.setItem('weba_admin_auth', 'true');
      } catch {
        // ignore
      }
      setShowAdminAuthModal(false);
      setAdminUsername('');
      setAdminPassword('');
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 },
      });
    } else {
      setAdminAuthError('账号或密码错误，请核对商会管理员授权凭证');
    }
  };

  const handleApprove = (merchantId: string | number) => {
    if (!isAdminAuthenticated) {
      setShowAdminAuthModal(true);
      return;
    }
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    if (onApproveMerchant) {
      onApproveMerchant(merchantId);
    }
  };

  const handleReject = (merchantId: string | number) => {
    if (!isAdminAuthenticated) {
      setShowAdminAuthModal(true);
      return;
    }
    if (onRejectMerchant) {
      onRejectMerchant(merchantId, '请补充滑铁卢地区实体经营资质或工商登记编号');
    }
  };

  // Admin Management Handlers: Edit, Delist, Relist, Delete
  const handleStartEdit = (merchant: Merchant) => {
    if (!isAdminAuthenticated) {
      setShowAdminAuthModal(true);
      return;
    }
    setEditingMerchant(merchant);
    setEditName(merchant.name);
    setEditNameEn(merchant.nameEn);
    setEditCategory(merchant.category);
    setEditTier(merchant.tier);
    setEditEntityType(merchant.entityType || 'company');
    setEditLogo(merchant.logo || '');
    setEditRepName(merchant.repName);
    setEditRepTitle(merchant.repTitle);
    setEditPhone(merchant.phone || '');
    setEditEmail(merchant.email || '');
    setEditWebsite(merchant.website || '');
    setEditAddress(merchant.address || '');
    setEditTagline(merchant.tagline || '');
    setEditDescription(merchant.description || '');
    setEditMemberPrivilege(merchant.memberPrivilege || '');
    setEditCredibilityScore(merchant.credibilityScore || 90);
    setEditServices(Array.isArray(merchant.services) ? merchant.services.join(', ') : '');
    setEditTags(Array.isArray(merchant.tags) ? merchant.tags.join(', ') : '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMerchant) return;
    const updates: Partial<Merchant> = {
      name: editName.trim(),
      nameEn: editNameEn.trim(),
      category: editCategory,
      tier: editTier,
      entityType: editEntityType,
      logo: editLogo.trim() || (editEntityType === 'individual' ? '👤' : '🏢'),
      repName: editRepName.trim(),
      repTitle: editRepTitle.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      website: editWebsite.trim(),
      address: editAddress.trim(),
      tagline: editTagline.trim(),
      description: editDescription.trim(),
      memberPrivilege: editMemberPrivilege.trim(),
      credibilityScore: Number(editCredibilityScore) || 90,
      services: editServices.trim() ? editServices.split(/[,，、 \n]+/).filter(Boolean) : (editingMerchant.services || []),
      tags: editTags.trim() ? editTags.split(/[,，、 \n]+/).filter(Boolean) : (editingMerchant.tags || []),
    };
    if (onUpdateMerchant) {
      onUpdateMerchant(editingMerchant.id, updates);
    }
    setEditingMerchant(null);
  };

  const handleStartDelist = (merchant: Merchant) => {
    if (!isAdminAuthenticated) {
      setShowAdminAuthModal(true);
      return;
    }
    setDelistingMerchant(merchant);
    setDelistReasonInput('经会员实名反馈及秘书处核查，该商户存在失信履约及负面评价风险，暂予下架公示。');
  };

  const handleConfirmDelist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delistingMerchant) return;
    if (onDelistMerchant) {
      onDelistMerchant(delistingMerchant.id, delistReasonInput.trim());
    }
    setDelistingMerchant(null);
  };

  const handleStartRelist = (merchantId: string | number) => {
    if (!isAdminAuthenticated) {
      setShowAdminAuthModal(true);
      return;
    }
    if (onRelistMerchant) {
      onRelistMerchant(merchantId);
    }
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleStartDelete = (merchant: Merchant) => {
    if (!isAdminAuthenticated) {
      setShowAdminAuthModal(true);
      return;
    }
    setDeletingMerchant(merchant);
  };

  const handleConfirmDelete = () => {
    if (!deletingMerchant) return;
    if (onDeleteMerchant) {
      onDeleteMerchant(deletingMerchant.id);
    }
    setDeletingMerchant(null);
  };

  // Email Notification Hub Handlers
  const handleOpenEmailHub = async () => {
    if (!isAdminAuthenticated) {
      setShowAdminAuthModal(true);
      return;
    }
    setShowEmailHubModal(true);
    setLoadingEmailLogs(true);
    setSmtpTestResult(null);
    try {
      const [config, logs] = await Promise.all([
        fetchNotificationConfig(),
        fetchNotificationLogs()
      ]);
      if (config.adminEmails && config.adminEmails.length > 0) {
        setAdminEmails(config.adminEmails);
      }
      if (config.smtpHost) setSmtpHost(config.smtpHost);
      if (config.smtpPort) setSmtpPort(config.smtpPort);
      if (config.smtpUser) setSmtpUser(config.smtpUser);
      if (config.smtpFrom) setSmtpFrom(config.smtpFrom);
      setHasSmtpPass(Boolean(config.hasSmtpPass));
      setIsSmtpConfigured(Boolean(config.isSmtpConfigured));
      setEmailLogs(logs);
    } catch (err) {
      console.error('Failed to load email hub data:', err);
    } finally {
      setLoadingEmailLogs(false);
    }
  };

  const handleSaveSmtpConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpHost.trim() || !smtpUser.trim()) {
      setEmailSaveMessage('⚠️ 请至少填写发信服务器 (SMTP Host) 与发信邮箱账号');
      setTimeout(() => setEmailSaveMessage(''), 3000);
      return;
    }
    setSavingSmtp(true);
    setSmtpTestResult(null);
    try {
      const res = await saveSmtpConfig({
        smtpHost: smtpHost.trim(),
        smtpPort: Number(smtpPort) || 587,
        smtpUser: smtpUser.trim(),
        smtpPass: smtpPass.trim() ? smtpPass.trim() : undefined,
        smtpFrom: smtpFrom.trim(),
      });
      if (res.success) {
        setIsSmtpConfigured(Boolean(res.config?.isSmtpConfigured));
        setHasSmtpPass(Boolean(res.config?.hasSmtpPass));
        setEmailSaveMessage('✅ 发信配置已成功永久写入 Google Cloud Firestore 中央数据库！全端即刻生效。');
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.5 } });
      } else {
        setEmailSaveMessage(`❌ 保存失败: ${res.error || '数据库写入异常'}`);
      }
    } catch (err: any) {
      setEmailSaveMessage(`❌ 保存失败: ${err?.message || '网络通信异常'}`);
    } finally {
      setSavingSmtp(false);
      setTimeout(() => setEmailSaveMessage(''), 4500);
    }
  };

  const handleTestSmtpConnection = async () => {
    setTestingSmtp(true);
    setSmtpTestResult(null);
    try {
      const target = adminEmails[0] || 'baizw2000@gmail.com';
      const res = await testSmtpConnection(target);
      if (res.success) {
        setSmtpTestResult({
          success: true,
          message: `🎉 测试邮件发送成功！已成功投递至 ${res.recipient}，请前往您的邮箱查收。`,
        });
        handleRefreshEmailLogs();
      } else {
        setSmtpTestResult({
          success: false,
          message: res.error || '测试发信失败，请核对 SMTP 主机、端口、邮箱与授权码。',
        });
      }
    } catch (err: any) {
      setSmtpTestResult({
        success: false,
        message: err?.message || '网络连接超时，请重试。',
      });
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleAddAdminEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToAdd = newAdminEmailInput.trim().toLowerCase();
    if (!emailToAdd || !emailToAdd.includes('@')) return;
    if (adminEmails.includes(emailToAdd)) {
      setEmailSaveMessage('该邮箱已存在于接收名单中');
      setTimeout(() => setEmailSaveMessage(''), 2500);
      return;
    }
    const updated = [...adminEmails, emailToAdd];
    setAdminEmails(updated);
    setNewAdminEmailInput('');
    const ok = await updateAdminEmails(updated);
    if (ok) {
      setEmailSaveMessage(`✅ 成功添加新接收邮箱：${emailToAdd} (已同步云端)`);
    } else {
      setEmailSaveMessage('保存至服务器配置失败，请检查网络');
    }
    setTimeout(() => setEmailSaveMessage(''), 3000);
  };

  const handleRemoveAdminEmail = async (emailToRemove: string) => {
    if (adminEmails.length <= 1) {
      setEmailSaveMessage('⚠️ 至少需要保留一个管理员通知邮箱');
      setTimeout(() => setEmailSaveMessage(''), 3000);
      return;
    }
    const updated = adminEmails.filter((em) => em !== emailToRemove);
    setAdminEmails(updated);
    const ok = await updateAdminEmails(updated);
    if (ok) {
      setEmailSaveMessage(`已移除邮箱：${emailToRemove} (已同步云端)`);
    }
    setTimeout(() => setEmailSaveMessage(''), 2500);
  };

  const handleRefreshEmailLogs = async () => {
    setLoadingEmailLogs(true);
    try {
      const logs = await fetchNotificationLogs();
      setEmailLogs(logs);
    } finally {
      setLoadingEmailLogs(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-400" />
            滑铁卢融商汇企业名录
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            严谨认证 · 覆盖滑铁卢（K-W-C）及大多伦多走廊的核心产业领军商企
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Golden Admin Approval Workspace Button */}
          {isAdminAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleAdminMode}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-md ${
                  adminViewMode
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/50'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                }`}
                title="已通过管理员验证，点击切换审批视角"
              >
                <Unlock className="w-3.5 h-3.5 text-inherit" />
                <span>{adminViewMode ? '管理审批视角 (开启)' : '管理员审批后台'}</span>
                {pendingMerchants.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-[10px]">
                    {pendingMerchants.length}
                  </span>
                )}
              </button>

              <button
                onClick={handleOpenEmailHub}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 transition-all flex items-center gap-1.5 shadow-sm"
                title="管理商会管理员邮箱 & 查阅邮件发件箱与商机通报"
              >
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">邮件中枢</span>
                <span className="sm:hidden">邮件</span>
              </button>

              <button
                onClick={handleAdminLogout}
                className="px-2.5 py-2 rounded-xl text-xs font-medium border border-rose-500/30 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 transition-all flex items-center gap-1"
                title="锁定并退出管理员身份"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">退出</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleToggleAdminMode}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 border-amber-300 shadow-md shadow-amber-500/25 transition-all flex items-center gap-1.5 active:scale-95"
              title="点击输入管理凭证进入秘书处审批工作台"
            >
              <Lock className="w-3.5 h-3.5 text-slate-950" />
              <span>管理员审批后台</span>
              {pendingMerchants.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-[10px] animate-pulse">
                  {pendingMerchants.length}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            商户入驻 / 申请认领
          </button>
        </div>
      </div>

      {/* Pending Approval Notice Banner */}
      {pendingMerchants.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                商会秘书处有 <strong className="text-amber-400 font-serif text-base">{pendingMerchants.length}</strong> 家商户入驻申请等待复核
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                新申请商户需经管理员复核资质后正式挂牌公示。您可以点击右侧按钮直接在后台进行一键核准！
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (!isAdminAuthenticated) {
                setAdminAuthError('');
                setShowAdminAuthModal(true);
              } else {
                setTierFilter('pending');
                setAdminViewMode(true);
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md whitespace-nowrap self-end sm:self-auto flex items-center gap-1.5"
          >
            {isAdminAuthenticated ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            立即查看并审批 ({pendingMerchants.length})
          </button>
        </div>
      )}

      {/* Search Bar & Filters */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-4 shadow-xl">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索商户名、业务标语、负责人、行业、服务项目（如：人寿保险、投资顾问、理财、商业险）..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-xs text-slate-400 hover:text-white"
            >
              清除
            </button>
          )}
        </div>

        {/* Active Search & Category Scope Helper */}
        {searchQuery.trim() && selectedCategory !== '全部' && (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 animate-in fade-in">
            <span className="flex items-center gap-1.5">
              <span>当前在「<strong className="text-white">{selectedCategory}</strong>」板块内搜索。</span>
              {matchesQueryAcrossAllCategories.length > displayedMerchants.length && (
                <span className="text-slate-300 hidden sm:inline">
                  (全名录另有 {matchesQueryAcrossAllCategories.length - displayedMerchants.length} 家其他板块商户匹配)
                </span>
              )}
            </span>
            <button
              onClick={() => setSelectedCategory('全部')}
              className="text-amber-400 font-semibold hover:underline flex items-center gap-1 text-[11px]"
            >
              切至「全部分类」搜索
            </button>
          </div>
        )}

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Tier Filter */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-400">
              <Filter className="w-3.5 h-3.5" /> 状态筛选：
            </span>
            {[
              { id: 'all', label: `已认证公示 (${approvedMerchants.length})` },
              { id: 'trustee', label: '理事单位' },
              { id: 'pending', label: `待秘书处审核 (${pendingMerchants.length})` },
              ...(adminViewMode || suspendedMerchants.length > 0
                ? [{ id: 'suspended', label: `已下架处置 (${suspendedMerchants.length})` }]
                : []),
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTierFilter(f.id)}
                className={`transition-colors flex items-center gap-1 ${
                  tierFilter === f.id
                    ? f.id === 'suspended'
                      ? 'text-rose-400 font-semibold underline underline-offset-4'
                      : 'text-amber-400 font-semibold underline underline-offset-4'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-[11px]">
            当前展示 <strong className="text-amber-300">{displayedMerchants.length}</strong> 家商户
          </span>
        </div>
      </div>

      {/* Suspended Delisted Notice Banner for Admins */}
      {adminViewMode && suspendedMerchants.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg text-xs text-rose-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <ShieldX className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <span className="font-bold text-white">
                有 <strong className="text-rose-400 font-mono text-sm">{suspendedMerchants.length}</strong> 家商户因负面舆情或违规已被商会下架屏蔽
              </span>
              <p className="text-[11px] text-slate-300">
                这些商户已对普通会员及公开名录隐藏，管理员可随时核查整改、重新上架或彻底抹除。
              </p>
            </div>
          </div>
          <button
            onClick={() => setTierFilter('suspended')}
            className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-xl text-xs shadow whitespace-nowrap self-end sm:self-auto"
          >
            查看下架名单 ({suspendedMerchants.length})
          </button>
        </div>
      )}

      {/* Category Scope Helper Notice when 0 matches in current category */}
      {selectedCategory !== '全部' && searchQuery.trim() && displayedMerchants.length === 0 && matchesQueryAcrossAllCategories.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-100 shadow-lg animate-in fade-in">
          <div className="space-y-0.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              在当前「{selectedCategory}」下未搜到，但在其他板块找到 {matchesQueryAcrossAllCategories.length} 家相关商户！
            </span>
            <p className="text-[11px] text-slate-300">
              您搜索的「{searchQuery}」与「金融投资」等其他板块的认证商户高度匹配。
            </p>
          </div>
          <button
            onClick={() => setSelectedCategory('全部')}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs whitespace-nowrap shadow-md self-start sm:self-auto"
          >
            一键查看全部 {matchesQueryAcrossAllCategories.length} 家商户
          </button>
        </div>
      )}

      {/* Merchants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedMerchants.map((merchant) => {
          const isPending = merchant.auditStatus === 'PENDING_APPROVAL';
          const isSuspended = merchant.auditStatus === 'SUSPENDED' || merchant.isDelisted;

          return (
            <div
              key={merchant.id}
              className={`group relative bg-slate-900/90 rounded-2xl border p-5 flex flex-col justify-between transition-all hover:shadow-xl ${
                isSuspended
                  ? 'border-rose-500/60 bg-gradient-to-br from-rose-950/25 via-slate-900 to-slate-900 shadow-rose-500/10'
                  : isPending
                  ? 'border-amber-500/70 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-900 shadow-amber-500/10'
                  : 'border-slate-800 hover:border-amber-500/50 hover:shadow-amber-500/5'
              }`}
            >
              {/* Suspended Alert Banner */}
              {isSuspended && (
                <div className="mb-3 p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/50 flex flex-col gap-1 text-xs text-rose-200 shadow-md">
                  <div className="flex items-center justify-between font-bold text-rose-300">
                    <span className="flex items-center gap-1.5">
                      <ShieldX className="w-4 h-4 text-rose-400" />
                      已下架处置 (商会信誉与舆情风控)
                    </span>
                    <span className="text-[10px] text-rose-400">
                      {merchant.delistedAt ? new Date(merchant.delistedAt).toLocaleDateString() : '已屏蔽'}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-200/90 leading-tight mt-0.5">
                    <strong>下架原因：</strong>
                    {merchant.delistReason || '涉嫌违约或严重负面舆情投诉，经商会秘书处核查暂予下架'}
                  </p>
                </div>
              )}

              {/* Pending Badge Banner */}
              {isPending && (
                <div className="mb-3 p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                    待商会秘书处审核挂牌
                  </span>
                  <span className="text-[10px] text-slate-400">
                    申请于 {merchant.appliedAt ? new Date(merchant.appliedAt).toLocaleDateString() : '刚刚'}
                  </span>
                </div>
              )}

              {/* Header info */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <MerchantAvatar
                      merchant={merchant}
                      size="md"
                      showBadge={true}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                          {merchant.name}
                        </h3>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            merchant.entityType === 'individual'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {merchant.entityType === 'individual' ? '个人' : '企业'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {merchant.nameEn}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                      isSuspended
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                        : isPending
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : merchant.tier === '创会理事单位'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : merchant.tier === '金牌会员单位'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {isSuspended ? '已下架屏蔽' : isPending ? '待审批入驻' : merchant.tier}
                  </span>
                </div>

                {/* Tagline */}
                <p className="text-xs text-slate-300 mt-3 font-medium line-clamp-2">
                  {merchant.tagline}
                </p>

                {/* Representative & Address */}
                <div className="mt-3.5 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{merchant.entityType === 'individual' ? '执业人' : '代表'}: {merchant.repName} ({merchant.repTitle})</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      建业 {merchant.establishedYear}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{merchant.address}</span>
                  </div>
                </div>

                {/* Rating & Credibility Gauge */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{merchant.rating}</span>
                    <span className="text-[11px] text-slate-500">
                      ({merchant.reviewCount}条会内评价)
                    </span>
                  </div>

                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                    isSuspended
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  }`}>
                    {isSuspended ? <ShieldX className="w-3 h-3 text-rose-400" /> : <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                    信誉 {merchant.credibilityScore}分
                  </div>
                </div>

                {/* Exclusive Privilege Highlight */}
                {merchant.memberPrivilege && (
                  <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-snug">
                    <span className="font-bold text-amber-400">会员特权：</span>
                    {merchant.memberPrivilege}
                  </div>
                )}
              </div>

              {/* Bottom Actions or Admin Controls */}
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                {isSuspended ? (
                  /* Actions for Suspended Merchants */
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartRelist(merchant.id)}
                        className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        恢复上架公示
                      </button>
                      <button
                        onClick={() => handleStartEdit(merchant)}
                        className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1 border border-slate-700"
                        title="修改商户信息"
                      >
                        <Edit3 className="w-3 h-3 text-cyan-400" />
                        修改
                      </button>
                      <button
                        onClick={() => handleStartDelete(merchant)}
                        className="py-2 px-3 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs flex items-center gap-1 border border-rose-600/40"
                        title="彻底删除此不良商户"
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        删除
                      </button>
                    </div>
                  </div>
                ) : isPending ? (
                  /* Actions for Pending Approval Merchants */
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                      <div className="font-semibold text-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        AI 智能初筛：资质核查建议
                      </div>
                      <p className="text-slate-400">
                        法定代表、联系电话及安省地址格式核验无误，符合商会入会章程。
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(merchant.id)}
                        className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        核准上线
                      </button>
                      <button
                        onClick={() => handleStartEdit(merchant)}
                        className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1"
                        title="修改资料"
                      >
                        <Edit3 className="w-3 h-3 text-cyan-400" />
                        修改
                      </button>
                      <button
                        onClick={() => handleReject(merchant.id)}
                        className="py-2 px-2.5 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 rounded-xl text-xs"
                      >
                        驳回
                      </button>
                      <button
                        onClick={() => handleStartDelete(merchant)}
                        className="py-2 px-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-xl text-xs"
                        title="删除申请"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Live Merchants */
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1.5">
                      <button
                        onClick={() => onSelectMerchant(merchant)}
                        className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        企业主页
                      </button>

                      <button
                        onClick={() => onOpenAIReputation(merchant)}
                        className="py-1.5 px-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/40 hover:to-blue-600/40 border border-cyan-400/40 text-cyan-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                        title="生成Gemini AI多维商誉与舆情诊断"
                      >
                        <Sparkles className="w-3 h-3 text-cyan-300" />
                        <span className="hidden sm:inline">AI诊断</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const origin = typeof window !== 'undefined' ? window.location.origin : '';
                          const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
                          const shareUrl = `${origin}${pathname}?merchant=${merchant.id}`;
                          navigator.clipboard?.writeText(shareUrl);
                          setCopiedMerchantId(merchant.id);
                          setTimeout(() => setCopiedMerchantId(null), 2000);
                        }}
                        className={`p-1.5 rounded-lg border text-xs transition-all flex items-center justify-center flex-shrink-0 ${
                          copiedMerchantId === merchant.id
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'bg-slate-800 hover:bg-cyan-950/60 border-slate-700 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300'
                        }`}
                        title={`复制该商企专属直达链接 (?merchant=${merchant.id})`}
                      >
                        {copiedMerchantId === merchant.id ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Admin Management Toolbar for Live Merchants */}
                    {adminViewMode && (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-amber-400/90 font-semibold flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-amber-400" />
                          商会管理处置：
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit(merchant)}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors border border-slate-700"
                            title="修改商户资料"
                          >
                            <Edit3 className="w-3 h-3 text-cyan-400" />
                            修改
                          </button>
                          <button
                            onClick={() => handleStartDelist(merchant)}
                            className="px-2 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 hover:text-amber-200 text-[11px] font-medium flex items-center gap-1 transition-colors border border-amber-600/40"
                            title="不良商家下架处置"
                          >
                            <Ban className="w-3 h-3 text-amber-400" />
                            下架
                          </button>
                          <button
                            onClick={() => handleStartDelete(merchant)}
                            className="px-2 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 text-[11px] font-medium flex items-center gap-1 transition-colors border border-rose-600/40"
                            title="彻底删除此商户"
                          >
                            <Trash2 className="w-3 h-3 text-rose-400" />
                            删除
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State for Clean Real Testing Stage or Search No Results */}
      {displayedMerchants.length === 0 && (
        <div className="text-center py-16 px-6 rounded-3xl border border-dashed border-slate-800 bg-slate-900/40">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-4">
            {searchQuery ? <Search className="w-8 h-8" /> : <Building2 className="w-8 h-8" />}
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {searchQuery ? `未找到与「${searchQuery}」相关的商户` : '暂无符合条件的入驻商户'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
            {searchQuery
              ? `您可以尝试简化搜索词、检查当前板块筛选，或点击下方按钮重置并查看全商会所有认证企业。`
              : '系统已完成虚假演示商户清理，进入100%真实业务测试阶段。您可以立即点击下方按钮提交您的第一家真实企业申请，或在管理员后台审核通过已提交的申请！'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('全部');
                }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
              >
                清除搜索并查看全部
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              申请真实商户入驻
            </button>
          </div>
        </div>
      )}

      {/* Add Merchant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  申请商户入驻名商录 / 实名登记
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
              <strong>入驻与审核流程说明：</strong>
              <ol className="list-decimal list-inside space-y-0.5 mt-1 text-[11px] text-slate-300">
                <li>提交申请后，企业将写入商会 Firestore 云端数据库，状态为「待秘书处审核」。</li>
                <li>商会管理员或理事在后台核验企业资质与会员专享特权真实性。</li>
                <li>审核通过后自动加盖商会数字公信徽章，正式发布于公开名录并奖励推荐积分！</li>
              </ol>
            </div>

            <form onSubmit={handleCreateMerchant} className="space-y-3.5 text-xs">
              {/* Image Uploader for Company Logo or Individual Photo */}
              <ImageUploader
                value={newLogo}
                onChange={setNewLogo}
                entityType={newEntityType}
                onEntityTypeChange={setNewEntityType}
                name={newName || (newEntityType === 'individual' ? '个人专家' : '商会企业')}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {newEntityType === 'individual' ? '姓名 / 个人执业称号 *' : '企业中文全称 *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      if (newEntityType === 'individual' && !newRepName) {
                        setNewRepName(e.target.value);
                      }
                    }}
                    placeholder={newEntityType === 'individual' ? '例如：白政玮 (保险代理人)' : '例如：柏源金融 / BV Financial'}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {newEntityType === 'individual' ? '英文名称 / Pinyin' : '英文注册全称'}
                  </label>
                  <input
                    type="text"
                    value={newNameEn}
                    onChange={(e) => setNewNameEn(e.target.value)}
                    placeholder="e.g. Waterloo Smart Tech Inc."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    所属行业板块 *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as BusinessCategory)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  >
                    {categories.filter((c) => c !== '全部').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    负责人姓名 / 代表 *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRepName}
                    onChange={(e) => setNewRepName(e.target.value)}
                    placeholder="如：张三 (CEO)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    联络电话
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 (519) ..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    官方联系邮箱
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="contact@company.ca"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
                  <span>企业官方网址链接</span>
                  <span className="text-[11px] text-slate-500 font-normal">默认空白，商户自主选填</span>
                </label>
                <input
                  type="text"
                  value={newWebsite}
                  onChange={(e) => setNewWebsite(e.target.value)}
                  placeholder="例如：https://yourcompany.ca（留空则不显示任何预设网址）"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  滑铁卢地区办公地址
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="如：University Ave, Waterloo, ON"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  一句话业务亮点 / 标语
                </label>
                <input
                  type="text"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  placeholder="如：多年MDRT会员，专职人寿保险经纪，投资代理人"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
                  <span>主营核心业务与服务项目</span>
                  <span className="text-[11px] text-slate-500 font-normal">用逗号分隔，便于会员精确检索</span>
                </label>
                <input
                  type="text"
                  value={newServices}
                  onChange={(e) => setNewServices(e.target.value)}
                  placeholder="如：人寿保险, 重疾保险, 投资代理, 财富规划, 车险房险"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  检索关键词 / 商户标签 (用逗号分隔)
                </label>
                <input
                  type="text"
                  value={newTagsInput}
                  onChange={(e) => setNewTagsInput(e.target.value)}
                  placeholder="如：保险代理, 投资顾问, MDRT, 财富管理"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  面向商会会员的专享福利 / 优惠权益
                </label>
                <input
                  type="text"
                  value={newPrivilege}
                  onChange={(e) => setNewPrivilege(e.target.value)}
                  placeholder="如：会员首次咨询免费，签约立享8.8折会友特惠"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-md"
                >
                  提交入驻申请
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submitted Confirmation Modal explaining Approval Process */}
      {showSubmittedConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto text-2xl">
              📋
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                入驻申请已成功提交至商会数据库！
              </h3>
              <p className="text-xs text-amber-300 font-semibold">
                企业「{showSubmittedConfirmModal.name}」已建档保全
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2.5 text-slate-300">
              <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-200 text-[11px] flex items-start gap-2">
                <Mail className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-white">审核邮件已派发至管理员：</span>
                  <div className="text-slate-300 mt-0.5">
                    系统已自动生成《新商户入驻审批通报》，派发至商会管理员邮箱：<strong className="text-amber-300 font-mono">baizw2000@gmail.com</strong>
                  </div>
                </div>
              </div>

              <div className="font-bold text-white flex items-center gap-1.5 pt-1">
                <Info className="w-4 h-4 text-amber-400" />
                商会管理员审批流程：
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                1. <strong>邮件提醒</strong>：商会秘书处管理员已收到申请通知邮件，内含企业资质与联络信息。<br />
                2. <strong>快捷审批</strong>：您现在可直接点击下方<strong>「一键核准上线」</strong>完成审批测试，或在后台名录中随时处理。<br />
                3. <strong>公示生效</strong>：审批核准后，商户立即在全网点亮，并能接收未来的商机全员通报！
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => {
                  handleApprove(showSubmittedConfirmModal.id);
                  setShowSubmittedConfirmModal(null);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                作为管理员直接一键核准上线
              </button>
              <button
                onClick={() => setShowSubmittedConfirmModal(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                稍后在管理后台审核
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Authentication Password Modal */}
      {showAdminAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    商会秘书处 · 管理员权限鉴权
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    管理商户入驻申请与准入核验
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAdminAuthModal(false);
                  setAdminUsername('');
                  setAdminPassword('');
                  setAdminAuthError('');
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">受商会理事会保密权限管控：</p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  只有商会秘书长、轮值理事或授权审核员可进入后台进行商户资质审核与点亮上线。
                </p>
              </div>
            </div>

            {adminAuthError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="leading-snug">{adminAuthError}</div>
              </div>
            )}

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  管理员账号 (Username)
                </label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="请输入管理员账号"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  管理授权密码 (Password)
                </label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="请输入管理员密码"
                    required
                    autoFocus
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white p-0.5"
                    title={showAdminPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminAuthModal(false);
                    setAdminUsername('');
                    setAdminPassword('');
                    setAdminAuthError('');
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  验证并进入审批后台
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Edit Merchant Modal */}
      {editingMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    修改商户档案资料 (管理员工作台)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    商户编号: {editingMerchant.id} · 修改将实时保存至云端 Firestore 数据库
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingMerchant(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              {/* Image Uploader for Company Logo or Individual Photo */}
              <ImageUploader
                value={editLogo}
                onChange={setEditLogo}
                entityType={editEntityType}
                onEntityTypeChange={setEditEntityType}
                name={editName || (editEntityType === 'individual' ? '个人专家' : '商会企业')}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {editEntityType === 'individual' ? '个人姓名 / 执业称号 *' : '企业中文全称 *'}
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">英文注册全称</label>
                  <input
                    type="text"
                    value={editNameEn}
                    onChange={(e) => setEditNameEn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">行业类别</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as BusinessCategory)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  >
                    {categories.filter((c) => c !== '全部').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">商会等阶</label>
                  <select
                    value={editTier}
                    onChange={(e) => setEditTier(e.target.value as MemberTier)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="创会理事单位">创会理事单位</option>
                    <option value="金牌会员单位">金牌会员单位</option>
                    <option value="认证商户">认证商户</option>
                    <option value="青年创客商户">青年创客商户</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">法定代表 / 主理人 *</label>
                  <input
                    type="text"
                    value={editRepName}
                    onChange={(e) => setEditRepName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">代表职务</label>
                  <input
                    type="text"
                    value={editRepTitle}
                    onChange={(e) => setEditRepTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">联系电话</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">公函邮箱</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>企业官方网址链接</span>
                  <span className="text-[11px] text-slate-500 font-normal">支持留空以不展示任何预设网址</span>
                </label>
                <input
                  type="text"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  placeholder="例如：https://yourdomain.ca（留空则不显示网址）"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">滑铁卢办公地址</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">业务标语 / 亮点</label>
                <input
                  type="text"
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">主营业务与服务项目 (用逗号分隔)</label>
                <input
                  type="text"
                  value={editServices}
                  onChange={(e) => setEditServices(e.target.value)}
                  placeholder="例如：人寿保险, 重疾保险, 投资理财, 旅游保险"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">商户标签与检索关键词 (用逗号分隔)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="例如：MDRT专职经纪, 人寿保险代理, 金融投资"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">企业背景与核心业务介绍</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">会员专享福利 / 特权待遇</label>
                <input
                  type="text"
                  value={editMemberPrivilege}
                  onChange={(e) => setEditMemberPrivilege(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>商誉评分 (0-100)</span>
                  <span className="text-amber-400 font-mono font-bold">{editCredibilityScore} 分</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editCredibilityScore}
                  onChange={(e) => setEditCredibilityScore(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingMerchant(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-md"
                >
                  保存修改并同步云端
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Delist / Suspend Modal */}
      {delistingMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  商企下架处置 · 负面舆情风控
                </h3>
                <p className="text-[11px] text-slate-400">
                  商会公信与纪律委员会强制管控
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs space-y-1.5 text-rose-200">
              <div className="font-bold text-white flex items-center gap-1.5">
                <FileWarning className="w-4 h-4 text-rose-400" />
                正在下架处置企业：
              </div>
              <p className="text-white text-sm font-semibold">
                {delistingMerchant.name} ({delistingMerchant.nameEn})
              </p>
              <p className="text-[11px] text-rose-300/90 leading-relaxed">
                下架后，该商户将<strong>立即对所有普通会员及外部公开名录隐藏</strong>，并关闭其会员特权推荐通道，彻底切断负面波及效应。
              </p>
            </div>

            <form onSubmit={handleConfirmDelist} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  选择或填写处置下架原因 *
                </label>
                <div className="space-y-1.5 mb-2">
                  {[
                    '会员实名投诉：未兑现商会专享优惠或存在虚假承诺',
                    '信用与纠纷预警：发生重大民商事纠纷或被列入失信名单',
                    '负面舆情管控：在各大社交与评价平台出现大规模负面舆情',
                    '经营异常：滑铁卢本地经营实体已撤离或执照已失效',
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setDelistReasonInput(preset)}
                      className={`w-full text-left p-2 rounded-lg text-[11px] border transition-colors ${
                        delistReasonInput === preset
                          ? 'bg-rose-500/20 border-rose-500/60 text-white font-medium'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={delistReasonInput}
                  onChange={(e) => setDelistReasonInput(e.target.value)}
                  placeholder="详细下架处置原因备案..."
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDelistingMerchant(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Ban className="w-4 h-4" />
                  确认执行下架屏蔽
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Delete Confirmation Modal */}
      {deletingMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto text-2xl">
              <Trash2 className="w-7 h-7 text-rose-400" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                彻底永久删除商企档案？
              </h3>
              <p className="text-sm text-rose-300 font-semibold">
                【{deletingMerchant.name}】
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-rose-900/40 text-left text-xs space-y-1.5 text-slate-300">
              <p className="text-rose-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> 严重危险操作：
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                此操作将从商会 Firestore 云端数据库中<strong>永久彻底抹除</strong>该商户的注册信息、审核记录及历史评价。此过程无法撤回或恢复！
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingMerchant(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                取消保留
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                确认彻底删除
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Email Notification Hub Modal */}
      {showEmailHubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-sky-500/40 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <Mail className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    商会邮件通知中枢 & 自动发信台
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    管理管理员审批接收邮箱 · 查阅全商会商户广播池 · 发件箱回溯
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailHubModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {emailSaveMessage && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs animate-in fade-in flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{emailSaveMessage}</span>
                </div>
              )}

              {/* Section 0: SMTP Central Cloud Database Configuration */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-amber-500/30 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <Database className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        商会发信邮局 (SMTP) 云端中央数据库配置
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                          Firestore system_config/smtp
                        </span>
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      此配置直接保存在 Google Cloud Firestore 云端数据库中，全平台实时生效，无需改写代码文件或重启服务器。
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                        isSmtpConfigured
                          ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                          : 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
                      }`}
                    >
                      {isSmtpConfigured ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          已接入官方发信服务
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          待填入授权码激活
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSaveSmtpConfig} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                        <Server className="w-3.5 h-3.5 text-amber-400" />
                        SMTP 邮件服务器地址 *
                      </label>
                      <input
                        type="text"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        placeholder="如 smtp.gmail.com 或 mail.waterloobusiness.ca"
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">
                        端口 (Port) *
                      </label>
                      <input
                        type="number"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(Number(e.target.value))}
                        placeholder="465 或 587"
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs font-mono"
                      />
                      <span className="text-[10px] text-slate-500">465 (SSL) / 587 (TLS)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-amber-400" />
                        商会发信邮箱账号 (用户名) *
                      </label>
                      <input
                        type="email"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        placeholder="如 weba.chamber@gmail.com"
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                          邮箱授权码 / 应用专用密码 *
                        </label>
                        {hasSmtpPass && (
                          <span className="text-[10px] text-emerald-400 font-sans">
                            ✓ 云端已有保存凭证
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showSmtpPass ? 'text' : 'password'}
                          value={smtpPass}
                          onChange={(e) => setSmtpPass(e.target.value)}
                          placeholder={hasSmtpPass ? '•••••••••••••••• (已保存，若需更改直接输入新密码)' : '输入16位应用授权码 (App Password)'}
                          className="w-full px-3 py-2 pr-10 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSmtpPass(!showSmtpPass)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      发件人对外显示名称 (Sender Name)
                    </label>
                    <input
                      type="text"
                      value={smtpFrom}
                      onChange={(e) => setSmtpFrom(e.target.value)}
                      placeholder="如 WBCA 滑铁卢融商汇秘书处 <weba.chamber@gmail.com>"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs"
                    />
                  </div>

                  {/* Actions & Live Test */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={savingSmtp}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow disabled:opacity-50"
                      >
                        {savingSmtp ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            正在保存至 Firestore...
                          </>
                        ) : (
                          <>
                            <Database className="w-3.5 h-3.5" />
                            保存配置至中央云端数据库
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleTestSmtpConnection}
                        disabled={testingSmtp || (!smtpUser && !isSmtpConfigured)}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 disabled:opacity-40"
                        title="向主管理员邮箱发送真实测试邮件验证配置"
                      >
                        {testingSmtp ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                            正在与邮箱服务器联通测试...
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-sky-400" />
                            一键发送测试邮件至管理员
                          </>
                        )}
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-500 sm:text-right">
                      测试接收人: <strong className="text-amber-300/90 font-mono">{adminEmails[0] || 'baizw2000@gmail.com'}</strong>
                    </span>
                  </div>
                </form>

                {/* SMTP Test Result Banner */}
                {smtpTestResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs animate-in fade-in flex items-start gap-2.5 ${
                      smtpTestResult.success
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                        : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                    }`}
                  >
                    {smtpTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="font-semibold">{smtpTestResult.message}</p>
                    </div>
                  </div>
                )}

                {/* Helpful instructions tip */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-300/90 font-semibold">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>💡 如何为商会配置发信邮箱 (以 Gmail 为例，1分钟即可完成)：</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
                    <li>访问您的 Google 账号设置中心 (<code>myaccount.google.com</code>) 并开启【两步验证】。</li>
                    <li>在搜索框搜索并进入【应用专用密码 (App Passwords)】。</li>
                    <li>应用名称输入「滑铁卢融商汇」，系统将生成 16 位专属密码（如 <code>abcd efgh ijkl mnop</code>）。</li>
                    <li>将发信账号填入上方，粘贴 16 位密码，点击「保存配置至中央云端数据库」即可！</li>
                  </ol>
                </div>
              </div>

              {/* Section 1: Admin Notification Recipients */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-amber-400" />
                      商会管理员审批接收邮箱 (新商户申请通知)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      每当有新商户提交入驻申请时，系统将即时向以下管理员邮箱派发《新商户入驻待审批申报单》。
                    </p>
                  </div>
                </div>

                {/* Current Admin Email Tags */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {adminEmails.map((email) => (
                    <div
                      key={email}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-mono"
                    >
                      <span>{email}</span>
                      {email === 'baizw2000@gmail.com' && (
                        <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-md font-sans">
                          主管理员
                        </span>
                      )}
                      {adminEmails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAdminEmail(email)}
                          className="text-amber-400 hover:text-rose-400 ml-1 p-0.5"
                          title="移除该管理员通知邮箱"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add new admin email input */}
                <form onSubmit={handleAddAdminEmail} className="flex gap-2 pt-2">
                  <input
                    type="email"
                    value={newAdminEmailInput}
                    onChange={(e) => setNewAdminEmailInput(e.target.value)}
                    placeholder="输入需要同步接收审批提醒的其他管理员邮箱 (如 admin2@gmail.com)..."
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shadow whitespace-nowrap"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    添加管理员邮箱
                  </button>
                </form>
              </div>

              {/* Section 2: All Merchant Broadcast Target Pool */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-sky-400" />
                      商会商机通报全员广播邮箱池 (共 {merchants.filter((m) => m.email).length} 家企业已登记)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      会员在【商机互助中心】发布新供需合作时，系统将自动向名录中所有商户以密送 (BCC) 发送通报，全员直达且保障商业隐私。
                    </p>
                  </div>
                  <a
                    href={`mailto:?bcc=${merchants
                      .map((m) => m.email)
                      .filter(Boolean)
                      .join(',')}&subject=${encodeURIComponent(
                      '【滑铁卢融商汇】商机互助直达通报'
                    )}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 rounded-xl text-xs font-semibold self-start sm:self-auto"
                    title="在本地默认邮件客户端中打开群发窗口"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    客户端一键群发 (BCC)
                  </a>
                </div>

                <div className="max-h-40 overflow-y-auto border border-slate-800 rounded-xl divide-y divide-slate-850">
                  {merchants
                    .filter((m) => m.email)
                    .map((m) => (
                      <div key={m.id} className="p-2.5 flex items-center justify-between text-xs bg-slate-900/60 hover:bg-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{m.name}</span>
                          <span className="text-[10px] text-slate-400 font-sans">({m.repName})</span>
                        </div>
                        <span className="text-sky-300 font-mono text-[11px]">{m.email}</span>
                      </div>
                    ))}
                  {merchants.filter((m) => m.email).length === 0 && (
                    <div className="p-4 text-center text-slate-500 text-xs">
                      当前暂无有效商户登记邮箱
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Outbox Delivery Logs */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Inbox className="w-4 h-4 text-emerald-400" />
                      邮件发件箱日志与发送记录 ({emailLogs.length} 条)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      记录所有系统自动派发的新商户入驻审批通知和商机互助广播。
                    </p>
                  </div>
                  <button
                    onClick={handleRefreshEmailLogs}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
                    title="刷新日志"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingEmailLogs ? 'animate-spin text-amber-400' : ''}`} />
                    <span>刷新</span>
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto border border-slate-800 rounded-xl divide-y divide-slate-800">
                  {emailLogs.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      暂无邮件发送记录。当有新商户提交申请或发布商机互助时，日志将实时在此汇聚。
                    </div>
                  ) : (
                    emailLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-slate-900/60 hover:bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                log.type === 'MERCHANT_APPLICATION'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              }`}
                            >
                              {log.type === 'MERCHANT_APPLICATION' ? '商户申请审批' : '商机全员广播'}
                            </span>
                            <span className="font-semibold text-white text-xs">{log.subject}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-3">
                            <span>收件人数: <strong className="text-slate-200">{log.recipientCount}</strong></span>
                            <span>时间: <strong className="text-slate-300">{new Date(log.sentAt).toLocaleString('zh-CN')}</strong></span>
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {log.deliveryNote || '已处理'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => setEmailPreviewItem(log)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs"
                          >
                            预览邮件原文
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-end bg-slate-950/40">
              <button
                type="button"
                onClick={() => setShowEmailHubModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email HTML Preview Modal */}
      {emailPreviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h4 className="text-sm font-bold text-white">邮件原文预览 (WBCA HTML Template)</h4>
                <p className="text-[11px] text-slate-400">{emailPreviewItem.subject}</p>
              </div>
              <button
                onClick={() => setEmailPreviewItem(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-slate-950">
              <div
                className="rounded-2xl overflow-hidden border border-slate-800"
                dangerouslySetInnerHTML={{ __html: emailPreviewItem.htmlContent }}
              />
            </div>

            <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-slate-950 text-xs">
              <span className="text-slate-400 text-[11px]">
                收件人列表: {emailPreviewItem.recipients.join(', ')}
              </span>
              <button
                onClick={() => setEmailPreviewItem(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
              >
                返回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
