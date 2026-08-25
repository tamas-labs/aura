import { describe, it, expect } from 'vitest';
import { resolveFormattingStyles } from '../resolveFormattingStyles';

describe('resolveFormattingStyles', () => {
    // -------------------------------------------------------------------------
    // null / undefined / empty input
    // -------------------------------------------------------------------------
    describe('null / undefined / empty input', () => {
        it('should return empty result for null', () => {
            const result = resolveFormattingStyles(null);
            expect(result).toEqual({ classes: [], styles: {} });
        });

        it('should return empty result for undefined', () => {
            const result = resolveFormattingStyles(undefined);
            expect(result).toEqual({ classes: [], styles: {} });
        });

        it('should return empty result for empty object', () => {
            const result = resolveFormattingStyles({});
            expect(result).toEqual({ classes: [], styles: {} });
        });
    });

    // -------------------------------------------------------------------------
    // background
    // -------------------------------------------------------------------------
    describe('background', () => {
        it('should convert Bootstrap color to bg- class', () => {
            const result = resolveFormattingStyles({ background: 'success' });
            expect(result.classes).toContain('bg-success');
            expect(result.styles).not.toHaveProperty('backgroundColor');
        });

        it('should convert Bootstrap subtle to bg- class', () => {
            const result = resolveFormattingStyles({ background: 'success-subtle' });
            expect(result.classes).toContain('bg-success-subtle');
            expect(result.styles).not.toHaveProperty('backgroundColor');
        });

        it('should convert Bootstrap dark-subtle to bg- class', () => {
            const result = resolveFormattingStyles({ background: 'dark-subtle' });
            expect(result.classes).toContain('bg-dark-subtle');
        });

        it('should convert raw CSS color to inline backgroundColor style', () => {
            const result = resolveFormattingStyles({ background: '#ff0000' });
            expect(result.styles.backgroundColor).toBe('#ff0000');
            expect(result.classes.some(c => c.startsWith('bg-'))).toBe(false);
        });

        it('should convert raw rgb color to inline backgroundColor style', () => {
            const result = resolveFormattingStyles({ background: 'rgb(255,0,0)' });
            expect(result.styles.backgroundColor).toBe('rgb(255,0,0)');
        });

        it('should ignore null background', () => {
            const result = resolveFormattingStyles({ background: null });
            expect(result.classes.some(c => c.startsWith('bg-'))).toBe(false);
            expect(result.styles).not.toHaveProperty('backgroundColor');
        });
    });

    // -------------------------------------------------------------------------
    // color
    // -------------------------------------------------------------------------
    describe('color', () => {
        it('should convert Bootstrap color to text- class', () => {
            const result = resolveFormattingStyles({ color: 'danger' });
            expect(result.classes).toContain('text-danger');
            expect(result.styles).not.toHaveProperty('color');
        });

        it('should convert danger-emphasis to text- class', () => {
            const result = resolveFormattingStyles({ color: 'danger-emphasis' });
            expect(result.classes).toContain('text-danger-emphasis');
        });

        it('should convert white to text- class', () => {
            const result = resolveFormattingStyles({ color: 'white' });
            expect(result.classes).toContain('text-white');
        });

        it('should convert raw CSS color to inline color style', () => {
            const result = resolveFormattingStyles({ color: '#ff0000' });
            expect(result.styles.color).toBe('#ff0000');
            expect(result.classes.some(c => c.startsWith('text-'))).toBe(false);
        });

        it('should ignore null color', () => {
            const result = resolveFormattingStyles({ color: null });
            expect(result.classes.some(c => c.startsWith('text-'))).toBe(false);
            expect(result.styles).not.toHaveProperty('color');
        });
    });

    // -------------------------------------------------------------------------
    // border styles
    // -------------------------------------------------------------------------
    describe('border styles', () => {
        it('should add borderBottom inline style when borderBottom is true', () => {
            const result = resolveFormattingStyles({ borderBottom: true });
            expect(result.styles).toHaveProperty('borderBottom');
            expect(result.styles.borderBottom).toContain('solid');
        });

        it('should default to 1px width when borderWidth not specified', () => {
            const result = resolveFormattingStyles({ borderBottom: true });
            expect(result.styles.borderBottom).toMatch(/^1px solid/);
        });

        it('should use borderWidth when specified', () => {
            const result = resolveFormattingStyles({ borderBottom: true, borderWidth: '3px' });
            expect(result.styles.borderBottom).toMatch(/^3px solid/);
        });

        it('should use Bootstrap CSS variable for Bootstrap borderColor', () => {
            const result = resolveFormattingStyles({
                borderBottom: true,
                borderColor: 'success',
            });
            expect(result.styles.borderBottom).toContain('var(--bs-success)');
        });

        it('should use Bootstrap CSS variable for subtle borderColor', () => {
            const result = resolveFormattingStyles({
                borderLeft: true,
                borderColor: 'danger-subtle',
            });
            expect(result.styles.borderLeft).toContain('var(--bs-danger-subtle)');
        });

        it('should use raw CSS color as-is for borderColor', () => {
            const result = resolveFormattingStyles({ borderTop: true, borderColor: '#333' });
            expect(result.styles.borderTop).toContain('#333');
        });

        it('should use currentColor when no borderColor specified', () => {
            const result = resolveFormattingStyles({ borderRight: true });
            expect(result.styles.borderRight).toContain('currentColor');
        });

        it('should add all four border sides', () => {
            const result = resolveFormattingStyles({
                borderTop: true,
                borderBottom: true,
                borderLeft: true,
                borderRight: true,
                borderColor: 'primary',
                borderWidth: '2px',
            });
            expect(result.styles).toHaveProperty('borderTop');
            expect(result.styles).toHaveProperty('borderBottom');
            expect(result.styles).toHaveProperty('borderLeft');
            expect(result.styles).toHaveProperty('borderRight');
            expect(result.styles.borderTop).toBe('2px solid var(--bs-primary)');
        });

        it('should not add border style when border side is false', () => {
            const result = resolveFormattingStyles({ borderBottom: false });
            expect(result.styles).not.toHaveProperty('borderBottom');
        });

        it('should not add border style when border side is null', () => {
            const result = resolveFormattingStyles({ borderBottom: null });
            expect(result.styles).not.toHaveProperty('borderBottom');
        });
    });

    // -------------------------------------------------------------------------
    // opacity
    // -------------------------------------------------------------------------
    describe('opacity', () => {
        it('should convert opacity to string inline style', () => {
            const result = resolveFormattingStyles({ opacity: 0.5 });
            expect(result.styles.opacity).toBe('0.5');
        });

        it('should handle opacity 0 (falsy but valid)', () => {
            const result = resolveFormattingStyles({ opacity: 0 });
            expect(result.styles.opacity).toBe('0');
        });

        it('should handle opacity 1', () => {
            const result = resolveFormattingStyles({ opacity: 1 });
            expect(result.styles.opacity).toBe('1');
        });

        it('should ignore null opacity', () => {
            const result = resolveFormattingStyles({ opacity: null });
            expect(result.styles).not.toHaveProperty('opacity');
        });

        it('should ignore undefined opacity', () => {
            const result = resolveFormattingStyles({ opacity: undefined });
            expect(result.styles).not.toHaveProperty('opacity');
        });
    });

    // -------------------------------------------------------------------------
    // padding
    // -------------------------------------------------------------------------
    describe('padding', () => {
        it('should set padding as inline style', () => {
            const result = resolveFormattingStyles({ padding: '8px 16px' });
            expect(result.styles.padding).toBe('8px 16px');
        });

        it('should ignore null padding', () => {
            const result = resolveFormattingStyles({ padding: null });
            expect(result.styles).not.toHaveProperty('padding');
        });
    });

    // -------------------------------------------------------------------------
    // class
    // -------------------------------------------------------------------------
    describe('class', () => {
        it('should split class string on whitespace', () => {
            const result = resolveFormattingStyles({ class: 'fw-bold text-truncate' });
            expect(result.classes).toContain('fw-bold');
            expect(result.classes).toContain('text-truncate');
        });

        it('should accept class string array', () => {
            const result = resolveFormattingStyles({ class: ['fw-bold', 'text-truncate'] });
            expect(result.classes).toContain('fw-bold');
            expect(result.classes).toContain('text-truncate');
        });

        it('should accept single class string', () => {
            const result = resolveFormattingStyles({ class: 'fw-bold' });
            expect(result.classes).toContain('fw-bold');
        });

        it('should ignore null class', () => {
            const result = resolveFormattingStyles({ class: null });
            expect(result.classes).toEqual([]);
        });

        it('should filter empty strings from split', () => {
            const result = resolveFormattingStyles({ class: '  fw-bold  ' });
            expect(result.classes).toContain('fw-bold');
            expect(result.classes).not.toContain('');
        });
    });

    // -------------------------------------------------------------------------
    // style string parsing
    // -------------------------------------------------------------------------
    describe('style string parsing', () => {
        it('should parse single CSS declaration', () => {
            const result = resolveFormattingStyles({ style: 'font-size: 14px' });
            expect(result.styles.fontSize).toBe('14px');
        });

        it('should parse multiple CSS declarations', () => {
            const result = resolveFormattingStyles({ style: 'font-size: 14px; font-weight: bold' });
            expect(result.styles.fontSize).toBe('14px');
            expect(result.styles.fontWeight).toBe('bold');
        });

        it('should convert kebab-case to camelCase property names', () => {
            const result = resolveFormattingStyles({ style: 'background-color: red' });
            expect(result.styles.backgroundColor).toBe('red');
        });

        it('should ignore null style', () => {
            const result = resolveFormattingStyles({ style: null });
            expect(Object.keys(result.styles).length).toBe(0);
        });
    });

    // -------------------------------------------------------------------------
    // complex combinations
    // -------------------------------------------------------------------------
    describe('complex combinations', () => {
        it('should handle background + borderBottom + borderColor + borderWidth', () => {
            const result = resolveFormattingStyles({
                background: 'success-subtle',
                borderBottom: true,
                borderColor: 'success',
                borderWidth: '3px',
            });
            expect(result.classes).toContain('bg-success-subtle');
            expect(result.styles.borderBottom).toBe('3px solid var(--bs-success)');
            expect(result.styles).not.toHaveProperty('backgroundColor');
        });

        it('should handle color + opacity + class array', () => {
            const result = resolveFormattingStyles({
                color: '#ff0000',
                opacity: 0.7,
                class: ['fw-bold', 'text-truncate'],
            });
            expect(result.styles.color).toBe('#ff0000');
            expect(result.styles.opacity).toBe('0.7');
            expect(result.classes).toContain('fw-bold');
            expect(result.classes).toContain('text-truncate');
        });

        it('should handle Bootstrap color + class string', () => {
            const result = resolveFormattingStyles({
                color: 'danger-emphasis',
                class: 'fw-bold text-truncate',
            });
            expect(result.classes).toContain('text-danger-emphasis');
            expect(result.classes).toContain('fw-bold');
            expect(result.classes).toContain('text-truncate');
            expect(result.styles).not.toHaveProperty('color');
        });

        it('should handle full row-rules-like config', () => {
            const result = resolveFormattingStyles({
                background: 'danger-subtle',
                opacity: 0.5,
                class: 'text-decoration-line-through',
            });
            expect(result.classes).toContain('bg-danger-subtle');
            expect(result.classes).toContain('text-decoration-line-through');
            expect(result.styles.opacity).toBe('0.5');
        });

        it('should handle left-border-only cellRules config', () => {
            const result = resolveFormattingStyles({
                borderLeft: true,
                borderColor: 'danger',
                borderWidth: '4px',
                background: 'danger-subtle',
            });
            expect(result.styles.borderLeft).toBe('4px solid var(--bs-danger)');
            expect(result.classes).toContain('bg-danger-subtle');
            expect(result.styles).not.toHaveProperty('borderTop');
            expect(result.styles).not.toHaveProperty('borderRight');
        });

        it('should produce correct class ordering: Bootstrap color classes first, then custom', () => {
            const result = resolveFormattingStyles({
                color: 'success',
                background: 'success-subtle',
                class: 'fw-bold',
            });
            const bgIdx = result.classes.indexOf('bg-success-subtle');
            const textIdx = result.classes.indexOf('text-success');
            const fwIdx = result.classes.indexOf('fw-bold');
            expect(bgIdx).toBeGreaterThanOrEqual(0);
            expect(textIdx).toBeGreaterThanOrEqual(0);
            expect(fwIdx).toBeGreaterThan(textIdx);
        });
    });

    // -------------------------------------------------------------------------
    // Bootstrap subtle and emphasis variants
    // -------------------------------------------------------------------------
    describe('Bootstrap subtle and emphasis variants', () => {
        it.each([
            'primary-subtle',
            'secondary-subtle',
            'success-subtle',
            'danger-subtle',
            'warning-subtle',
            'info-subtle',
            'light-subtle',
            'dark-subtle',
        ])('should recognize %s as Bootstrap background color', color => {
            const result = resolveFormattingStyles({ background: color });
            expect(result.classes).toContain(`bg-${color}`);
            expect(result.styles).not.toHaveProperty('backgroundColor');
        });

        it.each([
            'primary-emphasis',
            'secondary-emphasis',
            'success-emphasis',
            'danger-emphasis',
            'warning-emphasis',
            'info-emphasis',
            'dark-emphasis',
        ])('should recognize %s as Bootstrap text color', color => {
            const result = resolveFormattingStyles({ color });
            expect(result.classes).toContain(`text-${color}`);
            expect(result.styles).not.toHaveProperty('color');
        });
    });
});
