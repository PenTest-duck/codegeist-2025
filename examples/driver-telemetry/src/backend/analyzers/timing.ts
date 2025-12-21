/**
 * Timing Intelligence Analyzer
 * Analyzes when the user does their best work based on activity patterns
 */

import { TimingAnalysis, DayPattern } from '../models/analysis';
import { HourlyActivity, ActivityEvent } from '../models/metrics';
import { getUserIssuesWithMetrics } from '../data/jira/issues';
import { getCached, setCache } from '../data/cache';
import { getHourOfDay, getDayOfWeek, getTimeRange } from '../utils/dateHelpers';
import { average, calculateConfidence, groupBy } from '../utils/calculations';

/**
 * Analyze timing patterns for a user
 */
export async function analyzeTimingPatterns(
  accountId: string,
  timeRange: string = '6months'
): Promise<TimingAnalysis> {
  // Check cache
  const cached = await getCached<TimingAnalysis>(
    { namespace: 'timing', accountId },
    24 // 24 hour TTL
  );

  if (cached) {
    return cached;
  }

  // Fetch data
  const { start, end } = getTimeRange(timeRange);
  const daysBack = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const issues = await getUserIssuesWithMetrics(accountId, daysBack);

  if (issues.length < 10) {
    // Insufficient data
    return createInsufficientDataResponse(accountId, issues.length);
  }

  // Analyze patterns
  const hourlyActivity = groupByHour(issues);
  const dayPatterns = analyzeDayPatterns(issues);
  const peakWindow = findPeakWindow(hourlyActivity);
  const dangerZone = findDangerZone(hourlyActivity);

  const recommendations = generateTimingRecommendations(peakWindow, dangerZone, dayPatterns);

  const analysis: TimingAnalysis = {
    accountId,
    peakWindow,
    dangerZone,
    dayPatterns,
    recommendations,
    confidence: calculateConfidence(issues.length),
    dataPoints: issues.length,
    lastUpdated: new Date()
  };

  // Cache result
  await setCache({ namespace: 'timing', accountId }, analysis, 24);

  return analysis;
}

/**
 * Group activities by hour of day
 */
function groupByHour(issues: any[]): HourlyActivity[] {
  const hourlyBuckets: Map<number, ActivityEvent[]> = new Map();

  // Initialize all hours
  for (let hour = 0; hour < 24; hour++) {
    hourlyBuckets.set(hour, []);
  }

  // Group issue activities by hour
  for (const issue of issues) {
    // Updated timestamp
    const updateHour = getHourOfDay(issue.updated);
    hourlyBuckets.get(updateHour)?.push({
      type: 'issue_update',
      timestamp: issue.updated,
      quality: calculateIssueQuality(issue),
      metadata: { issueKey: issue.key }
    });

    // Resolved timestamp
    if (issue.resolved) {
      const resolveHour = getHourOfDay(issue.resolved);
      hourlyBuckets.get(resolveHour)?.push({
        type: 'issue_update',
        timestamp: issue.resolved,
        quality: calculateIssueQuality(issue),
        metadata: { issueKey: issue.key, resolved: true }
      });
    }
  }

  // Calculate quality scores
  const hourlyActivity: HourlyActivity[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const activities = hourlyBuckets.get(hour) || [];
    hourlyActivity.push({
      hour,
      activities,
      qualityScore: calculateHourQuality(activities),
      volume: activities.length
    });
  }

  return hourlyActivity;
}

/**
 * Calculate quality score for an issue
 */
function calculateIssueQuality(issue: any): number {
  if (!issue.metrics) return 5;

  const { wasReopened, hadDefect, numberOfRevisions } = issue.metrics;

  let score = 10;
  if (wasReopened) score -= 3;
  if (hadDefect) score -= 3;
  score -= numberOfRevisions * 0.5;

  return Math.max(0, score);
}

/**
 * Calculate average quality for activities in an hour
 */
function calculateHourQuality(activities: ActivityEvent[]): number {
  if (activities.length === 0) return 5; // neutral score

  const qualities = activities.map(a => a.quality);
  return average(qualities);
}

/**
 * Find peak productivity window
 */
