export function movingAverage(
  data: number[],
  horizon: number,
  window: number = 3
): number[] {
  const w = Math.min(window, data.length);
  const slice = data.slice(-w);
  const avg = slice.reduce((a, b) => a + b, 0) / w;
  return Array(horizon).fill(avg);
}

export function movingAverageBacktest(
  data: number[],
  backtestStart: number,
  window: number = 3
): number[] {
  const predictions: number[] = [];
  for (let i = backtestStart; i < data.length; i++) {
    const w = Math.min(window, i);
    const slice = data.slice(i - w, i);
    const avg = slice.reduce((a, b) => a + b, 0) / w;
    predictions.push(avg);
  }
  return predictions;
}
