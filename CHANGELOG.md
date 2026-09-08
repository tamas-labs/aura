# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

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
