# Aura

> 🇭🇺 **[Olvasd el magyarul →](./README.hu.md)** · 🇬🇧 **[Short overview →](./README.md)**
> (installation, quick start, config basics). This file is the **full** English reference
> documentation.

A Vue 3 table component plugin built on Bootstrap 5, with TypeScript and TSX support.

## Features

- 🚀 **Vue 3** + Composition API + TSX
- 📦 **TypeScript** type safety
- 🎨 **Bootstrap 5** CSS framework
- 🔄 **Pinia** state management
- ✅ **Zod** validation and runtime type checking
- 🧪 **Vitest** testing framework
- 🔍 **ESLint** + SonarJS code quality
- ⚡ **Vite** fast build and HMR
- 🛡️ **ECS-compatible error handling** — Elastic Common Schema based error tracking

## Installation

```bash
npm install @tamas-labs/aura
```

> **ESM-only package.** Aura is published exclusively as ES modules (`"type": "module"`,
> no CommonJS/`require` build), and requires Node **≥ 20**. It can be used with a modern
> bundler (Vite, webpack 5, Rollup) or in a native ESM environment. The package does not
> bundle the peer dependencies — these are provided by the host application (see below).

### Peer Dependencies

Aura requires the following peer dependencies, which must be installed separately in the host application:

```bash
npm install vue@^3.4.0 pinia@^3.0.3 bootstrap@^5.3.3 axios@^1.7.0 isomorphic-dompurify@^2.31.0 libphonenumber-js@^1.12.37
```

> **`isomorphic-dompurify` 3.x is supported too** — the peer range is `^2.31.0 || ^3.0.0`. The
> command above installs the 2.x floor because it runs on every Node the package itself supports
> (**≥ 20**); 3.x raises the floor with each minor (3.0 needs Node ≥ 20.19, 3.22 already needs
> ≥ 22.22.2), so pick it only if your host is on a matching Node. The sanitize API is identical
> across the two majors — Aura's own test suite passes on both. One difference worth knowing if
> you write tests: under Node, 3.x exports a `Proxy` instead of the DOMPurify instance, so
> `DOMPurify.sanitize` cannot be spied on or monkey-patched (calling it works normally).

**Why peer dependencies?**

- **Bundle size optimization**: peer dependencies are not included in the Aura bundle, keeping its size down
- **Version freedom**: the host app can choose the most suitable version
- **Avoiding duplication**: no need to install the same library multiple times

### Bundle size

Aura ships one main ES module plus a few validator chunks that are loaded lazily, on the first
API response. Measured on **v1.0.0** (production build, peer dependencies excluded):

| Chunk                                              | Minified   | Gzipped     |
| -------------------------------------------------- | ---------- | ----------- |
| `dist/index-*.js` (main)                            | 189.7 kB   | **53.1 kB** |
| Lazy response-schema chunks (header / body / footer)| 31.5 kB    | 8.8 kB      |
| **Total JS**                                        | 221.5 kB   | **62.1 kB** |
| `dist/style.css`                                    | 1.3 kB     | 0.5 kB      |

Both totals are budget-gated in CI (`size-limit`: 70 kB for the main chunk, 80 kB for all JS), so
a size regression fails the build rather than reaching npm silently.

**Zod is bundled — it accounts for roughly a third of that.** Unlike the peer dependencies, `zod`
is a regular `dependency` and is compiled into the main chunk, because response validation is a
core feature rather than something the host opts into. Its cost, measured by building the same
sources with `zod` marked external:

| Build                | Main chunk (gzip) | Total JS (gzip) |
| -------------------- | ----------------- | --------------- |
| As published         | 53.1 kB           | 62.1 kB         |
| Without zod          | 34.9 kB           | 44.0 kB         |
| **Zod's share**      | **18.2 kB (34 %)**| **18.1 kB (29 %)** |

The trade-off to be aware of: because Aura's copy of zod lives *inside* the published bundle, a
host application that also uses zod ships it twice — bundlers cannot deduplicate a pre-bundled
copy. This is a deliberate 0.x decision (nothing to install, no version conflict with the host's
zod, and 62.1 kB is comfortably inside the budget).

**What the alternatives would buy, measured rather than estimated.** Rewriting the schemas
against the function-based `zod/mini` API was measured on a probe carrying the same feature
surface the real schema files use (objects, records, unions, enums, tuples, string and number
checks, `catchall`, `merge`, `superRefine`, `transform`, `default`, `catch`), verified to produce
identical `safeParse` results — issue codes, paths and messages included: **18.7 kB → 8.0 kB
gzipped**. Against that saving, the function-based style makes the compiled schema code itself
about 10 % larger — and that part scales with the 80 schema files while the runtime saving does
not — so a full port would land the main chunk near **44 kB** rather than at 35 kB. Making `zod`
a peer dependency removes the whole 18.2 kB, but it moves the install and the version range onto
every consumer.

Neither is worth doing while the main chunk sits 24 % below its budget, so 0.x keeps the bundled
`zod`. Both remain open for a future major version — and neither is a breaking change to the *types*:
`dist/index.d.ts` does not reference zod at all, so the schema API in use is an implementation
detail. What the 0.x source does keep out of its way is zod's v3 compatibility layer
(`ZodIssueCode`, `ZodTypeAny`, `ZodSchema` and the rest of `zod/v4/classic/compat`): those
aliases are deprecated, have no `zod/mini` counterpart, and a test fails the build if one
reappears.

### Importing Bootstrap CSS

Aura is Bootstrap 5 based, so importing the Bootstrap CSS is required:

```typescript
// main.ts or App.vue
import 'bootstrap/dist/css/bootstrap.min.css';
```

Or if you use a custom Bootstrap build:

```scss
// styles/main.scss
@import 'bootstrap/scss/bootstrap';
```

## Installing development dependencies

```bash
npm install
```

## Usage

### Plugin registration

```typescript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Aura from '@tamas-labs/aura';
import auraConfig from './aura.config';
import App from './App.vue';

const app = createApp(App);
app.use(createPinia()); // required — see below
app.use(Aura, auraConfig);
app.mount('#app');
```

> **Pinia is not optional.** Aura keeps every table's state in `storeId`-keyed Pinia stores, so
> the component resolves one the moment it is set up. Without an active Pinia the table renders
> nothing and Vue reports Pinia's own
> `[🍍]: "getActivePinia()" was called but there was no active Pinia` — a message that never
> names Aura. If the host application already calls `app.use(createPinia())` for its own state,
> Aura uses that instance; the order of the two `app.use` calls does not matter.

### Configuration

Create an `aura.config.ts` file in the project root:

```typescript
import type { AuraConfig } from '@tamas-labs/aura';

export const auraConfig: AuraConfig = {
    siteName: 'Aura Table',
    icons: {
        sortable: {
            up: ['fas', 'fa-caret-up'],
            down: ['fas', 'fa-caret-down'],
            both: ['fas', 'fa-sort'],
        },
        search: ['fas', 'fa-magnifying-glass'],
        clear: ['fas', 'fa-xmark'],
        // ... further icons
    },
    rowsNumber: 10,
    externalPaginator: false,
};

export default auraConfig;
```

## Configuration Hierarchy

Aura uses a three-level configuration system, in priority order:

1. **Config file** (defaults) — `aura.config.ts`
2. **Props** (component level) — override the config values
3. **API parameters** (dynamic) — override everything

### Example priority order

```typescript
// 1. Config file (defaults)
export default {
  rowsNumber: 10
}

// 2. Props (override the config)
<Aura :rows-number="25" />

// 3. API response (overrides everything)
{
  "variables": {
    "config": {
      "rowsNumber": 50
    }
  }
}
// Final result: rowsNumber = 50
```

### Multi-instance support

Using multiple table instances on the same page:

```typescript
// First table instance
app.use(Aura, { storeId: 'users-table', debug: true });

// Second table instance
app.use(Aura, { storeId: 'products-table', debug: false });
```

## Session Persistence

Aura automatically saves the table state configured by the user to the browser's
`sessionStorage`, and restores it when the page is reloaded.

### Saved data
- **Pagination:** current page (`page`), number of rows (`limit`)
- **Sorting:** active sort fields and directions (`sortItems`)
- **Search:** column-level searches (`searchItems`) and global search (`globalSearchTerm`)
- **Filtering:** active filters (`filterItems`)
- **Selection:** selected row identifiers (`selectedRows`)

### Behavior
- Saving happens automatically on every state change, **debounced by 250 ms**: a burst of
  changes — a "select all" over hundreds of rows, or fast paging — results in a *single*
  serialization + write instead of one per change (`sessionStorage.setItem` is synchronous
  and runs on the main thread).
- A pending write is never lost: it is flushed when the table is destroyed and when the page
  is hidden or unloaded (`pagehide` / `visibilitychange`), so a reload right after the last
  change still restores it.
- The data persists until the browser tab is closed.
- Each table instance uses its own unique key: `aura-session-{storeId}` — override it with the
  [`sessionKey`](#sessionkey) prop (useful for a generated `storeId`, or to share one saved state
  between two tables).
- On restore, the data goes through Zod schema validation; if the data is invalid, the default values are loaded.

### Disabling
The feature is enabled by default. To disable it, use the `disableSession` prop:

```typescript
<Aura
  storeId="users-table"
  :disable-session="true"
/>
```

## Cell Formatting

Aura supports formatting cell content based on the configuration (Header/Body config).

### Supported formatters

| Prop       | Type      | Description                                                            | Example                                                                                                          |
| ---------- | --------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `number`   | `boolean` | Format as a number (based on localization).                            | `1234.56` -> `"1,234.56"` (en-US)                                                                                 |
| `currency` | `string`  | Format as currency (ISO code).                                         | `1234` -> `"1,234 Ft"` (`huf`), `"€1,234.00"` (`usd`)                                                             |
| `base`     | `string`  | Default currency code if the `currency` prop is not specified.         | `base: 'USD', currency: true` -> `"$1,234.00"`                                                                    |
| `unit`     | `string`  | Unit-based formatting (ECMA-402 unit identifiers).                      | `50` -> `"50%"` (`percent`), `"100 km"` (`kilometer`), `"25°C"` (`celsius`). Supported: `liter`, `meter`, etc.   |
| `date`     | `boolean` | Date formatting (based on `dateStyle`).                                | `"2024-01-01"` -> `"01/01/2024"` (short)                                                                          |
| `datetime` | `boolean` | Date and time formatting (`dateStyle` + time).                         | `"2024-01-01T15:00"` -> `"01/01/2024, 15:00"`                                                                     |
| `phone`    | `boolean` | Phone number formatting (country detected from locale).                | `"+36301234567"` -> `"+36 30 123 4567"`                                                                           |
| `raw`      | `boolean` | Render raw HTML (sanitized).                                           | `"<b>Bold</b>"` -> **Bold**                                                                                       |

### Text transforms

| Prop         | Type      | Description                                                     | Example                        |
| ------------ | --------- | --------------------------------------------------------------- | ------------------------------ |
| `uppercase`  | `boolean` | Convert to uppercase.                                          | `"hello"` -> `"HELLO"`        |
| `lowercase`  | `boolean` | Convert to lowercase.                                          | `"HELLO"` -> `"hello"`        |
| `capitalize` | `boolean` | Capitalize the first letter, lowercase the rest.              | `"hELLO"` -> `"Hello"`        |

### Text slicing (Slice)

| Prop       | Type      | Description                                                          | Example                                     |
| ---------- | --------- | -------------------------------------------------------------------- | ------------------------------------------- |
| `slice`    | `number`  | The maximum length of the displayed text.                           | `"Hello World"` + `slice: 5` -> `"Hello"`  |
| `sliceEnd` | `string`  | Suffix appended to the sliced text (e.g. `"..."`).                  | `slice: 5, sliceEnd: "..."` -> `"Hello..."` |

### Padding

| Prop       | Type      | Description                                                      | Example                                           |
| ---------- | --------- | --------------------------------------------------------------- | ------------------------------------------------- |
| `pad`      | `number`  | Two-sided padding to the given length.                          | `"42"` + `pad: 6` -> `"  42  "`                   |
| `padStart` | `number`  | Left padding to the given length.                               | `"42"` + `padStart: 5` -> `"   42"`               |
| `padEnd`   | `number`  | Right padding to the given length.                              | `"42"` + `padEnd: 5` -> `"42   "`                 |
| `chars`    | `string`  | The padding character (default: space).                         | `"42"` + `padStart: 5, chars: "0"` -> `"00042"`   |

### Highlight

The `highlightText` helper function highlights matches in the cell text based on the search
term, using `<mark>` tags. This happens automatically in the `TableBodyCell` component when
global search is active. XSS protection is provided by `escapeHtml()`.

### Priority

The order in which formatters are applied (when several are specified):
1. `raw` (if true, ignores everything else)
2. Type formatting: `currency` > `unit` > `number` > `datetime` > `date` > `phone` > `time`
3. Text slicing: `slice` + `sliceEnd`
4. Text transform: `uppercase` / `lowercase` / `capitalize`
5. Padding: `padStart` / `padEnd` / `pad`

### Example configuration

```typescript
// Header config example
{
  key: "price",
  content: "Price",
  currency: "HUF" // Every value will be formatted as HUF
},
{
  key: "weight",
  content: "Weight",
  unit: "kilogram" // "50 kg"
},
{
  key: "change",
  content: "Change",
  unit: "percent" // "12%"
},
{
  key: "description",
  content: "Description",
  slice: 50,
  sliceEnd: "..." // Slice long text to 50 characters + "..."
},
{
  key: "code",
  content: "Code",
  uppercase: true,
  padStart: 6,
  chars: "0" // "42" -> "000042" in uppercase
}
```

## API Response Structure

Aura expects the server-side API response to follow a defined JSON structure. This makes it
possible to control the table configuration (header, footer, styles) dynamically from the server.

### Full structure (`ApiResponse`)

```typescript
interface ApiResponse {
    header: Header;           // Table header definition (required)
    body?: Body;              // Body settings (optional)
    footer?: Footer;          // Footer definition (optional)
    items: unknown[];         // Array of data rows
    meta?: PaginationMeta;    // Laravel pagination metadata
    links?: PaginationLinks;  // Laravel pagination links
}

interface Body {
    columnConfigs?: Record<string, ColumnConfig>; // Column configurations (key → config)
    columnStyles?: Record<string, string | string[]>; // Column CSS classes (column `key` → class(es))
    settings?: BodySettings;                      // General body settings
    rowRules?: RowRules | null;                   // Conditional row formatting (<tr>)
}

interface BodySettings {
    striped?: boolean;    // Striped rows (toggles the `table-striped` class)
    hoverable?: boolean;  // Hover highlight (toggles the `table-hover` class)
}
```

> **`columnStyles`** — per-column CSS classes on the body (`<td>`) cells. The key is the
> column `key`, the value is a class string or string array (e.g. `{ "file": "text-truncate",
> "priceUsd": ["text-end", "fw-semibold"] }`). The classes are added alongside the cell's
> existing (cellRules / columnConfig) classes.
>
> **`settings.striped` / `settings.hoverable`** — override the `config.classes.table`
> default: `true` → definitely on, `false` → definitely off, missing value → the config
> default stays in effect (by default `table-striped` + `table-hover` are enabled).

### Header structure (`Header`)

The header defines the columns, their order, and their properties.

```typescript
interface Header {
    rows: HeaderRow[];
    settings?: HeaderSettings;
}

interface HeaderRow {
    cells: HeaderCell[];
}

interface HeaderCell {
    content: string;      // Displayed text
    key: string;          // Unique identifier
    field?: string;       // Data field name (in items) OR columnConfigs key (if it exists, icon/config rendering)
    fields?: string[];    // Several fields in sequence; if an element is present in columnConfigs → config rendering, otherwise data value
    sortable?: boolean;   // Whether it is sortable
    searchable?: boolean; // Whether it is searchable
    filterable?: boolean; // Whether it is filterable (dropdown). If `true` and there is no `elements`, the filter list is built automatically from the distinct values of the loaded rows (client side)
    between?: boolean;    // Range search (min/max) in the search row (number/date column)
    reference?: string;   // Which field the sort/search/filter should target (when there are several `fields`)
    selectable?: boolean; // Selection checkbox column (the `field` is the row identifier, default `id`)
    show?: boolean;       // Column visibility — only an explicit `false` hides it (default: visible)
    elements?: (string | number)[] | Record<string, string | number> | { value: string | number | boolean | null, label: string }[]; // Filter options (supported: simple array, key-value object, or array of {value, label} objects)
    // ... further formatting options (width, align, raw, number, currency, unit, date, phone, slice, sliceEnd, pad, padStart, padEnd, chars, uppercase, lowercase, capitalize)
}
```

> **`show`** — the column's initial visibility (**opt-out**): omitting the field or setting
> it to `true` makes the column visible, and **only an explicit `show: false` hides it**. The
> hidden column is excluded from the header, from every body row, from the footer, and from
> the search row alike (aligned by position). Example — the `secret` column is not rendered:
> ```json
> { "content": "Secret", "key": "secret", "field": "secret", "show": false }
> ```

> **`between`** — range search in the search row (`showHeaderSearch: true` + the column's
> `searchable: true`). Instead of the usual single input, **two inputs** (min/max) appear; the
> input type is derived from the column's formatting flags (`number`/`currency`/`time` →
> `number`, `date` → `date`, `datetime` → `datetime-local`). The more specific flag wins:
> `datetime` over `date`, and both over the numeric group. A falsy `currency` (`false`, `""`)
> means "not a currency column", so it leaves the inputs as `text`. Either bound may be omitted
> (open range). In client-side mode the filtering runs locally (both number and date ranges); in
> server-side mode (`externalPaginator: true`) the `min`/`max` are sent in the `searchable`
> request parameter (`{ "field": "...", "min": ..., "max": ... }`).
> ```json
> { "content": "Age", "key": "age", "field": "age", "searchable": true, "between": true, "number": true }
> ```

> **`reference`** — with several `fields` (or a different data field), it specifies **which
> field** the sort, search, and filter should target. If not given, the operation falls back
> to `field`, and ultimately to the `key` field.
> ```json
> { "content": "User", "key": "user", "fields": ["user.first_name", "user.last_name"], "reference": "user.id", "sortable": true, "searchable": true }
> ```

> **`selectable`** — the column becomes a **selection checkbox column**: a "select all"
> checkbox in the header (managing the current page's rows, `indeterminate` on partial
> selection), and a row checkbox in each row. The **row's unique identifier** is read from
> this column's `field` (if there is no `field`, then `id`); only a number/string value is
> accepted as an ID. The selected IDs live in `store.selectedRows`, are saved to the session,
> and are sent to the server in the request's **`selected` field** (selecting on its own does
> **not** reload the table — `selected` travels with the next real data request). Store
> methods: `toggleRowSelection` / `selectRows` / `deselectRows` / `clearSelection` /
> `isRowSelected`.
> ```json
> { "content": "", "key": "select", "field": "id", "selectable": true }
> ```

```typescript
interface HeaderSettings {
    sticky?: boolean;     // Pin the header on scroll
    height?: string;      // Fixed height (e.g. '50px')
    searchableItems?: string[]; // Fields participating in global search
}
```

### Footer structure (`Footer`)

The footer is optional. If it is not provided and the `showFooter: true` config is active,
it mirrors the header structure.

```typescript
interface Footer {
    rows: FooterRow[];    // Same structure as HeaderRow
    settings?: FooterSettings;
}

interface FooterSettings {
    sticky?: boolean;     // Pin the footer to the bottom
    height?: string;      // Fixed height
}
```

