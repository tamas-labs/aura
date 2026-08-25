import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import ts from 'typescript';

/**
 * Documentation-coverage guard.
 *
 * The 2026-08-12 audit checked by hand that every config key and every prop appears in
 * both full READMEs, and found the surface complete. That completeness was held up by
 * discipline alone: nothing failed when a new key skipped the docs. This test turns the
 * one-off check into a gate — `npm run quality` runs it, so a config key added without
 * its documentation fails locally before it reaches a release.
 *
 * The rule differs per surface, because the three are documented in different shapes:
 * - config keys and props get a section of their own (a `##### \`key\`` heading) or a row
 *   in the config table, so a reader browsing the reference can find them;
 * - label keys are listed inline in the `labels` chapter, so a backticked mention is the
 *   right bar — plus the "(N)" count stated there must match reality.
 *
 * `README.md` is deliberately out of scope: it is the short npm-facing overview and does
 * not enumerate the config surface.
 */
describe('documentation coverage', () => {
    const root = resolve(__dirname, '../..');

    /** The two full reference READMEs, which must document the same surface. */
    const FULL_READMES = ['README.en.md', 'README.hu.md'] as const;

    /**
     * The property names declared directly on an interface.
     *
     * Parsed with the TypeScript AST rather than a regex: the type files carry JSDoc
     * blocks, nested object literals and union types, all of which a line-based match
     * would either miss or misread.
     */
    const interfaceMembers = (file: string, interfaceName: string): string[] => {
        const path = resolve(root, file);
        const source = ts.createSourceFile(
            path,
            readFileSync(path, 'utf8'),
            ts.ScriptTarget.Latest,
            true
        );
        const names: string[] = [];

        const visit = (node: ts.Node): void => {
            if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
                for (const member of node.members) {
                    if (ts.isPropertySignature(member) && ts.isIdentifier(member.name)) {
                        names.push(member.name.text);
                    }
                }
            }
            ts.forEachChild(node, visit);
        };
        visit(source);

        return names;
    };

    const readme = (file: string): string => readFileSync(resolve(root, file), 'utf8');

    /**
     * Keys that have a documentation anchor of their own: either a markdown heading
     * (`##### \`storeId\``) or a leading cell in the config table (`| \`storeId\` |`).
     */
    const anchoredKeys = (doc: string): Set<string> => {
        const headings = [...doc.matchAll(/^#{2,6}\s+`([A-Za-z0-9_.]+)`/gm)];
        const tableRows = [...doc.matchAll(/^\|\s*`([A-Za-z0-9_.]+)`\s*\|/gm)];

        return new Set([...headings, ...tableRows].map(match => match[1] as string));
    };

    const configKeys = interfaceMembers('src/types/config.types.ts', 'AuraConfig');
    const propKeys = interfaceMembers('src/types/props.types.ts', 'AuraProps');
    const labelKeys = interfaceMembers('src/types/config.types.ts', 'AuraLabels');

    // Guards the guard: a parser that silently returned nothing would make every
    // assertion below vacuously true.
    it('should extract the three documented surfaces', () => {
        expect(configKeys.length).toBeGreaterThan(40);
        expect(propKeys.length).toBeGreaterThan(20);
        expect(labelKeys.length).toBeGreaterThan(30);
        expect(configKeys).toContain('storeId');
        expect(propKeys).toContain('storeId');
        expect(labelKeys).toContain('emptyState');
    });

    /**
     * Audit 2026-08-19 H2.
     *
     * Measuring the validator → state coupling turned up something the coupling's
     * *consumers* see: Pinia was listed among the packages to install, but no README
     * ever registered it. A reader following the setup verbatim got a table that
     * renders nothing and Pinia's own `getActivePinia()` error, which never names
     * Aura. All three READMEs — the npm landing page included, since that is where a
     * first-time consumer starts — must show the registration.
     */
    it.each(['README.md', ...FULL_READMES])('%s should register Pinia in its setup', file => {
        expect(readme(file)).toContain('app.use(createPinia())');
    });

    describe.each(FULL_READMES)('%s', file => {
        it('should give every config key a section or table row', () => {
            const anchored = anchoredKeys(readme(file));

            expect(configKeys.filter(key => !anchored.has(key))).toEqual([]);
        });

        it('should give every prop a section or table row', () => {
            const anchored = anchoredKeys(readme(file));

            expect(propKeys.filter(key => !anchored.has(key))).toEqual([]);
        });

        it('should mention every label key', () => {
            const doc = readme(file);

            expect(labelKeys.filter(key => !doc.includes(`\`${key}\``))).toEqual([]);
        });

        // The label chapter states the number of keys in prose. A new label that gets
        // added to the list but not to the count leaves the docs quietly wrong.
        it('should state the correct label count', () => {
            const doc = readme(file);
            const stated = [...doc.matchAll(/\((\d+)\):\*\*\s*`confirmDeleteTitle`/g)];

            expect(stated).toHaveLength(1);
            expect(Number(stated[0]?.[1])).toBe(labelKeys.length);
        });
    });
});
