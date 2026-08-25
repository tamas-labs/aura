import { describe, it, expect } from 'vitest';
import { nextTick, ref } from 'vue';
import { useReservedHeight } from '../useReservedHeight';

/**
 * jsdom does no layout, so `offsetHeight` is always 0 on a real node. The element
 * is stubbed with a settable height instead — the composable only ever reads that
 * one property.
 */
const createElement = (offsetHeight: number) => {
    const el = { offsetHeight };
    return { el, ref: ref(el as unknown as HTMLElement) };
};

describe('useReservedHeight', () => {
    it('should reserve nothing before anything has been measured', () => {
        const { ref: elementRef } = createElement(320);
        const rows = ref<unknown[]>([]);

        const reserved = useReservedHeight({
            element: elementRef,
            isFullPage: () => false,
            measureSources: [() => rows.value],
            resetSources: [],
        });

        expect(reserved.value).toBe(0);
    });

    it('should record the height of a full page', async () => {
        const { ref: elementRef } = createElement(320);
        const rows = ref<unknown[]>([]);
        const fullPage = ref(false);

        const reserved = useReservedHeight({
            element: elementRef,
            isFullPage: () => fullPage.value,
            measureSources: [() => rows.value],
            resetSources: [],
        });

        fullPage.value = true;
        rows.value = [1, 2, 3];
        await nextTick();
        await nextTick();

        expect(reserved.value).toBe(320);
    });

    // The whole point: a short last page must not pull the pagination up.
    it('should hold the height through a page that is not full', async () => {
        const { el, ref: elementRef } = createElement(320);
        const rows = ref<unknown[]>([]);
        const fullPage = ref(true);

        const reserved = useReservedHeight({
            element: elementRef,
            isFullPage: () => fullPage.value,
            measureSources: [() => rows.value],
            resetSources: [],
        });

        rows.value = [1, 2, 3];
        await nextTick();
        await nextTick();
        expect(reserved.value).toBe(320);

        // Last page: fewer rows, so the element itself is shorter now.
        fullPage.value = false;
        el.offsetHeight = 120;
        rows.value = [4];
        await nextTick();
        await nextTick();

        expect(reserved.value).toBe(320);
    });

    // A page whose rows wrap is taller; the reservation has to grow with it.
    it('should grow to the tallest full page seen', async () => {
        const { el, ref: elementRef } = createElement(320);
        const rows = ref<unknown[]>([]);

        const reserved = useReservedHeight({
            element: elementRef,
            isFullPage: () => true,
            measureSources: [() => rows.value],
            resetSources: [],
        });

        rows.value = [1];
        await nextTick();
        await nextTick();
        expect(reserved.value).toBe(320);

        el.offsetHeight = 420;
        rows.value = [2];
        await nextTick();
        await nextTick();

        expect(reserved.value).toBe(420);
    });

    it('should not shrink below the tallest full page within one data set', async () => {
        const { el, ref: elementRef } = createElement(420);
        const rows = ref<unknown[]>([]);

        const reserved = useReservedHeight({
            element: elementRef,
            isFullPage: () => true,
            measureSources: [() => rows.value],
            resetSources: [],
        });

        rows.value = [1];
        await nextTick();
        await nextTick();

        el.offsetHeight = 300;
        rows.value = [2];
        await nextTick();
        await nextTick();

        expect(reserved.value).toBe(420);
    });

    // A new page size means a different full-page height — carrying the old
    // reading over would leave a gap under a legitimately shorter table.
    it('should re-measure from scratch when a reset source changes', async () => {
        const { el, ref: elementRef } = createElement(420);
        const rows = ref<unknown[]>([]);
        const pageSize = ref(50);

        const reserved = useReservedHeight({
            element: elementRef,
            isFullPage: () => true,
            measureSources: [() => rows.value],
            resetSources: [() => pageSize.value],
        });

        rows.value = [1];
        await nextTick();
        await nextTick();
        expect(reserved.value).toBe(420);

        el.offsetHeight = 120;
        pageSize.value = 10;
        await nextTick();
        await nextTick();

        expect(reserved.value).toBe(120);
    });

    it('should reserve nothing while the element is not mounted', async () => {
        const elementRef = ref<HTMLElement | null>(null);
        const rows = ref<unknown[]>([]);

        const reserved = useReservedHeight({
            element: elementRef,
            isFullPage: () => true,
            measureSources: [() => rows.value],
            resetSources: [],
        });

        rows.value = [1];
        await nextTick();
        await nextTick();

        expect(reserved.value).toBe(0);
    });

    // A table that never fills a page has no jump to prevent, and reserving for
    // it would only add empty space under the rows.
    it('should reserve nothing for a table that never fills a page', async () => {
        const { ref: elementRef } = createElement(320);
        const rows = ref<unknown[]>([]);

        const reserved = useReservedHeight({
            element: elementRef,
            isFullPage: () => false,
            measureSources: [() => rows.value],
            resetSources: [],
        });

        rows.value = [1, 2];
        await nextTick();
        await nextTick();

        expect(reserved.value).toBe(0);
    });
});
