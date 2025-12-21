/**
 * Pit Crew Analytics Analyzer
 * Analyzes team collaboration patterns and chemistry
 * F1 Theme: Pit Crew Performance
 */

import {
  PitCrewAnalysis,
  TeamMateProfile,
  CollaborationEdge,
  ChemistryScore
} from '../models/analysis';
import { getUserIssuesWithMetrics } from '../data/jira/issues';
import { getCached, setCache } from '../data/cache';
import { average } from '../utils/calculations';

/**
 * Analyze pit crew (team collaboration) patterns
 */
export async function analyzePitCrewPatterns(accountId: string): Promise<PitCrewAnalysis> {
  // Check cache
  const cacheKey = { namespace: 'pitcrew' as const, accountId };
  const cached = await getCached<PitCrewAnalysis>(cacheKey, 24); // 24 hour TTL

  if (cached) {
    return cached;
  }

  // Fetch user's issues from last 6 months
  const userIssues = await getUserIssuesWithMetrics(accountId, 180);

  if (userIssues.length < 10) {
    return createInsufficientDataResponse(accountId, userIssues.length);
  }

  // Extract collaboration data
  const collaborationData = extractCollaborationData(userIssues, accountId);

  // Build teammate profiles
  const teammates = buildTeammateProfiles(collaborationData);

  // Calculate chemistry scores
  const chemistryScores = calculateChemistryScores(collaborationData, userIssues);

  // Build collaboration network
  const collaborationNetwork = buildCollaborationNetwork(accountId, teammates, chemistryScores);

  // Calculate team metrics
  const teamMetrics = calculateTeamMetrics(teammates, chemistryScores, collaborationData);

  // Generate recommendations
  const recommendations = generatePitCrewRecommendations(teammates, chemistryScores, teamMetrics);

  const analysis: PitCrewAnalysis = {
    accountId,
    teammates,
    collaborationNetwork,
    chemistryScores,
    teamMetrics,
    recommendations,
    confidence: userIssues.length > 50 ? 'high' : userIssues.length > 25 ? 'medium' : 'low',
    dataPoints: userIssues.length,
    lastUpdated: new Date()
  };

  // Cache result
  await setCache(cacheKey, analysis, 24);

  return analysis;
}

/**
 * Extract collaboration signals from issues
 */
function extractCollaborationData(issues: any[], currentUserId: string): Map<string, any> {
  const collaborations = new Map<string, any>();

  issues.forEach(issue => {
    // Track assignee if different from current user (reassignments = collaboration)
    if (issue.assigneeAccountId && issue.assigneeAccountId !== currentUserId) {
      const key = issue.assigneeAccountId;
      if (!collaborations.has(key)) {
        collaborations.set(key, {
          accountId: issue.assigneeAccountId,
          displayName: issue.assignee,
          sharedIssues: [],
          cycleTimes: []
        });
      }
      const data = collaborations.get(key);
      data.sharedIssues.push(issue.key);
      if (issue.metrics && issue.metrics.cycleTimeDays > 0) {
        data.cycleTimes.push(issue.metrics.cycleTimeDays);
      }
    }

    // Note: In a full implementation, we'd also parse:
    // - Comments for @mentions
    // - Watchers list
    // - Issue links
    // - PR reviewers (from Bitbucket)
  });

  return collaborations;
}

/**
 * Build teammate profiles
 */
function buildTeammateProfiles(collaborationData: Map<string, any>): TeamMateProfile[] {
  const profiles: TeamMateProfile[] = [];

  collaborationData.forEach((data, accountId) => {
    profiles.push({
      accountId,
      displayName: data.displayName || 'Unknown',
      collaborationCount: data.sharedIssues.length,
      sharedIssues: data.sharedIssues.length,
      mentionCount: 0 // Placeholder - would need comment parsing
    });
  });

  // Sort by collaboration count
  profiles.sort((a, b) => b.collaborationCount - a.collaborationCount);

  // Return top 10
  return profiles.slice(0, 10);
}

/**
 * Calculate chemistry scores with teammates
 */
function calculateChemistryScores(
  collaborationData: Map<string, any>,
  allIssues: any[]
): Record<string, ChemistryScore> {
  const scores: Record<string, ChemistryScore> = {};

  // Calculate user's solo cycle time average
  const soloCycleTimes = allIssues
    .filter(i => i.metrics && i.metrics.cycleTimeDays > 0)
    .map(i => i.metrics.cycleTimeDays);
  const soloAvg = soloCycleTimes.length > 0 ? average(soloCycleTimes) : 10;

  collaborationData.forEach((data, accountId) => {
    const collaborationAvg = data.cycleTimes.length > 0
      ? average(data.cycleTimes)
      : soloAvg;

    // Calculate speed multiplier (lower cycle time = faster = better)
    const speedMultiplier = soloAvg > 0 ? soloAvg / collaborationAvg : 1.0;

    // Calculate chemistry score (0-100)
    let score = 50; // baseline

    // Boost for faster completion
    if (speedMultiplier > 1.2) {
      score += 30;
    } else if (speedMultiplier > 1.0) {
      score += 15;
    } else if (speedMultiplier < 0.8) {
      score -= 20;
    }

    // Boost for frequency of collaboration
    if (data.sharedIssues.length > 10) {
      score += 20;
    } else if (data.sharedIssues.length > 5) {
      score += 10;
    }

    score = Math.max(0, Math.min(100, score));

    // Determine rating
    let rating: 'excellent' | 'good' | 'neutral' | 'needs-work';
    if (score >= 80) rating = 'excellent';
    else if (score >= 60) rating = 'good';
    else if (score >= 40) rating = 'neutral';
    else rating = 'needs-work';

    scores[accountId] = {
      teammate: accountId,
      displayName: data.displayName || 'Unknown',
      score,
      speedMultiplier,
      collaborations: data.sharedIssues.length,
      rating
    };
  });

  return scores;
}

