/**
 * Analyzer Handlers
 * Forge function handlers that connect Rovo actions to analyzer modules
 */

import { analyzeTimingPatterns } from '../analyzers/timing';
import { analyzeLoadPatterns } from '../analyzers/load';
import { analyzeStrengthPatterns } from '../analyzers/strengths';
import { analyzeCollaborationPatterns } from '../analyzers/collaboration';
import { analyzeTrends } from '../analyzers/trends';
import { getCurrentStatus } from '../analyzers/currentStatus';
import { getRecommendation } from '../analyzers/recommendation';
import { analyzeBurnoutRisk } from '../analyzers/burnout';
import { analyzePitCrewPatterns } from '../analyzers/pitcrew';
import { predictSprintCompletion } from '../analyzers/predictions';

/**
 * Handler for analyze-timing action
 */
export async function analyzeTimingPatternsHandler(payload: any, context: any) {
  try {
    const accountId = context.accountId;
    const { timeRange } = payload;

    const analysis = await analyzeTimingPatterns(accountId, timeRange);

    return {
      success: true,
      data: analysis
    };
  } catch (error) {
    console.error('Error in analyzeTimingPatternsHandler:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Handler for analyze-strengths action
 */
export async function analyzeStrengthPatternsHandler(payload: any, context: any) {
  try {
    const accountId = context.accountId;
    const { compareToTeam = true } = payload;

    const analysis = await analyzeStrengthPatterns(accountId, compareToTeam);

    return {
      success: true,
      data: analysis
    };
  } catch (error) {
    console.error('Error in analyzeStrengthPatternsHandler:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Handler for analyze-collaboration action
 */
export async function analyzeCollaborationPatternsHandler(payload: any, context: any) {
  try {
    const accountId = context.accountId;
    const { focusArea = 'all' } = payload;

    const analysis = await analyzeCollaborationPatterns(accountId, focusArea);

    return {
      success: true,
      data: analysis
    };
  } catch (error) {
    console.error('Error in analyzeCollaborationPatternsHandler:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Handler for analyze-load action
 */
export async function analyzeLoadPatternsHandler(payload: any, context: any) {
  try {
    const accountId = context.accountId;

    const analysis = await analyzeLoadPatterns(accountId);

    return {
      success: true,
      data: analysis
    };
  } catch (error) {
    console.error('Error in analyzeLoadPatternsHandler:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Handler for analyze-trends action
 */
export async function analyzeTrendsHandler(payload: any, context: any) {
  try {
    const accountId = context.accountId;
    const { months = 6 } = payload;

    const analysis = await analyzeTrends(accountId, months);

    return {
      success: true,
      data: analysis
    };
  } catch (error) {
    console.error('Error in analyzeTrendsHandler:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Handler for get-current-status action
 */
export async function getCurrentStatusHandler(payload: any, context: any) {
  try {
    const accountId = context.accountId;

    const status = await getCurrentStatus(accountId);

    return {
      success: true,
      data: status
    };
  } catch (error) {
    console.error('Error in getCurrentStatusHandler:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Handler for get-recommendation action
 */
export async function getRecommendationHandler(payload: any, context: any) {
  try {
    const accountId = context.accountId;
    const { context: recommendationContext } = payload;

    if (!recommendationContext) {
      return {
        success: false,
        error: 'Context parameter is required'
      };
    }

    const recommendations = await getRecommendation(accountId, recommendationContext);

    return {
      success: true,
      data: recommendations
    };
  } catch (error) {
    console.error('Error in getRecommendationHandler:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Handler for analyze-burnout action
 */
export async function analyzeBurnoutRiskHandler(payload: any, context: any) {
  try {
    const accountId = context.accountId;

    const analysis = await analyzeBurnoutRisk(accountId);

    return {
      success: true,
      data: analysis
    };
  } catch (error) {
    console.error('Error in analyzeBurnoutRiskHandler:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Handler for analyze-pitcrew action
 */
export async function analyzePitCrewHandler(payload: any, context: any) {
  try {
    const accountId = context.accountId;

    const analysis = await analyzePitCrewPatterns(accountId);

    return {
      success: true,
      data: analysis
    };
  } catch (error) {
    console.error('Error in analyzePitCrewHandler:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Handler for predict-sprint action
 */
export async function predictSprintHandler(payload: any, context: any) {
  try {
    const accountId = context.accountId;

    const prediction = await predictSprintCompletion(accountId);

    return {
      success: true,
      data: prediction
    };
  } catch (error) {
    console.error('Error in predictSprintHandler:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
