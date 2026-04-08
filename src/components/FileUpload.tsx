'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';
import { parseCSV, parseExcel, getColumns } from '@/lib/parseFile';
import { detectSensitiveColumns } from '@/lib/validation';
import { getDemoData, DemoDataset } from '@/lib/demoData';
import { ParsedData } from '@/lib/types';

interface FileUploadProps {
  onDataLoaded: (data: ParsedData, name: string) => void;
}

export default function FileUpload({ onDataLoaded }: FileUploadProps) {
  const t = useTranslations('upload');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setLoading(true);
      try {
        // Check for sensitive columns first
        const columns = await getColumns(file);
        if (detectSensitiveColumns(columns)) {
          setError(t('sensitive_warning'));
          setLoading(false);
          return;
        }

        let parsed: ParsedData;
        if (file.name.endsWith('.csv')) {
          parsed = await parseCSV(file);
        } else {
          parsed = await parseExcel(file);
        }
        onDataLoaded(parsed, file.name);
      } catch {
        setError('Failed to parse file. Please check the format.');
      }
      setLoading(false);
    },
    [onDataLoaded, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDemo = useCallback(
    (dataset: DemoDataset) => {
      const data = getDemoData(dataset);
      const names = { stable: 'Stable Demand', seasonal: 'Seasonal Demand', intermittent: 'Intermittent Demand' };
      onDataLoaded(
        {
          data,
          skus: [],
          hasMultipleSKUs: false,
          frequency: 'monthly',
        },
        names[dataset]
      );
    },
    [onDataLoaded]
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-teal-dark mb-2">
          {t('title')}
        </h2>
        <p className="text-text-secondary">{t('description')}</p>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
          dragging
            ? 'border-primary-teal bg-surface'
            : 'border-gray-200 hover:border-primary-teal hover:bg-surface/50'
        }`}
      >
        <div className="text-4xl mb-3">📊</div>
        <p className="text-text-primary font-medium">{t('dropzone')}</p>
        <p className="text-sm text-text-secondary mt-1">{t('formats')}</p>
        {loading && (
          <div className="mt-4">
            <div className="inline-block w-6 h-6 border-2 border-primary-teal border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Notice */}
      <p className="text-xs text-text-secondary text-center mt-3">
        🔒 {t('notice')}
      </p>

      {/* Demo datasets */}
      <div className="mt-8">
        <p className="text-center text-sm text-text-secondary mb-4">
          {t('or')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(['stable', 'seasonal', 'intermittent'] as DemoDataset[]).map((ds) => (
            <button
              key={ds}
              onClick={() => handleDemo(ds)}
              className="p-4 rounded-xl border border-gray-200 hover:border-primary-teal hover:bg-surface/50 transition-all text-left"
            >
              <div className="font-semibold text-text-primary text-sm">
                {t(`demo_${ds}`)}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {t(`demo_${ds}_desc`)}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