/**
 * Build collaboration network graph
 */
function buildCollaborationNetwork(
  currentUserId: string,
  teammates: TeamMateProfile[],
  chemistryScores: Record<string, ChemistryScore>
): CollaborationEdge[] {
  const edges: CollaborationEdge[] = [];

  teammates.forEach(teammate => {
    const chemistry = chemistryScores[teammate.accountId];
    if (!chemistry) return;

    edges.push({
      from: currentUserId,
      to: teammate.accountId,
      strength: chemistry.score / 100,
      issueCount: teammate.sharedIssues,
      avgCycleTime: 0 // Placeholder
    });
  });

  return edges;
}

/**
 * Calculate team metrics
 */
function calculateTeamMetrics(
  teammates: TeamMateProfile[],
  chemistryScores: Record<string, ChemistryScore>,
  collaborationData: Map<string, any>
): any {
  // Find best chemistry
  let bestChemistry: { teammate: string; displayName: string; speedup: number } | undefined;
  let bestScore = 0;

  Object.values(chemistryScores).forEach(chemistry => {
    if (chemistry.score > bestScore && chemistry.speedMultiplier > 1.0) {
      bestScore = chemistry.score;
      bestChemistry = {
        teammate: chemistry.teammate,
        displayName: chemistry.displayName,
        speedup: (chemistry.speedMultiplier - 1) * 100
      };
    }
  });

  // Calculate average collaboration cycle time
  let allCycleTimes: number[] = [];
  collaborationData.forEach(data => {
    allCycleTimes = allCycleTimes.concat(data.cycleTimes);
  });
  const avgCollaborationCycleTime = allCycleTimes.length > 0
    ? average(allCycleTimes)
    : 0;

  return {
    avgCollaborationCycleTime,
    fastestUnblocker: teammates.length > 0 ? teammates[0] : undefined,
    bestPair: bestChemistry,
    totalCollaborations: teammates.reduce((sum, t) => sum + t.collaborationCount, 0)
  };
}

/**
 * Generate pit crew recommendations
 */
function generatePitCrewRecommendations(
  teammates: TeamMateProfile[],
  chemistryScores: Record<string, ChemistryScore>,
  teamMetrics: any
): string[] {
  const recommendations: string[] = [];

  if (teammates.length === 0) {
    recommendations.push('👥 No collaboration data yet');
    recommendations.push('   → Work with teammates on shared issues');
    recommendations.push('   → Use @mentions in comments');
    return recommendations;
  }

  recommendations.push(`👥 PIT CREW: ${teammates.length} active collaborators detected`);

  // Best chemistry recommendation
  if (teamMetrics.bestPair) {
    recommendations.push(
      `⚡ BEST CHEMISTRY: ${teamMetrics.bestPair.displayName} (${teamMetrics.bestPair.speedup.toFixed(0)}% faster together)`
    );
    recommendations.push('   → Pair with them on complex or high-priority work');
  }

  // Top collaborators
  if (teammates.length > 0) {
    const topTeammate = teammates[0];
    recommendations.push(`🤝 TOP COLLABORATOR: ${topTeammate.displayName} (${topTeammate.collaborationCount} shared issues)`);
  }

  // Chemistry insights
  const excellentChemistry = Object.values(chemistryScores).filter(c => c.rating === 'excellent');
  if (excellentChemistry.length > 0) {
    recommendations.push(`✨ ${excellentChemistry.length} teammates with excellent chemistry`);
    recommendations.push('   → Leverage these partnerships for critical work');
  }

  return recommendations;
}

/**
 * Create response for insufficient data
 */
function createInsufficientDataResponse(accountId: string, dataPoints: number): PitCrewAnalysis {
  return {
    accountId,
    teammates: [],
    collaborationNetwork: [],
    chemistryScores: {},
    teamMetrics: {
      avgCollaborationCycleTime: 0,
      totalCollaborations: 0
    },
    recommendations: [
      `Need more data for pit crew analysis (have ${dataPoints}, need 10+)`,
      'Work with teammates on issues to build collaboration history',
      'Full analysis available after more team interactions'
    ],
    confidence: 'low',
    dataPoints,
    lastUpdated: new Date()
  };
}
