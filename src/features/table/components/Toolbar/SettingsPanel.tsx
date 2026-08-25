import { defineComponent, h } from 'vue';

/**
 * SettingsPanel Component
 * Collapsible panel for table settings (columns, filters).
 *
 * @remarks
 * The panel content is still a **placeholder** — the column-visibility and filter controls
 * are not implemented yet. Its texts are therefore plain English literals rather than
 * `labels` keys: they disappear with the real implementation, and every text that survives
 * it should get its own `AuraLabels` key then.
 *
 * @example
 * ```tsx
 * <SettingsPanel isOpen={true} />
 * ```
 */
export const SettingsPanel = defineComponent({
    name: 'SettingsPanel',
    props: {
        isOpen: {
            type: Boolean,
            required: true,
        },
    },
    setup(props) {
        return () => {
            return h(
                'div',
                {
                    class: ['collapse', { show: props.isOpen }],
                    'data-testid': 'settings-panel',
                },
                [
                    h('div', { class: 'card card-body mt-2 bg-light' }, [
                        h('div', { class: 'row' }, [
                            h('div', { class: 'col-md-6 mb-3' }, [
                                h('h6', {}, 'Column visibility'),
                                h(
                                    'p',
                                    { class: 'small text-muted' },
                                    'Placeholder for the column settings'
                                ),
                            ]),
                            h('div', { class: 'col-md-6' }, [
                                h('h6', {}, 'Active filters'),
                                h(
                                    'p',
                                    { class: 'small text-muted' },
                                    'Placeholder for the filter settings'
                                ),
                            ]),
                        ]),
                    ]),
                ]
            );
        };
    },
});
