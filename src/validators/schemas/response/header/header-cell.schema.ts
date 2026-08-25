import type { ZodType } from 'zod';
import { z } from 'zod';
import { validateString } from '../../common/string.schema';
import { getErrorSink } from '../../../utils/error-sink';
import { hasSafeOwnKey, readOwnEntry } from '../../../../utils/safe-object.util';
import {
    ColspanZod,
    RowspanZod,
    WidthZod,
    PadZod,
    CharsZod,
    ReferenceZod,
    AlignZod,
    SizeZod,
    ColorZod,
    BackgroundZod,
    FontSizeZod,
    FontWeightZod,
    LineHeightZod,
    TextUtilityZod,
    SliceZod,
    FieldsZod,
    StyleZod,
    CellTypeZod,
    CellClassZod,
    DataAttributeValueZod,
    isDataAttribute,
    ElementsZod,
    ShowZod,
} from '../../../zod/response/header';
import { BooleanZod } from '../../../zod/common/boolean.zod';
import { UnitIdentifierZod } from '../../../zod/common/unit-identifier.zod';

const NON_EMPTY_STRING_NOTE = 'Must be a non-empty string';
const BOOLEAN_ERROR_MSG = 'Must be boolean';
const PADDING_ERROR_MSG = 'Must be integer between 0-100';

/**
 * Validates a mandatory string field.
 *
 * Checks if the field exists in the cell object.
 * If missing, adds an error to the store and throws an exception.
 * If present, validates it using validateString.
 */
const validateRequiredStringField = (
    cell: Record<string, unknown>,
    fieldName: string,
    errorStoreId: string,
    errorStore: ReturnType<typeof getErrorSink>,
    baseKey: string,
    rowIndex: number,
    cellIndex: number
): void => {
    // Own-key check on purpose: `cell` is response data, so `in` would also answer for
    // anything inherited from `Object.prototype`.
    if (!hasSafeOwnKey(cell, fieldName)) {
        errorStore.addSchemaValidationError(
            'HeaderCellValidator',
            `Required field '${fieldName}' is missing`,
            `${baseKey}.${fieldName}`,
            cell,
            `Field '${fieldName}' is mandatory for header cells`,
            { note: NON_EMPTY_STRING_NOTE }
        );
        throw new Error(
            `Header cell validation failed: Missing '${fieldName}' at row ${rowIndex}, cell ${cellIndex}`
        );
    }

    validateString(readOwnEntry(cell, fieldName), errorStoreId, `${baseKey}.${fieldName}`, 1);
};

/**
 * Validates an optional field using a Zod schema.
 *
 * If the field exists and is not null/undefined, it validates the value against the provided Zod schema.
 * If validation fails, adds an error to the store and throws an exception.
 */
const validateOptionalZodField = (
    cell: Record<string, unknown>,
    fieldName: string,
    zodSchema: ZodType,
    errorMessage: string,
    errorStore: ReturnType<typeof getErrorSink>,
    baseKey: string,
    rowIndex: number,
    cellIndex: number
): void => {
    const fieldValue = readOwnEntry(cell, fieldName);

    if (fieldValue !== undefined && fieldValue !== null) {
        try {
            zodSchema.parse(fieldValue);
        } catch (error) {
            errorStore.addSchemaValidationError(
                'HeaderCellValidator',
                `Invalid '${fieldName}' value`,
                `${baseKey}.${fieldName}`,
                fieldValue,
                error instanceof Error ? error.message : errorMessage
            );
            throw new Error(
                `Header cell validation failed: Invalid '${fieldName}' at row ${rowIndex}, cell ${cellIndex}`
            );
        }
    }
};

interface OptionalFieldConfig {
    field: string;
    schema: ZodType;
    errorMessage: string;
}

