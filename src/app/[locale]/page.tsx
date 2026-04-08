'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import DataHealthCheck from '@/components/DataHealthCheck';
import DataPreviewChart from '@/components/DataPreviewChart';
import SkuSelector from '@/components/SkuSelector';
import DashboardHeader from '@/components/DashboardHeader';
import InsightCards from '@/components/InsightCards';
import HeroChart from '@/components/HeroChart';
import KpiTable from '@/components/KpiTable';
import MaeBarChart from '@/components/MaeBarChart';
import BacktestSlider from '@/components/BacktestSlider';
import HorizonSlider from '@/components/HorizonSlider';
import BusinessInterpretation from '@/components/BusinessInterpretation';
import DidacticSection from '@/components/DidacticSection';
import ExportButtons from '@/components/ExportButtons';
import Disclaimer from '@/components/Disclaimer';
import { ParsedData, DataPoint, ValidationResult, ForecastResult } from '@/lib/types';
import { validateData, getSeasonLength } from '@/lib/validation';
import { useForecaster } from '@/lib/useForecaster';

export default function ForecastLabPage() {
  const t = useTranslations('header');

  // Data state
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [selectedSku, setSelectedSku] = useState('');
  const [compareSku, setCompareSku] = useState<string | null>(null);
  const [excludeOutliers, setExcludeOutliers] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  // Forecast state
  const [backtestSize, setBacktestSize] = useState(6);
  const [horizon, setHorizon] = useState(6);
  const { result, loading, run } = useForecaster();

  // Compare forecaster
  const {
    result: compareResult,
    loading: compareLoading,
    run: runCompare,
  } = useForecaster();

  // Get the active series data
  const activeData = useMemo((): DataPoint[] => {
    if (!parsedData) return [];
    let data = parsedData.data;
    if (parsedData.hasMultipleSKUs && selectedSku) {
      data = data.filter((d) => d.sku === selectedSku);
    }
    if (excludeOutliers && validation) {
      const outlierSet = new Set(validation.outlierIndices);
      data = data.filter((_, i) => !outlierSet.has(i));
    }
    return data;
  }, [parsedData, selectedSku, excludeOutliers, validation]);

  // Compare series data
  const compareData = useMemo((): DataPoint[] => {
    if (!parsedData || !compareSku) return [];
    return parsedData.data.filter((d) => d.sku === compareSku);
  }, [parsedData, compareSku]);

  // Validate when data changes
  useEffect(() => {
    if (activeData.length > 0) {
      const v = validateData(activeData);
      setValidation(v);
    }
  }, [activeData]);

  // Run forecast when data or params change
  useEffect(() => {
    if (activeData.length >= 12 && validation?.valid) {
      const values = activeData.map((d) => d.value);
      const seasonLen = getSeasonLength(parsedData?.frequency || 'monthly');
      const maxBt = Math.min(Math.floor(values.length * 0.5), values.length - 12);
      const actualBt = Math.min(backtestSize, maxBt);
      if (actualBt >= 6) {
        run(values, actualBt, horizon, seasonLen);
      }
    }
  }, [activeData, backtestSize, horizon, validation, parsedData, run]);

  // Run compare forecast
  useEffect(() => {
    if (compareData.length >= 12) {
      const values = compareData.map((d) => d.value);
      const seasonLen = getSeasonLength(parsedData?.frequency || 'monthly');
      const maxBt = Math.min(Math.floor(values.length * 0.5), values.length - 12);
      const actualBt = Math.min(backtestSize, maxBt);
      if (actualBt >= 6) {
        runCompare(values, actualBt, horizon, seasonLen);
      }
    }
  }, [compareData, backtestSize, horizon, parsedData, runCompare]);

  const handleDataLoaded = useCallback((data: ParsedData, name: string) => {
    setParsedData(data);
    setDatasetName(name);
    setCompareSku(null);
    if (data.hasMultipleSKUs && data.skus.length > 0) {
      setSelectedSku(data.skus[0]);
    } else {
      setSelectedSku('');
    }
    // Default backtest size: 20% of data, min 6
    const len = data.hasMultipleSKUs
      ? data.data.filter((d) => d.sku === data.skus[0]).length
      : data.data.length;
    setBacktestSize(Math.max(6, Math.round(len * 0.2)));
  }, []);

  const maxBacktestSize = useMemo(() => {
    if (activeData.length < 18) return 6;
    return Math.min(Math.floor(activeData.length * 0.5), activeData.length - 12);
  }, [activeData]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero / tagline + disclaimer */}
        {!parsedData && (
          <div className="bg-surface py-8 sm:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-sm text-text-secondary max-w-2xl mx-auto leading-relaxed">
                {t('tagline')}
              </p>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Upload section */}
          {!parsedData && <FileUpload onDataLoaded={handleDataLoaded} />}

          {/* Data loaded — show health check */}
          {parsedData && validation && (
            <>
              {/* Reset button */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-text-primary">{datasetName}</h2>
                <button
                  onClick={() => {
                    setParsedData(null);
                    setValidation(null);
                    setDatasetName('');
                  }}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  ← Upload new data
                </button>
              </div>

              {/* SKU selector */}
              {parsedData.hasMultipleSKUs && (
                <SkuSelector
                  skus={parsedData.skus}
                  selectedSku={selectedSku}
                  compareSku={compareSku}
                  onSelectSku={setSelectedSku}
                  onSelectCompare={setCompareSku}
                />
              )}

              {/* Data Health Check + Preview */}
              <DataPreviewChart
                data={activeData}
                outlierIndices={validation.outlierIndices}
              />
              <DataHealthCheck
                validation={validation}
                excludeOutliers={excludeOutliers}
                onToggleOutliers={setExcludeOutliers}
              />

              {/* Disclaimer near upload */}
              <Disclaimer />
            </>
          )}

          {/* Dashboard */}
          {result && parsedData && validation?.valid && (
            <div id="forecast-dashboard" className="space-y-6">
              {/* Loading overlay */}
              {loading && (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-3 border-primary-teal border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!loading && (
                <>
                  {/* Block 1: Header */}
                  <DashboardHeader
                    datasetName={datasetName}
                    frequency={parsedData.frequency}
                    horizon={horizon}
                    result={result}
                  />

                  {/* Block 2: Insight Cards */}
                  <InsightCards result={result} />

                  {/* Block 4: Hero Chart */}
                  <HeroChart data={activeData} result={result} horizon={horizon} />

                  {/* Block 5: KPI Table + Bar Chart */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <KpiTable models={result.models} />
                    <MaeBarChart models={result.models} />
                  </div>

                  {/* Block 6: What-If + Horizon */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <BacktestSlider
                      value={backtestSize}
                      min={6}
                      max={maxBacktestSize}
                      onChange={setBacktestSize}
                    />
                    <HorizonSlider value={horizon} onChange={setHorizon} />
                  </div>

                  {/* Block 7: SKU Comparison */}
                  {compareSku && compareResult && !compareLoading && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-teal-dark">
                        {selectedSku} vs {compareSku}
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-text-primary">{selectedSku}</h4>
                          <HeroChart data={activeData} result={result} horizon={horizon} />
                          <KpiTable models={result.models} />
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-text-primary">{compareSku}</h4>
                          <HeroChart data={compareData} result={compareResult} horizon={horizon} />
                          <KpiTable models={compareResult.models} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Block 8: Business Interpretation */}
                  <BusinessInterpretation result={result} />

                  {/* Export */}
                  <ExportButtons models={result.models} />

                  {/* Didactic Section */}
                  <DidacticSection />

                  {/* Footer disclaimer */}
                  <Disclaimer />
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-xs text-text-secondary">
            <p>Forecast Lab — supplylab.dev</p>
            <Disclaimer />
          </div>
        </div>
      </footer>
    </div>
  );
}
