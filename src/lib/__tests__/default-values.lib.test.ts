import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    DEFAULT_STORE_ID,
    DEFAULT_DEBUG,
    DEFAULT_SITE_NAME,
    DEFAULT_URL_PARAMETER,
    DEFAULT_HREF,
    DEFAULT_URL_PARAMETER_LAST_SEGMENT,
    DEFAULT_URL_STRUCTURE,
    DEFAULT_SITE_TOKEN,
    DEFAULT_PAGINATE_VALUES,
    DEFAULT_ROWS_NUMBER,
    DEFAULT_CLASSES,
    DEFAULT_ICONS,
    DEFAULT_VARIANTS,
    DEFAULT_SHOW_FOOTER,
    DEFAULT_ACTION_BUTTONS,
    DEFAULT_SHOW_HEADER_SEARCH,
    DEFAULT_EXTERNAL_PAGINATOR,
    DEFAULT_RESOURCES,
    DEFAULT_REQUEST_METHOD,
    DEFAULT_DATE_STYLE,
    DEFAULT_TIME_ZONE,
    DEFAULT_UTC_OFFSET,
    DEFAULT_LOCALIZATION,
    DEFAULT_CURRENCY_CODE,
    DEFAULT_DISABLE_SESSION,
    DEFAULT_SLICE_END_TEXT,
    DEFAULT_ALLOW_EXTERNAL_API,
    DEFAULT_ERROR_REPORTING,
    DEFAULT_ERROR_REPORTING_ENDPOINT,
    DEFAULT_ERROR_REPORTING_SERVICE,
    DEFAULT_ERROR_REPORTING_API_KEY,
} from '../default-values.lib';

// Type constants for typeof checks
const TYPE_STRING = 'string';
const TYPE_BOOLEAN = 'boolean';
const TYPE_NUMBER = 'number';
const TYPE_OBJECT = 'object';

// Test description constants
const TEST_DESC_STRING_TYPE = 'string típusú';
const TEST_DESC_BOOLEAN_TYPE = 'boolean típusú';
const TEST_DESC_OBJECT_TYPE = 'objektum típusú';
const TEST_DESC_VALUE_FALSE = 'értéke false';

