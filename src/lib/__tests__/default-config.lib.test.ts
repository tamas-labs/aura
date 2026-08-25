import { describe, it, expect, beforeEach, vi } from 'vitest';
import { defaultConfigLib } from '../default-config.lib';

describe('defaultConfigLib', () => {
    // Mock window.location before the tests
    beforeEach(() => {
        vi.stubGlobal('location', {
            origin: 'https://example.com',
            href: 'https://example.com/test/path',
        });
    });

    describe('alapértelmezett értékek', () => {
        it('létezik és objektum típusú', () => {
            expect(defaultConfigLib).toBeDefined();
            expect(typeof defaultConfigLib).toBe('object');
        });

        it('tartalmazza a kötelező konfigurációs mezőket', () => {
            expect(defaultConfigLib).toHaveProperty('storeId');
            expect(defaultConfigLib).toHaveProperty('debug');
            expect(defaultConfigLib).toHaveProperty('siteName');
            expect(defaultConfigLib).toHaveProperty('rowsNumber');
            expect(defaultConfigLib).toHaveProperty('icons');
            expect(defaultConfigLib).toHaveProperty('variants');
        });
    });

    describe('storeId konfiguráció', () => {
        it('alapértelmezett storeId értéke "aura-core"', () => {
            expect(defaultConfigLib.storeId).toBe('aura-core');
        });

        it('storeId string típusú', () => {
            expect(typeof defaultConfigLib.storeId).toBe('string');
        });
    });

    describe('debug konfiguráció', () => {
        it('alapértelmezett debug értéke false', () => {
            expect(defaultConfigLib.debug).toBe(false);
        });

        it('debug boolean típusú', () => {
            expect(typeof defaultConfigLib.debug).toBe('boolean');
        });
    });

    describe('siteName és href használja a location utility-ket', () => {
        it('siteName string típusú és tartalmaz origin-t', () => {
            expect(typeof defaultConfigLib.siteName).toBe('string');
            expect(defaultConfigLib.siteName!.length).toBeGreaterThan(0);
            // The origin starts with http:// or https://
            expect(defaultConfigLib.siteName!.startsWith('http')).toBe(true);
        });

        it('href string típusú és tartalmaz URL-t', () => {
            expect(typeof defaultConfigLib.href).toBe('string');
            expect(defaultConfigLib.href!.length).toBeGreaterThan(0);
            // The href starts with http:// or https://
            expect(defaultConfigLib.href!.startsWith('http')).toBe(true);
        });
    });

    describe('URL konfiguráció', () => {
        it('urlParameterLastSegment alapértelmezett értéke "resources"', () => {
            expect(defaultConfigLib.urlParameterLastSegment).toBe('resources');
        });

        it('urlStructure tartalmaz placeholder-eket', () => {
            expect(defaultConfigLib.urlStructure).toBe(
                '{siteName}/{urlParameter}/{urlParameterLastSegment}'
            );
            expect(defaultConfigLib.urlStructure).toContain('{siteName}');
            expect(defaultConfigLib.urlStructure).toContain('{urlParameter}');
            expect(defaultConfigLib.urlStructure).toContain('{urlParameterLastSegment}');
        });
    });

    describe('siteToken konfiguráció', () => {
        it('alapértelmezett siteToken értéke false', () => {
            expect(defaultConfigLib.siteToken).toBe(false);
        });
    });

    describe('pagination konfiguráció', () => {
        it('paginateValues tömb típusú', () => {
            expect(Array.isArray(defaultConfigLib.paginateValues)).toBe(true);
        });

        it('paginateValues tartalmaz számokat', () => {
            expect(defaultConfigLib.paginateValues).toEqual([5, 10, 25, 50, 100]);
        });

        it('paginateValues növekvő sorrendben van', () => {
            const values = defaultConfigLib.paginateValues!;
            for (let i = 1; i < values.length; i++) {
                expect(values[i]!).toBeGreaterThan(values[i - 1]!);
            }
        });

        it('rowsNumber alapértelmezett értéke 10', () => {
            expect(defaultConfigLib.rowsNumber).toBe(10);
        });

        it('rowsNumber benne van a paginateValues-ban', () => {
            expect(defaultConfigLib.paginateValues).toContain(defaultConfigLib.rowsNumber);
        });
    });

    describe('icons konfiguráció', () => {
        it('icons objektum tartalmazza a kötelező mezőket', () => {
            expect(defaultConfigLib.icons!).toHaveProperty('sortable');
            expect(defaultConfigLib.icons!).toHaveProperty('filterable');
            expect(defaultConfigLib.icons!).toHaveProperty('settings');
            expect(defaultConfigLib.icons!).toHaveProperty('search');
        });

        it('sortable icons tartalmaz up, down, both', () => {
            expect(defaultConfigLib.icons!.sortable).toHaveProperty('up');
            expect(defaultConfigLib.icons!.sortable).toHaveProperty('down');
            expect(defaultConfigLib.icons!.sortable).toHaveProperty('both');
        });

        it('ikon értékek tuple típusúak (2 elemű tömbök)', () => {
            expect(defaultConfigLib.icons!.filterable).toHaveLength(2);
            expect(defaultConfigLib.icons!.settings).toHaveLength(2);
            expect(defaultConfigLib.icons!.search).toHaveLength(2);
        });

        it('FontAwesome prefix használata', () => {
            expect(defaultConfigLib.icons!.filterable[0]).toBe('fas');
            expect(defaultConfigLib.icons!.settings[0]).toBe('fas');
            expect(defaultConfigLib.icons!.search[0]).toBe('fas');
        });
    });

    describe('classes konfiguráció', () => {
        it('classes.icon tömb típusú', () => {
            expect(Array.isArray(defaultConfigLib.classes!.icon)).toBe(true);
        });

        it('classes.button tömb típusú és tartalmaz Bootstrap class-t', () => {
            expect(Array.isArray(defaultConfigLib.classes!.button)).toBe(true);
            expect(defaultConfigLib.classes!.button).toContain('mx-1');
        });

        it('classes.link tömb típusú', () => {
            expect(Array.isArray(defaultConfigLib.classes!.link)).toBe(true);
            expect(defaultConfigLib.classes!.link).toContain('mx-1');
        });
    });

    describe('variants konfiguráció', () => {
        it('variants objektum tartalmazza a Bootstrap variant-okat', () => {
            expect(defaultConfigLib.variants!).toHaveProperty('primary');
            expect(defaultConfigLib.variants!).toHaveProperty('danger');
            expect(defaultConfigLib.variants!).toHaveProperty('warning');
            expect(defaultConfigLib.variants!).toHaveProperty('success');
            expect(defaultConfigLib.variants!).toHaveProperty('info');
            expect(defaultConfigLib.variants!).toHaveProperty('secondary');
        });

        it('action-specific variant-ok léteznek', () => {
            expect(defaultConfigLib.variants!).toHaveProperty('destroy');
            expect(defaultConfigLib.variants!).toHaveProperty('edit');
            expect(defaultConfigLib.variants!).toHaveProperty('show');
            expect(defaultConfigLib.variants!).toHaveProperty('switchUser');
        });

        it('destroy variant danger-re van állítva', () => {
            expect(defaultConfigLib.variants!.destroy).toBe('danger');
        });

        it('edit variant primary-re van állítva', () => {
            expect(defaultConfigLib.variants!.edit).toBe('primary');
        });
    });

    describe('megjelenítési beállítások', () => {
        it('showFooter alapértelmezett értéke true', () => {
            expect(defaultConfigLib.showFooter).toBe(true);
        });

        it('actionButtons alapértelmezett értéke refresh, export, settings tömb', () => {
            expect(defaultConfigLib.actionButtons).toEqual(['refresh', 'export', 'settings']);
        });

        it('showHeaderSearch alapértelmezett értéke false', () => {
            expect(defaultConfigLib.showHeaderSearch).toBe(false);
        });

        it('externalPaginator alapértelmezett értéke false', () => {
            expect(defaultConfigLib.externalPaginator).toBe(false);
        });
    });

    describe('CSS konfiguráció', () => {
        it('classes.table tartalmaz Bootstrap class-okat', () => {
            expect(defaultConfigLib.classes!.table).toContain('table-striped');
            expect(defaultConfigLib.classes!.table).toContain('table-hover');
        });

        it('classes.table tartalmaz spacing class-okat', () => {
            expect(defaultConfigLib.classes!.table).toContain('mt-2');
            expect(defaultConfigLib.classes!.table).toContain('mb-4');
        });
    });

    describe('resources és request konfiguráció', () => {
        it('resources alapértelmezett értéke false', () => {
            expect(defaultConfigLib.resources).toBe(false);
        });

        it('requestMethod alapértelmezett értéke POST', () => {
            expect(defaultConfigLib.requestMethod).toBe('POST');
        });
    });

    describe('dátum és idő konfiguráció', () => {
        it('dateStyle alapértelmezett értéke "short"', () => {
            expect(defaultConfigLib.dateStyle).toBe('short');
        });

        it('timeZone Budapest-re van állítva', () => {
            expect(defaultConfigLib.timeZone).toBe('Europe/Budapest');
        });

        it('utcOffset +02:00-ra van állítva', () => {
            expect(defaultConfigLib.utcOffset).toBe('+02:00');
        });

        it('localization en-US', () => {
            expect(defaultConfigLib.localization).toBe('en-US');
        });

        it('currencyCode HUF', () => {
            expect(defaultConfigLib.currencyCode).toBe('HUF');
        });
    });

    describe('session konfiguráció', () => {
        it('disableSession alapértelmezett értéke false', () => {
            expect(defaultConfigLib.disableSession).toBe(false);
        });
    });

    describe('classes.dataTypes konfiguráció', () => {
        it('classes.dataTypes objektum létezik', () => {
            expect(defaultConfigLib.classes!.dataTypes).toBeDefined();
        });

        it('számok jobbra igazítva vannak', () => {
            expect(defaultConfigLib.classes!.dataTypes!.numbers).toContain('text-end');
        });

        it('pénznem jobbra igazítva van', () => {
            expect(defaultConfigLib.classes!.dataTypes!.currency).toContain('text-end');
        });

        it('mértékegység jobbra igazítva van', () => {
            expect(defaultConfigLib.classes!.dataTypes!.unit).toContain('text-end');
        });
    });

    describe('egyéb konfiguráció', () => {
        it('sliceEndText alapértelmezett értéke "..."', () => {
            expect(defaultConfigLib.sliceEndText).toBe('...');
        });

        it('allowExternalApi alapértelmezett értéke false', () => {
            expect(defaultConfigLib.allowExternalApi).toBe(false);
        });

        it('errorReporting alapértelmezett értéke false', () => {
            expect(defaultConfigLib.errorReporting).toBe(false);
        });
    });
});
