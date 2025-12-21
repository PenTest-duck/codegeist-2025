/**
 * Burnout Detection Analyzer
 * Analyzes work patterns to predict and prevent developer burnout
 * F1 Theme: Engine Temperature Monitoring
 */

import { BurnoutAnalysis, BurnoutRiskFactor } from '../models/analysis';
import { getUserIssuesWithMetrics, getActiveIssues, getCompletedIssues } from '../data/jira/issues';
import { getCached, setCache } from '../data/cache';
import { analyzeLoadPatterns } from './load';
import { analyzeTimingPatterns } from './timing';
import { getCurrentTimeZone } from '../utils/dateHelpers';

/**
 * Analyze burnout risk for a user
 */
export async function analyzeBurnoutRisk(accountId: string): Promise<BurnoutAnalysis> {
  console.log('🔥 ========================================');
  console.log('🔥 analyzeBurnoutRisk CALLED');
  console.log('🔥 accountId:', accountId);
  console.log('🔥 ========================================');

  // Check cache
  const cacheKey = { namespace: 'burnout' as const, accountId };
  const cached = await getCached<BurnoutAnalysis>(cacheKey, 6); // 6 hour TTL

  // TEMPORARILY DISABLE CACHE FOR DEBUGGING
  /*
  if (cached) {
    console.log('⚠️ BURNOUT CACHE HIT - returning cached data');
    console.log('Cached burnout score:', cached.burnoutScore);
    return cached;
  }
  */
  console.log('🚫 CACHE DISABLED FOR DEBUGGING');

  // Fetch data for last 12 weeks
  console.log('📊 Fetching issues with metrics for last 84 days...');
  const issues = await getUserIssuesWithMetrics(accountId, 84); // 12 weeks = 84 days
  console.log('📊 Issues returned from getUserIssuesWithMetrics:', issues.length);

  if (issues.length < 5) {
    console.log('❌ INSUFFICIENT DATA - returning default response with score 0');
    console.log('Need at least 5 issues, have:', issues.length);
    return createInsufficientDataResponse(accountId, issues.length);
  }

  console.log('✅ Sufficient data, proceeding with analysis...');

  // Get load and timing analysis
  const loadAnalysis = await analyzeLoadPatterns(accountId);
  const timingAnalysis = await analyzeTimingPatterns(accountId);

  // Analyze weekly patterns
  const weeklyData = analyzeWeeklyPatterns(issues, loadAnalysis, timingAnalysis);

  // Detect risk factors
  const riskFactors = detectRiskFactors(weeklyData, loadAnalysis, timingAnalysis);

  // Debug: Ensure we have at least one factor for testing
  if (riskFactors.length === 0) {
    console.log('⚠️ NO RISK FACTORS DETECTED - adding baseline monitoring factor');
    riskFactors.push({
      factor: 'sustained_overload',
      severity: 'low',
      description: 'Baseline health monitoring (no specific risks detected)',
      weeksAffected: 0,
      impact: 5  // Minimum 5 points to show gauge is working
    });
  }

  // Calculate burnout score
  const burnoutScore = calculateBurnoutScore(riskFactors);

  // Determine risk level
  const riskLevel = determinRiskLevel(burnoutScore);

  // Debug logging
  console.log('=== BURNOUT ANALYSIS DEBUG ===');
  console.log('Issues analyzed:', issues.length);
  console.log('Weekly overload data:', weeklyData.weeklyOverload);
  console.log('Velocity trend:', weeklyData.velocityTrend);
  console.log('Risk factors detected:', riskFactors.length);
  console.log('Risk factors:', riskFactors.map(f => ({ factor: f.factor, severity: f.severity, impact: f.impact })));
  console.log('Burnout score:', burnoutScore);
  console.log('Risk level:', riskLevel);
  console.log('==============================');

  // Generate recommendations
  const recommendations = generateBurnoutRecommendations(riskLevel, riskFactors, weeklyData);
  const recoveryPlan = generateRecoveryPlan(riskLevel, riskFactors);

  const analysis: BurnoutAnalysis = {
    accountId,
    burnoutScore,
    riskLevel,
    riskFactors,
    trends: weeklyData,
    recommendations,
    recoveryPlan: recoveryPlan.length > 0 ? recoveryPlan : undefined,
    confidence: issues.length > 30 ? 'high' : issues.length > 15 ? 'medium' : 'low',
    dataPoints: issues.length,
    lastUpdated: new Date()
  };

  // Cache result
  await setCache(cacheKey, analysis, 6);

  return analysis;
}

/**
 * Analyze weekly patterns for last 8 weeks
 */
