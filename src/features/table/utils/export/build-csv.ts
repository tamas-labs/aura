import { resolveValue } from '../../../../utils/resolve-value.util';

/** A column to export: header label + data field key. */
export interface CsvColumn {
    /** The label shown in the CSV header row. */
    header: string;
    /** The field to read from the row object (also handles a dotted path). */
    field: string;
}

/** The row cell delimiter. */
const CSV_DELIMITER = ',';

/** RFC 4180 line break. */
const CSV_LINE_BREAK = '\r\n';

/**
 * Leading characters that make Excel, LibreOffice Calc and Google Sheets treat a
 * cell as a formula instead of text (CSV injection / formula injection).
 */
const CSV_FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

/**
 * A plain numeric literal (`-5`, `+1.5`, `1e3`). Such a value can never be a
 * formula, so it is exempt from the guard below — otherwise every negative number
 * would leave the export apostrophe-prefixed.
 */
const NUMERIC_LITERAL_PATTERN = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?$/;

/** The apostrophe forcing a spreadsheet to read the cell as text. */
const CSV_TEXT_MARKER = "'";

/**
 * Decides whether a cell would be evaluated as a formula when the CSV is opened
 * in a spreadsheet application.
 */
function isFormulaLike(raw: string): boolean {
    return CSV_FORMULA_PREFIXES.includes(raw.charAt(0)) && !NUMERIC_LITERAL_PATTERN.test(raw);
}

/**
 * Converts a single value into an RFC 4180 CSV cell.
 *
 * `null`/`undefined` → empty string; primitives via `String()`; object/array via
 * `JSON.stringify`. If the value contains a `"`, `,`, CR or LF character, it's
 * wrapped in quotes and internal `"` is doubled.
 *
 * Formula injection guard: a value starting with `=`, `+`, `-`, `@`, TAB or CR is
 * prefixed with an apostrophe and always quoted, so spreadsheets read it as text.
 * Quoting alone is not enough — `"=1+1"` is still evaluated after the CSV parser
 * strips the quotes. Plain numeric literals (`-5`) are left untouched.
 */
export function escapeCsvValue(value: unknown): string {
    if (value === null || value === undefined) return '';

    const raw =
        typeof value === 'object'
            ? JSON.stringify(value)
            : String(value as string | number | boolean);

    if (isFormulaLike(raw)) {
        return `"${CSV_TEXT_MARKER}${raw.replace(/"/g, '""')}"`;
    }

    if (/[",\r\n]/.test(raw)) {
        return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
}

/**
 * Builds CSV content from column definitions and row objects.
 *
 * The first line is the header (the columns' `header`s), followed by, per row, the
 * values read via `resolveValue` based on each column's `field`. A pure function
 * (no DOM side effects), so it's uniformly testable.
 *
 * @param columns - The columns to export (header + field key)
 * @param rows - The row objects (usually the store's `displayItems`)
 * @returns The full CSV text (without BOM)
 */
export function buildCsv(columns: CsvColumn[], rows: readonly unknown[]): string {
    const headerLine = columns.map(col => escapeCsvValue(col.header)).join(CSV_DELIMITER);

    const dataLines = rows.map(row =>
        columns.map(col => escapeCsvValue(resolveValue(row, col.field))).join(CSV_DELIMITER)
    );

    return [headerLine, ...dataLines].join(CSV_LINE_BREAK);
}

/** UTF-8 BOM — so Excel reads international characters correctly. */
const UTF8_BOM = '﻿';

/**
 * Triggers the download of the CSV text in the browser (Blob + object URL + anchor).
 * Prefixes it with a BOM so Excel opens the UTF-8 content correctly.
 *
 * In an SSR/non-browser environment (`document`/`URL.createObjectURL` missing), it's
 * a silent no-op — it doesn't throw, so the calling branch stays simple.
 *
 * @param filename - The suggested filename (e.g. `export.csv`)
 * @param csv - The content produced by `buildCsv`
 */
export function triggerCsvDownload(filename: string, csv: string): void {
    if (typeof document === 'undefined' || typeof URL === 'undefined' || !URL.createObjectURL) {
        return;
    }

    const blob = new Blob([UTF8_BOM, csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
}