> **`settings.sticky` / `settings.height`** — `sticky: true` adds the `aura-thead-sticky` /
> `aura-tfoot-sticky` class to the rendered `<thead>`/`<tfoot>` element (`position: sticky`,
> `top: 0` / `bottom: 0`), and `height` adds an inline `height` style (`'100px'`, `'50%'`,
> `'2.5rem'` or `'auto'`). `sticky` **requires Aura's stylesheet** (the background of the
> pinned bar that guards against transparency comes from there) — import it on the host side:
> ```typescript
> import '@tamas-labs/aura/style.css';
> ```
> The background and the z-index can be customized with the `$aura-sticky-bg` /
> `$aura-sticky-z-index` SCSS variables (Bootstrap's `--bs-body-bg` by default).

### Example API response

```json
{
    "header": {
        "rows": [
            {
                "cells": [
                    { "content": "Name", "key": "name", "field": "name", "sortable": true },
                    { "content": "Email", "key": "email", "field": "email", "searchable": true },
                    { "content": "Role", "key": "role", "field": "role" }
                ]
            }
        ],
        "settings": {
            "sticky": true
        }
    },
    "footer": {
        "rows": [
            {
                "cells": [
                    { "content": "Total", "key": "total", "colspan": 2 },
                    { "content": "15 users", "key": "count" }
                ]
            }
        ]
    },
    "items": [
        { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "admin" },
        { "id": 2, "name": "Jane Smith", "email": "jane@example.com", "role": "user" }
    ],
    "meta": {
        "current_page": 1,
        "total": 15,
        "per_page": 10
    }
}
```

## Props

The Aura component supports the following props:

| Prop                      | Type                       | Required | Default                                                 | Description                                          |
| ------------------------- | -------------------------- | -------- | ------------------------------------------------------- | ---------------------------------------------------- |
| `storeId`                 | `string`                   | No       | `'aura-core'`                                           | Unique store identifier for multi-instance support   |
| `debug`                   | `boolean`                  | No       | `false`                                                 | Enable debug mode, with detailed console logs        |
| `siteName`                | `string`                   | No       | `window.location.origin`                                | The application name or base URL                     |
| `urlParameter`            | `string`                   | No       | `undefined`                                             | URL parameter for the resource endpoint              |
| `urlParameterLastSegment` | `string`                   | No       | `'resources'`                                           | Last URL segment                                     |
| `urlStructure`            | `string`                   | No       | `'{siteName}/{urlParameter}/{urlParameterLastSegment}'` | URL structure template                               |
| `siteToken`               | `boolean \| string`        | No       | `false`                                                 | Use a site token (boolean or token string)           |
| `paginateValues`          | `number[]`                 | No       | `[5, 10, 25, 50, 100]`                                  | Available pagination values                          |
| `rowsNumber`              | `number`                   | No       | `10`                                                    | Default number of rows per page                      |
| `classes`                 | `Record<string, string[]>` | No       | See below                                               | CSS class configuration                              |
| `showFooter`              | `boolean`                  | No       | `true`                                                  | Show the footer                                      |
| `actionButtons`           | `ActionButtonItem[]`       | No       | `['refresh', 'export', 'settings']`                     | Action buttons (refresh, export, settings)           |
| `showHeaderSearch`        | `boolean`                  | No       | `false`                                                 | Show the header search                               |
| `showLoadingOverlay`      | `boolean`                  | No       | `true`                                                  | Show the built-in loading overlay while fetching     |
| `showLoadingBar`          | `boolean`                  | No       | `false`                                                 | Show the thin progress bar while fetching            |
| `showToolbarTitle`        | `boolean`                  | No       | `true`                                                  | Show the toolbar title                               |
| `toolbarTitleContent`     | `string`                   | No       | `''`                                                    | Toolbar title content (fallback: 'Logo/Title')       |
| `externalPaginator`       | `boolean`                  | No       | `false`                                                 | Enable server-side pagination                        |
| `dateStyle`               | `'short' \| 'medium' \| 'long'`| No       | `'short'`                                               | Date display style                                   |
| `timeZone`                | `string`                   | No       | `'Europe/Budapest'`                                     | Time zone                                            |
| `utcOffset`               | `string`                   | No       | `'+02:00'`                                              | UTC offset                                           |
| `localization`            | `string`                   | No       | `'en-US'`                                               | Localization (Intl number/date formatting, sorting)  |
| `currencyCode`            | `string`                   | No       | `'HUF'`                                                 | Currency code (ISO 4217)                             |
| `resources`               | `boolean`                  | No       | `false`                                                 | Enable resources mode                                |
| `requestMethod`           | `string`                   | No       | `'POST'`                                                | HTTP request method (GET, POST, PUT, DELETE, PATCH)  |
| `disableSession`          | `boolean`                  | No       | `false`                                                 | Disable session storage                              |
| `sessionKey`              | `string`                   | No       | `null` (`aura-session-{storeId}`)                       | sessionStorage key override for the saved state      |
| `emptyStateMessage`       | `string`                   | No       | `'No data available to display.'`                       | ⚠️ Deprecated — use `labels.emptyState`               |
| `accentInsensitiveSearch` | `boolean`                  | No       | `false`                                                 | Ignore diacritics in the client-side search          |
| `highlightSearchResults`  | `boolean`                  | No       | `true`                                                  | Highlight search matches                             |
| `highlightClass`          | `string`                   | No       | `'aura-highlight'`                                      | CSS class of the highlight                           |

## API Reference

### Detailed documentation of the config fields

#### Basic settings

##### `storeId`

- **Type:** `string`
- **Default:** `'aura-core'`
- **Description:** Unique store identifier that makes it possible to use multiple table instances on the same page
- **Example:**

    ```typescript
    app.use(Aura, { storeId: 'users-table' });
    ```

##### `debug`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Enables debug mode, which writes detailed logs to the console
- **Example:**

    ```typescript
    app.use(Aura, { debug: true });
    ```

##### `siteName`

- **Type:** `string`
- **Default:** `window.location.origin`
- **Description:** The application name or base URL
- **Example:**

    ```typescript
    app.use(Aura, { siteName: 'https://api.example.com' });
    ```

##### `href`

- **Type:** `string`
- **Default:** `window.location.href`
- **Description:** API endpoint URL
- **Example:**

    ```typescript
    app.use(Aura, { href: '/api/v1/users' });
    ```

#### Pagination settings

##### `rowsNumber`

- **Type:** `number`
- **Default:** `10`
- **Description:** Default number of rows per page
- **Example:**

    ```typescript
    app.use(Aura, { rowsNumber: 25 });
    ```

##### `paginateValues`

- **Type:** `number[]`
- **Default:** `[5, 10, 25, 50, 100]`
- **Description:** List of available pagination values
- **Example:**

    ```typescript
    app.use(Aura, { paginateValues: [10, 20, 50, 100] });
    ```

##### `externalPaginator`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Enable server-side pagination and filtering. If `true`, pagination, sorting, search, and filtering happen server-side via a new API call. If `false`, all operations run client-side on the already loaded data.
- **No requests in client-side mode.** With `false`, a page, sort, search or filter change is answered
  entirely from the `items` already in the store — it issues **no** API call, and therefore raises no
  `loading` state and shows no loading indicator. Only the initial mount and an explicit
  `fetchData()` (the toolbar's refresh button, for instance) go to the network in this mode. If your
  API is meant to do the paging or the searching, set `externalPaginator: true`.
- **Example:**

    ```typescript
    app.use(Aura, { externalPaginator: true });
    ```

#### URL configuration

##### `urlParameter`

- **Type:** `string`
- **Default:** `undefined`
- **Description:** URL parameter for the resource endpoint. The leading slash (`/`) is removed automatically.
- **Example:**

    ```typescript
    // Input: '/users' -> Result URL: .../users/...
    app.use(Aura, { urlParameter: '/users' });
    ```

##### `urlParameterLastSegment`

- **Type:** `string`
- **Default:** `'resources'`
- **Description:** Last URL segment. The leading slash (`/`) is removed automatically.
- **Example:**

    ```typescript
    app.use(Aura, { urlParameterLastSegment: 'data' });
    ```

##### `urlStructure`

- **Type:** `string`
- **Default:** `'{siteName}/{urlParameter}/{urlParameterLastSegment}'`
- **Description:** URL structure template
- **Example:**

    ```typescript
    app.use(Aura, { urlStructure: '{siteName}/api/{urlParameter}' });
    ```

#### Display settings

##### `showFooter`

- **Type:** `boolean`
- **Default:** `true`
- **Description:** Show the footer below the table
- **Example:**

    ```typescript
    app.use(Aura, { showFooter: false });
    ```

##### `actionButtons`

- **Type:** `ActionButtonItem[]` (`'refresh' | 'export' | 'settings'`)
- **Default:** `['refresh', 'export', 'settings']`
- **Description:** Show the action buttons (Refresh, Export, Settings). During validation, invalid elements are filtered out (e.g. `['refresh', 'invalid']` -> `['refresh']`), instead of displaying the whole list.
- **📤 Export:** The `'export'` button shows a dropdown with a single **CSV export**
  item, which downloads the rows of the **current view** (current page, with its active
  search/filter/sort applied) as a client-side CSV based on the **visible columns**
  (with a UTF-8 BOM and RFC 4180 escaping), without any external dependency. A real
  `.xlsx` (Excel) export needs a host-side library — the raw data (`items`) is available
  for it; we **deliberately do not** bundle this into Aura. `'refresh'` and `'settings'`
  are fully functional.
- **🛡️ Formula-injection guard:** a cell whose value starts with `=`, `+`, `-`, `@`, TAB
  or CR is prefixed with an apostrophe (`'`) and always quoted, so Excel, LibreOffice Calc
  and Google Sheets read it as **text** instead of evaluating it as a formula. The API
  response is untrusted input, and the CSV file is opened outside the browser's sandbox —
  a value such as `=HYPERLINK(...)` would otherwise run on the user's machine. Quoting
  alone does not help: the spreadsheet strips the quotes before evaluating. **Plain
  numeric literals are exempt** (`-5`, `+1.5`, `-1e3` stay as they are), so negative
  numbers are not apostrophe-prefixed. The guard cannot be turned off.
- **⚙️ Settings panel:** the `'settings'` button toggles a collapsible panel below the
  toolbar with two live sections:
    - **Column visibility** — a checkbox per data column (taken from the last header
      row). Unchecking one drops it from the header, the body, the footer, the header
      search row and the CSV export at once. It is presentation-only state, so a toggle
      never issues a request, not even in server-side mode (`externalPaginator: true`),
      and it is persisted with the rest of the session state (see
      [`disableSession`](#disablesession)). A **Show all** button appears while anything
      is hidden. Two kinds of column are deliberately absent from the list: a
      `show: false` column (the response hid it, and that is not the user's to override)
      and the `selectable` checkbox column (hiding it would strand the current
      selection). The last remaining visible column's checkbox is disabled, so the table
      can never be left with zero columns.
    - **Active filters** — every active global search, column search and column filter
      as a removable badge, plus a **Clear all** button. The same badge list — without
      the clear-all button and the empty-state text — also sits in the toolbar's bottom
      row. Removing a badge calls the store action that owns it, so a client-side table
      re-slices immediately and a server-side one refetches.
- **Example:**

    ```typescript
    // Only the refresh and settings buttons
    app.use(Aura, { actionButtons: ['refresh', 'settings'] });

    // Empty array = hide the buttons
    app.use(Aura, { actionButtons: [] });

    // Filtering an invalid element (only 'refresh' appears)
    app.use(Aura, { actionButtons: ['refresh', 'invalid'] });
    ```

##### `showHeaderSearch`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Show the header search
- **Example:**

    ```typescript
    app.use(Aura, { showHeaderSearch: true });
    ```

    Typing into a search input is **debounced by 300 ms**, so a burst of keystrokes produces one
    store write (and, in server-side mode, one request) instead of one per character. Pressing
    Enter, or clicking the search or clear button, applies immediately and drops the pending call.
    The delay is not configurable yet — it is a single shared constant.

##### `showLoadingOverlay`

- **Type:** `boolean`
- **Default:** `true`
- **Description:** Show the built-in loading overlay (a translucent veil with a Bootstrap spinner) over
  the table while a request is in flight. Switching it off does not hide the state itself: the
  [`loading`](#useapiresourcesstore) store property stays available, so a host can render its own
  indicator instead.
- **Shown after a short delay (250 ms).** The veil dims the rows and blocks the pointer, so a request
  that resolves in a few dozen milliseconds would flash it on and off. Requests below that threshold
  draw no indicator at all. The delay is not configurable — it is a single shared constant.
  `aria-busy` on the `<table>` is **not** delayed.
- **It excludes the bar.** The two indicators are mutually exclusive and the overlay is the stronger
  one: while it is enabled, [`showLoadingBar`](#showloadingbar) is ignored, even when set to `true`.
- **Requires Aura's stylesheet** (`import '@tamas-labs/aura/style.css'`) — the veil's positioning,
  background and stacking come from there. The background and the z-index are customizable with the
  `$aura-loading-overlay-bg` / `$aura-loading-overlay-z-index` SCSS variables; the z-index default
  (`3`) is deliberately above `$aura-sticky-z-index`, so a sticky header does not cover the overlay.
- **Example:**

    ```typescript
    // Turn the built-in overlay off and drive your own indicator
    app.use(Aura, { showLoadingOverlay: false });
    ```

##### `showLoadingBar`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Show a thin (3px) indeterminate progress bar pinned to the top edge of the table
  area while a request is in flight — a non-blocking alternative to the overlay. It takes up no
  space in the layout and does not dim the rows, so it appears **immediately** and stays for the
  whole request.
- **Mutually exclusive with the overlay, and the overlay wins.** The bar is only drawn when
  [`showLoadingOverlay`](#showloadingoverlay) is `false`; with the overlay enabled (its default) this
  key is ignored, even when set to `true`. To use the bar, switch both keys as in the example below.
- **Requires Aura's stylesheet** (`import '@tamas-labs/aura/style.css'`) — without it the bar has no
  height, no color and no animation. Customizable with the `$aura-loading-bar-height`,
  `$aura-loading-bar-color`, `$aura-loading-bar-track-bg`, `$aura-loading-bar-duration` and
  `$aura-loading-bar-z-index` SCSS variables. The sweep animation is dropped automatically under
  `prefers-reduced-motion: reduce`.
- **Accessibility:** the bar is a `role="progressbar"` with no `aria-valuenow` (that is what marks a
  progressbar as indeterminate). The `<table>` itself carries `aria-busy`, which tracks the request
  directly and is **not** delayed.
- **Example:**

    ```typescript
    // Non-blocking feedback only: the bar without the veil
    app.use(Aura, { showLoadingBar: true, showLoadingOverlay: false });
    ```

##### `showToolbarTitle`

- **Type:** `boolean`
- **Default:** `true`
- **Description:** Show the toolbar title. If `false`, the title is fully hidden and the layout is recalculated.
- **Example:**

    ```typescript
    app.use(Aura, { showToolbarTitle: false });
    ```

##### `toolbarTitleContent`

- **Type:** `string`
- **Default:** `''` (fallback: `'Logo/Title'`)
- **Description:** The content of the toolbar title. If it is an empty string, the component displays the 'Logo/Title' fallback value.
- **Example:**

    ```typescript
    app.use(Aura, { toolbarTitleContent: 'User management' });
    ```

#### Icon configuration

##### `icons`

- **Type:** `object`
- **Description:** Configuration of the centralized icon system. Every icon is replaceable (FontAwesome, Bootstrap Icons, Lucide, Heroicons)
- **Example:**

    ```typescript
    app.use(Aura, {
        icons: {
            sortable: {
                up: ['fas', 'fa-arrow-up'],
                down: ['fas', 'fa-arrow-down'],
                both: ['fas', 'fa-sort'],
            },
            filterable: ['fas', 'fa-filter'],
            search: ['fas', 'fa-search'],
            clear: ['fas', 'fa-times'],
        },
    });
    ```

#### CSS class configuration

##### `classes`

- **Type:** `Record<string, string[] | Record<string, string[]>>`
- **Description:** Configuration of the Bootstrap 5 CSS classes. Each key defines which CSS classes are applied to the trigger element of the given type.

| Key | Applied to | Element |
|---|---|---|
| `table` | Table component | `<table>` |
| `icon` | Icon column type; modal icon trigger | `<i>` |
| `button` | Modal button trigger | `<button>` |
| `link` | Modal link trigger | `<a>` |
| `dataTypes.numbers` | Numeric values | cell `<td>` |
| `dataTypes.currency` | Currency values | cell `<td>` |
| `dataTypes.unit` | Unit values | cell `<td>` |

- **Default:**

    ```typescript
    classes: {
        table: ['table', 'table-striped', 'table-hover', 'mt-2', 'mb-4'],
        icon: ['mx-2'],
        button: ['mx-1'],
        link: ['mx-1'],
        dataTypes: {
            numbers: ['text-end'],
            currency: ['text-end'],
            unit: ['text-end'],
        },
    }
    ```

- **Example:**

    ```typescript
    app.use(Aura, {
        classes: {
            table: ['table-striped', 'table-hover', 'table-bordered'],
            icon: ['mx-2', 'text-secondary'],
            button: ['btn', 'btn-sm'],
            link: ['text-decoration-none'],
            dataTypes: {
                numbers: ['text-end', 'fw-bold'],
                currency: ['text-end', 'text-success'],
            },
        },
    });
    ```

#### Bootstrap variant colors

##### `variants`

- **Type:** `Record<string, string>`
- **Description:** Configuration of the Bootstrap variant types
- **Example:**

    ```typescript
    app.use(Aura, {
        variants: {
            primary: 'primary',
            destroy: 'danger',
            edit: 'warning',
            show: 'info',
        },
    });
    ```

##### `renderers`

- **Type:** `Record<string, AuraCustomRenderer>`
- **Default:** `{}`
- **Description:** Host registry of render functions for the `custom` column type. The API response can only reference them **by name** (`columnConfigs[...].renderer`), never define them — so the response cannot inject code. The return value is an HTML string and goes through DOMPurify. Signature: `(value, row, config) => string`. See the [`custom` column type](#custom-column-type) for the full picture. The names `__proto__`, `constructor` and `prototype` are **reserved**: such an entry is dropped with a warning, because the response could otherwise reach a prototype member through the name.
- **Example:**

    ```typescript
    app.use(Aura, {
        renderers: {
            userCard: (value, row, config) => `<strong>${value}</strong>`,
        },
    });
    ```

##### `callbacks`

- **Type:** `Record<string, AuraCustomCallback>`
- **Default:** `{}`
- **Description:** Host registry of callback functions for the `custom` column type, referenced by name from the response (`columnConfigs[...].callback`). Unlike `renderers`, the return value is **plain text**: the static formatter processes it and Vue escapes it, so it never becomes HTML. Signature: `(value, row, params) => string | number | null | undefined`. The names `__proto__`, `constructor` and `prototype` are **reserved**: such an entry is dropped with a warning, because the response could otherwise reach a prototype member through the name.
- **Example:**

    ```typescript
    app.use(Aura, {
        callbacks: {
            formatPrice: (price, row, params) => `${price} ${params.currency}`,
        },
    });
    ```

#### Internationalization

##### `dateStyle`

- **Type:** `'short' | 'medium' | 'long'`
- **Default:** `'short'`
- **Description:** Date display style (Intl.DateTimeFormat)
- **Example:**

    ```typescript
    app.use(Aura, { dateStyle: 'medium' });
    ```

##### `timeZone`

- **Type:** `string`
- **Default:** `'Europe/Budapest'`
- **Description:** Time zone
- **Example:**

    ```typescript
    app.use(Aura, { timeZone: 'America/New_York' });
    ```

##### `localization`

- **Type:** `string`
- **Default:** `'en-US'`
- **Description:** Localization (language and region) for `Intl` number and date formatting, and
  for **client-side sorting**: string columns are compared with an `Intl.Collator` built from this
  locale, so accented and digraph-heavy data sorts by the rules of the configured language rather
  than by the browser's. As a public package the default is `en-US`; for Hungarian formatting set
  it to `'hu-HU'`.
- **Example:**

    ```typescript
    app.use(Aura, { localization: 'hu-HU' });
    ```

##### `currencyCode`

- **Type:** `string`
- **Default:** `'HUF'`
- **Description:** Currency code (ISO 4217)
- **Example:**

    ```typescript
    app.use(Aura, { currencyCode: 'USD' });
    ```

##### `unit`

- **Type:** `string`
- **Default:** `undefined`
- **Description:** Global unit setting (Intl.NumberFormat unit)
- **Example:**

    ```typescript
    app.use(Aura, { unit: 'kilogram' });
    ```

##### `labels`

- **Type:** `Partial<AuraLabels>` (`Record<string, string>`)
- **Default:** built-in **English** text set (`DEFAULT_LABELS`)
- **Description:** Override the built-in, user-visible UI texts (delete-confirmation modal,
  toolbar buttons, search, pagination, page jump, rows-per-page select, row selection, column
  filter dropdown, settings panel, error alerts). **Can be specified partially** — any key not provided falls back
  to the English default value. An empty string is also valid (so a label can be intentionally
  hidden). The `paginationInfo` template substitutes the `{from}` / `{to}` / `{total}` tokens, the
  `dismissAllErrors` / `hiddenErrors` / `errorOccurrences` templates the `{count}` token, and
  `apiErrorClient` / `apiErrorServer` the `{status}` token.
- **Available keys (48):** `confirmDeleteTitle`, `confirmDeleteBody`, `cancel`, `confirmDelete`,
  `refresh`, `export`, `exportCsv`, `settings`, `search`, `clearSearch`, `searchPlaceholder`,
  `paginationInfo`, `noResults`, `previousPage`, `nextPage`, `pageJump`,
  `pageNumberPlaceholder`, `pageNumberInput`, `goToPage`, `go`, `perPage`, `results`,
  `selectRow`, `selectAllRows`, `sortColumn`, `selectAll`, `filterToggle`, `filterOptions`,
  `filterApply`, `columnVisibility`, `showAllColumns`, `activeFilters`, `noActiveFilters`,
  `clearAllFilters`, `removeFilter`, `loading`, `close`, `dismissAllErrors`, `hiddenErrors`,
  `errorOccurrences`, `retry`, `apiErrorNetwork`, `apiErrorTimeout`, `apiErrorClient`,
  `apiErrorServer`, `apiErrorUnknown`, `apiErrorInvalidResponse`, `emptyState`.
- **Note:** the six `columnVisibility` … `removeFilter` keys belong to the settings panel
  (see [`actionButtons`](#actionbuttons)). The `search` label is reused there as the title
  of the global-search badge, so the badge cannot drift from the search box it removes.
- **`emptyState`** is the only key **without** a default in `DEFAULT_LABELS`. It is the message
  shown when the table has no rows, and it supersedes the deprecated top-level
  [`emptyStateMessage`](#emptystatemessage-deprecated) config key. Resolution order:
  `labels.emptyState` → `emptyStateMessage` → the built-in `'No data available to display.'`.
  Leaving it unset is what keeps the deprecated alias working, so it is deliberately absent from
  the defaults.
- **Example (Hungarian override):**

    ```typescript
    app.use(Aura, {
        labels: {
            confirmDeleteTitle: 'Törlés megerősítése',
            confirmDeleteBody: 'Biztosan törlöd ezt az elemet?',
            cancel: 'Mégsem',
            confirmDelete: 'Törlés',
            refresh: 'Frissítés',
            export: 'Exportálás',
            settings: 'Beállítások',
            paginationInfo: '{from}–{to} / {total} elem',
            noResults: 'Nincs találat',
        },
    });
    ```

#### Display settings (advanced)

##### `accentInsensitiveSearch`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Ignore diacritics in the client-side search. With it on, `arvizturo` finds `árvíztűrő` and `Béla` finds `Bela` — the term and the cell value are both compared in their `NFD`-decomposed form with the combining marks removed. It applies to the column search, the global search and the match highlighting alike, so a row that matched always shows its `<mark>`.
- **Off by default** on purpose: turning it on widens the result set, and an existing table must not have its results shift under it on an upgrade.
- **Client-side only.** In server-side mode (`externalPaginator: true`) the backend decides what matches — the flag does not change the request. For PostgreSQL the equivalent is the `unaccent` extension, for MySQL/MariaDB an accent-insensitive collation (`utf8mb4_0900_ai_ci`).
- **Example:**

    ```typescript
    app.use(Aura, { accentInsensitiveSearch: true });
    ```

##### `highlightSearchResults`

- **Type:** `boolean`
- **Default:** `true`
- **Description:** Highlight the search matches in the table
- **Example:**

    ```typescript
    app.use(Aura, { highlightSearchResults: true });
    ```

##### `highlightClass`

- **Type:** `string`
- **Default:** `'aura-highlight'`
- **Description:** CSS class of the highlight. The value goes into the `<mark class="...">` attribute and is rendered HTML-escaped (a quotation mark cannot break out of the attribute).
- **Example:**

    ```typescript
    app.use(Aura, { highlightClass: 'my-custom-highlight' });
    ```

#### Advanced settings

##### `resources`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Enable resources mode
- **Example:**

    ```typescript
    app.use(Aura, { resources: true });
    ```

##### `requestMethod`

- **Type:** `'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'`
- **Default:** `'POST'`
- **Description:** HTTP request method for the API calls
- **Example:**

    ```typescript
    app.use(Aura, { requestMethod: 'GET' });
    ```

##### `disableSession`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Disable the use of session storage
- **Example:**

    ```typescript
    app.use(Aura, { disableSession: true });
    ```

##### `sessionKey`

- **Type:** `string | null`
- **Default:** `null` (the key is derived from the `storeId`: `aura-session-{storeId}`)
- **Description:** Overrides the `sessionStorage` key the table state is saved under. Useful when
  the `storeId` is generated (so the saved state would be lost on every mount), or when two
  tables should deliberately share one saved state. A blank or whitespace-only value counts as
  "not set" and falls back to the derived key. Has no effect when `disableSession` is `true`.
  Best set **per table** (as a prop) — a global value would make every table on the page write
  the same key.
- **Example:**

    ```typescript
    <Aura store-id="users-table" session-key="users-state" />
    ```

##### `sliceEndText`

- **Type:** `string`
- **Default:** `'...'`
- **Description:** Characters shown at the end of a text slice
- **Example:**

    ```typescript
    app.use(Aura, { sliceEndText: '…' });
    ```

##### `emptyStateMessage` (deprecated)

- **Type:** `string`
- **Default:** `'No data available to display.'`
- **Status:** ⚠️ **Deprecated** — use [`labels.emptyState`](#labels) instead, so every built-in UI
  text lives under one key. It still works and is **not** planned for removal before `1.0`; when
  both are set, `labels.emptyState` wins.
- **Description:** The message shown when the table has loaded but has no rows to display.
  Rendered in the empty row spanning the full table width.
- **Example:**

    ```typescript
    // Deprecated
    app.use(Aura, { emptyStateMessage: 'No matching records.' });

    // Preferred
    app.use(Aura, { labels: { emptyState: 'No matching records.' } });
    ```

##### `allowExternalApi`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Allow external (cross-origin) API calls. By default (`false`) `fetchData`
  **blocks** requests that would point to an origin different from the current page's
  origin (different protocol, host, or port); in that case an `authorization`-type error
  is added to the error store, and the axios call is not started. Same-origin (relative or
  same-origin absolute) requests are always allowed. To use an external API, set it to `true`.
- **Example:**

    ```typescript
    app.use(Aura, { allowExternalApi: true });
    ```

##### `errorReporting`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Enable remote error reporting
- **Example:**

    ```typescript
    app.use(Aura, {
        errorReporting: true,
        errorReportingEndpoint: 'https://api.example.com/errors',
        errorReportingService: 'custom',
    });
    ```

##### `errorReportingEndpoint`

- **Type:** `string`
- **Default:** `undefined`
- **Description:** Custom error reporting endpoint URL (required for the custom service)
- **Example:**

    ```typescript
    app.use(Aura, {
        errorReporting: true,
        errorReportingEndpoint: 'https://api.example.com/errors',
    });
    ```

##### `errorReportingService`

- **Type:** `'sentry' | 'logrocket' | 'rollbar' | 'custom'`
- **Default:** `'custom'`
- **Description:** Error reporting service type.
- **⚠️ Note:** There is exactly **one transport**: a POST to `errorReportingEndpoint`.
  `'sentry'`, `'logrocket'` and `'rollbar'` are accepted (the union is kept for API
  stability) but have **no SDK integration** — setting one of them raises a non-blocking
  **warning banner** and the reporter sends to your endpoint, exactly as `'custom'` would.
  The fallback is real, not just a config value: nothing is discarded silently, and without
  an endpoint the failed send is recorded under `errorReporting.failed`.
- **Example:**

    ```typescript
    app.use(Aura, {
        errorReporting: true,
        errorReportingService: 'custom',
        errorReportingEndpoint: 'https://api.example.com/errors',
    });
    ```

##### `errorReportingApiKey`

- **Type:** `string`
- **Default:** `undefined`
- **Description:** API key for the error reporting service (optional). For the `custom`
  service it is sent as an `Authorization: Bearer <apiKey>` header to the
  `errorReportingEndpoint`.
- **🔒 Security warning:** this value ends up in the **client-side bundle**, and is sent
  from the browser in every network request — so it is **publicly visible** (DevTools,
  source code). **Do not use** a secret/privileged key here. Instead, provide a **public
  token with error-ingest-only permission** (like a Sentry DSN), or omit the field and
  **proxy** the requests through your own backend endpoint that appends the secret key
  server-side.
- **Example:**

    ```typescript
    app.use(Aura, {
        errorReporting: true,
        errorReportingEndpoint: 'https://api.example.com/errors',
        errorReportingApiKey: 'public-ingest-token', // NOT a secret key!
    });
    ```

#### Raw HTML configuration

These settings control the render-time sanitization (`formatRaw`, DOMPurify whitelist) of
`raw: true` cells. The default preserves the previous hardcoded behavior (`style` allowed);
the host can override it — e.g. to forbid `style`, provide a `rawHtmlAllowedAttr` without
`style`.

> **🔒 Sanitization cannot be turned off.** The whitelist is the only knob: widen
> `rawHtmlAllowedTags` / `rawHtmlAllowedAttr` if a markup shape is missing. There is no
> "render as-is" mode, so no configuration can put unsanitized response HTML into the DOM.

> **🔒 `target="_blank"` security:** in `raw: true` HTML, every `<a target="_blank">` anchor
> automatically receives the `rel="noopener noreferrer"` tokens (reverse-tabnabbing +
> referrer protection), preserving existing `rel` values — even when the field is present on
> the `rawHtmlAllowedAttr` list.

> **No global DOMPurify side effect.** The `rel` enforcement is a DOMPurify hook, and
> `isomorphic-dompurify` exports a single shared instance — the very one a host importing the
> same package uses. Aura therefore registers the hook **around its own `sanitize()` call only**
> and removes it right after, so your own `DOMPurify.sanitize()` results are unaffected. Hooks
> you registered yourself stay in place.

##### `rawHtmlAllowedTags`

- **Type:** `string[]`
- **Default:** `['b', 'i', 'u', 'strong', 'em', 'span', 'br', 'p', 'a']`
- **Description:** The HTML tags allowed in `raw: true` cells (DOMPurify `ALLOWED_TAGS`). Dangerous tags (e.g. script, iframe) are always removed by DOMPurify.
- **Example:**

    ```typescript
    app.use(Aura, { rawHtmlAllowedTags: ['b', 'i', 'span'] });
    ```

##### `rawHtmlAllowedAttr`

- **Type:** `string[]`
- **Default:** `['href', 'target', 'title', 'class', 'style', 'rel']`
- **Description:** The HTML attributes allowed in `raw: true` cells (DOMPurify `ALLOWED_ATTR`). `style` is allowed by default; to forbid it, leave it out of the list.
- **Example:**

    ```typescript
    // Forbid style in raw cells:
    app.use(Aura, { rawHtmlAllowedAttr: ['href', 'target', 'title', 'class', 'rel'] });
    ```

##### `rawHtmlAllowDataAttr`

- **Type:** `boolean`
- **Default:** `true`
- **Description:** Whether `data-*` attributes are allowed in 'raw' type cells.
- **Example:**

    ```typescript
    app.use(Aura, { rawHtmlAllowDataAttr: false });
    ```

## Store API Reference

### useApiResourcesStore

Aura uses a unified store architecture to handle API responses. `useApiResourcesStore` stores all response data directly (header, body, footer, items, meta, links).

#### Initialization

```typescript
import { useApiResourcesStore } from '@tamas-labs/aura';
import { useCoreStore } from '@tamas-labs/aura';

// Create the core store
const coreStore = useCoreStore('my-table', {
    siteName: 'My App',
    urlStructure: '{siteName}/api/{urlParameter}',
    urlParameter: 'users'
});

// Create the API Resources store
const apiStore = useApiResourcesStore('my-table', coreStore);
```

#### Store Properties

- **`loading`** (`boolean`) — Whether a `fetchData` request is in flight. With overlapping requests it
  only returns to `false` once the last one settles, and it is released on every outcome, failures
  included. Bind a host-side indicator to it, or leave it to the built-in
  [`showLoadingOverlay`](#showloadingoverlay).
- **`header`** (`Header | null`) — Table header data
- **`body`** (`Body | null`) — Table body configurations
- **`footer`** (`Footer | null`) — Table footer data
- **`items`** (`unknown[] | null`) — Table rows (raw API data)
- **`displayItems`** (`unknown[] | null`) — Rows to display (filtered, sorted, paginated)
- **`meta`** (`PaginationMeta | null`) — Laravel pagination meta (raw API)
- **`displayMeta`** (`PaginationMeta | null`) — Computed pagination meta (for client-side pagination)
- **`links`** (`PaginationLinks | null`) — Laravel pagination links
- **`displayFooter`** (`Header | Footer | null`) — Computed footer (fallback: header configuration)
- **`queryParams`** (`QueryParams`) — API query parameters (page, paginate, sortable, searchable, filterable, globalSearch)
- **`autoRefetch`** (`boolean`) — Enable automatic re-fetching. When it is on and
  [`externalPaginator`](#externalpaginator) is `true`, every change to `queryParams` sends a new
  request — a page or page-size change, and every sort, search, range or filter edit, including the
  ones that edit an existing rule rather than adding one (flipping a sort asc→desc, refining a
  header search past its first keystroke, swapping a filter's values, moving one bound of a range).
  Edits that cancel each other out within the same tick send nothing. Set it to `false` to change
  several query rules and then request them with a single explicit `fetchData()`.
- **`sortItems`** (`SortItem[]`) — Active sort rules
- **`searchItems`** (`SearchItem[]`) — Active search filters
- **`filterItems`** (`FilterItem[]`) — Active value-based filters (checkbox/dropdown)
- **`globalSearchTerm`** (`string | null`) — Global search term

#### Store Methods

##### `fetchData()`

Execute an API call and process the response.

```typescript
await apiStore.fetchData();

// Accessing the data
console.log(apiStore.items); // [{ id: 1, name: 'John' }, ...]
console.log(apiStore.displayItems); // Filtered/sorted/paginated elements
console.log(apiStore.header?.rows); // [{ cells: [...] }]
```

**The newest call always wins.** Starting a request cancels the one still on the wire (through an
`AbortController`) and marks every earlier call stale, so a response that comes back out of order
can neither overwrite newer rows nor report its failure over them — a cancelled request is never
surfaced as an error. Without this, two quick page changes on a slow connection could leave the
user on page 2 while page 1's rows were on screen.

##### `processResponse(response: ApiResponse)`

Manually process and validate an API response.

```typescript
const response = {
    header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
    items: [{ id: 1, name: 'John' }],
    meta: { current_page: 1, total: 100, per_page: 10 }
};

await apiStore.processResponse(response);
```

##### `clearResponse()`

Clear all store data (set it to null).

```typescript
apiStore.clearResponse();

console.log(apiStore.items); // null
console.log(apiStore.header); // null
```

##### `setPage(page: number)`

Set the current page.

```typescript
apiStore.setPage(3);
```

##### `setLimit(limit: number)`

Set the number of elements per page (page is automatically reset to 1).

```typescript
apiStore.setLimit(25);
```

##### Sorting

```typescript
// Add a sort
apiStore.addSort('name', 'asc');

// Change the sort direction
apiStore.updateSortDirection('name', 'desc');

// Remove a sort
apiStore.removeSort('name');

// Clear all sorts
apiStore.clearAllSorts();

// Query the sort direction
const direction = apiStore.getSortDirection('name'); // 'asc' | 'desc' | null
```

##### Column Search

```typescript
// Add a search (an empty term removes it automatically)
apiStore.addSearch('name', 'John');
apiStore.addSearch('email', 'test@example.com', true); // exact match

// Change the search term
apiStore.updateSearchTerm('name', 'Jane');

// Remove a search
apiStore.removeSearch('name');

// Clear all searches
apiStore.clearAllSearches();

// Query the search term
const term = apiStore.getSearchTerm('name'); // string | null
```

##### Filter

Filtering makes it possible to select specific values (e.g. dropdown, checkbox list).

```typescript
// Add a filter (field, values)
apiStore.addFilter('status', ['active', 'pending']);
apiStore.addFilter('role', ['admin', 'manager']);

// Update a filter's values
apiStore.updateFilterValues('status', ['inactive']);

// Remove the filter for a given field
apiStore.removeFilter('status');

// Clear all filters
apiStore.clearAllFilters();

// Query the current filter values
const statusFilters = apiStore.getFilterValues('status'); // ['active', 'pending'] or null
```

##### Global Search

```typescript
// Set the global search
apiStore.setGlobalSearch('John');

// Clear the global search
apiStore.clearGlobalSearch();

// Current term
console.log(apiStore.globalSearchTerm); // 'John' | null
```

#### Example: Full workflow

```typescript
import { useCoreStore, useApiResourcesStore } from '@tamas-labs/aura';

// 1. Initialize the stores
const core = useCoreStore('users-table', {
    siteName: 'https://api.example.com',
    urlParameter: 'users'
});

const api = useApiResourcesStore('users-table', core);

// 2. Fetch the data
await api.fetchData();

// 3. Use the data
if (api.items) {
    console.log(`${api.items.length} user found`);
}

// 4. Access the header
const columns = api.header?.rows[0]?.cells || [];
console.log('Columns:', columns.map(c => c.content));

// 5. Use pagination
if (api.meta) {
    console.log(`Page ${api.meta.current_page} of ${api.meta.last_page}`);
}

// 6. Clear the data
api.clearResponse();
```

### ⚠️ Breaking Changes (v0.1.0+)

#### Simplified store architecture

Instead of the previous 3-level store hierarchy, we now use a **1-level architecture**:

**Old (deprecated):**

```typescript
// ❌ DEPRECATED — DO NOT USE
const apiStore = useApiResourcesStore('my-table', core);
const header = apiStore.tableData?.response?.header;
const items = apiStore.tableData?.response?.items;
```

**New (v0.1.0+):**

```typescript
// ✅ NEW — USE THIS
const apiStore = useApiResourcesStore('my-table', core);
const header = apiStore.header;
const items = apiStore.items;
```

#### Removed stores

The following stores are **no longer available**:

- `useResponseStore` — removed, its functionality is built into `useApiResourcesStore`
- `useHeaderStore` — removed
- `useBodyStore` — removed
- `useFooterStore` — removed
- `useItemsStore` — removed

#### Migration guide

| Old code | New code |
|----------|--------|
| `apiStore.tableData.response.header` | `apiStore.header` |
| `apiStore.tableData.response.body` | `apiStore.body` |
| `apiStore.tableData.response.footer` | `apiStore.footer` |
| `apiStore.tableData.response.items` | `apiStore.items` |
| `headerStore.processHeader(data)` | `apiStore.processResponse(data)` |
| `bodyStore.setBody(data)` | `apiStore.processResponse({ body: data })` |

#### Error Store change

The central error store identifier also changed:

| Old | New |
|------|-----|
| `${storeId}-header-errors` | `${storeId}-errors` |
| `${storeId}-body-errors` | `${storeId}-errors` |
| ... | `${storeId}-errors` |

**Why is this better?**

- ✅ Simpler API
- ✅ Fewer store instances
- ✅ Better performance
- ✅ Easier error handling
- ✅ Unified error store

## API Response Structure

The Aura component expects a standardized JSON response structure from the API. This structure consists of five main parts:

1. **Header**: Table header, column definitions
2. **Body**: Table body configurations
3. **Footer**: Footer (optional)
4. **Items**: Data rows
5. **Meta & Links**: Laravel pagination data

For exhaustive type definitions, see the [src/types/api-response.types.ts](src/types/api-response.types.ts) file.

### Cell Configuration Types (cell.types.ts)

The cell configurations are built hierarchically:

| Interface | Description |
|-----------|--------|
| `BaseCellConfig` | Common cell properties (key, width, colspan, rowspan, align, color, background, typography, CSS) |
| `HeaderCellConfig` | Header cells (`extends BaseCellConfig`) — label, content, field, sortable, searchable, filterable, elements, raw |
| `BodyCellConfig` | Body cells (`extends BaseCellConfig`) — type, slice, number, currency, date, phone, raw, padding |
| `FooterCellConfig` | Footer cells (`extends BaseCellConfig`) — label, content |

```typescript
import type { HeaderCellConfig, BodyCellConfig } from '@tamas-labs/aura';

const headerCell: HeaderCellConfig = {
    key: 'name',
    label: 'Name',
    field: 'name',
    sortable: true,
    searchable: true,
    align: 'start',
};

const bodyCell: BodyCellConfig = {
    key: 'price',
    type: 'static',
    currency: 'HUF',
    number: true,
    align: 'end',
};
```

### Example API Response

```json
{
    "header": {
        "rows": [
            {
                "cells": [
                    { "content": "ID", "key": "id", "field": "id", "sortable": true, "width": "60px" },
                    { "content": "Name", "key": "name", "field": "name", "searchable": true },
                    { "content": "Status", "key": "status", "field": "status", "type": "badge" }
                ]
            }
        ],
        "settings": {
            "sticky": true
        }
    },
    "body": {
        "columnConfigs": {
            "status": {
                "type": "badge",
                "mapping": {
                    "active": { "variant": "success", "label": "Active" },
                    "inactive": { "variant": "secondary", "label": "Inactive" }
                }
            }
        }
    },
    "items": [
        { "id": 1, "name": "John Doe", "status": "active" },
        { "id": 2, "name": "Jane User", "status": "inactive" }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 5,
        "total": 50,
        "per_page": 10
    }
}
```

### Column Types (Body Column Configs)

Special column behaviors can be defined in the `body.columnConfigs` object:

- **static**: Display fixed text
- **icon**: Display an icon
- **modal**: Bootstrap 5 modal trigger (as icon, button, or link)
- **link**: Clickable link
- **badge**: Bootstrap badge (with mapping support)
- **progress**: Progress bar
- **button**: Interactive button
- **custom**: Custom rendering
- **reference**: Reference to other fields

#### `static` Type — Visual Formatting (`ContentFormattingOptions`)

The `static` column type, in addition to fixed text content, also supports full visual CSS formatting. The formatting is applied to the rendered content (`<span>` element) — separated from the cell (`<td>`) level formatting.

**Color and background**

| Field        | Type      | Bootstrap color → class            | CSS value → inline style      | Example                        |
| ------------ | --------- | --------------------------------- | ----------------------------- | ------------------------------ |
| `color`      | `string`  | `text-{color}` (e.g. `text-primary`) | `color: '#ff0000'`           | `"primary"`, `"#ff0000"`     |
| `background` | `string`  | `bg-{color}` (e.g. `bg-success`)  | `backgroundColor: '#e0e0e0'` | `"success"`, `"#e0e0e0"`     |

> Accepted Bootstrap colors: `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `light`, `dark` and their variants (`-subtle`, `-emphasis`).
> For `color`, only Bootstrap colors are allowed (Zod validation). `background` also accepts CSS values (hex, rgb, CSS color names).

**Typography**

| Field        | Type                | Description                                                   | Example                           |
| ------------ | ------------------- | ------------------------------------------------------------- | --------------------------------- |
| `fontSize`   | `string`            | CSS font-size value                                          | `"14px"`, `"1rem"`, `"small"`  |
| `fontWeight` | `string \| number`  | CSS font-weight (100–900 or keyword)                         | `700`, `"bold"`, `"lighter"`   |
| `italic`     | `boolean`           | Italic text (`fontStyle: italic`)                            | `true`                            |
| `normal`     | `boolean`           | Upright text (`fontStyle: normal`) — an explicit reset of `italic`; if both are true, `normal` wins | `true`                            |
| `lineHeight` | `string \| number`  | CSS line height                                              | `"1.5"`, `"24px"`, `1.5`       |
| `monospace`  | `boolean`           | Monospace font (`font-monospace` Bootstrap class)            | `true`                            |

**Text and classes**

| Field   | Type                | Description                                                          | Example                        |
| ------- | ------------------- | -------------------------------------------------------------------- | ------------------------------ |
| `text`  | `string`            | Bootstrap text utility class (required `text-` prefix)              | `"text-truncate"`, `"text-nowrap"` |
| `class` | `string \| string[]`| Extra CSS classes (space-separated string, or array)               | `"fw-bold pe-1"`, `["fw-bold"]` |
| `style` | `string`            | Inline CSS string (parsed kebab-case → camelCase)                   | `"margin-left: 8px"`           |
| `align` | `string`            | Text alignment: `"start"` \| `"center"` \| `"end"`                | `"center"`                    |

**Value formatting** (identical to the fields available on the other column types)

The `static` type supports every value formatting field described in the [Cell Formatting](#cell-formatting) section: `number`, `currency`, `date`, `datetime`, `phone`, `time`, `raw`, `slice`, `sliceEnd`, `pad`, `padStart`, `padEnd`, `chars`, `uppercase`, `lowercase`, `capitalize`, `monospace`.

**Example: Full `static` configuration**

```json
{
    "body": {
        "columnConfigs": {
            "prefix": {
                "type": "static",
                "value": "ID:",
                "color": "primary",
                "fontWeight": 700,
                "fontSize": "13px",
                "italic": false,
                "monospace": true,
                "class": "pe-1",
                "text": "text-nowrap"
            },
            "score": {
                "type": "static",
                "key": "score",
                "number": true,
                "padStart": 5,
                "chars": "0",
                "monospace": true,
                "if": [
                    { "gte": 90, "color": "success", "fontWeight": 700 },
                    { "lt":  50, "color": "danger",  "italic": true }
                ],
                "else": { "color": "secondary" }
            }
        }
    }
}
```

> **Note:** The visual formatting fields (`color`, `background`, `fontSize`, etc.) are applied to the `<span>` content element, not to the `<td>` cell. For cell-level formatting, use the `cellRules` field.

#### `icon` Type — Icon Display

The `icon` column type is used to display a config-based icon. The icon's CSS classes are held in the `class` field — the rendering layer reads only this.

> **Preprocessor layer (⑦.5):** Before the icon is displayed, the response preprocessor automatically performs the following transformations:
> - **Auto-generation:** If a header cell contains an `_icon`-suffixed field (e.g. `switch_user_icon`) and it is not present in `items` (not real data), the preprocessor automatically creates a `columnConfigs` entry — no manual configuration needed.
> - **Normalization:** If the config contains `icon` / `variant` / `color` fields — whether on the config root, in an `if`/`else` branch, or inside a `mapping` entry — the preprocessor resolves these based on the registry lookup chain and converts them into a `class` array, then deletes the original fields. The rendering layer therefore always receives a purely `class`-based config.

**Requirement rule:** Providing the `class` field is required — unless `icon`/`variant`/`color`, `mapping`, or `if`/`else` conditional branches are also present, or the preprocessor fills it in automatically.

**Value-based display (`mapping`):** `mapping` is a value→icon-config dictionary — a more compact alternative to the `if`/`else` `eq` chain for the same purpose with enum-like values (e.g. status → glyph + variant), with the same semantics as the `badge` mapping (see below). The resolution always runs **after** the `if`/`else` flattening — if both are present, the `if`/`else` selects a branch first, and the branch's (or the root's inherited) `mapping` applies to the flattened config.

**Fields**

| Field      | Type                  | Required | Description                                                                        | Example                                    |
| ---------- | --------------------- | -------- | --------------------------------------------------------------------------------- | ---------------------------------------- |
| `type`     | `'icon'`              | ✅        | Type identifier (literal)                                                         | `"icon"`                                 |
| `class`    | `string \| string[]`  | ⚠️*       | CSS classes; the preprocessor fills it based on `icon`/`variant`/`color` if not provided | `["fa-regular", "fa-trash-can", "text-danger"]` |
| `icon`     | `string`              | ❌        | Icon name from `config.icons`; the preprocessor converts it to `class` before render; max 250 characters | `"check"`, `"edit"`, `"trash"` |
| `variant`  | `string`              | ❌        | Bootstrap color OR `config.variants` registry key; the preprocessor converts it into a `text-{color}` class; **Validation:** identifier format only (`[a-zA-Z][a-zA-Z0-9_-]*`), CSS syntax forbidden (`#fff`, `rgb(...)`) | `"primary"`, `"show"`, `"destroy"` |
| `color`    | `string`              | ❌        | Alternative to `variant`; same preprocessor resolution chain and validation rule | `"warning"`, `"info"`, `"edit"`          |
| `size`     | `string`              | ❌        | Icon size: `"xs"` \| `"sm"` \| `"md"` \| `"lg"` \| `"xl"`                  | `"sm"`, `"lg"`                          |
| `alt`      | `string`              | ❌        | Alternative text (accessibility); max 500 characters                             | `"Edit"`                          |
| `title`    | `string`              | ❌        | Tooltip text; max 500 characters                                                 | `"Delete"`                              |
| `route`    | `string`              | ❌        | URL template; dot separators are converted to `/`, `{key}` placeholders are resolved from the row data, then it is prefixed with `siteName`; max 1000 characters | `"users.{id}.edit"`, `"/users/{id}/edit"` |
| `style`    | `string`              | ❌        | Inline CSS string (parsed kebab-case → camelCase)                                | `"margin-left: 4px"`                    |
| `mapping`  | `object`              | ❌        | Value → `{ icon, variant, color, class, title, alt }` mapping (exact match, `field ?? key` selector); the matched entry is merged over the config; entry keys are nested-stripped at the security boundary | *(see below)* |
| `cellRules`| `CellRules`           | ❌        | Conditional `<td>` cell formatting                                               | *(see the Conditional Formatting section)*       |
| `key`      | `string`              | ❌        | The `items` data field name; if provided together with `route` and the `item` data is also available, an `<a>` wrapper is generated; also required for conditional evaluation; the `mapping` selector reads this too if there is no `field` | `"id"`, `"status"` |
| `if`       | `object[]`            | ❌        | Array of conditional branches                                                    | *(see the Conditional Rendering section)*    |
| `else`     | `object`              | ❌        | Fallback config if no `if` branch matches                                        | *(see the Conditional Rendering section)*    |
| `data-*`   | `string \| number`    | ❌        | Arbitrary `data-` attribute; validated with `DataAttributeValueZod`              | `"data-id": 42`                         |

> ⚠️* `class` is required — unless `icon`/`variant`/`color` is provided (the preprocessor fills it in), or for a conditional (`if`/`else`) config.

**Auto-generation based on `_icon` suffix**

If a header cell contains a field ending in `_icon` (e.g. `switch_user_icon`) and the field is not a real data field (not present in `items`), the preprocessor (⑦.5) automatically creates the `columnConfigs` entry:

```json
// API response — no body provided, switch_user_icon is not present in items
{
    "header": {
        "rows": [{ "cells": [
            { "content": "Switch User", "field": "switch_user_icon" }
        ]}]
    },
    "items": [{ "id": 1, "name": "Alice" }]
}
```

```typescript
// aura.config.ts — icon/variant registry
icons:    { switchUser: ['fas', 'fa-user-secret'], primary: ['fas', 'fa-file'] }
variants: { switchUser: 'warning', primary: 'secondary' }
```

```json
// The preprocessor (⑦.5) automatically produces:
{
    "columnConfigs": {
        "switch_user_icon": {
            "type": "icon",
            "class": ["fas", "fa-user-secret", "text-warning"],
            "alt": "Switch User",
            "title": "Switch User"
        }
    }
}
```

**Special `_icon` fields (built-in route automation)**

The **prefix** (the part before `_icon`) is at the same time the icon/variant registry key, so the appropriate glyph comes out automatically. Some **built-in prefixes** additionally receive a fixed Laravel-resource route — the routes are generated relative to `config.urlParameter` (the equivalent of `{current_url}`), and the cell's **`key`** field is the URL placeholder (default `id`):

| Field | Generated type | Route |
| --- | --- | --- |
| `create_icon` | `icon` link | `{base}/create` |
| `edit_icon` | `icon` link | `{base}/{key}/edit` |
| `show_icon` | `icon` link | `{base}/{key}` |
| `destroy_icon` | **`modal`** (built-in `destroyModal` trigger) | `{base}/{key}/destroy` |
| other (e.g. `status_icon`) | `icon` (glyph only) | – (does not navigate) |

```json
// header: { "cells": [ { "content": "Edit", "key": "id", "field": "edit_icon" },
//                       { "content": "Delete", "key": "id", "field": "destroy_icon" } ] }
// urlParameter: "admin/users" → the preprocessor (⑦.5) produces:
{
    "columnConfigs": {
        "edit_icon": {
            "type": "icon",
            "class": ["fas", "fa-pen-to-square", "text-secondary"],
            "alt": "Edit", "title": "Edit",
            "key": "id", "route": "admin/users/{id}/edit"
        },
        "destroy_icon": {
            "type": "modal", "id": "destroyModal",
            "key": "id", "route": "admin/users/{id}/destroy",
            "content": { "type": "icon", "class": ["fas", "fa-trash-can", "text-danger"], "alt": "Destroy", "title": "Destroy" }
        }
    }
}
```

> **Difference from `_link`:** for `_icon`, **only the 4 built-in prefixes** (create/edit/show/destroy) receive a route — a generic `_icon` (e.g. `status_icon`) remains a status glyph and does not navigate. (For `_link`, every prefix received a URL.)

**Normalization from `icon`/`variant`/`color` fields**

The `icon` / `variant` / `color` fields sent in the API are converted into classes by the preprocessor before render:

```json
// API response body
{
    "columnConfigs": {
        "show": {
            "type": "icon",
            "icon": "show",
            "variant": "info",
            "alt": "Show",
            "key": "id",
            "route": "users.{id}.show"
        }
    }
}
```

```json
// After preprocessor (⑦.5) normalization (this is what the rendering layer receives):
{
    "columnConfigs": {
        "show": {
            "type": "icon",
            "class": ["fas", "fa-eye", "text-info"],
            "alt": "Show",
            "key": "id",
            "route": "users.{id}.show"
        }
    }
}
```

**Rendered HTML output**

The `icon` type generates an `<i>` element. If `route`, `key` and the `item` data are all available, the icon is placed inside an `<a>` wrapper. The URL is built in three steps:

1. Resolve `{key}` placeholders from the current row's data
2. Convert dots (`.`) into `/` characters
3. Append `config.siteName` as a prefix

```html
<!-- without route -->
<i class="fa-regular fa-trash-can ms-1 text-danger" title="Delete" aria-label="Delete"></i>

<!-- with route + key + item data -->
<!-- siteName: "https://myapp.com", route: "users.{id}.edit", item: { id: 42 } -->
<a href="https://myapp.com/users/42/edit">
    <i class="fas fa-pencil text-primary" title="Edit" aria-label="Edit"></i>
</a>

<!-- without siteName: relative route starting with a leading slash -->
<!-- route: "users.{id}.edit", item: { id: 42 } -->
<a href="/users/42/edit">
    <i class="fas fa-pencil text-primary" title="Edit" aria-label="Edit"></i>
</a>
```

> **Note:** The `<a>` wrapper is only created if `route`, `key` and the `item` data are all available. If only `route` is provided without `key`, just an `<i>` element is produced.

**Icon registry resolution chain** *(done by the preprocessor — before render)*

The `icon` field looks up the CSS classes from the `config.icons` registry:

1. The `icon` name is found in the registry → apply the registry CSS classes
2. The `icon` name is **not** in the registry, but `icons.primary` exists → `icons.primary` fallback classes
3. `icons.primary` does not exist either → no icon class

```typescript
// aura.config.ts — icon registry
icons: {
    primary: ['fas', 'fa-file'],   // fallback for every unknown icon name
    edit:    ['fas', 'fa-pencil'],
    destroy: ['fas', 'fa-trash'],
    show:    ['fas', 'fa-eye'],
}
```

**Variant registry resolution chain** *(done by the preprocessor — before render)*

The `variant` / `color` field can be any string key — it is resolved to a Bootstrap color name from the `config.variants` registry:

1. The key is found in `config.variants` → `text-{resolved color}` class (e.g. `show` → `info` → `text-info`)
2. The key is **not** in `config.variants` → `variants.primary` fallback (e.g. `text-primary`)
3. There is no `config.variants` registry → the value is applied directly as a `text-{value}` class

```typescript
// aura.config.ts — variants registry
variants: {
    primary: 'primary',  // fallback for every unknown variant
    show:    'info',
    edit:    'warning',
    destroy: 'danger',
}
```

**Example: Registry-based icon and variant**

```json
{
    "body": {
        "columnConfigs": {
            "show_action": {
                "type": "icon",
                "icon": "show",
                "variant": "show",
                "key": "id",
                "route": "products.{id}.show"
            }
        }
    }
}
```

> `icons.show = ['fas', 'fa-eye']` + `variants.show = 'info'` → `<i class="fas fa-eye text-info">`

**Example: Simple icon with dot-notation route**

```json
{
    "body": {
        "columnConfigs": {
            "edit_action": {
                "type": "icon",
                "icon": "edit",
                "variant": "primary",
                "title": "Edit",
                "alt": "Edit",
                "key": "id",
                "route": "users.{id}.edit",
                "size": "sm"
            }
        }
    }
}
```

> `siteName: "https://myapp.com"` + `item.id = 5` → `href="https://myapp.com/users/5/edit"`

**Example: CSS-class icon**

```json
{
    "body": {
        "columnConfigs": {
            "delete_action": {
                "type": "icon",
                "class": ["fa-regular", "fa-trash-can", "text-danger"],
                "title": "Delete",
                "size": "md"
            }
        }
    }
}
```

**Example: Conditional icon**

```json
{
    "body": {
        "columnConfigs": {
            "status_icon": {
                "type": "icon",
                "key": "status",
                "if": [
                    { "eq": "active",   "icon": "check-circle", "variant": "success" },
                    { "eq": "inactive", "icon": "x-circle",     "variant": "danger"  }
                ],
                "else": { "icon": "help-circle", "variant": "warning" }
            }
        }
    }
}
```

**Example: Mapping-based icon (value → glyph + variant)**

Same result as the conditional example above, but more compact — for an enum-like value, `mapping` is the preferred tool instead of the `if`/`else` `eq` chain:

```json
{
    "body": {
        "columnConfigs": {
            "status_icon": {
                "type": "icon",
                "key": "status",
                "mapping": {
                    "active":   { "icon": "check-circle", "variant": "success" },
                    "inactive": { "icon": "x-circle",     "variant": "danger"  },
                    "pending":  { "icon": "clock",         "variant": "warning" }
                }
            }
        }
    }
}
```

> On a no-match (e.g. `status: "archived"`), `status_icon` remains the config without the `mapping` — since there is neither a `class` nor an `icon` on the root here, a class-less, visually empty `<i>` element is rendered (no error, no data loss). Provide a root-level `icon`/`class` as a fallback if this is not desired.

#### `modal` Type — Bootstrap 5 Modal Trigger

The `modal` column type generates a trigger element that opens a Bootstrap 5 modal. The trigger can appear in three forms: **icon** (`<i>` element inside an `<a>` wrapper), **button** (`<button>`), or **link** (`<a href="#">`). In every case the trigger receives the `data-bs-toggle="modal"` and `data-bs-target="#{id}"` Bootstrap attributes.

> **Preprocessor layer (⑦.5):** Before rendering, the response preprocessor (`normalizeModalConfigs`) performs the normalization of the shorthand fields:
> - Root-level `icon`/`variant` fields → `content: { type: "icon", class: [...resolved...] }` object; `icon`/`variant`/`class` are deleted from the root
> - Root-level `button`/`value`/`size` fields → `content: { type: "button", variant, value, size }` object; `button`/`value`/`size` are deleted

> - Flat `type: "icon"`/`type: "button"` in conditional branches → converted into a `content` object; the branch's `type` field is **deleted** (critical: it prevents overriding the root `type: "modal"` during merge)
> - For a nested `content.type === "icon"`, the `icon`/`variant`/`color` fields are resolved from the registry

**Requirement rule:** The `id` field is required — unless `if`/`else` conditional branches are provided (then it can be given at the branch level). Providing a trigger (`icon`, `button`, `content`) is also required, except for a conditional config.

**Fields**

| Field      | Type                  | Required | Description                                                                                                | Example                                         |
| ---------- | --------------------- | -------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `type`     | `'modal'`             | ✅        | Type identifier (literal)                                                                                 | `"modal"`                                       |
| `id`       | `string`              | ⚠️*       | HTML identifier of the modal element; the value of `data-bs-target="#{id}"`; max 250 characters          | `"edit-modal"`, `"confirm-dialog"`              |
| `icon`     | `string`              | ❌        | Shorthand icon trigger; the preprocessor normalizes it into `content: { type: "icon", ... }`; max 250 characters | `"pencil"`, `"edit"`, `"trash"`                |
| `variant`  | `string`              | ❌        | Shorthand variant for the icon trigger; identifier format (`[a-zA-Z][a-zA-Z0-9_-]*`), CSS syntax forbidden | `"primary"`, `"danger"`, `"show"`            |
| `button`   | `string`              | ❌        | Shorthand button trigger style; the preprocessor converts it into `content: { type: "button", variant: button_value }`; max 100 characters | `"danger"`, `"outline-primary"` |
| `value`    | `string`              | ❌        | Button / link text (shorthand `button` pair); max 1000 characters                                        | `"Delete"`, `"Open"`                      |
| `size`     | `string`              | ❌        | Trigger size: `"xs"` \| `"sm"` \| `"md"` \| `"lg"` \| `"xl"`                                   | `"sm"`, `"lg"`                                |
| `target`   | `string`              | ❌        | Link target: `"_blank"` \| `"_self"` \| `"_parent"` \| `"_top"`                                   | `"_blank"`                                     |
| `content`  | `object`              | ❌        | Nested trigger object: `{ type: "icon" \| "button" \| "link", ... }`; the preprocessor fills it in for shorthand | *(see examples)*                    |
| `route`    | `string`              | ❌        | URL template; `{key}` placeholders are resolved from the row data, `.` → `/`; `siteName` prefix; the resolved URL is placed on the trigger as a `data-route` attribute; max 1000 characters | `"items.{id}.edit"` |
| `alt`      | `string`              | ❌        | Accessibility text (`aria-label`); max 500 characters                                                    | `"Edit"`                                |
| `title`    | `string`              | ❌        | Tooltip text; max 500 characters                                                                          | `"Delete item"`                               |
| `class`    | `string \| string[]` | ❌        | Extra CSS classes on the trigger element                                                                  | `["ms-1"]`, `"fw-bold"`                        |
| `style`    | `string`              | ❌        | Inline CSS string                                                                                         | `"cursor: pointer"`                             |
| `key`      | `string`              | ❌        | The `items` data field name — for route placeholder resolution and conditional evaluation                | `"id"`, `"status"`                             |
| `cellRules`| `CellRules`           | ❌        | Conditional `<td>` cell formatting                                                                        | *(see the Conditional Formatting section)*              |
| `if`       | `object[]`            | ❌        | Array of conditional branches                                                                             | *(see the Conditional Rendering section)*            |
| `else`     | `object`              | ❌        | Fallback config if no `if` branch matches                                                                 | *(see the Conditional Rendering section)*            |
| `data-*`   | `string \| number`   | ❌        | Arbitrary `data-` attribute; validated with `DataAttributeValueZod`                                      | `"data-action": "open"`                        |

> ⚠️* `id` is required — except for an `if`/`else` conditional config, where it can also be given at the branch level.

**Rendered HTML output**

```html
<!-- Icon trigger: icon shorthand + registry resolution -->
<!-- config: { type: "modal", id: "edit-modal", icon: "edit", variant: "primary" } -->
<!-- after the preprocessor: content: { type: "icon", class: ["fas", "fa-pencil", "text-primary"] } -->
<a data-bs-toggle="modal" data-bs-target="#edit-modal" role="button" tabindex="0" style="cursor: pointer">
    <i class="fas fa-pencil text-primary"></i>
</a>

<!-- Button trigger: button shorthand -->
<!-- config: { type: "modal", id: "confirm-modal", button: "danger", value: "Delete" } -->
<button type="button" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#confirm-modal">
    Delete
</button>

<!-- Link trigger: content type link -->
<!-- config: { type: "modal", id: "info-modal", content: { type: "link", value: "Details" } } -->
<a href="#" role="button" data-bs-toggle="modal" data-bs-target="#info-modal">
    Details
</a>

<!-- With a route provided: data-route attribute on the trigger -->
<!-- config: { ..., route: "items.{id}", key: "id" }, item: { id: 5 } -->
<a data-bs-toggle="modal" data-bs-target="#edit-modal" data-route="/items/5" role="button" tabindex="0">
    <i class="fas fa-pencil"></i>
</a>
```

> ♿ **Keyboard operation.** The icon trigger is an anchor **without `href`**, which the browser does not make focusable, so it carries `tabindex="0"` plus its own Enter/Space handler. The link trigger (`href="#"`) is already focusable and already turns Enter into a click, so it only adds Space — the key that `role="button"` implies but an anchor never handles. Both forward the keypress as a **click**, because that is the event Bootstrap's modal data-api listens for. The button trigger is a real `<button>` and needs nothing extra. Give an icon trigger an accessible name with `alt` (rendered as `aria-label`) — an icon alone announces nothing.

**Example: Icon trigger shorthand**

```json
{
    "body": {
        "columnConfigs": {
            "editModal": {
                "type": "modal",
                "id": "edit-modal",
                "icon": "edit",
                "variant": "primary",
                "alt": "Edit",
                "route": "items.{id}",
                "key": "id"
            }
        }
    }
}
```

**Example: Button trigger shorthand**

```json
{
    "body": {
        "columnConfigs": {
            "deleteModal": {
                "type": "modal",
                "id": "delete-modal",
                "button": "outline-danger",
                "value": "Delete",
                "size": "sm"
            }
        }
    }
}
```

**Example: Conditional modal — different ID and trigger per branch**

```json
{
    "body": {
        "columnConfigs": {
            "statusModal": {
                "type": "modal",
                "key": "status",
                "if": [
                    { "eq": "active",   "id": "deactivate-modal", "icon": "ban",   "variant": "danger"  },
                    { "eq": "inactive", "id": "activate-modal",   "icon": "check", "variant": "success" }
                ],
                "else": { "id": "info-modal", "icon": "info", "variant": "secondary" }
            }
        }
    }
}
```

> **Note:** The `type: "icon"` fields provided in the conditional branches are **deleted** from the branch by the preprocessor, which instead builds a `content` object — otherwise the `resolveConditionalConfig` merge would override the root `type: "modal"`.

#### Built-in `destroyModal` — delete confirmation dialog

Aura automatically renders a built-in Bootstrap 5 modal with `id="destroyModal"` in every Aura wrapper instance. This modal is the standard confirmation dialog for delete operations — the developer does not have to write their own HTML.

**How it works:**
1. The trigger element opens the modal with the `data-bs-target="#destroyModal"` and `data-route="<url>"` attributes
2. The Bootstrap `show.bs.modal` event reads a URL from the trigger's `data-route` attribute
3. When the "Delete" button is pressed, a `POST` form submit: `_method=DELETE` + best-effort CSRF token

**Example API configuration for a destroyModal trigger:**

```json
{
    "body": {
        "columnConfigs": {
            "actions": {
                "type": "modal",
                "id": "destroyModal",
                "icon": "trash",
                "variant": "danger",
                "route": "users.{id}.destroy",
                "key": "id",
                "alt": "Delete"
            }
        }
    }
}
```

The trigger generated from the config above:

```html
<a data-bs-toggle="modal" data-bs-target="#destroyModal"
   data-route="http://app.test/users/5/destroy" role="button" tabindex="0">
    <i class="fas fa-trash text-danger"></i>
</a>
```

The built-in modal is not customizable. For custom delete logic (e.g. different text, an extra field), the developer creates their own modal with a different `id`, and sets the trigger's `id` field accordingly.

> **CSRF:** If a `<meta name="csrf-token">` tag is present in the DOM (Laravel, Rails, Phoenix applications), the `_token` field is automatically added to the form. If there is no such meta tag, the form is sent without `_token` — the backend's CSRF middleware handles it.

> **Origin protection:** The `destroyModal` form submit runs **only for a same-origin `data-route`** (a relative URL, or an absolute URL with the same origin as the page). If the `data-route` points to a different origin (e.g. due to a manipulated API response), the submit is **fully blocked** and a warning is reported — so the CSRF token cannot leak to a foreign origin. There is no legitimate case for a cross-origin delete operation through this mechanism (the Laravel session + CSRF flow is same-origin by design).

#### `link` column type

The `link` column type generates a clickable `<a href="...">` element. The source of the displayed text is the `field` (from the `items` row), or a fixed `value`. The `href` is built from the `route` template — the `{key}` placeholders are resolved from the row data (`resolveRoute`, the same logic as for the `icon`/`modal` type: dot→slash conversion, `siteName` prefix).

> **Without a route:** if there is no `route`, the element is rendered as a plain `<span>` (no empty anchor).
>
> **`target="_blank"` security:** if there is no explicit `rel`, `rel="noopener noreferrer"` is automatically added to the link (tabnabbing protection).

| Field | Type | Required | Description | Example |
| --- | --- | --- | --- | --- |
| `type` | `'link'` | ✅ | Type identifier (literal) | `"link"` |
| `field` | `string` | ⚠️¹ | Field to display from `items` | `"name"` |
| `value` | `string` | ⚠️¹ | Fixed text (static mode, if there is no `field`) | `"View Profile"` |
| `route` | `string` | ⚠️¹ | URL template with `{key}` placeholders | `"/users/{id}"` |
| `key` | `string` | – | Field used in the URL (default: `id`) | `"slug"` |
| `target` | `'_blank'\|'_self'\|'_parent'\|'_top'` | – | Link target | `"_blank"` |
| `rel` | `string` | – | Link relationship (auto `noopener noreferrer` for `_blank`) | `"noopener"` |
| `title` | `string` | – | Tooltip text | `"Open profile"` |
| `color` | Bootstrap color \| CSS color | – | Text color (`text-{color}` or inline) | `"primary"`, `"#f00"` |
| `variant` | `string` | – | Bootstrap link variant → `link-{variant}` class | `"danger"` |
| `mapping` | `object` | ⚠️¹ | Value → `{ variant, color, class, title, route, target, rel }` mapping (exact match, **`field` selector only**); the matched entry is merged over the config | *(see below)* |
| `class`, `style`, `align`, `fontSize`, `fontWeight`, `italic`, `normal`, `lineHeight`, `monospace`, `text` | – | – | Content formatting (like `static`) | |
| `uppercase`, `lowercase`, `capitalize`, `slice`, `currency`, `date`, `phone`, `unit` | – | – | Content manipulation / special formatting | |
| `data-*` | `string` | – | Data attributes with `{field}` substitution | `"data-id": "{id}"` |
| `if`/`else`/`key`, `cellRules` | – | – | Conditional rendering and cell formatting | |

¹ **At least one** of `field`, `value`, `route` and `mapping` is required (unless `if`/`else` conditional branches are provided).

> **Value-based display (`mapping`):** the `link` `mapping` is **presentation-oriented** — the entry only sets the appearance/URL/link attributes (`variant`, `color`, `class`, `title`, `route`, `target`, `rel`), there is **no `label`/`value` alias**. The reason: the link's **selector and its label are both the `field`** (`field` wins over `value`), so a mapped label would never appear — the label stays the `field`, and the mapping only tunes it. **The selector is exclusively `field`** (here `key` is the URL key, not a selector). The resolution runs **after** the `if`/`else` flattening. Example: `status: "active"` → `{ "variant": "success", "route": "/activate/{id}" }`.

```json
{
    "body": {
        "columnConfigs": {
            "name": {
                "type": "link",
                "field": "name",
                "key": "id",
                "route": "/users/{id}",
                "class": "text-decoration-none"
            },
            "external": {
                "type": "link",
                "field": "website",
                "target": "_blank",
                "color": "info"
            }
        }
    }
}
```

The link generated by the `name` config (row: `{ id: 5, name: "Anna" }`):

```html
<a href="/users/5" class="text-decoration-none">Anna</a>
```

##### Simplified `_link` fields (auto-generation)

If a header cell contains a `_link`-suffixed `field` (or `fields[]` element), the preprocessor (⑦.5) automatically creates the appropriate columnConfig entry — no manual configuration needed. The entry is determined by the **prefix** (the part before `_link`) and the cell's **`key`** field (URL key, default `id`). The routes are generated relative to the resource base path (`config.urlParameter`, the equivalent of `{current_url}`), and the render layer prepends `siteName`.

**Built-in action prefixes (Laravel resource conventions):**

| Field | Generated type | Route |
| --- | --- | --- |
| `create_link` | `link` (label "create") | `{base}/create` |
| `edit_link` | `link` (label "edit") | `{base}/{key}/edit` |
| `show_link` | `link` (label "show") | `{base}/{key}` |
| `destroy_link` | **`modal`** (built-in `destroyModal` trigger) | `{base}/{key}/destroy` |

**Custom prefix (not built-in, e.g. `name_link`):** `key` is the URL placeholder, and the **prefix is also appended to the end of the route**. If a **column** with a `field` matching the prefix exists in the header (e.g. `name`), the cell displays that column's **per-row value from items** (`field: "name"` — e.g. "Tamas Balint" / "Illes Kis Guci"). If there is no such column, the prefix is written out as **static text**, but the link remains.

| Case | Generated config | Display |
| --- | --- | --- |
| `name_link` + a `name` column exists | `{ field: "name", key, route: "{base}/{key}/name" }` | per-row `name` value |
| `name_link` + no `name` column | `{ value: "name", key, route: "{base}/{key}/name" }` | fixed "name" text |

> **URL key:** `key` comes from the cell's `key` field (default `id`). Auto-generation **never overwrites** an existing `columnConfigs` entry — for custom behavior, write an explicit `columnConfig` (every parameter of the `link`/`modal` type is available).

```json
{
    "header": {
        "rows": [
            {
                "cells": [
                    { "content": "Name", "key": "id", "field": "name" },
                    { "content": "Name", "key": "id", "field": "name_link" },
                    { "content": "Edit", "key": "id", "field": "edit_link" },
                    { "content": "Delete", "key": "id", "field": "destroy_link" }
                ]
            }
        ]
    }
}
```

With `urlParameter: "admin/users"`, `siteName: "https://app.com"`, and row `{ id: 7, name: "Tamas Balint" }` (the `name_link` references the `name` column):

```html
<a href="https://app.com/admin/users/7/name">Tamas Balint</a>
<a href="https://app.com/admin/users/7/edit">edit</a>
<a href="#" data-bs-toggle="modal" data-bs-target="#destroyModal"
   data-route="https://app.com/admin/users/7/destroy" role="button">destroy</a>
```

#### `reference` column type

`reference` renders a `<span>` cell whose content is the **value of another field (or fields)** from the `items` row (not a fixed `value` like in `static`). For a single field use `field`, and for concatenating several fields use `fields[]` + `separator`. The resolved text goes through the same formatting chain as `static` (upper/lowercasing, `slice`, `currency`/`date`/`phone`/`number`, `unit`, padding) — that is, it can be built with **the same parameters** as `icon`/`modal`/`static`.

> **Multiple fields:** the values of `fields[]` are joined by the `separator` (default `" "`). Empty/`null` fields are excluded from the concatenation (no dangling separator). If both `field` and `fields` are provided, `fields` wins.

> **Value-based display (`mapping`):** in addition to `field`/`fields` (text read from an item field), `reference` also supports a standalone, fixed **`value`** field — this is the target field of the mapping's `label`→`value` alias (the source of the fixed text for every mapped type is `value`). The text source priority is: **`value` → `fields` → `field`**. `mapping` is a value→label (+formatting) dictionary — e.g. `status: "active"` → `{ label: "Active", color: "success" }` — a more compact alternative to the `if`/`else` `eq` chain for the same purpose. The resolution always runs **after** the `if`/`else` flattening, with the same semantics as the `badge` mapping (see below).

| Field | Type | Required | Description | Example |
| --- | --- | --- | --- | --- |
| `type` | `'reference'` | ✅ | Type identifier (literal) | `"reference"` |
| `field` | `string` | ⚠️¹ | A single referenced field (dotted path OK) | `"email"`, `"user.name"` |
| `fields` | `string[]` | ⚠️¹ | Several fields for concatenation | `["firstName", "lastName"]` |
| `separator` | `string` | – | Separator for `fields` (default `" "`) | `", "` |
| `value` | `string` | ⚠️¹ | Fixed text — the target field of the mapping's `label`→`value` normalization; the renderer ranks it ahead of `fields`/`field` | `"N/A"` |
| `mapping` | `object` | ⚠️¹ | Value → `{ label, ...formatters }` mapping (exact match, `field ?? key` selector, `label`→`value` alias); the matched entry is merged over the config | *(see below)* |
| `key` | `string` | – | Field for conditional (`if`/`else`) evaluation; the `mapping` selector reads this too if there is no `field` | `"description"` |
| `class`, `style`, `align`, `color`, `background`, `fontSize`, `fontWeight`, `italic`, `normal`, `lineHeight`, `monospace`, `text` | – | – | Content formatting (like `static`) | |
| `uppercase`, `lowercase`, `capitalize`, `slice`, `number`, `currency`, `date`, `phone`, `unit`, `padStart`/`padEnd`/`chars` | – | – | Content manipulation / special formatting | |
| `data-*` | `string` | – | Data attributes | `"data-id": "x"` |
| `if`/`else`/`key`, `cellRules` | – | – | Conditional rendering and cell formatting | |

¹ **At least one** of `field`, `fields`, `value` or `mapping` is required (unless `if`/`else` conditional branches are provided).

```json
{
    "body": {
        "columnConfigs": {
            "userEmail": {
                "type": "reference",
                "field": "email",
                "lowercase": true,
                "class": ["text-muted", "small"]
            },
            "fullName": {
                "type": "reference",
                "fields": ["firstName", "lastName"],
                "separator": " ",
                "class": "fw-bold"
            }
        }
    }
}
```

The content generated by the `fullName` config (row: `{ firstName: "Anna", lastName: "Kovacs" }`):

```html
<span class="fw-bold">Anna Kovacs</span>
```

Conditional (null-handling) example — `key` is the examined field, the `else` branch formats the actual reference:

```json
{
    "type": "reference",
    "key": "description",
    "if": [{ "empty": true, "type": "static", "value": "No description", "class": "text-muted fst-italic" }],
    "else": { "field": "description", "slice": 100 }
}
```

**Example: Mapping-based label (value → displayed text)**

```json
{
    "body": {
        "columnConfigs": {
            "statusLabel": {
                "type": "reference",
                "key": "status",
                "mapping": {
                    "active":   { "label": "Active",   "color": "success" },
                    "inactive": { "label": "Inactive", "color": "secondary" },
                    "pending":  { "label": "Pending", "color": "warning", "italic": true }
                }
            }
        }
    }
}
```

For `status: "active"`, the `label` is normalized to `value` via the mapping resolver `resolveMappingConfig`, which `renderReferenceNode` ranks ahead of `fields`/`field`:

```html
<span class="text-success">Active</span>
```

> On a no-match (e.g. `status: "archived"`), `statusLabel` falls back to the config without the `mapping` — since there is neither a `field`, `fields`, nor `value` on the root here, an empty `<span>` is rendered. Provide a root-level `value` or `field` as a fallback if this is not desired.

#### `button` column type

`button` renders a Bootstrap 5 button into the cell. **Dual element model:** if `route` is provided → `<a class="btn btn-{variant} btn-{size}" href="...">` (navigation button, the `{key}` placeholders are resolved from the row data, `resolveRoute`); if there is **no** `route` → a real `<button type="{htmlType}">` (in a form context with `submit`/`reset`, `disabled` support). The button's label is the `field` (from the `items` row) or a fixed `value`, which goes through the same formatting chain as `static`.

> **Icon:** `icon` is a **registry key of `config.icons`** (not a raw CSS class) — the rendering resolves the classes from the registry (with an `icons.primary` fallback for an unknown key), and places an `<i>` glyph before the label (`iconPosition: "start"`, default) or after it (`"end"`). Without `field`/`value`, using only `icon` produces an icon button.

| Field | Type | Required | Description | Example |
| --- | --- | --- | --- | --- |
| `type` | `'button'` | ✅ | Type identifier (literal) | `"button"` |
| `field` | `string` | ⚠️¹ | Label source from the `items` row (dotted path OK) | `"name"` |
| `value` | `string` | ⚠️¹ | Fixed label (static mode) | `"Details"` |
| `route` | `string` | ⚠️¹ | URL template — its presence selects `<a class="btn">` | `"/users/{id}/edit"` |
| `key` | `string` | – | URL key field (default `id`) / conditional evaluation | `"id"`, `"slug"` |
| `icon` | `string` | ⚠️¹ | `config.icons` registry key | `"cog"`, `"edit"` |
| `iconPosition` | `'start'` \| `'end'` | – | Icon position relative to the label (default `start`) | `"end"` |
| `variant` | `string` | – | Bootstrap btn variant | `"primary"`, `"outline-secondary"` |
| `size` | `'xs'`–`'xl'` | – | Button size (`btn-{size}`) | `"sm"` |
| `rounded` | `boolean` | – | Round button (`rounded-circle`) | `true` |
| `pill` | `boolean` | – | Pill button (`rounded-pill`) | `true` |
| `disabled` | `boolean` | – | Disabled state (`<button disabled>` / `<a class="disabled" aria-disabled>`) | `true` |
| `title` | `string` | – | Tooltip | `"Settings"` |
| `htmlType` | `'button'` \| `'submit'` \| `'reset'` | – | HTML `type` (only on the `<button>` branch, default `button`) | `"submit"` |
| `mapping` | `object` | ⚠️¹ | Value → `{ variant, color, background, size, rounded, pill, disabled, icon, iconPosition, title, route, class }` mapping (exact match, **`field` selector only**); the matched entry is merged over the config | *(see below)* |
| `class`, `style`, `color`, `background`, `align`, `fontSize`, `fontWeight`, `italic`, `normal`, `lineHeight`, `monospace`, `text` | – | – | Content formatting (like `static`) | |
| `uppercase`, `lowercase`, `capitalize`, `slice`, `number`, `currency`, `date`, `phone`, `unit`, `padStart`/`padEnd`/`chars` | – | – | Content manipulation / special formatting | |
| `data-*` | `string` | – | Data attributes (with `{field}` substitution) | `"data-user-id": "{id}"` |
| `if`/`else`/`key`, `cellRules` | – | – | Conditional rendering and cell formatting | |

¹ **At least one** of `field`, `value`, `route`, `icon` and `mapping` is required (unless `if`/`else` conditional branches are provided).

> **Value-based display (`mapping`):** the `button` `mapping` is **presentation-oriented** — the entry only sets the button's appearance/state/URL (`variant`, `color`, `background`, `size`, `rounded`, `pill`, `disabled`, `icon`, `iconPosition`, `title`, `route`, `class`), there is **no `label`/`value` alias** (the label stays the `field`, see the `link` mapping explanation). **The selector is exclusively `field`** (here `key` is the URL key). The resolution runs **after** the `if`/`else` flattening. Example: `state: "locked"` → `{ "variant": "danger", "disabled": true, "icon": "lock" }`.

```json
{
    "body": {
        "columnConfigs": {
            "edit": {
                "type": "button",
                "field": "name",
                "key": "id",
                "route": "/users/{id}/edit",
                "variant": "primary",
                "size": "sm",
                "icon": "edit"
            },
            "settings": {
                "type": "button",
                "icon": "cog",
                "variant": "outline-secondary",
                "size": "sm",
                "rounded": true,
                "title": "Settings"
            }
        }
    }
}
```

The content generated by the `edit` config (row: `{ id: 5, name: "Edit" }`, `config.icons.edit = ["fas", "fa-edit"]`):

```html
<a href="/users/5/edit" class="btn btn-primary btn-sm"><i class="fas fa-edit"></i> Edit</a>
```

##### Simplified `_button` fields (auto-generation)

If a header cell contains a `_button`-suffixed `field` (or `fields[]` element), the preprocessor (⑦.5) automatically creates the appropriate columnConfig entry — following the `_link`/`_icon` pattern, without manual configuration. The entry is determined by the **prefix** (the part before `_button`) and the cell's **`key`** field (URL key, default `id`). The routes are generated relative to the resource base path (`config.urlParameter`, the equivalent of `{current_url}`), and the render layer prepends `siteName`.

> **Variant from the registry:** unlike `_link`, the button **always gets a `variant`** (a style-less `.btn` would be invisible). The variant is resolved from the `config.variants` registry based on the prefix (`edit` → `variants.edit`), with `variants.primary` and then the literal `"primary"` fallback. So, for example, `destroy_button` gets the `variants.destroy` (default: `danger`) color. It does **NOT** generate an icon — only a label + variant color; an icon needs an explicit `columnConfig`.

| Prefix | Generated type | Route |
| --- | --- | --- |
| `create_button` | `button` (label "create") | `{base}/create` |
| `edit_button` | `button` (label "edit") | `{base}/{key}/edit` |
| `show_button` | `button` (label "show") | `{base}/{key}` |
| `destroy_button` | **`modal`** (built-in `destroyModal` trigger, `button` content) | `{base}/{key}/destroy` |

**Custom prefix (not built-in, e.g. `name_button`):** `key` is the URL placeholder, and the **prefix is also appended to the end of the route**. If a **column** with a `field` matching the prefix exists in the header (e.g. `name`), the cell displays that column's **per-row value from items** (`field: "name"`). If there is no such column, the prefix is written out as **static text**, but the link remains.

| Case | Generated config | Displayed text |
| --- | --- | --- |
| `name_button` + a `name` column exists | `{ field: "name", variant, key, route: "{base}/{key}/name" }` | per-row `name` value |
| `name_button` + no `name` column | `{ value: "name", variant, key, route: "{base}/{key}/name" }` | fixed "name" text |

```json
{
    "header": {
        "rows": [
            {
                "cells": [
                    { "content": "Name", "key": "id", "field": "name" },
                    { "content": "Edit", "key": "id", "field": "edit_button" },
                    { "content": "Delete", "key": "id", "field": "destroy_button" }
                ]
            }
        ]
    }
}
```

With `urlParameter: "admin/users"`, `variants: { edit: "primary", destroy: "danger" }`, and row `{ id: 7 }`, the preprocessor generates the following configs:

```jsonc
// edit_button →
{ "type": "button", "value": "edit", "variant": "primary", "key": "id", "route": "admin/users/{id}/edit" }
// destroy_button →
{ "type": "modal", "id": "destroyModal", "key": "id", "route": "admin/users/{id}/destroy",
  "content": { "type": "button", "value": "destroy", "variant": "danger" } }
```

#### `badge` column type

`badge` renders a Bootstrap 5 badge into the cell (`<span class="badge text-bg-{variant}">`). The displayed label and the color are a function of the **value**, with three resolution modes:

1. **Static / simple** — `field` (from the `items` row) or a fixed `value` + a fixed `variant`. The label goes through the same formatting chain as `static`.
2. **Mapping (value → config)** — `mapping[value]` maps to a `{ label, variant, icon, class }` entry (e.g. `high` → `danger` + "High"). **If there is no match**, the badge appears with the raw value and the config's `variant` (no data loss; `secondary` in the absence of a variant).
3. **Boolean (`trueValue` / `falseValue`)** — if `trueValue` or `falseValue` is provided, the value is interpreted as a boolean (`true`/`1`/`yes` and non-empty strings are truthy; `false`/`0`/`no`/empty are falsy), and the config of the corresponding branch's `{ label, variant, icon, class }` is used.

> **Counter mode (numeric value):** `prefix` is placed before it (e.g. `#`), above `maxValue` the label becomes `{maxValue}{suffix}` (e.g. `15` → `"9+"` if `maxValue: 9`, `suffix: "+"`), and with `showZero: false` it renders **nothing** at value 0.

> **Icon:** `icon` (and the `icon` of `mapping`/`trueValue`/`falseValue`) is a **registry key of `config.icons`** — it is resolved the same way as in `button` (`icons.primary` fallback), with an `<i>` glyph before the label (`iconPosition: "start"`, default) or after it (`"end"`).

> **Variant class:** the badge uses the Bootstrap **5.3 `text-bg-{variant}`** form (automatic contrast text for the background), not the old `bg-{variant}`.

| Field | Type | Required | Description | Example |
| --- | --- | --- | --- | --- |
| `type` | `'badge'` | ✅ | Type identifier (literal) | `"badge"` |
| `field` | `string` | ⚠️¹ | Which field's value controls the badge | `"status"` |
| `value` | `string` | ⚠️¹ | Fixed label (static mode) | `"NEW"` |
| `variant` | `BootstrapColor` | – | Base / fallback color (`primary`…`dark`) | `"success"` |
| `pill` | `boolean` | – | `rounded-pill` style | `true` |
| `size` | `'sm'\|'md'\|'lg'…` | – | Size modifier (`badge-{size}`) | `"sm"` |
| `mapping` | `object` | ⚠️¹ | Value → `{ label, variant, icon, class }` | *(see below)* |
| `trueValue` / `falseValue` | `object` | ⚠️¹ | Boolean branch `{ label, variant, icon, class }` | *(see below)* |
| `showZero` | `boolean` | – | Whether the value 0 is shown (default: `true`) | `false` |
| `maxValue` | `number` | – | Max displayed number (overflow above it) | `99` |
| `suffix` | `string` | – | Overflow marker after `maxValue` | `"+"` |
| `prefix` | `string` | – | Prefix before the label | `"#"` |
| `icon` | `string` | – | `config.icons` registry key | `"check"` |
| `iconPosition` | `'start'\|'end'` | – | Icon position (default: `"start"`) | `"end"` |
| formatters | – | – | Full `static` parity on the label (color/background/uppercase/slice/…) | |
| `data-*` | `string` | – | Data attributes (with `{field}` substitution) | `"data-id": "{id}"` |
| `if`/`else`/`key`, `cellRules` | – | – | Conditional rendering and cell formatting | |

¹ **At least one** of `field`, `value`, `mapping`, `trueValue` or `falseValue` is required (unless `if`/`else` conditional branches are provided).

```json
{
    "body": {
        "columnConfigs": {
            "status": {
                "type": "badge",
                "field": "status",
                "variant": "success"
            },
            "priority": {
                "type": "badge",
                "field": "priority",
                "mapping": {
                    "high": { "variant": "danger", "label": "High" },
                    "medium": { "variant": "warning", "label": "Medium" },
                    "low": { "variant": "secondary", "label": "Low" }
                }
            },
            "verified": {
                "type": "badge",
                "field": "isVerified",
                "trueValue": { "label": "Verified", "variant": "success", "icon": "check" },
                "falseValue": { "label": "Pending", "variant": "warning", "icon": "clock" }
            },
            "unread": {
                "type": "badge",
                "field": "unreadCount",
                "variant": "primary",
                "pill": true,
                "showZero": false,
                "maxValue": 99,
                "suffix": "+"
            }
        }
    }
}
```

The `priority` config generates the following at the `high` value:

```html
<span class="badge text-bg-danger">High</span>
```

##### Simplified `_badge` fields (auto-generation)

If a header cell contains a `_badge`-suffixed `field` (or `fields[]` element), the preprocessor (⑦.5) automatically creates the appropriate `badge` columnConfig entry — following the `_link`/`_button`/`_icon` pattern, without manual configuration.

> **Difference from `_link`/`_button`:** the badge **never navigates**, so here there is **no route, no built-in prefix** (create/edit/show/destroy) and **no modal**. The only prefix-dependent logic is the field resolution and the variant.

**Field resolution (what the badge displays):** based on the **prefix** obtained by stripping `_badge`. If a **column** with a `field` matching the prefix exists in the header (e.g. `status`), the badge reads its per-row value from `items` (`field: "status"`). If there is no such column, the badge reads the **full suffixed field** (`field: "status_badge"`) — in this case the backend sends the badge value under the `status_badge` key.

**Variant (base color):** it is resolved from the `config.variants` registry based on the prefix (`status` → `variants.status`), with `variants.secondary` and then the literal `"secondary"` fallback. The `mapping`/`boolean`/counter modes **cannot be derived automatically**, so the auto-generated badge is always a plain field badge (the more advanced modes need an explicit `columnConfig`).

| Field | Resolution | Result |
| --- | --- | --- |
| `status_badge` + no `status` column | full suffixed field | `{ type: "badge", field: "status_badge", variant }` |
| `role_badge` + a `role` column exists | prefix column (per-row) | `{ type: "badge", field: "role", variant }` |

```json
{
    "header": {
        "rows": [
            {
                "cells": [
                    { "content": "Status", "field": "status_badge" }
                ]
            }
        ]
    }
}
```

With `variants: { status: "info" }` this generates the following config (there is no separate `status` column):

```json
// status_badge → { "type": "badge", "field": "status_badge", "variant": "info" }
```

#### `progress` column type

The `progress` type renders a Bootstrap 5 progress bar: it displays a `field`'s (or fixed `value`'s) numeric value as a percentage of the `[min, max]` range (`<div class="progress"><div class="progress-bar bg-{variant}" style="width:{percent}%">`).

```json
{
    "body": {
        "columnConfigs": {
            "completion": {
                "type": "progress",
                "field": "completionRate",
                "variant": "success",
                "label": true
            },
            "storageUsage": {
                "type": "progress",
                "field": "usedSpace",
                "max": "totalSpace",
                "label": "{value} GB / {max} GB",
                "height": "20px",
                "striped": true,
                "animated": true
            },
            "cpuUsage": {
                "type": "progress",
                "field": "cpu",
                "thresholds": { "success": [0, 50], "warning": [51, 80], "danger": [81, 100] },
                "label": true
            }
        }
    }
}
```

| Field           | Type                        | Description                                                                    |
| --------------- | --------------------------- | ----------------------------------------------------------------------------- |
| `field`         | `string`                    | The item field whose numeric value fills the bar                              |
| `value`         | `number`                    | Fixed value (static mode, instead of `field`)                                 |
| `max`           | `number \| string`          | Maximum — a number or field name (per-row max); default `100`                 |
| `min`           | `number`                    | Minimum; default `0`                                                          |
| `variant`       | `BootstrapColor`            | Static bar color (the lowest priority among the color sources)                |
| `height`        | `string`                    | Bar height (e.g. `"20px"`, `"1rem"`)                                          |
| `striped`       | `boolean`                   | Striped appearance                                                            |
| `animated`      | `boolean`                   | Animated stripes (only effective with `striped`)                             |
| `label`         | `boolean \| string`         | `true` → percentage; template string with `{value}`/`{max}`/`{percent}` substitution |
| `labelPosition` | `"inside" \| "outside"`     | Label inside the bar (default) or after the bar                               |
| `mapping`       | `object`                    | Range-keyed (`"0-25"`) → `{ variant, label, class }`                          |
| `thresholds`    | `object`                    | `variant → [min, max]` threshold coloring                                     |
| `stacked`       | `boolean`                   | Several bars side by side                                                     |
| `bars`          | `object[]`                  | Stacked bars: `{ field, variant, label }`                                     |
| `showValue`     | `boolean`                   | Value label (if there is no explicit `label`)                                 |
| `showPercent`   | `boolean`                   | Percentage label (if there is no explicit `label`)                            |
| `decimals`      | `number`                    | Decimal places in the number formatting (default `0`)                        |
| `prefix`/`suffix` | `string`                  | Prefix/suffix in the default label                                            |

**Coloring priority:** `mapping` (range) → `thresholds` → `variant` → `primary` (fallback). The most specific wins; a `mapping` match can also provide a label.

**Label (label is the master):** if `label` is a template string → we use it (`{value}`/`{max}`/`{percent}` + `decimals`). `label: true` → `{prefix}{percent}{suffix ?? "%"}`. If there is no `label`, `showValue`/`showPercent` build the label. A `mapping` that matches overrides the config label with its `label`.

**Stacked (`stacked: true` + `bars`):** the bar widths are **auto-normalized** — each bar is `barValue / Σ(bars) * 100`, so it always fills the track exactly (showing the relative proportions).

```json
{
    "type": "progress",
    "stacked": true,
    "bars": [
        { "field": "sold", "variant": "success", "label": "Sold" },
        { "field": "reserved", "variant": "warning", "label": "Reserved" },
        { "field": "available", "variant": "secondary", "label": "Available" }
    ]
}
```

##### Simplified `_progress` fields (auto-generation)

If a header cell contains a `_progress`-suffixed `field` (or `fields[]` element), the preprocessor (⑦.5) automatically creates the appropriate `progress` columnConfig entry — following the `_badge` pattern.

> **Difference from `_link`/`_button`/`_icon`:** the progress bar **never navigates**, so there is **no route, no built-in prefix and no modal**; there is **no variant registry** either — the auto-generated progress is always a plain field bar (the render colors it with the `primary` fallback).

**Field resolution:** based on the **prefix** obtained by stripping `_progress`. If a header column with a `field` matching the prefix exists (e.g. `cpu`), the bar reads its per-row value (`field: "cpu"`); otherwise the full suffixed field (`field: "completion_progress"`).

```json
// completion_progress → { "type": "progress", "field": "completion_progress" }
```

#### `custom` column type

`custom` is the most flexible column type: it chooses from **four rendering modes** (in priority order), so any display can be produced.

1. **`renderer`** — the **name** of a function in the `config.renderers` **host registry**. The function is called with `(value, row, config)` arguments and returns an **HTML string**, which is placed into the cell as `innerHTML`. For `fields[]`, the first argument is the array of resolved values.
2. **`callback`** — the **name** of a function in the `config.callbacks` host registry. It is called with `(value, row, params)` arguments and returns **plain text** (processed by the `static` formatter and then escaped by Vue — not HTML).
3. **`template`** — an HTML string with placeholders (`{value}`, `{field}`, `{class}`, `{icon}`, and any keys of the `mapping` entry). After substitution, DOMPurify sanitizes it.
4. **default** — if none of these is present, the raw `field`/`value` value is displayed (with static formatting).

> **Security:** `renderer`/`callback`/`template` in the `config` only reference a host function by **name** — the API response **cannot inject code** (the functions are provided exclusively by the host at the `app.use`/props level). Every HTML output (`renderer`, `template`) goes through DOMPurify (with the cell-level `raw` whitelist), and the `callback` output is escaped text. The `template`'s `mapping` is a **set of template parameters** (the entry keys are the placeholder names, the values are exclusively primitives) — the final sanitization is the security boundary.

| Parameter | Type | Required | Description | Example |
| --- | --- | :---: | --- | --- |
| `type` | `'custom'` | ✅ | Type identifier (literal) | `"custom"` |
| `field` | `string` | ⚠️¹ | The field of the primary value from items | `"status"` |
| `fields` | `string[]` | ⚠️¹ | Several fields (the `renderer` receives it as an array) | `["first","last"]` |
| `value` | `string` | ⚠️¹ | Fixed value source | `"N/A"` |
| `renderer` | `string` | ⚠️¹ | `config.renderers` function name (HTML) | `"userCard"` |
| `callback` | `string` | ⚠️¹ | `config.callbacks` function name (text) | `"formatPrice"` |
| `template` | `string` | ⚠️¹ | HTML template with placeholders | `"<b>{value}</b>"` |
| `params` | `object` | – | Extra data for the `callback` | `{ "currency": "HUF" }` |
| `mapping` | `object` | – | Value → template parameters (exact or `"min-max"` range) | see below |

> ¹ **At least one** of `renderer`/`callback`/`template`/`field`/`fields`/`value` is required (unless there is a conditional `if`/`else` branch).

**Host registry (`app.use`):**

```javascript
app.use(Aura, {
    renderers: {
        userCard: (value, row, config) => `<div class="user-card"><strong>${value}</strong></div>`,
    },
    callbacks: {
        formatPrice: (price, row, params) => `${price} ${params.currency}`,
    },
});
```

**Template + mapping (value → placeholder parameters):**

```json
{
    "type": "custom",
    "field": "stock",
    "template": "<span class='{class}'>{icon} {label}</span>",
    "mapping": {
        "0": { "class": "text-danger", "icon": "⚠", "label": "Out of stock" },
        "1-10": { "class": "text-warning", "icon": "!", "label": "Low" },
        "11-999": { "class": "text-success", "icon": "✓", "label": "In stock" }
    }
}
```

> The `custom` `mapping` is a **different dialect** from the other types': it is not merged over the config; instead the keys of the matched entry are substituted into the `template`'s placeholders. The key can be **exact** (`"active"`) or a **range** (`"1-10"`, like in `progress`); on a match, the exact one wins. Therefore `custom` (alongside `badge`/`progress`) is **excluded** from the generic `resolveMappingConfig` resolver.

### Conditional Rendering

Every `body.columnConfigs` entry supports conditional rendering via the `if`/`else`/`key` structure. This makes it possible for the cell's configuration (e.g. variant, text, style) to change dynamically based on the current row's data.

#### Structure

```json
{
    "body": {
        "columnConfigs": {
            "status": {
                "key": "status",
                "if": [
                    { "eq": "active", "variant": "success", "label": "Active" },
                    { "eq": "inactive", "variant": "secondary", "label": "Inactive" }
                ],
                "else": { "variant": "warning", "label": "Unknown" }
            }
        }
    }
}
```

| Field   | Type                           | Description                                                                          |
| ------- | ------------------------------ | ----------------------------------------------------------------------------------- |
| `key`   | `string`                       | The name of the field in the `items` data object whose value the evaluation is based on |
| `if`    | `Record<string, unknown>[]`    | Array of conditions — the config properties of the first matching branch are applied |
| `else`  | `Record<string, unknown>`      | If no `if` branch matches, this config is applied (optional)                        |

> If neither an `if` branch nor `else` matches, the cell is not rendered.

#### Supported operators

| Operator                      | Description                                | Example value          |
| ----------------------------- | ------------------------------------------ | ---------------------- |
| `eq`                          | Equal                                      | `"active"`             |
| `ne` / `neq`                  | Not equal                                  | `"inactive"`           |
| `gt` / `bigger`               | Greater than                               | `100`                  |
| `gte` / `biggerOrEqual`       | Greater than or equal                      | `100`                  |
| `lt` / `smaller`              | Less than                                  | `50`                   |
| `lte` / `smallerOrEqual`      | Less than or equal                         | `50`                   |
| `between`                     | Is within an interval (inclusive)          | `[10, 100]`            |
| `in`                          | Is in the array                            | `["admin", "editor"]`  |
| `notIn`                       | Is not in the array                        | `["banned"]`           |
| `contains`                    | Contains (string)                          | `"@example.com"`       |
| `startsWith`                  | Starts with (string)                       | `"admin"`              |
| `endsWith`                    | Ends with (string)                         | `".hu"`                |
| `regex`                       | Regular expression (string)                | `"^[A-Z]"`             |
| `null`                        | Whether the value is `null`                | `true`                 |
| `notNull`                     | Whether the value is not `null`            | `true`                 |
| `empty`                       | Whether it is empty (null, undefined, '', 0, false) | `true`                 |
| `notEmpty`                    | Whether it is not empty                    | `true`                 |
| `true`                        | The value is exactly `true`                | `true`                 |
| `false`                       | The value is exactly `false`               | `true`                 |

#### Special date values

Special date keywords can also be used in the comparison values:

| Keyword       | Description                     |
| ------------- | ------------------------------- |
| `"now"`       | The current exact point in time |
| `"today"`     | Today (00:00:00)                |
| `"yesterday"` | Yesterday (00:00:00)            |
| `"tomorrow"`  | Tomorrow (00:00:00)             |
| ISO string    | e.g. `"2025-01-01T00:00:00.000Z"` |

```json
{
    "key": "expires_at",
    "if": [
        { "lt": "now", "variant": "danger", "label": "Expired" },
        { "between": ["today", "tomorrow"], "variant": "warning", "label": "Expires today" }
    ],
    "else": { "variant": "success", "label": "Valid" }
}
```

#### Nested Conditions

The conditions can be nested, up to a maximum depth of 5 levels:

```json
{
    "key": "role",
    "if": [
        {
            "eq": "admin",
            "key": "status",
            "if": [
                { "eq": "active", "variant": "success", "label": "Admin (active)" }
            ],
            "else": { "variant": "warning", "label": "Admin (inactive)" }
        }
    ],
    "else": { "variant": "secondary", "label": "User" }
}
```

### Conditional Styling

The `rowRules` and `cellRules` fields make it possible to conditionally format the table's rows (`<tr>`) and cells (`<td>`) based on the API response. The formatting uses the same `key`/`if`/`else` condition system as [Conditional Rendering](#conditional-rendering).

#### Priority order

> `rowRules` < `cellRules` < `columnConfigs` styles

- **`body.rowRules`** — formats the whole row (`<tr>`); applies to every cell
- **`body.columnConfigs.*.cellRules`** — formats a given column's cell (`<td>`); overrides `rowRules`

#### Available formatting options (`CellFormattingOptions`)

| Field          | Type                | Description                                                                    | Example                        |
| -------------- | ------------------- | ----------------------------------------------------------------------------- | ------------------------------ |
| `background`   | `string`            | Background color: Bootstrap color → `bg-*` class, raw CSS → `backgroundColor` | `"success-subtle"`, `"#fff3cd"` |
| `color`        | `string`            | Text color: Bootstrap color → `text-*` class, raw CSS → `color`              | `"danger-emphasis"`, `"red"`    |
| `borderTop`    | `boolean`           | Show the top border                                                           | `true`                         |
| `borderBottom` | `boolean`           | Show the bottom border                                                        | `true`                         |
| `borderLeft`   | `boolean`           | Show the left border                                                          | `true`                         |
| `borderRight`  | `boolean`           | Show the right border                                                         | `true`                         |
| `borderColor`  | `string`            | Border color: Bootstrap → `var(--bs-*)`, raw CSS → as-is (default: currentColor) | `"success"`, `"#198754"`     |
| `borderWidth`  | `string`            | Border width (default: `"1px"`)                                              | `"3px"`, `"0.25rem"`          |
| `padding`      | `string`            | Inner padding (CSS shorthand)                                                 | `"8px 16px"`                   |
| `class`        | `string \| string[]` | Extra CSS classes                                                            | `"fw-bold"`, `["fw-bold", "text-truncate"]` |
| `style`        | `string`            | Inline CSS string (kebab-case → camelCase parse)                            | `"font-size: 14px"`            |
| `opacity`      | `number`            | Opacity between 0 and 1                                                       | `0.6`                          |

#### `body.rowRules` — row-level formatting

```json
{
    "body": {
        "rowRules": {
            "key": "status",
            "if": [
                { "eq": "active",   "background": "success-subtle", "borderBottom": true, "borderColor": "success" },
                { "eq": "pending",  "background": "warning-subtle", "borderLeft": true,   "borderWidth": "4px" },
                { "eq": "inactive", "background": "secondary-subtle", "class": "text-muted", "opacity": 0.6 }
            ],
            "else": { "background": "light" }
        }
    }
}
```

#### `body.columnConfigs.*.cellRules` — column-level cell formatting

```json
{
    "body": {
        "columnConfigs": {
            "score": {
                "type": "static",
                "cellRules": {
                    "key": "score",
                    "if": [
                        { "gte": 90, "background": "success-subtle", "borderLeft": true, "borderWidth": "3px", "borderColor": "success" },
                        { "gte": 70, "background": "warning-subtle" },
                        { "lt":  50, "background": "danger-subtle",  "opacity": 0.7 }
                    ]
                }
            },
            "expires_at": {
                "type": "static",
                "cellRules": {
                    "key": "expires_at",
                    "if": [
                        { "lt": "now",      "background": "danger-subtle",  "class": "text-decoration-line-through" },
                        { "lt": "tomorrow", "background": "warning-subtle", "borderLeft": true }
                    ]
                }
            }
        }
    }
}
```

> **Note:** In `cellRules`, the same condition operators and date keywords apply as in the [Conditional Rendering](#conditional-rendering) section.

### Pagination

Aura automatically handles the Laravel API Resource and Pagination response formats (the `meta` and `links` objects).

## Accessibility

The rendered table carries the semantics assistive technologies need — nothing to configure, it
is how the markup is emitted:

- **Every `<th>` declares its scope.** Header cells, the search row's cells, the select-all cell
  and the footer cells all get `scope="col"`, and `scope="colgroup"` when the cell spans several
  columns (`colspan > 1`). Without this a screen reader cannot associate a data cell with its
  header (WCAG 1.3.1).
- **A sortable column announces its sort state.** Its `<th>` carries
  `aria-sort="ascending" | "descending" | "none"`, computed from the store's sort state. A column
  that is not sortable has no `aria-sort` at all, so the attribute never implies an affordance
  that is missing; `none` on a sortable column is what tells the user it *can* be sorted.
- **The sort control is a real `<button>`.** It is focusable and reacts to Enter/Space by itself,
  so sorting is no longer mouse-only. Its accessible name is the `sortColumn` [label](#labels)
  (`'Sort column'` by default), and the icon inside it is `aria-hidden` — the state is announced
  by `aria-sort`, so announcing the icon too would only add noise.

- **The table is marked `aria-busy` while loading.** During a request the `<table>` carries
  `aria-busy="true"`, so a partially rendered table is not announced as the final result, and the
  overlay's spinner is a `role="status"` element whose accessible name is the `loading`
  [label](#labels) (`'Loading...'` by default).

Still open: the `<table>` has no `<caption>` and no `aria-label` of its own.

## Error Handling

The Aura plugin provides built-in, ECS-compatible (Elastic Common Schema) error handling, UI display, and remote error reporting.

### Error Display UI

Aura automatically displays errors to the user with severity-based priority:

#### Critical/Error level errors (Full Screen)

If there is a `critical` or `error` severity error, the table is not shown; only the errors are visible instead:

```typescript
const core = useCoreStore('my-table', props);

// Add a critical error
core.errorStore.addError({
    severity: 'critical',
    component: 'DataLoader',
    action: 'loadData',
    type: 'network',
    message: 'Failed to connect to server',
});

// The component automatically switches to a full screen error state
// Only the ErrorHandler component is shown
```

**Display:**

- The whole page is replaced with the error state
- Bootstrap alert-dismissible pattern
- In a container, with padding
- Up to 10 errors visible at once
- A "Clear all" button is available

#### Warning/Info/Debug errors (Top Notification)

If there is a `warning`, `info` or `debug` severity error, the errors appear at the top of the content, and the table is shown normally below:

```typescript
const core = useCoreStore('my-table', props);

// Add a warning
core.errorStore.addError({
    severity: 'warning',
    component: 'DataLoader',
    action: 'loadData',
    type: 'validation',
    message: 'Some data might be outdated',
});

// The table is shown normally
// The warning is visible at the top of the content
```

**Display:**

- Errors before the table, at the top of the content
- In plain Bootstrap alert style
- Up to 5 errors visible at once
- The table works normally below

#### Priority order

1. **Critical/Error** → Full screen error state (the table is not shown)
2. **Warning/Info/Debug** → Top notification (the table is shown)

If there is a critical/error error, the warnings are not shown (critical overrides everything).

#### ErrorHandler Component Props

The ErrorHandler component accepts the following props:

```typescript
interface ErrorHandlerProps {
    errorStore: ErrorHandlerStore; // Error store instance (required)
    maxVisible?: number; // Max number of errors (default: 5)
    showDismissAll?: boolean; // "Clear all" button (default: true)
    severityFilter?: ErrorSeverity[]; // Severity filter (default: ['critical', 'error', 'warning'])
    componentFilter?: string; // Component filter (optional)
}
```

**Usage:**

```typescript
import { ErrorHandler } from '@tamas-labs/aura';

// Custom ErrorHandler usage in a component
<ErrorHandler
  :errorStore="core.errorStore"
  :maxVisible="10"
  :showDismissAll="true"
  :severityFilter="['error', 'warning']"
/>
```

### Error Handler Store

`useErrorHandlerStore` provides centralized error handling and error tracking:

```typescript
import { useErrorHandlerStore } from '@tamas-labs/aura';

// Create an error handler store
const errorStore = useErrorHandlerStore('my-error-store');

// Add an error
errorStore.addError({
    severity: 'error',
    component: 'UserForm',
    action: 'submit',
    type: 'validation',
    message: 'Invalid email format',
    key: 'email',
    details: 'Email must contain @ symbol',
});

// Query the errors
console.log(errorStore.errors);
console.log(errorStore.hasErrors); // true/false
console.log(errorStore.isValid); // true/false

// Clear errors
errorStore.clearErrors(); // Clear all errors
errorStore.clearByKey('email'); // Clear only the errors with the email key
errorStore.clearByComponent('UserForm'); // Clear a component's errors
errorStore.clearByType('validation'); // Clear by type

// Filter errors
const criticalErrors = errorStore.criticalErrors;
const warnings = errorStore.warnings;
const emailErrors = errorStore.getErrorsByKey('email');
```

#### Automatic error keys

The `key` is optional on the `addError()` input, but **every stored error has one**: when the
caller omits it, the store generates a deterministic key from the error's own identity, in
`component.action.type` form.

```typescript
errorStore.addError({
    severity: 'error',
    component: 'ApiResourcesStore',
    action: 'fetchData',
    type: 'api',
    message: 'Request failed with status code 500',
});

errorStore.errors[0].key; // 'ApiResourcesStore.fetchData.api'
```

This matters because the key is what makes an error *removable*: the error UI only renders a
dismiss button for errors that have a key, and `clearByKey()` is the only way to remove a single
error. Before this, an error reported without a key — a failed fetch, for example — could block
the table with no way for the user to get past it.

The generated key is stable for a given error source, so repeated failures from the same place
share a key and can be cleared with one `clearByKey()` call. Keys generated this way are **not**
shown as a badge in the error UI (they would only repeat the component and type badges next to
them); a key you supply yourself is displayed as before.

#### Repeated errors are merged, and the list is bounded

The same problem happening again does not add a second entry: the store merges it into the one
already there and counts the occurrences. Two errors are "the same problem" when their `key`,
`severity`, `message` and `details` all match — so a wrong type and an out-of-range value on the
same config key stay two separate errors, while a table refreshing every 30 seconds against a
failing endpoint produces exactly one.

```typescript
errorStore.addError(failure); // stored
errorStore.addError(failure); // merged into the first entry

errorStore.errors.length; // 1
errorStore.errors[0].count; // 2
errorStore.errors[0].timestamp; // the first occurrence
errorStore.errors[0].lastTimestamp; // the latest one
```

`count` and `lastTimestamp` are **absent until the error repeats**, so the occurrence count is
`count ?? 1`. The error UI renders a `×N` badge for merged errors, with the `errorOccurrences`
[label](#labels) as its tooltip. `metadata` describes the *first* occurrence — it is context of
that one event, not of the problem — and every occurrence is still sent to the [remote error reporting
endpoint](#remote-error-reporting), where aggregation belongs.

Merging alone does not bound the array (a response can produce endlessly *distinct* errors), so
the store also keeps at most **50** errors. Above that the oldest ones are dropped, with two
rules: an `info`/`warning`/`debug` entry always goes before a `critical`/`error` one — a flood of
warnings must not push out the error explaining why the table is missing — and the pipeline's own
notices (`errorReporting.failed`, `errorReporting.dropped`, `errorHandler.limitReached`) are never
dropped. Reaching the cap is itself recorded as an `errorHandler.limitReached` `info` entry whose
`metadata.totalDropped` tells you how much was lost.

#### API failure messages

A failed request used to be reported with the raw axios message — "Request failed with status
code 500", "Network Error". That is written by and for a developer: it cannot be translated, and
it tells an end user nothing they can act on. The message is therefore chosen by **failure class**
and comes from [`labels`](#labels), while the raw text is kept verbatim in `details`:

| Failure                             | Label              | Default message                                                       |
| ----------------------------------- | ------------------ | --------------------------------------------------------------------- |
| The request never reached the server| `apiErrorNetwork`  | Could not reach the server. Please check your connection and try again.|
| The request ran out of time         | `apiErrorTimeout`  | The server took too long to respond. Please try again.                 |
| `4xx` response                      | `apiErrorClient`   | The server rejected the request (`{status}`).                          |
| `5xx` response                      | `apiErrorServer`   | The server ran into an error (`{status}`). Please try again later.     |
| Anything else                       | `apiErrorUnknown`  | Could not load the data. Please try again.                             |

```typescript
app.use(Aura, {
    labels: {
        apiErrorServer: 'Der Server hat einen Fehler ({status}). Bitte später erneut versuchen.',
    },
});
```

The stored error keeps everything the developer needs:

```typescript
{
    severity: 'error',
    type: 'api', // the same for every class, so the key stays 'ApiResourcesStore.fetchData.api'
    message: 'The server ran into an error (503). Please try again later.', // shown to the user
    details: 'Request failed with status code 503', // the raw axios message
    metadata: { kind: 'server', status: 503, code: 'ERR_BAD_RESPONSE' },
}
```

`type` stays `api` for every class on purpose: the [error key](#automatic-error-keys) is generated
from `component.action.type`, and both the self-clearing below and a host calling
`clearByKey('ApiResourcesStore.fetchData.api')` depend on it being the same key every time. The
class is in `metadata.kind` instead.

#### Unprocessable responses

A request can succeed and still leave the table with nothing to render: the header fails
validation, or the preprocessing downstream of it throws on a payload no schema rejected. That is
**not** an API failure and is not reported as one — it gets its own type, key and message:

|            | Failed request                     | Unprocessable response                    |
| ---------- | ---------------------------------- | ----------------------------------------- |
| `type`     | `api`                              | `validation`                              |
| Key        | `ApiResourcesStore.fetchData.api`  | `ApiResourcesStore.fetchData.validation`  |
| Message    | by failure class (table above)     | `apiErrorInvalidResponse`                 |
| `details`  | the raw axios message              | the raw exception message                 |

The distinction matters to both audiences. The user is no longer told to retry a request that has
already succeeded — the retry reproduces the very same failure — and the developer's first look
goes to the response payload instead of the network tab. The per-field validation errors raised
*inside* the response (`response.header.…`) are unaffected and keep their own keys; this error
covers the case where processing stopped before they could be collected.

It is `severity: 'error'`, so it replaces the table with the error UI, and it is self-clearing in
exactly the same way as the two below.

#### Self-clearing fetch errors

A failed request is reported with `severity: 'error'`, which replaces the whole table with the
error UI. That error describes a single attempt, so `fetchData()` clears it as soon as a later
request succeeds — before the new response is processed — and the table comes back on its own,
without a page reload:

```typescript
await apiStore.fetchData(); // fails → 'ApiResourcesStore.fetchData.api', the table is blocked
await apiStore.fetchData(); // succeeds → the error is gone, the table renders again
```

The cross-origin block (`ApiResourcesStore.fetchData.authorization`) and the unprocessable
response (`ApiResourcesStore.fetchData.validation`) are cleared the same way: if the configuration
or the payload changes so the next request goes through, the first successful one removes them.
Only these three keys are cleared — the per-field validation errors from the response and errors
reported by other components are left alone. Every outcome clears first, so a repeatedly failing request
reports its latest attempt rather than stacking an identical alert per try.

#### Retry button

The blocking error state hides the table together with the toolbar, so its refresh button is out
of reach exactly when it would be needed. That state therefore renders a **retry button** of its
own, which calls `fetchData()`; combined with the self-clearing above, one successful request is
enough for the table to come back. Its text is the `retry` [label](#labels) (`'Retry'` by
default), and it can be found in tests as `[data-testid="aura-error-retry"]`.

### ECS Error object structure

```typescript
interface ECSError {
    severity: 'critical' | 'error' | 'warning' | 'info' | 'debug';
    timestamp: string; // ISO 8601 format
    component: string; // Component name
    action: string; // Action name
    level: ErrorSeverity; // Backwards compatibility
    type: 'validation' | 'network' | 'authentication' | 'authorization' | 'not_found' | 'server' | 'client' | 'api' | 'unknown';
    message: string; // Error message
    key?: string; // Key (e.g. field name); generated from component.action.type when omitted
    details?: string; // Detailed description
    id?: string; // Unique identifier
    stack?: string; // Stack trace
    count?: number; // Occurrences; absent while the error happened only once
    lastTimestamp?: string; // Latest occurrence; absent until the error repeats
    metadata?: Record<string, unknown>; // Additional data
}
```

### Core State integration

`useCoreStore` contains a built-in error state via the `errorStore` property:

```typescript
import { useCoreStore } from '@tamas-labs/aura';

const coreStore = useCoreStore('my-table', props);

// Access the error state via the errorStore
console.log(coreStore.errorStore.errors); // ECSError[]
console.log(coreStore.errorStore.hasErrors); // boolean
console.log(coreStore.errorStore.isValid); // boolean
```

### Examples

**Adding a validation error:**

```typescript
errorStore.addError({
    severity: 'error',
    component: 'LoginForm',
    action: 'validate',
    type: 'validation',
    message: 'Email is required',
    key: 'email',
});
```

**Adding a network error:**

```typescript
errorStore.addError({
    severity: 'critical',
    component: 'ApiService',
    action: 'fetchUsers',
    type: 'network',
    message: 'Failed to fetch users',
    details: 'Connection timeout after 30 seconds',
    metadata: { endpoint: '/api/users', statusCode: 0 },
});
```

**Filtering errors by severity:**

```typescript
const criticalErrors = errorStore.getErrorsBySeverity('critical');
const warnings = errorStore.getErrorsBySeverity('warning');
```

### Remote Error Reporting

Aura supports sending errors to remote services with automatic batch processing and retry logic.

#### Setup

**Using a custom endpoint:**

```typescript
app.use(Aura, {
    errorReporting: true,
    errorReportingEndpoint: 'https://api.example.com/errors',
    errorReportingService: 'custom',
    errorReportingApiKey: 'optional-api-key',
});
```

**Vendor services without a transport:**

> ⚠️ `sentry` / `logrocket` / `rollbar` are **accepted but not implemented** — there is no
> SDK integration behind them. Setting one of them means: a non-blocking **warning banner**,
> and the reporter sends to your `errorReportingEndpoint` exactly as `custom` would.
> **Without an endpoint there is nothing to fall back to**, so the send fails and the failure
> is recorded under the `errorReporting.failed` key (see *Reporter observability* below) —
> errors are never discarded silently.

```typescript
// Accepted, but behaves exactly like `custom` — the endpoint is what matters
app.use(Aura, {
    errorReporting: true,
    errorReportingService: 'sentry',
    errorReportingEndpoint: 'https://api.example.com/errors',
    errorReportingApiKey: 'optional-api-key',
});
```

To forward errors to a vendor SDK, collect them from the store
(`useErrorHandlerStore(...).errors`) in the host app, or point
`errorReportingEndpoint` at your own backend that relays them.

#### Behavior

- **Automatic reporting**: Every `addError()` call automatically sends the error to the remote service
- **Batch processing**: Errors are sent in batches (default: 10 errors/batch)
- **Automatic flush**: Automatic sending every 30 seconds
- **Retry logic**: Up to 3 retries on a network error
- **Linear backoff**: Linearly increasing wait time between retries (1s, 2s, 3s)
- **Queue cap**: At most 100 errors wait to be sent; above that the oldest are dropped, so an
  unreachable endpoint cannot grow the queue without bound (ECS errors carry a `context`
  object, so an uncapped queue is a real leak in a long-running SPA)
- **Failure backoff**: After a failed batch the next attempt is postponed, doubling each time
  (from the flush interval, capped at 5 minutes) instead of retrying on every cycle
- **Lifetime**: The reporter lives as long as the table's store, not as long as a component —
  a table hidden with `v-if` and shown again keeps reporting. It is torn down, with a final
  flush, when the store is disposed; `useErrorHandlerStore(...).destroy()` does the same
  explicitly and is **terminal** (the instance accepts nothing afterwards)
- **Observable failures**: A failed flush and a queue overflow are recorded in the error store
  itself, under the keys `errorReporting.failed` and `errorReporting.dropped` (once each, with
  the reason, the pending count and the retry window in `metadata`). They are **not** written
  to the console: the production build strips every `console.*` call, which is exactly where a
  silent reporter hurts most. Read them from `useErrorHandlerStore(...).errors`:

    ```typescript
    const errorStore = useErrorHandlerStore('my-table-errors');
    const reportingBroken = errorStore.getErrorsByKey('errorReporting.failed').length > 0;
    ```

    Their severity is `info` on purpose — a telemetry endpoint being down must not replace the
    table with the error UI (`error`) or raise a banner for end users (`warning`)

#### Custom Endpoint Request Format

```typescript
POST https://api.example.com/errors
Content-Type: application/json
Authorization: Bearer your-api-key

{
  "errors": [
    {
      "severity": "error",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "component": "UserForm",
      "action": "validate",
      "level": "error",
      "type": "validation",
      "message": "Invalid email",
      "key": "email",
      "details": "Email must contain @ symbol",
      "metadata": {
        "receivedValue": "invalid-email",
        "receivedType": "string"
      }
    }
  ]
}
```

#### Configuration options

The error reporter uses the following settings:

- **batchSize**: 10 errors/batch
- **flushInterval**: 30000 ms (30 seconds)
- **maxRetries**: 3 retries
- **retryDelay**: 1000 ms (1 second) initial delay

#### Store cleanup

The error reporter is automatically destroyed when the component is unmounted:

```typescript
// Manual cleanup (if needed)
await errorStore.destroy();
```

## Store API

The Aura plugin uses Pinia stores for state management. Every store is accessible by `storeId`.

### Core Store

The Core Store contains the basic configuration and integrates two dedicated stores.

```typescript
import { useCoreStore } from '@tamas-labs/aura';

// Create the store
const coreStore = useCoreStore('my-table-id', props);

// Access the config store (contains all validated config values)
console.log(coreStore.config.debug);
console.log(coreStore.config.rowsNumber);
console.log(coreStore.config.siteName);

// Access the error handler store
console.log(coreStore.errorStore.hasErrors);
console.log(coreStore.errorStore.errors);

// Access the props object
console.log(coreStore.props);
```

#### Core Store properties

- **`config`**: Config Store instance (see Config Store)
- **`props`**: The passed props object
- **`errorStore`**: Error Handler Store instance (see Error Handler Store)

### Config Store

The Config Store holds every validated configuration value as a `ref`.

```typescript
import { useConfigStore } from '@tamas-labs/aura';

// Create the store
const configStore = useConfigStore('my-table-id-config', mergedConfig, errorHandlerStoreId);

// Access config values (every value is a ref)
console.log(configStore.debug.value); // boolean
console.log(configStore.siteName.value); // string | null
console.log(configStore.rowsNumber.value); // number | null
console.log(configStore.icons.value); // Record<string, string[]>
console.log(configStore.variants.value); // Record<string, string>
```

#### Config Store properties (all refs)

**System variables:**

- `storeId`: `string` - Store identifier
- `debug`: `Ref<boolean | null>` - Debug mode
- `siteToken`: `Ref<boolean | string | null>` - Site token
- `siteName`: `Ref<string | null>` - Site name
- `urlParameter`: `Ref<string | null>` - URL parameter
- `href`: `Ref<string | null>` - API endpoint URL

**URL configuration:**

- `urlParameterLastSegment`: `Ref<string | null>` - Last URL segment
- `urlStructure`: `Ref<string | null>` - URL structure template

**Pagination:**

- `paginateValues`: `Ref<number[] | null>` - Available pagination values
- `rowsNumber`: `Ref<number | null>` - Number of rows per page
- `externalPaginator`: `Ref<boolean | null>` - Server-side pagination

**Display:**

- `showFooter`: `Ref<boolean | null>` - Show the footer
- `actionButtons`: `Ref<ActionButtonItem[] | null>` - Action buttons
- `showHeaderSearch`: `Ref<boolean | null>` - Header search
- `classes`: `Ref<Record<string, string[]>>` - CSS classes
- `icons`: `Ref<Record<string, string[]>>` - Icon configuration
- `variants`: `Ref<Record<string, string>>` - Bootstrap variants

**Internationalization:**

- `dateStyle`: `Ref<'short' | 'medium' | 'long' | null>` - Date display style
- `timeZone`: `Ref<string | null>` - Time zone
- `utcOffset`: `Ref<string | null>` - UTC offset
- `localization`: `Ref<string | null>` - Localization
- `currencyCode`: `Ref<string | null>` - Currency code (ISO 4217)

**Display (advanced):**

- `accentInsensitiveSearch`: `Ref<boolean | null>` - Ignore diacritics in the client-side search
- `highlightSearchResults`: `Ref<boolean | null>` - Highlight search matches
- `highlightClass`: `Ref<string | null>` - CSS class of the highlight

**Advanced:**

- `resources`: `Ref<boolean | null>` - Resources mode
- `requestMethod`: `Ref<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | null>` - HTTP method
- `disableSession`: `Ref<boolean | null>` - Disable session
- `sessionKey`: `Ref<string | null>` - sessionStorage key override (null → derived from the storeId)
- `emptyStateMessage`: `Ref<string | null>` - Empty state message (deprecated alias of `labels.emptyState`)
- `allowExternalApi`: `Ref<boolean | null>` - External API
- `errorReporting`: `Ref<boolean | null>` - Error reporting
- `sliceEndText`: `Ref<string | null>` - Text slice characters
- `errorReportingEndpoint`: `Ref<string | null>` - Error reporting endpoint URL
- `errorReportingService`: `Ref<'sentry' | 'logrocket' | 'rollbar' | 'custom' | null>` - Error reporting service
- `errorReportingApiKey`: `Ref<string | null>` - Error reporting API key

### Error Handler Store for ECS-compatible error handling

A dedicated store for ECS-compatible error handling.

```typescript
import { useErrorHandlerStore } from '@tamas-labs/aura';

// Create the store
const errorStore = useErrorHandlerStore('my-error-store');
```

#### Error Handler Store properties

- **`errors`**: `Ref<ECSError[]>` - Array of errors
- **`hasErrors`**: `ComputedRef<boolean>` - Whether there is an error
- **`isValid`**: `ComputedRef<boolean>` - Whether the state is valid
- **`criticalErrors`**: `ComputedRef<ECSError[]>` - Critical errors
- **`errorLevelErrors`**: `ComputedRef<ECSError[]>` - Error-level errors
- **`warnings`**: `ComputedRef<ECSError[]>` - Warnings

#### Error Handler Store methods

**Adding an error:**

```typescript
errorStore.addError({
    severity: 'error',
    component: 'UserForm',
    action: 'validate',
    type: 'validation',
    message: 'Invalid email format',
    key: 'email',
    details: 'Email must contain @ symbol',
});
```

**Adding a schema validation error:**

```typescript
errorStore.addSchemaValidationError(
    'BooleanValidator',
    'Invalid boolean value',
    'debug',
    'not-a-boolean',
    'Expected boolean, received string',
);
```

**Clearing errors:**

```typescript
// Clear all errors
errorStore.clearErrors();

// Clear by key
errorStore.clearByKey('email');

// Clear by component
errorStore.clearByComponent('UserForm');

// Clear by type
errorStore.clearByType('validation');
```

**Filtering errors:**

```typescript
// By severity
const criticalErrors = errorStore.getErrorsBySeverity('critical');
const warnings = errorStore.getErrorsBySeverity('warning');

// By component
const formErrors = errorStore.getErrorsByComponent('UserForm');

// By key
const emailErrors = errorStore.getErrorsByKey('email');
```

**Store cleanup:**

```typescript
// Destroy the error reporter
await errorStore.destroy();
```

## Usage Examples

### 1. Basic usage

```typescript
import { createApp } from 'vue';
import Aura from '@tamas-labs/aura';
import App from './App.vue';

const app = createApp(App);

// Plugin registration with default settings
app.use(Aura, {
    storeId: 'my-table',
    debug: true,
    rowsNumber: 10,
});

app.mount('#app');
```

### 2. Multi-instance usage

Using multiple table instances with different store IDs:

```typescript
import { createApp } from 'vue';
import Aura from '@tamas-labs/aura';

const app = createApp(App);

// Users table
app.use(Aura, {
    storeId: 'users-table',
    debug: true,
    rowsNumber: 25,
    externalPaginator: true,
});

// Products table
app.use(Aura, {
    storeId: 'products-table',
    debug: false,
    rowsNumber: 10,
    externalPaginator: false,
});

app.mount('#app');
```

### 3. Server-side pagination with API integration

```typescript
import { createApp } from 'vue';
import Aura from '@tamas-labs/aura';

const app = createApp(App);

app.use(Aura, {
    storeId: 'server-table',
    externalPaginator: true, // Server-side pagination
    rowsNumber: 25,
    requestMethod: 'POST', // API request method
    href: '/api/v1/users/data', // API endpoint
});

app.mount('#app');
```

**Laravel-compatible API response:**

```json
{
    "items": [
        { "id": 1, "name": "John Doe", "email": "john@example.com" },
        { "id": 2, "name": "Jane Smith", "email": "jane@example.com" }
    ],
    "columns": [
        { "key": "id", "label": "ID" },
        { "key": "name", "label": "Name" },
        { "key": "email", "label": "Email" }
    ],
    "meta": {
        "current_page": 1,
        "from": 1,
        "last_page": 10,
        "per_page": 25,
        "to": 25,
        "total": 250
    },
    "links": {
        "first": "/api/v1/users/data?page=1",
        "last": "/api/v1/users/data?page=10",
        "prev": null,
        "next": "/api/v1/users/data?page=2"
    }
}
```

### 4. Using custom icons (Lucide Icons)

```typescript
import { createApp } from 'vue';
import Aura from '@tamas-labs/aura';

const app = createApp(App);

app.use(Aura, {
    storeId: 'custom-icons-table',
    icons: {
        sortable: {
            up: ['lucide', 'arrow-up'],
            down: ['lucide', 'arrow-down'],
            both: ['lucide', 'arrows-up-down'],
        },
        filterable: ['lucide', 'filter'],
        search: ['lucide', 'search'],
        clear: ['lucide', 'x'],
        settings: ['lucide', 'settings'],
        edit: ['lucide', 'pencil'],
        destroy: ['lucide', 'trash-2'],
        show: ['lucide', 'eye'],
    },
});

app.mount('#app');
```

### 5. International (i18n) settings

```typescript
import { createApp } from 'vue';
import Aura from '@tamas-labs/aura';

const app = createApp(App);

// English localization, USD currency
app.use(Aura, {
    storeId: 'international-table',
    localization: 'en-US',
    currencyCode: 'USD',
    dateStyle: 'medium',
    timeZone: 'America/New_York',
    utcOffset: '-05:00',
});

app.mount('#app');
```

### 6. Full configuration with Bootstrap customization

```typescript
import { createApp } from 'vue';
import Aura from '@tamas-labs/aura';

const app = createApp(App);

app.use(Aura, {
    storeId: 'custom-table',
    debug: false,
    siteName: 'My Admin Panel',
    rowsNumber: 50,
    paginateValues: [10, 25, 50, 100, 200],
    externalPaginator: true,

    // Display
    showFooter: true,
    actionButtons: ['refresh', 'export', 'settings'],
    showHeaderSearch: true,

    // Bootstrap classes
    classes: {
        table: ['table-striped', 'table-hover', 'table-sm', 'table-bordered'],
        button: ['btn', 'btn-sm', 'mx-1'],
        icon: ['mx-2'],
        dataTypes: {
            numbers: ['text-end', 'fw-bold'],
            currency: ['text-end', 'text-success'],
            unit: ['text-end', 'text-muted'],
        },
    },

    // Bootstrap variants
    variants: {
        primary: 'primary',
        destroy: 'danger',
        edit: 'warning',
        show: 'info',
        success: 'success',
    },

    // HTTP configuration
    requestMethod: 'POST',
    href: '/api/admin/resources',

    // International settings
    localization: 'hu-HU',
    currencyCode: 'HUF',
    dateStyle: 'short',
    timeZone: 'Europe/Budapest',
});

app.mount('#app');
```

### 7. Error Handling usage

```typescript
import { createApp } from 'vue';
import Aura from '@tamas-labs/aura';
import { useErrorHandlerStore, useCoreStore } from '@tamas-labs/aura';

const app = createApp(App);

app.use(Aura, {
    storeId: 'error-handling-table',
    debug: true,
    errorReporting: true,
});

app.mount('#app');

// Inside a component
export default {
    setup() {
        // Access the core store
        const coreStore = useCoreStore('error-handling-table', props);

        // Access the error store
        const errorStore = coreStore.errorStore;

        // Handle errors
        watch(
            () => errorStore.hasErrors,
            (hasErrors) => {
                if (hasErrors) {
                    console.error('Errors occurred:', errorStore.errors);

                    // Handle critical errors separately
                    if (errorStore.criticalErrors.length > 0) {
                        alert('A critical error occurred!');
                    }
                }
            },
        );

        return {
            hasErrors: errorStore.hasErrors,
            errors: errorStore.errors,
            isValid: errorStore.isValid,
        };
    },
};
```

## Public API surface

Everything listed here is exported from the package entry point and is covered by semantic
versioning: it can only change in a breaking way with a major release. Anything **not**
listed is internal — importable from the source tree while working on Aura itself, but not
from the installed package.

| Kind | Names |
| --- | --- |
| Plugin | `AuraPlugin` (also the default export) |
| Components | `Aura`, `ErrorHandler` |
| Store factories | `useCoreStore`, `useConfigStore`, `useErrorHandlerStore`, `useApiResourcesStore` |
| Types | the 42 types listed under [TypeScript Support](#typescript-support) |

The component exposes no `emits` and no `expose()`, so the store factories are the supported
way to read table state (selection, pagination, sorting) or trigger a refetch from outside
the table.

### Internal — deliberately not exported

The helpers below are documented in this README as **internal architecture**, which is why
their examples import from source paths (`@/...`) rather than from `@tamas-labs/aura`.
Keeping them internal during the 0.x series means they can be refactored without a major
version bump.

| Name | Source |
| --- | --- |
| `formatValue` | `src/features/table/utils/formatters/formatValue.ts` |
| `useFormattedContent` | `src/features/table/utils/composables/useFormattedContent.ts` |
| `resolveValue` | `src/utils/resolve-value.util.ts` |
| `filterItemsBySearch` | `src/utils/search-items.util.ts` |
| `sortItemsByRules` | `src/utils/sort-items.util.ts` |
| `htmlSanitizer` | `src/validators/sanitizers/html.sanitizer.ts` |
| `createLazyValidator` | `src/validators/utils/lazy-loader.ts` |
| `getOrigin` / `getHref` / `getParameter` | `src/utils/location.ts` |
| `ErrorItem` | `src/features/error-handler/components/ErrorItem.tsx` |

If you need one of them from application code, please open an issue — promoting a name into
the public surface is a minor release, removing one is not.

## TypeScript Support

The plugin has full TypeScript support. Every type is available as an import:

```typescript
// Base types
import type {
    AuraConfig,
    AuraProps,
    PropValidator,
    ECSError,
    ErrorSeverity,
    ErrorType,
    ErrorState,
    CoreStore,
    ConfigStore,
    ErrorHandlerStore,
} from '@tamas-labs/aura';

// Cell types
import type {
    BaseCellConfig,
    HeaderCellConfig,
    BodyCellConfig,
    FooterCellConfig,
} from '@tamas-labs/aura';

// API Response types
import type {
    ApiResponse,
    Header,
    HeaderCell,
    HeaderRow,
    HeaderSettings,
    Body,
    BodySettings,
    Footer,
    FooterRow,
    FooterSettings,
    ColumnConfig,
    CellType,
    SortItem,
    SortDirection,
    SearchItem,
    QueryParams,
    ApiResourcesStore,
    PaginationMeta,
    PaginationLinks,
    ConditionalOperator,
    ConditionalConfig,
    ConditionalRule,
    CellFormattingOptions,
    CellRules,
    RowRules,
    BootstrapColor,
    Align,
    Size,
} from '@tamas-labs/aura';

// Using the Config type
const config: AuraConfig = {
    storeId: 'typed-table',
    debug: true,
    rowsNumber: 25,
};

// Using the Props type
const props: AuraProps = {
    storeId: 'my-table',
    externalPaginator: true,
    rowsNumber: 10,
};

// Using the Error object type
const error: ECSError = {
    severity: 'error',
    timestamp: new Date().toISOString(),
    component: 'UserForm',
    action: 'validate',
    level: 'error',
    type: 'validation',
    message: 'Validation failed',
    key: 'email',
};
```

### TypeScript autocomplete

TypeScript provides IntelliSense support in the IDE:

```typescript
import Aura from '@tamas-labs/aura';

// Autocomplete works in the config object
app.use(Aura, {
    storeId: 'my-table',
    debug: true,
    // The IDE automatically suggests all available options
    rowsNumber: 10,
    externalPaginator: false,
    // ...
});
```

## Development

### Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Type check
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Testing
npm run test
npm run test:ui
npm run test:coverage
npm run test:coverage:ci   # single run + coverage threshold gate (used by CI)

# Bundle analysis
npm run analyze

# Code duplication check
npm run jscpd

# Dependency graph
npm run graph
```

## Project structure

```text
src/
├── features/             # Feature modules
│   ├── error-handler/    # ErrorHandler component
│   │   └── components/   # ErrorItem subcomponent
│   └── table/            # Table feature
│       ├── components/   # Components (Pagination, TableBody, TableHeader, TableFooter, Toolbar)
│       └── utils/        # Cell-rendering utilities (UI layer)
│           ├── composables/  # Composables (useFormattedContent, useDebouncedCellInput)
│           ├── conditions/   # Conditional rendering (cellRules / rowRules)
│           ├── formatters/   # Formatters (date, number, text, special)
│           └── styles/       # Style utilities (computeClasses, computeStyles)
├── lib/                  # Library code
│   └── api/              # API integration (axios config, headers, URL)
├── state/                # Pinia store modules
│   ├── core/             # Core, Config, ErrorHandler stores
│   └── data/             # API Resources store
├── styles/               # CSS/SCSS files
│   ├── _variables.scss   # Global SCSS variables (highlight settings)
│   ├── _animations.scss  # Animations (aura-fade-out)
│   └── components/       # Component styles
│       └── _highlight.scss  # Search highlight style (.aura-highlight)
├── types/                # TypeScript type definitions
│   ├── api-response.types.ts  # API response, header/body/footer, column configs, pagination types
│   ├── cell.types.ts          # Cell configurations (BaseCellConfig, Header/Body/FooterCellConfig)
│   ├── config.types.ts        # AuraConfig interface
│   ├── error.types.ts         # ECSError, ErrorSeverity, ErrorType, ErrorState
│   ├── props.types.ts         # AuraProps, PropValidator
│   └── store.types.ts         # CoreStore, ConfigStore, ErrorHandlerStore
├── utils/                # General utilities (UI-independent, may be used by any layer)
│   ├── composables/           # Framework-level composables (useDebounce, watchAsyncEffect)
│   ├── preprocessors/         # API response normalization (preprocessResponse, icon/modal configs)
│   ├── location.ts            # Browser location helpers (getOrigin, getHref, getParameter)
│   ├── normalize-text.util.ts # Search text folding (foldAccents, foldSearchText)
│   ├── resolve-value.util.ts  # Object property resolution with nested paths
│   ├── safe-object.util.ts    # Prototype-key safety (FORBIDDEN_PROTO_KEYS, hasSafeOwnKey, createNullObject)
│   ├── search-items.util.ts   # Client-side search/filter (filterItemsBySearch)
│   └── sort-items.util.ts     # Client-side sorting (sortItemsByRules)
└── validators/           # Zod validators and schemas
    ├── props/                 # Vue 3 prop validators (defaultValidators)
    ├── rules/                 # Primitive type rules (arrayRule, booleanRule, numberRule, stringRule, mixedRules)
    ├── sanitizers/            # HTML sanitization (htmlSanitizer - DOMPurify)
    ├── schemas/               # High-level validator functions (error handling + fallback)
    │   ├── common/            # General: string, boolean, number, date-format, time-zone, etc.
    │   ├── config/            # Config-specific: classes, icons, variants, request-method, etc.
    │   └── response/          # API response validation (header, rows, cells, settings)
    ├── utils/                 # createLazyValidator (code splitting) + getErrorSink (the single seam to the state layer)
    └── zod/                   # Zod schemas (the basis used by the schemas/ layer)
        ├── common/            # StringZod, BooleanZod, NumberZod, CurrencyCodeZod, etc.
        ├── config/            # ClassesZod, IconsZod, VariantsZod, RequestMethodZod, etc.
        ├── response/          # HeaderZod and related schemas
        └── utils/             # schema-cache (memoization of the schema factories)
```

## Utility functions

> ⚠️ **Internal API.** The functions in this chapter are **not** exported from
> `@tamas-labs/aura` — the examples import them from their source paths for that reason.
> They document how Aura works internally; see [Public API surface](#public-api-surface)
> for what an application may actually import.

These helpers power the table internally and are documented here for contributors.

### Formatter functions

#### `formatValue`

A general-purpose value formatter function that can handle numbers, currencies, dates, and text transforms.

```typescript
import { formatValue } from '@/features/table/utils/formatters/formatValue';

// Basic usage
const formatted = formatValue(1234.56, { currency: 'USD' }); // "$1,234.56"

// Skipping type formatting (e.g. for headers)
const header = formatValue('USD', { currency: 'USD' }, 'en-US', undefined, { skipTypeFormatting: true });
// Result: "USD" (does not try to format it as a number)
```

**Parameters:**

- `value`: The value to format (string | number | boolean | null | undefined)
- `config`: Cell configuration object (`CellFormatConfig`)
- `locale`: Localization code (e.g. `'hu-HU'`), default: `'en-US'`
- `currencyCode`: Optional currency code backup
- `options`: Optional settings
  - `skipTypeFormatting`: If `true`, skips the number/currency/date/phone formatting, but keeps the text transforms (uppercase, slice, etc.)

### Composable functions

#### `useFormattedContent`

A composable responsible for the reactive formatting of the cell content.

```typescript
import { useFormattedContent } from '@/features/table/utils/composables/useFormattedContent';

const { formattedContent } = useFormattedContent(
    () => cellConfig,  // Reactive cell config
    () => coreConfig,  // Reactive core config
    { skipTypeFormatting: true } // Optional: skip type formatting
);
```

### Location utilities (`location.ts`)

Browser `window.location` wrapper functions:

| Function | Return type | Description | Example |
|----------|-------------------|--------|-------|
| `getOrigin()` | `string` | Current origin (protocol + host) | `"https://example.com"` |
| `getHref()` | `string` | Full URL | `"https://example.com/admin/users/resources"` |
| `getParameter()` | `string` | URL without the origin | `"admin/users/resources"` |

### resolveValue (`resolve-value.util.ts`)

Resolves an object property value based on a string path, with support for nested paths:

```typescript
import { resolveValue } from '@/utils/resolve-value.util';

const user = { name: 'John', address: { city: 'New York' } };

resolveValue(user, 'name');          // 'John'
resolveValue(user, 'address.city');  // 'New York'
resolveValue(user, 'age');           // undefined
```

> 🛡️ **Own properties only.** Every path segment must be an *own* property of the object;
> inherited members never resolve, and `__proto__` / `constructor` / `prototype` are refused
> even when they arrive as own keys (`JSON.parse` can mint an own `__proto__`). Paths come
> from the API response (`field` / `data` on a header cell), so this keeps prototype-chain
> members — e.g. `toString` returning a function body — out of cells, filter lists and CSV
> exports. Practical consequence: a column literally named `constructor`, `prototype` or
> `__proto__` resolves to `undefined`.

### filterItemsBySearch (`search-items.util.ts`)

Client-side search/filter based on `SearchItem[]` criteria. It uses AND logic (every condition must be satisfied).

Supported features:

- Exact and partial match (`exact` parameter)
- Case-insensitive string comparison
- Nested property access (using `resolveValue`)

```typescript
import { filterItemsBySearch } from '@/utils/search-items.util';
import type { SearchItem } from '@tamas-labs/aura';

const items = [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 },
];

const search: SearchItem[] = [{ field: 'name', term: 'j' }];
filterItemsBySearch(items, search); // both elements (partial match)

const exactSearch: SearchItem[] = [{ field: 'name', term: 'John', exact: true }];
filterItemsBySearch(items, exactSearch); // only John
```

### sortItemsByRules (`sort-items.util.ts`)

Client-side sorting based on `SortItem[]` rules. Returns a new array (shallow copy) and does not modify the original.

Supported features:

- Multi-column sorting (priority based on the array order)
- String comparison with `localeCompare` (correct I18N sorting)
- Numeric and boolean comparison
- Handling of `null`/`undefined` values (always placed at the end)
- Nested property paths (e.g. `'user.name'`)

```typescript
import { sortItemsByRules } from '@/utils/sort-items.util';
import type { SortItem } from '@tamas-labs/aura';

const items = [
    { name: 'Charlie', age: 35 },
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
];

const rules: SortItem[] = [{ field: 'name', direction: 'asc' }];
sortItemsByRules(items, rules);
// [Alice, Bob, Charlie]

// Multi-column sorting
const multiRules: SortItem[] = [
    { field: 'age', direction: 'desc' },
    { field: 'name', direction: 'asc' },
];
sortItemsByRules(items, multiRules);
// [Charlie (35), Alice (30), Bob (25)]
```

## Validation system

> ⚠️ **Internal API.** The validation layer is not part of the public surface —
> `htmlSanitizer` and `createLazyValidator` are not exported from `@tamas-labs/aura`.
> This chapter describes the internal architecture.

Aura uses a three-layer validation architecture that provides runtime type checking, HTML sanitization, and automatic fallback values.

### Architecture

```text
1. Zod schemas (zod/)          → Basic validation rules with Zod
2. Schema validators (schemas/) → Zod + error handling + fallback values
3. Prop validators (props/)     → Vue 3 prop validators based on rules/
```

### Rules — Primitive type rules

Simple runtime type-checking functions used by the Vue 3 prop validators:

| Function | Description |
|----------|--------|
| `stringRule(value)` | `typeof value === 'string'` |
| `numberRule(value)` | `typeof value === 'number'` and valid (`!isNaN`, `isFinite`) |
| `booleanRule(value)` | `typeof value === 'boolean'` |
| `arrayRule(value)` | `Array.isArray(value)` |
| `mixedRules(value)` | Primitive, array, or plain object (null/undefined/function not accepted) |

### Sanitizers — HTML sanitization

`htmlSanitizer` uses DOMPurify for XSS protection. It removes every HTML tag and attribute:

```typescript
import { htmlSanitizer } from '@/validators/sanitizers/html.sanitizer';

htmlSanitizer('<script>alert("xss")</script>Hello'); // 'Hello'
htmlSanitizer('<b>Bold</b> text');                   // 'Bold text'
htmlSanitizer(123);                                  // 123 (not a string → untouched)
```

### Zod schemas

The Zod layer defines the basic validation rules. Two categories:

**Common (base types):**

| Zod schema | Description |
|----------|--------|
| `StringZod(min, max)` | String validation + HTML sanitization + nullable |
| `BooleanZod()` | Boolean validation + nullable |
| `NumberZod(min, max)` | Number validation + nullable |
| `CurrencyCodeZod()` | ISO 4217 currency code enum + nullable |
| `DateStyleZod()`    | Date display style enum ('short', 'medium', 'long') + nullable |
| `TimeZoneZod()`     | IANA time zone string + nullable |
| `UtcOffsetZod()` | UTC offset format + nullable |
| `SliceEndTextZod()` | Characters shown at the end of a text slice + nullable |

**Config (config-specific):**

| Zod schema | Description |
|----------|--------|
| `RequestMethodZod()` | HTTP method enum (GET, POST, PUT, DELETE, PATCH) + nullable |
| `ClassesZod()` | CSS class configuration validation |
| `IconsZod()` | Icon configuration validation |
| `VariantsZod()` | Bootstrap variant configuration validation |
| `PaginateValuesZod()` | Pagination values array validation |
| `LocalizationZod()` | Localization string validation |
| `ErrorReportingServiceZod()` | Error reporting service enum |
| `ErrorReportingApiKeyZod()` | API key string validation |
| `StoreIdZod()` | Store identifier validation |

> ⚡ **The factories are memoized.** Building a Zod schema costs an order of magnitude
> more than parsing with it (measured: ~148 µs vs. ~10 µs for `StringZod(1, 250)`), and
> a factory called per column would rebuild it on every response. Every parameterless
> factory therefore returns **the very same instance** on each call (`cacheSchema`), and
> `StringZod` caches one instance per distinct `(min, max)` pair (`cacheSchemaByArgs`,
> in `src/validators/zod/utils/schema-cache.ts`). Sharing is safe because Zod schemas
> are immutable: `.min()`, `.nullable()` and friends return a new schema rather than
> mutating the receiver. A 20-column header validates in ~1 ms instead of ~12 ms.

### Schema validators

The highest-level validators, which wrap the Zod schemas with error handling and fallback values. On an invalid value they:
1. Log the error into the `errorStore` (`addSchemaValidationError`)
2. Return the default fallback value

```typescript
// Example: using validateString
const result = validateString('Hello', 'my-store', 'siteName');  // 'Hello' (sanitized)
const result2 = validateString(123, 'my-store', 'siteName');     // fallback + error logged

// Example: using validateCurrencyCode
const code = validateCurrencyCode('HUF', 'my-store');   // 'HUF'
const code2 = validateCurrencyCode('XXX', 'my-store');  // 'HUF' (fallback + error logged)

// Example: using validateRequestMethod
const method = validateRequestMethod('POST', 'my-store');    // 'POST'
const method2 = validateRequestMethod('INVALID', 'my-store'); // 'POST' (fallback + error logged)
```

The **response/** submodule validates the API response structure (header, rows, cells, settings), and throws an exception on an error.

### Prototype keys

Every object built out of the API response is assembled with a `null` prototype, and the three
prototype-chain names — `__proto__`, `constructor`, `prototype` — are refused on the way in. The
boundary closes in the validator layer instead of relying on each renderer to be careful:

- **Column config keys.** `createConfigValidator` drops them along with the unknown keys, and the
  config it returns has no prototype.
- **`mapping` entry keys.** Entry keys are arbitrary response-supplied strings (they are the data
  values to match against), so an entry keyed `__proto__` used to retarget the mapping object's
  prototype instead of becoming an entry — its keys became readable on the mapping object while
  staying invisible to `Object.keys`. Such entries are now dropped.
- **Column config `type`.** The value of `columnConfigs[...].type` picks the validator out of a
  dispatch table, so an inherited name used to answer with a prototype member: `constructor` found
  the `Object` constructor, which is callable and would have handed the entry back **unvalidated**,
  skipping the key-stripping the dispatch exists for. Such a `type` is now treated like any other
  unknown type — the entry is skipped with a warning.
- **Lookups.** A `mapping` is only ever read by own key, so a **row value** of `toString` or
  `constructor` is a mapping miss rather than an inherited function; `resolveValue` likewise
  resolves own properties only.
- **Header cell fields.** A header cell's fields are read as own properties, so a cell that merely
  *inherits* `content` counts as a cell missing its `content`.

**What this means for the backend:** a `mapping` entry may not be keyed `__proto__`, `constructor`
or `prototype`, and a column config's `type` may not be one of those names either — such an entry is
dropped, like any unknown key or type. No real data value carries those names, so this is not a
practical restriction.

### createLazyValidator — Code splitting

A generic lazy loader that loads the validator functions with a dynamic import on the first call (code splitting support):

```typescript
import { createLazyValidator } from '@/validators/utils/lazy-loader';

// The validator is only loaded when it is first called
const lazyValidate = createLazyValidator(
    () => import('./my-validator'),
    'validate'
);

// First call: module load + validation
await lazyValidate(data);

// Subsequent calls: from cache (no re-import)
await lazyValidate(data2);
```

## SCSS customization

Aura contains built-in SCSS styles that load automatically when the plugin is used.

### Search highlight (Highlight)

The `.aura-highlight` class is automatically applied to search matches. The highlight gradually disappears with a fade-out animation.

### SCSS variables

The following variables can be overridden in the host application, thanks to the `!default` flag:

| Variable | Default | Description |
|--------|----------------|--------|
| `$aura-highlight-bg` | `#fff3cd` | Highlight background color |
| `$aura-highlight-color` | `inherit` | Highlight text color |
| `$aura-highlight-duration` | `3000ms` | Duration of the fade-out animation |

### Overriding SCSS variables

To override the variables, define them in your own SCSS file **before** the Aura import:

```scss
// styles/main.scss

// Override the Aura variables
$aura-highlight-bg: #d1ecf1;
$aura-highlight-color: #0c5460;
$aura-highlight-duration: 5000ms;

// Import the Aura styles
@use '@tamas-labs/aura/src/styles';
```

## Technology stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Typed JavaScript
- **Vite** - Build tool
- **Vitest** - Unit testing
- **Pinia** - State management
- **Bootstrap 5** - CSS framework
- **FontAwesome** - Icons
- **Zod** - Schema validation
- **ESLint** - Code linting
- **SonarJS** - Code quality

## Contributing and security

🤝 **[CONTRIBUTING.md](./CONTRIBUTING.md)** — developer setup, quality gate, release process.

🔒 **[SECURITY.md](./SECURITY.md)** — reporting a vulnerability.

## License

MIT

## Author

Tamas Balint
