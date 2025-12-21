/**
 * Trend Intelligence Analyzer
 * Analyzes how the user's performance has changed over time
 */

import { TrendAnalysis, TrendData, PeriodMetrics } from '../models/analysis';
import { getUserIssuesWithMetrics } from '../data/jira/issues';
import { getCached, setCache } from '../data/cache';
import { average, calculateConfidence } from '../utils/calculations';
import { getDayOfWeek } from '../utils/dateHelpers';

/**
 * Analyze performance trends for a user
 */
export async function analyzeTrends(
  accountId: string,
  months: number = 6
): Promise<TrendAnalysis> {
  // Check cache
  const cacheKey = { namespace: 'trends' as const, accountId };
  const cached = await getCached<TrendAnalysis>(cacheKey, 24);

  if (cached) {
    return cached;
  }

  // Fetch historical data
  const daysBack = months * 30;
  const userIssues = await getUserIssuesWithMetrics(accountId, daysBack);

  if (userIssues.length < 10) {
    return createInsufficientDataResponse(accountId, userIssues.length, months);
  }

  // Group by month
  const monthlyGroups = groupByMonth(userIssues);

  // Calculate velocity trend (issues completed per month)
  const velocityTrend = calculateVelocityTrend(monthlyGroups);

  // Calculate quality trend
  const qualityTrend = calculateQualityTrend(monthlyGroups);

  // Skills evolution (simplified)
  const skillsEvolution = calculateSkillsEvolution(monthlyGroups);

  // Period comparison (last 2 months vs previous 2 months)
  const periodComparison = calculatePeriodComparison(monthlyGroups);

  // Generate recommendations
  const recommendations = generateTrendRecommendations(velocityTrend, qualityTrend, skillsEvolution);

  const analysis: TrendAnalysis = {
    accountId,
    velocityTrend,
    qualityTrend,
    skillsEvolution,
    periodComparison,
    recommendations,
    confidence: calculateConfidence(userIssues.length),
    dataPoints: userIssues.length,
    lastUpdated: new Date()
  };

  // Cache result
  await setCache(cacheKey, analysis, 24);

  return analysis;
}

/**
 * Group issues by month
 */
function groupByMonth(issues: any[]): Record<string, any[]> {
  const groups: Record<string, any[]> = {};

  for (const issue of issues) {
    const date = issue.resolved || issue.updated;
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(issue);
  }

  return groups;
}

/**
 * Calculate velocity trend
 */
function calculateVelocityTrend(monthlyGroups: Record<string, any[]>): TrendData[] {
  const months = Object.keys(monthlyGroups).sort();

  return months.map((month, index) => {
    const issues = monthlyGroups[month];
    const [year, monthNum] = month.split('-').map(Number);

    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (index > 0) {
      const prevValue = monthlyGroups[months[index - 1]].length;
      const currentValue = issues.length;
      if (currentValue > prevValue * 1.1) trend = 'up';
      else if (currentValue < prevValue * 0.9) trend = 'down';
    }

    return {
      period: month,
      startDate,
      endDate,
      value: issues.length,
      trend
    };
  });
}

/**
 * Calculate quality trend
 */
function calculateQualityTrend(monthlyGroups: Record<string, any[]>): TrendData[] {
  const months = Object.keys(monthlyGroups).sort();

  return months.map((month, index) => {
    const issues = monthlyGroups[month];
    const [year, monthNum] = month.split('-').map(Number);

    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    // Calculate quality score
    const qualityScores = issues.map(i => {
      if (!i.metrics) return 5;
      let score = 10;
      if (i.metrics.wasReopened) score -= 3;
      if (i.metrics.hadDefect) score -= 3;
      score -= i.metrics.numberOfRevisions * 0.5;
      return Math.max(0, score);
    });

    const value = average(qualityScores);

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (index > 0) {
      const prevQualityScores = monthlyGroups[months[index - 1]].map((i: any) => {
        if (!i.metrics) return 5;
        let score = 10;
        if (i.metrics.wasReopened) score -= 3;
        if (i.metrics.hadDefect) score -= 3;
        score -= i.metrics.numberOfRevisions * 0.5;
        return Math.max(0, score);
      });
      const prevValue = average(prevQualityScores);
      if (value > prevValue * 1.1) trend = 'up';
      else if (value < prevValue * 0.9) trend = 'down';
    }

    return {
      period: month,
      startDate,
      endDate,
      value,
      trend
    };
  });
}

/**
 * Calculate skills evolution
 */
function calculateSkillsEvolution(monthlyGroups: Record<string, any[]>): any[] {
  // Simplified: Track issue types over time
  const months = Object.keys(monthlyGroups).sort();
  const halfPoint = Math.floor(months.length / 2);

  const firstHalf = months.slice(0, halfPoint);
  const secondHalf = months.slice(halfPoint);

  const firstHalfTypes: Record<string, number> = {};
  const secondHalfTypes: Record<string, number> = {};

  // Count issue types in first half
  for (const month of firstHalf) {
    for (const issue of monthlyGroups[month]) {
      firstHalfTypes[issue.issueType] = (firstHalfTypes[issue.issueType] || 0) + 1;
    }
  }

  // Count issue types in second half
  for (const month of secondHalf) {
    for (const issue of monthlyGroups[month]) {
      secondHalfTypes[issue.issueType] = (secondHalfTypes[issue.issueType] || 0) + 1;
    }
  }

  // Calculate growth
  const skills: any[] = [];
  const allTypes = new Set([...Object.keys(firstHalfTypes), ...Object.keys(secondHalfTypes)]);

  for (const type of allTypes) {
    const prev = firstHalfTypes[type] || 0;
    const curr = secondHalfTypes[type] || 0;
    const growth = prev > 0 ? ((curr - prev) / prev) * 100 : 0;

    let trend: 'growing' | 'declining' | 'stable' = 'stable';
    if (growth > 20) trend = 'growing';
    else if (growth < -20) trend = 'declining';

    skills.push({
      skill: type,
      currentLevel: curr,
      previousLevel: prev,
      growth,
      trend
    });
  }

  return skills.sort((a, b) => b.growth - a.growth);
}

