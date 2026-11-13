import React, { useState, useRef } from 'react';
import { ChamberEvent, UserProfile, Merchant } from '../types';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Award, 
  QrCode, 
  CheckCircle2, 
  Share2, 
  Sparkles, 
  Download, 
  X,
  ExternalLink,
  PlusCircle,
  ShieldCheck,
  Building2,
  Lock,
  Globe,
  Trash2,
  AlertCircle,
  LogIn,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  Link2,
  RotateCcw,
  Check,
  Eye,
  UserCheck,
  Mail,
  Key
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../i18n/LanguageContext';
import {
  translateEventType,
  translateTier,
  translateUserField,
} from '../i18n/domainTranslations';

interface EventsHubProps {
  events: ChamberEvent[];
  userPoints: number;
  user?: UserProfile;
  merchants?: Merchant[];
  onRegisterEvent: (eventId: string | number) => void;
  onCheckInEvent: (eventId: string | number, pointsReward: number) => void;
  onAddEvent?: (newEvent: ChamberEvent) => void;
  onDeleteEvent?: (eventId: string | number) => void;
  onLoginSuccess?: (memberProfile: UserProfile) => void;
  onOpenLogin?: () => void;
  onOpenMerchantApply?: () => void;
}

const PRESET_COVERS = [
  {
    id: 'summit',
    name: '商务峰会 · 创新大堂',
    nameEn: 'Executive Summit · Grand Hall',
    tag: '峰会主场',
    tagEn: 'Summit Main',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'gala',
    name: '精英闭门 · 私董晚宴',
    nameEn: 'Closed-Door · Executive Gala',
    tag: '高端晚宴',
    tagEn: 'Private Gala',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'speech',
    name: '华商演讲 · 讲坛主场',
    nameEn: 'Keynote Forum · Auditorium',
    tag: '名家讲坛',
    tagEn: 'Keynote Forum',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'salon',
    name: '创客沙龙 · 灵感工坊',
    nameEn: 'Founder Salon · Workshop',
    tag: '灵感工坊',
    tagEn: 'Founder Lab',
    url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'tech',
    name: '跨境出海 · 科技展厅',
    nameEn: 'Global Expansion · Tech Expo',
    tag: '科技出海',
    tagEn: 'Tech Showcase',
    url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'wealth',
    name: '金融财富 · 投资圆桌',
    nameEn: 'Wealth & Capital Roundtable',
    tag: '财富管理',
    tagEn: 'Capital Circle',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'networking',
    name: '人脉酒会 · 璀璨社交',
    nameEn: 'Executive Cocktail Reception',
    tag: '人脉酒会',
    tagEn: 'Networking',
    url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'startup',
    name: '青年创投 · 孵化路演',
    nameEn: 'Venture Pitch & Incubator',
    tag: '创新路演',
    tagEn: 'Venture Pitch',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  },
];

