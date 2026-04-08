type SeasonalType = 'additive' | 'multiplicative';

function detectSeasonalType(data: number[], seasonLength: number): SeasonalType {
  const nSeasons = Math.floor(data.length / seasonLength);
  if (nSeasons < 2) return 'additive';
  const seasonalAmplitudes: number[] = [];
  for (let s = 0; s < nSeasons; s++) {
    const slice = data.slice(s * seasonLength, (s + 1) * seasonLength);
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
    const amp = Math.max(...slice) - Math.min(...slice);
    seasonalAmplitudes.push(mean > 0 ? amp / mean : 0);
  }
  const ampVariation =
    Math.max(...seasonalAmplitudes) - Math.min(...seasonalAmplitudes);
  return ampVariation > 0.3 ? 'multiplicative' : 'additive';
}

function initSeasonalComponents(
  data: number[],
  seasonLength: number,
  type: SeasonalType
) {
  const nSeasons = Math.floor(data.length / seasonLength);
  const seasonal: number[] = new Array(seasonLength).fill(0);

  for (let i = 0; i < seasonLength; i++) {
    let sum = 0;
    let count = 0;
    for (let s = 0; s < nSeasons; s++) {
      const idx = s * seasonLength + i;
      if (idx < data.length) {
        const seasonMean =
          data
            .slice(s * seasonLength, Math.min((s + 1) * seasonLength, data.length))
            .reduce((a, b) => a + b, 0) / seasonLength;
        if (type === 'multiplicative') {
          seasonal[i] += seasonMean > 0 ? data[idx] / seasonMean : 1;
        } else {
          seasonal[i] += data[idx] - seasonMean;
        }
        count++;
      }
    }
    seasonal[i] = count > 0 ? seasonal[i] / count : type === 'multiplicative' ? 1 : 0;
  }
  return seasonal;
}

interface HWState {
  level: number;
  trend: number;
  seasonal: number[];
}

function fitHW(
  data: number[],
  seasonLength: number,
  alpha: number,
  beta: number,
  gamma: number,
  type: SeasonalType
): HWState {
  const seasonal = initSeasonalComponents(data, seasonLength, type);
  let level =
    data.slice(0, seasonLength).reduce((a, b) => a + b, 0) / seasonLength;
  let trend = 0;
  if (data.length >= 2 * seasonLength) {
    const mean1 =
      data.slice(0, seasonLength).reduce((a, b) => a + b, 0) / seasonLength;
    const mean2 =
      data
        .slice(seasonLength, 2 * seasonLength)
        .reduce((a, b) => a + b, 0) / seasonLength;
    trend = (mean2 - mean1) / seasonLength;
  }

  for (let i = 0; i < data.length; i++) {
    const sIdx = i % seasonLength;
    const prevLevel = level;
    if (type === 'multiplicative') {
      const s = seasonal[sIdx] || 1;
      level = alpha * (data[i] / s) + (1 - alpha) * (level + trend);
      trend = beta * (level - prevLevel) + (1 - beta) * trend;
      seasonal[sIdx] = gamma * (data[i] / level) + (1 - gamma) * s;
    } else {
      const s = seasonal[sIdx] || 0;
      level = alpha * (data[i] - s) + (1 - alpha) * (level + trend);
      trend = beta * (level - prevLevel) + (1 - beta) * trend;
      seasonal[sIdx] = gamma * (data[i] - level) + (1 - gamma) * s;
    }
  }

  return { level, trend, seasonal };
}

function computeMAE(
  data: number[],
  seasonLength: number,
  alpha: number,
  beta: number,
  gamma: number,
  type: SeasonalType
): number {
  const seasonal = initSeasonalComponents(data, seasonLength, type);
  let level =
    data.slice(0, seasonLength).reduce((a, b) => a + b, 0) / seasonLength;
  let trend = 0;
  if (data.length >= 2 * seasonLength) {
    const mean1 =
      data.slice(0, seasonLength).reduce((a, b) => a + b, 0) / seasonLength;
    const mean2 =
      data
        .slice(seasonLength, 2 * seasonLength)
        .reduce((a, b) => a + b, 0) / seasonLength;
    trend = (mean2 - mean1) / seasonLength;
  }

  let totalError = 0;
  let count = 0;
  for (let i = 0; i < data.length; i++) {
    const sIdx = i % seasonLength;
    if (i >= seasonLength) {
      let predicted: number;
      if (type === 'multiplicative') {
        predicted = (level + trend) * (seasonal[sIdx] || 1);
      } else {
        predicted = level + trend + (seasonal[sIdx] || 0);
      }
      totalError += Math.abs(data[i] - predicted);
      count++;
    }
    const prevLevel = level;
    if (type === 'multiplicative') {
      const s = seasonal[sIdx] || 1;
      level = alpha * (data[i] / s) + (1 - alpha) * (level + trend);
      trend = beta * (level - prevLevel) + (1 - beta) * trend;
      seasonal[sIdx] = gamma * (data[i] / level) + (1 - gamma) * s;
    } else {
      const s = seasonal[sIdx] || 0;
      level = alpha * (data[i] - s) + (1 - alpha) * (level + trend);
      trend = beta * (level - prevLevel) + (1 - beta) * trend;
      seasonal[sIdx] = gamma * (data[i] - level) + (1 - gamma) * s;
    }
  }
  return count > 0 ? totalError / count : Infinity;
}

