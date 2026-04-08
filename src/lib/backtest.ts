import { ModelName, ModelKPI, ModelResult, ForecastResult } from './types';
import { computeKPIs } from './kpi';
import { naive, naiveBacktest } from './models/naive';
import { seasonalNaive, seasonalNaiveBacktest } from './models/seasonalNaive';
import { movingAverage, movingAverageBacktest } from './models/movingAverage';
import { ses, sesBacktest } from './models/ses';
import { holt, holtBacktest } from './models/holt';
import { holtWinters, holtWintersBacktest } from './models/holtWinters';
import { croston, crostonBacktest } from './models/croston';

const MODEL_COLORS: Record<ModelName, string> = {
  naive: '#94A3B8',
  seasonalNaive: '#7C3AED',
  movingAverage: '#F59E0B',
  ses: '#3B82F6',
  holt: '#EF4444',
  holtWinters: '#10B981',
  croston: '#EC4899',
};

const MODEL_LABELS: Record<ModelName, string> = {
  naive: 'Naive',
  seasonalNaive: 'Seasonal Naive',
  movingAverage: 'Moving Average',
  ses: 'Exponential Smoothing (SES)',
  holt: 'Holt (Double ES)',
  holtWinters: 'Holt-Winters',
  croston: 'Croston / SBA',
};

export function runBacktest(
  data: number[],
  backtestSize: number,
  horizon: number,
  seasonLength: number
): ForecastResult {
  const backtestStart = data.length - backtestSize;
  const actuals = data.slice(backtestStart);

  const models: ModelName[] = [
    'naive',
    'seasonalNaive',
    'movingAverage',
    'ses',
    'holt',
    'holtWinters',
    'croston',
  ];

  const backtestFns: Record<ModelName, () => number[]> = {
    naive: () => naiveBacktest(data, backtestStart),
    seasonalNaive: () => seasonalNaiveBacktest(data, backtestStart, seasonLength),
    movingAverage: () => movingAverageBacktest(data, backtestStart),
    ses: () => sesBacktest(data, backtestStart),
    holt: () => holtBacktest(data, backtestStart),
    holtWinters: () => holtWintersBacktest(data, backtestStart, seasonLength),
    croston: () => crostonBacktest(data, backtestStart),
  };

  const forecastFns: Record<ModelName, () => number[]> = {
    naive: () => naive(data, horizon),
    seasonalNaive: () => seasonalNaive(data, horizon, seasonLength),
    movingAverage: () => movingAverage(data, horizon),
    ses: () => ses(data, horizon),
    holt: () => holt(data, horizon),
    holtWinters: () => holtWinters(data, horizon, seasonLength),
    croston: () => croston(data, horizon),
  };

  const modelKPIs: ModelKPI[] = [];
  const modelResults: ModelResult[] = [];

  for (const name of models) {
    const predictions = backtestFns[name]();
    const kpis = computeKPIs(actuals, predictions);
    const forecast = forecastFns[name]();

    modelKPIs.push({
      name,
      label: MODEL_LABELS[name],
      kpis,
      color: MODEL_COLORS[name],
    });

    modelResults.push({
      name,
      label: MODEL_LABELS[name],
      fitted: [],
      forecast,
      backtestPredictions: predictions,
      color: MODEL_COLORS[name],
    });
  }

  // Rank by MAE
  const sorted = [...modelKPIs].sort((a, b) => a.kpis.mae - b.kpis.mae);
  const bestModel = sorted[0].name;

  const bestResult = modelResults.find((r) => r.name === bestModel)!;

  return {
    models: modelKPIs,
    bestModel,
    modelResults,
    backtestActuals: actuals,
    backtestStart,
    forwardForecast: { model: bestModel, values: bestResult.forecast },
  };
}
