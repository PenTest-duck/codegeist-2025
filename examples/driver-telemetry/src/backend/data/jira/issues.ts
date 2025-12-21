/**
 * Jira Issues Data Layer
 * Functions for fetching and processing Jira issues
 */

import { jiraClient } from './client';
import { JiraIssue, IssueWithMetrics, IssueMetrics } from '../../models/issue';
import { getDaysAgo } from '../../utils/dateHelpers';
import { calculateIssueMetrics } from './metrics';

/**
 * Get all issues assigned to current user within a time range
 * Always uses currentUser() to avoid account ID parsing issues
 */
export async function getUserIssues(
  accountId?: string,
  daysBack: number = 180
): Promise<JiraIssue[]> {
  const startDate = getDaysAgo(daysBack);
  const startDateStr = startDate.toISOString().split('T')[0];

  // ALWAYS use currentUser() - account IDs with colons cause JQL parsing errors
  const jql = `assignee was currentUser() AND updated >= "${startDateStr}" ORDER BY updated DESC`;

  try {
    console.log('getUserIssues JQL:', jql);
    const rawIssues = await jiraClient.searchIssues(jql, undefined, 1000);
    console.log(`getUserIssues found ${rawIssues.length} issues`);
    return rawIssues.map(parseJiraIssue);
  } catch (error) {
    console.error('Error fetching user issues:', error);
    // Return empty array instead of throwing to allow dashboard to show partial data
    return [];
  }
}

/**
 * Get currently active issues for current user
 * Always uses currentUser() to avoid account ID parsing issues with colons
 */
