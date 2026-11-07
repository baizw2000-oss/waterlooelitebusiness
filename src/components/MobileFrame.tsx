import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface MobileFrameProps {
  isMobileFrame: boolean;
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  isMobileFrame,
  children,
}) => {
  if (!isMobileFrame) {
    return <div className="min-h-screen w-full">{children}</div>;
  }

  return (
    <div className="min-h-screen py-6 sm:py-10 px-2 flex flex-col items-center justify-center bg-slate-950">
      {/* Mobile Device Frame */}
      <div className="relative w-full max-w-[420px] h-[880px] bg-slate-900 rounded-[52px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-amber-500/20 overflow-hidden flex flex-col">
        {/* Dynamic Island / Top Speaker Notch */}
        <div className="absolute top-0 inset-x-0 h-11 z-50 flex items-center justify-between px-7 text-white text-[12px] font-semibold select-none pointer-events-none">
          <span>9:41</span>
          
          {/* Dynamic Island pill */}
          <div className="w-24 h-5 bg-black rounded-full mx-auto flex items-center justify-center space-x-1.5 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
            <div className="w-2 h-2 rounded-full bg-cyan-900/60" />
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Scrollable Device Screen Content */}
        <div className="flex-1 w-full overflow-y-auto pt-10 pb-16 scrollbar-none bg-slate-950 text-slate-100 relative">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="absolute bottom-1 inset-x-0 h-4 z-50 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-1 bg-slate-500/60 rounded-full" />
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-slate-500 font-medium">
        📱 正在以 Flutter 跨平台原生移动 App 视口运行 (支持实时手势与功能交互)
      </div>
    </div>
  );
};
