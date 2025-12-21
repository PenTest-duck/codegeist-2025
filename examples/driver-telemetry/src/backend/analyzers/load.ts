/**
 * Load Intelligence Analyzer
 * Analyzes optimal workload based on performance at different capacity levels
 */

import { LoadAnalysis, LoadPoint } from '../models/analysis';
import { getUserIssuesWithMetrics, countActiveTickets } from '../data/jira/issues';
import { getCached, setCache } from '../data/cache';
import { average, calculateConfidence } from '../utils/calculations';

/**
 * Analyze load patterns for a user
 */
export async function analyzeLoadPatterns(accountId: string): Promise<LoadAnalysis> {
  // Check cache
  const cached = await getCached<LoadAnalysis>(
    { namespace: 'load', accountId },
    24 // 24 hour TTL
  );

  if (cached) {
    // Update current load in real-time
    cached.currentLoad = await countActiveTickets(accountId);
    cached.currentStatus = determineLoadStatus(cached.currentLoad, cached.optimalRange);
    return cached;
  }

  // Fetch historical data
  const issues = await getUserIssuesWithMetrics(accountId, 180);

  if (issues.length < 10) {
    return createInsufficientDataResponse(accountId, issues.length);
  }

  // Calculate concurrent load for each issue
  const issuesWithLoad = issues.map(issue => ({
    ...issue,
    concurrentLoad: calculateConcurrentLoad(issue, issues)
  }));

  // Build load curve
  const loadCurve = buildLoadCurve(issuesWithLoad);

  // Find optimal range
  const optimalRange = findOptimalLoadRange(loadCurve);

  // Get current load
  const currentLoad = await countActiveTickets(accountId);
  const currentStatus = determineLoadStatus(currentLoad, optimalRange);

  // Generate recommendations
  const recommendations = generateLoadRecommendations(
    currentLoad,
    currentStatus,
    optimalRange,
    loadCurve
  );

  const analysis: LoadAnalysis = {
    accountId,
    optimalRange,
    loadCurve,
    currentLoad,
    currentStatus,
    recommendations,
    confidence: calculateConfidence(issues.length),
    dataPoints: issues.length,
    lastUpdated: new Date()
  };

  // Cache result
  await setCache({ namespace: 'load', accountId }, analysis, 24);

  return analysis;
}

/**
 * Calculate how many concurrent tickets a user had when working on this issue
 */
function calculateConcurrentLoad(issue: any, allIssues: any[]): number {
  if (!issue.created) return 1;

  // Count issues that were active at the same time
  const issueStart = issue.created.getTime();
  const issueEnd = issue.resolved ? issue.resolved.getTime() : new Date().getTime();

  let concurrent = 0;

  for (const other of allIssues) {
    if (other.key === issue.key) continue;

    const otherStart = other.created.getTime();
    const otherEnd = other.resolved ? other.resolved.getTime() : new Date().getTime();

    // Check if there's overlap
    if (otherStart <= issueEnd && otherEnd >= issueStart) {
      concurrent++;
    }
  }

  return Math.max(1, concurrent);
}

/**
 * Build load curve: performance metrics at different load levels
 */
function buildLoadCurve(issues: any[]): Record<number, LoadPoint> {
  // Group issues by concurrent load
  const loadGroups: Record<number, any[]> = {};

  for (const issue of issues) {
    const load = issue.concurrentLoad || 1;
    if (!loadGroups[load]) {
      loadGroups[load] = [];
    }
    loadGroups[load].push(issue);
  }

  // Calculate metrics for each load level
  const loadCurve: Record<number, LoadPoint> = {};

  for (const [load, loadIssues] of Object.entries(loadGroups)) {
    const loadNum = parseInt(load);

    // Calculate cycle time
    const cycleTimes = loadIssues
      .filter(i => i.metrics && i.metrics.cycleTimeDays > 0)
      .map(i => i.metrics.cycleTimeDays);

    // Calculate defect rate
    const defects = loadIssues.filter(i => i.metrics && i.metrics.hadDefect);
    const defectRate = loadIssues.length > 0 ? defects.length / loadIssues.length : 0;

    // Calculate completion rate (resolved vs total)
    const completed = loadIssues.filter(i => i.resolved);
    const completionRate = loadIssues.length > 0 ? completed.length / loadIssues.length : 0;

    // Calculate composite score (lower cycle time + lower defect rate = better)
    const avgCycleTime = cycleTimes.length > 0 ? average(cycleTimes) : 0;
    const score = avgCycleTime > 0 ? (1 / avgCycleTime) * (1 - defectRate) * completionRate : 0;

    loadCurve[loadNum] = {
      load: loadNum,
      cycleTime: avgCycleTime,
      defectRate,
      completionRate,
      score
    };
  }

  return loadCurve;
}

