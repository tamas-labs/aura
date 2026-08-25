import { describe, it, expect } from 'vitest';
import { useGlobalSearch } from '../use-global-search';

describe('useGlobalSearch', () => {
    it('should start with no term', () => {
        const { globalSearchTerm } = useGlobalSearch();

        expect(globalSearchTerm.value).toBeNull();
    });

    describe('setGlobalSearch', () => {
        it('should store the term', () => {
            const { globalSearchTerm, setGlobalSearch } = useGlobalSearch();

            setGlobalSearch('john');

            expect(globalSearchTerm.value).toBe('john');
        });

        it('should trim surrounding whitespace', () => {
            const { globalSearchTerm, setGlobalSearch } = useGlobalSearch();

            setGlobalSearch('  john  ');

            expect(globalSearchTerm.value).toBe('john');
        });

        it('should keep the inner whitespace of a multi-word term', () => {
            const { globalSearchTerm, setGlobalSearch } = useGlobalSearch();

            setGlobalSearch(' john  doe ');

            expect(globalSearchTerm.value).toBe('john  doe');
        });

        // Null, not '': the consumers treat the term as a truthiness switch, and an
        // empty string would still be a "term" for anything checking `!== null`.
        it('should clear on an empty term', () => {
            const { globalSearchTerm, setGlobalSearch } = useGlobalSearch();

            setGlobalSearch('john');
            setGlobalSearch('');

            expect(globalSearchTerm.value).toBeNull();
        });

        it('should clear on a whitespace-only term', () => {
            const { globalSearchTerm, setGlobalSearch } = useGlobalSearch();

            setGlobalSearch('john');
            setGlobalSearch('   ');

            expect(globalSearchTerm.value).toBeNull();
        });

        it('should overwrite a previous term', () => {
            const { globalSearchTerm, setGlobalSearch } = useGlobalSearch();

            setGlobalSearch('john');
            setGlobalSearch('jane');

            expect(globalSearchTerm.value).toBe('jane');
        });
    });

    describe('clearGlobalSearch', () => {
        it('should reset the term to null', () => {
            const { globalSearchTerm, setGlobalSearch, clearGlobalSearch } = useGlobalSearch();

            setGlobalSearch('john');
            clearGlobalSearch();

            expect(globalSearchTerm.value).toBeNull();
        });

        it('should be a no-op when already empty', () => {
            const { globalSearchTerm, clearGlobalSearch } = useGlobalSearch();

            clearGlobalSearch();

            expect(globalSearchTerm.value).toBeNull();
        });
    });
});
