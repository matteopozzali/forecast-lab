import { runBacktest } from '../lib/backtest';
import type { WorkerMessage, WorkerResponse } from '../lib/types';

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { data, backtestSize, horizon, seasonLength } = e.data;
  const result = runBacktest(data, backtestSize, horizon, seasonLength);
  const response: WorkerResponse = { type: 'result', result };
  self.postMessage(response);
};
