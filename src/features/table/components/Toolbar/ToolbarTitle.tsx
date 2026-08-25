import { defineComponent, h } from 'vue';
import { useExistingCoreStore } from '../../../../state';

/**
 * ToolbarTitle Component
 * Displays the title or logo in the toolbar.
 *
 * @example
 * ```tsx
 * <ToolbarTitle storeId="my-store" />
 * ```
 */
export const ToolbarTitle = defineComponent({
    name: 'ToolbarTitle',
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
        const core = useExistingCoreStore(props.storeId);

        return () => {
            // Placeholder shown until the host sets `toolbarTitleContent` (that config key
            // is the override path, so this fallback needs no `labels` entry).
            const titleContent = core.config.toolbarTitleContent || 'Logo/Title';

            return h(
                'h5',
                {
                    class: 'mb-0 fw-semibold',
                    'data-testid': 'toolbar-title',
                },
                titleContent
            );
        };
    },
});
