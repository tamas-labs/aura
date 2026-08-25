import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import ts from 'typescript';

/**
 * Prototype-safe registry-lookup guard.
 *
 * The 2026-08-19 audit (5.1, 5.2) found the same defect in three separate registries: a
 * response-sourced key read out of a plain object with bracket access, so `'constructor'`
 * answered with the `Object` constructor and `'__proto__'` with `Object.prototype` — both
 * truthy, both surviving the caller's `if (entry)` check, and both then used as if they
 * were real entries. The consequences ranged from a thrown `TypeError` in the Vue render
 * phase to a validator dispatch handing back *unvalidated* response config.
 *
 * Fixing those three call sites was the audit's Q1/Q2. This test is K1, and the audit
 * argued it is the more important half: Q1 fixes a bug, K1 keeps the *next* registry from
 * being written the same way. It joins the guard family — `layer-boundaries`,
 * `public-api`, `docs-coverage`, `jsdoc-coverage` — and, like `error-sink.test.ts`, it
 * exists so a rule stops depending on distant files each remembering it.
 *
 * ## The rule
 *
 * A **read** of the form `object[key]`, where the type checker says `key` is `string`
 * (or `any`), must carry one of two proofs inside the same top-level declaration:
 *
 * 1. **Routed through the tool** — a `hasSafeOwnKey(object, key)` call on the same
 *    object and key expression. `readOwnEntry` needs no separate case: it *is* such a
 *    call, so a read that goes through it never reaches the scan in the first place.
 * 2. **Enumerated from the same object** — `key` is bound by an `Object.keys(object)` /
 *    `Object.entries(object)` walk of the very object being indexed. Own-ness is then a
 *    property of where the key came from, and a guard would be noise.
 *
 * ## What is deliberately out of scope
 *
 * - **Keys the compiler has already narrowed.** `Record<ErrorSeverity, string>` indexed
 *   by an `ErrorSeverity` cannot receive `'constructor'`; the type system is the proof.
 *   Only a key that widens to `string` is a key the response can steer. This is why the
 *   scan needs a full `ts.Program` rather than a bare `createSourceFile` — and why an
 *   `as keyof typeof X` cast on a `Record<string, …>` is worse than no cast at all, since
 *   it launders a literal union back into `string`.
 * - **Writes and `delete`.** `obj[key] = value` is the other half of the same class, but
 *   its remedy is different (`createNullObject`, plus `isForbiddenProtoKey` filtering on
 *   the way in), and `delete` only ever touches own properties. One rule, one remedy.
 * - **Array indexing**, which the `string` key requirement excludes on its own.
 *
 * The scope of a proof is the enclosing top-level declaration, not the enclosing
 * function: the guarding call and the indexing almost always sit in a callback of the
 * same exported function. That makes the check an approximation rather than a soundness
 * proof — it cannot see through a helper that returns a null-prototype object, and it
 * would accept a guard that happens to name the same identifiers in a sibling closure.
 * Presence, not proof: enough to make a new unguarded registry impossible to land by
 * accident.
 */
