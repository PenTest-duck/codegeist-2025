/**
 * Analysis Result Models
 * Output structures for each intelligence module
 */

import { DayPattern } from './metrics';

// Re-export DayPattern for use in analyzers
export { DayPattern };

export interface TimingAnalysis {
  accountId: string;
  peakWindow: {
    start: number; // hour (0-23)
    end: number;   // hour (0-23)
    qualityMultiplier: number;
    description: string;
  };
  dangerZone?: {
    start: number;
    end: number;
    revertMultiplier: number;
    description: string;
  };
  dayPatterns: Record<string, DayPattern>;
  recommendations: string[];
  confidence: 'high' | 'medium' | 'low';
  dataPoints: number;
  lastUpdated: Date;
}

export interface StrengthAnalysis {
  accountId: string;
  ticketTypes: Record<string, StrengthMetric>;
  components: Record<string, ComponentStrength>;
  recommendations: string[];
  confidence: 'high' | 'medium' | 'low';
  dataPoints: number;
  lastUpdated: Date;
}

export interface StrengthMetric {
  type: string;
  userAvg: number;
  teamAvg?: number;
  delta: number; // negative = strength, positive = weakness
  count: number;
  qualityScore: number;
}

export interface ComponentStrength {
  component: string;
  userAvg: number;
  teamAvg?: number;
  count: number;
  expertise: 'expert' | 'strong' | 'average' | 'developing' | 'avoid';
  qualityScore: number;
}

export interface CollaborationAnalysis {
  accountId: string;
  bestReviewers: ReviewerProfile[];
  reviewerStats: Record<string, ReviewerStats>;
  pairEffectiveness: Record<string, PairMetrics>;
  recommendations: string[];
  confidence: 'high' | 'medium' | 'low';
  dataPoints: number;
  lastUpdated: Date;
}

export interface ReviewerProfile {
  accountId: string;
  displayName: string;
  avgReviewTimeDays: number;
  approvalRate: number;
  changesRequestedRate: number;
  totalReviews: number;
  rating: 'excellent' | 'good' | 'average' | 'slow';
}

export interface ReviewerStats {
  accountId: string;
  displayName: string;
  totalReviews: number;
  avgReviewTimeHours: number;
  approvalRate: number;
  thoroughnessScore: number;
}

export interface PairMetrics {
  partnerAccountId: string;
  partnerName: string;
  speedMultiplier: number;
  qualityMultiplier: number;
  collaborationCount: number;
}

export interface LoadAnalysis {
  accountId: string;
  optimalRange: {
    min: number;
    max: number;
  };
  loadCurve: Record<number, LoadPoint>;
  currentLoad: number;
  currentStatus: 'under' | 'optimal' | 'over' | 'critical';
  recommendations: string[];
  confidence: 'high' | 'medium' | 'low';
  dataPoints: number;
  lastUpdated: Date;
}

export interface LoadPoint {
  load: number;
  cycleTime: number;
  defectRate: number;
  completionRate: number;
  score: number; // composite score
}

export interface TrendAnalysis {
  accountId: string;
  velocityTrend: TrendData[];
  qualityTrend: TrendData[];
  skillsEvolution: SkillEvolution[];
  periodComparison: {
    current: PeriodMetrics;
    previous: PeriodMetrics;
    delta: Record<string, number>;
  };
  recommendations: string[];
  confidence: 'high' | 'medium' | 'low';
  dataPoints: number;
  lastUpdated: Date;
}

