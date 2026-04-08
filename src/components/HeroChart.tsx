'use client';

import { useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Legend,
} from 'recharts';
import { DataPoint, ForecastResult } from '@/lib/types';

interface HeroChartProps {
  data: DataPoint[];
  result: ForecastResult;
  horizon: number;
}

export default function HeroChart({ data, result, horizon }: HeroChartProps) {
  const t = useTranslations('chart');
  const tm = useTranslations('models');
  const [visibleModels, setVisibleModels] = useState<Set<string>>(
    new Set(result.modelResults.map((m) => m.name))
  );

  const chartData = useMemo(() => {
    const points: Record<string, unknown>[] = [];

    // Historical data
    for (let i = 0; i < data.length; i++) {
      const point: Record<string, unknown> = {
        date: data[i].date,
        actuals: data[i].value,
        index: i,
      };
      // Add backtest predictions
      if (i >= result.backtestStart) {
        const btIdx = i - result.backtestStart;
        for (const mr of result.modelResults) {
          if (btIdx < mr.backtestPredictions.length) {
            point[mr.name] = Math.round(mr.backtestPredictions[btIdx] * 10) / 10;
          }
        }
      }
      points.push(point);
    }

    // Forward forecast
    const bestResult = result.modelResults.find(
      (m) => m.name === result.bestModel
    )!;
    for (let h = 0; h < horizon; h++) {
      const lastDate = new Date(data[data.length - 1].date);
      lastDate.setMonth(lastDate.getMonth() + h + 1);
      points.push({
        date: lastDate.toISOString().split('T')[0],
        forecast: Math.round(bestResult.forecast[h] * 10) / 10,
        index: data.length + h,
      });
    }

    return points;
  }, [data, result, horizon]);

  const toggleModel = (name: string) => {
    setVisibleModels((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const showTopOnly = () => {
    const sorted = [...result.models].sort((a, b) => a.kpis.mae - b.kpis.mae);
    setVisibleModels(new Set(sorted.slice(0, 2).map((m) => m.name)));
  };

  const showAll = () => {
    setVisibleModels(new Set(result.modelResults.map((m) => m.name)));
  };

  const backtestStartDate = data[result.backtestStart]?.date;
  const backtestEndDate = data[data.length - 1]?.date;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
      {/* Toggle buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={showAll}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-surface transition-colors"
        >
          {t('toggle_all')}
        </button>
        <button
          onClick={showTopOnly}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-surface transition-colors"
        >
          {t('show_top')}
        </button>
        {result.modelResults.map((mr) => (
          <button
            key={mr.name}
            onClick={() => toggleModel(mr.name)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              visibleModels.has(mr.name)
                ? 'border-transparent text-white'
                : 'border-gray-200 text-text-secondary'
            }`}
            style={
              visibleModels.has(mr.name)
                ? { backgroundColor: mr.color }
                : undefined
            }
          >
            {tm(mr.name)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: string) => v.substring(5)}
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />

          {/* Backtest shading */}
          {backtestStartDate && backtestEndDate && (
            <ReferenceArea
              x1={backtestStartDate}
              x2={backtestEndDate}
              fill="#F0FAF8"
              fillOpacity={0.5}
            />
          )}

          {/* Actuals line */}
          <Line
            type="monotone"
            dataKey="actuals"
            stroke="#1A1A2E"
            strokeWidth={2}
            dot={false}
            name={t('actuals')}
          />

          {/* Model lines */}
          {result.modelResults.map((mr) =>
            visibleModels.has(mr.name) ? (
              <Line
                key={mr.name}
                type="monotone"
                dataKey={mr.name}
                stroke={mr.color}
                strokeWidth={1.5}
                dot={false}
                name={tm(mr.name)}
                connectNulls={false}
              />
            ) : null
          )}

          {/* Forward forecast */}
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#0E8C86"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            name={t('forecast')}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
