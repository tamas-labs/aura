import { describe, it, expect } from 'vitest';
import { computeStyles } from '../computeStyles';
import type { BaseCellConfig } from '../../../../../types/cell.types';

describe('computeStyles', () => {
    describe('valid cases', () => {
        it('should return empty object for empty config', () => {
            const config: BaseCellConfig = { key: 'test' };
            const result = computeStyles(config);
            expect(result).toEqual({});
        });

        it('should compute width style', () => {
            const config: BaseCellConfig = {
                key: 'test',
                width: '200px',
            };
            const result = computeStyles(config);
            expect(result).toEqual({ width: '200px' });
        });

        it('should map align "start" to textAlign "left"', () => {
            const config: BaseCellConfig = {
                key: 'test',
                align: 'start',
            };
            const result = computeStyles(config);
            expect(result).toEqual({ textAlign: 'left' });
        });

        it('should map align "center" to textAlign "center"', () => {
            const config: BaseCellConfig = {
                key: 'test',
                align: 'center',
            };
            const result = computeStyles(config);
            expect(result).toEqual({ textAlign: 'center' });
        });

        it('should map align "end" to textAlign "right"', () => {
            const config: BaseCellConfig = {
                key: 'test',
                align: 'end',
            };
            const result = computeStyles(config);
            expect(result).toEqual({ textAlign: 'right' });
        });

        it('should compute color style', () => {
            const config: BaseCellConfig = {
                key: 'test',
                color: '#ff0000',
            };
            const result = computeStyles(config);
            expect(result).toEqual({ color: '#ff0000' });
        });

        it('should compute background style as backgroundColor', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: '#f5f5f5',
            };
            const result = computeStyles(config);
            expect(result).toEqual({ backgroundColor: '#f5f5f5' });
        });

        it('should compute fontSize style', () => {
            const config: BaseCellConfig = {
                key: 'test',
                fontSize: '16px',
            };
            const result = computeStyles(config);
            expect(result).toEqual({ fontSize: '16px' });
        });

        it('should compute fontWeight style', () => {
            const config: BaseCellConfig = {
                key: 'test',
                fontWeight: 'bold',
            };
            const result = computeStyles(config);
            expect(result).toEqual({ fontWeight: 'bold' });
        });

        it('should compute fontWeight style with number', () => {
            const config: BaseCellConfig = {
                key: 'test',
                fontWeight: 600,
            };
            const result = computeStyles(config);
            expect(result).toEqual({ fontWeight: 600 });
        });

        it('should compute lineHeight style', () => {
            const config: BaseCellConfig = {
                key: 'test',
                lineHeight: 1.5,
            };
            const result = computeStyles(config);
            expect(result).toEqual({ lineHeight: 1.5 });
        });

        it('should compute fontStyle italic when italic is true', () => {
            const config: BaseCellConfig = {
                key: 'test',
                italic: true,
            };
            const result = computeStyles(config);
            expect(result).toEqual({ fontStyle: 'italic' });
        });

        it('should not compute fontStyle when italic is false', () => {
            const config: BaseCellConfig = {
                key: 'test',
                italic: false,
            };
            const result = computeStyles(config);
            expect(result).toEqual({});
        });

        it('should compute fontStyle normal when normal is true', () => {
            const config: BaseCellConfig = {
                key: 'test',
                normal: true,
            };
            const result = computeStyles(config);
            expect(result).toEqual({ fontStyle: 'normal' });
        });

        it('should not compute fontStyle when normal is false', () => {
            const config: BaseCellConfig = {
                key: 'test',
                normal: false,
            };
            const result = computeStyles(config);
            expect(result).toEqual({});
        });

        it('should let normal override italic when both are true', () => {
            const config: BaseCellConfig = {
                key: 'test',
                italic: true,
                normal: true,
            };
            const result = computeStyles(config);
            expect(result).toEqual({ fontStyle: 'normal' });
        });
    });

    describe('combined cases', () => {
        it('should compute multiple styles together', () => {
            const config: BaseCellConfig = {
                key: 'test',
                width: '150px',
                align: 'end',
                color: '#333',
                background: '#f5f5f5',
                fontSize: '14px',
                fontWeight: 'bold',
                lineHeight: 1.5,
                italic: true,
            };
            const result = computeStyles(config);
            expect(result).toEqual({
                width: '150px',
                textAlign: 'right',
                color: '#333',
                backgroundColor: '#f5f5f5',
                fontSize: '14px',
                fontWeight: 'bold',
                lineHeight: 1.5,
                fontStyle: 'italic',
            });
        });

        it('should only include defined properties', () => {
            const config: BaseCellConfig = {
                key: 'test',
                width: '100px',
                color: '#000',
            };
            const result = computeStyles(config);
            expect(result).toEqual({
                width: '100px',
                color: '#000',
            });
            expect(result).not.toHaveProperty('textAlign');
            expect(result).not.toHaveProperty('backgroundColor');
        });
    });

    describe('edge cases', () => {
        it('should handle undefined values gracefully', () => {
            const config: BaseCellConfig = {
                key: 'test',
                width: undefined,
                align: undefined,
            };
            const result = computeStyles(config);
            expect(result).toEqual({});
        });

        it('should preserve custom align value if not in ALIGN_MAP', () => {
            const config: BaseCellConfig = {
                key: 'test',
                align: 'justify' as any,
            };
            const result = computeStyles(config);
            expect(result).toEqual({ textAlign: 'justify' });
        });
    });

    describe('bootstrap variant styles', () => {
        const variants = {
            primary: 'primary',
            secondary: 'secondary',
            success: 'success',
            danger: 'danger',
            warning: 'warning',
            info: 'info',
        };

        it('should NOT add backgroundColor when background is a Bootstrap variant', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'primary',
            };
            const result = computeStyles(config, variants);
            expect(result).toEqual({});
        });

        it('should NOT add color when color is a Bootstrap variant', () => {
            const config: BaseCellConfig = {
                key: 'test',
                color: 'danger',
            };
            const result = computeStyles(config, variants);
            expect(result).toEqual({});
        });

        it('should add backgroundColor when background is NOT a Bootstrap variant', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: '#fff000',
            };
            const result = computeStyles(config, variants);
            expect(result).toEqual({ backgroundColor: '#fff000' });
        });

        it('should add color when color is NOT a Bootstrap variant', () => {
            const config: BaseCellConfig = {
                key: 'test',
                color: 'white',
            };
            const result = computeStyles(config, variants);
            expect(result).toEqual({ color: 'white' });
        });

        it('should handle hex colors as non-variants', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: '#ff0000',
                color: '#ffffff',
            };
            const result = computeStyles(config, variants);
            expect(result).toEqual({
                backgroundColor: '#ff0000',
                color: '#ffffff',
            });
        });

        it('should handle rgb colors as non-variants', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'rgb(255, 240, 0)',
                color: 'rgb(255, 255, 255)',
            };
            const result = computeStyles(config, variants);
            expect(result).toEqual({
                backgroundColor: 'rgb(255, 240, 0)',
                color: 'rgb(255, 255, 255)',
            });
        });

        it('should combine variant exclusion with other styles', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'primary',
                fontSize: '12px',
                fontWeight: 'bold',
            };
            const result = computeStyles(config, variants);
            expect(result).toEqual({
                fontSize: '12px',
                fontWeight: 'bold',
            });
        });

        it('should mix variant and non-variant colors', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'primary',
                color: 'white',
            };
            const result = computeStyles(config, variants);
            expect(result).toEqual({
                color: 'white',
            });
        });

        it('should handle multiple variants correctly', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'success',
                color: 'warning',
            };
            const result = computeStyles(config, variants);
            expect(result).toEqual({});
        });

        it('should handle null values with variants', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: null,
                color: null,
            };
            const result = computeStyles(config, variants);
            expect(result).toEqual({});
        });
    });

    describe('backward compatibility', () => {
        it('should add inline styles for all colors without variants parameter', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'primary',
                color: 'danger',
            };
            const result = computeStyles(config);
            expect(result).toEqual({
                backgroundColor: 'primary',
                color: 'danger',
            });
        });

        it('should work with undefined variants', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'primary',
            };
            const result = computeStyles(config, undefined);
            expect(result).toEqual({
                backgroundColor: 'primary',
            });
        });

        it('should work with empty variants object', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'primary',
            };
            const result = computeStyles(config, {});
            expect(result).toEqual({
                backgroundColor: 'primary',
            });
        });

        it('should preserve existing behavior for CSS colors without variants', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: '#fff000',
                color: 'rgb(255, 240, 0)',
            };
            const result = computeStyles(config);
            expect(result).toEqual({
                backgroundColor: '#fff000',
                color: 'rgb(255, 240, 0)',
            });
        });

        it('should combine all styles in backward compatibility mode', () => {
            const config: BaseCellConfig = {
                key: 'test',
                width: '100px',
                align: 'center',
                background: 'primary',
                color: 'danger',
                fontSize: '14px',
            };
            const result = computeStyles(config);
            expect(result).toEqual({
                width: '100px',
                textAlign: 'center',
                backgroundColor: 'primary',
                color: 'danger',
                fontSize: '14px',
            });
        });
    });
});
