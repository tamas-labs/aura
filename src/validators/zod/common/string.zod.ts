import { z } from 'zod';
import { htmlSanitizer } from '../../sanitizers';
import { cacheSchemaByArgs } from '../utils/schema-cache';

/** Builds the schema for one `(min, max)` pair — always go through `StringZod`. */
const buildStringZod = (min: number, max: number) =>
    z.string().min(min).max(max).transform(htmlSanitizer).nullable();

/** The cached builder — one schema instance per distinct `(min, max)` pair. */
const cachedStringZod = cacheSchemaByArgs(buildStringZod);

/**
 * String Zod schema factory
 * - Validates string values against a configurable length range
 * - Applies HTML sanitization (`htmlSanitizer` strips every tag and attribute)
 * - Supports nullable values (`null` bypasses both the length check and the sanitizer)
 * - `undefined` and non-string types are rejected
 *
 * Note: the length range is checked on the **raw** input, before sanitization,
 * because Zod runs a schema's checks ahead of its `transform`. A value whose
 * character count only exceeds `max` because of its markup is therefore rejected,
 * and one that only reaches `min` because of its markup is accepted.
 *
 * The schema is **cached per `(min, max)` pair** (`cacheSchemaByArgs`): building it
 * costs an order of magnitude more than parsing with it, and the header-cell schema
 * calls this factory several times per column on every response. Zod schemas are
 * immutable, so the shared instance is safe — the defaults are normalized before the
 * lookup, hence `StringZod()` and `StringZod(1, 250)` return the same instance.
 *
 * @param min - Minimum character count (default: 1, so an empty string is rejected)
 * @param max - Maximum character count (default: 250)
 * @returns Zod schema parsing to a sanitized string or `null`
 *
 * @example
 * ```ts
 * StringZod().parse('Hello World'); // 'Hello World'
 * StringZod().parse('<b>Hello</b>'); // 'Hello' (tags stripped)
 * StringZod().parse(null); // null
 * StringZod(0).parse(''); // '' (empty string allowed with min=0)
 * StringZod().parse(''); // throws (min=1)
 * StringZod(1, 5).parse('<b>hello</b>'); // throws (12 raw characters, not 5)
 * ```
 */
export const StringZod = (min = 1, max = 250) => cachedStringZod(min, max);
