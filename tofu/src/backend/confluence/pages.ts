/**
 * Confluence Pages Helper
 *
 * This module provides helper functions for creating and managing Confluence pages.
 * Used to create research documentation pages from Exa deep research results.
 *
 * Note: This module provides two sets of functions:
 * - asUser() functions: For use in resolvers where user context is available
 * - asApp() functions: For use in async event consumers where no user context exists
 */

import { asUser, asApp, route } from "@forge/api";

/**
 * Options for creating a Confluence page
 */
interface CreatePageOptions {
  /** The space key where the page should be created */
  spaceKey: string;
  /** The title of the page */
  title: string;
  /** The body content in Confluence storage format (XHTML) or ADF */
  body: string;
  /** Optional parent page ID */
  parentId?: string;
  /** Content format: 'storage' (XHTML) or 'atlas_doc_format' (ADF) */
  format?: "storage" | "atlas_doc_format";
}

/**
 * Response from creating a Confluence page
 */
interface ConfluencePageResponse {
  id: string;
  title: string;
  status: string;
  _links: {
    webui: string;
    self: string;
    base?: string;
  };
}

/**
 * Confluence space info
 */
interface ConfluenceSpace {
  id: string;
  key: string;
  name: string;
  type: string;
}

/**
 * Get the base URL for the current Confluence site.
 * We'll construct it from the space's _links if available.
 */
async function getConfluenceBaseUrl(): Promise<string> {
  try {
    const response = await asUser().requestConfluence(
      route`/wiki/api/v2/spaces?limit=1`
    );
    if (response.ok) {
      const data = (await response.json()) as {
        results: Array<{ _links?: { webui?: string } }>;
        _links?: { base?: string };
      };
      // Try to extract base URL from the response _links
      if (data._links?.base) {
        return data._links.base;
      }
      // Otherwise, we'll rely on relative URLs
      return "";
    }
  } catch (error) {
    console.warn("[Confluence] Could not get base URL:", error);
  }
  return "";
}

/**
 * Get available Confluence spaces the user has access to.
 * Returns a list of spaces for selection.
 */
export async function getSpaces(): Promise<ConfluenceSpace[]> {
  try {
    console.log("[Confluence] Fetching available spaces");

    const response = await asUser().requestConfluence(
      route`/wiki/api/v2/spaces?limit=25&sort=name`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Confluence] Error fetching spaces: ${response.status} - ${errorText}`
      );
      return [];
    }

    const data = (await response.json()) as { results: ConfluenceSpace[] };
    return data.results || [];
  } catch (error) {
    console.error("[Confluence] Error getting spaces:", error);
    return [];
  }
}

/**
 * Get the first available space as a default.
 */
export async function getDefaultSpaceKey(): Promise<string | null> {
  const spaces = await getSpaces();
  if (spaces.length > 0 && spaces[0]) {
    console.log(`[Confluence] Using default space: ${spaces[0].key}`);
    return spaces[0].key;
  }
  return null;
}

// ============================================================================
// App-context functions (for async event consumers)
// These use asApp() since there's no user context in async consumers
// ============================================================================

/**
 * Get available Confluence spaces using app permissions.
 * Use this in async event consumers where user context is not available.
 */
export async function getSpacesAsApp(): Promise<ConfluenceSpace[]> {
  try {
    console.log("[Confluence] Fetching available spaces (asApp)");

    const response = await asApp().requestConfluence(
      route`/wiki/api/v2/spaces?limit=25&sort=name`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Confluence] Error fetching spaces (asApp): ${response.status} - ${errorText}`
      );
      return [];
    }

    const data = (await response.json()) as { results: ConfluenceSpace[] };
    console.log(`[Confluence] Found ${data.results?.length || 0} spaces`);
    return data.results || [];
  } catch (error) {
    console.error("[Confluence] Error getting spaces (asApp):", error);
    return [];
  }
}

/**
 * Get the first available space as a default using app permissions.
 * Use this in async event consumers.
 */
export async function getDefaultSpaceKeyAsApp(): Promise<string | null> {
  const spaces = await getSpacesAsApp();
  if (spaces.length > 0 && spaces[0]) {
    console.log(`[Confluence] Using default space (asApp): ${spaces[0].key}`);
    return spaces[0].key;
  }
  return null;
}

