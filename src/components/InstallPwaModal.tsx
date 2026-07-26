import React from 'react';
import { Download, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  canNativeInstall: boolean;
  isIOS: boolean;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  canNativeInstall,
  isIOS,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-opacity">
      <div className="w-full max-w-sm glass-modal rounded-[24px] overflow-hidden p-6 border border-white/90 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-black/5 hover:bg-black/10 text-black/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF9500] to-[#FF5E3A] p-3 shadow-lg shadow-orange-500/30 flex items-center justify-center mb-3">
            <svg width="40" height="40" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
              <rect x="115" y="58" width="10" height="110" rx="5" fill="#FFF"/>
              <circle cx="120" cy="54" r="9" fill="#FFF"/>
              <rect x="92" y="164" width="56" height="12" rx="6" fill="#FFF"/>
              <rect x="48" y="66" width="144" height="10" rx="5" fill="#FFF"/>
              <path d="M28 112 A28 24 0 0 0 84 112" fill="none" stroke="#FFF" strokeWidth="7" strokeLinecap="round"/>
              <path d="M156 112 A28 24 0 0 0 212 112" fill="none" stroke="#FFF" strokeWidth="7" strokeLinecap="round"/>
              <text x="184" y="109" textAnchor="middle" fontFamily="-apple-system, sans-serif" fontSize="30" fontWeight="700" fill="#FFF">฿</text>
            </svg>
          </div>

          <h3 className="text-xl font-bold text-[#1C1C2E]">ติดตั้งแอป "คุ้มไหม"</h3>
          <p className="text-xs text-black/60 mt-1 max-w-[260px]">
            ใช้งานสะดวกจากหน้าจอหลัก เปิดแอปได้รวดเร็วทันที และคำนวณราคาต่อหน่วยได้แม้ออฟไลน์
          </p>
        </div>

        {/* Native Install Button */}
        {canNativeInstall ? (
          <div className="mt-6">
            <button
              type="button"
              onClick={onInstall}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF9500] to-[#FF5E3A] text-white font-bold text-base shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>ติดตั้งแอปพลิเคชัน</span>
            </button>
          </div>
        ) : isIOS ? (
          /* iOS Safari Guide */
          <div className="mt-5 space-y-3 bg-black/5 p-4 rounded-2xl border border-black/5 text-xs text-[#1C1C2E]">
            <p className="font-bold text-sm text-black/80 flex items-center gap-1.5">
              <span>คำแนะนำสำหรับ iPhone / iPad:</span>
            </p>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-700 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
              <p>
                แตะปุ่ม <span className="font-bold text-blue-600 inline-flex items-center gap-0.5 bg-blue-50 px-1.5 py-0.5 rounded"><Share className="w-3 h-3 inline" /> แชร์</span> ที่เมนูด้านล่างของ Safari
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-700 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
              <p>
                เลื่อนลงแล้วเลือก <span className="font-bold text-black inline-flex items-center gap-0.5 bg-gray-200/80 px-1.5 py-0.5 rounded"><PlusSquare className="w-3 h-3 inline" /> เพิ่มไปยังหน้าจอหลัก</span>
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-700 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
              <p>แตะ "เพิ่ม" (Add) ที่มุมขวาบน</p>
            </div>
          </div>
        ) : (
          <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 text-center">
            คุณสามารถเพิ่มแอปนี้ไปยังหน้าจอหลักผ่านเมนูเบราว์เซอร์ของคุณ (Add to Home Screen)
          </div>
        )}

        {/* Features Checklist */}
        <div className="mt-4 pt-3 border-t border-black/5 flex justify-around text-[11px] font-semibold text-black/60">
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ใช้งานออฟไลน์</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> คำนวณเร็ว</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ไม่มีโฆษณา</span>
        </div>
      </div>
    </div>
  );
};
