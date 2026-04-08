export function croston(data: number[], horizon: number): number[] {
  const alpha = 0.15;
  let demandSize = 0;
  let demandInterval = 0;
  let firstNonZero = false;
  let intervalCount = 0;

  for (let i = 0; i < data.length; i++) {
    if (data[i] > 0) {
      intervalCount++;
      if (!firstNonZero) {
        demandSize = data[i];
        demandInterval = intervalCount;
        firstNonZero = true;
      } else {
        demandSize = alpha * data[i] + (1 - alpha) * demandSize;
        demandInterval = alpha * intervalCount + (1 - alpha) * demandInterval;
      }
      intervalCount = 0;
    }
    intervalCount++;
  }

  if (!firstNonZero || demandInterval === 0) {
    return Array(horizon).fill(0);
  }

  // SBA correction factor
  const sbaFactor = 1 - alpha / 2;
  const rate = (demandSize / demandInterval) * sbaFactor;
  return Array(horizon).fill(Math.max(0, rate));
}

export function crostonBacktest(
  data: number[],
  backtestStart: number
): number[] {
  const alpha = 0.15;
  const predictions: number[] = [];

  let demandSize = 0;
  let demandInterval = 0;
  let firstNonZero = false;
  let intervalCount = 0;

  // Train on initial data
  for (let i = 0; i < backtestStart; i++) {
    if (data[i] > 0) {
      intervalCount++;
      if (!firstNonZero) {
        demandSize = data[i];
        demandInterval = intervalCount;
        firstNonZero = true;
      } else {
        demandSize = alpha * data[i] + (1 - alpha) * demandSize;
        demandInterval = alpha * intervalCount + (1 - alpha) * demandInterval;
      }
      intervalCount = 0;
    }
    intervalCount++;
  }

  // Generate predictions, updating as we go
  for (let i = backtestStart; i < data.length; i++) {
    const sbaFactor = 1 - alpha / 2;
    const rate =
      firstNonZero && demandInterval > 0
        ? (demandSize / demandInterval) * sbaFactor
        : 0;
    predictions.push(Math.max(0, rate));

    if (data[i] > 0) {
      intervalCount++;
      if (!firstNonZero) {
        demandSize = data[i];
        demandInterval = intervalCount;
        firstNonZero = true;
      } else {
        demandSize = alpha * data[i] + (1 - alpha) * demandSize;
        demandInterval = alpha * intervalCount + (1 - alpha) * demandInterval;
      }
      intervalCount = 0;
    }
    intervalCount++;
  }

  return predictions;
}
