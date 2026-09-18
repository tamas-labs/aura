import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { isReactive } from 'vue';
import type * as SpecialFormatter from '../../../utils/formatters/special.formatter';

// formatRaw relies on DOMPurify, which doesn't preserve safe tags in the
// happy-dom test environment. The component test only verifies that raw
// content is rendered as innerHTML; the actual sanitization correctness is
// covered by special.formatter.test.ts (under jsdom).
vi.mock('../../../utils/formatters/special.formatter', async importOriginal => {
    const actual = await importOriginal<typeof SpecialFormatter>();
    return {
        ...actual,
        formatRaw: (value: unknown): string =>
            value === null || value === undefined ? '' : String(value),
    };
});
import { TableBodyCell } from '../TableBodyCell';
import type { BodyCellConfig } from '../../../../../types';
import { useCoreStore } from '../../../../../state/core/core.state';
import { useApiResourcesStore } from '../../../../../state/data/api-resources.state';

describe('TableBodyCell', () => {
    const testStoreId = 'test-store';
    let core: ReturnType<typeof useCoreStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        core = useCoreStore(testStoreId, { storeId: testStoreId });
        useApiResourcesStore(testStoreId, core);
    });

    describe('rendering', () => {
        it('should render td element with string value', async () => {
            const wrapper = mount(TableBodyCell, {
                props: {
                    value: 'Test Value' as any,
                    columnKey: 'test_col',
                    cellIndex: 0,
                },
            });

            await flushPromises();
            const td = wrapper.find('td');
            expect(td.exists()).toBe(true);
            expect(td.text()).toBe('Test Value');
        });

        it('should render number value as string', async () => {
            const wrapper = mount(TableBodyCell, {
                props: {
                    value: 12345 as any,
                    columnKey: 'number_col',
                    cellIndex: 1,
                },
            });

            await flushPromises();
            expect(wrapper.text()).toBe('12345');
        });

        it('should render empty string for null value', () => {
            const wrapper = mount(TableBodyCell, {
                props: {
                    value: null,
                    columnKey: 'null_col',
                    cellIndex: 2,
                },
            });

            expect(wrapper.text()).toBe('');
        });

        it('should render empty string for undefined value', () => {
            const wrapper = mount(TableBodyCell, {
                props: {
                    value: undefined,
                    columnKey: 'undefined_col',
                    cellIndex: 3,
                },
            });

            expect(wrapper.text()).toBe('');
        });

        it('should have correct data attributes', () => {
            const wrapper = mount(TableBodyCell, {
                props: {
                    value: 'Data' as any,
                    columnKey: 'data_col',
                    cellIndex: 0,
                },
            });

            const td = wrapper.find('td');
            expect(td.attributes('data-testid')).toBe('table-body-cell');
            expect(td.attributes('data-key')).toBe('data_col');
        });
    });

    describe('cellConfig support', () => {
        describe('backward compatibility', () => {
            it('should work without cellConfig prop', async () => {
                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Test' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                expect(td.exists()).toBe(true);
                expect(td.text()).toBe('Test');
                expect(td.attributes('data-testid')).toBe('table-body-cell');
            });

            it('should not apply extra styles without cellConfig', () => {
                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Test' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                    },
                });

                const td = wrapper.find('td');
                const style = td.attributes('style');
                expect(style).toBeUndefined();
            });

            it('should not apply extra classes without cellConfig', () => {
                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Test' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                    },
                });

                const td = wrapper.find('td');
                const classes = td.classes();
                expect(classes).toHaveLength(0);
            });
        });

        describe('style attributes', () => {
            it('should apply width style from cellConfig', () => {
                const cellConfig: BodyCellConfig = {
                    key: 'test',
                    width: '200px',
                };

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Test' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        cellConfig,
                    },
                });

                const td = wrapper.find('td');
                expect(td.attributes('style')).toContain('width: 200px');
            });

            it('should apply align style from cellConfig', () => {
                const cellConfig: BodyCellConfig = {
                    key: 'test',
                    align: 'center',
                };

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Test' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        cellConfig,
                    },
                });

                const td = wrapper.find('td');
                expect(td.attributes('style')).toContain('text-align: center');
            });

            it('should apply color styles from cellConfig', () => {
                const cellConfig: BodyCellConfig = {
                    key: 'test',
                    color: '#ff0000',
                    background: '#00ff00',
                };

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Test' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        cellConfig,
                    },
                });

                const td = wrapper.find('td');
                const style = td.attributes('style');
                expect(style).toContain('color: #ff0000');
                expect(style).toContain('background-color: #00ff00');
            });

            it('should apply font styles from cellConfig', () => {
                const cellConfig: BodyCellConfig = {
                    key: 'test',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    lineHeight: 1.5,
                    italic: true,
                };

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Test' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        cellConfig,
                    },
                });

                const td = wrapper.find('td');
                const style = td.attributes('style');
                expect(style).toContain('font-size: 16px');
                expect(style).toContain('font-weight: bold');
                expect(style).toContain('line-height: 1.5');
                expect(style).toContain('font-style: italic');
            });
        });

        describe('CSS classes', () => {
            it('should apply single class string from cellConfig', () => {
                const cellConfig: BodyCellConfig = {
                    key: 'test',
                    class: 'custom-class',
                };

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Test' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        cellConfig,
                    },
                });

                expect(wrapper.find('td').classes()).toContain('custom-class');
            });

            it('should apply array of classes from cellConfig', () => {
                const cellConfig: BodyCellConfig = {
                    key: 'test',
                    class: ['class-1', 'class-2', 'class-3'],
                };

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Test' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        cellConfig,
                    },
                });

                const td = wrapper.find('td');
                expect(td.classes()).toContain('class-1');
                expect(td.classes()).toContain('class-2');
                expect(td.classes()).toContain('class-3');
            });

            it('should apply monospace class from cellConfig', () => {
                const cellConfig: BodyCellConfig = {
                    key: 'test',
                    monospace: true,
                };

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Test' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        cellConfig,
                    },
                });

                expect(wrapper.find('td').classes()).toContain('font-monospace');
            });

            it('should apply text transform classes from cellConfig', () => {
                const cellConfig: BodyCellConfig = {
                    key: 'test',
                    uppercase: true,
                };

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Test' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        cellConfig,
                    },
                });

                expect(wrapper.find('td').classes()).toContain('text-uppercase');
            });

            it('should apply Bootstrap text utility class from cellConfig', () => {
                const cellConfig: BodyCellConfig = {
                    key: 'test',
                    text: 'text-nowrap',
                };

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Test' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        cellConfig,
                    },
                });

                expect(wrapper.find('td').classes()).toContain('text-nowrap');
            });
        });

        describe('combined styles and classes', () => {
            it('should apply multiple styles and classes together', () => {
                const cellConfig: BodyCellConfig = {
                    key: 'test',
                    width: '150px',
                    align: 'end',
                    color: '#333',
                    class: ['custom-1', 'custom-2'],
                    monospace: true,
                    uppercase: true,
                };

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Test' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        cellConfig,
                    },
                });

                const td = wrapper.find('td');
                const style = td.attributes('style');
                expect(style).toContain('width: 150px');
                expect(style).toContain('text-align: right');
                expect(style).toContain('color: #333');

                const classes = td.classes();
                expect(classes).toContain('custom-1');
                expect(classes).toContain('custom-2');
                expect(classes).toContain('font-monospace');
                expect(classes).toContain('text-uppercase');
            });
        });

        describe('value rendering with cellConfig', () => {
            it('should render value correctly even with cellConfig', async () => {
                const cellConfig: BodyCellConfig = {
                    key: 'test',
                    width: '100px',
                    class: 'custom',
                };

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Content' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        cellConfig,
                    },
                });

                await flushPromises();
                expect(wrapper.text()).toBe('Content');
            });

            it('should handle null value with cellConfig', () => {
                const cellConfig: BodyCellConfig = {
                    key: 'test',
                    width: '100px',
                };

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: null,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        cellConfig,
                    },
                });

                expect(wrapper.text()).toBe('');
            });
        });
    });

    describe('bootstrap variants integration', () => {
        it('should apply table-{variant} class when background is a bootstrap variant and storeId is provided', () => {
            const cellConfig: BodyCellConfig = {
                key: 'test',
                background: 'primary',
            };

            const wrapper = mount(TableBodyCell, {
                props: {
                    value: 'Test' as any,
                    columnKey: 'test_col',
                    cellIndex: 0,
                    cellConfig,
                    storeId: testStoreId,
                },
            });

            const td = wrapper.find('td');
            expect(td.classes()).toContain('table-primary');
            const style = td.attributes('style');
            expect(style === undefined || !style.includes('background-color')).toBe(true);
        });

        it('should apply text-{variant} class when color is a bootstrap variant and storeId is provided', () => {
            const cellConfig: BodyCellConfig = {
                key: 'test',
                color: 'danger',
            };

            const wrapper = mount(TableBodyCell, {
                props: {
                    value: 'Test' as any,
                    columnKey: 'test_col',
                    cellIndex: 0,
                    cellConfig,
                    storeId: testStoreId,
                },
            });

            const td = wrapper.find('td');
            expect(td.classes()).toContain('text-danger');
            const style = td.attributes('style');
            expect(style === undefined || !style.includes('color')).toBe(true);
        });

        it('should apply both table and text variant classes', () => {
            const cellConfig: BodyCellConfig = {
                key: 'test',
                background: 'success',
                color: 'warning',
            };

            const wrapper = mount(TableBodyCell, {
                props: {
                    value: 'Test' as any,
                    columnKey: 'test_col',
                    cellIndex: 0,
                    cellConfig,
                    storeId: testStoreId,
                },
            });

            const td = wrapper.find('td');
            expect(td.classes()).toContain('table-success');
            expect(td.classes()).toContain('text-warning');
        });

        it('should use inline style when color is not a bootstrap variant', () => {
            const cellConfig: BodyCellConfig = {
                key: 'test',
                color: 'white',
                background: '#ff0000',
            };

            const wrapper = mount(TableBodyCell, {
                props: {
                    value: 'Test' as any,
                    columnKey: 'test_col',
                    cellIndex: 0,
                    cellConfig,
                    storeId: testStoreId,
                },
            });

            const td = wrapper.find('td');
            expect(td.attributes('style')).toContain('color: white');
            expect(td.attributes('style')).toContain('background-color: #ff0000');
        });

        it('should use inline style when storeId is not provided', () => {
            const cellConfig: BodyCellConfig = {
                key: 'test',
                background: '#007bff',
                color: 'red',
            };

            const wrapper = mount(TableBodyCell, {
                props: {
                    value: 'Test' as any,
                    columnKey: 'test_col',
                    cellIndex: 0,
                    cellConfig,
                    // No storeId provided
                },
            });

            const td = wrapper.find('td');
            const style = td.attributes('style');
            expect(style).toBeDefined();
            expect(style).toContain('background-color: #007bff');
            expect(style).toContain('color: red');
        });

        it('should mix variant and non-variant colors', () => {
            const cellConfig: BodyCellConfig = {
                key: 'test',
                background: 'primary',
                color: 'white',
            };

            const wrapper = mount(TableBodyCell, {
                props: {
                    value: 'Test' as any,
                    columnKey: 'test_col',
                    cellIndex: 0,
                    cellConfig,
                    storeId: testStoreId,
                },
            });

            const td = wrapper.find('td');
            expect(td.classes()).toContain('table-primary');
            const style = td.attributes('style');
            expect(style).toBeDefined();
            expect(style).toContain('color: white');
            expect(style && !style.includes('background-color')).toBe(true);
        });

        it('should combine bootstrap variants with custom classes', () => {
            const cellConfig: BodyCellConfig = {
                key: 'test',
                background: 'primary',
                color: 'danger',
                class: 'fw-bold',
            };

            const wrapper = mount(TableBodyCell, {
                props: {
                    value: 'Test' as any,
                    columnKey: 'test_col',
                    cellIndex: 0,
                    cellConfig,
                    storeId: testStoreId,
                },
            });

            const td = wrapper.find('td');
            expect(td.classes()).toContain('fw-bold');
            expect(td.classes()).toContain('table-primary');
            expect(td.classes()).toContain('text-danger');
        });
    });

    describe('dataTypes classes', () => {
        it('should apply number classes from config dataTypes', () => {
            const cellConfig: BodyCellConfig = {
                key: 'test',
                number: true,
            };

            const wrapper = mount(TableBodyCell, {
                props: {
                    value: 12345 as any,
                    columnKey: 'test_col',
                    cellIndex: 0,
                    cellConfig,
                    storeId: testStoreId,
                },
            });

            const td = wrapper.find('td');
            expect(td.classes()).toContain('text-end');
        });

        it('should apply currency classes from config dataTypes', () => {
            const cellConfig: BodyCellConfig = {
                key: 'test',
                currency: 'EUR',
            };

            const wrapper = mount(TableBodyCell, {
                props: {
                    value: 1234.56 as any,
                    columnKey: 'test_col',
                    cellIndex: 0,
                    cellConfig,
                    storeId: testStoreId,
                },
            });

            const td = wrapper.find('td');
            expect(td.classes()).toContain('text-end');
        });

        it('should apply number classes when type is number', () => {
            const cellConfig: BodyCellConfig = {
                key: 'test',
                type: 'static',
                number: true,
            };

            const wrapper = mount(TableBodyCell, {
                props: {
                    value: 999 as any,
                    columnKey: 'test_col',
                    cellIndex: 0,
                    cellConfig,
                    storeId: testStoreId,
                },
            });

            const td = wrapper.find('td');
            expect(td.classes()).toContain('text-end');
        });

        it('should combine dataTypes classes with custom classes', () => {
            const cellConfig: BodyCellConfig = {
                key: 'test',
                number: true,
                class: 'fw-bold',
            };

            const wrapper = mount(TableBodyCell, {
                props: {
                    value: 12345 as any,
                    columnKey: 'test_col',
                    cellIndex: 0,
                    cellConfig,
                    storeId: testStoreId,
                },
            });

            const td = wrapper.find('td');
            expect(td.classes()).toContain('text-end');
            expect(td.classes()).toContain('fw-bold');
        });

        it('should not apply dataTypes classes when storeId is missing', () => {
            const cellConfig: BodyCellConfig = {
                key: 'test',
                number: true,
            };

            const wrapper = mount(TableBodyCell, {
                props: {
                    value: 12345 as any,
                    columnKey: 'test_col',
                    cellIndex: 0,
                    cellConfig,
                },
            });

            const td = wrapper.find('td');
            expect(td.classes()).not.toContain('text-end');
        });
    });

    describe('highlighting search results', () => {
        beforeEach(() => {
            setActivePinia(createPinia());
            core = useCoreStore(testStoreId, {
                storeId: testStoreId,
                highlightSearchResults: true,
                highlightClass: 'test-highlight',
            });
            useApiResourcesStore(testStoreId, core);
        });

        // The mark has to follow the same matching rule as the row filter: with
        // `accentInsensitiveSearch` on, a row matched by an unaccented term would
        // otherwise render with no visible highlight at all.
        describe('accent-insensitive highlighting', () => {
            const mountAccented = async (accentInsensitiveSearch: boolean) => {
                setActivePinia(createPinia());
                const accentCore = useCoreStore(testStoreId, {
                    storeId: testStoreId,
                    highlightSearchResults: true,
                    highlightClass: 'test-highlight',
                    accentInsensitiveSearch,
                });
                const api = useApiResourcesStore(testStoreId, accentCore);
                api.setGlobalSearch('kovacs');

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Kovács Béla' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        storeId: testStoreId,
                    },
                });

                await flushPromises();
                return wrapper.find('td').html();
            };

            it('should not mark an accented match by default', async () => {
                expect(await mountAccented(false)).not.toContain('<mark');
            });

            it('should mark the accented text when the flag is on', async () => {
                expect(await mountAccented(true)).toContain(
                    '<mark class="test-highlight">Kovács</mark>'
                );
            });
        });

        describe('global search highlighting', () => {
            it('should highlight text when global search is active', async () => {
                const api = useApiResourcesStore(testStoreId, core);
                api.setGlobalSearch('World');

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Hello World' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        storeId: testStoreId,
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                expect(td.html()).toContain('<mark class="test-highlight">World</mark>');
            });

            it('should highlight case-insensitive matches', async () => {
                const api = useApiResourcesStore(testStoreId, core);
                api.setGlobalSearch('world');

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Hello World' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        storeId: testStoreId,
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                expect(td.html()).toContain('<mark class="test-highlight">World</mark>');
            });

            it('should highlight multiple matches', async () => {
                const api = useApiResourcesStore(testStoreId, core);
                api.setGlobalSearch('test');

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'test this test again' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        storeId: testStoreId,
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                const html = td.html();
                const matches = (html.match(/<mark class="test-highlight">test<\/mark>/gi) || [])
                    .length;
                expect(matches).toBe(2);
            });

            it('should not highlight when global search is empty', async () => {
                const api = useApiResourcesStore(testStoreId, core);
                api.setGlobalSearch('');

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Hello World' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        storeId: testStoreId,
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                expect(td.html()).not.toContain('<mark');
            });

            it('should not highlight when no match found', async () => {
                const api = useApiResourcesStore(testStoreId, core);
                api.setGlobalSearch('xyz');

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Hello World' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        storeId: testStoreId,
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                expect(td.html()).not.toContain('<mark');
                expect(td.text()).toBe('Hello World');
            });

            it('should handle numeric values with highlighting', async () => {
                const api = useApiResourcesStore(testStoreId, core);
                api.setGlobalSearch('123');

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 12345 as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        storeId: testStoreId,
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                expect(td.html()).toContain('<mark class="test-highlight">123</mark>');
            });

            it('should escape HTML in text before highlighting', async () => {
                const api = useApiResourcesStore(testStoreId, core);
                api.setGlobalSearch('script');

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: '<script>alert("test")</script>' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        storeId: testStoreId,
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                expect(td.html()).toContain('&lt;');
                expect(td.html()).toContain('&gt;');
                expect(td.html()).toContain('<mark class="test-highlight">script</mark>');
                expect(td.html()).not.toContain('<script>alert');
            });
        });

        describe('configuration options', () => {
            it('should not highlight when highlightSearchResults is false', async () => {
                const coreDisabled = useCoreStore('disabled-store', {
                    storeId: 'disabled-store',
                    highlightSearchResults: false,
                });
                const apiDisabled = useApiResourcesStore('disabled-store', coreDisabled);
                apiDisabled.setGlobalSearch('World');

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Hello World' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        storeId: 'disabled-store',
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                expect(td.html()).not.toContain('<mark');
                expect(td.text()).toBe('Hello World');
            });

            it('should use default highlightClass when not specified', async () => {
                const coreDefault = useCoreStore('default-store', {
                    storeId: 'default-store',
                    highlightSearchResults: true,
                });
                const apiDefault = useApiResourcesStore('default-store', coreDefault);
                apiDefault.setGlobalSearch('World');

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Hello World' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        storeId: 'default-store',
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                expect(td.html()).toContain('<mark class="aura-highlight">World</mark>');
            });

            it('should use custom highlightClass from config', async () => {
                const api = useApiResourcesStore(testStoreId, core);
                api.setGlobalSearch('World');

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Hello World' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        storeId: testStoreId,
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                expect(td.html()).toContain('<mark class="test-highlight">World</mark>');
            });
        });

        describe('raw HTML mode', () => {
            it('should not highlight in raw mode', async () => {
                const api = useApiResourcesStore(testStoreId, core);
                api.setGlobalSearch('World');

                const cellConfig: BodyCellConfig = {
                    key: 'test',
                    raw: true,
                };

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Hello <b>World</b>' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        cellConfig,
                        storeId: testStoreId,
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                // Raw content should be rendered as-is without highlighting
                expect(td.html()).toContain('Hello <b>World</b>');
                // Should not have highlighting marks
                expect(td.html()).not.toContain('<mark class="test-highlight">');
            });
        });

        describe('without storeId', () => {
            it('should not attempt to highlight without storeId', async () => {
                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Hello World' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                expect(td.html()).not.toContain('<mark');
                expect(td.text()).toBe('Hello World');
            });
        });

        describe('error handling', () => {
            it('should not throw error when store is not available', async () => {
                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Hello World' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        storeId: 'non-existent-store',
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                expect(td.text()).toBe('Hello World');
            });
        });

        describe('special characters in search', () => {
            it('should handle regex special characters', async () => {
                const api = useApiResourcesStore(testStoreId, core);
                api.setGlobalSearch('$100');

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Price: $100' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        storeId: testStoreId,
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                expect(td.html()).toContain('<mark class="test-highlight">$100</mark>');
            });

            it('should handle parentheses in search', async () => {
                const api = useApiResourcesStore(testStoreId, core);
                api.setGlobalSearch('(test)');

                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'Function (test)' as any,
                        columnKey: 'test_col',
                        cellIndex: 0,
                        storeId: testStoreId,
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                expect(td.html()).toContain('<mark class="test-highlight">(test)</mark>');
            });
        });
    });

    describe('fieldSegments multi-field rendering', () => {
        describe('basic rendering', () => {
            it('should render td with span children for each segment', async () => {
                const segments = [
                    { type: 'value' as const, value: 'Alice' },
                    { type: 'value' as const, value: 'Smith' },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: {
                        columnKey: 'fullName',
                        cellIndex: 0,
                        fieldSegments: segments as any,
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                expect(td.exists()).toBe(true);
                expect(td.attributes('data-testid')).toBe('table-body-cell');
                expect(td.attributes('data-key')).toBe('fullName');

                const spans = td.findAll('span');
                expect(spans).toHaveLength(2);
            });

            it('should render value segment text in span', async () => {
                const segments = [{ type: 'value' as const, value: 'Hello' }];

                const wrapper = mount(TableBodyCell, {
                    props: {
                        columnKey: 'col',
                        cellIndex: 0,
                        fieldSegments: segments as any,
                    },
                });

                await flushPromises();
                const spans = wrapper.findAll('span');
                expect(spans[0]?.text()).toBe('Hello');
            });

            it('should render number value segment as string in span', async () => {
                const segments = [{ type: 'value' as const, value: 42 }];

                const wrapper = mount(TableBodyCell, {
                    props: {
                        columnKey: 'col',
                        cellIndex: 0,
                        fieldSegments: segments as any,
                    },
                });

                await flushPromises();
                const spans = wrapper.findAll('span');
                expect(spans[0]?.text()).toBe('42');
            });

            it('should render empty string for null value segment', async () => {
                const segments = [{ type: 'value' as const, value: null }];

                const wrapper = mount(TableBodyCell, {
                    props: {
                        columnKey: 'col',
                        cellIndex: 0,
                        fieldSegments: segments as any,
                    },
                });

                await flushPromises();
                const spans = wrapper.findAll('span');
                expect(spans[0]?.text()).toBe('');
            });

            // The segment vnodes are held in a `shallowRef`. A deep `ref` would hand the
            // renderer reactive proxies, and patching writes back onto a vnode (`el`,
            // `component`) — retriggering the render that read it, until Vue aborts with
            // "Maximum recursive updates exceeded in component <TableBodyCell>".
            it('should not expose the segment vnodes as reactive proxies', async () => {
                const segments = [{ type: 'value' as const, value: 'Alice' }];

                const wrapper = mount(TableBodyCell, {
                    props: {
                        columnKey: 'name',
                        cellIndex: 0,
                        fieldSegments: segments as any,
                    },
                });

                await flushPromises();

                const children = (wrapper.vm.$ as unknown as { subTree: { children: unknown[] } })
                    .subTree.children;

                expect(isReactive(children)).toBe(false);
                expect(children.every(child => !isReactive(child))).toBe(true);
            });
        });

        describe('static config segment rendering', () => {
            it('should render static config segment value in span', async () => {
                const segments = [
                    {
                        type: 'config' as const,
                        value: 'ID:',
                        config: { type: 'static', value: 'ID:' },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: {
                        columnKey: 'idCol',
                        cellIndex: 0,
                        fieldSegments: segments as any,
                    },
                });

                await flushPromises();
                const spans = wrapper.findAll('span');
                expect(spans[0]?.text()).toBe('ID:');
            });

            it('should apply class array from static config to span', async () => {
                const segments = [
                    {
                        type: 'config' as const,
                        value: 'ID:',
                        config: {
                            type: 'static',
                            value: 'ID:',
                            class: ['pe-1', 'text-muted', 'fw-bold'],
                        },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: {
                        columnKey: 'idCol',
                        cellIndex: 0,
                        fieldSegments: segments as any,
                    },
                });

                await flushPromises();
                const span = wrapper.find('span');
                expect(span.classes()).toContain('pe-1');
                expect(span.classes()).toContain('text-muted');
                expect(span.classes()).toContain('fw-bold');
            });

            it('should apply class string from static config to span', async () => {
                const segments = [
                    {
                        type: 'config' as const,
                        value: 'Ref:',
                        config: {
                            type: 'static',
                            value: 'Ref:',
                            class: 'fw-bold text-primary',
                        },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: {
                        columnKey: 'refCol',
                        cellIndex: 0,
                        fieldSegments: segments as any,
                    },
                });

                await flushPromises();
                const span = wrapper.find('span');
                expect(span.classes()).toContain('fw-bold');
                expect(span.classes()).toContain('text-primary');
            });

            it('should apply inline style from static config to span', async () => {
                const segments = [
                    {
                        type: 'config' as const,
                        value: 'Label:',
                        config: {
                            type: 'static',
                            value: 'Label:',
                            style: 'font-weight: bold',
                        },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: {
                        columnKey: 'labelCol',
                        cellIndex: 0,
                        fieldSegments: segments as any,
                    },
                });

                await flushPromises();
                const span = wrapper.find('span');
                expect(span.attributes('style')).toContain('font-weight: bold');
            });

            it('should apply uppercase transform from static config', async () => {
                const segments = [
                    {
                        type: 'config' as const,
                        value: 'hello',
                        config: {
                            type: 'static',
                            value: 'hello',
                            uppercase: true,
                        },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: {
                        columnKey: 'colU',
                        cellIndex: 0,
                        fieldSegments: segments as any,
                    },
                });

                await flushPromises();
                const span = wrapper.find('span');
                expect(span.text()).toBe('HELLO');
            });

            it('should apply no classes to span when config has no class', async () => {
                const segments = [
                    {
                        type: 'config' as const,
                        value: 'Plain',
                        config: { type: 'static', value: 'Plain' },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: {
                        columnKey: 'plainCol',
                        cellIndex: 0,
                        fieldSegments: segments as any,
                    },
                });

                await flushPromises();
                const span = wrapper.find('span');
                expect(span.attributes('class')).toBeFalsy();
            });

            describe('visual formatting — color', () => {
                it('should apply Bootstrap color as text- class on span', async () => {
                    const segments = [
                        {
                            type: 'config' as const,
                            value: 'Status',
                            config: { type: 'static', value: 'Status', color: 'success' },
                        },
                    ];

                    const wrapper = mount(TableBodyCell, {
                        props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                    });

                    await flushPromises();
                    expect(wrapper.find('span').classes()).toContain('text-success');
                });

                it('should apply CSS hex color as inline style on span', async () => {
                    const segments = [
                        {
                            type: 'config' as const,
                            value: 'Label',
                            config: { type: 'static', value: 'Label', color: '#ff0000' },
                        },
                    ];

                    const wrapper = mount(TableBodyCell, {
                        props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                    });

                    await flushPromises();
                    expect(wrapper.find('span').attributes('style')).toContain('color: #ff0000');
                });
            });

            describe('visual formatting — background', () => {
                it('should apply Bootstrap background as bg- class on span', async () => {
                    const segments = [
                        {
                            type: 'config' as const,
                            value: 'Tag',
                            config: { type: 'static', value: 'Tag', background: 'warning' },
                        },
                    ];

                    const wrapper = mount(TableBodyCell, {
                        props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                    });

                    await flushPromises();
                    expect(wrapper.find('span').classes()).toContain('bg-warning');
                });

                it('should apply CSS hex background as inline style on span', async () => {
                    const segments = [
                        {
                            type: 'config' as const,
                            value: 'Tag',
                            config: { type: 'static', value: 'Tag', background: '#eeeeee' },
                        },
                    ];

                    const wrapper = mount(TableBodyCell, {
                        props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                    });

                    await flushPromises();
                    expect(wrapper.find('span').attributes('style')).toContain('background-color');
                });
            });

            describe('visual formatting — fontSize', () => {
                it('should apply fontSize as inline style on span', async () => {
                    const segments = [
                        {
                            type: 'config' as const,
                            value: 'Text',
                            config: { type: 'static', value: 'Text', fontSize: '14px' },
                        },
                    ];

                    const wrapper = mount(TableBodyCell, {
                        props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                    });

                    await flushPromises();
                    expect(wrapper.find('span').attributes('style')).toContain('font-size: 14px');
                });
            });

            describe('visual formatting — fontWeight', () => {
                it('should apply fontWeight bold as inline style on span', async () => {
                    const segments = [
                        {
                            type: 'config' as const,
                            value: 'Bold',
                            config: { type: 'static', value: 'Bold', fontWeight: 'bold' },
                        },
                    ];

                    const wrapper = mount(TableBodyCell, {
                        props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                    });

                    await flushPromises();
                    expect(wrapper.find('span').attributes('style')).toContain('font-weight: bold');
                });

                it('should apply numeric fontWeight as inline style on span', async () => {
                    const segments = [
                        {
                            type: 'config' as const,
                            value: 'Heavy',
                            config: { type: 'static', value: 'Heavy', fontWeight: 700 },
                        },
                    ];

                    const wrapper = mount(TableBodyCell, {
                        props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                    });

                    await flushPromises();
                    expect(wrapper.find('span').attributes('style')).toContain('font-weight: 700');
                });
            });

            describe('visual formatting — italic', () => {
                it('should apply fontStyle italic on span when italic is true', async () => {
                    const segments = [
                        {
                            type: 'config' as const,
                            value: 'Italic',
                            config: { type: 'static', value: 'Italic', italic: true },
                        },
                    ];

                    const wrapper = mount(TableBodyCell, {
                        props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                    });

                    await flushPromises();
                    expect(wrapper.find('span').attributes('style')).toContain(
                        'font-style: italic'
                    );
                });

                it('should not add fontStyle when italic is false', async () => {
                    const segments = [
                        {
                            type: 'config' as const,
                            value: 'Normal',
                            config: { type: 'static', value: 'Normal', italic: false },
                        },
                    ];

                    const wrapper = mount(TableBodyCell, {
                        props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                    });

                    await flushPromises();
                    const style = wrapper.find('span').attributes('style') ?? '';
                    expect(style).not.toContain('font-style');
                });
            });

            describe('visual formatting — lineHeight', () => {
                it('should apply lineHeight as inline style on span', async () => {
                    const segments = [
                        {
                            type: 'config' as const,
                            value: 'Line',
                            config: { type: 'static', value: 'Line', lineHeight: '1.8' },
                        },
                    ];

                    const wrapper = mount(TableBodyCell, {
                        props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                    });

                    await flushPromises();
                    expect(wrapper.find('span').attributes('style')).toContain('line-height: 1.8');
                });
            });

            describe('visual formatting — monospace', () => {
                it('should apply font-monospace class on span when monospace is true', async () => {
                    const segments = [
                        {
                            type: 'config' as const,
                            value: 'code',
                            config: { type: 'static', value: 'code', monospace: true },
                        },
                    ];

                    const wrapper = mount(TableBodyCell, {
                        props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                    });

                    await flushPromises();
                    expect(wrapper.find('span').classes()).toContain('font-monospace');
                });

                it('should not add font-monospace class when monospace is false', async () => {
                    const segments = [
                        {
                            type: 'config' as const,
                            value: 'code',
                            config: { type: 'static', value: 'code', monospace: false },
                        },
                    ];

                    const wrapper = mount(TableBodyCell, {
                        props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                    });

                    await flushPromises();
                    expect(wrapper.find('span').classes()).not.toContain('font-monospace');
                });
            });

            describe('visual formatting — text utility', () => {
                it('should apply text-truncate class on span', async () => {
                    const segments = [
                        {
                            type: 'config' as const,
                            value: 'Long text content',
                            config: {
                                type: 'static',
                                value: 'Long text content',
                                text: 'text-truncate',
                            },
                        },
                    ];

                    const wrapper = mount(TableBodyCell, {
                        props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                    });

                    await flushPromises();
                    expect(wrapper.find('span').classes()).toContain('text-truncate');
                });

                it('should apply text-nowrap class on span', async () => {
                    const segments = [
                        {
                            type: 'config' as const,
                            value: 'No wrap',
                            config: { type: 'static', value: 'No wrap', text: 'text-nowrap' },
                        },
                    ];

                    const wrapper = mount(TableBodyCell, {
                        props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                    });

                    await flushPromises();
                    expect(wrapper.find('span').classes()).toContain('text-nowrap');
                });
            });

            describe('visual formatting — combined properties', () => {
                it('should apply color + italic + fontSize + class together on span', async () => {
                    const segments = [
                        {
                            type: 'config' as const,
                            value: 'Combo',
                            config: {
                                type: 'static',
                                value: 'Combo',
                                color: 'danger',
                                italic: true,
                                fontSize: '12px',
                                class: 'fw-bold',
                            },
                        },
                    ];

                    const wrapper = mount(TableBodyCell, {
                        props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                    });

                    await flushPromises();
                    const span = wrapper.find('span');
                    expect(span.classes()).toContain('text-danger');
                    expect(span.classes()).toContain('fw-bold');
                    expect(span.attributes('style')).toContain('font-style: italic');
                    expect(span.attributes('style')).toContain('font-size: 12px');
                });

                it('should apply background class + monospace + text utility together on span', async () => {
                    const segments = [
                        {
                            type: 'config' as const,
                            value: 'Hash',
                            config: {
                                type: 'static',
                                value: 'Hash',
                                background: 'info',
                                monospace: true,
                                text: 'text-truncate',
                            },
                        },
                    ];

                    const wrapper = mount(TableBodyCell, {
                        props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                    });

                    await flushPromises();
                    const span = wrapper.find('span');
                    expect(span.classes()).toContain('bg-info');
                    expect(span.classes()).toContain('font-monospace');
                    expect(span.classes()).toContain('text-truncate');
                });
            });
        });

        describe('icon config segment rendering', () => {
            it('should render icon segment as <i> element, not <span>', async () => {
                const segments = [
                    {
                        type: 'config' as const,
                        value: null,
                        config: {
                            type: 'icon',
                            class: ['fa-regular', 'fa-trash-can'],
                        },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                });

                await flushPromises();
                expect(wrapper.find('i').exists()).toBe(true);
                expect(wrapper.find('span').exists()).toBe(false);
            });

            it('should apply class array from icon config to <i>', async () => {
                const segments = [
                    {
                        type: 'config' as const,
                        value: null,
                        config: {
                            type: 'icon',
                            class: ['fa-regular', 'fa-trash-can', 'ms-1'],
                        },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                });

                await flushPromises();
                const el = wrapper.find('i');
                expect(el.classes()).toContain('fa-regular');
                expect(el.classes()).toContain('fa-trash-can');
                expect(el.classes()).toContain('ms-1');
            });

            it('should split class string and apply to <i>', async () => {
                const segments = [
                    {
                        type: 'config' as const,
                        value: null,
                        config: {
                            type: 'icon',
                            class: 'fas fa-pencil',
                        },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                });

                await flushPromises();
                const el = wrapper.find('i');
                expect(el.classes()).toContain('fas');
                expect(el.classes()).toContain('fa-pencil');
            });

            it('should apply title attribute from icon config', async () => {
                const segments = [
                    {
                        type: 'config' as const,
                        value: null,
                        config: {
                            type: 'icon',
                            class: ['fas', 'fa-info'],
                            title: 'Show details',
                        },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                });

                await flushPromises();
                expect(wrapper.find('i').attributes('title')).toBe('Show details');
            });

            it('should apply alt as aria-label attribute on <i>', async () => {
                const segments = [
                    {
                        type: 'config' as const,
                        value: null,
                        config: {
                            type: 'icon',
                            class: ['fas', 'fa-trash'],
                            alt: 'Delete item',
                        },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                });

                await flushPromises();
                expect(wrapper.find('i').attributes('aria-label')).toBe('Delete item');
            });

            it('should render text-danger class from preprocessed class array', async () => {
                // variant/color are normalized to class by the preprocessor (⑦.5) before rendering
                const segments = [
                    {
                        type: 'config' as const,
                        value: null,
                        config: {
                            type: 'icon',
                            class: ['fas', 'fa-trash', 'text-danger'],
                        },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                });

                await flushPromises();
                expect(wrapper.find('i').classes()).toContain('text-danger');
            });

            it('should render text-success class from preprocessed class array', async () => {
                // variant/color are normalized to class by the preprocessor (⑦.5) before rendering
                const segments = [
                    {
                        type: 'config' as const,
                        value: null,
                        config: {
                            type: 'icon',
                            class: ['fas', 'fa-check', 'text-success'],
                        },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                });

                await flushPromises();
                expect(wrapper.find('i').classes()).toContain('text-success');
            });

            it('should render all classes from preprocessed class array', async () => {
                // preprocessor resolves variant priority over color before rendering;
                // only text-warning ends up in class, not text-info
                const segments = [
                    {
                        type: 'config' as const,
                        value: null,
                        config: {
                            type: 'icon',
                            class: ['fas', 'fa-star', 'text-warning'],
                        },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                });

                await flushPromises();
                const classes = wrapper.find('i').classes();
                expect(classes).toContain('text-warning');
                expect(classes).not.toContain('text-info');
            });

            it('should not wrap in <a> when no route is provided', async () => {
                const segments = [
                    {
                        type: 'config' as const,
                        value: null,
                        config: {
                            type: 'icon',
                            class: ['fas', 'fa-eye'],
                        },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                });

                await flushPromises();
                expect(wrapper.find('a').exists()).toBe(false);
                expect(wrapper.find('i').exists()).toBe(true);
            });

            it('should wrap <i> in <a> with resolved route when route and item are provided', async () => {
                const segments = [
                    {
                        type: 'config' as const,
                        value: null,
                        config: {
                            type: 'icon',
                            class: ['fas', 'fa-edit'],
                            route: '/items/{id}/edit',
                            key: 'id',
                        },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: {
                        columnKey: 'col',
                        cellIndex: 0,
                        fieldSegments: segments as any,
                        item: { id: 42 },
                    },
                });

                await flushPromises();
                const link = wrapper.find('a');
                expect(link.exists()).toBe(true);
                expect(link.attributes('href')).toBe('/items/42/edit');
                expect(link.find('i').exists()).toBe(true);
            });

            it('should not wrap in <a> when route is set but item is not provided', async () => {
                const segments = [
                    {
                        type: 'config' as const,
                        value: null,
                        config: {
                            type: 'icon',
                            class: ['fas', 'fa-edit'],
                            route: '/items/{id}/edit',
                        },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                });

                await flushPromises();
                expect(wrapper.find('a').exists()).toBe(false);
            });

            it('should render empty <i> without crash when neither icon nor class is set', async () => {
                const segments = [
                    {
                        type: 'config' as const,
                        value: null,
                        config: { type: 'icon' },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                });

                await flushPromises();
                expect(wrapper.find('i').exists()).toBe(true);
                expect(wrapper.find('i').attributes('class')).toBeUndefined();
            });

            it('should render icons.1.json example: class array + title + alt', async () => {
                // Corresponds to icons.1.json destroy icon config
                const segments = [
                    {
                        type: 'config' as const,
                        value: null,
                        config: {
                            type: 'icon',
                            class: ['fa-regular', 'fa-trash-can', 'ms-1', 'text-danger'],
                            alt: 'Destroy',
                            title: 'Destroy',
                        },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: { columnKey: 'actions', cellIndex: 0, fieldSegments: segments as any },
                });

                await flushPromises();
                const el = wrapper.find('i');
                expect(el.exists()).toBe(true);
                expect(el.classes()).toContain('fa-regular');
                expect(el.classes()).toContain('fa-trash-can');
                expect(el.classes()).toContain('ms-1');
                expect(el.classes()).toContain('text-danger');
                expect(el.attributes('title')).toBe('Destroy');
                expect(el.attributes('aria-label')).toBe('Destroy');
            });

            it('should render icon classes from preprocessed class array (registry resolved by preprocessor)', async () => {
                // icon: 'trash' + registry lookup is handled by preprocessor (⑦.5);
                // by render time the config already has class: ['fas', 'fa-trash']
                const segments = [
                    {
                        type: 'config' as const,
                        value: null,
                        config: {
                            type: 'icon',
                            class: ['fas', 'fa-trash'],
                        },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: {
                        columnKey: 'col',
                        cellIndex: 0,
                        fieldSegments: segments as any,
                        storeId: testStoreId,
                    },
                });

                await flushPromises();
                const el = wrapper.find('i');
                expect(el.classes()).toContain('fas');
                expect(el.classes()).toContain('fa-trash');
            });

            it('should apply no icon class when registry is empty and has no primary key', async () => {
                core.config.icons = {};

                const segments = [
                    {
                        type: 'config' as const,
                        value: null,
                        config: {
                            type: 'icon',
                            icon: 'my-custom-icon',
                        },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: {
                        columnKey: 'col',
                        cellIndex: 0,
                        fieldSegments: segments as any,
                        storeId: testStoreId,
                    },
                });

                await flushPromises();
                // Unresolved icon name must not appear as a class
                expect(wrapper.find('i').classes()).not.toContain('my-custom-icon');
                // globalClasses.icon from default config (e.g. 'mx-2') may still be present
            });

            it('should pass through data-* attributes to <i>', async () => {
                const segments = [
                    {
                        type: 'config' as const,
                        value: null,
                        config: {
                            type: 'icon',
                            class: ['fas', 'fa-trash'],
                            'data-action': 'delete',
                            'data-id': '7',
                        },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: { columnKey: 'col', cellIndex: 0, fieldSegments: segments as any },
                });

                await flushPromises();
                const el = wrapper.find('i');
                expect(el.attributes('data-action')).toBe('delete');
                expect(el.attributes('data-id')).toBe('7');
            });
        });

        describe('mixed config and value segments', () => {
            it('should render prefix config then value segment correctly', async () => {
                const segments = [
                    {
                        type: 'config' as const,
                        value: 'ID:',
                        config: {
                            type: 'static',
                            value: 'ID:',
                            class: ['pe-1', 'text-muted'],
                        },
                    },
                    {
                        type: 'value' as const,
                        value: 42,
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: {
                        columnKey: 'fullId',
                        cellIndex: 0,
                        fieldSegments: segments as any,
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                const spans = td.findAll('span');

                expect(spans).toHaveLength(2);

                // First span: config segment with classes
                expect(spans[0]?.text()).toBe('ID:');
                expect(spans[0]?.classes()).toContain('pe-1');
                expect(spans[0]?.classes()).toContain('text-muted');

                // Second span: value segment (no extra classes)
                expect(spans[1]?.text()).toBe('42');
            });

            it('should render three segments correctly', async () => {
                const segments = [
                    {
                        type: 'config' as const,
                        value: 'PRE:',
                        config: { type: 'static', value: 'PRE:' },
                    },
                    { type: 'value' as const, value: 'data' },
                    {
                        type: 'config' as const,
                        value: ':SUF',
                        config: { type: 'static', value: ':SUF' },
                    },
                ];

                const wrapper = mount(TableBodyCell, {
                    props: {
                        columnKey: 'triCol',
                        cellIndex: 0,
                        fieldSegments: segments as any,
                    },
                });

                await flushPromises();
                const spans = wrapper.findAll('span');
                expect(spans).toHaveLength(3);
                expect(spans[0]?.text()).toBe('PRE:');
                expect(spans[1]?.text()).toBe('data');
                expect(spans[2]?.text()).toBe(':SUF');
            });
        });

        describe('backward compatibility', () => {
            it('should use original single-value rendering when fieldSegments is undefined', async () => {
                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'FallbackValue' as any,
                        columnKey: 'fc',
                        cellIndex: 0,
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                // No wrapping spans — content is directly in td
                expect(td.text()).toBe('FallbackValue');
                expect(td.findAll('span')).toHaveLength(0);
            });

            it('should use original rendering when fieldSegments is empty array', async () => {
                const wrapper = mount(TableBodyCell, {
                    props: {
                        value: 'DirectValue' as any,
                        columnKey: 'dv',
                        cellIndex: 0,
                        fieldSegments: [] as any,
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                expect(td.text()).toBe('DirectValue');
            });
        });

        describe('td attributes', () => {
            it('should apply cellConfig styles to td in multi-field mode', async () => {
                const segments = [{ type: 'value' as const, value: 'Content' }];

                const wrapper = mount(TableBodyCell, {
                    props: {
                        columnKey: 'styledCol',
                        cellIndex: 0,
                        fieldSegments: segments as any,
                        cellConfig: { key: 'styledCol', width: '120px', align: 'end' } as any,
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                const style = td.attributes('style');
                expect(style).toContain('width: 120px');
                expect(style).toContain('text-align: right');
            });

            it('should have data-testid and data-key in multi-field mode', async () => {
                const segments = [{ type: 'value' as const, value: 'X' }];

                const wrapper = mount(TableBodyCell, {
                    props: {
                        columnKey: 'myKey',
                        cellIndex: 0,
                        fieldSegments: segments as any,
                    },
                });

                await flushPromises();
                const td = wrapper.find('td');
                expect(td.attributes('data-testid')).toBe('table-body-cell');
                expect(td.attributes('data-key')).toBe('myKey');
            });
        });
    });

    describe('body.columnStyles', () => {
        const HEADER = {
            rows: [
                {
                    cells: [
                        { content: 'File', key: 'file', field: 'file' },
                        { content: 'Price', key: 'priceUsd', field: 'priceUsd' },
                    ],
                },
            ],
        };

        const seedColumnStyles = async (columnStyles: Record<string, unknown>) => {
            const apiStore = useApiResourcesStore(testStoreId, core);
            await apiStore.processResponse({
                header: HEADER,
                body: { columnStyles },
                items: [{ file: 'a.txt', priceUsd: 10 }],
            } as any);
            return apiStore;
        };

        it('should append a string columnStyles entry to the cell class list', async () => {
            await seedColumnStyles({ file: 'text-truncate' });

            const wrapper = mount(TableBodyCell, {
                props: {
                    value: 'a.txt' as any,
                    columnKey: 'file',
                    cellIndex: 0,
                    storeId: testStoreId,
                },
            });

            await flushPromises();
            expect(wrapper.find('td').classes()).toContain('text-truncate');
        });

        it('should append an array columnStyles entry to the cell class list', async () => {
            await seedColumnStyles({ priceUsd: ['text-end', 'fw-semibold'] });

            const wrapper = mount(TableBodyCell, {
                props: {
                    value: 10 as any,
                    columnKey: 'priceUsd',
                    cellIndex: 1,
                    storeId: testStoreId,
                },
            });

            await flushPromises();
            const td = wrapper.find('td');
            expect(td.classes()).toContain('text-end');
            expect(td.classes()).toContain('fw-semibold');
        });

        it('should only apply columnStyles to the matching column key', async () => {
            await seedColumnStyles({ file: 'text-truncate' });

            const wrapper = mount(TableBodyCell, {
                props: {
                    value: 10 as any,
                    columnKey: 'priceUsd',
                    cellIndex: 1,
                    storeId: testStoreId,
                },
            });

            await flushPromises();
            expect(wrapper.find('td').classes()).not.toContain('text-truncate');
        });

        it('should coexist with cellConfig classes', async () => {
            await seedColumnStyles({ file: 'text-truncate' });

            const wrapper = mount(TableBodyCell, {
                props: {
                    value: 'a.txt' as any,
                    columnKey: 'file',
                    cellIndex: 0,
                    storeId: testStoreId,
                    cellConfig: { key: 'file', class: 'custom-class' },
                },
            });

            await flushPromises();
            const td = wrapper.find('td');
            expect(td.classes()).toContain('text-truncate');
            expect(td.classes()).toContain('custom-class');
        });
    });
    describe('prototype-chain segment types', () => {
        // Regression guard: the type → renderer dispatch table was read with the response's
        // `config.type`, so `SEGMENT_RENDERERS['constructor']` returned the `Object` function
        // — callable, so the cell rendered its return value instead of the fallback text.
        it.each(['constructor', 'toString', 'valueOf', 'hasOwnProperty', '__proto__'])(
            'should render the fallback text for segment type "%s"',
            async type => {
                const segments = [{ type: 'config' as const, value: 'fallback', config: { type } }];

                const wrapper = mount(TableBodyCell, {
                    props: {
                        columnKey: 'col',
                        cellIndex: 0,
                        fieldSegments: segments as any,
                    },
                });

                await flushPromises();
                expect(wrapper.find('td').text()).toBe('fallback');
            }
        );
    });
});
