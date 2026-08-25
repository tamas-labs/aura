import { describe, it, expect } from 'vitest';
import { foldAccents, foldSearchText } from '../normalize-text.util';

describe('normalize-text.util', () => {
    describe('foldAccents', () => {
        it('should strip Hungarian diacritics', () => {
            expect(foldAccents('árvíztűrő tükörfúrógép')).toBe('arvizturo tukorfurogep');
        });

        it('should strip diacritics regardless of letter case', () => {
            expect(foldAccents('ÁRVÍZTŰRŐ')).toBe('ARVIZTURO');
        });

        it('should handle already decomposed input', () => {
            // 'e' + U+0301 (combining acute) — the NFD form of 'é'
            expect(foldAccents('é')).toBe('e');
        });

        it('should leave unaccented text untouched', () => {
            expect(foldAccents('plain ascii 123')).toBe('plain ascii 123');
        });

        it('should strip diacritics from other Latin languages', () => {
            expect(foldAccents('Ångström')).toBe('Angstrom');
            expect(foldAccents('naïve façade')).toBe('naive facade');
            expect(foldAccents('Müller')).toBe('Muller');
        });

        it('should keep characters that carry no combining marks', () => {
            // 'ß' and 'ø' have no decomposition, so folding cannot reach them.
            expect(foldAccents('straße')).toBe('straße');
            expect(foldAccents('søster')).toBe('søster');
        });

        it('should return an empty string for an empty input', () => {
            expect(foldAccents('')).toBe('');
        });

        it('should reduce a lone combining mark to nothing', () => {
            expect(foldAccents('́')).toBe('');
        });

        it('should keep emoji intact', () => {
            expect(foldAccents('héllo 🎉')).toBe('hello 🎉');
        });
    });

    describe('foldSearchText', () => {
        it('should lower-case but keep accents when accent folding is off', () => {
            expect(foldSearchText('Árvíztűrő', false)).toBe('árvíztűrő');
        });

        it('should lower-case and fold accents when accent folding is on', () => {
            expect(foldSearchText('Árvíztűrő', true)).toBe('arvizturo');
        });

        it('should be a no-op for lower-case ascii either way', () => {
            expect(foldSearchText('plain', false)).toBe('plain');
            expect(foldSearchText('plain', true)).toBe('plain');
        });

        it('should map the accented and the unaccented spelling onto the same form', () => {
            expect(foldSearchText('TÜKÖR', true)).toBe(foldSearchText('tukor', true));
        });

        it('should keep the two spellings apart when folding is off', () => {
            expect(foldSearchText('TÜKÖR', false)).not.toBe(foldSearchText('tukor', false));
        });
    });
});