/**
 * Create a new Confluence page with the given content.
 *
 * @param options - The page creation options
 * @returns The created page info with URL, or null if failed
 */
export async function createPage(
  options: CreatePageOptions
): Promise<{ pageId: string; pageUrl: string; title: string } | null> {
  const { spaceKey, title, body, parentId, format = "storage" } = options;

  console.log(`[Confluence] Creating page "${title}" in space ${spaceKey}`);

  try {
    // First, get the space ID from the space key
    const spaceResponse = await asUser().requestConfluence(
      route`/wiki/api/v2/spaces?keys=${spaceKey}&limit=1`
    );

    if (!spaceResponse.ok) {
      const errorText = await spaceResponse.text();
      console.error(
        `[Confluence] Error finding space: ${spaceResponse.status} - ${errorText}`
      );
      return null;
    }

    const spaceData = (await spaceResponse.json()) as {
      results: Array<{ id: string }>;
    };
    if (!spaceData.results || spaceData.results.length === 0) {
      console.error(`[Confluence] Space not found: ${spaceKey}`);
      return null;
    }

    const spaceId = spaceData.results[0]?.id;
    if (!spaceId) {
      console.error(`[Confluence] Could not get space ID for: ${spaceKey}`);
      return null;
    }

    // Build the page creation payload for v2 API
    const pagePayload: Record<string, unknown> = {
      spaceId,
      status: "current",
      title,
      body: {
        representation: format,
        value: body,
      },
    };

    // Add parent if specified
    if (parentId) {
      pagePayload.parentId = parentId;
    }

    console.log(
      `[Confluence] Page payload: ${JSON.stringify(pagePayload, null, 2)}`
    );

    // Create the page using v2 API
    const response = await asUser().requestConfluence(
      route`/wiki/api/v2/pages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pagePayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Confluence] Error creating page: ${response.status} - ${errorText}`
      );
      return null;
    }

    const page = (await response.json()) as ConfluencePageResponse;
    console.log(`[Confluence] Successfully created page: ${page.id}`);

    // Construct the full page URL
    const baseUrl = await getConfluenceBaseUrl();
    const pageUrl = baseUrl
      ? `${baseUrl}/wiki${page._links.webui}`
      : page._links.webui;

    return {
      pageId: page.id,
      pageUrl,
      title: page.title,
    };
  } catch (error) {
    console.error("[Confluence] Exception creating page:", error);
    return null;
  }
}

/**
 * Create a new Confluence page using app permissions.
 * Use this in async event consumers where user context is not available.
 *
 * @param options - The page creation options
 * @returns The created page info with URL, or null if failed
 */
export async function createPageAsApp(
  options: CreatePageOptions
): Promise<{ pageId: string; pageUrl: string; title: string } | null> {
  const { spaceKey, title, body, parentId, format = "storage" } = options;

  console.log(
    `[Confluence] Creating page "${title}" in space ${spaceKey} (asApp)`
  );

  try {
    // First, get the space ID from the space key
    const spaceResponse = await asApp().requestConfluence(
      route`/wiki/api/v2/spaces?keys=${spaceKey}&limit=1`
    );

    if (!spaceResponse.ok) {
      const errorText = await spaceResponse.text();
      console.error(
        `[Confluence] Error finding space (asApp): ${spaceResponse.status} - ${errorText}`
      );
      return null;
    }

    const spaceData = (await spaceResponse.json()) as {
      results: Array<{ id: string }>;
    };
    if (!spaceData.results || spaceData.results.length === 0) {
      console.error(`[Confluence] Space not found (asApp): ${spaceKey}`);
      return null;
    }

    const spaceId = spaceData.results[0]?.id;
    if (!spaceId) {
      console.error(
        `[Confluence] Could not get space ID (asApp) for: ${spaceKey}`
      );
      return null;
    }

    // Build the page creation payload for v2 API
    const pagePayload: Record<string, unknown> = {
      spaceId,
      status: "current",
      title,
      body: {
        representation: format,
        value: body,
      },
    };

    // Add parent if specified
    if (parentId) {
      pagePayload.parentId = parentId;
    }

    console.log(
      `[Confluence] Page payload (asApp): ${JSON.stringify(
        pagePayload,
        null,
        2
      )}`
    );

    // Create the page using v2 API
    const response = await asApp().requestConfluence(
      route`/wiki/api/v2/pages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pagePayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Confluence] Error creating page (asApp): ${response.status} - ${errorText}`
      );
      return null;
    }

    const page = (await response.json()) as ConfluencePageResponse;
    console.log(`[Confluence] Successfully created page (asApp): ${page.id}`);

    // Construct the full page URL
    // Note: We can't get baseUrl with asApp easily, so use relative URL
    const pageUrl = page._links.webui;

    return {
      pageId: page.id,
      pageUrl,
      title: page.title,
    };
  } catch (error) {
    console.error("[Confluence] Exception creating page (asApp):", error);
    return null;
  }
}

