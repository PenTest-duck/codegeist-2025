/**
 * Driver Telemetry - Main Entry Point
 * Personal performance intelligence for developers
 *
 * UI Kit 2 Structure:
 * - Rovo agent action handlers are exported from handlers/analyzers
 * - UI resolver (for getDashboardStatus, getIssuePanelStatus) is exported from resolvers/index
 * - Frontend UI is in frontend/index.tsx (loaded via manifest resources)
 */

// Export all Rovo agent action handlers
export {
  analyzeTimingPatternsHandler,
  analyzeStrengthPatternsHandler,
  analyzeCollaborationPatternsHandler,
  analyzeLoadPatternsHandler,
  analyzeTrendsHandler,
  getCurrentStatusHandler,
  getRecommendationHandler
} from './handlers/analyzers';

// Export UI resolver handler for UI Kit 2
// This handles frontend invoke() calls from @forge/bridge
export { handler } from './resolvers/index';

console.log('🏎️ Driver Telemetry initialized');
