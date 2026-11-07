import React, { useState } from 'react';
import { ChamberEvent, UserProfile } from '../types';
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
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EventsHubProps {
  events: ChamberEvent[];
  userPoints: number;
  user?: UserProfile;
  onRegisterEvent: (eventId: string | number) => void;
  onCheckInEvent: (eventId: string | number, pointsReward: number) => void;
}

export const EventsHub: React.FC<EventsHubProps> = ({
  events,
  userPoints,
  user,
  onRegisterEvent,
  onCheckInEvent,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<ChamberEvent | null>(null);
  const [showTicketModal, setShowTicketModal] = useState<ChamberEvent | null>(null);

  const handleRSVP = (evt: ChamberEvent) => {
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-400" />
            滑铁卢名商会 品牌活动与闭门私董
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            高端峰会 · 私董沙龙 · 投融资对接 · 扫码签到享专属积分回馈
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {events.map((evt) => {
          const percentFull = Math.min(
            100,
            Math.round((evt.registeredCount / evt.capacity) * 100)
          );

          return (
            <div
              key={evt.id}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all overflow-hidden flex flex-col justify-between shadow-xl"
            >
              <div>
                {/* Image Cover */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                  <img
                    src={evt.coverImage}
                    alt={evt.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* Top Type Badge */}
                  <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-500/40">
                    {evt.type}
                  </span>

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
                    {evt.checkedIn ? '已核销入场 · 查看电子票' : '已报名 · 查看入场二维码'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleRSVP(evt)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
                  >
                    立即在线报名
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State for Clean Real Test Stage */}
      {events.length === 0 && (
        <div className="text-center py-16 px-6 rounded-3xl border border-dashed border-slate-800 bg-slate-900/40">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">商会官方品牌活动筹备中</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            系统已完成虚假演示活动清理，进入真实运营与客户测试阶段。近期将由商会秘书处正式发布首批滑铁卢私董沙龙、科技领袖闭门峰会与投融资对接酒会。
          </p>
        </div>
      )}

      {/* Agenda Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                活动全案与演讲日程
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
                {selectedEvent.agenda.map((ag, i) => (
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
                名商会数字通行凭证
              </div>
              <h3 className="text-base font-bold text-white pt-1">
                {showTicketModal.title}
              </h3>
              <p className="text-xs text-slate-400">
                持票会员: {user?.name || '会员嘉宾'} ({user?.company || '名商会成员'})
              </p>
            </div>

            {/* Dynamic QR Code Card */}
            <div className="bg-white p-5 rounded-2xl shadow-inner mx-auto inline-block border-4 border-amber-400/40">
              <div className="w-48 h-48 bg-slate-950 p-2 rounded-xl flex flex-col items-center justify-center space-y-2">
                {/* SVG QR Code Simulation */}
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
                  WEBA-PASS-2026-X889
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
