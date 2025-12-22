# Tofu

![Tofu logo](images/tofu.png)

**Top-of-funnel sourcing for talent & leads, without leaving Jira!**

Tofu brings powerful AI-powered people and company search directly into your Jira workflow. Search for candidates, prospects, and companies using natural language in Rovo chat, then seamlessly track promising leads as Jira issues—all without context switching between tools.

## Inspiration

Recruiters and sales teams face a constant friction: they live in Jira for project management and task tracking, but must jump between LinkedIn, Crunchbase, Google, and other tools to find talent and leads. This context switching kills productivity, creates data silos, and makes it hard to track the full journey from initial discovery to conversion.

**Tofu solves this by bringing top-of-funnel sourcing directly into Jira**—where teams already work. Instead of leaving Jira to search for "Senior React developers in San Francisco" or "Series B fintech startups," users can simply ask Rovo's Tofu agent in natural language. The agent finds relevant people and companies using Exa's semantic search, presents results in chat, and lets users instantly create Jira issues to track promising leads. Everything stays in one place, with full visibility and traceability.

## What it does

Tofu is a **Rovo-powered AI agent** that transforms how teams discover and track talent and leads:

* **Natural Language Search**: Ask Tofu in Rovo chat to find people or companies—"Find software engineers with AI/ML experience" or "Search for Series A startups in the fintech space." Tofu uses Exa's semantic search to return relevant results with profiles, summaries, and source links.

* **Deep Research**: Get comprehensive background on specific people or companies. Tofu performs focused research using Exa's deep search capabilities, aggregating information from multiple sources into actionable insights.

* **Seamless Jira Integration**: Convert promising leads into Jira issues with one command. Tofu creates issues with structured descriptions, labels, and links, making it easy to track leads through your existing workflows.

* **Lead Management Dashboard**: Review, filter, and manage all discovered leads in a dedicated Jira global page. Track status (pending, accepted, rejected, contacted), view search history, and see statistics on your sourcing activity—all without leaving Jira.

* **Smart Storage**: All searches and leads are automatically saved to Forge storage, creating a searchable history and enabling quick access to previously discovered candidates and companies.

## How we built it

Tofu is built entirely on **Atlassian Forge**, leveraging the platform's native capabilities for security, scalability, and seamless integration:

**Architecture:**
* **Rovo Agent** (`tofu-agent`): A conversational AI agent that understands natural language queries and orchestrates search and research actions. The agent uses a carefully crafted prompt to guide interactions and format results clearly.

* **Exa AI Integration**: Custom client that interfaces with Exa's semantic search API. We use Exa's `people` and `company` categories for optimized search, with full-text content extraction and highlights for rich lead descriptions.

* **Forge Functions**: Backend handlers for each Rovo action:
  - `searchPeople`: Searches Exa's people index (1B+ profiles) and formats results
  - `searchCompanies`: Searches company profiles with industry and technology filters
  - `deepResearch`: Performs focused research on specific entities
  - `addToBoard`: Creates Jira issues with ADF-formatted descriptions

* **Forge Storage**: Uses Key-Value Storage to persist:
  - Search history with timestamps and result counts
  - Discovered leads with status tracking
  - Dashboard statistics (total searches, leads found, added to Jira)

* **Jira REST API Integration**: Uses `asUser()` to create issues with proper permissions, automatically detecting project issue types and formatting descriptions in Atlassian Document Format (ADF).

* **UI Kit Dashboard**: A global page built with Forge UI Kit components (`DynamicTable`, `Stack`, `Lozenge`, etc.) that displays statistics, search history, and lead management—all using native Atlassian design tokens.

**Key Technical Decisions:**
- **Semantic Search**: Chose Exa over traditional keyword search for better understanding of intent (e.g., "AI/ML engineers" vs. exact phrase matching)
- **Rovo Integration**: Leveraged Rovo's natural language understanding to eliminate the need for complex query parsing
- **Storage Strategy**: Used KVS for simplicity and speed, with automatic deduplication by URL
- **Permission Model**: Used `asUser()` for Jira operations to respect user permissions and project access

## Challenges we ran into

**Balancing Simplicity with Power**: The biggest challenge was creating an interface simple enough for non-technical users while maintaining the flexibility to handle complex queries. We solved this by leveraging Rovo's natural language understanding—users can ask naturally, and the agent handles the complexity.

