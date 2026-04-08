export function naive(data: number[], horizon: number): number[] {
  const last = data[data.length - 1];
  return Array(horizon).fill(last);
}

export function naiveBacktest(data: number[], backtestStart: number): number[] {
  const predictions: number[] = [];
  for (let i = backtestStart; i < data.length; i++) {
    predictions.push(data[i - 1]);
  }
  return predictions;
}
