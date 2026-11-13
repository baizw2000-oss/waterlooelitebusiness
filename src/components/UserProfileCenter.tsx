import React, { useState } from 'react';
import { 
  UserProfile, 
  HelpPost, 
  ChamberEvent, 
  PointsTransaction
} from '../types';
import { UserAvatar } from './UserAvatar';
import { 
  Users, 
  Calendar, 
  Award, 
  Phone, 
  Mail, 
  MapPin, 
  Edit3, 
  CheckCircle2, 
  QrCode, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Crown, 
  X, 
  Save, 
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../i18n/LanguageContext';
import {
  translateEventType,
  translateHelpCategory,
  translateHelpStatus,
  translateRelativeTime,
  translateTier,
  translateTransactionTitle,
  translateUserField,
} from '../i18n/domainTranslations';

interface UserProfileCenterProps {
  user: UserProfile;
  posts: HelpPost[];
  events: ChamberEvent[];
  transactions: PointsTransaction[];
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenEventTicket: (event: ChamberEvent) => void;
  onCheckInToday: () => void;
}

export const UserProfileCenter: React.FC<UserProfileCenterProps> = ({
  user,
  posts,
  events,
  transactions,
  onUpdateProfile,
  onOpenEventTicket,
  onCheckInToday,
}) => {
  const { isEn, t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'help' | 'events' | 'points' | 'badge'>('help');
  const [helpFilter, setHelpFilter] = useState<'my_posts' | 'my_offers'>('my_posts');
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit Profile Form State
  const [name, setName] = useState(user.name);
  const [company, setCompany] = useState(user.company);
  const [title, setTitle] = useState(user.title);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio);
  const [industry, setIndustry] = useState(user.industry);
  const [wechatId, setWechatId] = useState(user.wechatId || '');
  const [address, setAddress] = useState(user.address || 'Waterloo, ON');
  const [avatar, setAvatar] = useState(user.avatar || '👨‍💼');

  const safeRawName = user.name && !user.name.startsWith('data:') && user.name.length < 50 ? user.name : 'Brandon Bai (白政玮)';
  const safeRawCompany = user.company && !user.company.startsWith('data:') && user.company.length < 50 ? user.company : 'BV Financial';

  const displayName = translateUserField(safeRawName, isEn);
  const displayCompany = translateUserField(safeRawCompany, isEn);
  const displayTitle = translateUserField(user.title, isEn);
  const displayBio = translateUserField(user.bio, isEn);
  const displayTier = translateTier(user.tier, isEn);

  // Filter posts created by current user (match against raw values)
  const myPosts = posts.filter(
    (p) => p.authorUid === user.uid || p.authorName.includes(safeRawName) || p.authorCompany.includes(safeRawCompany)
  );

  // Filter posts where user submitted an offer
  const myOffers = posts.filter((p) =>
    p.offers.some(
      (o) => o.responderUid === user.uid || o.responderName.includes(safeRawName) || o.responderCompany.includes(safeRawCompany)
    )
  );

  // Filter events registered by user
  const myEvents = events.filter(
    (e) => e.isRegistered || user.registeredEventIds?.map(String).includes(String(e.id))
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name: name.trim(),
      company: company.trim(),
      title: title.trim(),
      phone: phone.trim(),
      email: email.trim(),
      bio: bio.trim(),
      industry: industry.trim(),
      wechatId: wechatId.trim(),
      address: address.trim(),
      avatar,
    };
    onUpdateProfile(updated);
    setShowEditModal(false);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const avatarOptions = ['👩‍💼', '👨‍💻', '🏢', '⚖️', '🍽️', '🎓', '🚢', '🌿', '💎', '🧑‍🚀'];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in">
      {/* 1. Profile Header Card - Crisp Editorial Ivory */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-[#E8E6DF] p-6 sm:p-8 luxury-shadow text-[#0F172A]">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Avatar & Main Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#F7F7F5] border-2 border-[#C5A059]/60 flex items-center justify-center shadow-sm overflow-hidden">
                <UserAvatar avatar={user.avatar} name={displayName} size="xl" className="w-full h-full object-cover" />
              </div>
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] border-2 border-white">
                {t('在线', 'Online')}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-editorial text-[#0F172A]">
                  {displayName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFFDF7] text-[#9E7425] border border-[#C5A059]/45 text-xs font-bold flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-[#C5A059]" />
                  {displayTier}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  {t('实名公信认证', 'Verified Credential')}
                </span>
              </div>

              <p className="text-sm text-slate-600 font-medium">
                {displayTitle} · <strong className="text-[#0F172A]">{displayCompany}</strong>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                {user.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#9E7425]" />
                    {user.email}
                  </span>
                )}
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#9E7425]" />
                    {user.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#9E7425]" />
                  {user.address || 'Waterloo, ON'}
                </span>
              </div>

              {displayBio && (
                <p className="text-xs text-slate-600 italic pt-1 max-w-xl border-l-2 border-[#C5A059]/50 pl-3">
                  &ldquo;{displayBio}&rdquo;
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons & Fast Checkin */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 self-stretch md:self-auto border-t md:border-t-0 pt-4 md:pt-0 border-[#E8E6DF]">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F7F7F5] hover:bg-[#EFECE4] text-[#0F172A] font-semibold text-xs border border-[#E8E6DF] transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#9E7425]" />
              {t('编辑资料', 'Edit Profile')}
            </button>

            <button
              onClick={onCheckInToday}
              disabled={user.hasCheckedInToday}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-sm ${
                user.hasCheckedInToday
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                  : 'gold-gradient hover:brightness-105 text-[#0F172A]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {user.hasCheckedInToday
                ? t('今日已签到 (+10分)', 'Checked In (+10 Pts)')
                : t('今日签到领积分', 'Daily Check-In')}
            </button>
          </div>
        </div>

        {/* 4 Metrics Strip */}
        <div className="mt-8 pt-6 border-t border-[#E8E6DF] grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#F7F7F5] p-4 rounded-2xl border border-[#E8E6DF]">
            <div className="text-xs text-slate-600 flex items-center justify-between">
              <span>{t('专属信用积分', 'Trust Credits')}</span>
              <Award className="w-4 h-4 text-[#9E7425]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gold-ink font-editorial mt-1">
              {user.points.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {t('距下一阶商勋需 1,150 分', '1,150 Pts to next Council tier')}
            </div>
          </div>

          <div className="bg-[#F7F7F5] p-4 rounded-2xl border border-[#E8E6DF]">
            <div className="text-xs text-slate-600 flex items-center justify-between">
              <span>{t('我发起的求助/商机', 'Inquiries Posted')}</span>
              <Users className="w-4 h-4 text-[#9E7425]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A] font-editorial mt-1">
              {myPosts.length}{' '}
              <span className="text-xs font-normal text-slate-500 font-sans">
                {t('条', 'items')}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {t(
                `已圆满解决 ${myPosts.filter((p) => p.status === '已圆满解决').length} 条`,
                `${myPosts.filter((p) => p.status === '已圆满解决').length} completed`
              )}
            </div>
          </div>

          <div className="bg-[#F7F7F5] p-4 rounded-2xl border border-[#E8E6DF]">
            <div className="text-xs text-slate-600 flex items-center justify-between">
              <span>{t('我提供的互助解答', 'Solutions Submitted')}</span>
              <MessageSquare className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A] font-editorial mt-1">
              {myOffers.length}{' '}
              <span className="text-xs font-normal text-slate-500 font-sans">
                {t('次', 'offers')}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {t('已被采纳率 100%', '100% Acceptance Standing')}
            </div>
          </div>

          <div className="bg-[#F7F7F5] p-4 rounded-2xl border border-[#E8E6DF]">
            <div className="text-xs text-slate-600 flex items-center justify-between">
              <span>{t('已报名的商会活动', 'Registered Events')}</span>
              <Calendar className="w-4 h-4 text-[#9E7425]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F172A] font-editorial mt-1">
              {myEvents.length}{' '}
              <span className="text-xs font-normal text-slate-500 font-sans">
                {t('场', 'events')}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {t(
                `已出勤签到 ${myEvents.filter((e) => e.checkedIn).length} 场`,
                `${myEvents.filter((e) => e.checkedIn).length} checked in`
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Sub-Tabs Header */}
      <div className="flex items-center gap-2 border-b border-[#E8E6DF] pb-3 overflow-x-auto scrollbar-none text-xs sm:text-sm">
        {[
          {
            id: 'help',
            label: t(
              `我的互助与商机 (${myPosts.length + myOffers.length})`,
              `My Mutual Aid (${myPosts.length + myOffers.length})`
            ),
            icon: Users,
          },
          {
            id: 'events',
            label: t(`已参与活动 (${myEvents.length})`, `Registered Events (${myEvents.length})`),
            icon: Calendar,
          },
          { id: 'points', label: t('积分成长轨迹', 'Credit Trajectory'), icon: TrendingUp },
          { id: 'badge', label: t('数字会员凭证', 'Digital Credential'), icon: QrCode },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap border ${
                activeSubTab === tab.id
                  ? 'bg-[#0F172A] text-[#DFBA73] border-[#0F172A] shadow-sm'
                  : 'bg-white text-slate-600 border-[#E8E6DF] hover:text-[#0F172A] hover:border-[#C5A059]/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Sub-Tab Content */}

      {/* TAB 1: Mutual Aid History */}
      {activeSubTab === 'help' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHelpFilter('my_posts')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                  helpFilter === 'my_posts'
                    ? 'gold-gradient text-[#0F172A] border-[#C5A059]'
                    : 'bg-white text-slate-600 border-[#E8E6DF] hover:text-[#0F172A]'
                }`}
              >
                {t(`我发起的求助/商机 (${myPosts.length})`, `Posted Inquiries (${myPosts.length})`)}
              </button>
              <button
                onClick={() => setHelpFilter('my_offers')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                  helpFilter === 'my_offers'
                    ? 'gold-gradient text-[#0F172A] border-[#C5A059]'
                    : 'bg-white text-slate-600 border-[#E8E6DF] hover:text-[#0F172A]'
                }`}
              >
                {t(`我提供的响应支持 (${myOffers.length})`, `Submitted Proposals (${myOffers.length})`)}
              </button>
            </div>

            <span className="text-xs text-slate-500">
              {t('数据已与云端 Firestore 实时双向同步', 'Synchronized in real time with WBCA Cloud Ledger')}
            </span>
          </div>

          {helpFilter === 'my_posts' ? (
            <div className="space-y-3">
              {myPosts.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-[#E8E6DF] p-6 text-xs text-slate-500">
                  {t(
                    '您尚未发起过任何互助需求。可点击顶部“商机互助圈”发起您的第一条需求！',
                    'You have not posted any inquiries yet. Visit the Mutual Aid Hub to initiate your first request.'
                  )}
                </div>
              ) : (
                myPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-5 rounded-2xl bg-white border border-[#E8E6DF] hover:border-[#C5A059]/60 transition-all space-y-2 text-xs luxury-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#9E7425] font-bold">
                        {translateHelpCategory(post.category, isEn)}
                      </span>
                      <div className="flex items-center gap-2">
                        {post.rewardPoints > 0 && (
                          <span className="text-[#9E7425] font-semibold bg-[#FFFDF7] px-2 py-0.5 rounded border border-[#C5A059]/30">
                            {t(`悬赏 ${post.rewardPoints} 分`, `Bounty ${post.rewardPoints} Pts`)}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded font-semibold ${
                            post.status === '已圆满解决'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}
                        >
                          {translateHelpStatus(post.status, isEn)}
                        </span>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-[#0F172A]">{post.title}</h4>
                    <p className="text-slate-600 line-clamp-2 leading-relaxed">
                      {post.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-[#E8E6DF] text-[11px] text-slate-500">
                      <span>
                        {t('发布时间', 'Posted')}: {translateRelativeTime(post.createdAt, isEn)}
                      </span>
                      <span>
                        {t(
                          `已收到 ${post.offers?.length || 0} 条会员方案响应`,
                          `${post.offers?.length || 0} member proposals received`
                        )}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {myOffers.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-[#E8E6DF] p-6 text-xs text-slate-500">
                  {t(
                    '您暂未参与过其他会员的互助响应。前往互助圈认领商机可赚取丰厚悬赏积分！',
                    'You have not responded to peer inquiries yet. Visit the Mutual Aid Hub to earn Trust Credit bounties.'
                  )}
                </div>
              ) : (
                myOffers.map((post) => {
                  const userOffer = post.offers.find(
                    (o) =>
                      o.responderUid === user.uid ||
                      o.responderName.includes(safeRawName) ||
                      o.responderCompany.includes(safeRawCompany)
                  );
                  return (
                    <div
                      key={post.id}
                      className="p-5 rounded-2xl bg-white border border-[#E8E6DF] space-y-2 text-xs luxury-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">
                          {t('针对需求', 'Regarding Inquiry')}:{' '}
                          <strong className="text-[#0F172A]">{post.title}</strong>
                        </span>
                        {userOffer?.accepted && (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                            {t(`✓ 方案已被采纳 (+${post.rewardPoints} 积分)`, `✓ Accepted (+${post.rewardPoints} Pts)`)}
                          </span>
                        )}
                      </div>
                      <div className="p-3 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF] text-[#0F172A]">
                        <strong className="text-[#9E7425]">{t('您的回复方案：', 'Your Proposal:')}</strong>
                        <p className="mt-1 text-slate-700">{userOffer?.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Registered Events */}
      {activeSubTab === 'events' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-600">
            {t(
              '您已报名的滑铁卢融商汇高端峰会、私董会及交流酒会：',
              'Your registered WBCA summits, executive roundtables, and receptions:'
            )}
          </div>

          {myEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#E8E6DF] p-6 text-xs text-slate-500 space-y-2">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
              <p>{t('暂无已报名的活动日程。', 'No registered events yet.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-5 rounded-2xl bg-white border border-[#E8E6DF] hover:border-[#C5A059] transition-all flex flex-col justify-between space-y-4 text-xs luxury-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FFFDF7] text-[#9E7425] border border-[#C5A059]/40 text-[10px] font-bold">
                        {translateEventType(evt.type, isEn)}
                      </span>
                      {evt.checkedIn ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t(`已在现场打卡 (+${evt.pointsReward}分)`, `Checked In (+${evt.pointsReward} Pts)`)}
                        </span>
                      ) : (
                        <span className="text-[#9E7425] font-semibold text-[11px]">
                          {t('待现场扫码核销', 'Awaiting On-Site Check-In')}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[#0F172A] leading-tight">
                      {evt.title}
                    </h4>
                    <div className="space-y-1 text-slate-600 text-[11px]">
                      <div>📅 {t('时间', 'Date & Time')}: {evt.date} {evt.time}</div>
                      <div>📍 {t('地点', 'Venue')}: {evt.location}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E8E6DF] flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">
                      {t('签到可得', 'Attendance Bonus')}:{' '}
                      <strong className="text-[#9E7425]">+{evt.pointsReward} {t('积分', 'Pts')}</strong>
                    </span>
                    <button
                      onClick={() => onOpenEventTicket(evt)}
                      className="px-3.5 py-1.5 rounded-xl gold-gradient hover:brightness-105 text-[#0F172A] font-bold flex items-center gap-1 shadow-sm"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      {t('出示电子入场券', 'View E-Pass')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Points Trajectory */}
      {activeSubTab === 'points' && (
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8E6DF] luxury-shadow space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold font-editorial text-[#0F172A]">
                  {t('信用积分成长总览', 'Trust Credit Growth Overview')}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  {t(
                    '真实记录您在滑铁卢融商会社区的商业履约与互助贡献',
                    'Verified ledger of your commercial fulfillment and community contributions within WBCA'
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-[#9E7425] font-editorial">
                  {user.points.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500">{t('总积分储备', 'Total Credits')}</div>
              </div>
            </div>

            {/* Trajectory Milestone */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-[#0F172A]">
                <span>{t('当前头衔', 'Current Standing')}：<strong>{displayTier}</strong></span>
                <span className="text-[#9E7425] font-bold">
                  {user.points.toLocaleString()} / 500 {t('分', 'Pts')}
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#EFECE4] rounded-full overflow-hidden border border-[#E8E6DF]">
                <div
                  className="h-full gold-gradient rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((user.points / 500) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{t('认证会员 (0分)', 'Verified Member (0)')}</span>
                <span>{t('荣誉商勋 (500分)', 'Honorary (500)')}</span>
                <span>{t('创会领袖 (1500分)', 'Council Leader (1,500)')}</span>
              </div>
            </div>
          </div>

          {/* Transactions Timeline */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#9E7425]" />
              {t('明细账本流水 (Cloud Ledger)', 'Transaction Ledger')}
            </h4>

            <div className="space-y-2">
              {transactions.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-white border border-[#E8E6DF] text-slate-500 text-xs">
                  {t(
                    '暂无积分流水明细。每日打卡、推荐商户或参与商会活动即可积累名商信用积分！',
                    'No ledger entries yet. Daily check-ins, referrals, and event attendance accrue Trust Credits.'
                  )}
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#E8E6DF] flex items-center justify-between text-xs luxury-shadow"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-[#0F172A]">
                        {translateTransactionTitle(tx.title, isEn)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {translateRelativeTime(tx.date, isEn)}
                      </div>
                    </div>
                    <div
                      className={`font-black font-mono text-sm ${
                        tx.change > 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {tx.change > 0 ? `+${tx.change}` : tx.change} {t('分', 'Pts')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Digital Chamber Credential Badge */}
      {activeSubTab === 'badge' && (
        <div className="max-w-md mx-auto space-y-4 text-center">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-white via-[#FFFDF8] to-[#F7F7F5] border-2 border-[#C5A059]/65 luxury-shadow space-y-6 relative overflow-hidden text-[#0F172A]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/12 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-[#E8E6DF] pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center font-editorial text-[#0F172A] font-bold">
                  {t('融', 'W')}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#0F172A]">
                    {t('滑铁卢融商汇', 'WBCA')}
                  </div>
                  <div className="text-[9px] text-[#9E7425] font-semibold uppercase">
                    Waterloo Business Convergence Alliance
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFFDF7] text-[#9E7425] border border-[#C5A059]/45">
                OFFICIAL MEMBER
              </span>
            </div>

            <div className="space-y-2">
              <div className="w-20 h-20 rounded-2xl bg-[#F7F7F5] border-2 border-[#C5A059]/60 mx-auto flex items-center justify-center shadow-sm overflow-hidden">
                <UserAvatar avatar={user.avatar} name={displayName} size="lg" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-black font-editorial text-[#0F172A]">{displayName}</h3>
              <p className="text-xs text-[#9E7425] font-semibold">{displayCompany}</p>
              <p className="text-[11px] text-slate-600">{displayTitle} · {displayTier}</p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-2xl inline-block mx-auto border-2 border-[#C5A059]/45 shadow-sm">
              <svg viewBox="0 0 100 100" className="w-32 h-32 fill-current text-[#0F172A]">
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

            <div className="border-t border-[#E8E6DF] pt-3 text-[10px] text-slate-500 font-mono">
              {t('认证公信号: WBCA-MBR-2026-8809 · 永久保全', 'Trust Reg: WBCA-MBR-2026-8809 · Verified Ledger')}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-[#E8E6DF] rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden luxury-shadow flex flex-col text-[#0F172A]">
            <div className="flex items-center justify-between border-b border-[#C5A059]/30 bg-[#0F172A] px-6 py-4 text-white">
              <h3 className="text-base font-bold font-editorial flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#DFBA73]" />
                {t('编辑会员个人与企业资料', 'Edit Executive & Corporate Profile')}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-3.5 text-xs overflow-y-auto flex-1">
              {/* Avatar Selector */}
              <div>
                <label className="block text-[#0F172A] font-bold mb-1.5">
                  {t('选择会员头像图标', 'Select Profile Emblem')}
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {avatarOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAvatar(opt)}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xl transition-all ${
                        avatar === opt
                          ? 'border-[#C5A059] bg-[#FFFDF7] ring-2 ring-[#C5A059]/30 scale-105'
                          : 'border-[#E8E6DF] bg-[#F7F7F5] hover:border-[#C5A059]/50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0F172A] font-bold mb-1">
                    {t('会员姓名 *', 'Full Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#0F172A] font-bold mb-1">
                    {t('所属企业 / 机构 *', 'Enterprise / Organization *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0F172A] font-bold mb-1">
                    {t('企业职务 / 职位', 'Executive Title')}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#0F172A] font-bold mb-1">
                    {t('所属行业板块', 'Industry Sector')}
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0F172A] font-bold mb-1">
                    {t('联络电话', 'Direct Phone')}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#0F172A] font-bold mb-1">
                    {t('联系邮箱', 'Corporate Email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0F172A] font-bold mb-1">
                    {t('微信联络 ID', 'WeChat ID')}
                  </label>
                  <input
                    type="text"
                    value={wechatId}
                    onChange={(e) => setWechatId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#0F172A] font-bold mb-1">
                    {t('办公驻地 (Waterloo Region)', 'Office Location (Waterloo Region)')}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#0F172A] font-bold mb-1">
                  {t('个人简介与业务专长', 'Executive Bio & Areas of Expertise')}
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F7F5] border border-[#E8E6DF] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#C5A059] focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-[#E8E6DF] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-[#F7F7F5] hover:bg-[#EFECE4] text-[#0F172A] border border-[#E8E6DF] rounded-xl font-medium"
                >
                  {t('取消', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 gold-gradient hover:brightness-105 text-[#0F172A] font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {t('保存并同步至云端数据库', 'Save & Sync to Cloud')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
