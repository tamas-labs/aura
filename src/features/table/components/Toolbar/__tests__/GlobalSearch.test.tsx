import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { GlobalSearch } from '../GlobalSearch';
import { useCoreStore, useApiResourcesStore } from '../../../../../state';
import type { AuraProps } from '../../../../../types';

describe('GlobalSearch', () => {
    const TEST_STORE_ID = 'test-global-search';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('rendering', () => {
        it('should render with input group structure', () => {
            const core = useCoreStore(TEST_STORE_ID, { storeId: TEST_STORE_ID } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID, core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID,
                },
            });

            expect(wrapper.find('[data-testid="global-search"]').exists()).toBe(true);
            // Search icon span removed
            expect(wrapper.find('[data-testid="global-search-icon"]').exists()).toBe(false);
            expect(wrapper.find('[data-testid="global-search-input"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="global-search-button"]').exists()).toBe(true);
            // Clear button always exists
            expect(wrapper.find('[data-testid="global-search-clear"]').exists()).toBe(true);
        });

        it('should display default placeholder', () => {
            const core = useCoreStore(TEST_STORE_ID + '-placeholder', {
                storeId: TEST_STORE_ID + '-placeholder',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-placeholder', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-placeholder',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            expect(input.attributes('placeholder')).toBe('Search...');
        });

        it('should display custom placeholder', () => {
            const core = useCoreStore(TEST_STORE_ID + '-custom-placeholder', {
                storeId: TEST_STORE_ID + '-custom-placeholder',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-custom-placeholder', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-custom-placeholder',
                    placeholder: 'Search users...',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            expect(input.attributes('placeholder')).toBe('Search users...');
        });

        it('should render search icon inside button', () => {
            const core = useCoreStore(TEST_STORE_ID + '-icon', {
                storeId: TEST_STORE_ID + '-icon',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-icon', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-icon',
                },
            });

            const icon = wrapper.find('[data-testid="global-search-button"] i');
            expect(icon.classes()).toContain('fas');
            expect(icon.classes()).toContain('fa-magnifying-glass');
        });

        it('should render default clear icon inside button', () => {
            const core = useCoreStore(TEST_STORE_ID + '-clear-icon-default', {
                storeId: TEST_STORE_ID + '-clear-icon-default',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-clear-icon-default', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-clear-icon-default',
                },
            });

            const icon = wrapper.find('[data-testid="global-search-clear"] i');
            expect(icon.classes()).toContain('fas');
            expect(icon.classes()).toContain('fa-xmark');
        });

        it('should use icons from config when available', () => {
            const core = useCoreStore(TEST_STORE_ID + '-config-icons', {
                storeId: TEST_STORE_ID + '-config-icons',
            } as AuraProps);

            // Set custom icons in config
            core.config.icons = {
                search: ['custom-search', 'icon-class'],
                clear: ['custom-clear', 'icon-class'],
                sortable: { up: [], down: [], both: [] },
                filterable: [],
                filterableChecked: [],
                settings: [],
                save: [],
                close: [],
                destroy: [],
                edit: [],
                show: [],
                switchUser: [],
                primary: [],
            };

            useApiResourcesStore(TEST_STORE_ID + '-config-icons', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-config-icons',
                },
            });

            const searchIcon = wrapper.find('[data-testid="global-search-button"] i');
            expect(searchIcon.classes()).toContain('custom-search');
            expect(searchIcon.classes()).toContain('icon-class');

            const clearIcon = wrapper.find('[data-testid="global-search-clear"] i');
            expect(clearIcon.classes()).toContain('custom-clear');
            expect(clearIcon.classes()).toContain('icon-class');
        });

        it('should fallback to prop icons when config icons not available', () => {
            const core = useCoreStore(TEST_STORE_ID + '-fallback-icons', {
                storeId: TEST_STORE_ID + '-fallback-icons',
            } as AuraProps);

            // Explicitly set icons to undefined to test fallback
            core.config.icons = undefined as any;

            useApiResourcesStore(TEST_STORE_ID + '-fallback-icons', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-fallback-icons',
                    searchIcon: ['fallback-search', 'icon'],
                    clearIcon: ['fallback-clear', 'icon'],
                },
            });

            const searchIcon = wrapper.find('[data-testid="global-search-button"] i');
            expect(searchIcon.classes()).toContain('fallback-search');
            expect(searchIcon.classes()).toContain('icon');

            const clearIcon = wrapper.find('[data-testid="global-search-clear"] i');
            expect(clearIcon.classes()).toContain('fallback-clear');
            expect(clearIcon.classes()).toContain('icon');
        });
    });

    describe('clear button state', () => {
        it('should trigger disabled state when no search term', () => {
            const core = useCoreStore(TEST_STORE_ID + '-clear-init', {
                storeId: TEST_STORE_ID + '-clear-init',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-clear-init', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-clear-init',
                },
            });

            const clearButton = wrapper.find('[data-testid="global-search-clear"]');
            expect(clearButton.attributes('disabled')).toBeDefined();
        });

        it('should enable clear button when store has active search', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-clear-show', {
                storeId: TEST_STORE_ID + '-clear-show',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-clear-show', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-clear-show',
                },
            });

            resource.setGlobalSearch('test');
            await wrapper.vm.$nextTick();

            const clearButton = wrapper.find('[data-testid="global-search-clear"]');
            expect(clearButton.attributes('disabled')).toBeUndefined();
        });

        it('should render custom clear icon when config is empty', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-clear-icon', {
                storeId: TEST_STORE_ID + '-clear-icon',
            } as AuraProps);

            // Set icons to undefined to use prop fallback
            core.config.icons = undefined as any;

            useApiResourcesStore(TEST_STORE_ID + '-clear-icon', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-clear-icon',
                    clearIcon: ['custom-clear', 'icon-class'],
                },
            });

            const clearIcon = wrapper.find('[data-testid="global-search-clear"] i');
            expect(clearIcon.classes()).toContain('custom-clear');
            expect(clearIcon.classes()).toContain('icon-class');
        });

        it('should disable clear button after clearing search', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-clear-after', {
                storeId: TEST_STORE_ID + '-clear-after',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-clear-after', core);

            resource.setGlobalSearch('test');

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-clear-after',
                },
            });

            await wrapper.vm.$nextTick();

            const clearButton = wrapper.find('[data-testid="global-search-clear"]');
            expect(clearButton.attributes('disabled')).toBeUndefined();

            await clearButton.trigger('click');
            await wrapper.vm.$nextTick();

            expect(clearButton.attributes('disabled')).toBeDefined();
        });

        it('should always render clear button regardless of input value', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-always-render', {
                storeId: TEST_STORE_ID + '-always-render',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-always-render', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-always-render',
                },
            });

            // Initially, clear button should exist
            expect(wrapper.find('[data-testid="global-search-clear"]').exists()).toBe(true);

            // Type in input
            const input = wrapper.find('[data-testid="global-search-input"]');
            await input.setValue('test');

            // Clear button should still exist
            expect(wrapper.find('[data-testid="global-search-clear"]').exists()).toBe(true);

            // Clear input
            await input.setValue('');

            // Clear button should still exist
            expect(wrapper.find('[data-testid="global-search-clear"]').exists()).toBe(true);
        });

        it('should enable clear button only when store has globalSearchTerm', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-store-term', {
                storeId: TEST_STORE_ID + '-store-term',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-store-term', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-store-term',
                },
            });

            const clearButton = wrapper.find('[data-testid="global-search-clear"]');

            // Initially disabled
            expect(clearButton.attributes('disabled')).toBeDefined();

            // Type in input but don't search
            const input = wrapper.find('[data-testid="global-search-input"]');
            await input.setValue('test typing');
            await wrapper.vm.$nextTick();

            // Still disabled because store doesn't have the term yet
            expect(clearButton.attributes('disabled')).toBeDefined();

            // Trigger search
            await input.trigger('keydown', { key: 'Enter' });
            await wrapper.vm.$nextTick();

            // Now enabled because store has the term
            expect(clearButton.attributes('disabled')).toBeUndefined();
            expect(resource.globalSearchTerm).toBe('test typing');
        });
    });

    describe('button state', () => {
        it('should start with button disabled', () => {
            const core = useCoreStore(TEST_STORE_ID + '-disabled', {
                storeId: TEST_STORE_ID + '-disabled',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-disabled', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-disabled',
                },
            });

            const button = wrapper.find('[data-testid="global-search-button"]');
            expect(button.attributes('disabled')).toBeDefined();
        });

        it('should keep button disabled with less than 3 characters', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-min', {
                storeId: TEST_STORE_ID + '-min',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-min', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-min',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            await input.setValue('ab');

            const button = wrapper.find('[data-testid="global-search-button"]');
            expect(button.attributes('disabled')).toBeDefined();
        });

        it('should enable button with 3 or more characters', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-enabled', {
                storeId: TEST_STORE_ID + '-enabled',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-enabled', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-enabled',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            await input.setValue('abc');

            const button = wrapper.find('[data-testid="global-search-button"]');
            expect(button.attributes('disabled')).toBeUndefined();
        });

        it('should respect custom minLength', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-custom-min', {
                storeId: TEST_STORE_ID + '-custom-min',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-custom-min', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-custom-min',
                    minLength: 5,
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');

            await input.setValue('test');
            let button = wrapper.find('[data-testid="global-search-button"]');
            expect(button.attributes('disabled')).toBeDefined();

            await input.setValue('tests');
            button = wrapper.find('[data-testid="global-search-button"]');
            expect(button.attributes('disabled')).toBeUndefined();
        });

        it('should trim whitespace for validation', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-trim', {
                storeId: TEST_STORE_ID + '-trim',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-trim', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-trim',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            await input.setValue('  a  ');

            const button = wrapper.find('[data-testid="global-search-button"]');
            expect(button.attributes('disabled')).toBeDefined();
        });
    });

    describe('search on button click', () => {
        it('should call store.setGlobalSearch when button clicked with valid input', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-search', {
                storeId: TEST_STORE_ID + '-search',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-search', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-search',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            await input.setValue('test query');

            const button = wrapper.find('[data-testid="global-search-button"]');
            await button.trigger('click');

            expect(resource.globalSearchTerm).toBe('test query');
        });

        it('should not call store.setGlobalSearch when button clicked with invalid input', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-no-search', {
                storeId: TEST_STORE_ID + '-no-search',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-no-search', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-no-search',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            await input.setValue('ab');

            const button = wrapper.find('[data-testid="global-search-button"]');
            await button.trigger('click');

            expect(resource.globalSearchTerm).toBeNull();
        });
    });

    describe('search on Enter key', () => {
        it('should call store.setGlobalSearch when Enter pressed with valid input', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-enter', {
                storeId: TEST_STORE_ID + '-enter',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-enter', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-enter',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            await input.setValue('search term');
            await input.trigger('keydown', { key: 'Enter' });

            expect(resource.globalSearchTerm).toBe('search term');
        });

        it('should not call store.setGlobalSearch when Enter pressed with invalid input', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-enter-invalid', {
                storeId: TEST_STORE_ID + '-enter-invalid',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-enter-invalid', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-enter-invalid',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            await input.setValue('ab');
            await input.trigger('keydown', { key: 'Enter' });

            expect(resource.globalSearchTerm).toBeNull();
        });

        it('should not call store.setGlobalSearch on other key presses', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-other-keys', {
                storeId: TEST_STORE_ID + '-other-keys',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-other-keys', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-other-keys',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            await input.setValue('test');
            await input.trigger('keydown', { key: 'a' });
            await input.trigger('keydown', { key: 'Escape' });

            expect(resource.globalSearchTerm).toBeNull();
        });
    });

    describe('clear button functionality', () => {
        it('should call store.clearGlobalSearch when clear button clicked', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-clear-func', {
                storeId: TEST_STORE_ID + '-clear-func',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-clear-func', core);

            // Set initial search term
            resource.setGlobalSearch('test term');

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-clear-func',
                },
            });

            // Input should show the search term
            await wrapper.vm.$nextTick();
            const input = wrapper.find('[data-testid="global-search-input"]');
            expect((input.element as HTMLInputElement).value).toBe('test term');

            // Clear button should be visible
            const clearButton = wrapper.find('[data-testid="global-search-clear"]');
            expect(clearButton.exists()).toBe(true);

            // Click clear button
            await clearButton.trigger('click');

            // Store should be cleared
            expect(resource.globalSearchTerm).toBeNull();

            // Input should be empty
            expect((input.element as HTMLInputElement).value).toBe('');
        });
    });

    describe('store synchronization', () => {
        it('should initialize input with store globalSearchTerm value', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-sync-init', {
                storeId: TEST_STORE_ID + '-sync-init',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-sync-init', core);

            // Set search term before mounting component
            resource.setGlobalSearch('initial value');

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-sync-init',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            expect((input.element as HTMLInputElement).value).toBe('initial value');
        });

        it('should update input when store globalSearchTerm changes', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-sync-watch', {
                storeId: TEST_STORE_ID + '-sync-watch',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-sync-watch', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-sync-watch',
                },
            });

            // Change store value
            resource.setGlobalSearch('new value');

            await wrapper.vm.$nextTick();

            const input = wrapper.find('[data-testid="global-search-input"]');
            expect((input.element as HTMLInputElement).value).toBe('new value');
        });

        it('should clear input when store is cleared', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-sync-clear', {
                storeId: TEST_STORE_ID + '-sync-clear',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-sync-clear', core);

            resource.setGlobalSearch('initial');

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-sync-clear',
                },
            });

            await wrapper.vm.$nextTick();

            // Clear from store
            resource.clearGlobalSearch();

            await wrapper.vm.$nextTick();

            const input = wrapper.find('[data-testid="global-search-input"]');
            expect((input.element as HTMLInputElement).value).toBe('');
        });
    });

    describe('input behavior', () => {
        it('should update input value on typing', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-input', {
                storeId: TEST_STORE_ID + '-input',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-input', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-input',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            await input.setValue('testing');

            expect((input.element as HTMLInputElement).value).toBe('testing');
        });

        it('should handle empty input', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-empty', {
                storeId: TEST_STORE_ID + '-empty',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-empty', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-empty',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            await input.setValue('test');
            await input.setValue('');

            const button = wrapper.find('[data-testid="global-search-button"]');
            expect(button.attributes('disabled')).toBeDefined();
        });
    });

    describe('edge cases', () => {
        it('should handle exactly minimum length', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-exact-min', {
                storeId: TEST_STORE_ID + '-exact-min',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-exact-min', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-exact-min',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            await input.setValue('abc');

            const button = wrapper.find('[data-testid="global-search-button"]');
            expect(button.attributes('disabled')).toBeUndefined();

            await button.trigger('click');
            expect(resource.globalSearchTerm).toBe('abc');
        });

        it('should handle whitespace-only input', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-whitespace', {
                storeId: TEST_STORE_ID + '-whitespace',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-whitespace', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-whitespace',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            await input.setValue('   ');

            const button = wrapper.find('[data-testid="global-search-button"]');
            expect(button.attributes('disabled')).toBeDefined();
        });

        it('should handle leading and trailing whitespace', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-trim-search', {
                storeId: TEST_STORE_ID + '-trim-search',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-trim-search', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-trim-search',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            await input.setValue('  valid search  ');

            const button = wrapper.find('[data-testid="global-search-button"]');
            expect(button.attributes('disabled')).toBeUndefined();

            await button.trigger('click');
            expect(resource.globalSearchTerm).toBe('valid search');
        });

        it('should handle minLength of 0', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-zero-min', {
                storeId: TEST_STORE_ID + '-zero-min',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-zero-min', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-zero-min',
                    minLength: 0,
                },
            });

            const button = wrapper.find('[data-testid="global-search-button"]');
            expect(button.attributes('disabled')).toBeUndefined();
        });
    });

    describe('Bootstrap classes', () => {
        it('should have correct input-group class', () => {
            const core = useCoreStore(TEST_STORE_ID + '-classes', {
                storeId: TEST_STORE_ID + '-classes',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-classes', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-classes',
                },
            });

            const container = wrapper.find('[data-testid="global-search"]');
            expect(container.classes()).toContain('input-group');
        });

        it('should have form-control class on input', () => {
            const core = useCoreStore(TEST_STORE_ID + '-input-class', {
                storeId: TEST_STORE_ID + '-input-class',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-input-class', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-input-class',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            expect(input.classes()).toContain('form-control');
        });

        it('should have btn btn-outline-secondary classes on search button', () => {
            const core = useCoreStore(TEST_STORE_ID + '-btn-class', {
                storeId: TEST_STORE_ID + '-btn-class',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-btn-class', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-btn-class',
                },
            });

            const button = wrapper.find('[data-testid="global-search-button"]');
            expect(button.classes()).toContain('btn');
            expect(button.classes()).toContain('btn-outline-secondary');
        });

        it('should have btn btn-outline-danger classes on clear button', () => {
            const core = useCoreStore(TEST_STORE_ID + '-clear-class', {
                storeId: TEST_STORE_ID + '-clear-class',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-clear-class', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-clear-class',
                },
            });

            const clearButton = wrapper.find('[data-testid="global-search-clear"]');
            expect(clearButton.classes()).toContain('btn');
            expect(clearButton.classes()).toContain('btn-outline-danger');
        });
    });

    describe('integration scenarios', () => {
        it('should handle complete search workflow', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-workflow', {
                storeId: TEST_STORE_ID + '-workflow',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-workflow', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-workflow',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            const searchButton = wrapper.find('[data-testid="global-search-button"]');
            const clearButton = wrapper.find('[data-testid="global-search-clear"]');

            // 1. Initial state
            expect(searchButton.attributes('disabled')).toBeDefined();
            expect(clearButton.attributes('disabled')).toBeDefined();

            // 2. Type search query
            await input.setValue('test search');

            // 3. Search button enabled, clear button still disabled
            expect(searchButton.attributes('disabled')).toBeUndefined();
            expect(clearButton.attributes('disabled')).toBeDefined();

            // 4. Trigger search
            await searchButton.trigger('click');
            await wrapper.vm.$nextTick();

            // 5. Store updated, clear button now enabled
            expect(resource.globalSearchTerm).toBe('test search');
            expect(clearButton.attributes('disabled')).toBeUndefined();

            // 6. Clear search
            await clearButton.trigger('click');
            await wrapper.vm.$nextTick();

            // 7. Back to initial state
            expect(resource.globalSearchTerm).toBeNull();
            expect((input.element as HTMLInputElement).value).toBe('');
            expect(clearButton.attributes('disabled')).toBeDefined();
        });

        it('should handle search with Enter key workflow', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-enter-workflow', {
                storeId: TEST_STORE_ID + '-enter-workflow',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-enter-workflow', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-enter-workflow',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            const clearButton = wrapper.find('[data-testid="global-search-clear"]');

            // Type and press Enter
            await input.setValue('quick search');
            await input.trigger('keydown', { key: 'Enter' });
            await wrapper.vm.$nextTick();

            // Verify search was triggered
            expect(resource.globalSearchTerm).toBe('quick search');
            expect(clearButton.attributes('disabled')).toBeUndefined();
        });

        it('should handle multiple search operations', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-multiple', {
                storeId: TEST_STORE_ID + '-multiple',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-multiple', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-multiple',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            const searchButton = wrapper.find('[data-testid="global-search-button"]');

            // First search
            await input.setValue('first');
            await searchButton.trigger('click');
            await wrapper.vm.$nextTick();
            expect(resource.globalSearchTerm).toBe('first');

            // Second search
            await input.setValue('second');
            await searchButton.trigger('click');
            await wrapper.vm.$nextTick();
            expect(resource.globalSearchTerm).toBe('second');

            // Third search
            await input.setValue('third');
            await searchButton.trigger('click');
            await wrapper.vm.$nextTick();
            expect(resource.globalSearchTerm).toBe('third');
        });

        it('should maintain UI consistency after external store changes', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-external', {
                storeId: TEST_STORE_ID + '-external',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-external', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-external',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            const clearButton = wrapper.find('[data-testid="global-search-clear"]');

            // External store change (simulating server sync or other component action)
            resource.setGlobalSearch('external value');
            await wrapper.vm.$nextTick();

            // UI should reflect the change
            expect((input.element as HTMLInputElement).value).toBe('external value');
            expect(clearButton.attributes('disabled')).toBeUndefined();

            // External clear
            resource.clearGlobalSearch();
            await wrapper.vm.$nextTick();

            // UI should update
            expect((input.element as HTMLInputElement).value).toBe('');
            expect(clearButton.attributes('disabled')).toBeDefined();
        });

        it('should handle rapid typing and validation', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-rapid', {
                storeId: TEST_STORE_ID + '-rapid',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-rapid', core);

            const wrapper = mount(GlobalSearch, {
                props: {
                    storeId: TEST_STORE_ID + '-rapid',
                },
            });

            const input = wrapper.find('[data-testid="global-search-input"]');
            const searchButton = wrapper.find('[data-testid="global-search-button"]');

            // Rapid typing simulation
            await input.setValue('a');
            expect(searchButton.attributes('disabled')).toBeDefined();

            await input.setValue('ab');
            expect(searchButton.attributes('disabled')).toBeDefined();

            await input.setValue('abc');
            expect(searchButton.attributes('disabled')).toBeUndefined();

            await input.setValue('abcd');
            expect(searchButton.attributes('disabled')).toBeUndefined();

            // Delete back to invalid
            await input.setValue('ab');
            expect(searchButton.attributes('disabled')).toBeDefined();
        });
    });
});
