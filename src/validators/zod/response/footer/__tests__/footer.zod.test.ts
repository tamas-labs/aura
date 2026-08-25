import { describe, it, expect } from 'vitest';
import { FooterZod } from '../footer.zod';

describe('FooterZod', () => {
    describe('valid inputs', () => {
        it('should accept object with rows only', () => {
            const footer = {
                rows: [{ cells: [{ content: 'Total', field: 'total', key: 'total' }] }],
            };
            const result = FooterZod.parse(footer);
            expect(result).toEqual(footer);
        });

        it('should accept object with rows and settings', () => {
            const footer = {
                rows: [{ cells: [{ content: 'Total', field: 'total', key: 'total' }] }],
                settings: { sticky: true, height: 'auto' },
            };
            const result = FooterZod.parse(footer);
            expect(result.rows).toHaveLength(1);
            expect(result.settings).toEqual({ sticky: true, height: 'auto' });
        });

        it('should accept multiple rows', () => {
            const footer = {
                rows: [
                    { cells: [{ content: 'Subtotal', field: 'subtotal', key: 'subtotal' }] },
                    { cells: [{ content: 'Total', field: 'total', key: 'total' }] },
                ],
            };
            const result = FooterZod.parse(footer);
            expect(result.rows).toHaveLength(2);
        });

        it('should strip unknown properties at root level', () => {
            const footer = {
                rows: [{ cells: [{ content: 'Total', field: 'total', key: 'total' }] }],
                unknownProp: 'should be removed',
                extraField: 123,
            };
            const result = FooterZod.parse(footer);
            expect(result).not.toHaveProperty('unknownProp');
            expect(result).not.toHaveProperty('extraField');
        });

        it('should accept null settings', () => {
            const footer = {
                rows: [{ cells: [{ content: 'Total', field: 'total', key: 'total' }] }],
                settings: null,
            };
            const result = FooterZod.parse(footer);
            expect(result.settings).toBeNull();
        });

        it('should accept undefined settings', () => {
            const footer = {
                rows: [{ cells: [{ content: 'Total', field: 'total', key: 'total' }] }],
                settings: undefined,
            };
            const result = FooterZod.parse(footer);
            expect(result.settings).toBeUndefined();
        });
    });

    describe('invalid inputs', () => {
        it('should reject empty object (missing rows)', () => {
            expect(() => {
                FooterZod.parse({});
            }).toThrow();
        });

        it('should reject null', () => {
            expect(() => {
                FooterZod.parse(null);
            }).toThrow();
        });

        it('should reject undefined', () => {
            expect(() => {
                FooterZod.parse(undefined);
            }).toThrow();
        });

        it('should reject empty rows array', () => {
            expect(() => {
                FooterZod.parse({ rows: [] });
            }).toThrow(/must contain at least one row/);
        });

        it('should reject non-array rows', () => {
            expect(() => {
                FooterZod.parse({ rows: 'invalid' });
            }).toThrow();
        });

        it('should reject non-object rows elements', () => {
            expect(() => {
                FooterZod.parse({ rows: [1, 2, 3] });
            }).toThrow();
        });

        it('should reject string footer', () => {
            expect(() => {
                FooterZod.parse('invalid');
            }).toThrow();
        });

        it('should reject number footer', () => {
            expect(() => {
                FooterZod.parse(123);
            }).toThrow();
        });

        it('should reject array footer', () => {
            expect(() => {
                FooterZod.parse([]);
            }).toThrow();
        });
    });

    describe('edge cases', () => {
        it('should reject rows with empty cells array', () => {
            const footer = {
                rows: [{ cells: [] }],
            };
            // Empty cells array should fail validation (min 1 cell required)
            expect(() => {
                FooterZod.parse(footer);
            }).toThrow(/must contain at least one cell/);
        });

        it('should handle complex row structures', () => {
            const footer = {
                rows: [
                    {
                        cells: [
                            { content: 'Count', field: 'count', key: 'count' },
                            { content: 'Sum', field: 'sum', key: 'sum' },
                        ],
                    },
                ],
            };
            const result = FooterZod.parse(footer);
            expect(result.rows).toHaveLength(1);
            expect(result.rows[0]?.cells).toHaveLength(2);
        });

        it('should strip prototype pollution attempts', () => {
            const maliciousFooter = {
                rows: [{ cells: [{ content: 'Total', field: 'total', key: 'total' }] }],
                __proto__: { polluted: true },
                constructor: { dangerous: true },
            };
            const result = FooterZod.parse(maliciousFooter);
            expect(result).not.toHaveProperty('__proto__');
            expect(result).not.toHaveProperty('constructor');
        });
    });
});
