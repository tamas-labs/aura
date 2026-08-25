import type { LinkTarget, Size } from '../primitives.types';
import type { BaseColumnConfig } from './base.types';
import type { IconConfig } from './icon.types';
import type { ButtonConfig } from './button.types';
import type { LinkConfig } from './link.types';

/**
 * Configuration for modal trigger columns.
 */
export interface ModalConfig extends BaseColumnConfig {
    type: 'modal';
    /** Modal unique identifier — optional when using conditional if/else rendering (id provided in branches) */
    id?: string | null;
    /** API endpoint template with {key} placeholders */
    route?: string | null;
    /** Nested trigger content (preprocessed from shorthand) */
    content?: IconConfig | ButtonConfig | LinkConfig | null;
    /** Shorthand icon trigger — preprocessor normalizes to content */
    icon?: string | null;
    /** Shorthand variant for icon trigger — preprocessor normalizes to class */
    variant?: string | null;
    /** Shorthand button style (e.g. "outline-primary") — preprocessor normalizes to content */
    button?: string | null;
    /** Display text for button shorthand */
    value?: string | null;
    /** Trigger size */
    size?: Size | null;
    /** Link target for link type triggers */
    target?: LinkTarget | null;
    /** Accessible label */
    alt?: string | null;
    /** Tooltip text */
    title?: string | null;
    /** Field key for URL generation or conditional evaluation */
    key?: string | null;
}
