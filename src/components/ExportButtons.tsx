'use client';

import { useTranslations } from 'next-intl';
import { ModelKPI } from '@/lib/types';

interface ExportButtonsProps {
  models: ModelKPI[];
}

export default function ExportButtons({ models }: ExportButtonsProps) {
  const t = useTranslations('export');
  const tm = useTranslations('models');

  const exportCSV = () => {
    const sorted = [...models].sort((a, b) => a.kpis.mae - b.kpis.mae);
    const header = 'Model,MAE,Bias,RMSE,MAPE';
    const rows = sorted.map(
      (m) =>
        `"${tm(m.name)}",${m.kpis.mae.toFixed(2)},${m.kpis.bias.toFixed(2)},${m.kpis.rmse.toFixed(2)},${
          m.kpis.mape !== null ? m.kpis.mape.toFixed(2) + '%' : 'N/A'
        }`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'forecast_lab_kpi.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    const dashboard = document.getElementById('forecast-dashboard');
    if (!dashboard) return;

    const canvas = await html2canvas(dashboard, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('forecast_lab_report.pdf');
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={exportCSV}
        className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-text-primary hover:bg-surface transition-colors"
      >
        📥 {t('csv')}
      </button>
      <button
        onClick={exportPDF}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-teal-dark text-white hover:bg-primary-teal transition-colors"
      >
        📄 {t('pdf')}
      </button>
    </div>
  );
}
