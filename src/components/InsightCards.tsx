'use client';

import { useTranslations } from 'next-intl';
import { ForecastResult } from '@/lib/types';

interface InsightCardsProps {
  result: ForecastResult;
}

export default function InsightCards({ result }: InsightCardsProps) {
  const t = useTranslations('insights');
  const tm = useTranslations('models');
  const sorted = [...result.models].sort((a, b) => a.kpis.mae - b.kpis.mae);
  const best = sorted[0];
  const runner = sorted.length > 1 ? sorted[1] : null;
  const diff = runner
    ? (((runner.kpis.mae - best.kpis.mae) / runner.kpis.mae) * 100).toFixed(1)
    : '0';
  const bias = best.kpis.bias;
  const absBias = Math.abs(bias);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Best Model Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-primary-green text-lg">🏆</span>
          <h4 className="font-semibold text-teal-dark">{t('best_model_title')}</h4>
        </div>
        <p className="text-sm text-text-secondary">
          {t('best_model_desc', {
            model: tm(best.name),
            mae: best.kpis.mae.toFixed(1),
            runner: runner ? tm(runner.name) : '—',
            diff,
          })}
        </p>
      </div>

      {/* Bias Signal Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{bias > 0 ? '📈' : bias < 0 ? '📉' : '⚖️'}</span>
          <h4 className="font-semibold text-teal-dark">{t('bias_title')}</h4>
        </div>
        <p className="text-sm text-text-secondary">
          {absBias > best.kpis.mae * 0.15
            ? bias > 0
              ? t('bias_over', { model: tm(best.name), value: absBias.toFixed(1) })
              : t('bias_under', { model: tm(best.name), value: absBias.toFixed(1) })
            : t('bias_neutral', { model: tm(best.name) })}
        </p>
      </div>
    </div>
  );
}
