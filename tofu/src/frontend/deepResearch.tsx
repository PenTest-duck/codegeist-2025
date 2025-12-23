/**
 * Deep Research UI Component
 *
 * This component provides the UI for the Deep Research issue action.
 * It shows progress while research is being performed and displays
 * the results with a link to the created Confluence page.
 */

import React, { useState, useEffect } from "react";
import ForgeReconciler, {
  Box,
  Stack,
  Inline,
  Text,
  Heading,
  Button,
  Spinner,
  SectionMessage,
  Link,
  xcss,
} from "@forge/react";
import { invoke } from "@forge/bridge";
import { useProductContext } from "@forge/react";

/**
 * Result from the deep research operation
 */
interface DeepResearchResult {
  success: boolean;
  message: string;
  pageUrl?: string;
  pageTitle?: string;
}

/**
 * Main Deep Research UI component
 */
const DeepResearchApp = (): JSX.Element => {
  // Get the current issue context
  const context = useProductContext();

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [result, setResult] = useState<DeepResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get the issue key from context
  const issueKey = (context?.extension as any)?.issue?.key;

  /**
   * Start the deep research process
   */
  const startResearch = async () => {
    setIsLoading(true);
    setHasStarted(true);
    setError(null);
    setResult(null);

    try {
      const response = (await invoke("performDeepResearch", {
        issueKey,
      })) as DeepResearchResult;

      setResult(response);
    } catch (err) {
      console.error("Deep research failed:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // If no issue key, show error
  if (!issueKey) {
    return (
      <Box xcss={containerStyles}>
        <SectionMessage appearance="error">
          <Text>Could not determine the current issue. Please try again.</Text>
        </SectionMessage>
      </Box>
    );
  }

  // Initial state - show start button
  if (!hasStarted) {
    return (
      <Box xcss={containerStyles}>
        <Stack space="space.200">
          <Heading as="h3">🔍 Deep Research</Heading>
          <Text>
            This will perform comprehensive AI-powered research on this lead and
            create a Confluence page with the results.
          </Text>
          <SectionMessage appearance="information">
            <Text>
              Note: This action is only available for issues with the
              &quot;tofu-lead&quot; label. The research may take 30-60 seconds
              to complete.
            </Text>
          </SectionMessage>
          <Box xcss={buttonContainerStyles}>
            <Button appearance="primary" onClick={startResearch}>
              Start Deep Research
            </Button>
          </Box>
        </Stack>
      </Box>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Box xcss={containerStyles}>
        <Stack space="space.200" alignInline="center">
          <Spinner size="large" />
          <Heading as="h3">Researching...</Heading>
          <Text>
            Performing deep research using AI. This may take 30-60 seconds.
          </Text>
          <Text>Please wait while we gather comprehensive information...</Text>
        </Stack>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box xcss={containerStyles}>
        <Stack space="space.200">
          <Heading as="h3">❌ Research Failed</Heading>
          <SectionMessage appearance="error">
            <Text>{error}</Text>
          </SectionMessage>
          <Box xcss={buttonContainerStyles}>
            <Button appearance="primary" onClick={startResearch}>
              Try Again
            </Button>
          </Box>
        </Stack>
      </Box>
    );
  }

  // Success state
  if (result) {
    if (result.success) {
      return (
        <Box xcss={containerStyles}>
          <Stack space="space.200">
            <Heading as="h3">✅ Research Complete</Heading>
            <SectionMessage appearance="success">
              <Stack space="space.100">
                <Text>{result.message}</Text>
                {result.pageUrl && (
                  <Inline space="space.100" alignBlock="center">
                    <Text>📄 View research:</Text>
                    <Link href={result.pageUrl} openNewTab>
                      {result.pageTitle || "Research Page"}
                    </Link>
                  </Inline>
                )}
              </Stack>
            </SectionMessage>
            <Text>
              A comment has been added to this issue with the link to the
              research page.
            </Text>
          </Stack>
        </Box>
      );
    } else {
      return (
        <Box xcss={containerStyles}>
          <Stack space="space.200">
            <Heading as="h3">⚠️ Research Incomplete</Heading>
            <SectionMessage appearance="warning">
              <Text>{result.message}</Text>
            </SectionMessage>
            <Box xcss={buttonContainerStyles}>
              <Button appearance="primary" onClick={startResearch}>
                Try Again
              </Button>
            </Box>
          </Stack>
        </Box>
      );
    }
  }

  // Fallback - should not reach here
  return (
    <Box xcss={containerStyles}>
      <Text>Loading...</Text>
    </Box>
  );
};

// Styles
const containerStyles = xcss({
  padding: "space.300",
  minWidth: "300px",
});

const buttonContainerStyles = xcss({
  paddingTop: "space.100",
});

// Render the app
ForgeReconciler.render(
  <React.StrictMode>
    <DeepResearchApp />
  </React.StrictMode>
);