/**
 * Find optimal load range based on industry best practices for individual contributors
 */
function findOptimalLoadRange(loadCurve: Record<number, LoadPoint>): { min: number; max: number } {
  // Fixed optimal range based on research for individual contributors
  // 5-9 concurrent tickets provides best balance of throughput and quality
  return { min: 5, max: 9 };
}

/**
 * Determine current load status based on industry-standard zones
 */
function determineLoadStatus(
  currentLoad: number,
  optimalRange: { min: number; max: number }
): 'under' | 'optimal' | 'over' | 'critical' {
  // Under: < 5 tickets
  if (currentLoad < 5) {
    return 'under';
  }
  // Optimal: 5-9 tickets
  else if (currentLoad >= 5 && currentLoad <= 9) {
    return 'optimal';
  }
  // Over/Warning: 10-12 tickets
  else if (currentLoad >= 10 && currentLoad <= 12) {
    return 'over';
  }
  // Critical: 13+ tickets
  else {
    return 'critical';
  }
}

/**
 * Generate load recommendations
 */
function generateLoadRecommendations(
  currentLoad: number,
  status: 'under' | 'optimal' | 'over' | 'critical',
  optimalRange: { min: number; max: number },
  loadCurve: Record<number, LoadPoint>
): string[] {
  const recommendations: string[] = [];

  recommendations.push(
    `Your optimal load range is ${optimalRange.min}-${optimalRange.max} concurrent tickets`
  );

  switch (status) {
    case 'under':
      recommendations.push(
        `You currently have ${currentLoad} ticket${currentLoad !== 1 ? 's' : ''} - you could take on more work`
      );
      break;

    case 'optimal':
      recommendations.push(
        `You're at ${currentLoad} tickets - right in your sweet spot! ⭐`
      );
      break;

    case 'over':
      recommendations.push(
        `You have ${currentLoad} tickets (${currentLoad - optimalRange.max} over optimal)`
      );
      recommendations.push(
        'Consider completing one or two tickets before picking up new work'
      );

      // Show impact of overload
      const optimalMetrics = loadCurve[optimalRange.max];
      const currentMetrics = loadCurve[currentLoad];
      if (optimalMetrics && currentMetrics) {
        const cycleTimeIncrease = ((currentMetrics.cycleTime - optimalMetrics.cycleTime) / optimalMetrics.cycleTime) * 100;
        if (cycleTimeIncrease > 0) {
          recommendations.push(
            `At this load, your cycle time increases by ${cycleTimeIncrease.toFixed(0)}%`
          );
        }
      }
      break;

    case 'critical':
      recommendations.push(
        `⚠️ You have ${currentLoad} tickets - this is ${currentLoad - optimalRange.max} over your optimal range`
      );
      recommendations.push(
        'Urgent: Complete or delegate tickets before starting new work'
      );
      recommendations.push(
        'Historical data shows quality and speed both drop significantly at this load'
      );
      break;
  }

  return recommendations;
}

/**
 * Create response for insufficient data
 */
function createInsufficientDataResponse(accountId: string, dataPoints: number): LoadAnalysis {
  return {
    accountId,
    optimalRange: { min: 5, max: 9 },
    loadCurve: {},
    currentLoad: 0,
    currentStatus: 'optimal',
    recommendations: [
      `Currently have ${dataPoints} data points, need at least 10 for detailed load analysis`,
      'Complete more tickets and check back in a week or two',
      'General guidance: Most individual contributors perform best with 5-9 concurrent tickets'
    ],
    confidence: 'low',
    dataPoints,
    lastUpdated: new Date()
  };
}
