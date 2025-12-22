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

// Export global page resolver
export { globalPageResolver } from "./backend/resolver";
