/**
 * Deep Research Action
 *
 * This Rovo action queues detailed research on a specific person or company
 * using the Exa AI Research API. The research is performed asynchronously
 * to avoid the 25-second function timeout, and results are saved to Confluence.
 */

import { Queue } from "@forge/events";
import { kvs } from "@forge/kvs";

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
    userAccess?: {
      enabled?: boolean;
      hasAccess?: boolean;
    };
  };
  /** Context token for authentication */
  contextToken?: string;
}

/**
 * Main handler for the deep-research Rovo action.
 *
 * This function queues the research task asynchronously to avoid timeout.
 * The research will be performed in the background and a Confluence page
 * will be created when complete. The user will be notified via showFlag.
 *
 * @param payload - The action payload containing the research query and entity type
 * @returns Message indicating the research has been queued
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

  const { query, entityType, context } = payload;

  // Validate input
  if (!query || query.trim().length === 0) {
    return "Please provide the name of the person or company you want to research.";
  }

  if (!entityType || !["person", "company"].includes(entityType)) {
    return 'Please specify whether you want to research a "person" or a "company".';
  }

  try {
    // Get context information
    // Note: Rovo action context doesn't include accountId, so we use cloudId for tracking
    const cloudId = context?.cloudId || "unknown";

    // Generate a user identifier for tracking (cloudId is sufficient for async processing)
    const userId = cloudId;

    // Get configured default space key if available
    const config = (await kvs.get("tofu-config")) as {
      defaultConfluenceSpace?: string;
    } | null;
    const defaultSpaceKey = config?.defaultConfluenceSpace;

    // Create async event queue
    const queue = new Queue({ key: "deep-research-queue" });

    // Generate a unique research ID for tracking
    const researchId = `research-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Push the research task to the queue
    const { jobId } = await queue.push({
      body: {
        query,
        entityType,
        userId,
        cloudId,
        spaceKey: defaultSpaceKey,
        researchId, // Unique ID for tracking this research
      },
    });

    console.log(
      `[DeepResearch] Research queued with job ID: ${jobId}, research ID: ${researchId}`
    );

    // Store the mapping for later retrieval
    await kvs.set(`research-job-${researchId}`, {
      query,
      entityType,
      userId,
      cloudId,
      jobId,
      status: "queued",
      createdAt: new Date().toISOString(),
    });

    const emoji = entityType === "person" ? "👤" : "🏢";
    return (
      `${emoji} **Deep Research Queued**\n\nI've started researching **${query}**. This may take 30-60 seconds.\n\n` +
      `The research results will be saved to a Confluence page${
        defaultSpaceKey ? ` in the ${defaultSpaceKey} space` : ""
      } and you'll be notified when it's complete.\n\n` +
      `💡 **What happens next:**\n` +
      `• Research is being performed in the background\n` +
      `• A Confluence page will be created with comprehensive findings\n` +
      `• You'll receive a notification when it's ready\n\n` +
      `You can continue using Tofu while the research completes. The research ID is: \`${researchId}\` (you can use this to check status).`
    );
  } catch (error) {
    console.error("[DeepResearch] Error queueing research:", error);

    // Return a user-friendly error message
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return `Sorry, I encountered an error while queueing the research: ${errorMessage}\n\nPlease try again with a different query.`;
  }
}