export async function getActiveIssues(accountId?: string): Promise<JiraIssue[]> {
  console.log('========================================');
  console.log('getActiveIssues CALLED');
  console.log('Using currentUser() for query (ignoring accountId parameter)');

  // Get active (In Progress + To Do) tickets only, excluding Done
  const jql = `assignee = currentUser() AND status NOT IN (Done, Closed, Resolved) ORDER BY updated DESC`;

  console.log('Constructed JQL Query (Active only):', jql);
  console.log('Note: Excludes Done/Closed/Resolved to show only active work');

  try {
    console.log('Calling jiraClient.searchIssues...');
    const rawIssues = await jiraClient.searchIssues(jql, undefined, 100);

    console.log('========================================');
    console.log('RAW JIRA RESPONSE');
    console.log('Total issues returned:', rawIssues.length);
    console.log('Raw issue data (first 3):', JSON.stringify(rawIssues.slice(0, 3).map(i => ({
      key: i.key,
      status: i.fields?.status,
      assignee: i.fields?.assignee,
      summary: i.fields?.summary
    })), null, 2));
    console.log('========================================');

    const parsedIssues = rawIssues.map(parseJiraIssue);

    console.log('========================================');
    console.log('PARSED ISSUES');
    console.log('Total parsed:', parsedIssues.length);
    console.log('Parsed details:', JSON.stringify(parsedIssues.map(i => ({
      key: i.key,
      status: i.status,
      assignee: i.assignee,
      summary: i.summary
    })), null, 2));
    console.log('========================================');

    return parsedIssues;
  } catch (error) {
    console.error('========================================');
    console.error('ERROR in getActiveIssues:', error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('========================================');
    // Return empty array instead of throwing to allow dashboard to show partial data
    return [];
  }
}

/**
 * Get completed issues for current user within a time range
 * Always uses currentUser() to avoid account ID parsing issues
 */
export async function getCompletedIssues(
  accountId?: string,
  daysBack: number = 180
): Promise<JiraIssue[]> {
  const startDate = getDaysAgo(daysBack);
  const startDateStr = startDate.toISOString().split('T')[0];

  // ALWAYS use currentUser() - account IDs with colons cause JQL parsing errors
  // Use updated field instead of resolved since resolved might not be set consistently
  const jql = `assignee = currentUser() AND status IN (Done, Closed, Resolved) AND updated >= "${startDateStr}" ORDER BY updated DESC`;

  try {
    console.log('========================================');
    console.log('getCompletedIssues CALLED');
    console.log('Days back:', daysBack);
    console.log('Start date:', startDateStr);
    console.log('JQL:', jql);
    console.log('========================================');

    const rawIssues = await jiraClient.searchIssues(jql, undefined, 1000);

    console.log(`getCompletedIssues found ${rawIssues.length} issues`);

    // Log sample of raw issues to see what fields are available
    if (rawIssues.length > 0) {
      console.log('Sample raw issue fields:', {
        key: rawIssues[0].key,
        created: rawIssues[0].fields.created,
        updated: rawIssues[0].fields.updated,
        resolved: rawIssues[0].fields.resolved,
        resolutiondate: rawIssues[0].fields.resolutiondate,
        status: rawIssues[0].fields.status?.name
      });
    }

    const parsed = rawIssues.map(parseJiraIssue);

    console.log('Sample parsed issue:', parsed[0]);

    return parsed;
  } catch (error) {
    console.error('Error fetching completed issues:', error);
    // Return empty array instead of throwing to allow dashboard to show partial data
    return [];
  }
}

/**
 * Get issues with calculated metrics
 */
export async function getUserIssuesWithMetrics(
  accountId?: string,
  daysBack: number = 180
): Promise<IssueWithMetrics[]> {
  const issues = await getUserIssues(accountId, daysBack);

  // Fetch metrics for each issue
  const issuesWithMetrics = await Promise.all(
    issues.map(async (issue) => {
      try {
        const metrics = await calculateIssueMetrics(issue.key);
        return {
          ...issue,
          metrics
        } as IssueWithMetrics;
      } catch (error) {
        console.error(`Error calculating metrics for ${issue.key}:`, error);
        // Return issue with default metrics
        return {
          ...issue,
          metrics: createDefaultMetrics(issue.key)
        } as IssueWithMetrics;
      }
    })
  );

  return issuesWithMetrics;
}

/**
 * Get team issues for comparison (all issues in user's projects)
 */
export async function getTeamIssues(
  projectKeys: string[],
  daysBack: number = 180
): Promise<JiraIssue[]> {
  if (projectKeys.length === 0) {
    return [];
  }

  const startDate = getDaysAgo(daysBack);
  const startDateStr = startDate.toISOString().split('T')[0];

  const projectFilter = projectKeys.map(key => `project = "${key}"`).join(' OR ');
  const jql = `(${projectFilter}) AND updated >= "${startDateStr}" ORDER BY updated DESC`;

  try {
    const rawIssues = await jiraClient.searchIssues(jql, undefined, 5000);
    return rawIssues.map(parseJiraIssue);
  } catch (error) {
    console.error('Error fetching team issues:', error);
    throw error;
  }
}

/**
 * Count active tickets for a user
 */
export async function countActiveTickets(accountId?: string): Promise<number> {
  const activeIssues = await getActiveIssues(accountId);
  return activeIssues.length;
}

/**
 * Parse raw Jira API response into JiraIssue model
 */
function parseJiraIssue(raw: any): JiraIssue {
  const fields = raw.fields;

  return {
    id: raw.id,
    key: raw.key,
    summary: fields.summary || '',
    issueType: fields.issuetype?.name || 'Unknown',
    status: fields.status?.name || 'Unknown',
    assignee: fields.assignee?.displayName || 'Unassigned',
    assigneeAccountId: fields.assignee?.accountId || '',
    created: new Date(fields.created),
    updated: new Date(fields.updated),
    resolved: fields.resolved ? new Date(fields.resolved) : undefined,
    storyPoints: fields.customfield_10016 || undefined,
    components: fields.components?.map((c: any) => c.name) || [],
    labels: fields.labels || [],
    priority: fields.priority?.name || undefined,
    project: fields.project?.key || '',
    sprint: fields.sprint?.name || undefined
  };
}

/**
 * Create default metrics when calculation fails
 */
function createDefaultMetrics(issueKey: string): IssueMetrics {
  return {
    issueKey,
    cycleTimeDays: 0,
    leadTimeDays: 0,
    inProgressDuration: 0,
    reviewDuration: 0,
    wasReopened: false,
    hadDefect: false,
    numberOfRevisions: 0
  };
}
