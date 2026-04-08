import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DataPoint, ParsedData } from './types';
import { detectFrequency } from './validation';

function parseDate(value: string): string {
  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  // Try DD/MM/YYYY
  const ddmmyyyy = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  // Try MM/DD/YYYY
  const mmddyyyy = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyy) {
    return value; // ambiguous, treat as-is
  }
  // Fallback: try Date constructor
  const d = new Date(value);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return value;
}

function rowsToDataPoints(rows: Record<string, string>[]): DataPoint[] {
  return rows
    .filter((row) => row.date && row.value !== undefined && row.value !== '')
    .map((row) => ({
      date: parseDate(String(row.date).trim()),
      value: parseFloat(String(row.value)),
      sku: row.sku ? String(row.sku).trim() : undefined,
      location: row.location ? String(row.location).trim() : undefined,
      category: row.category ? String(row.category).trim() : undefined,
      promo_flag: row.promo_flag !== undefined ? (Number(row.promo_flag) as 0 | 1) : undefined,
    }))
    .filter((d) => !isNaN(d.value));
}

export function parseCSV(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const rows = results.data as Record<string, string>[];
        const data = rowsToDataPoints(rows);
        resolve(buildParsedData(data));
      },
      error(err) {
        reject(err);
      },
    });
  });
}

export function parseExcel(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(firstSheet, {
          raw: false,
        });
        const data = rowsToDataPoints(rows);
        resolve(buildParsedData(data));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function buildParsedData(data: DataPoint[]): ParsedData {
  const skuSet = new Set<string>();
  data.forEach((d) => {
    if (d.sku) skuSet.add(d.sku);
  });
  const skus = Array.from(skuSet);
  const dates = data.map((d) => new Date(d.date)).filter((d) => !isNaN(d.getTime()));
  const frequency = detectFrequency(dates);

  return {
    data,
    skus,
    hasMultipleSKUs: skus.length > 1,
    frequency,
  };
}

export function getColumns(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        preview: 1,
        complete(results) {
          resolve(results.meta.fields || []);
        },
        error: reject,
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target?.result, { type: 'array' });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
            raw: false,
          });
          resolve(rows.length > 0 ? Object.keys(rows[0]) : []);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    }
  });
}
