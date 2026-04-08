interface HoltParams {
  alpha: number;
  beta: number;
}

function fitHolt(data: number[], alpha: number, beta: number) {
  let level = data[0];
  let trend = data.length > 1 ? data[1] - data[0] : 0;
  const fitted: number[] = [level + trend];

  for (let i = 1; i < data.length; i++) {
    const prevLevel = level;
    level = alpha * data[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    fitted.push(level + trend);
  }
  return { level, trend, fitted };
}

function optimizeHolt(data: number[]): HoltParams {
  let bestAlpha = 0.1;
  let bestBeta = 0.1;
  let bestMAE = Infinity;

  for (let a = 0.01; a <= 0.99; a += 0.05) {
    for (let b = 0.01; b <= 0.99; b += 0.05) {
      const { fitted } = fitHolt(data, a, b);
      let totalError = 0;
      for (let i = 1; i < data.length; i++) {
        totalError += Math.abs(data[i] - fitted[i - 1]);
      }
      const mae = totalError / (data.length - 1);
      if (mae < bestMAE) {
        bestMAE = mae;
        bestAlpha = a;
        bestBeta = b;
      }
    }
  }
  return { alpha: bestAlpha, beta: bestBeta };
}

export function holt(data: number[], horizon: number): number[] {
  const { alpha, beta } = optimizeHolt(data);
  const { level, trend } = fitHolt(data, alpha, beta);
  const forecast: number[] = [];
  for (let h = 1; h <= horizon; h++) {
    forecast.push(level + h * trend);
  }
  return forecast;
}

export function holtBacktest(data: number[], backtestStart: number): number[] {
  const trainData = data.slice(0, backtestStart);
  const { alpha, beta } = optimizeHolt(trainData);
  const predictions: number[] = [];

  let level = trainData[0];
  let trend = trainData.length > 1 ? trainData[1] - trainData[0] : 0;
  for (let i = 1; i < trainData.length; i++) {
    const prevLevel = level;
    level = alpha * trainData[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  for (let i = backtestStart; i < data.length; i++) {
    predictions.push(level + trend);
    const prevLevel = level;
    level = alpha * data[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }
  return predictions;
}