function optimizeHW(
  data: number[],
  seasonLength: number,
  type: SeasonalType
): { alpha: number; beta: number; gamma: number } {
  let bestAlpha = 0.2;
  let bestBeta = 0.1;
  let bestGamma = 0.1;
  let bestMAE = Infinity;

  const step = 0.1;
  for (let a = 0.01; a <= 0.99; a += step) {
    for (let b = 0.01; b <= 0.5; b += step) {
      for (let g = 0.01; g <= 0.99; g += step) {
        const mae = computeMAE(data, seasonLength, a, b, g, type);
        if (mae < bestMAE) {
          bestMAE = mae;
          bestAlpha = a;
          bestBeta = b;
          bestGamma = g;
        }
      }
    }
  }
  return { alpha: bestAlpha, beta: bestBeta, gamma: bestGamma };
}

export function holtWinters(
  data: number[],
  horizon: number,
  seasonLength: number
): number[] {
  if (data.length < 2 * seasonLength) {
    // Not enough data for HW, fall back to flat forecast
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    return Array(horizon).fill(avg);
  }

  const type = detectSeasonalType(data, seasonLength);
  const { alpha, beta, gamma } = optimizeHW(data, seasonLength, type);
  const { level, trend, seasonal } = fitHW(
    data,
    seasonLength,
    alpha,
    beta,
    gamma,
    type
  );

  const forecast: number[] = [];
  for (let h = 1; h <= horizon; h++) {
    const sIdx = (data.length + h - 1) % seasonLength;
    if (type === 'multiplicative') {
      forecast.push((level + h * trend) * (seasonal[sIdx] || 1));
    } else {
      forecast.push(level + h * trend + (seasonal[sIdx] || 0));
    }
  }
  return forecast;
}

export function holtWintersBacktest(
  data: number[],
  backtestStart: number,
  seasonLength: number
): number[] {
  const trainData = data.slice(0, backtestStart);
  if (trainData.length < 2 * seasonLength) {
    const avg = trainData.reduce((a, b) => a + b, 0) / trainData.length;
    return Array(data.length - backtestStart).fill(avg);
  }

  const type = detectSeasonalType(trainData, seasonLength);
  const { alpha, beta, gamma } = optimizeHW(trainData, seasonLength, type);

  const seasonal = initSeasonalComponents(trainData, seasonLength, type);
  let level =
    trainData.slice(0, seasonLength).reduce((a, b) => a + b, 0) / seasonLength;
  let trend = 0;
  if (trainData.length >= 2 * seasonLength) {
    const mean1 =
      trainData.slice(0, seasonLength).reduce((a, b) => a + b, 0) /
      seasonLength;
    const mean2 =
      trainData
        .slice(seasonLength, 2 * seasonLength)
        .reduce((a, b) => a + b, 0) / seasonLength;
    trend = (mean2 - mean1) / seasonLength;
  }

  for (let i = 0; i < trainData.length; i++) {
    const sIdx = i % seasonLength;
    const prevLevel = level;
    if (type === 'multiplicative') {
      const s = seasonal[sIdx] || 1;
      level = alpha * (trainData[i] / s) + (1 - alpha) * (level + trend);
      trend = beta * (level - prevLevel) + (1 - beta) * trend;
      seasonal[sIdx] = gamma * (trainData[i] / level) + (1 - gamma) * s;
    } else {
      const s = seasonal[sIdx] || 0;
      level = alpha * (trainData[i] - s) + (1 - alpha) * (level + trend);
      trend = beta * (level - prevLevel) + (1 - beta) * trend;
      seasonal[sIdx] = gamma * (trainData[i] - level) + (1 - gamma) * s;
    }
  }

  const predictions: number[] = [];
  for (let i = backtestStart; i < data.length; i++) {
    const sIdx = i % seasonLength;
    if (type === 'multiplicative') {
      predictions.push((level + trend) * (seasonal[sIdx] || 1));
    } else {
      predictions.push(level + trend + (seasonal[sIdx] || 0));
    }
    const prevLevel = level;
    if (type === 'multiplicative') {
      const s = seasonal[sIdx] || 1;
      level = alpha * (data[i] / s) + (1 - alpha) * (level + trend);
      trend = beta * (level - prevLevel) + (1 - beta) * trend;
      seasonal[sIdx] = gamma * (data[i] / level) + (1 - gamma) * s;
    } else {
      const s = seasonal[sIdx] || 0;
      level = alpha * (data[i] - s) + (1 - alpha) * (level + trend);
      trend = beta * (level - prevLevel) + (1 - beta) * trend;
      seasonal[sIdx] = gamma * (data[i] - level) + (1 - gamma) * s;
    }
  }
  return predictions;
}
