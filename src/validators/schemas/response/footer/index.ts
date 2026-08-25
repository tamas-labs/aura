/**
 * Only export lazy validators to prevent bundle bloat.
 * Synchronous validators are strictly internal or for testing.
 */
export * from './lazy';
