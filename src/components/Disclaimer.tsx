'use client';

import { useTranslations } from 'next-intl';

export default function Disclaimer() {
  const t = useTranslations('disclaimer');
  return (
    <div className="bg-surface rounded-xl p-4 text-xs text-text-secondary leading-relaxed text-center">
      {t('text')}
    </div>
  );
}
