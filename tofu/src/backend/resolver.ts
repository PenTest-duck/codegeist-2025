/**
 * Global Page Resolver
 * 
 * This module provides the resolver functions for the Tofu global page.
 * It handles data operations between the frontend UI and backend storage/APIs.
 */

import Resolver from '@forge/resolver';
import { kvs } from '@forge/kvs';
import { getProjects, getBoards } from './jira/issues';
import type {
  TofuConfig,
  DashboardStats,
  SearchHistoryItem,
  Lead,
  PersonLead,
  CompanyLead,
  LeadStatus,
} from '../types';

// Create a new resolver instance
const resolver = new Resolver();

// ============================================================================
// Dashboard Data
// ============================================================================

/**
 * Get dashboard statistics and overview data.
 */
resolver.define('getDashboardData', async (): Promise<{
  stats: DashboardStats;
  recentSearches: SearchHistoryItem[];
  recentLeads: Lead[];
}> => {
  console.log('[Resolver] getDashboardData called');
  
  try {
    // Get stats
    const stats = await kvs.get('tofu-stats') as Partial<DashboardStats> || {};
    const searchHistory = await kvs.get('search-history') as SearchHistoryItem[] || [];
    const pendingPeopleLeads = await kvs.get('pending-leads') as PersonLead[] || [];
    const pendingCompanyLeads = await kvs.get('pending-company-leads') as CompanyLead[] || [];
    
    // Calculate stats
    const allLeads = [...pendingPeopleLeads, ...pendingCompanyLeads];
    const dashboardStats: DashboardStats = {
      totalSearches: searchHistory.length,
      totalLeadsFound: allLeads.length,
      pendingLeads: allLeads.filter(l => l.status === 'pending').length,
      acceptedLeads: allLeads.filter(l => l.status === 'accepted').length,
      leadsAddedToJira: stats.leadsAddedToJira || 0,
    };
    
    return {
      stats: dashboardStats,
      recentSearches: searchHistory.slice(0, 10),
      recentLeads: allLeads.slice(0, 10),
    };
  } catch (error) {
    console.error('[Resolver] Error getting dashboard data:', error);
    return {
      stats: {
        totalSearches: 0,
        totalLeadsFound: 0,
        pendingLeads: 0,
        acceptedLeads: 0,
        leadsAddedToJira: 0,
      },
      recentSearches: [],
      recentLeads: [],
    };
  }
});

// ============================================================================
// Search History
// ============================================================================

/**
 * Get search history with pagination.
 */
resolver.define('getSearchHistory', async ({ payload }): Promise<{
  items: SearchHistoryItem[];
  total: number;
}> => {
  console.log('[Resolver] getSearchHistory called');
  
  const { offset = 0, limit = 20 } = payload || {};
  
  try {
    const history = await kvs.get('search-history') as SearchHistoryItem[] || [];
    
    return {
      items: history.slice(offset, offset + limit),
      total: history.length,
    };
  } catch (error) {
    console.error('[Resolver] Error getting search history:', error);
    return { items: [], total: 0 };
  }
});

/**
 * Clear all search history.
 */
resolver.define('clearSearchHistory', async (): Promise<{ success: boolean }> => {
  console.log('[Resolver] clearSearchHistory called');
  
  try {
    await kvs.set('search-history', []);
    return { success: true };
  } catch (error) {
    console.error('[Resolver] Error clearing search history:', error);
    return { success: false };
  }
});

// ============================================================================
// Leads Management
// ============================================================================

/**
 * Get saved leads with filtering and pagination.
 */
resolver.define('getSavedLeads', async ({ payload }): Promise<{
  items: Lead[];
  total: number;
}> => {
  console.log('[Resolver] getSavedLeads called');
  
  const { 
    type, // 'person' | 'company' | 'all'
    status, // LeadStatus | 'all'
    offset = 0, 
    limit = 20 
  } = payload || {};
  
  try {
    const peopleLeads = await kvs.get('pending-leads') as PersonLead[] || [];
    const companyLeads = await kvs.get('pending-company-leads') as CompanyLead[] || [];
    
    let allLeads: Lead[] = [];
    
    // Filter by type
    if (type === 'person') {
      allLeads = peopleLeads;
    } else if (type === 'company') {
      allLeads = companyLeads;
    } else {
      allLeads = [...peopleLeads, ...companyLeads];
    }
    
    // Filter by status
    if (status && status !== 'all') {
      allLeads = allLeads.filter(l => l.status === status);
    }
    
    // Sort by foundAt (most recent first)
    allLeads.sort((a, b) => new Date(b.foundAt).getTime() - new Date(a.foundAt).getTime());
    
    return {
      items: allLeads.slice(offset, offset + limit),
      total: allLeads.length,
    };
  } catch (error) {
    console.error('[Resolver] Error getting saved leads:', error);
    return { items: [], total: 0 };
  }
});

