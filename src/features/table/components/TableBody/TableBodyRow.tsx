import { defineComponent, h, computed, type PropType } from 'vue';
import { resolveValue, readOwnEntry } from '../../../../utils';
import { resolveConditionalConfig } from '../../utils/conditions/resolve-conditional-config';
import { createMaxDepthReporter } from '../../utils/conditions/report-max-depth';
import { resolveMappingConfig } from '../../utils/conditions/resolve-mapping-config';
import { resolveFormattingStyles } from '../../utils/styles/resolveFormattingStyles';
import { isCellClickSearchGesture, resolveCellClickSearch } from '../../utils/cell-click-search';
import type { SearchPrefillTarget } from '../../../../types/store.types';
import type { FormatterInput } from '../../utils';
import { useApiResourcesStore, useExistingCoreStore } from '../../../../state';
import type { HeaderCell, ColumnConfig } from '../../../../types/api-response.types';
import type { CellFormattingOptions } from '../../../../types/api-response.types';
import type { BodyCellConfig, FieldSegment } from '../../../../types';
import { TableBodyCell } from './TableBodyCell';
import { TableSelectCell } from './TableSelectCell';

/**
 * TableBodyRow Component
 *
 * Renders a single `<tr>` element within the table body.
 * Iterates through the provided columns and renders a `TableBodyCell` for each.
 */
