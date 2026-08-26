# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
