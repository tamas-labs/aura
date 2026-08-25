import { describe, it, expect } from 'vitest';
import type { FieldSegment, BodyCellConfig, FooterCellConfig } from '../cell.types';
import type { StaticConfig, ColumnConfig } from '../api-response.types';

describe('cell.types', () => {
    describe('FieldSegment', () => {
        describe('valid cases', () => {
            it('should accept value segment with string value', () => {
                const segment: FieldSegment = {
                    type: 'value',
                    value: 'Hello',
                };

                expect(segment.type).toBe('value');
                expect(segment.value).toBe('Hello');
                expect(segment.config).toBeUndefined();
            });

            it('should accept value segment with number value', () => {
                const segment: FieldSegment = {
                    type: 'value',
                    value: 42,
                };

                expect(segment.type).toBe('value');
                expect(segment.value).toBe(42);
            });

            it('should accept value segment with null', () => {
                const segment: FieldSegment = {
                    type: 'value',
                    value: null,
                };

                expect(segment.type).toBe('value');
                expect(segment.value).toBeNull();
            });

            it('should accept value segment with undefined', () => {
                const segment: FieldSegment = {
                    type: 'value',
                    value: undefined,
                };

                expect(segment.type).toBe('value');
                expect(segment.value).toBeUndefined();
            });

            it('should accept config segment with StaticConfig', () => {
                const staticConfig: StaticConfig = {
                    type: 'static',
                    value: 'ID:',
                    class: ['pe-1', 'text-muted', 'fw-bold'],
                };

                const segment: FieldSegment = {
                    type: 'config',
                    value: 'ID:',
                    config: staticConfig,
                };

                expect(segment.type).toBe('config');
                expect(segment.value).toBe('ID:');
                expect(segment.config).toBeDefined();
                expect(segment.config?.type).toBe('static');
            });

            it('should accept config segment without config property (optional)', () => {
                const segment: FieldSegment = {
                    type: 'config',
                    value: 'Fallback',
                };

                expect(segment.type).toBe('config');
                expect(segment.config).toBeUndefined();
            });
        });

        describe('type discrimination', () => {
            it('should differentiate value and config segments by type', () => {
                const segments: FieldSegment[] = [
                    { type: 'config', value: 'ID:', config: { type: 'static', value: 'ID:' } },
                    { type: 'value', value: 123 },
                ];

                const configSegments = segments.filter(s => s.type === 'config');
                const valueSegments = segments.filter(s => s.type === 'value');

                expect(configSegments).toHaveLength(1);
                expect(valueSegments).toHaveLength(1);
            });

            it('should support arrays of mixed segments', () => {
                const config: ColumnConfig = { type: 'static', value: 'Prefix:' };
                const segments: FieldSegment[] = [
                    { type: 'config', value: 'Prefix:', config },
                    { type: 'value', value: 'Data1' },
                    { type: 'value', value: null },
                    {
                        type: 'config',
                        value: 'Suffix',
                        config: { type: 'static', value: 'Suffix' },
                    },
                ];

                expect(segments).toHaveLength(4);
                expect(segments[0]!.type).toBe('config');
                expect(segments[1]!.type).toBe('value');
                expect(segments[2]!.value).toBeNull();
                expect(segments[3]!.config?.type).toBe('static');
            });
        });

        describe('config field', () => {
            it('should support StaticConfig with class array', () => {
                const segment: FieldSegment = {
                    type: 'config',
                    value: 'ID:',
                    config: {
                        type: 'static',
                        value: 'ID:',
                        class: ['pe-1', 'text-muted'],
                        color: 'secondary',
                    },
                };

                const config = segment.config as StaticConfig;
                expect(Array.isArray(config.class)).toBe(true);
                expect(config.color).toBe('secondary');
            });

            it('should support StaticConfig with inline style', () => {
                const segment: FieldSegment = {
                    type: 'config',
                    value: 'Label:',
                    config: {
                        type: 'static',
                        value: 'Label:',
                        style: 'font-weight: bold',
                    },
                };

                const config = segment.config as StaticConfig;
                expect(config.style).toBe('font-weight: bold');
            });
        });
    });

    describe('BodyCellConfig', () => {
        it('should accept minimal valid config', () => {
            const config: BodyCellConfig = { key: 'id' };
            expect(config.key).toBe('id');
        });

        it('should accept full formatting options', () => {
            const config: BodyCellConfig = {
                key: 'amount',
                currency: 'EUR',
                align: 'end',
                class: ['fw-bold'],
            };
            expect(config.currency).toBe('EUR');
        });
    });

    describe('FooterCellConfig', () => {
        it('should accept label property', () => {
            const config: FooterCellConfig = {
                key: 'total',
                label: 'Total',
            };
            expect(config.label).toBe('Total');
        });
    });
});