/**
 * Update the status of a lead.
 */
resolver.define('updateLeadStatus', async ({ payload }): Promise<{ success: boolean }> => {
  console.log('[Resolver] updateLeadStatus called');
  
  const { leadId, leadType, newStatus } = payload || {};
  
  if (!leadId || !leadType || !newStatus) {
    return { success: false };
  }
  
  try {
    const storageKey = leadType === 'person' ? 'pending-leads' : 'pending-company-leads';
    const leads = await kvs.get(storageKey) as Lead[] || [];
    
    const updatedLeads = leads.map(lead => {
      if (lead.id === leadId) {
        return { ...lead, status: newStatus as LeadStatus };
      }
      return lead;
    });
    
    await kvs.set(storageKey, updatedLeads);
    return { success: true };
  } catch (error) {
    console.error('[Resolver] Error updating lead status:', error);
    return { success: false };
  }
});

/**
 * Delete a lead.
 */
resolver.define('deleteLead', async ({ payload }): Promise<{ success: boolean }> => {
  console.log('[Resolver] deleteLead called');
  
  const { leadId, leadType } = payload || {};
  
  if (!leadId || !leadType) {
    return { success: false };
  }
  
  try {
    const storageKey = leadType === 'person' ? 'pending-leads' : 'pending-company-leads';
    const leads = await kvs.get(storageKey) as Lead[] || [];
    
    const filteredLeads = leads.filter(lead => lead.id !== leadId);
    
    await kvs.set(storageKey, filteredLeads);
    return { success: true };
  } catch (error) {
    console.error('[Resolver] Error deleting lead:', error);
    return { success: false };
  }
});

// ============================================================================
// Configuration
// ============================================================================

/**
 * Get app configuration.
 */
resolver.define('getConfig', async (): Promise<TofuConfig> => {
  console.log('[Resolver] getConfig called');
  
  try {
    const config = await kvs.get('tofu-config') as TofuConfig | undefined;
    return config || {
      defaultResultCount: 10,
      autoSaveResults: true,
    };
  } catch (error) {
    console.error('[Resolver] Error getting config:', error);
    return {
      defaultResultCount: 10,
      autoSaveResults: true,
    };
  }
});

/**
 * Save app configuration.
 */
resolver.define('saveConfig', async ({ payload }): Promise<{ success: boolean }> => {
  console.log('[Resolver] saveConfig called');
  
  const config = payload as TofuConfig;
  
  if (!config) {
    return { success: false };
  }
  
  try {
    await kvs.set('tofu-config', config);
    return { success: true };
  } catch (error) {
    console.error('[Resolver] Error saving config:', error);
    return { success: false };
  }
});

// ============================================================================
// Jira Data
// ============================================================================

/**
 * Get available Jira projects for configuration.
 */
resolver.define('getJiraProjects', async (): Promise<Array<{ key: string; name: string }>> => {
  console.log('[Resolver] getJiraProjects called');
  
  try {
    const projects = await getProjects();
    return projects.map(p => ({ key: p.key, name: p.name }));
  } catch (error) {
    console.error('[Resolver] Error getting Jira projects:', error);
    return [];
  }
});

/**
 * Get available Jira boards for configuration.
 */
resolver.define('getJiraBoards', async (): Promise<Array<{ id: number; name: string; type: string }>> => {
  console.log('[Resolver] getJiraBoards called');
  
  try {
    return await getBoards();
  } catch (error) {
    console.error('[Resolver] Error getting Jira boards:', error);
    return [];
  }
});

// Export the resolver handler
export const globalPageResolver = resolver.getDefinitions();

