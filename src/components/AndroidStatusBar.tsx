import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Smartphone } from 'lucide-react';

interface AndroidStatusBarProps {
  isPhoneFrame: boolean;
  onToggleFrame: () => void;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  isPhoneFrame,
  onToggleFrame,
}) => {
  const [timeStr, setTimeStr] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-[#14231d] text-emerald-100/90 text-xs px-4 py-2 flex items-center justify-between border-b border-emerald-950/40 select-none z-30 shrink-0">
      <div className="flex items-center gap-2 font-semibold tracking-wide">
        <span className="text-[13px] text-emerald-200 font-mono font-medium">{timeStr}</span>
        <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-900/60 text-emerald-300 font-medium">
          Android 15
        </span>
      </div>

      {/* Frame switcher & system icons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleFrame}
          title={isPhoneFrame ? 'Switch to Full Screen' : 'Switch to Android Mobile Frame'}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-900/50 hover:bg-emerald-800/60 text-[11px] text-emerald-300 transition-colors border border-emerald-700/30"
          aria-label="Toggle Android phone frame"
        >
          <Smartphone className="w-3 h-3" />
          <span className="hidden sm:inline">{isPhoneFrame ? 'Full View' : 'Phone View'}</span>
        </button>

        <div className="flex items-center gap-1.5 text-emerald-300/80">
          <span className="text-[11px] font-mono font-bold">5G</span>
          <Wifi className="w-3.5 h-3.5 text-emerald-300" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] font-mono">92%</span>
            <Battery className="w-4 h-4 text-emerald-400 rotate-90 fill-emerald-400/80" />
          </div>
        </div>
      </div>
    </header>
  );
};
