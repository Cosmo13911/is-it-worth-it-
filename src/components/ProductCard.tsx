import React, { useState } from 'react';
import { Product } from '../types';
import { X, Percent } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  index: number;
  totalProducts: number;
  isBest: boolean;
  unitPrice: number | null;
  bestUnitPrice: number | null;
  worstUnitPrice: number | null;
  onUpdate: (id: number, fields: Partial<Product>) => void;
  onRemove: (id: number) => void;
  onKeyDownPrice: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
  onKeyDownAmount: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
  invalidFields: Record<string, boolean>;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index,
  totalProducts,
  isBest,
  unitPrice,
  worstUnitPrice,
  onUpdate,
  onRemove,
  onKeyDownPrice,
  onKeyDownAmount,
  invalidFields,
}) => {
  const [showNameEdit, setShowNameEdit] = useState(false);

  // Calculate savings percentage relative to worst or next option
  let savingsPercent: number | null = null;
  if (isBest && worstUnitPrice && unitPrice && worstUnitPrice > unitPrice) {
    savingsPercent = Math.round(((worstUnitPrice - unitPrice) / worstUnitPrice) * 100);
  }

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    setTimeout(() => {
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 200);
  };

  const priceInvalid = invalidFields[`${product.id}-price`];
  const amountInvalid = invalidFields[`${product.id}-amount`];

  return (
    <div
      className={`card glass-card rounded-[22px] overflow-hidden relative ${
        isBest ? 'best glass-card-best' : ''
      }`}
    >
      {/* Card Header */}
      <div className="card-head flex items-center justify-between px-4 py-3 border-b border-black/5">
        <div className="flex items-center gap-2.5">
          <div
            className={`badge-num w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs ${
              isBest
                ? 'bg-gradient-to-br from-[#4CD964] to-[#28A745] shadow-green-500/20'
                : 'bg-gradient-to-br from-[#4A90E2] to-[#0066CC] shadow-blue-500/20'
            }`}
          >
            {index + 1}
          </div>

          {showNameEdit ? (
            <input
              type="text"
              value={product.name}
              onChange={(e) => onUpdate(product.id, { name: e.target.value })}
              onBlur={() => setShowNameEdit(false)}
              onKeyDown={(e) => e.key === 'Enter' && setShowNameEdit(false)}
              autoFocus
              className="text-sm font-semibold text-[#1C1C2E] bg-white/80 border border-black/10 rounded-md px-2 py-0.5 outline-none w-32"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowNameEdit(true)}
              className="card-name text-[15px] font-semibold text-[#1C1C2E] hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <span>{product.name || `สินค้า ${index + 1}`}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Best Value Badge */}
          {isBest && (
            <span className="badge-best text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-[#1E7A38] border border-emerald-500/25 backdrop-blur-xs flex items-center gap-1">
              ✓ คุ้มสุด
            </span>
          )}

          {/* Remove button if cards > 2 */}
          {totalProducts > 2 && (
            <button
              type="button"
              onClick={() => onRemove(product.id)}
              className="btn-remove w-6 h-6 rounded-full bg-black/5 text-black/50 hover:bg-black/10 active:opacity-50 text-xs border border-black/5 flex items-center justify-center transition-all"
              title="ลบสินค้านี้"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Input Cells */}
      <div className="card-inputs grid grid-cols-2">
        {/* Price Cell */}
        <div
          className={`input-cell px-4 py-3 border-r border-black/5 border-b-2 transition-all ${
            priceInvalid ? 'border-b-[#FF3B30] bg-red-500/5 animate-shake' : 'border-b-transparent'
          }`}
        >
          <label className="text-[11.5px] font-medium text-black/50 block">ราคา (฿)</label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={product.price}
            data-input-key={`${product.id}-price`}
            onChange={(e) => onUpdate(product.id, { price: e.target.value })}
            onFocus={handleInputFocus}
            onKeyDown={(e) => onKeyDownPrice(e, index)}
            className="w-full text-2xl font-semibold bg-transparent border-none outline-none mt-0.5 text-[#1C1C2E] placeholder:text-black/20"
          />
        </div>

        {/* Amount Cell */}
        <div
          className={`input-cell px-4 py-3 border-b-2 transition-all ${
            amountInvalid ? 'border-b-[#FF3B30] bg-red-500/5 animate-shake' : 'border-b-transparent'
          }`}
        >
          <label className="text-[11.5px] font-medium text-black/50 block">ปริมาณ</label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={product.amount}
            data-input-key={`${product.id}-amount`}
            onChange={(e) => onUpdate(product.id, { amount: e.target.value })}
            onFocus={handleInputFocus}
            onKeyDown={(e) => onKeyDownAmount(e, index)}
            className="w-full text-2xl font-semibold bg-transparent border-none outline-none mt-0.5 text-[#1C1C2E] placeholder:text-black/20"
          />
        </div>
      </div>

      {/* Result Section */}
      {unitPrice !== null && (
        <div
          className={`card-result flex items-center justify-between px-4 py-2.5 border-t border-black/5 ${
            isBest ? 'bg-emerald-500/12 text-[#1E7A38]' : 'bg-white/50 text-[#1C1C2E]'
          }`}
        >
          <div>
            <span className="text-xs text-black/55 block">ราคาต่อหน่วย</span>
            {isBest && savingsPercent !== null && savingsPercent > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10.5px] font-bold text-emerald-700 bg-emerald-500/20 px-1.5 py-0.2 rounded-md mt-0.5">
                <Percent className="w-2.5 h-2.5" /> ประหยัดกว่า {savingsPercent}%
              </span>
            )}
          </div>
          <span className={`text-lg font-bold ${isBest ? 'text-[#1E7A38]' : 'text-[#1C1C2E]'}`}>
            ฿{unitPrice < 0.01 ? unitPrice.toFixed(4) : unitPrice.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};
