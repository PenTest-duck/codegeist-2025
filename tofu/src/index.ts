/**
 * Main Entry Point
 *
 * This file exports all handlers for the Tofu Forge app.
 * Forge uses these exports to wire up the function handlers
 * defined in manifest.yml.
 *
 * Note: We use explicit named exports instead of `export * from` because
 * Forge's static analysis (forge lint) cannot trace through barrel exports.
 */

// Export Rovo action handlers
export { searchPeople } from "./backend/actions/searchPeople";
export { searchCompanies } from "./backend/actions/searchCompanies";
export { deepResearch } from "./backend/actions/deepResearch";
export { addToBoard } from "./backend/actions/addToBoard";

// Export Jira issue action resolver
export { deepResearchResolver } from "./backend/actions/issueDeepResearch";

// Export global page resolver
export { globalPageResolver } from "./backend/resolver";

// Export async event consumer
export { handler as deepResearchConsumer } from "./backend/consumers/deepResearchConsumer";
