import { describe, it, expect } from 'vitest';
import { ModalConfigZod } from '../modal-config.zod';

describe('ModalConfigZod', () => {
    // -------------------------------------------------------------------------
    // valid cases
    // -------------------------------------------------------------------------
    describe('valid cases', () => {
        it('should accept minimal config with type, id and icon shorthand', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                id: 'edit-modal',
                icon: 'pencil',
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with type, id and nested content type icon', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                id: 'view-modal',
                content: { type: 'icon', class: ['fas', 'fa-eye'] },
            });
            expect(result.success).toBe(true);
        });

        it('should accept button shorthand (type + id + button + value)', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                id: 'confirm-modal',
                button: 'danger',
                value: 'Delete',
            });
            expect(result.success).toBe(true);
        });

        it('should accept content with type button', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                id: 'confirm-modal',
                content: { type: 'button', variant: 'primary', value: 'Open' },
            });
            expect(result.success).toBe(true);
        });

        it('should accept content with type link', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                id: 'link-modal',
                content: { type: 'link', value: 'Open dialog' },
            });
            expect(result.success).toBe(true);
        });

        it('should accept full config with all fields', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                id: 'full-modal',
                route: '/items/{id}',
                icon: 'edit',
                variant: 'primary',
                size: 'sm',
                alt: 'Edit item',
                title: 'Edit',
                class: ['ms-1'],
                style: 'cursor: pointer;',
                key: 'id',
                cellRules: {
                    key: 'status',
                    if: [{ eq: 'active', background: 'success-subtle' }],
                },
            });
            expect(result.success).toBe(true);
        });

        it('should accept conditional config with if branches and no root id', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                key: 'status',
                if: [
                    { eq: 'active', id: 'activate-modal', icon: 'check' },
                    { eq: 'inactive', id: 'deactivate-modal', icon: 'times' },
                ],
            });
            expect(result.success).toBe(true);
        });

        it('should accept conditional config with if and else branches', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                key: 'status',
                if: [{ eq: 'active', id: 'deactivate-modal', icon: 'ban' }],
                else: { id: 'activate-modal', icon: 'check' },
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with data-* attributes', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                id: 'data-modal',
                icon: 'info',
                'data-action': 'open',
                'data-target': '#my-modal',
            });
            expect(result.success).toBe(true);
        });

        it('should accept nullable optional fields', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                id: 'nullable-modal',
                icon: 'check',
                route: null,
                content: null,
                variant: null,
                size: null,
                target: null,
                alt: null,
                title: null,
                key: null,
                style: null,
                cellRules: null,
            });
            expect(result.success).toBe(true);
        });

        it('should accept all valid size values', () => {
            const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

            for (const size of sizes) {
                const result = ModalConfigZod.safeParse({
                    type: 'modal',
                    id: 'size-modal',
                    icon: 'check',
                    size,
                });
                expect(result.success).toBe(true);
            }
        });

        it('should accept all valid target values', () => {
            const targets = ['_blank', '_self', '_parent', '_top'] as const;

            for (const target of targets) {
                const result = ModalConfigZod.safeParse({
                    type: 'modal',
                    id: 'target-modal',
                    content: { type: 'link' },
                    target,
                });
                expect(result.success).toBe(true);
            }
        });

        it('should accept variant as Bootstrap color name', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                id: 'variant-modal',
                icon: 'check',
                variant: 'success',
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.variant).toBe('success');
            }
        });

        it('should accept variant as registry key', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                id: 'variant-modal',
                icon: 'check',
                variant: 'show',
            });
            expect(result.success).toBe(true);
        });
    });

    // -------------------------------------------------------------------------
    // invalid cases
    // -------------------------------------------------------------------------
    describe('invalid cases', () => {
        it('should reject wrong type value "icon"', () => {
            const result = ModalConfigZod.safeParse({ type: 'icon', id: 'modal', icon: 'check' });
            expect(result.success).toBe(false);
        });

        it('should reject wrong type value "static"', () => {
            const result = ModalConfigZod.safeParse({ type: 'static', id: 'modal', value: 'x' });
            expect(result.success).toBe(false);
        });

        it('should reject config with no id and no if/else (superRefine — id required)', () => {
            const result = ModalConfigZod.safeParse({ type: 'modal', icon: 'pencil' });
            expect(result.success).toBe(false);

            if (!result.success) {
                const idError = result.error.issues.find(i => i.path[0] === 'id');
                expect(idError).toBeDefined();
                expect(idError?.message).toContain('"id" is required');
            }
        });

        it('should reject config with id but no trigger and no if/else (superRefine — trigger required)', () => {
            const result = ModalConfigZod.safeParse({ type: 'modal', id: 'modal-1' });
            expect(result.success).toBe(false);

            if (!result.success) {
                const triggerError = result.error.issues.find(i => i.path[0] === 'icon');
                expect(triggerError).toBeDefined();
                expect(triggerError?.message).toContain('"icon"');
            }
        });

        it('should reject empty id string', () => {
            const result = ModalConfigZod.safeParse({ type: 'modal', id: '', icon: 'check' });
            expect(result.success).toBe(false);
        });

        it('should reject empty icon string', () => {
            const result = ModalConfigZod.safeParse({ type: 'modal', id: 'modal-1', icon: '' });
            expect(result.success).toBe(false);
        });

        it('should reject variant with CSS hex color syntax', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                id: 'modal-1',
                icon: 'check',
                variant: '#ff0000',
            });
            expect(result.success).toBe(false);
        });

        it('should reject invalid size value', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                id: 'modal-1',
                icon: 'check',
                size: 'huge',
            });
            expect(result.success).toBe(false);
        });

        it('should reject invalid target value', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                id: 'modal-1',
                content: { type: 'link' },
                target: '_invalid',
            });
            expect(result.success).toBe(false);
        });
    });

    // -------------------------------------------------------------------------
    // edge cases
    // -------------------------------------------------------------------------
    describe('edge cases', () => {
        it('should accept config with only if branches (trigger in branches, no root id)', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                if: [{ eq: 'active', id: 'modal-a', icon: 'check' }],
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with only else branch (no if, no root id)', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                else: { id: 'modal-b', icon: 'times' },
            });
            expect(result.success).toBe(true);
        });

        it('should reject config with empty if array, no else, and no id', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                if: [],
                icon: 'check',
            });
            expect(result.success).toBe(false);

            if (!result.success) {
                const idError = result.error.issues.find(i => i.path[0] === 'id');
                expect(idError).toBeDefined();
            }
        });

        it('should accept if branches containing arbitrary record objects (catchall)', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                id: 'modal-1',
                icon: 'check',
                if: [{ eq: 'active', id: 'modal-a', icon: 'check', someCustomField: 'value' }],
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with root id and if branches', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                id: 'default-modal',
                icon: 'info',
                key: 'status',
                if: [{ eq: 'active', id: 'active-modal' }],
            });
            expect(result.success).toBe(true);
        });

        it('should pass through unknown keys via catchall', () => {
            const result = ModalConfigZod.safeParse({
                type: 'modal',
                id: 'modal-1',
                icon: 'check',
                'data-custom': 'value',
                unknownField: 123,
            });
            expect(result.success).toBe(true);
        });
    });
});
