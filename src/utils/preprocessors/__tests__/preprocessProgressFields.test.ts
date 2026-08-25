import { describe, it, expect } from 'vitest';
import { preprocessProgressFields } from '../preprocessProgressFields';
import type { Header, Body, ColumnConfig } from '../../../types/api-response.types';

/** Builds a single-row header from cell descriptors. */
function makeHeader(cells: Record<string, unknown>[]): Header {
    return { rows: [{ cells: cells as never }] };
}

/** Shortcut: header from plain field names. */
function fieldsHeader(fields: string[]): Header {
    return makeHeader(fields.map(f => ({ content: f, field: f })));
}

/** Reads a generated columnConfig. */
function cfg(body: Body | null, key: string): ColumnConfig {
    return body?.columnConfigs?.[key] as ColumnConfig;
}

describe('preprocessProgressFields', () => {
    describe('field resolution', () => {
        it('should read the suffixed field itself when no matching prefix column exists', () => {
            const result = preprocessProgressFields(fieldsHeader(['completion_progress']), null);
            expect(cfg(result, 'completion_progress')).toEqual({
                type: 'progress',
                field: 'completion_progress',
            });
        });

        it('should read the prefix column when a matching header column exists', () => {
            const result = preprocessProgressFields(fieldsHeader(['cpu', 'cpu_progress']), null);
            expect(cfg(result, 'cpu_progress')).toEqual({ type: 'progress', field: 'cpu' });
        });

        it('should support fields[] array cells', () => {
            const header = makeHeader([{ content: 'X', fields: ['a', 'load_progress'] }]);
            const result = preprocessProgressFields(header, null);
            expect(cfg(result, 'load_progress')).toEqual({
                type: 'progress',
                field: 'load_progress',
            });
        });
    });

    describe('skip conditions', () => {
        it('should ignore non-_progress fields', () => {
            const result = preprocessProgressFields(fieldsHeader(['name', 'status']), null);
            expect(result).toBeNull();
        });

        it('should not override an existing columnConfig', () => {
            const body: Body = {
                columnConfigs: {
                    cpu_progress: { type: 'badge', field: 'cpu' } as ColumnConfig,
                },
            };
            const result = preprocessProgressFields(fieldsHeader(['cpu_progress']), body);
            expect(cfg(result, 'cpu_progress')).toEqual({ type: 'badge', field: 'cpu' });
        });

        it('should return the original body unchanged when nothing is generated', () => {
            const body: Body = { columnConfigs: { name: { type: 'static' } as ColumnConfig } };
            const result = preprocessProgressFields(fieldsHeader(['name']), body);
            expect(result).toBe(body);
        });
    });

    describe('immutability', () => {
        it('should not mutate the input body and should preserve existing configs', () => {
            const body: Body = { columnConfigs: { name: { type: 'static' } as ColumnConfig } };
            const result = preprocessProgressFields(fieldsHeader(['completion_progress']), body);
            expect(result).not.toBe(body);
            expect(body.columnConfigs?.completion_progress).toBeUndefined();
            expect(cfg(result, 'name')).toEqual({ type: 'static' });
            expect(cfg(result, 'completion_progress')).toEqual({
                type: 'progress',
                field: 'completion_progress',
            });
        });

        it('should create a body when none exists', () => {
            const result = preprocessProgressFields(fieldsHeader(['load_progress']), null);
            expect(result?.columnConfigs?.load_progress).toBeDefined();
        });
    });
});
