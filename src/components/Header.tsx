import React from 'react';
import { RefreshCw, Download, BookmarkCheck, WifiOff } from 'lucide-react';

interface HeaderProps {
  hasData: boolean;
  onResetClick: () => void;
  onOpenHistory: () => void;
  onInstallPwaClick?: () => void;
  canInstallPwa?: boolean;
  isOnline: boolean;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  hasData,
  onResetClick,
  onOpenHistory,
  onInstallPwaClick,
  canInstallPwa,
  isOnline,
  historyCount,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-header">
      <div className="max-w-md mx-auto px-5 pt-[calc(env(safe-area-inset-top)+14px)] pb-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Balance Scale Logo Badge matching exact design */}
            <div className="relative group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <svg width="44" height="44" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
                <defs>
                  <linearGradient id="iconBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF9500"/>
                    <stop offset="100%" stopColor="#FF5E3A"/>
                  </linearGradient>
                </defs>
                <rect x="4" y="4" width="232" height="232" rx="52" fill="url(#iconBg)"/>
                <rect x="4" y="4" width="232" height="232" rx="52" fill="none" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="3"/>
                <rect x="115" y="58" width="10" height="110" rx="5" fill="#FFF"/>
                <circle cx="120" cy="54" r="9" fill="#FFF"/>
                <rect x="92" y="164" width="56" height="12" rx="6" fill="#FFF"/>
                <rect x="104" y="158" width="32" height="10" rx="5" fill="#FFF"/>
                <rect x="48" y="66" width="144" height="10" rx="5" fill="#FFF"/>
                <circle cx="56" cy="71" r="7" fill="#FFF"/>
                <circle cx="184" cy="71" r="7" fill="#FFF"/>
                <line x1="48" y1="78" x2="36" y2="112" stroke="#FFF" strokeWidth="5" strokeLinecap="round"/>
                <line x1="64" y1="78" x2="76" y2="112" stroke="#FFF" strokeWidth="5" strokeLinecap="round"/>
                <path d="M28 112 A28 24 0 0 0 84 112" fill="none" stroke="#FFF" strokeWidth="7" strokeLinecap="round"/>
                <line x1="28" y1="112" x2="84" y2="112" stroke="#FFF" strokeWidth="5" strokeLinecap="round"/>
                <line x1="176" y1="78" x2="164" y2="112" stroke="#FFF" strokeWidth="5" strokeLinecap="round"/>
                <line x1="192" y1="78" x2="204" y2="112" stroke="#FFF" strokeWidth="5" strokeLinecap="round"/>
                <path d="M156 112 A28 24 0 0 0 212 112" fill="none" stroke="#FFF" strokeWidth="7" strokeLinecap="round"/>
                <line x1="156" y1="112" x2="212" y2="112" stroke="#FFF" strokeWidth="5" strokeLinecap="round"/>
                <circle cx="56" cy="98" r="10" fill="#FFF"/>
                <rect x="50" y="105" width="12" height="7" rx="3" fill="#FFF"/>
                <line x1="56" y1="82" x2="56" y2="87" stroke="#FFF" strokeWidth="3.5" strokeLinecap="round"/>
                <line x1="40" y1="90" x2="44" y2="94" stroke="#FFF" strokeWidth="3.5" strokeLinecap="round"/>
                <line x1="72" y1="90" x2="68" y2="94" stroke="#FFF" strokeWidth="3.5" strokeLinecap="round"/>
                <text x="184" y="109" textAnchor="middle" fontFamily="-apple-system, Helvetica, Arial" fontSize="30" fontWeight="700" fill="#FFF">฿</text>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-[25px] font-bold tracking-tight text-[#111118] leading-none">คุ้มไหม</h1>
                {!isOnline && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    <WifiOff className="w-2.5 h-2.5" /> ออฟไลน์
                  </span>
                )}
              </div>
              <p className="text-[10px] font-semibold tracking-[1.8px] text-[#1C1C2E]/40 mt-0.5 uppercase">
                IS IT WORTH IT?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* PWA Install Action Button */}
            {canInstallPwa && (
              <button
                type="button"
                onClick={onInstallPwaClick}
                title="ติดตั้งแอป PWA"
                aria-label="ติดตั้งแอป PWA"
                className="p-2 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 active:scale-95 transition-all flex items-center justify-center"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {/* History Button */}
            <button
              type="button"
              onClick={onOpenHistory}
              title="ประวัติการเทียบราคา"
              aria-label="ประวัติการเทียบราคา"
              className="relative p-2 rounded-full bg-black/5 text-[#1C1C2E]/70 border border-black/5 hover:bg-black/10 active:scale-95 transition-all flex items-center justify-center"
            >
              <BookmarkCheck className="w-4 h-4" />
              {historyCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Reset Button */}
            {hasData && (
              <button
                type="button"
                onClick={onResetClick}
                title="ล้างข้อมูล"
                aria-label="ล้างข้อมูล"
                className="p-2 rounded-full bg-red-500/10 text-[#E0342A] border border-red-500/15 backdrop-blur-md shadow-xs active:scale-95 active:opacity-60 transition-all flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
