import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { ResultsInfo } from '../ResultsInfo';

describe('ResultsInfo', () => {
    describe('rendering', () => {
        it('should render results info container', () => {
            const wrapper = mount(ResultsInfo, {
                props: {
                    currentPage: 1,
                    rowsPerPage: 10,
                    totalRecords: 100,
                },
            });

            expect(wrapper.find('[data-testid="results-info"]').exists()).toBe(true);
        });

        it('should have correct CSS classes', () => {
            const wrapper = mount(ResultsInfo, {
                props: {
                    currentPage: 1,
                    rowsPerPage: 10,
                    totalRecords: 100,
                },
            });

            const span = wrapper.find('span');
            expect(span.classes()).toContain('text-muted');
            expect(span.classes()).toContain('small');
        });
    });

    describe('info text calculation', () => {
        it('should display correct text for first page', () => {
            const wrapper = mount(ResultsInfo, {
                props: {
                    currentPage: 1,
                    rowsPerPage: 10,
                    totalRecords: 100,
                },
            });

            expect(wrapper.text()).toBe('Showing 1-10 of 100');
        });

        it('should display correct text for middle page', () => {
            const wrapper = mount(ResultsInfo, {
                props: {
                    currentPage: 3,
                    rowsPerPage: 25,
                    totalRecords: 200,
                },
            });

            expect(wrapper.text()).toBe('Showing 51-75 of 200');
        });

        it('should display correct text for last page with partial records', () => {
            const wrapper = mount(ResultsInfo, {
                props: {
                    currentPage: 3,
                    rowsPerPage: 50,
                    totalRecords: 123,
                },
            });

            expect(wrapper.text()).toBe('Showing 101-123 of 123');
        });

        it('should display correct text when full last page', () => {
            const wrapper = mount(ResultsInfo, {
                props: {
                    currentPage: 4,
                    rowsPerPage: 25,
                    totalRecords: 100,
                },
            });

            expect(wrapper.text()).toBe('Showing 76-100 of 100');
        });
    });

    describe('edge cases', () => {
        it('should display the noResults label when there are no records', () => {
            const wrapper = mount(ResultsInfo, {
                props: {
                    currentPage: 1,
                    rowsPerPage: 10,
                    totalRecords: 0,
                },
            });

            expect(wrapper.text()).toBe('No results');
        });

        it('should handle single record correctly', () => {
            const wrapper = mount(ResultsInfo, {
                props: {
                    currentPage: 1,
                    rowsPerPage: 10,
                    totalRecords: 1,
                },
            });

            expect(wrapper.text()).toBe('Showing 1-1 of 1');
        });

        it('should handle when rows per page equals total records', () => {
            const wrapper = mount(ResultsInfo, {
                props: {
                    currentPage: 1,
                    rowsPerPage: 50,
                    totalRecords: 50,
                },
            });

            expect(wrapper.text()).toBe('Showing 1-50 of 50');
        });

        it('should handle large page number correctly', () => {
            const wrapper = mount(ResultsInfo, {
                props: {
                    currentPage: 10,
                    rowsPerPage: 100,
                    totalRecords: 1000,
                },
            });

            expect(wrapper.text()).toBe('Showing 901-1000 of 1000');
        });
    });

    describe('props reactivity', () => {
        it('should update text when currentPage changes', async () => {
            const wrapper = mount(ResultsInfo, {
                props: {
                    currentPage: 1,
                    rowsPerPage: 10,
                    totalRecords: 100,
                },
            });

            expect(wrapper.text()).toBe('Showing 1-10 of 100');

            await wrapper.setProps({ currentPage: 2 });
            expect(wrapper.text()).toBe('Showing 11-20 of 100');
        });

        it('should update text when totalRecords changes', async () => {
            const wrapper = mount(ResultsInfo, {
                props: {
                    currentPage: 1,
                    rowsPerPage: 10,
                    totalRecords: 100,
                },
            });

            expect(wrapper.text()).toBe('Showing 1-10 of 100');

            await wrapper.setProps({ totalRecords: 200 });
            expect(wrapper.text()).toBe('Showing 1-10 of 200');
        });

        it('should update text when rowsPerPage changes', async () => {
            const wrapper = mount(ResultsInfo, {
                props: {
                    currentPage: 1,
                    rowsPerPage: 10,
                    totalRecords: 100,
                },
            });

            expect(wrapper.text()).toBe('Showing 1-10 of 100');

            await wrapper.setProps({ rowsPerPage: 25 });
            expect(wrapper.text()).toBe('Showing 1-25 of 100');
        });
    });

    describe('labels prop', () => {
        it('should apply the paginationInfo override with token substitution', () => {
            const wrapper = mount(ResultsInfo, {
                props: {
                    currentPage: 2,
                    rowsPerPage: 10,
                    totalRecords: 100,
                    labels: { paginationInfo: 'Mutat {from}-{to} / {total} rekordból' },
                },
            });

            expect(wrapper.text()).toBe('Mutat 11-20 / 100 rekordból');
        });

        it('should apply the noResults override for an empty result set', () => {
            const wrapper = mount(ResultsInfo, {
                props: {
                    currentPage: 1,
                    rowsPerPage: 10,
                    totalRecords: 0,
                    labels: { noResults: 'Nincs találat' },
                },
            });

            expect(wrapper.text()).toBe('Nincs találat');
        });

        it('should fall back to the defaults for a partial labels object', () => {
            const wrapper = mount(ResultsInfo, {
                props: {
                    currentPage: 1,
                    rowsPerPage: 10,
                    totalRecords: 100,
                    labels: { noResults: 'Nincs találat' },
                },
            });

            expect(wrapper.text()).toBe('Showing 1-10 of 100');
        });
    });
});