function findPeakWindow(hourlyActivity: HourlyActivity[]): TimingAnalysis['peakWindow'] {
  // Filter to hours with sufficient volume (at least 5 activities)
  const significantHours = hourlyActivity.filter(h => h.volume >= 5);

  if (significantHours.length === 0) {
    // Default to mid-morning
    return {
      start: 10,
      end: 12,
      qualityMultiplier: 1.0,
      description: 'Insufficient data for peak window analysis'
    };
  }

  // Find best quality hours
  const sortedByQuality = [...significantHours].sort((a, b) => b.qualityScore - a.qualityScore);
  const bestHours = sortedByQuality.slice(0, Math.min(3, sortedByQuality.length));

  // Find consecutive hours for window
  const bestHourNumbers = bestHours.map(h => h.hour).sort((a, b) => a - b);
  const start = Math.min(...bestHourNumbers);
  const end = Math.max(...bestHourNumbers) + 1;

  const avgQuality = average(hourlyActivity.map(h => h.qualityScore));
  const peakQuality = average(bestHours.map(h => h.qualityScore));
  const qualityMultiplier = peakQuality / avgQuality;

  return {
    start,
    end,
    qualityMultiplier,
    description: `Your best work happens between ${start}:00 and ${end}:00`
  };
}

/**
 * Find danger zone (low quality hours)
 */
function findDangerZone(hourlyActivity: HourlyActivity[]): TimingAnalysis['dangerZone'] | undefined {
  // Filter to hours with sufficient volume
  const significantHours = hourlyActivity.filter(h => h.volume >= 5);

  if (significantHours.length === 0) {
    return undefined;
  }

  // Find worst quality hours
  const sortedByQuality = [...significantHours].sort((a, b) => a.qualityScore - b.qualityScore);
  const worstHours = sortedByQuality.slice(0, Math.min(2, sortedByQuality.length));

  // Only consider it a danger zone if quality is significantly below average
  const avgQuality = average(significantHours.map(h => h.qualityScore));
  const worstQuality = average(worstHours.map(h => h.qualityScore));

  if (worstQuality >= avgQuality * 0.8) {
    // Not significantly worse
    return undefined;
  }

  const worstHourNumbers = worstHours.map(h => h.hour).sort((a, b) => a - b);
  const start = Math.min(...worstHourNumbers);
  const end = Math.max(...worstHourNumbers) + 1;
  const revertMultiplier = avgQuality / worstQuality;

  return {
    start,
    end,
    revertMultiplier,
    description: `Work quality drops between ${start}:00 and ${end}:00`
  };
}

/**
 * Analyze day-of-week patterns
 */
function analyzeDayPatterns(issues: any[]): Record<string, DayPattern> {
  // Group issues by day of week
  const dayGroups: Record<string, any[]> = {};
  for (const issue of issues) {
    const day = getDayOfWeek(issue.updated);
    if (!dayGroups[day]) {
      dayGroups[day] = [];
    }
    dayGroups[day].push(issue);
  }

  const patterns: Record<string, DayPattern> = {};

  for (const [day, dayIssues] of Object.entries(dayGroups)) {
    const qualities = dayIssues.map(calculateIssueQuality);
    const cycleTimes = dayIssues
      .filter((i: any) => i.metrics && i.metrics.cycleTimeDays > 0)
      .map((i: any) => i.metrics.cycleTimeDays);

    patterns[day] = {
      dayOfWeek: day as any,
      quality: average(qualities),
      speed: cycleTimes.length > 0 ? 1 / average(cycleTimes) : 0,
      volume: dayIssues.length
    };
  }

  return patterns;
}

/**
 * Generate timing recommendations
 */
function generateTimingRecommendations(
  peakWindow: TimingAnalysis['peakWindow'],
  dangerZone: TimingAnalysis['dangerZone'] | undefined,
  dayPatterns: Record<string, DayPattern>
): string[] {
  const recommendations: string[] = [];

  // Peak window recommendation
  recommendations.push(
    `Schedule deep work and complex tasks between ${peakWindow.start}:00 and ${peakWindow.end}:00`
  );

  // Danger zone recommendation
  if (dangerZone) {
    recommendations.push(
      `Avoid critical work after ${dangerZone.start}:00 - your quality drops by ${((dangerZone.revertMultiplier - 1) * 100).toFixed(0)}%`
    );
  }

  // Best day recommendation
  const days = Object.entries(dayPatterns);
  if (days.length > 0) {
    const bestDay = days.sort((a, b) => b[1].quality - a[1].quality)[0];
    recommendations.push(
      `${bestDay[0]} is your best day - save important work for it`
    );
  }

  return recommendations;
}

/**
 * Create response for insufficient data
 */
function createInsufficientDataResponse(accountId: string, dataPoints: number): TimingAnalysis {
  return {
    accountId,
    peakWindow: {
      start: 10,
      end: 12,
      qualityMultiplier: 1.0,
      description: 'Insufficient data - need at least 10 completed tickets'
    },
    dayPatterns: {},
    recommendations: [
      `Currently have ${dataPoints} data points, need at least 10 for timing analysis`,
      'Complete more tickets and check back in a week or two'
    ],
    confidence: 'low',
    dataPoints,
    lastUpdated: new Date()
  };
}
