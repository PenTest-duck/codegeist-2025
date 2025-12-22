/**
 * Search Companies Action
 *
 * This Rovo action searches for companies using the Exa AI search API.
 * It's optimized for sales prospecting and market research.
 */

import {
  searchCompanies as exaSearchCompanies,
  formatResultsForAgent,
} from "../exa/client";
import { kvs } from "@forge/kvs";
import type {
  SearchHistoryItem,
  CompanyLead,
  ExaSearchResult,
} from "../../types";

/**
 * Payload received from the Rovo agent
 */
interface SearchCompaniesPayload {
  /** The natural language search query */
  query: string;
  /** Number of results to return (optional, defaults to 10) */
  numResults?: number;
  /** Context information from Atlassian products */
  context?: {
    cloudId?: string;
    moduleKey?: string;
  };
}

/**
 * Convert Exa search result to a CompanyLead object for storage
 */
function resultToCompanyLead(result: ExaSearchResult): CompanyLead {
  return {
    id:
      result.id ||
      `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: "company",
    name: result.title || "Unknown",
    website: result.url,
    summary: result.text?.substring(0, 500),
    foundAt: new Date().toISOString(),
    source: result.url || "Exa Search",
    status: "pending",
  };
}

/**
 * Save search to history for dashboard display
 */
async function saveSearchToHistory(
  query: string,
  resultCount: number
): Promise<void> {
  try {
    // Get existing history
    const history =
      ((await kvs.get("search-history")) as SearchHistoryItem[]) || [];

    // Create new history item
    const historyItem: SearchHistoryItem = {
      id: `search-${Date.now()}`,
      query,
      searchType: "companies",
      timestamp: new Date().toISOString(),
      resultCount,
    };

    // Add to beginning of history (most recent first), keep last 50
    const updatedHistory = [historyItem, ...history].slice(0, 50);

    await kvs.set("search-history", updatedHistory);
    console.log(`[SearchCompanies] Saved search to history: "${query}"`);
  } catch (error) {
    console.error("[SearchCompanies] Failed to save search history:", error);
  }
}

/**
 * Save leads to storage for later review in dashboard
 */
async function saveLeadsToStorage(leads: CompanyLead[]): Promise<void> {
  try {
    // Get existing pending leads
    const existingLeads =
      ((await kvs.get("pending-company-leads")) as CompanyLead[]) || [];

    // Add new leads (avoiding duplicates by URL)
    const existingUrls = new Set(existingLeads.map((l) => l.website));
    const newLeads = leads.filter((l) => !existingUrls.has(l.website));

    const updatedLeads = [...newLeads, ...existingLeads].slice(0, 200); // Keep max 200

    await kvs.set("pending-company-leads", updatedLeads);
    console.log(
      `[SearchCompanies] Saved ${newLeads.length} new leads to storage`
    );
  } catch (error) {
    console.error("[SearchCompanies] Failed to save leads:", error);
  }
}

/**
 * Main handler for the search-companies Rovo action.
 *
 * This function is invoked by the Rovo agent when a user wants to search for companies.
 * It searches using Exa's company search capability and returns formatted results.
 *
 * @param payload - The action payload containing the search query
 * @returns Formatted search results for the agent to display
 */
export async function searchCompanies(
  payload: SearchCompaniesPayload
): Promise<string> {
  console.log(
    `[SearchCompanies] Action invoked with payload: ${JSON.stringify(
      payload,
      null,
      2
    )}`
  );

  const { query, numResults = 10 } = payload;

  // Validate input
  if (!query || query.trim().length === 0) {
    return 'Please provide a search query describing the type of companies you want to find. For example: "AI startups with Series B funding" or "Healthcare SaaS companies in Europe"';
  }

  try {
    // Perform the search using Exa
    const results = await exaSearchCompanies(query, numResults);

    // Save search to history
    await saveSearchToHistory(query, results.length);

    // Convert results to leads and save for dashboard
    if (results.length > 0) {
      const leads = results.map(resultToCompanyLead);
      await saveLeadsToStorage(leads);
    }

    // Format results for the agent to display
    const formattedResults = formatResultsForAgent(results, "company");

    // Add helpful follow-up suggestions
    const followUp =
      results.length > 0
        ? '\n\n💡 **Next steps:**\n• Ask me to research any specific company for more details\n• Say "add [company name] to board" to create a Jira issue for tracking'
        : "\n\n💡 **Tips:**\n• Try a more specific query with industry, funding stage, or location\n• Use different keywords to broaden your search";

    return formattedResults + followUp;
  } catch (error) {
    console.error("[SearchCompanies] Error during search:", error);

    // Return a user-friendly error message
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return `Sorry, I encountered an error while searching for companies: ${errorMessage}\n\nPlease try again or rephrase your search query.`;
  }
}
