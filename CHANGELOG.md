# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Shift+click search on body cells (`cellClickSearch`).** With the new opt-in config key and
  prop, Shift+clicking a body cell puts the cell's value into a search input and runs the search:
  the column's own header search input when the column is `searchable`, otherwise the global
  search input when `showHeaderSearch` is on; with neither, the click is ignored. The **raw** row
  value is used, not the formatted text, because the client-side matchers and a backend both
  compare against raw data. Links, buttons and form controls inside a cell keep their own
  Shift+click behaviour; the selector column, `between` columns, multi-field columns without a
  `reference`, empty or non-scalar values and — for the global search — fields outside
  `header.settings.searchableItems` are ignored. The global search input's 3-character minimum does
  not apply to a clicked value. Off by default.

- **Column visibility in the settings panel.** The settings button's panel now lists every data
  column with a checkbox; switching one off removes it from the header, the body, the footer, the
  header search row and the CSV export at once. It is presentation-only state — a toggle never
  issues a request, in server-side mode (`externalPaginator: true`) either — and it is persisted
  with the rest of the session state (`hiddenColumns` in `SessionState`). A **Show all** button
  appears while anything is hidden. `show: false` columns (the response's own decision) and the
  `selectable` checkbox column are deliberately not offered, and the last remaining visible
  column's checkbox is disabled so the table can never be left with zero columns.
  New on the `ApiResourcesStore` surface: `hiddenColumns`, `isColumnHidden`, `hideColumn`,
  `showColumn`, `toggleColumn`, `setHiddenColumns`, `showAllColumns`.
- **Active filters as removable badges.** `FilterBadges` in the toolbar's bottom row and the
  settings panel's *Active filters* section now show every active global search, column search
  (text and `between` range alike) and column filter as a badge with a remove button; the panel
  variant adds a **Clear all** button and an empty-state text. Removing a badge calls the store
  action that owns it, so a client-side table re-slices immediately and a server-side one refetches.
- **Six new `labels` keys** for the two sections above: `columnVisibility`, `showAllColumns`,
  `activeFilters`, `noActiveFilters`, `clearAllFilters`, `removeFilter` (42 → 48). The global
  search badge reuses the existing `search` label as its title.

### Changed

- **The two loading indicators are now mutually exclusive, and `showLoadingBar` defaults to
  `false`.** Previously the thin progress bar appeared at the start of every request and the
  delayed overlay took over after 250 ms, so each page load and table update flashed the bar for a
  moment. Now the overlay (`showLoadingOverlay`, still `true` by default) is the stronger indicator:
  while it is enabled the bar is never drawn, even when `showLoadingBar` is `true`. Requests shorter
  than the overlay's delay draw no indicator (`aria-busy` still reports them). **Migration:** to
  keep the bar, set `showLoadingBar: true` and `showLoadingOverlay: false`.
- **The toolbar is now opt-in: `showToolbarTitle` defaults to `false` and `actionButtons` to
  `[]`.** Previously every table showed the "Logo/Title" placeholder and the Refresh, Export and
  Settings buttons unless the host switched them off. Now the title, the header search
  (`showHeaderSearch`, already `false`) and the action buttons all start hidden, and while none of
  them is enabled the toolbar leaves out its top row entirely instead of rendering an empty row with
  a bottom margin. **Migration:** to keep the previous toolbar, set `showToolbarTitle: true` and
  `actionButtons: ['refresh', 'export', 'settings']`.
- **Without action buttons the header search takes over their slot.** With `showHeaderSearch: true`
  and an empty `actionButtons`, the search used to sit on the left at `col-md-9` (`col-md-6` next to
  the title) with an empty `col-md-3` column after it. It now renders in that right-hand column at
  the action buttons' width — beside a `col-md-9` title, or right-aligned on its own.

### Fixed

- **The reserved table height no longer holds a gap open, and now works server-side too.** The
  height measured on a full page (which keeps the pagination from jumping up on a short last page)
  was invalidated by the response's `items` and by the page size only. Two consequences: a
  client-side global search / column search / filter that narrowed the list to a few rows kept
  reserving the *unfiltered* page's height, leaving hundreds of pixels of empty space above the
  pager; and with `externalPaginator: true` every page brought a new `items` array, which threw the
  measurement away on exactly the short last page it was meant to cover. The reservation is now
  keyed to the query without its page number — page size, sorts, searches, filters and the global
  search term drop it, paging keeps it — and it is capped at the viewport height, so a large page
  size cannot reserve the controls off the bottom of the screen.
- **The record count no longer contradicts the pager.** The toolbar's `results-info` line was fed
  from the response's optional `meta.total`, while `PaginationInfo` below the table reads
  `displayMeta`. With the default `externalPaginator: false` a response without a `meta` block made
  the pager show `1-10 / 42` while the toolbar showed "No results" at the same time; client-side
  filtering produced the same split, the toolbar keeping the server's total against the filtered
  count of the pager.

### Removed

- **The `ResultsInfo` component** (toolbar) and with it the `totalRecords` / `currentPage` props of
  `Toolbar`. It rendered the same `labels.paginationInfo` / `labels.noResults` texts as
  `PaginationInfo` — the duplication was the reason it could disagree with the pager at all — so the
  "showing X-Y of Z" information now has a single place, below the table. The empty result set is
  still announced by the table body's own empty state. No public API change: the component was never
  exported from `index.ts`, and no config key or label was removed.
- **The `SettingsPanel` placeholder texts** — the two hard-coded English literals under the
  *Column visibility* and *Active filters* headings — replaced by the working controls above.

## [1.0.0] - 2026-08-26

### Added

- **JSON Schema documents for the API contract** under `docs/schema/`, written against JSON Schema
  draft 2020-12. They describe the payload Aura sends and the response it expects, so a backend can
  be validated against the contract without reading the Zod validators:
    - `aura-request.schema.json` — the request Aura sends on every fetch (JSON body for
      `POST` / `PUT` / `PATCH`, query parameters for `GET` / `DELETE`).
    - `aura-response.schema.json` — the response envelope: the required `header`, plus `items`,
      `body`, `footer`, `meta` and `links`.
    - `header.schema.json`, `body.schema.json`, `footer.schema.json` — the column definitions, the
      per-column rendering configuration, and the footer rows.
    - `pagination.schema.json` — the `meta` and `links` blocks of Laravel's `LengthAwarePaginator`,
      passed through verbatim.
    - `common.schema.json` — the field-level building blocks shared by the header, body and footer
      schemas (flags, alignment, colors, CSS classes and sizes, slicing/padding, conditional rules,
      cell formatting options), mirroring the constraints the Zod validators enforce at runtime.
    - `column-configs/` — one schema per cell type: `badge`, `button`, `custom`, `icon`, `link`,
      `modal`, `progress`, `reference` and `static`.
- **Contract examples** in `docs/schema/examples/`: a complete `request.json` and `response.json`
  that validate against the schemas above.

### Changed

- Version bumped from `0.2.0` to `1.0.0`.
- The bundle-size tables in `README.en.md` and `README.hu.md` are now stated as measured on
  **v1.0.0** instead of v0.2.0.

[unreleased]: https://github.com/tamas-labs/aura/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/tamas-labs/aura/releases/tag/v1.0.0
