'use client';

import { useTranslations } from 'next-intl';

interface SkuSelectorProps {
  skus: string[];
  selectedSku: string;
  compareSku: string | null;
  onSelectSku: (sku: string) => void;
  onSelectCompare: (sku: string | null) => void;
}

export default function SkuSelector({
  skus,
  selectedSku,
  compareSku,
  onSelectSku,
  onSelectCompare,
}: SkuSelectorProps) {
  const t = useTranslations('sku');

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm text-text-secondary mb-1 block">
            {t('select')}
          </label>
          <select
            value={selectedSku}
            onChange={(e) => onSelectSku(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {skus.map((sku) => (
              <option key={sku} value={sku}>{sku}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-sm text-text-secondary mb-1 block">
            {t('compare')}
          </label>
          <select
            value={compareSku || ''}
            onChange={(e) => onSelectCompare(e.target.value || null)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">—</option>
            {skus
              .filter((s) => s !== selectedSku)
              .map((sku) => (
                <option key={sku} value={sku}>{sku}</option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
}
