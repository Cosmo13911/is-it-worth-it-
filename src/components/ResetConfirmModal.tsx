import React from 'react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8 bg-black/25 backdrop-blur-xs transition-opacity duration-200">
      <div className="w-full max-w-[270px] rounded-[20px] overflow-hidden text-center glass-modal border border-white/90 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="px-4 pt-5 pb-4">
          <p className="text-[17px] font-bold text-[#1C1C2E]">ล้างข้อมูลทั้งหมด?</p>
          <p className="text-[13px] text-black/65 mt-1 leading-snug">
            ข้อมูลสินค้าทั้งหมดจะถูกลบและเริ่มเทียบใหม่
          </p>
        </div>

        <div className="grid grid-cols-2 border-t border-black/10">
          <button
            type="button"
            onClick={onCancel}
            className="py-3 text-[17px] font-medium text-[#0066DD] border-r border-black/10 hover:bg-black/5 active:opacity-50 transition-all"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="py-3 text-[17px] font-bold text-[#E0342A] hover:bg-black/5 active:opacity-50 transition-all"
          >
            ล้างข้อมูล
          </button>
        </div>
      </div>
    </div>
  );
};
