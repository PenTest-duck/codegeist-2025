/**
 * Sprint Predictions Analyzer
 * ML-powered sprint forecasting and risk assessment
 * F1 Theme: Race Strategy
 */

import { SprintPrediction, TicketRisk, WhatIfScenario } from '../models/analysis';
import { getActiveIssues, getUserIssuesWithMetrics } from '../data/jira/issues';
import { getCached, setCache } from '../data/cache';
import { average } from '../utils/calculations';

/**
 * Predict sprint completion using Monte Carlo simulation
 */
export async function predictSprintCompletion(accountId: string): Promise<SprintPrediction> {
  // Check cache
  const cacheKey = { namespace: 'predictions' as const, accountId };
  const cached = await getCached<SprintPrediction>(cacheKey, 1); // 1 hour TTL

  if (cached) {
    return cached;
  }

  // Get active tickets (current "sprint")
  const activeTickets = await getActiveIssues(accountId);

  // Get historical data for cycle time predictions
  const historicalIssues = await getUserIssuesWithMetrics(accountId, 90);

  if (historicalIssues.length < 5) {
    return createInsufficientDataResponse(accountId, historicalIssues.length);
  }

  // Calculate historical cycle times
  const cycleTimes = historicalIssues
    .filter(i => i.metrics && i.metrics.cycleTimeDays > 0)
    .map(i => i.metrics.cycleTimeDays);

  if (cycleTimes.length === 0) {
    return createInsufficientDataResponse(accountId, 0);
  }

  // Calculate current velocity (tickets per week)
  const recentCompletions = historicalIssues
    .filter(i => i.resolved)
    .filter(i => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(i.resolved!) >= weekAgo;
    });

  const currentVelocity = recentCompletions.length;

  // Estimate days remaining (assuming 2-week sprint)
  const daysRemaining = 10; // Simplified - would calculate from actual sprint dates

  // Run Monte Carlo simulation
  const simResults = runMonteCarloSimulation(
    activeTickets.length,
    cycleTimes,
    daysRemaining,
    1000 // iterations
  );

  // Identify at-risk tickets
  const atRiskTickets = identifyAtRiskTickets(activeTickets, cycleTimes, daysRemaining);

  // Generate what-if scenarios
  const whatIfScenarios = generateWhatIfScenarios(
    activeTickets.length,
    cycleTimes,
    daysRemaining
  );

  // Generate recommendations
  const recommendations = generatePredictionRecommendations(
    simResults.completionProbability,
    atRiskTickets,
    activeTickets.length,
    daysRemaining
  );

  const prediction: SprintPrediction = {
    accountId,
    sprintName: 'Current Sprint',
    predictions: {
      completionProbability: simResults.completionProbability,
      expectedTicketsCompleted: simResults.expectedCompleted,
      confidenceInterval: simResults.confidenceInterval,
      atRiskTickets
    },
    currentState: {
      totalTickets: activeTickets.length,
      completedTickets: 0, // Would track from sprint start
      remainingTickets: activeTickets.length,
      daysRemaining,
      currentVelocity
    },
    whatIfScenarios,
    recommendations,
    confidence: historicalIssues.length > 30 ? 'high' : historicalIssues.length > 15 ? 'medium' : 'low',
    lastUpdated: new Date()
  };

  // Cache result
  await setCache(cacheKey, prediction, 1);

  return prediction;
}

/**
 * Run Monte Carlo simulation for completion probability
 */
function runMonteCarloSimulation(
  ticketCount: number,
  historicalCycleTimes: number[],
  daysAvailable: number,
  iterations: number
): {
  completionProbability: number;
  expectedCompleted: number;
  confidenceInterval: { low: number; high: number };
} {
  const results: number[] = [];

  for (let i = 0; i < iterations; i++) {
    let daysUsed = 0;
    let completed = 0;

    for (let ticket = 0; ticket < ticketCount; ticket++) {
      // Randomly sample a cycle time from historical data
      const randomCycleTime = historicalCycleTimes[
        Math.floor(Math.random() * historicalCycleTimes.length)
      ];

      daysUsed += randomCycleTime;

      if (daysUsed <= daysAvailable) {
        completed++;
      } else {
        break;
      }
    }

    results.push(completed);
  }

  // Calculate statistics
  const expectedCompleted = average(results);
  const completionProbability = results.filter(r => r === ticketCount).length / iterations;

  // Calculate 80% confidence interval
  results.sort((a, b) => a - b);
  const lowIndex = Math.floor(iterations * 0.1);
  const highIndex = Math.floor(iterations * 0.9);
  const confidenceInterval = {
    low: results[lowIndex],
    high: results[highIndex]
  };

  return {
    completionProbability,
    expectedCompleted: Math.round(expectedCompleted),
    confidenceInterval
  };
}

/**
 * Identify tickets at risk of not completing
 */
