'use client';

import { useTranslations } from 'next-intl';
import { ForecastResult } from '@/lib/types';

interface DashboardHeaderProps {
  datasetName: string;
  frequency: string;
  horizon: number;
  result: ForecastResult;
}

export default function DashboardHeader({
  datasetName,
  frequency,
  horizon,
  result,
}: DashboardHeaderProps) {
  const t = useTranslations('dashboard');
  const tm = useTranslations('models');
  const best = result.models.find((m) => m.name === result.bestModel)!;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">{datasetName}</h2>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-text-secondary">
            <span>
              {t('frequency')}: <strong className="text-text-primary">{t(frequency)}</strong>
            </span>
            <span>
              {t('horizon')}: <strong className="text-text-primary">{horizon} {t('periods')}</strong>
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface rounded-lg px-4 py-2 text-center">
            <div className="text-xs text-text-secondary">{t('best_model')}</div>
            <div className="font-semibold text-teal-dark">{tm(result.bestModel)}</div>
          </div>
          <div className="bg-surface rounded-lg px-4 py-2 text-center">
            <div className="text-xs text-text-secondary">{t('mae')}</div>
            <div className="font-mono font-semibold text-text-primary">
              {best.kpis.mae.toFixed(1)}
            </div>
          </div>
          <div className="bg-surface rounded-lg px-4 py-2 text-center">
            <div className="text-xs text-text-secondary">{t('bias')}</div>
            <div className="font-mono font-semibold text-text-primary">
              {best.kpis.bias > 0 ? '+' : ''}{best.kpis.bias.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
