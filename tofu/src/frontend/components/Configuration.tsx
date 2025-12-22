/**
 * Configuration Component
 *
 * Allows users to configure Tofu settings like default project,
 * result count, and other preferences.
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Inline,
  Text,
  Heading,
  Button,
  Select,
  Textfield,
  Toggle,
  Label,
  SectionMessage,
  Spinner,
  xcss,
} from "@forge/react";
import { invoke, showFlag } from "@forge/bridge";

import type { TofuConfig } from "../../types";

interface ConfigurationProps {
  config: TofuConfig | null;
  onSave: (config: TofuConfig) => Promise<boolean>;
}

interface JiraProject {
  key: string;
  name: string;
}

export const Configuration = ({
  config,
  onSave,
}: ConfigurationProps): JSX.Element => {
  // Local state for form
  const [defaultProjectKey, setDefaultProjectKey] = useState<string>(
    config?.defaultProjectKey || ""
  );
  const [defaultResultCount, setDefaultResultCount] = useState<number>(
    config?.defaultResultCount || 10
  );
  const [autoSaveResults, setAutoSaveResults] = useState<boolean>(
    config?.autoSaveResults !== false
  );

  // Projects list
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Load Jira projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoadingProjects(true);
        const result = (await invoke("getJiraProjects")) as JiraProject[];
        setProjects(result || []);
      } catch (err) {
        console.error("Error loading projects:", err);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  // Update local state when config prop changes
  useEffect(() => {
    if (config) {
      setDefaultProjectKey(config.defaultProjectKey || "");
      setDefaultResultCount(config.defaultResultCount || 10);
      setAutoSaveResults(config.autoSaveResults !== false);
    }
  }, [config]);

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);

    const newConfig: TofuConfig = {
      defaultProjectKey: defaultProjectKey || undefined,
      defaultResultCount,
      autoSaveResults,
    };

    const success = await onSave(newConfig);

    setIsSaving(false);

    if (success) {
      showFlag({
        id: "config-saved-" + Date.now(),
        title: "Settings saved",
        type: "success",
        description: "Your Tofu configuration has been updated.",
        isAutoDismiss: true,
      });
    } else {
      showFlag({
        id: "config-error-" + Date.now(),
        title: "Error saving settings",
        type: "error",
        description: "Failed to save configuration. Please try again.",
        isAutoDismiss: true,
      });
    }
  };

  // Clear search history
  const handleClearHistory = async () => {
    try {
      const result = (await invoke("clearSearchHistory")) as {
        success: boolean;
      };

      if (result.success) {
        showFlag({
          id: "history-cleared-" + Date.now(),
          title: "History cleared",
          type: "success",
          description: "Search history has been cleared.",
          isAutoDismiss: true,
        });
      }
    } catch (err) {
      console.error("Error clearing history:", err);
      showFlag({
        id: "history-error-" + Date.now(),
        title: "Error",
        type: "error",
        description: "Failed to clear search history.",
        isAutoDismiss: true,
      });
    }
  };

  // Project options for select
  const projectOptions = [
    { label: "No default (ask each time)", value: "" },
    ...(projects || []).map((p: JiraProject) => ({
      label: `${p.key} - ${p.name}`,
      value: p.key,
    })),
  ];

  // Result count options
  const resultCountOptions = [
    { label: "5 results", value: "5" },
    { label: "10 results", value: "10" },
    { label: "15 results", value: "15" },
    { label: "20 results", value: "20" },
    { label: "25 results", value: "25" },
  ];

  return (
    <Stack space="space.300">
      {/* Jira Integration */}
      <Stack space="space.200">
        <Heading as="h3">Jira Integration</Heading>

        <Stack space="space.100">
          <Label labelFor="default-project">Default Project for Leads</Label>
          {isLoadingProjects ? (
            <Inline space="space.100" alignBlock="center">
              <Spinner size="small" />
              <Text>Loading projects...</Text>
            </Inline>
          ) : (
            <Select
              inputId="default-project"
              options={projectOptions}
              value={
                projectOptions.find((o) => o.value === defaultProjectKey) ||
                projectOptions[0]
              }
              onChange={(option) =>
                setDefaultProjectKey((option as any)?.value || "")
              }
            />
          )}
          <Text>
            When adding leads to Jira, this project will be used by default.
          </Text>
        </Stack>
      </Stack>

      {/* Search Settings */}
      <Stack space="space.200">
        <Heading as="h3">Search Settings</Heading>

        <Stack space="space.100">
          <Label labelFor="result-count">Default Number of Results</Label>
          <Select
            inputId="result-count"
            options={resultCountOptions}
            value={
              resultCountOptions.find(
                (o) => o.value === String(defaultResultCount)
              ) || resultCountOptions[1]
            }
            onChange={(option) =>
              setDefaultResultCount(
                parseInt((option as any)?.value || "10", 10)
              )
            }
          />
          <Text>
            Number of results to fetch when searching for people or companies.
          </Text>
        </Stack>

        <Inline space="space.200" alignBlock="center">
          <Toggle
            id="auto-save"
            isChecked={autoSaveResults}
            onChange={() => setAutoSaveResults(!autoSaveResults)}
          />
          <Label labelFor="auto-save">Automatically save search results</Label>
        </Inline>
        <Text>
          When enabled, all search results will be saved for review in the Leads
          tab.
        </Text>
      </Stack>

      {/* Data Management */}
      <Stack space="space.200">
        <Heading as="h3">Data Management</Heading>

        <Button appearance="subtle" onClick={handleClearHistory}>
          Clear Search History
        </Button>
        <Text>Remove all saved search queries from history.</Text>
      </Stack>

      {/* Save Button */}
      <Box xcss={saveButtonContainerStyles}>
        <Button appearance="primary" onClick={handleSave} isDisabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </Box>

      {/* Help Section */}
      <SectionMessage appearance="information">
        <Stack space="space.100">
          <Text>Need help?</Text>
          <Text>
            Open Rovo Chat and ask @Tofu for assistance with searching or
            configuration.
          </Text>
        </Stack>
      </SectionMessage>
    </Stack>
  );
};

// Styles
const saveButtonContainerStyles = xcss({
  paddingTop: "space.200",
});
