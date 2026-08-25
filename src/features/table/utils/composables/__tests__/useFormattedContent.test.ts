import { describe, it, expect, vi, afterEach } from 'vitest';
import { nextTick, ref } from 'vue';
import { useFormattedContent } from '../useFormattedContent';
import { formatValue } from '../../formatters';
import type { HeaderCell } from '../../../../../types';

// Mock formatValue to isolate composable logic
vi.mock('../../formatters', () => ({
    formatValue: vi.fn(
        async (content: unknown, _cell: unknown, _locale: string, _currencyCode?: string) => {
            return String(content);
        }
    ),
    buildRawHtmlOptions: vi.fn(() => ({
        allowedTags: undefined,
        allowedAttr: undefined,
        allowDataAttr: undefined,
    })),
}));

describe('useFormattedContent', () => {
    describe('valid cases', () => {
        it('should format content from cell.content', async () => {
            const cell = ref<HeaderCell>({
                key: 'test',
                content: 'Test Content',
            });
            const config = ref({
                localization: 'en-US',
            });

            const { formattedContent } = useFormattedContent(
                () => cell.value,
                () => config.value
            );

            await nextTick();
            expect(formattedContent.value).toBe('Test Content');
        });

        it('should fallback to cell.label when content is undefined', async () => {
            const cell = ref<HeaderCell>({
                key: 'test',
                content: null,
                label: 'Test Label',
            });
            const config = ref({
                localization: 'en-US',
            });

            const { formattedContent } = useFormattedContent(
                () => cell.value,
                () => config.value
            );

            await nextTick();
            expect(formattedContent.value).toBe('Test Label');
        });

        it('should prioritize content over label', async () => {
            const cell = ref<HeaderCell>({
                key: 'test',
                content: 'Content',
                label: 'Label',
            });
            const config = ref({
                localization: 'en-US',
            });

            const { formattedContent } = useFormattedContent(
                () => cell.value,
                () => config.value
            );

            await nextTick();
            expect(formattedContent.value).toBe('Content');
        });

        it('should fallback to empty string when both content and label are undefined', async () => {
            const cell = ref<HeaderCell>({
                key: 'test',
                content: null,
            });
            const config = ref({
                localization: 'en-US',
            });

            const { formattedContent } = useFormattedContent(
                () => cell.value,
                () => config.value
            );

            await nextTick();
            expect(formattedContent.value).toBe('');
        });

        it('should use default locale when not provided', async () => {
            const cell = ref<HeaderCell>({
                key: 'test',
                content: 'Test',
            });
            const config = ref({});

            const { formattedContent } = useFormattedContent(
                () => cell.value,
                () => config.value
            );

            await nextTick();
            expect(formattedContent.value).toBe('Test');
        });

        it('should handle custom locale', async () => {
            const cell = ref<HeaderCell>({
                key: 'test',
                content: '1234.56',
            });
            const config = ref({
                localization: 'hu-HU',
            });

            const { formattedContent } = useFormattedContent(
                () => cell.value,
                () => config.value
            );

            await nextTick();
            expect(formattedContent.value).toBe('1234.56');
        });

        it('should handle currencyCode', async () => {
            const cell = ref<HeaderCell>({
                key: 'test',
                content: '1000',
            });
            const config = ref({
                currencyCode: 'USD',
                localization: 'en-US',
            });

            const { formattedContent } = useFormattedContent(
                () => cell.value,
                () => config.value
            );

            await nextTick();
            expect(formattedContent.value).toBe('1000');
        });
    });

    describe('reactivity', () => {
        it('should be reactive to cell changes', async () => {
            const cell = ref<HeaderCell>({
                key: 'test',
                content: 'Initial',
            });
            const config = ref({
                localization: 'en-US',
            });

            const { formattedContent } = useFormattedContent(
                () => cell.value,
                () => config.value
            );

            await nextTick();
            expect(formattedContent.value).toBe('Initial');

            cell.value = {
                key: 'test',
                content: 'Updated',
            };

            await nextTick();
            expect(formattedContent.value).toBe('Updated');
        });

        it('should be reactive to config changes', async () => {
            const cell = ref<HeaderCell>({
                key: 'test',
                content: 'Test',
            });
            const config = ref({
                localization: 'en-US',
            });

            const { formattedContent } = useFormattedContent(
                () => cell.value,
                () => config.value
            );

            await nextTick();
            expect(formattedContent.value).toBe('Test');

            config.value = {
                localization: 'hu-HU',
            };

            await nextTick();
            expect(formattedContent.value).toBe('Test');
        });

        it('should react to label fallback changes', async () => {
            const cell = ref<HeaderCell>({
                key: 'test',
                content: null,
                label: 'Label 1',
            });
            const config = ref({
                localization: 'en-US',
            });

            const { formattedContent } = useFormattedContent(
                () => cell.value,
                () => config.value
            );

            await nextTick();
            expect(formattedContent.value).toBe('Label 1');

            cell.value = {
                key: 'test',
                content: null,
                label: 'Label 2',
            };

            await nextTick();
            expect(formattedContent.value).toBe('Label 2');
        });
    });

    describe('edge cases', () => {
        it('should handle null content', async () => {
            const cell = ref<HeaderCell>({
                key: 'test',
                content: null as any,
            });
            const config = ref({
                localization: 'en-US',
            });

            const { formattedContent } = useFormattedContent(
                () => cell.value,
                () => config.value
            );

            await nextTick();
            expect(formattedContent.value).toBe('');
        });

        it('should handle undefined content and label', async () => {
            const cell = ref<HeaderCell>({
                key: 'test',
                content: null,
                label: null,
            });
            const config = ref({
                localization: 'en-US',
            });

            const { formattedContent } = useFormattedContent(
                () => cell.value,
                () => config.value
            );

            await nextTick();
            expect(formattedContent.value).toBe('');
        });

        it('should handle numeric content', async () => {
            const cell = ref<HeaderCell>({
                key: 'test',
                content: 42 as any,
            });
            const config = ref({
                localization: 'en-US',
            });

            const { formattedContent } = useFormattedContent(
                () => cell.value,
                () => config.value
            );

            await nextTick();
            expect(formattedContent.value).toBe('42');
        });

        it('should handle boolean content', async () => {
            const cell = ref<HeaderCell>({
                key: 'test',
                content: true as any,
            });
            const config = ref({
                localization: 'en-US',
            });

            const { formattedContent } = useFormattedContent(
                () => cell.value,
                () => config.value
            );

            await nextTick();
            expect(formattedContent.value).toBe('true');
        });

        it('should handle empty string content', async () => {
            const cell = ref<HeaderCell>({
                key: 'test',
                content: '',
            });
            const config = ref({
                localization: 'en-US',
            });

            const { formattedContent } = useFormattedContent(
                () => cell.value,
                () => config.value
            );

            await nextTick();
            expect(formattedContent.value).toBe('');
        });

        it('should handle missing config properties gracefully', async () => {
            const cell = ref<HeaderCell>({
                key: 'test',
                content: 'Test',
            });
            const config = ref({});

            const { formattedContent } = useFormattedContent(
                () => cell.value,
                () => config.value
            );

            await nextTick();
            expect(formattedContent.value).toBe('Test');
        });
    });

    describe('options parameter', () => {
        it('should pass skipTypeFormatting option to formatValue', async () => {
            const cell = ref<HeaderCell>({
                key: 'test',
                content: 'USD',
                currency: true,
            });
            const config = ref({
                localization: 'en-US',
            });

            const { formattedContent } = useFormattedContent(
                () => cell.value,
                () => config.value,
                { skipTypeFormatting: true }
            );

            await nextTick();
            // Should return raw string without currency formatting
            expect(formattedContent.value).toBe('USD');
        });

        it('should work without options parameter', async () => {
            const cell = ref<HeaderCell>({
                key: 'test',
                content: 'Test',
            });
            const config = ref({
                localization: 'en-US',
            });

            const { formattedContent } = useFormattedContent(
                () => cell.value,
                () => config.value
            );

            await nextTick();
            expect(formattedContent.value).toBe('Test');
        });

        it('should be reactive with skipTypeFormatting option', async () => {
            const cell = ref<HeaderCell>({
                key: 'test',
                content: 'EUR',
                currency: 'EUR',
            });
            const config = ref({
                localization: 'en-US',
            });

            const { formattedContent } = useFormattedContent(
                () => cell.value,
                () => config.value,
                { skipTypeFormatting: true }
            );

            await nextTick();
            expect(formattedContent.value).toBe('EUR');

            cell.value = {
                key: 'test',
                content: 'USD',
                currency: 'USD',
            };

            await nextTick();
            expect(formattedContent.value).toBe('USD');
        });
    });

    describe('stale run cancellation', () => {
        /** A formatValue call whose resolution the test controls. */
        const createDeferred = () => {
            let resolve!: (value: string) => void;
            const promise = new Promise<string>(res => {
                resolve = res;
            });
            return { promise, resolve };
        };

        afterEach(() => {
            vi.mocked(formatValue).mockImplementation(async (content: unknown) => String(content));
        });

        it('should keep the newest result when an older format call settles last', async () => {
            const deferreds: ReturnType<typeof createDeferred>[] = [];
            vi.mocked(formatValue).mockImplementation(() => {
                const deferred = createDeferred();
                deferreds.push(deferred);
                return deferred.promise;
            });

            const cell = ref<HeaderCell>({ key: 'test', content: 'first' });
            const { formattedContent } = useFormattedContent(
                () => cell.value,
                () => ({ localization: 'en-US' })
            );

            cell.value = { key: 'test', content: 'second' };
            await nextTick();
            expect(deferreds).toHaveLength(2);

            // The newer call resolves first, the outdated one afterwards - before the fix
            // the late writer overwrote the current content (audit 2026-07-29, 2.5 P3)
            deferreds[1]?.resolve('second formatted');
            await nextTick();
            deferreds[0]?.resolve('first formatted');
            await nextTick();

            expect(formattedContent.value).toBe('second formatted');
        });
    });
});
