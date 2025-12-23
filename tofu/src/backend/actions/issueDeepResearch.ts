/**
 * Issue Deep Research Action
 *
 * This Jira issue action performs deep research on a lead (person or company)
 * and creates a Confluence page with the comprehensive research results.
 * The Confluence page is then linked back to the Jira issue via a comment.
 */

import Resolver from "@forge/resolver";
import { asUser, route } from "@forge/api";
import { kvs } from "@forge/kvs";
import { deepResearch as exaDeepResearch } from "../exa/client";
import {
  createPage,
  getDefaultSpaceKey,
  convertResearchToStorageFormat,
} from "../confluence/pages";
import type { TofuConfig } from "../../types";

// Create resolver instance
const resolver = new Resolver();

/**
 * Jira issue details from the REST API
 */
interface JiraIssueDetails {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: unknown;
    labels?: string[];
    issuetype?: {
      name: string;
    };
  };
}

/**
 * Get issue details from Jira
 */
async function getIssueDetails(
  issueKey: string
): Promise<JiraIssueDetails | null> {
  try {
    console.log(`[IssueDeepResearch] Fetching issue details for ${issueKey}`);

    const response = await asUser().requestJira(
      route`/rest/api/3/issue/${issueKey}?fields=summary,description,labels,issuetype`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[IssueDeepResearch] Error fetching issue: ${response.status} - ${errorText}`
      );
      return null;
    }

    return (await response.json()) as JiraIssueDetails;
  } catch (error) {
    console.error("[IssueDeepResearch] Exception fetching issue:", error);
    return null;
  }
}

/**
 * Add a comment to a Jira issue with a link to the research page
 */
async function addResearchLinkComment(
  issueKey: string,
  pageUrl: string,
  pageTitle: string,
  leadName: string,
  entityType: "person" | "company"
): Promise<boolean> {
  try {
    console.log(
      `[IssueDeepResearch] Adding research link comment to ${issueKey}`
    );

    const emoji = entityType === "person" ? "👤" : "🏢";

    // Build ADF comment body
    const commentBody = {
      type: "doc",
      version: 1,
      content: [
        {
          type: "panel",
          attrs: { panelType: "success" },
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: `${emoji} Deep Research Complete`,
                  marks: [{ type: "strong" }],
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: `A comprehensive research page has been created for `,
                },
                {
                  type: "text",
                  text: leadName,
                  marks: [{ type: "strong" }],
                },
                {
                  type: "text",
                  text: ".",
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "📄 ",
                },
                {
                  type: "text",
                  text: pageTitle,
                  marks: [
                    {
                      type: "link",
                      attrs: { href: pageUrl },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const response = await asUser().requestJira(
      route`/rest/api/3/issue/${issueKey}/comment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: commentBody }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[IssueDeepResearch] Error adding comment: ${response.status} - ${errorText}`
      );
      return false;
    }

    console.log(
      `[IssueDeepResearch] Successfully added comment to ${issueKey}`
    );
    return true;
  } catch (error) {
    console.error("[IssueDeepResearch] Exception adding comment:", error);
    return false;
  }
}

/**
 * Extract the lead name from the issue summary.
 * Lead issues are created with summaries like "[Lead] John Smith" or "[Company Lead] Acme Corp"
 */
function extractLeadName(summary: string): string {
  // Remove common prefixes
  let name = summary
    .replace(/^\[Lead\]\s*/i, "")
    .replace(/^\[Company Lead\]\s*/i, "")
    .replace(/^\[Person Lead\]\s*/i, "")
    .trim();

  return name || summary;
}

/**
 * Determine the entity type from issue labels
 */
function determineEntityType(labels: string[]): "person" | "company" | null {
  if (labels.includes("person")) {
    return "person";
  }
  if (labels.includes("company")) {
    return "company";
  }
  // Try to infer from other patterns
  if (labels.some((l) => l.toLowerCase().includes("person"))) {
    return "person";
  }
  if (labels.some((l) => l.toLowerCase().includes("company"))) {
    return "company";
  }
  return null;
}

/**
 * Get the Confluence space key from config or use default
 */
async function getSpaceKey(): Promise<string | null> {
  // First, try to get from config
  try {
    const config = (await kvs.get("tofu-config")) as TofuConfig | undefined;
    if (config && (config as any).confluenceSpaceKey) {
      return (config as any).confluenceSpaceKey;
    }
  } catch (error) {
    console.warn("[IssueDeepResearch] Could not load config:", error);
  }

  // Fall back to getting the first available space
  return await getDefaultSpaceKey();
}

/**
 * Resolver handler for the deep research action.
 *
 * This function is invoked from the frontend when the user clicks
 * "Start Deep Research". It performs comprehensive research and creates
 * a Confluence page with the results.
 */
resolver.define(
  "performDeepResearch",
  async ({
    payload,
    context,
  }: {
    payload: { issueKey: string };
    context: any;
  }): Promise<{
    success: boolean;
    message: string;
    pageUrl?: string;
    pageTitle?: string;
  }> => {
    console.log(
      `[IssueDeepResearch] Action invoked with payload: ${JSON.stringify(
        payload,
        null,
        2
      )}`
    );

    // Get the issue key from the payload
    const issueKey = payload?.issueKey;

    if (!issueKey) {
      console.error("[IssueDeepResearch] No issue key in payload");
      return {
        success: false,
        message:
          "Could not determine which issue to research. Please try again.",
      };
    }

    // Step 1: Get issue details
    const issue = await getIssueDetails(issueKey);
    if (!issue) {
      return {
        success: false,
        message: `Could not fetch issue details for ${issueKey}. Please check your permissions.`,
      };
    }

    const labels = issue.fields.labels || [];
    const summary = issue.fields.summary || "";

    // Step 2: Check if this is a lead issue
    if (!labels.includes("tofu-lead")) {
      return {
        success: false,
        message:
          'This issue is not a Tofu lead. Deep research is only available for issues with the "tofu-lead" label.',
      };
    }

    // Step 3: Determine entity type (person or company)
    const entityType = determineEntityType(labels);
    if (!entityType) {
      return {
        success: false,
        message:
          'Could not determine if this is a person or company lead. Please ensure the issue has a "person" or "company" label.',
      };
    }

    // Step 4: Extract lead name
    const leadName = extractLeadName(summary);
    console.log(`[IssueDeepResearch] Researching ${entityType}: "${leadName}"`);

    // Step 5: Perform deep research using Exa
    let researchOutput: string;
    try {
      researchOutput = await exaDeepResearch(leadName, entityType);
    } catch (error) {
      console.error("[IssueDeepResearch] Research failed:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        message: `Research failed: ${errorMsg}. Please try again.`,
      };
    }

    // Check if research returned meaningful results
    if (
      !researchOutput ||
      researchOutput.includes("No detailed information found")
    ) {
      return {
        success: false,
        message: `Could not find detailed information about "${leadName}". The research may require more specific details.`,
      };
    }

    // Step 6: Get Confluence space
    const spaceKey = await getSpaceKey();
    if (!spaceKey) {
      return {
        success: false,
        message:
          "No Confluence space available. Please ensure you have access to at least one Confluence space.",
      };
    }

    // Step 7: Create Confluence page
    const pageTitle = `Research: ${leadName} (${
      entityType === "person" ? "Person" : "Company"
    })`;
    const pageBody = convertResearchToStorageFormat(
      researchOutput,
      leadName,
      entityType
    );

    const pageResult = await createPage({
      spaceKey,
      title: pageTitle,
      body: pageBody,
      format: "storage",
    });

    if (!pageResult) {
      return {
        success: false,
        message: `Failed to create Confluence page in space "${spaceKey}". Please check your permissions.`,
      };
    }

    console.log(`[IssueDeepResearch] Created page: ${pageResult.pageUrl}`);

    // Step 8: Link the page to the Jira issue via comment
    await addResearchLinkComment(
      issueKey,
      pageResult.pageUrl,
      pageTitle,
      leadName,
      entityType
    );

    // Return success with page URL for the frontend
    const emoji = entityType === "person" ? "👤" : "🏢";
    return {
      success: true,
      message: `${emoji} Deep research complete! A Confluence page has been created with comprehensive information about ${leadName}.`,
      pageUrl: pageResult.pageUrl,
      pageTitle: pageTitle,
    };
  }
);

// Export the resolver definitions
export const deepResearchResolver = resolver.getDefinitions();