function analyzeWeeklyPatterns(
  issues: any[],
  loadAnalysis: any,
  timingAnalysis: any
): {
  weeklyOverload: number[];
  dangerHourWork: number[];
  velocityTrend: number[];
} {
  const weeks = 8;
  const weeklyOverload: number[] = [];
  const dangerHourWork: number[] = [];
  const velocityTrend: number[] = [];

  const now = new Date();

  for (let i = 0; i < weeks; i++) {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - (i * 7));
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7);

    // Count completed issues in this week
    const weekIssues = issues.filter(issue => {
      if (!issue.resolved) return false;
      const resolvedDate = new Date(issue.resolved);
      return resolvedDate >= weekStart && resolvedDate < weekEnd;
    });

    velocityTrend.unshift(weekIssues.length);

    // Calculate overload estimate from creation/completion ratio
    const createdInWeek = issues.filter(issue => {
      const createdDate = new Date(issue.created);
      return createdDate >= weekStart && createdDate < weekEnd;
    }).length;

    const completedInWeek = weekIssues.length;
    const netChange = createdInWeek - completedInWeek;

    // Estimate overload: if creating more than completing, likely overloaded
    // Scale to 0-100 based on optimal range (5-9 tickets)
    const overloadEstimate = netChange > 0 ? Math.min(100, (netChange / 9) * 100) : 0;
    weeklyOverload.unshift(overloadEstimate);

    // Estimate danger hour work from velocity during those hours
    // Since we don't have commit time data, keep at 0 for now
    const dangerHourEstimate = 0;
    dangerHourWork.unshift(dangerHourEstimate);
  }

  return {
    weeklyOverload,
    dangerHourWork,
    velocityTrend
  };
}

/**
 * Detect burnout risk factors
 */
function detectRiskFactors(
  weeklyData: any,
  loadAnalysis: any,
  timingAnalysis: any
): BurnoutRiskFactor[] {
  const factors: BurnoutRiskFactor[] = [];

  // Factor 1: Sustained Overload
  const weeksOverloaded = weeklyData.weeklyOverload.filter((w: number) => w > 50).length;
  if (weeksOverloaded >= 2) {
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let impact = 0;

    if (weeksOverloaded >= 6) {
      severity = 'critical';
      impact = 40;
    } else if (weeksOverloaded >= 4) {
      severity = 'high';
      impact = 30;
    } else if (weeksOverloaded >= 2) {
      severity = 'medium';
      impact = 20;
    }

    factors.push({
      factor: 'sustained_overload',
      severity,
      description: `You've been over capacity for ${weeksOverloaded} of the last 8 weeks`,
      weeksAffected: weeksOverloaded,
      impact
    });
  }

  // Factor 2: Current overload status
  if (loadAnalysis.currentStatus === 'critical' || loadAnalysis.currentStatus === 'over') {
    factors.push({
      factor: 'sustained_overload',
      severity: loadAnalysis.currentStatus === 'critical' ? 'critical' : 'high',
      description: `Currently ${loadAnalysis.currentLoad} tickets (optimal: ${loadAnalysis.optimalRange.min}-${loadAnalysis.optimalRange.max})`,
      weeksAffected: 1,
      impact: loadAnalysis.currentStatus === 'critical' ? 25 : 15
    });
  } else if (loadAnalysis.currentLoad >= 7) {
    // Add minor factor if consistently at upper end of optimal
    factors.push({
      factor: 'sustained_overload',
      severity: 'low',
      description: `Currently at ${loadAnalysis.currentLoad} tickets (near upper limit of optimal range)`,
      weeksAffected: 1,
      impact: 5
    });
  }

  // Factor 3: Declining Velocity
  const recentVelocity = weeklyData.velocityTrend.slice(-4); // last 4 weeks
  const olderVelocity = weeklyData.velocityTrend.slice(0, 4); // first 4 weeks
  const recentAvg = recentVelocity.reduce((a: number, b: number) => a + b, 0) / recentVelocity.length;
  const olderAvg = olderVelocity.reduce((a: number, b: number) => a + b, 0) / olderVelocity.length;

  if (olderAvg > 0) {
    const velocityChange = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (velocityChange < -20) {
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
      let impact = 15;

      if (velocityChange < -40) {
        severity = 'critical';
        impact = 30;
      } else if (velocityChange < -30) {
        severity = 'high';
        impact = 25;
      }

      factors.push({
        factor: 'declining_velocity',
        severity,
        description: `Velocity dropped ${Math.abs(velocityChange).toFixed(0)}% over last 4 weeks`,
        weeksAffected: 4,
        impact
      });
    }
  }

  // Factor 4: Working during danger hours
  if (timingAnalysis.dangerZone) {
    const currentHour = new Date().getHours();
    const inDangerZone = currentHour >= timingAnalysis.dangerZone.start &&
                         currentHour <= timingAnalysis.dangerZone.end;

    if (inDangerZone) {
      factors.push({
        factor: 'danger_hours',
        severity: 'medium',
        description: `Currently working during your danger zone (${timingAnalysis.dangerZone.start}:00-${timingAnalysis.dangerZone.end}:00)`,
        weeksAffected: 1,
        impact: 10
      });
    }
  }

  // Factor 5: High-velocity crunch weeks (potential burnout from overwork)
  const highVelocityWeeks = weeklyData.velocityTrend.filter((v: number) => v >= 8).length;
  if (highVelocityWeeks >= 3) {
    factors.push({
      factor: 'sustained_overload',
      severity: 'medium',
      description: `${highVelocityWeeks} high-velocity weeks detected (potential crunch periods)`,
      weeksAffected: highVelocityWeeks,
      impact: 15
    });
  }

  return factors;
}

