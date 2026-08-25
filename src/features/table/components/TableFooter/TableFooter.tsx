import { defineComponent, h, computed } from 'vue';
import { useApiResourcesStore, useExistingCoreStore } from '../../../../state';
import { buildSectionSettingsAttrs } from '../../utils';
import { TableFooterRow } from './TableFooterRow';

/**
 * TableFooter Component
 *
 * Renders the table footer section (`<tfoot>`).
 * Connects to the store to retrieve footer configuration via `displayFooter` computed property.
 * Applies logic to determine whether to display the footer based on configuration.
 */
export const TableFooter = defineComponent({
    name: 'TableFooter',
    props: {
        /**
         * The unique identifier for the store instance.
         */
        storeId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        // Store access
        const core = useExistingCoreStore(props.storeId);
        const resource = useApiResourcesStore(props.storeId, core);

        // Access the computed displayFooter logic from the store
        const footer = computed(() => resource.displayFooter);

        return () => {
            // If no footer configuration, do not render tfoot
            if (!footer.value || !footer.value.rows || footer.value.rows.length === 0) {
                return null;
            }

            // footer.settings.sticky/height → <tfoot> attributes
            const settingsAttrs = buildSectionSettingsAttrs(
                footer.value.settings,
                'aura-tfoot-sticky'
            );

            return h(
                'tfoot',
                {
                    'data-testid': 'table-footer',
                    ...settingsAttrs,
                },
                footer.value.rows.map((row, index) =>
                    h(TableFooterRow, {
                        key: index,
                        row: row,
                        rowIndex: index,
                        storeId: props.storeId,
                    })
                )
            );
        };
    },
});
