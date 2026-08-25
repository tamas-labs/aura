import type { App, Plugin } from 'vue';
import { Aura } from './src';
import type { AuraConfig } from './src/types/config.types';
import './src/styles/index.scss';

// Named export of the plugin object
export const AuraPlugin: Plugin = {
    install(app: App, config: AuraConfig = {}) {
        // Store the global config so every table instance can read it
        app.config.globalProperties.$aura = config;

        app.component('Aura', Aura);
    },
};

// Default export for backward compatibility
export default AuraPlugin;

/*
 * ---------------------------------------------------------------------------
 * Public API surface
 * ---------------------------------------------------------------------------
 * Everything re-exported below is a semver-covered contract: it may only change
 * in a breaking way with a major version bump, and every name here is documented
 * in `README.en.md` / `README.hu.md`.
 *
 * Exports are listed explicitly rather than with `export *` on purpose — a
 * wildcard would silently widen the contract whenever an internal barrel gains
 * a new name. Anything not listed here is internal: importable from the source
 * tree during development, but NOT from the published package.
 *
 * Deliberately internal for the 0.x series (documented in the READMEs as
 * internal architecture): `formatValue`, `useFormattedContent`, `resolveValue`,
 * `filterItemsBySearch`, `sortItemsByRules`, `htmlSanitizer`,
 * `createLazyValidator`, the `location` helpers and the `ErrorItem` component.
 */

// --- Components ---
export { Aura } from './src';
export { ErrorHandler } from './src/features/error-handler';

// --- Store factories ---
// The component exposes no emits and no `expose()`, so these are the only
// programmatic way for a host app to read table state or trigger a refetch.
export {
    useCoreStore,
    useConfigStore,
    useErrorHandlerStore,
    useApiResourcesStore,
} from './src/state';

// --- Types ---
export type {
    // Config and props
    AuraConfig,
    AuraProps,
    PropValidator,
    // Stores
    CoreStore,
    ConfigStore,
    ErrorHandlerStore,
    ApiResourcesStore,
    // Error handling
    ECSError,
    ErrorSeverity,
    ErrorType,
    ErrorState,
    // Cell configuration
    BaseCellConfig,
    HeaderCellConfig,
    BodyCellConfig,
    FooterCellConfig,
    // API response structure
    ApiResponse,
    Header,
    HeaderRow,
    HeaderCell,
    HeaderSettings,
    Body,
    BodySettings,
    Footer,
    FooterRow,
    FooterSettings,
    ColumnConfig,
    CellType,
    PaginationMeta,
    PaginationLinks,
    // Query (sorting / searching / request payload)
    QueryParams,
    SortItem,
    SortDirection,
    SearchItem,
    // Conditional rendering and formatting
    ConditionalOperator,
    ConditionalConfig,
    ConditionalRule,
    CellFormattingOptions,
    CellRules,
    RowRules,
    // Primitives
    BootstrapColor,
    Align,
    Size,
} from './src/types';
