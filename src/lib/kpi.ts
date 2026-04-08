import { KPIValues } from './types';

export function computeKPIs(actuals: number[], predictions: number[]): KPIValues {
  const n = Math.min(actuals.length, predictions.length);
  if (n === 0) return { mae: 0, bias: 0, rmse: 0, mape: null };

  let sumAbsError = 0;
  let sumError = 0;
  let sumSqError = 0;
  let sumAbsPctError = 0;
  let mapeCount = 0;

  for (let i = 0; i < n; i++) {
    const error = predictions[i] - actuals[i];
    sumAbsError += Math.abs(error);
    sumError += error;
    sumSqError += error * error;
    if (actuals[i] !== 0) {
      sumAbsPctError += Math.abs(error / actuals[i]);
      mapeCount++;
    }
  }

  return {
    mae: sumAbsError / n,
    bias: sumError / n,
    rmse: Math.sqrt(sumSqError / n),
    mape: mapeCount > 0 ? (sumAbsPctError / mapeCount) * 100 : null,
  };
}
