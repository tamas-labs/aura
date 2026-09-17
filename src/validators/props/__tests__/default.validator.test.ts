import { describe, it, expect } from 'vitest';
import { defaultValidators } from '../default.validator';

describe('defaultValidators', () => {
    const validators = defaultValidators();

    // Test constants for common expectations
    const TEST_UNDEFINED_ACCEPTED = 'accepts the undefined value (prop not passed)';
    const TEST_VALID_STRING = 'accepts a valid string value';
    const TEST_REJECT_NON_STRING = 'rejects non-string values';
    const TEST_BOOLEAN_ACCEPTED = 'accepts boolean values';
    const TEST_REJECT_NON_BOOLEAN = 'rejects non-boolean values';
    const VALIDATOR_NOT_FOUND_MSG = 'Validator not found for key:';

    // Helper for safely extracting the validator
    const getValidator = (key: string) => {
        const prop = validators[key];
        if (!prop || !prop.validator) {
            throw new Error(`${VALIDATOR_NOT_FOUND_MSG} ${key}`);
        }
        return prop.validator;
    };

    describe('storeId validator', () => {
        const validator = getValidator('storeId');

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });

        it(TEST_VALID_STRING, () => {
            expect(validator('my-store-id')).toBe(true);
            expect(validator('table-1')).toBe(true);
            expect(validator('')).toBe(true);
        });

        it(TEST_REJECT_NON_STRING, () => {
            expect(validator(123)).toBe(false);
            expect(validator(true)).toBe(false);
            expect(validator({})).toBe(false);
            expect(validator([])).toBe(false);
            expect(validator(null)).toBe(false);
        });
    });

    describe('debug validator', () => {
        const validator = getValidator('debug');

        it(TEST_BOOLEAN_ACCEPTED, () => {
            expect(validator(true)).toBe(true);
            expect(validator(false)).toBe(true);
        });

        it(TEST_REJECT_NON_BOOLEAN, () => {
            expect(validator(null)).toBe(false);
            expect(validator('true')).toBe(false);
            expect(validator(1)).toBe(false);
            expect(validator(0)).toBe(false);
        });

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });
    });

    describe('siteName validator', () => {
        const validator = getValidator('siteName');

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });

        it(TEST_VALID_STRING, () => {
            expect(validator('My Application')).toBe(true);
            expect(validator('Dashboard')).toBe(true);
            expect(validator('')).toBe(true);
        });

        it(TEST_REJECT_NON_STRING, () => {
            expect(validator(123)).toBe(false);
            expect(validator(true)).toBe(false);
            expect(validator(null)).toBe(false);
        });
    });

    describe('urlParameter validator', () => {
        const validator = getValidator('urlParameter');

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });

        it('accepts a valid URL parameter string', () => {
            expect(validator('id')).toBe(true);
            expect(validator('userId')).toBe(true);
            expect(validator('page')).toBe(true);
        });

        it(TEST_REJECT_NON_STRING, () => {
            expect(validator(123)).toBe(false);
            expect(validator(true)).toBe(false);
            expect(validator(null)).toBe(false);
        });
    });

    describe('urlParameterLastSegment validator', () => {
        const validator = getValidator('urlParameterLastSegment');

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });

        it(TEST_VALID_STRING, () => {
            expect(validator('edit')).toBe(true);
            expect(validator('create')).toBe(true);
        });

        it(TEST_REJECT_NON_STRING, () => {
            expect(validator(123)).toBe(false);
            expect(validator(false)).toBe(false);
            expect(validator(null)).toBe(false);
        });
    });

    describe('urlStructure validator', () => {
        const validator = getValidator('urlStructure');

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });

        it('accepts a valid URL structure string', () => {
            expect(validator('/api/users/:id')).toBe(true);
            expect(validator('/admin/posts')).toBe(true);
        });

        it(TEST_REJECT_NON_STRING, () => {
            expect(validator(123)).toBe(false);
            expect(validator([])).toBe(false);
            expect(validator(null)).toBe(false);
        });
    });

    describe('siteToken validator', () => {
        const validator = getValidator('siteToken');

        it('accepts the null value', () => {
            expect(validator(null)).toBe(true);
        });

        it('accepts boolean values', () => {
            expect(validator(true)).toBe(true);
            expect(validator(false)).toBe(true);
        });

        it('accepts string values', () => {
            expect(validator('abc123token')).toBe(true);
            expect(validator('Bearer xyz')).toBe(true);
            expect(validator('')).toBe(true);
        });

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });

        it('rejects non-boolean and non-string values', () => {
            expect(validator(123)).toBe(false);
            expect(validator({})).toBe(false);
            expect(validator([])).toBe(false);
        });
    });

    describe('paginateValues validator', () => {
        const validator = getValidator('paginateValues');

        it('accepts an empty array', () => {
            expect(validator([])).toBe(true);
        });

        it('accepts an array containing numbers', () => {
            expect(validator([10, 25, 50, 100])).toBe(true);
            expect(validator([5])).toBe(true);
        });

        it('accepts very long arrays too (no limit)', () => {
            const longArray = Array.from({ length: 100 }, (_, i) => i);
            expect(validator(longArray)).toBe(true);
        });

        it('rejects non-array values', () => {
            expect(validator(null)).toBe(false);
            expect(validator('10,25,50')).toBe(false);
            expect(validator(10)).toBe(false);
            expect(validator({})).toBe(false);
        });

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });
    });

    describe('rowsNumber validator', () => {
        const validator = getValidator('rowsNumber');

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });

        it('accepts valid numbers', () => {
            expect(validator(10)).toBe(true);
            expect(validator(25)).toBe(true);
            expect(validator(100)).toBe(true);
            expect(validator(0)).toBe(true);
            expect(validator(-5)).toBe(true);
        });

        it('rejects the NaN value', () => {
            expect(validator(NaN)).toBe(false);
        });

        it('rejects the Infinity value', () => {
            expect(validator(Infinity)).toBe(false);
            expect(validator(-Infinity)).toBe(false);
        });

        it('rejects non-number values', () => {
            expect(validator('10')).toBe(false);
            expect(validator(true)).toBe(false);
            expect(validator([])).toBe(false);
            expect(validator(null)).toBe(false);
        });
    });

    describe('showFooter validator', () => {
        const validator = getValidator('showFooter');

        it(TEST_BOOLEAN_ACCEPTED, () => {
            expect(validator(true)).toBe(true);
            expect(validator(false)).toBe(true);
        });

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });

        it(TEST_REJECT_NON_BOOLEAN, () => {
            expect(validator(null)).toBe(false);
            expect(validator(1)).toBe(false);
            expect(validator('true')).toBe(false);
        });
    });

    describe('actionButtons validator', () => {
        const validator = getValidator('actionButtons');

        it('accepts valid actionButtons arrays', () => {
            expect(validator(['refresh'])).toBe(true);
            expect(validator(['refresh', 'export'])).toBe(true);
            expect(validator([])).toBe(true);
            expect(validator(null)).toBe(true);
        });

        it('rejects invalid values', () => {
            expect(validator('false')).toBe(false);
            expect(validator(true)).toBe(false);
            expect(validator(123)).toBe(false);
        });
    });

    describe('showHeaderSearch validator', () => {
        const validator = getValidator('showHeaderSearch');

        it(TEST_BOOLEAN_ACCEPTED, () => {
            expect(validator(true)).toBe(true);
            expect(validator(false)).toBe(true);
        });

        it(TEST_REJECT_NON_BOOLEAN, () => {
            expect(validator(null)).toBe(false);
            expect(validator(0)).toBe(false);
        });
    });

    describe('showLoadingOverlay validator', () => {
        const validator = getValidator('showLoadingOverlay');

        it(TEST_BOOLEAN_ACCEPTED, () => {
            expect(validator(true)).toBe(true);
            expect(validator(false)).toBe(true);
        });

        it(TEST_REJECT_NON_BOOLEAN, () => {
            expect(validator(null)).toBe(false);
            expect(validator(0)).toBe(false);
        });
    });

    describe('showToolbarTitle validator', () => {
        const validator = getValidator('showToolbarTitle');

        it(TEST_BOOLEAN_ACCEPTED, () => {
            expect(validator(true)).toBe(true);
            expect(validator(false)).toBe(true);
        });

        it(TEST_REJECT_NON_BOOLEAN, () => {
            expect(validator(null)).toBe(false);
            expect(validator(0)).toBe(false);
        });
    });

    describe('toolbarTitleContent validator', () => {
        const validator = getValidator('toolbarTitleContent');

        it(TEST_VALID_STRING, () => {
            expect(validator('My Title')).toBe(true);
            expect(validator('')).toBe(true);
        });

        it(TEST_REJECT_NON_STRING, () => {
            expect(validator(123)).toBe(false);
            expect(validator(true)).toBe(false);
            expect(validator(null)).toBe(false);
        });

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });
    });

    describe('externalPaginator validator', () => {
        const validator = getValidator('externalPaginator');

        it(TEST_BOOLEAN_ACCEPTED, () => {
            expect(validator(true)).toBe(true);
            expect(validator(false)).toBe(true);
        });

        it(TEST_REJECT_NON_BOOLEAN, () => {
            expect(validator(null)).toBe(false);
            expect(validator('true')).toBe(false);
        });
    });

    describe('dateStyle validator', () => {
        const validator = getValidator('dateStyle');

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });

        it('accepts valid date style strings', () => {
            expect(validator('short')).toBe(true);
            expect(validator('medium')).toBe(true);
            expect(validator('long')).toBe(true);
        });

        it(TEST_REJECT_NON_STRING, () => {
            expect(validator(123)).toBe(false);
            expect(validator(true)).toBe(false);
            expect(validator(null)).toBe(false);
        });
    });

    describe('timeZone validator', () => {
        const validator = getValidator('timeZone');

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });

        it('accepts valid timezone strings', () => {
            expect(validator('Europe/Budapest')).toBe(true);
            expect(validator('America/New_York')).toBe(true);
            expect(validator('UTC')).toBe(true);
        });

        it(TEST_REJECT_NON_STRING, () => {
            expect(validator(123)).toBe(false);
            expect(validator({})).toBe(false);
            expect(validator(null)).toBe(false);
        });
    });

    describe('utcOffset validator', () => {
        const validator = getValidator('utcOffset');

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });

        it('accepts valid UTC offset strings', () => {
            expect(validator('+01:00')).toBe(true);
            expect(validator('-05:00')).toBe(true);
            expect(validator('Z')).toBe(true);
        });

        it(TEST_REJECT_NON_STRING, () => {
            expect(validator(1)).toBe(false);
            expect(validator(true)).toBe(false);
            expect(validator(null)).toBe(false);
        });
    });

    describe('localization validator', () => {
        const validator = getValidator('localization');

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });

        it('accepts valid locale strings', () => {
            expect(validator('hu-HU')).toBe(true);
            expect(validator('en-US')).toBe(true);
            expect(validator('de-DE')).toBe(true);
        });

        it(TEST_REJECT_NON_STRING, () => {
            expect(validator(123)).toBe(false);
            expect(validator([])).toBe(false);
            expect(validator(null)).toBe(false);
        });
    });

    describe('currencyCode validator', () => {
        const validator = getValidator('currencyCode');

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });

        it('accepts valid currency codes', () => {
            expect(validator('HUF')).toBe(true);
            expect(validator('USD')).toBe(true);
            expect(validator('EUR')).toBe(true);
        });

        it(TEST_REJECT_NON_STRING, () => {
            expect(validator(123)).toBe(false);
            expect(validator(true)).toBe(false);
            expect(validator(null)).toBe(false);
        });
    });

    describe('resources validator', () => {
        const validator = getValidator('resources');

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });

        it(TEST_BOOLEAN_ACCEPTED, () => {
            expect(validator(true)).toBe(true);
            expect(validator(false)).toBe(true);
        });

        it('rejects non-boolean values', () => {
            expect(validator('true')).toBe(false);
            expect(validator(1)).toBe(false);
            expect(validator(null)).toBe(false);
        });
    });

    describe('requestMethod validator', () => {
        const validator = getValidator('requestMethod');

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });

        it('accepts valid HTTP method strings', () => {
            expect(validator('GET')).toBe(true);
            expect(validator('POST')).toBe(true);
            expect(validator('PUT')).toBe(true);
            expect(validator('DELETE')).toBe(true);
        });

        it(TEST_REJECT_NON_STRING, () => {
            expect(validator(123)).toBe(false);
            expect(validator(true)).toBe(false);
            expect(validator(null)).toBe(false);
        });
    });

    describe('sessionKey validator', () => {
        const validator = getValidator('sessionKey');

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });

        it('accepts valid session key strings', () => {
            expect(validator('my-session-key')).toBe(true);
            expect(validator('table_state_1')).toBe(true);
        });

        it(TEST_REJECT_NON_STRING, () => {
            expect(validator(123)).toBe(false);
            expect(validator([])).toBe(false);
            expect(validator(null)).toBe(false);
        });
    });

    describe('disableSession validator', () => {
        const validator = getValidator('disableSession');

        it(TEST_BOOLEAN_ACCEPTED, () => {
            expect(validator(true)).toBe(true);
            expect(validator(false)).toBe(true);
        });

        it(TEST_REJECT_NON_BOOLEAN, () => {
            expect(validator(null)).toBe(false);
            expect(validator('false')).toBe(false);
            expect(validator(0)).toBe(false);
        });
    });

    describe('accentInsensitiveSearch validator', () => {
        const validator = getValidator('accentInsensitiveSearch');

        it(TEST_BOOLEAN_ACCEPTED, () => {
            expect(validator(true)).toBe(true);
            expect(validator(false)).toBe(true);
        });

        it(TEST_REJECT_NON_BOOLEAN, () => {
            expect(validator(null)).toBe(false);
            expect(validator('true')).toBe(false);
        });

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });
    });

    describe('highlightSearchResults validator', () => {
        const validator = getValidator('highlightSearchResults');

        it(TEST_BOOLEAN_ACCEPTED, () => {
            expect(validator(true)).toBe(true);
            expect(validator(false)).toBe(true);
        });

        it(TEST_REJECT_NON_BOOLEAN, () => {
            expect(validator(null)).toBe(false);
            expect(validator('true')).toBe(false);
        });

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });
    });

    describe('highlightClass validator', () => {
        const validator = getValidator('highlightClass');

        it(TEST_VALID_STRING, () => {
            expect(validator('my-highlight-class')).toBe(true);
        });

        it(TEST_REJECT_NON_STRING, () => {
            expect(validator(123)).toBe(false);
            expect(validator(true)).toBe(false);
        });

        it(TEST_UNDEFINED_ACCEPTED, () => {
            expect(validator(undefined)).toBe(true);
        });
    });

    describe('Validator structure', () => {
        it('every validator contains the required fields', () => {
            Object.entries(validators).forEach(([, validatorConfig]) => {
                expect(validatorConfig).toHaveProperty('type');
                expect(validatorConfig).toHaveProperty('required');
                expect(validatorConfig).toHaveProperty('validator');
                expect(typeof validatorConfig.validator).toBe('function');
            });
        });

        it('every validator has required set to false', () => {
            Object.values(validators).forEach(validator => {
                expect(validator.required).toBe(false);
            });
        });

        it('validators do NOT contain a default value (except Boolean props)', () => {
            Object.entries(validators).forEach(([key, validatorConfig]) => {
                if (validatorConfig.type === Boolean && key !== 'siteToken') {
                    // Boolean props MUST have default: undefined
                    expect(validatorConfig).toHaveProperty('default', undefined);
                } else {
                    // Non-Boolean props should NOT have default
                    expect(validatorConfig).not.toHaveProperty(
                        'default',
                        `${key} validator should not contain a default value`
                    );
                }
            });
        });
    });

    describe('Edge cases', () => {
        it('string validators handle an empty string', () => {
            expect(getValidator('storeId')('')).toBe(true);
            expect(getValidator('siteName')('')).toBe(true);
        });

        it('number validators handle the value 0', () => {
            expect(getValidator('rowsNumber')(0)).toBe(true);
        });

        it('number validators handle negative numbers', () => {
            expect(getValidator('rowsNumber')(-10)).toBe(true);
        });

        it('array validator handles an empty array', () => {
            expect(getValidator('paginateValues')([])).toBe(true);
        });

        it('siteToken validator handles all three types', () => {
            expect(getValidator('siteToken')(null)).toBe(true);
            expect(getValidator('siteToken')(true)).toBe(true);
            expect(getValidator('siteToken')('token')).toBe(true);
        });
    });
});
