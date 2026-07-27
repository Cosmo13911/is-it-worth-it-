import React, { useState } from 'react';
import { ComparisonHistoryItem } from '../types';
import { X, Trash2, ArrowUpRight, BookmarkPlus, ShoppingBag, Calendar } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: ComparisonHistoryItem[];
  onLoadHistory: (item: ComparisonHistoryItem) => void;
  onSaveCurrent: (title: string) => void;
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
  currentProductsHasData: boolean;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onLoadHistory,
  onSaveCurrent,
  onDeleteHistory,
  onClearHistory,
  currentProductsHasData,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onSaveCurrent(newTitle.trim());
    setNewTitle('');
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 p-0 sm:p-4">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet Popup Container */}
      <div
        className="relative w-full max-w-lg bg-[#F8F9FC] rounded-t-[30px] sm:rounded-[30px] max-h-[85vh] flex flex-col shadow-2xl border border-black/10 overflow-hidden animate-in slide-in-from-bottom duration-300"
        data-lenis-prevent
      >
        {/* Top Grab Handle */}
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-black/15 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 bg-white border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1C1C2E]">ประวัติการเทียบราคา</h2>
              <p className="text-xs text-black/45">รายการที่บันทึกไว้ ({history.length})</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-black/5 hover:bg-black/10 text-black/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Save current option */}
        {currentProductsHasData && (
          <div className="p-4 bg-white border-b border-black/5">
            {!isSaving ? (
              <button
                type="button"
                onClick={() => setIsSaving(true)}
                className="w-full py-3 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 font-bold text-sm border border-amber-500/25 flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <BookmarkPlus className="w-4.5 h-4.5" />
                <span>บันทึกการเทียบราคานี้</span>
              </button>
            ) : (
              <form onSubmit={handleSave} className="space-y-2.5">
                <label className="text-xs font-bold text-black/70 block">
                  ตั้งชื่อรายการบันทึก:
                </label>
                <input
                  type="text"
                  placeholder="เช่น ซื้อนมสด หรือ เปรียบเทียบสินค้า"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  className="w-full px-3.5 py-2.5 text-sm bg-black/5 border border-black/10 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!newTitle.trim()}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs disabled:opacity-50 transition-colors shadow-xs"
                  >
                    บันทึก
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSaving(false)}
                    className="px-4 py-2 bg-black/5 hover:bg-black/10 text-black/60 rounded-xl text-xs font-semibold transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* History List */}
        <div
          className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 overscroll-contain"
          data-lenis-prevent
        >
          {history.length === 0 ? (
            <div className="text-center py-12 text-black/40 text-xs font-medium">
              ยังไม่มีประวัติการเทียบราคาที่บันทึกไว้
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white rounded-2xl border border-black/5 shadow-xs hover:border-amber-500/30 transition-all group relative"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#1C1C2E] group-hover:text-amber-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-black/40 flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteHistory(item.id)}
                    className="p-1.5 rounded-lg text-black/30 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="ลบ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Best product preview */}
                {item.bestProductName && (
                  <div className="mt-3 pt-2.5 border-t border-dashed border-black/10 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      ✓ {item.bestProductName} คุ้มสุด
                    </span>
                    <span className="font-bold text-[#1C1C2E]">
                      {item.bestUnitPriceFormatted}
                    </span>
                  </div>
                )}

                {/* Load button */}
                <button
                  type="button"
                  onClick={() => {
                    onLoadHistory(item);
                    onClose();
                  }}
                  className="w-full mt-3 py-2 bg-slate-100 hover:bg-amber-500 hover:text-white text-[#1C1C2E] rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all"
                >
                  <span>ดึงข้อมูลมาดู</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Clear All */}
        {history.length > 0 && (
          <div className="p-3 bg-white border-t border-black/5">
            <button
              type="button"
              onClick={onClearHistory}
              className="w-full py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors text-center"
            >
              ล้างประวัติทั้งหมด
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
