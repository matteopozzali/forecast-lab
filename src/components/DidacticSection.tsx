'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ModelName } from '@/lib/types';

const MODEL_KEYS: ModelName[] = [
  'naive',
  'seasonalNaive',
  'movingAverage',
  'ses',
  'holt',
  'holtWinters',
  'croston',
];

const CARD_FIELDS = [
  'what',
  'why',
  'when_works',
  'when_struggles',
  'assumption',
  'how_read',
  'misconception',
  'plain',
] as const;

const CROSS_BLOCKS = [
  'cross_benchmarks',
  'cross_backtest',
  'cross_metrics',
  'cross_accuracy',
  'cross_planner',
] as const;

export default function DidacticSection() {
  const t = useTranslations('didactic');
  const tm = useTranslations('models');
  const tc = useTranslations('modelCards');
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => {
    setExpanded((prev) => (prev === key ? null : key));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-teal-dark">{t('title')}</h2>
        <p className="text-text-secondary mt-1">{t('subtitle')}</p>
      </div>

      {/* Model cards */}
      <div className="space-y-3">
        {MODEL_KEYS.map((model) => (
          <div
            key={model}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <button
              onClick={() => toggle(model)}
              className="w-full px-5 py-4 flex items-center justify-between text-left"
            >
              <span className="font-semibold text-text-primary">{tm(model)}</span>
              <span
                className={`text-text-secondary transition-transform ${
                  expanded === model ? 'rotate-180' : ''
                }`}
              >
                ▼
              </span>
            </button>
            {expanded === model && (
              <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                {CARD_FIELDS.map((field) => (
                  <div key={field}>
                    <h5 className="text-xs font-semibold text-teal-dark uppercase tracking-wider mb-1">
                      {t(field)}
                    </h5>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {tc(`${model}.${field}`)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cross-cutting educational blocks */}
      <div className="space-y-4 mt-8">
        {CROSS_BLOCKS.map((block) => (
          <div
            key={block}
            className="bg-surface rounded-xl p-5"
          >
            <h4 className="font-semibold text-teal-dark mb-2">
              {t(`${block}_title`)}
            </h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t(block)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
