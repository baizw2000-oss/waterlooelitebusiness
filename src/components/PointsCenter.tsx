import React, { useState } from 'react';
import { RewardItem, LeaderboardUser, PointsTransaction, UserProfile } from '../types';
import { 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  ShoppingBag, 
  Clock, 
  Gift, 
  Crown, 
  Layout, 
  BookOpen, 
  Utensils, 
  CalendarCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAvatar } from './UserAvatar';
import { useLanguage } from '../i18n/LanguageContext';
import {
  translateRewardItem,
  translateRelativeTime,
  translateTier,
  translateTransactionTitle,
  translateUserField,
} from '../i18n/domainTranslations';

interface PointsCenterProps {
  userPoints: number;
  transactions: PointsTransaction[];
  rewardItems: RewardItem[];
  leaderboard: LeaderboardUser[];
  onCheckIn: () => void;
  hasCheckedInToday: boolean;
  onRedeemReward: (item: RewardItem) => void;
  user?: UserProfile;
}

export const PointsCenter: React.FC<PointsCenterProps> = ({
  userPoints,
  transactions,
  rewardItems,
  leaderboard,
  onCheckIn,
  hasCheckedInToday,
  onRedeemReward,
  user,
}) => {
  const { isEn, t } = useLanguage();
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState<string | null>(null);

  const handleRedeemConfirm = (item: RewardItem) => {
    if (userPoints < item.pointsCost) return;
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
    const localized = translateRewardItem(item, isEn);
    onRedeemReward(item);
    setRedeemSuccessMsg(
      t(
        `成功兑换「${localized.title}」！权益已自动放入您的会员账户。`,
        `Successfully redeemed "${localized.title}"! Your benefit has been credited to your member account.`
      )
    );
    setSelectedReward(null);
    setTimeout(() => setRedeemSuccessMsg(null), 4000);
  };

  const getRewardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layout':
      case 'LayoutTop':
        return <Layout className="w-5 h-5 text-[#9E7425]" />;
      case 'Crown':
        return <Crown className="w-5 h-5 text-[#9E7425]" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-[#9E7425]" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-[#9E7425]" />;
      default:
        return <Gift className="w-5 h-5 text-[#9E7425]" />;
    }
  };

  const localizedSelectedReward = selectedReward ? translateRewardItem(selectedReward, isEn) : null;

  return (
    <div className="space-y-8">
      {/* 1. Private Vault Points Balance & Daily Check-in */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Balance Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-white border border-[#C5A059]/45 p-6 sm:p-8 luxury-shadow flex flex-col justify-between text-[#0F172A]">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                <span className="text-[11px] font-bold text-[#9E7425] tracking-[0.18em] uppercase">
                  {t('融商会员专属信誉资产 · Private Ledger', 'Member Trust Ledger · Private Assets')}
                </span>
              </div>
              <span className="text-xs font-semibold text-[#9E7425] flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-[#C5A059]" />
                {t('卓越商勋理事', 'Honorary Council Tier')}
              </span>
            </div>

            <div>
              <div className="text-xs sm:text-sm text-slate-600 font-normal">
                {t('当前可用融商积分 (Convergence Points)', 'Available Convergence Trust Credits')}
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-gold-ink font-editorial tracking-tight mt-1">
                {userPoints.toLocaleString()}
                <span className="text-base sm:text-lg font-sans font-normal text-[#9E7425] ml-2">
                  {t('分', 'Pts')}
                </span>
              </div>
            </div>

            {/* Tier Progress */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>{t('晋级下一阶「荣誉商勋」进度', 'Progress Toward "Honorary Distinction"')}</span>
                <span className="text-[#9E7425] font-semibold">
                  {userPoints.toLocaleString()} / 500 {t('分', 'Pts')}
                </span>
              </div>
              <div className="w-full h-2 bg-[#F7F7F5] rounded-full overflow-hidden border border-[#E8E6DF]">
                <div
                  className="h-full gold-gradient rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((userPoints / 500) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-5 mt-5 border-t border-[#E8E6DF] flex items-center justify-between text-xs text-slate-600">
            <span>
              {t('实名绑认企业', 'Verified Enterprise')}:{' '}
              <strong className="text-[#0F172A]">
                {translateUserField(user?.company, isEn) || t('外部访客视角', 'External Guest View')}
              </strong>
            </span>
            <span className="text-[#9E7425] font-semibold">
              {t('商会互助履约保全中', 'Protected by WBCA Ledger')}
            </span>
          </div>
        </div>

        {/* Daily Check-in Card */}
        <div className="rounded-2xl bg-white border border-[#E8E6DF] p-6 flex flex-col justify-between luxury-shadow space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#0F172A] font-editorial font-bold text-lg">
              <CalendarCheck className="w-5 h-5 text-[#9E7425]" />
              {t('每日融商签到打卡', 'Daily Executive Check-In')}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t(
                '坚持每日打卡，保持融商汇在线活跃度，持续积累公信力权重与专属兑换积分。',
                'Check in daily to build your standing across the alliance and accumulate redeemable Trust Credits.'
              )}
            </p>
          </div>

          <div className="py-2">
            <button
              onClick={onCheckIn}
              disabled={hasCheckedInToday}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                hasCheckedInToday
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 cursor-default'
                  : 'gold-gradient text-[#0F172A] hover:brightness-105'
              }`}
            >
              {hasCheckedInToday ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {t('今日已签到 (+10 积分已入账)', 'Checked In Today (+10 Pts Credited)')}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#0F172A]" />
                  {t('立即签到打卡 (+10 积分)', 'Check In Now (+10 Pts)')}
                </>
              )}
            </button>
          </div>

          <div className="text-[11px] text-slate-500 text-center">
            {t(
              '连续签到7天可额外解锁商会周末头条曝光特权',
              '7-day streaks unlock priority weekend spotlight eligibility'
            )}
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {redeemSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold text-center animate-in fade-in">
          🎉 {redeemSuccessMsg}
        </div>
      )}

      {/* 2. Ways to Earn Points */}
      <div className="space-y-4">
        <h3 className="font-editorial text-xl font-bold text-[#0F172A] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#9E7425]" />
          {t('积分获取机制与成长通道', 'How to Earn Trust Credits')}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 text-xs">
          {[
            { action: t('每日名商打卡', 'Daily Check-In'), reward: t('+10 分', '+10 Pts'), desc: t('保持社群活跃', 'Active engagement') },
            { action: t('承接并解决互助', 'Fulfill Mutual Aid'), reward: t('+50~200 分', '+50–200 Pts'), desc: t('响应会员供需', 'Peer deal support') },
            { action: t('推荐优质会员入驻', 'Refer New Member'), reward: t('+200 分', '+200 Pts'), desc: t('壮大名商网络', 'Grow the alliance') },
            { action: t('出席线下峰会/沙龙', 'Attend Summits'), reward: t('+100 分', '+100 Pts'), desc: t('扫码核销打卡', 'QR pass check-in') },
            { action: t('撰写商户客观评价', 'Write Endorsement'), reward: t('+30 分', '+30 Pts'), desc: t('赋能公信体系', 'Strengthen peer trust') },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white border border-[#E8E6DF] space-y-1 text-center luxury-shadow"
            >
              <div className="text-[#9E7425] font-bold text-sm font-editorial">{item.reward}</div>
              <div className="text-[#0F172A] font-semibold">{item.action}</div>
              <div className="text-[11px] text-slate-500">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Points Redemption Mall */}
      <div className="space-y-4">
        <div className="border-b border-[#E8E6DF] pb-3">
          <h3 className="font-editorial text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#9E7425]" />
            {t('名商专属特权兑换商城', 'Executive Privileges & Rewards Catalog')}
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            {t(
              '用互助积分兑换高价值品牌展位、高层私董席位及名商专访',
              'Redeem accumulated credits for homepage spotlights, VIP summit access, and executive editorial features.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rewardItems.map((rawItem) => {
            const item = translateRewardItem(rawItem, isEn);
            const canAfford = userPoints >= item.pointsCost;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E8E6DF] hover:border-[#C5A059] p-5 flex flex-col justify-between space-y-4 luxury-shadow transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF] flex items-center justify-center">
                      {getRewardIcon(item.iconName)}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {t(`余量 ${item.stock} 件`, `${item.stock} remaining`)}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-editorial text-base font-bold text-[#0F172A] line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="text-[11px] text-[#9E7425] font-medium">
                    {t('有效期', 'Validity')}: {item.validPeriod}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8E6DF] flex items-center justify-between">
                  <div className="text-lg font-bold text-[#0F172A] font-editorial">
                    {item.pointsCost}{' '}
                    <span className="text-xs font-sans font-normal text-slate-500">
                      {t('分', 'Pts')}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedReward(rawItem)}
                    disabled={!canAfford}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      canAfford
                        ? 'bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-sm'
                        : 'bg-[#F7F7F5] border border-[#E8E6DF] text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? t('立即兑换', 'Redeem') : t('积分不足', 'Insufficient')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Transactions Ledger & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions History */}
        <div className="bg-white rounded-2xl border border-[#E8E6DF] p-5 space-y-4 luxury-shadow">
          <div className="flex items-center justify-between border-b border-[#E8E6DF] pb-3">
            <h4 className="font-editorial text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#9E7425]" />
              {t('近期积分收支明细', 'Recent Trust Credit Ledger')}
            </h4>
            <span className="text-[11px] text-slate-500">
              {t('双录凭证已云端保全', 'Synced to Cloud Ledger')}
            </span>
          </div>

          <div className="space-y-2.5">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                {t(
                  '暂无积分收支流水，参与每日签到或活动签到即可获赠积分',
                  'No credit transactions recorded yet. Check in daily or attend events to earn points.'
                )}
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF] text-xs"
                >
                  <div>
                    <div className="font-semibold text-[#0F172A]">
                      {translateTransactionTitle(tx.title, isEn)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {translateRelativeTime(tx.date, isEn)}
                    </div>
                  </div>
                  <div
                    className={`font-bold font-mono text-sm ${
                      tx.change > 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {tx.change > 0 ? `+${tx.change}` : tx.change} {t('分', 'Pts')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reputation Leaderboard */}
        <div className="bg-white rounded-2xl border border-[#E8E6DF] p-5 space-y-4 luxury-shadow">
          <div className="flex items-center justify-between border-b border-[#E8E6DF] pb-3">
            <h4 className="font-editorial text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#9E7425]" />
              {t('滑铁卢名商影响力琅琊榜', 'WBCA Member Influence Leaderboard')}
            </h4>
            <span className="text-[11px] text-slate-500">
              {t('月度榜首直通年度表彰', 'Top contributors honored annually')}
            </span>
          </div>

          <div className="space-y-2.5">
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                {t(
                  '影响力榜单依据真实会员互助履约实时计算生成',
                  'Influence rankings are dynamically computed from verified member fulfillment.'
                )}
              </div>
            ) : (
              leaderboard.map((u) => (
                <div
                  key={u.rank}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F7F7F5] border border-[#E8E6DF] text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold font-mono text-xs ${
                        u.rank === 1
                          ? 'gold-gradient text-[#0F172A] shadow-sm'
                          : u.rank === 2
                          ? 'bg-slate-300 text-[#0F172A]'
                          : u.rank === 3
                          ? 'bg-[#9E7425] text-white'
                          : 'bg-white border border-[#E8E6DF] text-slate-500'
                      }`}
                    >
                      {u.rank}
                    </div>
                    <UserAvatar avatar={u.avatar} name={u.name} size="sm" className="w-7 h-7 rounded-full" />
                    <div>
                      <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                        {translateUserField(u.name, isEn)}
                        <span className="text-[10px] text-[#9E7425] font-normal">
                          · {translateTier(u.tier, isEn)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {translateUserField(u.company, isEn)} · {t(`助人 ${u.helpedCount} 次`, `${u.helpedCount} assists`)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-[#9E7425] font-editorial text-sm">
                      {u.points.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">{t('公信分', 'Trust Pts')}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Redemption Confirmation Modal */}
      {selectedReward && localizedSelectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-[#E8E6DF] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F7F7F5] border border-[#C5A059]/40 flex items-center justify-center mx-auto">
              {getRewardIcon(localizedSelectedReward.iconName)}
            </div>

            <div className="space-y-1">
              <h4 className="font-editorial text-lg font-bold text-[#0F172A]">
                {t('确认兑换特权权益', 'Confirm Privilege Redemption')}
              </h4>
              <p className="text-xs text-[#9E7425] font-semibold">
                {t(`「${localizedSelectedReward.title}」`, `"${localizedSelectedReward.title}"`)}
              </p>
              <p className="text-xs text-slate-600 pt-1">
                {t('将扣除', 'This will deduct')}{' '}
                <strong className="text-[#0F172A]">
                  {localizedSelectedReward.pointsCost} {t('积分', 'Trust Credits')}
                </strong>
                {t('。兑换后可在商会秘书处出示核销使用。', '. Present your voucher to the WBCA Secretariat for fulfillment.')}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3 text-xs">
              <button
                onClick={() => setSelectedReward(null)}
                className="px-4 py-2 bg-[#F7F7F5] border border-[#E8E6DF] hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
              >
                {t('取消', 'Cancel')}
              </button>
              <button
                onClick={() => handleRedeemConfirm(selectedReward)}
                className="px-5 py-2 gold-gradient text-[#0F172A] font-bold rounded-xl shadow-sm hover:brightness-105"
              >
                {t('确认兑换', 'Confirm Redemption')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
