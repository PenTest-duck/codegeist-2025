/**
 * Jira Metrics Calculation
 * Calculate performance metrics from issue changelogs
 */

import { jiraClient } from './client';
import { IssueMetrics, IssueChangelog } from '../../models/issue';
import { daysBetween, hoursBetween } from '../../utils/dateHelpers';

/**
 * Calculate metrics for a specific issue
 */
export async function calculateIssueMetrics(issueKey: string): Promise<IssueMetrics> {
  try {
    const changelogData = await jiraClient.getIssueChangelog(issueKey);
    const changelogs = parseChangelogs(issueKey, changelogData);

    const cycleTimeDays = calculateCycleTime(changelogs);
    const leadTimeDays = calculateLeadTime(changelogs);
    const inProgressDuration = calculateInProgressTime(changelogs);
    const reviewDuration = calculateReviewTime(changelogs);
    const wasReopened = checkIfReopened(changelogs);
    const hadDefect = checkIfHadDefect(changelogs);
    const numberOfRevisions = countRevisions(changelogs);

    return {
      issueKey,
      cycleTimeDays,
      leadTimeDays,
      inProgressDuration,
      reviewDuration,
      wasReopened,
      hadDefect,
      numberOfRevisions
    };
  } catch (error) {
    console.error(`Error calculating metrics for ${issueKey}:`, error);
    throw error;
  }
}

/**
 * Parse raw changelog data into structured changelogs
 */
function parseChangelogs(issueKey: string, data: any): IssueChangelog[] {
  if (!data.values) {
    return [];
  }

  const changelogs: IssueChangelog[] = [];

  for (const history of data.values) {
    for (const item of history.items) {
      changelogs.push({
        id: history.id,
        issueKey,
        timestamp: new Date(history.created),
        author: history.author?.displayName || 'Unknown',
        authorAccountId: history.author?.accountId || '',
        field: item.field,
        fromValue: item.fromString || '',
        toValue: item.toString || ''
      });
    }
  }

  return changelogs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

/**
 * Calculate cycle time: time from "In Progress" to "Done"
 */
function calculateCycleTime(changelogs: IssueChangelog[]): number {
  const inProgressChange = changelogs.find(
    c => c.field === 'status' &&
    (c.toValue === 'In Progress' || c.toValue === 'In Development')
  );

  const doneChange = changelogs.find(
    c => c.field === 'status' &&
    (c.toValue === 'Done' || c.toValue === 'Closed' || c.toValue === 'Resolved')
  );

  if (!inProgressChange || !doneChange) {
    return 0;
  }

  return daysBetween(inProgressChange.timestamp, doneChange.timestamp);
}

/**
 * Calculate lead time: time from creation to done
 */
function calculateLeadTime(changelogs: IssueChangelog[]): number {
  if (changelogs.length === 0) {
    return 0;
  }

  const firstChange = changelogs[0];
  const doneChange = changelogs.find(
    c => c.field === 'status' &&
    (c.toValue === 'Done' || c.toValue === 'Closed' || c.toValue === 'Resolved')
  );

  if (!doneChange) {
    return 0;
  }

  return daysBetween(firstChange.timestamp, doneChange.timestamp);
}

/**
 * Calculate time spent in "In Progress" state
 */
function calculateInProgressTime(changelogs: IssueChangelog[]): number {
  let totalTime = 0;
  let inProgressStart: Date | null = null;

  for (const change of changelogs) {
    if (change.field === 'status') {
      if (change.toValue === 'In Progress' || change.toValue === 'In Development') {
        inProgressStart = change.timestamp;
      } else if (inProgressStart) {
        totalTime += hoursBetween(inProgressStart, change.timestamp);
        inProgressStart = null;
      }
    }
  }

  return totalTime;
}

/**
 * Calculate time spent in review states
 */
function calculateReviewTime(changelogs: IssueChangelog[]): number {
  let totalTime = 0;
  let reviewStart: Date | null = null;

  for (const change of changelogs) {
    if (change.field === 'status') {
      if (change.toValue === 'In Review' || change.toValue === 'Code Review') {
        reviewStart = change.timestamp;
      } else if (reviewStart) {
        totalTime += hoursBetween(reviewStart, change.timestamp);
        reviewStart = null;
      }
    }
  }

  return totalTime;
}

/**
 * Check if issue was reopened after being closed
 */
function checkIfReopened(changelogs: IssueChangelog[]): boolean {
  let wasClosed = false;

  for (const change of changelogs) {
    if (change.field === 'status') {
      if (change.toValue === 'Done' || change.toValue === 'Closed' || change.toValue === 'Resolved') {
        wasClosed = true;
      } else if (wasClosed && (change.toValue === 'Open' || change.toValue === 'Reopened' || change.toValue === 'In Progress')) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if issue had defects (based on labels or issue type)
 */
function checkIfHadDefect(changelogs: IssueChangelog[]): boolean {
  // Check if 'bug' or 'defect' label was added
  const defectLabels = ['bug', 'defect', 'regression', 'hotfix'];

  for (const change of changelogs) {
    if (change.field === 'labels') {
      const addedLabels = change.toValue.toLowerCase();
      if (defectLabels.some(label => addedLabels.includes(label))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Count number of times issue went back to "In Progress" from review/testing
 */
function countRevisions(changelogs: IssueChangelog[]): number {
  let revisions = 0;
  let wasInReview = false;

  for (const change of changelogs) {
    if (change.field === 'status') {
      if (change.toValue === 'In Review' || change.toValue === 'Code Review' || change.toValue === 'Testing') {
        wasInReview = true;
      } else if (wasInReview && (change.toValue === 'In Progress' || change.toValue === 'In Development')) {
        revisions++;
        wasInReview = false;
      }
    }
  }

  return revisions;
}
