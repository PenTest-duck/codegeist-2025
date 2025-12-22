/**
 * Dashboard Component
 *
 * Displays overview statistics, recent searches, and recent leads
 * for the Tofu app.
 */

import React from "react";
import {
  Box,
  Stack,
  Inline,
  Text,
  Heading,
  Button,
  Badge,
  Lozenge,
  DynamicTable,
  SectionMessage,
  xcss,
} from "@forge/react";

import type { DashboardStats, SearchHistoryItem, Lead } from "../../types";

interface DashboardProps {
  stats: DashboardStats | null;
  recentSearches: SearchHistoryItem[];
  recentLeads: Lead[];
  onRefresh: () => void;
}

/**
 * Format a date string to a relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Stat Card component for displaying a single metric
 */
const StatCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}): JSX.Element => (
  <Box xcss={statCardStyles}>
    <Stack space="space.050" alignInline="center">
      <Text>{icon}</Text>
      <Heading as="h3">{value}</Heading>
      <Text>{label}</Text>
    </Stack>
  </Box>
);

export const Dashboard = ({
  stats,
  recentSearches,
  recentLeads,
  onRefresh,
}: DashboardProps): JSX.Element => {
  // If no stats available, show empty state
  if (!stats) {
    return (
      <SectionMessage appearance="information">
        <Text>
          No data available yet. Start searching with the Tofu agent to see your
          dashboard!
        </Text>
      </SectionMessage>
    );
  }

  // Prepare search history table data
  const searchHistoryHead = {
    cells: [
      { key: "query", content: "Search Query" },
      { key: "type", content: "Type" },
      { key: "results", content: "Results" },
      { key: "time", content: "Time" },
    ],
  };

  const searchHistoryRows = (recentSearches || []).map((search, index) => ({
    key: `search-${index}`,
    cells: [
      {
        key: "query",
        content:
          search.query.substring(0, 50) +
          (search.query.length > 50 ? "..." : ""),
      },
      {
        key: "type",
        content: (
          <Lozenge
            appearance={search.searchType === "people" ? "new" : "inprogress"}
          >
            {search.searchType}
          </Lozenge>
        ),
      },
      { key: "results", content: String(search.resultCount) },
      { key: "time", content: formatRelativeTime(search.timestamp) },
    ],
  }));

  // Prepare recent leads table data
  const leadsHead = {
    cells: [
      { key: "name", content: "Name" },
      { key: "type", content: "Type" },
      { key: "status", content: "Status" },
      { key: "found", content: "Found" },
    ],
  };

  const leadsRows = (recentLeads || []).map((lead, index) => ({
    key: `lead-${index}`,
    cells: [
      {
        key: "name",
        content:
          lead.name.substring(0, 40) + (lead.name.length > 40 ? "..." : ""),
      },
      {
        key: "type",
        content: <Text>{lead.type === "person" ? "👤" : "🏢"}</Text>,
      },
      {
        key: "status",
        content: (
          <Lozenge
            appearance={
              lead.status === "accepted"
                ? "success"
                : lead.status === "rejected"
                ? "removed"
                : lead.status === "contacted"
                ? "inprogress"
                : "default"
            }
          >
            {lead.status}
          </Lozenge>
        ),
      },
      { key: "found", content: formatRelativeTime(lead.foundAt) },
    ],
  }));

  return (
    <Stack space="space.300">
      {/* Refresh Button */}
      <Inline space="space.100" alignBlock="center" spread="space-between">
        <Text>Overview of your lead generation activity</Text>
        <Button appearance="subtle" onClick={onRefresh}>
          Refresh
        </Button>
      </Inline>

      {/* Stats Cards */}
      <Inline space="space.200" alignBlock="stretch">
        <StatCard
          label="Total Searches"
          value={stats.totalSearches}
          icon="🔍"
        />
        <StatCard label="Leads Found" value={stats.totalLeadsFound} icon="📋" />
        <StatCard label="Pending Review" value={stats.pendingLeads} icon="⏳" />
        <StatCard
          label="Added to Jira"
          value={stats.leadsAddedToJira}
          icon="✅"
        />
      </Inline>

      {/* Recent Searches */}
      <Stack space="space.100">
        <Heading as="h3">Recent Searches</Heading>
        {searchHistoryRows.length > 0 ? (
          <DynamicTable
            head={searchHistoryHead}
            rows={searchHistoryRows}
            rowsPerPage={5}
          />
        ) : (
          <SectionMessage appearance="information">
            <Text>
              No searches yet. Use the Tofu agent to search for people or
              companies!
            </Text>
          </SectionMessage>
        )}
      </Stack>

      {/* Recent Leads */}
      <Stack space="space.100">
        <Heading as="h3">Recent Leads</Heading>
        {leadsRows.length > 0 ? (
          <DynamicTable head={leadsHead} rows={leadsRows} rowsPerPage={5} />
        ) : (
          <SectionMessage appearance="information">
            <Text>
              No leads found yet. Search results will appear here automatically.
            </Text>
          </SectionMessage>
        )}
      </Stack>

      {/* Quick Tips */}
      <SectionMessage appearance="discovery">
        <Stack space="space.100">
          <Text>Quick Tips:</Text>
          <Text>
            Open Rovo Chat and mention @Tofu to start searching for leads
          </Text>
          <Text>
            Try: &quot;Find software engineers with AI/ML experience&quot;
          </Text>
        </Stack>
      </SectionMessage>
    </Stack>
  );
};

// Styles
const statCardStyles = xcss({
  backgroundColor: "elevation.surface.sunken",
  padding: "space.200",
  borderRadius: "border.radius",
  textAlign: "center",
});
