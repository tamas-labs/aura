/**
 * Text normalization helpers for search comparison.
 *
 * Both the column search (`filterItemsBySearch`), the global search and the
 * match highlighting compare through {@link foldSearchText}, so the three stay
 * in agreement about what counts as equal.
 */

/**
 * Combining marks (Unicode general category `M`).
 *
 * `normalize('NFD')` splits a precomposed letter into its base letter plus the
 * marks that decorate it — `ő` becomes `o` + U+030B — so removing every mark
 * leaves the bare base letter behind.
 */
const COMBINING_MARKS = /\p{M}/gu;

/**
 * Strips the diacritics from a string.
 *
 * @param input - The string to fold.
 * @returns The string with every combining mark removed (`árvíztűrő` → `arvizturo`).
 *
 * @example
 * ```typescript
 * foldAccents('Ångström'); // 'Angstrom'
 * ```
 */
export const foldAccents = (input: string): string =>
    input.normalize('NFD').replace(COMBINING_MARKS, '');

/**
 * Produces the comparable form of a string for searching.
 *
 * Lower-casing is unconditional (search has always been case-insensitive);
 * accent folding is opt-in via the `accentInsensitiveSearch` config key, because
 * turning it on changes which rows match and that must stay a deliberate choice.
 *
 * @param input - The string to convert.
 * @param accentInsensitive - Whether diacritics should be ignored as well.
 * @returns The comparable form.
 *
 * @example
 * ```typescript
 * foldSearchText('Árvíztűrő', false); // 'árvíztűrő'
 * foldSearchText('Árvíztűrő', true);  // 'arvizturo'
 * ```
 */
export const foldSearchText = (input: string, accentInsensitive: boolean): string =>
    (accentInsensitive ? foldAccents(input) : input).toLowerCase();
