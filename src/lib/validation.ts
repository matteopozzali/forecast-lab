import { DataPoint, ValidationResult, DataStats } from './types';

const SENSITIVE_PATTERNS = [
  /^name$/i, /^email$/i, /^phone$/i, /^address$/i, /^customer_id$/i,
  /^ssn$/i, /^social_security$/i, /^credit_card$/i, /^passport$/i,
  /^first_name$/i, /^last_name$/i, /^full_name$/i, /^surname$/i,
  /^zip$/i, /^postal_code$/i, /^dob$/i, /^date_of_birth$/i,
];

export function detectSensitiveColumns(columns: string[]): boolean {
  return columns.some((col) =>
    SENSITIVE_PATTERNS.some((pattern) => pattern.test(col.trim()))
  );
}

export function computeStats(values: number[]): DataStats {
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
  return {
    count: n,
    min: Math.min(...values),
    max: Math.max(...values),
    mean,
    stdDev: Math.sqrt(variance),
    zeroCount: values.filter((v) => v === 0).length,
  };
}

export function detectOutliers(values: number[], windowSize: number = 7): number[] {
  const outliers: number[] = [];
  const globalMean = values.reduce((a, b) => a + b, 0) / values.length;
  const globalStd = Math.sqrt(
    values.reduce((sum, v) => sum + (v - globalMean) ** 2, 0) / values.length
  );

  if (globalStd === 0) return [];

  for (let i = 0; i < values.length; i++) {
    if (Math.abs(values[i] - globalMean) > 3 * globalStd) {
      outliers.push(i);
    }
  }
  return outliers;
}

export function detectFrequency(
  dates: Date[]
): 'daily' | 'weekly' | 'monthly' | 'unknown' {
  if (dates.length < 2) return 'unknown';
  const diffs: number[] = [];
  for (let i = 1; i < Math.min(dates.length, 10); i++) {
    diffs.push(
      (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
    );
  }
  const medianDiff = diffs.sort((a, b) => a - b)[Math.floor(diffs.length / 2)];
  if (medianDiff <= 2) return 'daily';
  if (medianDiff <= 10) return 'weekly';
  if (medianDiff <= 45) return 'monthly';
  return 'unknown';
}

export function getSeasonLength(frequency: 'daily' | 'weekly' | 'monthly' | 'unknown'): number {
  switch (frequency) {
    case 'daily': return 7;
    case 'weekly': return 52;
    case 'monthly': return 12;
    default: return 12;
  }
}

export function validateData(data: DataPoint[]): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (data.length === 0) {
    errors.push('No data found in the file.');
    return { valid: false, warnings, errors, outlierIndices: [], stats: { count: 0, min: 0, max: 0, mean: 0, stdDev: 0, zeroCount: 0 } };
  }

  if (data.length < 12) {
    errors.push('Minimum 12 periods required. Your file has ' + data.length + ' rows.');
  } else if (data.length < 24) {
    warnings.push('Less than 24 periods. Results may be less reliable.');
  }

  const values = data.map((d) => d.value);
  const negatives = values.filter((v) => v < 0);
  if (negatives.length > 0) {
    warnings.push(negatives.length + ' negative values detected.');
  }

  // Check for missing dates
  const dates = data.map((d) => new Date(d.date)).filter((d) => !isNaN(d.getTime()));
  if (dates.length < data.length) {
    warnings.push('Some dates could not be parsed.');
  }

  const stats = computeStats(values);
  const outlierIndices = detectOutliers(values);
  if (outlierIndices.length > 0) {
    warnings.push(outlierIndices.length + ' outlier(s) detected (beyond ±3σ).');
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
    outlierIndices,
    stats,
  };
}
