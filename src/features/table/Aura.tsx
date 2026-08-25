import {
    defineComponent,
    getCurrentInstance,
    h,
    onMounted,
    computed,
    ref,
    type ComponentPublicInstance,
    type VNode,
} from 'vue';
import { defaultValidators } from '../../validators';
import { useApiResourcesStore, useCoreStore } from '../../state';
import { type AuraProps } from '../../types';
import type { AuraConfig } from '../../types/config.types';
import { validateStoreId } from '../../validators';
import { defaultConfigLib } from '../../lib/default-config.lib';
import { LOADING_OVERLAY_DELAY_MS } from '../../lib/default-values.lib';
import { useDelayedFlag } from '../../utils/composables/useDelayedFlag';
import { useReservedHeight } from './utils/composables';
import {
    renderBlockingErrorState,
    renderDestroyModal,
    renderPagination,
    renderTableArea,
    renderToolbar,
    renderWarningBanner,
    type AuraRenderContext,
} from './aura-sections';

/**
 * Applies a `body.settings` boolean toggle to the table's class list:
 * `true` → the class is definitely present, `false` → definitely absent,
 * `null`/`undefined` → the config default (`classes.table`) stays in effect.
 *
 * @param classes - The class list to mutate (modified in place)
 * @param className - The toggled Bootstrap class (e.g. `table-striped`)
 * @param enabled - The value of the `body.settings` toggle
 */
function applyToggleClass(classes: string[], className: string, enabled?: boolean | null): void {
    if (enabled === true) {
        if (!classes.includes(className)) classes.push(className);
    } else if (enabled === false) {
        const index = classes.indexOf(className);
        if (index !== -1) classes.splice(index, 1);
    }
}

/**
 * Aura Component
 *
 * The main component for the Aura Data Table.
 * Initializes the store, handles data fetching, and orchestrates sub-components like Toolbar, TableHeader, etc.
 */
