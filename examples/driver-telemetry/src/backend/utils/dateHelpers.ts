/**
 * Date Helper Functions
 * Utilities for date manipulation and calculations
 */

export function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export function getHourOfDay(date: Date): number {
  return date.getHours();
}

export function getDayOfWeek(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

export function daysBetween(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function hoursBetween(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  return diffMs / (1000 * 60 * 60);
}

export function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

export function isBusinessHours(date: Date): boolean {
  const hour = date.getHours();
  return hour >= 9 && hour < 17;
}

export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  } else if (hours < 24) {
    return `${hours.toFixed(1)} hours`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return `${days} day${days !== 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours}h` : ''}`;
  }
}

export function getTimeRange(range: string): { start: Date; end: Date } {
  const end = new Date();
  let start: Date;

  switch (range.toLowerCase()) {
    case '1week':
    case 'week':
      start = getDaysAgo(7);
      break;
    case '2weeks':
      start = getDaysAgo(14);
      break;
    case '1month':
    case 'month':
      start = getDaysAgo(30);
      break;
    case '3months':
      start = getDaysAgo(90);
      break;
    case '6months':
      start = getDaysAgo(180);
      break;
    case '1year':
    case 'year':
      start = getDaysAgo(365);
      break;
    default:
      start = getDaysAgo(180); // default to 6 months
  }

  return { start, end };
}

export function getCurrentTimeZone(currentHour: number, peakStart: number, peakEnd: number, dangerStart?: number): 'peak' | 'normal' | 'danger' {
  if (currentHour >= peakStart && currentHour < peakEnd) {
    return 'peak';
  }
  if (dangerStart !== undefined && currentHour >= dangerStart) {
    return 'danger';
  }
  return 'normal';
}
