import { describe, it, expect } from 'vitest';
import {
    BOOTSTRAP_COLOR_NAMES,
    ALIGN_MAP,
    isBootstrapColor,
    kebabToCamelCase,
    parseStyleString,
} from '../style-helpers';

describe('style-helpers', () => {
    // -------------------------------------------------------------------------
    // BOOTSTRAP_COLOR_NAMES
    // -------------------------------------------------------------------------
    describe('BOOTSTRAP_COLOR_NAMES', () => {
        it('should contain base Bootstrap colors', () => {
            const baseColors = [
                'primary',
                'secondary',
                'success',
                'danger',
                'warning',
                'info',
                'light',
                'dark',
            ];
            baseColors.forEach(color => {
                expect(BOOTSTRAP_COLOR_NAMES.has(color)).toBe(true);
            });
        });

        it('should contain subtle variants', () => {
            const subtleColors = [
                'primary-subtle',
                'secondary-subtle',
                'success-subtle',
                'danger-subtle',
            ];
            subtleColors.forEach(color => {
                expect(BOOTSTRAP_COLOR_NAMES.has(color)).toBe(true);
            });
        });

        it('should contain emphasis variants', () => {
            const emphasisColors = ['primary-emphasis', 'danger-emphasis', 'dark-emphasis'];
            emphasisColors.forEach(color => {
                expect(BOOTSTRAP_COLOR_NAMES.has(color)).toBe(true);
            });
        });

        it('should contain special color names', () => {
            const specialColors = [
                'black',
                'white',
                'muted',
                'body',
                'body-secondary',
                'body-tertiary',
                'black-50',
                'white-50',
            ];
            specialColors.forEach(color => {
                expect(BOOTSTRAP_COLOR_NAMES.has(color)).toBe(true);
            });
        });

        it('should not contain arbitrary CSS color names', () => {
            expect(BOOTSTRAP_COLOR_NAMES.has('red')).toBe(false);
            expect(BOOTSTRAP_COLOR_NAMES.has('blue')).toBe(false);
            expect(BOOTSTRAP_COLOR_NAMES.has('#fff')).toBe(false);
        });
    });

    // -------------------------------------------------------------------------
    // ALIGN_MAP
    // -------------------------------------------------------------------------
    describe('ALIGN_MAP', () => {
        it('should map start to left', () => {
            expect(ALIGN_MAP['start']).toBe('left');
        });

        it('should map center to center', () => {
            expect(ALIGN_MAP['center']).toBe('center');
        });

        it('should map end to right', () => {
            expect(ALIGN_MAP['end']).toBe('right');
        });

        it('should return undefined for unknown key', () => {
            expect(ALIGN_MAP['left']).toBeUndefined();
        });
    });

    // -------------------------------------------------------------------------
    // isBootstrapColor
    // -------------------------------------------------------------------------
    describe('isBootstrapColor', () => {
        describe('valid cases', () => {
            it('should return true for base Bootstrap colors', () => {
                expect(isBootstrapColor('primary')).toBe(true);
                expect(isBootstrapColor('success')).toBe(true);
                expect(isBootstrapColor('danger')).toBe(true);
            });

            it('should return true for subtle variants', () => {
                expect(isBootstrapColor('success-subtle')).toBe(true);
                expect(isBootstrapColor('danger-subtle')).toBe(true);
            });

            it('should return true for emphasis variants', () => {
                expect(isBootstrapColor('primary-emphasis')).toBe(true);
                expect(isBootstrapColor('dark-emphasis')).toBe(true);
            });

            it('should return true for special names', () => {
                expect(isBootstrapColor('white')).toBe(true);
                expect(isBootstrapColor('black')).toBe(true);
                expect(isBootstrapColor('muted')).toBe(true);
                expect(isBootstrapColor('body')).toBe(true);
            });
        });

        describe('invalid cases', () => {
            it('should return false for null', () => {
                expect(isBootstrapColor(null)).toBe(false);
            });

            it('should return false for undefined', () => {
                expect(isBootstrapColor(undefined)).toBe(false);
            });

            it('should return false for empty string', () => {
                expect(isBootstrapColor('')).toBe(false);
            });

            it('should return false for hex colors', () => {
                expect(isBootstrapColor('#ff0000')).toBe(false);
                expect(isBootstrapColor('#fff')).toBe(false);
            });

            it('should return false for rgb colors', () => {
                expect(isBootstrapColor('rgb(255,0,0)')).toBe(false);
            });

            it('should return false for arbitrary CSS color names', () => {
                expect(isBootstrapColor('red')).toBe(false);
                expect(isBootstrapColor('blue')).toBe(false);
                expect(isBootstrapColor('tomato')).toBe(false);
            });
        });
    });

    // -------------------------------------------------------------------------
    // kebabToCamelCase
    // -------------------------------------------------------------------------
    describe('kebabToCamelCase', () => {
        it('should convert background-color to backgroundColor', () => {
            expect(kebabToCamelCase('background-color')).toBe('backgroundColor');
        });

        it('should convert font-weight to fontWeight', () => {
            expect(kebabToCamelCase('font-weight')).toBe('fontWeight');
        });

        it('should convert border-top-width to borderTopWidth', () => {
            expect(kebabToCamelCase('border-top-width')).toBe('borderTopWidth');
        });

        it('should keep single-word property as is', () => {
            expect(kebabToCamelCase('color')).toBe('color');
        });

        it('should keep already camelCase property unchanged', () => {
            expect(kebabToCamelCase('fontSize')).toBe('fontSize');
        });

        it('should handle empty string', () => {
            expect(kebabToCamelCase('')).toBe('');
        });
    });

    // -------------------------------------------------------------------------
    // parseStyleString
    // -------------------------------------------------------------------------
    describe('parseStyleString', () => {
        it('should parse single declaration', () => {
            const styles: Record<string, string> = {};
            parseStyleString(styles, 'color: red');
            expect(styles).toEqual({ color: 'red' });
        });

        it('should parse multiple declarations', () => {
            const styles: Record<string, string> = {};
            parseStyleString(styles, 'color: red; font-weight: bold');
            expect(styles).toEqual({ color: 'red', fontWeight: 'bold' });
        });

        it('should convert kebab-case to camelCase', () => {
            const styles: Record<string, string> = {};
            parseStyleString(styles, 'background-color: blue; margin-top: 10px');
            expect(styles).toEqual({ backgroundColor: 'blue', marginTop: '10px' });
        });

        it('should handle trailing semicolons', () => {
            const styles: Record<string, string> = {};
            parseStyleString(styles, 'padding: 5px;');
            expect(styles).toEqual({ padding: '5px' });
        });

        it('should handle values with colons (e.g. url)', () => {
            const styles: Record<string, string> = {};
            parseStyleString(styles, 'background: url(http://example.com)');
            expect(styles).toEqual({ background: 'url(http://example.com)' });
        });

        it('should merge into existing styles object', () => {
            const styles: Record<string, string> = { existing: 'value' };
            parseStyleString(styles, 'color: red');
            expect(styles).toEqual({ existing: 'value', color: 'red' });
        });

        it('should skip empty declarations', () => {
            const styles: Record<string, string> = {};
            parseStyleString(styles, ';;color: red;;');
            expect(styles).toEqual({ color: 'red' });
        });

        it('should trim whitespace around properties and values', () => {
            const styles: Record<string, string> = {};
            parseStyleString(styles, '  color  :  blue  ;  padding  :  10px  ');
            expect(styles).toEqual({ color: 'blue', padding: '10px' });
        });

        it('should handle empty string input', () => {
            const styles: Record<string, string> = {};
            parseStyleString(styles, '');
            expect(styles).toEqual({});
        });

        it('should skip declarations without colon', () => {
            const styles: Record<string, string> = {};
            parseStyleString(styles, 'invalid; color: red');
            expect(styles).toEqual({ color: 'red' });
        });
    });
});