**Semantic Search Tuning**: Getting Exa search results that matched user intent required careful query construction and result formatting. We iterated on query enhancement (e.g., adding context like "Detailed profile and background information about...") and result presentation to ensure relevance.

**Lead Deduplication**: Preventing duplicate leads when the same person or company appears in multiple searches required smart URL-based deduplication and status tracking across search sessions.

**Jira Issue Creation**: Different projects have different issue types and required fields. We implemented automatic issue type detection with fallbacks, preferring "Task" but gracefully handling projects with different configurations.

**Storage Limits**: Forge KVS has size limits, so we implemented automatic pruning (keeping max 200 leads) and efficient data structures to stay within constraints while maintaining performance.

## Accomplishments that we're proud of

* **Zero Context Switching**: Successfully eliminated the need to leave Jira for top-of-funnel sourcing. Users can discover, research, and track leads entirely within their existing workflow.

* **Natural Language Interface**: Built a Rovo agent that understands complex queries like "Find sales leaders at enterprise SaaS companies" without requiring structured input or query builders.

* **Seamless Integration**: Created a true native Jira experience—leads become Jira issues with proper formatting, labels, and links, making them first-class citizens in project workflows.

* **Production-Ready Architecture**: Built on Forge's managed runtime with proper error handling, logging, and permission management. The app is ready for Marketplace distribution.

* **Comprehensive Dashboard**: Delivered a full-featured dashboard that provides visibility into sourcing activity, lead pipeline, and search history—all using native Atlassian UI components.

* **Meets RunsOnAtlassian Requirements**: Built entirely on Forge with Atlassian-hosted runtime, native security model, and designed for Marketplace distribution.

## What we learned

**Natural Language > Structured Forms**: Users prefer asking "Find React developers in SF" over filling out dropdowns and checkboxes. Rovo's conversational interface dramatically reduces friction compared to traditional search UIs.

**Semantic Search Changes Everything**: Exa's ability to understand intent (not just keywords) means users can search the way they think—"AI startups with Series B funding" instead of constructing boolean queries.

**Context Matters**: Bringing sourcing into Jira where teams already work creates a natural workflow. Leads discovered in chat can immediately become tracked issues, maintaining full context from discovery to conversion.

**Storage Simplicity**: Forge KVS is perfect for this use case—fast, simple, and sufficient for lead management. We didn't need complex databases; a well-structured key-value store with deduplication logic was enough.

**User Trust Through Transparency**: Showing search sources (URLs, dates) and allowing users to review before creating Jira issues builds confidence. The dashboard's search history also helps users understand what was found and when.

## What's next for Tofu

* **Advanced Filtering**: Add filters for location, company size, funding stage, and skills directly in the Rovo conversation.

* **Bulk Actions**: Allow users to accept or reject multiple leads at once, and create multiple Jira issues in a single operation.

* **Lead Enrichment**: Automatically pull additional data (LinkedIn profiles, company websites, recent news) when creating Jira issues to provide richer context.

* **Board Integration**: Allow users to specify which Jira board column to add leads to, enabling direct integration with Kanban workflows.

* **Notifications**: Send Jira notifications when new leads matching saved search criteria are discovered.

* **Export & Reporting**: Export lead lists and generate sourcing reports for recruiting and sales teams.

* **Team Collaboration**: Share lead lists and search queries with team members, enabling collaborative sourcing.

## Built With

* **Atlassian Forge** - Platform and runtime
* **Rovo** - AI agent framework
* **Exa AI** - Semantic search API
* **Jira Cloud REST API** - Issue creation and project management
* **Forge UI Kit** - Native Atlassian components
* **Node.js** - Backend runtime
* **TypeScript** - Type-safe development

## Try it out

Install Tofu from the [Atlassian Marketplace](https://marketplace.atlassian.com) and start sourcing talent and leads without leaving Jira!

**Quick Start:**
1. Open Rovo Chat in Jira
2. Mention `@Tofu` and ask: "Find software engineers with AI/ML experience"
3. Review results in chat
4. Say "Add [name] to board" to create a Jira issue
5. Visit the Tofu Dashboard (Jira → Apps → Tofu Dashboard) to manage all your leads
