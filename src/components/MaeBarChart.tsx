'use client';

import { useTranslations } from 'next-intl';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ModelKPI } from '@/lib/types';

interface MaeBarChartProps {
  models: ModelKPI[];
}

export default function MaeBarChart({ models }: MaeBarChartProps) {
  const tm = useTranslations('models');
  const sorted = [...models].sort((a, b) => a.kpis.mae - b.kpis.mae);
  const chartData = sorted.map((m) => ({
    name: tm(m.name),
    mae: Math.round(m.kpis.mae * 10) / 10,
    color: m.color,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 120, right: 20 }}>
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11 }}
            width={110}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              fontSize: 12,
            }}
          />
          <Bar dataKey="mae" radius={[0, 4, 4, 0]} barSize={20}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
