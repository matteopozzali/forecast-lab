'use client';

import { useTranslations } from 'next-intl';
import { ModelKPI } from '@/lib/types';

interface KpiTableProps {
  models: ModelKPI[];
}

export default function KpiTable({ models }: KpiTableProps) {
  const t = useTranslations('kpi');
  const tm = useTranslations('models');
  const sorted = [...models].sort((a, b) => a.kpis.mae - b.kpis.mae);

  const bestMAE = Math.min(...models.map((m) => m.kpis.mae));
  const bestBias = Math.min(...models.map((m) => Math.abs(m.kpis.bias)));
  const bestRMSE = Math.min(...models.map((m) => m.kpis.rmse));
  const mapeValues = models.filter((m) => m.kpis.mape !== null).map((m) => m.kpis.mape!);
  const bestMAPE = mapeValues.length > 0 ? Math.min(...mapeValues) : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-teal-dark">{t('title')}</h3>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-surface/50">
              <th className="text-left text-xs font-medium text-text-secondary px-4 py-3">
                {t('model')}
              </th>
              <th className="text-right text-xs font-medium text-text-secondary px-4 py-3">
                {t('mae')}
              </th>
              <th className="text-right text-xs font-medium text-text-secondary px-4 py-3">
                {t('bias')}
              </th>
              <th className="text-right text-xs font-medium text-text-secondary px-4 py-3">
                {t('rmse')}
              </th>
              <th className="text-right text-xs font-medium text-text-secondary px-4 py-3">
                {t('mape')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m, i) => (
              <tr
                key={m.name}
                className={`border-b border-gray-50 ${i === 0 ? 'bg-green-50/50' : ''}`}
              >
                <td className="px-4 py-3 text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ backgroundColor: m.color }}
                    />
                    <span className="font-medium">{tm(m.name)}</span>
                    {i === 0 && (
                      <span className="text-xs bg-primary-green/10 text-primary-green px-2 py-0.5 rounded-full">
                        {t('best')}
                      </span>
                    )}
                  </span>
                </td>
                <td className={`px-4 py-3 text-sm text-right font-mono ${
                  m.kpis.mae === bestMAE ? 'text-primary-green font-semibold' : ''
                }`}>
                  {m.kpis.mae.toFixed(1)}
                </td>
                <td className={`px-4 py-3 text-sm text-right font-mono ${
                  Math.abs(m.kpis.bias) === bestBias ? 'text-primary-green font-semibold' : ''
                }`}>
                  {m.kpis.bias > 0 ? '+' : ''}{m.kpis.bias.toFixed(1)}
                </td>
                <td className={`px-4 py-3 text-sm text-right font-mono ${
                  m.kpis.rmse === bestRMSE ? 'text-primary-green font-semibold' : ''
                }`}>
                  {m.kpis.rmse.toFixed(1)}
                </td>
                <td className={`px-4 py-3 text-sm text-right font-mono ${
                  m.kpis.mape !== null && bestMAPE !== null && m.kpis.mape === bestMAPE
                    ? 'text-primary-green font-semibold'
                    : ''
                }`}>
                  {m.kpis.mape !== null ? m.kpis.mape.toFixed(1) + '%' : t('na')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden p-4 space-y-3">
        {sorted.map((m, i) => (
          <div
            key={m.name}
            className={`rounded-lg border p-4 ${
              i === 0 ? 'border-primary-green bg-green-50/50' : 'border-gray-100'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: m.color }}
              />
              <span className="font-medium text-sm">{tm(m.name)}</span>
              {i === 0 && (
                <span className="text-xs bg-primary-green/10 text-primary-green px-2 py-0.5 rounded-full">
                  {t('best')}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-text-secondary">{t('mae')}: </span>
                <span className="font-mono">{m.kpis.mae.toFixed(1)}</span>
              </div>
              <div>
                <span className="text-text-secondary">{t('bias')}: </span>
                <span className="font-mono">
                  {m.kpis.bias > 0 ? '+' : ''}{m.kpis.bias.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-text-secondary">{t('rmse')}: </span>
                <span className="font-mono">{m.kpis.rmse.toFixed(1)}</span>
              </div>
              <div>
                <span className="text-text-secondary">{t('mape')}: </span>
                <span className="font-mono">
                  {m.kpis.mape !== null ? m.kpis.mape.toFixed(1) + '%' : t('na')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