const OPTIONAL_FIELDS_CONFIG: OptionalFieldConfig[] = [
    { field: 'colspan', schema: ColspanZod, errorMessage: 'Must be integer between 1-50' },

    { field: 'rowspan', schema: RowspanZod, errorMessage: 'Must be integer between 1-20' },
    { field: 'width', schema: WidthZod, errorMessage: "Must be {number}px|%|rem or 'auto'" },
    { field: 'resizable', schema: BooleanZod, errorMessage: BOOLEAN_ERROR_MSG },
    { field: 'pad', schema: PadZod, errorMessage: PADDING_ERROR_MSG },
    { field: 'padStart', schema: PadZod, errorMessage: PADDING_ERROR_MSG },
    { field: 'padEnd', schema: PadZod, errorMessage: PADDING_ERROR_MSG },
    { field: 'chars', schema: CharsZod, errorMessage: 'Must be non-empty string (max 10 chars)' },
    // Functions
    { field: 'sortable', schema: BooleanZod, errorMessage: BOOLEAN_ERROR_MSG },
    { field: 'searchable', schema: BooleanZod, errorMessage: BOOLEAN_ERROR_MSG },
    { field: 'filterable', schema: BooleanZod, errorMessage: BOOLEAN_ERROR_MSG },
    {
        field: 'elements',
        schema: ElementsZod,
        errorMessage: 'Must be array of strings/numbers or object with string/number values',
    },
    { field: 'selectable', schema: BooleanZod, errorMessage: BOOLEAN_ERROR_MSG },
    { field: 'show', schema: ShowZod, errorMessage: BOOLEAN_ERROR_MSG },
    { field: 'between', schema: BooleanZod, errorMessage: BOOLEAN_ERROR_MSG },
    {
        field: 'reference',
        schema: ReferenceZod,
        errorMessage: 'Must be non-empty string (max 100 chars)',
    },
    // Formatting
    { field: 'align', schema: AlignZod, errorMessage: "Must be 'start', 'center' or 'end'" },
    {
        field: 'color',
        schema: ColorZod,
        errorMessage: 'Must be Bootstrap color or valid CSS color',
    },
    {
        field: 'background',
        schema: BackgroundZod,
        errorMessage: 'Must be Bootstrap color or valid CSS color',
    },
    { field: 'size', schema: SizeZod, errorMessage: "Must be 'xs', 'sm', 'md', 'lg' or 'xl'" },
    { field: 'fontSize', schema: FontSizeZod, errorMessage: 'Must be valid CSS font-size' },
    { field: 'fontWeight', schema: FontWeightZod, errorMessage: 'Must be 100-900 or normal/bold' },
    { field: 'italic', schema: BooleanZod, errorMessage: BOOLEAN_ERROR_MSG },
    { field: 'normal', schema: BooleanZod, errorMessage: BOOLEAN_ERROR_MSG },
    { field: 'lineHeight', schema: LineHeightZod, errorMessage: 'Must be valid CSS line-height' },
    { field: 'monospace', schema: BooleanZod, errorMessage: BOOLEAN_ERROR_MSG },
    { field: 'text', schema: TextUtilityZod, errorMessage: "Must start with 'text-'" },
    // Content manipulation
    { field: 'number', schema: BooleanZod, errorMessage: BOOLEAN_ERROR_MSG },
    {
        field: 'currency',
        schema: z.boolean().nullable(),
        errorMessage: BOOLEAN_ERROR_MSG,
    },
    {
        field: 'unit',
        schema: UnitIdentifierZod(),
        errorMessage: 'Must be a valid Intl.NumberFormat unit identifier',
    },
    { field: 'date', schema: BooleanZod, errorMessage: BOOLEAN_ERROR_MSG },
    { field: 'datetime', schema: BooleanZod, errorMessage: BOOLEAN_ERROR_MSG },
    { field: 'phone', schema: BooleanZod, errorMessage: BOOLEAN_ERROR_MSG },
    { field: 'time', schema: BooleanZod, errorMessage: BOOLEAN_ERROR_MSG },
    { field: 'slice', schema: SliceZod, errorMessage: 'Must be integer between 1-10000' },
    { field: 'uppercase', schema: BooleanZod, errorMessage: BOOLEAN_ERROR_MSG },
    { field: 'lowercase', schema: BooleanZod, errorMessage: BOOLEAN_ERROR_MSG },
    { field: 'capitalize', schema: BooleanZod, errorMessage: BOOLEAN_ERROR_MSG },
    { field: 'object', schema: BooleanZod, errorMessage: BOOLEAN_ERROR_MSG },
    { field: 'raw', schema: z.boolean().nullable(), errorMessage: BOOLEAN_ERROR_MSG },
    // Other
    { field: 'class', schema: CellClassZod, errorMessage: 'Must be string or array of strings' },
    { field: 'style', schema: StyleZod, errorMessage: 'Must be valid CSS style string' },
    { field: 'type', schema: CellTypeZod, errorMessage: 'Invalid cell type' },
];

