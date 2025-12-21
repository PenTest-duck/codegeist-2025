/**
 * Performance Metrics Models
 * Calculated metrics for quality, speed, and productivity
 */

export interface QualityMetrics {
  defectRate: number;
  reopenRate: number;
  revisionRate: number;
  buildSuccessRate: number;
  qualityScore: number; // 0-10 composite score
}

export interface SpeedMetrics {
  avgCycleTimeDays: number;
  avgLeadTimeDays: number;
  avgReviewTimeDays: number;
  velocityPointsPerSprint: number;
}

export interface ProductivityMetrics {
  issuesCompleted: number;
  storyPointsCompleted: number;
  commitsCount: number;
  pullRequestsCount: number;
  activeHoursPerWeek: number;
}

export interface HourlyActivity {
  hour: number; // 0-23
  activities: ActivityEvent[];
  qualityScore: number;
  volume: number;
}

export interface ActivityEvent {
  type: 'commit' | 'issue_update' | 'pr_created' | 'pr_reviewed' | 'comment';
  timestamp: Date;
  quality: number;
  metadata?: Record<string, any>;
}

export interface DayPattern {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  quality: number;
  speed: number;
  volume: number;
}

export interface LoadMetrics {
  concurrentTickets: number;
  avgCycleTime: number;
  defectRate: number;
  completionRate: number;
}

export interface TeamComparison {
  userMetric: number;
  teamAverage: number;
  teamMedian: number;
  percentile: number; // 0-100
  delta: number; // percentage difference from team average
  rank?: number;
}
