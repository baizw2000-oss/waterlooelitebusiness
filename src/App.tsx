import React, { useState, useEffect, useRef } from 'react';
import { 
  TabType, 
  Merchant, 
  HelpPost, 
  ChamberEvent, 
  RewardItem, 
  LeaderboardUser, 
  PointsTransaction,
  BusinessCategory,
  UserProfile 
} from './types';
import { 
  INITIAL_MERCHANTS, 
  INITIAL_HELP_POSTS, 
  INITIAL_EVENTS, 
  INITIAL_REWARD_ITEMS, 
  INITIAL_LEADERBOARD, 
  INITIAL_TRANSACTIONS 
} from './data/mockData';
import { 
  seedFirestoreIfEmpty, 
  subscribeMerchants, 
  fetchMerchantById,
  subscribeHelpPosts, 
  subscribeEvents, 
  addMerchantToFirestore, 
  approveMerchantInFirestore,
  rejectMerchantInFirestore,
  updateMerchantInFirestore,
  delistMerchantInFirestore,
  relistMerchantInFirestore,
  deleteMerchantFromFirestore,
  addHelpPostToFirestore, 
  updateHelpPostInFirestore,
  deleteHelpPostFromFirestore,
  delistHelpPostInFirestore,
  relistHelpPostInFirestore,
  addOfferToHelpPost, 
  acceptOfferInFirestore, 
  addEventToFirestore,
  deleteEventFromFirestore,
  rsvpEventInFirestore, 
  checkInEventInFirestore, 
  saveUserProfileToFirestore, 
  fetchUserProfileFromFirestore, 
  addPointsTransactionToFirestore 
} from './services/firestoreService';
import { testFirestoreConnection, auth } from './services/firebase';
import { 
  sendMerchantApplicationNotification, 
  sendChamberOpportunityNotification,
  sendOpportunityPendingAdminNotification
} from './services/notificationService';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { BrandHero } from './components/BrandHero';
import { MerchantDirectory } from './components/MerchantDirectory';
import { MerchantDetailModal } from './components/MerchantDetailModal';
import { MutualHelpHub } from './components/MutualHelpHub';
import { EventsHub } from './components/EventsHub';
import { PointsCenter } from './components/PointsCenter';
import { AIReputationModal } from './components/AIReputationModal';
import { AISmartMatchModal } from './components/AISmartMatchModal';
import { UserProfileCenter } from './components/UserProfileCenter';
import { MemberLoginModal } from './components/MemberLoginModal';
import { MembershipPrivilegeMatrix } from './components/MembershipPrivilegeMatrix';
import confetti from 'canvas-confetti';
import { useLanguage } from './i18n/LanguageContext';
import {
  getLocalizedMerchantName,
  translateCategory,
  translateUserField,
} from './i18n/domainTranslations';

const INITIAL_USER_PROFILE: UserProfile = {
  uid: 'weba-member-real-001',
  name: 'Brandon Bai (白政玮)',
  email: 'baizw2000@gmail.com',
  company: 'BV Financial',
  title: '企业创始人 / 投资顾问',
  phone: '12268089558',
  avatar: '👨‍💼',
  tier: '认证商户',
  points: 100,
  bio: '扎根滑铁卢地区，诚信经营，致力为本地社区及华商业界提供高品质专业金融投资与商业咨询服务。',
  industry: '金融投资',
  joinedDate: '2025年 真实测试会员',
  isMember: true,
  merchantId: 1,
  hasCheckedInToday: false,
  wechatId: '',
  address: 'Waterloo and Toronto',
  registeredEventIds: [],
  checkedInEventIds: [],
};

const GUEST_USER_PROFILE: UserProfile = {
  uid: 'guest-visitor',
  name: '外部商业访客',
  email: '',
  company: '待认证企业 / 潜在客户',
  title: '商业访客',
  phone: '',
  avatar: '👤',
  tier: '外部客户',
  points: 0,
  bio: '欢迎访问滑铁卢融商汇官网，您可浏览企业名录、商机信息并报名公开商务活动。',
  industry: '商务咨询',
  joinedDate: '外部访客视角',
  isMember: false,
  hasCheckedInToday: false,
  wechatId: '',
  address: 'Waterloo, ON',
  registeredEventIds: [],
  checkedInEventIds: [],
};

