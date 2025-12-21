/**
 * Cache Layer
 * Wrapper for Forge Storage API with TTL and versioning
 */

import { storage } from '@forge/api';
import { CacheEntry, CacheKey, buildCacheKey, CACHE_VERSION, DEFAULT_TTL_HOURS } from '../models/cache';

export async function getCached<T>(
  key: CacheKey,
  ttlHours: number = DEFAULT_TTL_HOURS
): Promise<T | null> {
  try {
    const cacheKey = buildCacheKey(key);
    const entry = await storage.get(cacheKey) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // Check version compatibility
    if (entry.version !== CACHE_VERSION) {
      console.log(`Cache version mismatch for ${cacheKey}. Invalidating.`);
      await storage.delete(cacheKey);
      return null;
    }

    // Check TTL
    const now = new Date().getTime();
    const lastUpdated = new Date(entry.lastUpdated).getTime();
    const age = now - lastUpdated;
    const maxAge = ttlHours * 60 * 60 * 1000;

    if (age > maxAge) {
      console.log(`Cache expired for ${cacheKey}. Age: ${age}ms, Max: ${maxAge}ms`);
      return null;
    }

    console.log(`Cache hit for ${cacheKey}`);
    return entry.data;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

export async function setCache<T>(
  key: CacheKey,
  data: T,
  ttlHours: number = DEFAULT_TTL_HOURS
): Promise<void> {
  try {
    const cacheKey = buildCacheKey(key);
    const entry: CacheEntry<T> = {
      data,
      lastUpdated: new Date(),
      ttlHours,
      version: CACHE_VERSION
    };

    await storage.set(cacheKey, entry);
    console.log(`Cache set for ${cacheKey} with TTL ${ttlHours}h`);
  } catch (error) {
    console.error('Error writing to cache:', error);
    throw error;
  }
}

export async function invalidateCache(key: CacheKey): Promise<void> {
  try {
    const cacheKey = buildCacheKey(key);
    await storage.delete(cacheKey);
    console.log(`Cache invalidated for ${cacheKey}`);
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
}

export async function invalidateAllUserCache(accountId: string): Promise<void> {
  try {
    const namespaces: CacheKey['namespace'][] = [
      'timing',
      'strengths',
      'collaboration',
      'load',
      'trends',
      'status',
      'burnout',
      'pitcrew',
      'predictions'
    ];

    await Promise.all(
      namespaces.map(namespace =>
        invalidateCache({ namespace, accountId })
      )
    );

    console.log(`All caches invalidated for user ${accountId}`);
  } catch (error) {
    console.error('Error invalidating all user caches:', error);
  }
}

export async function getCacheMetadata(key: CacheKey): Promise<{
  exists: boolean;
  age?: number;
  ttl?: number;
  version?: string;
} | null> {
  try {
    const cacheKey = buildCacheKey(key);
    const entry = await storage.get(cacheKey) as CacheEntry<any> | undefined;

    if (!entry) {
      return { exists: false };
    }

    const now = new Date().getTime();
    const lastUpdated = new Date(entry.lastUpdated).getTime();
    const age = now - lastUpdated;

    return {
      exists: true,
      age,
      ttl: entry.ttlHours,
      version: entry.version
    };
  } catch (error) {
    console.error('Error reading cache metadata:', error);
    return null;
  }
}
