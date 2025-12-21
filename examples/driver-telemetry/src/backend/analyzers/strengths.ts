/**
 * Strength Intelligence Analyzer
 * Analyzes what types of work the user excels at
 */

import { StrengthAnalysis, StrengthMetric, ComponentStrength } from '../models/analysis';
import { getUserIssuesWithMetrics, getTeamIssues } from '../data/jira/issues';
import { getCached, setCache } from '../data/cache';
import { average, calculateDelta, calculateConfidence, groupBy } from '../utils/calculations';
import { summarizeExpertise } from '../utils/formatting';

/**
 * Analyze strength patterns for a user
 */
export async function analyzeStrengthPatterns(
  accountId: string,
  compareToTeam: boolean = true
): Promise<StrengthAnalysis> {
  // Check cache
  const cacheKey = { namespace: 'strengths' as const, accountId };
  const cached = await getCached<StrengthAnalysis>(cacheKey, 24);

  if (cached) {
    return cached;
  }

  // Fetch user data
  const userIssues = await getUserIssuesWithMetrics(accountId, 180);

  if (userIssues.length < 10) {
    return createInsufficientDataResponse(accountId, userIssues.length);
  }

  // Analyze by ticket type
  const ticketTypes = await analyzeByTicketType(userIssues, accountId, compareToTeam);

  // Analyze by component
  const components = await analyzeByComponent(userIssues, accountId, compareToTeam);

  // Generate recommendations
  const recommendations = generateStrengthRecommendations(ticketTypes, components);

  const analysis: StrengthAnalysis = {
    accountId,
    ticketTypes,
    components,
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
 * Analyze performance by ticket type
 */
async function analyzeByTicketType(
  userIssues: any[],
  accountId: string,
  compareToTeam: boolean
): Promise<Record<string, StrengthMetric>> {
  // Group by issue type
  const typeGroups = groupBy(userIssues, 'issueType');

  const result: Record<string, StrengthMetric> = {};

  // Calculate user metrics per type
  for (const [type, issues] of Object.entries(typeGroups)) {
    const cycleTimes = issues
      .filter(i => i.metrics && i.metrics.cycleTimeDays > 0)
      .map(i => i.metrics.cycleTimeDays);

    const qualityScores = issues.map(i => calculateIssueQuality(i));

    const userAvg = cycleTimes.length > 0 ? average(cycleTimes) : 0;
    const qualityScore = average(qualityScores);

    let teamAvg = userAvg;
    let delta = 0;

    // Compare to team if requested
    if (compareToTeam && issues.length > 0) {
      const projectKeys = [...new Set(issues.map((i: any) => i.project))];
      try {
        const teamIssues = await getTeamIssues(projectKeys, 180);
        const teamTypeIssues = teamIssues.filter(i => i.issueType === type);

        if (teamTypeIssues.length > 5) {
          // Only compare if team has sufficient data
          const teamCycleTimes = await Promise.all(
            teamTypeIssues.map(async i => {
              // Simplified: use resolved-created as proxy for cycle time
              if (i.resolved && i.created) {
                return (i.resolved.getTime() - i.created.getTime()) / (1000 * 60 * 60 * 24);
              }
              return null;
            })
          );

          const validTeamCycleTimes = teamCycleTimes.filter(t => t !== null && t > 0) as number[];
          if (validTeamCycleTimes.length > 0) {
            teamAvg = average(validTeamCycleTimes);
            delta = calculateDelta(userAvg, teamAvg);
          }
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
      }
    }

    result[type] = {
      type,
      userAvg,
      teamAvg: compareToTeam ? teamAvg : undefined,
      delta,
      count: issues.length,
      qualityScore
    };
  }

  return result;
}

/**
 * Analyze performance by component
 */
async function analyzeByComponent(
  userIssues: any[],
  accountId: string,
  compareToTeam: boolean
): Promise<Record<string, ComponentStrength>> {
  // Flatten components (issues can have multiple components)
  const issuesByComponent: Record<string, any[]> = {};

  for (const issue of userIssues) {
    if (issue.components && issue.components.length > 0) {
      for (const component of issue.components) {
        if (!issuesByComponent[component]) {
          issuesByComponent[component] = [];
        }
        issuesByComponent[component].push(issue);
      }
    } else {
      // Issues without components
      if (!issuesByComponent['No Component']) {
        issuesByComponent['No Component'] = [];
      }
      issuesByComponent['No Component'].push(issue);
    }
  }

  const result: Record<string, ComponentStrength> = {};

  for (const [component, issues] of Object.entries(issuesByComponent)) {
    const cycleTimes = issues
      .filter(i => i.metrics && i.metrics.cycleTimeDays > 0)
      .map(i => i.metrics.cycleTimeDays);

    const qualityScores = issues.map(i => calculateIssueQuality(i));

    const userAvg = cycleTimes.length > 0 ? average(cycleTimes) : 0;
    const qualityScore = average(qualityScores);

    let teamAvg = userAvg;

    // Compare to team if requested
    if (compareToTeam && issues.length > 0) {
      const projectKeys = [...new Set(issues.map((i: any) => i.project))];
      try {
        const teamIssues = await getTeamIssues(projectKeys, 180);
        const teamComponentIssues = teamIssues.filter(i =>
          i.components && i.components.includes(component)
        );

        if (teamComponentIssues.length > 5) {
          const teamCycleTimes = await Promise.all(
            teamComponentIssues.map(async i => {
              if (i.resolved && i.created) {
                return (i.resolved.getTime() - i.created.getTime()) / (1000 * 60 * 60 * 24);
              }
              return null;
            })
          );

          const validTeamCycleTimes = teamCycleTimes.filter(t => t !== null && t > 0) as number[];
          if (validTeamCycleTimes.length > 0) {
            teamAvg = average(validTeamCycleTimes);
          }
        }
      } catch (error) {
        console.error('Error fetching team component data:', error);
      }
    }

    const expertise = summarizeExpertise(issues.length, qualityScore);

    result[component] = {
      component,
      userAvg,
      teamAvg: compareToTeam ? teamAvg : undefined,
      count: issues.length,
      expertise,
      qualityScore
    };
  }

  return result;
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
 * Generate strength recommendations
 */
function generateStrengthRecommendations(
  ticketTypes: Record<string, StrengthMetric>,
  components: Record<string, ComponentStrength>
): string[] {
  const recommendations: string[] = [];

  // Find top strengths by ticket type
  const types = Object.values(ticketTypes)
    .filter(t => t.count >= 3) // Only consider types with sufficient data
    .sort((a, b) => a.delta - b.delta); // Sort by delta (negative = faster = strength)

  if (types.length > 0) {
    const topStrength = types[0];
    if (topStrength.delta < -10) {
      recommendations.push(
        `You excel at ${topStrength.type} tickets (${Math.abs(topStrength.delta).toFixed(0)}% faster than team average)`
      );
      recommendations.push(
        `Consider picking up ${topStrength.type} tickets when available`
      );
    }

    // Find weaknesses
    const bottomTypes = types.slice(-2);
    for (const weak of bottomTypes) {
      if (weak.delta > 15 && weak.count >= 3) {
        recommendations.push(
          `${weak.type} tickets take you ${weak.delta.toFixed(0)}% longer - consider pairing with someone on these`
        );
      }
    }
  }

  // Find expert components
  const expertComponents = Object.values(components)
    .filter(c => c.expertise === 'expert' || c.expertise === 'strong')
    .sort((a, b) => b.count - a.count);

  if (expertComponents.length > 0) {
    const top = expertComponents[0];
    recommendations.push(
      `You're ${top.expertise === 'expert' ? 'an expert' : 'strong'} in ${top.component} (${top.count} tickets completed)`
    );
  }

  // Find developing areas
  const developingComponents = Object.values(components)
    .filter(c => c.expertise === 'developing' || c.expertise === 'avoid')
    .sort((a, b) => a.qualityScore - b.qualityScore);

  if (developingComponents.length > 0 && developingComponents[0].expertise === 'avoid') {
    const weak = developingComponents[0];
    recommendations.push(
      `${weak.component} has been challenging - consider getting support when working on it`
    );
  }

  return recommendations;
}

/**
 * Create response for insufficient data
 */
function createInsufficientDataResponse(accountId: string, dataPoints: number): StrengthAnalysis {
  return {
    accountId,
    ticketTypes: {},
    components: {},
    recommendations: [
      `Currently have ${dataPoints} data points, need at least 10 for strength analysis`,
      'Complete more tickets across different types and components',
      'Check back in a few weeks for personalized insights'
    ],
    confidence: 'low',
    dataPoints,
    lastUpdated: new Date()
  };
}
