import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { ErrorHandler } from '../ErrorHandler';
import type { ECSError, ErrorType } from '../../../types/error.types';

describe('ErrorHandler', () => {
    // Test constants
    const TEST_COMPONENT = 'TestComponent';
    const FILTERED_COMPONENT = 'FilteredComponent';
    const COMPONENT_A = 'ComponentA';
    const COMPONENT_B = 'ComponentB';
    const TEST_ACTION = 'testAction';
    const VALIDATION_TYPE: ErrorType = 'validation';
    const DATA_TESTID_ERROR_ITEM = 'error-item';
    const DATA_TESTID_DISMISS_ALL = 'dismiss-all';
    const ERROR_ITEM_SELECTOR = `[data-testid="${DATA_TESTID_ERROR_ITEM}"]`;
    const DISMISS_ALL_SELECTOR = `[data-testid="${DATA_TESTID_DISMISS_ALL}"]`;
    const ERROR_STORE_PROP = 'errorStore';
    const SHOW_DISMISS_ALL_PROP = 'showDismissAll';

    const createMockError = (overrides: Partial<ECSError> = {}): ECSError => ({
        severity: 'error',
        timestamp: new Date().toISOString(),
        component: TEST_COMPONENT,
        action: TEST_ACTION,
        level: 'error',
        type: VALIDATION_TYPE,
        message: 'Test error message',
        ...overrides,
    });

    const createMockStore = (errors: ECSError[] = []) => ({
        errors,
        hasErrors: errors.length > 0,
        isValid: errors.length === 0,
        clearErrors: vi.fn(),
        clearByKey: vi.fn(),
        clearByComponent: vi.fn(),
        clearByType: vi.fn(),
    });

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('component registration', () => {
        it('should have name "ErrorHandler"', () => {
            expect(ErrorHandler.name).toBe('ErrorHandler');
        });

        it('should be a valid Vue component', () => {
            expect(ErrorHandler).toBeDefined();
            expect(ErrorHandler.setup).toBeDefined();
        });
    });

    describe('rendering with no errors', () => {
        it('should not render anything when there are no errors', () => {
            const mockStore = createMockStore([]);

            const wrapper = mount(ErrorHandler, {
                props: { errorStore: mockStore },
            });

            expect(wrapper.find('[data-testid="error-handler"]').exists()).toBe(false);
        });
    });

    describe('rendering with errors', () => {
        it('should render error-handler container when there are errors', () => {
            const mockStore = createMockStore([createMockError()]);

            const wrapper = mount(ErrorHandler, {
                props: { errorStore: mockStore },
            });

            expect(wrapper.find('[data-testid="error-handler"]').exists()).toBe(true);
        });

        it('should render error items', () => {
            const mockStore = createMockStore([
                createMockError({ message: 'Error 1' }),
                createMockError({ message: 'Error 2' }),
            ]);

            const wrapper = mount(ErrorHandler, {
                props: { errorStore: mockStore },
            });

            expect(wrapper.findAll(ERROR_ITEM_SELECTOR)).toHaveLength(2);
        });

        it('should render dismiss all button when multiple errors exist', () => {
            const mockStore = createMockStore([
                createMockError({ message: 'Error 1' }),
                createMockError({ message: 'Error 2' }),
            ]);

            const wrapper = mount(ErrorHandler, {
                props: {
                    [ERROR_STORE_PROP]: mockStore,
                    [SHOW_DISMISS_ALL_PROP]: true,
                },
            });

            expect(wrapper.find(DISMISS_ALL_SELECTOR).exists()).toBe(true);
        });

        it('should NOT render dismiss all button for single error', () => {
            const mockStore = createMockStore([createMockError()]);

            const wrapper = mount(ErrorHandler, {
                props: {
                    errorStore: mockStore,
                    showDismissAll: true,
                },
            });

            expect(wrapper.find(DISMISS_ALL_SELECTOR).exists()).toBe(false);
        });

        it('should NOT render dismiss all button when showDismissAll is false', () => {
            const mockStore = createMockStore([
                createMockError({ message: 'Error 1' }),
                createMockError({ message: 'Error 2' }),
            ]);

            const wrapper = mount(ErrorHandler, {
                props: {
                    errorStore: mockStore,
                    showDismissAll: false,
                },
            });

            expect(wrapper.find(DISMISS_ALL_SELECTOR).exists()).toBe(false);
        });
    });

    describe('maxVisible prop', () => {
        it('should limit visible errors to maxVisible', () => {
            const errors = Array.from({ length: 10 }, (_, i) =>
                createMockError({ message: `Error ${i + 1}` })
            );
            const mockStore = createMockStore(errors);

            const wrapper = mount(ErrorHandler, {
                props: {
                    errorStore: mockStore,
                    maxVisible: 3,
                },
            });

            expect(wrapper.findAll(ERROR_ITEM_SELECTOR)).toHaveLength(3);
        });

        it('should show hidden errors count when more than maxVisible', () => {
            const errors = Array.from({ length: 10 }, (_, i) =>
                createMockError({ message: `Error ${i + 1}` })
            );
            const mockStore = createMockStore(errors);

            const wrapper = mount(ErrorHandler, {
                props: {
                    errorStore: mockStore,
                    maxVisible: 3,
                },
            });

            expect(wrapper.find('[data-testid="hidden-errors"]').exists()).toBe(true);
            expect(wrapper.text()).toContain('7'); // 10 - 3 = 7 hidden
        });

        it('should render the hidden errors summary with the English default template', () => {
            const errors = Array.from({ length: 10 }, (_, i) =>
                createMockError({ message: `Error ${i + 1}` })
            );

            const wrapper = mount(ErrorHandler, {
                props: {
                    errorStore: createMockStore(errors),
                    maxVisible: 3,
                },
            });

            expect(wrapper.find('[data-testid="hidden-errors"]').text()).toBe(
                'And 7 more error(s)...'
            );
        });

        it('should NOT show hidden errors indicator when all errors visible', () => {
            const mockStore = createMockStore([
                createMockError({ message: 'Error 1' }),
                createMockError({ message: 'Error 2' }),
            ]);

            const wrapper = mount(ErrorHandler, {
                props: {
                    errorStore: mockStore,
                    maxVisible: 5,
                },
            });

            expect(wrapper.find('[data-testid="hidden-errors"]').exists()).toBe(false);
        });
    });

    describe('severityFilter prop', () => {
        const ERROR_SEVERITY = 'error';
        const WARNING_SEVERITY = 'warning';
        const INFO_SEVERITY = 'info';
        const ERROR_MSG = 'Error msg';
        const WARNING_MSG = 'Warning msg';
        const INFO_MSG = 'Info msg';

        it('should filter errors by severity', () => {
            const mockStore = createMockStore([
                createMockError({
                    severity: ERROR_SEVERITY,
                    level: ERROR_SEVERITY,
                    message: ERROR_MSG,
                }),
                createMockError({
                    severity: WARNING_SEVERITY,
                    level: WARNING_SEVERITY,
                    message: WARNING_MSG,
                }),
                createMockError({
                    severity: INFO_SEVERITY,
                    level: INFO_SEVERITY,
                    message: INFO_MSG,
                }),
            ]);

            const wrapper = mount(ErrorHandler, {
                props: {
                    [ERROR_STORE_PROP]: mockStore,
                    severityFilter: [ERROR_SEVERITY],
                },
            });

            expect(wrapper.findAll(ERROR_ITEM_SELECTOR)).toHaveLength(1);
            expect(wrapper.text()).toContain(ERROR_MSG);
            expect(wrapper.text()).not.toContain(WARNING_MSG);
            expect(wrapper.text()).not.toContain(INFO_MSG);
        });

        it('should show multiple severity levels', () => {
            const mockStore = createMockStore([
                createMockError({
                    severity: ERROR_SEVERITY,
                    level: ERROR_SEVERITY,
                    message: ERROR_MSG,
                }),
                createMockError({
                    severity: WARNING_SEVERITY,
                    level: WARNING_SEVERITY,
                    message: WARNING_MSG,
                }),
                createMockError({
                    severity: INFO_SEVERITY,
                    level: INFO_SEVERITY,
                    message: INFO_MSG,
                }),
            ]);

            const wrapper = mount(ErrorHandler, {
                props: {
                    errorStore: mockStore,
                    severityFilter: [ERROR_SEVERITY, WARNING_SEVERITY],
                },
            });

            expect(wrapper.findAll(ERROR_ITEM_SELECTOR)).toHaveLength(2);
        });
    });

    describe('componentFilter prop', () => {
        it('should filter errors by component', () => {
            const mockStore = createMockStore([
                createMockError({ component: COMPONENT_A, message: 'Error in A' }),
                createMockError({ component: COMPONENT_B, message: 'Error in B' }),
            ]);

            const wrapper = mount(ErrorHandler, {
                props: {
                    errorStore: mockStore,
                    componentFilter: COMPONENT_A,
                },
            });

            expect(wrapper.findAll(ERROR_ITEM_SELECTOR)).toHaveLength(1);
            expect(wrapper.text()).toContain('Error in A');
            expect(wrapper.text()).not.toContain('Error in B');
        });
    });

    describe('dismiss actions', () => {
        it('should call clearErrors when dismiss all is clicked (no componentFilter)', async () => {
            const mockStore = createMockStore([
                createMockError({ message: 'Error 1' }),
                createMockError({ message: 'Error 2' }),
            ]);

            const wrapper = mount(ErrorHandler, {
                props: {
                    errorStore: mockStore,
                    showDismissAll: true,
                },
            });

            await wrapper.find(DISMISS_ALL_SELECTOR).trigger('click');
            expect(mockStore.clearErrors).toHaveBeenCalled();
        });

        it('should call clearByComponent when dismiss all is clicked (with componentFilter)', async () => {
            const mockStore = createMockStore([
                createMockError({ component: FILTERED_COMPONENT, message: 'Error 1' }),
                createMockError({ component: FILTERED_COMPONENT, message: 'Error 2' }),
            ]);

            const wrapper = mount(ErrorHandler, {
                props: {
                    errorStore: mockStore,
                    showDismissAll: true,
                    componentFilter: FILTERED_COMPONENT,
                },
            });

            await wrapper.find(DISMISS_ALL_SELECTOR).trigger('click');
            expect(mockStore.clearByComponent).toHaveBeenCalledWith(FILTERED_COMPONENT);
        });

        it('should call clearByKey when individual error is dismissed', async () => {
            const mockStore = createMockStore([
                createMockError({ key: 'error-key', message: 'Error with key' }),
            ]);

            const wrapper = mount(ErrorHandler, {
                props: { errorStore: mockStore },
            });

            await wrapper.find('[data-testid="error-dismiss"]').trigger('click');
            expect(mockStore.clearByKey).toHaveBeenCalledWith('error-key');
        });
    });

    describe('error display order', () => {
        it('should display errors in the order they appear in store', () => {
            const mockStore = createMockStore([
                createMockError({ message: 'First error' }),
                createMockError({ message: 'Second error' }),
                createMockError({ message: 'Third error' }),
            ]);

            const wrapper = mount(ErrorHandler, {
                props: { errorStore: mockStore },
            });

            const items = wrapper.findAll(ERROR_ITEM_SELECTOR);
            expect(items[0]?.text()).toContain('First error');
            expect(items[1]?.text()).toContain('Second error');
            expect(items[2]?.text()).toContain('Third error');
        });
    });

    describe('labels prop', () => {
        const twoErrors = () => [
            createMockError({ message: 'Error 1' }),
            createMockError({ message: 'Error 2' }),
        ];

        it('should render the dismiss all button with the English default template', () => {
            const wrapper = mount(ErrorHandler, {
                props: { errorStore: createMockStore(twoErrors()) },
            });

            expect(wrapper.find(DISMISS_ALL_SELECTOR).text()).toBe('Dismiss all (2)');
        });

        it('should apply the dismissAllErrors override and substitute {count}', () => {
            const wrapper = mount(ErrorHandler, {
                props: {
                    errorStore: createMockStore(twoErrors()),
                    labels: { dismissAllErrors: 'Összes törlése ({count})' },
                },
            });

            expect(wrapper.find(DISMISS_ALL_SELECTOR).text()).toBe('Összes törlése (2)');
        });

        it('should apply the hiddenErrors override and substitute {count}', () => {
            const errors = Array.from({ length: 6 }, (_, i) =>
                createMockError({ message: `Error ${i + 1}` })
            );

            const wrapper = mount(ErrorHandler, {
                props: {
                    errorStore: createMockStore(errors),
                    maxVisible: 2,
                    labels: { hiddenErrors: 'És még {count} további hiba...' },
                },
            });

            expect(wrapper.find('[data-testid="hidden-errors"]').text()).toBe(
                'És még 4 további hiba...'
            );
        });

        it('should forward the labels to the ErrorItem children', () => {
            const mockStore = createMockStore([createMockError({ key: 'error-key' })]);

            const wrapper = mount(ErrorHandler, {
                props: {
                    errorStore: mockStore,
                    labels: { close: 'Bezárás' },
                },
            });

            expect(wrapper.find('[data-testid="error-dismiss"]').attributes('aria-label')).toBe(
                'Bezárás'
            );
        });

        it('should fall back to the defaults for a partial labels object', () => {
            const wrapper = mount(ErrorHandler, {
                props: {
                    errorStore: createMockStore(twoErrors()),
                    labels: { cancel: 'Mégsem' },
                },
            });

            expect(wrapper.find(DISMISS_ALL_SELECTOR).text()).toBe('Dismiss all (2)');
        });
    });
});
