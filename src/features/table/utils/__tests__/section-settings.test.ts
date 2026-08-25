import { describe, it, expect } from 'vitest';
import { buildSectionSettingsAttrs } from '../section-settings';

describe('buildSectionSettingsAttrs', () => {
    it('should return empty object for null settings', () => {
        expect(buildSectionSettingsAttrs(null, 'aura-thead-sticky')).toEqual({});
    });

    it('should return empty object for undefined settings', () => {
        expect(buildSectionSettingsAttrs(undefined, 'aura-thead-sticky')).toEqual({});
    });

    it('should add the sticky class when sticky is true', () => {
        expect(buildSectionSettingsAttrs({ sticky: true }, 'aura-thead-sticky')).toEqual({
            class: 'aura-thead-sticky',
        });
    });

    it('should use the provided sticky class name', () => {
        expect(buildSectionSettingsAttrs({ sticky: true }, 'aura-tfoot-sticky')).toEqual({
            class: 'aura-tfoot-sticky',
        });
    });

    it('should not add a class when sticky is false', () => {
        expect(buildSectionSettingsAttrs({ sticky: false }, 'aura-thead-sticky')).toEqual({});
    });

    it('should add inline height style when height is set', () => {
        expect(buildSectionSettingsAttrs({ height: '50px' }, 'aura-thead-sticky')).toEqual({
            style: { height: '50px' },
        });
    });

    it('should combine sticky class and height', () => {
        expect(
            buildSectionSettingsAttrs({ sticky: true, height: '2.5rem' }, 'aura-thead-sticky')
        ).toEqual({
            class: 'aura-thead-sticky',
            style: { height: '2.5rem' },
        });
    });

    it('should ignore empty/absent height', () => {
        expect(
            buildSectionSettingsAttrs({ sticky: true, height: null }, 'aura-thead-sticky')
        ).toEqual({ class: 'aura-thead-sticky' });
    });
});
