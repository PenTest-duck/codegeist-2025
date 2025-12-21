/**
 * useDashboardData Hook
 * Fetches and auto-refreshes dashboard telemetry data
 */

import { useState, useEffect, useCallback } from 'react';
import { getDashboardStatus } from '../lib/api';
import { REFRESH_INTERVAL } from '../lib/constants';
import type { CurrentStatus } from '../types';

export const useDashboardData = () => {
  const [data, setData] = useState<CurrentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const status = await getDashboardStatus();
      setData(status);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up auto-refresh interval
    const intervalId = setInterval(fetchData, REFRESH_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};
