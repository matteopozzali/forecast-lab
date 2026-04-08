'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { ForecastResult } from '@/lib/types';
import { generateInterpretation } from '@/lib/interpretation';

interface BusinessInterpretationProps {
  result: ForecastResult;
}

export default function BusinessInterpretation({ result }: BusinessInterpretationProps) {
  const t = useTranslations('interpretation');
  const pathname = usePathname();
  const locale = pathname.startsWith('/it') ? 'it' : 'en';
  const { text } = generateInterpretation(result.models, result.bestModel, locale);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-teal-dark mb-3">{t('title')}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
    </div>
  );
}
