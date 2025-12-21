/**
 * Current Status Analyzer
 * Real-time status check combining multiple intelligence modules
 */

import { CurrentStatus } from '../models/analysis';
import { getActiveIssues, getCompletedIssues } from '../data/jira/issues';
import { getCached, setCache } from '../data/cache';
import { STATUS_TTL_HOURS } from '../models/cache';
import { getCurrentTimeZone } from '../utils/dateHelpers';
import { analyzeTimingPatterns } from './timing';
import { analyzeLoadPatterns } from './load';
import { analyzeBurnoutRisk } from './burnout';
import { analyzePitCrewPatterns } from './pitcrew';
import { predictSprintCompletion } from './predictions';

/**
 * Get current status for a user
 * If accountId is undefined, uses currentUser() in JQL queries
 */
export async function getCurrentStatus(accountId?: string): Promise<CurrentStatus> {
  console.log('========================================');
  console.log('getCurrentStatus CALLED');
  console.log('Input accountId:', accountId);
  console.log('========================================');

  // Use a default ID for caching when accountId is not provided
  const cacheAccountId = accountId || 'currentUser';
  console.log('Cache accountId:', cacheAccountId);

  // TEMPORARILY DISABLED: Check cache with short TTL (15 minutes for real-time status)
  // This forces fresh data fetch to test if JQL query works correctly
  /*
  const cacheKey = { namespace: 'status' as const, accountId: cacheAccountId };
  const cached = await getCached<CurrentStatus>(cacheKey, STATUS_TTL_HOURS);

  if (cached) {
    console.log('CACHE HIT - Returning cached status');
    console.log('Cached data:', JSON.stringify(cached, null, 2));
    return cached;
  }
  */

  console.log('CACHE DISABLED - Always fetching fresh data for debugging');

  // Get active tickets
  console.log('Calling getActiveIssues with accountId:', accountId);
  const activeIssues = await getActiveIssues(accountId);
  console.log('Active issues returned:', activeIssues.length);
  console.log('Active issues details:', JSON.stringify(activeIssues.map(i => ({
    key: i.key,
    status: i.status,
    summary: i.summary
  })), null, 2));
  const activeTickets = activeIssues.length;

  // Get timing analysis
  let currentTimeZone: 'peak' | 'normal' | 'danger' = 'normal';
  let timingData: CurrentStatus['timingData'] | undefined;
  try {
    const timingAnalysis = await analyzeTimingPatterns(cacheAccountId);
    const currentHour = new Date().getHours();
    currentTimeZone = getCurrentTimeZone(
      currentHour,
      timingAnalysis.peakWindow.start,
      timingAnalysis.peakWindow.end,
      timingAnalysis.dangerZone?.start
    );

    // Store timing data for gauges
    timingData = {
      currentHour,
      peakWindow: {
        start: timingAnalysis.peakWindow.start,
        end: timingAnalysis.peakWindow.end
      },
      dangerZone: timingAnalysis.dangerZone ? {
        start: timingAnalysis.dangerZone.start,
        end: timingAnalysis.dangerZone.end
      } : undefined
    };
  } catch (error) {
    console.error('Error getting timing analysis:', error);
  }

  // Get load analysis
  let loadStatus: 'under' | 'optimal' | 'over' | 'critical' = 'optimal';
  let loadData: CurrentStatus['loadData'] | undefined;
  try {
    const loadAnalysis = await analyzeLoadPatterns(cacheAccountId);
    loadStatus = loadAnalysis.currentStatus;

    // Store load data for gauges
    loadData = {
      optimalMin: loadAnalysis.optimalRange.min,
      optimalMax: loadAnalysis.optimalRange.max,
      currentLoad: loadAnalysis.currentLoad
    };
  } catch (error) {
    console.error('Error getting load analysis:', error);
  }

  // Calculate velocity metrics
  let velocityData: CurrentStatus['velocityData'] | undefined;
  try {
    console.log('========================================');
    console.log('VELOCITY CALCULATION START');
    console.log('========================================');

    // Get completed issues from last 30 days
    const completedIssuesLast30Days = await getCompletedIssues(cacheAccountId, 30);

    console.log('Completed issues (30 days):', completedIssuesLast30Days.length);
    console.log('Sample issues:', completedIssuesLast30Days.slice(0, 3).map(i => ({
      key: i.key,
      status: i.status,
      resolved: i.resolved,
      updated: i.updated,
      created: i.created
    })));

    const monthlyTotal = completedIssuesLast30Days.length;

    // Filter for last 7 days from the 30-day dataset
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    console.log('Current time:', now.toISOString());
    console.log('7 days ago:', sevenDaysAgo.toISOString());

    const completedInLast7Days = completedIssuesLast30Days.filter(issue => {
      // Use resolved date if available, otherwise fall back to updated date
      const resolvedDate = issue.resolved ? new Date(issue.resolved) : null;
      const updatedDate = issue.updated ? new Date(issue.updated) : null;
      const dateToUse = resolvedDate || updatedDate;

      console.log(`Issue ${issue.key}:`, {
        resolved: issue.resolved,
        resolvedDate: resolvedDate?.toISOString(),
        updated: issue.updated,
        updatedDate: updatedDate?.toISOString(),
        dateToUse: dateToUse?.toISOString(),
        inLast7Days: dateToUse ? dateToUse >= sevenDaysAgo : false
      });

      return dateToUse && dateToUse >= sevenDaysAgo;
    });

    console.log('Issues completed in last 7 days:', completedInLast7Days.length);
    console.log('7-day issues keys:', completedInLast7Days.map(i => i.key));

    const current = completedInLast7Days.length;
    const weeklyAvg = monthlyTotal / 4.3; // 30 days / ~4.3 weeks

    // Determine status based on current week vs average
    let status: 'below' | 'on-pace' | 'above';
    const variance = weeklyAvg > 0 ? (current - weeklyAvg) / weeklyAvg : 0;
    if (variance < -0.2) {
      status = 'below'; // More than 20% below average
    } else if (variance > 0.2) {
      status = 'above'; // More than 20% above average
    } else {
      status = 'on-pace'; // Within 20% of average
    }

    velocityData = {
      current,
      weeklyAvg: Math.round(weeklyAvg * 10) / 10, // Round to 1 decimal
      monthlyTotal,
      status
    };

    console.log('========================================');
    console.log('VELOCITY FINAL RESULT:');
    console.log({
      monthlyTotal,
      current,
      weeklyAvg: velocityData.weeklyAvg,
      status,
      variance: Math.round(variance * 100) + '%'
    });
    console.log('========================================');
  } catch (error) {
    console.error('Error calculating velocity:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
  }

  // Get burnout analysis
  let burnoutData: CurrentStatus['burnoutData'] | undefined;
  try {
    console.log('🔥 getCurrentStatus: Calling analyzeBurnoutRisk...');
    const burnoutAnalysis = await analyzeBurnoutRisk(cacheAccountId);
    console.log('🔥 getCurrentStatus: Burnout analysis returned:', {
      score: burnoutAnalysis.burnoutScore,
      level: burnoutAnalysis.riskLevel,
      factorsCount: burnoutAnalysis.riskFactors.length,
      factors: burnoutAnalysis.riskFactors.map(f => ({ desc: f.description, impact: f.impact }))
    });
    burnoutData = {
      burnoutScore: burnoutAnalysis.burnoutScore,
      riskLevel: burnoutAnalysis.riskLevel,
      topRiskFactors: burnoutAnalysis.riskFactors.slice(0, 3).map(f => f.description)
    };
    console.log('🔥 getCurrentStatus: burnoutData prepared:', burnoutData);
  } catch (error) {
    console.error('❌ Error getting burnout analysis:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
  }

  // Get pit crew analysis
  let pitCrewData: CurrentStatus['pitCrewData'] | undefined;
  try {
    const pitCrewAnalysis = await analyzePitCrewPatterns(cacheAccountId);
    if (pitCrewAnalysis.teammates.length > 0) {
      const topTeammates = pitCrewAnalysis.teammates.slice(0, 3).map(t => ({
        name: t.displayName,
        collaborations: t.collaborationCount
      }));

      let bestChemistry: { name: string; speedup: number } | undefined;
      if (pitCrewAnalysis.teamMetrics.bestPair) {
        bestChemistry = {
          name: pitCrewAnalysis.teamMetrics.bestPair.displayName,
          speedup: pitCrewAnalysis.teamMetrics.bestPair.speedup
        };
      }

      pitCrewData = {
        topTeammates,
        bestChemistry
      };
    }
  } catch (error) {
    console.error('Error getting pit crew analysis:', error);
  }

  // Get sprint prediction
  let sprintPredictionData: CurrentStatus['sprintPredictionData'] | undefined;
  try {
    const prediction = await predictSprintCompletion(cacheAccountId);
    sprintPredictionData = {
      completionProbability: prediction.predictions.completionProbability,
      expectedCompleted: prediction.predictions.expectedTicketsCompleted,
      atRiskCount: prediction.predictions.atRiskTickets.length
    };
  } catch (error) {
    console.error('Error getting sprint prediction:', error);
  }

  // Calculate sprint progress (simplified - would need sprint API integration)
  const sprintProgress = {
    completed: 0,
    remaining: activeTickets,
    percentComplete: 0,
    onTrack: true
  };

  // Generate today's recommendations
  const todayRecommendations = generateTodayRecommendations(
    currentTimeZone,
    loadStatus,
    activeTickets
  );

  const status: CurrentStatus = {
    accountId: cacheAccountId, // Use the cache key which is always a string
    activeTickets,
    currentTimeZone,
    loadStatus,
    sprintProgress,
    todayRecommendations,
    timestamp: new Date(),
    timingData,
    loadData,
    velocityData,
    burnoutData,
    pitCrewData,
    sprintPredictionData
  };

  // TEMPORARILY DISABLED: Cache with short TTL
  // await setCache(cacheKey, status, STATUS_TTL_HOURS);

  console.log('Returning fresh status (no cache write)');
  return status;
}

/**
 * Generate categorized recommendations for today
 */
function generateTodayRecommendations(
  timeZone: 'peak' | 'normal' | 'danger',
  loadStatus: 'under' | 'optimal' | 'over' | 'critical',
  activeTickets: number
): string[] {
  const recommendations: string[] = [];

  // Time zone recommendations with better context
  switch (timeZone) {
    case 'peak':
      recommendations.push('⏰ TIMING: You\'re in your peak productivity window');
      recommendations.push('   → This is the best time for complex, critical work');
      recommendations.push('   → Your quality and speed are highest right now');
      break;
    case 'danger':
      recommendations.push('⏰ TIMING: You\'re in your danger zone');
      recommendations.push('   → Quality drops during this time - avoid critical tasks');
      recommendations.push('   → Consider light work, reviews, or taking a break');
      break;
    case 'normal':
      recommendations.push('⏰ TIMING: Normal productivity window');
      recommendations.push('   → Good time for regular tasks and steady progress');
      recommendations.push('   → Save complex work for your peak hours');
      break;
  }

  // Load recommendations with actionable advice
  switch (loadStatus) {
    case 'under':
      recommendations.push('📊 WORKLOAD: Below optimal capacity');
      recommendations.push('   → You have room to take on more work');
      recommendations.push('   → Consider picking up 1-2 more tickets from the backlog');
      break;
    case 'optimal':
      recommendations.push('📊 WORKLOAD: Optimal balance ⭐');
      recommendations.push('   → You\'re at your sweet spot for productivity');
      recommendations.push('   → Maintain this balance for best results');
      break;
    case 'over':
      recommendations.push('📊 WORKLOAD: Above optimal capacity ⚠️');
      recommendations.push('   → Focus on completing current work before adding more');
      recommendations.push('   → Quality may suffer with additional tasks');
      break;
    case 'critical':
      recommendations.push('📊 WORKLOAD: Critical overload 🔴');
      recommendations.push('   → Prioritize completing existing work immediately');
      recommendations.push('   → Avoid starting any new tasks until load decreases');
      break;
  }

  // Active tickets guidance with context
  if (activeTickets === 0) {
    recommendations.push('📋 NEXT STEPS: No active work');
    recommendations.push('   → Check your backlog and pick up the next priority task');
  } else if (activeTickets === 1) {
    recommendations.push('📋 FOCUS: Single task in progress');
    recommendations.push('   → Excellent focus - maintain momentum on this ticket');
  } else if (activeTickets <= 3) {
    recommendations.push(`📋 FOCUS: ${activeTickets} tasks in progress`);
    recommendations.push('   → Review priorities and focus on highest-value work');
  } else {
    recommendations.push(`📋 FOCUS: ${activeTickets} concurrent tasks`);
    recommendations.push('   → Consider which tasks can be completed quickly');
    recommendations.push('   → High context switching may impact efficiency');
  }

  return recommendations;
}
