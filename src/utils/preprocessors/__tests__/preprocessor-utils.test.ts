import { describe, it, expect } from 'vitest';
import {
    snakeToCamel,
    snakeToTitleCase,
    resolveIconClassesFromRegistry,
    resolveMergedIconClasses,
} from '../preprocessor-utils';

describe('preprocessor-utils', () => {
    describe('snakeToCamel', () => {
        describe('valid cases', () => {
            it('should convert single underscore to camelCase', () => {
                expect(snakeToCamel('switch_user')).toBe('switchUser');
            });

            it('should convert multiple underscores to camelCase', () => {
                expect(snakeToCamel('my_long_name')).toBe('myLongName');
            });

            it('should return single word unchanged', () => {
                expect(snakeToCamel('destroy')).toBe('destroy');
            });

            it('should handle three segments', () => {
                expect(snakeToCamel('get_user_id')).toBe('getUserId');
            });
        });

        describe('edge cases', () => {
            it('should return empty string unchanged', () => {
                expect(snakeToCamel('')).toBe('');
            });

            it('should not uppercase digits after underscore', () => {
                // /_([a-z])/ only matches lowercase letters, not digits
                expect(snakeToCamel('field_2')).toBe('field_2');
                expect(snakeToCamel('switch_user_2')).toBe('switchUser_2');
            });
        });
    });

    describe('snakeToTitleCase', () => {
        describe('valid cases', () => {
            it('should convert single underscore to Title Case', () => {
                expect(snakeToTitleCase('switch_user')).toBe('Switch User');
            });

            it('should convert multiple underscores to Title Case', () => {
                expect(snakeToTitleCase('my_long_name')).toBe('My Long Name');
            });

            it('should capitalize a single word', () => {
                expect(snakeToTitleCase('destroy')).toBe('Destroy');
            });

            it('should handle three segments', () => {
                expect(snakeToTitleCase('get_user_id')).toBe('Get User Id');
            });
        });

        describe('edge cases', () => {
            it('should return empty string unchanged', () => {
                expect(snakeToTitleCase('')).toBe('');
            });
        });
    });

    describe('resolveIconClassesFromRegistry', () => {
        const icons = {
            primary: ['fas', 'fa-file'],
            show: ['fas', 'fa-eye'],
            switchUser: ['fas', 'fa-user-secret'],
        };
        const variants = {
            primary: 'secondary',
            info: 'info',
            danger: 'danger',
        };

        describe('icon lookup', () => {
            it('should return icon classes when key exists', () => {
                const result = resolveIconClassesFromRegistry('show', icons, null, undefined);
                expect(result).toEqual(['fas', 'fa-eye']);
            });

            it('should fall back to primary when icon key not found', () => {
                const result = resolveIconClassesFromRegistry('unknown', icons, null, undefined);
                expect(result).toEqual(['fas', 'fa-file']);
            });

            it('should return empty array when icons registry is undefined', () => {
                const result = resolveIconClassesFromRegistry('show', undefined, null, undefined);
                expect(result).toEqual([]);
            });

            it('should return empty array when iconKey is null', () => {
                const result = resolveIconClassesFromRegistry(null, icons, null, undefined);
                expect(result).toEqual([]);
            });
        });

        describe('variant lookup', () => {
            it('should return text-{variant} class when variant key exists', () => {
                const result = resolveIconClassesFromRegistry(null, undefined, 'info', variants);
                expect(result).toEqual(['text-info']);
            });

            it('should fall back to primary variant when key not found', () => {
                const result = resolveIconClassesFromRegistry(null, undefined, 'unknown', variants);
                expect(result).toEqual(['text-secondary']);
            });

            it('should return empty array when variants registry is undefined', () => {
                const result = resolveIconClassesFromRegistry(null, undefined, 'info', undefined);
                expect(result).toEqual([]);
            });

            it('should return empty array when variantKey is null', () => {
                const result = resolveIconClassesFromRegistry(null, undefined, null, variants);
                expect(result).toEqual([]);
            });
        });

        describe('combined icon and variant', () => {
            it('should combine icon classes and text-{variant}', () => {
                const result = resolveIconClassesFromRegistry('show', icons, 'info', variants);
                expect(result).toEqual(['fas', 'fa-eye', 'text-info']);
            });

            it('should combine camelCase key for both registries', () => {
                const result = resolveIconClassesFromRegistry(
                    'switchUser',
                    icons,
                    'danger',
                    variants
                );
                expect(result).toEqual(['fas', 'fa-user-secret', 'text-danger']);
            });

            it('should return empty array when both registries are undefined', () => {
                const result = resolveIconClassesFromRegistry('show', undefined, 'info', undefined);
                expect(result).toEqual([]);
            });
        });
    });

    describe('prototype-chain keys in the registries', () => {
        // Regression guard: registry keys come from the API response (a `*_icon` header
        // field name, a badge branch's iconKey, a config object's icon/variant), so a
        // plain bracket lookup used to hand back `Object.prototype` members. On the
        // render path that TypeError has no error boundary above it.
        const PROTO_KEYS = ['constructor', 'toString', 'valueOf', 'hasOwnProperty', '__proto__'];

        const icons = { primary: ['fas', 'fa-file'], show: ['fas', 'fa-eye'] };
        const variants = { primary: 'secondary', info: 'info' };
        const iconsWithoutFallback = { show: ['fas', 'fa-eye'] };
        const variantsWithoutFallback = { info: 'info' };

        it.each(PROTO_KEYS)('should fall back to primary for inherited icon key "%s"', protoKey => {
            expect(() =>
                resolveIconClassesFromRegistry(protoKey, icons, null, undefined)
            ).not.toThrow();
            expect(resolveIconClassesFromRegistry(protoKey, icons, null, undefined)).toEqual([
                'fas',
                'fa-file',
            ]);
        });

        it.each(PROTO_KEYS)(
            'should fall back to primary for inherited variant key "%s"',
            protoKey => {
                expect(resolveIconClassesFromRegistry(null, undefined, protoKey, variants)).toEqual(
                    ['text-secondary']
                );
            }
        );

        it.each(PROTO_KEYS)(
            'should return an empty array for inherited key "%s" without a primary fallback',
            protoKey => {
                expect(
                    resolveIconClassesFromRegistry(
                        protoKey,
                        iconsWithoutFallback,
                        protoKey,
                        variantsWithoutFallback
                    )
                ).toEqual([]);
            }
        );

        it('should still read an own key that shadows a prototype member', () => {
            // `toString` is not a forbidden proto name — an own entry under it is the
            // host's own registry data and must keep working.
            expect(
                resolveIconClassesFromRegistry(
                    'toString',
                    { ...icons, toString: ['fas', 'fa-quote-left'] },
                    null,
                    undefined
                )
            ).toEqual(['fas', 'fa-quote-left']);
        });

        it('should refuse an own key on the forbidden proto list', () => {
            // `constructor` is refused even as an own entry: it never carries registry
            // data, and accepting it would reopen the same lookup for a crafted response.
            expect(
                resolveIconClassesFromRegistry(
                    'constructor',
                    { ...icons, constructor: ['fas', 'fa-bug'] },
                    null,
                    undefined
                )
            ).toEqual(['fas', 'fa-file']);
        });

        it.each(PROTO_KEYS)('should not throw from resolveMergedIconClasses for "%s"', protoKey => {
            const source = { icon: protoKey, variant: protoKey, class: 'extra' };
            expect(resolveMergedIconClasses(source, icons, variants)).toEqual([
                'fas',
                'fa-file',
                'text-secondary',
                'extra',
            ]);
        });
    });
});
