/**
 * Calculation Utilities
 * Statistical and metric calculation functions
 */

export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

export function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function percentile(numbers: number[], p: number): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function standardDeviation(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const avg = average(numbers);
  const squaredDiffs = numbers.map(n => Math.pow(n - avg, 2));
  return Math.sqrt(average(squaredDiffs));
}

export function calculateDelta(userValue: number, teamValue: number): number {
  if (teamValue === 0) return 0;
  return ((userValue - teamValue) / teamValue) * 100;
}

export function calculatePercentile(userValue: number, allValues: number[]): number {
  if (allValues.length === 0) return 50;
  const sorted = [...allValues].sort((a, b) => a - b);
  const index = sorted.findIndex(v => v >= userValue);
  if (index === -1) return 100;
  return (index / sorted.length) * 100;
}

export function normalizeScore(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

export function calculateQualityScore(
  revisionRate: number,
  bugRate: number,
  approvalSpeed: number // hours
): number {
  // Lower is better for revisionRate and bugRate
  // Lower is better for approvalSpeed
  const revisionScore = Math.max(0, 1 - revisionRate);
  const bugScore = Math.max(0, 1 - bugRate);
  const approvalScore = Math.max(0, 1 - (approvalSpeed / 48)); // normalize to 48 hours

  return (revisionScore * 0.4 + bugScore * 0.4 + approvalScore * 0.2) * 10;
}

export function calculateConfidence(dataPoints: number): 'high' | 'medium' | 'low' {
  if (dataPoints >= 30) return 'high';
  if (dataPoints >= 10) return 'medium';
  return 'low';
}

export function movingAverage(numbers: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < numbers.length; i++) {
    const start = Math.max(0, i - window + 1);
    const end = i + 1;
    const slice = numbers.slice(start, end);
    result.push(average(slice));
  }
  return result;
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export function countBy<T>(array: T[], key: keyof T): Record<string, number> {
  return array.reduce((acc, item) => {
    const groupKey = String(item[key]);
    acc[groupKey] = (acc[groupKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
