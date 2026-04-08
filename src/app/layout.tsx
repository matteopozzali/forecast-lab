import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Forecast Lab — Supply Lab',
  description: 'Educational forecasting benchmarking tool',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
