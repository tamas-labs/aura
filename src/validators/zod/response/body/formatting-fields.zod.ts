import { BooleanZod } from '../../common/boolean.zod';
import { AlignZod } from '../header/align.zod';
import { BackgroundZod } from '../header/background.zod';
import { FontSizeZod } from '../header/font-size.zod';
import { FontWeightZod } from '../header/font-weight.zod';
import { LineHeightZod } from '../header/line-height.zod';
import { TextUtilityZod } from '../header/text-utility.zod';
import { SliceZod } from '../header/slice.zod';
import { PadZod } from '../header/pad.zod';
import { CharsZod } from '../header/chars.zod';
import { CellClassZod } from '../header/cell-class.zod';
import { StyleZod } from '../header/style.zod';
import { BootstrapColorZod } from './bootstrap-color.zod';
import { StaticUnitZod } from './static-unit.zod';
import { CellRulesZod } from './cell-rules.zod';

/**
 * The shared zod shape of `static`-parity content formatting fields **WITHOUT the `<td>`-level
 * `style`/`cellRules`** — fields affecting the content element (`<span>`/`<a>`/…), plus `class`.
 * Used by the `mapping`-entry schemas (e.g. the `reference` value→config mapping), where the
 * entry formats the displayed text/icon but not the cell container.
 *
 * See `SharedFormattingShape` for the full config-level set (this + `style` + `cellRules`).
 */
export const SharedContentFormattingShape = {
    // Formatting
    color: BootstrapColorZod.optional(),
    background: BackgroundZod.optional(),
    align: AlignZod.optional(),
    fontSize: FontSizeZod.optional(),
    fontWeight: FontWeightZod.optional(),
    italic: BooleanZod.optional(),
    normal: BooleanZod.optional(),
    lineHeight: LineHeightZod.optional(),
    text: TextUtilityZod.optional(),

    // Content manipulation
    uppercase: BooleanZod.optional(),
    lowercase: BooleanZod.optional(),
    capitalize: BooleanZod.optional(),
    monospace: BooleanZod.optional(),
    slice: SliceZod.optional(),

    // Special formatting
    number: BooleanZod.optional(),
    currency: BooleanZod.optional(),
    date: BooleanZod.optional(),
    phone: BooleanZod.optional(),
    unit: StaticUnitZod.optional(),

    // Padding
    padStart: PadZod.optional(),
    padEnd: PadZod.optional(),
    chars: CharsZod.optional(),

    // Other (BaseColumnConfig field)
    class: CellClassZod.optional(),
} as const;

/**
 * The full `static`-parity formatting set — spreadable into a `z.object({ ... })`
 * (`...SharedFormattingShape`). The `static`/`badge`/`button`/`reference`/`custom` configs
 * all use this; the shared definition eliminates field-level duplication (jscpd).
 * Does NOT include the type-specific value-source fields (`field`/`fields`/`value`/
 * `renderer`/`template`/…) or the `type` literal — each config provides those itself.
 */
export const SharedFormattingShape = {
    ...SharedContentFormattingShape,

    // Cell-level (`<td>`) fields
    style: StyleZod.optional(),
    cellRules: CellRulesZod.optional(),
} as const;
