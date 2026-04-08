export interface DataPoint {
  date: string;
  value: number;
  sku?: string;
  location?: string;
  category?: string;
  promo_flag?: 0 | 1;
}

export interface ParsedData {
  data: DataPoint[];
  skus: string[];
  hasMultipleSKUs: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'unknown';
}

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
  outlierIndices: number[];
  stats: DataStats;
}

export interface DataStats {
  count: number;
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  zeroCount: number;
}

export type ModelName =
  | 'naive'
  | 'seasonalNaive'
  | 'movingAverage'
  | 'ses'
  | 'holt'
  | 'holtWinters'
  | 'croston';

export interface ModelResult {
  name: ModelName;
  label: string;
  fitted: number[];
  forecast: number[];
  backtestPredictions: number[];
  color: string;
}

export interface KPIValues {
  mae: number;
  bias: number;
  rmse: number;
  mape: number | null;
}

export interface ModelKPI {
  name: ModelName;
  label: string;
  kpis: KPIValues;
  color: string;
}

export interface ForecastResult {
  models: ModelKPI[];
  bestModel: ModelName;
  modelResults: ModelResult[];
  backtestActuals: number[];
  backtestStart: number;
  forwardForecast: { model: ModelName; values: number[] };
}

export interface WorkerMessage {
  type: 'run';
  data: number[];
  backtestSize: number;
  horizon: number;
  seasonLength: number;
}

export interface WorkerResponse {
  type: 'result';
  result: ForecastResult;
}

export type Locale = 'en' | 'it';