/**
 * Convert markdown-style research output to Confluence storage format (XHTML).
 * This provides basic conversion for common markdown patterns.
 *
 * @param markdown - The markdown content to convert
 * @param leadName - The name of the lead being researched
 * @param entityType - Whether this is a person or company
 * @returns Confluence storage format HTML
 */
export function convertResearchToStorageFormat(
  markdown: string | unknown,
  leadName: string,
  entityType: "person" | "company"
): string {
  const emoji = entityType === "person" ? "👤" : "🏢";
  const typeLabel = entityType === "person" ? "Person" : "Company";

  // Safety check: ensure markdown is a string
  let markdownStr: string;
  if (typeof markdown === "string") {
    markdownStr = markdown;
  } else if (markdown) {
    console.warn(
      `[Confluence] convertResearchToStorageFormat received non-string input (${typeof markdown}), converting...`
    );
    markdownStr = JSON.stringify(markdown, null, 2);
  } else {
    markdownStr = "No research content available.";
  }

  // Start with a header panel
  let html = `
<ac:structured-macro ac:name="info">
  <ac:rich-text-body>
    <p><strong>${emoji} ${typeLabel} Lead Research</strong></p>
    <p>This page contains AI-generated research about <strong>${escapeHtml(
      leadName
    )}</strong>.</p>
    <p><em>Generated by Tofu on ${new Date().toLocaleDateString()}</em></p>
  </ac:rich-text-body>
</ac:structured-macro>

<h1>Research: ${escapeHtml(leadName)}</h1>
`;

  // Convert the markdown content
  let content = markdownStr;

  // Convert bold: **text** -> <strong>text</strong>
  content = content.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Convert italic: *text* -> <em>text</em>
  content = content.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");

  // Convert headers: ## Header -> <h2>Header</h2>
  content = content.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  content = content.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  content = content.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Convert bullet points: - item -> <li>item</li>
  // First, wrap consecutive bullet points in <ul>
  content = content.replace(/(?:^[-•] .+$\n?)+/gm, (match) => {
    const items = match
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const text = line.replace(/^[-•] /, "").trim();
        return `<li>${text}</li>`;
      })
      .join("\n");
    return `<ul>\n${items}\n</ul>\n`;
  });

  // Convert numbered lists: 1. item -> <li>item</li>
  content = content.replace(/(?:^\d+\. .+$\n?)+/gm, (match) => {
    const items = match
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const text = line.replace(/^\d+\. /, "").trim();
        return `<li>${text}</li>`;
      })
      .join("\n");
    return `<ol>\n${items}\n</ol>\n`;
  });

  // Convert links: [text](url) -> <a href="url">text</a>
  content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Convert horizontal rules: --- -> <hr/>
  content = content.replace(/^---+$/gm, "<hr/>");

  // Convert double newlines to paragraph breaks
  const paragraphs = content.split(/\n\n+/);
  content = paragraphs
    .map((p) => {
      const trimmed = p.trim();
      // Don't wrap if already wrapped in HTML tags
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<p")
      ) {
        return trimmed;
      }
      // Wrap plain text in paragraphs
      if (trimmed.length > 0) {
        return `<p>${trimmed.replace(/\n/g, "<br/>")}</p>`;
      }
      return "";
    })
    .filter((p) => p.length > 0)
    .join("\n\n");

  html += content;

  // Add a footer with metadata
  html += `
<hr/>
<ac:structured-macro ac:name="note">
  <ac:rich-text-body>
    <p><strong>About this research</strong></p>
    <p>This research was generated using Exa AI's research capabilities. 
    The information should be verified before taking action.</p>
  </ac:rich-text-body>
</ac:structured-macro>
`;

  return html;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
