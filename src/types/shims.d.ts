/**
 * Ambient module declarations for non-TypeScript imports.
 *
 * The package entry point (`index.ts`) pulls in the compiled stylesheet as a
 * side effect. Without this shim `tsc` reports TS2882 for that import, which is
 * what previously kept `index.ts` out of the type-check `include` list.
 */
declare module '*.scss';
declare module '*.css';
