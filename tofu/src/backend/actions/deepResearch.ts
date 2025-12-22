/**
 * Deep Research Action
 *
 * This Rovo action performs detailed research on a specific person or company
 * using the Exa AI Research API. It provides comprehensive background information
 * with AI-synthesized insights and citations.
 */

import { deepResearch as exaDeepResearch } from "../exa/client";

/**
 * Payload received from the Rovo agent
 */
interface DeepResearchPayload {
  /** The name or description of the entity to research */
  query: string;
  /** Type of entity: 'person' or 'company' */
  entityType: "person" | "company";
  /** Context information from Atlassian products */
  context?: {
    cloudId?: string;
    moduleKey?: string;
  };
}

/**
 * Main handler for the deep-research Rovo action.
 *
 * This function is invoked by the Rovo agent when a user wants detailed
 * information about a specific person or company. It uses Exa's Research API
 * to perform comprehensive research with AI-synthesized results and citations.
 *
 * @param payload - The action payload containing the research query and entity type
 * @returns Formatted research results for the agent to display
 */
export async function deepResearch(
  payload: DeepResearchPayload
): Promise<string> {
  console.log(
    `[DeepResearch] Action invoked with payload: ${JSON.stringify(
      payload,
      null,
      2
    )}`
  );

  const { query, entityType } = payload;

  // Validate input
  if (!query || query.trim().length === 0) {
    return "Please provide the name of the person or company you want to research.";
  }

  if (!entityType || !["person", "company"].includes(entityType)) {
    return 'Please specify whether you want to research a "person" or a "company".';
  }

  try {
    // Perform deep research using Exa's Research API
    // This returns a comprehensive, AI-synthesized research report
    const researchOutput = await exaDeepResearch(query, entityType);

    // Check if we got meaningful results
    if (
      !researchOutput ||
      researchOutput.includes("No detailed information found")
    ) {
      const entityLabel =
        entityType === "person" ? "this person" : "this company";
      return (
        `I couldn't find detailed information about ${entityLabel}. Here are some suggestions:\n\n` +
        "• Try using the full name\n" +
        "• Include additional context (company name for people, industry for companies)\n" +
        "• Check for spelling variations"
      );
    }

    // Add header and follow-up suggestions
    const emoji = entityType === "person" ? "👤" : "🏢";
    const header = `${emoji} **Deep Research: ${query}**\n\n`;

    const followUp =
      entityType === "person"
        ? '\n\n💡 **Next steps:**\n• Say "add this person to board" to track them in Jira\n• Ask me to search for similar people\n• Ask about their company for more context'
        : '\n\n💡 **Next steps:**\n• Say "add this company to board" to track them in Jira\n• Ask me to find people at this company\n• Search for similar companies in the same space';

    return header + researchOutput + followUp;
  } catch (error) {
    console.error("[DeepResearch] Error during research:", error);

    // Return a user-friendly error message
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return `Sorry, I encountered an error while researching: ${errorMessage}\n\nPlease try again with a different query.`;
  }
}
