/**
 * Jira API Client
 * Authenticated API client for Jira REST API v3
 */

import api, { route } from '@forge/api';

export interface JiraApiResponse<T> {
  data: T;
  total?: number;
  maxResults?: number;
  startAt?: number;
}

export class JiraClient {
  /**
   * Execute a JQL query and return matching issues
   * MIGRATED TO NEW API: /rest/api/3/search/jql (CHANGE-2046)
   */
  async searchIssues(jql: string, fields?: string[], maxResults: number = 100): Promise<any[]> {
    const allIssues: any[] = [];
    let nextPageToken: string | undefined = undefined;
    const batchSize = Math.min(maxResults, 5000); // New API max is 5000 per request

    while (true) {
      const body: any = {
        jql,
        maxResults: batchSize,
        fields: fields || [
          'summary',
          'issuetype',
          'status',
          'assignee',
          'created',
          'updated',
          'resolved',
          'resolutiondate',
          'customfield_10016', // Story points (may vary)
          'components',
          'labels',
          'priority',
          'project'
        ]
        // Note: expand parameter removed - changelog fetched separately via getIssueChangelog()
      };

      // Add nextPageToken for pagination (undefined for first request)
      if (nextPageToken) {
        body.nextPageToken = nextPageToken;
      }

      console.log('=== JIRA API REQUEST ===');
      console.log('URL: /rest/api/3/search/jql');
      console.log('Body:', JSON.stringify(body, null, 2));

      const response = await api.asUser().requestJira(route`/rest/api/3/search/jql`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      console.log('=== JIRA API RESPONSE ===');
      console.log('Status:', response.status, response.statusText);
      console.log('Headers:', JSON.stringify([...response.headers.entries()], null, 2));

      if (!response.ok) {
        // Log the full error response body
        const errorBody = await response.text();
        console.error('Error response body:', errorBody);
        throw new Error(`Jira API error: ${response.status} ${response.statusText} - ${errorBody}`);
      }

      const result = await response.json();
      allIssues.push(...result.issues);

      // Check if we have more results using nextPageToken
      if (result.nextPageToken && allIssues.length < maxResults) {
        nextPageToken = result.nextPageToken;
      } else {
        break;
      }
    }

    return allIssues;
  }

  /**
   * Get issue changelog
   */
  async getIssueChangelog(issueKey: string): Promise<any> {
    const response = await api.asUser().requestJira(
      route`/rest/api/3/issue/${issueKey}/changelog`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch changelog for ${issueKey}: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<any> {
    const response = await api.asUser().requestJira(route`/rest/api/3/myself`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch current user: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get user by account ID
   */
  async getUser(accountId: string): Promise<any> {
    const response = await api.asUser().requestJira(
      route`/rest/api/3/user?accountId=${accountId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch user ${accountId}: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get sprint information
   */
  async getSprint(sprintId: string): Promise<any> {
    const response = await api.asUser().requestJira(
      route`/rest/agile/1.0/sprint/${sprintId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch sprint ${sprintId}: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get all sprints for a board
   */
  async getSprintsForBoard(boardId: string): Promise<any[]> {
    const allSprints: any[] = [];
    let startAt = 0;
    const maxResults = 50;

    while (true) {
      const response = await api.asUser().requestJira(
        route`/rest/agile/1.0/board/${boardId}/sprint?startAt=${startAt}&maxResults=${maxResults}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch sprints for board ${boardId}: ${response.status}`);
      }

      const result = await response.json();
      allSprints.push(...result.values);

      if (result.isLast || result.values.length < maxResults) {
        break;
      }

      startAt += maxResults;
    }

    return allSprints;
  }
}

// Singleton instance
export const jiraClient = new JiraClient();
