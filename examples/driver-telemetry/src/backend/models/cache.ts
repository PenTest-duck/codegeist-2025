/**
 * Cache Models
 * Data structures for Forge Storage caching
 */

export interface CacheEntry<T> {
  data: T;
  lastUpdated: Date;
  ttlHours: number;
  version: string;
}

export interface CacheKey {
  namespace: 'timing' | 'strengths' | 'collaboration' | 'load' | 'trends' | 'status' | 'burnout' | 'pitcrew' | 'predictions';
  accountId: string;
  suffix?: string;
}

export function buildCacheKey(key: CacheKey): string {
  const parts = ['user', key.accountId, key.namespace];
  if (key.suffix) {
    parts.push(key.suffix);
  }
  return parts.join(':');
}

export const CACHE_VERSION = '1.2.0'; // Bumped to invalidate cache after burnout detection fix
export const DEFAULT_TTL_HOURS = 24;
export const STATUS_TTL_HOURS = 0.25; // 15 minutes for real-time status
