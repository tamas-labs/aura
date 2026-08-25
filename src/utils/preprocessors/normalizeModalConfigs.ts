/**
 * Normalizes modal-type columnConfigs by resolving shorthand fields into a
 * unified `content` structure, and normalizing branch-level icon fields.
 *
 * After normalization:
 * - Root `icon`/`variant` shorthand → `content: { type: 'icon', class: [...] }`
 * - Root `button`/`value`/`size` shorthand → `content: { type: 'button', variant, value, size }`
 * - Branch flat `type: 'icon'` → `content: { type: 'icon', class: [...] }`, branch `type` deleted
 * - Branch flat `type: 'button'` → `content: { type: 'button', ... }`, branch `type` deleted
 * - Branch nested `content.type === 'icon'` → icon/variant/color within content normalized to class
 *
 * The branch `type` field deletion is critical: without it, `resolveConditionalConfig` would
 * merge the branch `type` over the root `type: 'modal'`, causing the render dispatcher to
 * treat the cell as an icon instead of a modal.
 */
import type { Body, ColumnConfig } from '../../types/api-response.types';
import { resolveMergedIconClasses } from './preprocessor-utils';

/**
 * Normalizes icon/variant/color fields inside a nested content object.
 * Returns null if nothing changed.
 */
function normalizeContentIconFields(
    content: Record<string, unknown>,
    icons: Record<string, string[]> | undefined,
    variants: Record<string, string> | undefined
): Record<string, unknown> | null {
    if (content.type !== 'icon') return null;

    const iconKey = content.icon as string | null | undefined;
    const variantKey = (content.variant ?? content.color) as string | null | undefined;

    if (!iconKey && !variantKey) return null;

    const normalized = { ...content };
    normalized.class = resolveMergedIconClasses(content, icons, variants);
    delete normalized.icon;
    delete normalized.variant;
    delete normalized.color;

    return normalized;
}

/**
 * Builds a `content` object from flat icon fields, resolving icon/variant via registry.
 */
function buildIconContent(
    branch: Record<string, unknown>,
    icons: Record<string, string[]> | undefined,
    variants: Record<string, string> | undefined
): Record<string, unknown> {
    const content: Record<string, unknown> = {
        type: 'icon',
        class: resolveMergedIconClasses(branch, icons, variants),
    };

    if (branch.alt !== undefined) content.alt = branch.alt;
    if (branch.title !== undefined) content.title = branch.title;

    return content;
}

/**
 * Builds a `content` object from flat button fields.
 */
function buildButtonContent(branch: Record<string, unknown>): Record<string, unknown> {
    const content: Record<string, unknown> = { type: 'button' };
    if (branch.button !== undefined) content.variant = branch.button;
    if (branch.value !== undefined) content.value = branch.value;
    if (branch.size !== undefined) content.size = branch.size;
    if (branch.alt !== undefined) content.alt = branch.alt;
    if (branch.title !== undefined) content.title = branch.title;
    return content;
}

/**
 * Normalizes a single modal branch (root config, if-branch element, or else-branch).
 *
 * Returns null if nothing changed (same reference can be used).
 */
function normalizeModalBranch(
    branch: Record<string, unknown>,
    icons: Record<string, string[]> | undefined,
    variants: Record<string, string> | undefined,
    isBranch: boolean
): Record<string, unknown> | null {
    // Flat icon shorthand (root level) or flat type: 'icon' branch
    const hasIconShorthand = branch.icon !== undefined && branch.icon !== null;
    const hasBranchIconType = isBranch && branch.type === 'icon';

    if (hasIconShorthand || hasBranchIconType) {
        const content = buildIconContent(branch, icons, variants);
        const normalized: Record<string, unknown> = { ...branch, content };

        // Remove icon shorthand fields
        delete normalized.icon;
        delete normalized.variant;
        delete normalized.color;
        delete normalized.class;
        delete normalized.alt;
        delete normalized.title;

        // Critical: remove type from branches to prevent resolveConditionalConfig
        // from overwriting the root type:'modal' with type:'icon'
        if (isBranch) {
            delete normalized.type;
        }

        return normalized;
    }

    // Flat button shorthand (root level) or flat type: 'button' branch
    const hasButtonShorthand = branch.button !== undefined && branch.button !== null;
    const hasBranchButtonType = isBranch && branch.type === 'button';

    if (hasButtonShorthand || hasBranchButtonType) {
        const content = buildButtonContent(branch);
        const normalized: Record<string, unknown> = { ...branch, content };

        // Remove button shorthand fields
        delete normalized.button;
        delete normalized.value;
        delete normalized.size;
        delete normalized.alt;
        delete normalized.title;

        // Critical: remove type from branches
        if (isBranch) {
            delete normalized.type;
        }

        return normalized;
    }

    // Nested content — normalize icon fields inside content if needed
    if (branch.content && typeof branch.content === 'object' && !Array.isArray(branch.content)) {
        const normalizedContent = normalizeContentIconFields(
            branch.content as Record<string, unknown>,
            icons,
            variants
        );
        if (normalizedContent) {
            return { ...branch, content: normalizedContent };
        }
    }

    return null;
}

