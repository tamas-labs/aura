import { z } from 'zod';

/**
 * PaginateValues Zod Schema
 * - Accepts an array of numbers (the page-size options offered in the toolbar)
 * - Allows nullable values
 * - Every element must be between 1 and 1000
 *
 * The element bounds match `NumberZod`: the array feeds the page-size selector, so a
 * `0` entry would render an unusable option and an unbounded one would defeat
 * pagination. The length is not constrained here.
 *
 * @example
 * ```ts
 * PaginateValuesZod.parse([5, 10, 25, 50]); // [5, 10, 25, 50]
 * PaginateValuesZod.parse(null);            // null
 * PaginateValuesZod.parse([0, 5000]);       // throws (element out of range)
 * ```
 */
export const PaginateValuesZod = z.array(z.number().min(1).max(1000)).nullable();
