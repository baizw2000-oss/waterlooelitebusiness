import React, { useState } from 'react';
import { RewardItem, LeaderboardUser, PointsTransaction, UserProfile } from '../types';
import { 
  Award, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  ShoppingBag, 
  Clock, 
  ChevronRight, 
  Gift, 
  Crown, 
  Layout, 
  BookOpen, 
  Utensils, 
  CalendarCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAvatar } from './UserAvatar';

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
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState<string | null>(null);

  const handleRedeemConfirm = (item: RewardItem) => {
    if (userPoints < item.pointsCost) return;
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
    onRedeemReward(item);
    setRedeemSuccessMsg(`成功兑换「${item.title}」！权益已自动放入您的会员账户。`);
    setSelectedReward(null);
    setTimeout(() => setRedeemSuccessMsg(null), 4000);
  };

  const getRewardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layout':
      case 'LayoutTop':
        return <Layout className="w-5 h-5 text-amber-400" />;
      case 'Crown':
        return <Crown className="w-5 h-5 text-amber-400" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-amber-400" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-amber-400" />;
      default:
        return <Gift className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Points Wallet & Check-in Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Balance Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-950 border border-amber-500/40 p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-bold text-amber-300 tracking-wider uppercase">
                  名商会员专属信誉资产
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                卓越商勋理事
              </span>
            </div>

            <div>
              <div className="text-xs sm:text-sm text-slate-400 font-medium">
                当前可用名商积分 (Reputation Points)
              </div>
              <div className="text-4xl sm:text-5xl font-black text-amber-300 font-serif tracking-tight mt-1">
                {userPoints.toLocaleString()}
                <span className="text-base sm:text-lg font-sans font-normal text-amber-500/80 ml-2">
                  分
                </span>
              </div>
            </div>

            {/* Tier Progress */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>晋级下一阶「荣誉商勋」进度</span>
                <span className="text-amber-300 font-semibold">{userPoints.toLocaleString()} / 500 分</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-200 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((userPoints / 500) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>实名绑认企业: {user?.company || 'BV Financial'}</span>
            <span>商会互助履约保全中</span>
          </div>
        </div>

        {/* Daily Check-in Card */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between shadow-xl space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <CalendarCheck className="w-5 h-5 text-amber-400" />
              每日名商签到打卡
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              坚持每日打卡，保持名商会在线活跃度，持续积累公信力权重与专属兑换积分。
            </p>
          </div>

          <div className="py-2">
            <button
              onClick={onCheckIn}
              disabled={hasCheckedInToday}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                hasCheckedInToday
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 cursor-default'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {hasCheckedInToday ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  今日已签到 (+10 积分已入账)
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  立即签到打卡 (+10 积分)
                </>
              )}
            </button>
          </div>

          <div className="text-[11px] text-slate-500 text-center">
            连续签到7天可额外解锁商会周末头条曝光特权！
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {redeemSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-sm font-semibold text-center animate-in fade-in">
          🎉 {redeemSuccessMsg}
        </div>
      )}

      {/* 2. Ways to Earn Points */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          积分获取机制与成长通道
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          {[
            { action: '每日名商打卡', reward: '+10 分', desc: '保持社群活跃' },
            { action: '承接并解决互助', reward: '+50~200 分', desc: '响应会员供需' },
            { action: '推荐优质会员入驻', reward: '+200 分', desc: '壮大名商网络' },
            { action: '出席线下峰会/沙龙', reward: '+100 分', desc: '扫码核销打卡' },
            { action: '撰写商户客观履约评价', reward: '+30 分', desc: '赋能公信体系' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1 text-center"
            >
              <div className="text-amber-400 font-bold text-sm">{item.reward}</div>
              <div className="text-white font-medium">{item.action}</div>
              <div className="text-[10px] text-slate-500">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Points Redemption Mall */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              名商专属特权兑换商城
            </h3>
            <p className="text-xs text-slate-400">
              用互助积分兑换高价值品牌展位、高层私董席位及名商专访
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rewardItems.map((item) => {
            const canAfford = userPoints >= item.pointsCost;
            return (
              <div
                key={item.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-amber-500/40 p-5 flex flex-col justify-between space-y-4 shadow-lg transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                      {getRewardIcon(item.iconName)}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      库存: {item.stock}件
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="text-[11px] text-amber-400/80 font-mono">
                    有效期: {item.validPeriod}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-base font-black text-amber-300 font-serif">
                    {item.pointsCost}{' '}
                    <span className="text-xs font-normal text-slate-400">分</span>
                  </div>

                  <button
                    onClick={() => setSelectedReward(item)}
                    disabled={!canAfford}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? '立即兑换' : '积分不足'}
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
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              近期积分收支明细
            </h4>
            <span className="text-[11px] text-slate-500">双录凭证已区块链同步</span>
          </div>

          <div className="space-y-2.5">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200">{tx.title}</div>
                  <div className="text-[10px] text-slate-500">{tx.date}</div>
                </div>
                <div
                  className={`font-black font-mono text-sm ${
                    tx.change > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {tx.change > 0 ? `+${tx.change}` : tx.change} 分
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reputation Leaderboard */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              滑铁卢名商影响力琅琊榜
            </h4>
            <span className="text-[11px] text-slate-500">月度榜首直通年度优秀表彰</span>
          </div>

          <div className="space-y-2.5">
            {leaderboard.map((user) => (
              <div
                key={user.rank}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold font-mono text-xs ${
                      user.rank === 1
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                        : user.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : user.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {user.rank}
                  </div>
                  <UserAvatar avatar={user.avatar} name={user.name} size="sm" className="w-7 h-7 rounded-full" />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {user.name}
                      <span className="text-[10px] text-amber-400/90 font-normal">
                        ({user.tier})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {user.company} · 助人 {user.helpedCount} 次
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-amber-300 font-serif text-sm">
                    {user.points.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">公信分</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Redemption Confirmation Modal */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-300">
              {getRewardIcon(selectedReward.iconName)}
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">
                确认兑换特权权益
              </h4>
              <p className="text-xs text-amber-300 font-semibold">
                「{selectedReward.title}」
              </p>
              <p className="text-xs text-slate-400 pt-1">
                将扣除 <strong className="text-amber-400">{selectedReward.pointsCost} 积分</strong>。兑换后可在商会秘书处出示核销使用。
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3 text-xs">
              <button
                onClick={() => setSelectedReward(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
              >
                取消
              </button>
              <button
                onClick={() => handleRedeemConfirm(selectedReward)}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-md"
              >
                确认兑换
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