export default function App() {
  const { isEn, t } = useLanguage();
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // App Data States (Synced with Firestore - Clean baseline for real testing)
  const [merchants, setMerchants] = useState<Merchant[]>(INITIAL_MERCHANTS);
  const [posts, setPosts] = useState<HelpPost[]>(INITIAL_HELP_POSTS);
  const [events, setEvents] = useState<ChamberEvent[]>(INITIAL_EVENTS);
  const [rewardItems, setRewardItems] = useState<RewardItem[]>(INITIAL_REWARD_ITEMS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER_PROFILE);

  // Search & Filter state for Directory
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory>('全部');

  // Modals
  const [selectedMerchantForDetail, setSelectedMerchantForDetail] = useState<Merchant | null>(null);
  const [selectedMerchantForAI, setSelectedMerchantForAI] = useState<Merchant | null>(null);
  const [isSmartMatchOpen, setIsSmartMatchOpen] = useState<boolean>(false);
  const [prefillMerchantForHelp, setPrefillMerchantForHelp] = useState<Merchant | null>(null);
  const [ticketModalEvent, setTicketModalEvent] = useState<ChamberEvent | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [isPrivilegeMatrixModalOpen, setIsPrivilegeMatrixModalOpen] = useState<boolean>(false);

  // 1. Initial Firestore Setup & Real-time Subscriptions
  useEffect(() => {
    testFirestoreConnection();
    seedFirestoreIfEmpty();

    const unsubMerchants = subscribeMerchants((data) => {
      setMerchants(data || []);
    });

    const unsubPosts = subscribeHelpPosts((data) => {
      setPosts(data || []);
    });

    const unsubEvents = subscribeEvents((data) => {
      setEvents(data || []);
    });

    // Restore member session or load initial user profile
    try {
      const savedSession = localStorage.getItem('weba_member_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.company?.startsWith('data:') || parsed.company?.length > 80) parsed.company = 'BV Financial';
        if (parsed.name?.startsWith('data:') || parsed.name?.length > 80) parsed.name = 'Brandon Bai (白政玮)';
        setUser(parsed);
      } else {
        fetchUserProfileFromFirestore(INITIAL_USER_PROFILE.uid).then((saved) => {
          if (saved) {
            const clean = { ...saved };
            if (clean.company?.startsWith('data:') || clean.company?.length > 80) clean.company = 'BV Financial';
            if (clean.name?.startsWith('data:') || clean.name?.length > 80) clean.name = 'Brandon Bai (白政玮)';
            setUser(clean);
          } else {
            saveUserProfileToFirestore(INITIAL_USER_PROFILE);
          }
        });
      }
    } catch (e) {}

    return () => {
      unsubMerchants();
      unsubPosts();
      unsubEvents();
    };
  }, []);

  // Deep-linking tracking refs to prevent race condition on initial render
  const initialDeepLinkMerchantIdRef = useRef<string | null>(null);
  const deepLinkResolvedRef = useRef<boolean>(false);
  const detailModalWasOpenRef = useRef<boolean>(false);

  // 1b. Capture ?merchant=ID parameter immediately on initial mount & execute direct fetch
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const merchantId = params.get('merchant');
      if (merchantId) {
        initialDeepLinkMerchantIdRef.current = merchantId;

        // Perform instant targeted lookup without waiting for bulk subscription
        fetchMerchantById(merchantId)
          .then((found) => {
            if (found && !deepLinkResolvedRef.current) {
              deepLinkResolvedRef.current = true;
              setSelectedMerchantForDetail(found);
              document.title = `${getLocalizedMerchantName(found, isEn)} (${translateCategory(found.category, isEn)}) | ${t('滑铁卢融商汇企业认证档案', 'WBCA Verified Corporate Profile')}`;
              // Ensure this merchant is in the merchants state for consistent UI navigation
              setMerchants((prev) => {
                if (prev.some((m) => String(m.id) === String(found.id))) return prev;
                return [found, ...prev];
              });
            }
          })
          .catch((err) => {
            console.warn('[DeepLink] Direct fetch for merchantId failed:', err);
          });
      }
    } catch (e) {}
  }, []);

  // 1c. Complementary fallback: match against merchants list as soon as Firestore subscription loads
  useEffect(() => {
    const targetId = initialDeepLinkMerchantIdRef.current;
    if (!targetId || deepLinkResolvedRef.current) return;

    if (merchants.length > 0) {
      const found = merchants.find((m) => String(m.id) === String(targetId));
      if (found) {
        deepLinkResolvedRef.current = true;
        setSelectedMerchantForDetail(found);
        document.title = `${getLocalizedMerchantName(found, isEn)} (${translateCategory(found.category, isEn)}) | ${t('滑铁卢融商汇企业认证档案', 'WBCA Verified Corporate Profile')}`;
      }
    }
  }, [merchants]);

  // Sync document title and canonical URL parameter when merchant modal opens/closes or language switches
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      if (selectedMerchantForDetail) {
        detailModalWasOpenRef.current = true;
        const mName = getLocalizedMerchantName(selectedMerchantForDetail, isEn);
        const mCat = translateCategory(selectedMerchantForDetail.category, isEn);
        document.title = `${mName} (${mCat}) | ${t('滑铁卢融商汇企业认证档案', 'WBCA Verified Corporate Profile')}`;
        url.searchParams.set('merchant', String(selectedMerchantForDetail.id));
        window.history.replaceState({}, '', url.toString());
      } else {
        document.title = isEn
          ? 'Waterloo Business Convergence Alliance (WBCA) | Official Executive Portal'
          : 'Waterloo Business Convergence Alliance | 滑铁卢融商汇';
        if (detailModalWasOpenRef.current) {
          if (url.searchParams.has('merchant')) {
            url.searchParams.delete('merchant');
            window.history.replaceState({}, '', url.toString());
          }
        }
      }
    } catch (e) {}
  }, [selectedMerchantForDetail, isEn, t]);

  // 2. Daily Check-in Handler
  const handleCheckIn = () => {
    if (user.hasCheckedInToday) return;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    const newPoints = user.points + 10;
    const updatedUser = {
      ...user,
      points: newPoints,
      hasCheckedInToday: true,
      lastCheckinDate: new Date().toISOString().split('T')[0],
    };
    setUser(updatedUser);
    saveUserProfileToFirestore(updatedUser);

    const newTx: PointsTransaction = {
      id: `tx-${Date.now()}`,
      userId: user.uid,
      title: '每日名商打卡签到成功',
      change: 10,
      date: '刚刚',
      type: 'CHECKIN',
    };
    setTransactions((prev) => [newTx, ...prev]);
    addPointsTransactionToFirestore(newTx);
  };

  // 3. Event RSVP Handler
  const handleRegisterEvent = (eventId: string | number) => {
    setEvents((prev) =>
      prev.map((e) =>
        String(e.id) === String(eventId)
          ? {
              ...e,
              isRegistered: true,
              registeredCount: e.registeredCount + 1,
            }
          : e
      )
    );

    const updatedUser = {
      ...user,
      registeredEventIds: [...(user.registeredEventIds || []), eventId],
    };
    setUser(updatedUser);
    rsvpEventInFirestore(eventId, updatedUser);
  };

  // 4. Event Check-in Handler
  const handleCheckInEvent = (eventId: string | number, pointsReward: number) => {
    setEvents((prev) =>
      prev.map((e) =>
        String(e.id) === String(eventId) ? { ...e, checkedIn: true } : e
      )
    );

    const newPoints = user.points + pointsReward;
    const updatedUser = {
      ...user,
      points: newPoints,
      checkedInEventIds: [...(user.checkedInEventIds || []), eventId],
    };
    setUser(updatedUser);
    checkInEventInFirestore(eventId, updatedUser, pointsReward);

    const newTx: PointsTransaction = {
      id: `tx-${Date.now()}`,
      userId: user.uid,
      title: '出席线下峰会/沙龙现场核销打卡',
      change: pointsReward,
      date: '刚刚',
      type: 'EVENT_ATTEND',
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // 5. Add Merchant Handler
  const handleAddNewMerchant = (newMerchant: Merchant) => {
    setMerchants((prev) => [newMerchant, ...prev]);
    addMerchantToFirestore(newMerchant);

    // Reward referral points
    const newPoints = user.points + 200;
    const updatedUser = { ...user, points: newPoints };
    setUser(updatedUser);
    saveUserProfileToFirestore(updatedUser);

    const newTx: PointsTransaction = {
      id: `tx-${Date.now()}`,
      userId: user.uid,
      title: `成功为商会推荐入驻新商户「${newMerchant.name}」`,
      change: 200,
      date: '刚刚',
      type: 'NEW_MEMBER',
    };
    setTransactions((prev) => [newTx, ...prev]);
    addPointsTransactionToFirestore(newTx);

    // Trigger Admin Email Notification to baizw2000@gmail.com
    sendMerchantApplicationNotification(newMerchant);

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  // 5b. Approve Merchant Handler
  const handleApproveMerchant = (merchantId: string | number) => {
    approveMerchantInFirestore(merchantId, user.name);
    setMerchants((prev) =>
      prev.map((m) =>
        String(m.id) === String(merchantId)
          ? {
              ...m,
              auditStatus: 'APPROVED',
              verified: true,
              reviewedBy: user.name,
              reviewedAt: new Date().toISOString(),
            }
          : m
      )
    );
  };

  // 5c. Reject Merchant Handler
  const handleRejectMerchant = (merchantId: string | number, reason?: string) => {
    rejectMerchantInFirestore(merchantId, user.name, reason);
    setMerchants((prev) =>
      prev.map((m) =>
        String(m.id) === String(merchantId)
          ? {
              ...m,
              auditStatus: 'REJECTED',
              reviewNotes: reason || '请补齐滑铁卢地区实体经营资质或工商注册文件',
              reviewedBy: user.name,
            }
          : m
      )
    );
  };

  // 5d. Admin Edit / Update Merchant Handler
  const handleUpdateMerchant = (merchantId: string | number, updates: Partial<Merchant>) => {
    updateMerchantInFirestore(merchantId, updates);
    setMerchants((prev) =>
      prev.map((m) =>
        String(m.id) === String(merchantId)
          ? { ...m, ...updates, updatedAt: new Date().toISOString() }
          : m
      )
    );
  };

  // 5e. Admin Delist / Suspend Merchant Handler (下架处理)
  const handleDelistMerchant = (merchantId: string | number, reason: string) => {
    delistMerchantInFirestore(merchantId, reason, user.name);
    setMerchants((prev) =>
      prev.map((m) =>
        String(m.id) === String(merchantId)
          ? {
              ...m,
              auditStatus: 'SUSPENDED',
              isDelisted: true,
              delistReason: reason,
              delistedAt: new Date().toISOString(),
              delistedBy: user.name,
              verified: false,
            }
          : m
      )
    );
  };

  // 5f. Admin Relist / Restore Merchant Handler (恢复上架)
  const handleRelistMerchant = (merchantId: string | number) => {
    relistMerchantInFirestore(merchantId, user.name);
    setMerchants((prev) =>
      prev.map((m) =>
        String(m.id) === String(merchantId)
          ? {
              ...m,
              auditStatus: 'APPROVED',
              isDelisted: false,
              delistReason: '',
              delistedAt: '',
              delistedBy: '',
              verified: true,
            }
          : m
      )
    );
  };

  // 5g. Admin Permanently Delete Merchant Handler (彻底删除)
  const handleDeleteMerchant = (merchantId: string | number) => {
    deleteMerchantFromFirestore(merchantId);
    setMerchants((prev) => prev.filter((m) => String(m.id) !== String(merchantId)));
  };

  // 6. Add Help Post Handler
  const handleAddHelpPost = (newPost: HelpPost) => {
    const isExternal = Boolean(newPost.isExternalProspect);
    const postToSave: HelpPost = {
      ...newPost,
      authorUid: isExternal ? undefined : user.uid,
      authorName: isExternal ? newPost.authorName : user.name,
      authorCompany: isExternal ? (newPost.authorCompany || '外部潜在客户') : user.company,
      authorAvatar: isExternal ? '💼' : user.avatar,
      auditStatus: isExternal ? 'PENDING_APPROVAL' : 'APPROVED',
      broadcastStatus: isExternal ? 'NOT_BROADCASTED' : 'BROADCASTED',
      broadcastedAt: isExternal ? undefined : new Date().toISOString(),
    };

    setPosts((prev) => [postToSave, ...prev]);
    addHelpPostToFirestore(postToSave);

    if (isExternal) {
      // Scheme B: Notify admins only, DO NOT mass email merchants yet!
      sendOpportunityPendingAdminNotification(postToSave);
    } else {
      // Member direct broadcast
      const merchantEmails = merchants.map((m) => m.email).filter(Boolean);
      sendChamberOpportunityNotification(postToSave, merchantEmails);

      if (newPost.rewardPoints > 0) {
        const newPoints = Math.max(0, user.points - newPost.rewardPoints);
        const updatedUser = { ...user, points: newPoints };
        setUser(updatedUser);
        saveUserProfileToFirestore(updatedUser);

        const newTx: PointsTransaction = {
          id: `tx-${Date.now()}`,
          userId: user.uid,
          title: `发布互助需求「${newPost.title.slice(0, 16)}...」托管悬赏`,
          change: -newPost.rewardPoints,
          date: '刚刚',
          type: 'POST_REWARD',
        };
        setTransactions((prev) => [newTx, ...prev]);
        addPointsTransactionToFirestore(newTx);
      }
    }
  };

  // 6b. Admin Approve and Broadcast Opportunity to all merchants
  const handleApproveAndBroadcastHelpPost = (postId: string | number) => {
    const targetPost = posts.find((p) => String(p.id) === String(postId));
    if (!targetPost) return;

    const updates: Partial<HelpPost> = {
      auditStatus: 'APPROVED',
      broadcastStatus: 'BROADCASTED',
      broadcastedAt: new Date().toISOString(),
      reviewedBy: user.name || '商会秘书处',
      reviewedAt: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((p) => (String(p.id) === String(postId) ? { ...p, ...updates } : p))
    );
    updateHelpPostInFirestore(postId, updates);

    // Trigger mass email broadcast to all merchants
    const merchantEmails = merchants.map((m) => m.email).filter(Boolean);
    sendChamberOpportunityNotification({ ...targetPost, ...updates }, merchantEmails);
  };

  // 6c. Admin Approve Without Mass Email
  const handleApproveHelpPost = (postId: string | number) => {
    const updates: Partial<HelpPost> = {
      auditStatus: 'APPROVED',
      broadcastStatus: 'NOT_BROADCASTED',
      reviewedBy: user.name || '商会秘书处',
      reviewedAt: new Date().toISOString(),
    };
    setPosts((prev) =>
      prev.map((p) => (String(p.id) === String(postId) ? { ...p, ...updates } : p))
    );
    updateHelpPostInFirestore(postId, updates);
  };

  // 6d. Admin Reject Help Post
  const handleRejectHelpPost = (postId: string | number) => {
    const updates: Partial<HelpPost> = {
      auditStatus: 'REJECTED',
      reviewedBy: user.name || '商会秘书处',
      reviewedAt: new Date().toISOString(),
    };
    setPosts((prev) =>
      prev.map((p) => (String(p.id) === String(postId) ? { ...p, ...updates } : p))
    );
    updateHelpPostInFirestore(postId, updates);
  };

  // 6e. Admin Delete Help Post
  const handleDeleteHelpPost = (postId: string | number) => {
    deleteHelpPostFromFirestore(postId);
    setPosts((prev) => prev.filter((p) => String(p.id) !== String(postId)));
  };

  // 6f. Admin Delist Help Post
  const handleDelistHelpPost = (postId: string | number, reason?: string) => {
    const adminName = user.name || '商会秘书处';
    const postReason = reason || '不符合商会发布规范或已失效';
    const updates: Partial<HelpPost> = {
      isDelisted: true,
      delistedAt: new Date().toISOString(),
      delistedBy: adminName,
      delistReason: postReason,
    };
    setPosts((prev) =>
      prev.map((p) => (String(p.id) === String(postId) ? { ...p, ...updates } : p))
    );
    delistHelpPostInFirestore(postId, postReason, adminName);
  };

  // 6g. Admin Relist Help Post
  const handleRelistHelpPost = (postId: string | number) => {
    const adminName = user.name || '商会秘书处';
    const updates: Partial<HelpPost> = {
      isDelisted: false,
      delistedAt: undefined,
      delistedBy: undefined,
      delistReason: undefined,
    };
    setPosts((prev) =>
      prev.map((p) => (String(p.id) === String(postId) ? { ...p, ...updates } : p))
    );
    relistHelpPostInFirestore(postId, adminName);
  };

  // 6h. Admin Update / Edit Help Post
  const handleUpdateHelpPost = (postId: string | number, updates: Partial<HelpPost>) => {
    setPosts((prev) =>
      prev.map((p) => (String(p.id) === String(postId) ? { ...p, ...updates } : p))
    );
    updateHelpPostInFirestore(postId, updates);
  };

  // 7. Add Offer to Help Post
  const handleAddOffer = (postId: string | number, content: string) => {
    const newOffer = {
      id: `offer-${Date.now()}`,
      postId,
      responderUid: user.uid,
      responderName: user.name,
      responderCompany: user.company,
      content,
      createdAt: '刚刚',
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (String(p.id) === String(postId)) {
          return {
            ...p,
            status: p.status === '待对接' ? '对接中' : p.status,
            responsesCount: p.responsesCount + 1,
            offers: [...p.offers, newOffer],
          };
        }
        return p;
      })
    );

    addOfferToHelpPost(postId, newOffer);
  };

  // 8. Accept Offer Handler
  const handleAcceptOffer = (postId: string | number, offerId: string | number, rewardPoints: number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (String(p.id) === String(postId)) {
          return {
            ...p,
            status: '已圆满解决',
            offers: p.offers.map((o) =>
              String(o.id) === String(offerId) ? { ...o, accepted: true } : o
            ),
          };
        }
        return p;
      })
    );

    acceptOfferInFirestore(postId, offerId);
  };

  // 9. Redeem Reward Handler
  const handleRedeemReward = (item: RewardItem) => {
    const newPoints = Math.max(0, user.points - item.pointsCost);
    const updatedUser = { ...user, points: newPoints };
    setUser(updatedUser);
    saveUserProfileToFirestore(updatedUser);

    setRewardItems((prev) =>
      prev.map((r) =>
        r.id === item.id ? { ...r, stock: Math.max(0, r.stock - 1) } : r
      )
    );

    const newTx: PointsTransaction = {
      id: `tx-${Date.now()}`,
      userId: user.uid,
      title: `兑换商会特权「${item.title}」`,
      change: -item.pointsCost,
      date: '刚刚',
      type: 'REDEEM',
    };
    setTransactions((prev) => [newTx, ...prev]);
    addPointsTransactionToFirestore(newTx);
  };

  // 10. Profile Update Handler
  const handleUpdateProfile = (updated: UserProfile) => {
    setUser(updated);
    saveUserProfileToFirestore(updated);
  };

  // 11. Member Login & Guest Switch Handlers (Scheme A)
  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    try {
      localStorage.setItem('weba_member_session', JSON.stringify(profile));
    } catch (e) {}
    saveUserProfileToFirestore(profile);
  };

  const handleSwitchToGuest = () => {
    setUser(GUEST_USER_PROFILE);
    try {
      localStorage.removeItem('weba_member_session');
    } catch (e) {}
  };

  // 12. Event Operations (Add / Delete)
  const handleAddEvent = (newEvent: ChamberEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    addEventToFirestore(newEvent);
  };

  const handleDeleteEvent = (eventId: string | number) => {
    setEvents((prev) => prev.filter((e) => String(e.id) !== String(eventId)));
    deleteEventFromFirestore(eventId);
  };

  const content = (
    <div className="min-h-screen flex flex-col justify-between bg-[#F7F7F5] text-[#0F172A]">
      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userPoints={user.points}
        user={user}
        onOpenSmartMatch={() => setIsSmartMatchOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenMerchantApply={() => {
          setSelectedCategory('全部');
          setCurrentTab('directory');
          setIsApplyModalOpen(true);
        }}
        onOpenPrivilegeModal={() => setIsPrivilegeMatrixModalOpen(true)}
      />

      {/* Main Container: Fully responsive for mobile, tablet, and desktop */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-24 md:pb-10">
        {currentTab === 'home' && (
          <BrandHero
            setCurrentTab={setCurrentTab}
            onSearchDirectory={(q) => {
              setSearchQuery(q);
              setSelectedCategory('全部');
              setCurrentTab('directory');
            }}
            onOpenSmartMatch={() => setIsSmartMatchOpen(true)}
            onCheckIn={handleCheckIn}
            hasCheckedInToday={Boolean(user.hasCheckedInToday)}
            user={user}
            onOpenMerchantApply={() => {
              setSelectedCategory('全部');
              setCurrentTab('directory');
              setIsApplyModalOpen(true);
            }}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        )}

        {currentTab === 'directory' && (
          <MerchantDirectory
            merchants={merchants}
            onSelectMerchant={(m) => setSelectedMerchantForDetail(m)}
            onOpenAIReputation={(m) => setSelectedMerchantForAI(m)}
            onAddNewMerchant={handleAddNewMerchant}
            onApproveMerchant={handleApproveMerchant}
            onRejectMerchant={handleRejectMerchant}
            onUpdateMerchant={handleUpdateMerchant}
            onDelistMerchant={handleDelistMerchant}
            onRelistMerchant={handleRelistMerchant}
            onDeleteMerchant={handleDeleteMerchant}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            isAddModalOpen={isApplyModalOpen}
            onCloseAddModal={() => setIsApplyModalOpen(false)}
          />
        )}

        {currentTab === 'help' && (
          <MutualHelpHub
            posts={posts}
            merchants={merchants}
            userPoints={user.points}
            user={user}
            onAddPost={handleAddHelpPost}
            onApproveAndBroadcastPost={handleApproveAndBroadcastHelpPost}
            onApprovePost={handleApproveHelpPost}
            onRejectPost={handleRejectHelpPost}
            onDelistPost={handleDelistHelpPost}
            onRelistPost={handleRelistHelpPost}
            onUpdatePost={handleUpdateHelpPost}
            onDeletePost={handleDeleteHelpPost}
            onAddOffer={handleAddOffer}
            onAcceptOffer={handleAcceptOffer}
            onOpenSmartMatch={() => setIsSmartMatchOpen(true)}
            prefillMerchant={prefillMerchantForHelp}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onLoginSuccess={handleLoginSuccess}
            onOpenMerchantApply={() => {
              setSelectedCategory('全部');
              setCurrentTab('directory');
              setIsApplyModalOpen(true);
            }}
          />
        )}

        {currentTab === 'events' && (
          <EventsHub
            events={events}
            userPoints={user.points}
            user={user}
            merchants={merchants}
            onRegisterEvent={handleRegisterEvent}
            onCheckInEvent={handleCheckInEvent}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            onLoginSuccess={handleLoginSuccess}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onOpenMerchantApply={() => {
              setSelectedCategory('全部');
              setCurrentTab('directory');
              setIsApplyModalOpen(true);
            }}
          />
        )}

        {currentTab === 'points' && (
          <PointsCenter
            userPoints={user.points}
            user={user}
            transactions={transactions}
            rewardItems={rewardItems}
            leaderboard={leaderboard}
            onCheckIn={handleCheckIn}
            hasCheckedInToday={Boolean(user.hasCheckedInToday)}
            onRedeemReward={handleRedeemReward}
          />
        )}

        {currentTab === 'profile' && (
          <UserProfileCenter
            user={user}
            posts={posts}
            events={events}
            transactions={transactions}
            onUpdateProfile={handleUpdateProfile}
            onOpenEventTicket={(evt) => setTicketModalEvent(evt)}
            onCheckInToday={handleCheckIn}
          />
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="mt-16 border-t border-[#E8E6DF] bg-white py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] border border-[#C5A059]/60 flex items-center justify-center font-editorial text-[#DFBA73] font-bold text-lg shadow-sm">
              {t('融', 'W')}
            </div>
            <div>
              <p className="font-editorial text-sm font-bold text-[#0F172A]">
                {t('滑铁卢融商汇 · Waterloo Business Convergence Alliance', 'Waterloo Business Convergence Alliance (WBCA)')}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {t(
                  '非营利法人机构注册编号: ON-882941-C · 智汇滑铁卢 · 融商聚势 · 静奢公信力背书',
                  'Non-Profit Corporation Reg: ON-882941-C · Waterloo Innovation Corridor · Executive Trust Seal'
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-slate-600">
            <button
              onClick={() => setCurrentTab('profile')}
              className="hover:text-[#9E7425] text-[#0F172A] font-semibold transition-colors"
            >
              {t('会员中心', 'Member Portal')}
            </button>
            <button
              onClick={() => setCurrentTab('directory')}
              className="hover:text-[#9E7425] transition-colors"
            >
              {t('认证名录', 'Verified Directory')}
            </button>
            <button
              onClick={() => setIsSmartMatchOpen(true)}
              className="text-[#9E7425] font-semibold hover:text-[#0F172A] transition-colors"
            >
              {t('AI 商机撮合', 'AI Matchmaking')}
            </button>
            <span className="text-[#E8E6DF]">|</span>
            <span className="text-slate-400">© {new Date().getFullYear()} WBCA. All Rights Reserved.</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        unreadHelpCount={posts.filter((p) => p.status === '待对接').length}
      />

      {/* Modals */}
      <MerchantDetailModal
        merchant={selectedMerchantForDetail}
        onClose={() => setSelectedMerchantForDetail(null)}
        onOpenAIReputation={(m) => {
          setSelectedMerchantForDetail(null);
          setSelectedMerchantForAI(m);
        }}
        onOpenMutualHelpWithMerchant={(m) => {
          setSelectedMerchantForDetail(null);
          setPrefillMerchantForHelp(m);
          setCurrentTab('help');
        }}
      />

      <AIReputationModal
        merchant={selectedMerchantForAI}
        onClose={() => setSelectedMerchantForAI(null)}
      />

      <AISmartMatchModal
        isOpen={isSmartMatchOpen}
        onClose={() => setIsSmartMatchOpen(false)}
        merchants={merchants}
        onSelectMerchant={(m) => {
          setSelectedMerchantForDetail(m);
        }}
        onOpenMutualHelpWithNeed={(needText) => {
          setCurrentTab('help');
        }}
      />

      {/* Ticket Modal if opened from Profile */}
      {ticketModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-[#E8E6DF] rounded-2xl max-w-sm w-full p-6 space-y-4 text-center shadow-2xl relative">
            <button
              onClick={() => setTicketModalEvent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#0F172A]"
            >
              ✕
            </button>

            <div className="space-y-1 pt-2">
              <span className="text-[11px] font-bold text-[#9E7425] uppercase tracking-widest">
                {t('名商活动电子入场券', 'WBCA Executive E-Pass')}
              </span>
              <h3 className="font-editorial text-lg font-bold text-[#0F172A] pt-1">
                {ticketModalEvent.title}
              </h3>
              <p className="text-xs text-slate-500">
                {t('持票人', 'Passholder')}: {translateUserField(user.name, isEn)} ({translateUserField(user.company, isEn)})
              </p>
            </div>

            <div className="bg-[#F7F7F5] p-4 rounded-2xl mx-auto inline-block border border-[#C5A059]/40">
              <div className="w-40 h-40 bg-[#0F172A] p-2 rounded-xl flex flex-col items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-32 h-32 fill-current text-white">
                  <path d="M0,0 h30 v30 h-30 z M4,4 v22 h22 v-22 z M8,8 h14 v14 h-14 z" />
                  <path d="M70,0 h30 v30 h-30 z M74,4 v22 h22 v-22 z M78,8 h14 v14 h-14 z" />
                  <path d="M0,70 h30 v30 h-30 z M4,74 v22 h22 v-22 z M8,78 h14 v14 h-14 z" />
                  <rect x="40" y="10" width="8" height="8" />
                  <rect x="52" y="10" width="8" height="8" />
                  <rect x="40" y="24" width="8" height="8" />
                  <rect x="10" y="40" width="8" height="8" />
                  <rect x="24" y="40" width="8" height="8" />
                  <rect x="40" y="40" width="20" height="20" />
                  <rect x="70" y="40" width="8" height="8" />
                  <rect x="85" y="40" width="8" height="8" />
                  <rect x="40" y="70" width="8" height="8" />
                  <rect x="52" y="70" width="8" height="8" />
                  <rect x="70" y="70" width="10" height="10" />
                  <rect x="85" y="85" width="8" height="8" />
                </svg>
              </div>
            </div>

            <div className="text-xs text-slate-600">
              {t('现场扫码签到即可自动发放', 'Scan on arrival to automatically earn')}{' '}
              <strong className="text-[#9E7425]">+{ticketModalEvent.pointsReward} {t('信用积分', 'Trust Credits')}</strong>
            </div>

            <button
              onClick={() => setTicketModalEvent(null)}
              className="w-full py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold rounded-xl text-xs transition-colors"
            >
              {t('关闭', 'Close')}
            </button>
          </div>
        </div>
      )}

      {/* Member Enterprise Login Modal */}
      <MemberLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        merchants={merchants}
        currentUser={user}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToGuest={handleSwitchToGuest}
        onOpenMerchantApply={() => {
          setIsLoginModalOpen(false);
          setSelectedCategory('全部');
          setCurrentTab('directory');
          setIsApplyModalOpen(true);
        }}
      />

      {/* Standalone Membership Privilege Comparison & Fast-Track Modal */}
      {isPrivilegeMatrixModalOpen && (
        <MembershipPrivilegeMatrix
          user={user}
          onOpenApplyModal={() => {
            setIsPrivilegeMatrixModalOpen(false);
            setSelectedCategory('全部');
            setCurrentTab('directory');
            setIsApplyModalOpen(true);
          }}
          onOpenLogin={() => {
            setIsPrivilegeMatrixModalOpen(false);
            setIsLoginModalOpen(true);
          }}
          variant="modal"
          onClose={() => setIsPrivilegeMatrixModalOpen(false)}
        />
      )}
    </div>
  );

  return content;
}
