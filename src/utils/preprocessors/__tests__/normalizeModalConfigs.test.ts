import { describe, it, expect } from 'vitest';
import { normalizeModalConfigs } from '../normalizeModalConfigs';
import type { Body } from '../../../types/api-response.types';

// Registry fixtures
const icons: Record<string, string[]> = {
    primary: ['fas', 'fa-file'],
    edit: ['fas', 'fa-pencil'],
    show: ['fas', 'fa-eye'],
    trash: ['fas', 'fa-trash'],
};

const variants: Record<string, string> = {
    primary: 'secondary',
    danger: 'danger',
    info: 'info',
};

describe('normalizeModalConfigs', () => {
    // -------------------------------------------------------------------------
    // null / empty body guards
    // -------------------------------------------------------------------------
    describe('null / empty body', () => {
        it('should return null when body is null', () => {
            const result = normalizeModalConfigs(null, icons, variants);
            expect(result).toBeNull();
        });

        it('should return the same body reference when columnConfigs is absent', () => {
            const body: Body = {};
            const result = normalizeModalConfigs(body, icons, variants);
            expect(result).toBe(body);
        });

        it('should return the same body reference when columnConfigs is null', () => {
            const body: Body = { columnConfigs: null };
            const result = normalizeModalConfigs(body, icons, variants);
            expect(result).toBe(body);
        });

        it('should return the same body reference when columnConfigs is empty', () => {
            const body: Body = { columnConfigs: {} };
            const result = normalizeModalConfigs(body, icons, variants);
            expect(result).toBe(body);
        });
    });

    // -------------------------------------------------------------------------
    // root-level icon shorthand normalization
    // -------------------------------------------------------------------------
    describe('root icon shorthand', () => {
        it('should resolve icon key to class array via registry', () => {
            const body: Body = {
                columnConfigs: {
                    editBtn: { type: 'modal', id: 'edit-modal', icon: 'edit' },
                },
            };

            const result = normalizeModalConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['editBtn'] as any;

            expect(config.content).toEqual({ type: 'icon', class: ['fas', 'fa-pencil'] });
            expect(config.icon).toBeUndefined();
        });

        it('should resolve icon+variant to class array with variant color class', () => {
            const body: Body = {
                columnConfigs: {
                    editBtn: { type: 'modal', id: 'edit-modal', icon: 'edit', variant: 'danger' },
                },
            };

            const result = normalizeModalConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['editBtn'] as any;

            expect(config.content.class).toContain('fas');
            expect(config.content.class).toContain('fa-pencil');
            expect(config.icon).toBeUndefined();
            expect(config.variant).toBeUndefined();
        });

        it('should keep alt/title in content when present at root level', () => {
            const body: Body = {
                columnConfigs: {
                    editBtn: {
                        type: 'modal',
                        id: 'edit-modal',
                        icon: 'edit',
                        alt: 'Edit item',
                        title: 'Click to edit',
                    },
                },
            };

            const result = normalizeModalConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['editBtn'] as any;

            expect(config.content.alt).toBe('Edit item');
            expect(config.content.title).toBe('Click to edit');
        });

        it('should delete icon, variant, class from root after normalization', () => {
            const body: Body = {
                columnConfigs: {
                    editBtn: {
                        type: 'modal',
                        id: 'edit-modal',
                        icon: 'edit',
                        variant: 'danger',
                        class: ['ms-1'],
                    },
                },
            };

            const result = normalizeModalConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['editBtn'] as any;

            expect(config.icon).toBeUndefined();
            expect(config.variant).toBeUndefined();
            expect(config.class).toBeUndefined();
        });
    });

    // -------------------------------------------------------------------------
    // root-level button shorthand normalization
    // -------------------------------------------------------------------------
    describe('root button shorthand', () => {
        it('should resolve button shorthand into content object', () => {
            const body: Body = {
                columnConfigs: {
                    deleteBtn: {
                        type: 'modal',
                        id: 'delete-modal',
                        button: 'danger',
                        value: 'Delete',
                    },
                },
            };

            const result = normalizeModalConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['deleteBtn'] as any;

            expect(config.content).toEqual({
                type: 'button',
                variant: 'danger',
                value: 'Delete',
            });
            expect(config.button).toBeUndefined();
            expect(config.value).toBeUndefined();
        });

        it('should include size in content when present', () => {
            const body: Body = {
                columnConfigs: {
                    sizeBtn: {
                        type: 'modal',
                        id: 'size-modal',
                        button: 'primary',
                        value: 'Open',
                        size: 'sm',
                    },
                },
            };

            const result = normalizeModalConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['sizeBtn'] as any;

            expect(config.content.size).toBe('sm');
            expect(config.size).toBeUndefined();
        });

        it('should delete button, value, size, alt, title from root after normalization', () => {
            const body: Body = {
                columnConfigs: {
                    btn: {
                        type: 'modal',
                        id: 'btn-modal',
                        button: 'primary',
                        value: 'Open',
                        size: 'lg',
                        alt: 'Opens modal',
                        title: 'Click me',
                    },
                },
            };

            const result = normalizeModalConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['btn'] as any;

            expect(config.button).toBeUndefined();
            expect(config.value).toBeUndefined();
            expect(config.size).toBeUndefined();
        });
    });

    // -------------------------------------------------------------------------
    // if-branch normalization
    // -------------------------------------------------------------------------
    describe('if-branch normalization', () => {
        it('should normalize icon shorthand inside if branch', () => {
            const body: Body = {
                columnConfigs: {
                    statusModal: {
                        type: 'modal',
                        key: 'status',
                        if: [{ eq: 'active', id: 'deact-modal', icon: 'trash' }],
                    },
                },
            };

            const result = normalizeModalConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['statusModal'] as any;
            const branch = config.if[0];

            expect(branch.content).toEqual({ type: 'icon', class: ['fas', 'fa-trash'] });
            expect(branch.icon).toBeUndefined();
        });

        it('should delete type from if branch for flat type:icon entry', () => {
            const body: Body = {
                columnConfigs: {
                    statusModal: {
                        type: 'modal',
                        key: 'status',
                        if: [{ eq: 'active', id: 'act-modal', type: 'icon', icon: 'show' }],
                    },
                },
            };

            const result = normalizeModalConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['statusModal'] as any;
            const branch = config.if[0];

            // type must be deleted from branch to prevent overwriting root type:'modal'
            expect(branch.type).toBeUndefined();
            expect(branch.content).toBeDefined();
        });

        it('should delete type from if branch for flat type:button entry', () => {
            const body: Body = {
                columnConfigs: {
                    btnModal: {
                        type: 'modal',
                        key: 'status',
                        if: [
                            {
                                eq: 'active',
                                id: 'act-modal',
                                type: 'button',
                                button: 'danger',
                                value: 'Delete',
                            },
                        ],
                    },
                },
            };

            const result = normalizeModalConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['btnModal'] as any;
            const branch = config.if[0];

            expect(branch.type).toBeUndefined();
            expect(branch.content).toEqual({
                type: 'button',
                variant: 'danger',
                value: 'Delete',
            });
        });

        it('should leave if branches unchanged when they have no shorthand fields', () => {
            const body: Body = {
                columnConfigs: {
                    noChange: {
                        type: 'modal',
                        id: 'default-modal',
                        content: { type: 'icon', class: ['fas', 'fa-info'] },
                        key: 'status',
                        if: [{ eq: 'active', id: 'active-modal' }],
                    },
                },
            };

            const originalIf = (body.columnConfigs as any)['noChange'].if;

            const result = normalizeModalConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['noChange'] as any;

            // No icon/button shorthand — if branches unchanged
            expect(config.if).toEqual(originalIf);
        });
    });

    // -------------------------------------------------------------------------
    // else-branch normalization
    // -------------------------------------------------------------------------
    describe('else-branch normalization', () => {
        it('should normalize icon shorthand inside else branch', () => {
            const body: Body = {
                columnConfigs: {
                    elseModal: {
                        type: 'modal',
                        key: 'status',
                        else: { id: 'fallback-modal', icon: 'show' } as any,
                    },
                },
            };

            const result = normalizeModalConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['elseModal'] as any;

            expect(config.else.content).toEqual({ type: 'icon', class: ['fas', 'fa-eye'] });
            expect(config.else.icon).toBeUndefined();
        });

        it('should delete type from else branch when it is flat type:icon', () => {
            const body: Body = {
                columnConfigs: {
                    elseModal: {
                        type: 'modal',
                        key: 'status',
                        else: { id: 'fb-modal', type: 'icon', icon: 'show' } as any,
                    },
                },
            };

            const result = normalizeModalConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['elseModal'] as any;

            expect(config.else.type).toBeUndefined();
            expect(config.else.content).toBeDefined();
        });
    });

    // -------------------------------------------------------------------------
    // nested content icon normalization
    // -------------------------------------------------------------------------
    describe('nested content icon normalization', () => {
        it('should normalize icon/variant inside content.type === icon', () => {
            const body: Body = {
                columnConfigs: {
                    nested: {
                        type: 'modal',
                        id: 'nested-modal',
                        content: { type: 'icon', icon: 'edit', variant: 'danger' } as any,
                    },
                },
            };

            const result = normalizeModalConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['nested'] as any;

            expect(config.content.class).toContain('fas');
            expect(config.content.class).toContain('fa-pencil');
            expect(config.content.icon).toBeUndefined();
            expect(config.content.variant).toBeUndefined();
        });

        it('should delete color field inside content after normalization', () => {
            const body: Body = {
                columnConfigs: {
                    colorTest: {
                        type: 'modal',
                        id: 'color-modal',
                        content: { type: 'icon', icon: 'show', color: 'info' } as any,
                    },
                },
            };

            const result = normalizeModalConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['colorTest'] as any;

            expect(config.content.color).toBeUndefined();
        });

        it('should not modify content when no icon/variant fields are present inside it', () => {
            const body: Body = {
                columnConfigs: {
                    alreadyNorm: {
                        type: 'modal',
                        id: 'norm-modal',
                        content: { type: 'icon', class: ['fas', 'fa-eye'] },
                    },
                },
            };

            const origContent = (body.columnConfigs as any)['alreadyNorm'].content;

            const result = normalizeModalConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['alreadyNorm'] as any;

            // No modification — content reference can be same or equivalent
            expect(config.content).toEqual(origContent);
        });
    });

    // -------------------------------------------------------------------------
    // non-modal types pass through unchanged
    // -------------------------------------------------------------------------
    describe('non-modal types pass through', () => {
        it('should not modify icon type entries', () => {
            const body: Body = {
                columnConfigs: {
                    iconCol: { type: 'icon', class: ['fas', 'fa-check'] },
                },
            };

            const result = normalizeModalConfigs(body, icons, variants);

            expect(result?.columnConfigs?.['iconCol']).toMatchObject({
                type: 'icon',
                class: ['fas', 'fa-check'],
            });
        });

        it('should not modify static type entries', () => {
            const body: Body = {
                columnConfigs: {
                    staticCol: { type: 'static', value: 'Active' },
                },
            };

            const result = normalizeModalConfigs(body, icons, variants);

            expect(result?.columnConfigs?.['staticCol']).toMatchObject({
                type: 'static',
                value: 'Active',
            });
        });

        it('should process only modal entries when mixed types present', () => {
            const body: Body = {
                columnConfigs: {
                    iconCol: { type: 'icon', class: ['fas', 'fa-check'] },
                    staticCol: { type: 'static', value: 'Active' },
                    modalCol: { type: 'modal', id: 'edit-modal', icon: 'edit' },
                },
            };

            const result = normalizeModalConfigs(body, icons, variants);

            expect(result?.columnConfigs?.['iconCol']).toMatchObject({ type: 'icon' });
            expect(result?.columnConfigs?.['staticCol']).toMatchObject({ type: 'static' });
            const modalCol = result?.columnConfigs?.['modalCol'] as any;
            expect(modalCol.content).toBeDefined();
            expect(modalCol.icon).toBeUndefined();
        });
    });

    // -------------------------------------------------------------------------
    // immutability
    // -------------------------------------------------------------------------
    describe('immutability', () => {
        it('should not mutate the original body object', () => {
            const body: Body = {
                columnConfigs: {
                    editBtn: { type: 'modal', id: 'edit-modal', icon: 'edit' },
                },
            };
            const originalJson = JSON.stringify(body);

            normalizeModalConfigs(body, icons, variants);

            expect(JSON.stringify(body)).toBe(originalJson);
        });

        it('should return a different body reference when modifications are needed', () => {
            const body: Body = {
                columnConfigs: {
                    editBtn: { type: 'modal', id: 'edit-modal', icon: 'edit' },
                },
            };

            const result = normalizeModalConfigs(body, icons, variants);

            expect(result).not.toBe(body);
        });

        it('should return the same body reference when no modifications needed', () => {
            const body: Body = {
                columnConfigs: {
                    alreadyNorm: {
                        type: 'modal',
                        id: 'norm-modal',
                        content: { type: 'icon', class: ['fas', 'fa-eye'] },
                    },
                },
            };

            const result = normalizeModalConfigs(body, icons, variants);

            expect(result).toBe(body);
        });
    });
});
