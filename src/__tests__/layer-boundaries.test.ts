import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Layer-direction guard.
 *
 * `features/` is the UI layer and sits on top of everything else: it may import from
 * `state/`, `utils/`, `lib/`, `validators/` and `types/`. The reverse direction is a layer
 * inversion — audit 2026-07-29 (2.4) flagged one such import (`use-response-data.ts` pulling
 * `preprocessResponse` out of `features/table/utils`), and a second one appeared later with
 * the session-persistence composable. Both were resolved by moving the modules into the
 * neutral `utils/` layer; this test keeps the direction from silently flipping back.
 *
 * The sibling guard for the `validators/ → state/` seam lives in
 * `validators/utils/__tests__/error-sink.test.ts`.
 */
describe('layer boundaries', () => {
    const srcDir = resolve(__dirname, '..');

    /** Every non-test `.ts`/`.tsx` source file below `dir`. */
    const collectSourceFiles = (dir: string): string[] => {
        const entries = readdirSync(dir, { withFileTypes: true });
        return entries.flatMap(entry => {
            const full = resolve(dir, entry.name);
            if (entry.isDirectory()) {
                return entry.name === '__tests__' ? [] : collectSourceFiles(full);
            }
            return entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') ? [full] : [];
        });
    };

    /** Layers that must never reach up into the UI layer. */
    const lowerLayers = ['state', 'utils', 'lib', 'validators', 'types'];

    it.each(lowerLayers)('should not import from features/ in %s/', layer => {
        const offenders = collectSourceFiles(resolve(srcDir, layer))
            .filter(file => /from '[^']*features\//.test(readFileSync(file, 'utf8')))
            .map(file => file.slice(srcDir.length + 1));

        expect(offenders).toEqual([]);
    });

    it('should collect the sources it is asserting on', () => {
        // Guards the guard: an empty file list would make the assertions above vacuous
        for (const layer of lowerLayers) {
            expect(collectSourceFiles(resolve(srcDir, layer)).length).toBeGreaterThan(0);
        }
        expect(collectSourceFiles(resolve(srcDir, 'state')).length).toBeGreaterThan(10);
    });
});
