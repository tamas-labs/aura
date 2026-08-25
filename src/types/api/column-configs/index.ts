/**
 * Column Config Types — barrel.
 *
 * One file per column type (each with its own mapping-entry / helper types),
 * re-exported here alongside the discriminated `ColumnConfig` union.
 */

export * from './base.types';
export * from './static.types';
export * from './icon.types';
export * from './link.types';
export * from './modal.types';
export * from './badge.types';
export * from './progress.types';
export * from './button.types';
export * from './custom.types';
export * from './reference.types';

import type { StaticConfig } from './static.types';
import type { IconConfig } from './icon.types';
import type { LinkConfig } from './link.types';
import type { ModalConfig } from './modal.types';
import type { BadgeConfig } from './badge.types';
import type { ProgressConfig } from './progress.types';
import type { ButtonConfig } from './button.types';
import type { CustomConfig } from './custom.types';
import type { ReferenceConfig } from './reference.types';

/**
 * Discriminated union of all possible column configurations.
 */
export type ColumnConfig =
    | StaticConfig
    | IconConfig
    | LinkConfig
    | ModalConfig
    | BadgeConfig
    | ProgressConfig
    | ButtonConfig
    | CustomConfig
    | ReferenceConfig;
