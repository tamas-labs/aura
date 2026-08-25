import { z } from 'zod';

/**
 * Text Utility Zod Schema
 * - Validates Bootstrap text utility classes
 * - Must start with 'text-'
 * - Nullable: yes
 *
 * @example
 * ```ts
 * TextUtilityZod.parse('text-center'); // success
 * TextUtilityZod.parse('text-primary'); // success
 * TextUtilityZod.parse('bg-primary'); // error
 * ```
 */
export const TextUtilityZod = z
    .string()
    .regex(/^text-.+$/, {
        message: "Must be a valid Bootstrap text utility class (starting with 'text-')",
    })
    .nullable();
