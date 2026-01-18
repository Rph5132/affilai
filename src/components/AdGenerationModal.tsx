/**
 * AdGenerationModal - Refactored for clarity
 *
 * This file has been refactored into a modular structure:
 *
 * BEFORE (this file): 468 lines, 11 useState hooks, mixed concerns
 * AFTER:
 *   - ./AdGenerationModal/index.tsx: Main component (~90 lines)
 *   - ./AdGenerationModal/components.tsx: UI sub-components
 *   - ../hooks/useAdGenerationModal.ts: State management with useReducer
 *
 * Key improvements:
 * 1. State consolidation: 11 useState → 1 useReducer with typed actions
 * 2. Separation of concerns: Business logic in hook, UI in components
 * 3. Data-driven analysis: Category-to-ad mapping replaces if-else chains
 * 4. Testability: Hook can be tested independently of UI
 *
 * This file re-exports for backwards compatibility.
 */

export { AdGenerationModal } from "./AdGenerationModal/index";
export type { GeneratedAd } from "./AdGenerationModal/index";
