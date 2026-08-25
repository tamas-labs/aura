import { defineComponent, computed, h, type PropType } from 'vue';
import type { ErrorSeverity, ErrorType, ECSError } from '../../types/error.types';
import type { AuraLabels } from '../../types/config.types';
import { DEFAULT_LABELS } from '../../lib/default-values.lib';
import { ErrorItem } from './components/ErrorItem';

/** The token substituted in the `dismissAllErrors` / `hiddenErrors` label templates. */
const COUNT_TOKEN = '{count}';

/**
 * Error Handler Store interface
 * The store type returned by useErrorHandlerStore
 */
interface ErrorHandlerStore {
    errors: ECSError[];
    hasErrors: boolean;
    isValid: boolean;
    clearErrors: () => void;
    clearByKey: (key: string) => void;
    clearByComponent: (component: string) => void;
    clearByType: (type: ErrorType) => void;
}

/**
 * ErrorHandler component
 * Displays errors to the user
 *
 * @example
 * ```tsx
 * <ErrorHandler
 *     errorStore={errorStore}
 *     showDismissAll={true}
 *     maxVisible={5}
 * />
 * ```
 */
export const ErrorHandler = defineComponent({
    name: 'ErrorHandler',
    props: {
        /**
         * Error handler store instance
         */
        errorStore: {
            type: Object as PropType<ErrorHandlerStore>,
            required: true,
        },
        /**
         * Maximum number of errors to display
         * If there are more errors, a summary is shown
         */
        maxVisible: {
            type: Number,
            default: 5,
        },
        /**
         * Whether to show the "Dismiss all" button
         */
        showDismissAll: {
            type: Boolean,
            default: true,
        },
        /**
         * Severity filter - only errors with the given severity are shown
         */
        severityFilter: {
            type: Array as PropType<ErrorSeverity[]>,
            default: () => ['critical', 'error', 'warning'],
        },
        /**
         * Component identifier for dismiss operations
         */
        componentFilter: {
            type: String,
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
         * Filtered errors
         */
        const filteredErrors = computed(() => {
            let errors = [...props.errorStore.errors];

            // Filter by severity
            if (props.severityFilter && props.severityFilter.length > 0) {
                errors = errors.filter(e => props.severityFilter.includes(e.severity));
            }

            // Filter by component
            if (props.componentFilter) {
                errors = errors.filter(e => e.component === props.componentFilter);
            }

            return errors;
        });

        /**
         * Visible errors (limited by maxVisible)
         */
        const visibleErrors = computed(() => {
            return filteredErrors.value.slice(0, props.maxVisible);
        });

        /**
         * Number of hidden errors
         */
        const hiddenErrorCount = computed(() => {
            return Math.max(0, filteredErrors.value.length - props.maxVisible);
        });

        /**
         * Dismiss an error by key
         */
        const dismissError = (key: string | undefined) => {
            if (key) {
                props.errorStore.clearByKey(key);
            }
        };

        /**
         * Dismiss all errors
         */
        const dismissAll = () => {
            if (props.componentFilter) {
                props.errorStore.clearByComponent(props.componentFilter);
            } else {
                props.errorStore.clearErrors();
            }
        };

        return () => {
            // If there are no errors, render nothing
            if (filteredErrors.value.length === 0) {
                return null;
            }

            const children = [];

            // List of errors - simple alert style
            visibleErrors.value.forEach((error, index) => {
                children.push(
                    h(ErrorItem, {
                        key: error.key || `error-${index}`,
                        error,
                        onDismiss: error.key ? () => dismissError(error.key) : undefined,
                        labels: props.labels,
                    })
                );
            });

            // Hidden errors summary
            if (hiddenErrorCount.value > 0) {
                children.push(
                    h(
                        'div',
                        {
                            class: 'alert alert-secondary alert-dismissible fade show',
                            role: 'alert',
                            'data-testid': 'hidden-errors',
                        },
                        [
                            h('i', { class: 'fa-solid fa-ellipsis me-2', 'aria-hidden': 'true' }),
                            (props.labels.hiddenErrors ?? DEFAULT_LABELS.hiddenErrors).replace(
                                COUNT_TOKEN,
                                String(hiddenErrorCount.value)
                            ),
                        ]
                    )
                );
            }

            // "Dismiss all" button after the last alert, if there is more than one error
            if (props.showDismissAll && filteredErrors.value.length > 1) {
                children.push(
                    h('div', { class: 'd-flex justify-content-end mb-3' }, [
                        h(
                            'button',
                            {
                                type: 'button',
                                class: 'btn btn-sm btn-outline-secondary',
                                onClick: dismissAll,
                                'data-testid': 'dismiss-all',
                            },
                            [
                                h('i', { class: 'fa-solid fa-xmark me-1', 'aria-hidden': 'true' }),
                                (
                                    props.labels.dismissAllErrors ?? DEFAULT_LABELS.dismissAllErrors
                                ).replace(COUNT_TOKEN, String(filteredErrors.value.length)),
                            ]
                        ),
                    ])
                );
            }

            return h(
                'div',
                {
                    class: 'error-handler mb-3',
                    'data-testid': 'error-handler',
                },
                children
            );
        };
    },
});
