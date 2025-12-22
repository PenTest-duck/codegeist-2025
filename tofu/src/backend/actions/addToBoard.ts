/**
 * Add to Board Action
 *
 * This Rovo action creates a Jira issue from a lead (person or company)
 * so it can be tracked on a Jira board for follow-up.
 */

import { kvs } from "@forge/kvs";
import { createJiraIssue, getDefaultProjectKey } from "../jira/issues";
import type { TofuConfig, AddToBoardResponse } from "../../types";

/**
 * Payload received from the Rovo agent
 */
interface AddToBoardPayload {
  /** Name of the lead (person or company name) */
  name: string;
  /** Type of lead: 'person' or 'company' */
  entityType: "person" | "company";
  /** Brief summary or description of the lead */
  summary: string;
  /** Detailed background information from Exa search results */
  details?: string;
  /** Source URL where this lead was found */
  sourceUrl?: string;
  /** Jira project key to create the issue in (optional, uses config default) */
  projectKey?: string;
  /** Context information from Atlassian products */
  context?: {
    cloudId?: string;
    moduleKey?: string;
    jira?: {
      projectKey?: string;
      projectId?: string;
    };
  };
}

/**
 * Get the project key to use for creating the issue.
 * Priority: payload > config > context > error
 */
async function resolveProjectKey(payload: AddToBoardPayload): Promise<string> {
  // First, check if project key was provided in payload
  if (payload.projectKey) {
    return payload.projectKey;
  }

  // Second, check if there's a default in config
  try {
    const config = (await kvs.get("tofu-config")) as TofuConfig | undefined;
    if (config?.defaultProjectKey) {
      return config.defaultProjectKey;
    }
  } catch (error) {
    console.warn("[AddToBoard] Could not load config:", error);
  }

  // Third, check if context provides a project
  if (payload.context?.jira?.projectKey) {
    return payload.context.jira.projectKey;
  }

  // Finally, try to get a default project from Jira
  const defaultProject = await getDefaultProjectKey();
  if (defaultProject) {
    return defaultProject;
  }

  throw new Error(
    "No project key specified. Please provide a project key or configure a default in the Tofu settings."
  );
}

/**
 * Build the issue description with lead details including comprehensive background info.
 * Uses Atlassian Document Format (ADF) for rich formatting in Jira.
 */
function buildDescription(
  name: string,
  entityType: "person" | "company",
  summary: string,
  details?: string,
  sourceUrl?: string
): object {
  // Build Atlassian Document Format (ADF) for the description
  const content: any[] = [
    // Header with lead type
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: `${entityType === "person" ? "👤 Person" : "🏢 Company"} Lead`,
          marks: [{ type: "strong" }],
        },
      ],
    },
    // Summary section
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Summary: ",
          marks: [{ type: "strong" }],
        },
        {
          type: "text",
          text: summary || `Lead information for ${name}`,
        },
      ],
    },
  ];

  // Add detailed description if available (from Exa search results)
  if (details && details.trim().length > 0) {
    content.push(
      // Divider effect with heading
      {
        type: "heading",
        attrs: { level: 3 },
        content: [
          {
            type: "text",
            text: "Background Information",
          },
        ],
      },
      // The detailed content from Exa
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: details.substring(0, 3000), // Limit to 3000 chars for readability
          },
        ],
      }
    );
  }

  // Add source URL if available
  if (sourceUrl) {
    content.push({
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Source: ",
          marks: [{ type: "strong" }],
        },
        {
          type: "text",
          text: sourceUrl,
          marks: [
            {
              type: "link",
              attrs: { href: sourceUrl },
            },
          ],
        },
      ],
    });
  }

  // Add metadata
  content.push({
    type: "paragraph",
    content: [
      {
        type: "text",
        text: `Added via Tofu on ${new Date().toLocaleDateString()}`,
        marks: [{ type: "em" }],
      },
    ],
  });

  return {
    type: "doc",
    version: 1,
    content,
  };
}

/**
 * Update statistics after adding a lead
 */
async function updateStats(): Promise<void> {
  try {
    const stats =
      ((await kvs.get("tofu-stats")) as Record<string, number>) || {};
    stats.leadsAddedToJira = (stats.leadsAddedToJira || 0) + 1;
    await kvs.set("tofu-stats", stats);
  } catch (error) {
    console.warn("[AddToBoard] Could not update stats:", error);
  }
}

/**
 * Main handler for the add-to-board Rovo action.
 *
 * This function is invoked by the Rovo agent when a user wants to add
 * a lead to a Jira board for tracking. It creates a new Jira issue
 * with the lead information.
 *
 * @param payload - The action payload containing lead information
 * @returns Success message with issue link or error message
 */
export async function addToBoard(payload: AddToBoardPayload): Promise<string> {
  console.log(
    `[AddToBoard] Action invoked with payload: ${JSON.stringify(
      payload,
      null,
      2
    )}`
  );

  const { name, entityType, summary, details, sourceUrl } = payload;

  // Validate required inputs
  if (!name || name.trim().length === 0) {
    return "Please provide the name of the person or company to add to the board.";
  }

  if (!entityType || !["person", "company"].includes(entityType)) {
    return 'Please specify whether this is a "person" or "company" lead.';
  }

  if (!summary || summary.trim().length === 0) {
    return "Please provide a brief summary or description of this lead.";
  }

  try {
    // Resolve which project to use
    const projectKey = await resolveProjectKey(payload);
    console.log(`[AddToBoard] Using project key: ${projectKey}`);

    // Build the issue title and description
    const issueTitle =
      entityType === "person" ? `[Lead] ${name}` : `[Company Lead] ${name}`;

    const description = buildDescription(
      name,
      entityType,
      summary,
      details,
      sourceUrl
    );

    // Create the Jira issue
    const result = await createJiraIssue({
      projectKey,
      summary: issueTitle,
      description,
      labels: ["tofu-lead", entityType],
    });

    if (result.success && result.issueKey) {
      // Update stats
      await updateStats();

      const emoji = entityType === "person" ? "👤" : "🏢";
      return (
        `${emoji} **Lead added successfully!**\n\n` +
        `Created issue **${result.issueKey}**: ${issueTitle}\n\n` +
        (result.issueUrl ? `🔗 [View in Jira](${result.issueUrl})\n\n` : "") +
        "💡 You can find this lead in your Jira project backlog or board."
      );
    } else {
      throw new Error(result.error || "Failed to create issue");
    }
  } catch (error) {
    console.error("[AddToBoard] Error creating issue:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return (
      `Sorry, I couldn't add this lead to Jira: ${errorMessage}\n\n` +
      "💡 **Troubleshooting:**\n" +
      "• Make sure you have access to the target Jira project\n" +
      "• Check that a default project is configured in Tofu settings\n" +
      '• Try specifying a project key: "add to project ABC"'
    );
  }
}
