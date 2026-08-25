import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { TableHeaderSearchCell } from '../TableHeaderSearchCell';
import type { HeaderCell } from '../../../../../types/api-response.types';
import { useCoreStore } from '../../../../../state/core/core.state';
import { useApiResourcesStore } from '../../../../../state/data/api-resources.state';
import * as htmlSanitizerModule from '../../../../../validators/sanitizers/html.sanitizer';

describe('TableHeaderSearchCell', () => {
    const storeId = 'test-table-header-search-cell';
    let core: ReturnType<typeof useCoreStore>;
    let resource: ReturnType<typeof useApiResourcesStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        // Clear session storage to prevent interference from session restore
        window.sessionStorage.clear();
        core = useCoreStore(storeId, { storeId });
        resource = useApiResourcesStore(storeId, core);
    });

    describe('rendering', () => {
        it('should render th element', () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            expect(wrapper.find('th').exists()).toBe(true);
            expect(wrapper.find('[data-testid="table-header-search-cell"]').exists()).toBe(true);
            // Header row cell: it has to declare what it labels
            expect(wrapper.find('th').attributes('scope')).toBe('col');
        });

        it('should render input group with proper structure', () => {
            const cell: HeaderCell = {
                content: 'Email',
                key: 'email',
                field: 'email',
                searchable: true,
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            expect(wrapper.find('.input-group').exists()).toBe(true);
            expect(wrapper.find('.input-group-sm').exists()).toBe(true);
            expect(wrapper.find('input.form-control').exists()).toBe(true);
        });

        it('should render search button with icon', () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const searchBtn = wrapper.find('[data-testid="search-btn-name"]');
            expect(searchBtn.exists()).toBe(true);
            expect(searchBtn.find('i').exists()).toBe(true);
        });

        it('should render clear button with icon', () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const clearBtn = wrapper.find('[data-testid="clear-btn-name"]');
            expect(clearBtn.exists()).toBe(true);
            expect(clearBtn.find('i').exists()).toBe(true);
        });

        it('should use cell content as placeholder', () => {
            const cell: HeaderCell = {
                content: 'Username',
                key: 'username',
                field: 'username',
                searchable: true,
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            expect(input.attributes('placeholder')).toBe('Username');
        });

        it('should use cell label as placeholder if available', () => {
            const cell: HeaderCell = {
                content: 'User Name',
                label: 'Search User',
                key: 'username',
                field: 'username',
                searchable: true,
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            expect(input.attributes('placeholder')).toBe('Search User');
        });
    });

    describe('input interactions', () => {
        it('should update input value on user input', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            await input.setValue('John');

            expect((input.element as HTMLInputElement).value).toBe('John');
        });

        it('should call addSearch when search button is clicked with new term', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            const addSearchSpy = vi.spyOn(resource, 'addSearch');

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            await input.setValue('John');

            const searchBtn = wrapper.find('[data-testid="search-btn-name"]');
            await searchBtn.trigger('click');

            expect(addSearchSpy).toHaveBeenCalledWith('name', 'John', undefined);
        });

        it('should call updateSearchTerm when search button is clicked with existing term', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            // Add initial search
            resource.addSearch('name', 'John');

            const updateSearchSpy = vi.spyOn(resource, 'updateSearchTerm');

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            await input.setValue('Jane');

            const searchBtn = wrapper.find('[data-testid="search-btn-name"]');
            await searchBtn.trigger('click');

            expect(updateSearchSpy).toHaveBeenCalledWith('name', 'Jane', undefined);
        });

        it('should call removeSearch when clear button is clicked', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            // Add initial search
            resource.addSearch('name', 'John');

            const removeSearchSpy = vi.spyOn(resource, 'removeSearch');

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const clearBtn = wrapper.find('[data-testid="clear-btn-name"]');
            await clearBtn.trigger('click');

            expect(removeSearchSpy).toHaveBeenCalledWith('name');
        });

        it('should clear input value when clear button is clicked', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            // Add initial search
            resource.addSearch('name', 'John');

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const clearBtn = wrapper.find('[data-testid="clear-btn-name"]');
            await clearBtn.trigger('click');

            const input = wrapper.find('input');
            expect((input.element as HTMLInputElement).value).toBe('');
        });

        it('should trigger search on Enter key press', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            const addSearchSpy = vi.spyOn(resource, 'addSearch');

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            await input.setValue('John');
            await input.trigger('keydown', { key: 'Enter' });

            expect(addSearchSpy).toHaveBeenCalledWith('name', 'John', undefined);
        });
    });

    describe('button states', () => {
        it('should disable search button when input is empty', () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const searchBtn = wrapper.find('[data-testid="search-btn-name"]');
            expect(searchBtn.attributes('disabled')).toBeDefined();
        });

        it('should enable search button when input has value', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            await input.setValue('John');

            const searchBtn = wrapper.find('[data-testid="search-btn-name"]');
            expect(searchBtn.attributes('disabled')).toBeUndefined();
        });

        it('should disable clear button when no search exists', () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const clearBtn = wrapper.find('[data-testid="clear-btn-name"]');
            expect(clearBtn.attributes('disabled')).toBeDefined();
        });

        it('should enable clear button when search exists', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            // Add initial search
            resource.addSearch('name', 'John');

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            await wrapper.vm.$nextTick();

            const clearBtn = wrapper.find('[data-testid="clear-btn-name"]');
            expect(clearBtn.attributes('disabled')).toBeUndefined();
        });
    });

    describe('validation and sanitization', () => {
        it('should not search with empty string after trim', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            const addSearchSpy = vi.spyOn(resource, 'addSearch');

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            await input.setValue('   ');

            const searchBtn = wrapper.find('[data-testid="search-btn-name"]');
            await searchBtn.trigger('click');

            expect(addSearchSpy).not.toHaveBeenCalled();
        });

        it('should sanitize HTML input', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            const addSearchSpy = vi.spyOn(resource, 'addSearch');

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            await input.setValue('<script>alert("xss")</script>John');

            const searchBtn = wrapper.find('[data-testid="search-btn-name"]');
            await searchBtn.trigger('click');

            // Should be sanitized (no script tags)
            expect(addSearchSpy).toHaveBeenCalled();
            const calledWith = addSearchSpy.mock.calls[0]?.[1];
            expect(calledWith).not.toContain('<script>');
        });
    });

    describe('store synchronization', () => {
        it('should initialize input with existing search term', () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            // Add search before mounting
            resource.addSearch('name', 'John');

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            expect((input.element as HTMLInputElement).value).toBe('John');
        });

        it('should sync input when store value changes', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            // Update store externally
            resource.addSearch('name', 'Jane');
            await wrapper.vm.$nextTick();

            const input = wrapper.find('input');
            expect((input.element as HTMLInputElement).value).toBe('Jane');
        });

        it('should use field from cell for store operations', async () => {
            const cell: HeaderCell = {
                content: 'User Name',
                key: 'user-key',
                field: 'username',
                searchable: true,
            };

            const addSearchSpy = vi.spyOn(resource, 'addSearch');

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            await input.setValue('John');

            const searchBtn = wrapper.find('[data-testid="search-btn-username"]');
            await searchBtn.trigger('click');

            expect(addSearchSpy).toHaveBeenCalledWith('username', 'John', undefined);
        });

        it('should fall back to key when field is not provided', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name-key',
                searchable: true,
            };

            const addSearchSpy = vi.spyOn(resource, 'addSearch');

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            await input.setValue('John');

            const searchBtn = wrapper.find('[data-testid="search-btn-name-key"]');
            await searchBtn.trigger('click');

            expect(addSearchSpy).toHaveBeenCalledWith('name-key', 'John', undefined);
        });
    });

    describe('debounce functionality', () => {
        it('should cancel debounce when Enter key is pressed', async () => {
            vi.useFakeTimers();

            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            const addSearchSpy = vi.spyOn(resource, 'addSearch');

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');

            // Start typing (triggers debounce)
            await input.setValue('John');
            await input.trigger('input');

            // Should not have searched yet (debounce delay)
            expect(addSearchSpy).not.toHaveBeenCalled();

            // Press Enter immediately (cancels debounce and searches)
            await input.trigger('keydown', { key: 'Enter' });

            // Should search immediately without waiting for debounce
            expect(addSearchSpy).toHaveBeenCalledWith('name', 'John', undefined);

            // Advance timers to ensure debounce doesn't trigger again
            vi.advanceTimersByTime(300);

            // Should still only have been called once
            expect(addSearchSpy).toHaveBeenCalledTimes(1);

            vi.useRealTimers();
        });

        it('should cancel debounce when clear button is clicked', async () => {
            vi.useFakeTimers();

            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            // Add initial search
            resource.addSearch('name', 'John');

            const removeSearchSpy = vi.spyOn(resource, 'removeSearch');

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');

            // Start typing (triggers debounce)
            await input.setValue('Jane');
            await input.trigger('input');

            // Click clear immediately
            const clearBtn = wrapper.find('[data-testid="clear-btn-name"]');
            await clearBtn.trigger('click');

            // Should have cleared immediately
            expect(removeSearchSpy).toHaveBeenCalledWith('name');
            expect((input.element as HTMLInputElement).value).toBe('');

            // Advance timers to ensure debounce doesn't trigger
            vi.advanceTimersByTime(300);

            // Should still only have been called once
            expect(removeSearchSpy).toHaveBeenCalledTimes(1);

            vi.useRealTimers();
        });

        it('should trigger search button click immediately without debounce', async () => {
            vi.useFakeTimers();

            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            const addSearchSpy = vi.spyOn(resource, 'addSearch');

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            await input.setValue('John');

            const searchBtn = wrapper.find('[data-testid="search-btn-name"]');
            await searchBtn.trigger('click');

            // Should search immediately, no debounce
            expect(addSearchSpy).toHaveBeenCalledWith('name', 'John', undefined);
            expect(addSearchSpy).toHaveBeenCalledTimes(1);

            vi.useRealTimers();
        });
    });

    describe('sanitization error handling', () => {
        it('should not search when sanitizer returns non-string value', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            const addSearchSpy = vi.spyOn(resource, 'addSearch');

            // Mock htmlSanitizer to return non-string (e.g., undefined or number)
            const sanitizerSpy = vi
                .spyOn(htmlSanitizerModule, 'htmlSanitizer')
                .mockReturnValueOnce(undefined as unknown as string);

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            await input.setValue('John');

            const searchBtn = wrapper.find('[data-testid="search-btn-name"]');
            await searchBtn.trigger('click');

            // Should not call addSearch because sanitizer returned non-string
            expect(addSearchSpy).not.toHaveBeenCalled();

            sanitizerSpy.mockRestore();
        });

        it('should not search when input contains only whitespace', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            const addSearchSpy = vi.spyOn(resource, 'addSearch');

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            await input.setValue('   ');

            const searchBtn = wrapper.find('[data-testid="search-btn-name"]');
            await searchBtn.trigger('click');

            // Should not call addSearch because input is empty after trim
            expect(addSearchSpy).not.toHaveBeenCalled();
        });
    });

    describe('clearing search by emptying the input', () => {
        it('should call removeSearch when the input is emptied and a search was active', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            // Active search before clearing the field
            resource.addSearch('name', 'John');

            const removeSearchSpy = vi.spyOn(resource, 'removeSearch');

            const wrapper = mount(TableHeaderSearchCell, {
                props: { storeId, cell },
            });

            const input = wrapper.find('input');
            // The user clears the search term (not via the clear button), then presses Enter
            await input.setValue('');
            await input.trigger('keydown', { key: 'Enter' });

            expect(removeSearchSpy).toHaveBeenCalledWith('name');
        });

        it('should not call removeSearch when the input is emptied but no search was active', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            const removeSearchSpy = vi.spyOn(resource, 'removeSearch');

            const wrapper = mount(TableHeaderSearchCell, {
                props: { storeId, cell },
            });

            const input = wrapper.find('input');
            await input.setValue('');
            await input.trigger('keydown', { key: 'Enter' });

            expect(removeSearchSpy).not.toHaveBeenCalled();
        });
    });

    describe('reference field', () => {
        it('should search on the reference field when set', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'user.name',
                reference: 'user.id',
                searchable: true,
            };

            const addSearchSpy = vi.spyOn(resource, 'addSearch');

            const wrapper = mount(TableHeaderSearchCell, {
                props: { storeId, cell },
            });

            // The input testid is keyed by the resolved (reference) field.
            expect(wrapper.find('[data-testid="search-input-user.id"]').exists()).toBe(true);

            const input = wrapper.find('input');
            await input.setValue('John');
            await input.trigger('keydown', { key: 'Enter' });

            expect(addSearchSpy).toHaveBeenCalledWith('user.id', 'John', undefined);
        });
    });
});