export const TableBodyRow = defineComponent({
    name: 'TableBodyRow',
    props: {
        /**
         * The data object for the row.
         */
        item: {
            type: Object as PropType<Record<string, unknown>>,
            required: true,
        },
        /**
         * The array of column definitions (HeaderCells) to render.
         */
        columns: {
            type: Array as PropType<HeaderCell[]>,
            required: true,
        },
        /**
         * The index of the row within the body.
         */
        rowIndex: {
            type: Number,
            required: true,
        },
        /**
         * The store ID.
         */
        storeId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        // Initialize store for body.columnConfigs access
        let apiStore: ReturnType<typeof useApiResourcesStore> | undefined;
        let coreStore: ReturnType<typeof useExistingCoreStore> | undefined;

        if (props.storeId) {
            try {
                coreStore = useExistingCoreStore(props.storeId);
                apiStore = useApiResourcesStore(props.storeId, coreStore);
            } catch {
                // Store not available
            }
        }

        // Reports a truncated (over-nested) conditional config to the error store
        const reportMaxDepth = createMaxDepthReporter(coreStore);

        /**
         * Builds field segments for a multi-field column.
         * Each field is resolved from columnConfigs (config segment) or item data (value segment).
         */
        function buildFieldSegments(
            item: Record<string, unknown>,
            fields: string[]
        ): FieldSegment[] {
            const columnConfigs = apiStore?.body?.columnConfigs;

            return fields.map((fieldName): FieldSegment => {
                // Own-key lookup: the field name comes from the response header, so a plain
                // bracket read would answer `constructor` with the `Object` function and render
                // the cell empty instead of falling through to the item-data branch.
                const config = readOwnEntry(columnConfigs, fieldName);

                if (config) {
                    const resolvedConfig = resolveConditionalConfig(
                        config as unknown as Record<string, unknown>,
                        item,
                        0,
                        reportMaxDepth
                    );

                    if (!resolvedConfig) {
                        // Condition failed and no default - render empty
                        return { type: 'config', value: '', config: undefined };
                    }

                    // Mapping resolution AFTER if/else flattening — the mapping entry (e.g. 'value'
                    // for reference) gets merged on top of the flattened config
                    const mappedConfig = resolveMappingConfig(resolvedConfig, item);

                    // Field is defined in body.columnConfigs → config segment
                    return {
                        type: 'config',
                        value: 'value' in mappedConfig ? mappedConfig.value : null,
                        config: mappedConfig as unknown as ColumnConfig,
                    };
                }

                // Field is a data field → resolve from item
                return {
                    type: 'value',
                    value: resolveValue(item, fieldName),
                };
            });
        }

        /**
         * Computes the <tr> formatting attributes from rowRules.
         * Resolves conditional config and converts to CSS classes/styles.
         */
        const rowFormattingResult = computed(() => {
            const rowRules = apiStore?.body?.rowRules;
            if (!rowRules) return null;
            const resolved = resolveConditionalConfig(
                rowRules as unknown as Record<string, unknown>,
                props.item,
                0,
                reportMaxDepth
            );
            if (!resolved) return null;
            return resolveFormattingStyles(resolved as CellFormattingOptions);
        });

        /**
         * The search input a Shift+click on this row fills (`cellClickSearch`), or `null`.
         *
         * The listener sits on the `<tr>` rather than on every cell, so the clicked column
         * is read back from the cell's `data-key`. Only a direct child cell counts: a table
         * nested inside a custom renderer carries `data-key` cells of its own.
         */
        const resolveClickSearch = (event: MouseEvent): SearchPrefillTarget | null => {
            if (!isCellClickSearchGesture(event) || !(event.target instanceof Element)) {
                return null;
            }

            const cell = event.target.closest('td[data-key]');
            if (!cell || cell.parentElement !== event.currentTarget) return null;

            const key = cell.getAttribute('data-key');
            const column = props.columns.find(candidate => candidate.key === key);
            if (!column) return null;

            return resolveCellClickSearch(column, props.item, {
                globalSearchEnabled: coreStore?.config.showHeaderSearch === true,
                globalSearchableFields: apiStore?.header?.settings?.searchableItems,
            });
        };

        const cellClickSearchListeners = {
            // Shift+mousedown would stretch the text selection up to the clicked cell.
            onMousedown: (event: MouseEvent) => {
                if (resolveClickSearch(event)) event.preventDefault();
            },
            // Only the input's text changes; the user confirms the search from there.
            onClick: (event: MouseEvent) => {
                const target = resolveClickSearch(event);
                if (target) coreStore?.requestSearchPrefill(target);
            },
        };

        /** The row's listeners — none unless the table opted into `cellClickSearch`. */
        const cellClickSearchAttrs = (): Record<string, unknown> =>
            coreStore?.config.cellClickSearch === true ? cellClickSearchListeners : {};

        return () => {
            const { item, columns, rowIndex, storeId } = props;

            return h(
                'tr',
                (() => {
                    const trAttrs: Record<string, unknown> = {
                        'data-testid': 'table-body-row',
                        'data-row-index': rowIndex,
                    };
                    if (rowFormattingResult.value) {
                        const { classes, styles } = rowFormattingResult.value;
                        if (classes.length > 0) trAttrs.class = classes;
                        if (Object.keys(styles).length > 0) trAttrs.style = styles;
                    }
                    Object.assign(trAttrs, cellClickSearchAttrs());
                    return trAttrs;
                })(),
                columns.map((column, index) => {
                    const columnConfigs = apiStore?.body?.columnConfigs;

                    // Selectable column: per-row selector checkbox.
                    if (column.selectable) {
                        return h(TableSelectCell, {
                            key: column.key,
                            cell: column,
                            item,
                            cellIndex: index,
                            storeId,
                        });
                    }

                    // Multi-field column: build segments for each field
                    if (column.fields && column.fields.length > 0) {
                        const fieldSegments = buildFieldSegments(item, column.fields);

                        return h(TableBodyCell, {
                            key: column.key,
                            columnKey: column.key,
                            cellIndex: index,
                            fieldSegments,
                            cellConfig: column,
                            cellRules:
                                readOwnEntry(columnConfigs, column.key)?.cellRules ?? undefined,
                            item,
                            storeId,
                        });
                    }

                    // Single field referencing a columnConfig entry: treat like fields: [field]
                    if (column.field && readOwnEntry(columnConfigs, column.field)) {
                        const fieldSegments = buildFieldSegments(item, [column.field]);

                        return h(TableBodyCell, {
                            key: column.key,
                            columnKey: column.key,
                            cellIndex: index,
                            fieldSegments,
                            cellConfig: column,
                            cellRules:
                                readOwnEntry(columnConfigs, column.key)?.cellRules ?? undefined,
                            item,
                            storeId,
                        });
                    }

                    // Single-field column: resolve value from item
                    const value = resolveValue(item, column.field || column.key);

                    // Resolve conditional config if applicable
                    const resolvedColumnConfig = resolveConditionalConfig(
                        column as unknown as Record<string, unknown>,
                        item,
                        0,
                        reportMaxDepth
                    );

                    // Mapping resolution AFTER if/else flattening, if there's a flattened config
                    const mappedColumnConfig = resolvedColumnConfig
                        ? resolveMappingConfig(resolvedColumnConfig, item)
                        : null;

                    return h(TableBodyCell, {
                        key: column.key,
                        columnKey: column.key,
                        cellIndex: index,
                        // resolveValue returns unknown; we narrow value to the formatValue-compatible
                        // FormatterInput (not any)
                        value: value as FormatterInput,
                        cellConfig: (mappedColumnConfig as unknown as BodyCellConfig) ?? column,
                        cellRules: readOwnEntry(columnConfigs, column.key)?.cellRules ?? undefined,
                        item,
                        storeId,
                    });
                })
            );
        };
    },
});
