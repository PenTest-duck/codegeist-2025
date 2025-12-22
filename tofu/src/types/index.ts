/**
 * Type definitions for Tofu app
 * Shared types used across frontend and backend
 */

// ============================================================================
// Exa API Types
// ============================================================================

/**
 * Represents a search result from Exa API
 */
export interface ExaSearchResult {
  /** Unique identifier for the result */
  id: string;
  /** Title of the result */
  title: string;
  /** URL of the source */
  url: string;
  /** Published date if available */
  publishedDate?: string;
  /** Author information if available */
  author?: string;
  /** Text content/snippet */
  text?: string;
  /** Highlighted text snippets */
  highlights?: string[];
  /** Relevance score */
  score?: number;
}

/**
 * Response from Exa search API
 */
export interface ExaSearchResponse {
  /** Array of search results */
  results: ExaSearchResult[];
  /** The query that was searched */
  query?: string;
  /** Total number of results available */
  autopromptString?: string;
}

/**
 * Options for Exa search requests
 */
export interface ExaSearchOptions {
  /** Natural language search query */
  query: string;
  /** Number of results to return */
  numResults?: number;
  /** Category filter: "people", "company", etc. */
  category?: "people" | "company" | "news" | "pdf" | "tweet" | "research paper";
  /** Whether to include full text content */
  text?: boolean;
  /** Whether to include highlights */
  highlights?: boolean;
  /** Domains to include */
  includeDomains?: string[];
  /** Domains to exclude */
  excludeDomains?: string[];
  /** Start date filter (ISO format) */
  startPublishedDate?: string;
  /** End date filter (ISO format) */
  endPublishedDate?: string;
}

// ============================================================================
// Lead Types
// ============================================================================

/**
 * Type of lead entity
 */
export type LeadType = "person" | "company";

/**
 * Represents a person lead
 */
export interface PersonLead {
  /** Unique identifier */
  id: string;
  /** Entity type */
  type: "person";
  /** Person's name */
  name: string;
  /** Job title */
  title?: string;
  /** Current company */
  company?: string;
  /** Location */
  location?: string;
  /** Profile URL (LinkedIn, personal site, etc.) */
  profileUrl?: string;
  /** Brief summary/bio */
  summary?: string;
  /** Skills or expertise */
  skills?: string[];
  /** When this lead was found */
  foundAt: string;
  /** Source of the lead */
  source: string;
  /** Status: pending review, accepted, rejected */
  status: LeadStatus;
}

/**
 * Represents a company lead
 */
export interface CompanyLead {
  /** Unique identifier */
  id: string;
  /** Entity type */
  type: "company";
  /** Company name */
  name: string;
  /** Industry */
  industry?: string;
  /** Company size */
  size?: string;
  /** Headquarters location */
  location?: string;
  /** Company website */
  website?: string;
  /** Brief description */
  summary?: string;
  /** Funding stage */
  fundingStage?: string;
  /** Technologies used */
  technologies?: string[];
  /** When this lead was found */
  foundAt: string;
  /** Source of the lead */
  source: string;
  /** Status: pending review, accepted, rejected */
  status: LeadStatus;
}

/**
 * Union type for all lead types
 */
export type Lead = PersonLead | CompanyLead;

/**
 * Status of a lead in the pipeline
 */
export type LeadStatus = "pending" | "accepted" | "rejected" | "contacted";

// ============================================================================
// Search History Types
// ============================================================================

/**
 * Represents a saved search query
 */
export interface SearchHistoryItem {
  /** Unique identifier */
  id: string;
  /** The search query */
  query: string;
  /** Type of search: people or companies */
  searchType: "people" | "companies";
  /** When the search was performed */
  timestamp: string;
  /** Number of results found */
  resultCount: number;
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * App configuration settings
 */
export interface TofuConfig {
  /** Default Jira project key for creating leads */
  defaultProjectKey?: string;
  /** Default issue type for leads */
  defaultIssueType?: string;
  /** Number of results to fetch by default */
  defaultResultCount: number;
  /** Whether to auto-save search results */
  autoSaveResults: boolean;
}

/**
 * Default configuration values - used as fallback
 */
export type DefaultConfig = {
  readonly defaultResultCount: 10;
  readonly autoSaveResults: true;
};

// ============================================================================
// Resolver Request/Response Types
// ============================================================================

/**
 * Request payload for search actions
 */
export interface SearchRequest {
  query: string;
  numResults?: number;
}

/**
 * Request payload for deep research action
 */
export interface DeepResearchRequest {
  query: string;
  entityType: "person" | "company";
}

/**
 * Request payload for add-to-board action
 */
export interface AddToBoardRequest {
  name: string;
  entityType: "person" | "company";
  summary: string;
  sourceUrl?: string;
  projectKey?: string;
}

/**
 * Response from add-to-board action
 */
export interface AddToBoardResponse {
  success: boolean;
  issueKey?: string;
  issueUrl?: string;
  error?: string;
}

// ============================================================================
// Dashboard Types
// ============================================================================

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  /** Total searches performed */
  totalSearches: number;
  /** Total leads found */
  totalLeadsFound: number;
  /** Leads pending review */
  pendingLeads: number;
  /** Leads accepted */
  acceptedLeads: number;
  /** Leads added to Jira */
  leadsAddedToJira: number;
}

/**
 * Resolver function names for frontend-backend communication
 */
export type ResolverFunctions = {
  readonly GET_DASHBOARD_DATA: "getDashboardData";
  readonly GET_SEARCH_HISTORY: "getSearchHistory";
  readonly GET_SAVED_LEADS: "getSavedLeads";
  readonly SAVE_LEAD: "saveLead";
  readonly UPDATE_LEAD_STATUS: "updateLeadStatus";
  readonly DELETE_LEAD: "deleteLead";
  readonly GET_CONFIG: "getConfig";
  readonly SAVE_CONFIG: "saveConfig";
  readonly CLEAR_SEARCH_HISTORY: "clearSearchHistory";
};
