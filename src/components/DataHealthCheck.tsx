'use client';

import { useTranslations } from 'next-intl';
import { ValidationResult } from '@/lib/types';

interface DataHealthCheckProps {
  validation: ValidationResult;
  excludeOutliers: boolean;
  onToggleOutliers: (exclude: boolean) => void;
}

export default function DataHealthCheck({
  validation,
  excludeOutliers,
  onToggleOutliers,
}: DataHealthCheckProps) {
  const t = useTranslations('health');
  const { stats, outlierIndices, warnings, errors } = validation;

  const statItems = [
    { label: t('count'), value: stats.count },
    { label: t('min'), value: stats.min.toFixed(1) },
    { label: t('max'), value: stats.max.toFixed(1) },
    { label: t('mean'), value: stats.mean.toFixed(1) },
    { label: t('stddev'), value: stats.stdDev.toFixed(1) },
    { label: t('zeros'), value: stats.zeroCount },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-teal-dark mb-4">{t('title')}</h3>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
        {statItems.map((item) => (
          <div key={item.label} className="bg-surface rounded-lg p-3 text-center">
            <div className="text-xs text-text-secondary">{item.label}</div>
            <div className="text-lg font-mono font-semibold text-text-primary">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Outliers */}
      {outlierIndices.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
          <div className="text-sm text-amber-800">
            ⚠️ {t('outliers')}: {outlierIndices.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleOutliers(false)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                !excludeOutliers
                  ? 'bg-primary-teal text-white'
                  : 'bg-white border border-gray-200 text-text-secondary'
              }`}
            >
              {t('keep_all')}
            </button>
            <button
              onClick={() => onToggleOutliers(true)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                excludeOutliers
                  ? 'bg-primary-teal text-white'
                  : 'bg-white border border-gray-200 text-text-secondary'
              }`}
            >
              {t('exclude_outliers')}
            </button>
          </div>
        </div>
      )}

      {/* Warnings and errors */}
      {errors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-2">
          {errors.map((e, i) => (
            <p key={i} className="text-sm text-red-700">{e}</p>
          ))}
        </div>
      )}
      {warnings.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-medium text-amber-700 mb-1">{t('warnings')}</p>
          {warnings.map((w, i) => (
            <p key={i} className="text-sm text-amber-700">{w}</p>
          ))}
        </div>
      )}
    </div>
  );
}
