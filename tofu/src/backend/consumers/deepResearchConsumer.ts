/**
 * Deep Research Async Event Consumer
 *
 * This consumer handles async deep research tasks that exceed the 25-second
 * function timeout. It polls the Exa research API and creates Confluence pages
 * when research is complete.
 */

import { AsyncEvent } from "@forge/events";
import { deepResearch as exaDeepResearch } from "../exa/client";
import {
  createPageAsApp,
  convertResearchToStorageFormat,
  getSpacesAsApp,
  getDefaultSpaceKeyAsApp,
} from "../confluence/pages";
import { kvs } from "@forge/kvs";

/**
 * Event payload for deep research async event
 */
interface DeepResearchEventPayload {
  query: string;
  entityType: "person" | "company";
  userId: string;
  cloudId: string;
  spaceKey?: string; // Optional: if user has configured a default space
  researchId: string; // Unique ID for tracking this research
}

/**
 * Research result stored for notification
 */
interface ResearchResult {
  jobId: string;
  success: boolean;
  query: string;
  entityType: "person" | "company";
  pageUrl?: string;
  pageTitle?: string;
  error?: string;
  completedAt: string;
}

/**
 * Handler for async deep research events
 */
export async function handler(event: AsyncEvent): Promise<void> {
  console.log(
    `[DeepResearchConsumer] Processing event: ${JSON.stringify(event, null, 2)}`
  );

  const payload = event.body as unknown as DeepResearchEventPayload;
  const { query, entityType, userId, cloudId, spaceKey, researchId } = payload;

  try {
    // Perform the deep research (this will poll internally)
    console.log(
      `[DeepResearchConsumer] Starting research for ${entityType}: "${query}"`
    );
    const researchOutput = await exaDeepResearch(query, entityType);

    // Determine which space to use
    // Note: We use asApp versions because async consumers don't have user context
    let targetSpaceKey = spaceKey;
    if (!targetSpaceKey) {
      // Try to get default space using app permissions
      const defaultSpace = await getDefaultSpaceKeyAsApp();
      if (defaultSpace) {
        targetSpaceKey = defaultSpace;
        console.log(
          `[DeepResearchConsumer] Using default space: ${targetSpaceKey}`
        );
      } else {
        // Get available spaces and use the first one
        const spaces = await getSpacesAsApp();
        if (spaces.length > 0 && spaces[0]) {
          targetSpaceKey = spaces[0].key;
          console.log(
            `[DeepResearchConsumer] Using first available space: ${targetSpaceKey}`
          );
        } else {
          throw new Error(
            "No Confluence spaces available. Please create a space first."
          );
        }
      }
    }

    // Convert research output to Confluence storage format
    const pageTitle = `Research: ${query}`;
    const htmlBody = convertResearchToStorageFormat(
      researchOutput,
      query,
      entityType
    );

    // Create the Confluence page using app permissions
    console.log(
      `[DeepResearchConsumer] Creating Confluence page in space: ${targetSpaceKey}`
    );
    const pageResult = await createPageAsApp({
      spaceKey: targetSpaceKey,
      title: pageTitle,
      body: htmlBody,
      format: "storage",
    });

    if (!pageResult) {
      throw new Error("Failed to create Confluence page");
    }

    // Store the result for notification
    const result: ResearchResult = {
      jobId: researchId,
      success: true,
      query,
      entityType,
      pageUrl: pageResult.pageUrl,
      pageTitle: pageResult.title,
      completedAt: new Date().toISOString(),
    };

    // Store result in KVS for notification retrieval (using researchId as key)
    await kvs.set(`research-result-${researchId}`, result);

    // Also update the job status
    await kvs.set(`research-job-${researchId}`, {
      query,
      entityType,
      userId,
      cloudId,
      status: "completed",
      pageUrl: pageResult.pageUrl,
      pageTitle: pageResult.title,
      completedAt: new Date().toISOString(),
    });

    console.log(
      `[DeepResearchConsumer] Research completed successfully. Page created: ${pageResult.pageUrl}`
    );
  } catch (error) {
    console.error(`[DeepResearchConsumer] Error processing research:`, error);

    // Store error result
    const result: ResearchResult = {
      jobId: researchId,
      success: false,
      query,
      entityType,
      error: error instanceof Error ? error.message : "Unknown error",
      completedAt: new Date().toISOString(),
    };

    await kvs.set(`research-result-${researchId}`, result);

    // Also update the job status
    await kvs.set(`research-job-${researchId}`, {
      query,
      entityType,
      userId,
      cloudId,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
      completedAt: new Date().toISOString(),
    });
  }
}
