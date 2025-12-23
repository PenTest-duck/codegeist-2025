/**
 * Backend Index
 *
 * This file exports all backend handlers for Forge functions.
 * Each export corresponds to a function defined in manifest.yml.
 */

// Export Rovo action handlers
export { searchPeople } from "./actions/searchPeople";
export { searchCompanies } from "./actions/searchCompanies";
export { deepResearch } from "./actions/deepResearch";
export { addToBoard } from "./actions/addToBoard";

// Export global page resolver
export { globalPageResolver } from "./resolver";

// Export async event consumer
export { handler as deepResearchConsumer } from "./consumers/deepResearchConsumer";
