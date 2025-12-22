/**
 * Jira Issues Helper
 *
 * This module provides helper functions for interacting with Jira issues.
 * It uses the Jira REST API via @forge/api to create and manage issues.
 */

import { asUser, route } from "@forge/api";
import type { AddToBoardResponse } from "../../types";

/**
 * Options for creating a Jira issue
 */
interface CreateIssueOptions {
  /** The project key to create the issue in */
  projectKey: string;
  /** The issue summary/title */
  summary: string;
  /** The issue description in ADF format */
  description: object;
  /** Optional labels to add to the issue */
  labels?: string[];
  /** Optional issue type (defaults to Task) */
  issueType?: string;
}

/**
 * Response from creating a Jira issue
 */
interface JiraIssueResponse {
  id: string;
  key: string;
  self: string;
}

/**
 * Response from getting projects
 */
interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
}

/**
 * Response from getting issue types
 */
interface JiraIssueType {
  id: string;
  name: string;
  description: string;
  subtask: boolean;
}

/**
 * Get the base URL for the current Jira site.
 * This extracts the site URL from the API response.
 */
async function getSiteUrl(): Promise<string> {
  try {
    // Get server info to determine base URL
    const response = await asUser().requestJira(route`/rest/api/3/serverInfo`);
    if (response.ok) {
      const serverInfo = (await response.json()) as { baseUrl: string };
      return serverInfo.baseUrl;
    }
  } catch (error) {
    console.warn("[Jira] Could not get site URL:", error);
  }
  // Fallback - won't have a clickable link
  return "";
}

/**
 * Get available projects the user has access to.
 * Returns the first project if looking for a default.
 */
export async function getDefaultProjectKey(): Promise<string | null> {
  try {
    console.log("[Jira] Fetching available projects");

    const response = await asUser().requestJira(
      route`/rest/api/3/project/search?maxResults=1`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Jira] Error fetching projects: ${response.status} - ${errorText}`
      );
      return null;
    }

    const data = (await response.json()) as { values: JiraProject[] };

    // Check that we have at least one project and get it safely
    const firstProject = data.values?.[0];
    if (firstProject) {
      console.log(`[Jira] Found default project: ${firstProject.key}`);
      return firstProject.key;
    }

    return null;
  } catch (error) {
    console.error("[Jira] Error getting default project:", error);
    return null;
  }
}

/**
 * Get the default issue type ID for a project.
 * Prefers "Task" type, falls back to any non-subtask type.
 */
async function getIssueTypeId(
  projectKey: string,
  preferredType?: string
): Promise<string | null> {
  try {
    console.log(`[Jira] Fetching issue types for project ${projectKey}`);

    const response = await asUser().requestJira(
      route`/rest/api/3/project/${projectKey}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Jira] Error fetching project: ${response.status} - ${errorText}`
      );
      return null;
    }

    const project = (await response.json()) as { issueTypes: JiraIssueType[] };
    const issueTypes = project.issueTypes || [];

    // Filter out subtasks
    const standardTypes = issueTypes.filter((t) => !t.subtask);

    if (standardTypes.length === 0) {
      console.warn("[Jira] No standard issue types found");
      return null;
    }

    // Look for preferred type (e.g., "Task")
    const preferred = preferredType || "Task";
    const preferredMatch = standardTypes.find(
      (t) => t.name.toLowerCase() === preferred.toLowerCase()
    );

    if (preferredMatch) {
      console.log(
        `[Jira] Using issue type: ${preferredMatch.name} (${preferredMatch.id})`
      );
      return preferredMatch.id;
    }

    // Fall back to first available type - we already checked length > 0 above
    const fallbackType = standardTypes[0];
    if (fallbackType) {
      console.log(`[Jira] Using fallback issue type: ${fallbackType.name}`);
      return fallbackType.id;
    }

    return null;
  } catch (error) {
    console.error("[Jira] Error getting issue type:", error);
    return null;
  }
}

/**
 * Create a new Jira issue.
 *
 * This function creates a new issue in the specified project with the
 * given details. It's used by the add-to-board action to create lead
 * tracking issues.
 *
 * @param options - The issue creation options
 * @returns Success status with issue key and URL, or error details
 */
export async function createJiraIssue(
  options: CreateIssueOptions
): Promise<AddToBoardResponse> {
  const { projectKey, summary, description, labels = [], issueType } = options;

  console.log(`[Jira] Creating issue in project ${projectKey}: ${summary}`);

  try {
    // Get the issue type ID
    const issueTypeId = await getIssueTypeId(projectKey, issueType);
    if (!issueTypeId) {
      return {
        success: false,
        error: `Could not find a valid issue type for project ${projectKey}`,
      };
    }

    // Build the issue payload
    const issuePayload = {
      fields: {
        project: {
          key: projectKey,
        },
        summary,
        description,
        issuetype: {
          id: issueTypeId,
        },
        labels,
      },
    };

    console.log(
      `[Jira] Issue payload: ${JSON.stringify(issuePayload, null, 2)}`
    );

    // Create the issue
    const response = await asUser().requestJira(route`/rest/api/3/issue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(issuePayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Jira] Error creating issue: ${response.status} - ${errorText}`
      );

      // Parse error for user-friendly message
      try {
        const errorData = JSON.parse(errorText);
        const errorMessages = errorData.errorMessages || [];
        const fieldErrors = Object.values(errorData.errors || {});
        const allErrors = [...errorMessages, ...fieldErrors].join(". ");
        return {
          success: false,
          error: allErrors || `HTTP ${response.status}: ${errorText}`,
        };
      } catch {
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
        };
      }
    }

    const issue = (await response.json()) as JiraIssueResponse;
    console.log(`[Jira] Successfully created issue: ${issue.key}`);

    // Get base URL for the issue link
    const baseUrl = await getSiteUrl();
    const issueUrl = baseUrl ? `${baseUrl}/browse/${issue.key}` : undefined;

    return {
      success: true,
      issueKey: issue.key,
      issueUrl,
    };
  } catch (error) {
    console.error("[Jira] Exception creating issue:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get all boards the user has access to.
 * Used for configuration and board selection.
 */
export async function getBoards(): Promise<
  Array<{ id: number; name: string; type: string }>
> {
  try {
    console.log("[Jira] Fetching available boards");

    const response = await asUser().requestJira(route`/rest/agile/1.0/board`);

    if (!response.ok) {
      console.error(`[Jira] Error fetching boards: ${response.status}`);
      return [];
    }

    const data = (await response.json()) as {
      values: Array<{ id: number; name: string; type: string }>;
    };

    return data.values || [];
  } catch (error) {
    console.error("[Jira] Error getting boards:", error);
    return [];
  }
}

/**
 * Get all projects the user has access to.
 * Used for configuration and project selection.
 */
export async function getProjects(): Promise<JiraProject[]> {
  try {
    console.log("[Jira] Fetching available projects");

    const response = await asUser().requestJira(
      route`/rest/api/3/project/search?maxResults=50`
    );

    if (!response.ok) {
      console.error(`[Jira] Error fetching projects: ${response.status}`);
      return [];
    }

    const data = (await response.json()) as { values: JiraProject[] };

    return data.values || [];
  } catch (error) {
    console.error("[Jira] Error getting projects:", error);
    return [];
  }
}
