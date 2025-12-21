/**
 * Bitbucket Commit and Pull Request Models
 * Data structures for Git commits and code review activity
 */

export interface Commit {
  hash: string;
  author: string;
  authorEmail: string;
  timestamp: Date;
  message: string;
  repository: string;
  filesChanged: number;
  linesAdded: number;
  linesDeleted: number;
  isFixCommit?: boolean;
  isMergeCommit?: boolean;
  linkedIssues?: string[];
}

export interface PullRequest {
  id: number;
  title: string;
  description?: string;
  author: string;
  authorAccountId: string;
  created: Date;
  updated: Date;
  merged?: Date;
  closed?: Date;
  state: 'OPEN' | 'MERGED' | 'DECLINED' | 'SUPERSEDED';
  reviewers: Reviewer[];
  repository: string;
  sourceBranch: string;
  destinationBranch: string;
  commitsCount: number;
  linkedIssues?: string[];
}

export interface Reviewer {
  accountId: string;
  displayName: string;
  approved: boolean;
  changesRequested: boolean;
  commented: boolean;
  reviewedAt?: Date;
}

export interface PullRequestMetrics {
  prId: number;
  reviewDurationHours: number;
  timeToFirstReviewHours: number;
  numberOfReviewCycles: number;
  approved: boolean;
  changesRequested: boolean;
  fastestReviewer?: string;
  slowestReviewer?: string;
}

export interface CodeActivity {
  commits: Commit[];
  pullRequests: PullRequest[];
  timeRange: {
    start: Date;
    end: Date;
  };
}
