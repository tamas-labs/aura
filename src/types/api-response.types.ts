/**
 * API response type definitions — barrel.
 *
 * The type definitions were split into cohesive modules under `./api/` (2026-07-09,
 * file-split refactor). This file re-exports them so the public import path
 * (`@/types/api-response.types`) stays stable — no consumer import breaks.
 *
 * @see ./api/primitives.types    — common literal/scalar types
 * @see ./api/query.types         — sort/search/filter/query request types
 * @see ./api/conditional.types   — conditional-rendering (if/else) types
 * @see ./api/formatting.types    — cell/content formatting option types
 * @see ./api/column-configs      — per-column-type config union (ColumnConfig)
 * @see ./api/structure.types     — header/body/footer structure types
 * @see ./api/response.types      — ApiResponse + ApiResourcesStore
 */

export * from './api/primitives.types';
export * from './api/query.types';
export * from './api/conditional.types';
export * from './api/formatting.types';
export * from './api/column-configs';
export * from './api/structure.types';
export * from './api/response.types';