describe('registry lookups', () => {
    const projectRoot = resolve(__dirname, '../..');
    const srcDir = resolve(projectRoot, 'src');

    /** The whole plugin as one type-checked program — the key types are the point. */
    const createProgram = (): ts.Program => {
        const configPath = ts.findConfigFile(projectRoot, ts.sys.fileExists, 'tsconfig.json');
        if (!configPath) throw new Error('tsconfig.json not found');

        const config = ts.readConfigFile(configPath, ts.sys.readFile);
        const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, projectRoot);

        return ts.createProgram(parsed.fileNames, parsed.options);
    };

    /** Source text of a node, whitespace-collapsed and stripped of wrapping parens. */
    const normalize = (node: ts.Node, source: ts.SourceFile): string => {
        let text = node.getText(source).trim();
        while (text.startsWith('(') && text.endsWith(')')) text = text.slice(1, -1).trim();
        return text.replace(/\s+/g, ' ');
    };

    /** The declaration this node sits in, i.e. the scope a proof has to share with it. */
    const topLevelDeclaration = (node: ts.Node): ts.Node => {
        let current = node;
        while (current.parent && !ts.isSourceFile(current.parent)) current = current.parent;
        return current;
    };

    /** For `Object.keys(x)` / `Object.entries(x)`, the text of `x`; otherwise `null`. */
    const enumeratedObject = (node: ts.Node, source: ts.SourceFile): string | null => {
        if (!ts.isCallExpression(node)) return null;

        const callee = node.expression;
        const [argument, ...rest] = node.arguments;
        if (!argument || rest.length > 0) return null;
        if (!ts.isPropertyAccessExpression(callee)) return null;
        if (callee.expression.getText(source) !== 'Object') return null;
        if (callee.name.text !== 'keys' && callee.name.text !== 'entries') return null;

        return normalize(argument, source);
    };

    /** The first name bound by a callback parameter — `k` in both `k =>` and `([k]) =>`. */
    const firstBoundName = (parameter: ts.BindingName): string | null => {
        if (ts.isIdentifier(parameter)) return parameter.text;
        if (!ts.isArrayBindingPattern(parameter)) return null;

        const [first] = parameter.elements;
        if (!first || !ts.isBindingElement(first) || !ts.isIdentifier(first.name)) return null;
        return first.name.text;
    };

    interface Proofs {
        /** `"<object> <key>"` pairs a `hasSafeOwnKey` call vouches for. */
        guarded: Set<string>;
        /** Key identifier → the object its own keys were enumerated from. */
        enumeratedKeys: Map<string, string>;
    }

    /** Records a `hasSafeOwnKey(object, key)` call. */
    const collectGuard = (node: ts.Node, source: ts.SourceFile, proofs: Proofs): void => {
        if (!ts.isCallExpression(node)) return;
        if (node.expression.getText(source) !== 'hasSafeOwnKey') return;

        const [record, key, ...rest] = node.arguments;
        if (!record || !key || rest.length > 0) return;

        proofs.guarded.add(`${normalize(record, source)} ${normalize(key, source)}`);
    };

    /**
     * Records key bindings from `for (const k of Object.keys(x))` and
     * `Object.keys(x).forEach(k => …)`, including the one-hop
     * `const keys = Object.keys(x); for (const k of keys)` spelling.
     */
    const collectEnumeration = (
        node: ts.Node,
        source: ts.SourceFile,
        proofs: Proofs,
        enumVars: Map<string, string>
    ): void => {
        const objectOf = (expression: ts.Expression): string | undefined =>
            enumeratedObject(expression, source) ??
            (ts.isIdentifier(expression) ? enumVars.get(expression.text) : undefined);

        if (ts.isVariableDeclaration(node) && node.initializer && ts.isIdentifier(node.name)) {
            const object = enumeratedObject(node.initializer, source);
            if (object) enumVars.set(node.name.text, object);
            return;
        }

        if (ts.isForOfStatement(node) && ts.isVariableDeclarationList(node.initializer)) {
            const object = objectOf(node.expression);
            const [declaration] = node.initializer.declarations;
            const name = declaration && firstBoundName(declaration.name);
            if (object && name) proofs.enumeratedKeys.set(name, object);
            return;
        }

        if (!ts.isCallExpression(node) || !ts.isPropertyAccessExpression(node.expression)) return;
        if (node.expression.name.text !== 'forEach') return;

        const [callback] = node.arguments;
        if (!callback || !(ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))) {
            return;
        }

        const [parameter] = callback.parameters;
        if (!parameter) return;

        const object = objectOf(node.expression.expression);
        const name = firstBoundName(parameter.name);
        if (object && name) proofs.enumeratedKeys.set(name, object);
    };

    /** Every proof available to the reads inside one top-level declaration. */
    const collectProofs = (declaration: ts.Node, source: ts.SourceFile): Proofs => {
        const proofs: Proofs = { guarded: new Set(), enumeratedKeys: new Map() };
        const enumVars = new Map<string, string>();

        const walk = (node: ts.Node): void => {
            collectGuard(node, source, proofs);
            collectEnumeration(node, source, proofs, enumVars);
            ts.forEachChild(node, walk);
        };
        walk(declaration);

        return proofs;
    };

    /** `obj[key] = value` — the write half, which has its own remedy. */
    const isAssignmentTarget = (node: ts.ElementAccessExpression): boolean =>
        ts.isBinaryExpression(node.parent) &&
        node.parent.left === node &&
        node.parent.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
        node.parent.operatorToken.kind <= ts.SyntaxKind.LastAssignment;

    /** True when the key widens to `string` (or `any`) — the keys a response can steer. */
    const hasDynamicStringKey = (
        node: ts.ElementAccessExpression,
        checker: ts.TypeChecker
    ): boolean => {
        const { flags } = checker.getTypeAtLocation(node.argumentExpression);
        return (flags & ts.TypeFlags.String) !== 0 || (flags & ts.TypeFlags.Any) !== 0;
    };

    /** Reads in scope of the rule: dynamic string key, not a write, not a `delete`. */
    const isCheckedRead = (
        node: ts.Node,
        checker: ts.TypeChecker
    ): node is ts.ElementAccessExpression =>
        ts.isElementAccessExpression(node) &&
        !isAssignmentTarget(node) &&
        !ts.isDeleteExpression(node.parent) &&
        hasDynamicStringKey(node, checker);

    /** Which of the two proofs covers a read — or `null` when neither does. */
    type Proof = 'guard' | 'enumeration' | null;

    interface Lookup {
        /** `path/to/file.ts:12  registry[key]` */
        location: string;
        proof: Proof;
    }

    /** Every checked read of one source file, each marked with whether a proof covers it. */
    const lookupsIn = (source: ts.SourceFile, checker: ts.TypeChecker): Lookup[] => {
        const lookups: Lookup[] = [];
        const proofCache = new Map<ts.Node, Proofs>();

        const proofsFor = (node: ts.Node): Proofs => {
            const declaration = topLevelDeclaration(node);
            const cached = proofCache.get(declaration);
            if (cached) return cached;

            const proofs = collectProofs(declaration, source);
            proofCache.set(declaration, proofs);
            return proofs;
        };

        const walk = (node: ts.Node): void => {
            if (isCheckedRead(node, checker)) {
                const { guarded, enumeratedKeys } = proofsFor(node);
                const object = normalize(node.expression, source);
                const key = node.argumentExpression;
                const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));

                let proof: Proof = null;
                if (guarded.has(`${object} ${normalize(key, source)}`)) proof = 'guard';
                else if (ts.isIdentifier(key) && enumeratedKeys.get(key.text) === object)
                    proof = 'enumeration';

                lookups.push({
                    location: `${source.fileName.slice(srcDir.length + 1)}:${line + 1}  ${normalize(node, source)}`,
                    proof,
                });
            }
            ts.forEachChild(node, walk);
        };
        ts.forEachChild(source, walk);

        return lookups;
    };

    /** Every checked read under `src/`, tests excluded. */
    const collectLookups = (): Lookup[] => {
        const program = createProgram();
        const checker = program.getTypeChecker();

        return program
            .getSourceFiles()
            .filter(
                source =>
                    source.fileName.startsWith(`${srcDir}/`) &&
                    !/__tests__|\.test\./.test(source.fileName)
            )
            .flatMap(source => lookupsIn(source, checker));
    };

    const lookups = collectLookups();

    it('should prove every dynamic string-keyed read prototype-safe', () => {
        const offenders = lookups.filter(lookup => !lookup.proof).map(lookup => lookup.location);

        expect(offenders).toEqual([]);
    });

    it.each(['guard', 'enumeration'])('should still recognise the %s proof', kind => {
        // Guards the guard: a scan that stopped recognising a proof shape would keep
        // reporting an empty offender list right up until it stopped seeing the reads too
        expect(lookups.filter(lookup => lookup.proof === kind).length).toBeGreaterThan(4);
    });
});
