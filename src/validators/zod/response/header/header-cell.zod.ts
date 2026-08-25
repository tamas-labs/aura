import { z } from 'zod';
import { BooleanZod } from '../../common/boolean.zod';
import { UnitIdentifierZod } from '../../common/unit-identifier.zod';
import { StringZod } from '../../common/string.zod';
import { ColspanZod } from './colspan.zod';
import { RowspanZod } from './rowspan.zod';
import { WidthZod } from './width.zod';
import { PadZod } from './pad.zod';
import { CharsZod } from './chars.zod';
import { ReferenceZod } from './reference.zod';
import { ShowZod } from './show.zod';
import { AlignZod } from './align.zod';
import { ColorZod } from './color.zod';
import { BackgroundZod } from './background.zod';
import { SizeZod } from './size.zod';
import { FontSizeZod } from './font-size.zod';
import { FontWeightZod } from './font-weight.zod';
import { LineHeightZod } from './line-height.zod';
import { TextUtilityZod } from './text-utility.zod';
import { SliceZod } from './slice.zod';
import { CellClassZod } from './cell-class.zod';
import { StyleZod } from './style.zod';
import { CellTypeZod } from './cell-type.zod';
import { FieldsZod } from './fields.zod';
import { ElementsZod } from './elements.zod';

/**
 * Header Cell Zod Schema
 *
 * Validates the structure and known fields of a single header cell object.
 * - Uses .catchall(z.unknown()) to allow dynamic data-* attributes
 * - Unknown, non-data-* keys are filtered out by the schema validator
 */
export const HeaderCellZod = z
    .object({
        // Required fields
        content: StringZod(1, 1000),
        key: StringZod(1, 250).optional(),

        // Field / Fields
        field: StringZod(1, 250).optional(),
        fields: FieldsZod.optional(),

        // Optional fields
        label: StringZod(0, 250).optional(),
        colspan: ColspanZod.optional(),
        rowspan: RowspanZod.optional(),
        width: WidthZod.optional(),
        resizable: BooleanZod.optional(),
        pad: PadZod.optional(),
        padStart: PadZod.optional(),
        padEnd: PadZod.optional(),
        chars: CharsZod.optional(),

        // Features
        sortable: BooleanZod.optional(),
        searchable: BooleanZod.optional(),
        filterable: BooleanZod.optional(),
        elements: ElementsZod.optional(),
        selectable: BooleanZod.optional(),
        show: ShowZod.optional(),
        between: BooleanZod.optional(),
        reference: ReferenceZod.optional(),

        // Formatting
        align: AlignZod.optional(),
        color: ColorZod.optional(),
        background: BackgroundZod.optional(),
        size: SizeZod.optional(),
        fontSize: FontSizeZod.optional(),
        fontWeight: FontWeightZod.optional(),
        italic: BooleanZod.optional(),
        normal: BooleanZod.optional(),
        lineHeight: LineHeightZod.optional(),
        monospace: BooleanZod.optional(),
        text: TextUtilityZod.optional(),

        // Content manipulation
        number: BooleanZod.optional(),
        currency: z.boolean().nullable().optional(),
        unit: UnitIdentifierZod().optional(),
        date: BooleanZod.optional(),
        datetime: BooleanZod.optional(),
        phone: BooleanZod.optional(),
        time: BooleanZod.optional(),
        slice: SliceZod.optional(),
        uppercase: BooleanZod.optional(),
        lowercase: BooleanZod.optional(),
        capitalize: BooleanZod.optional(),
        object: BooleanZod.optional(),
        raw: z.boolean().nullable().optional(),

        // Other
        class: CellClassZod.optional(),
        style: StyleZod.optional(),
        type: CellTypeZod.optional(),
    })
    .catchall(z.unknown());