export const Aura = defineComponent({
    name: 'Aura',
    props: defaultValidators(),
    setup(props) {
        // Read global config from the Vue app instance
        const instance = getCurrentInstance();
        const globalConfig =
            (instance?.appContext.config.globalProperties.$aura as AuraConfig) || {};
        const mergedConfig = { ...defaultConfigLib, ...globalConfig } as AuraConfig;

        const storeId = validateStoreId(props.storeId, mergedConfig.storeId);

        // Type-safe: pass the entire props object
        const core = useCoreStore(storeId, props as AuraProps);
        const resource = useApiResourcesStore(storeId, core);

        onMounted(() => {
            resource.fetchData();
        });

        // Check for critical/error level errors
        const hasCriticalOrError = computed(() => {
            return (
                core.errorStore.criticalErrors.length > 0 ||
                core.errorStore.errorLevelErrors.length > 0
            );
        });

        // Check for warning/info/debug level errors
        const hasNonCriticalErrors = computed(() => {
            return core.errorStore.warnings.length > 0;
        });

        const totalRecords = computed(() => resource.meta?.total || 0);
        const currentPage = computed(() => resource.meta?.current_page || 1);
        const paginationMeta = computed(() => resource.displayMeta);
        const rowsNumber = computed(() => resource.queryParams.paginate);

        const onPageChange = (page: number) => {
            resource.setPage(page);
        };

        const onRowsChange = (value: number) => {
            resource.setLimit(value);
        };

        /**
         * Retry from the blocking error state.
         *
         * A `critical`/`error` severity problem replaces the whole table — the
         * Toolbar and its refresh button included — so this is the only control
         * left for the user to get out of that state. `fetchData` clears the
         * errors it reported earlier, so a request that goes through brings the
         * table back on its own.
         */
        const onRetry = () => {
            resource.fetchData();
        };

        /**
         * Whether a request is in flight, independent of what is drawn for it.
         *
         * This is what `aria-busy` reports: assistive technology should learn the
         * table is updating right away, even while the visual indicators are
         * still holding back to avoid flicker.
         */
        const isBusy = computed(() => resource.loading === true);

        /**
         * Whether the thin progress bar should be on screen.
         *
         * Unlike the overlay this follows `loading` with no delay — it takes up no
         * layout space and does not dim the rows, so showing it for a short
         * request is feedback rather than flicker.
         */
        const showLoadingBar = computed(() => {
            return core.config.showLoadingBar !== false && isBusy.value;
        });

        /**
         * Whether the built-in loading overlay should be on screen.
         *
         * Delayed on purpose: the overlay veils the rows and blocks the pointer,
         * so a request that resolves in a few dozen milliseconds would flash it
         * on and off. Requests below the threshold are covered by the progress
         * bar alone. The store's `loading` is exposed regardless — a host that
         * switches both indicators off can still bind its own to it.
         */
        const overlayRequested = computed(() => {
            return core.config.showLoadingOverlay !== false && isBusy.value;
        });
        const showOverlay = useDelayedFlag(() => overlayRequested.value, LOADING_OVERLAY_DELAY_MS);

        /**
         * The table area element, tracked through a function ref.
         *
         * `render()` reads its bindings off the unwrapping `this` proxy, so the
         * ref object itself never reaches it — a setter that closes over the ref
         * is what keeps the measurement in `setup`'s hands.
         */
        const tableAreaEl = ref<HTMLElement | null>(null);
        const setTableAreaEl = (el: Element | ComponentPublicInstance | null) => {
            tableAreaEl.value = (el as HTMLElement | null) ?? null;
        };

        /**
         * Height held for the table area so the pagination below it stays put.
         *
         * Without this the last page — the one page that is allowed to be short —
         * pulls the controls up by the height of the missing rows, right as the
         * user is about to click the next page.
         */
        const reservedHeight = useReservedHeight({
            element: tableAreaEl,
            isFullPage: () => {
                const pageSize = Number(rowsNumber.value) || 0;
                const rendered = resource.displayItems?.length ?? 0;
                return pageSize > 0 && rendered >= pageSize;
            },
            measureSources: [() => resource.displayItems],
            resetSources: [() => rowsNumber.value, () => resource.items],
        });

        const tableClasses = computed(() => {
            const configClasses = core.config.classes?.table;
            const classes = Array.isArray(configClasses) ? [...configClasses] : [];

            // The response body.settings overrides the config's striped/hover default.
            const settings = resource.body?.settings;
            if (settings) {
                applyToggleClass(classes, 'table-striped', settings.striped);
                applyToggleClass(classes, 'table-hover', settings.hoverable);
            }

            return classes.join(' ');
        });

        return {
            core,
            hasCriticalOrError,
            hasNonCriticalErrors,
            onRowsChange,
            onRetry,
            totalRecords,
            currentPage,
            paginationMeta,
            rowsNumber,
            onPageChange,
            storeId,
            tableClasses,
            showOverlay,
            showLoadingBar,
            isBusy,
            reservedHeight,
            setTableAreaEl,
        };
    },
    render() {
        const context = this satisfies AuraRenderContext;
        const { hasCriticalOrError, hasNonCriticalErrors, core, rowsNumber, storeId } = context;
        const { paginateValues } = core.config;

        // A blocking problem replaces the table entirely — nothing below is drawn.
        if (hasCriticalOrError) return renderBlockingErrorState(context);

        const children: VNode[] = [];

        if (hasNonCriticalErrors) children.push(renderWarningBanner(context));
        if (paginateValues && rowsNumber) children.push(renderToolbar(context, paginateValues));

        if (storeId) {
            children.push(renderTableArea(context));
            if (context.paginationMeta) {
                children.push(renderPagination(context, context.paginationMeta));
            }
        }

        children.push(renderDestroyModal(context));

        return h('div', { class: 'aura-wrapper' }, children);
    },
});
