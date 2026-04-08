'use client';

import { useTranslations } from 'next-intl';

interface HorizonSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function HorizonSlider({ value, onChange }: HorizonSliderProps) {
  const t = useTranslations('horizon');
  const options = [3, 6, 12];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h4 className="font-semibold text-teal-dark mb-1">{t('title')}</h4>
      <p className="text-xs text-text-secondary mb-4">{t('description')}</p>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              value === opt
                ? 'bg-primary-teal text-white'
                : 'bg-surface text-text-secondary hover:bg-gray-100'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
