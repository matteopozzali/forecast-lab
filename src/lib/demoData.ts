import { DataPoint } from './types';

function generateDates(count: number, startDate: string = '2022-01-01'): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function getStableDemand(): DataPoint[] {
  const dates = generateDates(36);
  const rng = seededRandom(42);
  const base = 100;
  return dates.map((date) => ({
    date,
    value: Math.round(base + (rng() - 0.5) * 20),
  }));
}

export function getSeasonalDemand(): DataPoint[] {
  const dates = generateDates(48);
  const rng = seededRandom(123);
  const seasonalPattern = [0.7, 0.6, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.1, 0.9, 1.4, 1.6];
  const base = 100;
  const trendPerMonth = 1.5;

  return dates.map((date, i) => ({
    date,
    value: Math.round(
      (base + trendPerMonth * i) * seasonalPattern[i % 12] + (rng() - 0.5) * 15
    ),
  }));
}

export function getIntermittentDemand(): DataPoint[] {
  const dates = generateDates(48);
  const rng = seededRandom(456);
  return dates.map((date) => {
    const hasDemandc = rng() < 0.3;
    return {
      date,
      value: hasDemandc ? Math.round(5 + rng() * 25) : 0,
    };
  });
}

export type DemoDataset = 'stable' | 'seasonal' | 'intermittent';

export function getDemoData(dataset: DemoDataset): DataPoint[] {
  switch (dataset) {
    case 'stable': return getStableDemand();
    case 'seasonal': return getSeasonalDemand();
    case 'intermittent': return getIntermittentDemand();
  }
}
