/**
 * Recommendation Engine
 * Provides context-aware recommendations based on all intelligence modules
 */

import { Recommendation, RecommendationContext } from '../models/analysis';
import { analyzeTimingPatterns } from './timing';
import { analyzeLoadPatterns } from './load';
import { analyzeStrengthPatterns } from './strengths';
import { getCurrentStatus } from './currentStatus';

/**
 * Get personalized recommendation based on context
 */
export async function getRecommendation(
  accountId: string,
  context: string
): Promise<Recommendation[]> {
  const parsedContext = parseContext(context);

  switch (parsedContext.type) {
    case 'ticket_selection':
      return await getTicketSelectionRecommendation(accountId, parsedContext);

    case 'timing':
      return await getTimingRecommendation(accountId, parsedContext);

    case 'workload':
      return await getWorkloadRecommendation(accountId, parsedContext);

    case 'reviewer':
      return await getReviewerRecommendation(accountId, parsedContext);

    case 'general':
    default:
      return await getGeneralRecommendation(accountId, parsedContext);
  }
}

/**
 * Parse context string into structured context
 */
function parseContext(context: string): RecommendationContext {
  const lower = context.toLowerCase();

  if (lower.includes('ticket') || lower.includes('task') || lower.includes('pick') || lower.includes('choose')) {
    return { type: 'ticket_selection', specificContext: { query: context } };
  }

  if (lower.includes('time') || lower.includes('when') || lower.includes('deploy') || lower.includes('commit')) {
    return { type: 'timing', specificContext: { query: context } };
  }

  if (lower.includes('load') || lower.includes('capacity') || lower.includes('too much') || lower.includes('overload')) {
    return { type: 'workload', specificContext: { query: context } };
  }

  if (lower.includes('review') || lower.includes('reviewer') || lower.includes('who should')) {
    return { type: 'reviewer', specificContext: { query: context } };
  }

  return { type: 'general', specificContext: { query: context } };
}

/**
 * Ticket selection recommendation
 */
async function getTicketSelectionRecommendation(
  accountId: string,
  context: RecommendationContext
): Promise<Recommendation[]> {
  try {
    const [strengths, load, timing] = await Promise.all([
      analyzeStrengthPatterns(accountId),
      analyzeLoadPatterns(accountId),
      analyzeTimingPatterns(accountId)
    ]);

    const recommendations: Recommendation[] = [];

    // Check load first
    if (load.currentStatus === 'over' || load.currentStatus === 'critical') {
      recommendations.push({
        type: 'workload',
        priority: 'high',
        message: 'Complete existing tickets before picking up new work',
        reasoning: `You have ${load.currentLoad} tickets (over your optimal range of ${load.optimalRange.min}-${load.optimalRange.max})`,
        actionable: true,
        actions: ['Focus on completing your current tickets', 'Avoid starting new work until load decreases']
      });
      return recommendations;
    }

    // Suggest ticket types that match strengths
    const topStrengths = Object.values(strengths.ticketTypes)
      .filter(t => t.delta < -10 && t.count >= 3)
      .sort((a, b) => a.delta - b.delta)
      .slice(0, 2);

    if (topStrengths.length > 0) {
      recommendations.push({
        type: 'ticket_selection',
        priority: 'medium',
        message: `Consider ${topStrengths.map(t => t.type).join(' or ')} tickets`,
        reasoning: `These are your strengths - you complete them ${Math.abs(topStrengths[0].delta).toFixed(0)}% faster than average`,
        actionable: true,
        actions: topStrengths.map(t => `Look for ${t.type} tickets in the backlog`)
      });
    }

    // Timing consideration
    const currentHour = new Date().getHours();
    if (currentHour >= timing.peakWindow.start && currentHour < timing.peakWindow.end) {
      recommendations.push({
        type: 'timing',
        priority: 'low',
        message: 'You\'re in your peak window - good time to pick up complex work',
        reasoning: 'Your quality is highest during this time',
        actionable: false
      });
    }

    return recommendations;
  } catch (error) {
    console.error('Error generating ticket selection recommendation:', error);
    return [{
      type: 'general',
      priority: 'low',
      message: 'Unable to analyze - need more historical data',
      reasoning: 'Complete more tickets to enable personalized recommendations',
      actionable: false
    }];
  }
}

