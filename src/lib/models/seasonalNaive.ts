export function seasonalNaive(
  data: number[],
  horizon: number,
  seasonLength: number
): number[] {
  const forecast: number[] = [];
  for (let h = 0; h < horizon; h++) {
    const idx = data.length - seasonLength + (h % seasonLength);
    forecast.push(idx >= 0 ? data[idx] : data[data.length - 1]);
  }
  return forecast;
}

export function seasonalNaiveBacktest(
  data: number[],
  backtestStart: number,
  seasonLength: number
): number[] {
  const predictions: number[] = [];
  for (let i = backtestStart; i < data.length; i++) {
    const idx = i - seasonLength;
    predictions.push(idx >= 0 ? data[idx] : data[0]);
  }
  return predictions;
}
