import type { AuraConfig } from './src/types/config.types';

/**
 * Example configuration for the Aura plugin.
 * Kept at the project root as a reference for host applications.
 */
export const auraConfig: AuraConfig = {
    siteName: 'Aura Table',

    // Pagination settings
    rowsNumber: 10,
    externalPaginator: false,

    // Render the table footer
    showFooter: true,
};

export default auraConfig;