export const EventsHub: React.FC<EventsHubProps> = ({
  events,
  userPoints,
  user,
  merchants,
  onRegisterEvent,
  onCheckInEvent,
  onAddEvent,
  onDeleteEvent,
  onLoginSuccess,
  onOpenLogin,
  onOpenMerchantApply,
}) => {
  const { isEn, t } = useLanguage();
  const [selectedEvent, setSelectedEvent] = useState<ChamberEvent | null>(null);
  const [showTicketModal, setShowTicketModal] = useState<ChamberEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthGateModal, setShowAuthGateModal] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | number | null>(null);
  const [notice, setNotice] = useState('');

  // Step 1: Member Qualification & Auto-Login States
  const [gateEmailInput, setGateEmailInput] = useState('');
  const [gateLoading, setGateLoading] = useState(false);
  const [gateError, setGateError] = useState('');
  const [gateSuccess, setGateSuccess] = useState('');

  // Check admin auth from sessionStorage
  const isAdmin = typeof window !== 'undefined' && sessionStorage.getItem('weba_admin_auth') === 'true';

  // Approved merchants list for authentication matching
  const approvedMerchants = (merchants || []).filter((m) => m.auditStatus !== 'REJECTED');

  // Step 1 Verification Handlers
  const handleGateVerifyEmail = (emailToVerify: string) => {
    setGateError('');
    setGateSuccess('');
    const cleanEmail = emailToVerify.trim().toLowerCase();
    if (!cleanEmail) {
      setGateError(
        t(
          '请输入您入驻商会时登记的企业邮箱',
          'Please enter the corporate email registered with your WBCA membership.'
        )
      );
      return;
    }

    setGateLoading(true);
    setTimeout(() => {
      setGateLoading(false);
      const matched = approvedMerchants.find(
        (m) => m.email && m.email.toLowerCase() === cleanEmail
      );

      if (matched) {
        const displayCompany = isEn ? (matched.nameEn || matched.name) : matched.name;
        const verifiedProfile: UserProfile = {
          ...(user || ({} as UserProfile)),
          uid: `member-${matched.id}`,
          name: matched.repName || matched.name,
          company: matched.name,
          title: matched.repTitle || '企业法定代表人 / 负责人',
          phone: matched.phone || '',
          email: matched.email,
          avatar: matched.logo || '🏢',
          tier: matched.tier || '认证商户',
          industry: matched.category,
          bio: matched.description || matched.tagline || '滑铁卢融商汇实名认证企业会员',
          isMember: true,
          merchantId: matched.id,
          joinedDate: '商会实名认证会员',
          points: user?.points || 100,
        };

        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        onLoginSuccess?.(verifiedProfile);
        setGateSuccess(
          t(
            `🎉 第一步会员资格核验成功！已识别为「${matched.name}」实名会员，正在为您直接开启活动发布表单...`,
            `🎉 Step 1 verification complete! Authenticated as "${displayCompany}". Opening the event publishing console...`
          )
        );
        setTimeout(() => {
          setShowAuthGateModal(false);
          setShowCreateModal(true);
          setGateSuccess('');
          setGateEmailInput('');
        }, 1000);
      } else {
        setGateError(
          t(
            `未在商会已审核的名商名录中检索到邮箱「${cleanEmail}」。请确认是否为入会申请登记的企业邮箱，或点击下方【申请加入滑铁卢融商汇】。`,
            `No verified enterprise found for "${cleanEmail}". Please verify your registered corporate email or apply for WBCA membership below.`
          )
        );
      }
    }, 400);
  };

  const handleGateGoogleSignIn = async () => {
    setGateLoading(true);
    setGateError('');
    setGateSuccess('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleEmail = result.user.email?.toLowerCase();
      const googleName = result.user.displayName || t('Google 会员', 'Google Member');

      if (!googleEmail) {
        setGateError(
          t(
            '未能获取 Google 邮箱信息，请尝试直接输入企业邮箱。',
            'Unable to retrieve your Google email address. Please enter your corporate email below.'
          )
        );
        setGateLoading(false);
        return;
      }

      const matched = approvedMerchants.find(
        (m) => m.email && m.email.toLowerCase() === googleEmail
      );

      if (matched) {
        const displayCompany = isEn ? (matched.nameEn || matched.name) : matched.name;
        const verifiedProfile: UserProfile = {
          ...(user || ({} as UserProfile)),
          uid: result.user.uid,
          name: matched.repName || googleName,
          company: matched.name,
          title: matched.repTitle || '企业负责人',
          phone: matched.phone || user?.phone || '',
          email: googleEmail,
          avatar: matched.logo || '🏢',
          tier: matched.tier || '认证商户',
          industry: matched.category,
          bio: matched.description || matched.tagline || '滑铁卢融商汇实名认证企业会员',
          isMember: true,
          merchantId: matched.id,
          joinedDate: 'Google 快捷认证会员',
          points: user?.points || 100,
        };

        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        onLoginSuccess?.(verifiedProfile);
        setGateSuccess(
          t(
            `🎉 Google 登录成功！已匹配认证企业「${matched.name}」，正在自动为您开启活动发布界面...`,
            `🎉 Signed in with Google! Matched verified enterprise "${displayCompany}". Opening event publisher...`
          )
        );
        setTimeout(() => {
          setShowAuthGateModal(false);
          setShowCreateModal(true);
          setGateSuccess('');
        }, 1000);
      } else {
        setGateError(
          t(
            `Google 账号 (${googleEmail}) 登录成功，但在商会名录中尚未匹配到已入驻的认证企业。请使用入会登记邮箱核验，或先提交企业入驻申请。`,
            `Google account (${googleEmail}) authenticated, but no matching verified enterprise was found in the WBCA directory. Please verify with your registered corporate email or submit a membership application.`
          )
        );
      }
    } catch (err: any) {
      console.warn('Google sign-in popup error in gate modal:', err);
      setGateError(
        err?.message?.includes('popup-closed-by-user')
          ? t('您取消了 Google 登录窗口。', 'Google sign-in window was closed.')
          : t(
              'Google 认证服务遇到问题，请使用下方【企业认证邮箱快捷输入】。',
              'Google authentication encountered an issue. Please use corporate email verification below.'
            )
      );
    } finally {
      setGateLoading(false);
    }
  };

  // Form states for creating event
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ChamberEvent['type']>('高端峰会');
  const [newDate, setNewDate] = useState(isEn ? 'Nov 28, 2026 (Sat)' : '2026年11月28日 (周六)');
  const [newTime, setNewTime] = useState('14:00 - 17:30 EST');
  const [newLocation, setNewLocation] = useState(
    isEn ? 'Waterloo Innovation Outpost · WBCA Grand Hall' : 'Waterloo Innovation Outpost · 融商汇大会厅'
  );
  const [newCapacity, setNewCapacity] = useState(60);
  const [newPointsCost, setNewPointsCost] = useState(0);
  const [newPointsReward, setNewPointsReward] = useState(50);
  const [newTargetAudience, setNewTargetAudience] = useState<'ALL' | 'MEMBERS_ONLY'>('ALL');
  const [newDesc, setNewDesc] = useState('');

  // Custom Event Poster States
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [coverSourceTab, setCoverSourceTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [newCover, setNewCover] = useState(PRESET_COVERS[0].url);
  const [customPosterName, setCustomPosterName] = useState<string>('');
  const [customPosterSizeKb, setCustomPosterSizeKb] = useState<number | null>(null);
  const [isProcessingCover, setIsProcessingCover] = useState(false);
  const [coverError, setCoverError] = useState('');
  const [inputCoverUrl, setInputCoverUrl] = useState('');

  // Handle local image file upload with client-side canvas compression for 16:9 widescreen poster
  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCoverError(
        t('请选择有效的图片文件（支持 JPG, PNG, WebP）', 'Please select a valid image file (JPG, PNG, or WebP).')
      );
      return;
    }

    setIsProcessingCover(true);
    setCoverError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // High definition 16:9 ratio poster compression (max width 1200px, max height 675px)
        const maxW = 1200;
        const maxH = 675;
        let width = img.width;
        let height = img.height;

        if (width > maxW) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        }
        if (height > maxH) {
          width = Math.round((width * maxH) / height);
          height = maxH;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          const sizeInKb = Math.round((compressed.length * 3) / 4 / 1024);
          setCustomPosterSizeKb(sizeInKb);
          setCustomPosterName(file.name);
          setNewCover(compressed);
          setIsProcessingCover(false);
        } else {
          const raw = event.target?.result as string;
          setNewCover(raw);
          setCustomPosterName(file.name);
          setIsProcessingCover(false);
        }
      };
      img.onerror = () => {
        setCoverError(t('图片解析失败，请尝试其他海报图片', 'Failed to parse image. Please try another poster file.'));
        setIsProcessingCover(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setCoverError(t('读取海报文件出错', 'Error reading poster image file.'));
      setIsProcessingCover(false);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoverUrl.trim()) return;
    setNewCover(inputCoverUrl.trim());
    setCustomPosterName(t('外部网络海报链接', 'External Poster Image URL'));
    setCustomPosterSizeKb(null);
    setCoverError('');
  };

  const handleResetCover = () => {
    setNewCover(PRESET_COVERS[0].url);
    setCustomPosterName('');
    setCustomPosterSizeKb(null);
    setInputCoverUrl('');
    setCoverError('');
    if (coverFileInputRef.current) coverFileInputRef.current.value = '';
  };

  const isMember = Boolean(user?.isMember);

  const handleStartCreateEvent = () => {
    if (isMember) {
      setShowCreateModal(true);
    } else {
      setShowAuthGateModal(true);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMember) {
      setShowCreateModal(false);
      setShowAuthGateModal(true);
      return;
    }
    if (!newTitle.trim() || !newDesc.trim()) return;

    const localizedUserName = translateUserField(user?.name, isEn, t('主办企业负责人', 'Host Principal'));
    const localizedCompany = translateUserField(user?.company, isEn, t('主办方', 'Host Organization'));

    const newEvent: ChamberEvent = {
      id: `evt-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      date: newDate.trim(),
      time: newTime.trim(),
      location: newLocation.trim(),
      capacity: Number(newCapacity) || 50,
      registeredCount: 0,
      pointsRequired: Number(newPointsCost) || 0,
      pointsReward: Number(newPointsReward) || 50,
      coverImage: newCover,
      description: newDesc.trim(),
      organizerUid: user?.uid,
      organizerName: user?.name,
      organizerCompany: user?.company || t('融商汇认证企业', 'WBCA Certified Enterprise'),
      targetAudience: newTargetAudience,
      createdAt: new Date().toISOString(),
      agenda: [
        {
          time: '13:30 - 14:00',
          topic: t('会员嘉宾签到与商界名片自由交流', 'Guest Registration & Executive Networking'),
          speaker: t('会务组', 'Event Concierge'),
        },
        {
          time: '14:00 - 15:30',
          topic: `${newTitle.trim()} · ${t('核心主旨分享与项目路演', 'Keynote Address & Venture Showcase')}`,
          speaker: `${localizedUserName} (${localizedCompany})`,
        },
        {
          time: '15:30 - 16:30',
          topic: t('行业圆桌探讨与点对点合作对接沙龙', 'Industry Roundtable & 1-on-1 Deal Matchmaking'),
          speaker: t('全体特邀参会企业', 'Invited Corporate Delegates'),
        },
        {
          time: '16:30 - 17:30',
          topic: t('自由私洽、合影留念与商会闭门冷餐晚宴', 'Private Consultations, Group Photo & Reception'),
          speaker: t('全体嘉宾', 'All Attendees'),
        },
      ],
    };

    if (onAddEvent) {
      onAddEvent(newEvent);
    }

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setShowCreateModal(false);
    setNotice(
      t(
        `🎉 商务活动「${newEvent.title}」已成功发布并同步至云端数据库！`,
        `🎉 Event "${newEvent.title}" published and synced to the Alliance database!`
      )
    );
    setTimeout(() => setNotice(''), 6000);

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    handleResetCover();
  };

  const handleRSVP = (evt: ChamberEvent) => {
    // If closed-door event for chamber members only and user is not certified
    if (evt.targetAudience === 'MEMBERS_ONLY' && !isMember) {
      setShowAuthGateModal(true);
      return;
    }

    onRegisterEvent(evt.id);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
    // Open Ticket Modal directly
    setShowTicketModal({ ...evt, isRegistered: true });
  };

  const handleSimulateCheckIn = (evt: ChamberEvent) => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
    onCheckInEvent(evt.id, evt.pointsReward);
    setShowTicketModal((prev) => (prev ? { ...prev, checkedIn: true } : null));
  };

  const handleConfirmDeleteEvent = (eventId: string | number) => {
    if (onDeleteEvent) {
      onDeleteEvent(eventId);
    }
    setDeletingEventId(null);
    setNotice(t('🗑 活动已从云端数据库彻底删除！', '🗑 Event permanently removed from the cloud database.'));
    setTimeout(() => setNotice(''), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#E8E6DF] luxury-shadow">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-editorial text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-[#9E7425]" />
            <span>{t('滑铁卢融商汇 品牌活动与闭门私董', 'WBCA Signature Events & Executive Roundtables')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {t(
              '高端峰会 · 私董沙龙 · 投融资对接 · 认证会员可自主发起 · 扫码签到享积分确权',
              'Executive Summits · Private Roundtables · Capital Networking · Member-Hosted · QR Check-In Credits'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStartCreateEvent}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 ${
              isMember
                ? 'gold-gradient hover:brightness-105 text-[#0F172A]'
                : 'bg-[#0F172A] hover:bg-[#1E293B] text-[#DFBA73] border border-[#C5A059]/40'
            }`}
            title={
              isMember
                ? t('您已通过实名会员资格核验，可直接发起商会商务活动', 'Verified member authenticated — publish your corporate event')
                : t('发布商会活动需先进行实名会员资格核验与登录', 'Member verification required before publishing Alliance events')
            }
          >
            {isMember ? (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>{t('发布商会活动 / 沙龙', 'Host Alliance Event / Salon')}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#0F172A] text-[#DFBA73] font-bold">
                  {t('实名会员', 'Verified Member')}
                </span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-[#DFBA73]" />
                <span>{t('发布商会活动 / 沙龙', 'Host Alliance Event / Salon')}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#C5A059]/20 text-[#DFBA73] border border-[#C5A059]/40 font-medium">
                  {t('需核验会员身份', 'Member Auth Required')}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success / Alert Toast */}
      {notice && (
        <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#C5A059]/50 luxury-shadow text-[#0F172A] flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-[#DFBA73] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-[#0F172A]">{notice}</p>
          </div>
          <button onClick={() => setNotice('')} className="text-slate-500 hover:text-[#0F172A]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Events Grid: Responsive across mobile (1 col), tablet (2 cols), and desktop (3 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {events.map((evt) => {
          const percentFull = Math.min(
            100,
            Math.round((evt.registeredCount / evt.capacity) * 100)
          );
          const isClosedDoor = evt.targetAudience === 'MEMBERS_ONLY';

          return (
            <div
              key={evt.id}
              className="bg-white rounded-2xl border border-[#E8E6DF] hover:border-[#C5A059] transition-all overflow-hidden flex flex-col justify-between luxury-shadow group"
            >
              <div>
                {/* Image Cover */}
                <div className="relative h-44 w-full overflow-hidden bg-[#0F172A]">
                  <img
                    src={evt.coverImage}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/45 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#0F172A]/90 backdrop-blur-md text-[#DFBA73] border border-[#C5A059]/40">
                      {translateEventType(evt.type, isEn)}
                    </span>

                    {isClosedDoor ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-700/95 text-white flex items-center gap-1 shadow-sm">
                        <Lock className="w-2.5 h-2.5" />
                        {t('商会闭门 (仅限会员)', 'Closed-Door (Members Only)')}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-700/95 text-white flex items-center gap-1 shadow-sm">
                        <Globe className="w-2.5 h-2.5" />
                        {t('全员公开开放', 'Open to Public')}
                      </span>
                    )}
                  </div>

                  {/* Reward Badge */}
                  <span className="absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full gold-gradient text-[#0F172A] flex items-center gap-1 shadow-md">
                    <Award className="w-3.5 h-3.5" />
                    {t(`签到奖 +${evt.pointsReward}分`, `Check-In +${evt.pointsReward} Pts`)}
                  </span>

                  {/* Title overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-base font-bold text-white leading-tight drop-shadow-md">
                      {evt.title}
                    </h3>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-5 space-y-3.5 text-xs">
                  {/* Organizer Chip */}
                  <div className="flex items-center justify-between text-[11px] pb-2 border-b border-[#E8E6DF]">
                    <span className="text-slate-500">{t('主办发起：', 'Hosted by:')}</span>
                    <span className="font-bold text-[#9E7425] flex items-center gap-1 truncate">
                      <Building2 className="w-3.5 h-3.5 text-[#C5A059] flex-shrink-0" />
                      {translateUserField(
                        evt.organizerCompany || '滑铁卢融商汇官方',
                        isEn,
                        t('滑铁卢融商汇官方', 'WBCA Official')
                      )}
                    </span>
                  </div>

                  <div className="space-y-2 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#9E7425] flex-shrink-0" />
                      <span className="font-bold text-[#0F172A]">{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>

                  <p className="text-slate-600 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>

                  {/* Capacity Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">{t('席位热度', 'Seat Availability')}</span>
                      <span className="text-[#9E7425] font-bold">
                        {t(
                          `已报 ${evt.registeredCount} / 限额 ${evt.capacity}`,
                          `${evt.registeredCount} Registered / ${evt.capacity} Cap`
                        )}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#EFECE4] rounded-full overflow-hidden">
                      <div
                        className="h-full gold-gradient rounded-full"
                        style={{ width: `${percentFull}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-5 pt-3 border-t border-[#E8E6DF] flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedEvent(evt)}
                  className="py-2 px-3 text-xs font-semibold text-[#0F172A] bg-[#F7F7F5] hover:bg-[#EFECE4] border border-[#E8E6DF] rounded-xl transition-colors"
                >
                  {t('日程详情', 'Agenda')}
                </button>

                {evt.isRegistered ? (
                  <button
                    onClick={() => setShowTicketModal(evt)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:bg-emerald-100"
                  >
                    <QrCode className="w-4 h-4" />
                    {evt.checkedIn
                      ? t('已入场 · 电子票', 'Checked In · E-Pass')
                      : t('已报名 · 电子门票', 'Registered · E-Pass')}
                  </button>
                ) : (
                  <button
                    onClick={() => handleRSVP(evt)}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs shadow-sm transition-all ${
                      isClosedDoor && !isMember
                        ? 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
                        : 'gold-gradient hover:brightness-105 text-[#0F172A]'
                    }`}
                  >
                    {isClosedDoor && !isMember
                      ? t('会员专属 (需登录)', 'Members Only (Sign In)')
                      : t('立即在线报名', 'Reserve Seat')}
                  </button>
                )}

                {/* Admin Delete Action */}
                {isAdmin && (
                  <button
                    onClick={() => setDeletingEventId(evt.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                    title={t('彻底删除此活动记录', 'Permanently delete this event')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {events.length === 0 && (
        <div className="text-center py-16 px-6 rounded-3xl border border-dashed border-[#D6D3C9] bg-white luxury-shadow">
          <div className="w-16 h-16 rounded-2xl bg-[#FFFDF7] border border-[#C5A059]/30 text-[#9E7425] mx-auto flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold font-editorial text-[#0F172A] mb-2">
            {t('商会官方品牌活动筹备中', 'Upcoming Alliance Gatherings in Preparation')}
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            {t(
              '所有实名认证企业会员均可在此发起峰会或业务沙龙。立即点击上方「发布商会活动」创建属于您的专属商业对接活动！',
              'Verified WBCA corporate members may host executive summits or business salons here. Click "Host Alliance Event" above to launch your gathering.'
            )}
          </p>
        </div>
      )}

      {/* Step 1: Member Privilege Qualification Check & Auto-Login Modal */}
      {showAuthGateModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-[#0F172A]/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-white border border-[#E8E6DF] rounded-3xl max-w-lg w-full overflow-hidden luxury-shadow relative my-6 sm:my-10 text-[#0F172A]">
            {/* Obsidian Modal Header */}
            <div className="bg-[#0F172A] px-6 py-4 flex items-center justify-between border-b border-[#C5A059]/30 text-white">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-5 h-5 rounded-full gold-gradient text-[#0F172A] font-black text-xs flex items-center justify-center">
                  1
                </span>
                <span className="font-bold text-[#DFBA73]">
                  {t('第一步：核验实名会员资格与登录', 'Step 1: Verify Membership & Sign In')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-[11px] hidden sm:inline">
                  {t('第二步：发布商会活动', 'Step 2: Publish Event')}
                </span>
                <button
                  onClick={() => {
                    setShowAuthGateModal(false);
                    setGateError('');
                    setGateSuccess('');
                  }}
                  className="text-slate-300 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Header Description */}
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FFFDF7] border border-[#C5A059]/40 text-[#9E7425] flex items-center justify-center text-2xl shadow-sm">
                  <ShieldCheck className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-editorial text-[#0F172A]">
                    {t('发起商会活动 · 会员身份前置核验', 'Host Alliance Event · Member Verification')}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                    {isEn ? (
                      <>
                        WBCA upholds strict event governance: summits, roundtables, and salons may only be hosted by <strong className="text-[#0F172A]">verified member enterprises</strong>. Once verified, the <strong className="text-[#9E7425]">event publishing console opens automatically</strong>.
                      </>
                    ) : (
                      <>
                        滑铁卢融商汇严格把控活动商业信誉：所有峰会、私董会与商务沙龙<strong className="text-[#0F172A]">仅限实名认证会员企业</strong>发起。
                        核验通过后，系统将<strong className="text-[#9E7425]">自动直接为您打开活动发布窗口</strong>！
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Status Feedback Banners */}
              {gateError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{gateError}</span>
                </div>
              )}

              {gateSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-semibold">{gateSuccess}</span>
                </div>
              )}

              {/* Method 1: Google One-Click Login */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleGateGoogleSignIn}
                  disabled={gateLoading}
                  className="w-full py-2.5 px-4 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-[0.99] disabled:opacity-60"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>
                    {gateLoading
                      ? t('正在核验会员身份...', 'Verifying member status...')
                      : t('使用 Google 账号一键核验登入并发布', 'Verify & Continue with Google')}
                  </span>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-[#E8E6DF]"></div>
                  <span className="flex-shrink mx-3 text-slate-500 text-[11px]">
                    {t('或输入企业入会登记邮箱核验', 'Or verify with your registered corporate email')}
                  </span>
                  <div className="flex-grow border-t border-[#E8E6DF]"></div>
                </div>

                {/* Method 2: Enterprise Email Verification */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleGateVerifyEmail(gateEmailInput);
                  }}
                  className="space-y-2"
                >
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={gateEmailInput}
                        onChange={(e) => setGateEmailInput(e.target.value)}
                        placeholder={t('例如：baizw2000@gmail.com', 'e.g., partner@company.ca')}
                        className="w-full pl-9 pr-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={gateLoading || !gateEmailInput.trim()}
                      className="px-4 py-2 gold-gradient hover:brightness-105 disabled:opacity-50 text-[#0F172A] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm flex-shrink-0"
                    >
                      <span>{t('核验并进入发布', 'Verify & Proceed')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {onOpenLogin && (
                    <div className="pt-1.5 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAuthGateModal(false);
                          onOpenLogin();
                        }}
                        className="text-[#9E7425] hover:underline font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Key className="w-3 h-3" />
                        <span>{t('使用企业专属密码登录 / 首次激活设置密码', 'Sign in with password / First-time activation')}</span>
                      </button>
                      <span className="text-slate-500 text-[10px]">
                        {t('支持所有域名企业邮', 'All corporate domains supported')}
                      </span>
                    </div>
                  )}
                </form>
              </div>

              {/* Privacy & Authentication Integrity Guarantee */}
              <div className="p-3.5 bg-[#F7F7F5] rounded-2xl border border-[#E8E6DF] space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{t('客户隐私保护与会员实名安全原则', 'Data Privacy & Identity Integrity Standard')}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {t(
                    '滑铁卢融商汇严格执行企业会员隐私与商号权益保护：系统严禁泄露任何商会会员名单或提供未经授权的代登通道，仅限入驻企业持有人使用登记邮箱或 Google 官方认证安全校验。',
                    'WBCA protects member confidentiality and corporate trademarks: unauthorized access or roster exposure is strictly prohibited. Only registered business principals may authenticate via verified email or Google OAuth.'
                  )}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-[#E8E6DF] flex items-center justify-between text-xs">
                {onOpenMerchantApply && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAuthGateModal(false);
                      onOpenMerchantApply();
                    }}
                    className="text-[#9E7425] hover:underline font-bold flex items-center gap-1 transition-colors text-xs"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{t('未入驻？申请加入滑铁卢融商汇', 'Not listed yet? Apply for WBCA Membership')}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowAuthGateModal(false)}
                  className="text-slate-500 hover:text-[#0F172A] text-xs font-medium ml-auto"
                >
                  {t('暂不发布', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal (For Certified Members) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/65 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-white border border-[#E8E6DF] rounded-3xl max-w-3xl w-full my-4 sm:my-8 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Sticky Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-[#C5A059]/25 bg-[#0F172A] flex-shrink-0 z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/35 text-[#DFBA73] flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-editorial flex items-center gap-2 flex-wrap">
                    <span>{t('发起商会活动 · 私董会与商业沙龙', 'Host Alliance Event · Roundtable & Business Salon')}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#C5A059]/20 text-[#DFBA73] border border-[#C5A059]/35 font-sans font-semibold">
                      {t('实名会员专享', 'Verified Members Only')}
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#DFBA73] flex items-center gap-1.5 mt-0.5">
                    <span>
                      {t('主办企业：', 'Host Enterprise: ')}
                      {translateUserField(user?.company, isEn, user?.company || '')} ({translateUserField(user?.name, isEn, user?.name || '')})
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-emerald-300 font-semibold">
                      {t('✓ 已核验实名认证会员', '✓ Verified Member')}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="overflow-y-auto p-5 sm:p-6 space-y-4 text-xs flex-1 bg-white">
                {/* Step 1 Passed Verification Badge */}
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5 text-emerald-900">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      ✓
                    </div>
                    <div>
                      <span className="font-bold text-emerald-800">
                        {t('第一步会员资格核验已通过：', 'Step 1 Membership Verified: ')}
                      </span>
                      <span className="text-[#0F172A] font-semibold">
                        {t('主办企业', 'Host Organization')}: {translateUserField(user?.company, isEn, user?.company || '')}
                      </span>
                      <span className="text-slate-500 text-[11px] ml-1">
                        ({translateUserField(user?.name, isEn, user?.name || '')} · {translateTier(user?.tier || '实名融商会员', isEn)})
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex-shrink-0">
                    {t('具备活动发起权', 'Publishing Authorized')}
                  </span>
                </div>

                {/* Event Title / Name * (Highly Prominent Container) */}
                <div className="p-3.5 bg-[#F7F7F5] rounded-2xl border border-[#C5A059]/45 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                      <span>{t('活动名称 / 标题 *', 'Event Title *')}</span>
                    </label>
                    <span className="text-[11px] text-[#9E7425] font-medium">
                      {t('必填项 · 将在商会日历及海报突出展示', 'Required · Featured on Alliance Calendar & Posters')}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={t(
                      '请输入活动完整名称，如：2026 滑铁卢地区企业出海与跨境仓储协同闭门私董会',
                      'e.g., 2026 Waterloo Cross-Border Expansion & Smart Logistics Roundtable'
                    )}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8E6DF] focus:border-[#C5A059] rounded-xl text-[#0F172A] text-xs sm:text-sm font-semibold placeholder-slate-400 focus:outline-none transition-colors"
                  />
                </div>

              {/* Event Type & Target Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('活动类型', 'Event Format')}
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="高端峰会">{translateEventType('高端峰会', isEn)}</option>
                    <option value="私董会">{translateEventType('私董会', isEn)}</option>
                    <option value="投资酒会">{translateEventType('投资酒会', isEn)}</option>
                    <option value="创业研讨">{translateEventType('创业研讨', isEn)}</option>
                    <option value="业务推介">{translateEventType('业务推介', isEn)}</option>
                    <option value="公益慈善">{translateEventType('公益慈善', isEn)}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('报名开放范围 *', 'Registration Eligibility *')}
                  </label>
                  <select
                    value={newTargetAudience}
                    onChange={(e) => setNewTargetAudience(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="ALL">
                      {t(
                        '全员公开开放（会员与潜在客户皆可报名 · 助力企业拓客）',
                        'Open to Public (Members & External Guests · Ideal for Lead Gen)'
                      )}
                    </option>
                    <option value="MEMBERS_ONLY">
                      {t(
                        '商会闭门活动（仅限本商会实名认证企业会员报名）',
                        'Closed-Door Session (Verified WBCA Members Only)'
                      )}
                    </option>
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('举办日期 *', 'Event Date *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder={t('如：2026年11月28日 (周六)', 'e.g., Nov 28, 2026 (Sat)')}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('具体时间段 *', 'Time Window *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder={t('如：14:00 - 17:30 EST', 'e.g., 14:00 - 17:30 EST')}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Location & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('活动地点 *', 'Venue / Location *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder={t(
                      '如：Waterloo Innovation Outpost 或 线上Zoom',
                      'e.g., Waterloo Innovation Outpost or Virtual Zoom'
                    )}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('席位上限 (人)', 'Capacity (Seats)')}
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Points Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#F7F7F5] rounded-2xl border border-[#E8E6DF]">
                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('门票积分门槛 (0 = 免费参与)', 'Ticket Credits Required (0 = Free)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={newPointsCost}
                    onChange={(e) => setNewPointsCost(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-[#E8E6DF] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-[#0F172A] font-semibold mb-1">
                    {t('现场扫码签到积分奖励 (点)', 'On-Site QR Check-In Bonus (Pts)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={newPointsReward}
                    onChange={(e) => setNewPointsReward(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-[#E8E6DF] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Event Cover Poster Center: Upload Custom Poster / Chamber Presets / Direct URL */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#F7F7F5] border border-[#E8E6DF]">
                {/* Header & Mode Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E8E6DF]">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#C5A059]" />
                      {t('活动封面主视觉海报 *', 'Event Key Visual Poster *')}
                    </label>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-[#9E7425] border border-[#C5A059]/35 font-medium">
                      {t('商户自主设计上传 · 突破升级', 'Custom Design Upload Supported')}
                    </span>
                  </div>

                  {newCover && (
                    <button
                      type="button"
                      onClick={handleResetCover}
                      className="self-end sm:self-auto text-xs text-slate-500 hover:text-[#9E7425] flex items-center gap-1 transition-colors"
                      title={t('重置海报', 'Reset Poster')}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{t('重置海报', 'Reset Poster')}</span>
                    </button>
                  )}
                </div>

                {/* Live 16:9 Card Banner Preview */}
                <div className="relative rounded-2xl overflow-hidden border border-[#C5A059]/45 bg-white shadow-md group">
                  <div className="relative h-44 sm:h-52 w-full bg-[#0F172A] overflow-hidden flex items-center justify-center">
                    {isProcessingCover ? (
                      <div className="flex flex-col items-center gap-2.5 text-[#DFBA73] py-8">
                        <div className="w-9 h-9 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold">
                          {t('正在智能解析并压制 16:9 高清海报画布...', 'Optimizing 16:9 HD poster canvas...')}
                        </span>
                        <span className="text-[11px] text-slate-300">
                          {t('已自动保持原始色彩与清晰度', 'Preserving original color fidelity and sharpness')}
                        </span>
                      </div>
                    ) : (
                      <img
                        src={newCover}
                        alt={t('活动海报预览', 'Event Poster Preview')}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/45 to-black/25 pointer-events-none" />

                    {/* Top Badges Overlay */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#0F172A]/85 backdrop-blur-md text-[#DFBA73] border border-[#C5A059]/40 shadow">
                          {translateEventType(newType, isEn)}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0F172A]/85 backdrop-blur-md text-slate-200 border border-white/15 shadow">
                          {newTargetAudience === 'MEMBERS_ONLY'
                            ? t('🔒 闭门独享', '🔒 Members Only')
                            : t('🌐 全员开放', '🌐 Open Access')}
                        </span>
                      </div>

                      {/* Poster Origin Badge */}
                      <div className="flex items-center gap-1.5">
                        {newCover.startsWith('data:image/') ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1 shadow-md">
                            <Check className="w-3 h-3" />
                            {t('商户自主设计海报 (高保真)', 'Custom Member Poster (HD)')}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#0F172A]/80 text-[#DFBA73] border border-[#C5A059]/40 backdrop-blur-md">
                            {t('商会精选视觉', 'Curated Alliance Visual')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Live Info Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                      <p className="text-[11px] text-[#DFBA73] font-bold mb-1 flex items-center gap-1 drop-shadow">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{newDate}</span>
                        <span className="text-slate-400">·</span>
                        <span className="truncate">{newLocation}</span>
                      </p>
                      <h4 className="text-sm sm:text-base font-black text-white line-clamp-1 drop-shadow-md">
                        {newTitle.trim() || t('（在此输入活动标题，上方即时同步海报效果）', '(Enter your event title below to preview live)')}
                      </h4>
                    </div>

                    {/* Quick Trigger Button */}
                    <div className="absolute inset-0 bg-[#0F172A]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCoverSourceTab('upload');
                          coverFileInputRef.current?.click();
                        }}
                        className="px-3.5 py-2 rounded-xl gold-gradient text-[#0F172A] text-xs font-bold flex items-center gap-1.5 shadow-lg transform active:scale-95 transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{t('点击更换我的设计海报', 'Upload Custom Poster')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Status Bar */}
                  <div className="px-3.5 py-2 bg-white border-t border-[#E8E6DF] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="text-slate-700 flex items-center gap-2">
                      <span className="font-medium">
                        {newCover.startsWith('data:image/')
                          ? `${t('已应用自制海报：', 'Custom poster applied: ')}${customPosterName || t('本地设计文件', 'Local file')}`
                          : PRESET_COVERS.find((p) => p.url === newCover)
                          ? `${t('已应用商会精选：', 'Curated visual applied: ')}${isEn ? PRESET_COVERS.find((p) => p.url === newCover)?.nameEn : PRESET_COVERS.find((p) => p.url === newCover)?.name}`
                          : t('已应用自定义链接海报', 'External poster URL applied')}
                      </span>
                      {customPosterSizeKb && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px]">
                          {t(`✓ 约 ${customPosterSizeKb} KB (极速压制完成)`, `✓ ~${customPosterSizeKb} KB (Optimized)`)}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500 text-[10px]">
                      {t('标准 16:9 展位 · 完美适配移动端与大屏', 'Standard 16:9 Aspect · Responsive on Mobile & Desktop')}
                    </span>
                  </div>
                </div>

                {/* Source Selection Tabs */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5 border-b border-[#E8E6DF] pb-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setCoverSourceTab('upload')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        coverSourceTab === 'upload'
                          ? 'bg-[#0F172A] text-[#DFBA73] border border-[#0F172A] shadow-sm'
                          : 'text-slate-600 hover:text-[#0F172A] bg-white border border-[#E8E6DF]'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t('本地自设计海报上传', 'Upload Custom Artwork')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCoverSourceTab('presets')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        coverSourceTab === 'presets'
                          ? 'bg-[#0F172A] text-[#DFBA73] border border-[#0F172A] shadow-sm'
                          : 'text-slate-600 hover:text-[#0F172A] bg-white border border-[#E8E6DF]'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{t(`商会精选图库 (${PRESET_COVERS.length} 款)`, `Curated Gallery (${PRESET_COVERS.length})`)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCoverSourceTab('url')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        coverSourceTab === 'url'
                          ? 'bg-[#0F172A] text-[#DFBA73] border border-[#0F172A] shadow-sm'
                          : 'text-slate-600 hover:text-[#0F172A] bg-white border border-[#E8E6DF]'
                      }`}
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>{t('网络海报链接', 'Image URL')}</span>
                    </button>
                  </div>

                  {/* Tab 1: Local File Upload */}
                  {coverSourceTab === 'upload' && (
                    <div className="space-y-2 animate-in fade-in">
                      <input
                        ref={coverFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverFileUpload}
                        className="hidden"
                        id="event-cover-custom-upload"
                      />
                      <label
                        htmlFor="event-cover-custom-upload"
                        className="flex flex-col items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-[#D6D3C9] hover:border-[#C5A059] rounded-2xl bg-white hover:bg-[#EFECE4]/40 cursor-pointer transition-all group"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-[#C5A059]/35 text-[#9E7425] flex items-center justify-center transition-colors">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-center space-y-0.5">
                          <p className="text-xs font-bold text-[#0F172A] group-hover:text-[#9E7425] transition-colors">
                            {newCover.startsWith('data:image/')
                              ? t('已选用自制海报 · 点击即可重新选择上传', 'Custom poster loaded · Click to replace')
                              : t(
                                  '点击从手机相册或电脑本地选择您设计好的活动海报 (JPG / PNG / WebP)',
                                  'Select your custom event banner from device storage (JPG / PNG / WebP)'
                                )}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {t(
                              '支持 Canva、Photoshop、Keynote 等设计工具导出的各类横版活动主视觉，系统自动进行无损轻量化适配！',
                              'Supports landscape artwork exported from Canva, Photoshop, or Keynote with automatic HD web optimization.'
                            )}
                          </p>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Tab 2: Preset Covers Grid */}
                  {coverSourceTab === 'presets' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-in fade-in">
                      {PRESET_COVERS.map((preset) => {
                        const isSelected = newCover === preset.url;
                        const labelName = isEn ? preset.nameEn : preset.name;
                        const labelTag = isEn ? preset.tagEn : preset.tag;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => {
                              setNewCover(preset.url);
                              setCustomPosterName('');
                              setCustomPosterSizeKb(null);
                            }}
                            className={`group relative h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-[#C5A059] ring-2 ring-[#C5A059]/30 scale-[1.02]'
                                : 'border-[#E8E6DF] opacity-80 hover:opacity-100 hover:border-[#C5A059]/60'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={labelName}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />
                            
                            <div className="absolute top-1.5 left-1.5">
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#0F172A]/85 text-[#DFBA73] border border-[#C5A059]/35">
                                {labelTag}
                              </span>
                            </div>

                            <div className="absolute bottom-1.5 left-1.5 right-1.5">
                              <p className="text-[10px] font-semibold text-white truncate drop-shadow">
                                {labelName}
                              </p>
                            </div>

                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full gold-gradient text-[#0F172A] flex items-center justify-center font-bold text-[9px] shadow">
                                ✓
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tab 3: Direct URL Input */}
                  {coverSourceTab === 'url' && (
                    <div className="space-y-1.5 animate-in fade-in">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={inputCoverUrl}
                          onChange={(e) => setInputCoverUrl(e.target.value)}
                          placeholder={t(
                            '输入在线图片直链 URL (如：https://images.unsplash.com/...)',
                            'Enter direct image URL (e.g., https://images.unsplash.com/...)'
                          )}
                          className="flex-1 px-3 py-2 bg-white border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059] text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCustomUrl}
                          className="px-4 py-2 gold-gradient text-[#0F172A] font-bold rounded-xl text-xs transition-opacity hover:opacity-95"
                        >
                          {t('应用链接', 'Apply URL')}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {t(
                          '提示：支持将自建图床、CDN 或 Unsplash 高清图链直接粘贴在此处。',
                          'Tip: Paste any CDN, image host, or high-resolution Unsplash image link.'
                        )}
                      </p>
                    </div>
                  )}

                  {coverError && (
                    <p className="text-[11px] text-rose-700 font-medium">{coverError}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#0F172A] font-semibold mb-1">
                  {t('活动详细介绍与议程主旨 *', 'Event Overview & Agenda Highlights *')}
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder={t(
                    '请详细说明活动的参会对象、演讲主旨、能够为参会商户带来的核心商业价值...',
                    'Describe target attendees, keynote themes, and the strategic commercial value for participating enterprises...'
                  )}
                  className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              </div>

              {/* Modal Sticky Footer */}
              <div className="p-4 sm:p-5 border-t border-[#E8E6DF] bg-[#F7F7F5] flex items-center justify-between gap-3 flex-shrink-0 z-20">
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  {t('发布后将自动同步至商会日历与云端数据库', 'Automatically syncs to the Alliance Calendar & cloud database upon publishing')}
                </p>
                <div className="flex items-center gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-white hover:bg-[#EFECE4] text-slate-700 border border-[#E8E6DF] rounded-xl font-medium text-xs transition-colors"
                  >
                    {t('取消', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 gold-gradient text-[#0F172A] font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 text-xs active:scale-95 hover:opacity-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{t('确认发布并上架至商会日历', 'Publish to Alliance Calendar')}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Event Confirm Dialog */}
      {deletingEventId && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-2xl max-w-sm w-full p-6 space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-2xl">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] font-editorial">
              {t('确认彻底删除该活动？', 'Permanently Delete Event?')}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t(
                '此操作将永久彻底从商会云端 Firestore 数据库中删除此活动及参会记录，不可撤回！',
                'This action permanently deletes the event and its registration records from Firestore and cannot be undone.'
              )}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3 text-xs">
              <button
                onClick={() => setDeletingEventId(null)}
                className="px-4 py-2 bg-[#F7F7F5] hover:bg-[#EFECE4] text-slate-700 border border-[#E8E6DF] rounded-xl font-medium"
              >
                {t('取消', 'Cancel')}
              </button>
              <button
                onClick={() => handleConfirmDeleteEvent(deletingEventId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm"
              >
                {t('确认删除', 'Confirm Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agenda Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/65 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-[#E8E6DF] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-[#C5A059]/25 bg-[#0F172A] px-6 py-4 flex-shrink-0">
              <h3 className="text-base font-bold text-white font-editorial">
                {t('活动全案与日程安排', 'Event Brief & Program Agenda')}
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-white">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-[#9E7425] font-editorial">
                  {selectedEvent.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <h5 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  {t('会议日程安排 (Agenda)', 'Program Agenda')}
                </h5>
                <div className="space-y-2.5">
                  {(selectedEvent.agenda || []).map((ag, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[#9E7425] font-semibold">
                        <span>{ag.time}</span>
                        <span className="text-[11px] text-slate-500">{ag.speaker}</span>
                      </div>
                      <p className="text-[#0F172A] font-medium">{ag.topic}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-[#E8E6DF] bg-[#F7F7F5] flex justify-end flex-shrink-0">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                {t('关闭', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Electronic Ticket & QR Check-in Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-[#E8E6DF] rounded-3xl max-w-sm w-full overflow-hidden text-center shadow-2xl relative">
            <div className="bg-[#0F172A] px-6 py-5 border-b border-[#C5A059]/30 relative">
              <button
                onClick={() => setShowTicketModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1.5 pt-1">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#C5A059]/20 text-[#DFBA73] border border-[#C5A059]/40 text-xs font-bold">
                  <QrCode className="w-3.5 h-3.5" />
                  {t('融商汇数字通行凭证', 'WBCA Digital Event Pass')}
                </div>
                <h3 className="text-base font-bold text-white font-editorial pt-1">
                  {showTicketModal.title}
                </h3>
                <p className="text-xs text-slate-300">
                  {t('持票嘉宾:', 'Pass Holder:')}{' '}
                  {translateUserField(user?.name, isEn, t('会员嘉宾', 'Guest Member'))} (
                  {translateUserField(user?.company, isEn, t('融商汇成员', 'WBCA Member'))})
                </p>
              </div>
            </div>

            <div className="p-6 space-y-5 bg-white">
              {/* Dynamic QR Code Card */}
              <div className="bg-[#F7F7F5] p-4 rounded-2xl shadow-inner mx-auto inline-block border-2 border-[#C5A059]/45">
                <div className="w-48 h-48 bg-[#0F172A] p-2 rounded-xl flex flex-col items-center justify-center space-y-2">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-36 h-36 fill-current text-white"
                  >
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
                  <span className="text-[9px] text-[#DFBA73] font-mono tracking-widest uppercase">
                    WBCA-PASS-2026-X889
                  </span>
                </div>
              </div>

              {/* Check-in Status */}
              <div className="space-y-2">
                {showTicketModal.checkedIn ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {t('已在现场成功签到入场 · 积分奖励已发放！', 'Checked in on-site · Bonus credits awarded!')}
                  </div>
                ) : (
                  <button
                    onClick={() => handleSimulateCheckIn(showTicketModal)}
                    className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    {t(
                      `模拟现场扫码打卡 (领 +${showTicketModal.pointsReward} 积分)`,
                      `Simulate On-Site QR Check-In (+${showTicketModal.pointsReward} Pts)`
                    )}
                  </button>
                )}

                <p className="text-[11px] text-slate-500">
                  {t(
                    '出示给签到处志愿者扫码，即可自动完成出勤积分确权。',
                    'Present this pass at check-in to record attendance and claim trust credits.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