/**
 * Removes unknown keys from the cell object, keeping only allowed fields and data attributes.
 *
 * @param cell - The cell object to sanitize
 * @returns A new cell object with only allowed keys
 */
const stripUnknownNonDataKeys = (cell: Record<string, unknown>): Record<string, unknown> => {
    const allowedKeys = new Set([
        'content',
        'key',
        'field',
        'fields',
        'label',
        ...OPTIONAL_FIELDS_CONFIG.map(config => config.field),
    ]);

    const sanitizedCell: Record<string, unknown> = {};

    Object.keys(cell).forEach(key => {
        if (allowedKeys.has(key) || isDataAttribute(key)) {
            sanitizedCell[key] = cell[key];
        }
    });

    return sanitizedCell;
};

/**
 * Checks if cell has a valid key value.
 */
const hasValidKey = (cell: Record<string, unknown>): boolean => {
    return 'key' in cell && cell.key !== undefined && cell.key !== null && cell.key !== '';
};

/**
 * Validates field and ensures key exists (or generates it).
 */
const validateFieldWithKey = (
    cell: Record<string, unknown>,
    errorStoreId: string,
    baseKey: string
): void => {
    validateString(cell.field, errorStoreId, `${baseKey}.field`, 1);

    if (!hasValidKey(cell)) {
        cell.key = cell.field;
    } else {
        validateString(cell.key, errorStoreId, `${baseKey}.key`, 1);
    }
};

/**
 * Validates fields array and ensures key is provided.
 */
const validateFieldsWithKey = (
    cell: Record<string, unknown>,
    errorStoreId: string,
    errorStore: ReturnType<typeof getErrorSink>,
    baseKey: string,
    rowIndex: number,
    cellIndex: number
): void => {
    try {
        FieldsZod.parse(cell.fields);
    } catch (error) {
        errorStore.addSchemaValidationError(
            'HeaderCellValidator',
            `Invalid 'fields' array`,
            `${baseKey}.fields`,
            cell.fields,
            error instanceof Error ? error.message : 'Invalid fields array'
        );
        throw new Error(
            `Header cell validation failed: Invalid 'fields' at row ${rowIndex}, cell ${cellIndex}`
        );
    }

    const hasKey =
        'key' in cell &&
        cell.key !== undefined &&
        cell.key !== null &&
        String(cell.key).trim() !== '';
    if (!hasKey) {
        errorStore.addSchemaValidationError(
            'HeaderCellValidator',
            `'key' is required when using 'fields'`,
            `${baseKey}.key`,
            cell,
            `Please specify a unique 'key' for this column`
        );
        throw new Error(
            `Header cell validation failed: Missing 'key' with 'fields' at row ${rowIndex}, cell ${cellIndex}`
        );
    }

    validateString(cell.key, errorStoreId, `${baseKey}.key`, 1);
};

/**
 * Validates data cell fields (field/fields) and key requirements.
 */
const validateDataCellFields = (
    cell: Record<string, unknown>,
    errorStoreId: string,
    errorStore: ReturnType<typeof getErrorSink>,
    baseKey: string,
    rowIndex: number,
    cellIndex: number
): void => {
    const hasField = 'field' in cell && cell.field !== undefined && cell.field !== null;
    const hasFields = 'fields' in cell && cell.fields !== undefined && cell.fields !== null;

    if (!hasField && !hasFields) {
        errorStore.addSchemaValidationError(
            'HeaderCellValidator',
            `Either 'field' or 'fields' is required for data cells`,
            baseKey,
            cell,
            `One of 'field' or 'fields' is mandatory`,
            { note: "Specify 'field' for single column or 'fields' for multiple columns" }
        );
        throw new Error(
            `Header cell validation failed: Missing 'field'/'fields' at row ${rowIndex}, cell ${cellIndex}`
        );
    }

    if (hasField && hasFields) {
        errorStore.addSchemaValidationError(
            'HeaderCellValidator',
            `Cannot have both 'field' and 'fields'`,
            baseKey,
            cell,
            `Use either 'field' OR 'fields', not both`
        );
        throw new Error(
            `Header cell validation failed: Both 'field' and 'fields' present at row ${rowIndex}, cell ${cellIndex}`
        );
    }

    if (hasField) {
        validateFieldWithKey(cell, errorStoreId, baseKey);
        return;
    }

    validateFieldsWithKey(cell, errorStoreId, errorStore, baseKey, rowIndex, cellIndex);
};

