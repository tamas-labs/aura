import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Zod v3 compatibility-shim guard.
 *
 * Audit 2026-08-19 H3 asked what zod costs the bundle and whether `zod/mini` is worth the
 * rewrite. Measuring that turned up something the size numbers do not show: eleven call
 * sites were still on zod's **`compat` module** — the v3 aliases zod 4 keeps only so that
 * v3 code compiles. `z.ZodIssueCode.custom` (ten `superRefine` branches) and `ZodTypeAny`
 * (`create-config-validator`) both carry an explicit `@deprecated` tag in
 * `zod/v4/classic/compat.d.cts` and are slated to disappear with zod 5. They also have no
 * counterpart in `zod/mini`, so every one of them would have had to be found and rewritten
 * anyway on the day the mini switch is made.
 *
 * The replacements are the plain forms: the literal issue code (`code: 'custom'`) and
 * `ZodType` without generics.
 *
 * This is the seventh guard in the family that keeps a convention mechanical rather than
 * remembered — `layer-boundaries`, `error-sink`, `public-api`, `docs-coverage`,
 * `jsdoc-coverage`, `registry-lookups`.
 */
describe('zod compat API', () => {
    const srcDir = resolve(__dirname, '..');

    /** This guard names the forbidden identifiers, so it must not scan itself. */
    const SELF = 'zod-compat-api.test.ts';

    /**
     * Everything `zod/v4/classic/compat.d.cts` exports purely for zod 3 source
     * compatibility: the `@deprecated`-tagged aliases plus the two carrying the same intent
     * in prose (`BRAND`, `ZodRawShape`). None of them exist in `zod/mini`.
     */
    const DEPRECATED_COMPAT_EXPORTS = [
        'BRAND',
        'Infer',
        'Schema',
        'ZodFirstPartySchemaTypes',
        'ZodFirstPartyTypeKind',
        'ZodIssueCode',
        'ZodRawShape',
        'ZodSchema',
        'ZodTypeAny',
        'TypeOf',
        'getErrorMap',
        'inferFlattenedErrors',
        'inferFormattedError',
        'setErrorMap',
    ];

    /** Every `.ts`/`.tsx` file below `dir`, tests included — the shims are as unwelcome there. */
    const collectSourceFiles = (dir: string): string[] => {
        const entries = readdirSync(dir, { withFileTypes: true });
        return entries.flatMap(entry => {
            const full = resolve(dir, entry.name);
            if (entry.isDirectory()) {
                return collectSourceFiles(full);
            }
            const isSource = entry.name.endsWith('.ts') || entry.name.endsWith('.tsx');
            return isSource && entry.name !== SELF ? [full] : [];
        });
    };

    const sourceFiles = collectSourceFiles(srcDir);

    /**
     * The names a file pulls out of `zod` by name, across `import`, `import type` and the
     * inline `{ type X }` form. Aliases count as the original name: `ZodTypeAny as ZodType`
     * still ships the deprecated shim.
     */
    const importedZodNames = (content: string): string[] =>
        [...content.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+'zod'/g)].flatMap(match =>
            (match[1] ?? '')
                .split(',')
                .map(entry => entry.replace(/\s+/g, ' ').trim())
                .map(entry => (entry.startsWith('type ') ? entry.slice('type '.length) : entry))
                .map(entry => entry.split(' as ')[0] ?? entry)
        );

    it.each(DEPRECATED_COMPAT_EXPORTS)('should not reach for the deprecated %s shim', name => {
        const memberAccess = new RegExp(`\\bz\\.${name}\\b`);

        const offenders = sourceFiles
            .filter(file => {
                const content = readFileSync(file, 'utf8');
                return memberAccess.test(content) || importedZodNames(content).includes(name);
            })
            .map(file => file.slice(srcDir.length + 1));

        expect(offenders).toEqual([]);
    });

    it('should collect the sources it is asserting on', () => {
        // Guards the guard: an empty file list would make every assertion above vacuous
        expect(sourceFiles.length).toBeGreaterThan(100);
        expect(sourceFiles.some(file => file.includes('validators'))).toBe(true);
    });
});
