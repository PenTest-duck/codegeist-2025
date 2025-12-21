/**
 * UI Resolvers
 * Backend functions that provide data to UI Kit frontend components
 */

import Resolver from '@forge/resolver';
import { getCurrentStatus } from '../analyzers/currentStatus';

const resolver = new Resolver();

/**
 * Get dashboard status
 * Called by dashboard frontend via invoke('getDashboardStatus')
 */
resolver.define('getDashboardStatus', async (req) => {
  try {
    const accountId = req.context.accountId || 'currentUser';
    const status = await getCurrentStatus(accountId);
    return status;
  } catch (error) {
    console.error('Error in getDashboardStatus:', error);
    throw error;
  }
});

/**
 * Get issue panel status
 * Called by issue panel frontend via invoke('getIssuePanelStatus')
 */
resolver.define('getIssuePanelStatus', async (req) => {
  try {
    const accountId = req.context.accountId || 'currentUser';
    const status = await getCurrentStatus(accountId);
    return status;
  } catch (error) {
    console.error('Error in getIssuePanelStatus:', error);
    throw error;
  }
});

export const handler = resolver.getDefinitions();