function identifyAtRiskTickets(
  activeTickets: any[],
  historicalCycleTimes: number[],
  daysRemaining: number
): TicketRisk[] {
  const avgCycleTime = average(historicalCycleTimes);
  const risks: TicketRisk[] = [];

  // Simplified risk assessment
  activeTickets.forEach((ticket, index) => {
    // Estimate time to reach this ticket (assuming sequential)
    const estimatedDaysToStart = index * avgCycleTime;
    const estimatedDaysToComplete = estimatedDaysToStart + avgCycleTime;

    if (estimatedDaysToComplete > daysRemaining) {
      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      const overage = estimatedDaysToComplete - daysRemaining;

      if (overage > avgCycleTime * 2) {
        riskLevel = 'critical';
      } else if (overage > avgCycleTime) {
        riskLevel = 'high';
      } else if (overage > avgCycleTime * 0.5) {
        riskLevel = 'medium';
      } else {
        riskLevel = 'low';
      }

      risks.push({
        issueKey: ticket.key,
        summary: ticket.summary || 'No summary',
        riskLevel,
        estimatedDaysRemaining: Math.ceil(avgCycleTime),
        factors: [
          `Estimated ${avgCycleTime.toFixed(1)} days to complete`,
          `Only ${daysRemaining} days left in sprint`,
          `Queue position: ${index + 1} of ${activeTickets.length}`
        ],
        recommendedAction: riskLevel === 'critical'
          ? 'Move to next sprint immediately'
          : riskLevel === 'high'
          ? 'Consider deferring to next sprint'
          : 'Monitor closely'
      });
    }
  });

  return risks;
}

/**
 * Generate what-if scenarios
 */
function generateWhatIfScenarios(
  currentTickets: number,
  historicalCycleTimes: number[],
  daysRemaining: number
): WhatIfScenario[] {
  const scenarios: WhatIfScenario[] = [];

  // Scenario 1: Add 1 ticket
  const addOneResult = runMonteCarloSimulation(currentTickets + 1, historicalCycleTimes, daysRemaining, 500);
  scenarios.push({
    scenario: 'Add 1 more ticket',
    impact: `Completion probability drops to ${(addOneResult.completionProbability * 100).toFixed(0)}%`,
    completionProbability: addOneResult.completionProbability,
    recommendation: addOneResult.completionProbability > 0.7 ? 'safe' : addOneResult.completionProbability > 0.5 ? 'risky' : 'avoid'
  });

  // Scenario 2: Add 2 tickets
  const addTwoResult = runMonteCarloSimulation(currentTickets + 2, historicalCycleTimes, daysRemaining, 500);
  scenarios.push({
    scenario: 'Add 2 more tickets',
    impact: `Completion probability drops to ${(addTwoResult.completionProbability * 100).toFixed(0)}%`,
    completionProbability: addTwoResult.completionProbability,
    recommendation: addTwoResult.completionProbability > 0.7 ? 'safe' : addTwoResult.completionProbability > 0.5 ? 'risky' : 'avoid'
  });

  // Scenario 3: Remove 1 ticket
  if (currentTickets > 1) {
    const removeOneResult = runMonteCarloSimulation(currentTickets - 1, historicalCycleTimes, daysRemaining, 500);
    scenarios.push({
      scenario: 'Remove 1 ticket',
      impact: `Completion probability increases to ${(removeOneResult.completionProbability * 100).toFixed(0)}%`,
      completionProbability: removeOneResult.completionProbability,
      recommendation: 'safe'
    });
  }

  return scenarios;
}

/**
 * Generate prediction recommendations
 */
function generatePredictionRecommendations(
  completionProbability: number,
  atRiskTickets: TicketRisk[],
  totalTickets: number,
  daysRemaining: number
): string[] {
  const recommendations: string[] = [];
  const probPercent = (completionProbability * 100).toFixed(0);

  if (completionProbability >= 0.8) {
    recommendations.push(`🏁 RACE STRATEGY: ${probPercent}% chance of completing all tickets`);
    recommendations.push('   → You\'re on track for a clean finish');
    recommendations.push('   → Maintain current pace');
  } else if (completionProbability >= 0.5) {
    recommendations.push(`⚠️ RACE STRATEGY: ${probPercent}% chance of completing all tickets`);
    recommendations.push('   → Sprint completion is at risk');
    recommendations.push('   → Focus on highest priority tickets');
    recommendations.push('   → Consider deferring low-priority work');
  } else {
    recommendations.push(`🚨 RACE STRATEGY: ${probPercent}% chance of completing all tickets`);
    recommendations.push('   → Sprint goals unlikely to be met');
    recommendations.push('   → Immediate scope adjustment needed');
    recommendations.push('   → Move non-critical tickets to next sprint');
  }

  if (atRiskTickets.length > 0) {
    const critical = atRiskTickets.filter(t => t.riskLevel === 'critical').length;
    const high = atRiskTickets.filter(t => t.riskLevel === 'high').length;

    recommendations.push(`📊 AT-RISK TICKETS: ${atRiskTickets.length} total`);
    if (critical > 0) {
      recommendations.push(`   → ${critical} critical risk (very unlikely to complete)`);
    }
    if (high > 0) {
      recommendations.push(`   → ${high} high risk (may not complete)`);
    }
  }

  return recommendations;
}

/**
 * Create response for insufficient data
 */
function createInsufficientDataResponse(accountId: string, dataPoints: number): SprintPrediction {
  return {
    accountId,
    predictions: {
      completionProbability: 0.5,
      expectedTicketsCompleted: 0,
      confidenceInterval: { low: 0, high: 0 },
      atRiskTickets: []
    },
    currentState: {
      totalTickets: 0,
      completedTickets: 0,
      remainingTickets: 0,
      daysRemaining: 0,
      currentVelocity: 0
    },
    whatIfScenarios: [],
    recommendations: [
      `Need more data for sprint predictions (have ${dataPoints}, need 5+)`,
      'Complete more tickets to build historical data',
      'Predictions improve with more completed work'
    ],
    confidence: 'low',
    lastUpdated: new Date()
  };
}
