import React, { useState } from 'react';
import { Product } from '../types';
import { X, Copy, Check, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  bestIndex: number;
  results: (number | null)[];
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  products,
  bestIndex,
  results,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateShareText = () => {
    let text = `⚖️ ผลการเทียบราคาต่อหน่วย (จากแอป คุ้มไหม):\n\n`;
    const validResults = results.filter((r): r is number => r !== null);
    const minRes = validResults.length >= 2 ? Math.min(...validResults) : null;
    const maxRes = validResults.length >= 2 ? Math.max(...validResults) : null;
    const isEqualAll = validResults.length >= 2 && minRes !== null && maxRes !== null && Math.abs(maxRes - minRes) < 0.000001;

    products.forEach((p, i) => {
      const res = results[i];
      const isThisBest = res !== null && minRes !== null && Math.abs(res - minRes) < 0.000001;
      const resText = res !== null ? `฿${res.toFixed(2)}/หน่วย` : 'ยังไม่ได้ระบุ';
      
      let badge = `   [สินค้า ${i + 1}]`;
      if (isThisBest) {
        if (isEqualAll || validResults.filter((r) => Math.abs(r - minRes) < 0.000001).length > 1) {
          badge = '⚖️ [เท่ากัน]';
        } else {
          badge = '🏆 [คุ้มสุด]';
        }
      }

      const name = p.name || `สินค้า ${i + 1}`;

      const multVal = typeof p.multiplier === 'string' ? parseFloat(p.multiplier) : p.multiplier;
      const mult = !isNaN(multVal) && multVal > 1 ? multVal : 1;
      const amountVal = parseFloat(p.amount);

      let qtyText = '';
      if (mult > 1 && !isNaN(amountVal) && amountVal > 0) {
        qtyText = `แพ็ค ${mult} ชิ้น (ชิ้นละ ${amountVal}) รวม ${mult * amountVal}`;
      } else if (mult > 1) {
        qtyText = `แพ็ค ${mult} ชิ้น`;
      } else {
        qtyText = `${p.amount || 0}`;
      }

      text += `${badge} ${name}: ราคา ฿${p.price || 0} / ปริมาณ ${qtyText} ➔ ${resText}\n`;
    });
    text += `\n📲 เทียบราคาฟรีและใช้ออฟไลน์ได้ที่แอป คุ้มไหม (Is It Worth It?)`;
    return text;
  };

  const shareText = generateShareText();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ผลการเทียบราคา — คุ้มไหม',
          text: shareText,
        });
      } catch (err) {
        console.warn('Share cancelled', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
      <div className="w-full max-w-sm glass-modal rounded-[24px] p-5 border border-white/90 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-black/5 hover:bg-black/10 text-black/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-bold text-[#1C1C2E] flex items-center gap-2 mb-3">
          <Share2 className="w-4 h-4 text-amber-500" />
          <span>แชร์ผลการเทียบราคา</span>
        </h3>

        <textarea
          readOnly
          value={shareText}
          rows={6}
          className="w-full p-3 text-xs bg-black/5 rounded-xl border border-black/10 text-[#1C1C2E] font-mono outline-none resize-none"
        />

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-2.5 px-3 rounded-xl bg-black/5 hover:bg-black/10 text-[#1C1C2E] font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกข้อความ'}</span>
          </button>

          {'share' in navigator && (
            <button
              type="button"
              onClick={handleWebShare}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FF9500] to-[#FF5E3A] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 hover:opacity-95 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>แชร์ออก</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
