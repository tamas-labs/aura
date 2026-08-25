import { describe, it, expect } from 'vitest';
import * as publicApi from '../../index';
import type {
    Align,
    ApiResourcesStore,
    ApiResponse,
    AuraConfig,
    AuraProps,
    BaseCellConfig,
    Body,
    BodyCellConfig,
    BodySettings,
    BootstrapColor,
    CellFormattingOptions,
    CellRules,
    CellType,
    ColumnConfig,
    ConditionalConfig,
    ConditionalOperator,
    ConditionalRule,
    ConfigStore,
    CoreStore,
    ECSError,
    ErrorHandlerStore,
    ErrorSeverity,
    ErrorState,
    ErrorType,
    Footer,
    FooterCellConfig,
    FooterRow,
    FooterSettings,
    Header,
    HeaderCell,
    HeaderCellConfig,
    HeaderRow,
    HeaderSettings,
    PaginationLinks,
    PaginationMeta,
    PropValidator,
    QueryParams,
    RowRules,
    SearchItem,
    Size,
    SortDirection,
    SortItem,
} from '../../index';

/**
 * The package's public surface is a semver contract, so it is asserted rather
 * than merely documented. Both halves of this file are a gate:
 *
 * - the runtime assertion below fails if a value export is added or removed;
 * - `PublicTypes` fails `npm run type-check` if any documented type stops being
 *   importable from the package entry point.
 *
 * Changing either list means changing the published contract — update the
 * READMEs and the CHANGELOG in the same commit.
 */

/** Every type the READMEs document as importable from `@tamas-labs/aura`. */
export type PublicTypes = {
    align: Align;
    apiResourcesStore: ApiResourcesStore;
    apiResponse: ApiResponse;
    auraConfig: AuraConfig;
    auraProps: AuraProps;
    baseCellConfig: BaseCellConfig;
    body: Body;
    bodyCellConfig: BodyCellConfig;
    bodySettings: BodySettings;
    bootstrapColor: BootstrapColor;
    cellFormattingOptions: CellFormattingOptions;
    cellRules: CellRules;
    cellType: CellType;
    columnConfig: ColumnConfig;
    conditionalConfig: ConditionalConfig;
    conditionalOperator: ConditionalOperator;
    conditionalRule: ConditionalRule;
    configStore: ConfigStore;
    coreStore: CoreStore;
    ecsError: ECSError;
    errorHandlerStore: ErrorHandlerStore;
    errorSeverity: ErrorSeverity;
    errorState: ErrorState;
    errorType: ErrorType;
    footer: Footer;
    footerCellConfig: FooterCellConfig;
    footerRow: FooterRow;
    footerSettings: FooterSettings;
    header: Header;
    headerCell: HeaderCell;
    headerCellConfig: HeaderCellConfig;
    headerRow: HeaderRow;
    headerSettings: HeaderSettings;
    paginationLinks: PaginationLinks;
    paginationMeta: PaginationMeta;
    propValidator: PropValidator;
    queryParams: QueryParams;
    rowRules: RowRules;
    searchItem: SearchItem;
    size: Size;
    sortDirection: SortDirection;
    sortItem: SortItem;
};

describe('public API surface', () => {
    /** Every value export, including the plugin default export. */
    const EXPECTED_VALUE_EXPORTS = [
        'Aura',
        'AuraPlugin',
        'ErrorHandler',
        'default',
        'useApiResourcesStore',
        'useConfigStore',
        'useCoreStore',
        'useErrorHandlerStore',
    ];

    it('should export exactly the documented value exports', () => {
        expect(Object.keys(publicApi).sort()).toEqual(EXPECTED_VALUE_EXPORTS);
    });

    it('should expose the plugin as both a named and the default export', () => {
        expect(publicApi.default).toBe(publicApi.AuraPlugin);
        expect(typeof publicApi.AuraPlugin.install).toBe('function');
    });

    it('should export the components as component definitions', () => {
        expect(publicApi.Aura).toBeDefined();
        expect(publicApi.ErrorHandler).toBeDefined();
    });

    it('should export the four store factories as functions', () => {
        expect(typeof publicApi.useCoreStore).toBe('function');
        expect(typeof publicApi.useConfigStore).toBe('function');
        expect(typeof publicApi.useErrorHandlerStore).toBe('function');
        expect(typeof publicApi.useApiResourcesStore).toBe('function');
    });

    // The 0.x contract deliberately keeps the internal helpers out of the
    // package; the READMEs document them as internal architecture only.
    it('should not leak the internal utilities', () => {
        const internals = [
            'formatValue',
            'useFormattedContent',
            'resolveValue',
            'filterItemsBySearch',
            'sortItemsByRules',
            'htmlSanitizer',
            'createLazyValidator',
            'ErrorItem',
        ];

        for (const name of internals) {
            expect(publicApi).not.toHaveProperty(name);
        }
    });
});
