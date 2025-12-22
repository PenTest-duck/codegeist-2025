/**
 * Tofu Dashboard - Main Frontend Entry Point
 * 
 * This is the main entry point for the Tofu Jira global page.
 * It provides a dashboard for managing leads and configuring the app.
 */

import React, { useState, useEffect } from 'react';
import ForgeReconciler, {
  Box,
  Stack,
  Inline,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Text,
  Heading,
  Spinner,
  SectionMessage,
  xcss,
} from '@forge/react';
import { invoke } from '@forge/bridge';

// Import components
import { Dashboard } from './components/Dashboard';
import { LeadsManager } from './components/LeadsManager';
import { Configuration } from './components/Configuration';

// Types
import type { DashboardStats, SearchHistoryItem, Lead, TofuConfig } from '../types';

/**
 * Main App component for the Tofu global page.
 * Renders a tabbed interface with Dashboard, Leads, and Settings.
 */
const App = (): JSX.Element => {
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  
  // Configuration
  const [config, setConfig] = useState<TofuConfig | null>(null);
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load dashboard data and config in parallel
        const [dashboardData, configData] = await Promise.all([
          invoke('getDashboardData'),
          invoke('getConfig'),
        ]);
        
        const dashboard = dashboardData as {
          stats: DashboardStats;
          recentSearches: SearchHistoryItem[];
          recentLeads: Lead[];
        };
        
        setStats(dashboard.stats);
        setRecentSearches(dashboard.recentSearches);
        setRecentLeads(dashboard.recentLeads);
        setConfig(configData as TofuConfig);
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Refresh dashboard data
  const refreshDashboard = async () => {
    try {
      const dashboardData = await invoke('getDashboardData') as {
        stats: DashboardStats;
        recentSearches: SearchHistoryItem[];
        recentLeads: Lead[];
      };
      
      setStats(dashboardData.stats);
      setRecentSearches(dashboardData.recentSearches);
      setRecentLeads(dashboardData.recentLeads);
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
    }
  };
  
  // Save configuration
  const saveConfig = async (newConfig: TofuConfig): Promise<boolean> => {
    try {
      const result = await invoke('saveConfig', newConfig) as { success: boolean };
      if (result.success) {
        setConfig(newConfig);
      }
      return result.success;
    } catch (err) {
      console.error('Error saving config:', err);
      return false;
    }
  };
  
  // Show loading spinner
  if (isLoading) {
    return (
      <Box xcss={containerStyles}>
        <Stack space="space.200" alignInline="center">
          <Spinner size="large" />
          <Text>Loading Tofu Dashboard...</Text>
        </Stack>
      </Box>
    );
  }
  
  // Show error message
  if (error) {
    return (
      <Box xcss={containerStyles}>
        <SectionMessage appearance="error">
          <Text>{error}</Text>
        </SectionMessage>
      </Box>
    );
  }
  
  return (
    <Box xcss={containerStyles}>
      <Stack space="space.300">
        {/* Header */}
        <Inline space="space.100" alignBlock="center">
          <Text>🌱</Text>
          <Heading as="h2">Top-of-Funnel Lead Management</Heading>
        </Inline>
        
        {/* Tabbed Content */}
        <Tabs id="tofu-tabs">
          <TabList>
            <Tab>Dashboard</Tab>
            <Tab>Leads</Tab>
            <Tab>Settings</Tab>
          </TabList>
          
          <TabPanel>
            <Box xcss={tabPanelStyles}>
              <Dashboard
                stats={stats}
                recentSearches={recentSearches}
                recentLeads={recentLeads}
                onRefresh={refreshDashboard}
              />
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box xcss={tabPanelStyles}>
              <LeadsManager onLeadUpdated={refreshDashboard} />
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box xcss={tabPanelStyles}>
              <Configuration
                config={config}
                onSave={saveConfig}
              />
            </Box>
          </TabPanel>
        </Tabs>
      </Stack>
    </Box>
  );
};

// Styles
const containerStyles = xcss({
  padding: 'space.300',
});

const tabPanelStyles = xcss({
  paddingTop: 'space.200',
});

// Render the app
ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

