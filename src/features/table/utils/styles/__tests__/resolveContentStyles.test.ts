import { describe, it, expect } from 'vitest';
import { resolveContentStyles } from '../resolveContentStyles';

describe('resolveContentStyles', () => {
    // -------------------------------------------------------------------------
    // null / undefined / empty input
    // -------------------------------------------------------------------------
    describe('null / undefined / empty input', () => {
        it('should return empty result for null', () => {
            const result = resolveContentStyles(null);
            expect(result).toEqual({ classes: [], styles: {} });
        });

        it('should return empty result for undefined', () => {
            const result = resolveContentStyles(undefined);
            expect(result).toEqual({ classes: [], styles: {} });
        });

        it('should return empty result for empty object', () => {
            const result = resolveContentStyles({});
            expect(result).toEqual({ classes: [], styles: {} });
        });
    });

    // -------------------------------------------------------------------------
    // color
    // -------------------------------------------------------------------------
    describe('color', () => {
        it('should convert Bootstrap color to text- class', () => {
            const result = resolveContentStyles({ color: 'primary' });
            expect(result.classes).toContain('text-primary');
            expect(result.styles).not.toHaveProperty('color');
        });

        it('should convert Bootstrap success to text-success class', () => {
            const result = resolveContentStyles({ color: 'success' });
            expect(result.classes).toContain('text-success');
        });

        it('should convert Bootstrap danger-emphasis to text- class', () => {
            const result = resolveContentStyles({ color: 'danger-emphasis' });
            expect(result.classes).toContain('text-danger-emphasis');
        });

        it('should convert Bootstrap muted to text-muted class', () => {
            const result = resolveContentStyles({ color: 'muted' });
            expect(result.classes).toContain('text-muted');
        });

        it('should convert hex color to inline style', () => {
            const result = resolveContentStyles({ color: '#ff0000' });
            expect(result.styles.color).toBe('#ff0000');
            expect(result.classes.some(c => c.startsWith('text-'))).toBe(false);
        });

        it('should convert rgb color to inline style', () => {
            const result = resolveContentStyles({ color: 'rgb(255, 0, 0)' });
            expect(result.styles.color).toBe('rgb(255, 0, 0)');
        });

        it('should convert CSS color name to inline style', () => {
            const result = resolveContentStyles({ color: 'red' });
            expect(result.styles.color).toBe('red');
        });

        it('should ignore null color', () => {
            const result = resolveContentStyles({ color: null });
            expect(result.classes).toEqual([]);
            expect(result.styles).not.toHaveProperty('color');
        });
    });

    // -------------------------------------------------------------------------
    // background
    // -------------------------------------------------------------------------
    describe('background', () => {
        it('should convert Bootstrap color to bg- class', () => {
            const result = resolveContentStyles({ background: 'success' });
            expect(result.classes).toContain('bg-success');
            expect(result.styles).not.toHaveProperty('backgroundColor');
        });

        it('should convert Bootstrap subtle to bg- class', () => {
            const result = resolveContentStyles({ background: 'warning-subtle' });
            expect(result.classes).toContain('bg-warning-subtle');
        });

        it('should convert hex color to inline backgroundColor style', () => {
            const result = resolveContentStyles({ background: '#e0e0e0' });
            expect(result.styles.backgroundColor).toBe('#e0e0e0');
            expect(result.classes.some(c => c.startsWith('bg-'))).toBe(false);
        });

        it('should convert rgb color to inline backgroundColor style', () => {
            const result = resolveContentStyles({ background: 'rgb(224, 224, 224)' });
            expect(result.styles.backgroundColor).toBe('rgb(224, 224, 224)');
        });

        it('should ignore null background', () => {
            const result = resolveContentStyles({ background: null });
            expect(result.classes).toEqual([]);
            expect(result.styles).not.toHaveProperty('backgroundColor');
        });
    });

    // -------------------------------------------------------------------------
    // align
    // -------------------------------------------------------------------------
    describe('align', () => {
        it('should map start to textAlign left', () => {
            const result = resolveContentStyles({ align: 'start' });
            expect(result.styles.textAlign).toBe('left');
        });

        it('should map center to textAlign center', () => {
            const result = resolveContentStyles({ align: 'center' });
            expect(result.styles.textAlign).toBe('center');
        });

        it('should map end to textAlign right', () => {
            const result = resolveContentStyles({ align: 'end' });
            expect(result.styles.textAlign).toBe('right');
        });

        it('should ignore null align', () => {
            const result = resolveContentStyles({ align: null });
            expect(result.styles).not.toHaveProperty('textAlign');
        });
    });

    // -------------------------------------------------------------------------
    // fontSize
    // -------------------------------------------------------------------------
    describe('fontSize', () => {
        it('should set fontSize as inline style', () => {
            const result = resolveContentStyles({ fontSize: '14px' });
            expect(result.styles.fontSize).toBe('14px');
        });

        it('should handle rem units', () => {
            const result = resolveContentStyles({ fontSize: '1.5rem' });
            expect(result.styles.fontSize).toBe('1.5rem');
        });

        it('should ignore null fontSize', () => {
            const result = resolveContentStyles({ fontSize: null });
            expect(result.styles).not.toHaveProperty('fontSize');
        });
    });

    // -------------------------------------------------------------------------
    // fontWeight
    // -------------------------------------------------------------------------
    describe('fontWeight', () => {
        it('should set string fontWeight as inline style', () => {
            const result = resolveContentStyles({ fontWeight: 'bold' });
            expect(result.styles.fontWeight).toBe('bold');
        });

        it('should convert number fontWeight to string', () => {
            const result = resolveContentStyles({ fontWeight: 700 });
            expect(result.styles.fontWeight).toBe('700');
        });

        it('should ignore null fontWeight', () => {
            const result = resolveContentStyles({ fontWeight: null });
            expect(result.styles).not.toHaveProperty('fontWeight');
        });
    });

    // -------------------------------------------------------------------------
    // italic
    // -------------------------------------------------------------------------
    describe('italic', () => {
        it('should set fontStyle italic when true', () => {
            const result = resolveContentStyles({ italic: true });
            expect(result.styles.fontStyle).toBe('italic');
        });

        it('should not set fontStyle when false', () => {
            const result = resolveContentStyles({ italic: false });
            expect(result.styles).not.toHaveProperty('fontStyle');
        });

        it('should not set fontStyle when null', () => {
            const result = resolveContentStyles({ italic: null });
            expect(result.styles).not.toHaveProperty('fontStyle');
        });
    });

    // -------------------------------------------------------------------------
    // normal
    // -------------------------------------------------------------------------
    describe('normal', () => {
        it('should set fontStyle normal when true', () => {
            const result = resolveContentStyles({ normal: true });
            expect(result.styles.fontStyle).toBe('normal');
        });

        it('should not set fontStyle when false', () => {
            const result = resolveContentStyles({ normal: false });
            expect(result.styles).not.toHaveProperty('fontStyle');
        });

        it('should not set fontStyle when null', () => {
            const result = resolveContentStyles({ normal: null });
            expect(result.styles).not.toHaveProperty('fontStyle');
        });

        it('should override italic when both are true', () => {
            const result = resolveContentStyles({ italic: true, normal: true });
            expect(result.styles.fontStyle).toBe('normal');
        });
    });

    // -------------------------------------------------------------------------
    // lineHeight
    // -------------------------------------------------------------------------
    describe('lineHeight', () => {
        it('should set string lineHeight as inline style', () => {
            const result = resolveContentStyles({ lineHeight: '1.5' });
            expect(result.styles.lineHeight).toBe('1.5');
        });

        it('should convert number lineHeight to string', () => {
            const result = resolveContentStyles({ lineHeight: 2 });
            expect(result.styles.lineHeight).toBe('2');
        });

        it('should handle px lineHeight', () => {
            const result = resolveContentStyles({ lineHeight: '24px' });
            expect(result.styles.lineHeight).toBe('24px');
        });

        it('should ignore null lineHeight', () => {
            const result = resolveContentStyles({ lineHeight: null });
            expect(result.styles).not.toHaveProperty('lineHeight');
        });
    });

    // -------------------------------------------------------------------------
    // monospace
    // -------------------------------------------------------------------------
    describe('monospace', () => {
        it('should add font-monospace class when true', () => {
            const result = resolveContentStyles({ monospace: true });
            expect(result.classes).toContain('font-monospace');
        });

        it('should not add class when false', () => {
            const result = resolveContentStyles({ monospace: false });
            expect(result.classes).not.toContain('font-monospace');
        });

        it('should not add class when null', () => {
            const result = resolveContentStyles({ monospace: null });
            expect(result.classes).not.toContain('font-monospace');
        });
    });

    // -------------------------------------------------------------------------
    // text utility
    // -------------------------------------------------------------------------
    describe('text', () => {
        it('should add text utility as CSS class', () => {
            const result = resolveContentStyles({ text: 'text-truncate' });
            expect(result.classes).toContain('text-truncate');
        });

        it('should add custom text utility', () => {
            const result = resolveContentStyles({ text: 'text-end' });
            expect(result.classes).toContain('text-end');
        });

        it('should ignore null text', () => {
            const result = resolveContentStyles({ text: null });
            expect(result.classes).toEqual([]);
        });
    });

    // -------------------------------------------------------------------------
    // class
    // -------------------------------------------------------------------------
    describe('class', () => {
        it('should handle string class (single)', () => {
            const result = resolveContentStyles({ class: 'fw-bold' });
            expect(result.classes).toContain('fw-bold');
        });

        it('should split space-separated class string', () => {
            const result = resolveContentStyles({ class: 'pe-1 fw-bold text-muted' });
            expect(result.classes).toEqual(['pe-1', 'fw-bold', 'text-muted']);
        });

        it('should handle array of classes', () => {
            const result = resolveContentStyles({ class: ['pe-1', 'fw-bold'] });
            expect(result.classes).toEqual(['pe-1', 'fw-bold']);
        });

        it('should handle null class', () => {
            const result = resolveContentStyles({ class: null });
            expect(result.classes).toEqual([]);
        });

        it('should filter out empty strings from split', () => {
            const result = resolveContentStyles({ class: '  pe-1   fw-bold  ' });
            expect(result.classes).toEqual(['pe-1', 'fw-bold']);
        });
    });

    // -------------------------------------------------------------------------
    // style string
    // -------------------------------------------------------------------------
    describe('style', () => {
        it('should parse inline style string to styles object', () => {
            const result = resolveContentStyles({ style: 'margin-top: 10px; padding: 5px' });
            expect(result.styles.marginTop).toBe('10px');
            expect(result.styles.padding).toBe('5px');
        });

        it('should handle single declaration', () => {
            const result = resolveContentStyles({ style: 'color: red' });
            expect(result.styles.color).toBe('red');
        });

        it('should ignore null style', () => {
            const result = resolveContentStyles({ style: null });
            expect(result.styles).toEqual({});
        });
    });

    // -------------------------------------------------------------------------
    // combined cases
    // -------------------------------------------------------------------------
    describe('combined cases', () => {
        it('should combine color + italic + class + fontSize', () => {
            const result = resolveContentStyles({
                color: 'primary',
                italic: true,
                class: 'pe-1',
                fontSize: '14px',
            });

            expect(result.classes).toContain('text-primary');
            expect(result.classes).toContain('pe-1');
            expect(result.styles.fontStyle).toBe('italic');
            expect(result.styles.fontSize).toBe('14px');
        });

        it('should combine background + fontWeight + monospace + text', () => {
            const result = resolveContentStyles({
                background: 'success',
                fontWeight: 'bold',
                monospace: true,
                text: 'text-truncate',
            });

            expect(result.classes).toContain('bg-success');
            expect(result.classes).toContain('font-monospace');
            expect(result.classes).toContain('text-truncate');
            expect(result.styles.fontWeight).toBe('bold');
        });

        it('should combine hex color + align + lineHeight + array class', () => {
            const result = resolveContentStyles({
                color: '#333',
                align: 'center',
                lineHeight: '1.8',
                class: ['pe-2', 'mb-1'],
            });

            expect(result.styles.color).toBe('#333');
            expect(result.styles.textAlign).toBe('center');
            expect(result.styles.lineHeight).toBe('1.8');
            expect(result.classes).toEqual(['pe-2', 'mb-1']);
        });

        it('should combine style string with other inline styles without conflicts', () => {
            const result = resolveContentStyles({
                fontSize: '12px',
                style: 'border: 1px solid red',
            });

            expect(result.styles.fontSize).toBe('12px');
            expect(result.styles.border).toBe('1px solid red');
        });

        it('should handle all properties at once', () => {
            const result = resolveContentStyles({
                color: 'warning',
                background: '#f0f0f0',
                align: 'end',
                fontSize: '16px',
                fontWeight: 600,
                italic: true,
                lineHeight: '1.5',
                monospace: true,
                text: 'text-nowrap',
                class: ['fw-bold', 'px-2'],
                style: 'margin-left: 8px',
            });

            expect(result.classes).toContain('text-warning');
            expect(result.classes).toContain('font-monospace');
            expect(result.classes).toContain('text-nowrap');
            expect(result.classes).toContain('fw-bold');
            expect(result.classes).toContain('px-2');
            expect(result.styles.backgroundColor).toBe('#f0f0f0');
            expect(result.styles.textAlign).toBe('right');
            expect(result.styles.fontSize).toBe('16px');
            expect(result.styles.fontWeight).toBe('600');
            expect(result.styles.fontStyle).toBe('italic');
            expect(result.styles.lineHeight).toBe('1.5');
            expect(result.styles.marginLeft).toBe('8px');
        });
    });

    // -------------------------------------------------------------------------
    // edge cases
    // -------------------------------------------------------------------------
    describe('edge cases', () => {
        it('should not produce any classes for only inline-style properties', () => {
            const result = resolveContentStyles({
                fontSize: '14px',
                fontWeight: 'bold',
                italic: true,
            });
            expect(result.classes).toEqual([]);
        });

        it('should not produce any styles for only class-based properties', () => {
            const result = resolveContentStyles({
                color: 'primary',
                monospace: true,
                class: 'fw-bold',
            });
            expect(Object.keys(result.styles)).toEqual([]);
        });

        it('should handle fontWeight value 0 as falsy', () => {
            const result = resolveContentStyles({ fontWeight: 0 });
            expect(result.styles).not.toHaveProperty('fontWeight');
        });

        it('should handle lineHeight value 0 as falsy', () => {
            const result = resolveContentStyles({ lineHeight: 0 });
            expect(result.styles).not.toHaveProperty('lineHeight');
        });
    });
});
