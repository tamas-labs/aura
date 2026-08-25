import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { getErrorSink } from '../error-sink';
import { useErrorHandlerStore } from '../../../state/core/error-handler.state';
import { validateString } from '../../schemas/common/string.schema';

describe('Error Sink', () => {
    const TEST_STORE_ID = 'error-sink-test-store';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('getErrorSink', () => {
        it('should return the error handler store of the given id', () => {
            const sink = getErrorSink(TEST_STORE_ID);
            const store = useErrorHandlerStore(TEST_STORE_ID);

            expect(sink).toBe(store);
        });

        it('should keep separate stores separate', () => {
            const first = getErrorSink('error-sink-a');
            const second = getErrorSink('error-sink-b');

            first.addError({
                severity: 'warning',
                component: 'Test',
                action: 'validate',
                type: 'validation',
                message: 'Only in the first store',
            });

            expect(useErrorHandlerStore('error-sink-a').errors).toHaveLength(1);
            expect(useErrorHandlerStore('error-sink-b').errors).toHaveLength(0);
            expect(second.addError).toBeTypeOf('function');
        });

        it('should record schema validation errors in the store', () => {
            getErrorSink(TEST_STORE_ID).addSchemaValidationError(
                'SinkTest',
                'Invalid value',
                'someKey',
                123
            );

            const errors = useErrorHandlerStore(TEST_STORE_ID).errors;
            expect(errors).toHaveLength(1);
            expect(errors[0]?.component).toBe('SinkTest');
            expect(errors[0]?.key).toBe('someKey');
        });

        it('should be the path validators report through', () => {
            // A validator failure has to land in the very store the seam resolves
            validateString(123, TEST_STORE_ID, 'siteName');

            expect(getErrorSink(TEST_STORE_ID).addError).toBeTypeOf('function');
            expect(useErrorHandlerStore(TEST_STORE_ID).errors).toHaveLength(1);
        });
    });

    /**
     * The reason the seam exists: `validators/` sits below `state/`, so the inversion is
     * allowed to live in exactly one file. Without this guard the next validator would
     * import the store directly again and the coupling would silently spread back to 32
     * files — which is what audit item #15 (tracker #26) flagged.
     */
    describe('layer boundary', () => {
        const validatorsDir = resolve(__dirname, '../..');

        const collectSourceFiles = (dir: string): string[] => {
            const entries = readdirSync(dir, { withFileTypes: true });
            return entries.flatMap(entry => {
                const full = resolve(dir, entry.name);
                if (entry.isDirectory()) {
                    return entry.name === '__tests__' ? [] : collectSourceFiles(full);
                }
                return entry.name.endsWith('.ts') ? [full] : [];
            });
        };

        it('should reach the state layer from error-sink.ts only', () => {
            const offenders = collectSourceFiles(validatorsDir)
                .filter(file => !file.endsWith('utils/error-sink.ts'))
                .filter(file => /from '[^']*state\//.test(readFileSync(file, 'utf8')))
                .map(file => file.slice(validatorsDir.length + 1));

            expect(offenders).toEqual([]);
        });

        it('should collect the validator sources it is asserting on', () => {
            // Guards the guard: an empty file list would make the assertion above vacuous
            expect(collectSourceFiles(validatorsDir).length).toBeGreaterThan(50);
        });
    });
});
