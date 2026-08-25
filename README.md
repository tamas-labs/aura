# Aura

Vue 3 data-table plugin built on Bootstrap 5, with TypeScript, Pinia state, and Zod-validated,
Laravel-compatible API responses.

> 📖 **[Full reference documentation →](./README.en.md)** · 🇭🇺 **[Magyarul →](./README.hu.md)**
> This short README covers installation and the basics; the full reference (all config options,
> column types, conditional rendering, Store API, error handling, validation architecture) lives
> in [README.en.md](./README.en.md) (English) and [README.hu.md](./README.hu.md) (Hungarian).

## Features

- 🚀 **Vue 3** + Composition API, TSX components (no SFC templates)
- 📦 **TypeScript** — all config, props, and API response types are exported
- 🎨 **Bootstrap 5** styling out of the box
- 🔄 **Pinia**-backed state, with multiple independent table instances per page (`storeId`)
- ✅ **Zod**-validated API responses, sanitized HTML rendering (DOMPurify)
- 🛡️ Built-in **error handling** (ECS-compatible error objects), optional remote error reporting
- ⏳ Built-in **loading state** — a `loading` store property plus two optional, independent
  indicators: a thin progress bar (`showLoadingBar`) and a delayed overlay (`showLoadingOverlay`)
- 🌐 **Localizable UI labels** (`labels` config) and `Intl`-based number/date/currency formatting
- ⚡ Server-side or client-side pagination, sorting, search, and filtering
- 🧩 Nine column types: `static`, `icon`, `link`, `button`, `badge`, `progress`, `reference`,
  `modal`, and `custom` (host-provided renderer/callback)

## Installation

```bash
npm install @tamas-labs/aura
```

> **ESM-only package.** Aura ships as ES modules only (`"type": "module"`, no CommonJS/`require`
> build) and requires **Node ≥ 20**. Use it with a modern bundler (Vite, webpack 5, Rollup) or a
> native ESM environment. Peer dependencies are not bundled — install them in your host app.

### Peer dependencies

```bash
npm install vue@^3.4.0 pinia@^3.0.3 bootstrap@^5.3.3 axios@^1.7.0 isomorphic-dompurify@^2.31.0 libphonenumber-js@^1.12.37
```

`isomorphic-dompurify` 3.x is supported as well (`^2.31.0 || ^3.0.0`); the 2.x floor is shown here
because 3.x requires a newer Node. See the full README for the details.

### Bundle size

**62.1 kB gzipped** in total (53.1 kB main chunk + 8.8 kB lazily loaded validator chunks), peer
dependencies excluded. About **18 kB (29 %)** of that is **zod**, which — unlike the peer
dependencies — is bundled in, because response validation is a core feature. See the
[bundle size breakdown](./README.en.md#bundle-size) for the details and the trade-off.

### Bootstrap CSS

```typescript
// main.ts
import 'bootstrap/dist/css/bootstrap.min.css';
```

## Quick start

```typescript
// main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Aura from '@tamas-labs/aura';
import App from './App.vue';

const app = createApp(App);
app.use(createPinia()); // required: Aura keeps table state in Pinia stores
app.use(Aura, {
    siteName: 'https://api.example.com',
    rowsNumber: 10,
    externalPaginator: true,
});
app.mount('#app');
```

Pinia is not optional — without an active instance the table renders nothing and Vue reports
Pinia's own `getActivePinia()` error. If your app already registers Pinia, Aura uses that
instance.

```vue
<!-- App.vue -->
<template>
    <Aura url-parameter="users" />
</template>
```

Aura resolves the request endpoint from `siteName` + `urlParameter` + `urlParameterLastSegment`,
and expects a Laravel-compatible JSON response shape (`header`, `items`, `meta`, `links`). See the
full [API response reference](./README.en.md#api-response-structure) for details.

## Configuration

Config merges in three layers, increasing priority: **default config → global config (`app.use`)
→ props**.

```typescript
import type { AuraConfig } from '@tamas-labs/aura';

const auraConfig: AuraConfig = {
    siteName: 'https://api.example.com',
    rowsNumber: 10,
    externalPaginator: true,
    icons: {
        sortable: { up: ['fas', 'fa-caret-up'], down: ['fas', 'fa-caret-down'], both: ['fas', 'fa-sort'] },
    },
    labels: {
        confirmDeleteTitle: 'Delete this row?',
        refresh: 'Reload',
    },
};

export default auraConfig;
```

### Multiple table instances

Each table instance gets its own Pinia-backed state, keyed by `storeId`:

```typescript
app.use(Aura, { storeId: 'users-table' });
app.use(Aura, { storeId: 'products-table' });
```

## Cell formatting at a glance

Column configs support content formatting (`number`, `currency`, `date`, `datetime`, `phone`,
`raw` sanitized HTML), text transforms (`uppercase` / `lowercase` / `capitalize`), truncation
(`slice` / `sliceEnd`), and padding. See the full
[Cell Formatting reference](./README.en.md#cell-formatting) for the complete table and priority
order.

## TypeScript

```typescript
import type { AuraConfig, AuraProps, ApiResponse } from '@tamas-labs/aura';
```

## Documentation

📖 **[README.en.md](./README.en.md)** — full reference documentation (English): all config
options, column types, conditional rendering/styling, Store API, error handling, validation
architecture, and usage examples.

🇭🇺 **[README.hu.md](./README.hu.md)** — the same full reference in Hungarian.

📝 **[CHANGELOG.md](./CHANGELOG.md)** — release history.

🤝 **[CONTRIBUTING.md](./CONTRIBUTING.md)** — development setup, quality gates, release process.

🔒 **[SECURITY.md](./SECURITY.md)** — how to report a vulnerability.

## Development

```bash
npm test                # vitest (watch)
npm run test:coverage   # coverage report
npm run build           # tsc && vite build
npm run type-check      # tsc --noEmit
npm run lint            # eslint
npm run format          # prettier --write src/
```

## License

MIT

## Author

Tamas Balint
