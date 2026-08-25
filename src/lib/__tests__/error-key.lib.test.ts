import { describe, it, expect } from 'vitest';
import { buildFallbackErrorKey, isFallbackErrorKey } from '../error-key.lib';
import type { ErrorType } from '../../types/error.types';

describe('error-key.lib', () => {
    const COMPONENT = 'ApiResourcesStore';
    const ACTION = 'fetchData';
    const API_TYPE: ErrorType = 'api';
    const EXPECTED_KEY = 'ApiResourcesStore.fetchData.api';

    describe('buildFallbackErrorKey', () => {
        it('should join the triplet with dots', () => {
            expect(buildFallbackErrorKey(COMPONENT, ACTION, API_TYPE)).toBe(EXPECTED_KEY);
        });

        it('should be deterministic for the same triplet', () => {
            expect(buildFallbackErrorKey(COMPONENT, ACTION, API_TYPE)).toBe(
                buildFallbackErrorKey(COMPONENT, ACTION, API_TYPE)
            );
        });

        it('should produce different keys for different error types', () => {
            expect(buildFallbackErrorKey(COMPONENT, ACTION, 'authorization')).not.toBe(
                buildFallbackErrorKey(COMPONENT, ACTION, API_TYPE)
            );
        });

        it('should produce different keys for different actions', () => {
            expect(buildFallbackErrorKey(COMPONENT, 'clearData', API_TYPE)).not.toBe(
                buildFallbackErrorKey(COMPONENT, ACTION, API_TYPE)
            );
        });

        it('should produce different keys for different components', () => {
            expect(buildFallbackErrorKey('CoreStore', ACTION, API_TYPE)).not.toBe(
                buildFallbackErrorKey(COMPONENT, ACTION, API_TYPE)
            );
        });
    });

    describe('isFallbackErrorKey', () => {
        it('should return true for a generated key', () => {
            expect(
                isFallbackErrorKey({
                    component: COMPONENT,
                    action: ACTION,
                    type: API_TYPE,
                    key: EXPECTED_KEY,
                })
            ).toBe(true);
        });

        it('should return false for a caller-supplied key', () => {
            expect(
                isFallbackErrorKey({
                    component: COMPONENT,
                    action: ACTION,
                    type: API_TYPE,
                    key: 'icons',
                })
            ).toBe(false);
        });

        it('should return false when the key is missing', () => {
            expect(
                isFallbackErrorKey({
                    component: COMPONENT,
                    action: ACTION,
                    type: API_TYPE,
                })
            ).toBe(false);
        });
    });
});
