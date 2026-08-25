import type { ApiResponse, Body, ColumnConfig } from '../../../../types/api-response.types';
import { getErrorSink } from '../../../utils/error-sink';
import { createNullObject, readOwnEntry } from '../../../../utils/safe-object.util';
import { BodyZod } from '../../../zod/response/body/body.zod';
import { validateStaticConfig } from './static-config.schema';
import { validateIconConfig } from './icon-config.schema';
import { validateModalConfig } from './modal-config.schema';
import { validateLinkConfig } from './link-config.schema';
import { validateReferenceConfig } from './reference-config.schema';
import { validateButtonConfig } from './button-config.schema';
import { validateBadgeConfig } from './badge-config.schema';
import { validateProgressConfig } from './progress-config.schema';
import { validateCustomConfig } from './custom-config.schema';

const UNKNOWN_TYPE_MESSAGE = 'Unknown columnConfig type, skipping entry';

/** The uniform signature of the function validating a single columnConfigs entry. */
type ColumnConfigValidator = (
    config: Record<string, unknown>,
    errorStoreId: string,
    configKey: string
) => ColumnConfig;

/**
 * Type → validator dispatch table for body.columnConfigs entries.
 * Adding a new column type = one line here (not another if/else branch).
 */
const CONFIG_VALIDATORS: Record<string, ColumnConfigValidator> = {
    static: validateStaticConfig,
    icon: validateIconConfig,
    modal: validateModalConfig,
    link: validateLinkConfig,
    reference: validateReferenceConfig,
    button: validateButtonConfig,
    badge: validateBadgeConfig,
    progress: validateProgressConfig,
    custom: validateCustomConfig,
};

/** The supported types listed in the error message (derived from the dispatch table). */
const SUPPORTED_TYPES = Object.keys(CONFIG_VALIDATORS)
    .map(type => `'${type}'`)
    .join(', ');

/**
 * Body Schema Validator
 *
 * Validates the body object, if it exists.
 * Body is optional in the API response.
 *
 * Behavior:
 * 1. If there is no body key in the API response → return undefined (valid, no error)
 * 2. If there is → validate the base structure with BodyZod
 * 3. Type-dispatch validation of columnConfigs entries:
 *    - type === 'static' → validateStaticConfig
 *    - type === 'icon' → validateIconConfig
 *    - type === 'modal' → validateModalConfig
 *    - type === 'link' → validateLinkConfig
 *    - type === 'reference' → validateReferenceConfig
 *    - type === 'button' → validateButtonConfig
 *    - type === 'badge' → validateBadgeConfig
 *    - unknown type → addSchemaValidationError warning, entry skipped (does NOT throw)
 * 4. columnStyles — pass-through; rowRules — validated with RowRulesZod
 * 5. settings — already validated by BodyZod
 *
 * @param value - The full API response object
 * @param errorStoreId - Error handler store identifier
 * @param key - Validation key (e.g. 'response.body')
 *
 * @returns {Body | undefined} Validated Body object, or undefined if body is missing
 *
 * @throws Error - If BodyZod validation fails (not an object type, etc.)
 *
 * @example
 * ```typescript
 * // Response without body — returns undefined, no error
 * validateBody({ header: {...} }, 'store-id', 'response.body');
 * // => undefined
 *
 * // Body with a static columnConfig — validated Body
 * validateBody(
 *   { body: { columnConfigs: { idPrefix: { type: 'static', value: 'ID:' } } } },
 *   'store-id',
 *   'response.body'
 * );
 * // => { columnConfigs: { idPrefix: { type: 'static', value: 'ID:' } } }
 *
 * // Unknown type — warning, entry skipped
 * validateBody(
 *   { body: { columnConfigs: { x: { type: 'unknown' } } } },
 *   'store-id',
 *   'response.body'
 * );
 * // => { columnConfigs: {} }  + addSchemaValidationError called
 * ```
 */
export const validateBody = (
    value: ApiResponse,
    errorStoreId: string,
    key: string
): Body | undefined => {
    if (value.body === undefined) {
        return undefined;
    }

    const errorStore = getErrorSink(errorStoreId);

    let bodyObj: Record<string, unknown>;

    try {
        bodyObj = BodyZod.parse(value.body) as Record<string, unknown>;
    } catch (error) {
        errorStore.addSchemaValidationError(
            'BodyValidator',
            'Invalid body structure in API response',
            key,
            value.body,
            error instanceof Error ? error.message : 'Unknown validation error'
        );

        throw new Error(
            `Body validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }

    // Type-dispatch validation of columnConfigs
    const rawColumnConfigs = bodyObj.columnConfigs as
        | Record<string, Record<string, unknown>>
        | null
        | undefined;

    let validatedColumnConfigs: Record<string, ColumnConfig> | null | undefined;

    if (rawColumnConfigs === null) {
        validatedColumnConfigs = null;
    } else if (rawColumnConfigs === undefined) {
        validatedColumnConfigs = undefined;
    } else {
        // Null-prototype: `configKey` comes from the response, and `result['__proto__'] = …`
        // on an `{}` literal retargets the object's prototype instead of storing an entry.
        // `BodyZod` drops that key from records today, so this is what keeps the guarantee
        // the dispatch's own rather than borrowed from the layer above it.
        const result = createNullObject<ColumnConfig>();

        Object.entries(rawColumnConfigs).forEach(([configKey, configValue]) => {
            const configType = configValue?.type;
            // `configType` is response data: a raw `CONFIG_VALIDATORS[configType]` lookup
            // answers `'constructor'` with `Object` — a callable that would pass the
            // `if (validator)` check and hand the *unvalidated* config straight back,
            // bypassing the key-stripping this dispatch exists for.
            const validator =
                typeof configType === 'string'
                    ? readOwnEntry(CONFIG_VALIDATORS, configType)
                    : undefined;

            if (validator) {
                try {
                    result[configKey] = validator(
                        configValue,
                        errorStoreId,
                        `${key}.columnConfigs.${configKey}`
                    );
                } catch {
                    // The validator already added the error to the error store; the entry is skipped
                }
            } else {
                // Unknown type — warning, but does NOT throw (the rest of the body can remain valid)
                errorStore.addSchemaValidationError(
                    'BodyValidator',
                    UNKNOWN_TYPE_MESSAGE,
                    `${key}.columnConfigs.${configKey}`,
                    configValue,
                    `Received type: '${String(configType)}'. Supported types: ${SUPPORTED_TYPES}`
                );
            }
        });

        validatedColumnConfigs = result;
    }

    return {
        columnConfigs: validatedColumnConfigs,
        columnStyles: bodyObj.columnStyles as Body['columnStyles'],
        settings: bodyObj.settings as Body['settings'],
        rowRules: bodyObj.rowRules as Body['rowRules'],
    } as Body;
};
