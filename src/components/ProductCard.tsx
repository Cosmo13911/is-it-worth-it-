import React, { useState } from 'react';
import { Product } from '../types';
import { X, Percent, Package, Scale, Equal } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  index: number;
  totalProducts: number;
  isBest: boolean;
  isEqual?: boolean;
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
  isEqual = false,
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

  // Pack / Multiplier Calculation Logic
  // Pack mode is active based on explicit product.isPack boolean state or backwards-compatible multiplier > 1
  const isPackMode = product.isPack !== undefined
    ? Boolean(product.isPack)
    : (product.multiplier !== undefined && product.multiplier !== 1 && product.multiplier !== '1' && product.multiplier !== '');

  const multStr = product.multiplier !== undefined ? String(product.multiplier) : '';
  const packQtyNum = parseFloat(multStr);

  const perPieceAmountNum = parseFloat(product.amount);
  let totalAmountCalcText = '';
  if (isPackMode) {
    const validQty = !isNaN(packQtyNum) && packQtyNum > 0 ? packQtyNum : null;
    if (validQty !== null && !isNaN(perPieceAmountNum) && perPieceAmountNum > 0) {
      const totalAmount = validQty * perPieceAmountNum;
      totalAmountCalcText = `${totalAmount.toLocaleString()}`;
    } else if (validQty !== null) {
      totalAmountCalcText = `${validQty} ชิ้น`;
    } else if (!isNaN(perPieceAmountNum) && perPieceAmountNum > 0) {
      totalAmountCalcText = `${perPieceAmountNum.toLocaleString()}`;
    }
  }

  // Auto focus the first empty/unfilled field on the card
  const focusFirstEmptyField = (targetIsPack: boolean, overrideMultiplierValue?: string | number) => {
    setTimeout(() => {
      const hasPrice = Boolean(product.price && String(product.price).trim() !== '');
      const hasAmount = Boolean(product.amount && String(product.amount).trim() !== '');

      let targetKey = 'price';

      if (!hasPrice) {
        targetKey = 'price';
      } else if (targetIsPack) {
        const multVal = overrideMultiplierValue !== undefined
          ? String(overrideMultiplierValue).trim()
          : (product.multiplier !== undefined ? String(product.multiplier).trim() : '');
        const hasMultiplier = Boolean(multVal !== '' && multVal !== '1');

        if (!hasMultiplier) {
          targetKey = 'multiplier';
        } else if (!hasAmount) {
          targetKey = 'amount';
        } else {
          targetKey = 'multiplier';
        }
      } else {
        if (!hasAmount) {
          targetKey = 'amount';
        } else {
          targetKey = 'price';
        }
      }

      const input = document.querySelector(`[data-input-key="${product.id}-${targetKey}"]`) as HTMLInputElement | null;
      if (input) {
        input.focus();
      }
    }, 50);
  };

  return (
    <div
      className={`card glass-card rounded-[22px] overflow-hidden relative transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:shadow-xl ${
        isBest ? 'best glass-card-best' : ''
      }`}
    >
      {/* Card Header */}
      <div className="card-head flex items-center justify-between px-4 py-3 border-b border-black/5">
        <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
          <div
            className={`badge-num w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs shrink-0 ${
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setShowNameEdit(false);
                  const priceInput = document.querySelector(`[data-input-key="${product.id}-price"]`) as HTMLInputElement | null;
                  if (priceInput) priceInput.focus();
                }
              }}
              enterKeyHint="next"
              autoFocus
              className="text-sm font-semibold text-[#1C1C2E] bg-white/80 border border-black/10 rounded-md px-2 py-0.5 outline-none w-28 shrink-0"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowNameEdit(true)}
              className="card-name text-[15px] font-semibold text-[#1C1C2E] hover:text-blue-600 transition-colors flex items-center gap-1 truncate"
            >
              <span className="truncate">{product.name || `สินค้า ${index + 1}`}</span>
            </button>
          )}

          {/* Pack Mode Toggle Button (Shifted to right) */}
          <button
            type="button"
            onClick={() => {
              if (isPackMode) {
                onUpdate(product.id, { isPack: false, multiplier: 1 });
                focusFirstEmptyField(false, 1);
              } else {
                onUpdate(product.id, { isPack: true, multiplier: '' });
                focusFirstEmptyField(true, '');
              }
            }}
            className={`ml-auto shrink-0 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              isPackMode
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-black/5 hover:bg-black/10 text-black/50 hover:text-black/80'
            }`}
            title={isPackMode ? "ยกเลิกโหมดแพ็ค (สลับเป็นชิ้นเดียว)" : "คำนวณเป็นแพ็ค / หลายชิ้น"}
          >
            <Package className="w-3.5 h-3.5" />
            <span className="text-[10.5px] font-semibold">
              {isPackMode ? 'แพ็ค' : '+ แพ็ค'}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Best Value / Equal Badge */}
          {isBest && (
            <span
              className={`badge-best text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1 ${
                isEqual
                  ? 'bg-blue-500/15 text-[#0066CC] border border-blue-500/25'
                  : 'bg-emerald-500/15 text-[#1E7A38] border border-emerald-500/25'
              }`}
            >
              {isEqual ? (
                <>
                  <Scale className="w-3.5 h-3.5" />
                  <span>เท่ากัน</span>
                </>
              ) : (
                '✓ คุ้มสุด'
              )}
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
      <div className="card-inputs">
        {!isPackMode ? (
          /* Standard Single Item View (2 Columns) */
          <div>
            <div className="grid grid-cols-2">
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
                  enterKeyHint="next"
                  autoComplete="off"
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
                  enterKeyHint={index < totalProducts - 1 ? 'next' : 'done'}
                  autoComplete="off"
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
          </div>
        ) : (
          /* Pack / Multi-piece View (2 Rows with auto-calculated total) */
          <div className="divide-y divide-black/5">
            <div className="grid grid-cols-2">
              {/* Price Cell */}
              <div
                className={`input-cell px-4 py-3 border-r border-black/5 border-b-2 transition-all ${
                  priceInvalid ? 'border-b-[#FF3B30] bg-red-500/5 animate-shake' : 'border-b-transparent'
                }`}
              >
                <label className="text-[11.5px] font-medium text-black/50 block">ราคารวม (฿)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  enterKeyHint="next"
                  autoComplete="off"
                  placeholder="0"
                  value={product.price}
                  data-input-key={`${product.id}-price`}
                  onChange={(e) => onUpdate(product.id, { price: e.target.value })}
                  onFocus={handleInputFocus}
                  onKeyDown={(e) => onKeyDownPrice(e, index)}
                  className="w-full text-2xl font-semibold bg-transparent border-none outline-none mt-0.5 text-[#1C1C2E] placeholder:text-black/20"
                />
              </div>

              {/* Multiplier / Quantity Cell */}
              <div className="input-cell px-4 py-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11.5px] font-medium text-black/50 block">จำนวนในแพ็ค (ชิ้น)</label>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdate(product.id, { isPack: false, multiplier: 1 });
                      focusFirstEmptyField(false, 1);
                    }}
                    className="text-[10px] font-semibold text-black/40 hover:text-red-500 transition-colors"
                    title="สลับเป็นชิ้นเดียว"
                  >
                    ✕ ชิ้นเดียว
                  </button>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  enterKeyHint="next"
                  autoComplete="off"
                  placeholder="ระบุ"
                  value={product.multiplier !== undefined ? String(product.multiplier) : ''}
                  data-input-key={`${product.id}-multiplier`}
                  onChange={(e) => onUpdate(product.id, { multiplier: e.target.value })}
                  onFocus={handleInputFocus}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const amountInput = document.querySelector(`[data-input-key="${product.id}-amount"]`) as HTMLInputElement | null;
                      if (amountInput) amountInput.focus();
                    }
                  }}
                  className="w-full text-2xl font-semibold bg-transparent border-none outline-none mt-0.5 text-amber-600 placeholder:text-black/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 bg-black/[0.02]">
              {/* Amount Per Piece Cell */}
              <div
                className={`input-cell px-4 py-2.5 border-r border-black/5 border-b-2 transition-all ${
                  amountInvalid ? 'border-b-[#FF3B30] bg-red-500/5 animate-shake' : 'border-b-transparent'
                }`}
              >
                <label className="text-[11px] font-medium text-black/50 block">ปริมาณต่อ 1 ชิ้น</label>
                <input
                  type="text"
                  inputMode="decimal"
                  enterKeyHint={index < totalProducts - 1 ? 'next' : 'done'}
                  autoComplete="off"
                  placeholder="ระบุ (ถ้ามี)"
                  value={product.amount}
                  data-input-key={`${product.id}-amount`}
                  onChange={(e) => onUpdate(product.id, { amount: e.target.value })}
                  onFocus={handleInputFocus}
                  onKeyDown={(e) => onKeyDownAmount(e, index)}
                  className="w-full text-lg font-semibold bg-transparent border-none outline-none mt-0.5 text-[#1C1C2E] placeholder:text-black/25"
                />
              </div>

              {/* Total Amount (Auto calculated) */}
              <div className="input-cell px-4 py-2.5 flex flex-col justify-center">
                <span className="text-[11px] font-medium text-black/50 block">ปริมาณรวมทั้งหมด</span>
                <div className="text-sm font-bold text-[#1C1C2E] mt-1 flex items-center gap-1">
                  {totalAmountCalcText ? (
                    <span className="text-base font-bold font-mono text-[#1C1C2E]">
                      {totalAmountCalcText}
                    </span>
                  ) : (
                    <span className="text-xs text-black/35 font-normal">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result Section */}
      {unitPrice !== null && (
        <div
          className={`card-result flex items-center justify-between px-4 py-2.5 border-t border-black/5 ${
            isBest
              ? isEqual
                ? 'bg-blue-500/10 text-[#0055B8]'
                : 'bg-emerald-500/12 text-[#1E7A38]'
              : 'bg-white/50 text-[#1C1C2E]'
          }`}
        >
          <div>
            <span className="text-xs text-black/55 block">
              {isEqual ? 'ราคาต่อหน่วย (เท่ากัน)' : 'ราคาต่อหน่วย'}
            </span>
            {isBest && !isEqual && savingsPercent !== null && savingsPercent > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10.5px] font-bold text-emerald-700 bg-emerald-500/20 px-1.5 py-0.2 rounded-md mt-0.5">
                <Percent className="w-2.5 h-2.5" /> ประหยัดกว่า {savingsPercent}%
              </span>
            )}
            {isEqual && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-blue-700 bg-blue-500/20 px-1.5 py-0.5 rounded-md mt-0.5">
                <Scale className="w-3 h-3" /> ราคาเท่ากันพอดี
              </span>
            )}
          </div>
          <span
            className={`text-lg font-bold ${
              isBest
                ? isEqual
                  ? 'text-[#0055B8]'
                  : 'text-[#1E7A38]'
                : 'text-[#1C1C2E]'
            }`}
          >
            ฿{unitPrice < 0.01 ? unitPrice.toFixed(4) : unitPrice.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};
