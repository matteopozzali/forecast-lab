function fitSES(data: number[], alpha: number): { level: number; fitted: number[] } {
  let level = data[0];
  const fitted: number[] = [level];
  for (let i = 1; i < data.length; i++) {
    level = alpha * data[i] + (1 - alpha) * level;
    fitted.push(level);
  }
  return { level, fitted };
}

function optimizeAlpha(data: number[]): number {
  let bestAlpha = 0.1;
  let bestMAE = Infinity;
  for (let a = 0.01; a <= 0.99; a += 0.01) {
    const { fitted } = fitSES(data, a);
    let totalError = 0;
    for (let i = 1; i < data.length; i++) {
      totalError += Math.abs(data[i] - fitted[i - 1]);
    }
    const mae = totalError / (data.length - 1);
    if (mae < bestMAE) {
      bestMAE = mae;
      bestAlpha = a;
    }
  }
  return bestAlpha;
}

export function ses(data: number[], horizon: number): number[] {
  const alpha = optimizeAlpha(data);
  const { level } = fitSES(data, alpha);
  return Array(horizon).fill(level);
}

export function sesBacktest(data: number[], backtestStart: number): number[] {
  const trainData = data.slice(0, backtestStart);
  const alpha = optimizeAlpha(trainData);
  const predictions: number[] = [];
  let level = trainData[0];
  for (let i = 1; i < trainData.length; i++) {
    level = alpha * trainData[i] + (1 - alpha) * level;
  }
  for (let i = backtestStart; i < data.length; i++) {
    predictions.push(level);
    level = alpha * data[i] + (1 - alpha) * level;
  }
  return predictions;
}
