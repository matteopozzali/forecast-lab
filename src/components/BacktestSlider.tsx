'use client';

import { useTranslations } from 'next-intl';

interface BacktestSliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export default function BacktestSlider({ value, min, max, onChange }: BacktestSliderProps) {
  const t = useTranslations('backtest');

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h4 className="font-semibold text-teal-dark mb-1">{t('title')}</h4>
      <p className="text-xs text-text-secondary mb-4">{t('description')}</p>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-teal"
        />
        <span className="text-sm font-mono font-medium text-text-primary min-w-[60px] text-right">
          {value} {t('periods')}
        </span>
      </div>
    </div>
  );
}