/**
 * Header Cell Schema Validator
 *
 * Validates a single header cell:
 * - Grouping cell: colspan > 1 and no field/fields -> key/field is not required, only content.
 * - Data cell: field or fields is required.
 *   - with field, key is optional (default: field).
 *   - with fields, key is required.
 *
 * @param cell - The cell object to validate
 * @param errorStoreId - Error handler store identifier
 * @param cellIndex - The cell's index in the cells array
 * @param rowIndex - The row's index in the rows array (default: 0)
 *
 * @throws Error - If a validation error occurs
 * @returns {Record<string, unknown>} - The sanitized cell object
 *
 * @example
 * ```typescript
 * // Data cell
 * const cell = { content: 'ID', field: 'id' }; // key defaults to 'id'
 * validateHeaderCell(cell, 'store', 0, 0);
 *
 * // Grouping cell
 * const group = { content: 'Price', colspan: 3 };
 * validateHeaderCell(group, 'store', 0, 0);
 * ```
 */
export const validateHeaderCell = (
    cell: Record<string, unknown>,
    errorStoreId: string,
    cellIndex: number,
    rowIndex: number = 0
): Record<string, unknown> => {
    // Load the error handler store
    const errorStore = getErrorSink(errorStoreId);

    // Generate the KEY for the error messages
    const baseKey = `response.header.rows[${rowIndex}].cells[${cellIndex}]`;

    // 1. Content is always required
    validateRequiredStringField(
        cell,
        'content',
        errorStoreId,
        errorStore,
        baseKey,
        rowIndex,
        cellIndex
    );

    // 2. Validating and interpreting colspan
    let colspan = 1;
    if ('colspan' in cell && cell.colspan !== undefined && cell.colspan !== null) {
        const result = ColspanZod.safeParse(cell.colspan);
        if (result.success && result.data !== null) {
            colspan = result.data;
        } else {
            // Let validation loop at step 4 handle the error explicitly
            // but we try to respect it here for logic
            colspan = Number(cell.colspan) || 1;
        }
    }

    // 3. Determining and validating the cell type
    const hasField = 'field' in cell && cell.field !== undefined && cell.field !== null;
    const hasFields = 'fields' in cell && cell.fields !== undefined && cell.fields !== null;

    // Grouping cell if there is no field/fields AND colspan > 1
    const isGrouping = !hasField && !hasFields && colspan > 1;

    if (!isGrouping) {
        // This is a DATA cell (or an invalid grouping cell with colspan<=1)
        validateDataCellFields(cell, errorStoreId, errorStore, baseKey, rowIndex, cellIndex);
    }
    // If isGrouping === true, skip field/fields/key validation (valid case)

    // 4. Validating further optional fields (including colspan again, to get the precise error message)

    // LABEL
    if ('label' in cell && cell.label !== undefined && cell.label !== null) {
        validateString(cell.label, errorStoreId, `${baseKey}.label`, 0);
    }

    // Config fields
    OPTIONAL_FIELDS_CONFIG.forEach(({ field, schema, errorMessage }) => {
        validateOptionalZodField(
            cell,
            field,
            schema,
            errorMessage,
            errorStore,
            baseKey,
            rowIndex,
            cellIndex
        );
    });

    // 5. Validating data attributes
    Object.keys(cell).forEach(key => {
        if (isDataAttribute(key)) {
            validateOptionalZodField(
                cell,
                key,
                DataAttributeValueZod,
                'Invalid data attribute value',
                errorStore,
                baseKey,
                rowIndex,
                cellIndex
            );
        }
    });

    return stripUnknownNonDataKeys(cell);
};
