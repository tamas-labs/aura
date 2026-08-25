import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    environmentOptions: {
      happyDOM: {
        settings: {
          disableJavaScriptFileLoading: true,
          disableCSSFileLoading: true,
          disableIframePageLoading: true,
        }
      }
    },
    // happy-dom fetch failures are noise rather than real errors, but keep the output
    // visible so genuine test logs are not swallowed with them.
    silent: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Without `include`, Vitest only reports files that a test actually imported —
      // a brand new module with no tests at all would not lower coverage, so the
      // thresholds below could not catch it. The glob makes untested files count too.
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.config.ts',
        '**/types/**'
      ],
      // Coverage gate for CI (`npm run test:coverage:ci`, see ci.yml and release.yml).
      // Tuned just below the current actual values (statements ~98%, branches ~92%,
      // functions ~99%, lines ~99%) so small fluctuations pass but a regression fails.
      thresholds: {
        statements: 95,
        branches: 88,
        functions: 95,
        lines: 95
      }
    }
  }
})
