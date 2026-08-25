import { defineComponent, h, computed, ref, type PropType, type VNode } from 'vue';
import { useExistingCoreStore, useApiResourcesStore } from '../../../../state';
import { watchAsyncEffect } from '../../../../utils/composables/watch-async-effect';
import type { BodyCellConfig, FieldSegment } from '../../../../types';
import type {
    ColumnConfig,
    CellRules,
    CellFormattingOptions,
    HeaderCell,
} from '../../../../types/api-response.types';
import {
    useCellStyles,
    formatValue,
    buildRawHtmlOptions,
    type DataTypesClasses,
    highlightText,
    resolveFormattingStyles,
    type CellFormatConfig,
    type FormatterInput,
} from '../../utils';
import { resolveConditionalConfig } from '../../utils/conditions/resolve-conditional-config';
import { createMaxDepthReporter } from '../../utils/conditions/report-max-depth';
import type { SegmentFormatOptions, DateStyleOption } from './segment-renderer.types';
import { renderStaticNode } from './renderStaticNode';
import { renderIconNode } from './renderIconNode';
import { renderModalNode } from './renderModalNode';
import { renderLinkNode } from './renderLinkNode';
import { renderReferenceNode } from './renderReferenceNode';
import { renderButtonNode } from './renderButtonNode';
import { renderBadgeNode } from './renderBadgeNode';
import { renderProgressNode } from './renderProgressNode';
import { renderCustomNode } from './renderCustomNode';
import { resolveGlobalClassArray } from './render-class-helpers';
import { readOwnEntry } from '../../../../utils';

/** Unified signature for FieldSegment config renderer functions. */
type SegmentRenderer = (
    config: ColumnConfig,
    options: SegmentFormatOptions
) => VNode | Promise<VNode>;

/**
 * Type → renderer dispatch table for 'config' segments.
 * Adding a new column type = one line here (not another if/else branch).
 */
const SEGMENT_RENDERERS: Record<string, SegmentRenderer> = {
    static: renderStaticNode as SegmentRenderer,
    icon: renderIconNode as SegmentRenderer,
    modal: renderModalNode as SegmentRenderer,
    link: renderLinkNode as SegmentRenderer,
    reference: renderReferenceNode as SegmentRenderer,
    button: renderButtonNode as SegmentRenderer,
    badge: renderBadgeNode as SegmentRenderer,
    progress: renderProgressNode as SegmentRenderer,
    custom: renderCustomNode as SegmentRenderer,
};

/**
 * Renders a single FieldSegment into a VNode.
 * Dispatches to type-specific renderer functions (via SEGMENT_RENDERERS) to keep complexity low.
 */
async function renderSegmentNode(
    segment: FieldSegment,
    fallbackConfig: CellFormatConfig,
    options: SegmentFormatOptions
): Promise<VNode> {
    const { locale, dateStyle, timeZone, rawHtml } = options;

    if (segment.type === 'config') {
        // Own-key lookup: `type` comes from the response, and a plain bracket read would
        // answer `constructor` with the `Object` function — truthy, callable, and returning
        // something that is not a VNode.
        const configType = segment.config?.type;
        const renderer = readOwnEntry(
            SEGMENT_RENDERERS,
            typeof configType === 'string' ? configType : null
        );
        if (renderer) {
            return renderer(segment.config as ColumnConfig, options);
        }

        const text =
            segment.value !== null && segment.value !== undefined ? String(segment.value) : '';
        return h('span', {}, text);
    }

    // Value segment
    const formatted = await formatValue(
        segment.value as string | number | boolean | null | undefined,
        fallbackConfig,
        locale,
        undefined,
        { dateStyle, timeZone, skipTypeFormatting: true, rawHtml }
    );
    return h('span', {}, formatted);
}

/**
 * TableBodyCell Component
 *
 * Renders a single `<td>` element within the table body.
 * Supports two rendering modes:
 * - Single value mode: renders a single formatted value (backward compatible)
 * - Multi-field mode: renders multiple field segments (via `fieldSegments` prop)
 */
