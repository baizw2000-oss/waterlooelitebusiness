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
    tag: '峰会主场',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'gala',
    name: '精英闭门 · 私董晚宴',
    tag: '高端晚宴',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'speech',
    name: '华商演讲 · 讲坛主场',
    tag: '名家讲坛',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'salon',
    name: '创客沙龙 · 灵感工坊',
    tag: '灵感工坊',
    url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'tech',
    name: '跨境出海 · 科技展厅',
    tag: '科技出海',
    url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'wealth',
    name: '金融财富 · 投资圆桌',
    tag: '财富管理',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'networking',
    name: '人脉酒会 · 璀璨社交',
    tag: '人脉酒会',
    url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'startup',
    name: '青年创投 · 孵化路演',
    tag: '创新路演',
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
      setGateError('请输入您入驻商会时登记的企业邮箱');
      return;
    }

    setGateLoading(true);
    setTimeout(() => {
      setGateLoading(false);
      const matched = approvedMerchants.find(
        (m) => m.email && m.email.toLowerCase() === cleanEmail
      );

      if (matched) {
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
        setGateSuccess(`🎉 第一步会员资格核验成功！已识别为「${matched.name}」实名会员，正在为您直接开启活动发布表单...`);
        setTimeout(() => {
          setShowAuthGateModal(false);
          setShowCreateModal(true);
          setGateSuccess('');
          setGateEmailInput('');
        }, 1000);
      } else {
        setGateError(
          `未在商会已审核的名商名录中检索到邮箱「${cleanEmail}」。请确认是否为入会申请登记的企业邮箱，或点击下方【申请加入滑铁卢融商汇】。`
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
      const googleName = result.user.displayName || 'Google 会员';

      if (!googleEmail) {
        setGateError('未能获取 Google 邮箱信息，请尝试直接输入企业邮箱。');
        setGateLoading(false);
        return;
      }

      const matched = approvedMerchants.find(
        (m) => m.email && m.email.toLowerCase() === googleEmail
      );

      if (matched) {
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
        setGateSuccess(`🎉 Google 登录成功！已匹配认证企业「${matched.name}」，正在自动为您开启活动发布界面...`);
        setTimeout(() => {
          setShowAuthGateModal(false);
          setShowCreateModal(true);
          setGateSuccess('');
        }, 1000);
      } else {
        setGateError(
          `Google 账号 (${googleEmail}) 登录成功，但在商会名录中尚未匹配到已入驻的认证企业。请使用入会登记邮箱核验，或先提交企业入驻申请。`
        );
      }
    } catch (err: any) {
      console.warn('Google sign-in popup error in gate modal:', err);
      setGateError(
        err?.message?.includes('popup-closed-by-user')
          ? '您取消了 Google 登录窗口。'
          : 'Google 认证服务遇到问题，请使用下方【企业认证邮箱快捷输入】。'
      );
    } finally {
      setGateLoading(false);
    }
  };

  // Form states for creating event
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ChamberEvent['type']>('高端峰会');
  const [newDate, setNewDate] = useState('2026年11月28日 (周六)');
  const [newTime, setNewTime] = useState('14:00 - 17:30 EST');
  const [newLocation, setNewLocation] = useState('Waterloo Innovation Outpost · 创商汇大会厅');
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
      setCoverError('请选择有效的图片文件（支持 JPG, PNG, WebP）');
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
        setCoverError('图片解析失败，请尝试其他海报图片');
        setIsProcessingCover(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setCoverError('读取海报文件出错');
      setIsProcessingCover(false);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoverUrl.trim()) return;
    setNewCover(inputCoverUrl.trim());
    setCustomPosterName('外部网络海报链接');
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
      organizerCompany: user?.company || '融商汇认证企业',
      targetAudience: newTargetAudience,
      createdAt: new Date().toISOString(),
      agenda: [
        { time: '13:30 - 14:00', topic: '会员嘉宾签到与商界名片自由交流', speaker: '会务组' },
        { time: '14:00 - 15:30', topic: newTitle.trim() + ' · 核心主旨分享与项目路演', speaker: `${user?.name || '主办企业负责人'} (${user?.company || '主办方'})` },
        { time: '15:30 - 16:30', topic: '行业圆桌探讨与点对点合作对接沙龙', speaker: '全体特邀参会企业' },
        { time: '16:30 - 17:30', topic: '自由私洽、合影留念与商会闭门冷餐晚宴', speaker: '全体嘉宾' }
      ]
    };

    if (onAddEvent) {
      onAddEvent(newEvent);
    }

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setShowCreateModal(false);
    setNotice(`🎉 商务活动「${newEvent.title}」已成功发布并同步至云端数据库！`);
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
    setNotice('🗑 活动已从云端数据库彻底删除！');
    setTimeout(() => setNotice(''), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-400" />
            滑铁卢融商汇 品牌活动与闭门私董
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            高端峰会 · 私董沙龙 · 投融资对接 · 认证会员可自主发起 · 扫码签到享积分确权
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStartCreateEvent}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 ${
              isMember
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                : 'bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/40 hover:border-amber-400 shadow-slate-900/50'
            }`}
            title={isMember ? '您已通过实名会员资格核验，可直接发起商会商务活动' : '发布商会活动需先进行实名会员资格核验与登录'}
          >
            {isMember ? (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>发布商会活动 / 沙龙</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-950/20 text-slate-950 font-black">
                  实名会员
                </span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-amber-400" />
                <span>发布商会活动 / 沙龙</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  需核验会员身份
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success / Alert Toast */}
      {notice && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/50 shadow-xl shadow-amber-500/10 text-white flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xs text-slate-200">{notice}</p>
          </div>
          <button onClick={() => setNotice('')} className="text-slate-400 hover:text-white">
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
              className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all overflow-hidden flex flex-col justify-between shadow-xl group"
            >
              <div>
                {/* Image Cover */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                  <img
                    src={evt.coverImage}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-500/40">
                      {evt.type}
                    </span>

                    {isClosedDoor ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/90 text-white flex items-center gap-1 shadow-md">
                        <Lock className="w-2.5 h-2.5" />
                        商会闭门 (仅限会员)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600/90 text-white flex items-center gap-1 shadow-md">
                        <Globe className="w-2.5 h-2.5" />
                        全员公开开放
                      </span>
                    )}
                  </div>

                  {/* Reward Badge */}
                  <span className="absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/90 text-slate-950 flex items-center gap-1 shadow-md">
                    <Award className="w-3.5 h-3.5" />
                    签到奖 +{evt.pointsReward}分
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
                  <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-800/80">
                    <span className="text-slate-400">主办发起：</span>
                    <span className="font-semibold text-amber-300 flex items-center gap-1 truncate">
                      <Building2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      {evt.organizerCompany || '滑铁卢融商汇官方'}
                    </span>
                  </div>

                  <div className="space-y-2 text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="font-semibold text-white">{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>

                  <p className="text-slate-400 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>

                  {/* Capacity Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">席位热度</span>
                      <span className="text-amber-300 font-semibold">
                        已报 {evt.registeredCount} / 限额 {evt.capacity}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                        style={{ width: `${percentFull}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-5 pt-0 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
                <button
                  onClick={() => setSelectedEvent(evt)}
                  className="py-2 px-3 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  日程详情
                </button>

                {evt.isRegistered ? (
                  <button
                    onClick={() => setShowTicketModal(evt)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:bg-emerald-500/30"
                  >
                    <QrCode className="w-4 h-4" />
                    {evt.checkedIn ? '已入场 · 电子票' : '已报名 · 电子门票'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleRSVP(evt)}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs shadow-md transition-all ${
                      isClosedDoor && !isMember
                        ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                    }`}
                  >
                    {isClosedDoor && !isMember ? '会员专属 (需登录)' : '立即在线报名'}
                  </button>
                )}

                {/* Admin Delete Action */}
                {isAdmin && (
                  <button
                    onClick={() => setDeletingEventId(evt.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors"
                    title="彻底删除此活动记录"
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
        <div className="text-center py-16 px-6 rounded-3xl border border-dashed border-slate-800 bg-slate-900/40">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">商会官方品牌活动筹备中</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            所有实名认证企业会员均可在此发起峰会或业务沙龙。立即点击上方「发布商会活动」创建属于您的专属商业对接活动！
          </p>
        </div>
      )}

      {/* Step 1: Member Privilege Qualification Check & Auto-Login Modal */}
      {showAuthGateModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative my-6 sm:my-10">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowAuthGateModal(false);
                setGateError('');
                setGateSuccess('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Stepper Progress Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-sm">
                  1
                </span>
                <span className="font-bold text-amber-300">第一步：核验实名会员资格与登录</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                <span>第二步：发布商会活动</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Header Description */}
            <div className="text-center space-y-2 pt-1">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-2xl shadow-lg">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  发起商会活动 · 会员身份前置核验
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                  滑铁卢融商汇严格把控活动商业信誉：所有峰会、私董会与商务沙龙<strong>仅限实名认证会员企业</strong>发起。
                  核验通过后，系统将<strong>自动直接为您打开活动发布窗口</strong>！
                </p>
              </div>
            </div>

            {/* Status Feedback Banners */}
            {gateError && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{gateError}</span>
              </div>
            )}

            {gateSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed font-semibold">{gateSuccess}</span>
              </div>
            )}

            {/* Method 1: Google One-Click Login */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleGateGoogleSignIn}
                disabled={gateLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-[0.99] disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{gateLoading ? '正在核验会员身份...' : '使用 Google 账号一键核验登入并发布'}</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-slate-500 text-[11px]">或输入企业入会登记邮箱核验</span>
                <div className="flex-grow border-t border-slate-800"></div>
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
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={gateEmailInput}
                      onChange={(e) => setGateEmailInput(e.target.value)}
                      placeholder="例如：baizw2000@gmail.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={gateLoading || !gateEmailInput.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md flex-shrink-0"
                  >
                    <span>核验并进入发布</span>
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
                      className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Key className="w-3 h-3" />
                      <span>使用企业专属密码登录 / 首次激活设置密码</span>
                    </button>
                    <span className="text-slate-500 text-[10px]">
                      支持所有域名企业邮
                    </span>
                  </div>
                )}
              </form>
            </div>

            {/* Privacy & Authentication Integrity Guarantee */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>客户隐私保护与会员实名安全原则</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                滑铁卢融商汇严格执行企业会员隐私与商号权益保护：系统严禁泄露任何商会会员名单或提供未经授权的代登通道，仅限入驻企业持有人使用登记邮箱或 Google 官方认证安全校验。
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              {onOpenMerchantApply && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthGateModal(false);
                    onOpenMerchantApply();
                  }}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors text-xs"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>未入驻？申请加入滑铁卢融商汇</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowAuthGateModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-medium ml-auto"
              >
                暂不发布
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal (For Certified Members) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-3xl w-full my-4 sm:my-8 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Sticky Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-slate-800 bg-slate-900 flex-shrink-0 z-20">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>发起商会活动 · 私董会与商业沙龙</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                      实名会员专享
                    </span>
                  </h3>
                  <p className="text-[11px] text-amber-400/90 flex items-center gap-1.5 mt-0.5">
                    <span>主办企业：{user?.company} ({user?.name})</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-emerald-400 font-semibold">✓ 已核验实名认证会员</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="overflow-y-auto p-5 sm:p-6 space-y-4 text-xs flex-1">
                {/* Step 1 Passed Verification Badge */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-emerald-300">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      ✓
                    </div>
                    <div>
                      <span className="font-bold text-emerald-400">第一步会员资格核验已通过：</span>
                      <span className="text-white font-semibold">主办企业【{user?.company}】</span>
                      <span className="text-slate-400 text-[11px] ml-1">({user?.name} · {user?.tier || '实名融商会员'})</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex-shrink-0">
                    具备活动发起权
                  </span>
                </div>

                {/* Event Title / Name * (Highly Prominent Container) */}
                <div className="p-3.5 bg-slate-950/90 rounded-2xl border-2 border-amber-500/50 shadow-inner space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
                      <span>活动名称 / 标题 *</span>
                    </label>
                    <span className="text-[11px] text-amber-400/80 font-medium">必填项 · 将在商会日历及海报突出展示</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="请输入活动完整名称，如：2026 滑铁卢地区企业出海与跨境仓储协同闭门私董会"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl text-white text-xs sm:text-sm font-semibold placeholder-slate-500 focus:outline-none transition-colors shadow-inner"
                  />
                </div>

              {/* Event Type & Target Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    活动类型
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="高端峰会">高端峰会</option>
                    <option value="私董会">私董会</option>
                    <option value="投资酒会">投资酒会</option>
                    <option value="创业研讨">创业研讨</option>
                    <option value="业务推介">业务推介</option>
                    <option value="公益慈善">公益慈善</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    报名开放范围 *
                  </label>
                  <select
                    value={newTargetAudience}
                    onChange={(e) => setNewTargetAudience(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="ALL">全员公开开放（会员与潜在客户皆可报名 · 助力企业拓客）</option>
                    <option value="MEMBERS_ONLY">商会闭门活动（仅限本商会实名认证企业会员报名）</option>
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    举办日期 *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="如：2026年11月28日 (周六)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    具体时间段 *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="如：14:00 - 17:30 EST"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Location & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    活动地点 *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="如：Waterloo Innovation Outpost 或 线上Zoom"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    席位上限 (人)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Points Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    门票积分门槛 (0 = 免费参与)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={newPointsCost}
                    onChange={(e) => setNewPointsCost(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    现场扫码签到积分奖励 (点)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={newPointsReward}
                    onChange={(e) => setNewPointsReward(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Event Cover Poster Center: Upload Custom Poster / Chamber Presets / Direct URL */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                {/* Header & Mode Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      活动封面主视觉海报 *
                    </label>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border border-amber-500/30 font-medium">
                      商户自主设计上传 · 突破升级
                    </span>
                  </div>

                  {newCover && (
                    <button
                      type="button"
                      onClick={handleResetCover}
                      className="self-end sm:self-auto text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                      title="重置海报"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>重置海报</span>
                    </button>
                  )}
                </div>

                {/* Live 16:9 Card Banner Preview */}
                <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-slate-900 shadow-xl group">
                  <div className="relative h-44 sm:h-52 w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                    {isProcessingCover ? (
                      <div className="flex flex-col items-center gap-2.5 text-amber-300 py-8">
                        <div className="w-9 h-9 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold">正在智能解析并压制 16:9 高清海报画布...</span>
                        <span className="text-[11px] text-slate-400">已自动保持原始色彩与清晰度</span>
                      </div>
                    ) : (
                      <img
                        src={newCover}
                        alt="Event Poster Preview"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/25 pointer-events-none" />

                    {/* Top Badges Overlay */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-md text-amber-300 border border-amber-500/40 shadow">
                          {newType}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-md text-slate-200 border border-slate-700 shadow">
                          {newTargetAudience === 'MEMBERS_ONLY' ? '🔒 闭门独享' : '🌐 全员开放'}
                        </span>
                      </div>

                      {/* Poster Origin Badge */}
                      <div className="flex items-center gap-1.5">
                        {newCover.startsWith('data:image/') ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-md">
                            <Check className="w-3 h-3" />
                            商户自主设计海报 (高保真)
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                            商会精选视觉
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Live Info Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                      <p className="text-[11px] text-amber-400 font-bold mb-1 flex items-center gap-1 drop-shadow">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{newDate}</span>
                        <span className="text-slate-400">·</span>
                        <span className="truncate">{newLocation}</span>
                      </p>
                      <h4 className="text-sm sm:text-base font-black text-white line-clamp-1 drop-shadow-md">
                        {newTitle.trim() || '（在此输入活动标题，上方即时同步海报效果）'}
                      </h4>
                    </div>

                    {/* Quick Trigger Button */}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCoverSourceTab('upload');
                          coverFileInputRef.current?.click();
                        }}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg transform active:scale-95 transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>点击更换我的设计海报</span>
                      </button>
                    </div>
                  </div>

                  {/* Status Bar */}
                  <div className="px-3.5 py-2 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="text-slate-300 flex items-center gap-2">
                      <span className="font-medium">
                        {newCover.startsWith('data:image/')
                          ? `已应用自制海报：${customPosterName || '本地设计文件'}`
                          : PRESET_COVERS.find((p) => p.url === newCover)
                          ? `已应用商会精选：${PRESET_COVERS.find((p) => p.url === newCover)?.name}`
                          : '已应用自定义链接海报'}
                      </span>
                      {customPosterSizeKb && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px]">
                          ✓ 约 {customPosterSizeKb} KB (极速压制完成)
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 text-[10px]">
                      标准 16:9 展位 · 完美适配移动端与大屏
                    </span>
                  </div>
                </div>

                {/* Source Selection Tabs */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <button
                      type="button"
                      onClick={() => setCoverSourceTab('upload')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        coverSourceTab === 'upload'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>本地自设计海报上传</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCoverSourceTab('presets')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        coverSourceTab === 'presets'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>商会精选图库 ({PRESET_COVERS.length} 款)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCoverSourceTab('url')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        coverSourceTab === 'url'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>网络海报链接</span>
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
                        className="flex flex-col items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-slate-700 hover:border-amber-400/80 rounded-2xl bg-slate-900/60 hover:bg-slate-900 cursor-pointer transition-all group"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 group-hover:bg-amber-500/25 text-amber-400 flex items-center justify-center transition-colors">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-center space-y-0.5">
                          <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                            {newCover.startsWith('data:image/')
                              ? '已选用自制海报 · 点击即可重新选择上传'
                              : '点击从手机相册或电脑本地选择您设计好的活动海报 (JPG / PNG / WebP)'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            支持 Canva、Photoshop、Keynote 等设计工具导出的各类横版活动主视觉，系统自动进行无损轻量化适配！
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
                                ? 'border-amber-400 ring-2 ring-amber-400/30 scale-[1.02]'
                                : 'border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-600'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                            
                            <div className="absolute top-1.5 left-1.5">
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-900/80 text-amber-300 border border-amber-500/30">
                                {preset.tag}
                              </span>
                            </div>

                            <div className="absolute bottom-1.5 left-1.5 right-1.5">
                              <p className="text-[10px] font-semibold text-white truncate drop-shadow">
                                {preset.name}
                              </p>
                            </div>

                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[9px] shadow">
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
                          placeholder="输入在线图片直链 URL (如：https://images.unsplash.com/...)"
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCustomUrl}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                        >
                          应用链接
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        提示：支持将自建图床、CDN 或 Unsplash 高清图链直接粘贴在此处。
                      </p>
                    </div>
                  )}

                  {coverError && (
                    <p className="text-[11px] text-rose-400 font-medium">{coverError}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  活动详细介绍与议程主旨 *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="请详细说明活动的参会对象、演讲主旨、能够为参会商户带来的核心商业价值..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              </div>

              {/* Modal Sticky Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between gap-3 flex-shrink-0 z-20">
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  发布后将自动同步至商会日历与云端数据库
                </p>
                <div className="flex items-center gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-medium text-xs transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 text-xs active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>确认发布并上架至商会日历</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Event Confirm Dialog */}
      {deletingEventId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-sm w-full p-6 space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">确认彻底删除该活动？</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              此操作将永久彻底从商会云端 Firestore 数据库中删除此活动及参会记录，不可撤回！
            </p>
            <div className="pt-2 flex items-center justify-center gap-3 text-xs">
              <button
                onClick={() => setDeletingEventId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
              >
                取消
              </button>
              <button
                onClick={() => handleConfirmDeleteEvent(deletingEventId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agenda Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                活动全案与日程安排
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-amber-300">
                {selectedEvent.title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedEvent.description}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <h5 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                会议日程安排 (Agenda)
              </h5>
              <div className="space-y-2.5">
                {(selectedEvent.agenda || []).map((ag, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-amber-400 font-semibold">
                      <span>{ag.time}</span>
                      <span className="text-[11px] text-slate-400">{ag.speaker}</span>
                    </div>
                    <p className="text-white font-medium">{ag.topic}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Electronic Ticket & QR Check-in Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-sm w-full p-6 space-y-5 text-center shadow-2xl relative">
            <button
              onClick={() => setShowTicketModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pt-2">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                <QrCode className="w-3.5 h-3.5" />
                融商汇数字通行凭证
              </div>
              <h3 className="text-base font-bold text-white pt-1">
                {showTicketModal.title}
              </h3>
              <p className="text-xs text-slate-400">
                持票嘉宾: {user?.name || '会员嘉宾'} ({user?.company || '融商汇成员'})
              </p>
            </div>

            {/* Dynamic QR Code Card */}
            <div className="bg-white p-5 rounded-2xl shadow-inner mx-auto inline-block border-4 border-amber-400/40">
              <div className="w-48 h-48 bg-slate-950 p-2 rounded-xl flex flex-col items-center justify-center space-y-2">
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
                <span className="text-[9px] text-amber-400 font-mono tracking-widest uppercase">
                  WBCA-PASS-2026-X889
                </span>
              </div>
            </div>

            {/* Check-in Status */}
            <div className="space-y-2">
              {showTicketModal.checkedIn ? (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  已在现场成功签到入场 · 积分奖励已发放！
                </div>
              ) : (
                <button
                  onClick={() => handleSimulateCheckIn(showTicketModal)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  模拟现场扫码打卡 (领 +{showTicketModal.pointsReward} 积分)
                </button>
              )}

              <p className="text-[11px] text-slate-500">
                出示给签到处志愿者扫码，即可自动完成出勤积分确权。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
