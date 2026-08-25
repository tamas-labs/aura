import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import dts from 'vite-plugin-dts';
import { visualizer } from 'rollup-plugin-visualizer';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        vue(),
        vueJsx(),
        dts({
            insertTypesEntry: true,
            rollupTypes: true, // A single flattened dist/index.d.ts (no per-file dist/src/** type tree)
            include: ['index.ts', 'src/**/*.ts', 'src/**/*.tsx'], // the root entry is required, otherwise the rollup emits an empty index.d.ts
            exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        }),
        visualizer({
            filename: './report/stats.html', // outside dist → never ends up in the published package ("files": ["dist"])
            open: false,
            gzipSize: true,
            brotliSize: true,
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'index.ts'), // Use the root index.ts
            name: 'Aura',
            formats: ['es'],
            fileName: () => 'index.js',
            cssFileName: 'style', // dist/style.css (in sync with the package.json "./style.css" export and the README)
        },
        rollupOptions: {
            external: ['vue', 'pinia', 'bootstrap', 'isomorphic-dompurify', 'libphonenumber-js/min', 'axios'],
            output: {
                globals: {
                    vue: 'Vue',
                    pinia: 'Pinia',
                    bootstrap: 'Bootstrap',
                    'isomorphic-dompurify': 'DOMPurify',
                    'libphonenumber-js/min': 'libphonenumber',
                    axios: 'axios',
                },
                // ES module export mode
                exports: 'named',
            },
        },
        sourcemap: false, // The published package ships no .js.map files (cleaner, ~1.3 MB smaller tarball)
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                passes: 2,
                pure_funcs: ['console.log'],
            },
        },
    },
});
