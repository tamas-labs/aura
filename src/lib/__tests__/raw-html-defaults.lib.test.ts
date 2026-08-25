import { describe, it, expect } from 'vitest';
import {
    DEFAULT_RAW_ALLOW_DATA_ATTR,
    DEFAULT_RAW_CELL_ALLOWED_TAGS,
    DEFAULT_RAW_CELL_ALLOWED_ATTR,
} from '../raw-html-defaults.lib';

describe('raw-html-defaults.lib', () => {
    describe('DEFAULT_RAW_ALLOW_DATA_ATTR', () => {
        it('should be true', () => {
            expect(DEFAULT_RAW_ALLOW_DATA_ATTR).toBe(true);
        });

        it('should be a boolean', () => {
            expect(typeof DEFAULT_RAW_ALLOW_DATA_ATTR).toBe('boolean');
        });
    });

    describe('DEFAULT_RAW_CELL_ALLOWED_TAGS', () => {
        it('should be an array', () => {
            expect(Array.isArray(DEFAULT_RAW_CELL_ALLOWED_TAGS)).toBe(true);
        });

        it('should contain safe text formatting tags', () => {
            expect(DEFAULT_RAW_CELL_ALLOWED_TAGS).toContain('b');
            expect(DEFAULT_RAW_CELL_ALLOWED_TAGS).toContain('i');
            expect(DEFAULT_RAW_CELL_ALLOWED_TAGS).toContain('u');
            expect(DEFAULT_RAW_CELL_ALLOWED_TAGS).toContain('strong');
            expect(DEFAULT_RAW_CELL_ALLOWED_TAGS).toContain('em');
            expect(DEFAULT_RAW_CELL_ALLOWED_TAGS).toContain('span');
            expect(DEFAULT_RAW_CELL_ALLOWED_TAGS).toContain('br');
            expect(DEFAULT_RAW_CELL_ALLOWED_TAGS).toContain('p');
            expect(DEFAULT_RAW_CELL_ALLOWED_TAGS).toContain('a');
        });

        it('should NOT contain dangerous tags', () => {
            expect(DEFAULT_RAW_CELL_ALLOWED_TAGS).not.toContain('script');
            expect(DEFAULT_RAW_CELL_ALLOWED_TAGS).not.toContain('iframe');
            expect(DEFAULT_RAW_CELL_ALLOWED_TAGS).not.toContain('img');
        });
    });

    describe('DEFAULT_RAW_CELL_ALLOWED_ATTR', () => {
        it('should be an array', () => {
            expect(Array.isArray(DEFAULT_RAW_CELL_ALLOWED_ATTR)).toBe(true);
        });

        it('should contain link and title attributes', () => {
            expect(DEFAULT_RAW_CELL_ALLOWED_ATTR).toContain('href');
            expect(DEFAULT_RAW_CELL_ALLOWED_ATTR).toContain('target');
            expect(DEFAULT_RAW_CELL_ALLOWED_ATTR).toContain('title');
            expect(DEFAULT_RAW_CELL_ALLOWED_ATTR).toContain('class');
            expect(DEFAULT_RAW_CELL_ALLOWED_ATTR).toContain('rel');
        });

        it('should allow the style attribute (cell-level raw: true opt-in)', () => {
            expect(DEFAULT_RAW_CELL_ALLOWED_ATTR).toContain('style');
        });

        it('should NOT contain event handler attributes', () => {
            const eventHandlers = ['onclick', 'onerror', 'onload', 'onmouseover'];
            eventHandlers.forEach(handler => {
                expect(DEFAULT_RAW_CELL_ALLOWED_ATTR).not.toContain(handler);
            });
        });
    });
});
