import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import ScrollStack, { ScrollStackItem } from './components/ScrollStack';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { InstallPwaModal } from './components/InstallPwaModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ShareModal } from './components/ShareModal';
import { Product, ComparisonHistoryItem, BeforeInstallPromptEvent } from './types';
import { registerServiceWorker } from './registerServiceWorker';
import { Plus, Share2 } from 'lucide-react';

export default function App() {
  const [nextId, setNextId] = useState<number>(3);
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'สินค้า 1', price: '', amount: '', multiplier: 1, unit: 'g' },
    { id: 2, name: 'สินค้า 2', price: '', amount: '', multiplier: 1, unit: 'g' },
  ]);

  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>({});
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [headerHeight, setHeaderHeight] = useState<number>(80);

  // Measure dynamic header height to prevent card overlapping under header on mobile/iOS
  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerEl = document.querySelector('header');
      if (headerEl) {
        const height = headerEl.offsetHeight;
        if (height > 0) {
          setHeaderHeight(height);
        }
      }
    };

    updateHeaderHeight();
    const timer = setTimeout(updateHeaderHeight, 100);

    const headerEl = document.querySelector('header');
    let observer: ResizeObserver | null = null;
    if (headerEl && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updateHeaderHeight);
      observer.observe(headerEl);
    }

    window.addEventListener('resize', updateHeaderHeight);
    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  // Focus and keyboard visibility tracking for Mobile / Safari
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        setIsInputFocused(true);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        const active = document.activeElement;
        if (!active || (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA' && active.tagName !== 'SELECT')) {
          setIsInputFocused(false);
        }
      }, 150);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const [history, setHistory] = useState<ComparisonHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('is_it_worth_it_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 1. PWA & Environment Detection
  useEffect(() => {
    registerServiceWorker((online) => setIsOnline(online));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Standalone detection
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Save history to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('is_it_worth_it_history', JSON.stringify(history));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [history]);

  // Helper to focus inputs
  const focusInput = useCallback((productIndex: number, fieldName: 'price' | 'amount' | 'multiplier' = 'price') => {
    setTimeout(() => {
      setProducts((currentProducts) => {
        if (currentProducts[productIndex]) {
          const key = `${currentProducts[productIndex].id}-${fieldName}`;
          const input = document.querySelector(`[data-input-key="${key}"]`) as HTMLInputElement | null;
          if (input) {
            input.focus();
            input.select();
          }
        }
        return currentProducts;
      });
    }, 50);
  }, []);

  // Focus first input on initial mount only
  useEffect(() => {
    focusInput(0, 'price');
  }, []);

  // Calculate Unit Prices
  const results = products.map((p) => {
    const price = parseFloat(p.price);
    const amountVal = parseFloat(p.amount);
    const multVal = typeof p.multiplier === 'string' ? parseFloat(p.multiplier) : (p.multiplier || 1);
    const isPack = p.isPack !== undefined ? p.isPack : (!isNaN(multVal) && multVal > 1);
    const mult = !isNaN(multVal) && multVal > 0 ? multVal : 1;

    let totalAmount = 0;
    if (!isNaN(amountVal) && amountVal > 0) {
      totalAmount = isPack ? amountVal * mult : amountVal;
    } else if (isPack && mult > 0) {
      totalAmount = mult;
    }

    if (isNaN(price) || price < 0 || totalAmount <= 0) return null;
    return price / totalAmount;
  });

  const validResults = results.filter((r): r is number => r !== null);
  const minUnitPrice = validResults.length >= 2 ? Math.min(...validResults) : null;
  const maxUnitPrice = validResults.length >= 2 ? Math.max(...validResults) : null;
  const isEqualAll = validResults.length >= 2 && minUnitPrice !== null && maxUnitPrice !== null && Math.abs(maxUnitPrice - minUnitPrice) < 0.000001;
  const bestCount = minUnitPrice !== null ? results.filter((r) => r !== null && Math.abs(r - minUnitPrice) < 0.000001).length : 0;
  const isTiedBest = bestCount > 1;
  const bestIndex = minUnitPrice !== null ? results.indexOf(minUnitPrice) : -1;

  // Validate Field
  const validateField = (id: number, field: 'price' | 'amount') => {
    const p = products.find((prod) => prod.id === id);
    if (!p) return false;

    const val = p[field]?.toString().trim() || '';
    const num = parseFloat(val);
    const key = `${id}-${field}`;

    const multVal = typeof p.multiplier === 'string' ? parseFloat(p.multiplier) : (p.multiplier || 1);
    const isPack = p.isPack !== undefined ? p.isPack : (!isNaN(multVal) && multVal > 1);

    // For amount, if in pack mode and amount is empty, it's valid (amount defaults to 1 per item, total items = multiplier)
    if (field === 'amount' && isPack && val === '') {
      setInvalidFields((prev) => ({ ...prev, [key]: false }));
      return true;
    }

    if (!val || isNaN(num) || num <= 0) {
      setInvalidFields((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setInvalidFields((prev) => ({ ...prev, [key]: false }));
      }, 1000);
      return false;
    }

    setInvalidFields((prev) => ({ ...prev, [key]: false }));
    return true;
  };

  // Actions
  const updateProduct = (id: number, fields: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...fields } : p)));
  };

  const addProduct = () => {
    // Validate current cards first
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      if (!validateField(p.id, 'price')) {
        focusInput(i, 'price');
        return;
      }
      if (!validateField(p.id, 'amount')) {
        focusInput(i, 'amount');
        return;
      }
    }

    const newProduct: Product = {
      id: nextId,
      name: `สินค้า ${products.length + 1}`,
      price: '',
      amount: '',
      multiplier: 1,
      unit: products[0]?.unit || 'g',
    };

    setNextId((prev) => prev + 1);
    setProducts((prev) => [...prev, newProduct]);

    const newIndex = products.length;
    focusInput(newIndex, 'price');

    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const removeProduct = (id: number) => {
    if (products.length <= 2) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleKeyDownPrice = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const p = products[index];
      if (validateField(p.id, 'price')) {
        const isPack = p.isPack !== undefined ? p.isPack : false;
        if (isPack) {
          focusInput(index, 'multiplier');
        } else {
          focusInput(index, 'amount');
        }
      }
    }
  };

  const handleKeyDownAmount = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const p = products[index];
      if (validateField(p.id, 'amount')) {
        if (index < products.length - 1) {
          focusInput(index + 1, 'price');
        } else {
          addProduct();
        }
      }
    }
  };

  const handleConfirmReset = () => {
    setProducts([
      { id: nextId, name: 'สินค้า 1', price: '', amount: '', multiplier: 1, unit: 'g' },
      { id: nextId + 1, name: 'สินค้า 2', price: '', amount: '', multiplier: 1, unit: 'g' },
    ]);
    setNextId((prev) => prev + 2);
    setShowResetModal(false);
    focusInput(0, 'price');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallModal(false);
    }
  };

  const saveCurrentToHistory = (title: string) => {
    const bestProduct = bestIndex !== -1 ? products[bestIndex] : undefined;
    const bestRes = bestIndex !== -1 ? results[bestIndex] : null;

    const newItem: ComparisonHistoryItem = {
      id: Date.now().toString(),
      title,
      date: new Date().toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      products: [...products],
      bestProductName: bestProduct?.name || `สินค้า ${bestIndex + 1}`,
      bestUnitPriceFormatted: bestRes ? `฿${bestRes.toFixed(2)}` : undefined,
    };

    setHistory((prev) => [newItem, ...prev]);
  };

  const loadHistoryItem = (item: ComparisonHistoryItem) => {
    setProducts(item.products);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const hasData = products.some((p) => p.price.trim() !== '' || p.amount.trim() !== '');

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Blobs */}
      <div className="bg-blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* Header */}
      <Header
        hasData={hasData}
        onResetClick={() => setShowResetModal(true)}
        onOpenHistory={() => setShowHistoryDrawer(true)}
        onInstallPwaClick={() => setShowInstallModal(true)}
        canInstallPwa={!isStandalone && (!!deferredPrompt || isIOS)}
        isOnline={isOnline}
        historyCount={history.length}
      />

      {/* Main Container */}
      <main
        className="w-full max-w-md mx-auto flex-1 relative z-10 flex flex-col px-4 transition-[padding-top] duration-200"
        style={{ paddingTop: `${headerHeight + 14}px` }}
      >
        {/* Product Cards Stack */}
        <ScrollStack
          useWindowScroll={true}
          itemDistance={16}
          itemScale={0.035}
          itemStackDistance={20}
          stackPosition={`${headerHeight + 14}px`}
          baseScale={0.78}
        >
          {products.map((product, index) => {
            const res = results[index];
            const isThisBest = res !== null && minUnitPrice !== null && Math.abs(res - minUnitPrice) < 0.000001;
            const isThisEqual = res !== null && minUnitPrice !== null && (isEqualAll || (isThisBest && isTiedBest));

            return (
              <ScrollStackItem key={product.id}>
                <ProductCard
                  product={product}
                  index={index}
                  totalProducts={products.length}
                  isBest={isThisBest}
                  isEqual={isThisEqual}
                  unitPrice={res}
                  bestUnitPrice={minUnitPrice}
                  worstUnitPrice={maxUnitPrice}
                  onUpdate={updateProduct}
                  onRemove={removeProduct}
                  onKeyDownPrice={handleKeyDownPrice}
                  onKeyDownAmount={handleKeyDownAmount}
                  invalidFields={invalidFields}
                />
              </ScrollStackItem>
            );
          })}
        </ScrollStack>

        {/* Stack Spacer */}
        <div id="stackSpacer" className={`transition-all duration-300 ${isInputFocused ? 'h-72' : 'h-10'}`} />
      </main>

      {/* Circular Add FAB (+) Button matching exact design */}
      <button
        type="button"
        id="btnAdd"
        onClick={addProduct}
        aria-label="เพิ่มสินค้า"
        title="เพิ่มสินค้า"
        className={`fixed z-30 w-[60px] h-[60px] rounded-full cursor-pointer flex items-center justify-center bg-gradient-to-br from-[#007AFF] to-[#0055B8] text-white border-none shadow-[0_10px_28px_rgba(0,122,255,0.4),0_2px_6px_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95 transition-all duration-300 ${
          isInputFocused ? 'opacity-0 pointer-events-none translate-y-10 scale-75' : 'opacity-100 scale-100 translate-y-0'
        }`}
        style={{
          right: 'max(20px, calc(50vw - 204px))',
          bottom: 'calc(28px + env(safe-area-inset-bottom))',
        }}
      >
        <Plus className="w-7 h-7 stroke-[2.8]" />
      </button>

      {/* Footer matching exact design */}
      <footer className={`w-full relative z-10 mt-auto bg-white/60 backdrop-blur-2xl border-t border-black/5 py-4 pb-[calc(16px+env(safe-area-inset-bottom))] text-center text-[12.5px] font-semibold tracking-[1.2px] text-[#1C1C2E]/50 select-none transition-all duration-300 flex items-center justify-center gap-2 ${
        isInputFocused ? 'opacity-0 pointer-events-none translate-y-full' : 'opacity-100 translate-y-0'
      }`}>
        <span>created by <span className="cosmo-gradient font-bold">cosmo</span></span>
        <span className="opacity-40">•</span>
        <span className="text-[12px] font-mono">v2.3</span>
      </footer>

      {/* Modals & Drawers */}
      <ResetConfirmModal
        isOpen={showResetModal}
        onCancel={() => setShowResetModal(false)}
        onConfirm={handleConfirmReset}
      />

      <InstallPwaModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        onInstall={handleNativeInstall}
        canNativeInstall={!!deferredPrompt}
        isIOS={isIOS}
      />

      <HistoryDrawer
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        history={history}
        onLoadHistory={loadHistoryItem}
        onSaveCurrent={saveCurrentToHistory}
        onDeleteHistory={deleteHistoryItem}
        onClearHistory={clearHistory}
        currentProductsHasData={hasData}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        products={products}
        bestIndex={bestIndex}
        results={results}
      />
    </div>
  );
}