describe('default-values.lib', () => {
    // Mock window.location before the tests
    beforeEach(() => {
        vi.stubGlobal('location', {
            origin: 'https://example.com',
            href: 'https://example.com/test/path',
        });
    });

    describe('alapértelmezett primitív értékek', () => {
        describe('DEFAULT_STORE_ID', () => {
            it('értéke "aura-core"', () => {
                expect(DEFAULT_STORE_ID).toBe('aura-core');
            });

            it(TEST_DESC_STRING_TYPE, () => {
                expect(typeof DEFAULT_STORE_ID).toBe(TYPE_STRING);
            });
        });

        describe('DEFAULT_DEBUG', () => {
            it(TEST_DESC_VALUE_FALSE, () => {
                expect(DEFAULT_DEBUG).toBe(false);
            });

            it(TEST_DESC_BOOLEAN_TYPE, () => {
                expect(typeof DEFAULT_DEBUG).toBe(TYPE_BOOLEAN);
            });
        });

        describe('DEFAULT_SITE_TOKEN', () => {
            it(TEST_DESC_VALUE_FALSE, () => {
                expect(DEFAULT_SITE_TOKEN).toBe(false);
            });

            it(TEST_DESC_BOOLEAN_TYPE, () => {
                expect(typeof DEFAULT_SITE_TOKEN).toBe(TYPE_BOOLEAN);
            });
        });

        describe('DEFAULT_SHOW_FOOTER', () => {
            it(TEST_DESC_VALUE_FALSE, () => {
                expect(DEFAULT_SHOW_FOOTER).toBe(true);
            });

            it(TEST_DESC_BOOLEAN_TYPE, () => {
                expect(typeof DEFAULT_SHOW_FOOTER).toBe(TYPE_BOOLEAN);
            });
        });

        describe('DEFAULT_ACTION_BUTTONS', () => {
            it('értéke refresh, export, settings tömb', () => {
                expect(DEFAULT_ACTION_BUTTONS).toEqual(['refresh', 'export', 'settings']);
            });

            it('array típusú', () => {
                expect(Array.isArray(DEFAULT_ACTION_BUTTONS)).toBe(true);
            });
        });

        describe('DEFAULT_SHOW_HEADER_SEARCH', () => {
            it(TEST_DESC_VALUE_FALSE, () => {
                expect(DEFAULT_SHOW_HEADER_SEARCH).toBe(false);
            });

            it(TEST_DESC_BOOLEAN_TYPE, () => {
                expect(typeof DEFAULT_SHOW_HEADER_SEARCH).toBe(TYPE_BOOLEAN);
            });
        });

        describe('DEFAULT_EXTERNAL_PAGINATOR', () => {
            it(TEST_DESC_VALUE_FALSE, () => {
                expect(DEFAULT_EXTERNAL_PAGINATOR).toBe(false);
            });

            it(TEST_DESC_BOOLEAN_TYPE, () => {
                expect(typeof DEFAULT_EXTERNAL_PAGINATOR).toBe(TYPE_BOOLEAN);
            });
        });

        describe('DEFAULT_RESOURCES', () => {
            it(TEST_DESC_VALUE_FALSE, () => {
                expect(DEFAULT_RESOURCES).toBe(false);
            });

            it(TEST_DESC_BOOLEAN_TYPE, () => {
                expect(typeof DEFAULT_RESOURCES).toBe(TYPE_BOOLEAN);
            });
        });

        describe('DEFAULT_DISABLE_SESSION', () => {
            it(TEST_DESC_VALUE_FALSE, () => {
                expect(DEFAULT_DISABLE_SESSION).toBe(false);
            });

            it(TEST_DESC_BOOLEAN_TYPE, () => {
                expect(typeof DEFAULT_DISABLE_SESSION).toBe(TYPE_BOOLEAN);
            });
        });

        describe('DEFAULT_ALLOW_EXTERNAL_API', () => {
            it(TEST_DESC_VALUE_FALSE, () => {
                expect(DEFAULT_ALLOW_EXTERNAL_API).toBe(false);
            });

            it(TEST_DESC_BOOLEAN_TYPE, () => {
                expect(typeof DEFAULT_ALLOW_EXTERNAL_API).toBe(TYPE_BOOLEAN);
            });
        });

        describe('DEFAULT_ERROR_REPORTING', () => {
            it(TEST_DESC_VALUE_FALSE, () => {
                expect(DEFAULT_ERROR_REPORTING).toBe(false);
            });

            it(TEST_DESC_BOOLEAN_TYPE, () => {
                expect(typeof DEFAULT_ERROR_REPORTING).toBe(TYPE_BOOLEAN);
            });
        });
    });

    describe('URL és lokáció értékek', () => {
        describe('DEFAULT_SITE_NAME', () => {
            it(TEST_DESC_STRING_TYPE, () => {
                expect(typeof DEFAULT_SITE_NAME).toBe(TYPE_STRING);
            });

            it('tartalmaz http protocol-t', () => {
                expect(DEFAULT_SITE_NAME.startsWith('http')).toBe(true);
            });
        });

        describe('DEFAULT_URL_PARAMETER', () => {
            it(TEST_DESC_STRING_TYPE, () => {
                expect(typeof DEFAULT_URL_PARAMETER).toBe(TYPE_STRING);
            });
        });

        describe('DEFAULT_HREF', () => {
            it(TEST_DESC_STRING_TYPE, () => {
                expect(typeof DEFAULT_HREF).toBe(TYPE_STRING);
            });

            it('tartalmaz http protocol-t', () => {
                expect(DEFAULT_HREF.startsWith('http')).toBe(true);
            });
        });

        describe('DEFAULT_URL_PARAMETER_LAST_SEGMENT', () => {
            it('értéke "resources"', () => {
                expect(DEFAULT_URL_PARAMETER_LAST_SEGMENT).toBe('resources');
            });

            it(TEST_DESC_STRING_TYPE, () => {
                expect(typeof DEFAULT_URL_PARAMETER_LAST_SEGMENT).toBe(TYPE_STRING);
            });
        });

        describe('DEFAULT_URL_STRUCTURE', () => {
            it('tartalmaz placeholder-eket', () => {
                expect(DEFAULT_URL_STRUCTURE).toBe(
                    '{siteName}/{urlParameter}/{urlParameterLastSegment}'
                );
            });

            it('tartalmazza a {siteName} placeholder-t', () => {
                expect(DEFAULT_URL_STRUCTURE).toContain('{siteName}');
            });

            it('tartalmazza a {urlParameter} placeholder-t', () => {
                expect(DEFAULT_URL_STRUCTURE).toContain('{urlParameter}');
            });

            it('tartalmazza a {urlParameterLastSegment} placeholder-t', () => {
                expect(DEFAULT_URL_STRUCTURE).toContain('{urlParameterLastSegment}');
            });
        });
    });

    describe('pagination értékek', () => {
        describe('DEFAULT_PAGINATE_VALUES', () => {
            it('tömb típusú', () => {
                expect(Array.isArray(DEFAULT_PAGINATE_VALUES)).toBe(true);
            });

            it('helyes értékeket tartalmaz', () => {
                expect(DEFAULT_PAGINATE_VALUES).toEqual([5, 10, 25, 50, 100]);
            });

            it('növekvő sorrendben van', () => {
                for (let i = 1; i < DEFAULT_PAGINATE_VALUES.length; i++) {
                    const current = DEFAULT_PAGINATE_VALUES[i];
                    const previous = DEFAULT_PAGINATE_VALUES[i - 1];
                    if (current !== undefined && previous !== undefined) {
                        expect(current).toBeGreaterThan(previous);
                    }
                }
            });

            it('csak számokat tartalmaz', () => {
                DEFAULT_PAGINATE_VALUES.forEach(value => {
                    expect(typeof value).toBe(TYPE_NUMBER);
                });
            });
        });

        describe('DEFAULT_ROWS_NUMBER', () => {
            it('értéke 10', () => {
                expect(DEFAULT_ROWS_NUMBER).toBe(10);
            });

            it('number típusú', () => {
                expect(typeof DEFAULT_ROWS_NUMBER).toBe(TYPE_NUMBER);
            });

            it('benne van a DEFAULT_PAGINATE_VALUES-ban', () => {
                expect(DEFAULT_PAGINATE_VALUES).toContain(DEFAULT_ROWS_NUMBER);
            });
        });
    });

    describe('DEFAULT_CLASSES objektum', () => {
        it(TEST_DESC_OBJECT_TYPE, () => {
            expect(typeof DEFAULT_CLASSES).toBe(TYPE_OBJECT);
        });

        it('tartalmazza a table property-t', () => {
            expect(DEFAULT_CLASSES).toHaveProperty('table');
        });

        it('table tömb típusú', () => {
            expect(Array.isArray(DEFAULT_CLASSES.table)).toBe(true);
        });

        it('table tartalmaz Bootstrap class-okat', () => {
            expect(DEFAULT_CLASSES.table).toContain('table-striped');
            expect(DEFAULT_CLASSES.table).toContain('table-hover');
        });

        it('tartalmazza az icon property-t', () => {
            expect(DEFAULT_CLASSES).toHaveProperty('icon');
            expect(Array.isArray(DEFAULT_CLASSES.icon)).toBe(true);
        });

        it('tartalmazza a button property-t', () => {
            expect(DEFAULT_CLASSES).toHaveProperty('button');
            expect(Array.isArray(DEFAULT_CLASSES.button)).toBe(true);
        });

        it('tartalmazza a link property-t', () => {
            expect(DEFAULT_CLASSES).toHaveProperty('link');
            expect(Array.isArray(DEFAULT_CLASSES.link)).toBe(true);
        });

        it('tartalmazza a dataTypes property-t', () => {
            expect(DEFAULT_CLASSES).toHaveProperty('dataTypes');
            expect(typeof DEFAULT_CLASSES.dataTypes).toBe(TYPE_OBJECT);
        });

        it('dataTypes tartalmaz numbers, currency, unit property-ket', () => {
            expect(DEFAULT_CLASSES.dataTypes).toHaveProperty('numbers');
            expect(DEFAULT_CLASSES.dataTypes).toHaveProperty('currency');
            expect(DEFAULT_CLASSES.dataTypes).toHaveProperty('unit');
        });
    });

    describe('DEFAULT_ICONS objektum', () => {
        it(TEST_DESC_OBJECT_TYPE, () => {
            expect(typeof DEFAULT_ICONS).toBe(TYPE_OBJECT);
        });

        it('tartalmazza a sortable property-t', () => {
            expect(DEFAULT_ICONS).toHaveProperty('sortable');
        });

        it('sortable tartalmaz up, down, both property-ket', () => {
            expect(DEFAULT_ICONS.sortable).toHaveProperty('up');
            expect(DEFAULT_ICONS.sortable).toHaveProperty('down');
            expect(DEFAULT_ICONS.sortable).toHaveProperty('both');
        });

        it('sortable up értéke tuple', () => {
            expect(Array.isArray(DEFAULT_ICONS.sortable.up)).toBe(true);
            expect(DEFAULT_ICONS.sortable.up).toHaveLength(2);
        });

        it('tartalmazza a kötelező ikon property-ket', () => {
            expect(DEFAULT_ICONS).toHaveProperty('filterable');
            expect(DEFAULT_ICONS).toHaveProperty('filterableChecked');
            expect(DEFAULT_ICONS).toHaveProperty('settings');
            expect(DEFAULT_ICONS).toHaveProperty('save');
            expect(DEFAULT_ICONS).toHaveProperty('close');
            expect(DEFAULT_ICONS).toHaveProperty('search');
            expect(DEFAULT_ICONS).toHaveProperty('clear');
            expect(DEFAULT_ICONS).toHaveProperty('destroy');
            expect(DEFAULT_ICONS).toHaveProperty('edit');
            expect(DEFAULT_ICONS).toHaveProperty('show');
            expect(DEFAULT_ICONS).toHaveProperty('switchUser');
            expect(DEFAULT_ICONS).toHaveProperty('primary');
        });

        it('ikon értékek tuple típusúak (2 elemű tömbök)', () => {
            expect(DEFAULT_ICONS.filterable).toHaveLength(2);
            expect(DEFAULT_ICONS.settings).toHaveLength(2);
            expect(DEFAULT_ICONS.search).toHaveLength(2);
        });

        it('FontAwesome prefix használata', () => {
            expect(DEFAULT_ICONS.filterable[0]).toBe('fas');
            expect(DEFAULT_ICONS.settings[0]).toBe('fas');
            expect(DEFAULT_ICONS.search[0]).toBe('fas');
        });
    });

    describe('DEFAULT_VARIANTS objektum', () => {
        it(TEST_DESC_OBJECT_TYPE, () => {
            expect(typeof DEFAULT_VARIANTS).toBe(TYPE_OBJECT);
        });

        it('tartalmazza az alapvető variant property-ket', () => {
            expect(DEFAULT_VARIANTS).toHaveProperty('primary');
            expect(DEFAULT_VARIANTS).toHaveProperty('destroy');
            expect(DEFAULT_VARIANTS).toHaveProperty('edit');
            expect(DEFAULT_VARIANTS).toHaveProperty('show');
            expect(DEFAULT_VARIANTS).toHaveProperty('switchUser');
            expect(DEFAULT_VARIANTS).toHaveProperty('danger');
            expect(DEFAULT_VARIANTS).toHaveProperty('warning');
            expect(DEFAULT_VARIANTS).toHaveProperty('success');
            expect(DEFAULT_VARIANTS).toHaveProperty('info');
            expect(DEFAULT_VARIANTS).toHaveProperty('secondary');
        });

        it('variant értékek Bootstrap kompatibilisek', () => {
            const validVariants = ['primary', 'danger', 'warning', 'success', 'info', 'secondary'];
            Object.values(DEFAULT_VARIANTS).forEach(value => {
                expect(validVariants).toContain(value);
            });
        });
    });

    describe('DEFAULT_REQUEST_METHOD', () => {
        it('értéke "POST"', () => {
            expect(DEFAULT_REQUEST_METHOD).toBe('POST');
        });

        it(TEST_DESC_STRING_TYPE, () => {
            expect(typeof DEFAULT_REQUEST_METHOD).toBe(TYPE_STRING);
        });
    });

    describe('DEFAULT_DATE_STYLE', () => {
        it('értéke "short"', () => {
            expect(DEFAULT_DATE_STYLE).toBe('short');
        });

        it(TEST_DESC_STRING_TYPE, () => {
            expect(typeof DEFAULT_DATE_STYLE).toBe(TYPE_STRING);
        });
    });

    describe('DEFAULT_TIME_ZONE', () => {
        it('értéke "Europe/Budapest"', () => {
            expect(DEFAULT_TIME_ZONE).toBe('Europe/Budapest');
        });

        it(TEST_DESC_STRING_TYPE, () => {
            expect(typeof DEFAULT_TIME_ZONE).toBe(TYPE_STRING);
        });
    });

    describe('DEFAULT_UTC_OFFSET', () => {
        it('értéke "+02:00"', () => {
            expect(DEFAULT_UTC_OFFSET).toBe('+02:00');
        });

        it(TEST_DESC_STRING_TYPE, () => {
            expect(typeof DEFAULT_UTC_OFFSET).toBe(TYPE_STRING);
        });

        it('tartalmaz +/- jelet', () => {
            expect(DEFAULT_UTC_OFFSET.startsWith('+') || DEFAULT_UTC_OFFSET.startsWith('-')).toBe(
                true
            );
        });
    });

    describe('DEFAULT_LOCALIZATION', () => {
        it('értéke "en-US"', () => {
            expect(DEFAULT_LOCALIZATION).toBe('en-US');
        });

        it(TEST_DESC_STRING_TYPE, () => {
            expect(typeof DEFAULT_LOCALIZATION).toBe(TYPE_STRING);
        });

        it('tartalmaz locale pattern-t', () => {
            expect(DEFAULT_LOCALIZATION).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
        });
    });

    describe('DEFAULT_CURRENCY_CODE', () => {
        it('értéke "HUF"', () => {
            expect(DEFAULT_CURRENCY_CODE).toBe('HUF');
        });

        it(TEST_DESC_STRING_TYPE, () => {
            expect(typeof DEFAULT_CURRENCY_CODE).toBe(TYPE_STRING);
        });

        it('3 karakter hosszú (ISO 4217)', () => {
            expect(DEFAULT_CURRENCY_CODE).toHaveLength(3);
        });
    });

    describe('DEFAULT_SLICE_END_TEXT', () => {
        it('értéke "..."', () => {
            expect(DEFAULT_SLICE_END_TEXT).toBe('...');
        });

        it(TEST_DESC_STRING_TYPE, () => {
            expect(typeof DEFAULT_SLICE_END_TEXT).toBe(TYPE_STRING);
        });
    });

    describe('DEFAULT_ERROR_REPORTING_ENDPOINT', () => {
        it('értéke üres string', () => {
            expect(DEFAULT_ERROR_REPORTING_ENDPOINT).toBe('');
        });

        it(TEST_DESC_STRING_TYPE, () => {
            expect(typeof DEFAULT_ERROR_REPORTING_ENDPOINT).toBe(TYPE_STRING);
        });
    });

    describe('DEFAULT_ERROR_REPORTING_SERVICE', () => {
        it('értéke "custom"', () => {
            expect(DEFAULT_ERROR_REPORTING_SERVICE).toBe('custom');
        });

        it(TEST_DESC_STRING_TYPE, () => {
            expect(typeof DEFAULT_ERROR_REPORTING_SERVICE).toBe(TYPE_STRING);
        });
    });

    describe('DEFAULT_ERROR_REPORTING_API_KEY', () => {
        it('értéke üres string', () => {
            expect(DEFAULT_ERROR_REPORTING_API_KEY).toBe('');
        });

        it(TEST_DESC_STRING_TYPE, () => {
            expect(typeof DEFAULT_ERROR_REPORTING_API_KEY).toBe(TYPE_STRING);
        });
    });

    describe('export ellenőrzés', () => {
        it('minden konstans exportálva van', () => {
            expect(DEFAULT_STORE_ID).toBeDefined();
            expect(DEFAULT_DEBUG).toBeDefined();
            expect(DEFAULT_SITE_NAME).toBeDefined();
            expect(DEFAULT_URL_PARAMETER).toBeDefined();
            expect(DEFAULT_HREF).toBeDefined();
            expect(DEFAULT_URL_PARAMETER_LAST_SEGMENT).toBeDefined();
            expect(DEFAULT_URL_STRUCTURE).toBeDefined();
            expect(DEFAULT_SITE_TOKEN).toBeDefined();
            expect(DEFAULT_PAGINATE_VALUES).toBeDefined();
            expect(DEFAULT_ROWS_NUMBER).toBeDefined();
            expect(DEFAULT_CLASSES).toBeDefined();
            expect(DEFAULT_ICONS).toBeDefined();
            expect(DEFAULT_VARIANTS).toBeDefined();
            expect(DEFAULT_SHOW_FOOTER).toBeDefined();
            expect(DEFAULT_ACTION_BUTTONS).toBeDefined();
            expect(DEFAULT_SHOW_HEADER_SEARCH).toBeDefined();
            expect(DEFAULT_EXTERNAL_PAGINATOR).toBeDefined();
            expect(DEFAULT_RESOURCES).toBeDefined();
            expect(DEFAULT_REQUEST_METHOD).toBeDefined();
            expect(DEFAULT_DATE_STYLE).toBeDefined();
            expect(DEFAULT_TIME_ZONE).toBeDefined();
            expect(DEFAULT_UTC_OFFSET).toBeDefined();
            expect(DEFAULT_LOCALIZATION).toBeDefined();
            expect(DEFAULT_CURRENCY_CODE).toBeDefined();
            expect(DEFAULT_DISABLE_SESSION).toBeDefined();
            expect(DEFAULT_SLICE_END_TEXT).toBeDefined();
            expect(DEFAULT_ALLOW_EXTERNAL_API).toBeDefined();
            expect(DEFAULT_ERROR_REPORTING).toBeDefined();
            expect(DEFAULT_ERROR_REPORTING_ENDPOINT).toBeDefined();
            expect(DEFAULT_ERROR_REPORTING_SERVICE).toBeDefined();
            expect(DEFAULT_ERROR_REPORTING_API_KEY).toBeDefined();
        });
    });
});
