/**
 * API Layer - Wrappers for @forge/bridge invoke() calls
 */

import { invoke } from '@forge/bridge';
import type { CurrentStatus } from '../../backend/models/analysis';

/**
 * Get dashboard status (full telemetry data)
 */
export const getDashboardStatus = async (): Promise<CurrentStatus> => {
  return invoke<CurrentStatus>('getDashboardStatus');
};

/**
 * Get issue panel status (compact telemetry data)
 */
export const getIssuePanelStatus = async (): Promise<CurrentStatus> => {
  return invoke<CurrentStatus>('getIssuePanelStatus');
};
