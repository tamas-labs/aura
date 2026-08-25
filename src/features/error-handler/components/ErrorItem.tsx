import { defineComponent, h, type PropType } from 'vue';
import type { ECSError } from '../../../types/error.types';
import type { AuraLabels } from '../../../types/config.types';
import { DEFAULT_LABELS } from '../../../lib/default-values.lib';
import { isFallbackErrorKey } from '../../../lib/error-key.lib';

/** Token replaced by the occurrence count in the repeat badge's tooltip */
const COUNT_TOKEN = '{count}';

/**
 * ErrorItem component
 * Displays a single error using Bootstrap alert style
 */
export const ErrorItem = defineComponent({
    name: 'ErrorItem',
    props: {
        error: {
            type: Object as PropType<ECSError>,
            required: true,
        },
        onDismiss: {
            type: Function as PropType<() => void>,
            default: undefined,
        },
        /**
         * Overridable UI texts (`config.labels`). Missing keys fall back to
         * `DEFAULT_LABELS`, so a partial object is enough.
         */
        labels: {
            type: Object as PropType<Partial<AuraLabels>>,
            default: () => DEFAULT_LABELS,
        },
    },
    setup(props) {
        /**
         * Determine the Bootstrap variant based on severity
         */
        const getAlertVariant = (severity: ECSError['severity']): string => {
            const variantMap: Record<ECSError['severity'], string> = {
                critical: 'danger',
                error: 'danger',
                warning: 'warning',
                info: 'info',
                debug: 'secondary',
            };
            return variantMap[severity] || 'secondary';
        };

        /**
         * Determine the icon based on severity
         */
        const getSeverityIcon = (severity: ECSError['severity']): string => {
            const iconMap: Record<ECSError['severity'], string> = {
                critical: 'fa-solid fa-circle-xmark',
                error: 'fa-solid fa-circle-exclamation',
                warning: 'fa-solid fa-triangle-exclamation',
                info: 'fa-solid fa-circle-info',
                debug: 'fa-solid fa-bug',
            };
            return iconMap[severity] || 'fa-solid fa-circle-info';
        };

        return () => {
            const { error, onDismiss, labels } = props;
            const variant = getAlertVariant(error.severity);
            const icon = getSeverityIcon(error.severity);

            const alertClasses = [
                'alert',
                `alert-${variant}`,
                onDismiss ? 'alert-dismissible fade show' : '',
            ]
                .filter(Boolean)
                .join(' ');

            const children = [
                // Icon and main message
                h('i', { class: `${icon} me-2`, 'aria-hidden': 'true' }),
                h('strong', {}, error.message),
            ];

            // Show details if present
            if (error.details) {
                children.push(
                    h('div', { class: 'mt-1' }, [
                        h('small', { class: 'text-muted' }, error.details),
                    ])
                );
            }

            // Show badges
            //
            // The key badge is skipped for generated keys: those are built from
            // `component.action.type`, so the badge would only repeat the two
            // badges next to it in an internal-looking dotted form. A
            // caller-supplied key (a config key or column name) stays visible.
            const showKeyBadge = Boolean(error.key) && !isFallbackErrorKey(error);

            // The repeat counter is a number and a multiplication sign, so it
            // needs no `labels` entry to stay readable in any language.
            const repeatCount = error.count ?? 1;

            children.push(
                h(
                    'div',
                    { class: 'mt-2' },
                    [
                        h('span', { class: `badge bg-${variant} me-1` }, error.severity),
                        h('span', { class: 'badge bg-secondary me-1' }, error.component),
                        h('span', { class: 'badge bg-secondary me-1' }, error.type),
                        showKeyBadge &&
                            h('span', { class: 'badge bg-info text-dark me-1' }, error.key),
                        repeatCount > 1 &&
                            h(
                                'span',
                                {
                                    class: `badge bg-${variant}`,
                                    'data-testid': 'error-count',
                                    title: (
                                        labels.errorOccurrences ?? DEFAULT_LABELS.errorOccurrences
                                    ).replace(COUNT_TOKEN, String(repeatCount)),
                                },
                                `×${repeatCount}`
                            ),
                    ].filter(Boolean)
                )
            );

            // Dismiss button if onDismiss is present
            if (onDismiss) {
                children.push(
                    h('button', {
                        type: 'button',
                        class: 'btn-close',
                        'aria-label': labels.close ?? DEFAULT_LABELS.close,
                        onClick: onDismiss,
                        'data-testid': 'error-dismiss',
                    })
                );
            }

            return h(
                'div',
                {
                    class: alertClasses,
                    role: 'alert',
                    'data-testid': 'error-item',
                },
                children
            );
        };
    },
});
