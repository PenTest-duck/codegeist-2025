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
    // Use context.accountId if available, otherwise getCurrentStatus will use currentUser()
    const accountId = req.context?.accountId;
    console.log('========================================');
    console.log('getDashboardStatus CALLED');
    console.log('Request context:', JSON.stringify(req.context, null, 2));
    console.log('AccountId extracted:', accountId);
    console.log('========================================');

    const status = await getCurrentStatus(accountId);

    console.log('========================================');
    console.log('getDashboardStatus RESULT');
    console.log('Status returned:', JSON.stringify(status, null, 2));
    console.log('========================================');

    return status;
  } catch (error) {
    console.error('========================================');
    console.error('ERROR in getDashboardStatus:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('========================================');
    // Return a basic error response instead of throwing
    return null;
  }
});

/**
 * Get issue panel status
 * Called by issue panel frontend via invoke('getIssuePanelStatus')
 */
resolver.define('getIssuePanelStatus', async (req) => {
  try {
    // Use context.accountId if available, otherwise getCurrentStatus will use currentUser()
    const accountId = req.context?.accountId;
    console.log('getIssuePanelStatus called for accountId:', accountId);
    const status = await getCurrentStatus(accountId);
    return status;
  } catch (error) {
    console.error('Error in getIssuePanelStatus:', error);
    // Return a basic error response instead of throwing
    return null;
  }
});

export const handler = resolver.getDefinitions();
