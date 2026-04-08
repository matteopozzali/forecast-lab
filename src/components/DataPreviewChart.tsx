'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { DataPoint } from '@/lib/types';

interface DataPreviewChartProps {
  data: DataPoint[];
  outlierIndices: number[];
}

export default function DataPreviewChart({ data, outlierIndices }: DataPreviewChartProps) {
  const outlierSet = new Set(outlierIndices);
  const chartData = data.map((d, i) => ({
    date: d.date,
    value: d.value,
    isOutlier: outlierSet.has(i),
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <ResponsiveContainer width="100%" height={250}>
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
          <Line
            type="monotone"
            dataKey="value"
            stroke="#1BA8A0"
            strokeWidth={2}
            dot={false}
          />
          {chartData
            .filter((d) => d.isOutlier)
            .map((d, i) => (
              <ReferenceDot
                key={i}
                x={d.date}
                y={d.value}
                r={5}
                fill="#EF4444"
                stroke="#EF4444"
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