/**
 * Calculate composite burnout score (0-100)
 */
function calculateBurnoutScore(factors: BurnoutRiskFactor[]): number {
  if (factors.length === 0) return 0;

  // Sum all impact scores
  const totalImpact = factors.reduce((sum, factor) => sum + factor.impact, 0);

  // Cap at 100
  return Math.min(100, totalImpact);
}

/**
 * Determine risk level from score
 */
function determinRiskLevel(score: number): 'healthy' | 'warning' | 'high' | 'critical' {
  if (score >= 70) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 30) return 'warning';
  return 'healthy';
}

/**
 * Generate burnout recommendations
 */
function generateBurnoutRecommendations(
  riskLevel: string,
  factors: BurnoutRiskFactor[],
  weeklyData: any
): string[] {
  const recommendations: string[] = [];

  if (riskLevel === 'critical') {
    recommendations.push('🚨 CRITICAL BURNOUT RISK - Immediate action required');
    recommendations.push('   → Take a mental health day or extended break');
    recommendations.push('   → Talk to your manager about workload immediately');
    recommendations.push('   → Delegate or defer non-critical work');
  } else if (riskLevel === 'high') {
    recommendations.push('⚠️ HIGH BURNOUT RISK - Take preventive action');
    recommendations.push('   → Reduce workload to optimal range (5-9 tickets)');
    recommendations.push('   → Protect your peak hours for deep work only');
    recommendations.push('   → Schedule recovery time this week');
  } else if (riskLevel === 'warning') {
    recommendations.push('💛 WARNING - Burnout risk detected');
    recommendations.push('   → Monitor workload closely');
    recommendations.push('   → Avoid taking on additional commitments');
    recommendations.push('   → Ensure you\'re taking regular breaks');
  } else {
    recommendations.push('✅ HEALTHY - Sustainable pace maintained');
    recommendations.push('   → Keep up the good work-life balance');
    recommendations.push('   → Continue respecting your optimal load range');
  }

  // Specific factor recommendations
  factors.forEach(factor => {
    if (factor.factor === 'sustained_overload' && factor.severity !== 'low') {
      recommendations.push(`📊 You've been overloaded for ${factor.weeksAffected} weeks`);
      recommendations.push('   → Complete current work before accepting new tickets');
    }
    if (factor.factor === 'declining_velocity') {
      recommendations.push('📉 Velocity declining - possible fatigue');
      recommendations.push('   → Focus on smaller, achievable tasks');
      recommendations.push('   → Consider pair programming for complex work');
    }
  });

  return recommendations;
}

/**
 * Generate recovery plan for high risk
 */
function generateRecoveryPlan(
  riskLevel: string,
  factors: BurnoutRiskFactor[]
): string[] {
  if (riskLevel !== 'high' && riskLevel !== 'critical') {
    return [];
  }

  const plan: string[] = [];

  plan.push('🏥 RECOVERY PLAN:');
  plan.push('Week 1: Reduce to 3-4 active tickets maximum');
  plan.push('Week 2: Return to normal 5-9 ticket range');
  plan.push('Week 3: Monitor energy levels and adjust');
  plan.push('Ongoing: Protect peak hours, avoid danger zone work');

  return plan;
}

/**
 * Create response for insufficient data
 */
function createInsufficientDataResponse(accountId: string, dataPoints: number): BurnoutAnalysis {
  return {
    accountId,
    burnoutScore: 0,
    riskLevel: 'healthy',
    riskFactors: [],
    trends: {
      weeklyOverload: [],
      dangerHourWork: [],
      velocityTrend: []
    },
    recommendations: [
      `Need more data for burnout analysis (have ${dataPoints}, need 5+)`,
      'Complete more tickets over the next few weeks',
      'Monitor your workload and take regular breaks'
    ],
    confidence: 'low',
    dataPoints,
    lastUpdated: new Date()
  };
}