/**
 * Calculate period comparison
 */
function calculatePeriodComparison(monthlyGroups: Record<string, any[]>): any {
  const months = Object.keys(monthlyGroups).sort();

  if (months.length < 2) {
    return {
      current: { period: 'Current', issuesCompleted: 0, storyPoints: 0, avgCycleTime: 0, qualityScore: 0, defectRate: 0 },
      previous: { period: 'Previous', issuesCompleted: 0, storyPoints: 0, avgCycleTime: 0, qualityScore: 0, defectRate: 0 },
      delta: {}
    };
  }

  const midpoint = Math.floor(months.length / 2);
  const previousMonths = months.slice(0, midpoint);
  const currentMonths = months.slice(midpoint);

  const previousIssues = previousMonths.flatMap(m => monthlyGroups[m]);
  const currentIssues = currentMonths.flatMap(m => monthlyGroups[m]);

  const previous = calculatePeriodMetrics('Previous Period', previousIssues);
  const current = calculatePeriodMetrics('Current Period', currentIssues);

  const delta = {
    issuesCompleted: ((current.issuesCompleted - previous.issuesCompleted) / previous.issuesCompleted) * 100,
    avgCycleTime: ((current.avgCycleTime - previous.avgCycleTime) / previous.avgCycleTime) * 100,
    qualityScore: ((current.qualityScore - previous.qualityScore) / previous.qualityScore) * 100
  };

  return { current, previous, delta };
}

/**
 * Calculate metrics for a period
 */
function calculatePeriodMetrics(period: string, issues: any[]): PeriodMetrics {
  const cycleTimes = issues
    .filter(i => i.metrics && i.metrics.cycleTimeDays > 0)
    .map(i => i.metrics.cycleTimeDays);

  const qualityScores = issues.map(i => {
    if (!i.metrics) return 5;
    let score = 10;
    if (i.metrics.wasReopened) score -= 3;
    if (i.metrics.hadDefect) score -= 3;
    score -= i.metrics.numberOfRevisions * 0.5;
    return Math.max(0, score);
  });

  const defects = issues.filter(i => i.metrics && i.metrics.hadDefect);

  return {
    period,
    issuesCompleted: issues.length,
    storyPoints: issues.reduce((sum, i) => sum + (i.storyPoints || 0), 0),
    avgCycleTime: cycleTimes.length > 0 ? average(cycleTimes) : 0,
    qualityScore: average(qualityScores),
    defectRate: issues.length > 0 ? defects.length / issues.length : 0
  };
}

/**
 * Generate trend recommendations
 */
function generateTrendRecommendations(
  velocityTrend: TrendData[],
  qualityTrend: TrendData[],
  skillsEvolution: any[]
): string[] {
  const recommendations: string[] = [];

  // Velocity trend
  if (velocityTrend.length > 0) {
    const latest = velocityTrend[velocityTrend.length - 1];
    if (latest.trend === 'down') {
      recommendations.push('Your velocity has declined recently - check your current workload');
    } else if (latest.trend === 'up') {
      recommendations.push('Your velocity is improving - great progress! ⭐');
    }
  }

  // Quality trend
  if (qualityTrend.length > 0) {
    const latest = qualityTrend[qualityTrend.length - 1];
    if (latest.trend === 'up') {
      recommendations.push('Your quality is improving - fewer defects and revisions ⭐');
    } else if (latest.trend === 'down') {
      recommendations.push('Quality has dipped recently - consider slowing down or reducing load');
    }
  }

  // Skills evolution
  if (skillsEvolution.length > 0) {
    const growing = skillsEvolution.filter(s => s.trend === 'growing').slice(0, 2);
    if (growing.length > 0) {
      recommendations.push(`Growing skills: ${growing.map(s => s.skill).join(', ')}`);
    }
  }

  return recommendations;
}

/**
 * Create response for insufficient data
 */
function createInsufficientDataResponse(accountId: string, dataPoints: number, months: number): TrendAnalysis {
  return {
    accountId,
    velocityTrend: [],
    qualityTrend: [],
    skillsEvolution: [],
    periodComparison: {
      current: { period: 'Current', issuesCompleted: 0, storyPoints: 0, avgCycleTime: 0, qualityScore: 0, defectRate: 0 },
      previous: { period: 'Previous', issuesCompleted: 0, storyPoints: 0, avgCycleTime: 0, qualityScore: 0, defectRate: 0 },
      delta: {}
    },
    recommendations: [
      `Currently have ${dataPoints} data points, need at least 10 for trend analysis`,
      `Trend analysis requires ${months} months of history`,
      'Complete more tickets and check back later for insights'
    ],
    confidence: 'low',
    dataPoints,
    lastUpdated: new Date()
  };
}