export interface TrendData {
  period: string; // sprint name or month
  startDate: Date;
  endDate: Date;
  value: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SkillEvolution {
  skill: string; // technology, ticket type, or component
  currentLevel: number;
  previousLevel: number;
  growth: number;
  trend: 'growing' | 'declining' | 'stable';
}

export interface PeriodMetrics {
  period: string;
  issuesCompleted: number;
  storyPoints: number;
  avgCycleTime: number;
  qualityScore: number;
  defectRate: number;
}

export interface CurrentStatus {
  accountId: string;
  activeTickets: number;
  currentTimeZone: 'peak' | 'normal' | 'danger';
  loadStatus: 'under' | 'optimal' | 'over' | 'critical';
  sprintProgress: {
    completed: number;
    remaining: number;
    percentComplete: number;
    onTrack: boolean;
  };
  todayRecommendations: string[];
  timestamp: Date;
  // Enhanced timing data for gauges
  timingData?: {
    currentHour: number;
    peakWindow: {
      start: number;
      end: number;
    };
    dangerZone?: {
      start: number;
      end: number;
    };
  };
  // Enhanced load data for gauges
  loadData?: {
    optimalMin: number;
    optimalMax: number;
    currentLoad: number;
  };
  // Velocity data for speed gauge
  velocityData?: {
    current: number;        // tickets completed in last 7 days
    weeklyAvg: number;      // 30-day rolling average
    monthlyTotal: number;   // last 30 days total
    status: 'below' | 'on-pace' | 'above';
  };
  // Burnout data for engine temperature gauge
  burnoutData?: {
    burnoutScore: number;
    riskLevel: 'healthy' | 'warning' | 'high' | 'critical';
    topRiskFactors: string[];
  };
  // Pit crew data for collaboration
  pitCrewData?: {
    topTeammates: Array<{ name: string; collaborations: number }>;
    bestChemistry?: { name: string; speedup: number };
  };
  // Sprint prediction data
  sprintPredictionData?: {
    completionProbability: number;
    expectedCompleted: number;
    atRiskCount: number;
  };
}

export interface RecommendationContext {
  type: 'ticket_selection' | 'timing' | 'reviewer' | 'workload' | 'general';
  specificContext?: Record<string, any>;
}

export interface Recommendation {
  type: string;
  priority: 'high' | 'medium' | 'low';
  message: string;
  reasoning: string;
  actionable: boolean;
  actions?: string[];
}

// ============================================
// BURNOUT DETECTION
// ============================================

export interface BurnoutAnalysis {
  accountId: string;
  burnoutScore: number; // 0-100 (0=healthy, 100=critical)
  riskLevel: 'healthy' | 'warning' | 'high' | 'critical';
  riskFactors: BurnoutRiskFactor[];
  trends: {
    weeklyOverload: number[]; // last 8 weeks, % of time overloaded
    dangerHourWork: number[]; // last 8 weeks, % of work in danger hours
    velocityTrend: number[]; // last 8 weeks, tickets completed
  };
  recommendations: string[];
  recoveryPlan?: string[];
  confidence: 'high' | 'medium' | 'low';
  dataPoints: number;
  lastUpdated: Date;
}

export interface BurnoutRiskFactor {
  factor: 'sustained_overload' | 'danger_hours' | 'declining_velocity' | 'long_cycles' | 'no_breaks';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  weeksAffected: number;
  impact: number; // contribution to burnout score (0-100)
}

// ============================================
// PIT CREW ANALYTICS
// ============================================

export interface PitCrewAnalysis {
  accountId: string;
  teammates: TeamMateProfile[];
  collaborationNetwork: CollaborationEdge[];
  chemistryScores: Record<string, ChemistryScore>;
  teamMetrics: {
    avgCollaborationCycleTime: number;
    fastestUnblocker?: TeamMateProfile;
    bestPair?: { teammate: string; displayName: string; speedup: number };
    totalCollaborations: number;
  };
  recommendations: string[];
  confidence: 'high' | 'medium' | 'low';
  dataPoints: number;
  lastUpdated: Date;
}

export interface TeamMateProfile {
  accountId: string;
  displayName: string;
  avatarUrl?: string;
  collaborationCount: number;
  sharedIssues: number;
  mentionCount: number;
}

export interface CollaborationEdge {
  from: string; // accountId
  to: string;
  strength: number; // 0-1
  issueCount: number;
  avgCycleTime: number;
}

export interface ChemistryScore {
  teammate: string;
  displayName: string;
  score: number; // 0-100
  speedMultiplier: number; // e.g., 1.4 = 40% faster together
  collaborations: number;
  rating: 'excellent' | 'good' | 'neutral' | 'needs-work';
}

// ============================================
// SPRINT PREDICTIONS
// ============================================

export interface SprintPrediction {
  accountId: string;
  sprintId?: string;
  sprintName?: string;
  predictions: {
    completionProbability: number; // 0-1
    expectedTicketsCompleted: number;
    confidenceInterval: { low: number; high: number };
    atRiskTickets: TicketRisk[];
  };
  currentState: {
    totalTickets: number;
    completedTickets: number;
    remainingTickets: number;
    daysRemaining: number;
    currentVelocity: number; // tickets per week
  };
  whatIfScenarios: WhatIfScenario[];
  recommendations: string[];
  confidence: 'high' | 'medium' | 'low';
  lastUpdated: Date;
}

export interface TicketRisk {
  issueKey: string;
  summary: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedDaysRemaining: number;
  factors: string[];
  recommendedAction: string;
}

export interface WhatIfScenario {
  scenario: string; // e.g., "Add 1 more ticket"
  impact: string;
  completionProbability: number;
  recommendation: 'safe' | 'risky' | 'avoid';
}
