import React, { useState } from 'react';
import { 
  UserProfile, 
  HelpPost, 
  ChamberEvent, 
  PointsTransaction, 
  MemberTier 
} from '../types';
import { UserAvatar } from './UserAvatar';
import { 
  User, 
  Building2, 
  Award, 
  Calendar, 
  Users, 
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
  FileText, 
  X, 
  Save, 
  ChevronRight,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

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

  const safeName = user.name && !user.name.startsWith('data:') && user.name.length < 50 ? user.name : 'Brandon Bai (白政玮)';
  const safeCompany = user.company && !user.company.startsWith('data:') && user.company.length < 50 ? user.company : 'BV Financial';

  // Filter posts created by current user
  const myPosts = posts.filter(
    (p) => p.authorUid === user.uid || p.authorName.includes(safeName) || p.authorCompany.includes(safeCompany)
  );

  // Filter posts where user submitted an offer
  const myOffers = posts.filter((p) =>
    p.offers.some(
      (o) => o.responderUid === user.uid || o.responderName.includes(safeName) || o.responderCompany.includes(safeCompany)
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
      {/* 1. Profile Header Card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Avatar & Main Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-800 border-2 border-amber-400/50 flex items-center justify-center shadow-xl overflow-hidden">
                <UserAvatar avatar={user.avatar} name={safeName} size="xl" className="w-full h-full object-cover" />
              </div>
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] border-2 border-slate-900">
                在线
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {safeName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  {user.tier}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  实名公信认证
                </span>
              </div>

              <p className="text-sm text-slate-300 font-medium">
                {user.title} · <strong className="text-white">{safeCompany}</strong>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  {user.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {user.address || 'Waterloo, ON'}
                </span>
              </div>

              <p className="text-xs text-slate-400 italic pt-1 max-w-xl">
                "{user.bio}"
              </p>
            </div>
          </div>

          {/* Action Buttons & Fast Checkin */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 self-stretch md:self-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all shadow-md"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              编辑资料
            </button>

            <button
              onClick={onCheckInToday}
              disabled={user.hasCheckedInToday}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-md ${
                user.hasCheckedInToday
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {user.hasCheckedInToday ? '今日已签到 (+10分)' : '今日签到领积分'}
            </button>
          </div>
        </div>

        {/* 4 Metrics Strip */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>专属信用积分</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 font-serif mt-1">
              {user.points.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              距下一阶商勋需 1,150 分
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>我发起的求助/商机</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-serif mt-1">
              {myPosts.length} <span className="text-xs font-normal text-slate-500">条</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              已圆满解决 {myPosts.filter((p) => p.status === '已圆满解决').length} 条
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>我提供的互助解答</span>
              <MessageSquare className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-serif mt-1">
              {myOffers.length} <span className="text-xs font-normal text-slate-500">次</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              已被采纳率 100%
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>已报名的商会活动</span>
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-serif mt-1">
              {myEvents.length} <span className="text-xs font-normal text-slate-500">场</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              已出勤签到 {myEvents.filter((e) => e.checkedIn).length} 场
            </div>
          </div>
        </div>
      </section>

      {/* 2. Sub-Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none text-xs sm:text-sm">
        {[
          { id: 'help', label: `我的互助与商机 (${myPosts.length + myOffers.length})`, icon: Users },
          { id: 'events', label: `已参与活动 (${myEvents.length})`, icon: Calendar },
          { id: 'points', label: '积分成长轨迹', icon: TrendingUp },
          { id: 'badge', label: '数字会员凭证', icon: QrCode },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHelpFilter('my_posts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  helpFilter === 'my_posts'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                我发起的求助/商机 ({myPosts.length})
              </button>
              <button
                onClick={() => setHelpFilter('my_offers')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  helpFilter === 'my_offers'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                我提供的响应支持 ({myOffers.length})
              </button>
            </div>

            <span className="text-xs text-slate-400">
              数据已与云端 Firestore 实时双向同步
            </span>
          </div>

          {helpFilter === 'my_posts' ? (
            <div className="space-y-3">
              {myPosts.length === 0 ? (
                <div className="text-center py-10 bg-slate-900/60 rounded-2xl border border-slate-800 p-6 text-xs text-slate-400">
                  您尚未发起过任何互助需求。可点击顶部“商机互助圈”发起您的第一条需求！
                </div>
              ) : (
                myPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold">{post.category}</span>
                      <div className="flex items-center gap-2">
                        {post.rewardPoints > 0 && (
                          <span className="text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            悬赏 {post.rewardPoints} 分
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded font-semibold ${
                            post.status === '已圆满解决'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-white">{post.title}</h4>
                    <p className="text-slate-300 line-clamp-2 leading-relaxed">
                      {post.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <span>发布时间: {post.createdAt}</span>
                      <span>已收到 {post.offers?.length || 0} 条会员方案响应</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {myOffers.length === 0 ? (
                <div className="text-center py-10 bg-slate-900/60 rounded-2xl border border-slate-800 p-6 text-xs text-slate-400">
                  您暂未参与过其他会员的互助响应。前往互助圈认领商机可赚取丰厚悬赏积分！
                </div>
              ) : (
                myOffers.map((post) => {
                  const userOffer = post.offers.find(
                    (o) =>
                      o.responderUid === user.uid ||
                      o.responderName.includes(user.name) ||
                      o.responderCompany.includes(user.company)
                  );
                  return (
                    <div
                      key={post.id}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">针对需求：{post.title}</span>
                        {userOffer?.accepted && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                            ✓ 方案已被采纳 (+{post.rewardPoints} 积分)
                          </span>
                        )}
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                        <strong className="text-amber-400">您的回复方案：</strong>
                        <p className="mt-1">{userOffer?.content}</p>
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
          <div className="text-xs text-slate-400">
            您已报名的滑铁卢名商会高端峰会、私董会及交流酒会：
          </div>

          {myEvents.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/60 rounded-2xl border border-slate-800 p-6 text-xs text-slate-400 space-y-2">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
              <p>暂无已报名的活动日程。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 text-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        {evt.type}
                      </span>
                      {evt.checkedIn ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 已在现场打卡 (+{evt.pointsReward}分)
                        </span>
                      ) : (
                        <span className="text-amber-300 font-semibold text-[11px]">
                          待现场扫码核销
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {evt.title}
                    </h4>
                    <div className="space-y-1 text-slate-400 text-[11px]">
                      <div>📅 时间: {evt.date} {evt.time}</div>
                      <div>📍 地点: {evt.location}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">
                      签到可得: <strong className="text-amber-300">+{evt.pointsReward} 积分</strong>
                    </span>
                    <button
                      onClick={() => onOpenEventTicket(evt)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1 shadow"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      出示电子入场券
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
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white">信用积分成长总览</h4>
                <p className="text-xs text-slate-400">
                  真实记录您在滑铁卢名商会社区的商业履约与互助贡献
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-amber-300 font-serif">
                  {user.points.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400">总积分储备</div>
              </div>
            </div>

            {/* Trajectory Milestone */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>当前头衔：{user.tier}</span>
                <span className="text-amber-300 font-semibold">{user.points.toLocaleString()} / 500 分</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-200 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((user.points / 500) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>认证会员 (0分)</span>
                <span>荣誉商勋 (500分)</span>
                <span>创会领袖 (1500分)</span>
              </div>
            </div>
          </div>

          {/* Transactions Timeline */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              明细账本流水 (Cloud Ledger)
            </h4>

            <div className="space-y-2">
              {transactions.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs">
                  暂无积分流水明细。每日打卡、推荐商户或参与商会活动即可积累名商信用积分！
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-white">{tx.title}</div>
                      <div className="text-[11px] text-slate-500">{tx.date}</div>
                    </div>
                    <div
                      className={`font-black font-mono text-sm ${
                        tx.change > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.change > 0 ? `+${tx.change}` : tx.change} 分
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
          <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border-2 border-amber-500/50 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-serif text-slate-950 font-bold">
                  商
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">滑铁卢名商会</div>
                  <div className="text-[9px] text-amber-400/80 uppercase">Waterloo Elite Business Association</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                OFFICIAL MEMBER
              </span>
            </div>

            <div className="space-y-2">
              <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-amber-400 mx-auto flex items-center justify-center shadow-inner overflow-hidden">
                <UserAvatar avatar={user.avatar} name={user.name} size="lg" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-black text-white">{user.name}</h3>
              <p className="text-xs text-amber-300 font-semibold">{user.company}</p>
              <p className="text-[11px] text-slate-400">{user.title} · {user.tier}</p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-2xl inline-block mx-auto border-4 border-amber-500/30">
              <svg viewBox="0 0 100 100" className="w-32 h-32 fill-current text-slate-950">
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

            <div className="border-t border-slate-800 pt-3 text-[10px] text-slate-400 font-mono">
              认证公信号: WEBA-MBR-2026-8809 · 永久保全
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                编辑会员个人与企业资料
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              {/* Avatar Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  选择会员头像图标
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {avatarOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAvatar(opt)}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xl transition-all ${
                        avatar === opt
                          ? 'border-amber-400 bg-amber-500/20 scale-110'
                          : 'border-slate-700 bg-slate-950'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    会员姓名 *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    所属企业 / 机构 *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    企业职务 / 职位
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    所属行业板块
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    联络电话
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    联系邮箱
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    微信联络 ID
                  </label>
                  <input
                    type="text"
                    value={wechatId}
                    onChange={(e) => setWechatId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    办公驻地 (Waterloo Region)
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  个人简介与业务专长
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  保存并同步至云端数据库
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
