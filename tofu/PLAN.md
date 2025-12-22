# Tofu

Top-of-funnel sourcing for talent and leads, right inside Jira!

## Overview

Tofu is a TOFU (top of funnel) people and company search tool.
It is an Atlassian Forge app that uses Jira and Rovo agents + Exa search (people & company search).

Recruiters could use Tofu to easily search for talent directly within Rovo chat.
Salespeople could use Tofu to easily search for and find companies and/or people directly within Rovo chat.

The user should be able to open up the Tofu Rovo agent, ask a natural language search for people and/or companies, then the agent should use Exa search to find them, present it to the user for review, and allow the user to ask it to put them in a specific column of a Jira board.

Furthermore, there should be a global app panel which allows the user to configure Tofu and see a useful dashboard. The dashboard could be a place where the initial search results are displayed and the user can easily review, accept/reject and manage the companies/people. This may require using Forge's storage capabilities such as SQL/KVs.

Moreover, the user should be able to perform deep research (powered by Exa) on a specific company or person. The user might highlight a name for this, or just ask within the Rovo agent itself.

## Further Notes

I have already done `forge create` to create a new empty skeleton Forge app. There is a dummy `manifest.yml` set up which you should modify.

I have already configured exaApiKey as a forge variable (in both dev and prod environments) using `forge variables set` with the key `exaApiKey`.

Read the current Atlassian Forge (there is an MCP server for this) and Exa documentations if you are ever unsure. See the /examples directory for examples of existing Forge apps that use Rovo.

Use best practices when coding, especially with regards to Forge apps. Use Atlassian UI Kit.