function normalizeModalIfBranches(
    rawIf: unknown,
    icons: Record<string, string[]> | undefined,
    variants: Record<string, string> | undefined
): unknown[] | undefined {
    if (!Array.isArray(rawIf) || rawIf.length === 0) return undefined;

    let modified = false;
    const result = rawIf.map(branch => {
        if (!branch || typeof branch !== 'object') return branch;
        const normalized = normalizeModalBranch(
            branch as Record<string, unknown>,
            icons,
            variants,
            true
        );
        if (normalized !== null) modified = true;
        return normalized !== null ? normalized : branch;
    });

    return modified ? result : undefined;
}

function normalizeModalElseBranch(
    rawElse: unknown,
    icons: Record<string, string[]> | undefined,
    variants: Record<string, string> | undefined
): Record<string, unknown> | undefined {
    if (!rawElse || typeof rawElse !== 'object' || Array.isArray(rawElse)) return undefined;
    const normalized = normalizeModalBranch(
        rawElse as Record<string, unknown>,
        icons,
        variants,
        true
    );
    return normalized !== null ? normalized : undefined;
}

function normalizeModalConfigEntry(
    config: Record<string, unknown>,
    icons: Record<string, string[]> | undefined,
    variants: Record<string, string> | undefined
): Record<string, unknown> | null {
    const normalizedRoot = normalizeModalBranch(config, icons, variants, false);
    const rootChanged = normalizedRoot !== null;

    const sourceConfig = rootChanged ? normalizedRoot! : config;
    const normalizedIf = normalizeModalIfBranches(sourceConfig.if, icons, variants);
    const normalizedElse = normalizeModalElseBranch(sourceConfig.else, icons, variants);

    if (!rootChanged && !normalizedIf && !normalizedElse) return null;

    const finalConfig: Record<string, unknown> = rootChanged ? normalizedRoot! : { ...config };
    if (normalizedIf !== undefined) finalConfig.if = normalizedIf;
    if (normalizedElse !== undefined) finalConfig.else = normalizedElse;
    return finalConfig;
}

/**
 * Normalizes all `type: 'modal'` entries in `body.columnConfigs`.
 *
 * For each modal config:
 * 1. Root shorthand `icon`/`variant` → `content: { type: 'icon', class: [...] }`
 * 2. Root shorthand `button`/`value`/`size` → `content: { type: 'button', ... }`
 * 3. Branch flat `type: 'icon'` → `content`, branch `type` deleted (critical!)
 * 4. Branch flat `type: 'button'` → `content`, branch `type` deleted (critical!)
 * 5. Branch nested `content.type === 'icon'` → icon/variant/color normalized in content
 *
 * @param body - The body object containing columnConfigs
 * @param icons - Icon registry from config (maps keys to CSS class arrays)
 * @param variants - Variant registry from config (maps keys to Bootstrap color names)
 * @returns The body with normalized modal configs, or unchanged body if nothing to normalize
 *
 * @example
 * ```ts
 * // Input:  { type: 'modal', id: 'edit-modal', icon: 'edit', variant: 'primary' }
 * // Output: { type: 'modal', id: 'edit-modal', content: { type: 'icon', class: ['fas', 'fa-edit', 'text-primary'] } }
 *
 * // Input branch: { if: [{ eq: 'active', type: 'icon', icon: 'check', id: 'modal-a' }] }
 * // Output branch: { if: [{ eq: 'active', content: { type: 'icon', class: [...] }, id: 'modal-a' }] }
 * // Note: branch 'type' is deleted to prevent overwriting root type:'modal'
 * ```
 */
export function normalizeModalConfigs(
    body: Body | null,
    icons: Record<string, string[]> | undefined,
    variants: Record<string, string> | undefined
): Body | null {
    if (!body?.columnConfigs) return body;

    const configs = body.columnConfigs;
    const configKeys = Object.keys(configs);
    let resultBody: Body | null = body;
    let modified = false;

    for (const configKey of configKeys) {
        const config = configs[configKey];
        if (!config || config.type !== 'modal') continue;

        const normalized = normalizeModalConfigEntry(
            config as unknown as Record<string, unknown>,
            icons,
            variants
        );
        if (!normalized) continue;

        if (!modified) {
            // Shallow clone body and columnConfigs on first modification
            resultBody = { ...body, columnConfigs: { ...body.columnConfigs } };
            modified = true;
        }

        (resultBody as Body).columnConfigs![configKey] = normalized as unknown as ColumnConfig;
    }

    return resultBody;
}
