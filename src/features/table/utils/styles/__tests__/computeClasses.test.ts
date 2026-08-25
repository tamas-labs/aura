import { describe, it, expect } from 'vitest';
import { computeClasses } from '../computeClasses';
import type { BaseCellConfig } from '../../../../../types/cell.types';

describe('computeClasses', () => {
    describe('valid cases', () => {
        it('should return empty array for empty config', () => {
            const config: BaseCellConfig = { key: 'test' };
            const result = computeClasses(config);
            expect(result).toEqual([]);
        });

        it('should handle string class', () => {
            const config: BaseCellConfig = {
                key: 'test',
                class: 'custom-cell',
            };
            const result = computeClasses(config);
            expect(result).toEqual(['custom-cell']);
        });

        it('should handle array of classes', () => {
            const config: BaseCellConfig = {
                key: 'test',
                class: ['cell-primary', 'cell-bordered'],
            };
            const result = computeClasses(config);
            expect(result).toEqual(['cell-primary', 'cell-bordered']);
        });

        it('should add font-monospace when monospace is true', () => {
            const config: BaseCellConfig = {
                key: 'test',
                monospace: true,
            };
            const result = computeClasses(config);
            expect(result).toEqual(['font-monospace']);
        });

        it('should not add font-monospace when monospace is false', () => {
            const config: BaseCellConfig = {
                key: 'test',
                monospace: false,
            };
            const result = computeClasses(config);
            expect(result).toEqual([]);
        });

        it('should add text-uppercase when uppercase is true', () => {
            const config: BaseCellConfig = {
                key: 'test',
                uppercase: true,
            };
            const result = computeClasses(config);
            expect(result).toEqual(['text-uppercase']);
        });

        it('should add text-lowercase when lowercase is true', () => {
            const config: BaseCellConfig = {
                key: 'test',
                lowercase: true,
            };
            const result = computeClasses(config);
            expect(result).toEqual(['text-lowercase']);
        });

        it('should add text-capitalize when capitalize is true', () => {
            const config: BaseCellConfig = {
                key: 'test',
                capitalize: true,
            };
            const result = computeClasses(config);
            expect(result).toEqual(['text-capitalize']);
        });

        it('should add Bootstrap text utility class', () => {
            const config: BaseCellConfig = {
                key: 'test',
                text: 'text-nowrap',
            };
            const result = computeClasses(config);
            expect(result).toEqual(['text-nowrap']);
        });
    });

    describe('dataTypes cases', () => {
        const dataTypes = {
            numbers: ['text-end', 'font-monospace'],
            currency: ['text-end', 'fw-bold'],
        };

        it('should add number classes when number is true', () => {
            const config = { key: 'test', number: true } as any;
            const result = computeClasses(config, undefined, dataTypes);
            expect(result).toEqual(['text-end', 'font-monospace']);
        });

        it('should add number classes when type is number', () => {
            const config = { key: 'test', type: 'number' } as any;
            const result = computeClasses(config, undefined, dataTypes);
            expect(result).toEqual(['text-end', 'font-monospace']);
        });

        it('should add currency classes when currency is true', () => {
            const config = { key: 'test', currency: true } as any;
            const result = computeClasses(config, undefined, dataTypes);
            expect(result).toEqual(['text-end', 'fw-bold']);
        });

        it('should add currency classes when currency is string', () => {
            const config = { key: 'test', currency: 'EUR' } as any;
            const result = computeClasses(config, undefined, dataTypes);
            expect(result).toEqual(['text-end', 'fw-bold']);
        });

        it('should add currency classes when type is currency', () => {
            const config = { key: 'test', type: 'currency' } as any;
            const result = computeClasses(config, undefined, dataTypes);
            expect(result).toEqual(['text-end', 'fw-bold']);
        });

        it('should prepend dataTypes classes before custom classes', () => {
            const config = { key: 'test', number: true, class: 'custom-class' } as any;
            const result = computeClasses(config, undefined, dataTypes);
            expect(result).toEqual(['text-end', 'font-monospace', 'custom-class']);
        });

        it('should do nothing if dataTypes is undefined', () => {
            const config = { key: 'test', number: true } as any;
            const result = computeClasses(config);
            expect(result).toEqual([]);
        });

        it('should not add number classes when number is false', () => {
            const config = { key: 'test', number: false } as any;
            const dataTypes = { numbers: ['text-end'] };
            const result = computeClasses(config, undefined, dataTypes);
            expect(result).toEqual([]);
        });

        it('should not add number classes when number is null', () => {
            const config = { key: 'test', number: null } as any;
            const dataTypes = { numbers: ['text-end'] };
            const result = computeClasses(config, undefined, dataTypes);
            expect(result).toEqual([]);
        });

        it('should not add currency classes when currency is false', () => {
            const config = { key: 'test', currency: false } as any;
            const dataTypes = { currency: ['text-end'] };
            const result = computeClasses(config, undefined, dataTypes);
            expect(result).toEqual([]);
        });

        it('should not add currency classes when currency is null', () => {
            const config = { key: 'test', currency: null } as any;
            const dataTypes = { currency: ['text-end'] };
            const result = computeClasses(config, undefined, dataTypes);
            expect(result).toEqual([]);
        });

        it('should handle empty dataTypes.numbers array', () => {
            const config = { key: 'test', number: true } as any;
            const dataTypes = { numbers: [] };
            const result = computeClasses(config, undefined, dataTypes);
            expect(result).toEqual([]);
        });

        it('should handle empty dataTypes.currency array', () => {
            const config = { key: 'test', currency: true } as any;
            const dataTypes = { currency: [] };
            const result = computeClasses(config, undefined, dataTypes);
            expect(result).toEqual([]);
        });

        it('should handle empty dataTypes object', () => {
            const config = { key: 'test', number: true, currency: true } as any;
            const dataTypes = {};
            const result = computeClasses(config, undefined, dataTypes);
            expect(result).toEqual([]);
        });

        it('should handle both number and currency types together', () => {
            const config = { key: 'test', number: true, currency: true } as any;
            const dataTypes = {
                numbers: ['text-end'],
                currency: ['fw-bold'],
            };
            const result = computeClasses(config, undefined, dataTypes);
            expect(result).toEqual(['text-end', 'fw-bold']);
        });

        it('should add unit classes when unit is set', () => {
            const config = { key: 'test', unit: 'percent' } as any;
            const dataTypes = {
                unit: ['text-end', 'font-monospace'],
            };
            const result = computeClasses(config, undefined, dataTypes);
            expect(result).toEqual(['text-end', 'font-monospace']);
        });

        it('should add unit classes when type is unit', () => {
            const config = { key: 'test', type: 'unit' } as any;
            const dataTypes = {
                unit: ['text-end'],
            };
            const result = computeClasses(config, undefined, dataTypes);
            expect(result).toEqual(['text-end']);
        });

        it('should not add unit classes when unit is null', () => {
            const config = { key: 'test', unit: null } as any;
            const dataTypes = { unit: ['text-end'] };
            const result = computeClasses(config, undefined, dataTypes);
            expect(result).toEqual([]);
        });

        it('should handle empty dataTypes.unit array', () => {
            const config = { key: 'test', unit: 'kilometer' } as any;
            const dataTypes = { unit: [] };
            const result = computeClasses(config, undefined, dataTypes);
            expect(result).toEqual([]);
        });

        it('should combine number, currency and unit types together', () => {
            const config = { key: 'test', number: true, currency: true, unit: 'percent' } as any;
            const dataTypes = {
                numbers: ['text-end'],
                currency: ['fw-bold'],
                unit: ['font-monospace'],
            };
            const result = computeClasses(config, undefined, dataTypes);
            expect(result).toEqual(['text-end', 'fw-bold', 'font-monospace']);
        });

        it('should combine dataTypes with other formatting options', () => {
            const config = {
                key: 'test',
                number: true,
                class: 'custom-class',
                monospace: true,
                uppercase: true,
            } as any;
            const dataTypes = { numbers: ['text-end'] };
            const result = computeClasses(config, undefined, dataTypes);
            expect(result).toEqual([
                'text-end',
                'custom-class',
                'font-monospace',
                'text-uppercase',
            ]);
        });
    });

    describe('combined cases', () => {
        it('should combine custom class with monospace', () => {
            const config: BaseCellConfig = {
                key: 'test',
                class: 'custom',
                monospace: true,
            };
            const result = computeClasses(config);
            expect(result).toEqual(['custom', 'font-monospace']);
        });

        it('should combine multiple text transform classes', () => {
            const config: BaseCellConfig = {
                key: 'test',
                monospace: true,
                uppercase: true,
                text: 'text-nowrap',
            };
            const result = computeClasses(config);
            expect(result).toEqual(['font-monospace', 'text-uppercase', 'text-nowrap']);
        });

        it('should combine array classes with boolean flags', () => {
            const config: BaseCellConfig = {
                key: 'test',
                class: ['badge', 'badge-success'],
                capitalize: true,
            };
            const result = computeClasses(config);
            expect(result).toEqual(['badge', 'badge-success', 'text-capitalize']);
        });

        it('should preserve order: custom classes, typography, transforms, text', () => {
            const config: BaseCellConfig = {
                key: 'test',
                class: ['custom-1', 'custom-2'],
                monospace: true,
                uppercase: true,
                text: 'text-nowrap',
            };
            const result = computeClasses(config);
            expect(result).toEqual([
                'custom-1',
                'custom-2',
                'font-monospace',
                'text-uppercase',
                'text-nowrap',
            ]);
        });
    });

    describe('edge cases', () => {
        it('should filter out empty string class', () => {
            const config: BaseCellConfig = {
                key: 'test',
                class: '',
            };
            const result = computeClasses(config);
            expect(result).toEqual([]);
        });

        it('should handle empty array class', () => {
            const config: BaseCellConfig = {
                key: 'test',
                class: [],
            };
            const result = computeClasses(config);
            expect(result).toEqual([]);
        });

        it('should handle undefined values gracefully', () => {
            const config: BaseCellConfig = {
                key: 'test',
                class: undefined,
                monospace: undefined,
            };
            const result = computeClasses(config);
            expect(result).toEqual([]);
        });

        it('should not add classes for false boolean values', () => {
            const config: BaseCellConfig = {
                key: 'test',
                monospace: false,
                uppercase: false,
                lowercase: false,
                capitalize: false,
            };
            const result = computeClasses(config);
            expect(result).toEqual([]);
        });

        it('should handle all text transform flags at once', () => {
            const config: BaseCellConfig = {
                key: 'test',
                uppercase: true,
                lowercase: true,
                capitalize: true,
            };
            const result = computeClasses(config);
            expect(result).toEqual(['text-uppercase', 'text-lowercase', 'text-capitalize']);
        });
    });

    describe('bootstrap variant classes', () => {
        const variants = {
            primary: 'primary',
            secondary: 'secondary',
            success: 'success',
            danger: 'danger',
            warning: 'warning',
            info: 'info',
        };

        it('should add table-{value} class when background is a Bootstrap variant', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'primary',
            };
            const result = computeClasses(config, variants);
            expect(result).toEqual(['table-primary']);
        });

        it('should add text-{value} class when color is a Bootstrap variant', () => {
            const config: BaseCellConfig = {
                key: 'test',
                color: 'danger',
            };
            const result = computeClasses(config, variants);
            expect(result).toEqual(['text-danger']);
        });

        it('should add both table and text classes for background and color variants', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'primary',
                color: 'danger',
            };
            const result = computeClasses(config, variants);
            expect(result).toEqual(['table-primary', 'text-danger']);
        });

        it('should not add Bootstrap class when background is not a variant', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: '#fff000',
            };
            const result = computeClasses(config, variants);
            expect(result).toEqual([]);
        });

        it('should not add Bootstrap class when color is not a variant', () => {
            const config: BaseCellConfig = {
                key: 'test',
                color: 'white',
            };
            const result = computeClasses(config, variants);
            expect(result).toEqual([]);
        });

        it('should combine custom classes with Bootstrap variant classes', () => {
            const config: BaseCellConfig = {
                key: 'test',
                class: 'fw-bold',
                background: 'primary',
            };
            const result = computeClasses(config, variants);
            expect(result).toEqual(['fw-bold', 'table-primary']);
        });

        it('should combine multiple class types with variants', () => {
            const config: BaseCellConfig = {
                key: 'test',
                class: ['custom-1', 'custom-2'],
                monospace: true,
                uppercase: true,
                background: 'success',
                color: 'warning',
            };
            const result = computeClasses(config, variants);
            expect(result).toEqual([
                'custom-1',
                'custom-2',
                'font-monospace',
                'text-uppercase',
                'table-success',
                'text-warning',
            ]);
        });

        it('should work with different variant values', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'secondary',
            };
            const result = computeClasses(config, variants);
            expect(result).toEqual(['table-secondary']);
        });

        it('should handle null background and color with variants', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: null,
                color: null,
            };
            const result = computeClasses(config, variants);
            expect(result).toEqual([]);
        });
    });

    describe('backward compatibility', () => {
        it('should work without variants parameter (backward compatibility)', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'primary',
                color: 'danger',
            };
            const result = computeClasses(config);
            expect(result).toEqual([]);
        });

        it('should work with undefined variants', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'primary',
            };
            const result = computeClasses(config, undefined);
            expect(result).toEqual([]);
        });

        it('should work with empty variants object', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'primary',
            };
            const result = computeClasses(config, {});
            expect(result).toEqual([]);
        });

        it('should preserve existing behavior for CSS colors without variants', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: '#fff000',
                color: 'rgb(255, 240, 0)',
            };
            const result = computeClasses(config);
            expect(result).toEqual([]);
        });
    });
});
