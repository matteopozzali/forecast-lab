'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ForecastResult, WorkerMessage, WorkerResponse } from './types';
import { runBacktest } from './backtest';

export function useForecaster() {
  const [result, setResult] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const run = useCallback(
    (data: number[], backtestSize: number, horizon: number, seasonLength: number) => {
      setLoading(true);

      // Try Web Worker first, fall back to main thread
      try {
        if (workerRef.current) workerRef.current.terminate();
        workerRef.current = new Worker(
          new URL('../workers/forecast.worker.ts', import.meta.url)
        );
        workerRef.current.onmessage = (e: MessageEvent<WorkerResponse>) => {
          setResult(e.data.result);
          setLoading(false);
        };
        workerRef.current.onerror = () => {
          // Fallback to main thread
          const res = runBacktest(data, backtestSize, horizon, seasonLength);
          setResult(res);
          setLoading(false);
        };
        const msg: WorkerMessage = { type: 'run', data, backtestSize, horizon, seasonLength };
        workerRef.current.postMessage(msg);
      } catch {
        const res = runBacktest(data, backtestSize, horizon, seasonLength);
        setResult(res);
        setLoading(false);
      }
    },
    []
  );

  return { result, loading, run };
}
