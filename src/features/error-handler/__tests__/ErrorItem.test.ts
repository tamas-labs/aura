import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { ErrorItem } from '../components/ErrorItem';
import { DEFAULT_LABELS } from '../../../lib/default-values.lib';
import type { ECSError } from '../../../types/error.types';

describe('ErrorItem', () => {
    const TEST_ERROR: ECSError = {
        severity: 'error',
        timestamp: '2024-01-01T00:00:00.000Z',
        component: 'TestComponent',
        action: 'testAction',
        level: 'error',
        type: 'validation',
        message: 'Test error message',
    };

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('component registration', () => {
        it('should have name "ErrorItem"', () => {
            expect(ErrorItem.name).toBe('ErrorItem');
        });

        it('should be a valid Vue component', () => {
            expect(ErrorItem).toBeDefined();
            expect(ErrorItem.setup).toBeDefined();
        });
    });

    describe('rendering', () => {
        it('should render error message', () => {
            const wrapper = mount(ErrorItem, {
                props: { error: TEST_ERROR },
            });

            expect(wrapper.text()).toContain('Test error message');
        });

        it('should render severity badge', () => {
            const wrapper = mount(ErrorItem, {
                props: { error: TEST_ERROR },
            });

            expect(wrapper.text()).toContain('error');
        });

        it('should render component badge', () => {
            const wrapper = mount(ErrorItem, {
                props: { error: TEST_ERROR },
            });

            expect(wrapper.text()).toContain('TestComponent');
        });

        it('should render type badge', () => {
            const wrapper = mount(ErrorItem, {
                props: { error: TEST_ERROR },
            });

            expect(wrapper.text()).toContain('validation');
        });

        it('should render details if provided', () => {
            const errorWithDetails: ECSError = {
                ...TEST_ERROR,
                details: 'Detailed error description',
            };

            const wrapper = mount(ErrorItem, {
                props: { error: errorWithDetails },
            });

            expect(wrapper.text()).toContain('Detailed error description');
        });

        it('should render key badge if provided', () => {
            const errorWithKey: ECSError = {
                ...TEST_ERROR,
                key: 'email',
            };

            const wrapper = mount(ErrorItem, {
                props: { error: errorWithKey },
            });

            expect(wrapper.text()).toContain('email');
        });

        it('should not render the key badge for a generated key', () => {
            const errorWithGeneratedKey: ECSError = {
                ...TEST_ERROR,
                key: 'TestComponent.testAction.validation',
            };

            const wrapper = mount(ErrorItem, {
                props: { error: errorWithGeneratedKey },
            });

            expect(wrapper.text()).not.toContain('TestComponent.testAction.validation');
            expect(wrapper.findAll('.badge')).toHaveLength(3);
        });

        it('should not render a repeat badge for a single occurrence', () => {
            const wrapper = mount(ErrorItem, {
                props: { error: TEST_ERROR },
            });

            expect(wrapper.find('[data-testid="error-count"]').exists()).toBe(false);
        });

        it('should render the repeat badge for a merged error', () => {
            const wrapper = mount(ErrorItem, {
                props: { error: { ...TEST_ERROR, count: 4 } },
            });

            const badge = wrapper.find('[data-testid="error-count"]');
            expect(badge.exists()).toBe(true);
            expect(badge.text()).toBe('×4');
            expect(badge.attributes('title')).toBe(
                DEFAULT_LABELS.errorOccurrences.replace('{count}', '4')
            );
        });

        it('should use the labels override in the repeat badge tooltip', () => {
            const wrapper = mount(ErrorItem, {
                props: {
                    error: { ...TEST_ERROR, count: 2 },
                    labels: { errorOccurrences: '{count} alkalommal fordult elő' },
                },
            });

            expect(wrapper.find('[data-testid="error-count"]').attributes('title')).toBe(
                '2 alkalommal fordult elő'
            );
        });

        it('should have data-testid attribute', () => {
            const wrapper = mount(ErrorItem, {
                props: { error: TEST_ERROR },
            });

            expect(wrapper.find('[data-testid="error-item"]').exists()).toBe(true);
        });
    });

    describe('severity variants', () => {
        const severityVariants: Array<{ severity: ECSError['severity']; expectedClass: string }> = [
            { severity: 'critical', expectedClass: 'alert-danger' },
            { severity: 'error', expectedClass: 'alert-danger' },
            { severity: 'warning', expectedClass: 'alert-warning' },
            { severity: 'info', expectedClass: 'alert-info' },
            { severity: 'debug', expectedClass: 'alert-secondary' },
        ];

        severityVariants.forEach(({ severity, expectedClass }) => {
            it(`should use ${expectedClass} for ${severity} severity`, () => {
                const error: ECSError = {
                    ...TEST_ERROR,
                    severity,
                    level: severity,
                };

                const wrapper = mount(ErrorItem, {
                    props: { error },
                });

                expect(wrapper.find('.alert').classes()).toContain(expectedClass);
            });
        });
    });

    describe('dismiss functionality', () => {
        const ERROR_DISMISS_SELECTOR = '[data-testid="error-dismiss"]';

        it('should render dismiss button when onDismiss is provided', () => {
            const wrapper = mount(ErrorItem, {
                props: {
                    error: TEST_ERROR,
                    onDismiss: () => {},
                },
            });

            expect(wrapper.find(ERROR_DISMISS_SELECTOR).exists()).toBe(true);
        });

        it('should NOT render dismiss button when onDismiss is not provided', () => {
            const wrapper = mount(ErrorItem, {
                props: { error: TEST_ERROR },
            });

            expect(wrapper.find(ERROR_DISMISS_SELECTOR).exists()).toBe(false);
        });

        it('should call onDismiss when dismiss button is clicked', async () => {
            let dismissed = false;
            const wrapper = mount(ErrorItem, {
                props: {
                    error: TEST_ERROR,
                    onDismiss: () => {
                        dismissed = true;
                    },
                },
            });

            await wrapper.find(ERROR_DISMISS_SELECTOR).trigger('click');
            expect(dismissed).toBe(true);
        });

        it('should use the English default aria-label on the dismiss button', () => {
            const wrapper = mount(ErrorItem, {
                props: {
                    error: TEST_ERROR,
                    onDismiss: () => {},
                },
            });

            expect(wrapper.find(ERROR_DISMISS_SELECTOR).attributes('aria-label')).toBe('Close');
            expect(DEFAULT_LABELS.close).toBe('Close');
        });

        it('should use the labels.close override on the dismiss button', () => {
            const wrapper = mount(ErrorItem, {
                props: {
                    error: TEST_ERROR,
                    onDismiss: () => {},
                    labels: { close: 'Bezárás' },
                },
            });

            expect(wrapper.find(ERROR_DISMISS_SELECTOR).attributes('aria-label')).toBe('Bezárás');
        });

        it('should fall back to the default aria-label for a partial labels object', () => {
            const wrapper = mount(ErrorItem, {
                props: {
                    error: TEST_ERROR,
                    onDismiss: () => {},
                    labels: { cancel: 'Mégsem' },
                },
            });

            expect(wrapper.find(ERROR_DISMISS_SELECTOR).attributes('aria-label')).toBe('Close');
        });
    });
});
