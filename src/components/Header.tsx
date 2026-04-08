'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const t = useTranslations('header');
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.startsWith('/it') ? 'it' : 'en';

  const switchLocale = (locale: string) => {
    const newPath = pathname.replace(/^\/(en|it)/, `/${locale}`);
    router.push(newPath);
  };

  return (
    <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-teal-dark">
            {t('title')}
          </h1>
          <p className="text-sm text-text-secondary hidden sm:block">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => switchLocale('en')}
            className={`px-2 py-1 text-sm rounded transition-colors ${
              currentLocale === 'en'
                ? 'bg-surface text-teal-dark font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            🇬🇧 EN
          </button>
          <button
            onClick={() => switchLocale('it')}
            className={`px-2 py-1 text-sm rounded transition-colors ${
              currentLocale === 'it'
                ? 'bg-surface text-teal-dark font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            🇮🇹 IT
          </button>
        </div>
      </div>
    </header>
  );
}
