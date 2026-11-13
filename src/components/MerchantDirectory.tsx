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
import { useLanguage } from '../i18n/LanguageContext';
import {
  getLocalizedMerchantName,
  getLocalizedMerchantSecondaryName,
  translateCategory,
  translateSystemText,
  translateTier,
} from '../i18n/domainTranslations';

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
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
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
  isAddModalOpen,
  onCloseAddModal,
}) => {
  const { isEn, t } = useLanguage();
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Sync external open trigger
  React.useEffect(() => {
    if (isAddModalOpen) {
      setShowAddModal(true);
    }
  }, [isAddModalOpen]);
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
  const [smtpFrom, setSmtpFrom] = useState(
    isEn
      ? 'WBCA Secretariat <weba.chamber@gmail.com>'
      : 'WBCA 滑铁卢融商汇秘书处 <weba.chamber@gmail.com>'
  );
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
      const inCatEn = translateCategory(m.category, true).toLowerCase().includes(token);
      const inPrivilege = (m.memberPrivilege || '').toLowerCase().includes(token);
      const inAddress = (m.address || '').toLowerCase().includes(token);
      const inWebsite = (m.website || '').toLowerCase().includes(token);
      const inEmail = (m.email || '').toLowerCase().includes(token);
      const inPhone = (m.phone || '').toLowerCase().includes(token);
      const inTags = Array.isArray(m.tags) && m.tags.some((tg) => (tg || '').toLowerCase().includes(token));
      const inServices = Array.isArray(m.services) && m.services.some((s) => (s || '').toLowerCase().includes(token));

      return (
        inName ||
        inNameEn ||
        inTagline ||
        inDesc ||
        inRep ||
        inRepTitle ||
        inCat ||
        inCatEn ||
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
      : isEn
      ? ['Advisory Services', 'Strategic Partnerships', 'Bespoke Solutions']
      : ['专业咨询', '商业对接', '定制服务'];
    const parsedTags = newTagsInput.trim()
      ? newTagsInput.split(/[,，、 \n]+/).filter(Boolean)
      : isEn
      ? ['New Applicant', 'Verified Filing', 'Pending Review']
      : ['名商新晋', '实名登记', '待审核'];

    const newMerchant: Merchant = {
      id: `m-${Date.now()}`,
      name: newName.trim(),
      nameEn: newNameEn.trim() || newName.trim(),
      category: newCategory,
      tier: '认证商户',
      entityType: newEntityType,
      logo: newLogo.trim() || (newEntityType === 'individual' ? '👤' : '🏢'),
      tagline: newTagline.trim() || t('滑铁卢融商汇认证新晋会员单位', 'Newly Verified Member of Waterloo Business Convergence Alliance'),
      description:
        newDescription.trim() ||
        t(
          '扎根滑铁卢地区，诚信经营，致力为本地社区及华商业界提供高品质专业服务。',
          'Serving Waterloo Region with integrity and excellence across professional and commercial services.'
        ),
      repName: newRepName.trim(),
      repTitle:
        newEntityType === 'individual'
          ? t('专业顾问 / 执业经纪', 'Licensed Advisor / Practitioner')
          : t('负责人 / 代表', 'Managing Principal / Representative'),
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
      memberPrivilege:
        newPrivilege.trim() ||
        t(
          '为滑铁卢融商汇会员提供专属9折会友优惠及优先接待服务。',
          'Exclusive 10% member privilege and priority executive consultation for WBCA members.'
        ),
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
      setAdminAuthError(
        t(
          '账号或密码错误，请核对商会管理员授权凭证',
          'Invalid username or password. Please verify your Secretariat administrator credentials.'
        )
      );
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
      onRejectMerchant(
        merchantId,
        t(
          '请补充滑铁卢地区实体经营资质或工商登记编号',
          'Please provide Waterloo Region business registration or local operating credentials.'
        )
      );
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
    setDelistReasonInput(
      t(
        '经会员实名反馈及秘书处核查，该商户存在失信履约及负面评价风险，暂予下架公示。',
        'Temporarily delisted by the Secretariat following verified member feedback and compliance risk review.'
      )
    );
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
      setEmailSaveMessage(
        t(
          '⚠️ 请至少填写发信服务器 (SMTP Host) 与发信邮箱账号',
          '⚠️ Please provide both an SMTP Host and a sender email account.'
        )
      );
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
        setEmailSaveMessage(
          t(
            '✅ 发信配置已成功永久写入 Google Cloud Firestore 中央数据库！全端即刻生效。',
            '✅ SMTP configuration saved to Google Cloud Firestore and active platform-wide.'
          )
        );
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.5 } });
      } else {
        setEmailSaveMessage(
          t(
            `❌ 保存失败: ${res.error || '数据库写入异常'}`,
            `❌ Save failed: ${res.error || 'Database write error'}`
          )
        );
      }
    } catch (err: any) {
      setEmailSaveMessage(
        t(
          `❌ 保存失败: ${err?.message || '网络通信异常'}`,
          `❌ Save failed: ${err?.message || 'Network communication error'}`
        )
      );
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
          message: t(
            `🎉 测试邮件发送成功！已成功投递至 ${res.recipient}，请前往您的邮箱查收。`,
            `🎉 Test email dispatched successfully to ${res.recipient}. Please check your inbox.`
          ),
        });
        handleRefreshEmailLogs();
      } else {
        setSmtpTestResult({
          success: false,
          message:
            res.error ||
            t(
              '测试发信失败，请核对 SMTP 主机、端口、邮箱与授权码。',
              'SMTP test failed. Please verify host, port, username, and app password.'
            ),
        });
      }
    } catch (err: any) {
      setSmtpTestResult({
        success: false,
        message: err?.message || t('网络连接超时，请重试。', 'Connection timed out. Please retry.'),
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
      setEmailSaveMessage(t('该邮箱已存在于接收名单中', 'This email is already on the recipient list.'));
      setTimeout(() => setEmailSaveMessage(''), 2500);
      return;
    }
    const updated = [...adminEmails, emailToAdd];
    setAdminEmails(updated);
    setNewAdminEmailInput('');
    const ok = await updateAdminEmails(updated);
    if (ok) {
      setEmailSaveMessage(
        t(
          `✅ 成功添加新接收邮箱：${emailToAdd} (已同步云端)`,
          `✅ Added recipient email: ${emailToAdd} (synced to cloud)`
        )
      );
    } else {
      setEmailSaveMessage(t('保存至服务器配置失败，请检查网络', 'Failed to save configuration. Please check network connectivity.'));
    }
    setTimeout(() => setEmailSaveMessage(''), 3000);
  };

  const handleRemoveAdminEmail = async (emailToRemove: string) => {
    if (adminEmails.length <= 1) {
      setEmailSaveMessage(
        t('⚠️ 至少需要保留一个管理员通知邮箱', '⚠️ At least one administrator email must remain.')
      );
      setTimeout(() => setEmailSaveMessage(''), 3000);
      return;
    }
    const updated = adminEmails.filter((em) => em !== emailToRemove);
    setAdminEmails(updated);
    const ok = await updateAdminEmails(updated);
    if (ok) {
      setEmailSaveMessage(
        t(`已移除邮箱：${emailToRemove} (已同步云端)`, `Removed recipient: ${emailToRemove} (synced to cloud)`)
      );
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
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-editorial flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#C5A059]" />
            {t('滑铁卢融商汇企业名录', 'WBCA Verified Enterprise Directory')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {t(
              '严谨认证 · 覆盖滑铁卢（K-W-C）及大多伦多走廊的核心产业领军商企',
              'Vetted & Verified · Leading enterprises across the Waterloo (K-W-C) & Greater Toronto Innovation Corridor'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Golden Admin Approval Workspace Button */}
          {isAdminAuthenticated ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={handleToggleAdminMode}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
                  adminViewMode
                    ? 'bg-[#0F172A] text-[#DFBA73] border-[#C5A059] ring-2 ring-[#C5A059]/30'
                    : 'bg-amber-50 text-[#9E7425] border-[#C5A059]/45 hover:bg-amber-100'
                }`}
                title={t('已通过管理员验证，点击切换审批视角', 'Admin verified — click to toggle review mode')}
              >
                <Unlock className="w-3.5 h-3.5 text-inherit" />
                <span>
                  {adminViewMode
                    ? t('管理审批视角 (开启)', 'Admin Review Mode (On)')
                    : t('管理员审批后台', 'Admin Approval Console')}
                </span>
                {pendingMerchants.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-[10px]">
                    {pendingMerchants.length}
                  </span>
                )}
              </button>

              <button
                onClick={handleOpenEmailHub}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-[#E8E6DF] bg-white hover:bg-[#F7F7F5] text-[#0F172A] transition-all flex items-center gap-1.5 shadow-sm"
                title={t('管理商会管理员邮箱 & 查阅邮件发件箱与商机通报', 'Manage admin recipients, outbox logs & opportunity broadcasts')}
              >
                <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="hidden sm:inline">{t('邮件中枢', 'Mail Hub')}</span>
                <span className="sm:hidden">{t('邮件', 'Mail')}</span>
              </button>

              <button
                onClick={handleAdminLogout}
                className="px-2.5 py-2 rounded-xl text-xs font-medium border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all flex items-center gap-1"
                title={t('锁定并退出管理员身份', 'Lock & exit admin session')}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('退出', 'Sign Out')}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleToggleAdminMode}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border bg-white hover:bg-[#F7F7F5] text-[#0F172A] border-[#C5A059]/45 shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
              title={t('点击输入管理凭证进入秘书处审批工作台', 'Enter Secretariat credentials to access approval console')}
            >
              <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{t('管理员审批后台', 'Admin Console')}</span>
              {pendingMerchants.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-[10px] animate-pulse">
                  {pendingMerchants.length}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient text-[#0F172A] font-black text-xs sm:text-sm shadow-md transition-all hover:opacity-95 active:scale-95 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-[#0F172A]" />
            <span>{t('申请商户入驻 / 实名建档', 'Apply for Verified Listing')}</span>
          </button>
        </div>
      </div>

      {/* Fast-Track Joining Callout Card (Crisp Editorial Ivory Card) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#C5A059]/45 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 luxury-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-[#C5A059]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F7F5] border border-[#C5A059]/40 text-[#9E7425] flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
            🏛️
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-[#0F172A] font-editorial flex items-center gap-2 flex-wrap">
              {t('让您的企业在滑铁卢融商名录点亮挂牌', 'Elevate Your Enterprise in the WBCA Verified Directory')}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFFDF7] text-[#9E7425] border border-[#C5A059]/40 font-sans font-bold uppercase">
                {t('极速通道', 'Fast Track')}
              </span>
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              {isEn ? (
                <>
                  Open to Ontario corporations and licensed independent practitioners. Skip the paperwork—upon submission, immediately generate your dedicated <strong className="text-[#9E7425] font-mono">?merchant=ID</strong> landing page, shareable digital card poster, and network-wide opportunity broadcast eligibility.
                </>
              ) : (
                <>
                  支持安省企业法人与个人独立执业专家。免繁琐流程，提交后即刻生成 <strong className="text-[#9E7425] font-mono">?merchant=ID</strong> 独立直达主页、专属名片海报与全员商机邮件通报资格！
                </>
              )}
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-initial px-5 py-2.5 gold-gradient text-[#0F172A] font-black text-xs sm:text-sm rounded-xl shadow-sm transition-all hover:brightness-105 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('2分钟申请商户入驻', 'Apply in 2 Minutes')}</span>
          </button>
        </div>
      </div>

      {/* Pending Approval Notice Banner */}
      {pendingMerchants.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-[#C5A059]/45 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-[#9E7425] border border-[#C5A059]/35">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                {isEn ? (
                  <>
                    <strong className="text-[#9E7425] font-editorial text-base">{pendingMerchants.length}</strong>{' '}
                    {pendingMerchants.length === 1 ? 'application awaiting Secretariat review' : 'applications awaiting Secretariat review'}
                  </>
                ) : (
                  <>
                    商会秘书处有 <strong className="text-[#9E7425] font-editorial text-base">{pendingMerchants.length}</strong> 家商户入驻申请等待复核
                  </>
                )}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {t(
                  '新申请商户需经管理员复核资质后正式挂牌公示。您可以点击右侧按钮直接在后台进行一键核准！',
                  'New applications require administrator verification before public listing. Click on the right to review and approve.'
                )}
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
            className="px-4 py-2 gold-gradient text-[#0F172A] font-bold text-xs rounded-xl shadow-sm whitespace-nowrap self-end sm:self-auto flex items-center gap-1.5"
          >
            {isAdminAuthenticated ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {t(`立即查看并审批 (${pendingMerchants.length})`, `Review & Approve (${pendingMerchants.length})`)}
          </button>
        </div>
      )}

      {/* Search Bar & Filters */}
      <div className="bg-white rounded-2xl border border-[#E8E6DF] p-4 space-y-4 luxury-shadow">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(
              '搜索商户名、业务标语、负责人、行业、服务项目（如：人寿保险、投资顾问、理财、商业险）...',
              'Search by company, tagline, principal, sector, or service (e.g. Life Insurance, Wealth Advisory, AI)...'
            )}
            className="w-full pl-10 pr-16 py-2.5 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-xs text-slate-500 hover:text-[#0F172A]"
            >
              {t('清除', 'Clear')}
            </button>
          )}
        </div>

        {/* Active Search & Category Scope Helper */}
        {searchQuery.trim() && selectedCategory !== '全部' && (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 border border-[#C5A059]/35 text-xs text-slate-700 animate-in fade-in">
            <span className="flex items-center gap-1.5">
              <span>
                {isEn ? (
                  <>
                    Searching within <strong className="text-[#0F172A]">{translateCategory(selectedCategory, true)}</strong>.
                  </>
                ) : (
                  <>
                    当前在「<strong className="text-[#0F172A]">{selectedCategory}</strong>」板块内搜索。
                  </>
                )}
              </span>
              {matchesQueryAcrossAllCategories.length > displayedMerchants.length && (
                <span className="text-slate-600 hidden sm:inline">
                  {t(
                    `(全名录另有 ${matchesQueryAcrossAllCategories.length - displayedMerchants.length} 家其他板块商户匹配)`,
                    `(${matchesQueryAcrossAllCategories.length - displayedMerchants.length} additional matches in other sectors)`
                  )}
                </span>
              )}
            </span>
            <button
              onClick={() => setSelectedCategory('全部')}
              className="text-[#9E7425] font-semibold hover:underline flex items-center gap-1 text-[11px]"
            >
              {t('切至「全部分类」搜索', 'Search All Sectors')}
            </button>
          </div>
        )}

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-[#0F172A] text-[#DFBA73] border-[#0F172A] shadow-sm'
                  : 'bg-[#F7F7F5] text-slate-600 hover:bg-[#EFECE4] hover:text-[#0F172A] border-[#E8E6DF]'
              }`}
            >
              {translateCategory(cat, isEn)}
            </button>
          ))}
        </div>

        {/* Secondary Tier Filter */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500 pt-2 border-t border-[#E8E6DF]">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-slate-500">
              <Filter className="w-3.5 h-3.5" /> {t('状态筛选：', 'Status:')}
            </span>
            {[
              { id: 'all', label: t(`已认证公示 (${approvedMerchants.length})`, `Verified (${approvedMerchants.length})`) },
              { id: 'trustee', label: t('理事单位', 'Board Trustees') },
              { id: 'pending', label: t(`待秘书处审核 (${pendingMerchants.length})`, `Pending Review (${pendingMerchants.length})`) },
              ...(adminViewMode || suspendedMerchants.length > 0
                ? [{ id: 'suspended', label: t(`已下架处置 (${suspendedMerchants.length})`, `Delisted (${suspendedMerchants.length})`) }]
                : []),
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTierFilter(f.id)}
                className={`transition-colors flex items-center gap-1 ${
                  tierFilter === f.id
                    ? f.id === 'suspended'
                      ? 'text-rose-700 font-bold underline underline-offset-4'
                      : 'text-[#9E7425] font-bold underline underline-offset-4'
                    : 'text-slate-500 hover:text-[#0F172A]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-[11px]">
            {isEn ? (
              <>
                Showing <strong className="text-[#9E7425]">{displayedMerchants.length}</strong> {displayedMerchants.length === 1 ? 'member' : 'members'}
              </>
            ) : (
              <>
                当前展示 <strong className="text-[#9E7425]">{displayedMerchants.length}</strong> 家商户
              </>
            )}
          </span>
        </div>
      </div>

      {/* Suspended Delisted Notice Banner for Admins */}
      {adminViewMode && suspendedMerchants.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm text-xs text-rose-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 border border-rose-200">
              <ShieldX className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <span className="font-bold text-[#0F172A]">
                {isEn ? (
                  <>
                    <strong className="text-rose-700 font-mono text-sm">{suspendedMerchants.length}</strong>{' '}
                    {suspendedMerchants.length === 1 ? 'listing has been delisted for compliance or reputation risk' : 'listings have been delisted for compliance or reputation risk'}
                  </>
                ) : (
                  <>
                    有 <strong className="text-rose-700 font-mono text-sm">{suspendedMerchants.length}</strong> 家商户因负面舆情或违规已被商会下架屏蔽
                  </>
                )}
              </span>
              <p className="text-[11px] text-rose-800">
                {t(
                  '这些商户已对普通会员及公开名录隐藏，管理员可随时核查整改、重新上架或彻底抹除。',
                  'Hidden from public & member directory views. Administrators may audit remediation, restore listing, or permanently remove.'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setTierFilter('suspended')}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm whitespace-nowrap self-end sm:self-auto"
          >
            {t(`查看下架名单 (${suspendedMerchants.length})`, `View Delisted (${suspendedMerchants.length})`)}
          </button>
        </div>
      )}

      {/* Category Scope Helper Notice when 0 matches in current category */}
      {selectedCategory !== '全部' && searchQuery.trim() && displayedMerchants.length === 0 && matchesQueryAcrossAllCategories.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-[#C5A059]/45 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#0F172A] shadow-sm animate-in fade-in">
          <div className="space-y-0.5">
            <span className="font-bold text-[#0F172A] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              {t(
                `在当前「${selectedCategory}」下未搜到，但在其他板块找到 ${matchesQueryAcrossAllCategories.length} 家相关商户！`,
                `No matches in "${translateCategory(selectedCategory, true)}", but ${matchesQueryAcrossAllCategories.length} matching enterprises found across other sectors!`
              )}
            </span>
            <p className="text-[11px] text-slate-600">
              {t(
                `您搜索的「${searchQuery}」与「${translateCategory('金融投资', false)}」等其他板块的认证商户高度匹配。`,
                `Your search "${searchQuery}" strongly matches verified members in Finance & Investment and other sectors.`
              )}
            </p>
          </div>
          <button
            onClick={() => setSelectedCategory('全部')}
            className="px-4 py-2 gold-gradient text-[#0F172A] font-bold rounded-xl text-xs whitespace-nowrap shadow-sm self-start sm:self-auto"
          >
            {t(`一键查看全部 ${matchesQueryAcrossAllCategories.length} 家商户`, `View All ${matchesQueryAcrossAllCategories.length} Matches`)}
          </button>
        </div>
      )}

      {/* Merchants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedMerchants.map((merchant) => {
          const isPending = merchant.auditStatus === 'PENDING_APPROVAL';
          const isSuspended = merchant.auditStatus === 'SUSPENDED' || merchant.isDelisted;
          const primaryName = getLocalizedMerchantName(merchant, isEn);
          const secondaryName = getLocalizedMerchantSecondaryName(merchant, isEn);
          const localizedTagline = translateSystemText(merchant.tagline, isEn);
          const localizedPrivilege = translateSystemText(merchant.memberPrivilege, isEn);

          return (
            <div
              key={merchant.id}
              className={`group relative bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all luxury-shadow hover:shadow-lg ${
                isSuspended
                  ? 'border-rose-300 bg-rose-50/40'
                  : isPending
                  ? 'border-[#C5A059] bg-amber-50/30'
                  : 'border-[#E8E6DF] hover:border-[#C5A059]/70'
              }`}
            >
              {/* Suspended Alert Banner */}
              {isSuspended && (
                <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex flex-col gap-1 text-xs text-rose-900">
                  <div className="flex items-center justify-between font-bold text-rose-800">
                    <span className="flex items-center gap-1.5">
                      <ShieldX className="w-4 h-4 text-rose-600" />
                      {t('已下架处置 (商会信誉与舆情风控)', 'Delisted (Compliance & Risk Control)')}
                    </span>
                    <span className="text-[10px] text-rose-600">
                      {merchant.delistedAt
                        ? new Date(merchant.delistedAt).toLocaleDateString(isEn ? 'en-CA' : 'zh-CN')
                        : t('已屏蔽', 'Hidden')}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-tight mt-0.5">
                    <strong>{t('下架原因：', 'Reason: ')}</strong>
                    {translateSystemText(merchant.delistReason, isEn) ||
                      t(
                        '涉嫌违约或严重负面舆情投诉，经商会秘书处核查暂予下架',
                        'Temporarily delisted pending Secretariat review of compliance or service concerns.'
                      )}
                  </p>
                </div>
              )}

              {/* Pending Badge Banner */}
              {isPending && (
                <div className="mb-3 p-2 rounded-xl bg-amber-50 border border-[#C5A059]/40 flex items-center justify-between text-xs text-[#9E7425]">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Clock className="w-3.5 h-3.5 animate-pulse text-[#C5A059]" />
                    {t('待商会秘书处审核挂牌', 'Pending Secretariat Review')}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {t('申请于 ', 'Applied ')}{' '}
                    {merchant.appliedAt
                      ? new Date(merchant.appliedAt).toLocaleDateString(isEn ? 'en-CA' : 'zh-CN')
                      : t('刚刚', 'Just now')}
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
                        <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#9E7425] transition-colors line-clamp-1 font-editorial">
                          {primaryName}
                        </h3>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            merchant.entityType === 'individual'
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : 'bg-amber-50 text-[#9E7425] border-[#C5A059]/40'
                          }`}
                        >
                          {merchant.entityType === 'individual'
                            ? t('个人', 'Individual')
                            : t('企业', 'Enterprise')}
                        </span>
                      </div>
                      {secondaryName && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {secondaryName}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                      isSuspended
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : isPending
                        ? 'bg-amber-50 text-[#9E7425] border-[#C5A059]/40'
                        : merchant.tier === '创会理事单位'
                        ? 'bg-[#0F172A] text-[#DFBA73] border-[#C5A059]/45'
                        : merchant.tier === '金牌会员单位'
                        ? 'bg-amber-50 text-[#9E7425] border-[#C5A059]/45'
                        : 'bg-[#F7F7F5] text-slate-600 border-[#E8E6DF]'
                    }`}
                  >
                    {isSuspended
                      ? t('已下架屏蔽', 'Delisted')
                      : isPending
                      ? t('待审批入驻', 'Pending')
                      : translateTier(merchant.tier, isEn)}
                  </span>
                </div>

                {/* Tagline */}
                <p className="text-xs text-slate-600 mt-3 font-medium line-clamp-2">
                  {localizedTagline}
                </p>

                {/* Representative & Address */}
                <div className="mt-3.5 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#0F172A] font-medium flex items-center gap-1.5 min-w-0">
                      <User className="w-3.5 h-3.5 text-[#C5A059] flex-shrink-0" />
                      <span className="truncate">
                        {merchant.entityType === 'individual'
                          ? t('执业人', 'Practitioner')
                          : t('代表', 'Principal')}
                        : {merchant.repName} ({translateSystemText(merchant.repTitle, isEn)})
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-500 whitespace-nowrap">
                      {t(`建业 ${merchant.establishedYear}`, `Est. ${merchant.establishedYear}`)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{merchant.address}</span>
                  </div>
                </div>

                {/* Rating & Credibility Gauge */}
                <div className="mt-3 pt-3 border-t border-[#E8E6DF] flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#9E7425] text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
                    <span>{merchant.rating}</span>
                    <span className="text-[11px] text-slate-500">
                      ({merchant.reviewCount} {t('条会内评价', 'member reviews')})
                    </span>
                  </div>

                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                    isSuspended
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}>
                    {isSuspended ? <ShieldX className="w-3 h-3 text-rose-600" /> : <ShieldCheck className="w-3 h-3 text-emerald-600" />}
                    {t(`信誉 ${merchant.credibilityScore}分`, `Trust ${merchant.credibilityScore}/100`)}
                  </div>
                </div>

                {/* Exclusive Privilege Highlight */}
                {localizedPrivilege && (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF] text-[11px] text-slate-700 leading-snug">
                    <span className="font-bold text-[#9E7425]">{t('会员特权：', 'Member Privilege: ')}</span>
                    {localizedPrivilege}
                  </div>
                )}
              </div>

              {/* Bottom Actions or Admin Controls */}
              <div className="mt-4 pt-3 border-t border-[#E8E6DF] space-y-2">
                {isSuspended ? (
                  /* Actions for Suspended Merchants */
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartRelist(merchant.id)}
                        className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {t('恢复上架公示', 'Restore Listing')}
                      </button>
                      <button
                        onClick={() => handleStartEdit(merchant)}
                        className="py-2 px-3 bg-[#F7F7F5] hover:bg-[#EFECE4] text-[#0F172A] rounded-xl text-xs flex items-center gap-1 border border-[#E8E6DF]"
                        title={t('修改商户信息', 'Edit enterprise details')}
                      >
                        <Edit3 className="w-3 h-3 text-[#9E7425]" />
                        {t('修改', 'Edit')}
                      </button>
                      <button
                        onClick={() => handleStartDelete(merchant)}
                        className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs flex items-center gap-1 border border-rose-200"
                        title={t('彻底删除此不良商户', 'Permanently delete this listing')}
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" />
                        {t('删除', 'Delete')}
                      </button>
                    </div>
                  </div>
                ) : isPending ? (
                  /* Actions for Pending Approval Merchants */
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF] text-[11px] space-y-1">
                      <div className="font-semibold text-[#9E7425] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#C5A059]" />
                        {t('AI 智能初筛：资质核查建议', 'AI Pre-Screen: Credential Summary')}
                      </div>
                      <p className="text-slate-600">
                        {t(
                          '法定代表、联系电话及安省地址格式核验无误，符合商会入会章程。',
                          'Principal, contact line, and Ontario address validated against Alliance admission criteria.'
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(merchant.id)}
                        className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t('核准上线', 'Approve & Publish')}
                      </button>
                      <button
                        onClick={() => handleStartEdit(merchant)}
                        className="py-2 px-2.5 bg-[#F7F7F5] hover:bg-[#EFECE4] text-[#0F172A] border border-[#E8E6DF] rounded-xl text-xs flex items-center gap-1"
                        title={t('修改资料', 'Edit application')}
                      >
                        <Edit3 className="w-3 h-3 text-[#9E7425]" />
                        {t('修改', 'Edit')}
                      </button>
                      <button
                        onClick={() => handleReject(merchant.id)}
                        className="py-2 px-2.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-[#E8E6DF] hover:border-rose-200 rounded-xl text-xs"
                      >
                        {t('驳回', 'Decline')}
                      </button>
                      <button
                        onClick={() => handleStartDelete(merchant)}
                        className="py-2 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs"
                        title={t('删除申请', 'Delete application')}
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
                        className="flex-1 py-2 px-3 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
                      >
                        {t('企业主页', 'View Profile')}
                      </button>

                      <button
                        onClick={() => onOpenAIReputation(merchant)}
                        className="py-2 px-2.5 bg-[#F7F7F5] hover:bg-[#EFECE4] border border-[#C5A059]/40 text-[#9E7425] rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                        title={t('生成Gemini AI多维商誉与舆情诊断', 'Generate AI Reputation & Trust Analysis')}
                      >
                        <Sparkles className="w-3 h-3 text-[#C5A059]" />
                        <span className="hidden sm:inline">{t('AI诊断', 'AI Audit')}</span>
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
                        className={`p-2 rounded-xl border text-xs transition-all flex items-center justify-center flex-shrink-0 ${
                          copiedMerchantId === merchant.id
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-[#F7F7F5] hover:bg-[#EFECE4] border-[#E8E6DF] hover:border-[#C5A059]/60 text-slate-600 hover:text-[#9E7425]'
                        }`}
                        title={t(
                          `复制该商企专属直达链接 (?merchant=${merchant.id})`,
                          `Copy direct listing link (?merchant=${merchant.id})`
                        )}
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
                      <div className="pt-2 border-t border-[#E8E6DF] flex items-center justify-between text-xs">
                        <span className="text-[10px] text-[#9E7425] font-semibold flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-[#C5A059]" />
                          {t('商会管理处置：', 'Admin Actions:')}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit(merchant)}
                            className="px-2 py-1 rounded-lg bg-[#F7F7F5] hover:bg-[#EFECE4] text-[#0F172A] text-[11px] font-medium flex items-center gap-1 transition-colors border border-[#E8E6DF]"
                            title={t('修改商户资料', 'Edit listing')}
                          >
                            <Edit3 className="w-3 h-3 text-[#9E7425]" />
                            {t('修改', 'Edit')}
                          </button>
                          <button
                            onClick={() => handleStartDelist(merchant)}
                            className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#9E7425] text-[11px] font-medium flex items-center gap-1 transition-colors border border-[#C5A059]/40"
                            title={t('不良商家下架处置', 'Delist merchant')}
                          >
                            <Ban className="w-3 h-3 text-[#C5A059]" />
                            {t('下架', 'Delist')}
                          </button>
                          <button
                            onClick={() => handleStartDelete(merchant)}
                            className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-medium flex items-center gap-1 transition-colors border border-rose-200"
                            title={t('彻底删除此商户', 'Permanently delete merchant')}
                          >
                            <Trash2 className="w-3 h-3 text-rose-600" />
                            {t('删除', 'Delete')}
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
        <div className="text-center py-16 px-6 rounded-3xl border border-dashed border-[#D6D3C9] bg-white luxury-shadow">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-[#C5A059]/35 text-[#C5A059] mx-auto flex items-center justify-center mb-4">
            {searchQuery ? <Search className="w-8 h-8" /> : <Building2 className="w-8 h-8" />}
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] font-editorial mb-2">
            {searchQuery
              ? t(`未找到与「${searchQuery}」相关的商户`, `No Enterprises Found for "${searchQuery}"`)
              : t('暂无符合条件的入驻商户', 'No Matching Enterprises Listed')}
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
            {searchQuery
              ? t(
                  '您可以尝试简化搜索词、检查当前板块筛选，或点击下方按钮重置并查看全商会所有认证企业。',
                  'Try simplifying your search keywords, clearing sector filters, or resetting to view all verified Alliance members.'
                )
              : t(
                  '当前筛选条件或名录下暂无已发布的商户记录。您可以立即点击下方按钮提交您的企业入驻申请，或在管理员后台核准待审申请！',
                  'No published listings match the current filter. Submit your enterprise application below or approve pending applications in the Admin Console.'
                )}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('全部');
                }}
                className="px-5 py-2.5 bg-[#F7F7F5] hover:bg-[#EFECE4] text-[#0F172A] border border-[#E8E6DF] font-semibold rounded-xl text-xs transition-colors"
              >
                {t('清除搜索并查看全部', 'Clear Search & View All')}
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2.5 gold-gradient text-[#0F172A] font-bold rounded-xl text-xs inline-flex items-center gap-2 shadow-md transition-opacity hover:opacity-95"
            >
              <PlusCircle className="w-4 h-4" />
              {t('申请真实商户入驻', 'Apply for Verified Listing')}
            </button>
          </div>
        </div>
      )}

      {/* Add Merchant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/65 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-[#E8E6DF] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-[#C5A059]/25 bg-[#0F172A] px-6 py-4 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-5 h-5 text-[#DFBA73]" />
                <h3 className="text-lg font-bold text-white font-editorial">
                  {t('申请商户入驻名商录 / 实名登记', 'Apply for WBCA Verified Listing')}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-white">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-[#C5A059]/35 text-xs text-slate-700 leading-relaxed">
                <strong className="text-[#9E7425]">
                  {t('入驻与审核流程说明：', 'Application & Verification Process:')}
                </strong>
                <ol className="list-decimal list-inside space-y-0.5 mt-1 text-[11px] text-slate-600">
                  <li>
                    {t(
                      '提交申请后，企业将写入商会 Firestore 云端数据库，状态为「待秘书处审核」。',
                      'Upon submission, your profile is securely recorded with status "Pending Secretariat Review".'
                    )}
                  </li>
                  <li>
                    {t(
                      '商会管理员或理事在后台核验企业资质与会员专享特权真实性。',
                      'Alliance officers verify corporate credentials and member-exclusive privileges.'
                    )}
                  </li>
                  <li>
                    {t(
                      '审核通过后自动加盖商会数字公信徽章，正式发布于公开名录并奖励推荐积分！',
                      'Once approved, your Verified Seal activates on the public directory with bonus referral credits.'
                    )}
                  </li>
                </ol>
              </div>

              <form onSubmit={handleCreateMerchant} className="space-y-3.5 text-xs">
                {/* Image Uploader for Company Logo or Individual Photo */}
                <ImageUploader
                  value={newLogo}
                  onChange={setNewLogo}
                  entityType={newEntityType}
                  onEntityTypeChange={setNewEntityType}
                  name={
                    newName ||
                    (newEntityType === 'individual'
                      ? t('个人专家', 'Specialist')
                      : t('商会企业', 'Enterprise'))
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#0F172A] font-medium mb-1">
                      {newEntityType === 'individual'
                        ? t('姓名 / 个人执业称号 *', 'Full Name / Practice Title *')
                        : t('企业中文全称 *', 'Company Name (Primary) *')}
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
                      placeholder={
                        newEntityType === 'individual'
                          ? t('例如：白政玮 (保险代理人)', 'e.g., Brandon Bai (Licensed Advisor)')
                          : t('例如：柏源金融 / BV Financial', 'e.g., BV Financial Inc.')
                      }
                      className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#0F172A] font-medium mb-1">
                      {newEntityType === 'individual'
                        ? t('英文名称 / Pinyin', 'English / Legal Name')
                        : t('英文注册全称', 'Registered English Name')}
                    </label>
                    <input
                      type="text"
                      value={newNameEn}
                      onChange={(e) => setNewNameEn(e.target.value)}
                      placeholder="e.g. Waterloo Smart Tech Inc."
                      className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#0F172A] font-medium mb-1">
                      {t('所属行业板块 *', 'Industry Sector *')}
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as BusinessCategory)}
                      className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                    >
                      {categories.filter((c) => c !== '全部').map((c) => (
                        <option key={c} value={c}>
                          {translateCategory(c, isEn)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#0F172A] font-medium mb-1">
                      {t('负责人姓名 / 代表 *', 'Principal / Managing Partner *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={newRepName}
                      onChange={(e) => setNewRepName(e.target.value)}
                      placeholder={t('如：张三 (CEO)', 'e.g., Alex Chen (CEO)')}
                      className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#0F172A] font-medium mb-1">
                      {t('联络电话', 'Phone Number')}
                    </label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+1 (519) ..."
                      className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#0F172A] font-medium mb-1">
                      {t('官方联系邮箱', 'Official Business Email')}
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="contact@company.ca"
                      className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#0F172A] font-medium mb-1 flex items-center justify-between">
                    <span>{t('企业官方网址链接', 'Official Website URL')}</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      {t('默认空白，商户自主选填', 'Optional')}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={newWebsite}
                    onChange={(e) => setNewWebsite(e.target.value)}
                    placeholder={t(
                      '例如：https://yourcompany.ca（留空则不显示任何预设网址）',
                      'e.g., https://yourcompany.ca (leave blank if none)'
                    )}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[#0F172A] font-medium mb-1">
                    {t('滑铁卢地区办公地址', 'Waterloo Region Office Address')}
                  </label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder={t('如：University Ave, Waterloo, ON', 'e.g., University Ave, Waterloo, ON')}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[#0F172A] font-medium mb-1">
                    {t('一句话业务亮点 / 标语', 'Executive Tagline / Value Proposition')}
                  </label>
                  <input
                    type="text"
                    value={newTagline}
                    onChange={(e) => setNewTagline(e.target.value)}
                    placeholder={t(
                      '如：多年MDRT会员，专职人寿保险经纪，投资代理人',
                      'e.g., MDRT Member · Licensed Life Insurance & Wealth Advisory'
                    )}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[#0F172A] font-medium mb-1 flex items-center justify-between">
                    <span>{t('主营核心业务与服务项目', 'Core Services & Offerings')}</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      {t('用逗号分隔，便于会员精确检索', 'Comma-separated for accurate search')}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={newServices}
                    onChange={(e) => setNewServices(e.target.value)}
                    placeholder={t(
                      '如：人寿保险, 重疾保险, 投资代理, 财富规划, 车险房险',
                      'e.g., Life Insurance, Critical Illness, Wealth Management, Estate Planning'
                    )}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[#0F172A] font-medium mb-1">
                    {t('检索关键词 / 商户标签 (用逗号分隔)', 'Search Keywords / Tags (comma-separated)')}
                  </label>
                  <input
                    type="text"
                    value={newTagsInput}
                    onChange={(e) => setNewTagsInput(e.target.value)}
                    placeholder={t(
                      '如：保险代理, 投资顾问, MDRT, 财富管理',
                      'e.g., Insurance Broker, Wealth Advisor, MDRT, Financial Planning'
                    )}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[#0F172A] font-medium mb-1">
                    {t('面向商会会员的专享福利 / 优惠权益', 'Exclusive WBCA Member Privilege')}
                  </label>
                  <input
                    type="text"
                    value={newPrivilege}
                    onChange={(e) => setNewPrivilege(e.target.value)}
                    placeholder={t(
                      '如：会员首次咨询免费，签约立享8.8折会友特惠',
                      'e.g., Complimentary initial consultation + 12% member discount'
                    )}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="pt-3 border-t border-[#E8E6DF] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-[#F7F7F5] hover:bg-[#EFECE4] text-slate-700 border border-[#E8E6DF] rounded-xl font-medium"
                  >
                    {t('取消', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 gold-gradient text-[#0F172A] font-bold rounded-xl shadow-md hover:opacity-95"
                  >
                    {t('提交入驻申请', 'Submit Application')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Submitted Confirmation Modal explaining Approval Process */}
      {showSubmittedConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/65 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-[#E8E6DF] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl text-center">
            <div className="bg-[#0F172A] px-6 py-5 border-b border-[#C5A059]/25 space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#C5A059]/15 border border-[#C5A059]/40 text-[#DFBA73] flex items-center justify-center mx-auto text-2xl">
                📋
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-editorial">
                  {t('入驻申请已成功提交至商会数据库！', 'Application Submitted to WBCA Registry!')}
                </h3>
                <p className="text-xs text-[#DFBA73] font-semibold">
                  {t(
                    `企业「${getLocalizedMerchantName(showSubmittedConfirmModal, false)}」已建档保全`,
                    `Enterprise "${getLocalizedMerchantName(showSubmittedConfirmModal, true)}" has been securely logged`
                  )}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 bg-white">
              <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E8E6DF] text-left text-xs space-y-2.5 text-slate-700">
                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-[11px] flex items-start gap-2">
                  <Mail className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold text-[#0F172A]">
                      {t('审核邮件已派发至管理员：', 'Review Notification Dispatched:')}
                    </span>
                    <div className="text-slate-600 mt-0.5">
                      {t(
                        '系统已自动生成《新商户入驻审批通报》，派发至商会管理员邮箱：',
                        'An automated New Enterprise Verification Notice has been dispatched to: '
                      )}
                      <strong className="text-[#9E7425] font-mono">baizw2000@gmail.com</strong>
                    </div>
                  </div>
                </div>

                <div className="font-bold text-[#0F172A] flex items-center gap-1.5 pt-1">
                  <Info className="w-4 h-4 text-[#C5A059]" />
                  {t('商会管理员审批流程：', 'Secretariat Approval Workflow:')}
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {isEn ? (
                    <>
                      1. <strong>Email Alert</strong>: The Secretariat receives your dossier with credentials and contact details.<br />
                      2. <strong>Fast Review</strong>: Administrators can click <strong>"Approve & Publish Now"</strong> below or review later in the console.<br />
                      3. <strong>Go Live</strong>: Once approved, your profile lights up across the directory and joins opportunity broadcasts.
                    </>
                  ) : (
                    <>
                      1. <strong>邮件提醒</strong>：商会秘书处管理员已收到申请通知邮件，内含企业资质与联络信息。<br />
                      2. <strong>快捷审批</strong>：您现在可直接点击下方<strong>「一键核准上线」</strong>完成审批测试，或在后台名录中随时处理。<br />
                      3. <strong>公示生效</strong>：审批核准后，商户立即在全网点亮，并能接收未来的商机全员通报！
                    </>
                  )}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={() => {
                    handleApprove(showSubmittedConfirmModal.id);
                    setShowSubmittedConfirmModal(null);
                  }}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {t('作为管理员直接一键核准上线', 'Approve & Publish Now (Admin)')}
                </button>
                <button
                  onClick={() => setShowSubmittedConfirmModal(null)}
                  className="w-full py-2.5 bg-[#F7F7F5] hover:bg-[#EFECE4] text-slate-700 border border-[#E8E6DF] rounded-xl text-xs font-medium"
                >
                  {t('稍后在管理后台审核', 'Review Later in Console')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Authentication Password Modal */}
      {showAdminAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/65 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-[#E8E6DF] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#C5A059]/25 bg-[#0F172A] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#C5A059]/15 text-[#DFBA73] border border-[#C5A059]/35">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-editorial">
                    {t('商会秘书处 · 管理员权限鉴权', 'WBCA Secretariat · Admin Authentication')}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {t('管理商户入驻申请与准入核验', 'Manage enterprise onboarding & compliance vetting')}
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
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 bg-white">
              <div className="p-3 rounded-xl bg-amber-50 border border-[#C5A059]/35 text-xs text-slate-700 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#0F172A]">
                    {t('受商会理事会保密权限管控：', 'Restricted to Authorized Council Officers:')}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {t(
                      '只有商会秘书长、轮值理事或授权审核员可进入后台进行商户资质审核与点亮上线。',
                      'Only the Secretary-General, Executive Directors, and designated reviewers may approve or manage member listings.'
                    )}
                  </p>
                </div>
              </div>

              {adminAuthError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="leading-snug">{adminAuthError}</div>
                </div>
              )}

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1.5">
                    {t('管理员账号 (Username)', 'Admin Username')}
                  </label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder={t('请输入管理员账号', 'Enter admin username')}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1.5">
                    {t('管理授权密码 (Password)', 'Admin Passcode')}
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder={t('请输入管理员密码', 'Enter admin passcode')}
                      required
                      autoFocus
                      className="w-full pl-3.5 pr-10 py-2.5 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-[#0F172A] p-0.5"
                      title={showAdminPassword ? t('隐藏密码', 'Hide passcode') : t('显示密码', 'Show passcode')}
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E8E6DF]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminAuthModal(false);
                      setAdminUsername('');
                      setAdminPassword('');
                      setAdminAuthError('');
                    }}
                    className="px-4 py-2.5 bg-[#F7F7F5] hover:bg-[#EFECE4] text-slate-700 border border-[#E8E6DF] rounded-xl text-xs font-medium transition-colors"
                  >
                    {t('取消', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 gold-gradient text-[#0F172A] font-bold rounded-xl text-xs shadow-md transition-opacity hover:opacity-95 flex items-center gap-1.5"
                  >
                    <KeyRound className="w-4 h-4" />
                    {t('验证并进入审批后台', 'Authenticate & Enter Console')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Admin Edit Merchant Modal */}
      {editingMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/65 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-[#E8E6DF] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-[#C5A059]/25 bg-[#0F172A] px-6 py-4 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-[#DFBA73]" />
                <div>
                  <h3 className="text-base font-bold text-white font-editorial">
                    {t('修改商户档案资料 (管理员工作台)', 'Edit Enterprise Profile (Admin Console)')}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {t(
                      `商户编号: ${editingMerchant.id} · 修改将实时保存至云端 Firestore 数据库`,
                      `Listing ID: ${editingMerchant.id} · Changes sync immediately to Firestore`
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingMerchant(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-3.5 text-xs overflow-y-auto flex-1 bg-white">
              {/* Image Uploader for Company Logo or Individual Photo */}
              <ImageUploader
                value={editLogo}
                onChange={setEditLogo}
                entityType={editEntityType}
                onEntityTypeChange={setEditEntityType}
                name={
                  editName ||
                  (editEntityType === 'individual'
                    ? t('个人专家', 'Specialist')
                    : t('商会企业', 'Enterprise'))
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {editEntityType === 'individual'
                      ? t('个人姓名 / 执业称号 *', 'Full Name / Practice Title *')
                      : t('企业中文全称 *', 'Company Name (Primary) *')}
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('英文注册全称', 'Registered English Name')}
                  </label>
                  <input
                    type="text"
                    value={editNameEn}
                    onChange={(e) => setEditNameEn(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('行业类别', 'Industry Sector')}
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as BusinessCategory)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                  >
                    {categories.filter((c) => c !== '全部').map((c) => (
                      <option key={c} value={c}>{translateCategory(c, isEn)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('商会等阶', 'Membership Tier')}
                  </label>
                  <select
                    value={editTier}
                    onChange={(e) => setEditTier(e.target.value as MemberTier)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="创会理事单位">{translateTier('创会理事单位', isEn)}</option>
                    <option value="金牌会员单位">{translateTier('金牌会员单位', isEn)}</option>
                    <option value="认证商户">{translateTier('认证商户', isEn)}</option>
                    <option value="青年创客商户">{translateTier('青年创客商户', isEn)}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('法定代表 / 主理人 *', 'Principal / Managing Partner *')}
                  </label>
                  <input
                    type="text"
                    value={editRepName}
                    onChange={(e) => setEditRepName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('代表职务', 'Executive Title')}
                  </label>
                  <input
                    type="text"
                    value={editRepTitle}
                    onChange={(e) => setEditRepTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('联系电话', 'Phone Number')}
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('公函邮箱', 'Official Email')}
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#0F172A] font-semibold mb-1 flex items-center justify-between">
                  <span>{t('企业官方网址链接', 'Official Website URL')}</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {t('支持留空以不展示任何预设网址', 'Leave blank to hide website link')}
                  </span>
                </label>
                <input
                  type="text"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  placeholder={t(
                    '例如：https://yourdomain.ca（留空则不显示网址）',
                    'e.g., https://yourdomain.ca (leave blank if none)'
                  )}
                  className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#C5A059] font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[#0F172A] font-semibold mb-1">
                  {t('滑铁卢办公地址', 'Waterloo Office Address')}
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[#0F172A] font-semibold mb-1">
                  {t('业务标语 / 亮点', 'Executive Tagline')}
                </label>
                <input
                  type="text"
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[#0F172A] font-semibold mb-1">
                  {t('主营业务与服务项目 (用逗号分隔)', 'Core Services & Offerings (comma-separated)')}
                </label>
                <input
                  type="text"
                  value={editServices}
                  onChange={(e) => setEditServices(e.target.value)}
                  placeholder={t(
                    '例如：人寿保险, 重疾保险, 投资理财, 旅游保险',
                    'e.g., Life Insurance, Critical Illness, Wealth Advisory, Travel Insurance'
                  )}
                  className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[#0F172A] font-semibold mb-1">
                  {t('商户标签与检索关键词 (用逗号分隔)', 'Tags & Search Keywords (comma-separated)')}
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder={t(
                    '例如：MDRT专职经纪, 人寿保险代理, 金融投资',
                    'e.g., MDRT Advisor, Life Insurance, Wealth Management'
                  )}
                  className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[#0F172A] font-semibold mb-1">
                  {t('企业背景与核心业务介绍', 'Corporate Overview & Background')}
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#C5A059] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[#0F172A] font-semibold mb-1">
                  {t('会员专享福利 / 特权待遇', 'Exclusive Member Privilege')}
                </label>
                <input
                  type="text"
                  value={editMemberPrivilege}
                  onChange={(e) => setEditMemberPrivilege(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[#0F172A] font-semibold mb-1 flex items-center justify-between">
                  <span>{t('商誉评分 (0-100)', 'Trust Credibility Score (0-100)')}</span>
                  <span className="text-[#9E7425] font-mono font-bold">
                    {editCredibilityScore} {t('分', 'pts')}
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editCredibilityScore}
                  onChange={(e) => setEditCredibilityScore(Number(e.target.value))}
                  className="w-full accent-[#C5A059]"
                />
              </div>

              <div className="pt-3 border-t border-[#E8E6DF] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingMerchant(null)}
                  className="px-4 py-2 bg-[#F7F7F5] hover:bg-[#EFECE4] text-slate-700 border border-[#E8E6DF] rounded-xl font-medium"
                >
                  {t('取消', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 gold-gradient text-[#0F172A] font-bold rounded-xl shadow-md hover:opacity-95"
                >
                  {t('保存修改并同步云端', 'Save & Sync to Cloud')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Delist / Suspend Modal */}
      {delistingMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/65 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-rose-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="flex items-center gap-3 border-b border-rose-200/40 bg-[#0F172A] px-6 py-4">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/30">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-editorial">
                  {t('商企下架处置 · 负面舆情风控', 'Delist Enterprise · Compliance Control')}
                </h3>
                <p className="text-[11px] text-slate-300">
                  {t('商会公信与纪律委员会强制管控', 'Enforced by WBCA Ethics & Compliance Committee')}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 bg-white">
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-1.5 text-rose-900">
                <div className="font-bold text-rose-800 flex items-center gap-1.5">
                  <FileWarning className="w-4 h-4 text-rose-600" />
                  {t('正在下架处置企业：', 'Target Enterprise for Delisting:')}
                </div>
                <p className="text-[#0F172A] text-sm font-semibold">
                  {getLocalizedMerchantName(delistingMerchant, isEn)}{' '}
                  {getLocalizedMerchantSecondaryName(delistingMerchant, isEn) &&
                    `(${getLocalizedMerchantSecondaryName(delistingMerchant, isEn)})`}
                </p>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  {isEn ? (
                    <>
                      Upon delisting, this enterprise will be <strong>immediately hidden from all members and public directories</strong>, with privilege endorsements suspended.
                    </>
                  ) : (
                    <>
                      下架后，该商户将<strong>立即对所有普通会员及外部公开名录隐藏</strong>，并关闭其会员特权推荐通道，彻底切断负面波及效应。
                    </>
                  )}
                </p>
              </div>

              <form onSubmit={handleConfirmDelist} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('选择或填写处置下架原因 *', 'Select or Enter Delisting Reason *')}
                  </label>
                  <div className="space-y-1.5 mb-2">
                    {[
                      t(
                        '会员实名投诉：未兑现商会专享优惠或存在虚假承诺',
                        'Verified member complaint: Unfulfilled member privileges or misrepresentation'
                      ),
                      t(
                        '信用与纠纷预警：发生重大民商事纠纷或被列入失信名单',
                        'Credit & dispute alert: Material commercial dispute or default notice'
                      ),
                      t(
                        '负面舆情管控：在各大社交与评价平台出现大规模负面舆情',
                        'Reputation risk control: Widespread negative feedback across public platforms'
                      ),
                      t(
                        '经营异常：滑铁卢本地经营实体已撤离或执照已失效',
                        'Operational anomaly: Local Ontario entity dissolved or license expired'
                      ),
                    ].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setDelistReasonInput(preset)}
                        className={`w-full text-left p-2 rounded-lg text-[11px] border transition-colors ${
                          delistReasonInput === preset
                            ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                            : 'bg-[#F7F7F5] border-[#E8E6DF] text-slate-700 hover:border-[#C5A059]/60'
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
                    placeholder={t('详细下架处置原因备案...', 'Detailed compliance record for delisting...')}
                    required
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-rose-400 text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E8E6DF]">
                  <button
                    type="button"
                    onClick={() => setDelistingMerchant(null)}
                    className="px-4 py-2 bg-[#F7F7F5] hover:bg-[#EFECE4] text-slate-700 border border-[#E8E6DF] rounded-xl font-medium"
                  >
                    {t('取消', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    <Ban className="w-4 h-4" />
                    {t('确认执行下架屏蔽', 'Confirm Delisting')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Admin Delete Confirmation Modal */}
      {deletingMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/65 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-rose-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto text-2xl">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0F172A] font-editorial">
                {t('彻底永久删除商企档案？', 'Permanently Delete Enterprise Record?')}
              </h3>
              <p className="text-sm text-rose-700 font-semibold">
                {t(
                  `【${getLocalizedMerchantName(deletingMerchant, false)}】`,
                  `[${getLocalizedMerchantName(deletingMerchant, true)}]`
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F7F5] border border-rose-200 text-left text-xs space-y-1.5 text-slate-700">
              <p className="text-rose-700 font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-rose-600" />{' '}
                {t('严重危险操作：', 'Irreversible Action:')}
              </p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {isEn ? (
                  <>
                    This will <strong>permanently erase</strong> the enterprise’s profile, audit history, and reviews from Firestore. This action cannot be undone.
                  </>
                ) : (
                  <>
                    此操作将从商会 Firestore 云端数据库中<strong>永久彻底抹除</strong>该商户的注册信息、审核记录及历史评价。此过程无法撤回或恢复！
                  </>
                )}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingMerchant(null)}
                className="w-full py-2.5 bg-[#F7F7F5] hover:bg-[#EFECE4] text-slate-700 border border-[#E8E6DF] rounded-xl text-xs font-semibold"
              >
                {t('取消保留', 'Keep Record')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                {t('确认彻底删除', 'Confirm Permanent Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Email Notification Hub Modal */}
      {showEmailHubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F172A]/65 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-[#E8E6DF] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#C5A059]/25 flex items-center justify-between bg-[#0F172A] text-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#C5A059]/15 text-[#DFBA73] border border-[#C5A059]/35">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-editorial text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    {t('商会邮件通知中枢 & 自动发信台', 'WBCA Mail Hub & Automated Dispatch Center')}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-300">
                    {t(
                      '管理管理员审批接收邮箱 · 查阅全商会商户广播池 · 发件箱回溯',
                      'Manage admin alert recipients · Inspect member broadcast pool · Review outbox logs'
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailHubModal(false)}
                className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs flex-1 bg-white text-[#0F172A]">
              {emailSaveMessage && (
                <div className="p-3 rounded-xl bg-[#FDFBF5] border border-[#C5A059]/45 text-[#0F172A] text-xs animate-in fade-in flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#9E7425] flex-shrink-0" />
                  <span className="font-medium">{emailSaveMessage}</span>
                </div>
              )}

              {/* Section 0: SMTP Central Cloud Database Configuration */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F7F5] border border-[#E8E6DF] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E6DF] pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-[#0F172A] text-[#DFBA73] border border-[#C5A059]/35">
                        <Database className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm font-bold text-[#0F172A] flex flex-wrap items-center gap-2">
                        {t('商会发信邮局 (SMTP) 云端中央数据库配置', 'Alliance SMTP Gateway Cloud Configuration')}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                          Firestore system_config/smtp
                        </span>
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      {t(
                        '此配置直接保存在 Google Cloud Firestore 云端数据库中，全平台实时生效，无需改写代码文件或重启服务器。',
                        'Persisted in Google Cloud Firestore and active platform-wide in real time without code edits or restarts.'
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                        isSmtpConfigured
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          : 'bg-[#FDFBF5] border border-[#C5A059]/40 text-[#9E7425]'
                      }`}
                    >
                      {isSmtpConfigured ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          {t('已接入官方发信服务', 'Official Mailer Active')}
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-[#9E7425]" />
                          {t('待填入授权码激活', 'Awaiting Credentials')}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSaveSmtpConfig} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                        <Server className="w-3.5 h-3.5 text-[#9E7425]" />
                        {t('SMTP 邮件服务器地址 *', 'SMTP Hostname *')}
                      </label>
                      <input
                        type="text"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        placeholder={t(
                          '如 smtp.gmail.com 或 mail.waterloobusiness.ca',
                          'e.g., smtp.gmail.com or mail.waterloobusiness.ca'
                        )}
                        required
                        className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">
                        {t('端口 (Port) *', 'Port *')}
                      </label>
                      <input
                        type="number"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(Number(e.target.value))}
                        placeholder={t('465 或 587', '465 or 587')}
                        required
                        className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] text-xs font-mono"
                      />
                      <span className="text-[10px] text-slate-500">465 (SSL) / 587 (TLS)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-[#9E7425]" />
                        {t('商会发信邮箱账号 (用户名) *', 'SMTP Username (Sender Email) *')}
                      </label>
                      <input
                        type="email"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        placeholder={t('如 weba.chamber@gmail.com', 'e.g., weba.chamber@gmail.com')}
                        required
                        className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                          <KeyRound className="w-3.5 h-3.5 text-[#9E7425]" />
                          {t('邮箱授权码 / 应用专用密码 *', 'App Password / Auth Token *')}
                        </label>
                        {hasSmtpPass && (
                          <span className="text-[10px] text-emerald-700 font-semibold font-sans">
                            {t('✓ 云端已有保存凭证', '✓ Credential saved in cloud')}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showSmtpPass ? 'text' : 'password'}
                          value={smtpPass}
                          onChange={(e) => setSmtpPass(e.target.value)}
                          placeholder={
                            hasSmtpPass
                              ? t('•••••••••••••••• (已保存，若需更改直接输入新密码)', '•••••••••••••••• (Saved — enter new value to rotate)')
                              : t('输入16位应用授权码 (App Password)', 'Enter 16-character App Password')
                          }
                          className="w-full px-3 py-2 pr-10 bg-white border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSmtpPass(!showSmtpPass)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A]"
                        >
                          {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      {t('发件人对外显示名称 (Sender Name)', 'Display Sender Name')}
                    </label>
                    <input
                      type="text"
                      value={smtpFrom}
                      onChange={(e) => setSmtpFrom(e.target.value)}
                      placeholder={t(
                        '如 WBCA 滑铁卢融商汇秘书处 <weba.chamber@gmail.com>',
                        'e.g., WBCA Secretariat <weba.chamber@gmail.com>'
                      )}
                      className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] text-xs"
                    />
                  </div>

                  {/* Actions & Live Test */}
                  <div className="pt-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-[#E8E6DF]">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="submit"
                        disabled={savingSmtp}
                        className="px-4 py-2 gold-gradient text-[#0F172A] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 disabled:opacity-50"
                      >
                        {savingSmtp ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            {t('正在保存至 Firestore...', 'Saving to Firestore...')}
                          </>
                        ) : (
                          <>
                            <Database className="w-3.5 h-3.5" />
                            {t('保存配置至中央云端数据库', 'Save Config to Cloud DB')}
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleTestSmtpConnection}
                        disabled={testingSmtp || (!smtpUser && !isSmtpConfigured)}
                        className="px-3.5 py-2 bg-white hover:bg-[#EFECE4] text-[#0F172A] font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-[#E8E6DF] disabled:opacity-40 transition-colors"
                        title={t('向主管理员邮箱发送真实测试邮件验证配置', 'Send a live test email to verify SMTP delivery')}
                      >
                        {testingSmtp ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#9E7425]" />
                            {t('正在与邮箱服务器联通测试...', 'Testing SMTP connection...')}
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-[#9E7425]" />
                            {t('一键发送测试邮件至管理员', 'Send Test Email to Admin')}
                          </>
                        )}
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-500 sm:text-right">
                      {t('测试接收人: ', 'Test Recipient: ')}
                      <strong className="text-[#9E7425] font-mono">{adminEmails[0] || 'baizw2000@gmail.com'}</strong>
                    </span>
                  </div>
                </form>

                {/* SMTP Test Result Banner */}
                {smtpTestResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs animate-in fade-in flex items-start gap-2.5 ${
                      smtpTestResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {smtpTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="font-semibold">{smtpTestResult.message}</p>
                    </div>
                  </div>
                )}

                {/* Helpful instructions tip */}
                <div className="p-3 rounded-xl bg-white border border-[#E8E6DF] text-[11px] text-slate-600 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#9E7425] font-semibold">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>
                      {t(
                        '💡 如何为商会配置发信邮箱 (以 Gmail 为例，1分钟即可完成)：',
                        '💡 Quick Guide: Configure Alliance Mail Dispatch (e.g., Gmail in 1 minute):'
                      )}
                    </span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                    {isEn ? (
                      <>
                        <li>Visit your Google Account settings (<code className="text-[#0F172A] font-mono">myaccount.google.com</code>) and enable <strong>2-Step Verification</strong>.</li>
                        <li>Search for and open <strong>App Passwords</strong>.</li>
                        <li>Enter app name <code className="text-[#0F172A] font-mono">WBCA Portal</code> to generate a 16-character password (e.g., <code className="text-[#0F172A] font-mono">abcd efgh ijkl mnop</code>).</li>
                        <li>Enter your sender email above, paste the 16-character App Password, and click <strong>"Save Config to Cloud DB"</strong>.</li>
                      </>
                    ) : (
                      <>
                        <li>访问您的 Google 账号设置中心 (<code className="text-[#0F172A] font-mono">myaccount.google.com</code>) 并开启【两步验证】。</li>
                        <li>在搜索框搜索并进入【应用专用密码 (App Passwords)】。</li>
                        <li>应用名称输入「滑铁卢融商汇」，系统将生成 16 位专属密码（如 <code className="text-[#0F172A] font-mono">abcd efgh ijkl mnop</code>）。</li>
                        <li>将发信账号填入上方，粘贴 16 位密码，点击「保存配置至中央云端数据库」即可！</li>
                      </>
                    )}
                  </ol>
                </div>
              </div>

              {/* Section 1: Admin Notification Recipients */}
              <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E8E6DF] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-[#9E7425]" />
                      {t('商会管理员审批接收邮箱 (新商户申请通知)', 'Admin Review Alert Recipients (New Listing Notices)')}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {t(
                        '每当有新商户提交入驻申请时，系统将即时向以下管理员邮箱派发《新商户入驻待审批申报单》。',
                        'Whenever an enterprise submits a listing application, an automated verification dossier is dispatched to these recipients.'
                      )}
                    </p>
                  </div>
                </div>

                {/* Current Admin Email Tags */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {adminEmails.map((email) => (
                    <div
                      key={email}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#C5A059]/45 text-[#0F172A] text-xs font-mono"
                    >
                      <span>{email}</span>
                      {email === 'baizw2000@gmail.com' && (
                        <span className="text-[10px] bg-[#FDFBF5] border border-[#C5A059]/35 text-[#9E7425] px-1.5 py-0.5 rounded-md font-sans font-semibold">
                          {t('主管理员', 'Primary Admin')}
                        </span>
                      )}
                      {adminEmails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAdminEmail(email)}
                          className="text-slate-400 hover:text-rose-600 ml-1 p-0.5"
                          title={t('移除该管理员通知邮箱', 'Remove recipient email')}
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
                    placeholder={t(
                      '输入需要同步接收审批提醒的其他管理员邮箱 (如 admin2@gmail.com)...',
                      'Add another administrator email for review alerts (e.g., admin2@gmail.com)...'
                    )}
                    className="flex-1 px-3 py-2 bg-white border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 gold-gradient text-[#0F172A] font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm hover:opacity-95 whitespace-nowrap"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    {t('添加管理员邮箱', 'Add Admin Email')}
                  </button>
                </form>
              </div>

              {/* Section 2: All Merchant Broadcast Target Pool */}
              <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E8E6DF] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#9E7425]" />
                      {t(
                        `商会商机通报全员广播邮箱池 (共 ${merchants.filter((m) => m.email).length} 家企业已登记)`,
                        `Network-Wide Broadcast Pool (${merchants.filter((m) => m.email).length} Registered Enterprises)`
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {t(
                        '会员在【商机互助中心】发布新供需合作时，系统将自动向名录中所有商户以密送 (BCC) 发送通报，全员直达且保障商业隐私。',
                        'New posts in the Opportunity Hub trigger automated BCC email dispatches to all verified members while protecting commercial privacy.'
                      )}
                    </p>
                  </div>
                  <a
                    href={`mailto:?bcc=${merchants
                      .map((m) => m.email)
                      .filter(Boolean)
                      .join(',')}&subject=${encodeURIComponent(
                      t('【滑铁卢融商汇】商机互助直达通报', '[WBCA] Business Opportunity Broadcast')
                    )}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-[#DFBA73] border border-[#C5A059]/30 rounded-xl text-xs font-semibold self-start sm:self-auto transition-colors"
                    title={t('在本地默认邮件客户端中打开群发窗口', 'Open bulk draft in your default mail client')}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {t('客户端一键群发 (BCC)', 'Open Mail Client (BCC)')}
                  </a>
                </div>

                <div className="max-h-40 overflow-y-auto border border-[#E8E6DF] rounded-xl divide-y divide-[#E8E6DF] bg-white">
                  {merchants
                    .filter((m) => m.email)
                    .map((m) => (
                      <div key={m.id} className="p-2.5 flex items-center justify-between text-xs bg-white hover:bg-[#F7F7F5] transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#0F172A]">{getLocalizedMerchantName(m, isEn)}</span>
                          <span className="text-[10px] text-slate-500 font-sans">({m.repName})</span>
                        </div>
                        <span className="text-[#9E7425] font-mono text-[11px]">{m.email}</span>
                      </div>
                    ))}
                  {merchants.filter((m) => m.email).length === 0 && (
                    <div className="p-4 text-center text-slate-500 text-xs">
                      {t('当前暂无有效商户登记邮箱', 'No registered enterprise email addresses yet')}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Outbox Delivery Logs */}
              <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E8E6DF] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                      <Inbox className="w-4 h-4 text-emerald-700" />
                      {t(`邮件发件箱日志与发送记录 (${emailLogs.length} 条)`, `Outbox & Dispatch History (${emailLogs.length})`)}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {t(
                        '记录所有系统自动派发的新商户入驻审批通知和商机互助广播。',
                        'Audit trail of automated listing review alerts and member opportunity broadcasts.'
                      )}
                    </p>
                  </div>
                  <button
                    onClick={handleRefreshEmailLogs}
                    className="px-2.5 py-1.5 bg-white border border-[#E8E6DF] text-slate-700 hover:text-[#0F172A] rounded-lg hover:bg-[#EFECE4] transition-colors flex items-center gap-1 text-xs font-medium"
                    title={t('刷新日志', 'Refresh logs')}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingEmailLogs ? 'animate-spin text-[#9E7425]' : ''}`} />
                    <span>{t('刷新', 'Refresh')}</span>
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto border border-[#E8E6DF] rounded-xl divide-y divide-[#E8E6DF] bg-white">
                  {emailLogs.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      {t(
                        '暂无邮件发送记录。当有新商户提交申请或发布商机互助时，日志将实时在此汇聚。',
                        'No dispatch logs yet. Automated application alerts and opportunity broadcasts will appear here.'
                      )}
                    </div>
                  ) : (
                    emailLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-white hover:bg-[#F7F7F5] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                log.type === 'MERCHANT_APPLICATION'
                                  ? 'bg-[#FDFBF5] text-[#9E7425] border border-[#C5A059]/40'
                                  : 'bg-sky-50 text-sky-800 border border-sky-200'
                              }`}
                            >
                              {log.type === 'MERCHANT_APPLICATION'
                                ? t('商户申请审批', 'Application Alert')
                                : t('商机全员广播', 'Network Broadcast')}
                            </span>
                            <span className="font-semibold text-[#0F172A] text-xs">{log.subject}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3">
                            <span>
                              {t('收件人数:', 'Recipients:')} <strong className="text-[#0F172A]">{log.recipientCount}</strong>
                            </span>
                            <span>
                              {t('时间:', 'Sent:')}{' '}
                              <strong className="text-slate-700">
                                {new Date(log.sentAt).toLocaleString(isEn ? 'en-CA' : 'zh-CN')}
                              </strong>
                            </span>
                            <span className="text-emerald-700 flex items-center gap-1 font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              {log.deliveryNote || t('已处理', 'Dispatched')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => setEmailPreviewItem(log)}
                            className="px-2.5 py-1 bg-[#F7F7F5] hover:bg-[#EFECE4] border border-[#E8E6DF] text-slate-700 hover:text-[#0F172A] rounded-lg text-xs font-medium transition-colors"
                          >
                            {t('预览邮件原文', 'Preview HTML')}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E8E6DF] flex items-center justify-end bg-[#F7F7F5]">
              <button
                type="button"
                onClick={() => setShowEmailHubModal(false)}
                className="px-5 py-2 bg-white hover:bg-[#EFECE4] border border-[#E8E6DF] text-[#0F172A] rounded-xl text-xs font-semibold transition-colors"
              >
                {t('关闭', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email HTML Preview Modal */}
      {emailPreviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-[#E8E6DF] rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#C5A059]/25 flex items-center justify-between bg-[#0F172A] text-white">
              <div>
                <h4 className="font-editorial text-sm font-bold text-white">
                  {t('邮件原文预览 (WBCA HTML Template)', 'Email Source Preview (WBCA HTML Template)')}
                </h4>
                <p className="text-[11px] text-slate-300">{emailPreviewItem.subject}</p>
              </div>
              <button
                onClick={() => setEmailPreviewItem(null)}
                className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-[#F7F7F5]">
              <div
                className="rounded-2xl overflow-hidden border border-[#E8E6DF] bg-white"
                dangerouslySetInnerHTML={{ __html: emailPreviewItem.htmlContent }}
              />
            </div>

            <div className="p-3.5 border-t border-[#E8E6DF] flex items-center justify-between bg-[#F7F7F5] text-xs">
              <span className="text-slate-600 text-[11px] truncate max-w-[75%]">
                {t('收件人列表:', 'Recipients:')} {emailPreviewItem.recipients.join(', ')}
              </span>
              <button
                onClick={() => setEmailPreviewItem(null)}
                className="px-4 py-1.5 bg-white hover:bg-[#EFECE4] border border-[#E8E6DF] text-[#0F172A] font-semibold rounded-xl transition-colors"
              >
                {t('返回', 'Back')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
