/**
 * Formatting Utilities
 * Functions for formatting data for display
 */

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDelta(delta: number): string {
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}%`;
}

export function formatNumber(value: number, decimals: number = 1): string {
  return value.toFixed(decimals);
}

export function formatMultiplier(value: number): string {
  return `${value.toFixed(1)}x`;
}

export function formatRating(value: number, max: number = 10): string {
  return `${value.toFixed(1)}/${max}`;
}

export function getStatusEmoji(status: 'excellent' | 'good' | 'average' | 'poor'): string {
  const emojiMap = {
    excellent: '⭐',
    good: '✓',
    average: '◆',
    poor: '⚠️'
  };
  return emojiMap[status] || '◆';
}

export function getLoadEmoji(status: 'under' | 'optimal' | 'over' | 'critical'): string {
  const emojiMap = {
    under: '🟡',
    optimal: '🟢',
    over: '🟠',
    critical: '🔴'
  };
  return emojiMap[status];
}

export function getTimeZoneEmoji(zone: 'peak' | 'normal' | 'danger'): string {
  const emojiMap = {
    peak: '🟢',
    normal: '🟡',
    danger: '🔴'
  };
  return emojiMap[zone];
}

export function getTrendEmoji(trend: 'up' | 'down' | 'stable'): string {
  const emojiMap = {
    up: '📈',
    down: '📉',
    stable: '➡️'
  };
  return emojiMap[trend];
}

export function formatHourRange(start: number, end: number): string {
  const formatHour = (h: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:00 ${period}`;
  };
  return `${formatHour(start)} - ${formatHour(end)}`;
}

export function formatConfidence(confidence: 'high' | 'medium' | 'low'): string {
  return `Confidence: ${confidence.charAt(0).toUpperCase() + confidence.slice(1)}`;
}

export function createProgressBar(current: number, total: number, width: number = 10): string {
  if (total === 0) return '░'.repeat(width);
  const filled = Math.round((current / total) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

export function summarizeStrength(delta: number): string {
  if (delta <= -30) return 'Major Strength ⭐⭐⭐';
  if (delta <= -15) return 'Strength ⭐⭐';
  if (delta <= -5) return 'Above Average ⭐';
  if (delta <= 5) return 'Average';
  if (delta <= 15) return 'Below Average ⚠️';
  return 'Weak Area ⚠️⚠️';
}

export function summarizeExpertise(count: number, qualityScore: number): 'expert' | 'strong' | 'average' | 'developing' | 'avoid' {
  if (count >= 20 && qualityScore >= 8) return 'expert';
  if (count >= 10 && qualityScore >= 7) return 'strong';
  if (count >= 5 && qualityScore >= 6) return 'average';
  if (count < 5 || qualityScore < 5) return 'developing';
  return 'avoid';
}

export function getRatingLabel(rating: 'excellent' | 'good' | 'average' | 'slow'): string {
  const labels = {
    excellent: 'Excellent ⭐',
    good: 'Good ✓',
    average: 'Average',
    slow: 'Slow ⚠️'
  };
  return labels[rating];
}
