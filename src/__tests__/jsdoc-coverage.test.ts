import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import ts from 'typescript';

/**
 * JSDoc-coverage guard.
 *
 * The 2026-08-19 audit measured 96,3 % JSDoc coverage over the exported surface and
 * listed the stragglers by hand (audit Q6). Filling them in is a one-off; keeping them
 * filled in is what this test is for — the same move the `docs-coverage` guard made for
 * the READMEs, applied to the source comments.
 *
 * The bar is deliberately low: **a JSDoc block with any text or tag in it**. This is a
 * presence check, not a quality check — it cannot tell a useful sentence from a restated
 * identifier, and it is not meant to. What it does catch is the failure mode the audit
 * actually found: a new export shipping with no explanation at all, and a doc block that
 * looks attached but is not (`AuraProps` carried a full JSDoc that TypeScript ignored,
 * because a stray `} /**` on one line made it a trailing comment of the interface above).
 *
 * Scope is `src/`, excluding tests. Re-export statements (`export { … } from …`) are not
 * checked: the barrels are made of them, and the documentation belongs on the
 * declaration, not on every path that forwards it.
 */
describe('JSDoc coverage', () => {
    const srcDir = resolve(__dirname, '..');

    /** Every non-test `.ts`/`.tsx` source file below `dir`. */
    const collectSourceFiles = (dir: string): string[] =>
        readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
            const full = resolve(dir, entry.name);
            if (entry.isDirectory()) {
                return entry.name === '__tests__' ? [] : collectSourceFiles(full);
            }
            if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) return [];
            return [full];
        });

    /** True when the node carries a JSDoc block that says something. */
    const hasJSDoc = (node: ts.Node): boolean =>
        ts
            .getJSDocCommentsAndTags(node)
            .filter(ts.isJSDoc)
            .some(doc => {
                const comment = typeof doc.comment === 'string' ? doc.comment.trim() : doc.comment;
                return Boolean(comment?.length) || Boolean(doc.tags?.length);
            });

    /** `true` when the declaration carries the `export` keyword. */
    const isExported = (node: ts.Node): boolean =>
        ts.canHaveModifiers(node) &&
        (ts.getModifiers(node) ?? []).some(mod => mod.kind === ts.SyntaxKind.ExportKeyword);

    interface ExportedDeclaration {
        node: ts.Node;
        name: string;
    }

    /** The named, exported declarations of one source file, re-exports excluded. */
    const exportedDeclarations = (source: ts.SourceFile): ExportedDeclaration[] => {
        const found: ExportedDeclaration[] = [];

        const visit = (node: ts.Node): void => {
            if (isExported(node)) {
                if (ts.isVariableStatement(node)) {
                    for (const declaration of node.declarationList.declarations) {
                        found.push({ node, name: declaration.name.getText(source) });
                    }
                } else if ('name' in node && node.name) {
                    found.push({ node, name: (node.name as ts.Node).getText(source) });
                }
            }
            ts.forEachChild(node, visit);
        };
        visit(source);

        return found;
    };

    /** `file:line  name` for every exported declaration without a JSDoc block. */
    const undocumentedExports = (): { total: number; missing: string[] } => {
        const missing: string[] = [];
        let total = 0;

        for (const file of collectSourceFiles(srcDir)) {
            const source = ts.createSourceFile(
                file,
                readFileSync(file, 'utf8'),
                ts.ScriptTarget.Latest,
                true
            );

            for (const { node, name } of exportedDeclarations(source)) {
                total++;
                if (hasJSDoc(node)) continue;
                const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
                missing.push(`${file.slice(srcDir.length + 1)}:${line + 1}  ${name}`);
            }
        }

        return { total, missing: missing.sort() };
    };

    it('should document every exported symbol under src/', () => {
        expect(undocumentedExports().missing).toEqual([]);
    });

    it('should collect the exports it is asserting on', () => {
        // Guards the guard: a broken collector would make the assertion above vacuous
        expect(undocumentedExports().total).toBeGreaterThan(400);
    });
});
