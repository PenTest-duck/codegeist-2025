/**
 * Jira Issue Models
 * Data structures for Jira issues, changelogs, and metrics
 */

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  issueType: string;
  status: string;
  assignee: string;
  assigneeAccountId: string;
  created: Date;
  updated: Date;
  resolved?: Date;
  storyPoints?: number;
  components: string[];
  labels: string[];
  priority?: string;
  project: string;
  sprint?: string;
}

export interface IssueChangelog {
  id: string;
  issueKey: string;
  timestamp: Date;
  author: string;
  authorAccountId: string;
  field: string;
  fromValue: string;
  toValue: string;
}

export interface IssueMetrics {
  issueKey: string;
  cycleTimeDays: number;
  leadTimeDays: number;
  inProgressDuration: number;
  reviewDuration: number;
  wasReopened: boolean;
  hadDefect: boolean;
  numberOfRevisions: number;
}

export interface IssueWithMetrics extends JiraIssue {
  metrics: IssueMetrics;
  concurrentLoad?: number;
}

export interface SprintData {
  id: string;
  name: string;
  state: 'active' | 'closed' | 'future';
  startDate?: Date;
  endDate?: Date;
  completeDate?: Date;
  goal?: string;
}

export interface UserWorkHistory {
  accountId: string;
  displayName: string;
  issues: IssueWithMetrics[];
  timeRange: {
    start: Date;
    end: Date;
  };
}
