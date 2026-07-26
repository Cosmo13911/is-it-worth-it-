export type UnitType = 'g' | 'ml' | 'kg' | 'l' | 'pcs' | 'pack' | 'custom';

export interface UnitOption {
  value: UnitType;
  label: string;
  defaultLabel: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  amount: string;
  multiplier: number;
  unit: UnitType;
  customUnitLabel?: string;
}

export interface ComparisonHistoryItem {
  id: string;
  title: string;
  date: string;
  products: Product[];
  bestProductName?: string;
  bestUnitPriceFormatted?: string;
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}
