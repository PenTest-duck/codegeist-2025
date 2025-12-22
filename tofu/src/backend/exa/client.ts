/**
 * Exa API Client
 *
 * This module provides a client for interacting with the Exa AI search API.
 * Exa provides semantic search capabilities for finding people, companies, and other entities.
 *
 * API Documentation: https://docs.exa.ai
 */

import { fetch } from "@forge/api";
import type {
  ExaSearchOptions,
  ExaSearchResponse,
  ExaSearchResult,
} from "../../types";

// Exa API base URL
const EXA_API_BASE_URL = "https://api.exa.ai";

/**
 * Get the Exa API key from environment variables.
 * The key is set using `forge variables set exaApiKey <your-key>`
 *
 * @returns The Exa API key
 */
function getApiKey(): string {
  const apiKey = process.env.exaApiKey;
  if (!apiKey) {
    throw new Error(
      "Exa API key not configured. Please set the exaApiKey variable using `forge variables set exaApiKey <your-key>`"
    );
  }
  return apiKey;
}

/**
 * Make a request to the Exa API
 *
 * @param endpoint - The API endpoint (e.g., '/search')
 * @param body - The request body
 * @returns The API response
 */
async function makeExaRequest<T>(endpoint: string, body: object): Promise<T> {
  const apiKey = getApiKey();

  console.log(`[Exa] Making request to ${endpoint}`);
  console.log(`[Exa] Request body: ${JSON.stringify(body, null, 2)}`);

  const response = await fetch(`${EXA_API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Exa] API error: ${response.status} - ${errorText}`);
    throw new Error(`Exa API error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as T;
  console.log(
    `[Exa] Response received with ${(data as any).results?.length || 0} results`
  );

  return data;
}

/**
 * Search for people using Exa's people search capability.
 * Uses the `category: "people"` parameter for optimized people search
 * with 1B+ indexed profiles.
 *
 * @param query - Natural language search query (e.g., "Senior React developers in San Francisco")
 * @param numResults - Number of results to return (default: 10)
 * @returns Array of search results with people information including full text content
 */
export async function searchPeople(
  query: string,
  numResults: number = 10
): Promise<ExaSearchResult[]> {
  console.log(`[Exa] Searching for people: "${query}"`);

  const requestBody = {
    query,
    numResults,
    category: "people",
    // Enable full text content for detailed lead descriptions
    text: {
      maxCharacters: 2000,
      includeHtmlTags: false,
    },
    highlights: {
      numSentences: 3,
      highlightsPerUrl: 3,
    },
  };

  const response = await makeExaRequest<ExaSearchResponse>(
    "/search",
    requestBody
  );

  return response.results || [];
}

/**
 * Search for companies using Exa's search capability.
 * Optimized for finding company information, websites, and profiles.
 *
 * @param query - Natural language search query (e.g., "AI startups with Series B funding")
 * @param numResults - Number of results to return (default: 10)
 * @returns Array of search results with company information including full text content
 */
export async function searchCompanies(
  query: string,
  numResults: number = 10
): Promise<ExaSearchResult[]> {
  console.log(`[Exa] Searching for companies: "${query}"`);

  const requestBody = {
    query,
    numResults,
    category: "company",
    // Enable full text content for detailed lead descriptions
    text: {
      maxCharacters: 2000,
      includeHtmlTags: false,
    },
    highlights: {
      numSentences: 3,
      highlightsPerUrl: 3,
    },
  };

  const response = await makeExaRequest<ExaSearchResponse>(
    "/search",
    requestBody
  );

  return response.results || [];
}

/**
 * Response from creating an Exa research task
 */
interface ExaResearchCreateResponse {
  researchId: string;
  status: "pending" | "running" | "completed" | "canceled" | "failed";
  model: string;
  instructions: string;
}

/**
 * Response from getting an Exa research task (completed)
 */
interface ExaResearchGetResponse {
  researchId: string;
  status: "pending" | "running" | "completed" | "canceled" | "failed";
  model: string;
  instructions: string;
  createdAt: number;
  completedAt?: number;
  output?: string;
  sources?: Array<{
    url: string;
    title: string;
    snippet?: string;
  }>;
  error?: string;
}

/**
 * Sleep utility for polling
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Make a GET request to the Exa API
 */
async function makeExaGetRequest<T>(endpoint: string): Promise<T> {
  const apiKey = getApiKey();

  console.log(`[Exa] Making GET request to ${endpoint}`);

  const response = await fetch(`${EXA_API_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Exa] API error: ${response.status} - ${errorText}`);
    throw new Error(`Exa API error: ${response.status} - ${errorText}`);
  }

  return (await response.json()) as T;
}

/**
 * Perform deep research on a specific person or company using Exa's Research API.
 * This uses the async research endpoint which provides comprehensive, AI-synthesized
 * research results with citations.
 *
 * @param query - The name or description of the person/company to research
 * @param entityType - Whether researching a 'person' or 'company'
 * @returns Research output as a formatted string with sources
 */
export async function deepResearch(
  query: string,
  entityType: "person" | "company"
): Promise<string> {
  console.log(`[Exa] Starting deep research on ${entityType}: "${query}"`);

  // Build research instructions based on entity type
  const instructions =
    entityType === "person"
      ? `Research and provide a comprehensive profile of ${query}. Include:
- Professional background and current role
- Career history and notable achievements
- Education and qualifications
- Skills and areas of expertise
- Any public presence (LinkedIn, Twitter, publications)
- Recent news or mentions
Provide specific details with citations where available.`
      : `Research and provide a comprehensive overview of the company ${query}. Include:
- Company overview and what they do
- Founding date, headquarters, and key leadership
- Products or services offered
- Industry and market position
- Funding history and financial status (if available)
- Recent news, partnerships, or notable developments
- Company culture and employee count (if available)
Provide specific details with citations where available.`;

  try {
    // Step 1: Create the research task
    console.log(`[Exa] Creating research task...`);
    const createResponse = await makeExaRequest<ExaResearchCreateResponse>(
      "/research/v1",
      {
        instructions,
        model: "exa-research-fast", // Use standard model for faster results
      }
    );

    const { researchId } = createResponse;
    console.log(`[Exa] Research task created with ID: ${researchId}`);

    // Step 2: Poll for completion with exponential backoff
    const maxAttempts = 30; // Maximum polling attempts
    const initialDelay = 2000; // Start with 2 second delay
    const maxDelay = 30000; // Max 30 second delay
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(
        `[Exa] Polling research status (attempt ${attempt}/${maxAttempts})...`
      );

      await sleep(delay);

      const statusResponse = await makeExaGetRequest<ExaResearchGetResponse>(
        `/research/v1/${researchId}`
      );

      console.log(`[Exa] Research status: ${statusResponse.status}`);

      if (statusResponse.status === "completed") {
        // Research complete - return the output
        console.log(`[Exa] Research completed successfully!`);

        let result = statusResponse.output || "No research output available.";

        // Add sources if available
        if (statusResponse.sources && statusResponse.sources.length > 0) {
          result += "\n\n**Sources:**\n";
          statusResponse.sources.forEach((source, index) => {
            result += `${index + 1}. [${source.title}](${source.url})\n`;
          });
        }

        return result;
      }

      if (statusResponse.status === "failed") {
        console.error(`[Exa] Research task failed: ${statusResponse.error}`);
        throw new Error(
          `Research failed: ${statusResponse.error || "Unknown error"}`
        );
      }

      if (statusResponse.status === "canceled") {
        throw new Error("Research task was canceled");
      }

      // Increase delay with exponential backoff, capped at maxDelay
      delay = Math.min(delay * 1.5, maxDelay);
    }

    // If we've exhausted all attempts
    throw new Error(
      "Research timed out. The request is taking longer than expected."
    );
  } catch (error) {
    console.error(`[Exa] Deep research error:`, error);

    // Fall back to enhanced search if research API fails
    console.log(`[Exa] Falling back to enhanced search...`);
    return await fallbackDeepSearch(query, entityType);
  }
}

/**
 * Fallback deep search using the regular search API if research API fails.
 * This provides a more detailed search as a backup.
 */
async function fallbackDeepSearch(
  query: string,
  entityType: "person" | "company"
): Promise<string> {
  console.log(
    `[Exa] Performing fallback deep search for ${entityType}: "${query}"`
  );

  const enhancedQuery =
    entityType === "person"
      ? `Detailed profile and background information about ${query}`
      : `Company profile, overview, and detailed information about ${query}`;

  const requestBody = {
    query: enhancedQuery,
    numResults: 5,
    category: entityType === "person" ? "people" : "company",
    text: {
      maxCharacters: 3000,
      includeHtmlTags: false,
    },
    highlights: {
      numSentences: 5,
      highlightsPerUrl: 5,
    },
  };

  const response = await makeExaRequest<ExaSearchResponse>(
    "/search",
    requestBody
  );

  const results = response.results || [];

  if (results.length === 0) {
    return `No detailed information found for ${query}.`;
  }

  // Format the fallback results
  let output = `**Research Results for ${query}**\n\n`;

  results.forEach((result, index) => {
    output += `**${index + 1}. ${result.title || "Unknown"}**\n`;
    if (result.url) {
      output += `Source: ${result.url}\n`;
    }
    if (result.text) {
      output += `\n${result.text.substring(0, 1500)}\n`;
    }
    if (result.highlights && result.highlights.length > 0) {
      output += `\nKey points:\n`;
      result.highlights.slice(0, 3).forEach((highlight) => {
        output += `• ${highlight}\n`;
      });
    }
    output += "\n---\n\n";
  });

  return output;
}

/**
 * Generic search function with full options support.
 * Use this for custom search queries that don't fit the people/company pattern.
 *
 * @param options - Search options including query, filters, and content settings
 * @returns Array of search results
 */
export async function search(
  options: ExaSearchOptions
): Promise<ExaSearchResult[]> {
  console.log(`[Exa] Generic search: "${options.query}"`);

  const requestBody: Record<string, any> = {
    query: options.query,
    numResults: options.numResults || 10,
    text: options.text !== false, // Default to true
    highlights: options.highlights !== false, // Default to true
  };

  // Add optional parameters if provided
  if (options.category) {
    requestBody.category = options.category;
  }
  if (options.includeDomains && options.includeDomains.length > 0) {
    requestBody.includeDomains = options.includeDomains;
  }
  if (options.excludeDomains && options.excludeDomains.length > 0) {
    requestBody.excludeDomains = options.excludeDomains;
  }
  if (options.startPublishedDate) {
    requestBody.startPublishedDate = options.startPublishedDate;
  }
  if (options.endPublishedDate) {
    requestBody.endPublishedDate = options.endPublishedDate;
  }

  const response = await makeExaRequest<ExaSearchResponse>(
    "/search",
    requestBody
  );

  return response.results || [];
}

/**
 * Format search results into a readable string for the Rovo agent.
 * This helps present results in a user-friendly format.
 *
 * @param results - Array of search results
 * @param entityType - Type of entity ('person' or 'company')
 * @returns Formatted string representation of results
 */
export function formatResultsForAgent(
  results: ExaSearchResult[],
  entityType: "person" | "company"
): string {
  if (results.length === 0) {
    return `No ${
      entityType === "person" ? "people" : "companies"
    } found matching your search criteria.`;
  }

  const emoji = entityType === "person" ? "👤" : "🏢";
  const header =
    entityType === "person"
      ? `Found ${results.length} people matching your search:`
      : `Found ${results.length} companies matching your search:`;

  const formattedResults = results.map((result, index) => {
    const lines = [`${emoji} **${index + 1}. ${result.title || "Unknown"}**`];

    if (result.url) {
      lines.push(`   🔗 ${result.url}`);
    }

    if (result.text) {
      // Truncate text to first 200 characters for readability
      const truncatedText =
        result.text.length > 200
          ? result.text.substring(0, 200) + "..."
          : result.text;
      lines.push(`   📝 ${truncatedText}`);
    }

    if (result.publishedDate) {
      lines.push(`   📅 ${result.publishedDate}`);
    }

    return lines.join("\n");
  });

  return `${header}\n\n${formattedResults.join("\n\n")}`;
}

/**
 * Format deep research results into a comprehensive summary.
 *
 * @param results - Array of research results
 * @param entityName - Name of the person or company
 * @param entityType - Type of entity ('person' or 'company')
 * @returns Formatted deep research summary
 */
export function formatDeepResearchForAgent(
  results: ExaSearchResult[],
  entityName: string,
  entityType: "person" | "company"
): string {
  if (results.length === 0) {
    return `No detailed information found for ${entityName}.`;
  }

  const emoji = entityType === "person" ? "👤" : "🏢";
  const header = `${emoji} **Deep Research: ${entityName}**\n`;

  // Combine all text content for a comprehensive view
  const sources: string[] = [];
  const insights: string[] = [];

  results.forEach((result, index) => {
    sources.push(`${index + 1}. ${result.title || result.url}`);

    if (result.text) {
      insights.push(result.text);
    }

    if (result.highlights && result.highlights.length > 0) {
      insights.push(...result.highlights);
    }
  });

  const formattedOutput = [
    header,
    "**Sources:**",
    sources.map((s) => `• ${s}`).join("\n"),
    "",
    "**Key Information:**",
    insights
      .slice(0, 3)
      .map((i) => `• ${i.substring(0, 500)}`)
      .join("\n\n"),
  ];

  return formattedOutput.join("\n");
}