/**
 * Timing recommendation
 */
async function getTimingRecommendation(
  accountId: string,
  context: RecommendationContext
): Promise<Recommendation[]> {
  try {
    const timing = await analyzeTimingPatterns(accountId);
    const currentHour = new Date().getHours();

    const recommendations: Recommendation[] = [];

    if (currentHour >= timing.peakWindow.start && currentHour < timing.peakWindow.end) {
      recommendations.push({
        type: 'timing',
        priority: 'high',
        message: '✅ Great time to work on this',
        reasoning: `You're in your peak window (${timing.peakWindow.start}:00-${timing.peakWindow.end}:00)`,
        actionable: true,
        actions: ['Go ahead with complex or critical work']
      });
    } else if (timing.dangerZone && currentHour >= timing.dangerZone.start) {
      recommendations.push({
        type: 'timing',
        priority: 'high',
        message: '⚠️ Consider waiting until tomorrow',
        reasoning: `You're in your danger zone - quality drops by ${((timing.dangerZone.revertMultiplier - 1) * 100).toFixed(0)}%`,
        actionable: true,
        actions: [
          'Save this for tomorrow morning',
          'If urgent, proceed with extra caution and review'
        ]
      });
    } else {
      recommendations.push({
        type: 'timing',
        priority: 'medium',
        message: 'Acceptable time to work',
        reasoning: `Best time would be ${timing.peakWindow.start}:00-${timing.peakWindow.end}:00, but now is okay for regular tasks`,
        actionable: false
      });
    }

    return recommendations;
  } catch (error) {
    console.error('Error generating timing recommendation:', error);
    return [{
      type: 'general',
      priority: 'low',
      message: 'General guidance: Most developers perform best in the morning',
      reasoning: 'Unable to analyze your personal patterns - need more data',
      actionable: false
    }];
  }
}

/**
 * Workload recommendation
 */
async function getWorkloadRecommendation(
  accountId: string,
  context: RecommendationContext
): Promise<Recommendation[]> {
  try {
    const load = await analyzeLoadPatterns(accountId);

    const recommendations: Recommendation[] = [];

    recommendations.push({
      type: 'workload',
      priority: load.currentStatus === 'critical' ? 'high' : 'medium',
      message: load.recommendations[0],
      reasoning: `Current: ${load.currentLoad} tickets, Optimal: ${load.optimalRange.min}-${load.optimalRange.max}`,
      actionable: true,
      actions: load.recommendations.slice(1)
    });

    return recommendations;
  } catch (error) {
    console.error('Error generating workload recommendation:', error);
    return [{
      type: 'general',
      priority: 'low',
      message: 'General guidance: 2-3 concurrent tickets is typical for most developers',
      reasoning: 'Unable to analyze your personal patterns - need more data',
      actionable: false
    }];
  }
}

/**
 * Reviewer recommendation
 */
async function getReviewerRecommendation(
  accountId: string,
  context: RecommendationContext
): Promise<Recommendation[]> {
  // Simplified for MVP - full implementation requires Bitbucket integration
  return [{
    type: 'reviewer',
    priority: 'low',
    message: 'Reviewer recommendations require Bitbucket integration',
    reasoning: 'Enable Bitbucket connection to analyze review patterns',
    actionable: true,
    actions: [
      'Consider who has given you helpful, timely reviews in the past',
      'Look for reviewers familiar with this component',
      'Check who is available and not overloaded'
    ]
  }];
}

/**
 * General recommendation
 */
async function getGeneralRecommendation(
  accountId: string,
  context: RecommendationContext
): Promise<Recommendation[]> {
  try {
    const status = await getCurrentStatus(accountId);

    return [{
      type: 'general',
      priority: 'medium',
      message: status.todayRecommendations[0],
      reasoning: `Current status: ${status.activeTickets} tickets, ${status.currentTimeZone} zone, ${status.loadStatus} load`,
      actionable: true,
      actions: status.todayRecommendations.slice(1)
    }];
  } catch (error) {
    console.error('Error generating general recommendation:', error);
    return [{
      type: 'general',
      priority: 'low',
      message: 'Complete more tickets to enable personalized recommendations',
      reasoning: 'Insufficient historical data for analysis',
      actionable: false
    }];
  }
}