export const TableBodyCell = defineComponent({
    name: 'TableBodyCell',
    props: {
        /**
         * The value to display in the cell (single-field mode).
         */
        value: {
            // value is consumed exclusively by formatValue, hence its type is FormatterInput.
            type: [String, Number, Boolean, Object, Date] as PropType<FormatterInput>,
            default: null,
            required: false,
        },
        /**
         * Array of field segments for multi-field cells.
         * When provided, the cell renders each segment individually.
         */
        fieldSegments: {
            type: Array as PropType<FieldSegment[]>,
            required: false,
            default: undefined,
        },
        /**
         * The unique key of the column.
         */
        columnKey: {
            type: String,
            required: true,
        },
        /**
         * The index of the cell in the row.
         */
        cellIndex: {
            type: Number,
            required: true,
        },
        /**
         * The configuration object for the cell.
         *
         * In single-field mode it's a `BodyCellConfig`. In multi-field / config-referencing
         * mode, the `HeaderCell` column is passed here: in that case we only use the
         * column-level layout/style (shared `BaseCellConfig`) fields (body-specific
         * formatting is carried by `fieldSegments`).
         */
        cellConfig: {
            type: Object as PropType<BodyCellConfig | HeaderCell>,
            required: false,
            default: undefined,
        },
        /**
         * The store ID.
         */
        storeId: {
            type: String,
            required: false,
            default: '',
        },
        /**
         * The row data object, required for cellRules condition evaluation.
         */
        item: {
            type: Object as PropType<Record<string, unknown>>,
            required: false,
            default: undefined,
        },
        /**
         * Conditional cell formatting rules resolved from body.columnConfigs[key].cellRules.
         */
        cellRules: {
            type: Object as PropType<CellRules>,
            required: false,
            default: undefined,
        },
    },
    setup(props) {
        // Initialize stores once - they are already reactive internally
        let coreStore: ReturnType<typeof useExistingCoreStore> | undefined;
        let apiStore: ReturnType<typeof useApiResourcesStore> | undefined;

        if (props.storeId) {
            try {
                // Get existing store, don't create new one with empty props
                coreStore = useExistingCoreStore(props.storeId);
                apiStore = useApiResourcesStore(props.storeId, coreStore);
            } catch {
                // Store not available
            }
        }

        // Reports a truncated (over-nested) conditional config to the error store
        const reportMaxDepth = createMaxDepthReporter(coreStore);

        // ─── Single-field mode logic ───

        // Create a safe computed config
        const safeConfig = computed<BodyCellConfig>(() => {
            // We narrow the union to the body view: the fields used come from the shared
            // BaseCellConfig layout/style set, which HeaderCell also carries.
            if (props.cellConfig) return props.cellConfig as BodyCellConfig;
            return { key: props.columnKey };
        });

        const variants = computed(() => {
            if (!coreStore) return undefined;
            return coreStore.config.variants;
        });

        const dataTypes = computed(() => {
            if (!coreStore) return undefined;
            return coreStore.config.classes?.dataTypes as DataTypesClasses | undefined;
        });

        const { styleAttributes } = useCellStyles(safeConfig, variants, dataTypes);

        // body.columnStyles[columnKey] — column-level CSS classes for the body cell.
        // The response validates this as a pass-through (string | string[]); we normalize it
        // here. Both the map and the key come from the response, so the read is own-key only.
        const columnStyleClasses = computed<string[]>(() =>
            resolveGlobalClassArray(readOwnEntry(apiStore?.body?.columnStyles, props.columnKey))
        );

        // ─── CellRules formatting ───

        /**
         * Resolves conditional cellRules and converts to CSS classes/styles.
         * Lower priority than columnConfig styles (styleAttributes).
         */
        const cellRulesFormatting = computed(() => {
            const rules = props.cellRules;
            const itemData = props.item;
            if (!rules || !itemData) return null;

            const resolved = resolveConditionalConfig(
                rules as unknown as Record<string, unknown>,
                itemData,
                0,
                reportMaxDepth
            );
            if (!resolved) return null;

            return resolveFormattingStyles(resolved as CellFormattingOptions);
        });

        const formattedContent = ref('');

        watchAsyncEffect(async isStale => {
            // Skip formatting for multi-field mode
            if (props.fieldSegments && props.fieldSegments.length > 0) return;

            // Try to get locale from store if available
            const locale = coreStore?.config.localization || 'en-US';
            const dateStyle = (coreStore?.config.dateStyle as DateStyleOption) || undefined;
            const timeZone = coreStore?.config.timeZone || undefined;
            const formatted = await formatValue(props.value, safeConfig.value, locale, undefined, {
                dateStyle,
                timeZone,
                rawHtml: coreStore ? buildRawHtmlOptions(coreStore.config) : undefined,
            });

            // A newer run has started meanwhile - its result is the current one
            if (isStale()) return;

            formattedContent.value = formatted;
        });

        const contentWithHighlight = computed(() => {
            const text = formattedContent.value;
            // Skip highlighting for raw HTML content
            if (safeConfig.value.raw) return null;
            if (!coreStore || !apiStore) return null;

            const searchTerm = apiStore.globalSearchTerm;
            const shouldHighlight = coreStore.config.highlightSearchResults;
            const highlightClass = coreStore.config.highlightClass;

            if (
                shouldHighlight &&
                searchTerm &&
                typeof searchTerm === 'string' &&
                searchTerm.trim() !== ''
            ) {
                return highlightText(String(text), searchTerm, {
                    highlightClass: highlightClass || undefined,
                    // The mark has to follow the same rule that decided this row
                    // matched, or an accent-insensitive hit would render unmarked.
                    accentInsensitive: coreStore.config.accentInsensitiveSearch === true,
                });
            }
            return null;
        });

        // ─── Multi-field mode logic ───

        const segmentContents = ref<VNode[]>([]);

        watchAsyncEffect(async isStale => {
            if (!props.fieldSegments || props.fieldSegments.length === 0) {
                segmentContents.value = [];
                return;
            }

            const options: SegmentFormatOptions = {
                locale: coreStore?.config.localization || 'en-US',
                dateStyle: (coreStore?.config.dateStyle as DateStyleOption) || undefined,
                timeZone: coreStore?.config.timeZone || undefined,
                item: props.item,
                siteName: coreStore?.config.siteName || null,
                globalClasses: coreStore?.config.classes as Record<string, unknown> | undefined,
                icons: coreStore?.config.icons as Record<string, string[]> | undefined,
                rawHtml: coreStore ? buildRawHtmlOptions(coreStore.config) : undefined,
                renderers: coreStore?.config.renderers,
                callbacks: coreStore?.config.callbacks,
            };

            const segments = await Promise.all(
                props.fieldSegments.map(segment =>
                    renderSegmentNode(segment, safeConfig.value, options)
                )
            );

            // A newer run has started meanwhile - its result is the current one
            if (isStale()) return;

            segmentContents.value = segments;
        });

        // ─── Render ───

        return () => {
            const attributes: Record<string, unknown> = {
                'data-testid': 'table-body-cell',
                'data-key': props.columnKey,
            };

            // Apply cellRules formatting (lower priority) then styleAttributes (higher priority)
            const rulesFormatting = cellRulesFormatting.value;
            if (
                rulesFormatting &&
                (rulesFormatting.classes.length > 0 ||
                    Object.keys(rulesFormatting.styles).length > 0)
            ) {
                attributes.class = [...rulesFormatting.classes, ...styleAttributes.value.class];
                attributes.style = [rulesFormatting.styles, ...styleAttributes.value.style];
            } else {
                Object.assign(attributes, styleAttributes.value);
            }

            // Append body.columnStyles base classes (lowest priority).
            const colStyles = columnStyleClasses.value;
            if (colStyles.length > 0) {
                attributes.class = Array.isArray(attributes.class)
                    ? [...attributes.class, ...colStyles]
                    : [...colStyles];
            }

            // Multi-field rendering
            if (props.fieldSegments && props.fieldSegments.length > 0) {
                return h('td', attributes, segmentContents.value);
            }

            // Handle raw HTML rendering
            if (safeConfig.value.raw) {
                return h('td', {
                    ...attributes,
                    innerHTML: formattedContent.value,
                });
            }

            // Handle highlighted content
            if (contentWithHighlight.value) {
                return h('td', {
                    ...attributes,
                    innerHTML: contentWithHighlight.value,
                });
            }

            return h('td', attributes, formattedContent.value);
        };
    },
});
